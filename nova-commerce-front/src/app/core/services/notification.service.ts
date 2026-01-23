import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { 
  BehaviorSubject, 
  Observable, 
  Subject, 
  timer, 
  EMPTY
} from 'rxjs';
import { 
  catchError, 
  tap, 
  retry,
  takeUntil
} from 'rxjs/operators';
import { APP_CONFIG } from '../config/app.config';
import { 
  Notification, 
  NotificationEvent, 
  NotificationResponse,
  NotificationQueryParams,
  NotificationPriority
} from '../models/notification.model';

/**
 * Servicio de Notificaciones en Tiempo Real
 * 
 * Gestiona la conexión WebSocket con el backend y mantiene
 * el estado de las notificaciones del administrador.
 * 
 * Features:
 * - Conexión persistente con WebSocket
 * - Reconexión automática en caso de desconexión
 * - Almacenamiento de notificaciones en memoria
 * - Consulta de notificaciones históricas desde el backend
 * - Emisión de eventos para actualización del UI
 * 
 * @example
 * constructor(private notificationService: NotificationService) {
 *   this.notificationService.notifications$.subscribe(notifications => {
 *     console.log('Notificaciones actuales:', notifications);
 *   });
 * }
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly http = inject(HttpClient);
  
  // WebSocket connection
  private socket$: WebSocketSubject<NotificationEvent> | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectInterval = 5000; // 5 segundos
  
  // Estado de notificaciones
  private readonly notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private readonly unreadCountSubject = new BehaviorSubject<number>(0);
  private readonly connectionStatusSubject = new BehaviorSubject<boolean>(false);
  
  // Control de lifecycle
  private readonly destroy$ = new Subject<void>();
  
  // URLs
  private readonly WS_URL = APP_CONFIG.websocket.url;
  private readonly API_URL = `${APP_CONFIG.api.baseUrl}/api/notifications`;
  
  // Observables públicos
  public notifications$ = this.notificationsSubject.asObservable();
  public unreadCount$ = this.unreadCountSubject.asObservable();
  public connectionStatus$ = this.connectionStatusSubject.asObservable();
  
  /**
   * Inicializa la conexión WebSocket
   * Se debe llamar cuando el usuario admin se autentica
   */
  connect(): void {
    if (this.socket$ && !this.socket$.closed) {
      console.log('[NotificationService] Ya existe una conexión activa');
      return;
    }
    
    console.log('[NotificationService] Iniciando conexión WebSocket...');
    
    try {
      this.socket$ = webSocket<NotificationEvent>({
        url: this.WS_URL,
        openObserver: {
          next: () => {
            console.log('[NotificationService] WebSocket conectado');
            this.connectionStatusSubject.next(true);
            this.reconnectAttempts = 0;
          }
        },
        closeObserver: {
          next: () => {
            console.log('[NotificationService] WebSocket desconectado');
            this.connectionStatusSubject.next(false);
            this.handleReconnect();
          }
        }
      });
      
      // Suscribirse a mensajes entrantes
      this.socket$
        .pipe(
          takeUntil(this.destroy$),
          retry({
            count: 3,
            delay: 2000
          }),
          catchError(error => {
            console.error('[NotificationService] Error en WebSocket:', error);
            this.handleReconnect();
            return EMPTY;
          })
        )
        .subscribe({
          next: (event: NotificationEvent) => this.handleNotificationEvent(event),
          error: (error) => {
            console.error('[NotificationService] Error al recibir notificación:', error);
          }
        });
        
    } catch (error) {
      console.error('[NotificationService] Error al crear conexión WebSocket:', error);
      this.handleReconnect();
    }
  }
  
  /**
   * Cierra la conexión WebSocket
   * Se debe llamar cuando el usuario cierra sesión
   */
  disconnect(): void {
    console.log('[NotificationService] Cerrando conexión WebSocket...');
    
    if (this.socket$) {
      this.socket$.complete();
      this.socket$ = null;
    }
    
    this.connectionStatusSubject.next(false);
    this.destroy$.next();
  }
  
  /**
   * Maneja la reconexión automática del WebSocket
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[NotificationService] Número máximo de reintentos alcanzado');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = this.reconnectInterval * this.reconnectAttempts;
    
    console.log(`[NotificationService] Reintentando conexión en ${delay}ms (intento ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    timer(delay)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.connect();
      });
  }
  
  /**
   * Procesa un evento de notificación recibido por WebSocket
   */
  private handleNotificationEvent(event: NotificationEvent): void {
    console.log('[NotificationService] Notificación recibida:', event);
    
    const notification: Notification = {
      id: this.generateNotificationId(),
      type: event.type,
      title: event.data.title,
      message: event.data.message,
      priority: event.data.priority || NotificationPriority.MEDIUM,
      read: false,
      createdAt: event.data.timestamp ? new Date(event.data.timestamp) : new Date(),
      orderId: event.orderId,
      customerId: event.customerId,
      productId: event.productId,
      metadata: event.data
    };
    
    // Agregar al inicio del array
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = [notification, ...currentNotifications];
    
    // Limitar a las últimas 50 notificaciones en memoria
    if (updatedNotifications.length > 50) {
      updatedNotifications.splice(50);
    }
    
    this.notificationsSubject.next(updatedNotifications);
    this.updateUnreadCount();
    
    // Reproducir sonido de notificación (opcional)
    this.playNotificationSound();
  }
  
  /**
   * Carga las notificaciones históricas desde el backend
   */
  loadNotifications(params?: NotificationQueryParams): Observable<NotificationResponse> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
      if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
      if (params.read !== undefined) httpParams = httpParams.set('read', params.read.toString());
      if (params.type) httpParams = httpParams.set('type', params.type);
    }
    
    return this.http.get<NotificationResponse>(this.API_URL, { params: httpParams })
      .pipe(
        tap(response => {
          // Actualizar el estado con las notificaciones cargadas
          const notifications = response.content.map(n => ({
            ...n,
            createdAt: new Date(n.createdAt)
          }));
          
          this.notificationsSubject.next(notifications);
          this.updateUnreadCount();
        }),
        catchError(error => {
          console.error('[NotificationService] Error al cargar notificaciones:', error);
          throw error;
        })
      );
  }
  
  /**
   * Marca una notificación como leída
   */
  markAsRead(notificationId: string): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/${notificationId}/read`, {})
      .pipe(
        tap(() => {
          const notifications = this.notificationsSubject.value.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
          );
          this.notificationsSubject.next(notifications);
          this.updateUnreadCount();
        }),
        catchError(error => {
          console.error('[NotificationService] Error al marcar como leída:', error);
          throw error;
        })
      );
  }
  
  /**
   * Marca todas las notificaciones como leídas
   */
  markAllAsRead(): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/read-all`, {})
      .pipe(
        tap(() => {
          const notifications = this.notificationsSubject.value.map(n => ({ ...n, read: true }));
          this.notificationsSubject.next(notifications);
          this.unreadCountSubject.next(0);
        }),
        catchError(error => {
          console.error('[NotificationService] Error al marcar todas como leídas:', error);
          throw error;
        })
      );
  }
  
  /**
   * Elimina una notificación
   */
  deleteNotification(notificationId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${notificationId}`)
      .pipe(
        tap(() => {
          const notifications = this.notificationsSubject.value.filter(n => n.id !== notificationId);
          this.notificationsSubject.next(notifications);
          this.updateUnreadCount();
        }),
        catchError(error => {
          console.error('[NotificationService] Error al eliminar notificación:', error);
          throw error;
        })
      );
  }
  
  /**
   * Actualiza el contador de notificaciones no leídas
   */
  private updateUnreadCount(): void {
    const unreadCount = this.notificationsSubject.value.filter(n => !n.read).length;
    this.unreadCountSubject.next(unreadCount);
  }
  
  /**
   * Genera un ID único para la notificación
   */
  private generateNotificationId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
  
  /**
   * Reproduce un sonido de notificación (opcional)
   */
  private playNotificationSound(): void {
    try {
      // Descomentar si tienes un archivo de audio
      // const audio = new Audio('/assets/sounds/notification.mp3');
      // audio.play().catch(() => console.log('No se pudo reproducir sonido'));
    } catch (error) {
      console.error('Error al reproducir sonido:', error);
    }
  }
  
  /**
   * Obtiene el estado actual de las notificaciones
   */
  getCurrentNotifications(): Notification[] {
    return this.notificationsSubject.value;
  }
  
  /**
   * Obtiene el contador actual de no leídas
   */
  getCurrentUnreadCount(): number {
    return this.unreadCountSubject.value;
  }
  
  /**
   * Verifica si está conectado al WebSocket
   */
  isConnected(): boolean {
    return this.connectionStatusSubject.value;
  }
}
