# Phase 5 Implementation Guide: Restaurant Management

**Version:** 2.1  
**Target Duration:** 2-3 weeks  
**Priority:** HIGH (blocks Phases 6-8, core business domain)  
**Complexity:** High (soft deletes, approval workflows, image management, authorization)

---

## 📋 Phase Overview

Phase 5 implements the **restaurant management system** that enables restaurant owners to create and manage restaurant profiles, and enables admins to approve/suspend restaurants. This phase establishes the core business entity that all orders and dishes are tied to.

### Why Phase 5 is Critical

Every downstream feature in Phases 6-8 depends on:

- Restaurant model with proper associations
- Restaurant status workflow (PENDING → APPROVED → ACTIVE)
- Owner authorization (restaurant ownership validation)
- Admin approval workflow
- Soft deletes with proper scoping
- Image management (logo, banner uploads)

**Phase 5 establishes the restaurant domain that forms the basis of the entire ordering system.**

### Phase 5 Dependencies

| Depends On                      | Used By                     |
| ------------------------------- | --------------------------- |
| Phase 3 (Shared Infrastructure) | Phase 6 (Categories/Dishes) |
| Phase 2 (Database schema)       | Phase 7 (Cart/Orders)       |
| Phase 4 (Authentication)        | Phase 8 (Checkout/Stock)    |

### Phase 5 Deliverables

By end of Phase 5, you will have:

- ✅ Restaurant model with soft deletes & proper associations
- ✅ RestaurantImage model linked to uploads
- ✅ Restaurant service with CRUD operations
- ✅ Restaurant repository with status filtering
- ✅ Admin approval workflow (approve, reject, suspend, reactivate)
- ✅ 6 protected API endpoints
- ✅ Restaurant ownership authorization
- ✅ Logo & banner image upload management
- ✅ Restaurant status validation
- ✅ 90%+ test coverage for restaurant module
- ✅ Swagger documentation for all restaurant endpoints

---

## 🎯 Task Breakdown

### 5.1 Models & Associations

**Objective:** Create Restaurant and RestaurantImage models with proper Sequelize configuration and soft deletes

#### 5.1.1 Restaurant Model

File: `src/database/models/Restaurant.ts`

The Restaurant model represents a restaurant with full lifecycle management:

```typescript
import { DataTypes, Model, Sequelize } from 'sequelize';

export interface RestaurantAttributes {
  id: string;
  ownerId: string;
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
  logoId?: string;
  bannerId?: string;
  status: 'PENDING' | 'APPROVED' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
  rejectedReason?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export class Restaurant extends Model<RestaurantAttributes> implements RestaurantAttributes {
  declare id: string;
  declare ownerId: string;
  declare name: string;
  declare slug: string;
  declare description?: string;
  declare phone: string;
  declare email?: string;
  declare address: string;
  declare city: string;
  declare province: string;
  declare postalCode?: string;
  declare latitude?: number;
  declare longitude?: number;
  declare logoId?: string;
  declare bannerId?: string;
  declare status: 'PENDING' | 'APPROVED' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';
  declare isOpen: boolean;
  declare openTime?: string;
  declare closeTime?: string;
  declare rejectedReason?: string;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt?: Date;

  static associate(models: any) {
    Restaurant.belongsTo(models.User, { foreignKey: 'ownerId', as: 'owner' });
    Restaurant.belongsTo(models.Upload, { foreignKey: 'logoId', as: 'logo' });
    Restaurant.belongsTo(models.Upload, { foreignKey: 'bannerId', as: 'banner' });
    Restaurant.hasMany(models.RestaurantImage, { foreignKey: 'restaurantId', as: 'images' });
    Restaurant.hasMany(models.Category, { foreignKey: 'restaurantId', as: 'categories' });
    Restaurant.hasMany(models.Dish, { foreignKey: 'restaurantId', as: 'dishes' });
  }

  /**
   * Check if restaurant is accepting orders
   */
  canAcceptOrders(): boolean {
    return this.status === 'ACTIVE' && this.isOpen;
  }

  /**
   * Check if restaurant is approved by admin
   */
  isApproved(): boolean {
    return ['APPROVED', 'ACTIVE', 'SUSPENDED'].includes(this.status);
  }
}

export default function restaurantFactory(sequelize: Sequelize) {
  Restaurant.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      ownerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      province: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      postalCode: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      latitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true,
      },
      longitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true,
      },
      logoId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'uploads', key: 'id' },
      },
      bannerId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'uploads', key: 'id' },
      },
      status: {
        type: DataTypes.ENUM('PENDING', 'APPROVED', 'ACTIVE', 'SUSPENDED', 'REJECTED'),
        allowNull: false,
        defaultValue: 'PENDING',
      },
      isOpen: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      openTime: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      closeTime: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      rejectedReason: {
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
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Restaurant',
      tableName: 'restaurants',
      timestamps: true,
      paranoid: true, // Enable soft deletes
      underscored: true,
      indexes: [
        { fields: ['slug'], unique: true },
        { fields: ['status'] },
        { fields: ['city'] },
        { fields: ['ownerId'] },
        { fields: ['deletedAt'] },
      ],
    }
  );

  return Restaurant;
}
```

