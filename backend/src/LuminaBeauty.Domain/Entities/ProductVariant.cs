using LuminaBeauty.Domain.Common;

namespace LuminaBeauty.Domain.Entities;

public class ProductVariant : BaseEntity
{
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public string Sku { get; set; } = string.Empty;
    public string VariantName { get; set; } = string.Empty; // e.g. "50ml", "Shade 02 - Warm Ivory"
    public string? Size { get; set; }
    public string? Shade { get; set; }
    public string? ShadeColorHex { get; set; } // e.g. "#F4D8C6"
    public decimal Price { get; set; }
    public decimal CostPrice { get; set; }
    public decimal? WeightGrams { get; set; }
    public int StockQuantity { get; set; }
    public bool IsActive { get; set; } = true;
}
