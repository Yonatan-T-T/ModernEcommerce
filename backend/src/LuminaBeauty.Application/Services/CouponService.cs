using Microsoft.EntityFrameworkCore;
using LuminaBeauty.Application.Common;
using LuminaBeauty.Application.Common.Interfaces;
using LuminaBeauty.Application.DTOs.Common;
using LuminaBeauty.Domain.Entities;
using LuminaBeauty.Domain.Enums;

namespace LuminaBeauty.Application.Services;

public interface ICouponService
{
    Task<List<CouponDto>> GetAllCouponsAsync();
    Task<Result<CouponDto>> CreateCouponAsync(CreateCouponRequest request);
    Task<Result<bool>> DeleteCouponAsync(int id);
    Task<Result<CouponValidationResultDto>> ValidateCouponAsync(ValidateCouponRequest request);
}

public class CouponService : ICouponService
{
    private readonly IApplicationDbContext _context;

    public CouponService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<CouponDto>> GetAllCouponsAsync()
    {
        var coupons = await _context.Coupons.OrderByDescending(c => c.CreatedAt).ToListAsync();
        return coupons.Select(MapToDto).ToList();
    }

    public async Task<Result<CouponDto>> CreateCouponAsync(CreateCouponRequest request)
    {
        var code = request.Code.Trim().ToUpperInvariant();
        if (await _context.Coupons.AnyAsync(c => c.Code == code))
        {
            return Result<CouponDto>.Failure("A coupon with this code already exists.");
        }

        var coupon = new Coupon
        {
            Code = code,
            Description = request.Description,
            DiscountType = request.DiscountType,
            DiscountValue = request.DiscountValue,
            MinimumSpend = request.MinimumSpend,
            MaxDiscountAmount = request.MaxDiscountAmount,
            ExpiryDate = request.ExpiryDate,
            UsageLimit = request.UsageLimit,
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        _context.Coupons.Add(coupon);
        await _context.SaveChangesAsync();

        return Result<CouponDto>.Success(MapToDto(coupon), "Coupon created successfully");
    }

    public async Task<Result<bool>> DeleteCouponAsync(int id)
    {
        var coupon = await _context.Coupons.FindAsync(id);
        if (coupon == null) return Result<bool>.Failure("Coupon not found.");

        _context.Coupons.Remove(coupon);
        await _context.SaveChangesAsync();
        return Result<bool>.Success(true, "Coupon deleted successfully");
    }

    public async Task<Result<CouponValidationResultDto>> ValidateCouponAsync(ValidateCouponRequest request)
    {
        var code = request.Code.Trim().ToUpperInvariant();
        var coupon = await _context.Coupons.FirstOrDefaultAsync(c => c.Code == code && c.IsActive);

        if (coupon == null)
        {
            return Result<CouponValidationResultDto>.Success(new CouponValidationResultDto
            {
                IsValid = false,
                Message = "Invalid promo code."
            });
        }

        if (coupon.ExpiryDate.HasValue && coupon.ExpiryDate.Value < DateTime.UtcNow)
        {
            return Result<CouponValidationResultDto>.Success(new CouponValidationResultDto
            {
                IsValid = false,
                Message = "This promo code has expired."
            });
        }

        if (coupon.UsageLimit.HasValue && coupon.TimesUsed >= coupon.UsageLimit.Value)
        {
            return Result<CouponValidationResultDto>.Success(new CouponValidationResultDto
            {
                IsValid = false,
                Message = "This promo code has reached its maximum usage limit."
            });
        }

        if (request.OrderSubTotal < coupon.MinimumSpend)
        {
            return Result<CouponValidationResultDto>.Success(new CouponValidationResultDto
            {
                IsValid = false,
                Message = $"A minimum spend of ${coupon.MinimumSpend:N2} is required for code {coupon.Code}."
            });
        }

        decimal discount = 0;
        if (coupon.DiscountType == DiscountType.Percentage)
        {
            discount = Math.Round(request.OrderSubTotal * (coupon.DiscountValue / 100m), 2);
            if (coupon.MaxDiscountAmount.HasValue && discount > coupon.MaxDiscountAmount.Value)
            {
                discount = coupon.MaxDiscountAmount.Value;
            }
        }
        else
        {
            discount = Math.Min(coupon.DiscountValue, request.OrderSubTotal);
        }

        return Result<CouponValidationResultDto>.Success(new CouponValidationResultDto
        {
            IsValid = true,
            Code = coupon.Code,
            DiscountAmount = discount,
            Message = $"Promo code '{coupon.Code}' applied successfully! Saved ${discount:N2}"
        });
    }

    private static CouponDto MapToDto(Coupon c) => new()
    {
        Id = c.Id,
        Code = c.Code,
        Description = c.Description,
        DiscountType = c.DiscountType,
        DiscountValue = c.DiscountValue,
        MinimumSpend = c.MinimumSpend,
        MaxDiscountAmount = c.MaxDiscountAmount,
        ExpiryDate = c.ExpiryDate,
        UsageLimit = c.UsageLimit,
        TimesUsed = c.TimesUsed,
        IsActive = c.IsActive
    };
}
