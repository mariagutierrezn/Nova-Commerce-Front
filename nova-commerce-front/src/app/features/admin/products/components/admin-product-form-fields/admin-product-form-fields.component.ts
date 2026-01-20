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

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.previewSrc = null;
      this.imageFileChange.emit(null);
      return;
    }
    const file = input.files[0];
    this.imageFileChange.emit(file);
    const reader = new FileReader();
    reader.onload = () => (this.previewSrc = reader.result as string);
    reader.readAsDataURL(file);
  }
}
