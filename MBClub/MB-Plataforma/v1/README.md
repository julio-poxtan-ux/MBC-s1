# MB Platform (Bootstrap 5.3)

Incluye un layout responsive basado en el diseño proporcionado:
- Navbar fija con logo, buscador con autocompletado y perfil
- Hero de bienvenida con métricas
- Filas horizontales (recomendados / tutoriales) con scroll
- Sección de mentorías en vivo (tarjetas tipo 'live')
- Biblioteca en grid responsive
- Modal de navegación simulada al hacer click en cualquier tarjeta

## Estructura
- index.html
- mb-style.css  (variables en :root para personalización)
- mb-script.js  (interacciones: autocomplete, scroll, modal)
- /assets/img   (placeholders)

## Cómo usar
1. Abre `index.html` en tu navegador, o sirve con un servidor local.
2. Para ajustar colores, radios y tipografía: edita las variables en `mb-style.css` dentro de `:root`.

## Notas
- No se usan estilos inline (excepto background-image en el hero por practicidad, puedes moverlo a CSS si deseas).
- Las imágenes son placeholders: reemplázalas en `assets/img/`.
