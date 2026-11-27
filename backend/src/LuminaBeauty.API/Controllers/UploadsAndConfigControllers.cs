using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LuminaBeauty.Application.Common.Interfaces;

namespace LuminaBeauty.API.Controllers;

public class UploadsController : BaseApiController
{
    private readonly IFileStorageService _fileStorageService;

    public UploadsController(IFileStorageService fileStorageService)
    {
        _fileStorageService = fileStorageService;
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("image")]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "No file uploaded." });
        }

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(ext))
        {
            return BadRequest(new { message = "Invalid file type. Only JPEG, PNG, and WebP are allowed." });
        }

        using var stream = file.OpenReadStream();
        var relativeUrl = await _fileStorageService.SaveFileAsync(stream, file.FileName, file.ContentType);

        return Ok(new { url = relativeUrl });
    }
}

public class ConfigController : BaseApiController
{
    private readonly IConfiguration _config;

    public ConfigController(IConfiguration config)
    {
        _config = config;
    }

    [HttpGet]
    public IActionResult GetStoreConfig()
    {
        var storeSettings = new
        {
            StoreName = _config["StoreSettings:StoreName"] ?? "Lumina Beauty",
            Tagline = _config["StoreSettings:Tagline"] ?? "Pure Luxury. Ageless Radiance.",
            Currency = _config["StoreSettings:Currency"] ?? "ETB",
            CurrencySymbol = _config["StoreSettings:CurrencySymbol"] ?? "ETB ",
            FreeShippingThreshold = decimal.TryParse(_config["StoreSettings:FreeShippingThreshold"], out var threshold) ? threshold : 75.00m,
            StandardShippingFee = decimal.TryParse(_config["StoreSettings:StandardShippingFee"], out var fee) ? fee : 7.99m
        };

        return Ok(storeSettings);
    }
}
