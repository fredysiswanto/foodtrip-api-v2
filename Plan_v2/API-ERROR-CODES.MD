# API Error Code Taxonomy

Standardized error codes for all FoodTrip API responses. Clients use these to handle errors programmatically.

---

# Error Response Format

```json
{
  "success": false,
  "message": "Human-readable message",
  "errors": [
    {
      "code": "ERROR_CODE",
      "field": "fieldName",
      "message": "Field-specific message"
    }
  ]
}
```

### Example

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "code": "INVALID_EMAIL",
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "code": "INSUFFICIENT_STOCK",
      "field": "items[0].quantity",
      "message": "Only 5 units available for 'Nasi Goreng'"
    }
  ]
}
```

---

# Error Categories

## 4xx Client Errors

### 400 — Bad Request

| Code                   | Field      | HTTP | Description                             |
| ---------------------- | ---------- | ---- | --------------------------------------- |
| INVALID_REQUEST        | -          | 400  | Request format invalid                  |
| MISSING_REQUIRED_FIELD | fieldName  | 400  | Required field missing                  |
| INVALID_EMAIL          | email      | 400  | Email format invalid                    |
| INVALID_PHONE          | phone      | 400  | Phone format invalid                    |
| INVALID_URL            | url        | 400  | URL format invalid                      |
| INVALID_DATE           | date       | 400  | Date format invalid (expected ISO 8601) |
| INVALID_UUID           | id         | 400  | UUID format invalid                     |
| INVALID_ENUM           | fieldName  | 400  | Value not in allowed enum               |
| INVALID_JSON           | -          | 400  | JSON parsing failed                     |
| INVALID_PAGINATION     | page/limit | 400  | Invalid pagination params               |

### 401 — Unauthorized

| Code                | Field          | HTTP | Description               |
| ------------------- | -------------- | ---- | ------------------------- |
| UNAUTHORIZED        | -              | 401  | No/invalid auth token     |
| INVALID_CREDENTIALS | email/password | 401  | Login failed              |
| TOKEN_EXPIRED       | authorization  | 401  | JWT expired (use refresh) |
| TOKEN_INVALID       | authorization  | 401  | JWT invalid/tampered      |
| TOKEN_REVOKED       | authorization  | 401  | Refresh token revoked     |
| SESSION_EXPIRED     | -              | 401  | Session no longer valid   |

### 403 — Forbidden

| Code                     | Field         | HTTP | Description                    |
| ------------------------ | ------------- | ---- | ------------------------------ |
| FORBIDDEN                | -             | 403  | Access denied                  |
| INSUFFICIENT_PERMISSIONS | -             | 403  | User lacks required role       |
| OWNER_ONLY               | restaurant_id | 403  | Only resource owner can access |
| RESTAURANT_REQUIRED      | -             | 403  | User must belong to restaurant |

### 404 — Not Found

| Code                 | Field         | HTTP | Description            |
| -------------------- | ------------- | ---- | ---------------------- |
| NOT_FOUND            | resource      | 404  | Resource doesn't exist |
| USER_NOT_FOUND       | user_id       | 404  | User not found         |
| RESTAURANT_NOT_FOUND | restaurant_id | 404  | Restaurant not found   |
| DISH_NOT_FOUND       | dish_id       | 404  | Dish not found         |
| ORDER_NOT_FOUND      | order_id      | 404  | Order not found        |
| CART_NOT_FOUND       | cart_id       | 404  | Cart not found         |

### 409 — Conflict

| Code                     | Field    | HTTP | Description                      |
| ------------------------ | -------- | ---- | -------------------------------- |
| CONFLICT                 | -        | 409  | Resource state conflict          |
| DUPLICATE_EMAIL          | email    | 409  | Email already registered         |
| DUPLICATE_PHONE          | phone    | 409  | Phone already registered         |
| DUPLICATE_SLUG           | slug     | 409  | Slug already exists              |
| RESOURCE_ALREADY_EXISTS  | resource | 409  | Resource already exists          |
| INVALID_STATE_TRANSITION | status   | 409  | Cannot transition to this status |

### 422 — Unprocessable Entity (Business Logic)

| Code                          | Field             | HTTP | Description                                 |
| ----------------------------- | ----------------- | ---- | ------------------------------------------- |
| INSUFFICIENT_STOCK            | items[i].quantity | 422  | Not enough stock available                  |
| CART_EMPTY                    | cart_id           | 422  | Cannot checkout empty cart                  |
| INVALID_PAYMENT_METHOD        | payment_method    | 422  | Invalid payment method for restaurant       |
| MINIMUM_ORDER_NOT_MET         | total             | 422  | Order below minimum amount                  |
| RESTAURANT_CLOSED             | restaurant_id     | 422  | Restaurant not accepting orders             |
| DISH_UNAVAILABLE              | dish_id           | 422  | Dish not available                          |
| CART_HAS_DIFFERENT_RESTAURANT | restaurant_id     | 422  | Cart contains items from another restaurant |
| ORDER_CANNOT_CANCEL           | order_id          | 422  | Order in non-cancellable status             |
| DELIVERY_ALREADY_ASSIGNED     | order_id          | 422  | Delivery already assigned                   |
| DRIVER_UNAVAILABLE            | driver_id         | 422  | Driver not available                        |
| RESTAURANT_NOT_APPROVED       | restaurant_id     | 422  | Restaurant not approved yet                 |

### 429 — Too Many Requests

| Code                | Field | HTTP | Description                  |
| ------------------- | ----- | ---- | ---------------------------- |
| RATE_LIMIT_EXCEEDED | -     | 429  | Too many requests            |
| RATE_LIMIT_REACHED  | -     | 429  | Rate limit for auth endpoint |

---

## 5xx Server Errors

### 500 — Internal Server Error

| Code               | Field | HTTP | Description                    |
| ------------------ | ----- | ---- | ------------------------------ |
| INTERNAL_ERROR     | -     | 500  | Unexpected server error        |
| DATABASE_ERROR     | -     | 500  | Database operation failed      |
| TRANSACTION_FAILED | -     | 500  | Transaction rolled back        |
| UPLOAD_FAILED      | file  | 500  | File upload failed             |
| FILE_STORAGE_ERROR | path  | 500  | Could not save file to storage |

### 503 — Service Unavailable

| Code                 | Field | HTTP | Description              |
| -------------------- | ----- | ---- | ------------------------ |
| SERVICE_UNAVAILABLE  | -     | 503  | Service temporarily down |
| DATABASE_UNAVAILABLE | -     | 503  | Database connection lost |

---

# Validation Error Examples

## Email Validation

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "code": "INVALID_EMAIL",
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Multiple Validation Errors

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "code": "MISSING_REQUIRED_FIELD",
      "field": "full_name",
      "message": "Full name is required"
    },
    {
      "code": "INVALID_EMAIL",
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "code": "INVALID_PHONE",
      "field": "phone",
      "message": "Phone must be a valid number"
    }
  ]
}
```

