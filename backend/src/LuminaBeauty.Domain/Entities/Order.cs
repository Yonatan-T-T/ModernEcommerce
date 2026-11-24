using LuminaBeauty.Domain.Common;
using LuminaBeauty.Domain.Enums;

namespace LuminaBeauty.Domain.Entities;

public class Order : BaseEntity
{
    public string OrderNumber { get; set; } = string.Empty; // e.g. "LB-20241121-8849"
    public int? UserId { get; set; }
    public User? User { get; set; }

    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;

    public string ShippingAddressJson { get; set; } = string.Empty;

    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;
    public string PaymentMethod { get; set; } = "CreditCard"; // "CreditCard", "PayPal", "ApplePay", "CashOnDelivery"

    public decimal SubTotal { get; set; }
    public decimal DiscountAmount { get; set; }
    public string? CouponCode { get; set; }
    public decimal ShippingFee { get; set; }
    public decimal TotalAmount { get; set; }
    
    // Profit Tracking
    public decimal TotalCost { get; set; }
    public decimal NetProfit { get; set; }

    public string? Notes { get; set; }
    public string? TrackingNumber { get; set; }
    public DateTime? ShippedAt { get; set; }
    public DateTime? DeliveredAt { get; set; }

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    public ICollection<InventoryTransaction> InventoryTransactions { get; set; } = new List<InventoryTransaction>();
}
