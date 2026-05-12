# Phase 4 Implementation Guide: Authentication & Authorization

**Version:** 2.1  
**Target Duration:** 2-3 weeks  
**Priority:** CRITICAL (core user system, blocks all downstream phases)  
**Complexity:** High (JWT flow, transaction safety, concurrent login handling)

---

## 📋 Phase Overview

Phase 4 implements the **authentication and authorization system** that protects all API endpoints. This phase establishes secure user registration, login, token management, and role-based access control.

### Why Phase 4 is Critical

Every protected endpoint in Phases 5-15 depends on:

- User authentication (JWT tokens)
- Role-based authorization (middleware)
- Refresh token rotation
- Token revocation
- User soft deletes
- Restaurant ownership validation

**Phase 4 establishes the security foundation for the entire system.**

### Phase 4 Dependencies

| Depends On                      | Used By                  |
| ------------------------------- | ------------------------ |
| Phase 3 (Shared Infrastructure) | Phase 5 (Restaurants)    |
| Phase 2 (Database schema)       | Phase 6 (Dishes)         |
| Phase 1 (Config, logging)       | Phase 7-15 (all modules) |

### Phase 4 Deliverables

By end of Phase 4, you will have:

- ✅ Role model with proper associations
- ✅ User model with soft deletes & validations
- ✅ Refresh token management
- ✅ Authentication service (register, login, logout, refresh)
- ✅ 5 protected API endpoints
- ✅ Role-based authorization middleware
- ✅ Token expiration handling
- ✅ Concurrent login session management
- ✅ 95%+ test coverage for auth module
- ✅ Swagger documentation for all auth endpoints

---

## 🎯 Task Breakdown

### 4.1 Models & Associations

**Objective:** Create Role and User models with proper Sequelize configuration

#### 4.1.1 Role Model

File: `src/database/models/Role.ts`

```typescript
import { DataTypes, Model, Sequelize } from 'sequelize';

export interface RoleAttributes {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Role extends Model<RoleAttributes> implements RoleAttributes {
  declare id: string;
  declare name: string;
  declare description: string;
  declare createdAt: Date;
  declare updatedAt: Date;

  static associate(models: any) {
    Role.hasMany(models.User, { foreignKey: 'roleId', as: 'users' });
  }
}

export default function roleFactory(sequelize: Sequelize) {
  Role.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
          isIn: [['SUPER_ADMIN', 'RESTO_ADMIN', 'RESTO_STAFF', 'DRIVER', 'CUSTOMER']],
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'Role',
      tableName: 'roles',
      timestamps: true,
      underscored: true,
    }
  );

  return Role;
}
```

#### 4.1.2 User Model

File: `src/database/models/User.ts`

```typescript
import { DataTypes, Model, Sequelize } from 'sequelize';

export interface UserAttributes {
  id: string;
  roleId: string;
  restaurantId?: string;
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  avatarId?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export class User extends Model<UserAttributes> implements UserAttributes {
  declare id: string;
  declare roleId: string;
  declare restaurantId?: string;
  declare fullName: string;
  declare email: string;
  declare phone?: string;
  declare password: string;
  declare avatarId?: string;
  declare isActive: boolean;
  declare lastLoginAt?: Date;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt?: Date;

  static associate(models: any) {
    User.belongsTo(models.Role, { foreignKey: 'roleId', as: 'role' });
    User.belongsTo(models.Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });
    User.belongsTo(models.Upload, { foreignKey: 'avatarId', as: 'avatar' });
    User.hasMany(models.RefreshToken, { foreignKey: 'userId', as: 'refreshTokens' });
  }
}

export default function userFactory(sequelize: Sequelize) {
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      roleId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'roles', key: 'id' },
      },
      restaurantId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'restaurants', key: 'id' },
      },
      fullName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      phone: {
        type: DataTypes.STRING(15),
        allowNull: true,
        unique: true,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      avatarId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'uploads', key: 'id' },
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
      paranoid: true, // Enable soft deletes
      underscored: true,
      indexes: [
        { fields: ['email'], unique: true },
        { fields: ['phone'], unique: true, where: { deletedAt: null } },
        { fields: ['roleId'] },
        { fields: ['restaurantId'] },
      ],
    }
  );

  return User;
}
```

