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
[Route("api/admin/orders")]
[Authorize(Roles = "Admin,RestaurantAdmin")]
public class AdminOrdersController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IHubContext<OrdersHub> _hubContext;

    public AdminOrdersController(AppDbContext context, IHubContext<OrdersHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    private Guid? GetRestaurantId()
    {
        var restaurantIdClaim = User.FindFirst("restaurantId")?.Value;
        return restaurantIdClaim != null ? Guid.Parse(restaurantIdClaim) : null;
    }

    private bool IsSuperAdmin()
    {
        return User.IsInRole("Admin") && !User.IsInRole("RestaurantAdmin");
    }

    [HttpGet]
    public async Task<ActionResult<List<OrderDto>>> GetOrders([FromQuery] OrderStatus? status, [FromQuery] Guid? restaurantId)
    {
        var query = _context.Orders
            .Include(o => o.Items)
            .Include(o => o.Table)
                .ThenInclude(t => t.Restaurant)
            .Include(o => o.Restaurant)
            .AsQueryable();

        // Filter by restaurant for RestaurantAdmin
        var userRestaurantId = GetRestaurantId();
        if (userRestaurantId.HasValue)
        {
            // Include both table-based and direct restaurant orders
            query = query.Where(o => o.Table != null ? o.Table.RestaurantId == userRestaurantId.Value : o.RestaurantId == userRestaurantId.Value);
        }
        else if (restaurantId.HasValue)
        {
            query = query.Where(o => o.Table != null ? o.Table.RestaurantId == restaurantId.Value : o.RestaurantId == restaurantId.Value);
        }

        if (status.HasValue)
            query = query.Where(o => o.Status == status.Value);

        var orders = await query
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        var dtos = orders.Select(MapToDto).ToList();
        return Ok(dtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OrderDto>> GetOrder(Guid id)
    {
        var query = _context.Orders
            .Include(o => o.Items)
            .Include(o => o.Table)
                .ThenInclude(t => t.Restaurant)
            .Include(o => o.Restaurant)
            .AsQueryable();

        var userRestaurantId = GetRestaurantId();
        if (userRestaurantId.HasValue)
        {
            query = query.Where(o => o.Table != null ? o.Table.RestaurantId == userRestaurantId.Value : o.RestaurantId == userRestaurantId.Value);
        }

        var order = await query.FirstOrDefaultAsync(o => o.Id == id);

        if (order == null)
            return NotFound();

        return Ok(MapToDto(order));
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateOrderStatusRequest request)
    {
        var query = _context.Orders
            .Include(o => o.Items)
            .Include(o => o.Table)
                .ThenInclude(t => t.Restaurant)
            .Include(o => o.Restaurant)
            .AsQueryable();

        var userRestaurantId = GetRestaurantId();
        if (userRestaurantId.HasValue)
        {
            query = query.Where(o => o.Table != null ? o.Table.RestaurantId == userRestaurantId.Value : o.RestaurantId == userRestaurantId.Value);
        }

        var order = await query.FirstOrDefaultAsync(o => o.Id == id);

        if (order == null)
            return NotFound();

        // When confirming order, mark all pending items as active
        if (request.Status == OrderStatus.Confirmed)
        {
            foreach (var item in order.Items.Where(i => i.Status == OrderItemStatus.Pending))
            {
                item.Status = OrderItemStatus.Active;
            }
        }

        // When completing order, set CompletedAt timestamp
        if (request.Status == OrderStatus.Completed && order.Status != OrderStatus.Completed)
        {
            order.CompletedAt = DateTime.UtcNow;
        }

        order.Status = request.Status;
        await _context.SaveChangesAsync();

        var orderDto = MapToDto(order);

        // Notify admins via SignalR
        await _hubContext.Clients.Group("Admins").SendAsync("OrderStatusUpdated", orderDto);

        // Notify specific customer about their order status
        await _hubContext.Clients.Group($"Customer_{order.UserId}").SendAsync("MyOrderStatusUpdated", orderDto);

        // If order has a table, notify table group
        if (order.TableId.HasValue)
        {
            await _hubContext.Clients.Group($"Table_{order.TableId}").SendAsync("TableOrderUpdated", orderDto);
        }

        return NoContent();
    }

    // Cancel specific item in order (admin)
    [HttpPost("{orderId}/items/{itemId}/cancel")]
    public async Task<ActionResult<OrderDto>> CancelOrderItem(
        Guid orderId,
        Guid itemId,
        [FromBody] CancelOrderItemRequest request)
    {
        var query = _context.Orders
            .Include(o => o.Items)
            .Include(o => o.Table)
                .ThenInclude(t => t.Restaurant)
            .Include(o => o.Restaurant)
            .AsQueryable();

        var userRestaurantId = GetRestaurantId();
        if (userRestaurantId.HasValue)
        {
            query = query.Where(o => o.Table != null ? o.Table.RestaurantId == userRestaurantId.Value : o.RestaurantId == userRestaurantId.Value);
        }

        var order = await query.FirstOrDefaultAsync(o => o.Id == orderId);

        if (order == null)
            return NotFound();

        var item = order.Items.FirstOrDefault(i => i.Id == itemId);
        if (item == null)
            return NotFound(new { error = "Item not found" });

        if (item.Status == OrderItemStatus.Cancelled)
            return BadRequest(new { error = "Item is already cancelled" });

        item.Status = OrderItemStatus.Cancelled;
        item.CancelReason = request.Reason;

        // Recalculate totals
        RecalculateOrderTotals(order);

        // If all items are cancelled, cancel the order
        if (order.Items.All(i => i.Status == OrderItemStatus.Cancelled))
        {
            order.Status = OrderStatus.Cancelled;
        }

        await _context.SaveChangesAsync();

        // Пересчитать service fee для всей сессии
        if (order.TableSessionId.HasValue)
        {
            var session = await _context.TableSessions
                .Include(s => s.Orders)
                .FirstOrDefaultAsync(s => s.Id == order.TableSessionId.Value);
            if (session != null)
            {
                await RecalculateSessionTotals(session);
            }
        }

        var orderDto = MapToDto(order);

        // Notify admins
        await _hubContext.Clients.Group("Admins").SendAsync("OrderItemCancelled", orderDto);

        // Notify customer
        await _hubContext.Clients.Group($"Customer_{order.UserId}").SendAsync("MyOrderUpdated", orderDto);

        return Ok(orderDto);
    }

    // Confirm specific pending items
    [HttpPost("{orderId}/items/confirm")]
    public async Task<ActionResult<OrderDto>> ConfirmPendingItems(Guid orderId)
    {
        var query = _context.Orders
            .Include(o => o.Items)
            .Include(o => o.Table)
                .ThenInclude(t => t.Restaurant)
            .Include(o => o.Restaurant)
            .AsQueryable();

        var userRestaurantId = GetRestaurantId();
        if (userRestaurantId.HasValue)
        {
            query = query.Where(o => o.Table != null ? o.Table.RestaurantId == userRestaurantId.Value : o.RestaurantId == userRestaurantId.Value);
        }

        var order = await query.FirstOrDefaultAsync(o => o.Id == orderId);

        if (order == null)
            return NotFound();

        foreach (var item in order.Items.Where(i => i.Status == OrderItemStatus.Pending))
        {
            item.Status = OrderItemStatus.Active;
        }

        await _context.SaveChangesAsync();

        var orderDto = MapToDto(order);

        // Notify admins
        await _hubContext.Clients.Group("Admins").SendAsync("OrderItemsConfirmed", orderDto);

        // Notify customer
        await _hubContext.Clients.Group($"Customer_{order.UserId}").SendAsync("MyOrderUpdated", orderDto);

        return Ok(orderDto);
    }

    private void RecalculateOrderTotals(Core.Entities.Order order)
    {
        var activeItems = order.Items.Where(i => i.Status != OrderItemStatus.Cancelled).ToList();
        order.Subtotal = activeItems.Sum(i => i.TotalPrice);
        order.Tax = 0; // Service fee рассчитывается на уровне сессии
        order.Total = order.Subtotal;
    }

    private async Task RecalculateSessionTotals(Core.Entities.TableSession session)
    {
        // Загружаем заказы если не загружены
        if (!session.Orders.Any())
        {
            await _context.Entry(session)
                .Collection(s => s.Orders)
                .LoadAsync();
        }

        var activeOrders = session.Orders
            .Where(o => o.Status != OrderStatus.Cancelled)
            .ToList();

        session.SessionSubtotal = activeOrders.Sum(o => o.Subtotal);
        session.SessionServiceFee = Math.Round(session.SessionSubtotal * session.ServiceFeePercent / 100m, 2);
        session.SessionTotal = session.SessionSubtotal + session.SessionServiceFee;

        await _context.SaveChangesAsync();
    }

    private static OrderDto MapToDto(Core.Entities.Order order)
    {
        var tableTypeName = order.Table?.Type switch
        {
            TableType.Стандартный => "Стандартный",
            TableType.VIP => "VIP",
            TableType.Барная => "Барная стойка",
            TableType.Терраса => "Терраса",
            TableType.Кабинка => "Кабинка",
            TableType.Детский => "Детский",
            _ => null
        };

        var hasPendingItems = order.Items.Any(i => i.Status == OrderItemStatus.Pending);

        // Get restaurant info (either from table or directly)
        var restaurantId = order.Table?.RestaurantId ?? order.RestaurantId;
        var restaurantName = order.Table?.Restaurant?.Name ?? order.Restaurant?.Name;

        return new OrderDto(
            order.Id,
            order.UserId,
            order.TableId,
            order.TableNumber,
            order.Table?.Name,
            tableTypeName,
            restaurantId,
            restaurantName,
            order.CreatedAt,
            order.Status,
            order.Subtotal,
            order.Tax, // ServiceFee
            order.Total,
            order.SpecialInstructions,
            order.Items.Select(i => new OrderItemDto(
                i.Id,
                i.ProductId,
                i.ProductName,
                i.SizeName,
                i.UnitPrice,
                i.Quantity,
                i.TotalPrice,
                string.IsNullOrEmpty(i.SelectedAddons) ? null : JsonSerializer.Deserialize<List<string>>(i.SelectedAddons),
                i.Status,
                i.CreatedAt,
                i.CancelReason
            )).ToList(),
            hasPendingItems,
            order.PaymentLink,
            order.OrderType,
            order.DeliveryAddress,
            order.CustomerName,
            order.CustomerPhone,
            order.DeliveryFee
        );
    }
}
