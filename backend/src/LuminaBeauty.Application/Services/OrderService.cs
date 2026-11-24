using Microsoft.EntityFrameworkCore;
using LuminaBeauty.Application.Common;
using LuminaBeauty.Application.Common.Interfaces;
using LuminaBeauty.Application.DTOs.Orders;
using LuminaBeauty.Domain.Entities;
using LuminaBeauty.Domain.Enums;
using System.Text.Json;

namespace LuminaBeauty.Application.Services;

public interface IOrderService
{
    Task<Result<OrderDto>> CreateOrderAsync(CreateOrderRequest request, int? userId = null);
    Task<PagedResult<OrderDto>> GetOrdersAsync(int pageIndex = 1, int pageSize = 10, OrderStatus? status = null);
    Task<List<OrderDto>> GetUserOrdersAsync(int userId);
    Task<Result<OrderDto>> GetOrderByIdAsync(int orderId);
    Task<Result<OrderDto>> GetOrderByNumberAsync(string orderNumber);
    Task<Result<OrderDto>> UpdateOrderStatusAsync(int orderId, UpdateOrderStatusRequest request);
}

public class OrderService : IOrderService
{
    private readonly IApplicationDbContext _context;

    public OrderService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<OrderDto>> CreateOrderAsync(CreateOrderRequest request, int? userId = null)
    {
        if (request.Items == null || request.Items.Count == 0)
        {
            return Result<OrderDto>.Failure("An order must contain at least one item.");
        }

        // Prevent overselling & check stock
        var orderItems = new List<OrderItem>();
        decimal subTotal = 0;
        decimal totalCost = 0;

        foreach (var item in request.Items)
        {
            var product = await _context.Products
                .Include(p => p.Images)
                .Include(p => p.Variants)
                .FirstOrDefaultAsync(p => p.Id == item.ProductId);

            if (product == null)
            {
                return Result<OrderDto>.Failure($"Product with ID {item.ProductId} was not found.");
            }

            if (!product.IsActive)
            {
                return Result<OrderDto>.Failure($"Product '{product.Name}' is no longer available.");
            }

            decimal unitPrice = product.Price;
            decimal unitCost = product.CostPrice;
            string? variantName = null;
            ProductVariant? variant = null;

            if (item.ProductVariantId.HasValue && item.ProductVariantId.Value > 0)
            {
                variant = product.Variants.FirstOrDefault(v => v.Id == item.ProductVariantId.Value);
                if (variant == null)
                {
                    return Result<OrderDto>.Failure($"Selected variant for '{product.Name}' does not exist.");
                }

                if (variant.StockQuantity < item.Quantity)
                {
                    return Result<OrderDto>.Failure($"Insufficient stock for '{product.Name}' ({variant.VariantName}). Available: {variant.StockQuantity}, Requested: {item.Quantity}.");
                }

                unitPrice = variant.Price;
                unitCost = variant.CostPrice;
                variantName = variant.VariantName;

                // Deduct stock from variant
                variant.StockQuantity -= item.Quantity;
            }
            else
            {
                if (product.StockQuantity < item.Quantity)
                {
                    return Result<OrderDto>.Failure($"Insufficient stock for '{product.Name}'. Available: {product.StockQuantity}, Requested: {item.Quantity}.");
                }

                // Deduct stock from product
                product.StockQuantity -= item.Quantity;
            }

            subTotal += unitPrice * item.Quantity;
            totalCost += unitCost * item.Quantity;

            var primaryImg = product.Images.FirstOrDefault(i => i.IsPrimary)?.ImageUrl 
                             ?? product.Images.FirstOrDefault()?.ImageUrl;

            orderItems.Add(new OrderItem
            {
                ProductId = product.Id,
                ProductVariantId = item.ProductVariantId,
                ProductName = product.Name,
                VariantName = variantName,
                ProductImageUrl = primaryImg,
                UnitPrice = unitPrice,
                UnitCost = unitCost,
                Quantity = item.Quantity
            });
        }

        // Apply coupon discount if provided
        decimal discountAmount = 0;
        if (!string.IsNullOrWhiteSpace(request.CouponCode))
        {
            var coupon = await _context.Coupons
                .FirstOrDefaultAsync(c => c.Code.ToUpper() == request.CouponCode.Trim().ToUpper() && c.IsActive);

            if (coupon != null && (coupon.ExpiryDate == null || coupon.ExpiryDate >= DateTime.UtcNow))
            {
                if (subTotal >= coupon.MinimumSpend)
                {
                    if (coupon.DiscountType == DiscountType.Percentage)
                    {
                        discountAmount = Math.Round(subTotal * (coupon.DiscountValue / 100m), 2);
                        if (coupon.MaxDiscountAmount.HasValue && discountAmount > coupon.MaxDiscountAmount.Value)
                        {
                            discountAmount = coupon.MaxDiscountAmount.Value;
                        }
                    }
                    else
                    {
                        discountAmount = Math.Min(coupon.DiscountValue, subTotal);
                    }

                    coupon.TimesUsed += 1;
                }
            }
        }

        decimal shippingFee = subTotal >= 75m ? 0m : 7.99m; // Free shipping over $75
        decimal totalAmount = Math.Max(0, subTotal - discountAmount) + shippingFee;
        decimal netProfit = (subTotal - discountAmount) - totalCost;

        var orderNumber = $"LB-{DateTime.UtcNow:yyyyMMdd}-{new Random().Next(1000, 9999)}";

        var order = new Order
        {
            OrderNumber = orderNumber,
            UserId = userId,
            CustomerName = request.CustomerName.Trim(),
            CustomerEmail = request.CustomerEmail.Trim().ToLowerInvariant(),
            CustomerPhone = request.CustomerPhone.Trim(),
            ShippingAddressJson = JsonSerializer.Serialize(request.ShippingAddress),
            Status = OrderStatus.Processing,
            PaymentStatus = PaymentStatus.Paid, // Simulated instant payment
            PaymentMethod = request.PaymentMethod,
            SubTotal = subTotal,
            DiscountAmount = discountAmount,
            CouponCode = request.CouponCode?.Trim().ToUpperInvariant(),
            ShippingFee = shippingFee,
            TotalAmount = totalAmount,
            TotalCost = totalCost,
            NetProfit = netProfit,
            Notes = request.Notes,
            CreatedAt = DateTime.UtcNow,
            Items = orderItems
        };

        _context.Orders.Add(order);

        // Record Inventory Transactions audit trail
        foreach (var item in orderItems)
        {
            int qtyAfter = 0;
            if (item.ProductVariantId.HasValue)
            {
                var v = await _context.ProductVariants.FindAsync(item.ProductVariantId.Value);
                qtyAfter = v?.StockQuantity ?? 0;
            }
            else
            {
                var p = await _context.Products.FindAsync(item.ProductId);
                qtyAfter = p?.StockQuantity ?? 0;
            }

            order.InventoryTransactions.Add(new InventoryTransaction
            {
                ProductId = item.ProductId,
                ProductVariantId = item.ProductVariantId,
                TransactionType = InventoryTransactionType.OrderPlacement,
                QuantityChange = -item.Quantity,
                QuantityAfter = qtyAfter,
                Reason = $"Order #{orderNumber} placed",
                PerformedByName = request.CustomerName,
                CreatedAt = DateTime.UtcNow
            });
        }

        await _context.SaveChangesAsync();

        return await GetOrderByIdAsync(order.Id);
    }