#### 4.1.3 RefreshToken Model

File: `src/database/models/RefreshToken.ts`

```typescript
import { DataTypes, Model, Sequelize } from 'sequelize';

export interface RefreshTokenAttributes {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  revokedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class RefreshToken extends Model<RefreshTokenAttributes> implements RefreshTokenAttributes {
  declare id: string;
  declare userId: string;
  declare token: string;
  declare expiresAt: Date;
  declare revokedAt?: Date;
  declare createdAt: Date;
  declare updatedAt: Date;

  static associate(models: any) {
    RefreshToken.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  }

  /**
   * Check if token is valid (not expired and not revoked)
   */
  isValid(): boolean {
    return Date.now() < this.expiresAt.getTime() && !this.revokedAt;
  }
}

export default function refreshTokenFactory(sequelize: Sequelize) {
  RefreshToken.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
      },
      token: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      revokedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'RefreshToken',
      tableName: 'refresh_tokens',
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ['userId'] },
        { fields: ['token'], unique: true },
        { fields: ['expiresAt'] }, // For cleanup queries
      ],
    }
  );

  return RefreshToken;
}
```

**Tests:**

```typescript
describe('User Model', () => {
  it('should hash password on create', async () => {
    const user = await User.create({
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'SecurePass123!',
      roleId: customerRoleId,
    });
    expect(user.password).not.toBe('SecurePass123!');
  });

  it('should enforce email uniqueness', async () => {
    await expect(
      User.create({
        fullName: 'Jane Doe',
        email: 'john@example.com',
        password: 'SecurePass123!',
        roleId: customerRoleId,
      })
    ).rejects.toThrow();
  });

  it('should soft delete user', async () => {
    const user = await User.create({...});
    await user.destroy();
    const found = await User.findByPk(user.id);
    expect(found).toBeNull();
  });
});
```

---

### 4.2 Auth Repository

**Objective:** Implement data access layer for user authentication

File: `src/modules/auth/repositories/AuthRepository.ts`

```typescript
import { User, RefreshToken } from '@db/models';
import { Transaction } from 'sequelize';

export class AuthRepository {
  /**
   * Find user by email (including soft-deleted)
   */
  async findUserByEmail(email: string, includeDeleted = false): Promise<User | null> {
    const query: any = { where: { email } };
    if (includeDeleted) {
      query.paranoid = false;
    }
    return User.findOne(query);
  }

  /**
   * Find active user by ID
   */
  async findActiveUserById(userId: string): Promise<User | null> {
    return User.findByPk(userId);
  }

  /**
   * Create new user
   */
  async createUser(data: any, transaction?: Transaction): Promise<User> {
    return User.create(data, { transaction });
  }

  /**
   * Update user last login
   */
  async updateLastLogin(userId: string, transaction?: Transaction): Promise<void> {
    await User.update({ lastLoginAt: new Date() }, { where: { id: userId }, transaction });
  }

  /**
   * Create refresh token
   */
  async createRefreshToken(
    userId: string,
    token: string,
    expiresAt: Date,
    transaction?: Transaction
  ): Promise<RefreshToken> {
    return RefreshToken.create(
      {
        userId,
        token,
        expiresAt,
      },
      { transaction }
    );
  }

  /**
   * Find valid refresh token
   */
  async findValidRefreshToken(token: string): Promise<RefreshToken | null> {
    const refreshToken = await RefreshToken.findOne({
      where: { token },
      include: ['user'],
    });

    if (!refreshToken || !refreshToken.isValid()) {
      return null;
    }

    return refreshToken;
  }

  /**
   * Revoke refresh token
   */
  async revokeRefreshToken(tokenId: string, transaction?: Transaction): Promise<void> {
    await RefreshToken.update({ revokedAt: new Date() }, { where: { id: tokenId }, transaction });
  }

  /**
   * Revoke all user refresh tokens (logout)
   */
  async revokeAllUserTokens(userId: string, transaction?: Transaction): Promise<void> {
    await RefreshToken.update(
      { revokedAt: new Date() },
      {
        where: { userId, revokedAt: null },
        transaction,
      }
    );
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    const count = await User.count({ where: { email } });
    return count > 0;
  }
}
```

