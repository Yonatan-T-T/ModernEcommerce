using LuminaBeauty.Domain.Common;
using LuminaBeauty.Domain.Enums;

namespace LuminaBeauty.Domain.Entities;

public class Coupon : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DiscountType DiscountType { get; set; } = DiscountType.Percentage;
    public decimal DiscountValue { get; set; } // e.g. 15 for 15% or $15
    public decimal MinimumSpend { get; set; } = 0;
    public decimal? MaxDiscountAmount { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public int? UsageLimit { get; set; }
    public int TimesUsed { get; set; } = 0;
    public bool IsActive { get; set; } = true;
}
