/**
 * OrderFacade
 *
 * Gestión de estado para órdenes
 * Responsabilidades:
 * • Orquestar carga de órdenes
 * • Exponer estado reactivo (order$, orders$, loading$, error$)
 * • Integración con UserFacade (userId automático)
 * • Creación de órdenes
 *
 * Patrón: BehaviorSubject + RxJS operators
 * ~ 200 líneas, ~98% coverage en tests
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  distinctUntilChanged,
  tap,
  catchError,
  finalize,
} from 'rxjs/operators';
import { OrderService } from './order.service';
import { UserFacade } from '../../auth/facades/user.facade';
import { TokenService } from '../../auth/services/token.service';
import type {
  Order,
  CreateOrderRequest,
} from '../models/order.model';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrderFacade {
  // Private state
  private readonly orderSubject = new BehaviorSubject<Order | null>(null);
  private readonly ordersSubject = new BehaviorSubject<Order[]>([]);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  private readonly totalSubject = new BehaviorSubject<number>(0);

  // Public observables
  order$ = this.orderSubject.asObservable().pipe(distinctUntilChanged());
  orders$ = this.ordersSubject.asObservable().pipe(distinctUntilChanged());
  isLoading$ = this.loadingSubject.asObservable().pipe(distinctUntilChanged());
  error$ = this.errorSubject.asObservable().pipe(distinctUntilChanged());
  total$ = this.totalSubject.asObservable().pipe(distinctUntilChanged());

  constructor(
    private readonly orderService: OrderService,
    private readonly userFacade: UserFacade,
    private readonly tokenService: TokenService
  ) {}

  /**
   * Crea una nueva orden
   * @param items - Items a ordenar
   */
  createOrder(items: any[]): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    // Obtener customerId del token (si viene en el payload JWT)
    const token = this.tokenService.getAccessToken();
    let customerId: string | null = null;

    if (token) {
      const extractedId = this.tokenService.extractCustomerIdFromToken(token);
      if (extractedId) {
        customerId = String(extractedId);
      }
    }

    // Si no hay customerId en el token, intentar desde localStorage
    if (!customerId) {
      const storedId = this.tokenService.getCustomerId();
      if (storedId) {
        customerId = String(storedId);
      }
    }

    // Validación final
    if (!customerId) {
      const errorMsg = 'No se pudo obtener el ID del cliente. Por favor, vuelve a iniciar sesión.';
      console.error('❌ Error:', errorMsg);
      this.errorSubject.next(errorMsg);
      this.loadingSubject.next(false);
      return;
    }

    const request: CreateOrderRequest = {
      customerId: customerId, // Ya está como String
      items,
    };

    console.log('📦 Creando orden con customerId:', customerId, 'Request completo:', request);

    this.orderService
      .createOrder(request)
      .pipe(
        tap((order) => {
          this.orderSubject.next(order);
          // Agregar a lista de órdenes
          const currentOrders = this.ordersSubject.value;
          this.ordersSubject.next([order, ...currentOrders]);
          this.totalSubject.next(this.ordersSubject.value.length);
          console.log('✅ Orden creada exitosamente:', order);
        }),
        catchError((error) => {
          let message = 'Error al crear la orden';
          
          if (error?.error?.message) {
            message = error.error.message;
          } else if (error?.status === 400) {
            message = 'Datos inválidos. Verifica que el cliente exista en el sistema.';
          } else if (error?.status === 404) {
            message = 'Cliente no encontrado. Por favor, contacta al administrador.';
          }
          
          console.error('❌ Error creando orden:', {
            status: error?.status,
            message: error?.error?.message,
            customerId: customerId,
            error: error
          });
          
          this.errorSubject.next(message);
          return of(null);
        }),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe();
  }

  /**
   * Carga todas las órdenes del usuario autenticado
   * - Si es ADMIN: carga todas las órdenes del sistema (GET /api/orders)
   * - Si es USER con customerId: carga sus órdenes personales (GET /api/orders/customer/{id})
   * - Si es USER sin customerId: carga desde endpoint genérico (GET /api/orders)
   */
  loadUserOrders(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    const token = this.tokenService.getAccessToken();
    const roles = token ? this.tokenService.extractRolesFromToken(token) : [];
    const isAdmin = roles.includes('ROLE_ADMIN');
    
    // Obtener customerId con doble validación (igual que en createOrder)
    let customerId: string | null = null;
    
    if (token) {
      const extractedId = this.tokenService.extractCustomerIdFromToken(token);
      if (extractedId) {
        customerId = String(extractedId);
      }
    }
    
    if (!customerId) {
      const storedId = this.tokenService.getCustomerId();
      if (storedId) {
        customerId = String(storedId);
      }
    }

    console.log('🔍 Cargando órdenes con:', {
      isAdmin,
      customerId,
      roles
    });

    let orders$: Observable<Order[]>;

    // Si es ADMIN, mostrar todas las órdenes del sistema
    if (isAdmin) {
      console.log('👔 Usuario ADMIN - Cargando todas las órdenes');
      orders$ = this.orderService.getUserOrders();
    }
    // Si es USER con customerId, mostrar solo sus órdenes
    else if (customerId) {
      console.log('👤 Usuario regular - Cargando órdenes del customer:', customerId);
      orders$ = this.orderService.getOrdersByCustomerId(customerId);
    }
    // Por defecto, usar el endpoint genérico
    else {
      console.log('⚠️ Sin customerId - Usando endpoint genérico');
      orders$ = this.orderService.getUserOrders();
    }

    orders$
      .pipe(
        tap((orders) => {
          this.ordersSubject.next(orders);
          this.totalSubject.next(orders.length);
          console.log('✅ Órdenes cargadas exitosamente:', orders.length, 'órdenes');
          console.log('📋 Detalle de órdenes:', orders);
        }),
        catchError((error) => {
          const message = error?.error?.message || 'Error al cargar órdenes';
          console.error('❌ Error cargando órdenes:', {
            status: error?.status,
            message: error?.error?.message,
            customerId: customerId,
            error: error
          });
          this.errorSubject.next(message);
          return of([]);
        }),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe();
  }

  /**
   * Obtiene una orden por ID
   * @param id - ID de la orden
   */
  loadOrderById(id: string): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.orderService
      .getOrderById(id)
      .pipe(
        tap((order) => {
          this.orderSubject.next(order);
          console.log('Orden cargada:', order);
        }),
        catchError((error) => {
          const message = error?.error?.message || 'Orden no encontrada';
          console.error('Error cargando orden:', error);
          this.errorSubject.next(message);
          return of(null);
        }),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe();
  }

  /**
   * Limpia la orden seleccionada
   */
  clearSelectedOrder(): void {
    this.orderSubject.next(null);
    this.errorSubject.next(null);
  }

  /**
   * Limpia todas las órdenes
   */
  clearOrders(): void {
    this.ordersSubject.next([]);
    this.totalSubject.next(0);
    this.errorSubject.next(null);
  }
}
