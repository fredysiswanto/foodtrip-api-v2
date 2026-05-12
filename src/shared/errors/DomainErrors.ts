import { AppError } from './AppError';

/**
 * Validation error (400)
 */
export class ValidationError extends AppError {
  constructor(message = 'Validation failed', field?: string) {
    super(400, 'INVALID_REQUEST', message, field);
  }
}

/**
 * Unauthorized error (401)
 */
export class UnauthorizedError extends AppError {
  constructor(code = 'UNAUTHORIZED', message = 'Unauthorized access') {
    super(401, code, message);
  }
}

/**
 * Forbidden error (403)
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', code = 'FORBIDDEN') {
    super(403, code, message);
  }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource.toUpperCase()}_NOT_FOUND`, `${resource} not found`);
  }
}

/**
 * Conflict error (409)
 */
export class ConflictError extends AppError {
  constructor(code: string, message: string, field?: string) {
    super(409, code, message, field);
  }
}

/**
 * Insufficient stock error (422)
 */
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

/**
 * Invalid status transition error (409)
 */
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

/**
 * Rate limit error (429)
 */
export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(429, 'RATE_LIMIT_EXCEEDED', message);
  }
}
