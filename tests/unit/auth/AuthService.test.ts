/**
 * Auth Service Unit Tests
 * Tests business logic for authentication operations
 * References: Phase 4 - Authentication & Authorization
 */
import { AuthService } from '../../../src/modules/auth/services/AuthService';
import { AuthRepository } from '../../../src/modules/auth/repositories/AuthRepository';
import { Sequelize } from 'sequelize';
import {
  UnauthorizedError,
  ConflictError,
  ValidationError,
  NotFoundError,
} from '../../../src/shared/errors';
import { jwtHelper } from '../../../src/shared/utils/jwt';
import { bcryptHelper } from '../../../src/shared/utils/bcrypt';

describe('AuthService - Unit Tests', () => {
  let authService: AuthService;
  let mockRepository: jest.Mocked<AuthRepository>;
  let mockSequelize: jest.Mocked<Sequelize>;

  beforeEach(() => {
    // Mock dependencies
    mockRepository = {
      findUserByEmail: jest.fn(),
      findActiveUserById: jest.fn(),
      createUser: jest.fn(),
      updateLastLogin: jest.fn(),
      createRefreshToken: jest.fn(),
      findValidRefreshToken: jest.fn(),
      revokeRefreshToken: jest.fn(),
      revokeAllUserTokens: jest.fn(),
      emailExists: jest.fn(),
      phoneExists: jest.fn(),
    } as any;

    mockSequelize = {
      transaction: jest.fn(),
      query: jest.fn(),
    } as any;

    authService = new AuthService(mockRepository, mockSequelize);
  });

  describe('register', () => {
    it('should register new user with valid credentials', async () => {
      const input = {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123!',
      };

      const mockTransaction = {
        commit: jest.fn(),
        rollback: jest.fn(),
      };

      const mockUser = {
        id: 'user-123',
        email: input.email,
        password: 'hashed-password',
        toJSON: () => ({
          id: 'user-123',
          email: input.email,
          fullName: input.fullName,
        }),
      };

      mockSequelize.transaction.mockResolvedValue(mockTransaction as any);
      mockSequelize.query.mockResolvedValue([{ id: 'role-customer' }]);
      mockRepository.findUserByEmail.mockResolvedValue(null);
      mockRepository.phoneExists.mockResolvedValue(false);
      mockRepository.createUser.mockResolvedValue(mockUser as any);
      mockRepository.createRefreshToken.mockResolvedValue({ id: 'token-123' } as any);

      const result = await authService.register(input);

      expect(result.user.email).toBe(input.email);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('should reject invalid email format', async () => {
      const input = {
        fullName: 'John Doe',
        email: 'invalid-email',
        password: 'SecurePass123!',
      };

      await expect(authService.register(input)).rejects.toThrow(ValidationError);
    });

    it('should reject weak password (less than 8 chars)', async () => {
      const input = {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'Pass1!',
      };

      await expect(authService.register(input)).rejects.toThrow(ValidationError);
    });

    it('should reject password without uppercase letter', async () => {
      const input = {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'securepass123!',
      };

      await expect(authService.register(input)).rejects.toThrow(ValidationError);
    });

    it('should reject password without number', async () => {
      const input = {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass!',
      };

      await expect(authService.register(input)).rejects.toThrow(ValidationError);
    });

    it('should reject password without special character', async () => {
      const input = {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123',
      };

      await expect(authService.register(input)).rejects.toThrow(ValidationError);
    });

    it('should reject duplicate email', async () => {
      const input = {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123!',
      };

      const existingUser = { id: 'existing-user' };
      mockRepository.findUserByEmail.mockResolvedValue(existingUser as any);

      await expect(authService.register(input)).rejects.toThrow(ConflictError);
    });

    it('should reject duplicate phone number', async () => {
      const input = {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123!',
        phone: '+1234567890',
      };

      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };

      mockSequelize.transaction.mockResolvedValue(mockTransaction as any);
      mockRepository.findUserByEmail.mockResolvedValue(null);
      mockRepository.phoneExists.mockResolvedValue(true);

      await expect(authService.register(input)).rejects.toThrow(ConflictError);
    });

    it('should rollback transaction on error', async () => {
      const input = {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123!',
      };

      const mockTransaction = {
        commit: jest.fn(),
        rollback: jest.fn(),
      };

      mockSequelize.transaction.mockResolvedValue(mockTransaction as any);
      mockRepository.findUserByEmail.mockResolvedValue(null);
      mockRepository.phoneExists.mockResolvedValue(false);
      mockRepository.createUser.mockRejectedValue(new Error('Database error'));

      await expect(authService.register(input)).rejects.toThrow();
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const input = {
        email: 'john@example.com',
        password: 'SecurePass123!',
      };

      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };

      const mockUser = {
        id: 'user-123',
        email: input.email,
        password: 'hashed-password',
        deletedAt: null,
        restaurantId: null,
        toJSON: () => ({
          id: 'user-123',
          email: input.email,
          fullName: 'John Doe',
        }),
      };

      const mockUserWithRole = {
        ...mockUser,
        role: { name: 'CUSTOMER' },
      };

      mockRepository.findUserByEmail.mockResolvedValue(mockUser as any);
      mockSequelize.transaction.mockResolvedValue(mockTransaction as any);
      mockRepository.updateLastLogin.mockResolvedValue(undefined);
      mockRepository.findActiveUserById.mockResolvedValue(mockUserWithRole as any);
      mockRepository.createRefreshToken.mockResolvedValue({ id: 'token-123' } as any);

      // Mock bcrypt compare
      jest.spyOn(bcryptHelper, 'compare').mockResolvedValue(true);

      const result = await authService.login(input);

      expect(result.user.email).toBe(input.email);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('should reject invalid email', async () => {
      const input = {
        email: 'nonexistent@example.com',
        password: 'SecurePass123!',
      };

      mockRepository.findUserByEmail.mockResolvedValue(null);

      await expect(authService.login(input)).rejects.toThrow(UnauthorizedError);
    });

    it('should reject invalid password', async () => {
      const input = {
        email: 'john@example.com',
        password: 'WrongPassword123!',
      };

      const mockUser = {
        id: 'user-123',
        email: input.email,
        password: 'hashed-password',
        deletedAt: null,
      };

      mockRepository.findUserByEmail.mockResolvedValue(mockUser as any);
      jest.spyOn(bcryptHelper, 'compare').mockResolvedValue(false);

      await expect(authService.login(input)).rejects.toThrow(UnauthorizedError);
    });

    it('should reject soft-deleted user', async () => {
      const input = {
        email: 'john@example.com',
        password: 'SecurePass123!',
      };

      const mockUser = {
        id: 'user-123',
        email: input.email,
        password: 'hashed-password',
        deletedAt: new Date(),
      };

      mockRepository.findUserByEmail.mockResolvedValue(mockUser as any);

      await expect(authService.login(input)).rejects.toThrow(UnauthorizedError);
    });

    it('should rollback transaction on error', async () => {
      const input = {
        email: 'john@example.com',
        password: 'SecurePass123!',
      };

      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };

      const mockUser = {
        id: 'user-123',
        email: input.email,
        password: 'hashed-password',
        deletedAt: null,
      };

      mockRepository.findUserByEmail.mockResolvedValue(mockUser as any);
      mockSequelize.transaction.mockResolvedValue(mockTransaction as any);
      jest.spyOn(bcryptHelper, 'compare').mockResolvedValue(true);
      mockRepository.updateLastLogin.mockRejectedValue(new Error('Database error'));

      await expect(authService.login(input)).rejects.toThrow();
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('should refresh access token with valid refresh token', async () => {
      const refreshTokenString = 'valid-refresh-token';

      const mockRefreshToken = {
        id: 'token-123',
        user: {
          id: 'user-123',
          email: 'john@example.com',
          restaurantId: null,
          role: { name: 'CUSTOMER' },
        },
      };

      mockRepository.findValidRefreshToken.mockResolvedValue(mockRefreshToken as any);

      const result = await authService.refreshToken(refreshTokenString);

      expect(result.accessToken).toBeDefined();
    });

    it('should reject invalid refresh token', async () => {
      const refreshTokenString = 'invalid-refresh-token';

      mockRepository.findValidRefreshToken.mockResolvedValue(null);

      await expect(authService.refreshToken(refreshTokenString)).rejects.toThrow(UnauthorizedError);
    });

    it('should reject empty refresh token', async () => {
      const refreshTokenString = '';

      await expect(authService.refreshToken(refreshTokenString)).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('logout', () => {
    it('should logout user and revoke tokens', async () => {
      const userId = 'user-123';
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };

      mockSequelize.transaction.mockResolvedValue(mockTransaction as any);
      mockRepository.revokeAllUserTokens.mockResolvedValue(undefined);

      await authService.logout(userId);

      expect(mockRepository.revokeAllUserTokens).toHaveBeenCalledWith(userId, mockTransaction);
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('should rollback transaction on error', async () => {
      const userId = 'user-123';
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };

      mockSequelize.transaction.mockResolvedValue(mockTransaction as any);
      mockRepository.revokeAllUserTokens.mockRejectedValue(new Error('Database error'));

      await expect(authService.logout(userId)).rejects.toThrow();
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      const userId = 'user-123';

      const mockUser = {
        id: userId,
        email: 'john@example.com',
        fullName: 'John Doe',
        password: 'hashed-password',
        toJSON: () => ({
          id: userId,
          email: 'john@example.com',
          fullName: 'John Doe',
        }),
      };

      mockRepository.findActiveUserById.mockResolvedValue(mockUser as any);

      const result = await authService.getCurrentUser(userId);

      expect(result.email).toBe('john@example.com');
      expect(result.password).toBeUndefined();
    });

    it('should throw NotFoundError if user not found', async () => {
      const userId = 'nonexistent-user';

      mockRepository.findActiveUserById.mockResolvedValue(null);

      await expect(authService.getCurrentUser(userId)).rejects.toThrow(NotFoundError);
    });
  });

  describe('sanitizeUser', () => {
    it('should remove password from user object', async () => {
      const userId = 'user-123';

      const mockUser = {
        id: userId,
        email: 'john@example.com',
        fullName: 'John Doe',
        password: 'secret-hashed-password',
        toJSON: () => ({
          id: userId,
          email: 'john@example.com',
          fullName: 'John Doe',
          password: 'secret-hashed-password',
        }),
      };

      mockRepository.findActiveUserById.mockResolvedValue(mockUser as any);

      const result = await authService.getCurrentUser(userId);

      expect(result).not.toHaveProperty('password');
    });
  });
});
