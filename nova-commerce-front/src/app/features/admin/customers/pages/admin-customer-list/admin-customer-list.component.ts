import { Component, OnInit, inject } from '@angular/core';
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
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>

        <div class="admin-table-wrapper">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Contacto</th>
                <th>Pedidos</th>
                <th>Total Gastado</th>
                <th>Estado</th>
                <th>Fecha Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let customer of filteredCustomers">
                <td>
                  <div class="customer-info">
                    <div class="customer-avatar">{{ getCustomerInitial(customer) }}</div>
                    <span class="customer-name">{{ getCustomerName(customer) }}</span>
                  </div>
                </td>
                <td>
                  <div class="customer-contact">
                    <div>{{ customer.email }}</div>
                    <div class="text-muted">{{ customer.phone || 'N/A' }}</div>
                  </div>
                </td>
                <td>{{ customer.totalOrders || 0 }}</td>
                <td>{{ customer.totalSpent || 0 | number: '1.2-2' }}</td>
                <td>
                  <span class="badge" [class.badge--success]="customer.status === 'active'" 
                        [class.badge--danger]="customer.status === 'inactive'">
                    {{ customer.status === 'active' ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td>{{ customer.createdAt | date: 'dd/MM/yyyy' }}</td>
                <td>
                  <div class="admin-table__actions">
                    <button class="btn-icon" [routerLink]="['/admin/customers', customer.id]" title="Ver detalles">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
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
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--admin-primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 1.1rem;
    }

    .customer-name {
      font-weight: 600;
    }

    .customer-contact .text-muted {
      font-size: 0.85rem;
      color: var(--admin-text-muted);
      margin-top: 0.25rem;
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
  private customerService = inject(CustomerService);

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
        this.customers = customers;
        this.filteredCustomers = [...this.customers];
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error cargando clientes:', err);
        this.error = 'Error al cargar clientes';
        this.loading = false;
        // Mantener array vacío en caso de error
        this.customers = [];
        this.filteredCustomers = [];
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
    document.body.removeChild(link);
  }
}
