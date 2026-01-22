import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { APP_CONFIG } from '../../../core/config/app.config';
import { Category, CategoryResponse } from './category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${APP_CONFIG.api.baseUrl}/api/categories`;
  private cachedCategories$?: Observable<Category[]>;

  list(): Observable<Category[]> {
    if (!this.cachedCategories$) {
      this.cachedCategories$ = this.http.get<CategoryResponse>(this.baseUrl).pipe(
        map(response => response.content),
        // shareReplay mantiene el último valor emitido en caché
        shareReplay({ bufferSize: 1, refCount: true })
      );
    }
    return this.cachedCategories$;
  }

  getById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.baseUrl}/${id}`);
  }

  create(category: Omit<Category, 'id'>): Observable<Category> {
    return this.http.post<Category>(this.baseUrl, category);
  }

  update(id: number, category: Omit<Category, 'id'>): Observable<Category> {
    return this.http.put<Category>(`${this.baseUrl}/${id}`, category);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
