// frontend/src/api/httpClient.js
// Centralized HTTP client with interceptors
import axios from 'axios';
import { API_BASE_URL, LIMITS } from '../config/apiConfig.js';

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
 */
httpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
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
 */
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Try to refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          
          localStorage.setItem('token', accessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return httpClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed - clear tokens and redirect
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          
          // Dispatch custom event for auth context to handle
          window.dispatchEvent(new CustomEvent('auth:logout'));
        }
      } else {
        // No refresh token - clear and redirect
        localStorage.removeItem('token');
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }
    }
    
    return Promise.reject(error);
  }
);

/**
 * Token management utilities
 */
export const tokenUtils = {
  getToken: () => localStorage.getItem('token'),
  
  setToken: (token) => {
    localStorage.setItem('token', token);
  },
  
  getRefreshToken: () => localStorage.getItem('refreshToken'),
  
  setRefreshToken: (token) => {
    localStorage.setItem('refreshToken', token);
  },
  
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('token', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  },
  
  clearTokens: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
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

// Add same interceptors to upload client
uploadClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
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

