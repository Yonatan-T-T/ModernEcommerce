using Microsoft.AspNetCore.Hosting;
using LuminaBeauty.Application.Common.Interfaces;

namespace LuminaBeauty.Infrastructure.Services;

public class FileStorageService : IFileStorageService
{
    private readonly IWebHostEnvironment _env;

    public FileStorageService(IWebHostEnvironment env)
    {
        _env = env;
    }

    public async Task<string> SaveFileAsync(Stream fileStream, string fileName, string contentType)
    {
        var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var uploadsDir = Path.Combine(webRoot, "uploads");

        if (!Directory.Exists(uploadsDir))
        {
            Directory.CreateDirectory(uploadsDir);
        }

        var ext = Path.GetExtension(fileName);
        var uniqueFileName = $"{Guid.NewGuid():N}{ext}";
        var filePath = Path.Combine(uploadsDir, uniqueFileName);

        using (var dest = new FileStream(filePath, FileMode.Create))
        {
            await fileStream.CopyToAsync(dest);
        }

        return $"/uploads/{uniqueFileName}";
    }

    public Task DeleteFileAsync(string relativeUrl)
    {
        if (string.IsNullOrWhiteSpace(relativeUrl)) return Task.CompletedTask;

        var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var trimmed = relativeUrl.TrimStart('/');
        var filePath = Path.Combine(webRoot, trimmed);

        if (File.Exists(filePath))
        {
            File.Delete(filePath);
        }

        return Task.CompletedTask;
    }
}
