using QrMenu.Core.Enums;

namespace QrMenu.Api.DTOs;

public record OrderDto(
    Guid Id,
    Guid UserId,
    Guid? TableId,  // Nullable for delivery/takeaway
    int TableNumber,
    string? TableName,
    string? TableTypeName,
    Guid? RestaurantId,
    string? RestaurantName,
    DateTime CreatedAt,
    OrderStatus Status,
    decimal Subtotal,
    decimal ServiceFee, // Renamed from Tax
    decimal Total,
    string? SpecialInstructions,
    List<OrderItemDto> Items,
    bool HasPendingItems = false,
    string? PaymentLink = null,
    OrderType OrderType = OrderType.DineIn,
    string? DeliveryAddress = null,
    string? CustomerName = null,
    string? CustomerPhone = null,
    decimal DeliveryFee = 0,
    bool OnlinePaymentAvailable = false
);

public record OrderItemDto(
    Guid Id,
    Guid ProductId,
    string ProductName,
    string? SizeName,
    decimal UnitPrice,
    int Quantity,
    decimal TotalPrice,
    List<string>? SelectedAddons,
    OrderItemStatus Status = OrderItemStatus.Active,
    DateTime? CreatedAt = null,
    string? CancelReason = null,
    string? Note = null
);

public record CreateOrderRequest(
    Guid TableId,
    string? SpecialInstructions,
    List<CreateOrderItemRequest> Items
);

public record CreateOrderItemRequest(
    Guid ProductId,
    Guid? SizeId,
    int Quantity,
    List<Guid>? AddonIds,
    string? Note = null
);

public record UpdateOrderStatusRequest(OrderStatus Status);

// Новые DTOs для добавления блюд и отмены
public record AddItemsToOrderRequest(List<CreateOrderItemRequest> Items);

public record CancelOrderItemRequest(string? Reason);

public record RecalculateOrderResponse(
    decimal Subtotal,
    decimal ServiceFee,
    decimal Total
);

// DTOs для новых режимов заказа

public record CreateDeliveryOrderDto(
    Guid RestaurantId,
    List<CreateOrderItemRequest> Items,
    string DeliveryAddress,
    string CustomerName,
    string CustomerPhone,
    string? SpecialInstructions = null
);

public record CreateTakeawayOrderDto(
    Guid RestaurantId,
    List<CreateOrderItemRequest> Items,
    string CustomerName,
    string CustomerPhone,
    string? SpecialInstructions = null
);

public record CreateDineInOrderDto(
    Guid RestaurantId,
    int TableNumber,
    List<CreateOrderItemRequest> Items,
    string? SpecialInstructions = null
);

public record PublicRestaurantDto(
    Guid Id,
    string Name,
    string? Description,
    string? Address,
    string? Phone,
    string? LogoUrl,
    bool DeliveryEnabled,
    decimal DeliveryFee,
    bool TakeawayEnabled,
    bool OnlinePaymentAvailable
);

public record RestaurantMenuDto(
    Guid RestaurantId,
    string RestaurantName,
    List<PublicMenuCategoryDto> Categories
);

public record PublicMenuCategoryDto(
    Guid Id,
    string Name,
    string? Icon,
    int SortOrder,
    List<MenuProductDto> Products
);

public record MenuProductDto(
    Guid Id,
    string Name,
    string? Description,
    decimal BasePrice,
    string? ImageUrl,
    bool IsAvailable,
    List<ProductSizeDto> Sizes,
    List<ProductAddonDto> Addons
);
