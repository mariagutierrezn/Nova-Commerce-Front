import { Component, OnInit, inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CustomerService, Customer } from '../../customer.service';

@Component({
  selector: 'app-admin-customer-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="admin-page">
      <div class="admin-page__header">
        <h1 class="admin-page__title">Gestión de Clientes</h1>
        <div class="admin-page__actions">
          <button class="btn btn--secondary" (click)="exportCustomers()">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Exportar
          </button>
        </div>
      </div>

      <div class="admin-card">
        <div class="admin-card__filters">
          <input 
            type="text" 
            class="admin-input" 
            placeholder="Buscar clientes..." 
            [(ngModel)]="searchTerm"
            (input)="filterCustomers()">
          
          <select class="admin-select" [(ngModel)]="statusFilter" (change)="filterCustomers()">
            <option value="">Todos los estados</option>
            <option value="ACTIVE">Activos</option>
            <option value="INACTIVE">Inactivos</option>
          </select>
        </div>

        <div class="admin-table-wrapper">
          <table class="admin-table">
            <thead>
              <tr>
                <th style="width: 35%;">Cliente</th>
                <th style="width: 40%;">Contacto</th>
                <th style="width: 15%;">Estado</th>
                <th style="width: 10%;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let customer of filteredCustomers">
                <td>
                  <div class="customer-info">
                    <div class="customer-avatar">{{ getCustomerInitial(customer) }}</div>
                    <div class="customer-details">
                      <div class="customer-name">{{ getCustomerName(customer) }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="customer-contact">
                    <div class="contact-email">{{ customer.email }}</div>
                    <div class="contact-phone">{{ customer.phone || 'N/A' }}</div>
                  </div>
                </td>
                <td>
                  <span class="badge" [class.badge--success]="customer.status === 'ACTIVE'" 
                        [class.badge--danger]="customer.status !== 'ACTIVE'">
                    {{ customer.status === 'ACTIVE' ? 'ACTIVO' : 'INACTIVO' }}
                  </span>
                </td>
                <td>
                  <div class="admin-table__actions">
                    <button 
                      class="btn-icon" 
                      [class.btn-icon--active]="customer.status === 'ACTIVE'"
                      [class.btn-icon--inactive]="customer.status !== 'ACTIVE'"
                      (click)="toggleCustomerStatus(customer)" 
                      [title]="customer.status === 'ACTIVE' ? 'Desactivar cliente' : 'Activar cliente'">
                      <svg *ngIf="customer.status === 'ACTIVE'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 11 12 14 22 4"></polyline>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                      </svg>
                      <svg *ngIf="customer.status !== 'ACTIVE'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="admin-card__empty" *ngIf="filteredCustomers.length === 0">
          No se encontraron clientes
        </p>
      </div>
    </div>
  `,
  styles: [`
    .admin-page {
      padding: 2rem;
    }

    .admin-page__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .admin-page__title {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--admin-text);
    }

    .admin-card {
      background: var(--admin-card-bg);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: var(--admin-shadow);
    }

    .admin-card__filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .admin-input, .admin-select {
      padding: 0.75rem 1rem;
      border: 1px solid var(--admin-border);
      border-radius: 8px;
      background: var(--admin-input-bg);
      color: var(--admin-text);
      font-size: 0.9rem;
    }

    .admin-input {
      flex: 1;
    }

    .admin-select {
      min-width: 200px;
    }

    .admin-table-wrapper {
      overflow-x: auto;
    }

    .admin-table {
      width: 100%;
      border-collapse: collapse;
    }

    .admin-table th {
      text-align: left;
      padding: 1rem;
      font-weight: 600;
      color: var(--admin-text-muted);
      border-bottom: 2px solid var(--admin-border);
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .admin-table td {
      padding: 1rem;
      border-bottom: 1px solid var(--admin-border);
      color: var(--admin-text);
    }

    .customer-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .customer-avatar {
      width: 36px;
      height: 36px;
      min-width: 36px;
      min-height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.95rem;
      flex-shrink: 0;
    }

    .customer-details {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .customer-name {
      font-weight: 600;
      font-size: 0.9rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .customer-contact {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .contact-email {
      font-size: 0.875rem;
      color: var(--admin-text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .contact-phone {
      font-size: 0.8rem;
      color: var(--admin-text-muted);
    }

    .text-center {
      text-align: center;
    }

    .badge {
      padding: 0.25rem 0.75rem;
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

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }

    .btn--secondary {
      background: var(--admin-card-bg);
      color: var(--admin-text);
      border: 1px solid var(--admin-border);
    }

    .btn--secondary:hover {
      background: var(--admin-hover);
    }

    .btn-icon {
      background: transparent;
      border: none;
      cursor: pointer;
      color: var(--admin-text-muted);
      padding: 0.5rem;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .btn-icon:hover {
      background: var(--admin-hover);
      color: var(--admin-primary);
    }

    .btn-icon--active {
      color: #10b981;
    }

    .btn-icon--active:hover {
      background: #10b98120;
      color: #10b981;
    }

    .btn-icon--inactive {
      color: #ef4444;
    }

    .btn-icon--inactive:hover {
      background: #ef444420;
      color: #ef4444;
    }

    .admin-card__empty {
      text-align: center;
      padding: 3rem;
      color: var(--admin-text-muted);
    }

    .admin-table__actions {
      display: flex;
      gap: 0.5rem;
    }
  `]
})
export class AdminCustomerListComponent implements OnInit {
  private readonly customerService = inject(CustomerService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);

  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  searchTerm = '';
  statusFilter = '';
  loading = false;
  error: string | null = null;

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading = true;
    this.error = null;
    
    this.customerService.getAllCustomers().subscribe({
      next: (customers) => {
        console.log('📦 Clientes cargados:', customers);
        // Asegurar que siempre se tenga un array válido
        this.customers = customers || [];
        this.filteredCustomers = [...this.customers];
        this.loading = false;
        // Forzar actualización del DOM
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('❌ Error cargando clientes:', err);
        this.error = 'Error al cargar clientes';
        this.loading = false;
        this.customers = [];
        this.filteredCustomers = [];
        this.cdr.markForCheck();
      }
    });
  }

  filterCustomers(): void {
    this.filteredCustomers = this.customers.filter(customer => {
      const fullName = this.getCustomerName(customer);
      const matchesSearch = fullName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           customer.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = !this.statusFilter || customer.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
    // Forzar actualización después del filtro
    this.cdr.markForCheck();
  }

  getCustomerName(customer: Customer): string {
    return `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Sin nombre';
  }

  getCustomerInitial(customer: Customer): string {
    const name = this.getCustomerName(customer);
    return name.charAt(0).toUpperCase();
  }

  exportCustomers(): void {
    console.log('📤 Exportando clientes...');
    // Implementar lógica de exportación CSV/Excel
    const csvContent = this.generateCSV();
    this.downloadCSV(csvContent, 'clientes.csv');
  }

  toggleCustomerStatus(customer: Customer): void {
    // Prevenir múltiples clicks
    if (this.loading) return;
    
    const newStatus = customer.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    
    // Actualización optimista
    const index = this.customers.findIndex(c => c.id === customer.id);
    if (index !== -1) {
      this.customers[index] = { ...this.customers[index], status: newStatus };
      this.filterCustomers();
      this.cdr.markForCheck();
    }
    
    // Enviar el objeto completo del cliente con el status actualizado
    const updatedCustomer = { ...customer, status: newStatus };
    
    this.customerService.updateCustomer(customer.id, updatedCustomer).subscribe({
      next: (updated) => {
        console.log('✅ Estado del cliente actualizado:', updated);
        // Actualizar con los datos del servidor
        const idx = this.customers.findIndex(c => c.id === customer.id);
        if (idx !== -1) {
          this.customers[idx] = updated;
          this.filterCustomers();
          this.cdr.markForCheck();
        }
      },
      error: (err) => {
        console.error('❌ Error actualizando estado del cliente:', err);
        // Revertir cambio optimista
        if (index !== -1) {
          this.customers[index] = customer;
          this.filterCustomers();
          this.cdr.markForCheck();
        }
        alert('Error al actualizar el estado del cliente');
      }
    });
  }

  private generateCSV(): string {
    const headers = ['ID', 'Nombre', 'Email', 'Teléfono', 'Pedidos', 'Total Gastado', 'Estado', 'Fecha Registro'];
    const rows = this.customers.map(c => [
      c.id,
      this.getCustomerName(c),
      c.email,
      c.phone || 'N/A',
      c.totalOrders || 0,
      c.totalSpent || 0,
      c.status,
      c.createdAt
    ]);

    return [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');
  }

  private downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}
