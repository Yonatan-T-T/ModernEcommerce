# Lumina Beauty — Luxury E-Commerce & Real-Time Inventory Management Platform

> A modern, full-stack cosmetics and haute perfumery e-commerce application built with **React 18 + TypeScript + Vite + Tailwind CSS** and **.NET 8 Clean Architecture** (Domain, Application, Infrastructure, API).

---

## 🌟 Architecture & Stack

### Frontend
- **Framework:** React 18+ with TypeScript & Vite
- **Styling & Aesthetics:** Tailwind CSS with a luxury cosmetics theme (`roseGold`, `champagne`, `charcoal`, `lumina` pastels), glassmorphism, responsive mobile-first layouts
- **Theme Support:** **100% Dark Mode & Light Mode** across storefront, modals, and the simplified Admin Console with zero-flash pre-render initialization
- **State Management:** Redux Toolkit (`authSlice`, `cartSlice`, `wishlistSlice`, `themeAndConfigSlices`)
- **Server State & Caching:** TanStack Query (React Query)
- **Forms & Validation:** React Hook Form + Zod validation
- **Animations:** Lucide React icons & CSS transitions

### Backend
- **Framework:** .NET 8 (C#)
- **Architecture:** Clean Architecture
  - `LuminaBeauty.Domain`: Entities, Enums (`OrderStatus`, `PaymentStatus`, `InventoryTransactionType`, `SkinType`, `DiscountType`), Domain Rules
  - `LuminaBeauty.Application`: CQRS application services, DTOs, FluentValidation rules, Interfaces
  - `LuminaBeauty.Infrastructure`: Entity Framework Core, SQLite database (`luminabeauty.db`), automatic Seeder (`DbInitializer`), JWT token generation, BCrypt password hashing, local file storage
  - `LuminaBeauty.API`: RESTful controllers, global exception middleware, Swagger/OpenAPI documentation with JWT Bearer authentication, CORS
- **Key Business Logic:**
  - **Automatic Stock Deduction:** Real-time quantity reduction when orders are placed with overselling prevention.
  - **Stock Restoration:** Automatic inventory replenishment if an order is marked `Cancelled`.
  - **Supply Chain Audit Trail:** Every restock or adjustment records an immutable `InventoryTransaction` with quantity before/after, operator name, and business reason.
  - **Unit Economics & Profit Analytics:** Profit is dynamically tracked per order item and formulation:
    $$\text{Profit} = (\text{SellingPrice} - \text{CostPrice}) \times \text{QuantitySold}$$

---

## 🚀 Quick Start Guide

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js (v18+)](https://nodejs.org/) & `npm`

---

### 1. Run the Backend API

```powershell
# Navigate to the backend directory
cd backend

# Build and run the API
dotnet run --project src/LuminaBeauty.API/LuminaBeauty.API.csproj
```

- The API starts on **`http://localhost:5000`**
- Swagger UI interactive documentation is available at **`http://localhost:5000/swagger`**
- The database is automatically created and seeded with luxury formulations, shades, categories, brands, coupons, reviews, and test accounts on first boot.

---

### 2. Run the Frontend Storefront & Admin

In a second terminal:

```powershell
# Navigate to the frontend directory
cd frontend

# Install dependencies (if not already installed)
npm install

# Start the Vite development server
npm run dev
```

- Open your browser at **`http://localhost:5173`**
- The Vite server proxies API requests directly to `http://localhost:5000/api`

---

## 🔑 Demo Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Administrator** | `admin@luminabeauty.com` | `Admin123!` | Full Admin Console (Inventory, Catalog, Orders, Analytics, Coupons) |
| **Customer** | `sarah.j@example.com` | `Customer123!` | Public Storefront, Wishlist, Bag, Checkout, Order Tracking |

> **Tip:** You can sign in with 1 click using the **Quick Demo Access** buttons in the Sign In modal.

---

## 📱 Core Features

### 1. Customer Storefront
- **Immersive Homepage:** Editorial hero section, bestseller showcases, skincare routine disciplines, and value highlights.
- **Advanced Catalog & Filters:** Filter by Category, Skin Type (Dry, Oily, Sensitive, Combination), Brand/Atelier, price, rating, and stock status.
- **Mobile Filter Slide-Over:** Responsive drawer for mobile filter selection.
- **Product Detail Rituals:** Multi-angle image gallery, shade swatches, size selector, real-time stock indicators, ingredient lists, and verified client reviews.
- **Persistent Shopping Bag:** Slide-in cart drawer, free shipping threshold progress bar, coupon redemption, and instant total calculations.
- **Encrypted Checkout:** Guest and authenticated checkout with live formulation stock reservation.
- **Real-Time Order Tracking:** Visual 4-stage tracking timeline (`Pending` → `Processing` → `Shipped` → `Delivered`) by order reference code.

### 2. Admin Dashboard & Inventory System
- **Visual Economics & KPI Cards:** Real-time Gross Revenue, COGS, Net Realized Profit, Profit Margin %, Asset Inventory Valuation, and Active Formulations.
- **Interactive SVG Financial Trend Chart:** 14-day chronological revenue & net profit curves with hover tooltips.
- **Catalog Management:** Create, edit, and archive formulations, upload image URLs, configure multi-shade variants, and set cost vs. retail prices.
- **Warehouse Stock Control:** Real-time stock levels with color-coded safety thresholds and quick modal restock actions (+20, custom adjustment).
- **Audit Movement Trail:** Detailed immutable logs of every stock modification with operator stamp and reason.
- **Order Inspection & Courier Fulfillment:** Detailed breakdown of revenue vs. unit costs per line item, with tracking number assignment and status transitions.
- **Disciplines & Brand Houses:** Categorize collections and manage atelier profiles.
- **Promotions:** Configure percentage or fixed discount coupon codes with minimum spend requirements.
