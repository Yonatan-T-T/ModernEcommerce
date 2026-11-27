using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using LuminaBeauty.Application.DTOs.Auth;
using LuminaBeauty.Application.Services;

namespace LuminaBeauty.API.Controllers;

public class AuthController : BaseApiController
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [EnableRateLimiting("auth")]
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var result = await _authService.RegisterAsync(request);
        if (!result.Succeeded) return BadRequest(result);
        return Ok(result);
    }

    [EnableRateLimiting("auth")]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var result = await _authService.LoginAsync(request);
        if (!result.Succeeded) return BadRequest(result);
        return Ok(result);
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        if (!CurrentUserId.HasValue) return Unauthorized();
        var result = await _authService.GetCurrentUserAsync(CurrentUserId.Value);
        if (!result.Succeeded) return NotFound(result);
        return Ok(result);
    }

    [Authorize]
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        if (!CurrentUserId.HasValue) return Unauthorized();
        var result = await _authService.UpdateProfileAsync(CurrentUserId.Value, request);
        if (!result.Succeeded) return BadRequest(result);
        return Ok(result);
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        if (!CurrentUserId.HasValue) return Unauthorized();
        var result = await _authService.ChangePasswordAsync(CurrentUserId.Value, request);
        if (!result.Succeeded) return BadRequest(result);
        return Ok(result);
    }
}
