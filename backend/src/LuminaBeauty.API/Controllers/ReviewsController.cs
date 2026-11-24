using Microsoft.AspNetCore.Mvc;
using LuminaBeauty.Application.DTOs.Common;
using LuminaBeauty.Application.Services;

namespace LuminaBeauty.API.Controllers;

public class ReviewsController : BaseApiController
{
    private readonly IReviewService _reviewService;

    public ReviewsController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    [HttpGet("product/{productId:int}")]
    public async Task<IActionResult> GetProductReviews(int productId)
    {
        var reviews = await _reviewService.GetProductReviewsAsync(productId);
        return Ok(reviews);
    }

    [HttpPost]
    public async Task<IActionResult> AddReview([FromBody] CreateReviewRequest request)
    {
        var result = await _reviewService.AddReviewAsync(request, CurrentUserId);
        if (!result.Succeeded) return BadRequest(result);
        return Ok(result);
    }
}
