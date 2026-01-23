/**
 * Modelo de datos para Notificaciones del Admin
 * Define la estructura de las notificaciones en tiempo real
 */

/**
 * Tipos de notificaciones disponibles en el sistema
 */
export enum NotificationType {
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_UPDATED = 'ORDER_UPDATED',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  LOW_STOCK = 'LOW_STOCK',
  NEW_CUSTOMER = 'NEW_CUSTOMER',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
}

/**
 * Prioridad de la notificación para determinar su presentación
 */
export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

/**
 * Estructura completa de una notificación
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  read: boolean;
  createdAt: Date;
  orderId?: string;
  customerId?: string;
  productId?: string;
  metadata?: Record<string, any>;
}

/**
 * Evento de notificación recibido desde el WebSocket
 * Este es el formato que llega desde el backend
 */
export interface NotificationEvent {
  type: NotificationType;
  orderId?: string;
  customerId?: string;
  productId?: string;
  data: {
    title: string;
    message: string;
    priority?: NotificationPriority;
    timestamp?: string;
    [key: string]: any;
  };
}

/**
 * Respuesta paginada del endpoint de notificaciones
 */
export interface NotificationResponse {
  content: Notification[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

/**
 * Parámetros para obtener notificaciones
 */
export interface NotificationQueryParams {
  page?: number;
  size?: number;
  read?: boolean;
  type?: NotificationType;
}
