/**
 * Authentication Store
 * Manages authentication state with Zustand
 * Note: Pimcore Studio API uses session-based authentication (cookies)
 */

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { User, AuthState } from '../types/auth';
import { AuthService } from '../apis/authService';

const USER_KEY = 'auth_user';
const CREDENTIALS_KEY = 'saved_credentials';

interface SavedCredentials {
  username: string;
  password: string;
  instanceId?: string;
}

interface AuthStore extends AuthState {
  setAuthenticated: (authenticated: boolean) => void;
  setUser: (user: User) => void;
  logout: () => Promise<void>;
  loadAuthData: () => Promise<void>;
  saveCredentials: (username: string, password: string, instanceId?: string) => Promise<void>;
  loadCredentials: (instanceId?: string) => Promise<SavedCredentials | null>;
  clearCredentials: () => Promise<void>;
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
      // Call server logout to invalidate session cookie
      await AuthService.logout();
      // Clear local data
      await SecureStore.deleteItemAsync(USER_KEY);
      set({ token: null, user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Error during logout:', error);
      // Still clear local state even if server logout fails
      set({ token: null, user: null, isAuthenticated: false });
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

  saveCredentials: async (username: string, password: string, instanceId?: string) => {
    try {
      const credentials: SavedCredentials = {
        username,
        password,
        instanceId,
      };
      await SecureStore.setItemAsync(CREDENTIALS_KEY, JSON.stringify(credentials));
    } catch (error) {
      console.error('Error saving credentials:', error);
    }
  },

  loadCredentials: async (instanceId?: string) => {
    try {
      const credentialsStr = await SecureStore.getItemAsync(CREDENTIALS_KEY);
      if (credentialsStr) {
        const credentials: SavedCredentials = JSON.parse(credentialsStr);
        // If instanceId is provided, only return credentials for that instance
        if (instanceId && credentials.instanceId !== instanceId) {
          return null;
        }
        return credentials;
      }
    } catch (error) {
      console.error('Error loading credentials:', error);
    }
    return null;
  },

  clearCredentials: async () => {
    try {
      await SecureStore.deleteItemAsync(CREDENTIALS_KEY);
    } catch (error) {
      console.error('Error clearing credentials:', error);
    }
  },
}));
