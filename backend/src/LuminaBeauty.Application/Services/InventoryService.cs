using Microsoft.EntityFrameworkCore;
using LuminaBeauty.Application.Common;
using LuminaBeauty.Application.Common.Interfaces;
using LuminaBeauty.Application.DTOs.Inventory;
using LuminaBeauty.Domain.Entities;

namespace LuminaBeauty.Application.Services;

public interface IInventoryService
{
    Task<List<InventoryItemDto>> GetInventoryOverviewAsync();
    Task<List<InventoryItemDto>> GetLowStockItemsAsync();
    Task<Result<bool>> AdjustStockAsync(StockAdjustmentRequest request, string performedByName = "Admin");
    Task<PagedResult<InventoryTransactionDto>> GetTransactionsAsync(int pageIndex = 1, int pageSize = 20, int? productId = null);
}

public class InventoryService : IInventoryService
{
    private readonly IApplicationDbContext _context;

    public InventoryService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<InventoryItemDto>> GetInventoryOverviewAsync()
    {
        var products = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Include(p => p.Variants)
            .AsNoTracking()
            .ToListAsync();

        return products.Select(p =>
        {
            var totalVariantStock = p.Variants.Any() ? p.Variants.Sum(v => v.StockQuantity) : p.StockQuantity;
            var primaryImg = p.Images.FirstOrDefault(i => i.IsPrimary)?.ImageUrl ?? p.Images.FirstOrDefault()?.ImageUrl;

            return new InventoryItemDto
            {
                ProductId = p.Id,
                ProductName = p.Name,
                ProductSku = p.Sku,
                ImageUrl = primaryImg,
                CategoryName = p.Category?.Name ?? "Uncategorized",
                SellingPrice = p.Price,
                CostPrice = p.CostPrice,
                CurrentStock = totalVariantStock,
                LowStockThreshold = p.LowStockThreshold,
                Variants = p.Variants.Select(v => new InventoryVariantItemDto
                {
                    VariantId = v.Id,
                    VariantName = v.VariantName,
                    Sku = v.Sku,
                    CurrentStock = v.StockQuantity,
                    CostPrice = v.CostPrice,
                    Price = v.Price
                }).ToList()
            };
        }).OrderBy(i => i.CurrentStock).ToList();
    }

    public async Task<List<InventoryItemDto>> GetLowStockItemsAsync()
    {
        var all = await GetInventoryOverviewAsync();
        return all.Where(i => i.IsLowStock).ToList();
    }

    public async Task<Result<bool>> AdjustStockAsync(StockAdjustmentRequest request, string performedByName = "Admin")
    {
        var product = await _context.Products
            .Include(p => p.Variants)
            .FirstOrDefaultAsync(p => p.Id == request.ProductId);

        if (product == null)
            return Result<bool>.Failure("Product not found.");

        int qtyAfter = 0;
        string targetName = product.Name;

        if (request.ProductVariantId.HasValue && request.ProductVariantId.Value > 0)
        {
            var variant = product.Variants.FirstOrDefault(v => v.Id == request.ProductVariantId.Value);
            if (variant == null)
                return Result<bool>.Failure("Variant not found.");

            if (variant.StockQuantity + request.QuantityChange < 0)
                return Result<bool>.Failure($"Cannot reduce stock below 0. Current stock is {variant.StockQuantity}.");

            variant.StockQuantity += request.QuantityChange;
            qtyAfter = variant.StockQuantity;
            targetName = $"{product.Name} ({variant.VariantName})";
        }
        else
        {
            if (product.StockQuantity + request.QuantityChange < 0)
                return Result<bool>.Failure($"Cannot reduce stock below 0. Current stock is {product.StockQuantity}.");

            product.StockQuantity += request.QuantityChange;
            qtyAfter = product.StockQuantity;
        }

        var transaction = new InventoryTransaction
        {
            ProductId = product.Id,
            ProductVariantId = request.ProductVariantId,
            TransactionType = request.ReasonType,
            QuantityChange = request.QuantityChange,
            QuantityAfter = qtyAfter,
            Reason = string.IsNullOrWhiteSpace(request.Reason) ? "Manual adjustment" : request.Reason.Trim(),
            PerformedByName = performedByName,
            CreatedAt = DateTime.UtcNow
        };

        _context.InventoryTransactions.Add(transaction);
        await _context.SaveChangesAsync();

        return Result<bool>.Success(true, $"Stock for '{targetName}' adjusted by {request.QuantityChange}. New stock: {qtyAfter}");
    }

    public async Task<PagedResult<InventoryTransactionDto>> GetTransactionsAsync(int pageIndex = 1, int pageSize = 20, int? productId = null)
    {
        var query = _context.InventoryTransactions
            .Include(t => t.Product)
            .Include(t => t.ProductVariant)
            .AsNoTracking()
            .AsQueryable();

        if (productId.HasValue && productId.Value > 0)
        {
            query = query.Where(t => t.ProductId == productId.Value);
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var dtos = items.Select(t => new InventoryTransactionDto
        {
            Id = t.Id,
            ProductId = t.ProductId,
            ProductName = t.Product?.Name ?? "Unknown Product",
            ProductVariantId = t.ProductVariantId,
            VariantName = t.ProductVariant?.VariantName,
            TransactionType = t.TransactionType,
            QuantityChange = t.QuantityChange,
            QuantityAfter = t.QuantityAfter,
            Reason = t.Reason,
            PerformedByName = t.PerformedByName,
            OrderId = t.OrderId,
            CreatedAt = t.CreatedAt
        }).ToList();

        return new PagedResult<InventoryTransactionDto>(dtos, total, pageIndex, pageSize);
    }
}
