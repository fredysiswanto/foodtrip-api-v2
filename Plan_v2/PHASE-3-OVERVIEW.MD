# Phase 3 Implementation Guide: Shared Infrastructure

**Version:** 2.1  
**Target Duration:** 2-3 weeks  
**Priority:** CRITICAL (blocks all downstream phases)  
**Complexity:** High (foundational patterns used everywhere)

---

## 📋 Phase Overview

Phase 3 establishes the **shared infrastructure layer** that all other modules depend on. This phase implements the error handling taxonomy, response formatting, middleware stack, and utility functions that enforce consistency across the entire FoodTrip API.

### Why Phase 3 is Critical

Every endpoint in Phases 4-15 will use:

- Error codes from the API-ERROR-CODES.MD taxonomy
- Response formatters for consistent JSON structure
- Middleware for auth, validation, logging
- Utility functions for encryption, tokens, slugs
- TypeScript types for type safety
- Constants for enums (roles, statuses)

**Failing to establish proper patterns here will require massive refactoring later.**

### Phase 3 Dependencies

| Depends On                | Used By                  |
| ------------------------- | ------------------------ |
| Phase 2 (Database schema) | Phase 4 (Auth)           |
| Phase 1 (Config, logging) | Phase 5 (Restaurants)    |
|                           | Phase 6-15 (all modules) |

### Phase 3 Deliverables

By end of Phase 3, you will have:

- ✅ 40+ error codes implemented with proper HTTP mapping
- ✅ 8+ custom error classes for domain errors
- ✅ Success/error response formatters
- ✅ 6+ middleware functions (logging, auth, validation, etc.)
- ✅ 10+ utility functions (JWT, bcrypt, UUID, slug, etc.)
- ✅ 20+ TypeScript interfaces/types
- ✅ 50+ constants (roles, statuses, error codes)
- ✅ Pagination helper with limit/offset
- ✅ Validation error aggregator

---

## 🎯 Task Breakdown

### 3.1 Error Handling Architecture

**Objective:** Implement standardized error handling matching API-ERROR-CODES.MD

#### 3.1.1 AppError Base Class

File: `src/shared/errors/AppError.ts`

```typescript
/**
 * Base application error class
 * All errors thrown in services should extend this
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public field?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
```

**Usage:**

```typescript
// In service
throw new AppError(400, 'INVALID_EMAIL', 'Invalid email format', 'email');

// In error middleware
catch (error: unknown) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      code: error.code,
      message: error.message,
      field: error.field,
    });
  }
}
```

#### 3.1.2 Domain-Specific Error Classes

Create in `src/shared/errors/`:

```typescript
// ValidationError.ts
export class ValidationError extends AppError {
  constructor(message = 'Validation failed', field?: string) {
    super(400, 'INVALID_REQUEST', message, field);
  }
}

// UnauthorizedError.ts
export class UnauthorizedError extends AppError {
  constructor(code = 'UNAUTHORIZED', message = 'Unauthorized access') {
    super(401, code, message);
  }
}

// ForbiddenError.ts
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, 'FORBIDDEN', message);
  }
}

// NotFoundError.ts
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource.toUpperCase()}_NOT_FOUND`, `${resource} not found`);
  }
}

// ConflictError.ts
export class ConflictError extends AppError {
  constructor(code: string, message: string, field?: string) {
    super(409, code, message, field);
  }
}

// InsufficientStockError.ts
export class InsufficientStockError extends AppError {
  constructor(dishName: string, available: number) {
    super(
      422,
      'INSUFFICIENT_STOCK',
      `Only ${available} units available for '${dishName}'`,
      'items'
    );
  }
}

// InvalidStatusTransitionError.ts
export class InvalidStatusTransitionError extends AppError {
  constructor(currentStatus: string, targetStatus: string) {
    super(
      409,
      'INVALID_STATE_TRANSITION',
      `Cannot transition from ${currentStatus} to ${targetStatus}`,
      'status'
    );
  }
}

