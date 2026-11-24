using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace LuminaBeauty.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class BaseApiController : ControllerBase
{
    protected int? CurrentUserId
    {
        get
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(idClaim, out var id) ? id : null;
        }
    }

    protected string? CurrentUserRole => User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;

    protected bool IsAdmin => CurrentUserRole == "Admin";
}
