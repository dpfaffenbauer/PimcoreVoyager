/**
 * API Client Configuration
 * Configured for Pimcore Studio API with session-based authentication
 * Supports multi-tenant by using active instance URL
 */

import axios, { AxiosInstance } from 'axios';
import { useAuthStore } from '../store/authStore';
import { useInstanceStore } from '../store/instanceStore';
import { CONSTANTS } from '../config/constants';

// Create a function to get the API client with current instance URL
export const getApiClient = (): AxiosInstance => {
  const instanceUrl = useInstanceStore.getState().getActiveInstanceUrl();
  
  const client = axios.create({
    baseURL: instanceUrl || CONSTANTS.DEFAULT_PIMCORE_API_URL,
    withCredentials: true, // Enable sending/receiving cookies for session management
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  // Request interceptor to log all requests
  client.interceptors.request.use(
    (config) => {
      console.log('🌐 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        fullURL: `${config.baseURL}${config.url}`,
        params: config.params,
        data: config.data,
        headers: {
          'Content-Type': config.headers['Content-Type'],
          'Accept': config.headers['Accept'],
        },
      });
      return config;
    },
    (error) => {
      console.error('❌ API Request Error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor to log responses and handle errors
  client.interceptors.response.use(
    (response) => {
      console.log('✅ API Response:', {
        method: response.config.method?.toUpperCase(),
        url: response.config.url,
        status: response.status,
        statusText: response.statusText,
        data: response.data,
      });
      return response;
    },
    async (error) => {
      console.error('❌ API Response Error:', {
        method: error.config?.method?.toUpperCase(),
        url: error.config?.url,
        fullURL: error.config?.baseURL ? `${error.config.baseURL}${error.config.url}` : error.config?.url,
        params: error.config?.params,
        data: error.config?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        errorMessage: error.message,
        responseData: error.response?.data,
      });
      
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
