import { configureStore, Middleware } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer, { setCartItems } from './slices/cartSlice';
import wishlistReducer, { setWishlist } from './slices/wishlistSlice';
import toastReducer from './slices/toastSlice';
import { themeSlice, configSlice } from './slices/themeAndConfigSlices';
import { syncUserCartApi, toggleWishlistApi } from '@/api/queries';

const userSyncMiddleware: Middleware = (storeApi) => (next) => (action: any) => {
  const result = next(action);
  const state = storeApi.getState();

  // Clear local cart & wishlist on logout so another user never sees the previous user's items
  if (action.type === 'auth/logout') {
    storeApi.dispatch(setCartItems([]));
    storeApi.dispatch(setWishlist([]));
    localStorage.removeItem('lumina_cart');
    localStorage.removeItem('lumina_wishlist');
    return result;
  }

  // When authenticated, sync cart mutations to backend DB
  if (
    state.auth.isAuthenticated &&
    [
      'cart/addToCart',
      'cart/removeFromCart',
      'cart/updateQuantity',
      'cart/clearCart',
    ].includes(action.type)
  ) {
    const payload = state.cart.items.map((i: any) => ({
      productId: i.productId,
      productVariantId: i.productVariantId,
      quantity: i.quantity,
    }));
    syncUserCartApi(payload).catch(() => {});
  }

  // When authenticated, sync wishlist toggle to backend DB
  if (state.auth.isAuthenticated && action.type === 'wishlist/toggleWishlist') {
    toggleWishlistApi(action.payload).catch(() => {});
  }

  return result;
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    toast: toastReducer,
    theme: themeSlice.reducer,
    config: configSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(userSyncMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
