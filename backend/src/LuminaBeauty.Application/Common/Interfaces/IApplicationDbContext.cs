using Microsoft.EntityFrameworkCore;
using LuminaBeauty.Domain.Entities;

namespace LuminaBeauty.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Product> Products { get; }
    DbSet<ProductImage> ProductImages { get; }
    DbSet<ProductVariant> ProductVariants { get; }
    DbSet<Category> Categories { get; }
    DbSet<Brand> Brands { get; }
    DbSet<User> Users { get; }
    DbSet<Address> Addresses { get; }
    DbSet<Order> Orders { get; }
    DbSet<OrderItem> OrderItems { get; }
    DbSet<InventoryTransaction> InventoryTransactions { get; }
    DbSet<Review> Reviews { get; }
    DbSet<Coupon> Coupons { get; }
    DbSet<WishlistItem> WishlistItems { get; }
    DbSet<CartItem> CartItems { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
