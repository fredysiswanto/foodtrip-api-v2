---
name: error-handling-implementation
user-invocable: true
description: "Use when: implementing standardized error handling, creating custom error classes, setting up error middleware, mapping error codes to HTTP status, validating error responses match API-ERROR-CODES.MD. Provides error taxonomy, response formats, and implementation patterns."
---

# Error Handling Implementation

Implement standardized error handling using 40+ error codes from API-ERROR-CODES.MD.

## Error Taxonomy (v2.1)

All errors must follow a **standardized hierarchy** and **response format**.

### Error Codes by Category

#### Authentication & Authorization (401, 403)

- `UNAUTHORIZED` — Missing or invalid JWT token
- `INVALID_CREDENTIALS` — Wrong email/password
- `TOKEN_EXPIRED` — Access token expired
- `REFRESH_TOKEN_INVALID` — Refresh token invalid or expired
- `FORBIDDEN` — Authenticated but insufficient permissions
- `INSUFFICIENT_PERMISSIONS` — Role doesn't allow action

#### Validation Errors (400)

- `INVALID_REQUEST` — Malformed request body
- `INVALID_EMAIL` — Invalid email format
- `INVALID_PHONE` — Invalid phone format
- `INVALID_PASSWORD` — Password too weak
- `MISSING_REQUIRED_FIELD` — Required field missing
- `INVALID_ENUM_VALUE` — Invalid enum value
- `DUPLICATE_EMAIL` — Email already registered
- `DUPLICATE_PHONE` — Phone already registered

#### Resource Errors (404)

- `NOT_FOUND` — Resource doesn't exist
- `USER_NOT_FOUND` — User doesn't exist
- `RESTAURANT_NOT_FOUND` — Restaurant doesn't exist
- `DISH_NOT_FOUND` — Dish doesn't exist
- `ORDER_NOT_FOUND` — Order doesn't exist
- `CART_ITEM_NOT_FOUND` — Cart item doesn't exist

#### Business Logic Errors (400, 409, 422)

- `INSUFFICIENT_STOCK` — Not enough dishes available
- `EMPTY_CART` — Cannot order from empty cart
- `INVALID_RESTAURANT_STATUS` — Restaurant not ACTIVE
- `INVALID_ORDER_STATUS` — Cannot perform action on order status
- `INVALID_PAYMENT_METHOD` — Payment method not supported
- `DUPLICATE_ORDER` — Order already placed
- `INVALID_QUANTITY` — Quantity must be > 0
- `INVALID_PRICE` — Price must be >= 0

#### Rate Limiting (429)

- `RATE_LIMIT_EXCEEDED` — Too many requests

#### Server Errors (500, 503)

- `INTERNAL_ERROR` — Unexpected server error
- `DATABASE_ERROR` — Database operation failed
- `SERVICE_UNAVAILABLE` — Service temporarily unavailable
- `STORAGE_ERROR` — File storage operation failed

---

## Error Response Format

### Standard Error Response

```json
{
  "success": false,
  "message": "One or more errors occurred",
  "errors": [
    {
      "code": "INVALID_EMAIL",
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "code": "INVALID_PASSWORD",
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

### Single Error Response

```json
{
  "success": false,
  "message": "Not enough stock",
  "errors": [
    {
      "code": "INSUFFICIENT_STOCK",
      "field": "stock",
      "message": "Only 5 units available, requested 10"
    }
  ]
}
```

### HTTP Status Codes

| Status | Codes                                                                           | Meaning                            |
| ------ | ------------------------------------------------------------------------------- | ---------------------------------- |
| 400    | INVALID*\*, MISSING*_, DUPLICATE\__, INSUFFICIENT*STOCK, EMPTY_CART, INVALID*\* | Client error                       |
| 401    | UNAUTHORIZED, INVALID_CREDENTIALS, TOKEN_EXPIRED                                | Authentication failed              |
| 403    | FORBIDDEN, INSUFFICIENT_PERMISSIONS                                             | Authorization failed               |
| 404    | NOT_FOUND, \*\_NOT_FOUND                                                        | Resource not found                 |
| 409    | DUPLICATE\_\*                                                                   | Conflict (resource already exists) |
| 422    | INVALID\_\*\_STATUS                                                             | Unprocessable entity               |
| 429    | RATE_LIMIT_EXCEEDED                                                             | Too many requests                  |
| 500    | INTERNAL_ERROR, DATABASE_ERROR                                                  | Server error                       |
| 503    | SERVICE_UNAVAILABLE, STORAGE_ERROR                                              | Unavailable                        |

---

## Implementation

### 1. Base Error Class

```typescript
// src/common/errors/ApiError.ts

/**
 * Base error class for all API errors
 * Extends Error to maintain proper instanceof checks
 */