// RateLimitError.ts
export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(429, 'RATE_LIMIT_EXCEEDED', message);
  }
}
```

**Index file:** `src/shared/errors/index.ts`

```typescript
export * from './AppError';
export * from './ValidationError';
export * from './UnauthorizedError';
export * from './ForbiddenError';
export * from './NotFoundError';
export * from './ConflictError';
export * from './InsufficientStockError';
export * from './InvalidStatusTransitionError';
export * from './RateLimitError';
```

**Tests:**

```typescript
describe('AppError', () => {
  it('should create error with correct properties', () => {
    const error = new AppError(400, 'INVALID_EMAIL', 'Email invalid', 'email');
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('INVALID_EMAIL');
    expect(error.field).toBe('email');
  });

  it('should preserve stack trace', () => {
    const error = new ValidationError('Missing field', 'username');
    expect(error.stack).toBeDefined();
  });
});
```

#### 3.1.3 Error Code Constants

File: `src/shared/constants/errorCodes.ts`

Match exactly with API-ERROR-CODES.MD:

```typescript
// 4xx Client Errors
export const ERROR_CODES = {
  // 400 Bad Request
  INVALID_REQUEST: 'INVALID_REQUEST',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_PHONE: 'INVALID_PHONE',
  INVALID_UUID: 'INVALID_UUID',
  INVALID_ENUM: 'INVALID_ENUM',
  INVALID_PAGINATION: 'INVALID_PAGINATION',

  // 401 Unauthorized
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  SESSION_EXPIRED: 'SESSION_EXPIRED',

  // 403 Forbidden
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  OWNER_ONLY: 'OWNER_ONLY',

  // 404 Not Found
  NOT_FOUND: 'NOT_FOUND',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  RESTAURANT_NOT_FOUND: 'RESTAURANT_NOT_FOUND',
  DISH_NOT_FOUND: 'DISH_NOT_FOUND',
  ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',
  CART_NOT_FOUND: 'CART_NOT_FOUND',

  // 409 Conflict
  CONFLICT: 'CONFLICT',
  DUPLICATE_EMAIL: 'DUPLICATE_EMAIL',
  DUPLICATE_SLUG: 'DUPLICATE_SLUG',
  INVALID_STATE_TRANSITION: 'INVALID_STATE_TRANSITION',

  // 422 Unprocessable Entity
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  CART_EMPTY: 'CART_EMPTY',
  RESTAURANT_CLOSED: 'RESTAURANT_CLOSED',
  DISH_UNAVAILABLE: 'DISH_UNAVAILABLE',

  // 429 Rate Limited
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // 500 Server Error
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const;

export const ERROR_HTTP_STATUS: Record<string, number> = {
  INVALID_REQUEST: 400,
  INVALID_EMAIL: 400,
  UNAUTHORIZED: 401,
  INVALID_CREDENTIALS: 401,
  FORBIDDEN: 403,
  USER_NOT_FOUND: 404,
  DUPLICATE_EMAIL: 409,
  INSUFFICIENT_STOCK: 422,
  RATE_LIMIT_EXCEEDED: 429,
  INTERNAL_ERROR: 500,
};
```

---

### 3.2 Response Helpers

**Objective:** Standardize all HTTP responses (success and error)

#### 3.2.1 Response Formatter Service

File: `src/shared/utils/responseFormatter.ts`

```typescript
/**
 * Success Response
 */
export interface SuccessResponse<T> {
  success: true;
  message?: string;
  data: T;
  pagination?: PaginationInfo;
}

/**
 * Error Response
 */
export interface ErrorDetail {
  code: string;
  field?: string;
  message: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: ErrorDetail[];
}

/**
 * Pagination Info
 */
export interface PaginationInfo {
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
}

/**
 * Response formatters (use in controllers)
 */
export const responseFormatter = {
  success<T>(data: T, message = 'Success', pagination?: PaginationInfo): SuccessResponse<T> {
    return {
      success: true,
      message,
      data,
      ...(pagination && { pagination }),
    };
  },

  error(message: string, errors?: ErrorDetail[]): ErrorResponse {
    return {
      success: false,
      message,
      ...(errors && errors.length > 0 && { errors }),
    };
  },

  created<T>(data: T, message = 'Created'): SuccessResponse<T> {
    return this.success(data, message);
  },

  paginated<T>(
    items: T[],
    total: number,
    limit: number,
    offset: number,
    message = 'Success'
  ): SuccessResponse<T[]> {
    return this.success(items, message, {
      limit,
      offset,
      total,
      hasMore: offset + limit < total,
    });
  },
};
```

**Usage in Controllers:**

```typescript
// Success response
res.json(responseFormatter.success(user, 'User created'));

// Error response
res.status(400).json(
  responseFormatter.error('Validation failed', [
    { code: 'INVALID_EMAIL', field: 'email', message: 'Invalid email format' },
    { code: 'MISSING_REQUIRED_FIELD', field: 'password', message: 'Password required' },
  ])
);

// Paginated response
const users = await User.findAll({ limit: 10, offset: 0 });
const total = await User.count();
res.json(responseFormatter.paginated(users, total, 10, 0, 'Users retrieved'));
```

#### 3.2.2 Validation Error Aggregator

File: `src/shared/utils/validationHelper.ts`

```typescript
/**
 * Collect validation errors from Zod or manual validation
 */
export class ValidationErrorAggregator {
  errors: ErrorDetail[] = [];

  addError(code: string, field: string, message: string): this {
    this.errors.push({ code, field, message });
    return this;
  }

  addErrors(errors: ErrorDetail[]): this {
    this.errors.push(...errors);
    return this;
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  throw(): never {
    throw new ValidationError('Validation failed');
    // Note: Middleware will attach errors to response
  }

  toJSON(): ErrorDetail[] {
    return this.errors;
  }
}

/**
 * Convert Zod validation errors
 */
export function zodErrorsToDetails(error: ZodError): ErrorDetail[] {
  return error.errors.map((err) => ({
    code: err.code === 'invalid_type' ? 'INVALID_REQUEST' : err.code.toUpperCase(),
    field: err.path.join('.'),
    message: err.message,
  }));
}
```

---

### 3.3 Constants Module

**Objective:** Centralize all enums and constants

#### 3.3.1 Role Constants

File: `src/shared/constants/roles.ts`

```typescript
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  RESTO_ADMIN: 'RESTO_ADMIN',
  RESTO_STAFF: 'RESTO_STAFF',
  DRIVER: 'DRIVER',
  CUSTOMER: 'CUSTOMER',
} as const;

export type RoleType = (typeof ROLES)[keyof typeof ROLES];

/**
 * Role hierarchy for permission checks
 */
export const ROLE_HIERARCHY = {
  [ROLES.SUPER_ADMIN]: 0, // highest
  [ROLES.RESTO_ADMIN]: 1,
  [ROLES.RESTO_STAFF]: 2,
  [ROLES.DRIVER]: 3,
  [ROLES.CUSTOMER]: 4, // lowest
};

export const ROLE_DESCRIPTIONS = {
  [ROLES.SUPER_ADMIN]: 'System administrator with full access',
  [ROLES.RESTO_ADMIN]: 'Restaurant owner/manager',
  [ROLES.RESTO_STAFF]: 'Restaurant staff (kitchen, counter)',
  [ROLES.DRIVER]: 'Delivery driver',
  [ROLES.CUSTOMER]: 'Regular customer',
};
```

#### 3.3.2 Order Status Constants

File: `src/shared/constants/orderStatus.ts`

```typescript
export const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PREPARING: 'PREPARING',
  DELIVERING: 'DELIVERING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type OrderStatusType = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

/**
 * Valid status transitions
 */
export const VALID_STATUS_TRANSITIONS: Record<OrderStatusType, OrderStatusType[]> = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PREPARING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PREPARING]: [ORDER_STATUS.DELIVERING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.DELIVERING]: [ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.COMPLETED]: [],
  [ORDER_STATUS.CANCELLED]: [],
};

