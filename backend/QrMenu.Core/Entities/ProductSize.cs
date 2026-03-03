namespace QrMenu.Core.Entities;

public class ProductSize
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal PriceModifier { get; set; }
    public bool IsDefault { get; set; }

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
}