---

### 4.3 Auth Service

**Objective:** Implement authentication business logic with transaction safety

File: `src/modules/auth/services/AuthService.ts`

```typescript
import { Sequelize, Transaction } from 'sequelize';
import { AuthRepository } from '../repositories/AuthRepository';
import { UnauthorizedError, ConflictError, ValidationError, NotFoundError } from '@shared/errors';
import { jwtHelper, bcryptHelper, generators } from '@shared/utils';
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
  user: any;
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
   * IMPORTANT: Uses transaction to ensure atomicity
   */
  async register(input: RegisterInput): Promise<AuthResponse> {
    // Validate input
    if (!input.email || !input.password) {
      throw new ValidationError('Email and password required');
    }

    // Check email already exists
    const existingUser = await this.authRepository.findUserByEmail(input.email);
    if (existingUser) {
      throw new ConflictError('DUPLICATE_EMAIL', 'Email already registered', 'email');
    }

    const transaction = await this.sequelize.transaction({
      isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
    });

    try {
      // Hash password
      const hashedPassword = await bcryptHelper.hash(input.password);

      // Get CUSTOMER role
      const customerRole = await this.sequelize.query('SELECT id FROM roles WHERE name = :name', {
        replacements: { name: 'CUSTOMER' },
        type: 'SELECT',
        transaction,
      });

      if (!customerRole || customerRole.length === 0) {
        throw new Error('CUSTOMER role not found');
      }

      // Create user
      const user = await this.authRepository.createUser(
        {
          roleId: (customerRole[0] as any).id,
          fullName: input.fullName,
          email: input.email,
          phone: input.phone,
          password: hashedPassword,
          isActive: true,
        },
        transaction
      );

      // Generate tokens
      const accessToken = jwtHelper.sign({
        id: user.id,
        email: user.email,
        role: 'CUSTOMER',
      });

      const refreshTokenString = generators.uuid();
      const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      await this.authRepository.createRefreshToken(
        user.id,
        refreshTokenString,
        refreshExpiresAt,
        transaction
      );

      await transaction.commit();

      logger.info('User registered', { userId: user.id, email: user.email });

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
   * IMPORTANT: Uses transaction for token creation
   */
  async login(input: LoginInput): Promise<AuthResponse> {
    if (!input.email || !input.password) {
      throw new UnauthorizedError('INVALID_CREDENTIALS', 'Invalid email or password');
    }

    // Find user (including soft-deleted to show better error)
    const user = await this.authRepository.findUserByEmail(input.email, true);
    if (!user) {
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

    const transaction = await this.sequelize.transaction();

    try {
      // Update last login
      await this.authRepository.updateLastLogin(user.id, transaction);

      // Generate tokens
      const accessToken = jwtHelper.sign({
        id: user.id,
        email: user.email,
        role: user.role?.name || 'CUSTOMER',
        restaurantId: user.restaurantId,
      });

      const refreshTokenString = generators.uuid();
      const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await this.authRepository.createRefreshToken(
        user.id,
        refreshTokenString,
        refreshExpiresAt,
        transaction
      );

      await transaction.commit();

      logger.info('User logged in', { userId: user.id });

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
   * Refresh access token
   */
  async refreshToken(refreshTokenString: string): Promise<{ accessToken: string }> {
    const refreshToken = await this.authRepository.findValidRefreshToken(refreshTokenString);
    if (!refreshToken) {
      throw new UnauthorizedError('TOKEN_INVALID', 'Refresh token invalid or expired');
    }

    const user = refreshToken.user as any;

    const accessToken = jwtHelper.sign({
      id: user.id,
      email: user.email,
      role: user.role?.name || 'CUSTOMER',
      restaurantId: user.restaurantId,
    });

    logger.info('Token refreshed', { userId: user.id });

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
      logger.info('User logged out', { userId });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get current user
   */
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
  private sanitizeUser(user: any) {
    const { password, ...sanitized } = user.toJSON();
    return sanitized;
  }
}
```

