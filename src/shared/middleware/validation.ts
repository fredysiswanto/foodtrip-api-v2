import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '@shared/errors';
import { zodErrorsToDetails } from '@shared/utils/validationHelper';

/**
 * Request validation middleware using Zod
 */
export function validate(schema: ZodSchema, source: 'body' | 'params' | 'query' = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const data = req[source as keyof Request];
      schema.parse(data);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = zodErrorsToDetails(error);
        const validationError = new ValidationError('Validation failed');
        // Attach errors for error handler middleware
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (validationError as any).details = errors;
        next(validationError);
        return;
      }
      next(error);
    }
  };
}
