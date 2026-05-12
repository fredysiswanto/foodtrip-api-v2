/**
 * Restaurant status constants
 */
export const RESTAURANT_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
} as const;

export type RestaurantStatusType = (typeof RESTAURANT_STATUS)[keyof typeof RESTAURANT_STATUS];

/**
 * Valid restaurant status transitions
 */
export const VALID_RESTAURANT_TRANSITIONS: Record<RestaurantStatusType, RestaurantStatusType[]> = {
  [RESTAURANT_STATUS.PENDING]: [RESTAURANT_STATUS.APPROVED, RESTAURANT_STATUS.SUSPENDED],
  [RESTAURANT_STATUS.APPROVED]: [RESTAURANT_STATUS.ACTIVE, RESTAURANT_STATUS.SUSPENDED],
  [RESTAURANT_STATUS.ACTIVE]: [RESTAURANT_STATUS.SUSPENDED],
  [RESTAURANT_STATUS.SUSPENDED]: [RESTAURANT_STATUS.ACTIVE],
};

/**
 * Check if restaurant status transition is valid
 */
export function isValidRestaurantTransition(
  from: RestaurantStatusType,
  to: RestaurantStatusType
): boolean {
  return VALID_RESTAURANT_TRANSITIONS[from].includes(to);
}