**Tests:**

```typescript
describe('AuthService', () => {
  it('should register new user', async () => {
    const result = await authService.register({
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'SecurePass123!',
    });

    expect(result.user.email).toBe('john@example.com');
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
  });

  it('should reject duplicate email', async () => {
    await authService.register({
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'SecurePass123!',
    });

    await expect(
      authService.register({
        fullName: 'Jane Doe',
        email: 'john@example.com',
        password: 'SecurePass123!',
      })
    ).rejects.toThrow(ConflictError);
  });

  it('should login user', async () => {
    await authService.register({...});
    const result = await authService.login({
      email: 'john@example.com',
      password: 'SecurePass123!',
    });

    expect(result.accessToken).toBeDefined();
  });

  it('should reject invalid password', async () => {
    await authService.register({...});
    await expect(
      authService.login({
        email: 'john@example.com',
        password: 'WrongPassword',
      })
    ).rejects.toThrow(UnauthorizedError);
  });

  it('should refresh access token', async () => {
    const { refreshToken } = await authService.register({...});
    const result = await authService.refreshToken(refreshToken);

    expect(result.accessToken).toBeDefined();
  });

  it('should logout user', async () => {
    const { user, refreshToken } = await authService.register({...});
    await authService.logout(user.id);

    await expect(authService.refreshToken(refreshToken)).rejects.toThrow();
  });
});
```

---

### 4.4 Auth Controller

**Objective:** Implement HTTP request handlers

File: `src/modules/auth/controllers/AuthController.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { responseFormatter } from '@shared/utils/responseFormatter';
import { JWTPayload } from '@shared/utils/jwt';

export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * POST /api/v1/auth/register
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
   */
  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const result = await this.authService.refreshToken(refreshToken);
      res.json(responseFormatter.success(result, 'Token refreshed'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/logout
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
      res.json(responseFormatter.success(user, 'User retrieved'));
    } catch (error) {
      next(error);
    }
  }
}
```

---

### 4.5 Auth Routes

**Objective:** Define HTTP routes for auth endpoints

File: `src/modules/auth/routes/authRoutes.ts`

```typescript
import { Router, Request, Response, NextFunction } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validate } from '@shared/middleware';
import { authenticateJWT } from '@shared/middleware';
import { z } from 'zod';

const router = Router();
const authController = new AuthController(authService);

// Validation schemas
const registerSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[0-9]/)
    .regex(/[!@#$%^&*]/),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

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

export default router;
```

---

### 4.6 Error Codes for Auth

**Reference:** Verify all error codes match `API-ERROR-CODES.MD`

| Scenario                 | Error Code               | HTTP | Field          | Message                                                        |
| ------------------------ | ------------------------ | ---- | -------------- | -------------------------------------------------------------- |
| Email already registered | `DUPLICATE_EMAIL`        | 409  | email          | Email already registered                                       |
| Invalid credentials      | `INVALID_CREDENTIALS`    | 401  | email/password | Invalid email or password                                      |
| Token expired            | `TOKEN_EXPIRED`          | 401  | authorization  | Token expired, use refresh token                               |
| Token invalid            | `TOKEN_INVALID`          | 401  | authorization  | Invalid or tampered token                                      |
| Token revoked            | `TOKEN_REVOKED`          | 401  | authorization  | Refresh token has been revoked                                 |
| No auth token            | `UNAUTHORIZED`           | 401  | -              | No authorization token provided                                |
| Account inactive         | `UNAUTHORIZED`           | 401  | -              | Account has been deactivated                                   |
| Missing required field   | `MISSING_REQUIRED_FIELD` | 400  | fieldName      | Required field missing                                         |
| Invalid email            | `INVALID_EMAIL`          | 400  | email          | Invalid email format                                           |
| Invalid password         | `INVALID_REQUEST`        | 400  | password       | Password must be 8+ chars with uppercase, number, special char |
| User not found           | `USER_NOT_FOUND`         | 404  | user_id        | User not found                                                 |

---

## 🧪 Testing Strategy

### Unit Tests (50% of Phase 4 tests)

**Test AuthService:**

