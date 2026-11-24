using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LuminaBeauty.Application.Services;

namespace LuminaBeauty.API.Controllers;

[Authorize(Roles = "Admin")]
public class AnalyticsController : BaseApiController
{
    private readonly IAnalyticsService _analyticsService;

    public AnalyticsController(IAnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var data = await _analyticsService.GetDashboardAnalyticsAsync();
        return Ok(data);
    }
}
