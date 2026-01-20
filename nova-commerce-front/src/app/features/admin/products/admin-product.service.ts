import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { APP_CONFIG } from '../../../core/config/app.config';
import { AdminProduct, AdminProductInput } from './admin-product.model';

interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class AdminProductService {
  private http = inject(HttpClient);
  private base = `${APP_CONFIG.api.baseUrl}/api`;
  private resource = `${this.base}/products`;

  list(): Observable<AdminProduct[]> {
    return this.http.get<PagedResponse<AdminProduct>>(`${this.resource}`)
      .pipe(map(response => response.content));
  }

  getById(id: string): Observable<AdminProduct> {
    return this.http.get<AdminProduct>(`${this.resource}/${id}`);
  }

  create(input: AdminProductInput): Observable<AdminProduct> {
    return this.http.post<AdminProduct>(`${this.resource}`, input);
  }

  update(id: string, input: AdminProductInput): Observable<AdminProduct> {
    return this.http.put<AdminProduct>(`${this.resource}/${id}`, input);
  }

  setActive(id: string, status: 'ACTIVE' | 'INACTIVE'): Observable<AdminProduct> {
    return this.http.put<AdminProduct>(`${this.resource}/${id}`, { status });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.resource}/${id}`);
  }

  /**
   * Sube una imagen para un producto (form-data -> field 'image')
   */
  uploadImage(id: string, file: File): Observable<{ imageUrl: string; message?: string }> {
    const fd = new FormData();
    fd.append('imageFile', file);
    return this.http.post<{ imageUrl: string; message?: string }>(`${this.resource}/${id}/images`, fd);
  }
}
