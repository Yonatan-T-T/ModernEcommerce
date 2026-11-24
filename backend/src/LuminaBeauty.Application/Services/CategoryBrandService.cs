using Microsoft.EntityFrameworkCore;
using LuminaBeauty.Application.Common;
using LuminaBeauty.Application.Common.Interfaces;
using LuminaBeauty.Application.DTOs.Common;
using LuminaBeauty.Domain.Entities;
using System.Text.RegularExpressions;

namespace LuminaBeauty.Application.Services;

public interface ICategoryBrandService
{
    Task<List<CategoryDto>> GetCategoriesAsync(bool includeInactive = false);
    Task<Result<CategoryDto>> CreateCategoryAsync(CreateCategoryRequest request);
    Task<Result<CategoryDto>> UpdateCategoryAsync(int id, CreateCategoryRequest request);
    Task<Result<bool>> DeleteCategoryAsync(int id);

    Task<List<BrandDto>> GetBrandsAsync(bool includeInactive = false);
    Task<Result<BrandDto>> CreateBrandAsync(CreateBrandRequest request);
    Task<Result<BrandDto>> UpdateBrandAsync(int id, CreateBrandRequest request);
    Task<Result<bool>> DeleteBrandAsync(int id);
}

public class CategoryBrandService : ICategoryBrandService
{
    private readonly IApplicationDbContext _context;

    public CategoryBrandService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<CategoryDto>> GetCategoriesAsync(bool includeInactive = false)
    {
        var query = _context.Categories
            .Include(c => c.Products)
            .AsNoTracking()
            .AsQueryable();

        if (!includeInactive)
        {
            query = query.Where(c => c.IsActive);
        }

        var categories = await query.OrderBy(c => c.DisplayOrder).ThenBy(c => c.Name).ToListAsync();
        return categories.Select(c => new CategoryDto
        {
            Id = c.Id,
            Name = c.Name,
            Slug = c.Slug,
            Description = c.Description,
            ImageUrl = c.ImageUrl,
            IsActive = c.IsActive,
            DisplayOrder = c.DisplayOrder,
            ProductCount = c.Products.Count(p => p.IsActive)
        }).ToList();
    }

    public async Task<Result<CategoryDto>> CreateCategoryAsync(CreateCategoryRequest request)
    {
        var slug = GenerateSlug(request.Name);
        if (await _context.Categories.AnyAsync(c => c.Slug == slug))
        {
            slug = $"{slug}-{DateTime.UtcNow.Ticks % 10000}";
        }

        var category = new Category
        {
            Name = request.Name.Trim(),
            Slug = slug,
            Description = request.Description?.Trim(),
            ImageUrl = request.ImageUrl,
            IsActive = request.IsActive,
            DisplayOrder = request.DisplayOrder,
            CreatedAt = DateTime.UtcNow
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return Result<CategoryDto>.Success(new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Slug = category.Slug,
            Description = category.Description,
            ImageUrl = category.ImageUrl,
            IsActive = category.IsActive,
            DisplayOrder = category.DisplayOrder,
            ProductCount = 0
        });
    }

