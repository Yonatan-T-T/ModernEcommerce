using LuminaBeauty.Domain.Enums;

namespace LuminaBeauty.Application.DTOs.Orders;

public class CreateOrderRequest
{
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;

    public CheckoutAddressDto ShippingAddress { get; set; } = null!;
    public string PaymentMethod { get; set; } = "CreditCard";
    public string? CouponCode { get; set; }
    public string? Notes { get; set; }

    public List<CreateOrderItemDto> Items { get; set; } = new();
}

public class CreateOrderItemDto
{
    public int ProductId { get; set; }
    public int? ProductVariantId { get; set; }
    public int Quantity { get; set; }
}

public class CheckoutAddressDto
{
    public string FullName { get; set; } = string.Empty;
    public string StreetAddress { get; set; } = string.Empty;
    public string? Apartment { get; set; }
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public string Country { get; set; } = "United States";
    public string? PhoneNumber { get; set; }
}

public class OrderDto
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public int? UserId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;

    public string ShippingAddressJson { get; set; } = string.Empty;
    public CheckoutAddressDto? ShippingAddress { get; set; }

    public OrderStatus Status { get; set; }
    public string StatusName => Status.ToString();

    public PaymentStatus PaymentStatus { get; set; }
    public string PaymentStatusName => PaymentStatus.ToString();

    public string PaymentMethod { get; set; } = string.Empty;

    public decimal SubTotal { get; set; }
    public decimal DiscountAmount { get; set; }
    public string? CouponCode { get; set; }
    public decimal ShippingFee { get; set; }
    public decimal TotalAmount { get; set; }

    public decimal TotalCost { get; set; }
    public decimal NetProfit { get; set; }
    public decimal ProfitMargin => TotalAmount > 0 ? Math.Round((NetProfit / TotalAmount) * 100, 2) : 0;

    public string? Notes { get; set; }
    public string? TrackingNumber { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ShippedAt { get; set; }
    public DateTime? DeliveredAt { get; set; }

    public List<OrderItemDto> Items { get; set; } = new();
}

public class OrderItemDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public int? ProductVariantId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? VariantName { get; set; }
    public string? ProductImageUrl { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal UnitCost { get; set; }
    public int Quantity { get; set; }
    public decimal SubTotal => UnitPrice * Quantity;
    public decimal Profit => (UnitPrice - UnitCost) * Quantity;
}

public class UpdateOrderStatusRequest
{
    public OrderStatus Status { get; set; }
    public string? TrackingNumber { get; set; }
    public PaymentStatus? PaymentStatus { get; set; }
    public string? Notes { get; set; }
}
