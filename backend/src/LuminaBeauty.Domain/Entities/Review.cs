using LuminaBeauty.Domain.Common;

namespace LuminaBeauty.Domain.Entities;

public class Review : BaseEntity
{
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public int? UserId { get; set; }
    public User? User { get; set; }

    public string AuthorName { get; set; } = string.Empty;
    public int Rating { get; set; } // 1 to 5
    public string Title { get; set; } = string.Empty;
    public string Comment { get; set; } = string.Empty;
    public bool IsVerifiedPurchase { get; set; }
    public bool IsApproved { get; set; } = true;
}