    public async Task<Result<CategoryDto>> UpdateCategoryAsync(int id, CreateCategoryRequest request)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null) return Result<CategoryDto>.Failure("Category not found.");

        category.Name = request.Name.Trim();
        category.Description = request.Description?.Trim();
        if (!string.IsNullOrEmpty(request.ImageUrl)) category.ImageUrl = request.ImageUrl;
        category.IsActive = request.IsActive;
        category.DisplayOrder = request.DisplayOrder;
        category.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Result<CategoryDto>.Success(new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Slug = category.Slug,
            Description = category.Description,
            ImageUrl = category.ImageUrl,
            IsActive = category.IsActive,
            DisplayOrder = category.DisplayOrder
        });
    }

    public async Task<Result<bool>> DeleteCategoryAsync(int id)
    {
        var category = await _context.Categories.Include(c => c.Products).FirstOrDefaultAsync(c => c.Id == id);
        if (category == null) return Result<bool>.Failure("Category not found.");
        if (category.Products.Any()) return Result<bool>.Failure("Cannot delete category with associated products.");

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();
        return Result<bool>.Success(true, "Category deleted successfully");
    }

    public async Task<List<BrandDto>> GetBrandsAsync(bool includeInactive = false)
    {
        var query = _context.Brands
            .Include(b => b.Products)
            .AsNoTracking()
            .AsQueryable();

        if (!includeInactive)
        {
            query = query.Where(b => b.IsActive);
        }

        var brands = await query.OrderBy(b => b.Name).ToListAsync();
        return brands.Select(b => new BrandDto
        {
            Id = b.Id,
            Name = b.Name,
            Slug = b.Slug,
            Description = b.Description,
            LogoUrl = b.LogoUrl,
            WebsiteUrl = b.WebsiteUrl,
            IsActive = b.IsActive,
            ProductCount = b.Products.Count(p => p.IsActive)
        }).ToList();
    }

    public async Task<Result<BrandDto>> CreateBrandAsync(CreateBrandRequest request)
    {
        var slug = GenerateSlug(request.Name);
        if (await _context.Brands.AnyAsync(b => b.Slug == slug))
        {
            slug = $"{slug}-{DateTime.UtcNow.Ticks % 10000}";
        }

        var brand = new Brand
        {
            Name = request.Name.Trim(),
            Slug = slug,
            Description = request.Description?.Trim(),
            LogoUrl = request.LogoUrl,
            WebsiteUrl = request.WebsiteUrl,
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        _context.Brands.Add(brand);
        await _context.SaveChangesAsync();

        return Result<BrandDto>.Success(new BrandDto
        {
            Id = brand.Id,
            Name = brand.Name,
            Slug = brand.Slug,
            Description = brand.Description,
            LogoUrl = brand.LogoUrl,
            WebsiteUrl = brand.WebsiteUrl,
            IsActive = brand.IsActive,
            ProductCount = 0
        });
    }

    public async Task<Result<BrandDto>> UpdateBrandAsync(int id, CreateBrandRequest request)
    {
        var brand = await _context.Brands.FindAsync(id);
        if (brand == null) return Result<BrandDto>.Failure("Brand not found.");

        brand.Name = request.Name.Trim();
        brand.Description = request.Description?.Trim();
        if (!string.IsNullOrEmpty(request.LogoUrl)) brand.LogoUrl = request.LogoUrl;
        brand.WebsiteUrl = request.WebsiteUrl;
        brand.IsActive = request.IsActive;
        brand.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Result<BrandDto>.Success(new BrandDto
        {
            Id = brand.Id,
            Name = brand.Name,
            Slug = brand.Slug,
            Description = brand.Description,
            LogoUrl = brand.LogoUrl,
            WebsiteUrl = brand.WebsiteUrl,
            IsActive = brand.IsActive
        });
    }

    public async Task<Result<bool>> DeleteBrandAsync(int id)
    {
        var brand = await _context.Brands.Include(b => b.Products).FirstOrDefaultAsync(b => b.Id == id);
        if (brand == null) return Result<bool>.Failure("Brand not found.");
        if (brand.Products.Any()) return Result<bool>.Failure("Cannot delete brand with associated products.");

        _context.Brands.Remove(brand);
        await _context.SaveChangesAsync();
        return Result<bool>.Success(true, "Brand deleted successfully");
    }

    private static string GenerateSlug(string phrase)
    {
        string str = phrase.ToLowerInvariant();
        str = Regex.Replace(str, @"[^a-z0-9\s-]", "");
        str = Regex.Replace(str, @"\s+", " ").Trim();
        str = Regex.Replace(str, @"\s", "-");
        return str;
    }
}
