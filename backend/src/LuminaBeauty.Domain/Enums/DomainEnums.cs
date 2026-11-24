namespace LuminaBeauty.Domain.Enums;

public enum OrderStatus
{
    Pending = 0,
    Processing = 1,
    Shipped = 2,
    Delivered = 3,
    Cancelled = 4
}

public enum PaymentStatus
{
    Pending = 0,
    Paid = 1,
    Failed = 2,
    Refunded = 3
}

public enum InventoryTransactionType
{
    OrderPlacement = 0,
    Restock = 1,
    ManualAdjustment = 2,
    DamageCorrection = 3,
    ReturnRestock = 4
}

public enum DiscountType
{
    Percentage = 0,
    FixedAmount = 1
}

public enum SkinType
{
    All = 0,
    Dry = 1,
    Oily = 2,
    Combination = 3,
    Sensitive = 4,
    Normal = 5
}
