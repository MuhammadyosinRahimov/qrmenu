using QrMenu.Core.Enums;

namespace QrMenu.Api.DTOs;

public record TableDto(
    Guid Id,
    int Number,
    string? Name,
    TableType Type,
    string TypeName,
    int Capacity,
    string QrCode,
    bool IsActive,
    DateTime CreatedAt,
    Guid RestaurantId,
    string RestaurantName,
    Guid? MenuId,
    string? MenuName
);

public record CreateTableRequest(
    int Number,
    string? Name,
    TableType Type,
    int Capacity,
    Guid RestaurantId,
    Guid? MenuId
);

public record UpdateTableRequest(
    int Number,
    string? Name,
    TableType Type,
    int Capacity,
    Guid? MenuId,
    bool IsActive
);

public record GenerateQrCodeRequest(
    Guid TableId,
    Guid MenuId,
    string? BaseUrl
);

public record QrCodeResponse(
    Guid TableId,
    int TableNumber,
    string? TableName,
    string QrCodeBase64,
    string QrCodeUrl
);

public record TableTypeDto(
    int Value,
    string Name
);

// Simple DTO for public API
public record PublicTableDto(
    Guid Id,
    int Number,
    string? Name,
    string QrCode,
    bool IsActive,
    Guid? MenuId,
    string? MenuName,
    Guid RestaurantId,
    string RestaurantName,
    string? RestaurantPhone,
    bool OnlinePaymentAvailable
);
