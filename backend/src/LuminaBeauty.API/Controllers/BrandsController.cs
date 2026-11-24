using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LuminaBeauty.Application.DTOs.Common;
using LuminaBeauty.Application.Services;

namespace LuminaBeauty.API.Controllers;

public class BrandsController : BaseApiController
{
    private readonly ICategoryBrandService _service;

    public BrandsController(ICategoryBrandService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetBrands([FromQuery] bool includeInactive = false)
    {
        var items = await _service.GetBrandsAsync(includeInactive);
        return Ok(items);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> CreateBrand([FromBody] CreateBrandRequest request)
    {
        var result = await _service.CreateBrandAsync(request);
        if (!result.Succeeded) return BadRequest(result);
        return Ok(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateBrand(int id, [FromBody] CreateBrandRequest request)
    {
        var result = await _service.UpdateBrandAsync(id, request);
        if (!result.Succeeded) return BadRequest(result);
        return Ok(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteBrand(int id)
    {
        var result = await _service.DeleteBrandAsync(id);
        if (!result.Succeeded) return BadRequest(result);
        return Ok(result);
    }
}
