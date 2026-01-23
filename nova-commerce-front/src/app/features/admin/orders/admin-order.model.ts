export type AdminOrderStatus = 'CREATED' | 'PAID' | 'SHIPPED' | 'COMPLETED';

export interface AdminOrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subTotal: number;
  productType?: string;
}

export interface AppliedDiscount {
  type: string;
  percentage: number;
  amount: number;
}

export interface AdminOrder {
  id: string;
  orderNumber: number;
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress?: string;
  paymentMethod?: string;
  status: AdminOrderStatus;
  totalBeforeDiscount: number;
  discountTotal: number;
  totalAfterDiscount: number;
  createdAt: string;
  updatedAt: string;
  items: AdminOrderItem[];
  discounts?: AppliedDiscount[];
}
