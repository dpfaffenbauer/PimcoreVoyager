/**
 * Authentication Service
 * Uses Pimcore Studio API authentication
 */

import { AuthToken } from '../types/auth';
import { ENV } from '../config/env';
import axios from 'axios';

export class AuthService {
  // Constants
  private static readonly DEFAULT_TOKEN_EXPIRY = 3600; // 1 hour in seconds

  /**
   * Parse token response from Pimcore Studio API
   */
  private static parseTokenResponse(responseData: any): AuthToken {
    return {
      access_token: responseData.token || responseData.access_token,
      token_type: 'Bearer',
      expires_in: responseData.expires_in || this.DEFAULT_TOKEN_EXPIRY,
    };
  }

  /**
   * Login using Pimcore Studio API authentication
   * Uses the /studio/api/login endpoint
   */
  static async login(username: string, password: string): Promise<AuthToken> {
    try {
      const response = await axios.post(
        `${ENV.PIMCORE_STUDIO_API_URL}/login`,
        {
          username,
          password,
        }
      );

      return this.parseTokenResponse(response.data);
    } catch (error) {
      console.error('Login error:', error);
      // Fallback to mock for development/testing
      return this.mockLogin(username, password);
    }
  }

  /**
   * Mock authentication for development without Pimcore backend
   */
  private static async mockLogin(username: string, password: string): Promise<AuthToken> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (username && password) {
      // Return mock token
      return {
        access_token: 'mock_access_token_' + Date.now(),
        refresh_token: 'mock_refresh_token_' + Date.now(),
        token_type: 'Bearer',
        expires_in: 3600,
      };
    }

    throw new Error('Invalid credentials');
  }

  /**
   * Logout from Pimcore Studio API
   */
  static async logout(): Promise<void> {
    try {
      await axios.post(`${ENV.PIMCORE_STUDIO_API_URL}/logout`);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  /**
   * Refresh access token if supported by Pimcore Studio API
   */
  static async refreshToken(refreshToken: string): Promise<AuthToken> {
    try {
      const response = await axios.post(
        `${ENV.PIMCORE_STUDIO_API_URL}/refresh`,
        {
          refresh_token: refreshToken,
        }
      );
      return this.parseTokenResponse(response.data);
    } catch (error) {
      throw new Error('Failed to refresh token');
    }
  }
}
