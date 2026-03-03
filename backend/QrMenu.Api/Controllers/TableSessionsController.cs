using System.Security.Claims;
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
[Route("api/[controller]")]
[Authorize]
public class TableSessionsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IHubContext<OrdersHub> _hubContext;

    public TableSessionsController(AppDbContext context, IHubContext<OrdersHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim!);
    }

    /// <summary>
    /// Get session info for current table (for guest)
    /// </summary>
    [HttpGet("my-session")]
    public async Task<ActionResult<GuestSessionInfoDto>> GetMySessionInfo([FromQuery] Guid tableId)
    {
        var userId = GetUserId();

        // Find active session for this table
        var session = await _context.TableSessions
            .Include(s => s.Orders)
                .ThenInclude(o => o.Items)
            .Include(s => s.Orders)
                .ThenInclude(o => o.User)
            .FirstOrDefaultAsync(s => s.TableId == tableId && s.Status == TableSessionStatus.Active);

        if (session == null)
        {
            return NotFound(new { error = "Активная сессия не найдена" });
        }

        // Calculate totals
        var activeOrders = session.Orders
            .Where(o => o.Status != OrderStatus.Cancelled)
            .ToList();

        var myOrdersList = activeOrders.Where(o => o.UserId == userId).ToList();
        var otherOrdersList = activeOrders.Where(o => o.UserId != userId).ToList();

        // Мои заказы: сумма subtotal (без service fee)
        var myOrderSubtotal = myOrdersList.Sum(o => o.Subtotal);
        var myOrderIsPaid = myOrdersList.Count == 0 || myOrdersList.All(o => o.IsPaid);

        // Рассчитываем мою долю service fee
        decimal myServiceFeeShare = 0;
        if (session.SessionSubtotal > 0)
        {
            myServiceFeeShare = Math.Round(session.SessionServiceFee * (myOrderSubtotal / session.SessionSubtotal), 2);
        }
        var myTotal = myOrderSubtotal + myServiceFeeShare;

        // Стол: используем значения из сессии
        var tableSubtotal = session.SessionSubtotal;
        var tableServiceFee = session.SessionServiceFee;
        var tableTotal = session.SessionTotal;

        // Оплаченная сумма (включая service fee)
        var paidOrders = activeOrders.Where(o => o.IsPaid).ToList();
        var tablePaidAmount = paidOrders.Sum(o => o.Total);
        var tableUnpaidAmount = tableTotal - tablePaidAmount;

        var guestCount = activeOrders.Select(o => o.UserId).Distinct().Count();

        // Can pay for table if there are unpaid orders
        var canPayForTable = tableUnpaidAmount > 0;

        // Map orders to summaries
        var myOrders = myOrdersList.Select(o => MapToOrderSummary(o, session.SessionSubtotal, session.SessionServiceFee)).ToList();
        var otherOrders = otherOrdersList.Select(o => MapToOrderSummary(o, session.SessionSubtotal, session.SessionServiceFee)).ToList();

        return Ok(new GuestSessionInfoDto(
            SessionId: session.Id,
            GuestCount: guestCount,
            MyOrderSubtotal: myOrderSubtotal,
            MyServiceFeeShare: myServiceFeeShare,
            MyTotal: myTotal,
            TableSubtotal: tableSubtotal,
            TableServiceFee: tableServiceFee,
            TableTotal: tableTotal,
            TablePaidAmount: tablePaidAmount,
            TableUnpaidAmount: tableUnpaidAmount,
            ServiceFeePercent: session.ServiceFeePercent,
            MyOrderIsPaid: myOrderIsPaid,
            CanPayForTable: canPayForTable,
            MyOrders: myOrders,
            OtherOrders: otherOrders
        ));
    }

    /// <summary>
    /// Pay for entire table
    /// </summary>
    [HttpPost("{id}/pay-table")]
    public async Task<ActionResult<PayForTableResponse>> PayForTable(Guid id, [FromBody] PayForTableRequest request)
    {
        var userId = GetUserId();

        var session = await _context.TableSessions
            .Include(s => s.Orders)
                .ThenInclude(o => o.Table)
                    .ThenInclude(t => t.Restaurant)
            .FirstOrDefaultAsync(s => s.Id == id && s.Status == TableSessionStatus.Active);

        if (session == null)
        {
            return NotFound(new { error = "Сессия не найдена или закрыта" });
        }

        var unpaidOrders = session.Orders
            .Where(o => o.Status != OrderStatus.Cancelled && !o.IsPaid)
            .ToList();

        if (unpaidOrders.Count == 0)
        {
            return BadRequest(new { error = "Все заказы уже оплачены" });
        }

        // Рассчитываем сумму к оплате: subtotal неоплаченных + пропорциональная доля service fee
        var unpaidSubtotal = unpaidOrders.Sum(o => o.Subtotal);
        decimal serviceFeeForUnpaid = 0;
        if (session.SessionSubtotal > 0)
        {
            serviceFeeForUnpaid = Math.Round(session.SessionServiceFee * (unpaidSubtotal / session.SessionSubtotal), 2);
        }
        var totalToPay = unpaidSubtotal + serviceFeeForUnpaid;

        if (request.PaymentMethod == "cash")
        {
            // Mark all orders as cash payment pending
            foreach (var order in unpaidOrders)
            {
                order.PaymentMethod = "cash";
            }
            await _context.SaveChangesAsync();

            // Notify admins via SignalR
            var firstOrder = unpaidOrders.First();
            await _hubContext.Clients.Group("Admins").SendAsync("TablePaymentRequested", new
            {
                SessionId = session.Id,
                TableNumber = session.TableNumber,
                TableName = firstOrder.Table.Name ?? $"Стол #{session.TableNumber}",
                Amount = totalToPay,
                OrderCount = unpaidOrders.Count,
                PaymentMethod = "cash",
                RequestedAt = DateTime.UtcNow,
                RestaurantId = session.RestaurantId
            });

            return Ok(new PayForTableResponse(
                Success: true,
                Message: "Официант скоро подойдёт для оплаты за весь стол",
                TotalPaid: totalToPay,
                OrdersPaid: unpaidOrders.Count
            ));
        }
        else if (request.PaymentMethod == "online")
        {
            // Get payment link from restaurant
            var firstOrder = unpaidOrders.First();
            var paymentLink = firstOrder.Table.Restaurant.PaymentLink;

            if (string.IsNullOrEmpty(paymentLink))
            {
                return BadRequest(new { error = "Онлайн оплата недоступна" });
            }

            // Replace amount placeholder
            var finalLink = paymentLink.Replace("{amount}", totalToPay.ToString());

            return Ok(new PayForTableResponse(
                Success: true,
                Message: "Переход на страницу оплаты",
                TotalPaid: totalToPay,
                OrdersPaid: unpaidOrders.Count,
                PaymentLink: finalLink
            ));
        }

        return BadRequest(new { error = "Неверный способ оплаты" });
    }

    /// <summary>
    /// Get current session for a table
    /// </summary>
    [HttpGet("by-table/{tableId}")]
    public async Task<ActionResult<TableSessionDto>> GetSessionByTable(Guid tableId)
    {
        var session = await _context.TableSessions
            .Include(s => s.Table)
            .Include(s => s.Restaurant)
            .Include(s => s.Orders)
                .ThenInclude(o => o.Items)
            .Include(s => s.Orders)
                .ThenInclude(o => o.User)
            .FirstOrDefaultAsync(s => s.TableId == tableId && s.Status == TableSessionStatus.Active);

        if (session == null)
        {
            return NotFound(new { error = "Активная сессия не найдена" });
        }

        return Ok(MapToDto(session));
    }

    private static TableSessionDto MapToDto(Core.Entities.TableSession session)
    {
        var activeOrders = session.Orders
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
                var hasPendingItems = o.Items.Any(i => i.Status == OrderItemStatus.Pending);
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
                    Items: o.Items.Select(i => new OrderItemDto(
                        i.Id,
                        i.ProductId,
                        i.ProductName,
                        i.SizeName,
                        i.UnitPrice,
                        i.Quantity,
                        i.TotalPrice,
                        string.IsNullOrEmpty(i.SelectedAddons)
                            ? null
                            : System.Text.Json.JsonSerializer.Deserialize<List<string>>(i.SelectedAddons),
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

    private static GuestOrderSummary MapToOrderSummary(
        Core.Entities.Order order,
        decimal sessionSubtotal,
        decimal sessionServiceFee)
    {
        var activeItems = order.Items
            .Where(i => i.Status != OrderItemStatus.Cancelled)
            .ToList();

        var itemNames = activeItems.Take(2).Select(i => i.ProductName).ToList();
        var preview = string.Join(", ", itemNames);
        if (activeItems.Count > 2)
        {
            preview += $", +{activeItems.Count - 2}";
        }

        // Рассчитываем долю service fee для этого заказа
        decimal serviceFeeShare = 0;
        if (sessionSubtotal > 0)
        {
            serviceFeeShare = Math.Round(sessionServiceFee * (order.Subtotal / sessionSubtotal), 2);
        }

        return new GuestOrderSummary(
            OrderId: order.Id,
            Subtotal: order.Subtotal,
            ServiceFeeShare: serviceFeeShare,
            Total: order.Subtotal + serviceFeeShare,
            IsPaid: order.IsPaid,
            ItemCount: activeItems.Count,
            ItemsPreview: preview
        );
    }
}
