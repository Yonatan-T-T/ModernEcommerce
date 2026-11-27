import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setConfig } from '@/store/slices/themeAndConfigSlices';
import { setCartItems } from '@/store/slices/cartSlice';
import { setWishlist } from '@/store/slices/wishlistSlice';
import {
  fetchStoreConfig,
  fetchUserCart,
  syncUserCartApi,
  fetchWishlistIds,
  toggleWishlistApi,
} from '@/api/queries';

// Common Components
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { CartDrawer } from '@/components/common/CartDrawer';
import { AuthModal } from '@/components/common/AuthModal';
import { MobileBottomNav } from '@/components/common/MobileBottomNav';
import { ToastContainer } from '@/components/common/ToastContainer';

// Storefront Pages
import { HomePage } from '@/pages/HomePage';
import { CatalogPage } from '@/pages/CatalogPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { CartPage } from '@/pages/CartPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { OrderConfirmationPage } from '@/pages/OrderConfirmationPage';
import { OrderTrackingPage } from '@/pages/OrderTrackingPage';
import { AccountPage } from '@/pages/AccountPage';
import { WishlistPage } from '@/pages/WishlistPage';

// Admin Pages
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminProductsPage } from '@/pages/admin/AdminProductsPage';
import { AdminInventoryPage } from '@/pages/admin/AdminInventoryPage';
import { AdminOrdersPage } from '@/pages/admin/AdminOrdersPage';
import { AdminCategoriesBrandsPage } from '@/pages/admin/AdminCategoriesBrandsPage';
import { AdminCouponsPage, AdminCustomersPage } from '@/pages/admin/AdminCouponsAndCustomersPages';

export const App: React.FC = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isDarkMode } = useSelector((state: RootState) => state.theme);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Synchronize dark mode class on documentElement
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Load backend store configuration (configurable store name, currency, free shipping threshold)
  useEffect(() => {
    fetchStoreConfig()
      .then((cfg) => dispatch(setConfig(cfg)))
      .catch(() => {});
  }, [dispatch]);

  // Sync cart & wishlist with the logged-in user's backend profile
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    let cancelled = false;

    const syncUserData = async () => {
      // 1. Sync Cart (merge any guest items added before sign-in with server cart)
      try {
        const localRawCart = localStorage.getItem('lumina_cart');
        const localCart = localRawCart ? JSON.parse(localRawCart) : [];
        const serverCart = await fetchUserCart();

        if (!cancelled) {
          if (localCart.length > 0) {
            const mergedMap = new Map<string, { productId: number; productVariantId?: number; quantity: number }>();
            for (const item of serverCart) {
              mergedMap.set(`${item.productId}-${item.productVariantId || 0}`, {
                productId: item.productId,
                productVariantId: item.productVariantId,
                quantity: item.quantity,
              });
            }
            for (const item of localCart) {
              const key = `${item.productId}-${item.productVariantId || 0}`;
              const existing = mergedMap.get(key);
              if (existing) {
                existing.quantity = Math.max(existing.quantity, item.quantity);
              } else {
                mergedMap.set(key, {
                  productId: item.productId,
                  productVariantId: item.productVariantId,
                  quantity: item.quantity,
                });
              }
            }
            const syncedCart = await syncUserCartApi(Array.from(mergedMap.values()));
            if (!cancelled) dispatch(setCartItems(syncedCart));
          } else {
            dispatch(setCartItems(serverCart));
          }
        }
      } catch {
        // Keep local cart if cart endpoint is unavailable
      }

      // 2. Sync Wishlist
      try {
        const localRawWishlist = localStorage.getItem('lumina_wishlist');
        const localWishlist: number[] = localRawWishlist ? JSON.parse(localRawWishlist) : [];
        const serverWishlist = await fetchWishlistIds();

        if (!cancelled) {
          const missingOnServer = localWishlist.filter((id) => !serverWishlist.includes(id));
          for (const id of missingOnServer) {
            await toggleWishlistApi(id);
          }
          const finalWishlist = missingOnServer.length > 0 ? await fetchWishlistIds() : serverWishlist;
          if (!cancelled) dispatch(setWishlist(finalWishlist));
        }
      } catch {
        // Keep local wishlist if wishlist endpoint is unavailable
      }
    };

    syncUserData();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?.id, dispatch]);

  // Scroll to top on navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-lumina-50 dark:bg-charcoal-900 text-charcoal-900 dark:text-lumina-100 transition-colors">
      {!isAdminRoute && <Navbar />}

      <div className="flex-1">
        <Routes>
          {/* Customer Storefront */}
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<CatalogPage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmationPage />} />
          <Route path="/order-tracking" element={<OrderTrackingPage />} />
          <Route path="/order-tracking/:orderNumber" element={<OrderTrackingPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />

          {/* Admin Console */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="inventory" element={<AdminInventoryPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="categories-brands" element={<AdminCategoriesBrandsPage />} />
            <Route path="coupons" element={<AdminCouponsPage />} />
            <Route path="customers" element={<AdminCustomersPage />} />
          </Route>
        </Routes>
      </div>

      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <MobileBottomNav />}

      {/* Global Overlays */}
      <CartDrawer />
      <AuthModal />
      <ToastContainer />
    </div>
  );
};

export default App;
