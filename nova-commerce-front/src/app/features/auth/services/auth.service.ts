import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  LoginCredentials,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  TokenValidationResponse,
} from '../models/auth.models';

/**
 * AuthService
 *
 * Responsabilidad ÚNICA: Comunicación HTTP con el backend de autenticación
 *
 * Responsabilidades:
 * - POST /api/auth/login
 * - POST /api/auth/refresh
 * - GET /api/auth/validate (opcional)
 *
 * NO responsable de:
 * - Guardar tokens (eso es TokenService)
 * - Redirigir rutas (eso es Facade + Router)
 * - Lógica de negocio (eso es Facade)
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8080/api/auth';

  constructor(private readonly http: HttpClient) {}

  /**
   * Autentica al usuario con el backend
   * @param credentials - userIdentifier y password
   * @returns Observable con la respuesta del login
   */
  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials);
  }

  /**
   * Refresca el access token usando el refresh token
   * @param refreshToken - Token de renovación
   * @returns Observable con nuevo access_token
   */
  refreshToken(refreshToken: string): Observable<RefreshTokenResponse> {
    const payload: RefreshTokenRequest = { refreshToken };
    return this.http.post<RefreshTokenResponse>(`${this.API_URL}/refresh`, payload);
  }

  /**
   * Valida el token actual contra el backend
   * @returns Observable con resultado de validación
   */
  validateToken(): Observable<TokenValidationResponse> {
    return this.http.get<TokenValidationResponse>(`${this.API_URL}/validate`);
  }

  /**
   * Registra un nuevo usuario en el sistema (endpoint público)
   */
  register(payload: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
  }) {
    return this.http.post(`${this.API_URL}/public/register`, payload);
  }
}
