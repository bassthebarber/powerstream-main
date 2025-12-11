/**
 * Authentication API
 * Mirrors web client: /api/auth/*
 */
import httpClient, { tokenStorage } from './httpClient';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
  roles: string[];
  isVerified: boolean;
  coinBalance: number;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

/**
 * Auth API endpoints - mirrors web client
 */
export const authApi = {
  /**
   * Login user
   * POST /api/auth/login
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await httpClient.post<AuthResponse>('/auth/login', credentials);
    
    // Store tokens
    await tokenStorage.setTokens(
      response.data.accessToken,
      response.data.refreshToken
    );
    
    return response.data;
  },

  /**
   * Register new user
   * POST /api/auth/register
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await httpClient.post<AuthResponse>('/auth/register', data);
    
    // Store tokens
    await tokenStorage.setTokens(
      response.data.accessToken,
      response.data.refreshToken
    );
    
    return response.data;
  },

  /**
   * Get current user profile
   * GET /api/auth/me
   */
  async getProfile(): Promise<User> {
    const response = await httpClient.get<{ user: User }>('/auth/me');
    return response.data.user;
  },

  /**
   * Refresh access token
   * POST /api/auth/refresh
   */
  async refreshToken(): Promise<{ accessToken: string; refreshToken?: string }> {
    const refreshToken = await tokenStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await httpClient.post('/auth/refresh', { refreshToken });
    
    await tokenStorage.setTokens(
      response.data.accessToken,
      response.data.refreshToken
    );
    
    return response.data;
  },

  /**
   * Logout user
   * POST /api/auth/logout
   */
  async logout(): Promise<void> {
    try {
      await httpClient.post('/auth/logout');
    } finally {
      await tokenStorage.clearTokens();
    }
  },

  /**
   * Update password
   * PUT /api/auth/password
   */
  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    await httpClient.put('/auth/password', { currentPassword, newPassword });
  },

  /**
   * Forgot password
   * POST /api/auth/forgot-password
   */
  async forgotPassword(email: string): Promise<void> {
    await httpClient.post('/auth/forgot-password', { email });
  },

  /**
   * Reset password
   * POST /api/auth/reset-password
   */
  async resetPassword(token: string, password: string): Promise<void> {
    await httpClient.post('/auth/reset-password', { token, password });
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await tokenStorage.getToken();
    return !!token;
  },
};

export default authApi;



