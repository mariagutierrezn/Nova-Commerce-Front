import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminOrderFacade } from '../../admin-order.facade';

@Component({
  selector: 'app-admin-order-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-order-list.component.html',
  styleUrls: ['./admin-order-list.component.scss'],
})
export class AdminOrderListComponent implements OnInit {
  private readonly facade = inject(AdminOrderFacade);
  state$ = this.facade.state$;
  status: 'ALL' | 'CREATED' | 'PAID' | 'SHIPPED' | 'COMPLETED' = 'ALL';

  ngOnInit() {
    this.facade.loadOrders();
  }

  applyFilter() {
    // No llamar al backend, filtrar localmente
    // El backend no soporta filtro por query param
  }

  filteredOrders(orders: any[]) {
    if (this.status === 'ALL') {
      return orders;
    }
    return orders.filter(o => o.status === this.status);
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
