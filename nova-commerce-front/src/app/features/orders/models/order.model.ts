/**
 * Order Models
 *
 * Define interfaces para órdenes, items y descuentos
 * Alineadas con backend Spring Boot
 */

export interface OrderItem {
  id?: string;
  productId: string | number;
  productName?: string;
  name?: string;
  unitPrice: number;
  quantity: number;
  subtotal?: number;
  productType?: string | null;
}

export interface Discount {
  type: 'LOYALTY' | 'PRODUCT' | 'SEASON';
  percentage: number;
  amount: number;
}

export interface Order {
  id: string | number;
  customerId?: number;
  userId?: string;
  items: OrderItem[];
  totalBeforeDiscount: number;
  discountTotal?: number;
  totalAfterDiscount: number;
  discounts?: Discount[];
  status: 'CREATED' | 'PAID' | 'SHIPPED' | 'COMPLETED';
  createdAt: string;
  updatedAt?: string;
}

export interface CreateOrderRequest {
  customerId: string; // Backend espera String @NotNull
  items: OrderItem[];
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  pageSize: number;
}