#### 5.1.2 RestaurantImage Model

File: `src/database/models/RestaurantImage.ts`

```typescript
import { DataTypes, Model, Sequelize } from 'sequelize';

export interface RestaurantImageAttributes {
  id: string;
  restaurantId: string;
  uploadId: string;
  createdAt: Date;
}

export class RestaurantImage
  extends Model<RestaurantImageAttributes>
  implements RestaurantImageAttributes
{
  declare id: string;
  declare restaurantId: string;
  declare uploadId: string;
  declare createdAt: Date;

  static associate(models: any) {
    RestaurantImage.belongsTo(models.Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });
    RestaurantImage.belongsTo(models.Upload, { foreignKey: 'uploadId', as: 'upload' });
  }
}

export default function restaurantImageFactory(sequelize: Sequelize) {
  RestaurantImage.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      restaurantId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'restaurants', key: 'id' },
        onDelete: 'CASCADE',
      },
      uploadId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'uploads', key: 'id' },
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'RestaurantImage',
      tableName: 'restaurant_images',
      timestamps: false,
      underscored: true,
      indexes: [
        { fields: ['restaurantId'] },
        { fields: ['restaurantId', 'uploadId'], unique: true },
      ],
    }
  );

  return RestaurantImage;
}
```

### 5.2 Repository Layer

**Objective:** Create repository for database access with proper soft delete filtering

#### 5.2.1 RestaurantRepository

File: `src/modules/restaurants/repositories/RestaurantRepository.ts`

Responsibilities:

- CRUD operations (create, read, update, delete)
- Status-filtered queries (pending, approved, active, etc.)
- Ownership-based queries
- Soft delete handling

Key methods:

```typescript
// CRUD
create(data: CreateRestaurantDTO, transaction: Transaction): Promise<Restaurant>
findById(id: string): Promise<Restaurant | null>
update(id: string, data: UpdateRestaurantDTO, transaction: Transaction): Promise<Restaurant>
delete(id: string, transaction: Transaction): Promise<void>

// Filters
findPending(limit: number, offset: number): Promise<{ data: Restaurant[], total: number }>
findByStatus(status: string, limit: number, offset: number): Promise<{ data: Restaurant[], total: number }>
findByOwner(ownerId: string): Promise<Restaurant[]>
findBySlug(slug: string): Promise<Restaurant | null>

// Public listing (only active restaurants)
findPublic(filters: { city?: string }, limit: number, offset: number): Promise<{ data: Restaurant[], total: number }>
```

### 5.3 Service Layer

**Objective:** Implement business logic for restaurant management

#### 5.3.1 RestaurantService

File: `src/modules/restaurants/services/RestaurantService.ts`

Responsibilities:

- Validation (unique slug, email format, coordinates if provided)
- Authorization (owner checks)
- Image upload coordination
- Status workflow enforcement
- Error handling with standardized error codes

Key methods:

```typescript
// Owner operations
createRestaurant(
  ownerId: string,
  data: CreateRestaurantDTO,
  logoFile?: Express.Multer.File,
  bannerFile?: Express.Multer.File,
  transaction: Transaction
): Promise<Restaurant>

updateRestaurant(
  restaurantId: string,
  ownerId: string,
  data: UpdateRestaurantDTO,
  transaction: Transaction
): Promise<Restaurant>

deleteRestaurant(restaurantId: string, ownerId: string, transaction: Transaction): Promise<void>

// Admin operations
approveRestaurant(restaurantId: string, transaction: Transaction): Promise<Restaurant>
rejectRestaurant(restaurantId: string, reason: string, transaction: Transaction): Promise<Restaurant>
suspendRestaurant(restaurantId: string, transaction: Transaction): Promise<Restaurant>
reactivateRestaurant(restaurantId: string, transaction: Transaction): Promise<Restaurant>

// Public operations
getRestaurantById(restaurantId: string): Promise<Restaurant>
searchPublicRestaurants(filters: SearchFilters): Promise<{ data: Restaurant[], pagination: PaginationMeta }>
getOwnerRestaurants(ownerId: string): Promise<Restaurant[]>

// Image management
uploadLogo(restaurantId: string, ownerId: string, file: Express.Multer.File, transaction: Transaction): Promise<Restaurant>
uploadBanner(restaurantId: string, ownerId: string, file: Express.Multer.File, transaction: Transaction): Promise<Restaurant>
uploadGalleryImage(restaurantId: string, ownerId: string, file: Express.Multer.File, transaction: Transaction): Promise<RestaurantImage>
deleteGalleryImage(imageId: string, restaurantId: string, ownerId: string, transaction: Transaction): Promise<void>
```

