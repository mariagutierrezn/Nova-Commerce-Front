import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { PublicProductService } from '../products/services/public-product.service';
import { Product } from '../products/models/product.model';
import { CartFacade } from '../cart/services/cart.facade';

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
  private readonly router = inject(Router);
  private readonly cartFacade = inject(CartFacade);
  private bannerInterval: any;

  products: Product[] = [];
  featuredProducts: Product[] = [];
  loading = true;
  error: string | null = null;

  // Carrusel de imágenes del banner
  currentBannerIndex = 0;
  bannerImages: { url: string; alt?: string }[] = [
    { url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=200&fit=crop', alt: 'Oferta Computadores' },
    { url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&h=200&fit=crop', alt: 'Oferta Laptops' },
    { url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=200&fit=crop', alt: 'Oferta Tecnología' },
    { url: 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=400&h=200&fit=crop', alt: 'Oferta Accesorios' },
  ];

  readonly placeholderImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23f1f5f9" width="400" height="300"/%3E%3Ctext fill="%2394a3b8" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="18"%3ESin imagen%3C/text%3E%3C/svg%3E';


  ngOnInit(): void {
    this.loadBannerImages();
    this.loadPublicProducts();
    this.startBannerCarousel();
  }

  ngOnDestroy(): void {
    if (this.bannerInterval) {
      clearInterval(this.bannerInterval);
    }
  }

  loadBannerImages(): void {
    const stored = localStorage.getItem('bannerImages');
    if (stored) {
      const banners = JSON.parse(stored);
      // Transformar formato del admin al formato del home
      this.bannerImages = banners.map((b: any) => ({ url: b.url, alt: b.alt }));
    }
    // Si no hay imágenes guardadas, usar las por defecto
  }

  startBannerCarousel(): void {
    this.bannerInterval = setInterval(() => {
      this.nextBannerImage();
    }, 3000); // Cambio automático cada 3 segundos
  }

  nextBannerImage(): void {
    this.currentBannerIndex = (this.currentBannerIndex + 1) % this.bannerImages.length;
  }

  prevBannerImage(): void {
    this.currentBannerIndex = (this.currentBannerIndex - 1 + this.bannerImages.length) % this.bannerImages.length;
  }

  goToBannerImage(index: number): void {
    this.currentBannerIndex = index;
  }

  onDotKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.goToBannerImage(index);
    }
  }

  viewProduct(event: Event, productId: string | number): void {
    event.stopPropagation();
    event.preventDefault();
    this.router.navigate(['/products', productId]);
  }

  addToCart(event: Event, product: Product): void {
    event.stopPropagation();
    event.preventDefault();
    
    if (!product.stockQuantity || product.stockQuantity === 0) {
      return;
    }

    this.cartFacade.addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl || '',
      categoryId: product.categoryId
    });
    
    console.log('Producto agregado al carrito:', product.name);
  }

  getProductImageUrl(product: Product): string {
    if (!product.imageUrl || product.imageUrl.trim() === '' || product.imageUrl.includes('placeholder-product.svg')) {
      return this.placeholderImage;
    }
    return product.imageUrl;
  }

  getOriginalPrice(product: Product): number {
    // El precio almacenado ya ES el precio original
    // No necesitamos calcular nada, solo retornarlo
    return product.price;
  }

  getDiscountedPrice(product: Product): number {
    if (product.hasDiscount && product.discountPercentage) {
      return product.price * (1 - product.discountPercentage / 100);
    }
    return product.price;
  }

  onImageError(event: any): void {
    const target = event.target as HTMLImageElement;
    if (target && !target.src.includes('data:image')) {
      target.src = this.placeholderImage;
    }
  }

  private loadPublicProducts(): void {
    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();
    
    this.publicProductService.getPublicProducts().subscribe({
      next: (products) => {
        Promise.resolve().then(() => {
          console.log('Productos recibidos:', products);
          this.products = products;
          this.featuredProducts = products.filter(p => p.hasDiscount === true);
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
