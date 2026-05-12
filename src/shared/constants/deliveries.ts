/**
 * Delivery status constants
 */
export const DELIVERY_STATUS = {
  UNASSIGNED: 'UNASSIGNED',
  ASSIGNED: 'ASSIGNED',
  PICKED_UP: 'PICKED_UP',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED',
} as const;

export type DeliveryStatusType = (typeof DELIVERY_STATUS)[keyof typeof DELIVERY_STATUS];

/**
 * Valid delivery status transitions
 */
export const VALID_DELIVERY_TRANSITIONS: Record<DeliveryStatusType, DeliveryStatusType[]> = {
  [DELIVERY_STATUS.UNASSIGNED]: [DELIVERY_STATUS.ASSIGNED],
  [DELIVERY_STATUS.ASSIGNED]: [DELIVERY_STATUS.PICKED_UP],
  [DELIVERY_STATUS.PICKED_UP]: [DELIVERY_STATUS.IN_TRANSIT],
  [DELIVERY_STATUS.IN_TRANSIT]: [DELIVERY_STATUS.DELIVERED, DELIVERY_STATUS.FAILED],
  [DELIVERY_STATUS.DELIVERED]: [],
  [DELIVERY_STATUS.FAILED]: [DELIVERY_STATUS.ASSIGNED],
};

/**
 * Check if delivery status transition is valid
 */
export function isValidDeliveryTransition(
  from: DeliveryStatusType,
  to: DeliveryStatusType
): boolean {
  return VALID_DELIVERY_TRANSITIONS[from].includes(to);
}
