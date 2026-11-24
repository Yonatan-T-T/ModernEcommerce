using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LuminaBeauty.Application.DTOs.Common;
using LuminaBeauty.Application.Services;

namespace LuminaBeauty.API.Controllers;

public class CategoriesController : BaseApiController
{
    private readonly ICategoryBrandService _service;

    public CategoriesController(ICategoryBrandService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetCategories([FromQuery] bool includeInactive = false)
    {
        var items = await _service.GetCategoriesAsync(includeInactive);
        return Ok(items);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryRequest request)
    {
        var result = await _service.CreateCategoryAsync(request);
        if (!result.Succeeded) return BadRequest(result);
        return Ok(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateCategory(int id, [FromBody] CreateCategoryRequest request)
    {
        var result = await _service.UpdateCategoryAsync(id, request);
        if (!result.Succeeded) return BadRequest(result);
        return Ok(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var result = await _service.DeleteCategoryAsync(id);
        if (!result.Succeeded) return BadRequest(result);
        return Ok(result);
    }
}
