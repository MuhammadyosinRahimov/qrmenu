namespace QrMenu.Api.DTOs;

public record RestaurantDto(
    Guid Id,
    string Name,
    string? Description,
    string? Address,
    string? Phone,
    string? LogoUrl,
    bool IsActive,
    bool AcceptingOrders,
    string? PauseMessage,
    DateTime CreatedAt,
    int MenuCount,
    int TableCount,
    // DC Payment fields
    string? DcMerchantId,
    string? DcSecretKey,
    string? DcArticul,
    bool OnlinePaymentAvailable,
    // Payment link
    string? PaymentLink,
    // Service fee
    decimal ServiceFeePercent,
    // Delivery/Takeaway settings
    bool DeliveryEnabled,
    decimal DeliveryFee,
    bool TakeawayEnabled
);

public record CreateRestaurantRequest(
    string Name,
    string? Description,
    string? Address,
    string? Phone,
    string? LogoUrl,
    string? AdminEmail,      // Email администратора
    string? AdminPassword,   // Пароль администратора
    string? AdminName        // Имя администратора
);

public record UpdateRestaurantRequest(
    string Name,
    string? Description,
    string? Address,
    string? Phone,
    string? LogoUrl,
    bool IsActive,
    // DC Payment fields
    string? DcMerchantId,
    string? DcSecretKey,
    string? DcArticul,
    // Payment link
    string? PaymentLink,
    // Service fee
    decimal? ServiceFeePercent,
    // Delivery/Takeaway settings
    bool DeliveryEnabled,
    decimal DeliveryFee,
    bool TakeawayEnabled
);

public record ToggleOrdersRequest(bool AcceptingOrders, string? PauseMessage = null);

public record RestaurantStatusDto(bool AcceptingOrders, string? PauseMessage);
