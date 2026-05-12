import { PAGINATION_DEFAULTS } from '@shared/constants';

/**
 * Pagination type definitions
 */
export interface PaginationQuery {
  limit?: number;
  offset?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export const PAGINATION_RULES = {
  DEFAULT_LIMIT: PAGINATION_DEFAULTS.DEFAULT_LIMIT,
  MAX_LIMIT: PAGINATION_DEFAULTS.MAX_LIMIT,
  DEFAULT_OFFSET: PAGINATION_DEFAULTS.DEFAULT_OFFSET,
};