export function isValidStatusTransition(from: OrderStatusType, to: OrderStatusType): boolean {
  return VALID_STATUS_TRANSITIONS[from].includes(to);
}
```

#### 3.3.3 Payment & Delivery Constants

File: `src/shared/constants/payments.ts` and `deliveries.ts`

```typescript
// payments.ts
export const PAYMENT_STATUS = {
  UNPAID: 'UNPAID',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const;

export const PAYMENT_METHOD = {
  CASH: 'CASH',
  TRANSFER: 'TRANSFER',
  EWALLET: 'EWALLET',
  QRIS: 'QRIS',
} as const;

// deliveries.ts
export const DELIVERY_STATUS = {
  UNASSIGNED: 'UNASSIGNED',
  ASSIGNED: 'ASSIGNED',
  PICKED_UP: 'PICKED_UP',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED',
} as const;
```

#### 3.3.4 Restaurant Status Constants

File: `src/shared/constants/restaurants.ts`

```typescript
export const RESTAURANT_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
} as const;

export const VALID_RESTAURANT_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['APPROVED', 'REJECTED'],
  APPROVED: ['ACTIVE', 'SUSPENDED'],
  ACTIVE: ['SUSPENDED'],
  SUSPENDED: ['ACTIVE'],
};
```

---

### 3.4 Middleware Stack

**Objective:** Implement middleware for cross-cutting concerns

#### 3.4.1 Error Handler Middleware

File: `src/shared/middleware/errorHandler.ts`

```typescript
/**
 * Global error handler (must be last in middleware stack)
 */
