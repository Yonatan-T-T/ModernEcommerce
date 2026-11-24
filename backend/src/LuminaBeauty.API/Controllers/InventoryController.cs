using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LuminaBeauty.Application.DTOs.Inventory;
using LuminaBeauty.Application.Services;

namespace LuminaBeauty.API.Controllers;

[Authorize(Roles = "Admin")]
public class InventoryController : BaseApiController
{
    private readonly IInventoryService _inventoryService;

    public InventoryController(IInventoryService inventoryService)
    {
        _inventoryService = inventoryService;
    }

    [HttpGet("overview")]
    public async Task<IActionResult> GetInventoryOverview()
    {
        var items = await _inventoryService.GetInventoryOverviewAsync();
        return Ok(items);
    }

    [HttpGet("low-stock")]
    public async Task<IActionResult> GetLowStockItems()
    {
        var items = await _inventoryService.GetLowStockItemsAsync();
        return Ok(items);
    }

    [HttpPost("adjust")]
    public async Task<IActionResult> AdjustStock([FromBody] StockAdjustmentRequest request)
    {
        var adminName = User.Identity?.Name ?? "Admin";
        var result = await _inventoryService.AdjustStockAsync(request, adminName);
        if (!result.Succeeded) return BadRequest(result);
        return Ok(result);
    }

    [HttpGet("transactions")]
    public async Task<IActionResult> GetTransactions([FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 20, [FromQuery] int? productId = null)
    {
        var result = await _inventoryService.GetTransactionsAsync(pageIndex, pageSize, productId);
        return Ok(result);
    }
}
