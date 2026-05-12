import { RoleType } from '@shared/constants/roles';

/**
 * User type definitions
 */
export interface UserAttributes {
  id: string;
  roleId: string;
  restaurantId?: string;
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  avatarId?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface UserDTO extends Omit<UserAttributes, 'password'> {
  role?: RoleType;
}

export interface CreateUserInput {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  role: RoleType;
  restaurantId?: string;
}
