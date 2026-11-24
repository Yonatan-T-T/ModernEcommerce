using LuminaBeauty.Domain.Common;
using LuminaBeauty.Domain.Enums;

namespace LuminaBeauty.Domain.Entities;

public class InventoryTransaction : BaseEntity
{
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public int? ProductVariantId { get; set; }
    public ProductVariant? ProductVariant { get; set; }

    public InventoryTransactionType TransactionType { get; set; }
    public int QuantityChange { get; set; } // Negative for sale, positive for restock/returns
    public int QuantityAfter { get; set; }
    public string Reason { get; set; } = string.Empty;

    public int? PerformedByUserId { get; set; }
    public string PerformedByName { get; set; } = "System";

    public int? OrderId { get; set; }
    public Order? Order { get; set; }
}
