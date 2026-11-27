using Microsoft.EntityFrameworkCore;
using LuminaBeauty.Application.Common;
using LuminaBeauty.Application.Common.Interfaces;
using LuminaBeauty.Application.DTOs.Products;
using LuminaBeauty.Domain.Entities;
using LuminaBeauty.Domain.Enums;
using System.Text.RegularExpressions;

namespace LuminaBeauty.Application.Services;

public interface IProductService
{
    Task<PagedResult<ProductDto>> GetProductsAsync(ProductFilterParams filter);
    Task<Result<ProductDto>> GetProductByIdAsync(int id);
    Task<Result<ProductDto>> GetProductBySlugAsync(string slug);
    Task<List<ProductDto>> GetFeaturedProductsAsync();
    Task<List<ProductDto>> GetBestSellersAsync();
    Task<Result<ProductDto>> CreateProductAsync(CreateProductRequest request);
    Task<Result<ProductDto>> UpdateProductAsync(UpdateProductRequest request);
    Task<Result<bool>> DeleteProductAsync(int id);
    Task<Result<bool>> ToggleProductActiveAsync(int id);
}

public class ProductService : IProductService
{
    private readonly IApplicationDbContext _context;

    public ProductService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<ProductDto>> GetProductsAsync(ProductFilterParams filter)
    {
        var query = _context.Products
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.Images)
            .Include(p => p.Variants)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim().ToLower();
            query = query.Where(p =>
                p.Name.ToLower().Contains(search) ||
                p.Description.ToLower().Contains(search) ||
                p.ShortDescription.ToLower().Contains(search) ||
                p.Sku.ToLower().Contains(search) ||
                p.Brand.Name.ToLower().Contains(search) ||
                p.Category.Name.ToLower().Contains(search));
        }

        if (filter.CategoryId.HasValue && filter.CategoryId.Value > 0)
        {
            query = query.Where(p => p.CategoryId == filter.CategoryId.Value);
        }

        if (filter.BrandId.HasValue && filter.BrandId.Value > 0)
        {
            query = query.Where(p => p.BrandId == filter.BrandId.Value);
        }

        if (filter.SkinType.HasValue && filter.SkinType.Value != SkinType.All)
        {
            query = query.Where(p => p.SkinType == filter.SkinType.Value || p.SkinType == SkinType.All);
        }

        if (filter.MinPrice.HasValue)
        {
            query = query.Where(p => p.Price >= filter.MinPrice.Value);
        }

        if (filter.MaxPrice.HasValue)
        {
            query = query.Where(p => p.Price <= filter.MaxPrice.Value);
        }

        if (filter.MinRating.HasValue)
        {
            query = query.Where(p => p.Rating >= filter.MinRating.Value);
        }

        if (filter.InStockOnly == true)
        {
            query = query.Where(p => p.StockQuantity > 0 || p.Variants.Any(v => v.StockQuantity > 0));
        }

        if (filter.IsFeatured == true)
        {
            query = query.Where(p => p.IsFeatured);
        }

        if (filter.IsBestSeller == true)
        {
            query = query.Where(p => p.IsBestSeller);
        }

        // Sorting (cast decimal Price to double for SQLite ORDER BY compatibility)
        query = filter.SortBy switch
        {
            "price_asc" => query.OrderBy(p => (double)p.Price),
            "price_desc" => query.OrderByDescending(p => (double)p.Price),
            "rating" => query.OrderByDescending(p => p.Rating),
            "newest" => query.OrderByDescending(p => p.CreatedAt),
            "name_asc" => query.OrderBy(p => p.Name),
            _ => query.OrderByDescending(p => p.IsFeatured).ThenByDescending(p => p.CreatedAt)
        };

        var pageIndex = Math.Max(1, filter.PageIndex);
        var pageSize = Math.Max(1, filter.PageSize);

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var dtos = items.Select(MapToDto).ToList();
        return new PagedResult<ProductDto>(dtos, totalCount, pageIndex, pageSize);
    }

    public async Task<Result<ProductDto>> GetProductByIdAsync(int id)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.Images.OrderBy(i => i.DisplayOrder))
            .Include(p => p.Variants)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
            return Result<ProductDto>.Failure("Product not found.");

        return Result<ProductDto>.Success(MapToDto(product));
    }

    public async Task<Result<ProductDto>> GetProductBySlugAsync(string slug)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.Images.OrderBy(i => i.DisplayOrder))
            .Include(p => p.Variants)
            .FirstOrDefaultAsync(p => p.Slug.ToLower() == slug.ToLower());

        if (product == null)
            return Result<ProductDto>.Failure("Product not found.");

        return Result<ProductDto>.Success(MapToDto(product));
    }

    public async Task<List<ProductDto>> GetFeaturedProductsAsync()
    {
        var products = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.Images)
            .Include(p => p.Variants)
            .Where(p => p.IsActive && p.IsFeatured)
            .Take(8)
            .ToListAsync();

        return products.Select(MapToDto).ToList();
    }

    public async Task<List<ProductDto>> GetBestSellersAsync()
    {
        var products = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.Images)
            .Include(p => p.Variants)
            .Where(p => p.IsActive && p.IsBestSeller)
            .Take(8)
            .ToListAsync();

        return products.Select(MapToDto).ToList();
    }

    public async Task<Result<ProductDto>> CreateProductAsync(CreateProductRequest request)
    {
        var slug = GenerateSlug(request.Name);
        if (await _context.Products.AnyAsync(p => p.Slug == slug))
        {
            slug = $"{slug}-{DateTime.UtcNow.Ticks % 10000}";
        }

        var product = new Product
        {
            Name = request.Name.Trim(),
            Slug = slug,
            ShortDescription = request.ShortDescription,
            Description = request.Description,
            Sku = request.Sku.Trim().ToUpperInvariant(),
            Price = request.Price,
            CostPrice = request.CostPrice,
            CompareAtPrice = request.CompareAtPrice,
            CategoryId = request.CategoryId,
            BrandId = request.BrandId,
            SkinType = request.SkinType,
            Ingredients = request.Ingredients,
            HowToUse = request.HowToUse,
            StockQuantity = request.StockQuantity,
            LowStockThreshold = request.LowStockThreshold,
            IsActive = request.IsActive,
            IsFeatured = request.IsFeatured,
            IsBestSeller = request.IsBestSeller,
            CreatedAt = DateTime.UtcNow
        };

        if (request.ImageUrls != null && request.ImageUrls.Count > 0)
        {
            for (int i = 0; i < request.ImageUrls.Count; i++)
            {
                product.Images.Add(new ProductImage
                {
                    ImageUrl = request.ImageUrls[i],
                    IsPrimary = i == 0,
                    DisplayOrder = i,
                    AltText = request.Name
                });
            }
        }

        if (request.Variants != null && request.Variants.Count > 0)
        {
            foreach (var v in request.Variants)
            {
                product.Variants.Add(new ProductVariant
                {
                    Sku = v.Sku.Trim().ToUpperInvariant(),
                    VariantName = v.VariantName.Trim(),
                    Size = v.Size,
                    Shade = v.Shade,
                    ShadeColorHex = v.ShadeColorHex,
                    Price = v.Price > 0 ? v.Price : request.Price,
                    CostPrice = v.CostPrice > 0 ? v.CostPrice : request.CostPrice,
                    StockQuantity = v.StockQuantity,
                    IsActive = v.IsActive
                });
            }
        }

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        return await GetProductByIdAsync(product.Id);
    }

    public async Task<Result<ProductDto>> UpdateProductAsync(UpdateProductRequest request)
    {
        var product = await _context.Products
            .Include(p => p.Images)
            .Include(p => p.Variants)
            .FirstOrDefaultAsync(p => p.Id == request.Id);

        if (product == null)
            return Result<ProductDto>.Failure("Product not found.");

        product.Name = request.Name.Trim();
        product.ShortDescription = request.ShortDescription;
        product.Description = request.Description;
        product.Sku = request.Sku.Trim().ToUpperInvariant();
        product.Price = request.Price;
        product.CostPrice = request.CostPrice;
        product.CompareAtPrice = request.CompareAtPrice;
        product.CategoryId = request.CategoryId;
        product.BrandId = request.BrandId;
        product.SkinType = request.SkinType;
        product.Ingredients = request.Ingredients;
        product.HowToUse = request.HowToUse;
        product.StockQuantity = request.StockQuantity;
        product.LowStockThreshold = request.LowStockThreshold;
        product.IsActive = request.IsActive;
        product.IsFeatured = request.IsFeatured;
        product.IsBestSeller = request.IsBestSeller;
        product.UpdatedAt = DateTime.UtcNow;

        if (request.ImageUrls != null && request.ImageUrls.Count > 0)
        {
            _context.ProductImages.RemoveRange(product.Images);
            for (int i = 0; i < request.ImageUrls.Count; i++)
            {
                product.Images.Add(new ProductImage
                {
                    ImageUrl = request.ImageUrls[i],
                    IsPrimary = i == 0,
                    DisplayOrder = i,
                    AltText = request.Name
                });
            }
        }

        if (request.Variants != null)
        {
            _context.ProductVariants.RemoveRange(product.Variants);
            foreach (var v in request.Variants)
            {
                product.Variants.Add(new ProductVariant
                {
                    Sku = v.Sku.Trim().ToUpperInvariant(),
                    VariantName = v.VariantName.Trim(),
                    Size = v.Size,
                    Shade = v.Shade,
                    ShadeColorHex = v.ShadeColorHex,
                    Price = v.Price > 0 ? v.Price : request.Price,
                    CostPrice = v.CostPrice > 0 ? v.CostPrice : request.CostPrice,
                    StockQuantity = v.StockQuantity,
                    IsActive = v.IsActive
                });
            }
        }

        await _context.SaveChangesAsync();
        return await GetProductByIdAsync(product.Id);
    }

    public async Task<Result<bool>> DeleteProductAsync(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
            return Result<bool>.Failure("Product not found.");

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();
        return Result<bool>.Success(true, "Product deleted successfully");
    }

    public async Task<Result<bool>> ToggleProductActiveAsync(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
            return Result<bool>.Failure("Product not found.");

        product.IsActive = !product.IsActive;
        product.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Result<bool>.Success(product.IsActive, $"Product is now {(product.IsActive ? "Active" : "Inactive")}");
    }

    private static ProductDto MapToDto(Product p) => new()
    {
        Id = p.Id,
        Name = p.Name,
        Slug = p.Slug,
        ShortDescription = p.ShortDescription,
        Description = p.Description,
        Sku = p.Sku,
        Price = p.Price,
        CostPrice = p.CostPrice,
        CompareAtPrice = p.CompareAtPrice,
        CategoryId = p.CategoryId,
        CategoryName = p.Category?.Name ?? string.Empty,
        BrandId = p.BrandId,
        BrandName = p.Brand?.Name ?? string.Empty,
        SkinType = p.SkinType,
        Ingredients = p.Ingredients,
        HowToUse = p.HowToUse,
        StockQuantity = p.StockQuantity,
        LowStockThreshold = p.LowStockThreshold,
        IsActive = p.IsActive,
        IsFeatured = p.IsFeatured,
        IsBestSeller = p.IsBestSeller,
        Rating = p.Rating,
        ReviewCount = p.ReviewCount,
        PrimaryImageUrl = p.Images.FirstOrDefault(i => i.IsPrimary)?.ImageUrl ?? p.Images.FirstOrDefault()?.ImageUrl,
        Images = p.Images.Select(i => new ProductImageDto
        {
            Id = i.Id,
            ImageUrl = i.ImageUrl,
            AltText = i.AltText,
            IsPrimary = i.IsPrimary,
            DisplayOrder = i.DisplayOrder
        }).ToList(),
        Variants = p.Variants.Select(v => new ProductVariantDto
        {
            Id = v.Id,
            ProductId = v.ProductId,
            Sku = v.Sku,
            VariantName = v.VariantName,
            Size = v.Size,
            Shade = v.Shade,
            ShadeColorHex = v.ShadeColorHex,
            Price = v.Price,
            CostPrice = v.CostPrice,
            StockQuantity = v.StockQuantity,
            IsActive = v.IsActive
        }).ToList()
    };

    private static string GenerateSlug(string phrase)
    {
        string str = phrase.ToLowerInvariant();
        str = Regex.Replace(str, @"[^a-z0-9\s-]", "");
        str = Regex.Replace(str, @"\s+", " ").Trim();
        str = Regex.Replace(str, @"\s", "-");
        return str;
    }
}
