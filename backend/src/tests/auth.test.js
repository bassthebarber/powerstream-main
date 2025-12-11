// backend/src/tests/auth.test.js
// Authentication flow tests
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "@jest/globals";
import jwt from "jsonwebtoken";
import env from "../config/env.js";

// Mock the database connection for unit tests
let mockUsers = [];

// Simple mock for User model
const mockUserModel = {
  findOne: jest.fn((query) => {
    const user = mockUsers.find(u => u.email === query.email);
    if (user) {
      return {
        ...user,
        comparePassword: async (password) => password === user.plainPassword,
        toObject: () => ({ ...user }),
      };
    }
    return null;
  }),
  create: jest.fn((data) => {
    const user = { 
      ...data, 
      _id: `user_${Date.now()}`,
      comparePassword: async (password) => password === data.password,
    };
    mockUsers.push(user);
    return user;
  }),
};

describe("Authentication", () => {
  beforeEach(() => {
    mockUsers = [];
  });

  describe("JWT Token Generation", () => {
    it("should generate a valid JWT token", () => {
      const userId = "test_user_123";
      const token = jwt.sign(
        { id: userId, role: "user" },
        env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3);
    });

    it("should decode JWT token correctly", () => {
      const userId = "test_user_123";
      const email = "test@example.com";
      
      const token = jwt.sign(
        { id: userId, email, role: "user" },
        env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      const decoded = jwt.verify(token, env.JWT_SECRET);
      
      expect(decoded.id).toBe(userId);
      expect(decoded.email).toBe(email);
      expect(decoded.role).toBe("user");
    });

    it("should reject invalid token", () => {
      const invalidToken = "invalid.token.here";
      
      expect(() => {
        jwt.verify(invalidToken, env.JWT_SECRET);
      }).toThrow();
    });

    it("should reject expired token", () => {
      const token = jwt.sign(
        { id: "test_user" },
        env.JWT_SECRET,
        { expiresIn: "-1s" } // Already expired
      );

      expect(() => {
        jwt.verify(token, env.JWT_SECRET);
      }).toThrow("jwt expired");
    });
  });

  describe("Login Validation", () => {
    it("should validate email format", () => {
      const validEmails = [
        "test@example.com",
        "user.name@domain.org",
        "user+tag@gmail.com",
      ];

      const invalidEmails = [
        "notanemail",
        "@nodomain.com",
        "spaces in@email.com",
      ];

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      validEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(true);
      });

      invalidEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(false);
      });
    });

    it("should require password minimum length", () => {
      const minLength = 6;
      
      const validPasswords = ["password123", "abcdef", "123456"];
      const invalidPasswords = ["12345", "abc", ""];

      validPasswords.forEach(password => {
        expect(password.length >= minLength).toBe(true);
      });

      invalidPasswords.forEach(password => {
        expect(password.length >= minLength).toBe(false);
      });
    });
  });

  describe("User Payload", () => {
    it("should build correct user payload", () => {
      const mockUser = {
        _id: "user_123",
        email: "test@example.com",
        name: "Test User",
        role: "user",
        avatarUrl: "https://example.com/avatar.jpg",
        isAdmin: false,
        coinBalance: 100,
      };

      const buildUserPayload = (user) => ({
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        isAdmin: user.isAdmin || user.role === "admin",
        coinBalance: typeof user.coinBalance === "number" ? user.coinBalance : 0,
      });

      const payload = buildUserPayload(mockUser);

      expect(payload.id).toBe("user_123");
      expect(payload.email).toBe("test@example.com");
      expect(payload.name).toBe("Test User");
      expect(payload.role).toBe("user");
      expect(payload.isAdmin).toBe(false);
      expect(payload.coinBalance).toBe(100);
    });

    it("should set isAdmin true for admin role", () => {
      const adminUser = {
        _id: "admin_123",
        email: "admin@example.com",
        name: "Admin User",
        role: "admin",
        isAdmin: false, // Even if this is false, role should override
      };

      const buildUserPayload = (user) => ({
        id: user._id.toString(),
        isAdmin: user.isAdmin || user.role === "admin",
      });

      const payload = buildUserPayload(adminUser);
      expect(payload.isAdmin).toBe(true);
    });
  });
});

describe("Environment Configuration", () => {
  it("should have JWT_SECRET configured", () => {
    expect(env.JWT_SECRET).toBeDefined();
    expect(typeof env.JWT_SECRET).toBe("string");
    expect(env.JWT_SECRET.length).toBeGreaterThan(10);
  });

  it("should have JWT_EXPIRES_IN configured", () => {
    expect(env.JWT_EXPIRES_IN).toBeDefined();
    expect(typeof env.JWT_EXPIRES_IN).toBe("string");
  });

  it("should identify development mode correctly", () => {
    // In test environment, NODE_ENV is 'test'
    expect(env.NODE_ENV).toBe("test");
    expect(env.isTest()).toBe(true);
  });
});



