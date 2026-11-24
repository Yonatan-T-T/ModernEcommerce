using Microsoft.EntityFrameworkCore;
using LuminaBeauty.Application.Common.Interfaces;
using LuminaBeauty.Application.DTOs.Analytics;
using LuminaBeauty.Domain.Enums;

namespace LuminaBeauty.Application.Services;

public interface IAnalyticsService
{
    Task<AnalyticsDashboardDto> GetDashboardAnalyticsAsync();
}

public class AnalyticsService : IAnalyticsService
{
    private readonly IApplicationDbContext _context;

    public AnalyticsService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AnalyticsDashboardDto> GetDashboardAnalyticsAsync()
    {
        // Exclude cancelled orders from revenue & profit calculations
        var validOrders = await _context.Orders
            .Include(o => o.Items)
            .Where(o => o.Status != OrderStatus.Cancelled)
            .AsNoTracking()
            .ToListAsync();

        decimal totalRevenue = validOrders.Sum(o => o.TotalAmount);
        decimal totalCost = validOrders.Sum(o => o.TotalCost);
        decimal totalNetProfit = validOrders.Sum(o => o.NetProfit);
        decimal profitMargin = totalRevenue > 0 ? Math.Round((totalNetProfit / totalRevenue) * 100, 2) : 0;

        int totalOrders = validOrders.Count;
        decimal aov = totalOrders > 0 ? Math.Round(totalRevenue / totalOrders, 2) : 0;
        int totalCustomers = await _context.Users.CountAsync(u => u.Role == "Customer");

        // Inventory valuation
        var products = await _context.Products
            .Include(p => p.Images)
            .Include(p => p.Variants)
            .AsNoTracking()
            .ToListAsync();

        decimal totalInventoryCost = 0;
        decimal totalInventoryRetail = 0;
        int totalUnits = 0;
        int lowStockCount = 0;

        foreach (var p in products)
        {
            if (p.Variants.Any())
            {
                foreach (var v in p.Variants)
                {
                    totalInventoryCost += v.CostPrice * v.StockQuantity;
                    totalInventoryRetail += v.Price * v.StockQuantity;
                    totalUnits += v.StockQuantity;
                }
                var totalPStock = p.Variants.Sum(v => v.StockQuantity);
                if (totalPStock <= p.LowStockThreshold) lowStockCount++;
            }
            else
            {
                totalInventoryCost += p.CostPrice * p.StockQuantity;
                totalInventoryRetail += p.Price * p.StockQuantity;
                totalUnits += p.StockQuantity;
                if (p.StockQuantity <= p.LowStockThreshold) lowStockCount++;
            }
        }

        // Sales Trend: Daily/Weekly for the last 14 days
        var now = DateTime.UtcNow.Date;
        var trendMap = new Dictionary<string, (decimal rev, decimal cost, decimal prof, int count)>();

        for (int i = 13; i >= 0; i--)
        {
            var date = now.AddDays(-i);
            var dateStr = date.ToString("MMM dd");
            trendMap[dateStr] = (0, 0, 0, 0);
        }

        foreach (var o in validOrders)
        {
            var orderDate = o.CreatedAt.Date;
            if (orderDate >= now.AddDays(-13) && orderDate <= now)
            {
                var dateStr = orderDate.ToString("MMM dd");
                if (trendMap.ContainsKey(dateStr))
                {
                    var current = trendMap[dateStr];
                    trendMap[dateStr] = (
                        current.rev + o.TotalAmount,
                        current.cost + o.TotalCost,
                        current.prof + o.NetProfit,
                        current.count + 1
                    );
                }
            }
        }

        var salesTrend = trendMap.Select(kv => new SalesTrendDataPointDto
        {
            Date = kv.Key,
            Revenue = kv.Value.rev,
            Cost = kv.Value.cost,
            Profit = kv.Value.prof,
            OrderCount = kv.Value.count
        }).ToList();

        // Top-selling products: calculate (SellingPrice - CostPrice) * UnitsSold
        var orderItems = validOrders.SelectMany(o => o.Items).ToList();
        var topProductGroups = orderItems
            .GroupBy(i => i.ProductId)
            .Select(g =>
            {
                var product = products.FirstOrDefault(p => p.Id == g.Key);
                var unitsSold = g.Sum(x => x.Quantity);
                var prodRev = g.Sum(x => x.SubTotal);
                var prodCost = g.Sum(x => x.TotalCost);
                var netProf = prodRev - prodCost;

                var primaryImg = product?.Images.FirstOrDefault(i => i.IsPrimary)?.ImageUrl
                                 ?? product?.Images.FirstOrDefault()?.ImageUrl;

                return new TopProductPerformanceDto
                {
                    ProductId = g.Key,
                    ProductName = product?.Name ?? g.First().ProductName,
                    ImageUrl = primaryImg ?? g.First().ProductImageUrl,
                    Sku = product?.Sku ?? "",
                    SellingPrice = product?.Price ?? g.First().UnitPrice,
                    CostPrice = product?.CostPrice ?? g.First().UnitCost,
                    UnitsSold = unitsSold,
                    TotalRevenue = prodRev,
                    TotalCost = prodCost,
                    NetProfit = netProf
                };
            })
            .OrderByDescending(p => p.NetProfit)
            .Take(6)
            .ToList();

        // Sales by Category
        var categories = await _context.Categories.AsNoTracking().ToListAsync();
        var categoryMap = new Dictionary<int, (string name, decimal rev, int qty)>();

        foreach (var c in categories)
        {
            categoryMap[c.Id] = (c.Name, 0, 0);
        }

        foreach (var item in orderItems)
        {
            var p = products.FirstOrDefault(prod => prod.Id == item.ProductId);
            if (p != null && categoryMap.ContainsKey(p.CategoryId))
            {
                var cur = categoryMap[p.CategoryId];
                categoryMap[p.CategoryId] = (cur.name, cur.rev + item.SubTotal, cur.qty + item.Quantity);
            }
        }

        decimal totalCategoryRevenue = categoryMap.Values.Sum(v => v.rev);
        var categorySales = categoryMap.Select(kv => new CategorySalesShareDto
        {
            CategoryId = kv.Key,
            CategoryName = kv.Value.name,
            Revenue = kv.Value.rev,
            QuantitySold = kv.Value.qty,
            Percentage = totalCategoryRevenue > 0 ? Math.Round((kv.Value.rev / totalCategoryRevenue) * 100, 1) : 0
        }).OrderByDescending(c => c.Revenue).ToList();

        // Recent orders
        var recentOrders = validOrders
            .OrderByDescending(o => o.CreatedAt)
            .Take(5)
            .Select(o => new RecentOrderSummaryDto
            {
                OrderId = o.Id,
                OrderNumber = o.OrderNumber,
                CustomerName = o.CustomerName,
                TotalAmount = o.TotalAmount,
                NetProfit = o.NetProfit,
                Status = o.Status.ToString(),
                CreatedAt = o.CreatedAt
            }).ToList();

        return new AnalyticsDashboardDto
        {
            TotalRevenue = totalRevenue,
            TotalCostOfGoodsSold = totalCost,
            TotalNetProfit = totalNetProfit,
            ProfitMarginPercentage = profitMargin,
            TotalInventoryCostValue = totalInventoryCost,
            TotalInventoryRetailValue = totalInventoryRetail,
            TotalUnitsInStock = totalUnits,
            LowStockItemCount = lowStockCount,
            TotalOrders = totalOrders,
            TotalCustomers = totalCustomers,
            AverageOrderValue = aov,
            SalesTrend = salesTrend,
            SalesByCategory = categorySales,
            TopProducts = topProductGroups,
            RecentOrders = recentOrders
        };
    }
}