```typescript
describe('AuthService - Unit', () => {
  // Registration tests
  it('should validate email format', async () => {...});
  it('should validate password strength', async () => {...});
  it('should hash password correctly', async () => {...});
  it('should reject duplicate email', async () => {...});

  // Login tests
  it('should verify password correctly', async () => {...});
  it('should reject wrong password', async () => {...});
  it('should update last login timestamp', async () => {...});

  // Token tests
  it('should generate valid JWT', async () => {...});
  it('should create refresh token', async () => {...});
  it('should validate refresh token', async () => {...});
  it('should reject expired token', async () => {...});
  it('should revoke token', async () => {...});
  it('should revoke all user tokens on logout', async () => {...});

  // Authorization tests
  it('should verify user soft delete', async () => {...});
});
```

### Integration Tests (50% of Phase 4 tests)

**Test Auth Endpoints:**

```typescript
describe('Auth Endpoints - Integration', () => {
  // Register endpoint
  it('POST /auth/register should create user', async () => {...});
  it('POST /auth/register should reject invalid email', async () => {...});
  it('POST /auth/register should reject weak password', async () => {...});
  it('POST /auth/register should return tokens', async () => {...});

  // Login endpoint
  it('POST /auth/login should login user', async () => {...});
  it('POST /auth/login should reject wrong password', async () => {...});
  it('POST /auth/login should return new tokens', async () => {...});

  // Refresh endpoint
  it('POST /auth/refresh should return new access token', async () => {...});
  it('POST /auth/refresh should reject invalid refresh token', async () => {...});
  it('POST /auth/refresh should reject expired token', async () => {...});

  // Logout endpoint
  it('POST /auth/logout should revoke tokens', async () => {...});
  it('POST /auth/logout should require auth', async () => {...});

  // Get current user
  it('GET /auth/me should return current user', async () => {...});
  it('GET /auth/me should require auth', async () => {...});
  it('GET /auth/me should not return password', async () => {...});

  // Concurrent login handling
  it('should handle concurrent logins correctly', async () => {...});
  it('should maintain separate refresh tokens per login', async () => {...});
});
```

### Concurrent/Race Condition Tests

```typescript
describe('Auth - Concurrency & Race Conditions', () => {
  it('should handle concurrent registrations safely', async () => {
    const promises = Array(5)
      .fill(null)
      .map(() =>
        authService.register({
          fullName: 'John Doe',
          email: 'john@example.com',
          password: 'SecurePass123!',
        })
      );

    const results = await Promise.allSettled(promises);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter((r) => r.status === 'rejected')).toHaveLength(4);
  });

  it('should handle concurrent logins safely', async () => {
    const promises = Array(5)
      .fill(null)
      .map(() =>
        authService.login({
          email: 'john@example.com',
          password: 'SecurePass123!',
        })
      );

    const results = await Promise.all(promises);
    expect(results).toHaveLength(5);
    expect(new Set(results.map((r) => r.refreshToken)).size).toBe(5);
  });
});
```

---

## ✅ Acceptance Criteria

Phase 4 is complete when:

- [ ] Role model implemented with proper constraints
- [ ] User model with soft deletes, validations, associations
- [ ] RefreshToken model with expiration and revocation logic
- [ ] AuthRepository with all CRUD operations
- [ ] AuthService with register, login, logout, refresh logic
- [ ] All auth endpoints protected with error handling
- [ ] Password hashing with bcrypt (10+ rounds)
- [ ] JWT token generation and verification
- [ ] Refresh token rotation strategy
- [ ] Token revocation on logout
- [ ] Concurrent login session management
- [ ] Email uniqueness validation
- [ ] Password strength validation (8+ chars, uppercase, number, special char)
- [ ] Error codes match API-ERROR-CODES.MD
- [ ] 95%+ test coverage for auth module
- [ ] All unit & integration tests passing
- [ ] Zero TypeScript errors (`pnpm build`)
- [ ] Zero ESLint errors (`pnpm lint`)
- [ ] Swagger documentation for all endpoints
- [ ] User data sanitized (no password in responses)
- [ ] All transactions properly rolled back on error

---

## 📊 Effort Breakdown

