/**
 * Auth Endpoints Integration Tests
 * Tests API endpoints with real database (in-memory SQLite)
 * References: Phase 4 - Authentication & Authorization
 */
import request from 'supertest';
import { Sequelize } from 'sequelize';
import express from 'express';
import { createAuthRoutes } from '../../../src/modules/auth/routes/authRoutes';
import { Role, User, RefreshToken, initializeModels } from '../../../src/database/models';
import { setSequelize } from '../../../src/database/sequelize';
import { bcryptHelper } from '../../../src/shared/utils/bcrypt';

describe('Auth Endpoints - Integration Tests', () => {
  let app: express.Application;
  let sequelize: Sequelize;
  // @ts-ignore - declared but not directly used in tests
  let customerRoleId: string;
  // @ts-ignore - declared but not directly used in tests
  let testUser: any;

  beforeAll(async () => {
    // Setup in-memory SQLite database
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });

    // Set the global Sequelize instance for the app to use
    setSequelize(sequelize);

    // Initialize models
    initializeModels(sequelize);

    // Sync database
    await sequelize.sync({ force: true });

    // Create test role
    const customerRole = await Role.create({
      name: 'CUSTOMER',
      description: 'Customer role',
    });
    customerRoleId = customerRole.id;

    // Create Express app with auth routes
    app = express();
    app.use(express.json());
    app.use('/auth', createAuthRoutes());

    // Error handler middleware
    app.use(
      (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
        res.status(err.statusCode || 500).json({
          success: false,
          message: err.message,
          code: err.code,
        });
      }
    );
  });

  afterAll(async () => {
    await sequelize.close();
    setSequelize(null);
  });

  describe('POST /auth/register', () => {
    it('should register new user with valid credentials', async () => {
      const response = await request(app).post('/auth/register').send({
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123!',
        phone: '+1234567890',
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('john@example.com');
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
      expect(response.body.data.user).not.toHaveProperty('password');

      // Store for later tests
      testUser = response.body.data.user;
    });

    it('should reject invalid email format', async () => {
      const response = await request(app).post('/auth/register').send({
        fullName: 'Jane Doe',
        email: 'invalid-email',
        password: 'SecurePass123!',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject weak password', async () => {
      const response = await request(app).post('/auth/register').send({
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        password: 'weak',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject missing full name', async () => {
      const response = await request(app).post('/auth/register').send({
        email: 'test@example.com',
        password: 'SecurePass123!',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject duplicate email', async () => {
      const response = await request(app).post('/auth/register').send({
        fullName: 'Another John',
        email: 'john@example.com',
        password: 'SecurePass123!',
      });

      expect(response.status).toBe(409);
      expect(response.body.code).toBe('DUPLICATE_EMAIL');
    });

    it('should reject password without uppercase', async () => {
      const response = await request(app).post('/auth/register').send({
        fullName: 'Test User',
        email: 'test2@example.com',
        password: 'securepass123!',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject password without number', async () => {
      const response = await request(app).post('/auth/register').send({
        fullName: 'Test User',
        email: 'test3@example.com',
        password: 'SecurePass!',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject password without special character', async () => {
      const response = await request(app).post('/auth/register').send({
        fullName: 'Test User',
        email: 'test4@example.com',
        password: 'SecurePass123',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /auth/login', () => {
    it('should login user with valid credentials', async () => {
      const response = await request(app).post('/auth/login').send({
        email: 'john@example.com',
        password: 'SecurePass123!',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('john@example.com');
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should reject invalid email', async () => {
      const response = await request(app).post('/auth/login').send({
        email: 'nonexistent@example.com',
        password: 'SecurePass123!',
      });

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('INVALID_CREDENTIALS');
    });

    it('should reject invalid password', async () => {
      const response = await request(app).post('/auth/login').send({
        email: 'john@example.com',
        password: 'WrongPassword123!',
      });

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('INVALID_CREDENTIALS');
    });

    it('should reject missing email', async () => {
      const response = await request(app).post('/auth/login').send({
        password: 'SecurePass123!',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject missing password', async () => {
      const response = await request(app).post('/auth/login').send({
        email: 'john@example.com',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should update last login timestamp', async () => {
      const user = await User.findOne({ where: { email: 'john@example.com' } });
      const originalLastLogin = user?.lastLoginAt;

      await new Promise((resolve) => setTimeout(resolve, 100));

      await request(app).post('/auth/login').send({
        email: 'john@example.com',
        password: 'SecurePass123!',
      });

      const updatedUser = await User.findOne({ where: { email: 'john@example.com' } });
      expect(updatedUser?.lastLoginAt).not.toEqual(originalLastLogin);
    });
  });

  describe('POST /auth/refresh', () => {
    let validRefreshToken: string;

    beforeAll(async () => {
      // Get valid refresh token
      const loginResponse = await request(app).post('/auth/login').send({
        email: 'john@example.com',
        password: 'SecurePass123!',
      });
      validRefreshToken = loginResponse.body.data.refreshToken;
    });

    it('should refresh access token with valid refresh token', async () => {
      const response = await request(app).post('/auth/refresh').send({
        refreshToken: validRefreshToken,
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app).post('/auth/refresh').send({
        refreshToken: 'invalid-refresh-token',
      });

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('TOKEN_INVALID');
    });

    it('should reject missing refresh token', async () => {
      const response = await request(app).post('/auth/refresh').send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /auth/logout', () => {
    let accessToken: string;

    beforeAll(async () => {
      const loginResponse = await request(app).post('/auth/login').send({
        email: 'john@example.com',
        password: 'SecurePass123!',
      });
      accessToken = loginResponse.body.data.accessToken;
    });

    it('should logout user and revoke tokens', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject logout without auth token', async () => {
      const response = await request(app).post('/auth/logout');

      expect(response.status).toBe(401);
    });

    it('should not allow refresh after logout', async () => {
      // Login again to get tokens
      const loginResponse = await request(app).post('/auth/login').send({
        email: 'john@example.com',
        password: 'SecurePass123!',
      });
      const refreshToken = loginResponse.body.data.refreshToken;
      const newAccessToken = loginResponse.body.data.accessToken;

      // Logout
      await request(app).post('/auth/logout').set('Authorization', `Bearer ${newAccessToken}`);

      // Try to refresh
      const refreshResponse = await request(app).post('/auth/refresh').send({
        refreshToken,
      });

      expect(refreshResponse.status).toBe(401);
    });
  });

  describe('GET /auth/me', () => {
    let accessToken: string;

    beforeAll(async () => {
      const loginResponse = await request(app).post('/auth/login').send({
        email: 'john@example.com',
        password: 'SecurePass123!',
      });
      accessToken = loginResponse.body.data.accessToken;
    });

    it('should return current user', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('john@example.com');
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('should reject request without auth token', async () => {
      const response = await request(app).get('/auth/me');

      expect(response.status).toBe(401);
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });

  describe('Concurrent Login Handling', () => {
    it('should handle concurrent logins safely', async () => {
      const loginPromises = Array(3)
        .fill(null)
        .map(() =>
          request(app).post('/auth/login').send({
            email: 'john@example.com',
            password: 'SecurePass123!',
          })
        );

      const results = await Promise.all(loginPromises);

      // All logins should succeed
      results.forEach((result) => {
        expect(result.status).toBe(200);
        expect(result.body.success).toBe(true);
      });

      // Each login should have different refresh tokens
      const refreshTokens = results.map((r) => r.body.data.refreshToken);
      const uniqueTokens = new Set(refreshTokens);
      expect(uniqueTokens.size).toBe(refreshTokens.length);
    });
  });

  describe('Concurrent Registration Handling', () => {
    it('should handle concurrent registrations safely', async () => {
      const registrationPromises = Array(3)
        .fill(null)
        .map((_, index) =>
          request(app)
            .post('/auth/register')
            .send({
              fullName: `User ${index}`,
              email: `concurrent${index}@example.com`,
              password: 'SecurePass123!',
            })
        );

      const results = await Promise.allSettled(registrationPromises);

      // All registrations should succeed
      const successResults = results.filter((r) => r.status === 'fulfilled');
      expect(successResults).toHaveLength(3);

      successResults.forEach((result: any) => {
        expect(result.value.status).toBe(201);
        expect(result.value.body.success).toBe(true);
      });
    });

    it('should prevent concurrent duplicate email registrations', async () => {
      const email = 'uniqueemail@example.com';

      const registrationPromises = Array(3)
        .fill(null)
        .map((_, index) =>
          request(app)
            .post('/auth/register')
            .send({
              fullName: `User ${index}`,
              email,
              password: 'SecurePass123!',
            })
        );

      const results = await Promise.allSettled(registrationPromises);

      // Only one should succeed, others should fail
      const successResults = results.filter((r) => r.status === 'fulfilled');
      const successfulRegistrations = successResults.filter((r: any) => r.value.status === 201);

      expect(successfulRegistrations).toHaveLength(1);
    });
  });

  describe('Password Hashing', () => {
    it('should hash password before storing', async () => {
      const plainPassword = 'TestPass123!';

      await request(app).post('/auth/register').send({
        fullName: 'Password Test User',
        email: 'passwordtest@example.com',
        password: plainPassword,
      });

      const user = await User.findOne({ where: { email: 'passwordtest@example.com' } });

      // Password should not be stored in plain text
      expect(user?.password).not.toBe(plainPassword);

      // But should be verifiable
      const isMatch = await bcryptHelper.compare(plainPassword, user!.password);
      expect(isMatch).toBe(true);
    });
  });

  describe('Token Format Validation', () => {
    let accessToken: string;

    beforeAll(async () => {
      const loginResponse = await request(app).post('/auth/login').send({
        email: 'john@example.com',
        password: 'SecurePass123!',
      });
      accessToken = loginResponse.body.data.accessToken;
    });

    it('should use JWT access token format', async () => {
      // JWT has format: header.payload.signature
      const parts = accessToken.split('.');
      expect(parts).toHaveLength(3);
      expect(parts[0]).toBeTruthy();
      expect(parts[1]).toBeTruthy();
      expect(parts[2]).toBeTruthy();
    });

    it('should store refresh token in database', async () => {
      const loginResponse = await request(app).post('/auth/login').send({
        email: 'john@example.com',
        password: 'SecurePass123!',
      });
      const refreshToken = loginResponse.body.data.refreshToken;

      const storedToken = await RefreshToken.findOne({ where: { token: refreshToken } });

      expect(storedToken).toBeDefined();
      expect(storedToken?.userId).toBeTruthy();
      expect(storedToken?.expiresAt).toBeTruthy();
      expect(storedToken?.revokedAt).toBeNull();
    });
  });
});
