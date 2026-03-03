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

            var result = sessions.Select(MapToDto).ToList();

            // Добавляем заказы без сессий (Delivery/Takeaway) как "виртуальные" сессии
            var ordersWithoutSessionQuery = _context.Orders
                .Include(o => o.Items)
                .Include(o => o.Restaurant)
                .Include(o => o.User)
                .Where(o => o.TableSessionId == null)
                .Where(o => o.OrderType == OrderType.Delivery || o.OrderType == OrderType.Takeaway)
                .Where(o => o.Status != OrderStatus.Cancelled)
                .AsQueryable();

            // Фильтр по ресторану
            if (userRestaurantId.HasValue)
            {
                ordersWithoutSessionQuery = ordersWithoutSessionQuery.Where(o => o.RestaurantId == userRestaurantId.Value);
            }
            else if (restaurantId.HasValue)
            {
                ordersWithoutSessionQuery = ordersWithoutSessionQuery.Where(o => o.RestaurantId == restaurantId.Value);
            }

            // Фильтр по статусу (для виртуальных сессий: active = не оплачен, closed = оплачен)
            if (status?.ToLower() == "active")
            {
                ordersWithoutSessionQuery = ordersWithoutSessionQuery.Where(o => !o.IsPaid);
            }
            else if (status?.ToLower() == "closed")
            {
                ordersWithoutSessionQuery = ordersWithoutSessionQuery.Where(o => o.IsPaid);
            }

            var ordersWithoutSession = await ordersWithoutSessionQuery
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            // Создаём виртуальные сессии для каждого заказа Delivery/Takeaway
            foreach (var order in ordersWithoutSession)
            {
                var virtualSession = MapOrderToVirtualSession(order);
                result.Add(virtualSession);
            }

            // Сортируем общий результат по дате
            result = result.OrderByDescending(s => s.StartedAt).ToList();

            return Ok(result);
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

    private static TableSessionDto MapOrderToVirtualSession(Core.Entities.Order order)
    {
        var items = order.Items ?? new List<Core.Entities.OrderItem>();
        var hasPendingItems = items.Any(i => i.Status == OrderItemStatus.Pending);

        // Для виртуальной сессии delivery/takeaway total = subtotal + deliveryFee (без service fee)
        var total = order.Subtotal + order.DeliveryFee;
        var paidAmount = order.IsPaid ? total : 0;

        var sessionOrder = new SessionOrderDto(
            Id: order.Id,
            UserId: order.UserId,
            GuestPhone: order.User?.Phone ?? order.CustomerPhone,
            CreatedAt: order.CreatedAt,
            Status: order.Status,
            Subtotal: order.Subtotal,
            ServiceFeeShare: 0,
            Total: total,
            IsPaid: order.IsPaid,
            PaidAt: order.PaidAt,
            CompletedAt: order.CompletedAt,
            HasPendingItems: hasPendingItems,
            PaymentMethod: order.PaymentMethod,
            WantsCashPayment: order.PaymentMethod == "cash" && !order.IsPaid,
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
            OrderType: order.OrderType,
            DeliveryAddress: order.DeliveryAddress,
            CustomerName: order.CustomerName,
            CustomerPhone: order.CustomerPhone,
            DeliveryFee: order.DeliveryFee
        );

        return new TableSessionDto(
            Id: order.Id,  // Используем ID заказа как ID "виртуальной" сессии
            TableId: Guid.Empty,
            TableNumber: 0,
            TableName: order.OrderType == OrderType.Delivery ? "Доставка" : "Самовывоз",
            RestaurantId: order.RestaurantId ?? Guid.Empty,
            RestaurantName: order.Restaurant?.Name,
            StartedAt: order.CreatedAt,
            ClosedAt: order.IsPaid ? order.PaidAt : null,
            Status: order.IsPaid ? TableSessionStatus.Closed : TableSessionStatus.Active,
            SessionSubtotal: order.Subtotal,
            SessionServiceFee: 0,
            SessionTotal: total,
            ServiceFeePercent: 0,
            PaidAmount: paidAmount,
            UnpaidAmount: total - paidAmount,
            OrderCount: 1,
            GuestCount: 1,
            Orders: new List<SessionOrderDto> { sessionOrder }
        );
    }
}
