using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using QrMenu.Api.DTOs;
using QrMenu.Api.Hubs;
using QrMenu.Core.Entities;
using QrMenu.Core.Enums;
using QrMenu.Infrastructure.Data;
using TableSession = QrMenu.Core.Entities.TableSession;

namespace QrMenu.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IHubContext<OrdersHub> _hubContext;

    public OrdersController(AppDbContext context, IHubContext<OrdersHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim!);
    }

    [HttpGet]
    public async Task<ActionResult<List<OrderDto>>> GetOrders()
    {
        var userId = GetUserId();
        var orders = await _context.Orders
            .Include(o => o.Items)
            .Include(o => o.Table)
                .ThenInclude(t => t.Restaurant)
            .Include(o => o.Restaurant)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        var dtos = orders.Select(MapToDto).ToList();
        return Ok(dtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OrderDto>> GetOrder(Guid id)
    {
        var userId = GetUserId();
        var order = await _context.Orders
            .Include(o => o.Items)
            .Include(o => o.Table)
                .ThenInclude(t => t.Restaurant)
            .Include(o => o.Restaurant)
            .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

        if (order == null)
            return NotFound();

        return Ok(MapToDto(order));
    }

    [HttpPost]
    public async Task<ActionResult<OrderDto>> CreateOrder([FromBody] CreateOrderRequest request)
    {
        var userId = GetUserId();

        // Validate table
        var table = await _context.Tables
            .Include(t => t.Restaurant)
            .FirstOrDefaultAsync(t => t.Id == request.TableId);

        if (table == null || !table.IsActive)
            return BadRequest(new { error = "Invalid table" });

        // Check if restaurant is accepting orders
        if (!table.Restaurant.AcceptingOrders)
        {
            var message = table.Restaurant.PauseMessage ?? "Ресторан временно не принимает заказы";
            return BadRequest(new { error = message, code = "ORDERS_PAUSED" });
        }

        // Find or create active table session
        var session = await _context.TableSessions
            .FirstOrDefaultAsync(s => s.TableId == request.TableId
                                    && s.Status == TableSessionStatus.Active);

        if (session == null)
        {
            session = new TableSession
            {
                Id = Guid.NewGuid(),
                TableId = request.TableId,
                RestaurantId = table.RestaurantId,
                TableNumber = table.Number,
                StartedAt = DateTime.UtcNow,
                Status = TableSessionStatus.Active,
                ServiceFeePercent = table.Restaurant.ServiceFeePercent // Копируем процент из ресторана
            };
            _context.TableSessions.Add(session);
        }

        // Create order
        var order = new Order
        {
            UserId = userId,
            TableId = request.TableId,
            TableNumber = table.Number,
            TableSessionId = session.Id,
            SpecialInstructions = request.SpecialInstructions,
            Status = OrderStatus.Pending,
            PaymentLink = table.Restaurant.PaymentLink  // Копируем ссылку для оплаты из ресторана
        };

        decimal subtotal = 0;

        foreach (var itemRequest in request.Items)
        {
            var product = await _context.Products
                .Include(p => p.Sizes)
                .Include(p => p.Addons)
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Id == itemRequest.ProductId);

            if (product == null || !product.IsAvailable)
                return BadRequest(new { error = $"Product {itemRequest.ProductId} not found or unavailable" });

            // Check category availability (time-based)
            if (!IsCategoryAvailable(product.Category))
                return BadRequest(new { error = $"Category {product.Category.Name} is not available at this time" });

            decimal unitPrice = product.BasePrice;
            string? sizeName = null;

            // Add size modifier
            if (itemRequest.SizeId.HasValue)
            {
                var size = product.Sizes.FirstOrDefault(s => s.Id == itemRequest.SizeId.Value);
                if (size != null)
                {
                    unitPrice += size.PriceModifier;
                    sizeName = size.Name;
                }
            }

            // Add addons
            var selectedAddons = new List<string>();
            if (itemRequest.AddonIds != null)
            {
                foreach (var addonId in itemRequest.AddonIds)
                {
                    var addon = product.Addons.FirstOrDefault(a => a.Id == addonId);
                    if (addon != null)
                    {
                        unitPrice += addon.Price;
                        selectedAddons.Add(addon.Name);
                    }
                }
            }

            var itemTotal = unitPrice * itemRequest.Quantity;
            subtotal += itemTotal;

            order.Items.Add(new OrderItem
            {
                ProductId = product.Id,
                ProductName = product.Name,
                SizeName = sizeName,
                UnitPrice = unitPrice,
                Quantity = itemRequest.Quantity,
                TotalPrice = itemTotal,
                SelectedAddons = selectedAddons.Count > 0 ? JsonSerializer.Serialize(selectedAddons) : null,
                Status = OrderItemStatus.Active,
                CreatedAt = DateTime.UtcNow,
                Note = itemRequest.Note
            });
        }

        order.Subtotal = subtotal;
        order.Tax = 0; // Service fee рассчитывается на уровне сессии
        order.Total = order.Subtotal;

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        // Пересчитать service fee для всей сессии
        await RecalculateSessionTotals(session);

        // Reload with navigation properties
        order = await _context.Orders
            .Include(o => o.Items)
            .Include(o => o.Table)
                .ThenInclude(t => t.Restaurant)
            .FirstAsync(o => o.Id == order.Id);

        // Notify admins about new order via SignalR
        await _hubContext.Clients.Group("Admins").SendAsync("NewOrder", MapToDto(order));

        return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, MapToDto(order));
    }

    // Add items to existing order (for additional orders while dining)
    [HttpPost("{id}/items")]
    public async Task<ActionResult<OrderDto>> AddItemsToOrder(Guid id, [FromBody] AddItemsToOrderRequest request)
    {
        var userId = GetUserId();
        var order = await _context.Orders
            .Include(o => o.Items)
            .Include(o => o.Table)
                .ThenInclude(t => t.Restaurant)
            .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

        if (order == null)
            return NotFound();

        // Can only add items to active orders
        if (order.Status == OrderStatus.Completed || order.Status == OrderStatus.Cancelled)
            return BadRequest(new { error = "Cannot add items to completed or cancelled orders" });

        // Check if restaurant is accepting orders
        if (!order.Table.Restaurant.AcceptingOrders)
        {
            var message = order.Table.Restaurant.PauseMessage ?? "Ресторан временно не принимает заказы";
            return BadRequest(new { error = message, code = "ORDERS_PAUSED" });
        }

        decimal additionalSubtotal = 0;

        foreach (var itemRequest in request.Items)
        {
            var product = await _context.Products
                .Include(p => p.Sizes)
                .Include(p => p.Addons)
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Id == itemRequest.ProductId);

            if (product == null || !product.IsAvailable)
                return BadRequest(new { error = $"Product {itemRequest.ProductId} not found or unavailable" });

            // Check category availability
            if (!IsCategoryAvailable(product.Category))
                return BadRequest(new { error = $"Category {product.Category.Name} is not available at this time" });

            decimal unitPrice = product.BasePrice;
            string? sizeName = null;

            if (itemRequest.SizeId.HasValue)
            {
                var size = product.Sizes.FirstOrDefault(s => s.Id == itemRequest.SizeId.Value);
                if (size != null)
                {
                    unitPrice += size.PriceModifier;
                    sizeName = size.Name;
                }
            }

            var selectedAddons = new List<string>();
            if (itemRequest.AddonIds != null)
            {
                foreach (var addonId in itemRequest.AddonIds)
                {
                    var addon = product.Addons.FirstOrDefault(a => a.Id == addonId);
                    if (addon != null)
                    {
                        unitPrice += addon.Price;
                        selectedAddons.Add(addon.Name);
                    }
                }
            }

            var itemTotal = unitPrice * itemRequest.Quantity;
            additionalSubtotal += itemTotal;

            order.Items.Add(new OrderItem
            {
                ProductId = product.Id,
                ProductName = product.Name,
                SizeName = sizeName,
                UnitPrice = unitPrice,
                Quantity = itemRequest.Quantity,
                TotalPrice = itemTotal,
                SelectedAddons = selectedAddons.Count > 0 ? JsonSerializer.Serialize(selectedAddons) : null,
                Status = OrderItemStatus.Pending, // New items start as Pending
                CreatedAt = DateTime.UtcNow,
                Note = itemRequest.Note
            });
        }

        // Recalculate totals (only for active items)
        RecalculateOrderTotals(order);

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

        // Notify admins about updated order
        await _hubContext.Clients.Group("Admins").SendAsync("OrderItemsAdded", MapToDto(order));

        return Ok(MapToDto(order));
    }

    // Cancel specific item in order
    [HttpPost("{orderId}/items/{itemId}/cancel")]
    public async Task<ActionResult<OrderDto>> CancelOrderItem(
        Guid orderId,
        Guid itemId,
        [FromBody] CancelOrderItemRequest request)
    {
        var userId = GetUserId();
        var order = await _context.Orders
            .Include(o => o.Items)
            .Include(o => o.Table)
                .ThenInclude(t => t.Restaurant)
            .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId);

        if (order == null)
            return NotFound();

        // Can only cancel items from pending/confirmed orders
        if (order.Status != OrderStatus.Pending && order.Status != OrderStatus.Confirmed)
            return BadRequest(new { error = "Cannot cancel items from orders that are already being prepared" });

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

        // Notify admins
        await _hubContext.Clients.Group("Admins").SendAsync("OrderItemCancelled", MapToDto(order));

        return Ok(MapToDto(order));
    }

    // Get active order for current table (if any)
    [HttpGet("active")]
    public async Task<ActionResult<OrderDto?>> GetActiveOrder([FromQuery] Guid tableId)
    {
        var userId = GetUserId();
        var order = await _context.Orders
            .Include(o => o.Items)
            .Include(o => o.Table)
                .ThenInclude(t => t.Restaurant)
            .Include(o => o.Restaurant)
            .Where(o => o.UserId == userId && o.TableId == tableId)
            .Where(o => o.Status != OrderStatus.Completed && o.Status != OrderStatus.Cancelled)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync();

        if (order == null)
            return Ok(null);

        return Ok(MapToDto(order));
    }

    private bool IsCategoryAvailable(Category category)
    {
        if (category.IsTemporarilyDisabled)
            return false;

        if (!category.AvailableFrom.HasValue || !category.AvailableTo.HasValue)
            return true;

        var now = DateTime.Now.TimeOfDay;
        return now >= category.AvailableFrom.Value && now <= category.AvailableTo.Value;
    }

    private void RecalculateOrderTotals(Order order)
    {
        var activeItems = order.Items.Where(i => i.Status != OrderItemStatus.Cancelled).ToList();
        order.Subtotal = activeItems.Sum(i => i.TotalPrice);
        order.Tax = 0; // Service fee рассчитывается на уровне сессии
        order.Total = order.Subtotal;
    }

    private async Task RecalculateSessionTotals(TableSession session)
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

    // Create delivery order
    [HttpPost("delivery")]
    public async Task<ActionResult<OrderDto>> CreateDeliveryOrder([FromBody] CreateDeliveryOrderDto request)
    {
        var userId = GetUserId();

        // Validate restaurant
        var restaurant = await _context.Restaurants.FindAsync(request.RestaurantId);
        if (restaurant == null || !restaurant.IsActive)
            return BadRequest(new { error = "Ресторан не найден" });

        if (!restaurant.DeliveryEnabled)
            return BadRequest(new { error = "Ресторан не доставляет" });

        if (!restaurant.AcceptingOrders)
        {
            var message = restaurant.PauseMessage ?? "Ресторан временно не принимает заказы";
            return BadRequest(new { error = message, code = "ORDERS_PAUSED" });
        }

        // Create order
        var order = new Order
        {
            UserId = userId,
            TableId = null,
            TableNumber = 0,
            RestaurantId = restaurant.Id,
            OrderType = OrderType.Delivery,
            DeliveryAddress = request.DeliveryAddress,
            DeliveryFee = restaurant.DeliveryFee,
            CustomerName = request.CustomerName,
            CustomerPhone = request.CustomerPhone,
            SpecialInstructions = request.SpecialInstructions,
            Status = OrderStatus.Pending,
            PaymentLink = restaurant.PaymentLink
        };

        decimal subtotal = 0;

        foreach (var itemRequest in request.Items)
        {
            var product = await _context.Products
                .Include(p => p.Sizes)
                .Include(p => p.Addons)
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Id == itemRequest.ProductId);

            if (product == null || !product.IsAvailable)
                return BadRequest(new { error = $"Продукт {itemRequest.ProductId} не найден или недоступен" });

            decimal unitPrice = product.BasePrice;
            string? sizeName = null;

            if (itemRequest.SizeId.HasValue)
            {
                var size = product.Sizes.FirstOrDefault(s => s.Id == itemRequest.SizeId.Value);
                if (size != null)
                {
                    unitPrice += size.PriceModifier;
                    sizeName = size.Name;
                }
            }

            var selectedAddons = new List<string>();
            if (itemRequest.AddonIds != null)
            {
                foreach (var addonId in itemRequest.AddonIds)
                {
                    var addon = product.Addons.FirstOrDefault(a => a.Id == addonId);
                    if (addon != null)
                    {
                        unitPrice += addon.Price;
                        selectedAddons.Add(addon.Name);
                    }
                }
            }

            var itemTotal = unitPrice * itemRequest.Quantity;
            subtotal += itemTotal;

            order.Items.Add(new OrderItem
            {
                ProductId = product.Id,
                ProductName = product.Name,
                SizeName = sizeName,
                UnitPrice = unitPrice,
                Quantity = itemRequest.Quantity,
                TotalPrice = itemTotal,
                SelectedAddons = selectedAddons.Count > 0 ? JsonSerializer.Serialize(selectedAddons) : null,
                Status = OrderItemStatus.Active,
                CreatedAt = DateTime.UtcNow,
                Note = itemRequest.Note
            });
        }

        order.Subtotal = subtotal;
        order.Tax = 0; // No service fee for delivery
        order.Total = order.Subtotal + order.DeliveryFee;

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        // Reload with navigation properties
        order = await _context.Orders
            .Include(o => o.Items)
            .Include(o => o.Restaurant)
            .FirstAsync(o => o.Id == order.Id);

        // Notify admins
        await _hubContext.Clients.Group("Admins").SendAsync("NewOrder", MapToDto(order));

        return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, MapToDto(order));
    }

    // Create takeaway order
    [HttpPost("takeaway")]
    public async Task<ActionResult<OrderDto>> CreateTakeawayOrder([FromBody] CreateTakeawayOrderDto request)
    {
        var userId = GetUserId();

        // Validate restaurant
        var restaurant = await _context.Restaurants.FindAsync(request.RestaurantId);
        if (restaurant == null || !restaurant.IsActive)
            return BadRequest(new { error = "Ресторан не найден" });

        if (!restaurant.TakeawayEnabled)
            return BadRequest(new { error = "Самовывоз недоступен" });

        if (!restaurant.AcceptingOrders)
        {
            var message = restaurant.PauseMessage ?? "Ресторан временно не принимает заказы";
            return BadRequest(new { error = message, code = "ORDERS_PAUSED" });
        }

        // Create order
        var order = new Order
        {
            UserId = userId,
            TableId = null,
            TableNumber = 0,
            RestaurantId = restaurant.Id,
            OrderType = OrderType.Takeaway,
            CustomerName = request.CustomerName,
            CustomerPhone = request.CustomerPhone,
            SpecialInstructions = request.SpecialInstructions,
            Status = OrderStatus.Pending,
            PaymentLink = restaurant.PaymentLink
        };

        decimal subtotal = 0;

        foreach (var itemRequest in request.Items)
        {
            var product = await _context.Products
                .Include(p => p.Sizes)
                .Include(p => p.Addons)
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Id == itemRequest.ProductId);

            if (product == null || !product.IsAvailable)
                return BadRequest(new { error = $"Продукт {itemRequest.ProductId} не найден или недоступен" });

            decimal unitPrice = product.BasePrice;
            string? sizeName = null;

            if (itemRequest.SizeId.HasValue)
            {
                var size = product.Sizes.FirstOrDefault(s => s.Id == itemRequest.SizeId.Value);
                if (size != null)
                {
                    unitPrice += size.PriceModifier;
                    sizeName = size.Name;
                }
            }

            var selectedAddons = new List<string>();
            if (itemRequest.AddonIds != null)
            {
                foreach (var addonId in itemRequest.AddonIds)
                {
                    var addon = product.Addons.FirstOrDefault(a => a.Id == addonId);
                    if (addon != null)
                    {
                        unitPrice += addon.Price;
                        selectedAddons.Add(addon.Name);
                    }
                }
            }

            var itemTotal = unitPrice * itemRequest.Quantity;
            subtotal += itemTotal;

            order.Items.Add(new OrderItem
            {
                ProductId = product.Id,
                ProductName = product.Name,
                SizeName = sizeName,
                UnitPrice = unitPrice,
                Quantity = itemRequest.Quantity,
                TotalPrice = itemTotal,
                SelectedAddons = selectedAddons.Count > 0 ? JsonSerializer.Serialize(selectedAddons) : null,
                Status = OrderItemStatus.Active,
                CreatedAt = DateTime.UtcNow,
                Note = itemRequest.Note
            });
        }

        order.Subtotal = subtotal;
        order.Tax = 0; // No service fee for takeaway
        order.Total = order.Subtotal;

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        // Reload with navigation properties
        order = await _context.Orders
            .Include(o => o.Items)
            .Include(o => o.Restaurant)
            .FirstAsync(o => o.Id == order.Id);

        // Notify admins
        await _hubContext.Clients.Group("Admins").SendAsync("NewOrder", MapToDto(order));

        return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, MapToDto(order));
    }

    // Create dine-in order without QR (manual table selection)
    [HttpPost("dinein")]
    public async Task<ActionResult<OrderDto>> CreateDineInOrder([FromBody] CreateDineInOrderDto request)
    {
        var userId = GetUserId();

        // Validate restaurant
        var restaurant = await _context.Restaurants
            .Include(r => r.Tables)
            .FirstOrDefaultAsync(r => r.Id == request.RestaurantId);

        if (restaurant == null || !restaurant.IsActive)
            return BadRequest(new { error = "Ресторан не найден" });

        if (!restaurant.AcceptingOrders)
        {
            var message = restaurant.PauseMessage ?? "Ресторан временно не принимает заказы";
            return BadRequest(new { error = message, code = "ORDERS_PAUSED" });
        }

        // Validate table exists in this restaurant
        var table = restaurant.Tables.FirstOrDefault(t => t.Number == request.TableNumber && t.IsActive);
        if (table == null)
            return BadRequest(new { error = $"Стол #{request.TableNumber} не найден в этом ресторане" });

        // Find or create active table session
        var session = await _context.TableSessions
            .FirstOrDefaultAsync(s => s.TableId == table.Id && s.Status == TableSessionStatus.Active);

        if (session == null)
        {
            session = new TableSession
            {
                Id = Guid.NewGuid(),
                TableId = table.Id,
                RestaurantId = restaurant.Id,
                TableNumber = table.Number,
                StartedAt = DateTime.UtcNow,
                Status = TableSessionStatus.Active,
                ServiceFeePercent = restaurant.ServiceFeePercent
            };
            _context.TableSessions.Add(session);
        }

        // Create order
        var order = new Order
        {
            UserId = userId,
            TableId = table.Id,
            TableNumber = table.Number,
            TableSessionId = session.Id,
            RestaurantId = restaurant.Id,
            OrderType = OrderType.DineIn,
            SpecialInstructions = request.SpecialInstructions,
            Status = OrderStatus.Pending,
            PaymentLink = restaurant.PaymentLink
        };

        decimal subtotal = 0;

        foreach (var itemRequest in request.Items)
        {
            var product = await _context.Products
                .Include(p => p.Sizes)
                .Include(p => p.Addons)
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Id == itemRequest.ProductId);

            if (product == null || !product.IsAvailable)
                return BadRequest(new { error = $"Продукт {itemRequest.ProductId} не найден или недоступен" });

            if (!IsCategoryAvailable(product.Category))
                return BadRequest(new { error = $"Категория {product.Category.Name} недоступна в это время" });

            decimal unitPrice = product.BasePrice;
            string? sizeName = null;

            if (itemRequest.SizeId.HasValue)
            {
                var size = product.Sizes.FirstOrDefault(s => s.Id == itemRequest.SizeId.Value);
                if (size != null)
                {
                    unitPrice += size.PriceModifier;
                    sizeName = size.Name;
                }
            }

            var selectedAddons = new List<string>();
            if (itemRequest.AddonIds != null)
            {
                foreach (var addonId in itemRequest.AddonIds)
                {
                    var addon = product.Addons.FirstOrDefault(a => a.Id == addonId);
                    if (addon != null)
                    {
                        unitPrice += addon.Price;
                        selectedAddons.Add(addon.Name);
                    }
                }
            }

            var itemTotal = unitPrice * itemRequest.Quantity;
            subtotal += itemTotal;

            order.Items.Add(new OrderItem
            {
                ProductId = product.Id,
                ProductName = product.Name,
                SizeName = sizeName,
                UnitPrice = unitPrice,
                Quantity = itemRequest.Quantity,
                TotalPrice = itemTotal,
                SelectedAddons = selectedAddons.Count > 0 ? JsonSerializer.Serialize(selectedAddons) : null,
                Status = OrderItemStatus.Active,
                CreatedAt = DateTime.UtcNow,
                Note = itemRequest.Note
            });
        }

        order.Subtotal = subtotal;
        order.Tax = 0; // Service fee calculated at session level
        order.Total = order.Subtotal;

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        // Recalculate session totals
        await RecalculateSessionTotals(session);

        // Reload with navigation properties
        order = await _context.Orders
            .Include(o => o.Items)
            .Include(o => o.Table)
                .ThenInclude(t => t.Restaurant)
            .FirstAsync(o => o.Id == order.Id);

        // Notify admins
        await _hubContext.Clients.Group("Admins").SendAsync("NewOrder", MapToDto(order));

        return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, MapToDto(order));
    }

    private static OrderDto MapToDto(Order order)
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

        // Calculate online payment availability from restaurant
        var restaurant = order.Table?.Restaurant ?? order.Restaurant;
        var onlinePaymentAvailable = restaurant != null && (
            !string.IsNullOrEmpty(restaurant.DcMerchantId) ||
            !string.IsNullOrEmpty(restaurant.PaymentLink)
        );

        return new OrderDto(
            order.Id,
            order.UserId,
            order.TableId,
            order.TableNumber,
            order.Table?.Name,
            tableTypeName,
            order.Table?.RestaurantId ?? order.RestaurantId,
            order.Table?.Restaurant?.Name ?? order.Restaurant?.Name,
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
                i.CancelReason,
                i.Note
            )).ToList(),
            hasPendingItems,
            order.PaymentLink,
            order.OrderType,
            order.DeliveryAddress,
            order.CustomerName,
            order.CustomerPhone,
            order.DeliveryFee,
            onlinePaymentAvailable
        );
    }
}
