/**
 * Environment configuration
 * Update .env.example with your actual values
 */

export const ENV = {
  // Pimcore Studio API URL (typically: https://your-instance.com/studio/api)
  PIMCORE_STUDIO_API_URL: process.env.PIMCORE_STUDIO_API_URL || 'https://demo.pimcore.com/studio/api',
  
  // Application environment
  APP_ENV: process.env.APP_ENV || 'development',
};
