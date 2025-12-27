/**
 * Environment configuration
 * Update .env.example with your actual values
 */

export const ENV = {
  PIMCORE_API_URL: process.env.PIMCORE_API_URL || 'https://demo.pimcore.com/api',
  PIMCORE_CLIENT_ID: process.env.PIMCORE_CLIENT_ID || '',
  PIMCORE_CLIENT_SECRET: process.env.PIMCORE_CLIENT_SECRET || '',
  OAUTH_REDIRECT_URI: process.env.OAUTH_REDIRECT_URI || 'pimcorevoyager://oauth/callback',
  OAUTH_AUTHORIZATION_ENDPOINT: process.env.OAUTH_AUTHORIZATION_ENDPOINT || '/oauth/authorize',
  OAUTH_TOKEN_ENDPOINT: process.env.OAUTH_TOKEN_ENDPOINT || '/oauth/token',
  APP_ENV: process.env.APP_ENV || 'development',
};
