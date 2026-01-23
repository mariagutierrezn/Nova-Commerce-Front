/**
 * Configuración global de la aplicación
 * Define variables y constantes que se usan en toda la app
 */

export const APP_CONFIG = {
  // Configuración de API
  api: {
    baseUrl: 'http://localhost:8080',
    timeout: 30000,
    apiGateway: '/api/v1',
  },

  // Configuración de la aplicación
  app: {
    name: 'Nova Commerce',
    version: '1.0.0',
  },

  // Rutas públicas
  routes: {
    home: '/',
    products: '/products',
    productDetail: '/products/:id',
    orders: '/orders',
    admin: '/admin',
    login: '/auth/login', // Para implementar en ETAPA 2
  },

  // Timing y configuración de sesión (para ETAPA 2)
  session: {
    tokenKey: 'access_token',
    refreshTokenKey: 'refresh_token',
    sessionStorageKey: 'user_session',
  },

  // Configuración de WebSocket para notificaciones en tiempo real
  websocket: {
    url: 'http://localhost:8080/ws',
    reconnectAttempts: 5,
    reconnectInterval: 5000, // 5 segundos
    heartbeatInterval: 30000, // 30 segundos
  },

  // Configuración de notificaciones
  notifications: {
    maxStoredInMemory: 50,
    defaultPageSize: 20,
    soundEnabled: true,
    soundPath: '/assets/sounds/notification.mp3',
  },
};
