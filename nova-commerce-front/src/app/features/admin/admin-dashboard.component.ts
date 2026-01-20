import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminProductFacade } from './products/admin-product.facade';
import { AdminOrderFacade } from './orders/admin-order.facade';

interface DashboardMetrics {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  ordersToday: number;
  averageOrderValue: number;
  pendingOrders: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <div class="dashboard__header">
        <h1 class="dashboard__title">Dashboard</h1>
        <p class="dashboard__subtitle">Resumen de tu negocio</p>
      </div>

      <!-- Métricas principales -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-card__icon metric-card__icon--blue">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </div>
          <div class="metric-card__content">
            <span class="metric-card__label">Total Órdenes</span>
            <span class="metric-card__value">{{ metrics.totalOrders }}</span>
            <span class="metric-card__change metric-card__change--positive">
              +{{ metrics.ordersToday }} hoy
            </span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-card__icon metric-card__icon--green">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div class="metric-card__content">
            <span class="metric-card__label">Ingresos Totales</span>
            <span class="metric-card__value">\${{ metrics.totalRevenue | number: '1.0-0' }}</span>
            <span class="metric-card__change metric-card__change--positive">
              \${{ metrics.averageOrderValue | number: '1.0-0' }} promedio
            </span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-card__icon metric-card__icon--purple">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            </svg>
          </div>
          <div class="metric-card__content">
            <span class="metric-card__label">Productos</span>
            <span class="metric-card__value">{{ metrics.totalProducts }}</span>
            <span class="metric-card__change">
              En catálogo
            </span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-card__icon metric-card__icon--orange">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div class="metric-card__content">
            <span class="metric-card__label">Órdenes Pendientes</span>
            <span class="metric-card__value">{{ metrics.pendingOrders }}</span>
            <span class="metric-card__change metric-card__change--warning">
              Requieren atención
            </span>
          </div>
        </div>
      </div>

      <!-- Acciones rápidas -->
      <div class="quick-actions">
        <h2 class="section-title">Acciones Rápidas</h2>
        <div class="actions-grid">
          <a routerLink="/admin/products/new" class="action-card">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Nuevo Producto</span>
          </a>

          <a routerLink="/admin/orders" class="action-card">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            <span>Ver Órdenes</span>
          </a>

          <a routerLink="/admin/customers" class="action-card">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>Clientes</span>
          </a>

          <a routerLink="/admin/discounts" class="action-card">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
              <line x1="7" y1="7" x2="7.01" y2="7"></line>
            </svg>
            <span>Descuentos</span>
          </a>
        </div>
      </div>

      <!-- Últimas órdenes -->
      <div class="recent-orders" *ngIf="recentOrders.length > 0">
        <h2 class="section-title">Órdenes Recientes</h2>
        <div class="orders-table">
          <div class="order-row order-row--header">
            <div>ID Orden</div>
            <div>Cliente</div>
            <div>Total</div>
            <div>Estado</div>
            <div>Fecha</div>
          </div>
          <div class="order-row" *ngFor="let order of recentOrders.slice(0, 5)">
            <div class="order-id">#{{ order.id.slice(-8) }}</div>
            <div>{{ order.customerId }}</div>
            <div class="order-total">\${{ order.totalAfterDiscount | number: '1.2-2' }}</div>
            <div>
              <span class="status-badge" [class]="'status-badge--' + order.status.toLowerCase()">
                {{ getStatusLabel(order.status) }}
              </span>
            </div>
            <div class="order-date">{{ order.createdAt | date: 'dd/MM/yy HH:mm' }}</div>
          </div>
        </div>
        <a routerLink="/admin/orders" class="view-all-link">Ver todas las órdenes →</a>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .dashboard__header {
      margin-bottom: 2rem;
    }

    .dashboard__title {
      font-size: 2rem;
      font-weight: 700;
      color: var(--admin-text);
      margin: 0 0 0.5rem;
    }

