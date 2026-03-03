namespace QrMenu.Api.DTOs;

public record CategoryDto(
    Guid Id,
    string Name,
    string Icon,
    int SortOrder,
    bool IsActive,
    Guid? ParentCategoryId,
    string? ParentCategoryName,
    TimeSpan? AvailableFrom = null,
    TimeSpan? AvailableTo = null,
    bool IsTemporarilyDisabled = false,
    bool IsCurrentlyAvailable = true, // Computed based on time
    List<CategoryDto>? SubCategories = null
);

public record CreateCategoryRequest(
    string Name,
    string Icon,
    int SortOrder,
    Guid? ParentCategoryId = null,
    TimeSpan? AvailableFrom = null,
    TimeSpan? AvailableTo = null
);

public record UpdateCategoryRequest(
    string Name,
    string Icon,
    int SortOrder,
    bool IsActive,
    Guid? ParentCategoryId = null,
    TimeSpan? AvailableFrom = null,
    TimeSpan? AvailableTo = null,
    bool IsTemporarilyDisabled = false
);

public record ToggleCategoryAvailabilityRequest(bool IsTemporarilyDisabled);

public record SetCategoryScheduleRequest(TimeSpan? AvailableFrom, TimeSpan? AvailableTo);
