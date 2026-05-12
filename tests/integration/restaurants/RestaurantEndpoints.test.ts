/**
 * Restaurant Endpoints Integration Tests
 * Tests API endpoints with real database (in-memory SQLite)
 * References: Phase 5 - Restaurant Management
 */
import request from 'supertest';
import { Sequelize } from 'sequelize';
import express from 'express';
import { createRestaurantRoutes } from '../../../src/modules/restaurants/routes/restaurantRoutes';
import { Role, User, Restaurant, initializeModels } from '../../../src/database/models';
import { setSequelize } from '../../../src/database/sequelize';
import { jwtHelper } from '../../../src/shared/utils/jwt';

describe('Restaurant Endpoints - Integration Tests', () => {
  let app: express.Application;
  let sequelize: Sequelize;
  let restoAdminRole: any;
  let superAdminRole: any;
  let ownerUser: any;
  let adminUser: any;
  let ownerToken: string;
  let adminToken: string;

  beforeAll(async () => {
    // Setup in-memory SQLite database
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });

    // Set the global Sequelize instance
    setSequelize(sequelize);

    // Initialize models
    initializeModels(sequelize);

    // Sync database
    await sequelize.sync({ force: true });

    // Create roles
    restoAdminRole = await Role.create({
      name: 'RESTO_ADMIN',
      description: 'Restaurant Admin role',
    });

    superAdminRole = await Role.create({
      name: 'SUPER_ADMIN',
      description: 'Super Admin role',
    });

    // Create test users
    ownerUser = await User.create({
      roleId: restoAdminRole.id,
      fullName: 'Restaurant Owner',
      email: 'owner@example.com',
      password: 'SecurePass123!',
      phone: '+1234567890',
      isActive: true,
    });

    adminUser = await User.create({
      roleId: superAdminRole.id,
      fullName: 'Super Admin',
      email: 'admin@example.com',
      password: 'AdminPass123!',
      phone: '+9876543210',
      isActive: true,
    });

    // Generate tokens
    ownerToken = jwtHelper.sign({
      id: ownerUser.id,
      email: ownerUser.email,
      role: 'RESTO_ADMIN',
    });

    adminToken = jwtHelper.sign({
      id: adminUser.id,
      email: adminUser.email,
      role: 'SUPER_ADMIN',
    });

    // Create Express app
    app = express();
    app.use(express.json());
    app.use('/restaurants', createRestaurantRoutes());

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

  describe('POST /restaurants', () => {
    const validInput = {
      name: 'Test Restaurant',
      slug: 'test-restaurant',
      phone: '+6281234567890',
      address: '123 Main Street',
      city: 'Jakarta',
      province: 'DKI Jakarta',
    };

    it('should create restaurant with valid data and auth', async () => {
      const response = await request(app)
        .post('/restaurants')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(validInput);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(validInput.name);
      expect(response.body.data.status).toBe('PENDING');
      expect(response.body.data.slug).toBe(validInput.slug);
    });

    it('should reject creation without auth', async () => {
      const response = await request(app).post('/restaurants').send(validInput);

      expect(response.status).toBe(401);
    });

    it('should reject invalid slug format', async () => {
      const invalidInput = { ...validInput, slug: 'Test Restaurant!' };

      const response = await request(app)
        .post('/restaurants')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(invalidInput);

      expect(response.status).toBe(400);
    });

    it('should reject duplicate slug', async () => {
      // Create first restaurant
      await request(app)
        .post('/restaurants')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(validInput);

      // Try to create another with same slug
      const response = await request(app)
        .post('/restaurants')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(validInput);

      expect(response.status).toBe(409);
    });

    it('should reject invalid email format', async () => {
      const invalidInput = { ...validInput, slug: 'another-restaurant', email: 'not-an-email' };

      const response = await request(app)
        .post('/restaurants')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(invalidInput);

      expect(response.status).toBe(400);
    });

    it('should reject missing required fields', async () => {
      const incompleteInput = { slug: 'incomplete', city: 'Jakarta' };

      const response = await request(app)
        .post('/restaurants')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(incompleteInput);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /restaurants', () => {
    it('should list public restaurants (ACTIVE only)', async () => {
      // Create and approve a restaurant
      const restaurant = await Restaurant.create({
        ownerId: ownerUser.id,
        name: 'Public Restaurant',
        slug: 'public-restaurant',
        phone: '+6281234567890',
        address: '123 Main Street',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        status: 'ACTIVE',
      });

      const response = await request(app).get('/restaurants');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.data)).toBe(true);
      expect(response.body.data.pagination).toBeDefined();

      // Verify only ACTIVE restaurants are returned
      const activeRestaurants = response.body.data.data;
      activeRestaurants.forEach((rest: any) => {
        expect(rest.status).toBe('ACTIVE');
      });
    });

    it('should filter restaurants by city', async () => {
      const response = await request(app).get('/restaurants?city=Jakarta');

      expect(response.status).toBe(200);
      const restaurants = response.body.data.data;
      restaurants.forEach((rest: any) => {
        expect(rest.city).toBe('Jakarta');
      });
    });

    it('should support pagination', async () => {
      const response = await request(app).get('/restaurants?page=1&limit=10');

      expect(response.status).toBe(200);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(10);
    });
  });

  describe('GET /restaurants/:id', () => {
    let testRestaurant: any;

    beforeAll(async () => {
      testRestaurant = await Restaurant.create({
        ownerId: ownerUser.id,
        name: 'Detail Test Restaurant',
        slug: 'detail-test-restaurant',
        phone: '+6281234567890',
        address: '123 Main Street',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        status: 'ACTIVE',
      });
    });

    it('should get ACTIVE restaurant details', async () => {
      const response = await request(app).get(`/restaurants/${testRestaurant.id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testRestaurant.id);
      expect(response.body.data.name).toBe('Detail Test Restaurant');
    });

    it('should reject getting non-ACTIVE restaurant', async () => {
      const pendingRestaurant = await Restaurant.create({
        ownerId: ownerUser.id,
        name: 'Pending Restaurant',
        slug: 'pending-restaurant',
        phone: '+6281234567890',
        address: '123 Main Street',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        status: 'PENDING',
      });

      const response = await request(app).get(`/restaurants/${pendingRestaurant.id}`);

      expect(response.status).toBe(404);
    });

    it('should return 404 for non-existent restaurant', async () => {
      const response = await request(app).get('/restaurants/non-existent-id');

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /restaurants/:id', () => {
    let ownerRestaurant: any;

    beforeAll(async () => {
      ownerRestaurant = await Restaurant.create({
        ownerId: ownerUser.id,
        name: 'Update Test Restaurant',
        slug: 'update-test-restaurant',
        phone: '+6281234567890',
        address: '123 Main Street',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        status: 'PENDING',
      });
    });

    it('should update restaurant when owner', async () => {
      const response = await request(app)
        .patch(`/restaurants/${ownerRestaurant.id}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('Updated Name');
    });

    it('should reject update by non-owner', async () => {
      // Create another user
      const otherUser = await User.create({
        roleId: restoAdminRole.id,
        fullName: 'Other Owner',
        email: 'other@example.com',
        password: 'SecurePass123!',
        phone: '+9999999999',
        isActive: true,
      });

      const otherToken = jwtHelper.sign({
        id: otherUser.id,
        email: otherUser.email,
        role: 'RESTO_ADMIN',
      });

      const response = await request(app)
        .patch(`/restaurants/${ownerRestaurant.id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ name: 'Hacked Name' });

      expect(response.status).toBe(403);
    });

    it('should reject update without auth', async () => {
      const response = await request(app)
        .patch(`/restaurants/${ownerRestaurant.id}`)
        .send({ name: 'Unauthorized Name' });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /restaurants/:id', () => {
    let deleteRestaurant: any;

    beforeAll(async () => {
      deleteRestaurant = await Restaurant.create({
        ownerId: ownerUser.id,
        name: 'Delete Test Restaurant',
        slug: 'delete-test-restaurant',
        phone: '+6281234567890',
        address: '123 Main Street',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        status: 'PENDING',
      });
    });

    it('should soft delete restaurant when owner', async () => {
      const response = await request(app)
        .delete(`/restaurants/${deleteRestaurant.id}`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(204);

      // Verify soft delete
      const deleted = await Restaurant.findByPk(deleteRestaurant.id, { paranoid: false });
      expect(deleted?.deletedAt).not.toBeNull();
    });

    it('should reject delete by non-owner', async () => {
      const restaurant = await Restaurant.create({
        ownerId: ownerUser.id,
        name: 'Protected Restaurant',
        slug: 'protected-restaurant',
        phone: '+6281234567890',
        address: '123 Main Street',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        status: 'PENDING',
      });

      const otherUser = await User.create({
        roleId: restoAdminRole.id,
        fullName: 'Other User',
        email: 'other2@example.com',
        password: 'SecurePass123!',
        phone: '+8888888888',
        isActive: true,
      });

      const otherToken = jwtHelper.sign({
        id: otherUser.id,
        email: otherUser.email,
        role: 'RESTO_ADMIN',
      });

      const response = await request(app)
        .delete(`/restaurants/${restaurant.id}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('Status Management (Admin)', () => {
    let pendingRestaurant: any;

    beforeAll(async () => {
      pendingRestaurant = await Restaurant.create({
        ownerId: ownerUser.id,
        name: 'Status Test Restaurant 1',
        slug: 'status-test-1',
        phone: '+6281234567890',
        address: '123 Main Street',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        status: 'PENDING',
      });
    });

    it('should approve PENDING restaurant', async () => {
      const response = await request(app)
        .patch(`/restaurants/${pendingRestaurant.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ action: 'approve' });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('APPROVED');
    });

    it('should reject restaurant with reason', async () => {
      const response = await request(app)
        .patch(`/restaurants/${pendingRestaurant.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          action: 'reject',
          reason: 'Invalid business license',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('REJECTED');
      expect(response.body.data.rejectedReason).toBe('Invalid business license');
    });

    it('should suspend ACTIVE restaurant', async () => {
      // First activate
      await Restaurant.create({
        ownerId: ownerUser.id,
        name: 'Suspend Test',
        slug: 'suspend-test',
        phone: '+6281234567890',
        address: '123 Main Street',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        status: 'ACTIVE',
      });

      const suspendRestaurant = await Restaurant.findOne({ where: { slug: 'suspend-test' } });
      const response = await request(app)
        .patch(`/restaurants/${suspendRestaurant?.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ action: 'suspend' });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('SUSPENDED');
      expect(response.body.data.isOpen).toBe(false);
    });

    it('should reactivate SUSPENDED restaurant', async () => {
      const suspended = await Restaurant.create({
        ownerId: ownerUser.id,
        name: 'Reactivate Test',
        slug: 'reactivate-test',
        phone: '+6281234567890',
        address: '123 Main Street',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        status: 'SUSPENDED',
      });

      const response = await request(app)
        .patch(`/restaurants/${suspended.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ action: 'reactivate' });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('ACTIVE');
    });

    it('should reject non-admin status updates', async () => {
      const response = await request(app)
        .patch(`/restaurants/${pendingRestaurant.id}/status`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ action: 'approve' });

      expect(response.status).toBe(403);
    });

    it('should reject invalid action', async () => {
      const response = await request(app)
        .patch(`/restaurants/${pendingRestaurant.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ action: 'invalid-action' });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /restaurants/admin/pending', () => {
    it('should list pending restaurants for admin', async () => {
      const response = await request(app)
        .get('/restaurants/admin/pending')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.data)).toBe(true);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should reject non-admin access', async () => {
      const response = await request(app)
        .get('/restaurants/admin/pending')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /restaurants/owner/my-restaurants', () => {
    it('should get owned restaurants', async () => {
      const response = await request(app)
        .get('/restaurants/owner/my-restaurants')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.data)).toBe(true);
    });

    it('should reject without auth', async () => {
      const response = await request(app).get('/restaurants/owner/my-restaurants');

      expect(response.status).toBe(401);
    });
  });
});
