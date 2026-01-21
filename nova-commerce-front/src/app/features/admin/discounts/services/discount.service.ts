import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../../../../core/config/app.config';

export interface DiscountRule {
  id: string;
  name: string;
  description: string;
  strategy: string;
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  startDate: string;
  endDate?: string;
  active: boolean;
  usageCount: number;
  maxUsage?: number;
  createdAt?: string;
  updatedAt?: string;
  isValid?: boolean;
}

export interface DiscountRuleRequest {
  name: string;
  description: string;
  strategy: string;
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  startDate: string;
  endDate?: string;
  active?: boolean;
  maxUsage?: number;
}

@Injectable({ providedIn: 'root' })
export class DiscountService {
  private readonly http = inject(HttpClient);
  private readonly base = `${APP_CONFIG.api.baseUrl}/api`;
  private readonly resource = `${this.base}/discounts`;

  getAll(): Observable<DiscountRule[]> {
    return this.http.get<DiscountRule[]>(`${this.resource}`);
  }

  getById(id: string): Observable<DiscountRule> {
    return this.http.get<DiscountRule>(`${this.resource}/${id}`);
  }

  getActive(): Observable<DiscountRule[]> {
    return this.http.get<DiscountRule[]>(`${this.resource}/active`);
  }

  create(request: DiscountRuleRequest): Observable<DiscountRule> {
    return this.http.post<DiscountRule>(`${this.resource}`, request);
  }

  update(id: string, request: DiscountRuleRequest): Observable<DiscountRule> {
    return this.http.put<DiscountRule>(`${this.resource}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.resource}/${id}`);
  }

  toggleStatus(id: string): Observable<void> {
    return this.http.patch<void>(`${this.resource}/${id}/toggle`, {});
  }
}