---

# Business Logic Error Examples

## Insufficient Stock

```json
{
  "success": false,
  "message": "Cannot create order",
  "errors": [
    {
      "code": "INSUFFICIENT_STOCK",
      "field": "items[0].quantity",
      "message": "Only 5 units of 'Nasi Goreng' available, requested 8"
    }
  ]
}
```

## Invalid Status Transition

```json
{
  "success": false,
  "message": "Invalid operation",
  "errors": [
    {
      "code": "INVALID_STATE_TRANSITION",
      "field": "status",
      "message": "Cannot move order from DELIVERING to PENDING"
    }
  ]
}
```

## Authentication Error

```json
{
  "success": false,
  "message": "Authentication failed",
  "errors": [
    {
      "code": "INVALID_CREDENTIALS",
      "field": "email",
      "message": "Email or password is incorrect"
    }
  ]
}
```

## Authorization Error

```json
{
  "success": false,
  "message": "Access denied",
  "errors": [
    {
      "code": "INSUFFICIENT_PERMISSIONS",
      "field": "role",
      "message": "Only restaurant admin can manage menu"
    }
  ]
}
```

## Rate Limit

```json
{
  "success": false,
  "message": "Too many requests",
  "errors": [
    {
      "code": "RATE_LIMIT_EXCEEDED",
      "field": "-",
      "message": "Too many login attempts. Try again in 15 minutes."
    }
  ]
}
```

