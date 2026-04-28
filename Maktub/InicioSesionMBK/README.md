# Onboarding - MBK

Implementación frontend de onboarding basada en Figma con enfoque pixel-accurate, componentes reutilizables, validaciones y estructura lista para escalar.

## Estructura

```text
/InicioSesionMBK
├── index_.html
├── crear-cuenta.html
├── inicio-sesion.html
├── ingresa-pin.html
├── perfil-usuario.html
├── ronda-privada.html
├── recompensas.html
├── layout_base.html
├── old.html
├── uikit.html
├── css/
│   ├── tokens.css
│   ├── styles.css
│   ├── recompensas.css
│   └── recompensas-chart.css
├── js/
│   ├── main.js
│   └── recompensas-chart.js
├── assets/
│   ├── fonts/
│   ├── img/
│   │   └── mk-onboarding-illustration.png
│   ├── recompensas/
│   │   ├── rw-grade-badge.png
│   │   ├── rw-token-diamond.png
│   │   ├── rw-grade-card-bg.svg
│   │   ├── rw-ring-maks-rs.svg
│   │   ├── rw-ring-100.svg
│   │   ├── rw-ring-20.svg
│   │   ├── rw-ring-70.svg
│   │   └── rw-ring-99.svg
│   ├── ronda-privada/
│   │   ├── rp-card-elite.png
│   │   ├── rp-sphere-bg.png
│   │   ├── rp-line-main.svg
│   │   └── rp-line-table.svg
│   └── icons/
│       ├── mk-check.svg
│       └── mk-step-connector.svg
└── README.md
```

## Archivos clave

- `index_.html`: pantalla “¡Bienvenido!” (Figma `516:394`).
- `crear-cuenta.html`: nueva pantalla “Crea tu cuenta”  con formulario validado.
- `inicio-sesion.html`: pantalla “Inicio de sesión” implementada 1:1 con validación de acceso.
- `ingresa-pin.html`: pantalla “Confirmación de código” implementada 1:1.
- `perfil-usuario.html`: pantalla “Perfil de usuario” implementada 1:1 con modal de confirmación de guardado.
- `ronda-privada.html`: pantalla “Ronda Privada” implementada 1:1 con sección de balance y detalle de participaciones.
- `recompensas.html`: pantalla “Recompensas” implementada 1:1 con cards de puntos y gráfica mensual (Chart.js).
- `layout_base.html`: base del layout con solo la columna de formulario para insertar snippets HTML.
- `old.html`: layout base legacy/referencial del shell de onboarding.
- `uikit.html`: catálogo de componentes reutilizables.
- `css/tokens.css`: design tokens (colores, tipografía, spacing, layouts, radios).
- `css/styles.css`: estilos modulares `mk-*`, estados, responsive y variantes para login/código/perfil/ronda (`mk-login-*`, `mk-code-*`, `mk-profile-*`, `mk-ronda-*`).
- `css/recompensas.css`: layout y responsive de la sección de recompensas.
- `css/recompensas-chart.css`: variables/estilos para colores y tipografía de la gráfica.
- `js/main.js`: validaciones y comportamiento de formularios (bienvenida + login + registro + PIN + perfil).
- `js/recompensas-chart.js`: inicialización y comportamiento de la gráfica de recompensas (Chart.js).

## Librerías externas

- Bootstrap 5.3.8 (CDN jsDelivr).
- Bootstrap Icons 1.11.3 (CDN jsDelivr).

## Decisiones técnicas

- Arquitectura CSS por tokens + componentes reutilizables (`mk-input`, `mk-code-input`, `mk-btn-primary`, `mk-form-check`, `mk-onboarding__visual`).
- Reutilización de base visual (fondo, grid principal, imagen lateral y sistema de inputs) para mantener consistencia entre páginas.
- `layout_base.html` aislado con la columna de formulario para acelerar nuevas vistas del flujo sin duplicar diseño completo.
- Validaciones en `main.js` sin dependencias externas:
  - Nombre y apellido requeridos (mínimo 2 caracteres válidos).
  - Email con formato válido.
  - Contraseña segura (8+ caracteres, mayúscula, minúscula, número y símbolo).
  - Confirmación de contraseña.
  - Aceptación de términos obligatoria.
  - Inicio de sesión con validación de email y contraseña (8+ caracteres), toggle de contraseña y CTA habilitado por validez.
  - Componente de código de 6 dígitos reutilizable con autoavance, pegado de código completo y navegación por teclado.
  - Estado del botón `Validar código` basado en completitud del PIN + countdown para “Reenviar código”.
  - Flujo de perfil con botones `Guardar` habilitados por cambios y confirmación de guardado vía modal.

## UX y Accesibilidad (WCAG AA)

- Estructura semántica con `main`, `section`, `form`, `fieldset`, `legend`, `label`, `button`.
- Etiquetas asociadas a inputs y mensajes con `aria-live="polite"`.
- Foco visible para teclado (`focus-visible`) en inputs, botones, enlaces e iconos de acción.
- Mensajes de error específicos por campo y feedback global de formulario.
- Estados visuales implementados: `hover`, `focus`, `error`, `disabled`.

## QA funcional y visual

Checklist aplicado:

- [x] Implementación 1:1 de pantalla `556:797` en desktop.
- [x] Implementación 1:1 de pantalla `551:678` en desktop.
- [x] Implementación 1:1 de pantalla `556:927` en desktop.
- [x] Implementación 1:1 de pantalla `556:1065` en desktop.
- [x] Responsive sin overflow horizontal (desktop/tablet/mobile).
- [x] Reutilización de componentes del sistema actual (`index` + `uikit`).
- [x] Validación de formulario completa y bloqueo de envío hasta ser válido.
- [x] Botón `Registrarme` deshabilitado hasta cumplir reglas + términos.
- [x] Botón `Ingresar` deshabilitado hasta validar email + password.
- [x] Botón `Validar código` deshabilitado hasta capturar 6 dígitos.
- [x] Input de código reutilizable implementado (`data-mk-code-input` + `initCodeInputComponents`).
- [x] Modal de confirmación de guardado implementado para la pantalla de perfil.
- [x] Pantalla `ronda-privada.html` implementada 1:1 + tabla transformada a tarjetas en móvil.
- [x] Pantalla `recompensas.html` implementada 1:1 + optimización móvil de tarjetas y gráfica.
- [x] `layout_base.html` creado con solo la columna de formulario.

## Ejecución



## Accesos HTML

| Archivo | Acceso |
| --- | --- |
| `index_.html` | [index_.html](index_.html) |
| `crear-cuenta.html` | [crear-cuenta.html](crear-cuenta.html) |
| `inicio-sesion.html` | [inicio-sesion.html](inicio-sesion.html) |
| `ingresa-pin.html` | [ingresa-pin.html](ingresa-pin.html) |
| `perfil-usuario.html` | [perfil-usuario.html](perfil-usuario.html) |
| `ronda-privada.html` | [ronda-privada.html](ronda-privada.html) |
| `recompensas.html` | [recompensas.html](recompensas.html) |
| `layout_base.html` | [layout_base.html](layout_base.html) |
| `uikit.html` | [uikit.html](uikit.html) |
| `old.html` | [old.html](old.html) |
