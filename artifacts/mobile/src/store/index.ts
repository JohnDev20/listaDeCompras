import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken } from './api';

interface AuthStore {
  token: string | null;
  user: any | null;
  setToken: (token: string) => void;
  setUser: (user: any) => void;
  logout: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  user: null,

  setToken: (token: string) => {
    AsyncStorage.setItem('auth_token', token);
    setAuthToken(token);
    set({ token });
  },

  setUser: (user: any) => {
    set({ user });
  },

  logout: () => {
    AsyncStorage.removeItem('auth_token');
    setAuthToken('');
    set({ token: null, user: null });
  },

  initialize: async () => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      setAuthToken(token);
      set({ token });
    }
  },
}));

interface UIStore {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (dark: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isDarkMode: false,

  toggleDarkMode: () => {
    set((state) => {
      AsyncStorage.setItem('dark_mode', JSON.stringify(!state.isDarkMode));
      return { isDarkMode: !state.isDarkMode };
    });
  },

  setDarkMode: (dark: boolean) => {
    AsyncStorage.setItem('dark_mode', JSON.stringify(dark));
    set({ isDarkMode: dark });
  },
}));
