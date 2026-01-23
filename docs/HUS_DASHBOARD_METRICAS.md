# HUS — Dashboard con Métricas

## 1) Contexto y Alcance

- Proyecto: Nova Commerce Front
- Objetivo: Implementar un dashboard administrativo con métricas clave del sistema (ventas, usuarios, productos, órdenes, etc.), visualizaciones gráficas y filtros por rango de fechas.

## 2) Principios y Lineamientos

- Visualización clara y responsiva (charts, tablas, KPIs)
- Filtros por fecha y tipo de métrica
- Acceso restringido a usuarios admin
- Actualización en tiempo real (WebSocket/polling)
- Testing exhaustivo

## 3) Roles y Actores

- **Administrador**: Accede y visualiza métricas del sistema

## 4) Arquitectura

- **DashboardService**: Obtiene métricas del backend
- **DashboardComponent**: Renderiza KPIs y gráficos
- **ChartComponent**: Gráficas reutilizables (bar, line, pie)
- **dashboard.routes.ts**: Ruta protegida /admin/dashboard

## 5) Historias de Usuario

### HU-FE-070 — Visualizar métricas clave en dashboard

- **Como** Administrador
- **Quiero** ver métricas clave del sistema en un dashboard
- **Para** tomar decisiones informadas

**Criterios de aceptación:**
```gherkin
Dado que soy administrador autenticado
Cuando accedo a /admin/dashboard
Entonces veo tarjetas con KPIs: total ventas, usuarios activos, productos, órdenes
Y veo gráficos de ventas por mes y usuarios nuevos por semana
Y puedo filtrar por rango de fechas
```

**Trazabilidad técnica:**
- Servicio: DashboardService
- Componente: DashboardComponent, ChartComponent
- Ruta: /admin/dashboard (protegida)

**DoD:**
- KPIs y gráficos visibles y actualizados
- Filtros funcionales
- Responsive y accesible
- Tests pasando

---
