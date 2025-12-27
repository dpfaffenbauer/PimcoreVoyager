/**
 * API Client Configuration
 * Configured for Pimcore Studio API with session-based authentication
 * Supports multi-tenant by using active instance URL
 */

import axios, { AxiosInstance } from 'axios';
import { useAuthStore } from '../store/authStore';
import { useInstanceStore } from '../store/instanceStore';

// Create a function to get the API client with current instance URL
export const getApiClient = (): AxiosInstance => {
  const instanceUrl = useInstanceStore.getState().getActiveInstanceUrl();
  
  const client = axios.create({
    baseURL: instanceUrl || 'https://demo.pimcore.com/studio/api',
    withCredentials: true, // Enable sending/receiving cookies for session management
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  // Response interceptor to handle errors
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        // Session expired or invalid, logout user
        await useAuthStore.getState().logout();
      }
      return Promise.reject(error);
    }
  );

  return client;
};

// Default export for backward compatibility
const apiClient = getApiClient();
export default apiClient;
