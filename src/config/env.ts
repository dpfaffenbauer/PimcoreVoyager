/**
 * Environment configuration
 * Update .env.example with your actual values
 * 
 * Note: Pimcore instance URLs are now configured in-app via multi-tenant support
 * No environment variable needed for API URLs anymore
 */

export const ENV = {
  // Application environment
  APP_ENV: process.env.APP_ENV || 'development',
};
