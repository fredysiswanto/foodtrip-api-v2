import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { appConfig, securityConfig, rateLimitConfig } from '@config/index';
import logger from '@shared/utils/logger';
import { initializeSequelize } from '@db/sequelize';
import { createAuthRoutes } from '@modules/auth/routes/authRoutes';

interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

/**
 * Express application factory
 * Creates and configures the main Express app with middleware
 */
function createApp(): Express {
  const app = express();

  // ============================================
  // Security Middleware
  // ============================================
  app.use(helmet());
  app.use(
    cors({
      origin: securityConfig.corsOrigin,
      credentials: securityConfig.corsCredentials,
    })
  );

  // ============================================
  // Rate Limiting
  // ============================================
  const generalLimiter = rateLimit({
    windowMs: rateLimitConfig.windowMs,
    max: rateLimitConfig.maxRequests,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Auth limiter will be used in Phase 4 for auth routes
  // const authLimiter = rateLimit({
  //   windowMs: rateLimitConfig.windowMs,
  //   max: rateLimitConfig.authMaxRequests,
  //   message: 'Too many authentication attempts, please try again later.',
  //   standardHeaders: true,
  //   legacyHeaders: false,
  // });

  app.use(generalLimiter);

  // ============================================
  // Body Parser Middleware
  // ============================================
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // ============================================
  // Logging Middleware
  // ============================================
  app.use((req: Request, _res: Response, next: NextFunction) => {
    logger.info(`${req.method} ${req.path}`);
    next();
  });

  // ============================================
  // Health Check Endpoint
  // ============================================
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      message: 'FoodTrip API is running',
      timestamp: new Date().toISOString(),
      environment: appConfig.nodeEnv,
    });
  });

  // ============================================
  // API Documentation Placeholder
  // ============================================
  app.get('/api/docs', (_req: Request, res: Response) => {
    res.status(200).json({
      message: 'API Documentation',
      version: '2.1.0',
      docs: 'https://github.com/foodtrip-api/v2.1-docs',
    });
  });

  // ============================================
  // API Routes (Phase 4+)
  // ============================================
  app.use('/api/v1/auth', createAuthRoutes());

  // ============================================
  // 404 Handler
  // ============================================
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: 'Route not found',
    });
  });

  // ============================================
  // Error Handler Middleware
  // ============================================
  app.use((err: AppError, _req: Request, res: Response, _next: NextFunction) => {
    const statusCode = err.statusCode || 500;
    const code = err.code || 'INTERNAL_ERROR';
    const message = err.message || 'Internal server error';

    logger.error('Unhandled error:', {
      message,
      stack: err.stack,
      statusCode,
      code,
    });

    res.status(statusCode).json({
      success: false,
      message,
      code,
    });
  });

  return app;
}

export default createApp;

// ============================================
// Server Startup (only when file is run directly)
// ============================================
if (require.main === module) {
  // Initialize Sequelize before creating app
  initializeSequelize();

  const app = createApp();

  app.listen(appConfig.port, () => {
    logger.info(`🚀 FoodTrip API v2.1 is running on http://localhost:${appConfig.port}`);
    logger.info(`Environment: ${appConfig.nodeEnv}`);
    logger.info(`Health check: http://localhost:${appConfig.port}/health`);
  });
}
