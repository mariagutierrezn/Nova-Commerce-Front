# Test Cases — Historias de Usuario Nuevas

Este documento agrupa los casos de prueba para cada HU implementada, con título, ID, descripción y pasos en formato Gherkin.

---

## Test Case: Dashboard con Métricas
- **HU:** HU-FE-070 — Visualizar métricas clave en dashboard
- **ID:** TC-FE-070-01
- **Descripción:** Verificar que el administrador puede visualizar KPIs y gráficos en el dashboard y filtrar por fechas.

```gherkin
Feature: Dashboard de métricas
  Scenario: Visualización de métricas y gráficos
    Given que soy administrador autenticado
    When accedo a /admin/dashboard
    Then veo tarjetas con KPIs: total ventas, usuarios activos, productos, órdenes
    And veo gráficos de ventas por mes y usuarios nuevos por semana
    And puedo filtrar por rango de fechas
```

---

## Test Case: Vista de Clientes en Admin
- **HU:** HU-FE-071 — Visualizar y buscar clientes
- **ID:** TC-FE-071-01
- **Descripción:** Validar que el administrador puede ver, buscar y filtrar clientes.

```gherkin
Feature: Vista de clientes admin
  Scenario: Buscar y filtrar clientes
    Given que soy administrador autenticado
    When accedo a la vista de clientes
    Then veo una tabla con nombre, email, fecha de registro y estado
    And puedo buscar por nombre o email
    And puedo filtrar por estado (activo/inactivo)
```

---

## Test Case: Edición de Reglas de Descuentos
- **HU:** HU-FE-072 — Editar reglas de descuentos
- **ID:** TC-FE-072-01
- **Descripción:** Validar que el administrador puede crear, editar y eliminar reglas de descuentos.

```gherkin
Feature: Edición de reglas de descuentos
  Scenario: CRUD de reglas de descuentos
    Given que soy administrador autenticado
    When accedo a la sección de descuentos
    Then veo una lista de reglas existentes
    And puedo crear una nueva regla con nombre, tipo, valor y condiciones
    And puedo editar o eliminar reglas existentes
```

---

## Test Case: Módulo de Ofertas para Usuario
- **HU:** HU-FE-073 — Visualizar ofertas y promociones
- **ID:** TC-FE-073-01
- **Descripción:** Validar que el usuario autenticado puede ver ofertas activas.

```gherkin
Feature: Módulo de ofertas
  Scenario: Visualización de ofertas
    Given que estoy autenticado
    When accedo a la home o sección de ofertas
    Then veo una lista de ofertas activas con detalles y fechas de vigencia
```

---

## Test Case: Modernización del Frontend
- **HU:** HU-FE-074 — Experiencia de usuario modernizada
- **ID:** TC-FE-074-01
- **Descripción:** Validar que la UI es moderna, rápida y responsiva tras la modernización.

```gherkin
Feature: Modernización del frontend
  Scenario: UI modernizada y rápida
    Given que accedo al sitio
    When navego entre páginas
    Then la UI es moderna, rápida y responsiva
    And los tiempos de carga son mínimos
```

---

## Test Case: Formularios de Detalle y Compra
- **HU:** HU-FE-075 — Formularios claros y validados
- **ID:** TC-FE-075-01
- **Descripción:** Validar que los formularios de detalle y compra son claros y tienen validación reactiva.

```gherkin
Feature: Formularios de detalle y compra
  Scenario: Validación de formularios
    Given que accedo a un producto o al checkout
    When completo el formulario
    Then los campos se validan en tiempo real
    And no puedo enviar si hay errores
```

---

## Test Case: Chatbot
- **HU:** HU-FE-076 — Interactuar con chatbot
- **ID:** TC-FE-076-01
- **Descripción:** Validar que el usuario puede interactuar con el chatbot y ser transferido a un humano si es necesario.

```gherkin
Feature: Chatbot
  Scenario: Interacción y escalado
    Given que estoy autenticado
    When abro el chat
    Then puedo enviar preguntas y recibir respuestas automáticas
    And si el bot no puede responder, me transfiere a un asesor humano
```

---

## Test Case: Notificaciones
- **HU:** HU-FE-077 — Recibir notificaciones en tiempo real
- **ID:** TC-FE-077-01
- **Descripción:** Validar que usuarios y admins reciben notificaciones push en tiempo real y pueden gestionarlas.

```gherkin
Feature: Notificaciones push
  Scenario: Recepción y gestión de notificaciones
    Given que estoy autenticado
    When ocurre un evento relevante (orden, oferta, alerta)
    Then recibo una notificación en la UI
    And puedo marcarla como leída o descartarla
```

---
