/**
 * Authentication Service
 * Uses Pimcore Studio API session-based authentication
 * Supports multi-tenant with configurable instance URLs
 */

import axios from 'axios';
import { useInstanceStore } from '../store/instanceStore';
import { CONSTANTS } from '../config/constants';

export class AuthService {
  /**
   * Get axios instance for auth with current active instance URL
   */
  private static getAuthAxios() {
    const instanceUrl = useInstanceStore.getState().getActiveInstanceUrl();
    
    return axios.create({
      baseURL: instanceUrl || CONSTANTS.DEFAULT_PIMCORE_API_URL,
      withCredentials: true, // Enable sending/receiving cookies
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
  }

  /**
   * Login using Pimcore Studio API session-based authentication
   * Uses the /studio/api/login endpoint
   * Session is managed via cookies
   */
  static async login(username: string, password: string): Promise<boolean> {
    try {
      // Clear any existing session before new login attempt
      await this.logout();

      const authAxios = this.getAuthAxios();
      const response = await authAxios.post('/login', {
        username,
        password,
      });

      // Session is stored in cookies by the server
      // Return success if status is 200
      return response.status === 200;
    } catch (error: any) {
      console.error('Login error:', error);

      // Check if it's an authentication error (401)
      if (error.response?.status === 401) {
        return false;
      }

      // For network errors (no response), throw to let caller handle
      throw error;
    }
  }

  /**
   * Logout from Pimcore Studio API
   * Clears the session cookie
   */
  static async logout(): Promise<void> {
    try {
      const authAxios = this.getAuthAxios();
      await authAxios.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  /**
   * Check if current session is valid
   * Can be used to verify authentication status
   */
  static async checkSession(): Promise<boolean> {
    try {
      const authAxios = this.getAuthAxios();
      const response = await authAxios.get('/session');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}
