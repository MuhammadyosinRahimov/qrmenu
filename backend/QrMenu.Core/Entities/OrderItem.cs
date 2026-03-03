using QrMenu.Core.Enums;

namespace QrMenu.Core.Entities;

public class OrderItem
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? SizeName { get; set; }
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal TotalPrice { get; set; }
    public string? SelectedAddons { get; set; } // JSON array of addon names
    public OrderItemStatus Status { get; set; } = OrderItemStatus.Active; // Статус позиции
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // Время добавления
    public string? CancelReason { get; set; } // Причина отмены
    public string? Note { get; set; } // Комментарий к блюду

    public Order Order { get; set; } = null!;
    public Product Product { get; set; } = null!;
}
