/**
 * OrderHistoryComponent
 *
 * Página que muestra historial de órdenes del usuario
 * Carga órdenes al inicializar
 * Muestra estado, fecha, totales
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderFacade } from '../../services/order.facade';
import { OrderDetailModalComponent } from '../../components/order-detail-modal/order-detail-modal.component';
import { Order } from '../../models/order.model';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterModule, OrderDetailModalComponent],
  template: `
    <div class="order-history">
      <div class="order-history__header">
        <h1 class="order-history__title">📦 Mis Pedidos</h1>
        <p class="order-history__subtitle">Revisa el estado de tus órdenes</p>
      </div>

      <!-- Loading State -->
      <div class="order-history__loading" *ngIf="(facade.isLoading$ | async)">
        <div class="spinner"></div>
        <p>Cargando órdenes...</p>
      </div>

      <!-- Error State -->
      <div class="order-history__error" *ngIf="(facade.error$ | async) as error">
        <p>⚠️ {{ error }}</p>
        <button (click)="onRetry()" class="order-history__retry-btn">
          Reintentar
        </button>
      </div>

      <!-- Empty State -->
      <div class="order-history__empty" *ngIf="!(facade.isLoading$ | async) && (facade.orders$ | async)?.length === 0">
        <div class="empty-illustration">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </div>
        <p class="order-history__empty-text">Aún no has realizado ningún pedido</p>
        <a href="/products" class="order-history__empty-link">
          Explorar Productos
        </a>
      </div>

      <!-- Orders List -->
      <div class="order-history__grid">
        <div
          class="order-card"
          *ngFor="let order of (facade.orders$ | async)"
        >
          <div class="order-card__header">
            <div class="order-card__header-left">
              <h3 class="order-card__id">Orden #{{ order.id.toString().slice(-8) }}</h3>
              <span class="order-card__date">{{ order.createdAt | date: 'dd MMM yyyy, HH:mm' }}</span>
            </div>
            <span
              class="order-card__status"
              [ngClass]="'status--' + (order.status | lowercase)"
            >
              {{ getStatusLabel(order.status) }}
            </span>
          </div>

          <div class="order-card__items">
            <h4 class="order-card__items-title">Artículos ({{ order.items.length }})</h4>
            <div class="order-item" *ngFor="let item of order.items">
              <div class="order-item__image">
                <img 
                  *ngIf="item.imageUrl" 
                  [src]="item.imageUrl" 
                  [alt]="item.productName || item.name"
                  onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                />
                <div class="order-item__image-placeholder">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                </div>
              </div>
              <div class="order-item__details">
                <p class="order-item__name">{{ item.productName || item.name }}</p>
                <p class="order-item__quantity">Cantidad: {{ item.quantity }}</p>
              </div>
              <div class="order-item__price">
                {{ item.unitPrice * item.quantity | currency:'USD':'symbol':'1.0-0' }}
              </div>
            </div>
          </div>

          <div class="order-card__summary">
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>{{ order.totalBeforeDiscount | currency:'USD':'symbol':'1.0-0' }}</span>
            </div>
            <div class="summary-row" *ngIf="(order.discountTotal || 0) > 0">
              <span class="discount-text">Descuento:</span>
              <span class="discount-text">-{{ order.discountTotal | currency:'USD':'symbol':'1.0-0' }}</span>
            </div>
            <!-- Mostrar tipos de descuentos aplicados -->
            <div class="discount-types" *ngIf="order.discounts && order.discounts.length > 0">
              <div class="discount-badge" *ngFor="let discount of order.discounts">
                <span class="discount-icon">{{ getDiscountIcon(discount.type) }}</span>
                <span class="discount-label">{{ getDiscountLabel(discount.type) }}</span>
                <span class="discount-percentage">-{{ discount.percentage }}%</span>
              </div>
            </div>
            <div class="summary-row summary-row--total">
              <span>Total:</span>
              <span class="total-price">{{ order.totalAfterDiscount | currency:'USD':'symbol':'1.0-0' }}</span>
            </div>
          </div>

          <div class="order-card__actions">
            <button class="btn btn--secondary" (click)="viewOrderDetails(order)">
              Ver Detalles
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de Detalles -->
      <app-order-detail-modal
        [order]="selectedOrder"
        [isOpen]="isModalOpen"
        (close)="closeModal()"
      ></app-order-detail-modal>
    </div>
  `,
  styles: `
    .order-history {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }

    .order-history__header {
      margin-bottom: 40px;
      text-align: center;
      color: white;
    }

    .order-history__title {
      font-size: 2.5rem;
      font-weight: 800;
      margin: 0 0 12px;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    }

    .order-history__subtitle {
      font-size: 1.125rem;
      opacity: 0.95;
      margin: 0;
    }

    .order-history__loading,
    .order-history__error {
      text-align: center;
      padding: 60px 20px;
      background: white;
      border-radius: 16px;
      margin-bottom: 20px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    }

    .order-history__error {
      background: #fee;
      color: #c62828;
    }

    .order-history__retry-btn {
      margin-top: 20px;
      padding: 12px 32px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 1rem;
      transition: all 0.3s;
    }

    .order-history__retry-btn:hover {
      background: #764ba2;
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
    }

    .spinner {
      display: inline-block;
      width: 50px;
      height: 50px;
      border: 5px solid #f0f0f0;
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .order-history__empty {
      text-align: center;
      padding: 80px 20px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    }

    .empty-illustration {
      color: #cbd5e0;
      margin-bottom: 24px;
    }

    .order-history__empty-text {
      font-size: 1.25rem;
      color: #64748b;
      margin-bottom: 32px;
      font-weight: 500;
    }

    .order-history__empty-link {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 700;
      font-size: 1rem;
      transition: all 0.3s;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }

    .order-history__empty-link:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
    }

    .order-history__grid {
      display: grid;
      gap: 24px;
      margin-bottom: 32px;
    }

    .order-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
      transition: all 0.3s;
    }

    .order-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    }

    .order-card__header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e2e8f0;
    }

    .order-card__header-left {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .order-card__id {
      font-size: 1.05rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }

    .order-card__date {
      font-size: 0.9rem;
      color: #64748b;
    }

    .order-card__status {
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status--created { background: #dbeafe; color: #1e40af; }
    .status--paid { background: #d1fae5; color: #065f46; }
    .status--shipped { background: #fef3c7; color: #92400e; }
    .status--completed { background: #e9d5ff; color: #6b21a8; }

    .order-card__items-title {
      font-size: 1rem;
      font-weight: 600;
      color: #334155;
      margin: 0 0 16px;
    }

    .order-item {
      display: grid;
      grid-template-columns: 50px 1fr auto;
      gap: 12px;
      align-items: center;
      padding: 10px;
      background: #f8fafc;
      border-radius: 8px;
      margin-bottom: 8px;
    }

    .order-item__image {
      width: 60px;
      height: 60px;
      border-radius: 6px;
      overflow: hidden;
      background: white;
      position: relative;
    }

    .order-item__image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .order-item__image-placeholder {
      width: 100%;
      height: 100%;
      display: none;
      align-items: center;
      justify-content: center;
      color: #cbd5e0;
      background: #f8fafc;
    }

    .order-item__details {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .order-item__name {
      font-weight: 600;
      color: #1e293b;
      margin: 0;
      font-size: 0.95rem;
    }

    .order-item__quantity {
      font-size: 0.85rem;
      color: #64748b;
      margin: 0;
    }

    .order-item__price {
      font-weight: 700;
      color: #667eea;
      font-size: 1.1rem;
    }

    .order-card__summary {
      margin-top: 16px;
      padding: 16px;
      background: #f8fafc;
      border-radius: 10px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 0.9rem;
      color: #334155;
    }

    .summary-row--total {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 2px solid #e2e8f0;
      font-size: 1.05rem;
      font-weight: 700;
    }

    .total-price {
      color: #667eea;
      font-size: 1.3rem;
    }

    .discount-text {
      color: #ef4444;
      font-weight: 600;
    }

    .discount-types {
      margin-top: 12px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .discount-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      color: #92400e;
    }

    .discount-icon {
      font-size: 1rem;
    }

    .discount-label {
      font-weight: 600;
    }

    .discount-percentage {
      color: #dc2626;
      font-weight: 700;
    }

    .order-card__actions {
      display: flex;
      gap: 12px;
      margin-top: 16px;
    }

    .btn {
      flex: 1;
      padding: 12px 20px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn--primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }

    .btn--primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
    }

    .btn--secondary {
      background: white;
      color: #667eea;
      border: 2px solid #667eea;
    }

    .btn--secondary:hover {
      background: #f8fafc;
    }

    @media (max-width: 768px) {
      .order-history {
        padding: 24px 16px;
      }

      .order-history__title {
        font-size: 2rem;
      }

      .order-card {
        padding: 20px;
      }

      .order-item {
        grid-template-columns: 50px 1fr auto;
        gap: 12px;
      }

      .order-item__image {
        width: 50px;
        height: 50px;
      }

      .order-card__actions {
        flex-direction: column;
      }
    }
  `
})
export class OrderHistoryComponent implements OnInit {
  selectedOrder: Order | null = null;
  isModalOpen = false;

  constructor(public facade: OrderFacade) {
    // Suscribirse a los observables para debug
    this.facade.orders$.subscribe(orders => {
      console.log('📦 Órdenes recibidas en componente:', orders);
      console.log('📊 Total de órdenes:', orders?.length || 0);
    });
    
    this.facade.error$.subscribe(error => {
      if (error) {
        console.error('❌ Error en órdenes:', error);
      }
    });
  }

  ngOnInit(): void {
    console.log('🔄 Cargando órdenes del usuario...');
    this.facade.loadUserOrders();
  }

  onRetry(): void {
    this.facade.loadUserOrders();
  }

  onSelectOrder(order: any): void {
    this.facade.loadOrderById(order.id);
  }

  viewOrderDetails(order: Order): void {
    console.log('📋 Viendo detalles de orden:', order);
    this.selectedOrder = order;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedOrder = null;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      CREATED: 'Creada',
      PAID: 'Pagada',
      SHIPPED: 'Enviada',
      COMPLETED: 'Completada',
    };
    return labels[status] || status;
  }

  getDiscountLabel(type: string): string {
    const labels: Record<string, string> = {
      LOYALTY: 'Descuento de Fidelidad',
      PRODUCT: 'Descuento del Producto',
      SEASON: 'Oferta de Temporada',
      FIRST_PURCHASE: 'Primera Compra',
      OTHER: 'Descuento Especial'
    };
    return labels[type] || 'Descuento';
  }

  getDiscountIcon(type: string): string {
    const icons: Record<string, string> = {
      LOYALTY: '🎖️',
      PRODUCT: '🏷️',
      SEASON: '🎉',
    };
    return icons[type] || '💰';
  }
}
