/**
 * Auth Service
 * Business logic for authentication operations
 * References: Phase 4 - Authentication & Authorization, Section 4.3
 */
import { Sequelize, Transaction } from 'sequelize';
import { AuthRepository } from '../repositories/AuthRepository';
import { UnauthorizedError, ConflictError, ValidationError, NotFoundError } from '@shared/errors';
import { jwtHelper } from '@shared/utils/jwt';
import { bcryptHelper } from '@shared/utils/bcrypt';
import { generators } from '@shared/utils';
import logger from '@shared/utils/logger';

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  constructor(
    private authRepository: AuthRepository,
    private sequelize: Sequelize
  ) {}

  /**
   * Register new user
   * Uses transaction to ensure atomicity
   * Error codes: DUPLICATE_EMAIL, INVALID_REQUEST
   */
  async register(input: RegisterInput): Promise<AuthResponse> {
    // Validate required fields
    if (!input.email || !input.password || !input.fullName) {
      throw new ValidationError('Email, password, and full name are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email)) {
      throw new ValidationError('Invalid email format', 'email');
    }

    // Validate password strength (8+ chars, uppercase, number, special)
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).*$/;
    if (input.password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long', 'password');
    }
    if (!passwordRegex.test(input.password)) {
      throw new ValidationError(
        'Password must contain uppercase letter, number, and special character',
        'password'
      );
    }

    // Check if email already exists
    const existingUser = await this.authRepository.findUserByEmail(input.email);
    if (existingUser) {
      throw new ConflictError('DUPLICATE_EMAIL', 'Email already registered', 'email');
    }

    // Check if phone exists (if provided)
    if (input.phone) {
      const phoneExists = await this.authRepository.phoneExists(input.phone);
      if (phoneExists) {
        throw new ConflictError('DUPLICATE_PHONE', 'Phone number already registered', 'phone');
      }
    }

    const transaction = await this.sequelize.transaction({
      isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
    });

    try {
      // Get CUSTOMER role (should be seeded in Phase 1)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rolesResult: any = await this.sequelize.query(
        'SELECT id FROM roles WHERE name = :name LIMIT 1',
        {
          replacements: { name: 'CUSTOMER' },
          type: 'SELECT',
          transaction,
        }
      );

      const roles = Array.isArray(rolesResult) ? rolesResult : [];
      if (!roles || roles.length === 0) {
        throw new Error('CUSTOMER role not found');
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const customerRoleId = (roles[0] as any).id;

      // Create user (password will be hashed by hook)
      const user = await this.authRepository.createUser(
        {
          roleId: customerRoleId,
          fullName: input.fullName,
          email: input.email,
          phone: input.phone,
          password: input.password,
          isActive: true,
        },
        transaction
      );

      // Generate JWT access token
      const accessToken = jwtHelper.sign({
        id: user.id,
        email: user.email,
        role: 'CUSTOMER',
      });

      // Generate and store refresh token
      const refreshTokenString = generators.uuid();
      const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      await this.authRepository.createRefreshToken(
        user.id,
        refreshTokenString,
        refreshExpiresAt,
        transaction
      );

      await transaction.commit();

      logger.info('User registered successfully', { userId: user.id, email: user.email });

      return {
        user: this.sanitizeUser(user),
        accessToken,
        refreshToken: refreshTokenString,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Login user
   * Uses transaction for token creation
   * Error codes: INVALID_CREDENTIALS, UNAUTHORIZED
   */
  async login(input: LoginInput): Promise<AuthResponse> {
    // Validate required fields
    if (!input.email || !input.password) {
      throw new UnauthorizedError('INVALID_CREDENTIALS', 'Invalid email or password');
    }

    // Find user including soft-deleted (to provide better error messages)
    const user = await this.authRepository.findUserByEmail(input.email, true);
    if (!user) {
      // Timing-safe error: always return same message
      throw new UnauthorizedError('INVALID_CREDENTIALS', 'Invalid email or password');
    }

    // Check if user is soft-deleted
    if (user.deletedAt) {
      throw new UnauthorizedError('UNAUTHORIZED', 'Account has been deactivated');
    }

    // Verify password
    const passwordMatch = await bcryptHelper.compare(input.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedError('INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const transaction = await this.sequelize.transaction({
      isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
    });

    try {
      // Update last login timestamp
      await this.authRepository.updateLastLogin(user.id, transaction);

      // Fetch user with role for token payload
      const userWithRole = await this.authRepository.findActiveUserById(user.id);
      if (!userWithRole) {
        throw new NotFoundError('user');
      }

      // Generate JWT access token
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const accessToken = jwtHelper.sign({
        id: userWithRole.id,
        email: userWithRole.email,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        role: (userWithRole as any).role?.name || 'CUSTOMER',
        restaurantId: userWithRole.restaurantId,
      });

      // Generate and store refresh token
      const refreshTokenString = generators.uuid();
      const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await this.authRepository.createRefreshToken(
        userWithRole.id,
        refreshTokenString,
        refreshExpiresAt,
        transaction
      );

      await transaction.commit();

      logger.info('User logged in successfully', { userId: userWithRole.id });

      return {
        user: this.sanitizeUser(userWithRole),
        accessToken,
        refreshToken: refreshTokenString,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Refresh access token
   * Error codes: TOKEN_INVALID
   */
  async refreshToken(refreshTokenString: string): Promise<{ accessToken: string }> {
    if (!refreshTokenString) {
      throw new UnauthorizedError('TOKEN_INVALID', 'Refresh token is required');
    }

    const refreshToken = await this.authRepository.findValidRefreshToken(refreshTokenString);
    if (!refreshToken) {
      throw new UnauthorizedError('TOKEN_INVALID', 'Refresh token invalid or expired');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = (refreshToken as any).user;
    const role = user.role;

    const accessToken = jwtHelper.sign({
      id: user.id,
      email: user.email,
      role: role?.name || 'CUSTOMER',
      restaurantId: user.restaurantId,
    });

    logger.info('Token refreshed successfully', { userId: user.id });

    return { accessToken };
  }

  /**
   * Logout user (revoke all refresh tokens)
   */
  async logout(userId: string): Promise<void> {
    const transaction = await this.sequelize.transaction();
    try {
      await this.authRepository.revokeAllUserTokens(userId, transaction);
      await transaction.commit();
      logger.info('User logged out successfully', { userId });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get current authenticated user
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getCurrentUser(userId: string): Promise<any> {
    const user = await this.authRepository.findActiveUserById(userId);
    if (!user) {
      throw new NotFoundError('user');
    }
    return this.sanitizeUser(user);
  }

  /**
   * Remove sensitive data from user object
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private sanitizeUser(user: any): any {
    const userJson = user.toJSON ? user.toJSON() : user;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...sanitized } = userJson;
    return sanitized;
  }
}
