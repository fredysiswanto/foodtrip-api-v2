/**
 * Role constants
 */
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  RESTO_ADMIN: 'RESTO_ADMIN',
  RESTO_STAFF: 'RESTO_STAFF',
  DRIVER: 'DRIVER',
  CUSTOMER: 'CUSTOMER',
} as const;

export type RoleType = (typeof ROLES)[keyof typeof ROLES];

/**
 * Role hierarchy for permission checks
 */
export const ROLE_HIERARCHY: Record<RoleType, number> = {
  [ROLES.SUPER_ADMIN]: 0, // highest
  [ROLES.RESTO_ADMIN]: 1,
  [ROLES.RESTO_STAFF]: 2,
  [ROLES.DRIVER]: 3,
  [ROLES.CUSTOMER]: 4, // lowest
};

/**
 * Role descriptions
 */
export const ROLE_DESCRIPTIONS: Record<RoleType, string> = {
  [ROLES.SUPER_ADMIN]: 'System administrator with full access',
  [ROLES.RESTO_ADMIN]: 'Restaurant owner/manager',
  [ROLES.RESTO_STAFF]: 'Restaurant staff (kitchen, counter)',
  [ROLES.DRIVER]: 'Delivery driver',
  [ROLES.CUSTOMER]: 'Regular customer',
};
