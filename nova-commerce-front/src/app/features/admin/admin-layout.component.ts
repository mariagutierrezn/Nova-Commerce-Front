import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HasRoleDirective } from '../auth/directives/has-role.directive';
import { AuthFacade } from '../auth/services/auth.facade';
import { NotificationService } from '../../core/services/notification.service';
import { Notification } from '../../core/models/notification.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, HasRoleDirective, FormsModule],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly authFacade = inject(AuthFacade);
  private readonly notificationService = inject(NotificationService);
  private readonly destroy$ = new Subject<void>();
  
  searchTerm = '';
  showUserDropdown = false;
  notificationCount = 0;
  messageCount = 0;
  showNotifications = false;
  showMessages = false;
  isConnected = false;
  
  notifications: Notification[] = [];
  messages: Array<{id: string; sender: string; preview: string; time: Date; read: boolean}> = [];

  ngOnInit(): void {
    // Inicializar conexión WebSocket
    this.initializeNotifications();
    
    // Suscribirse a las notificaciones en tiempo real
    this.subscribeToNotifications();
    
    // Suscribirse al contador de no leídas
    this.subscribeToUnreadCount();
    
    // Monitorear estado de conexión
    this.monitorConnectionStatus();
    
    // Cargar notificaciones históricas desde el backend
    this.loadHistoricalNotifications();
    
    // Simulación de mensajes (puedes integrar con un servicio real)
    this.loadMessages();
  }

  ngOnDestroy(): void {
    // Desconectar WebSocket
    this.notificationService.disconnect();
    
    // Limpiar suscripciones
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Inicializa la conexión WebSocket para notificaciones
   */
  private initializeNotifications(): void {
    console.log('[AdminLayoutComponent] Inicializando sistema de notificaciones...');
    this.notificationService.connect();
  }

  /**
   * Suscribe al stream de notificaciones en tiempo real
   */
  private subscribeToNotifications(): void {
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (notifications) => {
          console.log('[AdminLayoutComponent] Notificaciones actualizadas:', notifications.length);
          this.notifications = notifications;
        },
        error: (error) => {
          console.error('[AdminLayoutComponent] Error en stream de notificaciones:', error);
        }
      });
  }

  /**
   * Suscribe al contador de notificaciones no leídas
   */
  private subscribeToUnreadCount(): void {
    this.notificationService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (count) => {
          console.log('[AdminLayoutComponent] Contador de no leídas:', count);
          this.notificationCount = count;
        },
        error: (error) => {
          console.error('[AdminLayoutComponent] Error en contador:', error);
        }
      });
  }

  /**
   * Monitorea el estado de la conexión WebSocket
   */
  private monitorConnectionStatus(): void {
    this.notificationService.connectionStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (isConnected) => {
          console.log('[AdminLayoutComponent] Estado de conexión:', isConnected ? 'Conectado' : 'Desconectado');
          this.isConnected = isConnected;
          
          if (!isConnected) {
            console.warn('[AdminLayoutComponent] WebSocket desconectado. Reintentando...');
          }
        },
        error: (error) => {
          console.error('[AdminLayoutComponent] Error al monitorear conexión:', error);
        }
      });
  }

  /**
   * Carga las notificaciones históricas desde el backend
   * Esto asegura la persistencia de notificaciones al refrescar
   */
  private loadHistoricalNotifications(): void {
    this.notificationService.loadNotifications({ 
      page: 0, 
      size: 20,
      read: false  // Solo cargar las no leídas
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        console.log(`[AdminLayoutComponent] Notificaciones históricas cargadas: ${response.totalElements} total`);
      },
      error: (error) => {
        console.error('[AdminLayoutComponent] Error al cargar notificaciones históricas:', error);
        // En caso de error, continuar con el sistema de notificaciones en tiempo real
      }
    });
  }

  /**
   * Carga los mensajes (simulación - integrar con servicio real)
   */
  private loadMessages(): void {
    this.messages = [
      { 
        id: '1', 
        sender: 'Cliente: Juan Pérez', 
        preview: 'Consulta sobre producto XYZ', 
        time: new Date(), 
        read: false 
      },
      { 
        id: '2', 
        sender: 'Soporte: María González', 
        preview: 'Actualización de ticket #123', 
        time: new Date(Date.now() - 3600000), 
        read: false 
      }
    ];
    this.messageCount = this.messages.filter(m => !m.read).length;
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
      // Marcar todas las notificaciones como leídas
      this.markAllNotificationsAsRead();
    }
  }

  /**
   * Marca todas las notificaciones como leídas
   */
  private markAllNotificationsAsRead(): void {
    if (this.notificationCount > 0) {
      this.notificationService.markAllAsRead()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log('[AdminLayoutComponent] Todas las notificaciones marcadas como leídas');
          },
          error: (error) => {
            console.error('[AdminLayoutComponent] Error al marcar notificaciones como leídas:', error);
            // En caso de error, marcar localmente
            this.notificationCount = 0;
          }
        });
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

  /**
   * Navega al detalle de un pedido desde una notificación
   */
  goToOrder(notification: Notification): void {
    this.showNotifications = false;
    
    if (notification.orderId) {
      // Marcar como leída antes de navegar
      this.notificationService.markAsRead(notification.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log(`[AdminLayoutComponent] Notificación ${notification.id} marcada como leída`);
          },
          error: (error) => {
            console.error('[AdminLayoutComponent] Error al marcar notificación:', error);
          }
        });
      
      // Navegar al detalle del pedido
      this.router.navigate(['/admin/orders'], { 
        queryParams: { orderId: notification.orderId } 
      });
    }
  }

  /**
   * Elimina una notificación
   */
  deleteNotification(notification: Notification, event: Event): void {
    event.stopPropagation();
    
    this.notificationService.deleteNotification(notification.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log(`[AdminLayoutComponent] Notificación ${notification.id} eliminada`);
        },
        error: (error) => {
          console.error('[AdminLayoutComponent] Error al eliminar notificación:', error);
        }
      });
  }

  /**
   * Formatea el tiempo de la notificación de manera legible
   */
  formatNotificationTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours} h`;
    return `Hace ${days} días`;
  }

  onLogout(): void {
    this.showUserDropdown = false;
    
    // Desconectar notificaciones antes de cerrar sesión
    this.notificationService.disconnect();
    
    // Cerrar sesión
    this.authFacade.logout();
  }
}
