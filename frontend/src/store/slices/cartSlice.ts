import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  couponCode: string | null;
  discountAmount: number;
}

const savedCart = localStorage.getItem('lumina_cart');

const initialState: CartState = {
  items: savedCart ? JSON.parse(savedCart) : [],
  isDrawerOpen: false,
  couponCode: null,
  discountAmount: 0,
};

const saveToLocalStorage = (items: CartItem[]) => {
  localStorage.setItem('lumina_cart', JSON.stringify(items));
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existing = state.items.find(
        (i) =>
          i.productId === action.payload.productId &&
          i.productVariantId === action.payload.productVariantId
      );

      if (existing) {
        existing.quantity = Math.min(
          existing.quantity + action.payload.quantity,
          existing.maxStock
        );
      } else {
        state.items.push(action.payload);
      }

      saveToLocalStorage(state.items);
      state.isDrawerOpen = true; // Auto open luxury cart drawer
    },
    removeFromCart: (
      state,
      action: PayloadAction<{ productId: number; productVariantId?: number }>
    ) => {
      state.items = state.items.filter(
        (i) =>
          !(
            i.productId === action.payload.productId &&
            i.productVariantId === action.payload.productVariantId
          )
      );
      saveToLocalStorage(state.items);
    },
    updateQuantity: (
      state,
      action: PayloadAction<{
        productId: number;
        productVariantId?: number;
        quantity: number;
      }>
    ) => {
      const item = state.items.find(
        (i) =>
          i.productId === action.payload.productId &&
          i.productVariantId === action.payload.productVariantId
      );

      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter(
            (i) =>
              !(
                i.productId === action.payload.productId &&
                i.productVariantId === action.payload.productVariantId
              )
          );
        } else {
          item.quantity = Math.min(action.payload.quantity, item.maxStock);
        }
      }

      saveToLocalStorage(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      state.couponCode = null;
      state.discountAmount = 0;
      localStorage.removeItem('lumina_cart');
    },
    toggleCartDrawer: (state) => {
      state.isDrawerOpen = !state.isDrawerOpen;
    },
    setCartDrawer: (state, action: PayloadAction<boolean>) => {
      state.isDrawerOpen = action.payload;
    },
    applyCoupon: (
      state,
      action: PayloadAction<{ code: string; discountAmount: number }>
    ) => {
      state.couponCode = action.payload.code;
      state.discountAmount = action.payload.discountAmount;
    },
    removeCoupon: (state) => {
      state.couponCode = null;
      state.discountAmount = 0;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  toggleCartDrawer,
  setCartDrawer,
  applyCoupon,
  removeCoupon,
} = cartSlice.actions;

export default cartSlice.reducer;
