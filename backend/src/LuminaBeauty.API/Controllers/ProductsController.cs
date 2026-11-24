using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LuminaBeauty.Application.DTOs.Products;
using LuminaBeauty.Application.Services;

namespace LuminaBeauty.API.Controllers;

public class ProductsController : BaseApiController
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    public async Task<IActionResult> GetProducts([FromQuery] ProductFilterParams filter)
    {
        var result = await _productService.GetProductsAsync(filter);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetProductById(int id)
    {
        var result = await _productService.GetProductByIdAsync(id);
        if (!result.Succeeded) return NotFound(result);
        return Ok(result);
    }

    [HttpGet("slug/{slug}")]
    public async Task<IActionResult> GetProductBySlug(string slug)
    {
        var result = await _productService.GetProductBySlugAsync(slug);
        if (!result.Succeeded) return NotFound(result);
        return Ok(result);
    }

    [HttpGet("featured")]
    public async Task<IActionResult> GetFeaturedProducts()
    {
        var products = await _productService.GetFeaturedProductsAsync();
        return Ok(products);
    }

    [HttpGet("bestsellers")]
    public async Task<IActionResult> GetBestSellers()
    {
        var products = await _productService.GetBestSellersAsync();
        return Ok(products);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductRequest request)
    {
        var result = await _productService.CreateProductAsync(request);
        if (!result.Succeeded) return BadRequest(result);
        return CreatedAtAction(nameof(GetProductById), new { id = result.Data!.Id }, result);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateProduct(int id, [FromBody] UpdateProductRequest request)
    {
        if (id != request.Id) return BadRequest("ID mismatch");
        var result = await _productService.UpdateProductAsync(request);
        if (!result.Succeeded) return BadRequest(result);
        return Ok(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var result = await _productService.DeleteProductAsync(id);
        if (!result.Succeeded) return BadRequest(result);
        return Ok(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpPatch("{id:int}/toggle-active")]
    public async Task<IActionResult> ToggleActive(int id)
    {
        var result = await _productService.ToggleProductActiveAsync(id);
        if (!result.Succeeded) return BadRequest(result);
        return Ok(result);
    }
}
