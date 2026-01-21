import { Routes } from '@angular/router';
import { MainLayoutComponent } from './shared/components/layout/main-layout/main-layout.component';
import { authGuard } from './features/auth/guards/auth.guard';
import { roleGuard } from './features/auth/guards/role.guard';

/**
 * Rutas principales de la aplicación
 *
 * Estructura:
 * - /auth → Rutas de autenticación (login)
 * - Ruta raíz: MainLayoutComponent (contenedor con Header, Footer, router-outlet)
 * - Rutas hijas lazy-loaded:
 *   - / → HomeComponent (pública)
 *   - /products → ProductsComponent (protegida con authGuard)
 *   - /orders → OrdersComponent (protegida con authGuard)
 *   - /admin → AdminComponent (protegida con authGuard + roleGuard[ADMIN])
 */

export const routes: Routes = [
  // Rutas de autenticación (públicas)
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },

  // Rutas de administración (sin layout público)
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    loadChildren: () =>
      import('./features/admin/admin.routes').then(
        (m) => m.ADMIN_ROUTES
      ),
  },

  // Rutas principales con layout
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'products',
        canActivate: [authGuard],
        loadChildren: () =>
          import('./features/products/products.routes').then(
            (m) => m.productsRoutes
          ),
      },
      {
        path: 'orders',
        canActivate: [authGuard],
        loadChildren: () =>
          import('./features/orders/orders.routes').then(
            (m) => m.ordersRoutes
          ),
      },
      {
        path: 'cart',
        canActivate: [authGuard],
        loadChildren: () =>
          import('./features/cart/cart.routes').then(
            (m) => m.cartRoutes
          ),
      },
    ],
  },
];
