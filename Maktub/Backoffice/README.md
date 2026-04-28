# Backoffice - Maktub

Implementación frontend del backoffice con enfoque en componentes reutilizables, responsive mobile-first y escalabilidad.

## Cómo ejecutar el proyecto

1. Abre la carpeta `Maktub/Backoffice` en tu editor.
2. Ejecuta un servidor estático local (ej. Live Server, `npx serve`, o similar).
3. Navega en el navegador por las páginas:
   - `index.html`
   - `carteras.html`
   - `membresias.html`
   - `perfil.html`
   - `referidos.html`
   - `transacciones.html`

## Estructura

```text
/project
├── index.html
├── carteras.html
├── membresias.html
├── perfil.html
├── referidos.html
├── transacciones.html
├── css/
│   ├── tokens.css
│   └── styles.css
├── js/
│   └── main.js
├── assets/
│   ├── img/
│   └── icons/
└── README.md
```

## Decisiones técnicas

- **Arquitectura visual**:
  - Se centralizaron los tokens globales en `css/tokens.css` dentro de `:root`.
  - Variables incluidas: color, tipografía, spacing, radios, sombras y tokens para gráficas.
- **Naming y reutilización**:
  - Prefijo de clases `cm-` para componentes propios.
  - Componentes base reutilizados: `cm-card`, `cm-button`, `cm-badge`, `cm-form`, `cm-table`, `cm-nav-link`.
- **Responsive mobile-first**:
  - Layout base en una columna y escalado con breakpoints `40rem` y `62rem`.
  - Navegación colapsable en móvil con apertura por botón.
- **Accesibilidad**:
  - `aria-label`, `aria-live`, `aria-current`, skip-link y estados de foco visibles.
  - Formularios con validación básica y mensajes de error por campo.
- **Gráficas**:
  - Chart.js (CDN) con inicialización en `js/main.js`.
  - Colores de charts conectados a variables CSS para mantenimiento rápido.
- **SEO On-Page**:
  - Metadatos por página: `title`, `description`, `robots`, `theme-color`, Open Graph y Twitter.

## QA rápido aplicado

- [x] Layout visual coherente con el diseño base proporcionado.
- [x] Responsive desktop / tablet / mobile.
- [x] Variables globales funcionando desde `:root`.
- [x] Componentes reutilizables sin estilos inline.
- [x] Estados `hover`, `active` y `disabled` en navegación y botones.
- [x] Validación de formularios en frontend (sin backend).
