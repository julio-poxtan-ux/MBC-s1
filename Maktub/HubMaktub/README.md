# HubMaktub (Frontend)

Proyecto estático (HTML/CSS/JS) basado en Bootstrap 5.3.8, siguiendo el mockup proporcionado.

## Stack
- HTML5 semántico
- Bootstrap 5.3.8
- CSS puro (tokens.css + styles.css)
- JavaScript Vanilla (main.js)
- Bootstrap Icons (temporal)

## Estructura
/project
├── index.html
├── carteras.html
├── comprar-vender.html
├── historial.html
├── ayuda.html
├── uikit.html
├── css/
│   ├── tokens.css
│   └── styles.css
├── js/
│   └── main.js
├── assets/
│   └── img/
│       └── logo.svg
└── README.md

## Cómo ejecutar
Opción 1 (Python):
```bash
cd HubMaktub
python3 -m http.server 8080
```
Abrir: http://localhost:8080

Opción 2 (VS Code):
- Instala “Live Server”
- Click derecho en `index.html` -> “Open with Live Server”

## Decisiones técnicas
- **Mobile first**: tokens + layout pensados desde móvil y ajustan en >=992px.
- **Ayuda**: el icono flotante abre un **Offcanvas** y cambia a “Cerrar” (ícono X). El panel **inyecta** el contenido de `ayuda.html` mediante `fetch()` para mantener la sección en archivo separado y reutilizable.
- **Reutilización**: componentes visuales (cards, botones, badges, tabla, chat) están basados en clases `hmk-*` y tokens.
- **Accesibilidad**: labels, `aria-*`, contraste y foco visible.
- **Animación menú**: el ítem activo del menú principal tiene transición y animación al cargar cada página.

## Pendientes (cuando exista backend)
- Conectar datos reales de balance, lista de activos y órdenes.
- Implementar swap real + validaciones.
- Conectar chat a servicio AI y/o soporte.
