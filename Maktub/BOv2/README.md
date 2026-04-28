# Backoffice - Maktub

Implementación frontend de la sección **Panel** del backoffice, basada en Figma para desktop (1440px) y mobile (360px), incluyendo estado de menú móvil desplegado.



## Estructura

/root
├── index.html
├── carteras.html
├── membresias.html
├── referidos.html
├── transacciones.html
│
├── css/
│   ├── tokens.css
│   ├── styles.css
│   └── charts.css
├── js/
│   └── main.js
├── assets/
│   ├── img/
│   └── icons/
└── README.md


## Alcance implementado

- Sección 1 (`index.html`) maquetada con diseño responsive (mobile first).
- Menú desktop y menú mobile con estado abierto/cerrado.
- Tarjetas de resumen, paneles laterales y gráficas con Chart.js.
- SEO base y metadatos en todos los HTML.
- Sección `referidos.html` implementada con layout de generaciones y estados visuales de referidos.
- Sección `transacciones.html` implementada con filtros, calendario, exportación CSV, paginado y vista móvil en tarjetas.
- Sección `membresias.html` implementada según Figma con detalle de membresía activa, estado de plan y bloque de beneficios elite.


## UI Kit (componentes reutilizables)

- `cm-nav__item`: navegación principal (desktop/mobile) con estados `hover`, `active`.
- `cm-card` / `cm-side-card`: base de tarjetas de contenido.
- `cm-stat-card`: tarjeta de métricas financieras.
- `cm-chart-card` / `cm-line-card`: contenedores de gráficas.
- `cm-badge`: indicadores de valor (azul y verde).
- `cm-btn cm-btn--primary` y `cm-btn--pill`: botones con estados `hover`, `active`, `disabled`.
- `cm-input`: campo reutilizable con validación visual.
- `cm-progress`: barra de progreso para estado embajador.

## Decisiones técnicas

- **Variables globales en `:root`**: colores, tipografías, spacing, radios, sombras, tamaños y tokens de gráficas.
- **Tipografías**:
  - Encabezados: `HK Guise` (fuentes locales en `webfont/`).
  - Cuerpo: `Satoshi` (CDN).
- **Escalabilidad CSS**: nomenclatura con prefijo `cm-` en clases propias.
- **Accesibilidad base**:
  - `aria-label`/`role` en navegación, gráficas y progressbar.
  - Etiqueta asociada para input de referido.
  - Feedback con `aria-live`.
- **Validación de formulario**: el enlace de referido se valida como URL antes de copiar al portapapeles.
- **Chart.js**:
  - Configuración desacoplada en `main.js`.
  - Ajustes visuales de canvas en `css/charts.css`.

## Registro de cambios

- `2026-04-02`: Se ajusta la navegación móvil para que el contenido principal no desaparezca al abrir el menú y el panel desplegable tenga scroll interno en pantallas pequeñas, evitando recortes de contenido.
- `2026-04-02`: Se rediseña el formulario `Transferir carteras` en `carteras.html` 

## Notas

- Se incluye Bootstrap 5.3.8 como parte del stack requerido.
- No se implementa backend ni consumo de APIs.
- No hay autenticación real.
