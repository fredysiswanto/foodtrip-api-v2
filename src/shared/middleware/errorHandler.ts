import { Request, Response, NextFunction } from 'express';
import logger from '@shared/utils/logger';
import { AppError } from '@shared/errors';
import { responseFormatter } from '@shared/utils/responseFormatter';

/**
 * Global error handler middleware (MUST be last in middleware stack)
 */
export function errorHandler(
  error: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
