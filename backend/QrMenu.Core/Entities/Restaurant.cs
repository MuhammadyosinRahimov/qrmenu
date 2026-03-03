namespace QrMenu.Core.Entities;

public class Restaurant
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? LogoUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public bool AcceptingOrders { get; set; } = true; // Принимает ли заказы
    public string? PauseMessage { get; set; } // Сообщение при паузе заказов
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // DC Payment credentials
    public string? DcMerchantId { get; set; }   // Код мерчанта DC
    public string? DcSecretKey { get; set; }    // Секретный ключ DC
    public string? DcArticul { get; set; }      // Артикул услуги (по умолчанию "30")

    // Payment link (DC, ExpressPay etc.) with {amount} placeholder
    public string? PaymentLink { get; set; }    // Например: http://pay.expresspay.tj/?A=9762000087892609&s={amount}&c=&f1=133

    // Service fee settings
    public decimal ServiceFeePercent { get; set; } = 10m; // По умолчанию 10%

    // Delivery settings
    public bool DeliveryEnabled { get; set; } = false;
    public decimal DeliveryFee { get; set; } = 0m;

    // Takeaway settings
    public bool TakeawayEnabled { get; set; } = false;

    public ICollection<Menu> Menus { get; set; } = new List<Menu>();
    public ICollection<Table> Tables { get; set; } = new List<Table>();
    public ICollection<RestaurantAdmin> RestaurantAdmins { get; set; } = new List<RestaurantAdmin>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}