export function errorHandler(
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.error('Request error', {
    path: req.path,
    method: req.method,
    error: error.message,
    stack: error.stack,
  });

  if (error instanceof AppError) {
    res.status(error.statusCode).json(
      responseFormatter.error(error.message, [
        {
          code: error.code,
          field: error.field,
          message: error.message,
        },
      ])
    );
    return;
  }

  // Unknown error
  res.status(500).json(
    responseFormatter.error('Internal server error', [
      {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    ])
  );
}
```

#### 3.4.2 Authentication Middleware

File: `src/shared/middleware/auth.ts`

```typescript
/**
 * JWT verification middleware
 * Extracts token from Authorization header and verifies it
 */
export function authenticateJWT(
  req: Request & { user?: JWTPayload },
  res: Response,
  next: NextFunction
): void {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    throw new UnauthorizedError('UNAUTHORIZED', 'No authorization token provided');
  }

  try {
    const decoded = jwtHelper.verify(token);
    req.user = decoded;
    next();
  } catch (error) {
    throw new UnauthorizedError('TOKEN_INVALID', 'Invalid or expired token');
  }
}
```

#### 3.4.3 Authorization Middleware

File: `src/shared/middleware/authorization.ts`

```typescript
/**
 * Role-based authorization middleware
 */
export function requireRole(allowedRoles: RoleType[]) {
  return (req: Request & { user?: JWTPayload }, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    if (!allowedRoles.includes(req.user.role as RoleType)) {
      throw new ForbiddenError('INSUFFICIENT_PERMISSIONS', 'You lack required permissions');
    }

    next();
  };
}

/**
 * Check resource ownership
 */
export function requireOwnership(resourceField: string) {
  return (req: Request & { user?: JWTPayload }, res: Response, next: NextFunction) => {
    if (req.user?.id !== req.params[resourceField]) {
      throw new ForbiddenError('OWNER_ONLY', 'Only resource owner can access');
    }
    next();
  };
}
```

#### 3.4.4 Validation Middleware

File: `src/shared/middleware/validation.ts`

```typescript
import { ZodSchema } from 'zod';

/**
 * Validate request body/params/query against Zod schema
 */
export function validate(schema: ZodSchema, source: 'body' | 'params' | 'query' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = req[source];

    try {
      schema.parse(data);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = zodErrorsToDetails(error);
        throw new ValidationError('Validation failed');
        // Middleware will attach errors
      }
      next(error);
    }
  };
}
```

---

### 3.5 Utility Functions

**Objective:** Implement reusable helper functions for common operations

#### 3.5.1 JWT Helper

File: `src/shared/utils/jwt.ts`

```typescript
interface JWTPayload {
  id: string;
  email: string;
  role: RoleType;
  restaurantId?: string;
  iat: number;
  exp: number;
}

