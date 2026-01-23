# HUS — Vista de Clientes en Admin

## 1) Contexto y Alcance

- Proyecto: Nova Commerce Front
- Objetivo: Permitir a administradores visualizar, buscar y filtrar la lista de clientes registrados.

## 2) Principios y Lineamientos

- Tabla paginada y filtrable
- Detalle de cliente accesible
- Acceso restringido a admin

## 3) Roles y Actores

- **Administrador**: Gestiona y consulta clientes

## 4) Arquitectura

- **CustomerAdminService**: Consulta clientes
- **CustomerListComponent**: Tabla de clientes
- **CustomerDetailComponent**: Detalle individual

## 5) Historias de Usuario

### HU-FE-071 — Visualizar y buscar clientes

- **Como** Administrador
- **Quiero** ver y buscar clientes registrados
- **Para** gestionar la base de usuarios

**Criterios de aceptación:**
```gherkin
Dado que soy administrador autenticado
Cuando accedo a la vista de clientes
Entonces veo una tabla con nombre, email, fecha de registro y estado
Y puedo buscar por nombre o email
Y puedo filtrar por estado (activo/inactivo)
```

**Trazabilidad técnica:**
- Servicio: CustomerAdminService
- Componentes: CustomerListComponent, CustomerDetailComponent

**DoD:**
- Tabla paginada y filtrable
- Búsqueda funcional
- Acceso a detalle de cliente
- Tests pasando

---
