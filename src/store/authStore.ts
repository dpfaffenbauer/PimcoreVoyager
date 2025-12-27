/**
 * Authentication Store
 * Manages authentication state with Zustand
 */

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { AuthToken, User, AuthState } from '../types/auth';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

interface AuthStore extends AuthState {
  setToken: (token: AuthToken) => Promise<void>;
  setUser: (user: User) => void;
  logout: () => Promise<void>;
  loadAuthData: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  token: null,
  user: null,

  setToken: async (token: AuthToken) => {
    try {
      // Add expiration timestamp
      const tokenWithExpiry = {
        ...token,
        expires_at: Date.now() + token.expires_in * 1000,
      };
      await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(tokenWithExpiry));
      set({ token: tokenWithExpiry, isAuthenticated: true });
    } catch (error) {
      console.error('Error saving token:', error);
    }
  },

  setUser: (user: User) => {
    SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    set({ user });
  },

  logout: async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
      set({ token: null, user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  },

  loadAuthData: async () => {
    try {
      const tokenStr = await SecureStore.getItemAsync(TOKEN_KEY);
      const userStr = await SecureStore.getItemAsync(USER_KEY);

      if (tokenStr) {
        const token: AuthToken = JSON.parse(tokenStr);
        // Check if token is expired
        if (token.expires_at && token.expires_at > Date.now()) {
          set({ token, isAuthenticated: true });
        } else {
          // Token expired, clear it
          await SecureStore.deleteItemAsync(TOKEN_KEY);
        }
      }

      if (userStr) {
        const user: User = JSON.parse(userStr);
        set({ user });
      }
    } catch (error) {
      console.error('Error loading auth data:', error);
    }
  },
}));
