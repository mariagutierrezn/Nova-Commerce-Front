import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminProductFacade } from '../../admin-product.facade';
import { AdminProductFormFieldsComponent } from '../../components/admin-product-form-fields/admin-product-form-fields.component';
import { AdminProductInput } from '../../admin-product.model';

@Component({
  selector: 'app-admin-product-form',
  standalone: true,
  imports: [CommonModule, RouterLink, AdminProductFormFieldsComponent],
  templateUrl: './admin-product-form.component.html',
  styleUrls: ['./admin-product-form.component.scss'],
})
export class AdminProductFormComponent implements OnInit {
  private facade = inject(AdminProductFacade);
  private route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);

  model: AdminProductInput = {
    name: '',
    description: '',
    price: 0,
    stockQuantity: 0,
    status: 'ACTIVE',
    productType: 'PHYSICAL',
    categoryId: 'DEFAULT' // Valor por defecto requerido
  };
  isEdit = false;
  selectedFile: File | null = null;

  ngOnInit() {
    // Limpiar estado anterior
    this.facade.clearSelectedProduct();
    
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      const id = idParam;
      
      console.log('[AdminProductForm] Loading product with ID:', id);
      this.facade.loadProductById(id);
      
      // Suscribirse al producto seleccionado
      const sub = this.facade.selectedProduct$.subscribe({
        next: (product) => {
          console.log('[AdminProductForm] Product received:', product);
          if (product && product.id === id) {
            // Ejecutar dentro de NgZone para asegurar detección de cambios
            this.ngZone.run(() => {
              this.model = {
                name: product.name || '',
                description: product.description || '',
                price: product.price || 0,
                stockQuantity: product.stockQuantity || 0,
                status: product.status || 'ACTIVE',
                productType: product.productType || 'PHYSICAL',
                categoryId: product.categoryId || 'DEFAULT',
                imageUrl: product.imageUrl,
                hasDiscount: product.hasDiscount || false,
                discountPercentage: product.discountPercentage
              };
              console.log('[AdminProductForm] Model updated:', this.model);
              
              // Forzar detección de cambios
              this.cdr.detectChanges();
            });
            // Unsubscribe después de cargar
            sub.unsubscribe();
          }
        },
        error: (err) => {
          console.error('[AdminProductForm] Error loading product:', err);
          sub.unsubscribe();
        }
      });
    }
  }

  save() {
    if (this.isEdit) {
      const idParam = this.route.snapshot.paramMap.get('id')!;
      const id = idParam;
      
      this.facade.updateProductWithImage(id, this.model, this.selectedFile ?? undefined, () => {
        this.facade.loadProducts();
        this.router.navigate(['/admin/products']);
      });
    } else {
      this.facade.createProductWithImage(this.model, this.selectedFile ?? undefined, () => {
        this.facade.loadProducts();
        this.router.navigate(['/admin/products']);
      });
    }
  }

  onModelChange(updatedModel: AdminProductInput) {
    this.model = updatedModel;
  }

  onImageFileChange(file: File | null) {
    this.selectedFile = file;
  }
}
