// backend/src/tests/setup.js
// Test setup and configuration
import mongoose from "mongoose";
import { jest } from "@jest/globals";

// Increase timeout for async operations
jest.setTimeout(30000);

// Mock environment for tests
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_jwt_secret_for_testing_only";
process.env.JWT_REFRESH_SECRET = "test_refresh_secret_for_testing_only";

/**
 * Connect to test database
 */
export const connectTestDB = async () => {
  const testDbUri = process.env.MONGO_TEST_URI || "mongodb://localhost:27017/powerstream_test";
  
  try {
    await mongoose.connect(testDbUri, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ Test database connected");
  } catch (error) {
    console.error("❌ Test database connection failed:", error.message);
    // Use in-memory fallback if no MongoDB available
    console.log("ℹ️ Running tests without database");
  }
};

/**
 * Disconnect from test database
 */
export const disconnectTestDB = async () => {
  try {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    console.log("✅ Test database disconnected");
  } catch (error) {
    console.error("❌ Error disconnecting test database:", error.message);
  }
};

/**
 * Clear all collections in test database
 */
export const clearTestDB = async () => {
  if (mongoose.connection.readyState !== 1) return;
  
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

/**
 * Create a test user
 */
export const createTestUser = async (overrides = {}) => {
  const User = (await import("../domain/models/User.model.js")).default;
  
  const userData = {
    name: "Test User",
    email: `test_${Date.now()}@example.com`,
    password: "testpassword123",
    role: "user",
    status: "active",
    ...overrides,
  };
  
  const user = new User(userData);
  await user.save();
  
  return user;
};

/**
 * Generate test JWT token
 */
export const generateTestToken = (userId) => {
  const jwt = require("jsonwebtoken");
  return jwt.sign(
    { id: userId, role: "user" },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

/**
 * Create test request helper
 */
export const createTestRequest = (app) => {
  const supertest = require("supertest");
  return supertest(app);
};

// Global setup
beforeAll(async () => {
  await connectTestDB();
});

// Global teardown
afterAll(async () => {
  await disconnectTestDB();
});

// Clear data between tests
afterEach(async () => {
  await clearTestDB();
});

export default {
  connectTestDB,
  disconnectTestDB,
  clearTestDB,
  createTestUser,
  generateTestToken,
  createTestRequest,
};

