/**
 * Auth Controller
 * HTTP request handlers for authentication endpoints
 * References: Phase 4 - Authentication & Authorization, Section 4.4
 */
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { responseFormatter } from '@shared/utils/responseFormatter';
import { JWTPayload } from '@shared/utils/jwt';

export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * POST /api/v1/auth/register
   * Register new user
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.authService.register(req.body);
      res.status(201).json(responseFormatter.created(result, 'User registered successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/login
   * Login user and return tokens
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.authService.login(req.body);
      res.json(responseFormatter.success(result, 'Login successful'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/refresh
   * Refresh access token using refresh token
   */
  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const result = await this.authService.refreshToken(refreshToken);
      res.json(responseFormatter.success(result, 'Token refreshed successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/logout
   * Logout user and revoke all tokens
   */
  async logout(
    req: Request & { user?: JWTPayload },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }
      await this.authService.logout(req.user.id);
      res.json(responseFormatter.success({}, 'Logged out successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/auth/me
   * Get current authenticated user
   */
  async getCurrentUser(
    req: Request & { user?: JWTPayload },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }
      const user = await this.authService.getCurrentUser(req.user.id);
      res.json(responseFormatter.success(user, 'User retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }
}
