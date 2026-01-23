/**
 * CartItemComponent
 *
 * Renderiza un item en el carrito
 * Muestra: imagen, nombre, precio, cantidad editable, subtotal, botón eliminar
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { CartItem } from '../../models/cart.model';

@Component({
  selector: 'app-cart-item',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="cart-item" *ngIf="item">
      <div class="cart-item__image">
        <img
          [src]="item.imageUrl"
          [alt]="item.name"
          class="cart-item__img"
        />
      </div>

      <div class="cart-item__info">
        <h3 class="cart-item__name">{{ item.name }}</h3>
        <p class="cart-item__price">\${{ item.price | number: '1.0-0' }}</p>
      </div>

      <div class="cart-item__quantity">
        <button
          class="cart-item__btn-qty"
          (click)="onDecrement()"
          [disabled]="item.quantity <= 1"
        >
          −
        </button>
        <input
          type="number"
          class="cart-item__input-qty"
          [value]="item.quantity"
          (change)="onQuantityChange($event)"
          min="1"
        />
        <button class="cart-item__btn-qty" (click)="onIncrement()">+</button>
      </div>

      <div class="cart-item__subtotal">
        <p class="cart-item__subtotal-label">Subtotal:</p>
        <p class="cart-item__subtotal-value">
          \${{ item.price * item.quantity | number: '1.0-0' }}
        </p>
      </div>

      <button
        class="cart-item__btn-remove"
        (click)="onRemove()"
        title="Eliminar del carrito"
      >
        🗑️
      </button>
    </div>
  `,
  styles: `
    .cart-item {
      display: grid;
      grid-template-columns: 80px 1fr 120px 100px 40px;
      gap: 16px;
      align-items: center;
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background: white;
      transition: box-shadow 0.3s;
    }

    .cart-item:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .cart-item__image {
      width: 80px;
      height: 80px;
      overflow: hidden;
      border-radius: 4px;
      background: #f5f5f5;
    }

    .cart-item__img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .cart-item__info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .cart-item__name {
      font-size: 14px;
      font-weight: 600;
      color: #2c3e50;
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .cart-item__price {
      font-size: 13px;
      color: #7f8c8d;
      margin: 0;
    }

    .cart-item__quantity {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #f9f9f9;
      padding: 4px;
      border-radius: 4px;
    }

    .cart-item__btn-qty {
      width: 28px;
      height: 28px;
      border: 1px solid #ddd;
      background: white;
      cursor: pointer;
      border-radius: 2px;
      font-weight: 600;
      transition: background 0.2s;
    }

    .cart-item__btn-qty:hover:not(:disabled) {
      background: #e8f5e9;
    }

    .cart-item__btn-qty:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .cart-item__input-qty {
      width: 40px;
      text-align: center;
      border: none;
      background: transparent;
      font-weight: 600;
      font-size: 14px;
    }

    .cart-item__input-qty::-webkit-outer-spin-button,
    .cart-item__input-qty::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    .cart-item__subtotal {
      display: flex;
      flex-direction: column;
      gap: 4px;
      text-align: right;
    }

    .cart-item__subtotal-label {
      font-size: 12px;
      color: #7f8c8d;
      margin: 0;
    }

    .cart-item__subtotal-value {
      font-size: 14px;
      font-weight: 700;
      color: #2c3e50;
      margin: 0;
    }

    .cart-item__btn-remove {
      width: 32px;
      height: 32px;
      border: 1px solid #ffcccc;
      background: #fff5f5;
      cursor: pointer;
      border-radius: 4px;
      font-size: 14px;
      transition: background 0.2s;
    }

    .cart-item__btn-remove:hover {
      background: #ffebee;
    }

    @media (max-width: 768px) {
      .cart-item {
        grid-template-columns: 60px 1fr;
        gap: 12px;
      }

      .cart-item__info {
        grid-column: 2;
      }

      .cart-item__quantity,
      .cart-item__subtotal,
      .cart-item__btn-remove {
        grid-column: 1 / -1;
      }

      .cart-item__quantity {
        justify-content: flex-start;
      }

      .cart-item__subtotal {
        text-align: left;
        flex-direction: row;
        justify-content: space-between;
      }
    }
  `,
})
export class CartItemComponent {
  @Input() item: CartItem | null = null;
  @Output() quantityChanged = new EventEmitter<number>();
  @Output() removed = new EventEmitter<void>();

  onIncrement(): void {
    if (this.item) {
      this.quantityChanged.emit(this.item.quantity + 1);
    }
  }

  onDecrement(): void {
    if (this.item && this.item.quantity > 1) {
      this.quantityChanged.emit(this.item.quantity - 1);
    }
  }

  onQuantityChange(event: any): void {
    const value = parseInt(event.target.value, 10);
    if (value > 0) {
      this.quantityChanged.emit(value);
    }
  }

  onRemove(): void {
    this.removed.emit();
  }
}
