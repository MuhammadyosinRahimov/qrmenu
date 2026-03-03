namespace QrMenu.Core.Entities;

public class Category
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Временные ограничения (например, завтрак до 11:00)
    public TimeSpan? AvailableFrom { get; set; } // Время начала доступности
    public TimeSpan? AvailableTo { get; set; } // Время конца доступности
    public bool IsTemporarilyDisabled { get; set; } = false; // Ручное временное отключение

    // Parent-child relationship for subcategories
    public Guid? ParentCategoryId { get; set; }
    public Category? ParentCategory { get; set; }
    public ICollection<Category> SubCategories { get; set; } = new List<Category>();

    public ICollection<Product> Products { get; set; } = new List<Product>();
}
