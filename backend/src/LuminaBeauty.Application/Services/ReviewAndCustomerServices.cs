using Microsoft.EntityFrameworkCore;
using LuminaBeauty.Application.Common;
using LuminaBeauty.Application.Common.Interfaces;
using LuminaBeauty.Application.DTOs.Common;
using LuminaBeauty.Domain.Entities;

namespace LuminaBeauty.Application.Services;

public interface IReviewService
{
    Task<List<ReviewDto>> GetProductReviewsAsync(int productId);
    Task<Result<ReviewDto>> AddReviewAsync(CreateReviewRequest request, int? userId = null);
}

public class ReviewService : IReviewService
{
    private readonly IApplicationDbContext _context;

    public ReviewService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ReviewDto>> GetProductReviewsAsync(int productId)
    {
        var reviews = await _context.Reviews
            .Where(r => r.ProductId == productId && r.IsApproved)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return reviews.Select(r => new ReviewDto
        {
            Id = r.Id,
            ProductId = r.ProductId,
            AuthorName = r.AuthorName,
            Rating = r.Rating,
            Title = r.Title,
            Comment = r.Comment,
            IsVerifiedPurchase = r.IsVerifiedPurchase,
            CreatedAt = r.CreatedAt
        }).ToList();
    }

    public async Task<Result<ReviewDto>> AddReviewAsync(CreateReviewRequest request, int? userId = null)
    {
        var product = await _context.Products
            .Include(p => p.Reviews)
            .FirstOrDefaultAsync(p => p.Id == request.ProductId);

        if (product == null) return Result<ReviewDto>.Failure("Product not found.");

        if (request.Rating < 1 || request.Rating > 5)
            return Result<ReviewDto>.Failure("Rating must be between 1 and 5.");

        bool isVerified = false;
        if (userId.HasValue)
        {
            isVerified = await _context.Orders
                .Where(o => o.UserId == userId.Value)
                .SelectMany(o => o.Items)
                .AnyAsync(i => i.ProductId == request.ProductId);
        }

        var review = new Review
        {
            ProductId = request.ProductId,
            UserId = userId,
            AuthorName = string.IsNullOrWhiteSpace(request.AuthorName) ? "Verified Buyer" : request.AuthorName.Trim(),
            Rating = request.Rating,
            Title = request.Title.Trim(),
            Comment = request.Comment.Trim(),
            IsVerifiedPurchase = isVerified,
            IsApproved = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Reviews.Add(review);

        // Recalculate product rating
        var existingReviews = product.Reviews.Where(r => r.IsApproved).ToList();
        var allRatings = existingReviews.Select(r => r.Rating).Concat(new[] { review.Rating }).ToList();
        product.Rating = Math.Round(allRatings.Average(), 1);
        product.ReviewCount = allRatings.Count;

        await _context.SaveChangesAsync();

        return Result<ReviewDto>.Success(new ReviewDto
        {
            Id = review.Id,
            ProductId = review.ProductId,
            AuthorName = review.AuthorName,
            Rating = review.Rating,
            Title = review.Title,
            Comment = review.Comment,
            IsVerifiedPurchase = review.IsVerifiedPurchase,
            CreatedAt = review.CreatedAt
        }, "Review submitted successfully");
    }
}

public interface ICustomerService
{
    Task<List<CustomerDto>> GetAllCustomersAsync();
    Task<List<int>> GetUserWishlistProductIdsAsync(int userId);
    Task<Result<bool>> ToggleWishlistItemAsync(int userId, int productId);
}

public class CustomerService : ICustomerService
{
    private readonly IApplicationDbContext _context;

    public CustomerService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<CustomerDto>> GetAllCustomersAsync()
    {
        var customers = await _context.Users
            .Where(u => u.Role == "Customer")
            .Include(u => u.Orders)
            .AsNoTracking()
            .ToListAsync();

        return customers.Select(c => new CustomerDto
        {
            Id = c.Id,
            FullName = c.FullName,
            Email = c.Email,
            PhoneNumber = c.PhoneNumber,
            OrderCount = c.Orders.Count,
            TotalSpent = c.Orders.Where(o => o.Status != Domain.Enums.OrderStatus.Cancelled).Sum(o => o.TotalAmount),
            CreatedAt = c.CreatedAt
        }).OrderByDescending(c => c.TotalSpent).ToList();
    }

    public async Task<List<int>> GetUserWishlistProductIdsAsync(int userId)
    {
        return await _context.WishlistItems
            .Where(w => w.UserId == userId)
            .Select(w => w.ProductId)
            .ToListAsync();
    }

    public async Task<Result<bool>> ToggleWishlistItemAsync(int userId, int productId)
    {
        var existing = await _context.WishlistItems
            .FirstOrDefaultAsync(w => w.UserId == userId && w.ProductId == productId);

        if (existing != null)
        {
            _context.WishlistItems.Remove(existing);
            await _context.SaveChangesAsync();
            return Result<bool>.Success(false, "Removed from wishlist");
        }

        var product = await _context.Products.FindAsync(productId);
        if (product == null) return Result<bool>.Failure("Product not found.");

        _context.WishlistItems.Add(new WishlistItem { UserId = userId, ProductId = productId });
        await _context.SaveChangesAsync();
        return Result<bool>.Success(true, "Added to wishlist");
    }
}
