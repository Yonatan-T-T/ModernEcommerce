using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using LuminaBeauty.Application.Common.Interfaces;

namespace LuminaBeauty.Infrastructure.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    private ClaimsPrincipal? User => _httpContextAccessor.HttpContext?.User;

    public int? UserId
    {
        get
        {
            var idClaim = User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(idClaim, out var id) ? id : null;
        }
    }

    public string? Email => User?.FindFirst(ClaimTypes.Email)?.Value;

    public string? Role => User?.FindFirst(ClaimTypes.Role)?.Value ?? User?.FindFirst("role")?.Value;

    public bool IsAdmin => Role == "Admin";

    public bool IsAuthenticated => User?.Identity?.IsAuthenticated ?? false;
}
