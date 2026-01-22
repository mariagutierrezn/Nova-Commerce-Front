/**
 * OrderDetailModalComponent
 * 
 * Modal moderno para mostrar detalles completos del pedido
 * Diseño innovador con glassmorphism y animaciones suaves
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order, Discount } from '../../models/order.model';

@Component({
  selector: 'app-order-detail-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="onClose()">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="modal-header__content">
            <h2 class="modal-title">📦 Detalles del Pedido</h2>
            <p class="modal-order-id" *ngIf="order">Orden #{{ getOrderIdShort(order.id) }}</p>
          </div>
          <button class="modal-close" (click)="onClose()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <!-- Estado y Fecha -->
          <div class="info-section">
            <div class="info-card">
              <span class="info-label">Estado</span>
              <span class="info-value" [ngClass]="'status--' + (order?.status | lowercase)">
                {{ getStatusLabel(order?.status || '') }}
              </span>
            </div>
            <div class="info-card">
              <span class="info-label">Fecha</span>
              <span class="info-value">{{ order?.createdAt | date: 'dd MMM yyyy, HH:mm' }}</span>
            </div>
          </div>

          <!-- Productos -->
          <div class="products-section">
            <h3 class="section-title">🛍️ Productos</h3>
            <div class="product-list">
              <div class="product-item" *ngFor="let item of order?.items">
                <div class="product-image">
                  <img 
                    *ngIf="item.imageUrl" 
                    [src]="item.imageUrl" 
                    [alt]="item.productName || item.name"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                  />
                  <div class="product-image-placeholder">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                  </div>
                </div>
                <div class="product-info">
                  <p class="product-name">{{ item.productName || item.name }}</p>
                  <p class="product-quantity">Cantidad: {{ item.quantity }} × {{ item.unitPrice | currency:'USD':'symbol':'1.0-0' }}</p>
                </div>
                <div class="product-total">
                  {{ item.unitPrice * item.quantity | currency:'USD':'symbol':'1.0-0' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Descuentos Aplicados -->
          <div class="discounts-section" *ngIf="order?.discounts && (order?.discounts?.length ?? 0) > 0">
            <h3 class="section-title">🎁 Descuentos Aplicados</h3>
            <div class="discount-list">
              <div class="discount-item" *ngFor="let discount of order?.discounts">
                <div class="discount-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <div class="discount-info">
                  <p class="discount-type">{{ getDiscountLabel(discount.type) }}</p>
                  <p class="discount-percentage">{{ discount.percentage }}% de descuento</p>
                </div>
                <div class="discount-amount">
                  -{{ discount.amount | currency:'USD':'symbol':'1.0-0' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Resumen de Totales -->
          <div class="summary-section">
            <div class="summary-row">
              <span class="summary-label">Subtotal</span>
              <span class="summary-value">{{ order?.totalBeforeDiscount | currency:'USD':'symbol':'1.0-0' }}</span>
            </div>
            <div class="summary-row" *ngIf="(order?.discountTotal || 0) > 0">
              <span class="summary-label discount">Descuento Total</span>
              <span class="summary-value discount">-{{ order?.discountTotal | currency:'USD':'symbol':'1.0-0' }}</span>
            </div>
            <div class="summary-row summary-row--total">
              <span class="summary-label">Total Pagado</span>
              <span class="summary-value total">{{ order?.totalAfterDiscount | currency:'USD':'symbol':'1.0-0' }}</span>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn--primary" (click)="onClose()">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  `,
  styles: `
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.3s ease;
      padding: 20px;
      overflow-y: auto;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .modal-container {
      background: white;
      border-radius: 20px;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
      max-width: 700px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes slideUp {
      from {
        transform: translateY(50px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 20px 20px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      position: relative;
      overflow: hidden;
    }

    .modal-header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      animation: pulse 4s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
        opacity: 0.5;
      }
      50% {
        transform: scale(1.1);
        opacity: 0.8;
      }
    }

    .modal-header__content {
      position: relative;
      z-index: 1;
    }

    .modal-title {
      font-size: 1.75rem;
      font-weight: 800;
      margin: 0 0 8px;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    }

    .modal-order-id {
      font-size: 1rem;
      opacity: 0.95;
      margin: 0;
      font-weight: 500;
    }

    .modal-close {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;
      position: relative;
      z-index: 1;
    }

    .modal-close:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: rotate(90deg);
    }

    .modal-body {
      padding: 30px;
    }

    .info-section {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 30px;
    }

    .info-card {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      padding: 20px;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .info-label {
      font-size: 0.875rem;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-value {
      font-size: 1.125rem;
      font-weight: 700;
      color: #1e293b;
    }

    .status--created { color: #1e40af; }
    .status--paid { color: #065f46; }
    .status--shipped { color: #92400e; }
    .status--completed { color: #6b21a8; }

    .section-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 20px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .products-section {
      margin-bottom: 30px;
    }

    .product-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .product-item {
      display: grid;
      grid-template-columns: 80px 1fr auto;
      gap: 16px;
      padding: 16px;
      background: #f8fafc;
      border-radius: 12px;
      align-items: center;
      transition: all 0.3s;
    }

    .product-item:hover {
      background: #f1f5f9;
      transform: translateX(4px);
    }

    .product-image {
      width: 80px;
      height: 80px;
      border-radius: 10px;
      overflow: hidden;
      background: white;
      position: relative;
    }

    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .product-image-placeholder {
      width: 100%;
      height: 100%;
      display: none;
      align-items: center;
      justify-content: center;
      color: #cbd5e0;
      background: white;
    }

    .product-info {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .product-name {
      font-weight: 700;
      color: #1e293b;
      margin: 0;
      font-size: 1rem;
    }

    .product-quantity {
      font-size: 0.9rem;
      color: #64748b;
      margin: 0;
    }

    .product-total {
      font-size: 1.25rem;
      font-weight: 700;
      color: #667eea;
    }

    .discounts-section {
      margin-bottom: 30px;
      padding: 20px;
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border-radius: 12px;
    }

    .discount-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .discount-item {
      display: grid;
      grid-template-columns: 40px 1fr auto;
      gap: 16px;
      padding: 16px;
      background: white;
      border-radius: 10px;
      align-items: center;
    }

    .discount-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .discount-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .discount-type {
      font-weight: 700;
      color: #92400e;
      margin: 0;
      font-size: 1rem;
    }

    .discount-percentage {
      font-size: 0.875rem;
      color: #d97706;
      margin: 0;
    }

    .discount-amount {
      font-size: 1.125rem;
      font-weight: 700;
      color: #dc2626;
    }

    .summary-section {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      padding: 24px;
      border-radius: 12px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      font-size: 1rem;
    }

    .summary-label {
      color: #64748b;
      font-weight: 600;
    }

    .summary-value {
      color: #1e293b;
      font-weight: 700;
    }

    .summary-label.discount,
    .summary-value.discount {
      color: #ef4444;
    }

    .summary-row--total {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 2px solid #cbd5e0;
      font-size: 1.25rem;
    }

    .summary-value.total {
      color: #667eea;
      font-size: 1.5rem;
    }

    .modal-footer {
      padding: 20px 30px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .btn {
      padding: 14px 32px;
      border: none;
      border-radius: 10px;
      font-weight: 700;
      font-size: 1rem;
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
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
    }

    @media (max-width: 768px) {
      .modal-container {
        margin: 10px;
        max-height: 95vh;
      }

      .modal-header {
        padding: 20px;
      }

      .modal-title {
        font-size: 1.5rem;
      }

      .modal-body {
        padding: 20px;
      }

      .info-section {
        grid-template-columns: 1fr;
      }

      .product-item {
        grid-template-columns: 60px 1fr auto;
        gap: 12px;
      }

      .product-image {
        width: 60px;
        height: 60px;
      }

      .discount-item {
        grid-template-columns: 1fr;
        gap: 12px;
      }
    }
  `
})
export class OrderDetailModalComponent {
  @Input() order: Order | null = null;
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }

  getOrderIdShort(id: string | number): string {
    return id.toString().slice(-8);
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
      LOYALTY: '🎖️ Descuento de Fidelidad',
      PRODUCT: '🏷️ Descuento del Producto',
      SEASON: '🎉 Oferta de Temporada',
      FIRST_PURCHASE: '🎁 Primera Compra',
      OTHER: '💰 Descuento Especial'
    };
    return labels[type] || '💰 Descuento';
  }
}
