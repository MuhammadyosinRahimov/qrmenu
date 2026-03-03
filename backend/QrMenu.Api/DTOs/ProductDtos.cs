namespace QrMenu.Api.DTOs;

public record ProductDto(
    Guid Id,
    string Name,
    string Description,
    decimal BasePrice,
    string ImageUrl,
    decimal Rating,
    int Calories,
    int PrepTimeMinutes,
    bool IsAvailable,
    Guid CategoryId,
    string? CategoryName,
    Guid? MenuId,
    string? MenuName
);

public record ProductDetailDto(
    Guid Id,
    string Name,
    string Description,
    decimal BasePrice,
    string ImageUrl,
    decimal Rating,
    int Calories,
    int PrepTimeMinutes,
    bool IsAvailable,
    Guid CategoryId,
    List<ProductSizeDto> Sizes,
    List<ProductAddonDto> Addons
);

public record ProductSizeDto(Guid Id, string Name, decimal PriceModifier, bool IsDefault);
public record ProductAddonDto(Guid Id, string Name, decimal Price, bool IsAvailable);

public record CreateProductRequest(
    string Name,
    string Description,
    decimal BasePrice,
    string? ImageUrl,
    int Calories,
    int PrepTimeMinutes,
    Guid CategoryId,
    Guid? MenuId
);

public record UpdateProductRequest(
    string Name,
    string Description,
    decimal BasePrice,
    string? ImageUrl,
    int Calories,
    int PrepTimeMinutes,
    bool IsAvailable,
    Guid CategoryId,
    Guid? MenuId
);

public record CreateProductSizeRequest(string Name, decimal PriceModifier, bool IsDefault);
public record CreateProductAddonRequest(string Name, decimal Price);
