/**
 * CartSummaryComponent
 *
 * Resumen de totales del carrito
 * Muestra: total de items, subtotal, y botón de checkout
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cart-summary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cart-summary">
      <h3 class="cart-summary__title">Resumen del Carrito</h3>

      <div class="cart-summary__row">
        <span class="cart-summary__label">Items:</span>
        <span class="cart-summary__value">{{ totalItems }}</span>
      </div>

      <div class="cart-summary__row">
        <span class="cart-summary__label">Subtotal:</span>
        <span class="cart-summary__value">\${{ totalAmount | number: '1.0-0' }}</span>
      </div>

      <div class="cart-summary__divider"></div>

      <div class="cart-summary__row cart-summary__row--total">
        <span class="cart-summary__label">Total:</span>
        <span class="cart-summary__value">\${{ totalAmount | number: '1.0-0' }}</span>
      </div>

      <button
        class="cart-summary__btn-checkout"
        (click)="onCheckout()"
        [disabled]="isLoading"
      >
        <span *ngIf="!isLoading">Confirmar Compra</span>
        <span *ngIf="isLoading">Procesando...</span>
      </button>

      <p class="cart-summary__note">
        Los descuentos se aplicarán al confirmar la compra
      </p>
    </div>
  `,
  styles: `
    .cart-summary {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 20px;
      position: sticky;
      top: 20px;
    }

    .cart-summary__title {
      font-size: 18px;
      font-weight: 600;
      color: #2c3e50;
      margin: 0 0 16px;
    }

    .cart-summary__row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      font-size: 14px;
    }

    .cart-summary__label {
      color: #7f8c8d;
    }

    .cart-summary__value {
      font-weight: 600;
      color: #2c3e50;
    }

    .cart-summary__row--total {
      padding: 12px 0;
    }

    .cart-summary__row--total .cart-summary__label {
      font-weight: 700;
      color: #2c3e50;
      font-size: 16px;
    }

    .cart-summary__row--total .cart-summary__value {
      font-size: 16px;
      color: #27ae60;
    }

    .cart-summary__divider {
      height: 1px;
      background: #e0e0e0;
      margin: 12px 0;
    }

    .cart-summary__btn-checkout {
      width: 100%;
      padding: 12px;
      margin-top: 16px;
      background: #27ae60;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.3s;
    }

    .cart-summary__btn-checkout:hover:not(:disabled) {
      background: #229954;
    }

    .cart-summary__btn-checkout:disabled {
      background: #95a5a6;
      cursor: not-allowed;
      opacity: 0.7;
    }

    .cart-summary__note {
      font-size: 12px;
      color: #7f8c8d;
      margin: 12px 0 0;
      text-align: center;
    }

    @media (max-width: 768px) {
      .cart-summary {
        position: relative;
        top: auto;
        margin-top: 20px;
      }

      .cart-summary__btn-checkout {
        padding: 14px;
        font-size: 16px;
      }
    }
  `,
})
export class CartSummaryComponent {
  @Input() totalItems: number = 0;
  @Input() totalAmount: number = 0;
  @Input() isLoading: boolean = false;
  @Output() checkout = new EventEmitter<void>();

  onCheckout(): void {
    this.checkout.emit();
  }
}
