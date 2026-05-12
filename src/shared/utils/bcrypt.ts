// @ts-expect-error - bcryptjs has built-in types
import bcrypt from 'bcryptjs';
import { securityConfig } from '@config/index';

/**
 * Bcrypt password hashing utilities
 */
export const bcryptHelper = {
  /**
   * Hash password
   */
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, securityConfig.bcryptRounds);
  },

  /**
   * Compare password with hash
   */
  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },
};
