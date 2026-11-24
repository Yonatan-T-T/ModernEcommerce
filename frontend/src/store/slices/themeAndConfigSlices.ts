import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StoreConfig } from '@/types';

interface ThemeState {
  isDarkMode: boolean;
}

const getInitialTheme = (): boolean => {
  try {
    const saved = localStorage.getItem('lumina_theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
};

const initialThemeState: ThemeState = {
  isDarkMode: getInitialTheme(),
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState: initialThemeState,
  reducers: {
    toggleTheme: (state) => {
      state.isDarkMode = !state.isDarkMode;
      try {
        localStorage.setItem('lumina_theme', state.isDarkMode ? 'dark' : 'light');
        if (state.isDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch {}
    },
    setTheme: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
      try {
        localStorage.setItem('lumina_theme', state.isDarkMode ? 'dark' : 'light');
        if (state.isDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch {}
    },
  },
});

interface ConfigState {
  config: StoreConfig;
}

const initialConfigState: ConfigState = {
  config: {
    storeName: 'Lumina Beauty',
    tagline: 'Pure Luxury. Ageless Radiance.',
    currency: 'USD',
    currencySymbol: '$',
    freeShippingThreshold: 75,
    standardShippingFee: 7.99,
  },
};

export const configSlice = createSlice({
  name: 'config',
  initialState: initialConfigState,
  reducers: {
    setConfig: (state, action: PayloadAction<StoreConfig>) => {
      state.config = action.payload;
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export const { setConfig } = configSlice.actions;
