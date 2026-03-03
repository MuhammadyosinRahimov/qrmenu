namespace QrMenu.Core.Entities;

public class ProductAddon
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public bool IsAvailable { get; set; } = true;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
}
