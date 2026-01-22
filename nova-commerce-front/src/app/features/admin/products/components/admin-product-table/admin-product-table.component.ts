import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminProduct } from '../../admin-product.model';
import { AdminProductFacade } from '../../admin-product.facade';

@Component({
  selector: 'app-admin-product-table',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-product-table.component.html',
  styleUrls: ['./admin-product-table.component.scss'],
})
export class AdminProductTableComponent {
  @Input() products: AdminProduct[] = [];

  private readonly facade = inject(AdminProductFacade);

  // Imagen fallback usada cuando falla la carga
  fallbackImage = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22 font-family=%22sans-serif%22 font-size=%2212%22%3ENo Image%3C/text%3E%3C/svg%3E';

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement | null;
    if (target) {
      target.src = this.fallbackImage;
    }
  }

  deleteProduct(id: string, name: string) {
    if (confirm(`¿Estás seguro de que deseas eliminar "${name}"?`)) {
      this.facade.deleteProduct(id);
    }
  }

  /**
   * Calcula el precio con descuento basado en el precio original
   * El backend guarda el precio ORIGINAL, no el precio con descuento
   */
  calculateDiscountedPrice(originalPrice: number, discountPercentage: number | undefined): number {
    if (!discountPercentage) {
      return originalPrice;
    }
    return originalPrice * (1 - discountPercentage / 100);
  }
}