### 5.4 Error Codes & Handling

**Objective:** Implement proper error handling with standardized error codes

Restaurant-related error codes from API-ERROR-CODES.MD:

| Code                      | HTTP | Field         | Description                              |
| ------------------------- | ---- | ------------- | ---------------------------------------- |
| INVALID_RESTAURANT_DATA   | 400  | various       | Invalid restaurant details (name, phone) |
| INVALID_SLUG_FORMAT       | 400  | slug          | Slug contains invalid characters         |
| OWNER_ONLY                | 403  | restaurant_id | Only restaurant owner can access         |
| ADMIN_ONLY                | 403  | -             | Only admins can approve restaurants      |
| RESTAURANT_NOT_FOUND      | 404  | restaurant_id | Restaurant not found                     |
| SLUG_ALREADY_EXISTS       | 409  | slug          | Restaurant slug already in use           |
| INVALID_RESTAURANT_STATUS | 422  | status        | Invalid status transition                |
| RESTAURANT_NOT_APPROVED   | 422  | restaurant_id | Restaurant not approved yet              |

Implementation pattern:

```typescript
// In RestaurantService
if (await this.restaurantRepository.findBySlug(slug)) {
  throw new ApiError({
    code: 'SLUG_ALREADY_EXISTS',
    httpStatus: 409,
    message: 'Restaurant slug already in use',
    field: 'slug',
  });
}

// Authorization
if (restaurant.ownerId !== ownerId && !isAdmin) {
  throw new ApiError({
    code: 'OWNER_ONLY',
    httpStatus: 403,
    message: 'Only restaurant owner can perform this action',
    field: 'restaurant_id',
  });
}

// Status validation
const validTransitions = {
  PENDING: ['APPROVED', 'REJECTED'],
  APPROVED: ['ACTIVE', 'REJECTED'],
  ACTIVE: ['SUSPENDED'],
  SUSPENDED: ['ACTIVE', 'REJECTED'],
  REJECTED: [], // Terminal state
};

if (!validTransitions[currentStatus]?.includes(newStatus)) {
  throw new ApiError({
    code: 'INVALID_RESTAURANT_STATUS',
    httpStatus: 422,
    message: `Cannot transition from ${currentStatus} to ${newStatus}`,
    field: 'status',
  });
}
```

### 5.5 API Routes & Controllers

**Objective:** Implement 6 REST endpoints with proper middleware

#### 5.5.1 Routes

File: `src/modules/restaurants/routes/index.ts`

```typescript
// Public endpoints
GET    /api/v1/restaurants              // List public restaurants (paginated, filterable)
GET    /api/v1/restaurants/:id          // Get restaurant details

// Owner endpoints (requires auth + RESTO_ADMIN role)
POST   /api/v1/restaurants              // Create restaurant
PATCH  /api/v1/restaurants/:id          // Update restaurant
DELETE /api/v1/restaurants/:id          // Delete restaurant

// Admin endpoints (requires auth + SUPER_ADMIN role)
GET    /api/v1/restaurants/admin/pending // List pending approvals
PATCH  /api/v1/restaurants/:id/status   // Approve/reject/suspend/reactivate
```

#### 5.5.2 Controller

File: `src/modules/restaurants/controllers/RestaurantController.ts`

