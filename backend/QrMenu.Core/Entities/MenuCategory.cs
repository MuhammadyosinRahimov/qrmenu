namespace QrMenu.Core.Entities;

public class MenuCategory
{
    public Guid Id { get; set; }
    public Guid MenuId { get; set; }
    public Menu Menu { get; set; } = null!;
    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public int SortOrder { get; set; }
}
