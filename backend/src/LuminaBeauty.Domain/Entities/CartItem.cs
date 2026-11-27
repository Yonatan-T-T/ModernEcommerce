using LuminaBeauty.Domain.Common;

namespace LuminaBeauty.Domain.Entities;

public class CartItem : BaseEntity
{
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public int? ProductVariantId { get; set; }
    public ProductVariant? ProductVariant { get; set; }

    public int Quantity { get; set; }
}
