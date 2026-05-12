/**
 * Response formatter utilities
 */

export interface ErrorDetail {
  code: string;
  field?: string;
  message: string;
}

export interface PaginationInfo {
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
}

export interface SuccessResponse<T> {
  success: true;
  message?: string;
  data: T;
  pagination?: PaginationInfo;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: ErrorDetail[];
}

/**
 * Response formatters for use in controllers
 */
export const responseFormatter = {
  /**
   * Format success response
   */
  success<T>(data: T, message = 'Success', pagination?: PaginationInfo): SuccessResponse<T> {
    return {
      success: true,
      message,
      data,
      ...(pagination && { pagination }),
    };
  },

  /**
   * Format error response
   */
  error(message: string, errors?: ErrorDetail[]): ErrorResponse {
    return {
      success: false,
      message,
      ...(errors && errors.length > 0 && { errors }),
    };
  },

  /**
   * Format created response (201)
   */
  created<T>(data: T, message = 'Created'): SuccessResponse<T> {
    return this.success(data, message);
  },

  /**
   * Format paginated response
   */
  paginated<T>(
    items: T[],
    total: number,
    limit: number,
    offset: number,
    message = 'Success'
  ): SuccessResponse<T[]> {
    return this.success(items, message, {
      limit,
      offset,
      total,
      hasMore: offset + limit < total,
    });
  },
};
