# Sistema de Notificaciones en Tiempo Real - Nova Commerce

## 📋 Resumen

Se ha implementado un sistema completo de notificaciones en tiempo real para el Dashboard de Admin usando **WebSocket** con **RxJS WebSocketSubject**, siguiendo las mejores prácticas de Angular y arquitectura orientada a eventos.

## 🏗️ Arquitectura

### Componentes Creados

```
src/app/
├── core/
│   ├── models/
│   │   └── notification.model.ts          # Interfaces TypeScript
│   ├── services/
│   │   └── notification.service.ts        # Servicio de Notificaciones
│   └── config/
│       └── app.config.ts                   # Configuración actualizada
└── features/
    └── admin/
        ├── admin-layout.component.ts      # Componente refactorizado
        ├── admin-layout.component.html    # Template actualizado
        └── admin-layout.component.scss    # Estilos mejorados
```

## 📦 Modelos TypeScript

### Notification Interface
```typescript
interface Notification {
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
```

### NotificationEvent (WebSocket)
```typescript
interface NotificationEvent {
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
```

## 🔌 NotificationService

### Funcionalidades Principales

1. **Conexión WebSocket Persistente**
   - URL: `ws://localhost:8080/ws/notifications`
   - Reconexión automática (máx. 5 intentos)
   - Manejo de errores robusto

2. **Observables Reactivos**
   ```typescript
   notifications$: Observable<Notification[]>
   unreadCount$: Observable<number>
   connectionStatus$: Observable<boolean>
   ```

3. **API REST para Persistencia**
   - `GET /api/notifications` - Cargar historial
   - `PATCH /api/notifications/{id}/read` - Marcar como leída
   - `PATCH /api/notifications/read-all` - Marcar todas
   - `DELETE /api/notifications/{id}` - Eliminar notificación

4. **Características Avanzadas**
   - Buffer de 50 notificaciones en memoria
   - Reproducción de sonido (configurable)
   - Formateo inteligente de timestamps
   - Priorización de notificaciones

### Uso del Servicio

```typescript
constructor(private notificationService: NotificationService) {
  // Conectar WebSocket
  this.notificationService.connect();
  
  // Suscribirse a notificaciones
  this.notificationService.notifications$.subscribe(notifications => {
    console.log('Notificaciones:', notifications);
  });
  
  // Suscribirse al contador
  this.notificationService.unreadCount$.subscribe(count => {
    console.log('No leídas:', count);
  });
}

ngOnDestroy() {
  // Desconectar al destruir
  this.notificationService.disconnect();
}
```

## 🎨 UI/UX

### Características Visuales

1. **Indicador de Conexión**
   - Punto verde pulsante: Conectado
   - Punto rojo intermitente: Desconectado

2. **Badge de Notificaciones**
   - Muestra el contador de no leídas
   - Se actualiza en tiempo real

3. **Dropdown de Notificaciones**
   - Lista completa de notificaciones
   - Prioridad visual (colores)
   - Botón de eliminar por notificación
   - Formato de tiempo relativo ("Hace 5 min")

4. **Prioridades**
   - URGENT: Borde rojo + fondo rojo claro
   - HIGH: Borde naranja
   - MEDIUM: Estilo estándar
   - LOW: Estilo estándar

### Interacciones

```typescript
// Abrir dropdown
toggleNotifications()

// Click en notificación → Navegar al detalle
goToOrder(notification)

// Eliminar notificación
deleteNotification(notification, event)

// Formato de tiempo
formatNotificationTime(date)
```

## 🔄 Flujo de Notificaciones

### 1. Backend → Frontend (Evento)

```
1. Usuario realiza compra
2. Backend publica evento en RabbitMQ
3. Notification Service consume el evento
4. Backend envía por WebSocket:
   
   {
     "type": "ORDER_CREATED",
     "orderId": "abc123",
     "data": {
       "title": "Nuevo Pedido",
       "message": "Pedido #abc123 por $150.00",
       "priority": "HIGH",
       "timestamp": "2026-01-22T10:30:00Z"
     }
   }
   
5. Frontend recibe y procesa el evento
6. UI se actualiza automáticamente
```

### 2. Frontend → Backend (Persistencia)

```
1. Usuario abre el dashboard
2. Frontend llama GET /api/notifications
3. Carga notificaciones históricas
4. Usuario marca como leída → PATCH /api/notifications/{id}/read
5. Usuario elimina → DELETE /api/notifications/{id}
```

## ⚙️ Configuración

### APP_CONFIG (app.config.ts)

```typescript
websocket: {
  url: 'ws://localhost:8080/ws/notifications',
  reconnectAttempts: 5,
  reconnectInterval: 5000,
  heartbeatInterval: 30000,
},

notifications: {
  maxStoredInMemory: 50,
  defaultPageSize: 20,
  soundEnabled: true,
  soundPath: '/assets/sounds/notification.mp3',
}
```

## 🧪 Testing

### Simular Notificación Manualmente

```typescript
// En la consola del navegador
const testNotification = {
  type: 'ORDER_CREATED',
  orderId: 'test-123',
  data: {
    title: 'Test Notification',
    message: 'This is a test',
    priority: 'HIGH',
    timestamp: new Date().toISOString()
  }
};

// Enviar por WebSocket (si tienes acceso al socket)
socket.next(testNotification);
```

