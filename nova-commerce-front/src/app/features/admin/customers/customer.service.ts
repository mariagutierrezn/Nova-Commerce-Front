import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Customer {
  id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: any;
  totalOrders?: number;
  totalSpent?: number;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8080/api/customers';

  /**
   * Obtiene todos los clientes (endpoint de admin)
   * Calcula totalOrders y totalSpent desde las órdenes
   */
  getAllCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.API_URL);
  }

  /**
   * Obtiene un cliente por ID
   */
  getCustomerById(id: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.API_URL}/${id}`);
  }

  /**
   * Actualiza un cliente
   */
  updateCustomer(id: string, data: Partial<Customer>): Observable<Customer> {
    return this.http.put<Customer>(`${this.API_URL}/${id}`, data);
  }

  /**
   * Elimina un cliente
   */
  deleteCustomer(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
