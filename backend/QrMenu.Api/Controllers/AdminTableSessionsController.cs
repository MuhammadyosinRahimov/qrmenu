using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using QrMenu.Api.DTOs;
using QrMenu.Api.Hubs;
using QrMenu.Core.Enums;
using QrMenu.Infrastructure.Data;

namespace QrMenu.Api.Controllers;

[ApiController]
[Route("api/admin/table-sessions")]
[Authorize(Roles = "Admin,RestaurantAdmin")]
public class AdminTableSessionsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IHubContext<OrdersHub> _hubContext;

    public AdminTableSessionsController(AppDbContext context, IHubContext<OrdersHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    private Guid? GetRestaurantId()
    {
        var restaurantIdClaim = User.FindFirst("restaurantId")?.Value;
        return restaurantIdClaim != null ? Guid.Parse(restaurantIdClaim) : null;
    }

    /// <summary>
    /// Get table sessions with optional status filter
    /// </summary>
    /// <param name="restaurantId">Filter by restaurant ID</param>
    /// <param name="status">Filter by status: active, closed, or all (default: active)</param>
    [HttpGet]
    public async Task<ActionResult<List<TableSessionDto>>> GetSessions(
        [FromQuery] Guid? restaurantId,
        [FromQuery] string? status = "active")
    {
        try
        {
            var query = _context.TableSessions
                .Include(s => s.Table)
                .Include(s => s.Restaurant)
                .Include(s => s.Orders)
                    .ThenInclude(o => o.Items)
                .Include(s => s.Orders)
                    .ThenInclude(o => o.User)
                .AsQueryable();

            // Filter by status
            if (status?.ToLower() == "active")
            {
                query = query.Where(s => s.Status == TableSessionStatus.Active);
            }
            else if (status?.ToLower() == "closed")
            {
                query = query.Where(s => s.Status == TableSessionStatus.Closed);
            }
            // "all" or any other value - no status filter

            // Filter by restaurant for RestaurantAdmin
            var userRestaurantId = GetRestaurantId();
            if (userRestaurantId.HasValue)
            {
                query = query.Where(s => s.RestaurantId == userRestaurantId.Value);
            }
            else if (restaurantId.HasValue)
            {
                query = query.Where(s => s.RestaurantId == restaurantId.Value);
            }

            var sessions = await query
                .OrderByDescending(s => s.StartedAt)
                .ToListAsync();

            return Ok(sessions.Select(MapToDto).ToList());
        }
        catch (Exception ex)
        {
            return StatusCode(500, new {
                error = "Database error",
                message = ex.Message,
                inner = ex.InnerException?.Message
            });
        }
    }

    /// <summary>
    /// Get session by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<TableSessionDto>> GetSession(Guid id)
    {
        var query = _context.TableSessions
            .Include(s => s.Table)
            .Include(s => s.Restaurant)
            .Include(s => s.Orders)
                .ThenInclude(o => o.Items)
            .Include(s => s.Orders)
                .ThenInclude(o => o.User)
            .AsQueryable();

        var userRestaurantId = GetRestaurantId();
        if (userRestaurantId.HasValue)
        {
            query = query.Where(s => s.RestaurantId == userRestaurantId.Value);
        }

        var session = await query.FirstOrDefaultAsync(s => s.Id == id);

        if (session == null)
            return NotFound();

        return Ok(MapToDto(session));
    }

    /// <summary>
    /// Close table session manually
    /// </summary>
    [HttpPost("{id}/close")]
    public async Task<ActionResult<TableSessionDto>> CloseSession(Guid id, [FromBody(EmptyBodyBehavior = Microsoft.AspNetCore.Mvc.ModelBinding.EmptyBodyBehavior.Allow)] CloseSessionRequest? request)
    {
        var query = _context.TableSessions
            .Include(s => s.Table)
            .Include(s => s.Restaurant)
            .Include(s => s.Orders)
                .ThenInclude(o => o.Items)
            .Include(s => s.Orders)
                .ThenInclude(o => o.User)
            .AsQueryable();

        var userRestaurantId = GetRestaurantId();
        if (userRestaurantId.HasValue)
        {
            query = query.Where(s => s.RestaurantId == userRestaurantId.Value);
        }

        var session = await query.FirstOrDefaultAsync(s => s.Id == id);

        if (session == null)
            return NotFound();

        if (session.Status == TableSessionStatus.Closed)
            return BadRequest(new { error = "Сессия уже закрыта" });

        session.Status = TableSessionStatus.Closed;
        session.ClosedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Notify via SignalR
        await _hubContext.Clients.Group("Admins").SendAsync("TableSessionClosed", new
        {
            SessionId = session.Id,
            TableNumber = session.TableNumber,
            ClosedAt = session.ClosedAt
        });

        return Ok(MapToDto(session));
    }

    /// <summary>
    /// Mark entire session as paid (for cash payments)
    /// </summary>
    [HttpPost("{id}/mark-paid")]
    public async Task<ActionResult<TableSessionDto>> MarkSessionPaid(Guid id, [FromBody(EmptyBodyBehavior = Microsoft.AspNetCore.Mvc.ModelBinding.EmptyBodyBehavior.Allow)] MarkSessionPaidRequest? request)
    {
        var query = _context.TableSessions
            .Include(s => s.Table)
            .Include(s => s.Restaurant)
            .Include(s => s.Orders)
                .ThenInclude(o => o.Items)
            .Include(s => s.Orders)
                .ThenInclude(o => o.User)
            .AsQueryable();

        var userRestaurantId = GetRestaurantId();
        if (userRestaurantId.HasValue)
        {
            query = query.Where(s => s.RestaurantId == userRestaurantId.Value);
        }

        var session = await query.FirstOrDefaultAsync(s => s.Id == id);

        if (session == null)
            return NotFound();

        // Mark all unpaid orders as paid
        var unpaidOrders = session.Orders
            .Where(o => o.Status != OrderStatus.Cancelled && !o.IsPaid)
            .ToList();

        foreach (var order in unpaidOrders)
        {
            order.IsPaid = true;
            order.PaidAt = DateTime.UtcNow;
            order.PaymentMethod = "cash";
        }

        // Check if all orders are now paid, close session
        var allPaid = session.Orders
            .Where(o => o.Status != OrderStatus.Cancelled)
            .All(o => o.IsPaid);

        if (allPaid)
        {
            session.Status = TableSessionStatus.Closed;
            session.ClosedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        // Notify via SignalR
        await _hubContext.Clients.Group("Admins").SendAsync("SessionMarkedPaid", new
        {
            SessionId = session.Id,
            TableNumber = session.TableNumber,
            OrdersPaid = unpaidOrders.Count,
            SessionClosed = session.Status == TableSessionStatus.Closed
        });

        return Ok(MapToDto(session));
    }

    /// <summary>
    /// Mark specific order in session as paid
    /// </summary>
    [HttpPost("{sessionId}/orders/{orderId}/mark-paid")]
    public async Task<ActionResult<TableSessionDto>> MarkOrderPaid(Guid sessionId, Guid orderId)
    {
        var query = _context.TableSessions
            .Include(s => s.Table)
            .Include(s => s.Restaurant)
            .Include(s => s.Orders)
                .ThenInclude(o => o.Items)
            .Include(s => s.Orders)
                .ThenInclude(o => o.User)
            .AsQueryable();

        var userRestaurantId = GetRestaurantId();
        if (userRestaurantId.HasValue)
        {
            query = query.Where(s => s.RestaurantId == userRestaurantId.Value);
        }

        var session = await query.FirstOrDefaultAsync(s => s.Id == sessionId);

        if (session == null)
            return NotFound(new { error = "Сессия не найдена" });

        var order = session.Orders.FirstOrDefault(o => o.Id == orderId);
        if (order == null)
            return NotFound(new { error = "Заказ не найден" });

        if (order.IsPaid)
            return BadRequest(new { error = "Заказ уже оплачен" });

        order.IsPaid = true;
        order.PaidAt = DateTime.UtcNow;
        order.PaymentMethod = "cash";

        // Check if all orders are now paid, close session
        var allPaid = session.Orders
            .Where(o => o.Status != OrderStatus.Cancelled)
            .All(o => o.IsPaid);

        if (allPaid)
        {
            session.Status = TableSessionStatus.Closed;
            session.ClosedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        // Notify via SignalR
        await _hubContext.Clients.Group("Admins").SendAsync("OrderMarkedPaid", new
        {
            SessionId = session.Id,
            OrderId = order.Id,
            TableNumber = session.TableNumber,
            SessionClosed = session.Status == TableSessionStatus.Closed
        });

        return Ok(MapToDto(session));
    }

    private static List<string>? ParseSelectedAddons(string? selectedAddons)
    {
        if (string.IsNullOrEmpty(selectedAddons))
            return null;

        try
        {
            return JsonSerializer.Deserialize<List<string>>(selectedAddons);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static TableSessionDto MapToDto(Core.Entities.TableSession session)
    {
        // Защита от null коллекции Orders
        var orders = session.Orders ?? new List<Core.Entities.Order>();
        var activeOrders = orders
            .Where(o => o.Status != OrderStatus.Cancelled)
            .ToList();

        var paidAmount = activeOrders.Where(o => o.IsPaid).Sum(o => o.Total);
        var guestCount = activeOrders.Select(o => o.UserId).Distinct().Count();

        return new TableSessionDto(
            Id: session.Id,
            TableId: session.TableId,
            TableNumber: session.TableNumber,
            TableName: session.Table?.Name,
            RestaurantId: session.RestaurantId,
            RestaurantName: session.Restaurant?.Name,
            StartedAt: session.StartedAt,
            ClosedAt: session.ClosedAt,
            Status: session.Status,
            SessionSubtotal: session.SessionSubtotal,
            SessionServiceFee: session.SessionServiceFee,
            SessionTotal: session.SessionTotal,
            ServiceFeePercent: session.ServiceFeePercent,
            PaidAmount: paidAmount,
            UnpaidAmount: session.SessionTotal - paidAmount,
            OrderCount: activeOrders.Count,
            GuestCount: guestCount,
            Orders: activeOrders.Select(o => {
                // Рассчитываем долю service fee для этого заказа
                decimal serviceFeeShare = 0;
                if (session.SessionSubtotal > 0)
                {
                    serviceFeeShare = Math.Round(session.SessionServiceFee * (o.Subtotal / session.SessionSubtotal), 2);
                }
                var items = o.Items ?? new List<Core.Entities.OrderItem>();
                var hasPendingItems = items.Any(i => i.Status == OrderItemStatus.Pending);
                return new SessionOrderDto(
                    Id: o.Id,
                    UserId: o.UserId,
                    GuestPhone: o.User?.Phone,
                    CreatedAt: o.CreatedAt,
                    Status: o.Status,
                    Subtotal: o.Subtotal,
                    ServiceFeeShare: serviceFeeShare,
                    Total: o.Subtotal + serviceFeeShare,
                    IsPaid: o.IsPaid,
                    PaidAt: o.PaidAt,
                    CompletedAt: o.CompletedAt,
                    HasPendingItems: hasPendingItems,
                    PaymentMethod: o.PaymentMethod,
                    WantsCashPayment: o.PaymentMethod == "cash" && !o.IsPaid,
                    Items: items.Select(i => new OrderItemDto(
                        i.Id,
                        i.ProductId,
                        i.ProductName,
                        i.SizeName,
                        i.UnitPrice,
                        i.Quantity,
                        i.TotalPrice,
                        ParseSelectedAddons(i.SelectedAddons),
                        i.Status,
                        i.CreatedAt,
                        i.CancelReason,
                        i.Note
                    )).ToList(),
                    // Поля для delivery/takeaway
                    OrderType: o.OrderType,
                    DeliveryAddress: o.DeliveryAddress,
                    CustomerName: o.CustomerName,
                    CustomerPhone: o.CustomerPhone,
                    DeliveryFee: o.DeliveryFee
                );
            }).ToList()
        );
    }
}