## 📝 Endpoints del Backend (Requeridos)

### WebSocket
```
ws://localhost:8080/ws/notifications
```

### REST API
```
GET    /api/notifications?page=0&size=20&read=false
PATCH  /api/notifications/{id}/read
PATCH  /api/notifications/read-all
DELETE /api/notifications/{id}
```

### Formato de Respuesta (GET)
```json
{
  "content": [
    {
      "id": "notif_123",
      "type": "ORDER_CREATED",
      "title": "Nuevo Pedido",
      "message": "Pedido #abc123 por $150.00",
      "priority": "HIGH",
      "read": false,
      "createdAt": "2026-01-22T10:30:00Z",
      "orderId": "abc123"
    }
  ],
  "totalElements": 42,
  "totalPages": 3,
  "size": 20,
  "number": 0
}
```

## 🚀 Integración con Backend

### Spring Boot + RabbitMQ (Ejemplo)

```java
@Service
public class OrderNotificationService {
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @RabbitListener(queues = "order.created")
    public void handleOrderCreated(OrderEvent event) {
        NotificationDTO notification = NotificationDTO.builder()
            .type(NotificationType.ORDER_CREATED)
            .orderId(event.getOrderId())
            .data(Map.of(
                "title", "Nuevo Pedido",
                "message", String.format("Pedido #%s por $%.2f", 
                    event.getOrderId(), event.getTotal()),
                "priority", "HIGH",
                "timestamp", Instant.now().toString()
            ))
            .build();
            
        // Enviar por WebSocket a admins
        messagingTemplate.convertAndSend(
            "/topic/admin/notifications", 
            notification
        );
    }
}
```

## 🔐 Seguridad

### Consideraciones

1. **Autenticación WebSocket**: Enviar token JWT al conectar
2. **Autorización**: Solo usuarios ADMIN deben recibir notificaciones
3. **Rate Limiting**: Limitar frecuencia de mensajes
4. **Validación**: Sanitizar datos del backend

### Implementación con Token

```typescript
// En notification.service.ts
private getWebSocketUrl(): string {
  const token = localStorage.getItem('access_token');
  return `${this.WS_URL}?token=${token}`;
}

// Actualizar en connect()
this.socket$ = webSocket({
  url: this.getWebSocketUrl(),
  // ...
});
```

## 📊 Performance

### Optimizaciones Implementadas

1. **Buffer Limitado**: Solo 50 notificaciones en memoria
2. **Lazy Loading**: Cargar más notificaciones bajo demanda
3. **Debouncing**: Para marcar como leídas
4. **Virtual Scrolling**: Para listas largas (a implementar)

## 🐛 Troubleshooting

### WebSocket no conecta

```bash
# Verificar que el backend esté corriendo
curl http://localhost:8080/actuator/health

# Verificar WebSocket endpoint
wscat -c ws://localhost:8080/ws/notifications
```

### Notificaciones no se muestran

1. Verificar consola del navegador
2. Confirmar que el servicio esté conectado: `isConnected === true`
3. Revisar que el componente esté suscrito correctamente
4. Verificar que el usuario tenga rol ADMIN

### Reconexión infinita

- Revisar URL del WebSocket en APP_CONFIG
- Verificar que el backend acepte conexiones WebSocket
- Comprobar logs del servidor

## 🎯 Próximos Pasos

### Mejoras Futuras

1. **Notificaciones Push del Navegador**
   ```typescript
   Notification.requestPermission().then(permission => {
     if (permission === 'granted') {
       new Notification('Nuevo Pedido', {
         body: 'Tienes un nuevo pedido pendiente',
         icon: '/icon.png'
       });
     }
   });
   ```

2. **Filtros Avanzados**
   - Por tipo de notificación
   - Por rango de fechas
   - Por prioridad

3. **Acciones Rápidas**
   - Aprobar/Rechazar desde la notificación
   - Responder directamente

4. **Analytics**
   - Tiempo promedio de respuesta
   - Notificaciones más frecuentes
   - Tasa de lectura

## 📚 Recursos

- [RxJS WebSocket](https://rxjs.dev/api/webSocket/webSocket)
- [Angular Services](https://angular.dev/guide/di/creating-injectable-service)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Spring WebSocket](https://spring.io/guides/gs/messaging-stomp-websocket)

## ✅ Checklist de Implementación

- [x] Modelos TypeScript definidos
- [x] NotificationService implementado
- [x] Conexión WebSocket con reconexión automática
- [x] Persistencia con API REST
- [x] UI/UX actualizada en AdminLayoutComponent
- [x] Estilos CSS para notificaciones
- [x] Indicador de estado de conexión
- [x] Manejo de errores robusto
- [ ] Tests unitarios
- [ ] Tests E2E
- [ ] Backend WebSocket endpoint
- [ ] Backend REST API endpoints
- [ ] Integración con RabbitMQ
- [ ] Documentación backend
- [ ] Despliegue producción

---

**Autor**: Senior Fullstack Developer  
**Fecha**: Enero 2026  
**Versión**: 1.0.0