    .dashboard__subtitle {
      color: var(--admin-text-muted);
      margin: 0;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .metric-card {
      background: var(--admin-card-bg);
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      gap: 1rem;
      box-shadow: var(--admin-shadow);
      border: 1px solid var(--admin-border);
    }

    .metric-card__icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .metric-card__icon--blue { background: #3b82f633; color: #3b82f6; }
    .metric-card__icon--green { background: #10b98133; color: #10b981; }
    .metric-card__icon--purple { background: #8b5cf633; color: #8b5cf6; }
    .metric-card__icon--orange { background: #f59e0b33; color: #f59e0b; }

    .metric-card__content {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .metric-card__label {
      font-size: 0.875rem;
      color: var(--admin-text-muted);
      font-weight: 500;
    }

    .metric-card__value {
      font-size: 1.875rem;
      font-weight: 700;
      color: var(--admin-text);
    }

    .metric-card__change {
      font-size: 0.8rem;
      color: var(--admin-text-muted);
    }

    .metric-card__change--positive { color: #10b981; }
    .metric-card__change--warning { color: #f59e0b; }

    .section-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--admin-text);
      margin: 0 0 1.5rem;
    }

    .quick-actions {
      margin-bottom: 3rem;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .action-card {
      background: var(--admin-card-bg);
      border: 2px solid var(--admin-border);
      border-radius: 12px;
      padding: 2rem 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      text-decoration: none;
      color: var(--admin-text);
      transition: all 0.2s;
    }

    .action-card:hover {
      border-color: var(--admin-primary);
      transform: translateY(-2px);
      box-shadow: var(--admin-shadow);
    }

    .action-card svg {
      color: var(--admin-primary);
    }

    .action-card span {
      font-weight: 600;
      font-size: 1rem;
    }

    .recent-orders {
      background: var(--admin-card-bg);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: var(--admin-shadow);
    }

    .orders-table {
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--admin-border);
    }

    .order-row {
      display: grid;
      grid-template-columns: 150px 1fr 150px 150px 150px;
      padding: 1rem;
      gap: 1rem;
      align-items: center;
      border-bottom: 1px solid var(--admin-border);
    }

    .order-row:last-child {
      border-bottom: none;
    }

    .order-row--header {
      background: var(--admin-hover);
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--admin-text-muted);
    }

    .order-id {
      font-family: monospace;
      font-weight: 600;
      color: var(--admin-primary);
    }

    .order-total {
      font-weight: 600;
      color: var(--admin-text);
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-badge--created { background: #3b82f633; color: #3b82f6; }
    .status-badge--paid { background: #10b98133; color: #10b981; }
    .status-badge--shipped { background: #f59e0b33; color: #f59e0b; }
    .status-badge--completed { background: #8b5cf633; color: #8b5cf6; }

    .order-date {
      font-size: 0.875rem;
      color: var(--admin-text-muted);
    }

    .view-all-link {
      display: block;
      text-align: center;
      margin-top: 1rem;
      color: var(--admin-primary);
      text-decoration: none;
      font-weight: 600;
    }

    .view-all-link:hover {
      text-decoration: underline;
    }

    @media (max-width: 768px) {
      .metrics-grid {
        grid-template-columns: 1fr;
      }

      .order-row {
        grid-template-columns: 1fr;
        gap: 0.5rem;
      }

      .order-row--header {
        display: none;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private productFacade = inject(AdminProductFacade);
  private orderFacade = inject(AdminOrderFacade);

  metrics: DashboardMetrics = {
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    ordersToday: 0,
    averageOrderValue: 0,
    pendingOrders: 0
  };

  recentOrders: any[] = [];

  ngOnInit(): void {
    // Cargar productos y órdenes
    this.productFacade.loadProducts();
    this.orderFacade.loadOrders();

    // Suscribirse a los estados para calcular métricas
    this.productFacade.state$.subscribe((state: any) => {
      this.metrics.totalProducts = state.products?.length || 0;
    });

    this.orderFacade.state$.subscribe((state: any) => {
      const orders = state.orders || [];
      this.recentOrders = orders.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      this.metrics.totalOrders = orders.length;
      this.metrics.totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.totalAfterDiscount || 0), 0);
      this.metrics.averageOrderValue = this.metrics.totalOrders > 0 
        ? this.metrics.totalRevenue / this.metrics.totalOrders 
        : 0;
      
      // Órdenes pendientes (CREATED o PAID)
      this.metrics.pendingOrders = orders.filter((o: any) => 
        o.status === 'CREATED' || o.status === 'PAID'
      ).length;

      // Órdenes de hoy
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      this.metrics.ordersToday = orders.filter((o: any) => {
        const orderDate = new Date(o.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      }).length;
    });
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
}
