using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LuminaBeauty.Application.DTOs.Orders;
using LuminaBeauty.Application.Services;
using LuminaBeauty.Domain.Enums;

namespace LuminaBeauty.API.Controllers;

public class OrdersController : BaseApiController
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
    {
        var result = await _orderService.CreateOrderAsync(request, CurrentUserId);
        if (!result.Succeeded) return BadRequest(result);
        return Ok(result);
    }

    [Authorize]
    [HttpGet("my-orders")]
    public async Task<IActionResult> GetMyOrders()
    {
        if (!CurrentUserId.HasValue) return Unauthorized();
        var orders = await _orderService.GetUserOrdersAsync(CurrentUserId.Value);
        return Ok(orders);
    }

    [HttpGet("tracking/{orderNumber}")]
    public async Task<IActionResult> TrackOrderByNumber(string orderNumber)
    {
        var result = await _orderService.GetOrderByNumberAsync(orderNumber);
        if (!result.Succeeded) return NotFound(result);
        return Ok(result);
    }

    [Authorize]
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetOrderById(int id)
    {
        var result = await _orderService.GetOrderByIdAsync(id);
        if (!result.Succeeded) return NotFound(result);

        // Security check: non-admin can only see their own order
        if (!IsAdmin && result.Data!.UserId != CurrentUserId)
        {
            return Forbid();
        }

        return Ok(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<IActionResult> GetAllOrders([FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 10, [FromQuery] OrderStatus? status = null)
    {
        var result = await _orderService.GetOrdersAsync(pageIndex, pageSize, status);
        return Ok(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}/status")]
    public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusRequest request)
    {
        var result = await _orderService.UpdateOrderStatusAsync(id, request);
        if (!result.Succeeded) return BadRequest(result);
        return Ok(result);
    }
}
