# MB eLearning (HTML + Bootstrap 5.3)

Maquetación **lista para ejecutar** basada en los screens provistos:
- `Learning.jpeg` (Home)
- `Curso.jpeg` (Curso individual)
- `Perfil de usuario.png` (Configuración)
- `FeaturedCard.png` (Tarjeta destacada)
- `LibraryCard.png` (Tarjeta biblioteca)
- `LibraryCard Mentor.png` (Tarjeta mentoría en vivo)

## Requisitos
- Navegador moderno (Chrome/Edge/Firefox/Safari)
- (Opcional) Un servidor estático para evitar restricciones de rutas/recursos.

## Ejecutar (opción simple)
1. Descomprime el ZIP.
2. Abre `index.html` con tu navegador.

> Si usas rutas con espacios (ej. `LibraryCard Mentor.png`), el proyecto ya las referencia URL-encoded.

## Ejecutar (recomendado con servidor local)
### Opción A: VSCode + Live Server
1. Abre la carpeta del proyecto en VSCode.
2. Instala la extensión **Live Server**.
3. Click derecho en `index.html` → **Open with Live Server**.

### Opción B: Python
Desde la carpeta del proyecto:
```bash
python3 -m http.server 5500
```
Luego abre:
- http://localhost:5500/index.html

## Páginas incluidas
- `index.html` — Inicio (home)
- `course.html` — Curso individual (navegación entre lecciones + progreso)
- `profile.html` — Perfil/Configuración (foto + validación + switches)
- `components.html` — Catálogo rápido de componentes

## Sistema de estilos (tokens)
Tokens en `css/tokens.css` (obligatorio):
- Colores `--color-*`
- Tipografía `--font-*`, `--text-*`, `--weight-*`, `--lh-*`
- Espaciado `--space-*`
- Bordes y radios `--border-*`, `--radius-*`
- Sombras `--shadow-*`
- Estados `--focus-ring`, `--danger-*`
- Componentes (ej. botones, cards, inputs)

Estilos y componentes en `css/styles.css` (orden recomendado):
1. base
2. layout
3. components
4. utilities

## Contrato de componentes (ejemplo)
Botón primario (requerido):
- Clase: `mb-button-primary`
- Base Bootstrap: `.btn`

Ejemplo:
```html
<button class="btn mb-button-primary">mb-button-primary</button>
```

## Interacciones implementadas (QA)
- **Tarjetas**: click/Enter/Space → se marcan activas (`.is-active`) y navegan si tienen `data-href`.
- **Carrusel horizontal**: botones prev/next desplazan la fila con scroll suave.
- **Curso**:
  - Click en lección cambia el estado activo.
  - Botones “Lección anterior / siguiente” actualizan activo y progreso (%).
- **Perfil**:
  - “Cambiar Foto” abre file picker y muestra preview.
  - Validación Bootstrap (`needs-validation`) para nombre y email.
  - Switches accesibles (`role="switch"`, `aria-checked`).

## Breakpoints verificados
Objetivo (Bootstrap default):
- 320px
- 768px
- 1024px
- 1440px

## Notas
- Imágenes se incluyen como referencia visual en `assets/img/`.
- No se agregaron dependencias adicionales más allá de Bootstrap + Bootstrap Icons CDN.