export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly field?: string,
  ) {
    super(message);
    this.name = "ApiError";
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * Convert error to API response format
   */
  toJSON() {
    return {
      code: this.code,
      field: this.field || null,
      message: this.message,
    };
  }
}
```

### 2. Custom Error Classes

```typescript
// src/common/errors/AuthenticationErrors.ts

export class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized") {
    super(401, "UNAUTHORIZED", message);
  }
}

export class InvalidCredentialsError extends ApiError {
  constructor() {
    super(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }
}

export class TokenExpiredError extends ApiError {
  constructor() {
    super(401, "TOKEN_EXPIRED", "Access token has expired");
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = "Forbidden") {
    super(403, "FORBIDDEN", message);
  }
}

// src/common/errors/ValidationErrors.ts

export class ValidationError extends ApiError {
  constructor(message: string, field?: string) {
    super(400, "INVALID_REQUEST", message, field);
  }
}

export class InvalidEmailError extends ApiError {
  constructor() {
    super(400, "INVALID_EMAIL", "Invalid email format", "email");
  }
}

export class InvalidPasswordError extends ApiError {
  constructor(reason?: string) {
    super(
      400,
      "INVALID_PASSWORD",
      reason ||
        "Password must be at least 8 characters with uppercase, lowercase, and number",
      "password",
    );
  }
}

export class DuplicateEmailError extends ApiError {
  constructor() {
    super(400, "DUPLICATE_EMAIL", "Email already registered", "email");
  }
}

export class MissingRequiredFieldError extends ApiError {
  constructor(fieldName: string) {
    super(400, "MISSING_REQUIRED_FIELD", `${fieldName} is required`, fieldName);
  }
}

// src/common/errors/ResourceErrors.ts

export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super(404, "NOT_FOUND", `${resource} not found`);
  }
}

export class UserNotFoundError extends ApiError {
  constructor() {
    super(404, "USER_NOT_FOUND", "User not found");
  }
}

export class RestaurantNotFoundError extends ApiError {
  constructor() {
    super(404, "RESTAURANT_NOT_FOUND", "Restaurant not found");
  }
}

export class DishNotFoundError extends ApiError {
  constructor() {
    super(404, "DISH_NOT_FOUND", "Dish not found");
  }
}

// src/common/errors/BusinessLogicErrors.ts

export class InsufficientStockError extends ApiError {
  constructor(available: number) {
    super(
      400,
      "INSUFFICIENT_STOCK",
      `Only ${available} units available`,
      "stock",
    );
  }
}

export class EmptyCartError extends ApiError {
  constructor() {
    super(400, "EMPTY_CART", "Cannot place order from empty cart");
  }
}

export class InvalidRestaurantStatusError extends ApiError {
  constructor(status: string) {
    super(400, "INVALID_RESTAURANT_STATUS", `Restaurant is ${status}`);
  }
}

export class InvalidOrderStatusError extends ApiError {
  constructor(action: string, currentStatus: string) {
    super(
      422,
      "INVALID_ORDER_STATUS",
      `Cannot ${action} order in ${currentStatus} status`,
    );
  }
}

// src/common/errors/RateLimitErrors.ts

export class RateLimitExceededError extends ApiError {
  constructor(retryAfter?: number) {
    super(
      429,
      "RATE_LIMIT_EXCEEDED",
      `Too many requests. Try again in ${retryAfter || 60} seconds`,
    );
  }
}

// src/common/errors/ServerErrors.ts

export class InternalServerError extends ApiError {
  constructor(originalError?: Error) {
    super(500, "INTERNAL_ERROR", "An unexpected error occurred");
    if (originalError) {
      console.error("Internal Server Error:", originalError);
    }
  }
}

export class DatabaseError extends ApiError {
  constructor(originalError?: Error) {
    super(500, "DATABASE_ERROR", "Database operation failed");
    if (originalError) {
      console.error("Database Error:", originalError);
    }
  }
}

export class ServiceUnavailableError extends ApiError {
  constructor() {
    super(503, "SERVICE_UNAVAILABLE", "Service temporarily unavailable");
  }
}
```

### 3. Error Middleware

```typescript
// src/common/middleware/errorHandler.ts

import { Request, Response, NextFunction } from "express";
import { ApiError } from "../errors/ApiError";
import logger from "../logger";

