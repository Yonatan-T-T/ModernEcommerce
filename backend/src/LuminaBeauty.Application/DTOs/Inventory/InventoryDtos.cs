using LuminaBeauty.Domain.Enums;

namespace LuminaBeauty.Application.DTOs.Inventory;

public class InventoryItemDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductSku { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public decimal SellingPrice { get; set; }
    public decimal CostPrice { get; set; }
    public int CurrentStock { get; set; }
    public int LowStockThreshold { get; set; }
    public bool IsLowStock => CurrentStock <= LowStockThreshold;
    public decimal TotalCostValue => CostPrice * CurrentStock;
    public decimal TotalRetailValue => SellingPrice * CurrentStock;
    public decimal PotentialProfit => TotalRetailValue - TotalCostValue;
    public List<InventoryVariantItemDto> Variants { get; set; } = new();
}

public class InventoryVariantItemDto
{
    public int VariantId { get; set; }
    public string VariantName { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public int CurrentStock { get; set; }
    public decimal CostPrice { get; set; }
    public decimal Price { get; set; }
}

public class StockAdjustmentRequest
{
    public int ProductId { get; set; }
    public int? ProductVariantId { get; set; }
    public int QuantityChange { get; set; } // + positive to add, - negative to remove
    public InventoryTransactionType ReasonType { get; set; } = InventoryTransactionType.ManualAdjustment;
    public string Reason { get; set; } = string.Empty;
}

public class InventoryTransactionDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int? ProductVariantId { get; set; }
    public string? VariantName { get; set; }
    public InventoryTransactionType TransactionType { get; set; }
    public string TransactionTypeName => TransactionType.ToString();
    public int QuantityChange { get; set; }
    public int QuantityAfter { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string PerformedByName { get; set; } = string.Empty;
    public int? OrderId { get; set; }
    public DateTime CreatedAt { get; set; }
}
