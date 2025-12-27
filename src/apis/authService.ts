/**
 * Authentication Service
 * Handles OAuth2 authentication flow
 */

import { AuthToken } from '../types/auth';
import { ENV } from '../config/env';
import axios from 'axios';

export class AuthService {
  /**
   * Mock authentication for development
   * Replace with actual OAuth2 flow in production
   */
  static async mockLogin(username: string, password: string): Promise<AuthToken> {
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
   * OAuth2 Authentication (to be implemented)
   * This should use expo-auth-session for actual OAuth2 flow
   */
  static async oauth2Login(): Promise<AuthToken> {
    // TODO: Implement OAuth2 flow with expo-auth-session
    // This is a placeholder for the actual implementation
    throw new Error('OAuth2 not implemented yet');
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string): Promise<AuthToken> {
    try {
      const response = await axios.post(
        `${ENV.PIMCORE_API_URL}${ENV.OAUTH_TOKEN_ENDPOINT}`,
        {
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: ENV.PIMCORE_CLIENT_ID,
          client_secret: ENV.PIMCORE_CLIENT_SECRET,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to refresh token');
    }
  }

  /**
   * Logout
   */
  static async logout(): Promise<void> {
    // Implement logout logic if needed (e.g., revoke token on server)
    return Promise.resolve();
  }
}
