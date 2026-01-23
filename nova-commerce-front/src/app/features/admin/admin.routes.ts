import { Routes } from '@angular/router';
import { authGuard } from '../auth/guards/auth.guard';
import { roleGuard } from '../auth/guards/role.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./admin-layout.component').then((m) => m.AdminLayoutComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./admin-dashboard.component').then((m) => m.AdminDashboardComponent),
      },
      {
        path: 'products',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./products/pages/admin-product-list/admin-product-list.component').then(
                (m) => m.AdminProductListComponent
              ),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./products/pages/admin-product-form/admin-product-form.component').then(
                (m) => m.AdminProductFormComponent
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./products/pages/admin-product-form/admin-product-form.component').then(
                (m) => m.AdminProductFormComponent
              ),
          },
        ],
      },
      {
        path: 'orders',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./orders/pages/admin-order-list/admin-order-list.component').then(
                (m) => m.AdminOrderListComponent
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./orders/pages/admin-order-detail/admin-order-detail.component').then(
                (m) => m.AdminOrderDetailComponent
              ),
          },
        ],
      },
      {
        path: 'customers',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./customers/pages/admin-customer-list/admin-customer-list.component').then(
                (m) => m.AdminCustomerListComponent
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./customers/pages/admin-customer-detail/admin-customer-detail.component').then(
                (m) => m.AdminCustomerDetailComponent
              ),
          },
        ],
      },
      {
        path: 'discounts',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./discounts/pages/admin-discount-list/admin-discount-list.component').then(
                (m) => m.AdminDiscountListComponent
              ),
          },
        ],
      },
      {
        path: 'banner',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/admin-banner-list/admin-banner-list.component').then(
                (m) => m.AdminBannerListComponent
              ),
          },
        ],
      },
      {
        path: 'chat',
        loadComponent: () =>
          import('./chat-admin/chat-admin.component').then(
            (m) => m.ChatAdminComponent
          ),
      },
    ],
  },
];
