import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../../../core/config/app.config';
import { AdminOrder, AdminOrderStatus } from './admin-order.model';

@Injectable({ providedIn: 'root' })
export class AdminOrderService {
  private http = inject(HttpClient);
  private base = `${APP_CONFIG.api.baseUrl}/api`;
  private resource = `${this.base}/orders`;

  list(status?: AdminOrderStatus): Observable<AdminOrder[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<AdminOrder[]>(`${this.resource}`, { params });
  }

  getById(id: string): Observable<AdminOrder> {
    return this.http.get<AdminOrder>(`${this.resource}/${id}`);
  }

  updateStatus(id: string, status: AdminOrderStatus): Observable<AdminOrder> {
    return this.http.patch<AdminOrder>(`${this.resource}/${id}/status`, { status });
  }
}
