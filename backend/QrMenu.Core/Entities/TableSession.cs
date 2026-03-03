using QrMenu.Core.Enums;

namespace QrMenu.Core.Entities;

public class TableSession
{
    public Guid Id { get; set; }
    public Guid TableId { get; set; }
    public Guid RestaurantId { get; set; }
    public int TableNumber { get; set; }
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ClosedAt { get; set; }
    public TableSessionStatus Status { get; set; } = TableSessionStatus.Active;

    // Service fee (копируется из ресторана при создании сессии)
    public decimal ServiceFeePercent { get; set; }     // Процент обслуживания
    public decimal SessionSubtotal { get; set; }       // Сумма всех заказов (без service fee)
    public decimal SessionServiceFee { get; set; }     // Рассчитанный service fee
    public decimal SessionTotal { get; set; }          // SessionSubtotal + SessionServiceFee

    // Navigation properties
    public Table Table { get; set; } = null!;
    public Restaurant Restaurant { get; set; } = null!;
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}
