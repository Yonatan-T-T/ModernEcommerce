using LuminaBeauty.Domain.Common;

namespace LuminaBeauty.Domain.Entities;

public class ProductImage : BaseEntity
{
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public string ImageUrl { get; set; } = string.Empty;
    public string? AltText { get; set; }
    public bool IsPrimary { get; set; }
    public int DisplayOrder { get; set; }
}
