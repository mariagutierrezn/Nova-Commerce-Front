/**
 * ProductListComponent — Listado de productos con filtros
 *
 * RESPONSABILIDADES:
 * • Mostrar grid de productos paginado
 * • Permitir filtrado por categoría
 * • Gestionar loading y empty states
 * • Responsive design (4 cols desktop, 2 tablet, 1 mobile)
 *
 * ARQUITECTURA:
 * • Standalone component
 * • Consume ProductFacade únicamente
 * • Observable-first con async pipe
 * • Sin lógica de negocio (solo presentación)
 *
 * FLUJO:
 * 1. ngOnInit → facade.loadProducts() + facade.loadCategories()
 * 2. Template suscribe a products$, categories$, loading$
 * 3. Usuario filtra → onCategoryChange() → facade.loadProducts(filters)
 * 4. Grid se actualiza automáticamente
 */

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductFacade } from '../../services/product.facade';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ProductSkeletonComponent } from '../../components/product-skeleton/product-skeleton.component';
import { CategoryFilterComponent } from '../../components/category-filter/category-filter.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    ProductCardComponent,
    ProductSkeletonComponent,
    CategoryFilterComponent,
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent implements OnInit {
  /**
   * Facade de productos (inyectado con inject())
   */
  private readonly productFacade = inject(ProductFacade);
  private readonly route = inject(ActivatedRoute);

  /**
   * Observable de productos (del facade)
   */
  products$ = this.productFacade.products$;

  /**
   * Observable de categorías (del facade)
   */
  categories$ = this.productFacade.categories$;

  /**
   * Observable de loading state (del facade)
   */
  loading$ = this.productFacade.loading$;

  /**
   * Observable de errores (del facade)
   */
  error$ = this.productFacade.error$;

  /**
   * Observable del total de productos (para paginación futura)
   */
  total$ = this.productFacade.total$;

  /**
   * Categoría seleccionada actualmente
   */
  selectedCategoryId: string | null = null;

  /**
   * Término de búsqueda actual
   */
  searchTerm: string | null = null;

  ngOnInit(): void {
    // Leer parámetros de la URL (búsqueda y filtros)
    this.route.queryParams.subscribe(params => {
      this.searchTerm = params['search'] || null;
      const discountFilter = params['discount'];
      
      // Cargar productos con filtros
      const filters: any = {};
      
      if (this.searchTerm) {
        filters.name = this.searchTerm;
      }
      
      if (this.selectedCategoryId) {
        filters.categoryId = this.selectedCategoryId;
      }
      
      // Filtro de ofertas/descuentos
      if (discountFilter === 'true') {
        filters.hasDiscount = true;
        console.log('🏷️ Filtrando productos con descuento');
      }
      
      console.log('🔍 Cargando productos con filtros:', filters);
      this.productFacade.loadProducts(filters);
    });

    // Cargar categorías
    this.productFacade.loadCategories();
  }

  /**
   * Maneja el cambio de categoría
   * @param categoryId - ID de la categoría seleccionada (null = todas)
   */
  onCategoryChange(categoryId: string | null): void {
    this.selectedCategoryId = categoryId;

    const filters: any = {};
    if (categoryId) {
      filters.categoryId = categoryId;
    }
    if (this.searchTerm) {
      filters.name = this.searchTerm;
    }
    
    this.productFacade.loadProducts(filters);
  }

  /**
   * Recarga los productos (reintentar después de error)
   */
  retry(): void {
    const filters: any = {};
    if (this.searchTerm) {
      filters.name = this.searchTerm;
    }
    if (this.selectedCategoryId) {
      filters.categoryId = this.selectedCategoryId;
    }
    
    this.productFacade.loadProducts(filters);
  }
}
