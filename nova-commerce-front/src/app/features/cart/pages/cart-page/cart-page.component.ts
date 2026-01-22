/**
 * CartPageComponent
 *
 * Página principal del carrito
 * Muestra lista de items y resumen
 */

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartFacade } from '../../services/cart.facade';
import { CartItemComponent } from '../../components/cart-item/cart-item.component';
import { CartSummaryComponent } from '../../components/cart-summary/cart-summary.component';
import { CheckoutModalComponent } from '../../components/checkout-modal/checkout-modal.component';
import { CartItem } from '../../models/cart.model';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CartItemComponent,
    CartSummaryComponent,
    CheckoutModalComponent,
  ],
  template: `
    <div class="cart-page">
      <div class="cart-page__header">
        <h1 class="cart-page__title">Carrito de Compras</h1>
      </div>

      <ng-container *ngIf="(isEmpty$ | async); else cartContent">
        <div class="cart-page__empty">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="cart-page__empty-icon"
          >
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <p class="cart-page__empty-title">Tu carrito está vacío</p>
          <p class="cart-page__empty-desc">
            Explora nuestros productos y comienza a comprar
          </p>
          <a [routerLink]="['/products']" class="cart-page__empty-btn">
            Ver Productos
          </a>
        </div>
      </ng-container>

      <ng-template #cartContent>
        <div class="cart-page__container">
          <div class="cart-page__items">
            <div
              *ngFor="let item of items$ | async"
              key="item.productId"
            >
              <app-cart-item
                [item]="item"
                (quantityChanged)="onQuantityChanged(item.productId, $event)"
                (removed)="onRemoveItem(item.productId)"
              ></app-cart-item>
            </div>
          </div>

          <app-cart-summary
            [totalItems]="(totalItems$ | async) ?? 0"
            [totalAmount]="(totalAmount$ | async) ?? 0"
            [isLoading]="isCheckoutLoading"
            (checkout)="onOpenCheckoutModal()"
          ></app-cart-summary>
        </div>
      </ng-template>

      <!-- Checkout Modal -->
      <app-checkout-modal
        [isOpen]="isCheckoutModalOpen"
        [items]="currentItems"
        [totalAmount]="currentTotalAmount"
        (close)="onCloseCheckoutModal()"
        (confirm)="onConfirmCheckout($event)"
      ></app-checkout-modal>
    </div>
  `,
  styles: `
    .cart-page {
      min-height: calc(100vh - 200px);
      background: #f5f7fa;
      padding: 20px;
    }

    .cart-page__header {
      max-width: 1200px;
      margin: 0 auto 30px;
    }

    .cart-page__title {
      font-size: 32px;
      font-weight: 700;
      color: #2c3e50;
      margin: 0;
    }

    .cart-page__empty {
      max-width: 400px;
      margin: 60px auto;
      text-align: center;
      padding: 40px 20px;
      background: white;
      border-radius: 8px;
    }

    .cart-page__empty-icon {
      width: 80px;
      height: 80px;
      color: #bdc3c7;
      margin-bottom: 20px;
    }

    .cart-page__empty-title {
      font-size: 20px;
      font-weight: 600;
      color: #2c3e50;
      margin: 0 0 10px;
    }

    .cart-page__empty-desc {
      color: #7f8c8d;
      margin: 0 0 30px;
    }

    .cart-page__empty-btn {
      display: inline-block;
      background: #3498db;
      color: white;
      padding: 12px 24px;
      border-radius: 4px;
      text-decoration: none;
      font-weight: 600;
      transition: background 0.3s;
    }

    .cart-page__empty-btn:hover {
      background: #2980b9;
    }

    .cart-page__container {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: 30px;
    }

    .cart-page__items {
      background: white;
      border-radius: 8px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    @media (max-width: 768px) {
      .cart-page {
        padding: 16px;
      }

      .cart-page__title {
        font-size: 24px;
      }

      .cart-page__container {
        grid-template-columns: 1fr;
        gap: 20px;
      }
    }
  `,
})
export class CartPageComponent implements OnInit {
  private readonly cartFacade = inject(CartFacade);
  private readonly router = inject(Router);

  items$ = this.cartFacade.items$;
  totalItems$ = this.cartFacade.totalItems$;
  totalAmount$ = this.cartFacade.totalAmount$;
  isEmpty$ = this.cartFacade.isEmpty$;

  isCheckoutLoading = false;
  isCheckoutModalOpen = false;
  currentItems: CartItem[] = [];
  currentTotalAmount = 0;

  ngOnInit(): void {
    // Suscribirse a cambios del carrito para tener datos actualizados
    this.items$.subscribe(items => this.currentItems = items);
    this.totalAmount$.subscribe(amount => this.currentTotalAmount = amount);
  }

  onQuantityChanged(productId: string, quantity: number): void {
    this.cartFacade.updateQuantity(productId, quantity);
  }

  onRemoveItem(productId: string): void {
    this.cartFacade.removeItem(productId);
  }

  onOpenCheckoutModal(): void {
    this.isCheckoutModalOpen = true;
  }

  onCloseCheckoutModal(): void {
    this.isCheckoutModalOpen = false;
  }

  onConfirmCheckout(checkoutData: any): void {
    this.isCheckoutModalOpen = false;
    this.isCheckoutLoading = true;
    try {
      this.cartFacade.checkout(checkoutData);
      // Navegar a la página de confirmación de orden
      setTimeout(() => {
        this.isCheckoutLoading = false;
        this.router.navigate(['/orders/create']);
      }, 500); // Reducido de 1000ms a 500ms
    } catch (error) {
      console.error('Error during checkout:', error);
      this.isCheckoutLoading = false;
    }
  }
}
