/**
 * Jest Setup File
 * Sets up environment variables and test configuration
 */

// Set default environment variables for tests
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.PORT = process.env.PORT || '3000';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-min-32-chars-long-123';
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'test-jwt-refresh-secret-min-32-chars-long-123';
process.env.DB_DIALECT = process.env.DB_DIALECT || 'sqlite';
process.env.DB_STORAGE = process.env.DB_STORAGE || ':memory:';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
