import bcrypt from 'bcryptjs';
import { appConfig } from '@config/index';

/**
 * Bcrypt password hashing utilities
 */
export const bcryptHelper = {
  /**
   * Hash password
   */
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, appConfig.bcryptRounds);
  },

  /**
   * Compare password with hash
   */
  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },
};
