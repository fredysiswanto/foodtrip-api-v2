/**
 * Auth Routes
 * HTTP routes for authentication endpoints
 * References: Phase 4 - Authentication & Authorization, Section 4.5
 */
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthController } from '../controllers/AuthController';
import { AuthService } from '../services/AuthService';
import { AuthRepository } from '../repositories/AuthRepository';
import { validate } from '@shared/middleware';
import { authenticateJWT } from '@shared/middleware/auth';
import { getSequelize } from '@db/sequelize';

/**
 * Validation schemas using Zod
 */
const registerSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be at most 100 characters'),
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .refine((pwd) => /[A-Z]/.test(pwd), 'Password must contain uppercase letter')
    .refine((pwd) => /\d/.test(pwd), 'Password must contain number')
    .refine((pwd) => /[!@#$%^&*]/.test(pwd), 'Password must contain special character (!@#$%^&*)'),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

/**
 * Create and configure auth routes
 */
export function createAuthRoutes(): Router {
  const router = Router();

  // Initialize dependencies
  const sequelize = getSequelize();
  const authRepository = new AuthRepository();
  const authService = new AuthService(authRepository, sequelize);
  const authController = new AuthController(authService);

  /**
   * POST /api/v1/auth/register
   * Register new user
   */
  router.post(
    '/register',
    validate(registerSchema),
    (req: Request, res: Response, next: NextFunction) => authController.register(req, res, next)
  );

  /**
   * POST /api/v1/auth/login
   * Login user and return tokens
   */
  router.post('/login', validate(loginSchema), (req: Request, res: Response, next: NextFunction) =>
    authController.login(req, res, next)
  );

  /**
   * POST /api/v1/auth/refresh
   * Refresh access token using refresh token
   */
  router.post(
    '/refresh',
    validate(refreshSchema),
    (req: Request, res: Response, next: NextFunction) => authController.refresh(req, res, next)
  );

  /**
   * POST /api/v1/auth/logout
   * Logout user and revoke all tokens
   */
  router.post('/logout', authenticateJWT, (req: Request, res: Response, next: NextFunction) =>
    authController.logout(req, res, next)
  );

  /**
   * GET /api/v1/auth/me
   * Get current authenticated user
   */
  router.get('/me', authenticateJWT, (req: Request, res: Response, next: NextFunction) =>
    authController.getCurrentUser(req, res, next)
  );

  return router;
}
