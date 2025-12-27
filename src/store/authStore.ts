/**
 * Authentication Store
 * Manages authentication state with Zustand
 * Note: Pimcore Studio API uses session-based authentication (cookies)
 */

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { User, AuthState } from '../types/auth';

const USER_KEY = 'auth_user';

interface AuthStore extends AuthState {
  setAuthenticated: (authenticated: boolean) => void;
  setUser: (user: User) => void;
  logout: () => Promise<void>;
  loadAuthData: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  token: null, // Not used with session auth, kept for compatibility
  user: null,

  setAuthenticated: (authenticated: boolean) => {
    set({ isAuthenticated: authenticated });
  },

  setUser: (user: User) => {
    SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    set({ user });
  },

  logout: async () => {
    try {
      await SecureStore.deleteItemAsync(USER_KEY);
      set({ token: null, user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  },

  loadAuthData: async () => {
    try {
      const userStr = await SecureStore.getItemAsync(USER_KEY);

      if (userStr) {
        const user: User = JSON.parse(userStr);
        set({ user });
        // Note: Actual authentication state should be verified with server
        // Session validity is managed by cookies
      }
    } catch (error) {
      console.error('Error loading auth data:', error);
    }
  },
}));
