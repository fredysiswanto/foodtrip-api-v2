import { PAGINATION_DEFAULTS } from '@shared/constants';

/**
 * Pagination validation and helpers
 */

export interface PaginationQuery {
  limit?: number;
  offset?: number;
}

export function validatePagination(
  limit?: number,
  offset?: number
): { limit: number; offset: number } {
  const validLimit = Math.min(
    limit || PAGINATION_DEFAULTS.DEFAULT_LIMIT,
    PAGINATION_DEFAULTS.MAX_LIMIT
  );
  const validOffset = Math.max(offset || PAGINATION_DEFAULTS.DEFAULT_OFFSET, 0);
  return { limit: validLimit, offset: validOffset };
}
