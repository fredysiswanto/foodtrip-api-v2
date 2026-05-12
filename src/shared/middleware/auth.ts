import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '@shared/errors';
import { jwtHelper, JWTPayload } from '@shared/utils/jwt';

/**
 * JWT authentication middleware
 * Extracts token from Authorization header and verifies it
 */
export function authenticateJWT(
  req: Request & { user?: JWTPayload },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('UNAUTHORIZED', 'No authorization token provided');
    }

    const decoded = jwtHelper.verify(token);
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
}
