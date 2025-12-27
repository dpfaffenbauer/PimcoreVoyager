/**
 * API Client Configuration
 * Configured for Pimcore Studio API with session-based authentication
 */

import axios, { AxiosInstance } from 'axios';
import { ENV } from '../config/env';
import { useAuthStore } from '../store/authStore';

const apiClient: AxiosInstance = axios.create({
  baseURL: ENV.PIMCORE_STUDIO_API_URL,
  withCredentials: true, // Enable sending/receiving cookies for session management
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Session expired or invalid, logout user
      await useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
