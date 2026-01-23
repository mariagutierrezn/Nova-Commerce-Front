# HUS — Módulo de Ofertas para Usuario

## 1) Contexto y Alcance

- Proyecto: Nova Commerce Front
- Objetivo: Mostrar a los usuarios ofertas y promociones activas.

## 2) Principios y Lineamientos

- Ofertas destacadas en home y sección dedicada
- Responsive y accesible

## 3) Roles y Actores

- **Usuario Autenticado**: Visualiza y aprovecha ofertas

## 4) Arquitectura

- **OffersService**: Consulta ofertas activas
- **OffersComponent**: Lista y destaca ofertas

## 5) Historias de Usuario

### HU-FE-073 — Visualizar ofertas y promociones

- **Como** Usuario Autenticado
- **Quiero** ver ofertas y promociones activas
- **Para** aprovechar descuentos y beneficios

**Criterios de aceptación:**
```gherkin
Dado que estoy autenticado
Cuando accedo a la home o sección de ofertas
Entonces veo una lista de ofertas activas con detalles y fechas de vigencia
```

**Trazabilidad técnica:**
- Servicio: OffersService
- Componente: OffersComponent

**DoD:**
- Ofertas visibles y actualizadas
- Responsive
- Tests pasando

---
