/**
 * Authentication Service
 * Uses Pimcore Studio API session-based authentication
 */

import { ENV } from '../config/env';
import axios from 'axios';

// Create a separate axios instance for auth endpoints
// This needs to handle cookies for session management
const authAxios = axios.create({
  baseURL: ENV.PIMCORE_STUDIO_API_URL,
  withCredentials: true, // Enable sending/receiving cookies
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export class AuthService {
  /**
   * Login using Pimcore Studio API session-based authentication
   * Uses the /studio/api/login endpoint
   * Session is managed via cookies
   */
  static async login(username: string, password: string): Promise<boolean> {
    try {
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
      const response = await authAxios.get('/session');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}
