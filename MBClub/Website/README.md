
## Estado actual del proyecto

- Versión activa: `index.html` + `styles.css`
- Versión de referencia / legado: `index.backup.html` + `home.css`
- Assets locales: `img/`, `font/`, videos `.mp4`

La versión activa está enfocada principalmente en CONEX y en la biblioteca de mentorías. El archivo backup conserva una versión más amplia del sitio con más secciones del ecosistema MB Capital.

## Pantallas incluidas

### Versión activa (`index.html`)

El proyecto activo no está dividido por rutas; es una sola pantalla tipo landing con secciones:

1. Navbar fija con accesos rápidos y menú de perfil
2. Hero principal de CONEX
3. Sección "Biblioteca de mentorías"
4. Footer con accesos a comunidades y enlaces legales

### Versión histórica / extendida (`index.backup.html`)

El backup documenta una versión más completa de la experiencia:

1. Hero institucional de MB Capital
2. Servicios
3. Membresía Maktub
4. CONEX
5. Spacios MB
6. Emuna
7. Desarrollo Web 3.0
8. Nuestro equipo
9. Propiedad colectiva
10. Contacto
11. Footer

## Estructura

```text
MBClub/Website/
├── index.html              # Landing actual
├── index.backup.html       # Versión previa / referencia
├── styles.css              # Hoja principal de estilos activa
├── home.css                # Hoja usada por la versión backup
├── font/
│   ├── stylesheet.css      # Registro local de la familia TWK Everett
│   └── *.woff / *.woff2
├── img/
│   ├── team/               # Placeholders y retratos del equipo
│   └── assets visuales     # Logos, fondos, ilustraciones, cards
└── *.mp4                   # Videos decorativos de fondo
```

## Stack

- HTML5
- CSS3 con variables CSS, gradientes, animaciones y media queries
- Bootstrap 5.3 cargado por CDN
- Bootstrap Icons por CDN
- Google Fonts (`Inter`, `DM Sans`) por CDN
- Fuente local `TWK Everett` con `@font-face`
- JavaScript vanilla inline para interacciones puntuales
- AOS (`Animate On Scroll`) por CDN
- GSAP + ScrollTrigger solo en `index.backup.html`

## Decisiones técnicas

- Se eligió una arquitectura estática de archivo único para reducir complejidad y facilitar iteración rápida en diseño.
- Bootstrap se usa como base de layout responsive y componentes de navegación, mientras que la identidad visual vive en CSS custom.
- Los estilos están separados por etapa del proyecto:
  - `styles.css` corresponde a la versión activa.
  - `home.css` corresponde a la versión backup.
- Las interacciones de UI se resolvieron con scripts inline simples para evitar una capa adicional de tooling o un bundle JS.
- La tipografía principal de marca se sirve localmente desde `font/` para mantener consistencia visual.
- Los assets pesados de branding, fondos y video se almacenan dentro del proyecto para asegurar disponibilidad local.
- Se conservó `index.backup.html` como referencia funcional del alcance anterior del sitio, en lugar de eliminarlo.

## Funcionalidad y visual

### Funcionalidad

- Navbar responsive con colapso móvil usando Bootstrap.
- Dropdown de perfil en la cabecera.
- Cierre automático del menú móvil al hacer clic en enlaces.
- Animaciones de entrada con AOS en elementos clave.
- CTA visibles para CONEX, biblioteca y comunidades.
- En la versión backup también existen:
  - efecto typewriter en hero
  - secciones con video de fondo
  - animaciones adicionales con GSAP

### Dirección visual

- Estética oscura, corporativa y tecnológica.
- Paleta dominada por negro, azul profundo, cyan y blanco.
- Uso fuerte de gradientes, glows y fondos inmersivos.
- Tipografía display con `TWK Everett` y soporte de `DM Sans`.
- Recursos visuales grandes: logos, fondos texturizados, tarjetas y videos ambientales.

## Notas

- El proyecto actual depende de conexión a internet para cargar Bootstrap, Bootstrap Icons, Google Fonts y AOS desde CDN.
- No hay `package.json`, build step, backend, formularios funcionales ni tests automatizados.
- Muchos links todavía son placeholders (`href="#"`), por lo que varias rutas y CTA están listos para conectarse pero aún no navegan a destinos reales.
- En `index.html` existe una sección con `id="#"`, lo cual no es un identificador HTML ideal si más adelante se quiere navegación por anclas.
- `home.css` no está cargado por la versión activa; hoy funciona solo como soporte de `index.backup.html`.
- El proyecto contiene archivos de sistema como `.DS_Store`, que no forman parte funcional del sitio.

## Cómo visualizarlo

Puedes abrir `index.html` directamente en el navegador o servir la carpeta con un servidor estático simple. Como ejemplo:

```bash
cd MBClub/Website
python3 -m http.server 8080
```

Luego abre `http://localhost:8080`.
