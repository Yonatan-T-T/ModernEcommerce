import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WishlistState {
  productIds: number[];
}

const savedWishlist = localStorage.getItem('lumina_wishlist');

const initialState: WishlistState = {
  productIds: savedWishlist ? JSON.parse(savedWishlist) : [],
};

export const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    toggleWishlist: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      if (state.productIds.includes(id)) {
        state.productIds = state.productIds.filter((item) => item !== id);
      } else {
        state.productIds.push(id);
      }
      localStorage.setItem('lumina_wishlist', JSON.stringify(state.productIds));
    },
    setWishlist: (state, action: PayloadAction<number[]>) => {
      state.productIds = action.payload;
      localStorage.setItem('lumina_wishlist', JSON.stringify(state.productIds));
    },
  },
});

export const { toggleWishlist, setWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
