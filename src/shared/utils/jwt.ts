import jwt from 'jsonwebtoken';
import { jwtConfig } from '@config/index';
import { RoleType } from '@shared/constants/roles';
import { UnauthorizedError } from '@shared/errors';

/**
 * JWT payload interface
 */
export interface JWTPayload {
  id: string;
  email: string;
  role: RoleType;
  restaurantId?: string;
  iat: number;
  exp: number;
}

/**
 * JWT helper utilities
 */
export const jwtHelper = {
  /**
   * Sign JWT token
   */
  sign(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.accessTokenExpiry,
    });
  },

  /**
   * Verify JWT token
   */
  verify(token: string): JWTPayload {
    try {
      return jwt.verify(token, jwtConfig.secret) as JWTPayload;
    } catch (error) {
      throw new UnauthorizedError('TOKEN_INVALID', 'Invalid or expired token');
    }
  },

  /**
   * Decode token without verification (for token inspection)
   */
  decode(token: string): JWTPayload {
    const decoded = jwt.decode(token) as JWTPayload | null;
    if (!decoded) {
      throw new UnauthorizedError('TOKEN_INVALID', 'Invalid token format');
    }
    return decoded;
  },

  /**
   * Check if token is expired
   */
  isExpired(token: string): boolean {
    try {
      const payload = this.decode(token);
      return Date.now() > payload.exp * 1000;
    } catch {
      return true;
    }
  },
};