    public async Task<PagedResult<OrderDto>> GetOrdersAsync(int pageIndex = 1, int pageSize = 10, OrderStatus? status = null)
    {
        var query = _context.Orders
            .Include(o => o.Items)
            .AsNoTracking()
            .AsQueryable();

        if (status.HasValue)
        {
            query = query.Where(o => o.Status == status.Value);
        }

        var totalCount = await query.CountAsync();
        var orders = await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var dtos = orders.Select(MapToDto).ToList();
        return new PagedResult<OrderDto>(dtos, totalCount, pageIndex, pageSize);
    }

    public async Task<List<OrderDto>> GetUserOrdersAsync(int userId)
    {
        var orders = await _context.Orders
            .Include(o => o.Items)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        return orders.Select(MapToDto).ToList();
    }

    public async Task<Result<OrderDto>> GetOrderByIdAsync(int orderId)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId);

        if (order == null)
            return Result<OrderDto>.Failure("Order not found.");

        return Result<OrderDto>.Success(MapToDto(order));
    }

    public async Task<Result<OrderDto>> GetOrderByNumberAsync(string orderNumber)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.OrderNumber.ToLower() == orderNumber.Trim().ToLower());

        if (order == null)
            return Result<OrderDto>.Failure($"Order '{orderNumber}' was not found.");

        return Result<OrderDto>.Success(MapToDto(order));
    }

    public async Task<Result<OrderDto>> UpdateOrderStatusAsync(int orderId, UpdateOrderStatusRequest request)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId);

        if (order == null)
            return Result<OrderDto>.Failure("Order not found.");

        // If order is cancelled, return stock to inventory
        if (order.Status != OrderStatus.Cancelled && request.Status == OrderStatus.Cancelled)
        {
            foreach (var item in order.Items)
            {
                if (item.ProductVariantId.HasValue)
                {
                    var variant = await _context.ProductVariants.FindAsync(item.ProductVariantId.Value);
                    if (variant != null)
                    {
                        variant.StockQuantity += item.Quantity;
                        _context.InventoryTransactions.Add(new InventoryTransaction
                        {
                            ProductId = item.ProductId,
                            ProductVariantId = item.ProductVariantId,
                            TransactionType = InventoryTransactionType.ReturnRestock,
                            QuantityChange = item.Quantity,
                            QuantityAfter = variant.StockQuantity,
                            Reason = $"Order #{order.OrderNumber} cancelled",
                            PerformedByName = "Admin",
                            OrderId = order.Id,
                            CreatedAt = DateTime.UtcNow
                        });
                    }
                }
                else
                {
                    var product = await _context.Products.FindAsync(item.ProductId);
                    if (product != null)
                    {
                        product.StockQuantity += item.Quantity;
                        _context.InventoryTransactions.Add(new InventoryTransaction
                        {
                            ProductId = item.ProductId,
                            TransactionType = InventoryTransactionType.ReturnRestock,
                            QuantityChange = item.Quantity,
                            QuantityAfter = product.StockQuantity,
                            Reason = $"Order #{order.OrderNumber} cancelled",
                            PerformedByName = "Admin",
                            OrderId = order.Id,
                            CreatedAt = DateTime.UtcNow
                        });
                    }
                }
            }
        }

        order.Status = request.Status;
        if (request.PaymentStatus.HasValue)
            order.PaymentStatus = request.PaymentStatus.Value;

        if (!string.IsNullOrEmpty(request.TrackingNumber))
            order.TrackingNumber = request.TrackingNumber;

        if (request.Status == OrderStatus.Shipped && order.ShippedAt == null)
            order.ShippedAt = DateTime.UtcNow;

        if (request.Status == OrderStatus.Delivered && order.DeliveredAt == null)
            order.DeliveredAt = DateTime.UtcNow;

        if (!string.IsNullOrEmpty(request.Notes))
            order.Notes = request.Notes;

        order.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Result<OrderDto>.Success(MapToDto(order), "Order updated successfully");
    }

    private static OrderDto MapToDto(Order o)
    {
        CheckoutAddressDto? address = null;
        try
        {
            if (!string.IsNullOrEmpty(o.ShippingAddressJson))
            {
                address = JsonSerializer.Deserialize<CheckoutAddressDto>(o.ShippingAddressJson);
            }
        }
        catch { }

        return new OrderDto
        {
            Id = o.Id,
            OrderNumber = o.OrderNumber,
            UserId = o.UserId,
            CustomerName = o.CustomerName,
            CustomerEmail = o.CustomerEmail,
            CustomerPhone = o.CustomerPhone,
            ShippingAddressJson = o.ShippingAddressJson,
            ShippingAddress = address,
            Status = o.Status,
            PaymentStatus = o.PaymentStatus,
            PaymentMethod = o.PaymentMethod,
            SubTotal = o.SubTotal,
            DiscountAmount = o.DiscountAmount,
            CouponCode = o.CouponCode,
            ShippingFee = o.ShippingFee,
            TotalAmount = o.TotalAmount,
            TotalCost = o.TotalCost,
            NetProfit = o.NetProfit,
            Notes = o.Notes,
            TrackingNumber = o.TrackingNumber,
            CreatedAt = o.CreatedAt,
            ShippedAt = o.ShippedAt,
            DeliveredAt = o.DeliveredAt,
            Items = o.Items.Select(i => new OrderItemDto
            {
                Id = i.Id,
                ProductId = i.ProductId,
                ProductVariantId = i.ProductVariantId,
                ProductName = i.ProductName,
                VariantName = i.VariantName,
                ProductImageUrl = i.ProductImageUrl,
                UnitPrice = i.UnitPrice,
                UnitCost = i.UnitCost,
                Quantity = i.Quantity
            }).ToList()
        };
    }
}
