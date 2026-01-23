# HUS — Chatbot

## 1) Contexto y Alcance

- Proyecto: Nova Commerce Front
- Objetivo: Implementar un chatbot para atención automática de usuarios.

## 2) Principios y Lineamientos

- Chat embebido en frontend
- Respuestas automáticas y escalado a humano

## 3) Roles y Actores

- **Usuario Autenticado**: Interactúa con el chatbot

## 4) Arquitectura

- **ChatbotService**: Lógica de respuestas automáticas
- **ChatbotComponent**: UI de chat

## 5) Historias de Usuario

### HU-FE-076 — Interactuar con chatbot

- **Como** Usuario Autenticado
- **Quiero** interactuar con un chatbot en el sitio
- **Para** resolver dudas rápidamente

**Criterios de aceptación:**
```gherkin
Dado que estoy autenticado
Cuando abro el chat
Entonces puedo enviar preguntas y recibir respuestas automáticas
Y si el bot no puede responder, me transfiere a un asesor humano
```

**Trazabilidad técnica:**
- Servicio: ChatbotService
- Componente: ChatbotComponent

**DoD:**
- Chatbot funcional y embebido
- Escalado a humano disponible
- Tests pasando

---
