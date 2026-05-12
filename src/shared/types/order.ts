import { OrderStatusType } from '@shared/constants/orderStatus';
import { PaymentStatusType, PaymentMethodType } from '@shared/constants/payments';

/**
 * Order type definitions
 */
export interface OrderAttributes {
  id: string;
  userId: string;
  restaurantId: string;
  cartId?: string;
  status: OrderStatusType;
  paymentStatus: PaymentStatusType;
  paymentMethod?: PaymentMethodType;
  totalAmount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface OrderItemAttributes {
  id: string;
  orderId: string;
  dishId: string;
  dishName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderInput {
  cartId: string;
  paymentMethod: PaymentMethodType;
  notes?: string;
}
