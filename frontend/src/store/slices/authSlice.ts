import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/types';
import { queryClient } from '@/api/queryClient';
import api from '@/api/client';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
}

const savedUser = localStorage.getItem('lumina_user');
const savedToken = localStorage.getItem('lumina_token');

const parseSavedUser = (raw: string | null): User | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    localStorage.removeItem('lumina_user');
    localStorage.removeItem('lumina_token');
    return null;
  }
};

const parsedUser = parseSavedUser(savedUser);

const initialState: AuthState = {
  user: parsedUser,
  token: parsedUser ? savedToken : null,
  isAuthenticated: !!(parsedUser && savedToken),
  isAuthModalOpen: false,
  authModalTab: 'login',
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isAuthModalOpen = false;

      localStorage.setItem('lumina_token', action.payload.token);
      localStorage.setItem('lumina_user', JSON.stringify(action.payload.user));
      api.defaults.headers.common['Authorization'] = `Bearer ${action.payload.token}`;

      // Reset & flush queries from any previous user session so endpoints refetch freshly
      queryClient.clear();
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;

      localStorage.removeItem('lumina_token');
      localStorage.removeItem('lumina_user');
      delete api.defaults.headers.common['Authorization'];

      // Flush all cached user/admin queries immediately
      queryClient.clear();
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      localStorage.setItem('lumina_user', JSON.stringify(action.payload));
    },
    openAuthModal: (state, action: PayloadAction<'login' | 'register' | undefined>) => {
      state.isAuthModalOpen = true;
      if (action.payload) {
        state.authModalTab = action.payload;
      }
    },
    closeAuthModal: (state) => {
      state.isAuthModalOpen = false;
    },
    setAuthModalTab: (state, action: PayloadAction<'login' | 'register'>) => {
      state.authModalTab = action.payload;
    },
  },
});

export const {
  setCredentials,
  logout,
  updateUser,
  openAuthModal,
  closeAuthModal,
  setAuthModalTab,
} = authSlice.actions;

export default authSlice.reducer;
