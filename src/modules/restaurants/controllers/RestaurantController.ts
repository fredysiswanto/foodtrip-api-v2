/**
 * Restaurant Controller
 * HTTP request handlers for restaurant endpoints
 * References: Phase 5 - Restaurant Management, Section 5.5
 */
import { Request, Response, NextFunction } from 'express';
import { RestaurantService } from '../services/RestaurantService';
import { responseFormatter } from '@shared/utils/responseFormatter';
import { JWTPayload } from '@shared/utils/jwt';

export class RestaurantController {
  constructor(private restaurantService: RestaurantService) {}

  /**
   * GET /api/v1/restaurants
   * List public restaurants (only ACTIVE status)
   * Query params: city (optional), page, limit
   */
  async listPublicRestaurants(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { city } = req.query;
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
      const offset = (page - 1) * limit;

      const result = await this.restaurantService.searchPublicRestaurants({
        city: city as string,
        limit,
        offset,
      });

      res.json(
        responseFormatter.success(
          {
            data: result.data,
            pagination: result.pagination,
          },
          'Restaurants retrieved successfully'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/restaurants/:id
   * Get restaurant details (public, returns only if ACTIVE)
   */
  async getRestaurant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const restaurant = await this.restaurantService.getRestaurantById(req.params.id);
      res.json(responseFormatter.success(restaurant, 'Restaurant retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/restaurants
   * Create restaurant (owner operation, requires RESTO_ADMIN role)
   */
  async createRestaurant(
    req: Request & { user?: JWTPayload },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const restaurant = await this.restaurantService.createRestaurant(req.user.id, req.body);
      res
        .status(201)
        .json(responseFormatter.created(restaurant, 'Restaurant created successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/restaurants/:id
   * Update restaurant (owner operation, requires ownership)
   */
  async updateRestaurant(
    req: Request & { user?: JWTPayload },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const restaurant = await this.restaurantService.updateRestaurant(
        req.params.id,
        req.user.id,
        req.body
      );
      res.json(responseFormatter.success(restaurant, 'Restaurant updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/restaurants/:id
   * Soft delete restaurant (owner operation, requires ownership)
   */
  async deleteRestaurant(
    req: Request & { user?: JWTPayload },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      await this.restaurantService.deleteRestaurant(req.params.id, req.user.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/restaurants/admin/pending
   * List pending restaurants for admin approval (admin only)
   */
  async listPendingRestaurants(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
      const offset = (page - 1) * limit;

      const result = await this.restaurantService.getPendingRestaurants(limit, offset);
      res.json(
        responseFormatter.success(
          {
            data: result.data,
            pagination: result.pagination,
          },
          'Pending restaurants retrieved successfully'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/restaurants/:id/status
   * Manage restaurant status (admin only)
   * Body: { action: 'approve' | 'reject' | 'suspend' | 'reactivate', reason?: string }
   */
  async updateRestaurantStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const restaurantId = req.params.id;
      const { action, reason } = req.body;

      let restaurant;

      switch (action) {
        case 'approve':
          restaurant = await this.restaurantService.approveRestaurant(restaurantId);
          break;
        case 'reject':
          restaurant = await this.restaurantService.rejectRestaurant(restaurantId, reason);
          break;
        case 'suspend':
          restaurant = await this.restaurantService.suspendRestaurant(restaurantId);
          break;
        case 'reactivate':
          restaurant = await this.restaurantService.reactivateRestaurant(restaurantId);
          break;
        default:
          throw new Error('Invalid status action');
      }

      res.json(responseFormatter.success(restaurant, `Restaurant ${action}d successfully`));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/restaurants/owner/my-restaurants
   * Get restaurants owned by authenticated user
   */
  async getMyRestaurants(
    req: Request & { user?: JWTPayload },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const restaurants = await this.restaurantService.getOwnerRestaurants(req.user.id);
      res.json(
        responseFormatter.success(
          {
            data: restaurants,
          },
          'Your restaurants retrieved successfully'
        )
      );
    } catch (error) {
      next(error);
    }
  }
}
