using LuminaBeauty.Domain.Common;

namespace LuminaBeauty.Domain.Entities;

public class Address : BaseEntity
{
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public string FullName { get; set; } = string.Empty;
    public string StreetAddress { get; set; } = string.Empty;
    public string? Apartment { get; set; }
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public string Country { get; set; } = "United States";
    public string? PhoneNumber { get; set; }
    public bool IsDefaultShipping { get; set; }
    public bool IsDefaultBilling { get; set; }
}
