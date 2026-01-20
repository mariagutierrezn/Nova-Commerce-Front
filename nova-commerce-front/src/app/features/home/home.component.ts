import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PublicProductService } from '../products/services/public-product.service';
import { Product } from '../products/models/product.model';

/**
 * HomeComponent
 *
 * Página de inicio (home) de la aplicación.
 * Muestra productos públicos sin requerir autenticación.
 * Punto de entrada principal cuando el usuario accede a la raíz.
 *
 * CARACTERÍSTICAS:
 * - Accesible sin autenticación (como Mercado Libre)
 * - Carga productos del endpoint público
 * - Diseño responsivo con hero section
 * - Grilla de productos con información básica
 *
 * ETAPA 7: Agregada visualización de productos públicos
 */
@Component({
  selector: 'nc-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly publicProductService = inject(PublicProductService);
  private readonly cdr = inject(ChangeDetectorRef);

  products: Product[] = [];
  loading = true;
  error: string | null = null;

  // SVG inline placeholder como fallback confiable
  readonly placeholderImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23f1f5f9" width="400" height="300"/%3E%3Ctext fill="%2394a3b8" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="18"%3ESin imagen%3C/text%3E%3C/svg%3E';

  // Carousel configuration
  currentSlide = 0;
  carouselSlides = [
    {
      title: '¡Bienvenido a NovaCommerce!',
      description: 'La mejor plataforma de e-commerce de América Latina',
      buttonText: 'Explorar Productos',
      buttonLink: '/products',
    },
    {
      title: 'Envíos Gratis',
      description: 'En compras superiores a $50.000',
      buttonText: 'Ver Ofertas',
      buttonLink: '/products',
    },
    {
      title: 'Productos Digitales',
      description: 'Descarga inmediata de tus compras',
      buttonText: 'Ver Catálogo Digital',
      buttonLink: '/products',
    },
    {
      title: 'Pago Seguro',
      description: 'Múltiples métodos de pago disponibles',
      buttonText: 'Más Información',
      buttonLink: '/products',
    },
    {
      title: 'Ofertas Especiales',
      description: 'Hasta 50% de descuento en productos seleccionados',
      buttonText: 'Ver Ofertas',
      buttonLink: '/products',
    },
  ];

  private carouselInterval: any;

  ngOnInit(): void {
    this.loadPublicProducts();
    this.startCarousel();
  }

  ngOnDestroy(): void {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }

  /**
   * Inicia el carrusel automático
   */
  private startCarousel(): void {
    this.carouselInterval = setInterval(() => {
      this.nextSlide();
      this.cdr.detectChanges();
    }, 5000); // Cambia cada 5 segundos
  }

  /**
   * Avanza al siguiente slide
   */
  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.carouselSlides.length;
  }

  /**
   * Retrocede al slide anterior
   */
  prevSlide(): void {
    this.currentSlide =
      (this.currentSlide - 1 + this.carouselSlides.length) %
      this.carouselSlides.length;
  }

  /**
   * Va a un slide específico
   */
  goToSlide(index: number): void {
    this.currentSlide = index;
  }

  /**
   * Obtiene la URL de la imagen del producto, usando placeholder si no existe o es inválida
   */
  getProductImageUrl(product: Product): string {
    // Si no hay imageUrl o es una cadena vacía o solo espacios, usar placeholder
    if (!product.imageUrl || product.imageUrl.trim() === '' || product.imageUrl.includes('placeholder-product.svg')) {
      return this.placeholderImage;
    }
    return product.imageUrl;
  }

  /**
   * Maneja error de carga de imagen
   * Usa SVG inline como fallback inmediato
   */
  onImageError(event: any): void {
    const target = event.target as HTMLImageElement;
    if (target && !target.src.includes('data:image')) {
      target.src = this.placeholderImage;
    }
  }

  /**
   * Carga los productos públicos del endpoint
   */
  private loadPublicProducts(): void {
    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();
    // Use microtask to ensure loading is true during initial change detection in tests
    this.publicProductService.getPublicProducts().subscribe({
      next: (products) => {
        // Always update on next microtask so loading remains true during initial change detection
        Promise.resolve().then(() => {
          console.log('Productos recibidos:', products);
          this.products = products;
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        Promise.resolve().then(() => {
          console.error('Error al cargar productos públicos:', err);
          this.error = 'No se pudieron cargar los productos. Intenta más tarde.';
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
    });
  }
}
