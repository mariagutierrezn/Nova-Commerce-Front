/**
 * CheckoutModalComponent - Versión 2.0
 * Modal moderno para confirmar checkout con descuentos reales del backend
 */

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartItem } from '../../../features/cart/models/cart.model';
import { OrderService } from '../../../features/orders/services/order.service';
import type { DiscountPreviewResponse } from '../../../features/orders/models/order.model';

export interface CheckoutData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  paymentMethod: string;
}

@Component({
  selector: 'app-checkout-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout-modal.component.html',
  styleUrl: './checkout-modal.component.scss',
})
export class CheckoutModalComponent implements OnInit {
  @Input() items: CartItem[] = [];
  @Input() customerId!: string;
  @Output() confirm = new EventEmitter<CheckoutData>();
  @Output() cancel = new EventEmitter<void>();

  // Datos del formulario
  customerName: string = '';
  customerEmail: string = '';
  customerPhone: string = '';
  shippingAddress: string = '';
  paymentMethod: string = 'Tarjeta de Crédito';

  paymentMethods = [
    'Tarjeta de Crédito',
    'Tarjeta de Débito',
    'Nequi',
    'Daviplata',
    'Addi',
    'PSE',
  ];

  // Descuentos reales del backend
  discountPreview: DiscountPreviewResponse | null = null;
  loadingDiscounts = false;
  discountError: string | null = null;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadCustomerData();
    this.loadDiscountPreview();
  }

  /**
   * Carga los datos del cliente desde el token JWT
   */
  private loadCustomerData(): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.customerName = payload.name || '';
        this.customerEmail = payload.email || payload.sub || '';
        this.customerPhone = payload.phone || '';
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  }

  /**
   * Carga el preview de descuentos reales desde el backend
   */
  private loadDiscountPreview(): void {
    if (!this.customerId || this.items.length === 0) {
      return;
    }

    this.loadingDiscounts = true;
    this.discountError = null;

    const request = {
      customerId: this.customerId,
      items: this.items.map(item => ({
        productId: String(item.productId),
        quantity: item.quantity,
        unitPrice: item.price,
      })),
    };

    this.orderService.getDiscountPreview(request).subscribe({
      next: (response: DiscountPreviewResponse) => {
        this.discountPreview = response;
        this.loadingDiscounts = false;
        console.log('✅ Descuentos reales cargados:', response);
      },
      error: (error: any) => {
        console.error('❌ Error al cargar descuentos:', error);
        this.discountError = 'No se pudieron calcular los descuentos';
        this.loadingDiscounts = false;
      },
    });
  }

  /**
   * Calcula el subtotal de los productos
   */
  getSubtotal(): number {
    if (this.discountPreview) {
      return this.discountPreview.subtotal;
    }
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  /**
   * Obtiene el total de descuentos
   */
  getTotalDiscount(): number {
    return this.discountPreview?.totalDiscount || 0;
  }

  /**
   * Calcula el total final
   */
  getFinalTotal(): number {
    if (this.discountPreview) {
      return this.discountPreview.total;
    }
    return this.getSubtotal();
  }

  /**
   * Valida el formulario
   */
  isFormValid(): boolean {
    return !!(
      this.customerName.trim() &&
      this.customerEmail.trim() &&
      this.customerPhone.trim() &&
      this.shippingAddress.trim() &&
      this.paymentMethod
    );
  }

  /**
   * Confirma el checkout
   */
  onConfirm(): void {
    if (!this.isFormValid()) {
      return;
    }

    const checkoutData: CheckoutData = {
      customerName: this.customerName.trim(),
      customerEmail: this.customerEmail.trim(),
      customerPhone: this.customerPhone.trim(),
      shippingAddress: this.shippingAddress.trim(),
      paymentMethod: this.paymentMethod,
    };

    this.confirm.emit(checkoutData);
  }

  /**
   * Cancela el checkout
   */
  onCancel(): void {
    this.cancel.emit();
  }
}
