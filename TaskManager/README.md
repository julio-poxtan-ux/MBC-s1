# Bitácora — Incidencias de proyecto

Registro de incidencias para proyectos web. **100% frontend**, sin backend ni base de datos. Los datos viven en `localStorage` del navegador y se exportan a un **ZIP** con `incidencias.json` + la carpeta `capturas/`.

---

## 🚀 Cómo usarlo

1. Abrí `index.html` en cualquier navegador moderno (Chrome, Edge, Firefox, Safari).
2. Pulsá **Nueva incidencia** (o `N` en el teclado) para registrar.
3. Completá el formulario: título, **plataforma**, captura, comentario, URL del sitio, URL de GitHub.
4. Marcá como **revisada** con el switch cuando la hayas verificado.
5. **Archivá** incidencias resueltas o que ya no necesitás ver.
6. Usá el selector **Plataforma** en la barra de filtros para ver solo las incidencias de un entorno específico.
7. Pulsá **Exportar** para bajar un ZIP con todo.

### Guardado automático en archivo JSON e imágenes (Chrome / Edge)
1. Pulsá **Conectar carpeta** en la barra superior.
2. Seleccioná la **carpeta raíz del proyecto** (donde está `index.html`).
3. Aceptá el permiso de lectura/escritura que solicita el navegador.
4. A partir de ese momento:
   - Cada cambio escribe `data/incidencias.json` automáticamente.
   - Cada imagen adjuntada se guarda en `assets/img/YYYY-MM-DD/` con el nombre `{id}_{titulo}.ext`.
   - El JSON **no contiene** datos base64 — solo la ruta relativa de cada imagen.
5. La conexión se recuerda entre sesiones (IndexedDB). Al reabrir la app, el navegador pedirá confirmar el permiso una sola vez.

### Requisitos
- Navegador moderno con soporte de `localStorage` y `FileReader`.
- Conexión a internet **solo la primera vez** (para cargar Bootstrap, fuentes e íconos desde CDN). Luego funciona offline.

---

## 📁 Estructura del proyecto

```
TaskManager/
├── index.html
├── favicon.png
├── assets/
│   ├── css/styles.css          ← tokens de diseño + overrides de Bootstrap
│   ├── js/app.js               ← lógica (CRUD, export/import, filtros, File System)
│   └── img/
│       └── YYYY-MM-DD/         ← imágenes organizadas por fecha de creación
│           └── {id}_{titulo}.ext
├── data/
│   └── incidencias.json        ← datos sin base64; imágenes referenciadas por ruta
└── README.md
```

---

## 📦 Estructura del ZIP exportado

Cuando pulsás **Exportar**, se genera un archivo `bitacora-incidencias-YYYY-MM-DD.zip` con:

```
bitacora-incidencias-2026-04-19.zip
├── incidencias.json
├── README.txt
└── capturas/
    ├── i_lq3x8p_menu-movil-no-cierra.png
    ├── i_lq4b2r_boton-enviar-sin-hover.jpg
    └── …
```

Las imágenes se guardan con el nombre `{id}_{titulo-saneado}.{ext}` dentro de `capturas/`, y el JSON las referencia por ruta relativa:

```json
{
  "id": "i_lq3x8p",
  "titulo": "Menú móvil no cierra",
  "imagen": "capturas/i_lq3x8p_menu-movil-no-cierra.png",
  ...
}
```

---

## 🗂️ Esquema del JSON

```json
{
  "version": "1.0",
  "exportadoEn": "2026-04-19T14:30:00.000Z",
  "totalIncidencias": 2,
  "incidencias": [
    {
      "id": "i_lq3x8p",
      "titulo": "El menú móvil no cierra tras seleccionar un enlace",
      "plataforma": "iOS",
      "comentario": "En iPhone 13 / Safari, al tocar un link del menú, el overlay queda abierto.",
      "imagen": "capturas/i_lq3x8p_menu-movil.png",
      "urlSitio": "https://misitio.com/productos",
      "urlGithub": "https://github.com/equipo/sitio/issues/42",
      "revisado": false,
      "archivado": false,
      "creadoEn": "2026-04-18T09:15:00.000Z",
      "actualizadoEn": "2026-04-18T09:15:00.000Z"
    }
  ]
}
```

---

## 🏷️ Plataformas

Cada incidencia puede tener una **plataforma** asociada (campo de texto libre con sugerencias automáticas). Plataformas predefinidas: `Web`, `iOS`, `Android`, `Desktop`, `Email`.

- El campo aparece en el formulario de creación/edición.
- Las plataformas en uso se muestran como opciones en el selector de la barra de filtros.
- Al seleccionar una plataforma, el timeline muestra solo las incidencias de ese entorno.
- El badge azul en cada card identifica visualmente la plataforma.
- El campo `plataforma` se incluye en la exportación ZIP y la importación JSON.

---

## ⌨️ Atajos

| Tecla | Acción |
|---|---|
| `N` | Nueva incidencia |
| `Esc` | Cerrar modal |

---

## 🎨 Sistema de diseño

- **Tipografía:** *Instrument Serif* (display, itálicas editoriales) + *DM Sans* (UI) + *JetBrains Mono* (URLs, timestamps).
- **Paleta:** tinta neutra (`#1C1917`) sobre papel cálido (`#FAFAF9`), con acentos de ámbar (pendiente), esmeralda (revisado) y rosa (archivado).
- **Tokens CSS:** todos los colores, radios y tipografías están definidos como `--ink-*`, `--paper`, `--accent`, etc. en `:root` de `styles.css`.
- **Microinteracciones:** reveal en escalera al cargar el timeline, hover con lift sutil en cards, transiciones de 150–200 ms.
- **Responsive:** grid fluido con `minmax(340px, 1fr)`, stats colapsables en mobile, toolbar sticky.

---

## ⚠️ Notas

- El **límite de imagen** es 5 MB (configurable en `app.js` — `MAX_IMAGE_MB`).
- `localStorage` tiene un límite de aprox. **5–10 MB**. Si registrás muchas incidencias con imágenes pesadas, exportá periódicamente y limpiá.
- Al **importar un JSON que referencia rutas** (como el exportado), las incidencias se cargan sin imagen (el navegador no puede leer archivos locales sin acción del usuario). Para conservar imágenes al trasladar datos entre dispositivos, editá las incidencias y re-subí las capturas desde la carpeta `capturas/` del ZIP.
- El **guardado automático en archivo** requiere Chrome o Edge (File System Access API). Firefox y Safari no soportan esta API; en esos navegadores la app funciona solo con `localStorage` y el botón "Conectar carpeta" no estará disponible.
- Las **imágenes** solo se pueden adjuntar si hay una carpeta conectada. Se guardan en `assets/img/YYYY-MM-DD/` y el JSON guarda solo la ruta relativa (sin base64), lo que mantiene el archivo liviano.
- Al abrir la app sin carpeta conectada, las incidencias con imágenes muestran un **placeholder** hasta que se vuelva a conectar la carpeta y se carguen los archivos.
- Al **importar un JSON externo** con rutas de imagen, las capturas se mostrarán como placeholder hasta que los archivos estén en la misma carpeta relativa.
