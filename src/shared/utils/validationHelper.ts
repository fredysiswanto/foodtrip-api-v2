import { ZodError } from 'zod';
import { ErrorDetail } from './responseFormatter';

/**
 * Validation error aggregator and helpers
 */

export class ValidationErrorAggregator {
  errors: ErrorDetail[] = [];

  /**
   * Add single validation error
   */
  addError(code: string, field: string, message: string): this {
    this.errors.push({ code, field, message });
    return this;
  }

  /**
   * Add multiple errors
   */
  addErrors(errors: ErrorDetail[]): this {
    this.errors.push(...errors);
    return this;
  }

  /**
   * Check if aggregator has any errors
   */
  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  /**
   * Get errors as JSON
   */
  toJSON(): ErrorDetail[] {
    return this.errors;
  }
}

/**
 * Convert Zod validation errors to API error format
 */
export function zodErrorsToDetails(error: ZodError): ErrorDetail[] {
  return error.errors.map((err) => ({
    code: err.code === 'invalid_type' ? 'INVALID_REQUEST' : 'INVALID_ENUM',
    field: err.path.join('.'),
    message: err.message,
  }));
}
