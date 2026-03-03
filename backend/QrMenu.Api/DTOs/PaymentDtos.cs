namespace QrMenu.Api.DTOs;

public record CreatePaymentRequest(
    Guid OrderId,
    string ApproveUrl,
    string DeclineUrl,
    string CancelUrl
);

public record PaymentFormData(
    string FormUrl,         // URL формы оплаты
    string Provider,        // "dc"
    Dictionary<string, string> FormFields  // Универсальные поля формы
);

public record CashPaymentRequest(
    Guid OrderId
);

public record CashPaymentResponse(
    bool Success,
    string Message,
    Guid OrderId,
    int TableNumber,
    decimal Amount
);

public record PaymentStatusResponse(
    bool Success,
    int Status,
    string Message
);

public record UpdatePaymentStatusRequest(
    string PaymentId,
    int Status
);
