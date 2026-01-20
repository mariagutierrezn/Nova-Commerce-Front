/**
 * CartIconComponent
 *
 * Ícono de carrito para Header
 * Muestra badge con cantidad de items
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cart-icon',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <a [routerLink]="['/cart']" class="cart-icon">
      <svg
        class="cart-icon__svg"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </svg>

      <span
        *ngIf="itemCount > 0"
        class="cart-icon__badge"
        [class.cart-icon__badge--large]="itemCount >= 10"
      >
        {{ itemCount > 99 ? '99+' : itemCount }}
      </span>
    </a>
  `,
  styles: `
    .cart-icon {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: transparent;
      border-radius: var(--radius-md, 8px);
      color: var(--user-text-secondary, #64748b);
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      text-decoration: none;
    }

    .cart-icon:hover {
      background: var(--user-bg-secondary, #f8fafc);
      color: var(--user-text-primary, #1e293b);
      transform: translateY(-1px);
    }

    .cart-icon__svg {
      width: 20px;
      height: 20px;
      stroke-width: 2;
    }

    .cart-icon__badge {
      position: absolute;
      top: 4px;
      right: 4px;
      background: var(--user-primary, #3b82f6);
      color: #ffffff;
      border-radius: 50%;
      min-width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 700;
      line-height: 1;
      padding: 0 4px;
      box-shadow: 0 2px 6px rgba(59, 130, 246, 0.4);
      border: 2px solid #ffffff;
    }

    .cart-icon__badge--large {
      font-size: 9px;
      min-width: 20px;
      height: 20px;
    }

    @media (max-width: 768px) {
      .cart-icon {
        width: 36px;
        height: 36px;
      }

      .cart-icon__svg {
        width: 18px;
        height: 18px;
      }

      .cart-icon__badge {
        min-width: 16px;
        height: 16px;
        font-size: 9px;
      }
    }
  `,
})
export class CartIconComponent {
  @Input() itemCount: number = 0;
}
