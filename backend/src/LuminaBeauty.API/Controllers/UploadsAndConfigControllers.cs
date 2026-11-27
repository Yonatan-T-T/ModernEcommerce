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
    [RequestSizeLimit(5 * 1024 * 1024)]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "No file uploaded." });
        }

        if (file.Length > 5 * 1024 * 1024)
        {
            return BadRequest(new { message = "File size cannot exceed 5 MB." });
        }

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(ext))
        {
            return BadRequest(new { message = "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed." });
        }

        using var stream = file.OpenReadStream();
        if (!HasValidImageMagicBytes(stream, ext))
        {
            return BadRequest(new { message = "Uploaded file content does not match a valid image signature." });
        }
        stream.Position = 0;

        var safeFileName = $"{Guid.NewGuid():N}{ext}";
        var relativeUrl = await _fileStorageService.SaveFileAsync(stream, safeFileName, file.ContentType);

        return Ok(new { url = relativeUrl });
    }

    private static bool HasValidImageMagicBytes(Stream stream, string ext)
    {
        Span<byte> header = stackalloc byte[12];
        var bytesRead = stream.Read(header);
        if (bytesRead < 4) return false;

        return ext switch
        {
            ".jpg" or ".jpeg" => header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF,
            ".png" => bytesRead >= 8 && header[0] == 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47,
            ".gif" => header[0] == 0x47 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x38,
            ".webp" => bytesRead >= 12 && header[0] == 0x52 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x46
                                       && header[8] == 0x57 && header[9] == 0x45 && header[10] == 0x42 && header[11] == 0x50,
            _ => false
        };
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
            FreeShippingThreshold = decimal.TryParse(_config["StoreSettings:FreeShippingThreshold"], out var threshold) ? threshold : 10000.00m,
            StandardShippingFee = decimal.TryParse(_config["StoreSettings:StandardShippingFee"], out var fee) ? fee : 400.00m
        };

        return Ok(storeSettings);
    }
}
