import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '@shared/errors';
import { JWTPayload } from '@shared/utils/jwt';
import { RoleType, ROLE_HIERARCHY } from '@shared/constants/roles';

/**
 * Role-based authorization middleware
 */
export function requireRole(allowedRoles: RoleType[]) {
  return (req: Request & { user?: JWTPayload }, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new ForbiddenError('Insufficient permissions', 'INSUFFICIENT_PERMISSIONS');
      }

      const userRole = req.user.role as RoleType;
      if (!allowedRoles.includes(userRole)) {
        throw new ForbiddenError('Insufficient permissions', 'INSUFFICIENT_PERMISSIONS');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Check resource ownership
 */
export function requireOwnership(resourceField: string) {
  return (req: Request & { user?: JWTPayload }, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new ForbiddenError('Insufficient permissions', 'INSUFFICIENT_PERMISSIONS');
      }

      const resourceId = req.params[resourceField];
      if (req.user.id !== resourceId) {
        throw new ForbiddenError('Only resource owner can access', 'OWNER_ONLY');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Check if user role has minimum required level
 */
export function requireMinimumRole(minimumRole: RoleType) {
  return (req: Request & { user?: JWTPayload }, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new ForbiddenError('Insufficient permissions', 'INSUFFICIENT_PERMISSIONS');
      }

      const userRole = req.user.role as RoleType;
      if (ROLE_HIERARCHY[userRole] > ROLE_HIERARCHY[minimumRole]) {
        throw new ForbiddenError('Insufficient permissions', 'INSUFFICIENT_PERMISSIONS');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
