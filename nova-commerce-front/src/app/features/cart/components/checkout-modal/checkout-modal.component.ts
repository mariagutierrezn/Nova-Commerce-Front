/**
 * CheckoutModalComponent
 *
 * Modal de confirmación de checkout
 * Permite editar: nombre, email, teléfono, dirección, método de pago
 * Los descuentos se calculan en el backend
 */

import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartItem } from '../../models/cart.model';
import { TokenService } from '../../../auth/services/token.service';

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
  @Input() isOpen = false;
  @Input() items: CartItem[] = [];
  @Input() totalAmount: number = 0;
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<CheckoutData>();

  private tokenService = inject(TokenService);

  customerId = '';
  
  // Datos editables del formulario
  checkoutData: CheckoutData = {
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    paymentMethod: 'Tarjeta de Crédito',
  };

  paymentMethods = [
    'Tarjeta de Crédito',
    'Tarjeta de Débito',
    'Nequi',
    'Daviplata',
    'Addi',
    'PSE',
  ];

  // Descuentos estimados (aproximados a las reglas del backend)
  estimatedDiscounts: Array<{label: string; description: string; amount: number; percentage: number}> = [];

  ngOnInit(): void {
    this.loadCustomerData();
    this.calculateEstimatedDiscounts();
  }

  loadCustomerData(): void {
    const token = this.tokenService.getAccessToken();
    if (token) {
      const payload = this.tokenService.decodeToken(token);
      const customerIdNum = this.tokenService.extractCustomerIdFromToken(token);
      
      this.customerId = customerIdNum ? String(customerIdNum) : 'No disponible';
      this.checkoutData.customerName = payload?.sub || 'Usuario';
      this.checkoutData.customerEmail = (payload as any)?.username || 'No disponible';
      this.checkoutData.customerPhone = (payload as any)?.phone || '';
      this.checkoutData.shippingAddress = 'Dirección predeterminada (editar)';
    }
  }

  calculateEstimatedDiscounts(): void {
    // Estimación basada en las reglas reales del backend
    // Los valores finales pueden variar ligeramente
    this.estimatedDiscounts = [];
    const subtotal = this.totalAmount;

    // Descuento de Fidelidad (5% aprox.)
    const loyaltyDiscount = subtotal * 0.05;
    if (loyaltyDiscount > 0) {
      this.estimatedDiscounts.push({
        label: 'Descuento de Fidelidad',
        description: '5% por ser cliente frecuente',
        amount: loyaltyDiscount,
        percentage: 5
      });
    }

    // Descuento de Temporada (15% aprox.)
    const seasonDiscount = subtotal * 0.15;
    if (seasonDiscount > 0) {
      this.estimatedDiscounts.push({
        label: 'Oferta de Temporada',
        description: '15% de descuento especial',
        amount: seasonDiscount,
        percentage: 15
      });
    }

    // Nota: Los descuentos reales se calculan en el backend según las reglas de negocio
  }

  getTotalDiscountEstimate(): number {
    return this.estimatedDiscounts.reduce((sum, d) => sum + d.amount, 0);
  }

  getFinalTotal(): number {
    return Math.max(0, this.totalAmount - this.getTotalDiscountEstimate());
  }

  onClose(): void {
    this.close.emit();
  }

  onConfirm(): void {
    this.confirm.emit(this.checkoutData);
  }
}
