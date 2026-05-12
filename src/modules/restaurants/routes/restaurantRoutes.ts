/**
 * Restaurant Routes
 * HTTP routes for restaurant endpoints
 * References: Phase 5 - Restaurant Management, Section 5.5
 */
import { Router } from 'express';
import { z } from 'zod';
import { RestaurantController } from '../controllers/RestaurantController';
import { RestaurantService } from '../services/RestaurantService';
import { RestaurantRepository } from '../repositories/RestaurantRepository';
import { validate, authenticateJWT, requireRole } from '@shared/middleware';

/**
 * Validation schemas using Zod
 */
const createRestaurantSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(150, 'Name must be at most 150 characters'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(150, 'Slug must be at most 150 characters')
    .regex(
      /^[a-z0-9-_]+$/,
      'Slug must contain only lowercase letters, numbers, hyphens, and underscores'
    ),
  description: z.string().optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
  email: z.string().email('Invalid email format').optional(),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  province: z.string().min(2, 'Province must be at least 2 characters'),
  postalCode: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
});

const updateRestaurantSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  slug: z
    .string()
    .regex(
      /^[a-z0-9-_]+$/,
      'Slug must contain only lowercase letters, numbers, hyphens, and underscores'
    )
    .optional(),
  description: z.string().optional(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional(),
  email: z.string().email('Invalid email format').optional(),
  address: z.string().min(5).optional(),
  city: z.string().min(2).optional(),
  province: z.string().min(2).optional(),
  postalCode: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  isOpen: z.boolean().optional(),
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
});

const updateStatusSchema = z.object({
  action: z.enum(['approve', 'reject', 'suspend', 'reactivate'], {
    errorMap: () => ({ message: "Action must be 'approve', 'reject', 'suspend', or 'reactivate'" }),
  }),
  reason: z.string().min(5, 'Reason must be at least 5 characters').optional(),
});

/**
 * Create and configure restaurant routes
 */
export function createRestaurantRoutes(): Router {
  const router = Router();

  // Initialize dependencies
  const restaurantRepository = new RestaurantRepository();
  const restaurantService = new RestaurantService(restaurantRepository);
  const restaurantController = new RestaurantController(restaurantService);

  /**
   * GET /api/v1/restaurants
   * Public endpoint: List approved restaurants with pagination and city filter
   */
  router.get('/', (req, res, next) => restaurantController.listPublicRestaurants(req, res, next));

  /**
   * POST /api/v1/restaurants
   * Owner endpoint: Create new restaurant
   * Requires: Authentication + RESTO_ADMIN role
   */
  router.post(
    '/',
    authenticateJWT,
    requireRole(['RESTO_ADMIN']),
    validate(createRestaurantSchema),
    (req, res, next) => restaurantController.createRestaurant(req, res, next)
  );

  /**
   * GET /api/v1/restaurants/owner/my-restaurants
   * Owner endpoint: Get restaurants owned by authenticated user
   * Requires: Authentication
   * Note: Must come before /:id route to avoid route collision
   */
  router.get('/owner/my-restaurants', authenticateJWT, (req, res, next) =>
    restaurantController.getMyRestaurants(req, res, next)
  );

  /**
   * GET /api/v1/restaurants/admin/pending
   * Admin endpoint: List pending restaurants for approval
   * Requires: Authentication + SUPER_ADMIN role
   * Note: Must come before /:id route to avoid route collision
   */
  router.get('/admin/pending', authenticateJWT, requireRole(['SUPER_ADMIN']), (req, res, next) =>
    restaurantController.listPendingRestaurants(req, res, next)
  );

  /**
   * GET /api/v1/restaurants/:id
   * Public endpoint: Get restaurant details (only ACTIVE restaurants)
   */
  router.get('/:id', (req, res, next) => restaurantController.getRestaurant(req, res, next));

  /**
   * PATCH /api/v1/restaurants/:id
   * Owner endpoint: Update restaurant
   * Requires: Authentication + ownership
   */
  router.patch('/:id', authenticateJWT, validate(updateRestaurantSchema), (req, res, next) =>
    restaurantController.updateRestaurant(req, res, next)
  );

  /**
   * DELETE /api/v1/restaurants/:id
   * Owner endpoint: Soft delete restaurant
   * Requires: Authentication + ownership
   */
  router.delete('/:id', authenticateJWT, (req, res, next) =>
    restaurantController.deleteRestaurant(req, res, next)
  );

  /**
   * PATCH /api/v1/restaurants/:id/status
   * Admin endpoint: Manage restaurant status (approve, reject, suspend, reactivate)
   * Requires: Authentication + SUPER_ADMIN role
   */
  router.patch(
    '/:id/status',
    authenticateJWT,
    requireRole(['SUPER_ADMIN']),
    validate(updateStatusSchema),
    (req, res, next) => restaurantController.updateRestaurantStatus(req, res, next)
  );

  return router;
}
