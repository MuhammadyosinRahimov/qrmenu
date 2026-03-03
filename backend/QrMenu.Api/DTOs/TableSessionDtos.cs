using QrMenu.Core.Enums;

namespace QrMenu.Api.DTOs;

// DTO for table session
public record TableSessionDto(
    Guid Id,
    Guid TableId,
    int TableNumber,
    string? TableName,
    Guid RestaurantId,
    string? RestaurantName,
    DateTime StartedAt,
    DateTime? ClosedAt,
    TableSessionStatus Status,
    decimal SessionSubtotal,        // Сумма всех заказов (без service fee)
    decimal SessionServiceFee,      // Service fee на весь стол
    decimal SessionTotal,           // SessionSubtotal + SessionServiceFee
    decimal ServiceFeePercent,      // Процент service fee
    decimal PaidAmount,
    decimal UnpaidAmount,
    int OrderCount,
    int GuestCount,
    List<SessionOrderDto> Orders
);

// Simplified order DTO for session view
public record SessionOrderDto(
    Guid Id,
    Guid UserId,
    string? GuestPhone,
    DateTime CreatedAt,
    OrderStatus Status,
    decimal Subtotal,           // Сумма без service fee
    decimal ServiceFeeShare,    // Доля service fee
    decimal Total,              // Subtotal + ServiceFeeShare
    bool IsPaid,
    DateTime? PaidAt,           // Время оплаты
    DateTime? CompletedAt,      // Время завершения заказа
    bool HasPendingItems,       // Есть ли новые блюда
    string? PaymentMethod,      // "cash" или "online"
    bool WantsCashPayment,      // true если хочет наличными и не оплачено
    List<OrderItemDto> Items,
    // Поля для delivery/takeaway
    OrderType? OrderType,
    string? DeliveryAddress,
    string? CustomerName,
    string? CustomerPhone,
    decimal? DeliveryFee
);

// DTO for guest session info (minimal info for guests)
public record GuestSessionInfoDto(
    Guid SessionId,
    int GuestCount,
    decimal MyOrderSubtotal,        // Сумма моих заказов (без service fee)
    decimal MyServiceFeeShare,      // Моя доля service fee
    decimal MyTotal,                // MyOrderSubtotal + MyServiceFeeShare
    decimal TableSubtotal,          // Сумма всех заказов
    decimal TableServiceFee,        // Service fee на весь стол
    decimal TableTotal,             // TableSubtotal + TableServiceFee
    decimal TablePaidAmount,
    decimal TableUnpaidAmount,
    decimal ServiceFeePercent,      // Процент (для отображения "10%")
    bool MyOrderIsPaid,
    bool CanPayForTable,
    List<GuestOrderSummary> MyOrders,
    List<GuestOrderSummary> OtherOrders
);

// Summary of an order for guest view
public record GuestOrderSummary(
    Guid OrderId,
    decimal Subtotal,           // Сумма без service fee
    decimal ServiceFeeShare,    // Доля service fee
    decimal Total,              // Subtotal + ServiceFeeShare
    bool IsPaid,
    int ItemCount,
    string ItemsPreview // "Пицца, Кола, +2"
);

// Request to pay for entire table
public record PayForTableRequest(
    string PaymentMethod // "cash" or "online"
);

// Response after paying for table
public record PayForTableResponse(
    bool Success,
    string Message,
    decimal TotalPaid,
    int OrdersPaid,
    string? PaymentLink = null
);

// Request to close session
public record CloseSessionRequest(
    string? Reason = null
);

// Request to mark session as paid
public record MarkSessionPaidRequest(
    string? Note = null
);
