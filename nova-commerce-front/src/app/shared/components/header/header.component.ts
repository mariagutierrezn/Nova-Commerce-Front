import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthFacade } from '../../../features/auth/services/auth.facade';
import { UserFacade } from '../../../features/auth/facades/user.facade';
import { CartFacade } from '../../../features/cart/services/cart.facade';
import { CartIconComponent } from '../../../features/cart/components/cart-icon/cart-icon.component';

/**
 * HeaderComponent
 *
 * Componente de cabecera principal de la aplicación.
 * Incluye logo, navegación y autenticación.
 *
 * Responsabilidades:
 * - Mostrar logo de NovaCommerce
 * - Mostrar enlaces de navegación
 * - Mostrar estado de autenticación (login/logout)
 * - Mostrar email del usuario cuando está autenticado
 * - Adaptar navegación según roles
 * - Mostrar ícono del carrito con badge de items
 *
 * CONSUMER DE:
 * • UserFacade - Para obtener información del usuario (email, roles)
 * • AuthFacade - Para lógica de logout
 * • CartFacade - Para obtener cantidad de items del carrito
 */
@Component({
  selector: 'nc-header',
  standalone: true,
  imports: [CommonModule, RouterModule, CartIconComponent, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  public authFacade = inject(AuthFacade);
  public userFacade = inject(UserFacade);
  private cartFacade = inject(CartFacade);
  private router = inject(Router);

  cartItemCount$ = this.cartFacade.totalItems$;
  searchTerm = '';
  showSearchInput = false;

  /**
   * Maneja el click en el botón de logout
   */
  onLogout(): void {
    this.authFacade.logout();
  }

  /**
   * Toggle search input visibility
   */
  toggleSearch(): void {
    this.showSearchInput = !this.showSearchInput;
  }

  /**
   * Ejecuta la búsqueda y navega a productos con filtro
   */
  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.router.navigate(['/products'], { 
        queryParams: { search: this.searchTerm.trim() }
      });
      this.showSearchInput = false;
      this.searchTerm = '';
    }
  }
}
