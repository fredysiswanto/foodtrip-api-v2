import dotenv from 'dotenv';
import path from 'path';

// Load .env file based on NODE_ENV
const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env.development';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

export interface AppConfig {
  nodeEnv: 'development' | 'staging' | 'production';
  port: number;
  appName: string;
  appUrl: string;
}

export interface DatabaseConfig {
  dialect: 'sqlite' | 'mysql' | 'postgres';
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  storage?: string;
  pool?: { min: number; max: number; acquire: number; idle: number };
}

export interface JwtConfig {
  secret: string;
  expiry: string;
  refreshSecret: string;
  refreshExpiry: string;
}

export interface SecurityConfig {
  bcryptRounds: number;
  corsOrigin: string[];
  corsCredentials: boolean;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  authMaxRequests: number;
}

export interface FileUploadConfig {
  maxSize: number;
  uploadDir: string;
  allowedMimeTypes: string[];
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'simple';
}

/**
 * Configuration loader with validation
 * Throws error if required env vars missing
 */
function validateConfig(): void {
  const required = ['NODE_ENV', 'PORT', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'DB_DIALECT'];

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

validateConfig();

type NodeEnv = 'development' | 'staging' | 'production';
type DbDialect = 'sqlite' | 'mysql' | 'postgres';
type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogFormat = 'json' | 'simple';

export const appConfig: AppConfig = {
  nodeEnv: (process.env.NODE_ENV as NodeEnv) || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  appName: process.env.APP_NAME || 'FoodTrip API',
  appUrl: process.env.APP_URL || 'http://localhost:3000',
};

export const databaseConfig: DatabaseConfig = {
  dialect: (process.env.DB_DIALECT as DbDialect) || 'sqlite',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  storage: process.env.DB_STORAGE,
  pool: {
    min: 2,
    max: 10,
    acquire: 30000,
    idle: 10000,
  },
};

export const jwtConfig: JwtConfig = {
  secret: process.env.JWT_SECRET!,
  expiry: process.env.JWT_EXPIRY || '15m',
  refreshSecret: process.env.JWT_REFRESH_SECRET!,
  refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
};

export const securityConfig: SecurityConfig = {
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
  corsCredentials: process.env.CORS_CREDENTIALS !== 'false',
};

export const rateLimitConfig: RateLimitConfig = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  authMaxRequests: parseInt(process.env.RATE_LIMIT_AUTH_MAX || '20', 10),
};

export const fileUploadConfig: FileUploadConfig = {
  maxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '5242880', 10),
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  allowedMimeTypes: (process.env.ALLOWED_MIME_TYPES || 'image/jpeg,image/png,image/webp').split(
    ','
  ),
};

export const loggingConfig: LoggingConfig = {
  level: (process.env.LOG_LEVEL as LogLevel) || 'debug',
  format: (process.env.LOG_FORMAT as LogFormat) || 'json',
};

export default {
  app: appConfig,
  database: databaseConfig,
  jwt: jwtConfig,
  security: securityConfig,
  rateLimit: rateLimitConfig,
  fileUpload: fileUploadConfig,
  logging: loggingConfig,
};
