import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Order } from '../../models/order.model';

/**
 * OrderConfirmationComponent
 * Muestra una tarjeta estética con los detalles de la orden creada
 */
@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-confirmation.component.html',
  styleUrl: './order-confirmation.component.scss',
})
export class OrderConfirmationComponent {
  @Input() order: Order | null = null;

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      CREATED: 'Creada',
      PAID: 'Pagada',
      SHIPPED: 'Enviada',
      COMPLETED: 'Completada',
      CANCELLED: 'Cancelada',
    };
    return labels[status] || status;
  }

  getDiscountLabel(type: string): string {
    const labels: Record<string, string> = {
      LOYALTY: 'Descuento por Lealtad',
      PRODUCT: 'Descuento del Producto',
      SEASON: 'Descuento de Temporada',
    };
    return labels[type] || type;
  }

  formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
