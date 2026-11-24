using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LuminaBeauty.Application.DTOs.Common;
using LuminaBeauty.Application.Services;

namespace LuminaBeauty.API.Controllers;

public class CouponsController : BaseApiController
{
    private readonly ICouponService _couponService;

    public CouponsController(ICouponService couponService)
    {
        _couponService = couponService;
    }

    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<IActionResult> GetAllCoupons()
    {
        var coupons = await _couponService.GetAllCouponsAsync();
        return Ok(coupons);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> CreateCoupon([FromBody] CreateCouponRequest request)
    {
        var result = await _couponService.CreateCouponAsync(request);
        if (!result.Succeeded) return BadRequest(result);
        return Ok(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteCoupon(int id)
    {
        var result = await _couponService.DeleteCouponAsync(id);
        if (!result.Succeeded) return BadRequest(result);
        return Ok(result);
    }

    [HttpPost("validate")]
    public async Task<IActionResult> ValidateCoupon([FromBody] ValidateCouponRequest request)
    {
        var result = await _couponService.ValidateCouponAsync(request);
        return Ok(result);
    }
}