/**
 * Global error handling middleware
 * Catches all errors and returns standardized response
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Log the error
  logger.error({
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
  });

  // Handle API errors (our custom errors)
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      errors: [error.toJSON()],
    });
  }

  // Handle validation errors (Joi, etc.)
  if (error.name === "ValidationError") {
    const errors = (error as any).details.map((detail: any) => ({
      code: "INVALID_REQUEST",
      field: detail.path.join("."),
      message: detail.message,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors,
    });
  }

  // Handle unexpected errors
  return res.status(500).json({
    success: false,
    message: "An unexpected error occurred",
    errors: [
      {
        code: "INTERNAL_ERROR",
        field: null,
        message: "Internal server error",
      },
    ],
  });
}
```

### 4. Request Validation Middleware

```typescript
// src/common/middleware/validateRequest.ts

import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import {
  ValidationError,
  MissingRequiredFieldError,
  DuplicateEmailError,
  InvalidEmailError,
  InvalidPasswordError,
} from "../errors";

/**
 * Validate request body against schema
 */
export function validateRequest(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => {
        const message = detail.message;
        const field = detail.path[0] as string;

        // Convert Joi errors to API errors
        if (detail.type === "any.required") {
          return {
            code: "MISSING_REQUIRED_FIELD",
            field,
            message: `${field} is required`,
          };
        }

        if (detail.type === "string.email") {
          return {
            code: "INVALID_EMAIL",
            field,
            message: "Invalid email format",
          };
        }

        if (detail.type === "string.min") {
          return {
            code: "INVALID_PASSWORD",
            field,
            message: `${field} must be at least ${detail.context?.limit} characters`,
          };
        }

        return {
          code: "INVALID_REQUEST",
          field,
          message,
        };
      });

      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    req.body = value;
    next();
  };
}
```

### 5. Service Layer Error Handling

```typescript
// src/modules/users/services/AuthService.ts

export class AuthService {
  async register(email: string, password: string) {
    // Validate email format
    if (!this.isValidEmail(email)) {
      throw new InvalidEmailError();
    }

    // Validate password strength
    if (!this.isStrongPassword(password)) {
      throw new InvalidPasswordError(
        "Password must contain uppercase, lowercase, and number",
      );
    }

    // Check duplicate email
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new DuplicateEmailError();
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    return await this.userRepository.create({
      email,
      passwordHash: hashedPassword,
      role: "CUSTOMER",
    });
  }

  async login(email: string, password: string) {
    // Find user
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new InvalidCredentialsError();
    }

    // Generate tokens
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
    };
  }
}
```

### 6. Setup in Express App

```typescript
// src/app.ts

import express from "express";
import { errorHandler } from "./common/middleware/errorHandler";

const app = express();

// ... other middleware ...

app.use(express.json());

// ... routes ...

// Error handling middleware MUST be last
app.use(errorHandler);

export default app;
```

---

## Usage Examples

### In Controllers

```typescript
async createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await this.authService.register(
      req.body.email,
      req.body.password
    );

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    // All errors caught here and passed to errorHandler
    next(error);
  }
}
```

### In Services

```typescript
async createOrder(userId: string, items: any[]) {
  // Validate
  if (!items.length) {
    throw new EmptyCartError();
  }

  // Check stock
  for (const item of items) {
    const dish = await this.dishRepository.getById(item.dishId);
    if (!dish) {
      throw new DishNotFoundError();
    }
    if (dish.stock < item.quantity) {
      throw new InsufficientStockError(dish.stock);
    }
  }

  // Create order
  return await this.orderRepository.create(...);
}
```

---

## Testing Error Handling

```typescript
describe("OrderController - Error Handling", () => {
  it("should return INSUFFICIENT_STOCK error with correct format", async () => {
    const res = await request(app)
      .post("/api/v1/orders")
      .send({ restaurantId: "r1", items: [{ dishId: "d1", qty: 100 }] });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      success: false,
      message: "Only 5 units available",
      errors: [
        {
          code: "INSUFFICIENT_STOCK",
          field: "stock",
          message: "Only 5 units available",
        },
      ],
    });
  });

  it("should return INVALID_EMAIL error for bad email", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ email: "invalid", password: "Password123!" });

    expect(res.status).toBe(400);
    expect(res.body.errors[0].code).toBe("INVALID_EMAIL");
  });

  it("should return UNAUTHORIZED for missing token", async () => {
    const res = await request(app).get("/api/v1/profile");

    expect(res.status).toBe(401);
    expect(res.body.errors[0].code).toBe("UNAUTHORIZED");
  });
});
```

---

## Checklist

- [ ] All error classes extend ApiError
- [ ] Error codes match API-ERROR-CODES.MD
- [ ] HTTP status codes correct for each error
- [ ] Error response format consistent
- [ ] Error middleware setup in Express app
- [ ] Validation middleware in place
- [ ] Services throw appropriate errors
- [ ] Controllers pass errors to next()
- [ ] All error cases tested
- [ ] Logger configured for errors

---

## Usage in Chat

```
Implement error handling for Phase 4 (Auth):
- Create error classes (UnauthorizedError, InvalidCredentialsError, etc.)
- Setup error middleware
- Implement validation
- Test all error codes
```
