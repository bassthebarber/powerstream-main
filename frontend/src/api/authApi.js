// frontend/src/api/authApi.js
// Authentication API client
import httpClient from "./httpClient.js";

/**
 * Authentication API
 */
const authApi = {
  /**
   * Login with email and password
   */
  async login(email, password) {
    const response = await httpClient.post("/auth/login", { email, password });
    return response.data;
  },

  /**
   * Register a new user
   */
  async register(data) {
    const response = await httpClient.post("/auth/register", {
      email: data.email,
      password: data.password,
      name: data.name || "",
    });
    return response.data;
  },

  /**
   * Get current user
   */
  async getCurrentUser() {
    const response = await httpClient.get("/auth/me");
    return response.data;
  },

  /**
   * Refresh token
   */
  async refreshToken() {
    const response = await httpClient.post("/auth/refresh");
    return response.data;
  },

  /**
   * Logout (client-side only - just clear token)
   */
  logout() {
    // Token clearing is handled in auth context
    return Promise.resolve();
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(email) {
    const response = await httpClient.post("/auth/forgot-password", { email });
    return response.data;
  },

  /**
   * Reset password with token
   */
  async resetPassword(token, newPassword) {
    const response = await httpClient.post("/auth/reset-password", {
      token,
      password: newPassword,
    });
    return response.data;
  },

  /**
   * Verify email with token
   */
  async verifyEmail(token) {
    const response = await httpClient.post("/auth/verify-email", { token });
    return response.data;
  },

  /**
   * Change password (authenticated)
   */
  async changePassword(currentPassword, newPassword) {
    const response = await httpClient.post("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};

export default authApi;

