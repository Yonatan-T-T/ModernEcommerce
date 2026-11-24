using LuminaBeauty.Domain.Common;

namespace LuminaBeauty.Domain.Entities;

public class OrderItem : BaseEntity
{
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public int? ProductVariantId { get; set; }
    public ProductVariant? ProductVariant { get; set; }

    public string ProductName { get; set; } = string.Empty;
    public string? VariantName { get; set; }
    public string? ProductImageUrl { get; set; }

    public decimal UnitPrice { get; set; }
    public decimal UnitCost { get; set; }
    public int Quantity { get; set; }

    public decimal SubTotal => UnitPrice * Quantity;
    public decimal TotalCost => UnitCost * Quantity;
    public decimal Profit => SubTotal - TotalCost;
}