| Task              | Files       | Est. Time     | Priority        |
| ----------------- | ----------- | ------------- | --------------- |
| 4.1 Models        | 3           | 2 days        | ⭐⭐⭐ CRITICAL |
| 4.2 Repository    | 1           | 1 day         | ⭐⭐⭐ CRITICAL |
| 4.3 Service       | 1           | 2 days        | ⭐⭐⭐ CRITICAL |
| 4.4 Controller    | 1           | 1 day         | ⭐⭐⭐ CRITICAL |
| 4.5 Routes        | 1           | 1 day         | ⭐⭐⭐ CRITICAL |
| 4.6 Tests         | -           | 3 days        | ⭐⭐⭐ CRITICAL |
| 4.7 Documentation | -           | 1 day         | ⭐⭐ HIGH       |
| **TOTAL**         | **8 files** | **2-3 weeks** |                 |

---

## 🚀 Continuation Plan

### Phase 4 → Phase 5 Handoff

Once Phase 4 completes, Phase 5 (Restaurant Management) can begin because:

- ✅ User authentication is working
- ✅ Authorization middleware is ready
- ✅ User models support restaurant ownership
- ✅ Error handling established
- ✅ Transaction patterns proven

### Files Phase 5 Will Import from Phase 4

```typescript
// Auth utilities
import { User, RefreshToken, Role } from '@db/models';
import { authenticateJWT, requireRole } from '@shared/middleware';
import { JWTPayload } from '@shared/utils/jwt';

// For restaurant ownership validation
import { UnauthorizedError, ForbiddenError } from '@shared/errors';
```

---

## ⚠️ Common Pitfalls to Avoid

| Pitfall                              | Impact                                   | Prevention                                     |
| ------------------------------------ | ---------------------------------------- | ---------------------------------------------- |
| Storing passwords in plain text      | Security breach                          | Always use bcrypt (10+ rounds)                 |
| No transaction for concurrent logins | Race condition, duplicate tokens         | Use REPEATABLE_READ isolation                  |
| Returning password in response       | Security leak                            | Sanitize user object before response           |
| No token revocation                  | Logout doesn't work, stale tokens active | Implement refresh token blacklist              |
| Weak password validation             | Brute force attacks                      | Enforce 8+ chars, uppercase, number, special   |
| No rate limiting on auth             | Brute force attacks                      | Implement rate limiter middleware              |
| Storing JWT in database              | Overhead                                 | Only store refresh tokens, cache access tokens |
| No error differentiation             | Timing attacks reveal if email exists    | Use generic "invalid credentials"              |
| Hard-coded token expiry              | Configuration inflexible                 | Use environment variables                      |
| No soft delete for users             | Data loss on deactivation                | Always use paranoid: true                      |

---

## 📚 Related Documents

- [API-ERROR-CODES.MD](./API-ERROR-CODES.md) — Error codes for auth (401, 403, 409 errors)
- [DATABASE_DESIGN-V2.1.MD](./DATABASE_DESIGN-V2.1.MD) — User/Role/RefreshToken schemas
- [PHASE-3-OVERVIEW.MD](./PHASE-3-OVERVIEW.MD) — Shared infrastructure (errors, middleware, JWT)
- [ENVIRONMENT-GUIDE.MD](./ENVIRONMENT-GUIDE.MD) — JWT configuration, bcrypt settings
- [IMPLEMENTATION-CHECKLIST.MD](./IMPLEMENTATION-CHECKLIST.MD) — Full 15-phase roadmap

---

## 🎯 Success Metrics

By end of Phase 4:

✅ **Security:** Users can safely register & login  
✅ **Token Management:** Access & refresh tokens working correctly  
✅ **Authorization:** Role-based access control ready  
✅ **Reliability:** 95%+ test coverage, all edge cases handled  
✅ **Data Integrity:** Transaction safety, no race conditions  
✅ **Code Quality:** Zero TypeScript errors, zero ESLint errors  
✅ **Error Handling:** All error codes match API-ERROR-CODES.MD  
✅ **Documentation:** Swagger specs + inline comments

---

**Phase 4 is the security foundation. Quality here prevents breaches and maintains user trust.**