export const jwtHelper = {
  /**
   * Sign JWT token
   */
  sign(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.accessTokenExpiry,
    });
  },

  /**
   * Verify JWT token
   */
  verify(token: string): JWTPayload {
    try {
      return jwt.verify(token, jwtConfig.secret) as JWTPayload;
    } catch (error) {
      throw new UnauthorizedError('TOKEN_INVALID');
    }
  },

  /**
   * Decode token without verification (for refresh token)
   */
  decode(token: string): JWTPayload {
    const decoded = jwt.decode(token) as JWTPayload | null;
    if (!decoded) throw new UnauthorizedError('TOKEN_INVALID');
    return decoded;
  },

  /**
   * Check if token is expired
   */
  isExpired(token: string): boolean {
    const payload = this.decode(token);
    return Date.now() > payload.exp * 1000;
  },
};
```

#### 3.5.2 Bcrypt Helper

File: `src/shared/utils/bcrypt.ts`

```typescript
export const bcryptHelper = {
  /**
   * Hash password
   */
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, appConfig.bcryptRounds);
  },

  /**
   * Compare password with hash
   */
  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },
};
```

#### 3.5.3 UUID & Slug Helpers

File: `src/shared/utils/generators.ts`

```typescript
export const generators = {
  /**
   * Generate UUID v4
   */
  uuid(): string {
    return uuidv4();
  },

  /**
   * Generate slug from string
   * "The Quick Brown Fox" → "the-quick-brown-fox"
   */
  slug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },

  /**
   * Generate unique slug with timestamp
   */
  uniqueSlug(text: string): string {
    const baseSlug = this.slug(text);
    const timestamp = Date.now().toString(36);
    return `${baseSlug}-${timestamp}`;
  },
};
```

#### 3.5.4 Stock Deduction Helper

File: `src/shared/utils/stockHelper.ts`

**Implements STOCK-MANAGEMENT-STRATEGY.MD:**

```typescript
/**
 * Atomic stock deduction using raw SQL
 * Prevents race conditions in concurrent orders
 */
export const stockHelper = {
  /**
   * Deduct stock atomically (single SQL operation)
   * Returns true if successful, false if insufficient stock
   */
  async deductStockAtomic(
    sequelize: Sequelize,
    dishId: string,
    quantity: number,
    transaction: Transaction
  ): Promise<boolean> {
    const [affectedRows] = await sequelize.query(
      `UPDATE dishes 
       SET stock = stock - :quantity, version = version + 1 
       WHERE id = :dishId AND stock >= :quantity`,
      {
        replacements: { dishId, quantity },
        transaction,
      }
    );

    return affectedRows > 0;
  },

  /**
   * Restore stock on cancellation
   */
  async restoreStock(
    sequelize: Sequelize,
    dishId: string,
    quantity: number,
    transaction: Transaction
  ): Promise<void> {
    await sequelize.query(
      `UPDATE dishes 
       SET stock = stock + :quantity, version = version + 1 
       WHERE id = :dishId`,
      {
        replacements: { dishId, quantity },
        transaction,
      }
    );
  },

  /**
   * Check stock without deducting
   */
  async checkStock(
    sequelize: Sequelize,
    dishId: string,
    requiredQuantity: number
  ): Promise<number> {
    const result = await sequelize.query('SELECT stock FROM dishes WHERE id = :dishId', {
      replacements: { dishId },
      type: QueryTypes.SELECT,
    });

    const row = result[0] as { stock: number } | undefined;
    return row?.stock ?? 0;
  },
};
```

#### 3.5.5 Optimistic Lock Helper

File: `src/shared/utils/optimisticLock.ts`

```typescript
/**
 * Verify version hasn't changed (optimistic locking)
 * Used for dishes to prevent concurrent updates
 */
