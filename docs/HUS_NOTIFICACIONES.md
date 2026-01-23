# HUS — Notificaciones

## 1) Contexto y Alcance

- Proyecto: Nova Commerce Front
- Objetivo: Implementar sistema de notificaciones push para usuarios y admins.

## 2) Principios y Lineamientos

- Notificaciones en tiempo real (WebSocket)
- UI clara y configurable

## 3) Roles y Actores

- **Usuario Autenticado**: Recibe notificaciones de pedidos, ofertas, etc.
- **Administrador**: Recibe alertas del sistema

## 4) Arquitectura

- **NotificationService**: Maneja suscripción y recepción
- **NotificationComponent**: UI de notificaciones

## 5) Historias de Usuario

### HU-FE-077 — Recibir notificaciones en tiempo real

- **Como** Usuario Autenticado o Administrador
- **Quiero** recibir notificaciones en tiempo real
- **Para** estar informado de eventos importantes

**Criterios de aceptación:**
```gherkin
Dado que estoy autenticado
Cuando ocurre un evento relevante (orden, oferta, alerta)
Entonces recibo una notificación en la UI
Y puedo marcarla como leída o descartarla
```

**Trazabilidad técnica:**
- Servicio: NotificationService
- Componente: NotificationComponent

**DoD:**
- Notificaciones push funcionales
- UI clara y accesible
- Tests pasando

---
