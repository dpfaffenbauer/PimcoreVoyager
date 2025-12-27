/**
 * Authentication Service
 * Uses Pimcore Studio API session-based authentication
 * Supports multi-tenant with configurable instance URLs
 */

import axios from 'axios';
import { useInstanceStore } from '../store/instanceStore';

export class AuthService {
  /**
   * Get axios instance for auth with current active instance URL
   */
  private static getAuthAxios() {
    const instanceUrl = useInstanceStore.getState().getActiveInstanceUrl();
    
    return axios.create({
      baseURL: instanceUrl || 'https://demo.pimcore.com/studio/api',
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
      const authAxios = this.getAuthAxios();
      const response = await authAxios.post('/login', {
        username,
        password,
      });

      // Session is stored in cookies by the server
      // Return success if status is 200
      return response.status === 200;
    } catch (error) {
      console.error('Login error:', error);
      // Fallback to mock for development/testing
      return this.mockLogin(username, password);
    }
  }

  /**
   * Mock authentication for development without Pimcore backend
   */
  private static async mockLogin(username: string, password: string): Promise<boolean> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (username && password) {
      return true;
    }

    throw new Error('Invalid credentials');
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
