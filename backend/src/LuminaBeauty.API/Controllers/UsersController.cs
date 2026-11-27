using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LuminaBeauty.Application.DTOs.Common;
using LuminaBeauty.Application.Services;

namespace LuminaBeauty.API.Controllers;

[Authorize]
public class UsersController : BaseApiController
{
    private readonly ICustomerService _customerService;

    public UsersController(ICustomerService customerService)
    {
        _customerService = customerService;
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("customers")]
    public async Task<IActionResult> GetAllCustomers()
    {
        var customers = await _customerService.GetAllCustomersAsync();
        return Ok(customers);
    }

    [HttpGet("wishlist")]
    public async Task<IActionResult> GetMyWishlist()
    {
        if (!CurrentUserId.HasValue) return Unauthorized();
        var productIds = await _customerService.GetUserWishlistProductIdsAsync(CurrentUserId.Value);
        return Ok(productIds);
    }

    [HttpPost("wishlist/toggle/{productId:int}")]
    public async Task<IActionResult> ToggleWishlist(int productId)
    {
        if (!CurrentUserId.HasValue) return Unauthorized();
        var result = await _customerService.ToggleWishlistItemAsync(CurrentUserId.Value, productId);
        return Ok(result);
    }

    [HttpGet("cart")]
    public async Task<IActionResult> GetMyCart()
    {
        if (!CurrentUserId.HasValue) return Unauthorized();
        var items = await _customerService.GetUserCartAsync(CurrentUserId.Value);
        return Ok(items);
    }

    [HttpPut("cart")]
    public async Task<IActionResult> SyncMyCart([FromBody] List<SyncCartItemRequest> items)
    {
        if (!CurrentUserId.HasValue) return Unauthorized();
        var synced = await _customerService.SyncUserCartAsync(CurrentUserId.Value, items);
        return Ok(synced);
    }
}
