using QrMenu.Core.Enums;

namespace QrMenu.Core.Entities;

public class Order
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid? TableId { get; set; }  // Nullable для доставки/самовывоза
    public int TableNumber { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public decimal Subtotal { get; set; }
    public decimal Tax { get; set; }
    public decimal Total { get; set; }
    public string? SpecialInstructions { get; set; }

    // Order type (DineIn, Delivery, Takeaway)
    public OrderType OrderType { get; set; } = OrderType.DineIn;

    // Delivery fields
    public string? DeliveryAddress { get; set; }
    public decimal DeliveryFee { get; set; } = 0;

    // Customer fields (for Delivery/Takeaway)
    public string? CustomerName { get; set; }
    public string? CustomerPhone { get; set; }

    // Restaurant (for orders without table)
    public Guid? RestaurantId { get; set; }
    public Restaurant? Restaurant { get; set; }

    // Payment fields
    public string PaymentMethod { get; set; } = "cash";  // "cash" или "online"
    public bool IsPaid { get; set; } = false;
    public string? PaymentId { get; set; }               // DC OrderId
    public int? PaymentStatus { get; set; }              // DC WithdrawalStatus
    public DateTime? PaidAt { get; set; }
    public string? PaymentLink { get; set; }             // Копия ссылки из ресторана
    public DateTime? CompletedAt { get; set; }           // Время завершения заказа

    // Table session
    public Guid? TableSessionId { get; set; }
    public TableSession? TableSession { get; set; }

    public User User { get; set; } = null!;
    public Table? Table { get; set; }  // Nullable для доставки/самовывоза
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}
