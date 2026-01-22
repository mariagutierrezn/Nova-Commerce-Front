import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdminOrderFacade } from '../../admin-order.facade';

@Component({
  selector: 'app-admin-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-order-detail.component.html',
  styleUrls: ['./admin-order-detail.component.scss'],
})
export class AdminOrderDetailComponent implements OnInit {
  private readonly facade = inject(AdminOrderFacade);
  private readonly route = inject(ActivatedRoute);
  state$ = this.facade.state$;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.facade.loadOrderById(id);
  }

  updateStatus(status: 'CREATED' | 'PAID' | 'SHIPPED' | 'COMPLETED') {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.facade.updateOrderStatus(id, status);
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

  getDiscountTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      LOYALTY: 'Descuento por Lealtad',
      PRODUCT: 'Descuento de Producto',
      SEASON: 'Descuento de Temporada',
    };
    return labels[type] || type;
  }
}
