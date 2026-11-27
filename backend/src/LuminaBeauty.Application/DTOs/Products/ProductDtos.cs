using LuminaBeauty.Domain.Enums;

namespace LuminaBeauty.Application.DTOs.Products;

public class ProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string ShortDescription { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal CostPrice { get; set; }
    public decimal? CompareAtPrice { get; set; }
    public decimal WeightGrams { get; set; } = 150m;

    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;

    public int BrandId { get; set; }
    public string BrandName { get; set; } = string.Empty;

    public SkinType SkinType { get; set; }
    public string SkinTypeName => SkinType.ToString();
    public string? Ingredients { get; set; }
    public string? HowToUse { get; set; }

    public int StockQuantity { get; set; }
    public int LowStockThreshold { get; set; }
    public bool IsActive { get; set; }
    public bool IsFeatured { get; set; }
    public bool IsBestSeller { get; set; }

    public double Rating { get; set; }
    public int ReviewCount { get; set; }

    public string? PrimaryImageUrl { get; set; }
    public List<ProductImageDto> Images { get; set; } = new();
    public List<ProductVariantDto> Variants { get; set; } = new();
}

public class ProductImageDto
{
    public int Id { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string? AltText { get; set; }
    public bool IsPrimary { get; set; }
    public int DisplayOrder { get; set; }
}

public class ProductVariantDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string Sku { get; set; } = string.Empty;
    public string VariantName { get; set; } = string.Empty;
    public string? Size { get; set; }
    public string? Shade { get; set; }
    public string? ShadeColorHex { get; set; }
    public decimal Price { get; set; }
    public decimal CostPrice { get; set; }
    public decimal? WeightGrams { get; set; }
    public int StockQuantity { get; set; }
    public bool IsActive { get; set; }
}

public class CreateProductRequest
{
    public string Name { get; set; } = string.Empty;
    public string ShortDescription { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal CostPrice { get; set; }
    public decimal? CompareAtPrice { get; set; }
    public decimal WeightGrams { get; set; } = 150m;
    public int CategoryId { get; set; }
    public int BrandId { get; set; }
    public SkinType SkinType { get; set; } = SkinType.All;
    public string? Ingredients { get; set; }
    public string? HowToUse { get; set; }
    public int StockQuantity { get; set; } = 0;
    public int LowStockThreshold { get; set; } = 10;
    public bool IsActive { get; set; } = true;
    public bool IsFeatured { get; set; }
    public bool IsBestSeller { get; set; }
    public List<string> ImageUrls { get; set; } = new();
    public List<CreateVariantRequest> Variants { get; set; } = new();
}

public class CreateVariantRequest
{
    public string Sku { get; set; } = string.Empty;
    public string VariantName { get; set; } = string.Empty;
    public string? Size { get; set; }
    public string? Shade { get; set; }
    public string? ShadeColorHex { get; set; }
    public decimal Price { get; set; }
    public decimal CostPrice { get; set; }
    public decimal? WeightGrams { get; set; }
    public int StockQuantity { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateProductRequest : CreateProductRequest
{
    public int Id { get; set; }
}

public class ProductFilterParams
{
    public string? Search { get; set; }
    public int? CategoryId { get; set; }
    public int? BrandId { get; set; }
    public SkinType? SkinType { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public double? MinRating { get; set; }
    public bool? InStockOnly { get; set; }
    public bool? IsFeatured { get; set; }
    public bool? IsBestSeller { get; set; }
    public string? SortBy { get; set; } // "price_asc", "price_desc", "rating", "newest", "name_asc"
    public int PageIndex { get; set; } = 1;
    public int PageSize { get; set; } = 12;
}
