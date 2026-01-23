# HUS — Edición de Reglas de Descuentos

## 1) Contexto y Alcance

- Proyecto: Nova Commerce Front
- Objetivo: Permitir a administradores crear, editar y eliminar reglas de descuentos desde el frontend.

## 2) Principios y Lineamientos

- Formularios validados
- Acceso restringido a admin
- Sincronización con backend

## 3) Roles y Actores

- **Administrador**: Gestiona reglas de descuentos

## 4) Arquitectura

- **DiscountRuleService**: CRUD de reglas
- **DiscountRuleListComponent**: Lista de reglas
- **DiscountRuleFormComponent**: Formulario de edición/creación

## 5) Historias de Usuario

### HU-FE-072 — Editar reglas de descuentos

- **Como** Administrador
- **Quiero** crear, editar y eliminar reglas de descuentos
- **Para** gestionar promociones de forma flexible

**Criterios de aceptación:**
```gherkin
Dado que soy administrador autenticado
Cuando accedo a la sección de descuentos
Entonces veo una lista de reglas existentes
Y puedo crear una nueva regla con nombre, tipo, valor y condiciones
Y puedo editar o eliminar reglas existentes
```

**Trazabilidad técnica:**
- Servicio: DiscountRuleService
- Componentes: DiscountRuleListComponent, DiscountRuleFormComponent

**DoD:**
- CRUD funcional de reglas
- Validación de formularios
- Sincronización con backend
- Tests pasando

---
