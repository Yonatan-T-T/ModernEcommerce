using LuminaBeauty.Domain.Entities;

namespace LuminaBeauty.Application.Common.Interfaces;

public interface IJwtTokenService
{
    string GenerateToken(User user);
}

public interface IPasswordHasher
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string passwordHash);
}

public interface ICurrentUserService
{
    int? UserId { get; }
    string? Email { get; }
    string? Role { get; }
    bool IsAdmin { get; }
    bool IsAuthenticated { get; }
}

public interface IFileStorageService
{
    Task<string> SaveFileAsync(Stream fileStream, string fileName, string contentType);
    Task DeleteFileAsync(string relativeUrl);
}
