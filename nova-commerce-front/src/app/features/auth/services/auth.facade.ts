import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, catchError, of, map } from 'rxjs';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { LoginCredentials, AuthState, UserSession } from '../models/auth.models';

/**
 * AuthFacade
 *
 * Responsabilidad: PUNTO ÚNICO de acceso a toda la lógica de autenticación
 *
 * Este servicio orquesta:
 * - AuthService (HTTP)
 * - TokenService (Storage)
 * - Router (Navegación)
 *
 * Provee métodos simples para:
 * - Componentes
 * - Guards
 * - Directivas
 *
 * Implementa el patrón Facade para desacoplar la UI de los servicios internos
 */
@Injectable({
  providedIn: 'root',
})
export class AuthFacade {
  /**
   * Observable del estado de autenticación
   * Los componentes pueden suscribirse para reaccionar a cambios
   */
  private authStateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    username: null,
    roles: [],
  });

  public authState$ = this.authStateSubject.asObservable();

  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router
  ) {
    // Inicializar estado desde localStorage al arrancar
    this.initializeAuthState();
  }

  /**
   * Inicializa el estado de autenticación desde localStorage
   */
  private initializeAuthState(): void {
    const token = this.tokenService.getAccessToken();
    if (token && !this.tokenService.isTokenExpired(token)) {
      const username = this.tokenService.getUsername();
      const roles = this.tokenService.getRoles();

      this.authStateSubject.next({
        isAuthenticated: true,
        username,
        roles,
      });
    }
  }

  /**
   * Realiza el login del usuario
   * @param credentials - userIdentifier y password
   * @returns Observable<boolean> - true si login exitoso
   */
  login(credentials: LoginCredentials): Observable<boolean> {
    return this.authService.login(credentials).pipe(
      tap((response) => {
        // Guardar tokens en localStorage
        this.tokenService.setTokens(
          response.access_token,
          response.refresh_token,
          response.username,
          response.roles
        );

        // Actualizar estado
        this.authStateSubject.next({
          isAuthenticated: true,
          username: response.username,
          roles: response.roles,
        });
      }),
      tap(() => {
        // No redirigir automáticamente aquí, dejar que el componente lo haga
        // this.router.navigate(['/']);
      }),
      map(() => true),
      catchError((error) => {
        console.error('Error en login:', error);
        return of(false);
      })
    );
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    // Limpiar tokens
    this.tokenService.clearTokens();

    // Actualizar estado
    this.authStateSubject.next({
      isAuthenticated: false,
      username: null,
      roles: [],
    });

    // Redirigir a login
    this.router.navigate(['/auth/login']);
  }

  /**
   * Verifica si el usuario está autenticado
   * @returns true si tiene un token válido
   */
  isAuthenticated(): boolean {
    return this.tokenService.hasValidToken();
  }

  /**
   * Verifica si el usuario tiene un rol específico
   * @param role - Rol a verificar (ej: 'ADMIN')
   * @returns true si el usuario tiene ese rol
   */
  hasRole(role: string): boolean {
    const roles = this.tokenService.getRoles();
    return roles.includes(role);
  }

  /**
   * Verifica si el usuario tiene al menos uno de los roles especificados
   * @param roles - Array de roles a verificar
   * @returns true si tiene al menos uno
   */
  hasAnyRole(roles: string[]): boolean {
    const userRoles = this.tokenService.getRoles();
    return roles.some((role) => userRoles.includes(role));
  }

  /**
   * Verifica si el usuario tiene todos los roles especificados
   * @param roles - Array de roles a verificar
   * @returns true si tiene todos
   */
  hasAllRoles(roles: string[]): boolean {
    const userRoles = this.tokenService.getRoles();
    return roles.every((role) => userRoles.includes(role));
  }

  /**
   * Obtiene el username actual
   */
  getUsername(): string | null {
    return this.tokenService.getUsername();
  }

  /**
   * Obtiene los roles del usuario actual
   */
  getRoles(): string[] {
    return this.tokenService.getRoles();
  }

  /**
   * Obtiene la sesión completa del usuario
   */
  getCurrentSession(): UserSession | null {
    const accessToken = this.tokenService.getAccessToken();
    const refreshToken = this.tokenService.getRefreshToken();
    const username = this.tokenService.getUsername();
    const roles = this.tokenService.getRoles();

    if (!accessToken || !refreshToken || !username) {
      return null;
    }

    return {
      username,
      roles,
      accessToken,
      refreshToken,
      expiresIn: 86400, // Este valor debería venir del token decodificado
    };
  }

  /**
   * Refresca el access token
   * Útil para cuando el token expira pero el refresh token aún es válido
   */
  refreshToken(): Observable<boolean> {
    const refreshToken = this.tokenService.getRefreshToken();
    if (!refreshToken) {
      return of(false);
    }

    return this.authService.refreshToken(refreshToken).pipe(
      tap((response) => {
        // Actualizar tokens
        this.tokenService.setTokens(
          response.access_token,
          response.refresh_token,
          response.username,
          response.roles
        );
      }),
      map(() => true),
      catchError(() => {
        // Si falla el refresh, cerrar sesión
        this.logout();
        return of(false);
      })
    );
  }
}
