/**
 * Restaurant Service
 * Business logic for restaurant management
 * References: Phase 5 - Restaurant Management, Section 5.3
 */
import { Transaction } from 'sequelize';
import { RestaurantRepository } from '../repositories/RestaurantRepository';
import { Restaurant } from '@db/models';
import { ConflictError, NotFoundError, ValidationError, ForbiddenError } from '@shared/errors';
import logger from '@shared/utils/logger';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface CreateRestaurantInput {
  name: string;
  slug: string;
  description?: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  province: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  openTime?: string;
  closeTime?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface UpdateRestaurantInput {
  name?: string;
  slug?: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  isOpen?: boolean;
  openTime?: string;
  closeTime?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface SearchFilters {
  city?: string;
  limit: number;
  offset: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export class RestaurantService {
  constructor(private restaurantRepository: RestaurantRepository) {}

  /**
   * Create new restaurant (owner operation)
   * Restaurant starts in PENDING status, requires admin approval
   * Error codes: INVALID_RESTAURANT_DATA, SLUG_ALREADY_EXISTS
   */
  async createRestaurant(
    ownerId: string,
    input: CreateRestaurantInput,
    transaction?: Transaction
  ): Promise<Restaurant> {
    // Validate required fields
    this.validateRestaurantInput(input);

    // Validate slug format (alphanumeric, hyphens, underscores only)
    if (!this.isValidSlug(input.slug)) {
      throw new ValidationError(
        'Slug must contain only alphanumeric characters, hyphens, and underscores',
        'slug'
      );
    }

    // Check if slug already exists
    const existingSlug = await this.restaurantRepository.findBySlug(input.slug, true);
    if (existingSlug) {
      throw new ConflictError('SLUG_ALREADY_EXISTS', 'Restaurant slug already in use', 'slug');
    }

    const restaurantData = {
      ownerId,
      name: input.name,
      slug: input.slug,
      description: input.description,
      phone: input.phone,
      email: input.email,
      address: input.address,
      city: input.city,
      province: input.province,
      postalCode: input.postalCode,
      latitude: input.latitude,
      longitude: input.longitude,
      openTime: input.openTime,
      closeTime: input.closeTime,
      status: 'PENDING',
      isOpen: false,
    };

    try {
      const restaurant = await this.restaurantRepository.create(restaurantData, transaction);
      logger.info(`[RestaurantService] Restaurant created: ${restaurant.id} by owner ${ownerId}`);
      return restaurant;
    } catch (error) {
      logger.error(`[RestaurantService] Error creating restaurant: ${error}`);
      throw error;
    }
  }

  /**
   * Update restaurant (owner operation)
   * Only owner can update their restaurant
   * Error codes: RESTAURANT_NOT_FOUND, OWNER_ONLY, SLUG_ALREADY_EXISTS
   */
  async updateRestaurant(
    restaurantId: string,
    ownerId: string,
    input: UpdateRestaurantInput,
    transaction?: Transaction
  ): Promise<Restaurant> {
    // Get restaurant
    const restaurant = await this.restaurantRepository.findById(restaurantId);
    if (!restaurant) {
      throw new NotFoundError('restaurant');
    }

    // Check ownership
    if (restaurant.ownerId !== ownerId) {
      throw new ForbiddenError('Only restaurant owner can perform this action', 'OWNER_ONLY');
    }

    // Validate input if provided
    if (input.slug && input.slug !== restaurant.slug) {
      if (!this.isValidSlug(input.slug)) {
        throw new ValidationError(
          'Slug must contain only alphanumeric characters, hyphens, and underscores',
          'slug'
        );
      }

      // Check if new slug already exists
      const existingSlug = await this.restaurantRepository.findBySlug(input.slug);
      if (existingSlug && existingSlug.id !== restaurantId) {
        throw new ConflictError('SLUG_ALREADY_EXISTS', 'Restaurant slug already in use', 'slug');
      }
    }

    // Validate email if provided
    if (input.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input.email)) {
        throw new ValidationError('Invalid email format', 'email');
      }
    }

    // Validate phone if provided
    if (input.phone) {
      if (!this.isValidPhone(input.phone)) {
        throw new ValidationError('Invalid phone format', 'phone');
      }
    }

    try {
      const updatedRestaurant = await this.restaurantRepository.update(
        restaurantId,
        input,
        transaction
      );
      logger.info(`[RestaurantService] Restaurant updated: ${restaurantId} by owner ${ownerId}`);
      return updatedRestaurant!;
    } catch (error) {
      logger.error(`[RestaurantService] Error updating restaurant: ${error}`);
      throw error;
    }
  }

  /**
   * Delete restaurant (soft delete, owner operation)
   * Error codes: RESTAURANT_NOT_FOUND, OWNER_ONLY
   */
  async deleteRestaurant(
    restaurantId: string,
    ownerId: string,
    transaction?: Transaction
  ): Promise<void> {
    const restaurant = await this.restaurantRepository.findById(restaurantId);
    if (!restaurant) {
      throw new NotFoundError('restaurant');
    }

    if (restaurant.ownerId !== ownerId) {
      throw new ForbiddenError('Only restaurant owner can delete restaurant', 'OWNER_ONLY');
    }

    await this.restaurantRepository.delete(restaurantId, transaction);
    logger.info(`[RestaurantService] Restaurant soft deleted: ${restaurantId}`);
  }

  /**
   * Get restaurant by ID (public operation, returns only if ACTIVE)
   * Error codes: RESTAURANT_NOT_FOUND
   */
  async getRestaurantById(restaurantId: string, includeInactive = false): Promise<Restaurant> {
    const restaurant = await this.restaurantRepository.findByIdWithDetails(restaurantId);
    if (!restaurant) {
      throw new NotFoundError('restaurant');
    }

    if (!includeInactive && restaurant.status !== 'ACTIVE') {
      throw new NotFoundError('restaurant');
    }

    return restaurant;
  }

  /**
   * Search public restaurants (only ACTIVE status)
   */
  async searchPublicRestaurants(filters: SearchFilters): Promise<{
    data: Restaurant[];
    pagination: PaginationMeta;
  }> {
    const { restaurants, total } = await this.restaurantRepository.findPublic(
      { city: filters.city },
      filters.limit,
      filters.offset
    );

    const page = Math.floor(filters.offset / filters.limit) + 1;
    return {
      data: restaurants,
      pagination: {
        page,
        limit: filters.limit,
        total,
        hasMore: filters.offset + filters.limit < total,
      },
    };
  }

  /**
   * Get restaurants owned by user
   */
  async getOwnerRestaurants(ownerId: string): Promise<Restaurant[]> {
    return this.restaurantRepository.findByOwner(ownerId);
  }

  /**
   * Admin: Get pending restaurants for approval
   */
  async getPendingRestaurants(
    limit: number,
    offset: number
  ): Promise<{
    data: Restaurant[];
    pagination: PaginationMeta;
  }> {
    const { restaurants, total } = await this.restaurantRepository.findPending(limit, offset);
    const page = Math.floor(offset / limit) + 1;

    return {
      data: restaurants,
      pagination: {
        page,
        limit,
        total,
        hasMore: offset + limit < total,
      },
    };
  }

  /**
   * Admin: Approve restaurant (PENDING → APPROVED)
   * Error codes: RESTAURANT_NOT_FOUND, INVALID_RESTAURANT_STATUS
   */
  async approveRestaurant(restaurantId: string, transaction?: Transaction): Promise<Restaurant> {
    const restaurant = await this.restaurantRepository.findById(restaurantId);
    if (!restaurant) {
      throw new NotFoundError('restaurant');
    }

    if (restaurant.status !== 'PENDING') {
      throw new ValidationError(
        `Cannot approve restaurant in ${restaurant.status} status. Only PENDING restaurants can be approved.`,
        'status'
      );
    }

    const updated = await this.restaurantRepository.update(
      restaurantId,
      { status: 'APPROVED' },
      transaction
    );
    logger.info(`[RestaurantService] Restaurant approved: ${restaurantId}`);
    return updated!;
  }

  /**
   * Admin: Reject restaurant (PENDING → REJECTED)
   * Error codes: RESTAURANT_NOT_FOUND, INVALID_RESTAURANT_STATUS
   */
  async rejectRestaurant(
    restaurantId: string,
    reason: string,
    transaction?: Transaction
  ): Promise<Restaurant> {
    const restaurant = await this.restaurantRepository.findById(restaurantId);
    if (!restaurant) {
      throw new NotFoundError('restaurant');
    }

    if (restaurant.status !== 'PENDING') {
      throw new ValidationError(
        `Cannot reject restaurant in ${restaurant.status} status. Only PENDING restaurants can be rejected.`,
        'status'
      );
    }

    if (!reason || reason.trim().length === 0) {
      throw new ValidationError('Rejection reason is required', 'reason');
    }

    const updated = await this.restaurantRepository.update(
      restaurantId,
      { status: 'REJECTED', rejectedReason: reason },
      transaction
    );
    logger.info(`[RestaurantService] Restaurant rejected: ${restaurantId}`);
    return updated!;
  }

  /**
   * Admin: Suspend restaurant (ACTIVE → SUSPENDED)
   * Error codes: RESTAURANT_NOT_FOUND, INVALID_RESTAURANT_STATUS
   */
  async suspendRestaurant(restaurantId: string, transaction?: Transaction): Promise<Restaurant> {
    const restaurant = await this.restaurantRepository.findById(restaurantId);
    if (!restaurant) {
      throw new NotFoundError('restaurant');
    }

    if (restaurant.status !== 'ACTIVE') {
      throw new ValidationError(
        `Cannot suspend restaurant in ${restaurant.status} status. Only ACTIVE restaurants can be suspended.`,
        'status'
      );
    }

    const updated = await this.restaurantRepository.update(
      restaurantId,
      { status: 'SUSPENDED', isOpen: false },
      transaction
    );
    logger.info(`[RestaurantService] Restaurant suspended: ${restaurantId}`);
    return updated!;
  }

  /**
   * Admin/Owner: Reactivate restaurant (SUSPENDED → ACTIVE or APPROVED → ACTIVE)
   * Error codes: RESTAURANT_NOT_FOUND, INVALID_RESTAURANT_STATUS
   */
  async reactivateRestaurant(restaurantId: string, transaction?: Transaction): Promise<Restaurant> {
    const restaurant = await this.restaurantRepository.findById(restaurantId);
    if (!restaurant) {
      throw new NotFoundError('restaurant');
    }

    if (!['SUSPENDED', 'APPROVED'].includes(restaurant.status)) {
      throw new ValidationError(
        `Cannot reactivate restaurant in ${restaurant.status} status. Only SUSPENDED or APPROVED restaurants can be reactivated.`,
        'status'
      );
    }

    const updated = await this.restaurantRepository.update(
      restaurantId,
      { status: 'ACTIVE' },
      transaction
    );
    logger.info(`[RestaurantService] Restaurant reactivated: ${restaurantId}`);
    return updated!;
  }

  /**
   * Add gallery image to restaurant
   * Error codes: RESTAURANT_NOT_FOUND, OWNER_ONLY
   */
  async addGalleryImage(
    restaurantId: string,
    uploadId: string,
    ownerId: string,
    transaction?: Transaction
  ): Promise<any> {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const restaurant = await this.restaurantRepository.findById(restaurantId);
    if (!restaurant) {
      throw new NotFoundError('restaurant');
    }

    if (restaurant.ownerId !== ownerId) {
      throw new ForbiddenError('Only restaurant owner can upload images', 'OWNER_ONLY');
    }

    try {
      const image = await this.restaurantRepository.addGalleryImage(
        restaurantId,
        uploadId,
        transaction
      );
      logger.info(
        `[RestaurantService] Gallery image added: ${image.id} to restaurant ${restaurantId}`
      );
      return image;
    } catch (error) {
      logger.error(`[RestaurantService] Error adding gallery image: ${error}`);
      throw error;
    }
  }

  /**
   * Remove gallery image from restaurant
   * Error codes: RESTAURANT_NOT_FOUND, OWNER_ONLY
   */
  async removeGalleryImage(
    imageId: string,
    restaurantId: string,
    ownerId: string,
    transaction?: Transaction
  ): Promise<void> {
    const image = await this.restaurantRepository.findGalleryImageById(imageId);
    if (!image) {
      throw new NotFoundError('image');
    }

    if (image.restaurantId !== restaurantId) {
      throw new ValidationError('Image does not belong to this restaurant');
    }

    const restaurant = await this.restaurantRepository.findById(restaurantId);
    if (restaurant && restaurant.ownerId !== ownerId) {
      throw new ForbiddenError('Only restaurant owner can delete images', 'OWNER_ONLY');
    }

    await this.restaurantRepository.removeGalleryImage(imageId, transaction);
    logger.info(`[RestaurantService] Gallery image removed: ${imageId}`);
  }

  /**
   * Validate restaurant input data
   */
  private validateRestaurantInput(input: CreateRestaurantInput): void {
    if (!input.name || input.name.trim().length === 0) {
      throw new ValidationError('Restaurant name is required', 'name');
    }

    if (input.name.length > 150) {
      throw new ValidationError('Restaurant name must be 150 characters or less', 'name');
    }

    if (!input.phone || !this.isValidPhone(input.phone)) {
      throw new ValidationError('Valid phone number is required', 'phone');
    }

    if (!input.address || input.address.trim().length === 0) {
      throw new ValidationError('Restaurant address is required', 'address');
    }

    if (!input.city || input.city.trim().length === 0) {
      throw new ValidationError('City is required', 'city');
    }

    if (!input.province || input.province.trim().length === 0) {
      throw new ValidationError('Province is required', 'province');
    }

    if (input.email && !this.isValidEmail(input.email)) {
      throw new ValidationError('Invalid email format', 'email');
    }

    if (input.latitude !== undefined && (input.latitude < -90 || input.latitude > 90)) {
      throw new ValidationError('Latitude must be between -90 and 90', 'latitude');
    }

    if (input.longitude !== undefined && (input.longitude < -180 || input.longitude > 180)) {
      throw new ValidationError('Longitude must be between -180 and 180', 'longitude');
    }
  }

  /**
   * Validate slug format
   */
  private isValidSlug(slug: string): boolean {
    return /^[a-z0-9-_]+$/.test(slug);
  }

  /**
   * Validate phone number format
   */
  private isValidPhone(phone: string): boolean {
    return /^\+?[1-9]\d{1,14}$/.test(phone.replace(/\s+/g, ''));
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
