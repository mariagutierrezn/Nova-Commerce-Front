import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CustomerService, Customer } from '../../customer.service';

@Component({
  selector: 'app-admin-customer-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-page">
      <div class="admin-page__header">
        <div class="header-left">
          <button class="btn-back" (click)="goBack()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 class="admin-page__title">Detalles del Cliente</h1>
        </div>
      </div>

      <div *ngIf="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Cargando información del cliente...</p>
      </div>

      <div *ngIf="error" class="error-container">
        <p>{{ error }}</p>
        <button class="btn btn--primary" (click)="goBack()">Volver al listado</button>
      </div>

      <div *ngIf="customer && !loading" class="customer-detail-container">
        <!-- Card de Información Personal -->
        <div class="detail-card">
          <div class="detail-card__header">
            <h2>Información Personal</h2>
            <span class="badge" [class.badge--success]="customer.status === 'ACTIVE'" 
                  [class.badge--danger]="customer.status !== 'ACTIVE'">
              {{ customer.status === 'ACTIVE' ? 'ACTIVO' : 'INACTIVO' }}
            </span>
          </div>
          <div class="detail-card__content">
            <div class="customer-avatar-large">
              {{ getCustomerInitial(customer) }}
            </div>
            <div class="info-grid">
              <div class="info-item">
                <label>Nombre Completo</label>
                <p>{{ getCustomerName(customer) }}</p>
              </div>
              <div class="info-item">
                <label>Email</label>
                <p>{{ customer.email }}</p>
              </div>
              <div class="info-item">
                <label>Teléfono</label>
                <p>{{ customer.phone || 'No proporcionado' }}</p>
              </div>
              <div class="info-item">
                <label>ID de Usuario</label>
                <p>{{ customer.userId || 'N/A' }}</p>
              </div>
              <div class="info-item">
                <label>Fecha de Registro</label>
                <p>{{ customer.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
              </div>
              <div class="info-item" *ngIf="customer.updatedAt">
                <label>Última Actualización</label>
                <p>{{ customer.updatedAt | date:'dd/MM/yyyy HH:mm' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Card de Estadísticas -->
        <div class="detail-card">
          <div class="detail-card__header">
            <h2>Estadísticas de Compra</h2>
          </div>
          <div class="detail-card__content">
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon stat-icon--orders">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  </svg>
                </div>
                <div class="stat-content">
                  <label>Total de Pedidos</label>
                  <p class="stat-value">{{ customer.totalOrders || 0 }}</p>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon stat-icon--spent">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </div>
                <div class="stat-content">
                  <label>Total Gastado</label>
                  <p class="stat-value">{{ (customer.totalSpent || 0) | currency:'USD':'symbol':'1.0-0' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Card de Dirección (si existe) -->
        <div class="detail-card" *ngIf="customer.address">
          <div class="detail-card__header">
            <h2>Dirección</h2>
          </div>
          <div class="detail-card__content">
            <div class="info-grid">
              <div class="info-item" *ngIf="customer.address.street">
                <label>Calle</label>
                <p>{{ customer.address.street }}</p>
              </div>
              <div class="info-item" *ngIf="customer.address.city">
                <label>Ciudad</label>
                <p>{{ customer.address.city }}</p>
              </div>
              <div class="info-item" *ngIf="customer.address.state">
                <label>Estado/Provincia</label>
                <p>{{ customer.address.state }}</p>
              </div>
              <div class="info-item" *ngIf="customer.address.zipCode">
                <label>Código Postal</label>
                <p>{{ customer.address.zipCode }}</p>
              </div>
              <div class="info-item" *ngIf="customer.address.country">
                <label>País</label>
                <p>{{ customer.address.country }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-page {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .admin-page__header {
      margin-bottom: 2rem;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .btn-back {
      background: var(--admin-card-bg);
      border: 1px solid var(--admin-border);
      border-radius: 8px;
      padding: 0.5rem;
      cursor: pointer;
      color: var(--admin-text);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .btn-back:hover {
      background: var(--admin-hover);
      color: var(--admin-primary);
    }

    .admin-page__title {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--admin-text);
      margin: 0;
    }

    .loading-container,
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid var(--admin-border);
      border-top-color: var(--admin-primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-container {
      color: #ef4444;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn--primary {
      background: var(--admin-primary);
      color: white;
    }

    .btn--primary:hover {
      opacity: 0.9;
    }

    .customer-detail-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .detail-card {
      background: var(--admin-card-bg);
      border-radius: 12px;
      box-shadow: var(--admin-shadow);
      overflow: hidden;
    }

    .detail-card__header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--admin-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .detail-card__header h2 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--admin-text);
      margin: 0;
    }

    .detail-card__content {
      padding: 1.5rem;
    }

    .customer-avatar-large {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 2rem;
      margin: 0 auto 1.5rem;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .info-item label {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--admin-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-item p {
      font-size: 1rem;
      color: var(--admin-text);
      margin: 0;
      word-break: break-word;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      background: var(--admin-input-bg);
      border-radius: 8px;
      border: 1px solid var(--admin-border);
    }

    .stat-icon {
      width: 50px;
      height: 50px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .stat-icon--orders {
      background: #3b82f620;
      color: #3b82f6;
    }

    .stat-icon--spent {
      background: #10b98120;
      color: #10b981;
    }

    .stat-content {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .stat-content label {
      font-size: 0.875rem;
      color: var(--admin-text-muted);
    }

    .stat-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--admin-text);
      margin: 0;
    }

    .badge {
      padding: 0.35rem 0.85rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .badge--success {
      background: #10b98133;
      color: #10b981;
    }

    .badge--danger {
      background: #ef444433;
      color: #ef4444;
    }
  `]
})
export class AdminCustomerDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly customerService = inject(CustomerService);

  customer: Customer | null = null;
  loading = false;
  error: string | null = null;

  ngOnInit(): void {
    const customerId = this.route.snapshot.paramMap.get('id');
    if (customerId) {
      this.loadCustomerDetails(customerId);
    } else {
      this.error = 'ID de cliente no válido';
    }
  }

  loadCustomerDetails(id: string): void {
    this.loading = true;
    this.error = null;

    this.customerService.getCustomerById(id).subscribe({
      next: (customer) => {
        console.log('📦 Detalles del cliente cargados:', customer);
        this.customer = customer;
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error cargando detalles del cliente:', err);
        this.error = 'No se pudo cargar la información del cliente';
        this.loading = false;
      }
    });
  }

  getCustomerName(customer: Customer): string {
    return `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Sin nombre';
  }

  getCustomerInitial(customer: Customer): string {
    const name = this.getCustomerName(customer);
    return name.charAt(0).toUpperCase();
  }

  goBack(): void {
    this.router.navigate(['/admin/customers']);
  }
}
