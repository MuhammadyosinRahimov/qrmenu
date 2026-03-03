namespace QrMenu.Api.DTOs;

public record MenuDto(
    Guid Id,
    string Name,
    string? Description,
    bool IsActive,
    DateTime CreatedAt,
    Guid RestaurantId,
    string RestaurantName,
    List<MenuCategoryDto> Categories
);

public record MenuCategoryDto(
    Guid Id,
    Guid CategoryId,
    string CategoryName,
    string? CategoryIcon,
    int SortOrder,
    int ProductCount
);

public record CreateMenuRequest(
    string Name,
    string? Description,
    Guid RestaurantId,
    List<Guid>? CategoryIds
);

public record UpdateMenuRequest(
    string Name,
    string? Description,
    bool IsActive,
    List<Guid>? CategoryIds
);

public record AddCategoryToMenuRequest(
    Guid CategoryId,
    int SortOrder
);
