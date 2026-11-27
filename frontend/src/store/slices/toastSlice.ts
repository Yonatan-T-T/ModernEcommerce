import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ToastItem {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'error';
}

interface ToastState {
  toasts: ToastItem[];
}

const initialState: ToastState = {
  toasts: [],
};

export const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    showToast: (
      state,
      action: PayloadAction<{ message: string; type?: 'success' | 'info' | 'error' }>
    ) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      state.toasts.push({
        id,
        message: action.payload.message,
        type: action.payload.type || 'success',
      });
      if (state.toasts.length > 3) {
        state.toasts.shift();
      }
    },
    dismissToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const { showToast, dismissToast } = toastSlice.actions;
export default toastSlice.reducer;
