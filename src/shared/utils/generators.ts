import { v4 as uuidv4 } from 'uuid';

/**
 * UUID and slug generators
 */

export const generators = {
  /**
   * Generate UUID v4
   */
  uuid(): string {
    return uuidv4();
  },

  /**
   * Generate slug from text
   * "The Quick Brown Fox" → "the-quick-brown-fox"
   */
  slug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },

  /**
   * Generate unique slug with timestamp suffix
   */
  uniqueSlug(text: string): string {
    const baseSlug = this.slug(text);
    const timestamp = Date.now().toString(36);
    return `${baseSlug}-${timestamp}`;
  },
};
