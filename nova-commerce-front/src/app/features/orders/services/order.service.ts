/**
 * OrderService
 *
 * Capa HTTP para gestión de órdenes
 * Responsabilidades:
 * • Crear órdenes (POST /api/orders)
 * • Obtener órdenes del usuario (GET /api/orders)
 * • Obtener orden por ID (GET /api/orders/:id)
 *
 * No contiene lógica de negocio (solo mapeo HTTP)
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { APP_CONFIG } from '../../../core/config/app.config';
import type {
  Order,
  CreateOrderRequest,
  OrdersResponse,
  DiscountPreviewRequest,
  DiscountPreviewResponse,
} from '../models/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = `${APP_CONFIG.api.baseUrl}/api/orders`;

  constructor(private http: HttpClient) {}

  /**
   * Crea una nueva orden
   * @param request - Datos de la orden (items)
   * @returns Observable con la orden creada
   */
  createOrder(request: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, request);
  }

  /**
   * Obtiene todas las órdenes del usuario autenticado
   * @returns Observable con array de órdenes
   */
  getUserOrders(): Observable<Order[]> {
    return this.http.get<any>(`${this.apiUrl}`).pipe(
      map((response) => {
        // Si ya es un array directo, retórnalo
        if (Array.isArray(response)) {
          return response as Order[];
        }
        // Si es respuesta paginada Spring Data con 'content'
        if (response?.content && Array.isArray(response.content)) {
          return response.content as Order[];
        }
        // Si es respuesta personalizada con propiedad 'orders'
        if (response?.orders && Array.isArray(response.orders)) {
          return response.orders as Order[];
        }
        // Fallback
        console.warn('Respuesta de órdenes inesperada:', response);
        return [];
      })
    );
  }

  /**
   * Obtiene las órdenes de un cliente por su id (endpoint público/administrativo)
   * @param customerId - id del cliente
   * @returns Observable con array de órdenes
   */
  getOrdersByCustomerId(customerId: string): Observable<Order[]> {
    return this.http.get<any>(`${this.apiUrl}/customer/${customerId}`).pipe(
      map((response) => {
        if (Array.isArray(response)) {
          return response as Order[];
        }
        if (response?.content && Array.isArray(response.content)) {
          return response.content as Order[];
        }
        if (response?.orders && Array.isArray(response.orders)) {
          return response.orders as Order[];
        }
        console.warn('Respuesta de órdenes por cliente inesperada:', response);
        return [];
      })
    );
  }

  /**
   * Obtiene una orden por su ID
   * @param id - ID de la orden
   * @returns Observable con la orden
   */
  getOrderById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  /**
   * Calcula un preview de los descuentos que se aplicarían a una orden
   * @param request - Datos del cliente e items
   * @returns Observable con los descuentos calculados
   */
  getDiscountPreview(request: DiscountPreviewRequest): Observable<DiscountPreviewResponse> {
    return this.http.post<DiscountPreviewResponse>(`${this.apiUrl}/discount-preview`, request);
  }
}
