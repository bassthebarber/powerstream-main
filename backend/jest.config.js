// backend/jest.config.js
// Jest configuration for PowerStream backend tests

export default {
  // Use ES modules
  testEnvironment: "node",
  
  // Transform ES modules
  transform: {},
  
  // Test file patterns
  testMatch: [
    "**/src/tests/**/*.test.js",
    "**/tests/**/*.test.js",
  ],
  
  // Setup files
  setupFilesAfterEnv: [],
  
  // Module name mapper for aliases
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  
  // Coverage configuration
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/tests/**",
    "!src/config/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
  ],
  
  // Verbose output
  verbose: true,
  
  // Timeout for async tests
  testTimeout: 30000,
  
  // Force exit after tests complete
  forceExit: true,
  
  // Detect open handles
  detectOpenHandles: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true,
};