```typescript
/**
 * GET /api/v1/restaurants
 * Public endpoint to list approved restaurants
 */
async listPublicRestaurants(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { city, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const result = await this.restaurantService.searchPublicRestaurants({
      city: city as string,
      limit: Number(limit),
      offset,
    });

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/restaurants
 * Create restaurant (owner)
 * Requires: RESTO_ADMIN role
 */
async createRestaurant(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user.id;

    // Validate role (middleware should handle, but add safety check)
    if (req.user.role !== 'RESTO_ADMIN') {
      throw new ApiError({
        code: 'UNAUTHORIZED',
        httpStatus: 403,
        message: 'Only restaurant admins can create restaurants',
      });
    }

    const restaurant = await this.restaurantService.createRestaurant(
      userId,
      req.body,
      req.files?.logo?.[0],
      req.files?.banner?.[0],
      req.transaction
    );

    res.status(201).json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/restaurants/:id
 * Update restaurant (owner)
 * Requires: RESTO_ADMIN role + ownership
 */
async updateRestaurant(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const restaurantId = req.params.id;
    const userId = req.user.id;

    const restaurant = await this.restaurantService.updateRestaurant(
      restaurantId,
      userId,
      req.body,
      req.transaction
    );

    res.json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/restaurants/:id
 * Soft delete restaurant (owner)
 * Requires: RESTO_ADMIN role + ownership
 */
async deleteRestaurant(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const restaurantId = req.params.id;
    const userId = req.user.id;

    await this.restaurantService.deleteRestaurant(
      restaurantId,
      userId,
      req.transaction
    );

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/restaurants/admin/pending
 * List pending restaurant approvals (admin only)
 * Requires: SUPER_ADMIN role
 */
async listPendingRestaurants(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const result = await this.restaurantService.getPendingRestaurants(
      Number(limit),
      offset
    );

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/restaurants/:id/status
 * Manage restaurant status: approve, reject, suspend, reactivate (admin only)
 * Requires: SUPER_ADMIN role
 */
async updateRestaurantStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const restaurantId = req.params.id;
    const { action, reason } = req.body;

    let restaurant;

    switch (action) {
      case 'approve':
        restaurant = await this.restaurantService.approveRestaurant(
          restaurantId,
          req.transaction
        );
        break;
      case 'reject':
        restaurant = await this.restaurantService.rejectRestaurant(
          restaurantId,
          reason,
          req.transaction
        );
        break;
      case 'suspend':
        restaurant = await this.restaurantService.suspendRestaurant(
          restaurantId,
          req.transaction
        );
        break;
      case 'reactivate':
        restaurant = await this.restaurantService.reactivateRestaurant(
          restaurantId,
          req.transaction
        );
        break;
      default:
        throw new ApiError({
          code: 'INVALID_STATUS_ACTION',
          httpStatus: 400,
          message: 'Invalid status action',
          field: 'action',
        });
    }

    res.json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    next(error);
  }
}
```

### 5.6 Image Management Integration

**Objective:** Integrate with uploads service from Phase 3

#### 5.6.1 Logo & Banner Upload

```typescript
// In RestaurantService.uploadLogo()
async uploadLogo(
  restaurantId: string,
  ownerId: string,
  file: Express.Multer.File,
  transaction: Transaction
): Promise<Restaurant> {
  // Verify ownership
  const restaurant = await this.restaurantRepository.findById(restaurantId);
  if (!restaurant || restaurant.ownerId !== ownerId) {
    throw new ApiError({
      code: 'OWNER_ONLY',
      httpStatus: 403,
      message: 'Only restaurant owner can upload images',
    });
  }

  try {
    // Upload file using uploads service
    const upload = await this.uploadsService.uploadFile(
      file,
      'restaurant_logos',
      transaction
    );

    // Delete old logo if exists
    if (restaurant.logoId) {
      await this.uploadsService.deleteFile(restaurant.logoId, transaction);
    }

    // Update restaurant with new logo
    restaurant.logoId = upload.id;
    await restaurant.save({ transaction });

    return restaurant;
  } catch (error) {
    throw new ApiError({
      code: 'FILE_UPLOAD_FAILED',
      httpStatus: 500,
      message: 'Failed to upload file',
    });
  }
}
```

#### 5.6.2 Gallery Images

```typescript
// In RestaurantService.uploadGalleryImage()
async uploadGalleryImage(
  restaurantId: string,
  ownerId: string,
  file: Express.Multer.File,
  transaction: Transaction
): Promise<RestaurantImage> {
  const restaurant = await this.restaurantRepository.findById(restaurantId);
  if (!restaurant || restaurant.ownerId !== ownerId) {
    throw new ApiError({
      code: 'OWNER_ONLY',
      httpStatus: 403,
      message: 'Only restaurant owner can upload images',
    });
  }

  try {
    const upload = await this.uploadsService.uploadFile(
      file,
      'restaurant_galleries',
      transaction
    );

    const image = await RestaurantImage.create(
      {
        restaurantId,
        uploadId: upload.id,
      },
      { transaction }
    );

    return image;
  } catch (error) {
    throw new ApiError({
      code: 'FILE_UPLOAD_FAILED',
      httpStatus: 500,
      message: 'Failed to upload gallery image',
    });
  }
}
```

