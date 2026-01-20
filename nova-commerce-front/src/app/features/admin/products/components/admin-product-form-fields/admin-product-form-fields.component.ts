import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminProductInput } from '../../admin-product.model';
import { CategoryService } from '../../../categories/category.service';
import type { Category } from '../../../categories/category.model';

@Component({
  selector: 'app-admin-product-form-fields',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-product-form-fields.component.html',
  styleUrls: ['./admin-product-form-fields.component.scss'],
})
export class AdminProductFormFieldsComponent implements OnInit {
  @Input() model: AdminProductInput = {
    name: '',
    description: '',
    price: 0,
    stockQuantity: 0,
    status: 'ACTIVE',
    productType: 'PHYSICAL',
    categoryId: 'DEFAULT' // Valor por defecto requerido
  };
  @Output() modelChange = new EventEmitter<AdminProductInput>();
  @Output() imageFileChange = new EventEmitter<File | null>();

  previewSrc: string | null = null;
  imageUploadMode: 'url' | 'file' = 'url';

  private categoryService = inject(CategoryService);
  categories: Category[] = [];
  loadingCategories = true;

  ngOnInit() {
    this.categoryService.list().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loadingCategories = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.loadingCategories = false;
      }
    });
  }

  emitChange() {
    this.modelChange.emit(this.model);
  }

  setImageUploadMode(mode: 'url' | 'file') {
    this.imageUploadMode = mode;
    if (mode === 'url') {
      // Limpiar archivo seleccionado
      this.previewSrc = null;
      this.imageFileChange.emit(null);
    } else {
      // Limpiar URL
      this.model.imageUrl = '';
      this.emitChange();
    }
  }

  onImageUrlChange() {
    // Validar URL básicamente
    if (this.model.imageUrl && this.model.imageUrl.trim()) {
      this.previewSrc = null; // No usamos previewSrc para URLs, solo para archivos
      this.imageFileChange.emit(null); // No hay archivo cuando usamos URL
    }
    this.emitChange();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.previewSrc = null;
      this.imageFileChange.emit(null);
      return;
    }
    const file = input.files[0];
    
    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen es demasiado grande. El tamaño máximo es 5MB.');
      input.value = '';
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      alert('El archivo debe ser una imagen.');
      input.value = '';
      return;
    }

    this.imageFileChange.emit(file);
    const reader = new FileReader();
    reader.onload = () => (this.previewSrc = reader.result as string);
    reader.readAsDataURL(file);
    
    // Limpiar URL cuando se selecciona archivo
    this.model.imageUrl = '';
  }

  getPreviewImage(): string | null {
    if (this.imageUploadMode === 'file' && this.previewSrc) {
      return this.previewSrc;
    }
    if (this.imageUploadMode === 'url' && this.model.imageUrl) {
      return this.model.imageUrl;
    }
    return null;
  }

  removeImage(fileInput?: HTMLInputElement) {
    this.previewSrc = null;
    this.model.imageUrl = '';
    if (fileInput) {
      fileInput.value = '';
    }
    this.imageFileChange.emit(null);
    this.emitChange();
  }

  onDiscountToggle() {
    if (!this.model.hasDiscount) {
      this.model.discountPercentage = undefined;
    } else {
      this.model.discountPercentage = 10; // Valor por defecto
    }
    this.emitChange();
  }

  calculateDiscountedPrice(): number {
    if (!this.model.price || !this.model.discountPercentage) {
      return this.model.price || 0;
    }
    return this.model.price * (1 - this.model.discountPercentage / 100);
  }
}
