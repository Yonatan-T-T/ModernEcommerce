namespace LuminaBeauty.Application.DTOs.Analytics;

public class AnalyticsDashboardDto
{
    // Financial Metrics
    public decimal TotalRevenue { get; set; }
    public decimal TotalCostOfGoodsSold { get; set; }
    public decimal TotalNetProfit { get; set; }
    public decimal ProfitMarginPercentage { get; set; }

    // Inventory Valuation
    public decimal TotalInventoryCostValue { get; set; }
    public decimal TotalInventoryRetailValue { get; set; }
    public int TotalUnitsInStock { get; set; }
    public int LowStockItemCount { get; set; }

    // Orders & Performance
    public int TotalOrders { get; set; }
    public int TotalCustomers { get; set; }
    public decimal AverageOrderValue { get; set; }

    // Charts & Trends
    public List<SalesTrendDataPointDto> SalesTrend { get; set; } = new();
    public List<CategorySalesShareDto> SalesByCategory { get; set; } = new();
    public List<TopProductPerformanceDto> TopProducts { get; set; } = new();
    public List<RecentOrderSummaryDto> RecentOrders { get; set; } = new();
}

public class SalesTrendDataPointDto
{
    public string Date { get; set; } = string.Empty; // "YYYY-MM-DD" or "Mon DD"
    public decimal Revenue { get; set; }
    public decimal Cost { get; set; }
    public decimal Profit { get; set; }
    public int OrderCount { get; set; }
}

public class CategorySalesShareDto
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
    public int QuantitySold { get; set; }
    public decimal Percentage { get; set; }
}

public class TopProductPerformanceDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public string Sku { get; set; } = string.Empty;
    public decimal SellingPrice { get; set; }
    public decimal CostPrice { get; set; }
    public int UnitsSold { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal TotalCost { get; set; }
    public decimal NetProfit { get; set; }
    public decimal ProfitMargin => TotalRevenue > 0 ? Math.Round((NetProfit / TotalRevenue) * 100, 2) : 0;
}

public class RecentOrderSummaryDto
{
    public int OrderId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public decimal NetProfit { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