---

# Implementation Guide

## Error Class Hierarchy

```typescript
// shared/errors/AppError.ts
export class AppError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string,
    public field?: string,
    public details?: any,
  ) {
    super(message);
  }
}

// shared/errors/ValidationError.ts
export class ValidationError extends AppError {
  constructor(code: string, field: string, message: string) {
    super(code, 400, message, field);
  }
}

// shared/errors/BusinessLogicError.ts
export class InsufficientStockError extends AppError {
  constructor(message: string, field: string = "items") {
    super("INSUFFICIENT_STOCK", 422, message, field);
  }
}

export class InvalidStatusTransitionError extends AppError {
  constructor(from: string, to: string) {
    super(
      "INVALID_STATE_TRANSITION",
      409,
      `Cannot move from ${from} to ${to}`,
      "status",
    );
  }
}
```

## Error Handler Middleware

```typescript
// shared/middleware/error.middleware.ts
export const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.field
        ? [
            {
              code: err.code,
              field: err.field,
              message: err.message,
            },
          ]
        : [],
    });
  }

  // Multiple validation errors
  if (err.validationErrors && Array.isArray(err.validationErrors)) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.validationErrors.map((e) => ({
        code: e.code,
        field: e.field,
        message: e.message,
      })),
    });
  }

  // Unknown error
  logger.error("Unhandled error:", err);
  return res.status(500).json({
    success: false,
    message: "Internal server error",
    errors: [],
  });
};
```

## Usage in Service

```typescript
// modules/dishes/dishes.service.ts
async deductStock(dishId: UUID, quantity: number) {
  const dish = await this.dishRepository.findById(dishId);

  if (!dish) {
    throw new AppError(
      'DISH_NOT_FOUND',
      404,
      'Dish not found',
      'dish_id'
    );
  }

  if (dish.stock < quantity) {
    throw new InsufficientStockError(
      `Only ${dish.stock} units available`,
      'items[0].quantity'
    );
  }

  await this.dishRepository.deductStock(dishId, quantity);
}
```

---

# Client-Side Usage Example

```typescript
// Web/Mobile client
try {
  const response = await api.post("/api/v1/orders", payload);
  // Success
} catch (error) {
  if (error.response?.data?.errors) {
    const errors = error.response.data.errors;

    errors.forEach((err) => {
      switch (err.code) {
        case "INSUFFICIENT_STOCK":
          // Disable checkout, show "out of stock"
          break;
        case "RESTAURANT_CLOSED":
          // Show "restaurant closed" message
          break;
        case "RATE_LIMIT_EXCEEDED":
          // Show "too many attempts, try later"
          break;
        default:
        // Generic error message
      }
    });
  }
}
```

---

# Logging & Monitoring

Log all error codes for monitoring:

```typescript
// Frequency analysis
SELECT code, COUNT(*) as count FROM api_errors GROUP BY code ORDER BY count DESC;

// Track spikes
SELECT code, timestamp FROM api_errors WHERE timestamp > NOW() - INTERVAL 1 hour;
```

---

# Summary

- **4xx errors:** Client issues (validation, auth, business logic)
- **5xx errors:** Server issues (database, processing)
- Always include `code`, `field` (when applicable), and `message`
- Clients parse `code` for programmatic handling
- Humans read `message` for understanding

Use this taxonomy consistently across all endpoints.
