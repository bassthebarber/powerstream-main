// backend/src/services/auth.service.js
// Authentication service layer
import userRepository from "../domain/repositories/user.repository.js";
import { generateTokens, verifyRefreshToken } from "../api/middleware/auth.middleware.js";
import { comparePassword, hashPassword, generateSecureToken } from "../utils/crypto.js";
import { ApiError, UnauthorizedError, ConflictError, NotFoundError } from "../utils/errors.js";
import { logger } from "../config/logger.js";
import eventsRepository from "../domain/repositories/events.repository.js";
import { EVENT_TYPES, ENTITY_TYPES } from "../domain/models/Event.model.js";

/**
 * Authentication service
 */
const authService = {
  /**
   * Register a new user
   */
  async register(userData, clientInfo = {}) {
    const { name, email, password } = userData;
    
    // Check if email already exists
    const exists = await userRepository.emailExists(email);
    if (exists) {
      throw new ConflictError("Email already registered");
    }
    
    // Create user
    const user = await userRepository.create({
      name,
      email,
      password, // Will be hashed by User model pre-save hook
    });
    
    // Generate tokens
    const tokens = generateTokens(user);
    
    // Log signup event
    try {
      await eventsRepository.log(
        user._id || user.id,
        EVENT_TYPES.SIGNUP,
        ENTITY_TYPES.USER,
        user._id || user.id,
        { clientInfo }
      );
    } catch (err) {
      logger.error("Failed to log signup event:", err.message);
    }
    
    logger.info(`New user registered: ${email}`);
    
    return {
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role: user.role,
        roles: user.roles,
      },
      ...tokens,
    };
  },
  
  /**
   * Login user
   */
  async login(email, password, clientInfo = {}) {
    // Find user with password
    const user = await userRepository.findByEmail(email, { includePassword: true });
    
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }
    
    // Check account status
    if (user.status === "suspended") {
      throw new ApiError(403, "Account suspended");
    }
    if (user.status === "banned") {
      throw new ApiError(403, "Account banned");
    }
    
    // Verify password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid email or password");
    }
    
    // Generate tokens
    const tokens = generateTokens(user);
    
    // Log login event
    try {
      await eventsRepository.log(
        user._id,
        EVENT_TYPES.LOGIN,
        ENTITY_TYPES.USER,
        user._id,
        { clientInfo }
      );
    } catch (err) {
      logger.error("Failed to log login event:", err.message);
    }
    
    logger.info(`User logged in: ${email}`);
    
    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role: user.role,
        roles: user.roles,
        isVerified: user.isVerified,
        coinBalance: user.coinBalance,
      },
      ...tokens,
    };
  },
  
  /**
   * Refresh access token
   */
  async refreshToken(refreshToken) {
    const decoded = verifyRefreshToken(refreshToken);
    
    const user = await userRepository.findById(decoded.id);
    if (!user) {
      throw new UnauthorizedError("User not found");
    }
    
    if (user.status !== "active") {
      throw new ApiError(403, `Account ${user.status}`);
    }
    
    // Generate new tokens
    const tokens = generateTokens(user);
    
    return {
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    };
  },
  
  /**
   * Get current user profile
   */
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User");
    }
    
    return {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: user.role,
      roles: user.roles,
      isVerified: user.isVerified,
      coinBalance: user.coinBalance,
      createdAt: user.createdAt,
    };
  },
  
  /**
   * Update password
   */
  async updatePassword(userId, currentPassword, newPassword) {
    const user = await userRepository.findByEmail(
      (await userRepository.findById(userId)).email,
      { includePassword: true }
    );
    
    if (!user) {
      throw new NotFoundError("User");
    }
    
    // Verify current password
    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedError("Current password is incorrect");
    }
    
    // Update password
    await userRepository.updatePassword(userId, newPassword);
    
    logger.info(`Password updated for user: ${user.email}`);
    
    return { success: true };
  },
  
  /**
   * Forgot password - generate reset token
   */
  async forgotPassword(email) {
    const user = await userRepository.findByEmail(email);
    
    // Don't reveal if user exists
    if (!user) {
      return { success: true, message: "If that email exists, a reset link has been sent" };
    }
    
    // Generate reset token
    const resetToken = generateSecureToken();
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    // Store token (would need to add field to User model or use separate collection)
    // For now, just log it
    logger.info(`Password reset requested for ${email}, token: ${resetToken.substring(0, 8)}...`);
    
    // TODO: Send email with reset link
    
    return { success: true, message: "If that email exists, a reset link has been sent" };
  },
  
  /**
   * Reset password with token
   */
  async resetPassword(token, newPassword) {
    // TODO: Implement token verification
    // For now, just return success
    return { success: true };
  },
  
  /**
   * Verify email
   */
  async verifyEmail(token) {
    // TODO: Implement email verification token
    return { success: true };
  },
};

export default authService;

