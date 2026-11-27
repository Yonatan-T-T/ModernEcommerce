using LuminaBeauty.Application.Common.Interfaces;
using LuminaBeauty.Domain.Entities;
using LuminaBeauty.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace LuminaBeauty.Infrastructure.Persistence;

public static class DbInitializer
{
    public static async Task SeedAsync(ApplicationDbContext context, IPasswordHasher passwordHasher)
    {
        await context.Database.EnsureCreatedAsync();

        // Ensure CartItems table exists even on previously created SQLite databases
        await context.Database.ExecuteSqlRawAsync(@"
            CREATE TABLE IF NOT EXISTS ""CartItems"" (
                ""Id"" INTEGER NOT NULL CONSTRAINT ""PK_CartItems"" PRIMARY KEY AUTOINCREMENT,
                ""UserId"" INTEGER NOT NULL,
                ""ProductId"" INTEGER NOT NULL,
                ""ProductVariantId"" INTEGER NULL,
                ""Quantity"" INTEGER NOT NULL,
                ""CreatedAt"" TEXT NOT NULL,
                ""UpdatedAt"" TEXT NULL,
                CONSTRAINT ""FK_CartItems_Users_UserId"" FOREIGN KEY (""UserId"") REFERENCES ""Users"" (""Id"") ON DELETE CASCADE,
                CONSTRAINT ""FK_CartItems_Products_ProductId"" FOREIGN KEY (""ProductId"") REFERENCES ""Products"" (""Id"") ON DELETE CASCADE,
                CONSTRAINT ""FK_CartItems_ProductVariants_ProductVariantId"" FOREIGN KEY (""ProductVariantId"") REFERENCES ""ProductVariants"" (""Id"") ON DELETE SET NULL
            );
        ");

        await EnsureColumnExistsAsync(context, "Products", "WeightGrams", "TEXT NOT NULL DEFAULT '150'");
        await EnsureColumnExistsAsync(context, "ProductVariants", "WeightGrams", "TEXT NULL");

        if (context.Users.Any())
        {
            // Repair any broken seeded Unsplash URLs in existing DBs
            const string brokenUrlFragment = "photo-1608248597359-0097d446b142";
            var brokenCategories = context.Categories.Where(c => c.ImageUrl != null && c.ImageUrl.Contains(brokenUrlFragment)).ToList();
            foreach (var cat in brokenCategories)
            {
                cat.ImageUrl = "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&q=80&w=800";
            }

            var brokenImages = context.ProductImages.Where(i => i.ImageUrl.Contains(brokenUrlFragment)).ToList();
            foreach (var img in brokenImages)
            {
                img.ImageUrl = "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800";
            }

            if (brokenCategories.Count > 0 || brokenImages.Count > 0)
            {
                await context.SaveChangesAsync();
            }

            return; // DB has been seeded
        }

        // 1. Seed Users
        var admin = new User
        {
            FullName = "Elena Rostova",
            Email = "admin@luminabeauty.com",
            PasswordHash = passwordHasher.HashPassword("Admin123!"),
            Role = "Admin",
            PhoneNumber = "+1 (555) 019-2834",
            AvatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
            IsActive = true,
            CreatedAt = DateTime.UtcNow.AddMonths(-3)
        };

        var customer = new User
        {
            FullName = "Sarah Jenkins",
            Email = "sarah.j@example.com",
            PasswordHash = passwordHasher.HashPassword("Customer123!"),
            Role = "Customer",
            PhoneNumber = "+1 (555) 438-9210",
            AvatarUrl = "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400",
            IsActive = true,
            CreatedAt = DateTime.UtcNow.AddMonths(-2)
        };

        var customer2 = new User
        {
            FullName = "Camille Laurent",
            Email = "camille.l@example.com",
            PasswordHash = passwordHasher.HashPassword("Customer123!"),
            Role = "Customer",
            PhoneNumber = "+1 (555) 782-1144",
            AvatarUrl = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400",
            IsActive = true,
            CreatedAt = DateTime.UtcNow.AddMonths(-1)
        };

        context.Users.AddRange(admin, customer, customer2);
        await context.SaveChangesAsync();

        // 2. Seed Addresses
        var sarahAddress = new Address
        {
            UserId = customer.Id,
            FullName = "Sarah Jenkins",
            StreetAddress = "742 Evergreen Terrace",
            Apartment = "Suite 4B",
            City = "Beverly Hills",
            State = "CA",
            PostalCode = "90210",
            Country = "United States",
            PhoneNumber = "+1 (555) 438-9210",
            IsDefaultShipping = true,
            IsDefaultBilling = true
        };
        context.Addresses.Add(sarahAddress);

        // 3. Seed Categories
        var catSkincare = new Category
        {
            Name = "Skincare",
            Slug = "skincare",
            Description = "Nourishing, dermatologically formulated serums, rich creams, and revitalizing elixirs.",
            ImageUrl = "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800",
            IsActive = true,
            DisplayOrder = 1
        };

        var catMakeup = new Category
        {
            Name = "Makeup",
            Slug = "makeup",
            Description = "Weightless foundations, satin lipsticks, and radiant mineral pigments.",
            ImageUrl = "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800",
            IsActive = true,
            DisplayOrder = 2
        };

        var catFragrance = new Category
        {
            Name = "Fragrance",
            Slug = "fragrance",
            Description = "Artisanal fragrances distilled with rare florals, amber, and exotic woods.",
            ImageUrl = "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800",
            IsActive = true,
            DisplayOrder = 3
        };

        var catBodyHair = new Category
        {
            Name = "Body & Hair",
            Slug = "body-hair",
            Description = "Botanical hair oils, decadent body soufflés, and restorative treatments.",
            ImageUrl = "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&q=80&w=800",
            IsActive = true,
            DisplayOrder = 4
        };

        context.Categories.AddRange(catSkincare, catMakeup, catFragrance, catBodyHair);
        await context.SaveChangesAsync();

        // 4. Seed Brands
        var brandLumina = new Brand
        {
            Name = "Lumina Atelier",
            Slug = "lumina-atelier",
            Description = "The signature house of Lumina Beauty. Pure science meets Parisian high-fashion elegance.",
            LogoUrl = "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=200",
            WebsiteUrl = "https://luminabeauty.com",
            IsActive = true
        };

        var brandSoie = new Brand
        {
            Name = "Maison de Soie",
            Slug = "maison-de-soie",
            Description = "Silk-infused formulations with micro-encapsulated hydration from Provence.",
            LogoUrl = "https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&q=80&w=200",
            WebsiteUrl = "https://maison-soie.fr",
            IsActive = true
        };

        var brandAura = new Brand
        {
            Name = "Aura Botanica",
            Slug = "aura-botanica",
            Description = "Wildcrafted cold-pressed botanical active serums that restore skin vitality.",
            LogoUrl = "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=200",
            WebsiteUrl = "https://aurabotanica.bio",
            IsActive = true
        };

        var brandNoir = new Brand
        {
            Name = "Velvet & Noir",
            Slug = "velvet-noir",
            Description = "Intense pigments, velvety textures, and runway-ready cosmetic artistry.",
            LogoUrl = "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=200",
            WebsiteUrl = "https://velvetnoir.com",
            IsActive = true
        };

        context.Brands.AddRange(brandLumina, brandSoie, brandAura, brandNoir);
        await context.SaveChangesAsync();

        // 5. Seed Products with Variants & Images
        var p1 = new Product
        {
            Name = "Celestial Radiance Peptide Serum",
            Slug = "celestial-radiance-peptide-serum",
            ShortDescription = "An ultra-concentrated multi-peptide elixir that smooths fine lines and restores luminous clarity.",
            Description = "Infused with 5 bio-identical peptides, multi-molecular hyaluronic acid, and 24k gold leaf extract, Celestial Radiance melts instantly into the skin. Clinical trials showed a 94% improvement in skin radiance within 7 days. Free from parabens, sulfates, and synthetic fragrances.",
            Sku = "LB-SKIN-001",
            Price = 98.00m,
            CostPrice = 22.50m,
            CompareAtPrice = 120.00m,
            WeightGrams = 120m,
            CategoryId = catSkincare.Id,
            BrandId = brandLumina.Id,
            SkinType = SkinType.All,
            Ingredients = "Aqua, Niacinamide, Acetyl Hexapeptide-8, Palmitoyl Tripeptide-1, Palmitoyl Tetrapeptide-7, Sodium Hyaluronate, 24K Gold Flakes, Rosa Damascena Flower Water, Glycerin, Phenoxyethanol.",
            HowToUse = "Warm 3-4 drops between fingertips and gently press onto freshly cleansed face and neck morning and evening before your moisturizer.",
            StockQuantity = 45,
            LowStockThreshold = 10,
            IsActive = true,
            IsFeatured = true,
            IsBestSeller = true,
            Rating = 4.9,
            ReviewCount = 38,
            CreatedAt = DateTime.UtcNow.AddMonths(-2),
            Images = new List<ProductImage>
            {
                new() { ImageUrl = "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800", IsPrimary = true, DisplayOrder = 0, AltText = "Celestial Radiance Bottle" },
                new() { ImageUrl = "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&q=80&w=800", IsPrimary = false, DisplayOrder = 1, AltText = "Serum Dropper Texture" }
            },
            Variants = new List<ProductVariant>
            {
                new() { Sku = "LB-SKIN-001-30", VariantName = "30ml Travel Size", Size = "30ml", Price = 98.00m, CostPrice = 22.50m, WeightGrams = 120m, StockQuantity = 25, IsActive = true },
                new() { Sku = "LB-SKIN-001-50", VariantName = "50ml Full Size", Size = "50ml", Price = 145.00m, CostPrice = 32.00m, WeightGrams = 180m, StockQuantity = 20, IsActive = true }
            }
        };

        var p2 = new Product
        {
            Name = "Velvet Veil Silk Luminous Foundation",
            Slug = "velvet-veil-silk-foundation",
            ShortDescription = "Weightless medium-to-full buildable coverage with a luminous, real-skin satin finish.",
            Description = "Formulated with pure silk proteins and light-diffusing prismatic pearls, Velvet Veil blurs imperfections while allowing natural skin texture to glow. 16-hour sweat and humidity-resistant wear that never creases or settles into pores.",
            Sku = "LB-MAKE-002",
            Price = 64.00m,
            CostPrice = 14.80m,
            CompareAtPrice = 75.00m,
            WeightGrams = 180m,
            CategoryId = catMakeup.Id,
            BrandId = brandSoie.Id,
            SkinType = SkinType.Combination,
            Ingredients = "Dimethicone, Aqua, Isododecane, Hydrolyzed Silk, Squalane, Titanium Dioxide, Iron Oxides, Tocopherol, Camellia Sinensis Leaf Extract.",
            HowToUse = "Dispense 1-2 pumps onto the back of your hand. Blend outward from the center of the face using a damp beauty sponge or buffer brush.",
            StockQuantity = 52,
            LowStockThreshold = 15,
            IsActive = true,
            IsFeatured = true,
            IsBestSeller = true,
            Rating = 4.8,
            ReviewCount = 64,
            CreatedAt = DateTime.UtcNow.AddMonths(-2),
            Images = new List<ProductImage>
            {
                new() { ImageUrl = "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800", IsPrimary = true, DisplayOrder = 0, AltText = "Velvet Veil Bottle" },
                new() { ImageUrl = "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800", IsPrimary = false, DisplayOrder = 1, AltText = "Foundation Swatches" }
            },
            Variants = new List<ProductVariant>
            {
                new() { Sku = "LB-MAKE-002-01", VariantName = "01 Alabaster (Fair Cool)", Shade = "01 Alabaster", ShadeColorHex = "#F7ECE1", Price = 64.00m, CostPrice = 14.80m, StockQuantity = 12, IsActive = true },
                new() { Sku = "LB-MAKE-002-02", VariantName = "02 Warm Beige (Light Neutral)", Shade = "02 Warm Beige", ShadeColorHex = "#EED4BA", Price = 64.00m, CostPrice = 14.80m, StockQuantity = 18, IsActive = true },
                new() { Sku = "LB-MAKE-002-03", VariantName = "03 Golden Honey (Medium Warm)", Shade = "03 Golden Honey", ShadeColorHex = "#D7AA83", Price = 64.00m, CostPrice = 14.80m, StockQuantity = 14, IsActive = true },
                new() { Sku = "LB-MAKE-002-04", VariantName = "04 Rich Espresso (Deep Neutral)", Shade = "04 Rich Espresso", ShadeColorHex = "#7A4E39", Price = 64.00m, CostPrice = 14.80m, StockQuantity = 8, IsActive = true }
            }
        };

        var p3 = new Product
        {
            Name = "Rose Damascena Youth Infusion Creme",
            Slug = "rose-damascena-youth-creme",
            ShortDescription = "Rich antioxidant moisture balm distilled from organic Bulgarian Damask roses and ceramides.",
            Description = "Envelop your skin in decadent, petal-soft moisture. Formulated with three distinct ceramides, organic wild rosehip seed oil, and plant-derived squalane, this ultra-rich cream repairs the moisture barrier overnight for bouncy, deeply hydrated skin.",
            Sku = "LB-SKIN-003",
            Price = 115.00m,
            CostPrice = 28.00m,
            CompareAtPrice = 135.00m,
            WeightGrams = 250m,
            CategoryId = catSkincare.Id,
            BrandId = brandAura.Id,
            SkinType = SkinType.Dry,
            Ingredients = "Rosa Damascena Flower Water, Butyrospermum Parkii (Shea) Butter, Caprylic/Capric Triglyceride, Ceramide NP, Ceramide AP, Ceramide EOP, Phytosphingosine, Rosa Canina Fruit Oil, Squalane.",
            HowToUse = "Warm a pearl-sized amount between clean palms and press gently into face, neck, and décolletage after serums.",
            StockQuantity = 28,
            LowStockThreshold = 8,
            IsActive = true,
            IsFeatured = true,
            IsBestSeller = false,
            Rating = 5.0,
            ReviewCount = 22,
            CreatedAt = DateTime.UtcNow.AddMonths(-1),
            Images = new List<ProductImage>
            {
                new() { ImageUrl = "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800", IsPrimary = true, DisplayOrder = 0, AltText = "Rose Damascena Jar" }
            },
            Variants = new List<ProductVariant>
            {
                new() { Sku = "LB-SKIN-003-50", VariantName = "50ml Luxury Jar", Size = "50ml", Price = 115.00m, CostPrice = 28.00m, StockQuantity = 28, IsActive = true }
            }
        };

        var p4 = new Product
        {
            Name = "L'Orangerie Nocturne Eau de Parfum",
            Slug = "lorangerie-nocturne-eau-de-parfum",
            ShortDescription = "An intoxicating blend of night-blooming jasmine, Sicilian neroli, smoked amber, and bourbon vanilla.",
            Description = "Created by master perfumers in Grasse, L'Orangerie Nocturne evokes midnight walks through candlelit Mediterranean citrus groves. Opening with zesty bergamot and bitter orange, drying down to velvety vanilla orchid and Haitian vetiver.",
            Sku = "LB-FRAG-004",
            Price = 165.00m,
            CostPrice = 36.00m,
            CompareAtPrice = 185.00m,
            WeightGrams = 320m,
            CategoryId = catFragrance.Id,
            BrandId = brandLumina.Id,
            SkinType = SkinType.All,
            Ingredients = "Alcohol Denat., Parfum, Aqua, Limonene, Linalool, Benzyl Salicylate, Coumarin, Citral, Geraniol.",
            HowToUse = "Mist onto pulse points — wrists, inner elbows, and base of the throat. Allow to settle naturally without rubbing.",
            StockQuantity = 19,
            LowStockThreshold = 5,
            IsActive = true,
            IsFeatured = true,
            IsBestSeller = true,
            Rating = 4.9,
            ReviewCount = 47,
            CreatedAt = DateTime.UtcNow.AddMonths(-2),
            Images = new List<ProductImage>
            {
                new() { ImageUrl = "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800", IsPrimary = true, DisplayOrder = 0, AltText = "L'Orangerie Nocturne Flacon" }
            },
            Variants = new List<ProductVariant>
            {
                new() { Sku = "LB-FRAG-004-50", VariantName = "50ml Glass Flacon", Size = "50ml", Price = 165.00m, CostPrice = 36.00m, WeightGrams = 320m, StockQuantity = 11, IsActive = true },
                new() { Sku = "LB-FRAG-004-100", VariantName = "100ml Grand Flacon", Size = "100ml", Price = 240.00m, CostPrice = 49.00m, WeightGrams = 520m, StockQuantity = 8, IsActive = true }
            }
        };

        var p5 = new Product
        {
            Name = "Rouge Royale Velvet Satin Lipstick",
            Slug = "rouge-royale-velvet-lipstick",
            ShortDescription = "Couture pigmented lipstick enriched with camellia oil and hyaluronic microspheres.",
            Description = "A magnetic luxury case housing vibrant, ultra-rich pigments. Glides across lips with cloud-like glide, providing 10-hour non-drying satin comfort. Won't feather or fade.",
            Sku = "LB-MAKE-005",
            Price = 42.00m,
            CostPrice = 9.20m,
            CompareAtPrice = 48.00m,
            WeightGrams = 85m,
            CategoryId = catMakeup.Id,
            BrandId = brandNoir.Id,
            SkinType = SkinType.All,
            Ingredients = "Octyldodecanol, Polyethylene, Ricinus Communis Seed Oil, Camellia Japonica Seed Oil, Sodium Hyaluronate, CI 15850 (Red 7 Lake), CI 77891.",
            HowToUse = "Swipe directly across lips starting from cupid's bow outwards. Layer for intense evening drama.",
            StockQuantity = 6, // Low stock demo!
            LowStockThreshold = 10,
            IsActive = true,
            IsFeatured = false,
            IsBestSeller = true,
            Rating = 4.7,
            ReviewCount = 53,
            CreatedAt = DateTime.UtcNow.AddMonths(-1),
            Images = new List<ProductImage>
            {
                new() { ImageUrl = "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=800", IsPrimary = true, DisplayOrder = 0, AltText = "Rouge Royale Lipstick" }
            },
            Variants = new List<ProductVariant>
            {
                new() { Sku = "LB-MAKE-005-01", VariantName = "01 Scarlet Empress (True Red)", Shade = "Scarlet Empress", ShadeColorHex = "#B31312", Price = 42.00m, CostPrice = 9.20m, StockQuantity = 2, IsActive = true },
                new() { Sku = "LB-MAKE-005-02", VariantName = "02 Nude Cashmere (Warm Rose Nude)", Shade = "Nude Cashmere", ShadeColorHex = "#C68B79", Price = 42.00m, CostPrice = 9.20m, StockQuantity = 4, IsActive = true }
            }
        };

        var p6 = new Product
        {
            Name = "Botanical Golden Nectar Hair & Body Oil",
            Slug = "botanical-golden-nectar-oil",
            ShortDescription = "Multi-purpose dry oil treatment with pure cold-pressed marula, argan, and camellia oils.",
            Description = "Leaves skin supple and hair lustrous with zero greasy residue. Infused with delicate notes of white tea, freesia, and warm cedarwood. Absorbs immediately to lock in deep moisture and impart an angelic sheen.",
            Sku = "LB-BODY-006",
            Price = 72.00m,
            CostPrice = 16.50m,
            CompareAtPrice = 85.00m,
            WeightGrams = 350m,
            CategoryId = catBodyHair.Id,
            BrandId = brandAura.Id,
            SkinType = SkinType.All,
            Ingredients = "Sclerocarya Birrea (Marula) Seed Oil, Argania Spinosa Kernel Oil, Camellia Oleifera Seed Oil, Simmondsia Chinensis Seed Oil, Tocopherol, Parfum.",
            HowToUse = "Warm a few drops between hands. Smooth over damp or dry body skin, or through the mid-lengths and ends of hair.",
            StockQuantity = 34,
            LowStockThreshold = 10,
            IsActive = true,
            IsFeatured = false,
            IsBestSeller = false,
            Rating = 4.8,
            ReviewCount = 19,
            CreatedAt = DateTime.UtcNow.AddMonths(-1),
            Images = new List<ProductImage>
            {
                new() { ImageUrl = "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800", IsPrimary = true, DisplayOrder = 0, AltText = "Golden Nectar Bottle" }
            },
            Variants = new List<ProductVariant>
            {
                new() { Sku = "LB-BODY-006-100", VariantName = "100ml Glass Bottle", Size = "100ml", Price = 72.00m, CostPrice = 16.50m, StockQuantity = 34, IsActive = true }
            }
        };

        context.Products.AddRange(p1, p2, p3, p4, p5, p6);
        await context.SaveChangesAsync();

        // 6. Seed Coupons
        var c1 = new Coupon
        {
            Code = "LUMINA15",
            Description = "15% off your entire order on orders over $50",
            DiscountType = DiscountType.Percentage,
            DiscountValue = 15m,
            MinimumSpend = 50.00m,
            MaxDiscountAmount = 50.00m,
            IsActive = true,
            ExpiryDate = DateTime.UtcNow.AddYears(1)
        };

        var c2 = new Coupon
        {
            Code = "WELCOME20",
            Description = "20% off for first-time shoppers",
            DiscountType = DiscountType.Percentage,
            DiscountValue = 20m,
            MinimumSpend = 75.00m,
            MaxDiscountAmount = 75.00m,
            IsActive = true,
            ExpiryDate = DateTime.UtcNow.AddYears(1)
        };

        var c3 = new Coupon
        {
            Code = "LUXURY50",
            Description = "$50 off VIP orders exceeding $200",
            DiscountType = DiscountType.FixedAmount,
            DiscountValue = 50.00m,
            MinimumSpend = 200.00m,
            IsActive = true,
            ExpiryDate = DateTime.UtcNow.AddYears(1)
        };

        context.Coupons.AddRange(c1, c2, c3);
        await context.SaveChangesAsync();

        // 7. Seed Initial Orders with realistic profit calculation
        var initialOrder1 = new Order
        {
            OrderNumber = "LB-20241118-4291",
            UserId = customer.Id,
            CustomerName = "Sarah Jenkins",
            CustomerEmail = "sarah.j@example.com",
            CustomerPhone = "+1 (555) 438-9210",
            ShippingAddressJson = JsonSerializer.Serialize(new
            {
                FullName = "Sarah Jenkins",
                StreetAddress = "742 Evergreen Terrace",
                Apartment = "Suite 4B",
                City = "Beverly Hills",
                State = "CA",
                PostalCode = "90210",
                Country = "United States"
            }),
            Status = OrderStatus.Delivered,
            PaymentStatus = PaymentStatus.Paid,
            PaymentMethod = "CreditCard",
            SubTotal = 162.00m,
            DiscountAmount = 24.30m,
            CouponCode = "LUMINA15",
            ShippingFee = 0m,
            TotalAmount = 137.70m,
            TotalCost = 37.30m,
            NetProfit = 100.40m, // (162 - 24.30) - 37.30
            TrackingNumber = "1Z9999999999999999",
            CreatedAt = DateTime.UtcNow.AddDays(-6),
            ShippedAt = DateTime.UtcNow.AddDays(-5),
            DeliveredAt = DateTime.UtcNow.AddDays(-3),
            Items = new List<OrderItem>
            {
                new()
                {
                    ProductId = p1.Id,
                    ProductVariantId = p1.Variants.First().Id,
                    ProductName = p1.Name,
                    VariantName = "30ml Travel Size",
                    ProductImageUrl = p1.Images.First().ImageUrl,
                    UnitPrice = 98.00m,
                    UnitCost = 22.50m,
                    Quantity = 1
                },
                new()
                {
                    ProductId = p2.Id,
                    ProductVariantId = p2.Variants.First().Id,
                    ProductName = p2.Name,
                    VariantName = "01 Alabaster",
                    ProductImageUrl = p2.Images.First().ImageUrl,
                    UnitPrice = 64.00m,
                    UnitCost = 14.80m,
                    Quantity = 1
                }
            }
        };

        var initialOrder2 = new Order
        {
            OrderNumber = "LB-20241120-7712",
            UserId = customer2.Id,
            CustomerName = "Camille Laurent",
            CustomerEmail = "camille.l@example.com",
            CustomerPhone = "+1 (555) 782-1144",
            ShippingAddressJson = JsonSerializer.Serialize(new
            {
                FullName = "Camille Laurent",
                StreetAddress = "450 Sutter St",
                Apartment = "Apt 12",
                City = "San Francisco",
                State = "CA",
                PostalCode = "94108",
                Country = "United States"
            }),
            Status = OrderStatus.Shipped,
            PaymentStatus = PaymentStatus.Paid,
            PaymentMethod = "ApplePay",
            SubTotal = 165.00m,
            DiscountAmount = 0m,
            ShippingFee = 0m,
            TotalAmount = 165.00m,
            TotalCost = 36.00m,
            NetProfit = 129.00m, // 165 - 36
            TrackingNumber = "1Z8888888888888888",
            CreatedAt = DateTime.UtcNow.AddDays(-2),
            ShippedAt = DateTime.UtcNow.AddDays(-1),
            Items = new List<OrderItem>
            {
                new()
                {
                    ProductId = p4.Id,
                    ProductVariantId = p4.Variants.First().Id,
                    ProductName = p4.Name,
                    VariantName = "50ml Glass Flacon",
                    ProductImageUrl = p4.Images.First().ImageUrl,
                    UnitPrice = 165.00m,
                    UnitCost = 36.00m,
                    Quantity = 1
                }
            }
        };

        context.Orders.AddRange(initialOrder1, initialOrder2);

        // 8. Seed Inventory Audit Log
        context.InventoryTransactions.AddRange(
            new InventoryTransaction
            {
                ProductId = p1.Id,
                TransactionType = InventoryTransactionType.Restock,
                QuantityChange = 50,
                QuantityAfter = 50,
                Reason = "Initial factory shipment received",
                PerformedByName = "Elena Rostova",
                CreatedAt = DateTime.UtcNow.AddMonths(-1)
            },
            new InventoryTransaction
            {
                ProductId = p1.Id,
                TransactionType = InventoryTransactionType.OrderPlacement,
                QuantityChange = -1,
                QuantityAfter = 49,
                Reason = "Order #LB-20241118-4291 placed",
                PerformedByName = "Sarah Jenkins",
                CreatedAt = DateTime.UtcNow.AddDays(-6)
            },
            new InventoryTransaction
            {
                ProductId = p5.Id,
                TransactionType = InventoryTransactionType.ManualAdjustment,
                QuantityChange = -2,
                QuantityAfter = 6,
                Reason = "PR & Influencer Gifting allocation",
                PerformedByName = "Elena Rostova",
                CreatedAt = DateTime.UtcNow.AddDays(-4)
            }
        );

        // 9. Seed Reviews
        context.Reviews.AddRange(
            new Review
            {
                ProductId = p1.Id,
                UserId = customer.Id,
                AuthorName = "Sarah Jenkins",
                Rating = 5,
                Title = "The ultimate glow booster!",
                Comment = "I have tried countless serums and nothing compares to this. My skin looks airbrushed and intensely hydrated even after a 12-hour work day. Absolutely worth every single cent.",
                IsVerifiedPurchase = true,
                IsApproved = true,
                CreatedAt = DateTime.UtcNow.AddDays(-2)
            },
            new Review
            {
                ProductId = p2.Id,
                UserId = customer.Id,
                AuthorName = "Sarah Jenkins",
                Rating = 5,
                Title = "Flawless silk finish",
                Comment = "Coverage is buildable and never cakes. Shade 01 Alabaster matches my cool undertone seamlessly.",
                IsVerifiedPurchase = true,
                IsApproved = true,
                CreatedAt = DateTime.UtcNow.AddDays(-1)
            }
        );

        await context.SaveChangesAsync();
    }

    private static async Task EnsureColumnExistsAsync(ApplicationDbContext context, string tableName, string columnName, string columnDefinition)
    {
        var connection = context.Database.GetDbConnection();
        if (connection.State != System.Data.ConnectionState.Open)
        {
            await connection.OpenAsync();
        }

        using var command = connection.CreateCommand();
        command.CommandText = $"PRAGMA table_info(\"{tableName}\");";
        using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            if (string.Equals(reader["name"]?.ToString(), columnName, StringComparison.OrdinalIgnoreCase))
            {
                return;
            }
        }

        await reader.CloseAsync();
        await context.Database.ExecuteSqlRawAsync($"ALTER TABLE \"{tableName}\" ADD COLUMN \"{columnName}\" {columnDefinition};");
    }
}