### 5.7 Middleware

**Objective:** Implement authorization middleware for restaurant operations

#### 5.7.1 Restaurant Owner Authorization

File: `src/modules/restaurants/middleware/restaurantOwnerAuth.ts`

```typescript
/**
 * Verify that authenticated user is the restaurant owner
 * Used before PATCH, DELETE operations
 */
export const restaurantOwnerAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const restaurantId = req.params.id;
    const userId = req.user.id;

    const restaurant = await Restaurant.findByPk(restaurantId);

    if (!restaurant) {
      throw new ApiError({
        code: 'RESTAURANT_NOT_FOUND',
        httpStatus: 404,
        message: 'Restaurant not found',
        field: 'restaurant_id',
      });
    }

    if (restaurant.ownerId !== userId) {
      throw new ApiError({
        code: 'OWNER_ONLY',
        httpStatus: 403,
        message: 'Only restaurant owner can perform this action',
        field: 'restaurant_id',
      });
    }

    // Attach restaurant to request for controller use
    req.restaurant = restaurant;
    next();
  } catch (error) {
    next(error);
  }
};
```

### 5.8 Testing Strategy

**Objective:** Achieve 90%+ coverage with unit and integration tests

#### 5.8.1 Unit Tests

File: `tests/unit/restaurants/RestaurantService.test.ts`

Test cases:

```typescript
describe('RestaurantService', () => {
  // Creation tests
  describe('createRestaurant', () => {
    it('should create restaurant with valid data');
    it('should reject duplicate slug');
    it('should set initial status to PENDING');
    it('should validate email format');
    it('should validate phone format');
  });

  // Status workflow tests
  describe('approveRestaurant', () => {
    it('should approve PENDING restaurant');
    it('should reject non-PENDING restaurant');
    it('should transition to APPROVED');
  });

  describe('rejectRestaurant', () => {
    it('should reject PENDING restaurant');
    it('should require rejection reason');
    it('should transition to REJECTED');
  });

  describe('suspendRestaurant', () => {
    it('should suspend ACTIVE restaurant');
    it('should reject non-ACTIVE restaurant');
  });

  describe('reactivateRestaurant', () => {
    it('should reactivate SUSPENDED restaurant');
    it('should reject non-SUSPENDED restaurant');
  });

  // Authorization tests
  describe('updateRestaurant', () => {
    it('should allow owner to update');
    it('should reject non-owner update');
    it('should update fields correctly');
  });

  describe('deleteRestaurant', () => {
    it('should soft delete restaurant');
    it('should allow only owner to delete');
    it('should exclude deleted restaurants from queries');
  });

  // Image tests
  describe('uploadLogo', () => {
    it('should upload logo file');
    it('should replace existing logo');
    it('should delete old file');
    it('should reject non-owner upload');
  });

  describe('uploadGalleryImage', () => {
    it('should add image to gallery');
    it('should prevent duplicates');
    it('should validate image file');
  });
});
```

#### 5.8.2 Integration Tests

File: `tests/integration/restaurants/RestaurantEndpoints.test.ts`

Test scenarios:

```typescript
describe('Restaurant API Endpoints', () => {
  describe('POST /api/v1/restaurants', () => {
    it('should create restaurant with auth');
    it('should validate input data');
    it('should require RESTO_ADMIN role');
    it('should return 201 with restaurant data');
  });

  describe('GET /api/v1/restaurants', () => {
    it('should list public restaurants');
    it('should filter by city');
    it('should paginate results');
    it('should exclude pending/rejected restaurants');
  });

  describe('PATCH /api/v1/restaurants/:id', () => {
    it('should update restaurant (owner)');
    it('should reject unauthorized updates');
    it('should validate new data');
  });

  describe('DELETE /api/v1/restaurants/:id', () => {
    it('should soft delete (owner)');
    it('should exclude from public listings');
  });

  describe('PATCH /api/v1/restaurants/:id/status (admin)', () => {
    it('should approve pending restaurant');
    it('should reject with reason');
    it('should suspend active restaurant');
    it('should reactivate suspended restaurant');
    it('should reject invalid transitions');
  });

  describe('Status workflow integration', () => {
    it('should enforce PENDING → APPROVED → ACTIVE flow');
    it('should not allow ACTIVE → PENDING');
    it('should track status changes in audit logs');
  });

  describe('Image upload integration', () => {
    it('should upload logo and link to restaurant');
    it('should handle file validation');
    it('should clean up old files on replacement');
  });
});
```

