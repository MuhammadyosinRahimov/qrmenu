using QrMenu.Core.Enums;

namespace QrMenu.Core.Entities;

public class Table
{
    public Guid Id { get; set; }
    public int Number { get; set; }
    public string? Name { get; set; }
    public TableType Type { get; set; } = TableType.Стандартный;
    public int Capacity { get; set; } = 4;
    public string QrCode { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Guid RestaurantId { get; set; }
    public Restaurant Restaurant { get; set; } = null!;

    public Guid? MenuId { get; set; }
    public Menu? Menu { get; set; }

    public ICollection<Order> Orders { get; set; } = new List<Order>();
}
