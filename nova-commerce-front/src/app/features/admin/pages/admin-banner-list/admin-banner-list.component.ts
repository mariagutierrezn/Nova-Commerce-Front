import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * AdminBannerListComponent
 * 
 * Componente para gestionar las imágenes del banner del home.
 * Permite al administrador:
 * - Ver listado de imágenes del banner
 * - Agregar nuevas imágenes (URL)
 * - Editar URLs y textos alternativos
 * - Eliminar imágenes del carrusel
 * - Cambiar el orden de las imágenes
 */
@Component({
  selector: 'nc-admin-banner-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-banner-list.component.html',
  styleUrl: './admin-banner-list.component.scss',
})
export class AdminBannerListComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);

  banners: BannerImage[] = [];
  showAddModal = false;
  showEditModal = false;
  currentBanner: BannerImage | null = null;

  newBanner: BannerImageForm = {
    url: '',
    alt: '',
    orden: 0,
  };

  editBanner: BannerImageForm = {
    url: '',
    alt: '',
    orden: 0,
  };

  ngOnInit(): void {
    this.loadBanners();
  }

  loadBanners(): void {
    // Por ahora, cargar desde localStorage
    const stored = localStorage.getItem('bannerImages');
    if (stored) {
      this.banners = JSON.parse(stored);
    } else {
      // Imágenes por defecto
      this.banners = [
        { id: '1', url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=200&fit=crop', alt: 'Oferta Computadores', orden: 1 },
        { id: '2', url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&h=200&fit=crop', alt: 'Oferta Laptops', orden: 2 },
        { id: '3', url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=200&fit=crop', alt: 'Oferta Tecnología', orden: 3 },
        { id: '4', url: 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=400&h=200&fit=crop', alt: 'Oferta Accesorios', orden: 4 },
      ];
      this.saveBanners();
    }
    this.cdr.markForCheck();
  }

  saveBanners(): void {
    localStorage.setItem('bannerImages', JSON.stringify(this.banners));
  }

  openAddModal(): void {
    this.newBanner = {
      url: '',
      alt: '',
      orden: this.banners.length + 1,
    };
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.newBanner = { url: '', alt: '', orden: 0 };
  }

  addBanner(): void {
    if (!this.newBanner.url.trim()) {
      alert('La URL es obligatoria');
      return;
    }

    const newId = Date.now().toString();
    this.banners.push({
      id: newId,
      url: this.newBanner.url,
      alt: this.newBanner.alt || 'Banner',
      orden: this.newBanner.orden,
    });
    this.saveBanners();
    this.closeAddModal();
    this.cdr.markForCheck();
  }

  openEditModal(banner: BannerImage): void {
    this.currentBanner = banner;
    this.editBanner = {
      url: banner.url,
      alt: banner.alt,
      orden: banner.orden,
    };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.currentBanner = null;
    this.editBanner = { url: '', alt: '', orden: 0 };
  }

  updateBanner(): void {
    if (!this.currentBanner) return;
    if (!this.editBanner.url.trim()) {
      alert('La URL es obligatoria');
      return;
    }

    const index = this.banners.findIndex(b => b.id === this.currentBanner!.id);
    if (index !== -1) {
      this.banners[index].url = this.editBanner.url;
      this.banners[index].alt = this.editBanner.alt || 'Banner';
      this.banners[index].orden = this.editBanner.orden;
      this.saveBanners();
    }
    this.closeEditModal();
    this.cdr.markForCheck();
  }

  deleteBanner(id: string): void {
    if (!confirm('¿Seguro que deseas eliminar esta imagen del banner?')) return;

    this.banners = this.banners.filter(b => b.id !== id);
    this.saveBanners();
    this.cdr.markForCheck();
  }

  moveUp(index: number): void {
    if (index === 0) return;
    [this.banners[index], this.banners[index - 1]] = [this.banners[index - 1], this.banners[index]];
    this.updateOrders();
    this.saveBanners();
    this.cdr.markForCheck();
  }

  moveDown(index: number): void {
    if (index === this.banners.length - 1) return;
    [this.banners[index], this.banners[index + 1]] = [this.banners[index + 1], this.banners[index]];
    this.updateOrders();
    this.saveBanners();
    this.cdr.markForCheck();
  }

  private updateOrders(): void {
    this.banners.forEach((banner, idx) => {
      banner.orden = idx + 1;
    });
  }
}

interface BannerImage {
  id: string;
  url: string;
  alt: string;
  orden: number;
}

interface BannerImageForm {
  url: string;
  alt: string;
  orden: number;
}
