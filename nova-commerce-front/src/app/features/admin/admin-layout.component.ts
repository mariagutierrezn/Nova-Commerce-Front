import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HasRoleDirective } from '../auth/directives/has-role.directive';
import { AuthFacade } from '../auth/services/auth.facade';
import { AdminOrderFacade } from './orders/admin-order.facade';
import { Subject, interval, takeUntil } from 'rxjs';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, HasRoleDirective, FormsModule],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private authFacade = inject(AuthFacade);
  private orderFacade = inject(AdminOrderFacade);
  private destroy$ = new Subject<void>();
  
  searchTerm = '';
  showUserDropdown = false;
  notificationCount = 0;
  messageCount = 0;
  showNotifications = false;
  showMessages = false;
  
  notifications: Array<{id: string; message: string; time: Date; read: boolean}> = [];
  messages: Array<{id: string; sender: string; preview: string; time: Date; read: boolean}> = [];

  ngOnInit(): void {
    // Polling cada 30 segundos para verificar nuevos pedidos
    interval(30000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.checkNewOrders();
      });
    
    // Cargar notificaciones iniciales
    this.loadNotifications();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  checkNewOrders(): void {
    this.orderFacade.loadOrders();
    this.orderFacade.state$.pipe(takeUntil(this.destroy$)).subscribe((state) => {
      const orders = Array.isArray(state.orders) ? state.orders : [];
      const pendingOrders = orders.filter((o: any) => o.status === 'PENDING');
      if (pendingOrders.length > this.notificationCount) {
        // Hay nuevos pedidos
        const newOrders = pendingOrders.slice(this.notificationCount);
        newOrders.forEach((order: any) => {
          this.addNotification({
            id: order.id,
            message: `Nuevo pedido #${String(order.id).slice(-8)} por $${order.totalAfterDiscount?.toFixed ? order.totalAfterDiscount.toFixed(2) : order.totalAfterDiscount}`,
            time: new Date(),
            read: false
          });
        });
      }
      this.notificationCount = pendingOrders.length;
    });
  }

  loadNotifications(): void {
    this.orderFacade.loadOrders();
    this.orderFacade.state$.pipe(takeUntil(this.destroy$)).subscribe((state) => {
      const orders = Array.isArray(state.orders) ? state.orders : [];
      const pendingOrders = orders.filter((o: any) => o.status === 'PENDING').slice(0, 5);
      this.notifications = pendingOrders.map((order: any) => ({
        id: order.id,
        message: `Pedido #${String(order.id).slice(-8)} pendiente - $${order.totalAfterDiscount?.toFixed ? order.totalAfterDiscount.toFixed(2) : order.totalAfterDiscount}`,
        time: new Date(order.createdAt || Date.now()),
        read: false
      }));
      this.notificationCount = this.notifications.filter(n => !n.read).length;
    });
    
    // Simulación de mensajes (puedes integrar con un servicio real)
    this.messages = [
      { id: '1', sender: 'Cliente: Juan Pérez', preview: 'Consulta sobre producto XYZ', time: new Date(), read: false },
      { id: '2', sender: 'Soporte: María González', preview: 'Actualización de ticket #123', time: new Date(Date.now() - 3600000), read: false }
    ];
    this.messageCount = this.messages.filter(m => !m.read).length;
  }

  addNotification(notification: {id: string; message: string; time: Date; read: boolean}): void {
    this.notifications.unshift(notification);
    this.notificationCount++;
    
    // Reproducir sonido de notificación (opcional)
    // const audio = new Audio('/assets/sounds/notification.mp3');
    // audio.play().catch(() => {});
  }

  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.router.navigate(['/admin/products'], { 
        queryParams: { search: this.searchTerm.trim() }
      });
    }
  }

  toggleUserDropdown(): void {
    this.showUserDropdown = !this.showUserDropdown;
    this.showNotifications = false;
    this.showMessages = false;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.showUserDropdown = false;
    this.showMessages = false;
    
    if (this.showNotifications) {
      // Marcar todas como leídas al abrir
      this.notifications.forEach(n => n.read = true);
      this.notificationCount = 0;
    }
  }

  toggleMessages(): void {
    this.showMessages = !this.showMessages;
    this.showUserDropdown = false;
    this.showNotifications = false;
    
    if (this.showMessages) {
      // Marcar todos como leídos al abrir
      this.messages.forEach(m => m.read = true);
      this.messageCount = 0;
    }
  }

  goToOrder(orderId: string): void {
    this.showNotifications = false;
    this.router.navigate(['/admin/orders'], { queryParams: { orderId } });
  }

  onLogout(): void {
    this.showUserDropdown = false;
    this.authFacade.logout();
  }
}
