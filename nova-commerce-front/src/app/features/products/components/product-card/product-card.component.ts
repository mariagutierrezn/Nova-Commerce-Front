/**
 * ProductCardComponent — Tarjeta de producto para grid
 *
 * RESPONSABILIDADES:
 * • Mostrar información básica del producto
 * • Navegación al detalle
 * • Agregar producto al carrito
 * • Diseño responsive tipo marketplace
 *
 * ENTRADA:
 * @Input product: Product
 *
 * ARQUITECTURA:
 * Standalone component (sin NgModules)
 * Solo presentación, sin lógica de negocio
 * BEM para estilos
 */

import { Component, input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.model';
import { CartFacade } from '../../../cart/services/cart.facade';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  /**
   * Producto a mostrar en la tarjeta
   */
  product = input.required<Product>();

  @Output() addedToCart = new EventEmitter<void>();

  isAdding = false;

  constructor(
    private cartFacade: CartFacade,
    private router: Router
  ) {}

  /**
   * Navega al detalle del producto cuando se hace click en la tarjeta
   */
  onCardClick(): void {
    this.router.navigate(['/products', this.product().id]);
  }

  /**
   * Navega al detalle del producto
   */
  onViewDetails(event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/products', this.product().id]);
  }

  /**
   * Agrega el producto al carrito
   */
  onAddToCart(event: Event): void {
    event.stopPropagation();
    this.isAdding = true;
    try {
      const product = this.product();
      this.cartFacade.addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        imageUrl: product.imageUrl,
        categoryId: product.categoryId,
      });
      this.addedToCart.emit();
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      this.isAdding = false;
    }
  }
}
