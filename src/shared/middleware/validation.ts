import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '@shared/errors';
import { zodErrorsToDetails } from '@shared/utils/validationHelper';

/**
 * Request validation middleware using Zod
 */
export function validate(
  schema: ZodSchema,
  source: 'body' | 'params' | 'query' = 'body'
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = req[source];
      schema.parse(data);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = zodErrorsToDetails(error);
        const validationError = new ValidationError('Validation failed');
        // Attach errors for error handler middleware
        (validationError as any).details = errors;
        next(validationError);
        return;
      }
      next(error);
    }
  };
}
