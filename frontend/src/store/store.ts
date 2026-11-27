import { configureStore, Middleware } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer, { setCartItems } from './slices/cartSlice';
import wishlistReducer, { setWishlist } from './slices/wishlistSlice';
import toastReducer from './slices/toastSlice';
import { themeSlice, configSlice, languageSlice } from './slices/themeAndConfigSlices';
import { syncUserCartApi, toggleWishlistApi } from '@/api/queries';

const userSyncMiddleware: Middleware = (storeApi) => (next) => (action: any) => {
  // Capture token before auth/logout clears localStorage
  const tokenBeforeAction =
    action.type === 'auth/logout' ? storeApi.getState().auth.token : null;

  const result = next(action);
  const state = storeApi.getState();

  // Revoke JWT server-side (using fetch so api request interceptor doesn't strip the cleared token)
  // and clear local cart & wishlist on logout
  if (action.type === 'auth/logout') {
    if (tokenBeforeAction) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenBeforeAction}`,
        },
      }).catch(() => {});
    }
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
    language: languageSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(userSyncMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
