import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { AdminProductService } from './admin-product.service';
import { AdminProduct, AdminProductInput } from './admin-product.model';

export interface AdminProductState {
  products: AdminProduct[];
  selectedProduct: AdminProduct | null;
  loading: boolean;
  filter?: { active?: boolean };
}

@Injectable({ providedIn: 'root' })
export class AdminProductFacade {
  private readonly service = inject(AdminProductService);
  private _state$ = new BehaviorSubject<AdminProductState>({
    products: [],
    selectedProduct: null,
    loading: false,
    filter: {},
  });

  state$ = this._state$.asObservable();
  products$ = this._state$.asObservable().pipe(map(state => state.products));
  selectedProduct$ = this._state$.asObservable().pipe(map(state => state.selectedProduct));
  loading$ = this._state$.asObservable().pipe(map(state => state.loading));

  private setState(partial: Partial<AdminProductState>) {
    const current = this._state$.value;
    this._state$.next({ ...current, ...partial });
  }

  loadProducts() {
    this.setState({ loading: true });
    this.service.list().subscribe({
      next: (products) => this.setState({ products, loading: false }),
      error: () => this.setState({ loading: false }),
    });
  }

  clearSelectedProduct() {
    this.setState({ selectedProduct: null });
  }

  loadProductById(id: string) {
    this.setState({ loading: true, selectedProduct: null });
    this.service.getById(id).subscribe({
      next: (selectedProduct) => this.setState({ selectedProduct, loading: false }),
      error: () => this.setState({ loading: false }),
    });
  }

  createProduct(input: AdminProductInput) {
    this.setState({ loading: true });
    this.service.create(input).subscribe({
      next: (p) => this.setState({
        products: [p, ...this._state$.value.products],
        selectedProduct: p,
        loading: false,
      }),
      error: () => this.setState({ loading: false }),
    });
  }

  /**
   * Crea un producto y opcionalmente sube una imagen asociada
   */
  createProductWithImage(input: AdminProductInput, file?: File, onComplete?: () => void) {
    this.setState({ loading: true });
    this.service.create(input).subscribe({
      next: (p) => {
        if (file) {
          this.service.uploadImage(p.id, file).subscribe({
            next: (res) => {
              const updated = { ...p, imageUrl: res.imageUrl } as AdminProduct;
              this.setState({ products: [updated, ...this._state$.value.products], selectedProduct: updated, loading: false });
              if (onComplete) onComplete();
            },
            error: () => {
              this.setState({ products: [p, ...this._state$.value.products], selectedProduct: p, loading: false });
              if (onComplete) onComplete();
            },
          });
        } else {
          this.setState({ products: [p, ...this._state$.value.products], selectedProduct: p, loading: false });
          if (onComplete) onComplete();
        }
      },
      error: () => {
        this.setState({ loading: false });
        if (onComplete) onComplete();
      },
    });
  }

  uploadImage(productId: string, file: File) {
    this.setState({ loading: true });
    return this.service.uploadImage(productId, file);
  }

  /**
   * Actualiza un producto y opcionalmente sube una imagen después de la actualización
   */
  updateProductWithImage(id: string, input: AdminProductInput, file?: File, onComplete?: () => void) {
    this.setState({ loading: true });
    this.service.update(id, input).subscribe({
      next: (p) => {
        if (file) {
          this.service.uploadImage(p.id, file).subscribe({
            next: (res) => {
              const updated = { ...p, imageUrl: res.imageUrl } as AdminProduct;
              const products = this._state$.value.products.map((it) => (it.id === updated.id ? updated : it));
              this.setState({ products, selectedProduct: updated, loading: false });
              if (onComplete) onComplete();
            },
            error: () => {
              const products = this._state$.value.products.map((it) => (it.id === p.id ? p : it));
              this.setState({ products, selectedProduct: p, loading: false });
              if (onComplete) onComplete();
            },
          });
        } else {
          const products = this._state$.value.products.map((it) => (it.id === p.id ? p : it));
          this.setState({ products, selectedProduct: p, loading: false });
          if (onComplete) onComplete();
        }
      },
      error: () => {
        this.setState({ loading: false });
        if (onComplete) onComplete();
      },
    });
  }

  updateProduct(id: string, input: AdminProductInput) {
    this.setState({ loading: true });
    this.service.update(id, input).subscribe({
      next: (p) => {
        const products = this._state$.value.products.map((it) => (it.id === p.id ? p : it));
        this.setState({ products, selectedProduct: p, loading: false });
      },
      error: () => this.setState({ loading: false }),
    });
  }

  setActive(id: string, status: 'ACTIVE' | 'INACTIVE') {
    this.setState({ loading: true });
    this.service.setActive(id, status).subscribe({
      next: (p) => {
        const products = this._state$.value.products.map((it) => (it.id === p.id ? p : it));
        this.setState({ products, selectedProduct: p, loading: false });
      },
      error: () => this.setState({ loading: false }),
    });
  }

  deleteProduct(id: string) {
    this.setState({ loading: true });
    this.service.delete(id).subscribe({
      next: () => {
        const products = this._state$.value.products.filter((p) => p.id !== id);
        this.setState({ products, loading: false });
      },
      error: () => this.setState({ loading: false }),
    });
  }

  setFilter(filter: { active?: boolean }) {
    this.setState({ filter });
  }
}
