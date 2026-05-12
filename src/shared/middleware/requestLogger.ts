import { Request, Response, NextFunction } from 'express';
import logger from '@shared/utils/logger';

/**
 * Request logging middleware
 * Logs HTTP method and request path for every incoming request.
 */
export function requestLogger(req: Request, _res: Response, next: NextFunction): void {
  logger.info(`${req.method} ${req.path}`);
  next();
}
