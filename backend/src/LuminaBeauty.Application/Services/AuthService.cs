using Microsoft.EntityFrameworkCore;
using LuminaBeauty.Application.Common;
using LuminaBeauty.Application.Common.Interfaces;
using LuminaBeauty.Application.DTOs.Auth;
using LuminaBeauty.Domain.Entities;

namespace LuminaBeauty.Application.Services;

public interface IAuthService
{
    Task<Result<AuthResponse>> RegisterAsync(RegisterRequest request);
    Task<Result<AuthResponse>> LoginAsync(LoginRequest request);
    Task<Result<UserDto>> GetCurrentUserAsync(int userId);
    Task<Result<UserDto>> UpdateProfileAsync(int userId, UpdateProfileRequest request);
    Task<Result<bool>> ChangePasswordAsync(int userId, ChangePasswordRequest request);
}

public class AuthService : IAuthService
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;

    public AuthService(
        IApplicationDbContext context,
        IPasswordHasher passwordHasher,
        IJwtTokenService jwtTokenService)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<Result<AuthResponse>> RegisterAsync(RegisterRequest request)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        if (await _context.Users.AnyAsync(u => u.Email.ToLower() == normalizedEmail))
        {
            return Result<AuthResponse>.Failure("An account with this email address already exists.");
        }

        var user = new User
        {
            FullName = request.FullName.Trim(),
            Email = normalizedEmail,
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            PhoneNumber = request.PhoneNumber?.Trim(),
            Role = "Customer",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = _jwtTokenService.GenerateToken(user);
        var userDto = MapToUserDto(user);

        return Result<AuthResponse>.Success(new AuthResponse { Token = token, User = userDto }, "Registration successful");
    }

    public async Task<Result<AuthResponse>> LoginAsync(LoginRequest request)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);

        if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            return Result<AuthResponse>.Failure("Invalid email or password.");
        }

        if (!user.IsActive)
        {
            return Result<AuthResponse>.Failure("Your account has been deactivated. Please contact support.");
        }

        var token = _jwtTokenService.GenerateToken(user);
        var userDto = MapToUserDto(user);

        return Result<AuthResponse>.Success(new AuthResponse { Token = token, User = userDto }, "Login successful");
    }

    public async Task<Result<UserDto>> GetCurrentUserAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return Result<UserDto>.Failure("User not found.");

        return Result<UserDto>.Success(MapToUserDto(user));
    }

    public async Task<Result<UserDto>> UpdateProfileAsync(int userId, UpdateProfileRequest request)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return Result<UserDto>.Failure("User not found.");

        user.FullName = request.FullName.Trim();
        user.PhoneNumber = request.PhoneNumber?.Trim();
        if (!string.IsNullOrEmpty(request.AvatarUrl))
            user.AvatarUrl = request.AvatarUrl;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Result<UserDto>.Success(MapToUserDto(user), "Profile updated successfully");
    }

    public async Task<Result<bool>> ChangePasswordAsync(int userId, ChangePasswordRequest request)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return Result<bool>.Failure("User not found.");

        if (!_passwordHasher.VerifyPassword(request.CurrentPassword, user.PasswordHash))
            return Result<bool>.Failure("Current password is incorrect.");

        user.PasswordHash = _passwordHasher.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Result<bool>.Success(true, "Password changed successfully");
    }

    private static UserDto MapToUserDto(User user) => new()
    {
        Id = user.Id,
        FullName = user.FullName,
        Email = user.Email,
        Role = user.Role,
        PhoneNumber = user.PhoneNumber,
        AvatarUrl = user.AvatarUrl
    };
}
