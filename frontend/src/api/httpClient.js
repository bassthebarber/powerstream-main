// frontend/src/api/httpClient.js
// Centralized HTTP client with interceptors
import axios from 'axios';
import { API_BASE_URL, LIMITS } from '../config/apiConfig.js';
import { getToken, saveToken, clearToken } from '../utils/auth.js';

/**
 * Create axios instance with default configuration
 */
const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: LIMITS.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor - attach auth token
 * Uses centralized getToken() from utils/auth.js for consistency
 */
httpClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - handle errors
 * Uses centralized clearToken() from utils/auth.js for consistency
 */
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Try to refresh token (using localStorage directly for refresh token)
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          
          const { accessToken, refreshToken: newRefreshToken, token } = response.data;
          const newAccessToken = accessToken || token;
          
          // Use centralized token storage
          saveToken(newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }
          
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return httpClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed - clear tokens and redirect
          clearToken();
          localStorage.removeItem('refreshToken');
          
          // Dispatch custom event for auth context to handle
          window.dispatchEvent(new CustomEvent('auth:logout'));
        }
      } else {
        // No refresh token - clear and redirect
        clearToken();
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }
    }
    
    return Promise.reject(error);
  }
);

/**
 * Token management utilities
 * These wrap the centralized utils/auth.js functions for consistency
 */
export const tokenUtils = {
  getToken,
  
  setToken: saveToken,
  
  getRefreshToken: () => localStorage.getItem('refreshToken'),
  
  setRefreshToken: (token) => {
    localStorage.setItem('refreshToken', token);
  },
  
  setTokens: (accessToken, refreshToken) => {
    saveToken(accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  },
  
  clearTokens: () => {
    clearToken();
    localStorage.removeItem('refreshToken');
  },
  
  isAuthenticated: () => {
    return !!getToken();
  },
};

/**
 * Create a file upload client with longer timeout
 */
export const uploadClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: LIMITS.UPLOAD_TIMEOUT,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Add same interceptors to upload client (uses centralized getToken)
uploadClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

uploadClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default httpClient;
