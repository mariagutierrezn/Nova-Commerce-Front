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
  imageUrl?: string;
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
  customerPhone?: string;
  shippingAddress?: string;
  paymentMethod?: string;
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
  customerPhone?: string;
  shippingAddress?: string;
  paymentMethod?: string;
  items: OrderItem[];
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  pageSize: number;
}

export interface DiscountPreviewRequest {
  customerId: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export interface DiscountPreviewResponse {
  subtotal: number;
  totalDiscount: number;
  total: number;
  discounts: {
    type: string;
    label: string;
    description: string;
    percentage: number;
    amount: number;
  }[];
}
