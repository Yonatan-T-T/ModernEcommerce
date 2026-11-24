using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using LuminaBeauty.Application.Common.Interfaces;
using LuminaBeauty.Application.Services;
using LuminaBeauty.Infrastructure.Persistence;
using LuminaBeauty.Infrastructure.Services;

namespace LuminaBeauty.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection") 
                               ?? "Data Source=luminabeauty.db";

        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlite(connectionString));

        services.AddScoped<IApplicationDbContext>(provider => 
            provider.GetRequiredService<ApplicationDbContext>());

        services.AddHttpContextAccessor();

        // Infrastructure Services
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<IFileStorageService, FileStorageService>();

        // Application Services
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<IOrderService, OrderService>();
        services.AddScoped<IInventoryService, InventoryService>();
        services.AddScoped<IAnalyticsService, AnalyticsService>();
        services.AddScoped<ICategoryBrandService, CategoryBrandService>();
        services.AddScoped<ICouponService, CouponService>();
        services.AddScoped<IReviewService, ReviewService>();
        services.AddScoped<ICustomerService, CustomerService>();

        return services;
    }
}
