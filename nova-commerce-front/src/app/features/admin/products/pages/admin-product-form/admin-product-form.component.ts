import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
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
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      const id = idParam; // id es string, no necesita parseInt
      this.facade.loadProductById(id);
      (this.facade as any).products$.subscribe((state: any) => {
        if (state.selectedProduct) {
          const p = state.selectedProduct;
          this.model = {
            name: p.name,
            description: p.description,
            price: p.price,
            stockQuantity: p.stockQuantity,
            status: p.status,
            productType: p.productType,
            categoryId: p.categoryId
          };
        }
      });
    }
  }

  save() {
    if (this.isEdit) {
      const idParam = this.route.snapshot.paramMap.get('id')!;
      const id = idParam; // id es string
      // Actualizar y esperar antes de navegar
      this.facade.updateProductWithImage(id, this.model, this.selectedFile ?? undefined);
      setTimeout(() => {
        this.facade.loadProducts(); // Recargar lista
        this.router.navigate(['/admin/products']);
      }, 1000);
    } else {
      // Crear y esperar antes de navegar
      this.facade.createProductWithImage(this.model, this.selectedFile ?? undefined);
      setTimeout(() => {
        this.facade.loadProducts(); // Recargar lista
        this.router.navigate(['/admin/products']);
      }, 1000);
    }
  }

  onModelChange(updatedModel: AdminProductInput) {
    this.model = updatedModel;
  }

  onImageFileChange(file: File | null) {
    this.selectedFile = file;
  }
}