### 5.9 Swagger Documentation

**Objective:** Document all endpoints in OpenAPI format

Key endpoints to document:

```yaml
/api/v1/restaurants:
  get:
    summary: List public restaurants
    parameters:
      - name: city
        in: query
        type: string
      - name: page
        in: query
        type: integer
      - name: limit
        in: query
        type: integer
    responses:
      200:
        description: Success
        schema:
          properties:
            data:
              type: array
              items:
                $ref: '#/components/schemas/Restaurant'
            pagination:
              $ref: '#/components/schemas/PaginationMeta'

  post:
    summary: Create restaurant (owner)
    security:
      - BearerAuth: []
    requestBody:
      required: true
      content:
        multipart/form-data:
          schema:
            $ref: '#/components/schemas/CreateRestaurantDTO'
    responses:
      201:
        description: Restaurant created
        schema:
          $ref: '#/components/schemas/Restaurant'

/api/v1/restaurants/:id:
  get:
    summary: Get restaurant details
    parameters:
      - name: id
        in: path
        required: true
        type: string
    responses:
      200:
        schema:
          $ref: '#/components/schemas/Restaurant'
      404:
        description: Not found

  patch:
    summary: Update restaurant (owner only)
    security:
      - BearerAuth: []
    responses:
      200:
        schema:
          $ref: '#/components/schemas/Restaurant'
      403:
        description: Owner only

  delete:
    summary: Delete restaurant (owner only)
    security:
      - BearerAuth: []
    responses:
      204:
        description: Deleted

/api/v1/restaurants/admin/pending:
  get:
    summary: List pending restaurants (admin)
    security:
      - BearerAuth: []
    responses:
      200:
        schema:
          properties:
            data:
              type: array
              items:
                $ref: '#/components/schemas/Restaurant'

/api/v1/restaurants/:id/status:
  patch:
    summary: Manage restaurant status (admin)
    security:
      - BearerAuth: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            properties:
              action:
                type: string
                enum: [approve, reject, suspend, reactivate]
              reason:
                type: string
    responses:
      200:
        schema:
          $ref: '#/components/schemas/Restaurant'
```

---

## 📊 Checklist

- [ ] 5.1 Restaurant & RestaurantImage models created
- [ ] 5.2 RestaurantRepository with soft delete filtering
- [ ] 5.3 RestaurantService with full business logic
- [ ] 5.4 Error codes integrated from API-ERROR-CODES.MD
- [ ] 5.5 6 API endpoints implemented
- [ ] 5.5 RestaurantController with proper authorization
- [ ] 5.6 Image upload integration with uploads service
- [ ] 5.7 Owner & admin authorization middleware
- [ ] 5.8 Unit tests (90%+ coverage)
- [ ] 5.8 Integration tests for approval workflow
- [ ] 5.8 Status transition validation tests
- [ ] 5.9 Swagger documentation complete
- [ ] All error codes mapped to HTTP status
- [ ] Authorization checks before data access
- [ ] Soft deletes properly scoped
- [ ] All tests passing

---

## 🔗 Related Documents

- [IMPLEMENTATION-CHECKLIST.MD](./IMPLEMENTATION-CHECKLIST.MD) — Full Phase 5 task list
- [DATABASE_DESIGN-V2.1.MD](./DATABASE_DESIGN-V2.1.MD) — Restaurant & RestaurantImage schema
- [API-ERROR-CODES.MD](./API-ERROR-CODES.MD) — Restaurant error codes
- [STOCK-MANAGEMENT-STRATEGY.MD](./STOCK-MANAGEMENT-STRATEGY.MD) — Dish stock (Phase 6)
- [PHASE-4-OVERVIEW.MD](./PHASE-4-OVERVIEW.MD) — Authentication (Phase 4 dependency)

---

## ⏭️ Next Steps

After Phase 5 completion:

1. **Phase 6** builds on restaurants to add categories & dishes
2. **Phase 7** creates carts & cart items tied to restaurants
3. **Phase 8** implements checkout with stock deduction

Restaurant CRUD and approval workflow form the foundation for all downstream modules.