export function checkVersion(currentVersion: number, expectedVersion: number): void {
  if (currentVersion !== expectedVersion) {
    throw new ConflictError(
      'VERSION_MISMATCH',
      'Resource has been modified. Please refresh and retry.'
    );
  }
}
```

---

### 3.6 TypeScript Types & Interfaces

**Objective:** Define all shared types for compile-time safety

#### 3.6.1 User Types

File: `src/shared/types/user.ts`

```typescript
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

export interface UserDTO extends Omit<UserAttributes, 'password'> {
  role?: RoleType;
}

export interface CreateUserInput {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  role: RoleType;
  restaurantId?: string;
}
```

#### 3.6.2 Order Types

File: `src/shared/types/order.ts`

```typescript
export interface OrderAttributes {
  id: string;
  userId: string;
  restaurantId: string;
  cartId?: string;
  status: OrderStatusType;
  paymentStatus: (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];
  paymentMethod?: (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];
  totalAmount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface OrderItemAttributes {
  id: string;
  orderId: string;
  dishId: string;
  dishName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderInput {
  cartId: string;
  paymentMethod: (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];
  notes?: string;
}
```

#### 3.6.3 Pagination Types

File: `src/shared/types/pagination.ts`

```typescript
export interface PaginationQuery {
  limit?: number;
  offset?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export const PAGINATION_DEFAULTS = {
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  DEFAULT_OFFSET: 0,
};

export function validatePagination(limit?: number, offset?: number) {
  const validLimit = Math.min(
    limit || PAGINATION_DEFAULTS.DEFAULT_LIMIT,
    PAGINATION_DEFAULTS.MAX_LIMIT
  );
  const validOffset = Math.max(offset || PAGINATION_DEFAULTS.DEFAULT_OFFSET, 0);
  return { limit: validLimit, offset: validOffset };
}
```

---

### 3.7 Integration with Express

**Objective:** Wire up middleware and error handling in app.ts

#### 3.7.1 Updated app.ts

```typescript
import { errorHandler } from '@shared/middleware/errorHandler';
import { authenticateJWT } from '@shared/middleware/auth';
import { requireRole } from '@shared/middleware/authorization';

// ... existing middleware ...

// Error handler (MUST be last)
app.use(errorHandler);

// Export middleware for routes
export { authenticateJWT, requireRole };
```

---

## 🧪 Testing Strategy

### Unit Tests (60% of Phase 3)

**Test each component in isolation:**

```typescript
// errors.test.ts
describe('AppError', () => {
  it('should create error with correct properties', () => { ... });
  it('should preserve stack trace', () => { ... });
});

// JWT helper tests
describe('jwtHelper', () => {
  it('should sign valid token', () => { ... });
  it('should verify valid token', () => { ... });
  it('should throw on invalid token', () => { ... });
});

// Response formatter tests
describe('responseFormatter', () => {
  it('should format success response', () => { ... });
  it('should format error response', () => { ... });
  it('should include pagination info', () => { ... });
});
```

### Integration Tests (40% of Phase 3)

**Test middleware chains:**

```typescript
describe('Auth middleware', () => {
  it('should authenticate valid JWT', async () => { ... });
  it('should reject invalid JWT', async () => { ... });
  it('should reject expired token', async () => { ... });
});

describe('Error handler middleware', () => {
  it('should catch AppError and format response', async () => { ... });
  it('should catch unknown error and return 500', async () => { ... });
});
```

---

## ✅ Acceptance Criteria

Phase 3 is complete when:

- [ ] All 40+ error codes implemented with correct HTTP status mapping
- [ ] 8+ domain-specific error classes working correctly
- [ ] Success/error response formatters with proper structure
- [ ] Pagination helper with limit/offset validation
- [ ] 6+ middleware functions (error handler, auth, authorization, validation, logging, rate limiting)
- [ ] 10+ utility functions (JWT, bcrypt, UUID, slug, stock helper, etc.)
- [ ] 20+ TypeScript interfaces/types defined
- [ ] Constants module with roles, statuses, payment methods, etc.
- [ ] All error codes match API-ERROR-CODES.MD taxonomy
- [ ] Middleware stack properly integrated in app.ts
- [ ] 80%+ test coverage for errors and utilities
- [ ] Zero TypeScript errors (`pnpm build`)
- [ ] Zero ESLint errors (`pnpm lint`)
- [ ] All unit tests pass (`pnpm test`)

---

## 📊 Effort Breakdown

| Task                      | Files        | Est. Time     | Priority        |
| ------------------------- | ------------ | ------------- | --------------- |
| 3.1 Error Handling        | 10 files     | 3 days        | ⭐⭐⭐ CRITICAL |
| 3.2 Response Helpers      | 2 files      | 1 day         | ⭐⭐⭐ CRITICAL |
| 3.3 Constants             | 5 files      | 1 day         | ⭐⭐ HIGH       |
| 3.4 Middleware            | 5 files      | 3 days        | ⭐⭐⭐ CRITICAL |
| 3.5 Utilities             | 6 files      | 3 days        | ⭐⭐⭐ CRITICAL |
| 3.6 Types                 | 4 files      | 2 days        | ⭐⭐ HIGH       |
| 3.7 Integration & Testing | -            | 3 days        | ⭐⭐⭐ CRITICAL |
| **TOTAL**                 | **32 files** | **2-3 weeks** |                 |

---

## 🚀 Continuation Plan

### Phase 3 → Phase 4 Handoff

Once Phase 3 completes, Phase 4 (Auth System) can begin because:

- ✅ Error handling is standardized
- ✅ Response formats are consistent
- ✅ JWT utilities are ready
- ✅ Bcrypt utilities are ready
- ✅ Authentication middleware is available

### Files Phase 4 Will Import from Phase 3

```typescript
// Phase 4 will use these Phase 3 exports:
import { UnauthorizedError, ConflictError } from '@shared/errors';
import { responseFormatter } from '@shared/utils/responseFormatter';
import { jwtHelper } from '@shared/utils/jwt';
import { bcryptHelper } from '@shared/utils/bcrypt';
import { authenticateJWT, requireRole } from '@shared/middleware';
import { ROLES } from '@shared/constants/roles';
```

---

## ⚠️ Common Pitfalls to Avoid

| Pitfall                     | Impact                            | Prevention                       |
| --------------------------- | --------------------------------- | -------------------------------- |
| Inconsistent error codes    | API clients can't parse errors    | Match API-ERROR-CODES.MD exactly |
| Missing HTTP status mapping | Wrong HTTP codes returned         | Use ERROR_HTTP_STATUS constant   |
| Middleware order incorrect  | Auth fails, error handler skipped | Error handler MUST be last       |
| Type `any` usage            | Type safety lost                  | Use proper TypeScript types      |
| Missing error tests         | Errors undetected in production   | Test all error classes           |
| Hard-coded strings          | Inconsistent responses            | Use constants for all enums      |

---

## 📚 Related Documents

- [API-ERROR-CODES.MD](./API-ERROR-CODES.MD) — Error taxonomy (match exactly)
- [STOCK-MANAGEMENT-STRATEGY.MD](./STOCK-MANAGEMENT-STRATEGY.MD) — Stock deduction implementation
- [DATABASE_DESIGN-V2.1.MD](./DATABASE_DESIGN-V2.1.MD) — Table structures for types
- [IMPLEMENTATION-CHECKLIST.MD](./IMPLEMENTATION-CHECKLIST.MD) — Full 15-phase roadmap
- [copilot-instructions.md](../.github/copilot-instructions.md) — Architecture & code standards

---

## 🎯 Success Metrics

By end of Phase 3:

✅ **Code Quality:** 0 TypeScript errors, 0 ESLint errors  
✅ **Test Coverage:** 80%+ coverage on shared infrastructure  
✅ **API Consistency:** All responses follow standard format  
✅ **Error Handling:** All 40+ error codes working with correct HTTP status  
✅ **Type Safety:** Full TypeScript coverage (no `any`)  
✅ **Documentation:** Every utility/middleware has JSDoc comments  
✅ **Patterns:** Reusable patterns ready for downstream phases

---

**Phase 3 is the foundation for all downstream work. Quality here prevents massive refactoring later.**
