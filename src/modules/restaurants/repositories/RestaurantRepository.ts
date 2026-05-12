/**
 * Restaurant Repository
 * Data access layer for restaurant operations
 * References: Phase 5 - Restaurant Management, Section 5.2
 */
import { Restaurant, RestaurantImage } from '@db/models';
import { Transaction } from 'sequelize';

export class RestaurantRepository {
  /**
   * Create new restaurant
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async create(data: any, transaction?: Transaction): Promise<Restaurant> {
    return Restaurant.create(data, { transaction });
  }

  /**
   * Find restaurant by ID with owner and image associations
   */
  async findById(id: string, includeDeleted = false): Promise<Restaurant | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {
      where: { id },
      include: [
        { association: 'owner' },
        { association: 'logo' },
        { association: 'banner' },
        { association: 'images' },
      ],
    };
    if (includeDeleted) {
      query.paranoid = false;
    }
    return Restaurant.findOne(query);
  }

  /**
   * Find restaurant by slug
   */
  async findBySlug(slug: string, includeDeleted = false): Promise<Restaurant | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { where: { slug } };
    if (includeDeleted) {
      query.paranoid = false;
    }
    return Restaurant.findOne(query);
  }

  /**
   * Find restaurants by owner ID
   */
  async findByOwner(ownerId: string): Promise<Restaurant[]> {
    return Restaurant.findAll({
      where: { ownerId },
      include: [{ association: 'owner' }, { association: 'logo' }, { association: 'banner' }],
    });
  }

  /**
   * Find restaurants by status with pagination
   */
  async findByStatus(
    status: string,
    limit: number,
    offset: number,
    includeDeleted = false
  ): Promise<{ restaurants: Restaurant[]; total: number }> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { where: { status } };
    if (includeDeleted) {
      query.paranoid = false;
    }

    const { rows, count } = await Restaurant.findAndCountAll({
      ...query,
      limit,
      offset,
      include: [{ association: 'owner' }, { association: 'logo' }, { association: 'banner' }],
    });

    return { restaurants: rows, total: count };
  }

  /**
   * Find pending restaurants (admin approval list)
   */
  async findPending(
    limit: number,
    offset: number
  ): Promise<{ restaurants: Restaurant[]; total: number }> {
    const { rows, count } = await Restaurant.findAndCountAll({
      where: { status: 'PENDING' },
      limit,
      offset,
      include: [{ association: 'owner' }],
      order: [['createdAt', 'ASC']],
    });

    return { restaurants: rows, total: count };
  }

  /**
   * Find public restaurants (active only) with optional city filter
   */
  async findPublic(
    filters: { city?: string },
    limit: number,
    offset: number
  ): Promise<{ restaurants: Restaurant[]; total: number }> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      status: 'ACTIVE',
    };

    if (filters.city) {
      where.city = filters.city;
    }

    const { rows, count } = await Restaurant.findAndCountAll({
      where,
      limit,
      offset,
      include: [{ association: 'logo' }, { association: 'banner' }],
      order: [['name', 'ASC']],
    });

    return { restaurants: rows, total: count };
  }

  /**
   * Update restaurant
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async update(id: string, data: any, transaction?: Transaction): Promise<Restaurant | null> {
    await Restaurant.update(data, { where: { id }, transaction });
    return this.findById(id);
  }

  /**
   * Soft delete restaurant
   */
  async delete(id: string, transaction?: Transaction): Promise<void> {
    await Restaurant.destroy({ where: { id }, transaction });
  }

  /**
   * Get restaurant with full details including images
   */
  async findByIdWithDetails(id: string): Promise<Restaurant | null> {
    return Restaurant.findByPk(id, {
      include: [
        { association: 'owner' },
        { association: 'logo' },
        { association: 'banner' },
        { association: 'images', include: [{ association: 'upload' }] },
      ],
    });
  }

  /**
   * Add gallery image to restaurant
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async addGalleryImage(
    restaurantId: string,
    uploadId: string,
    transaction?: Transaction
  ): Promise<RestaurantImage> {
    return RestaurantImage.create(
      {
        restaurantId,
        uploadId,
      },
      { transaction }
    );
  }

  /**
   * Remove gallery image from restaurant
   */
  async removeGalleryImage(imageId: string, transaction?: Transaction): Promise<void> {
    await RestaurantImage.destroy({ where: { id: imageId }, transaction });
  }

  /**
   * Find gallery image by ID
   */
  async findGalleryImageById(imageId: string): Promise<RestaurantImage | null> {
    return RestaurantImage.findByPk(imageId, {
      include: [{ association: 'restaurant' }, { association: 'upload' }],
    });
  }
}
