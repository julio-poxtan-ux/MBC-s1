# Bitácora — Incidencias de proyecto
Plataforma de Registro de incidencias para proyectos web. debe ser basado en el diseño de figma 1:1 todo el Frontend y el Backend listo para implementar en firebase y su guia de como implmentar en Google Cloud Firebase

## Diseños Figma
Implementa el diseño de la plataforma y del modal de Nueva incidencia.
@https://www.figma.com/design/PCKt9eRDr7tIzF5fK8ceEH/MB-Manager---Task?node-id=2-761&m=dev
@https://www.figma.com/design/PCKt9eRDr7tIzF5fK8ceEH/MB-Manager---Task?node-id=8-209&m=dev
@https://www.figma.com/design/PCKt9eRDr7tIzF5fK8ceEH/MB-Manager---Task?node-id=2-1567&m=dev

---

## 🚀 Cómo usarlo

1. Pulsá **Nueva incidencia** (o `N` en el teclado) para registrar.
2. Completá el formulario: título, **plataforma**, captura, comentario, URL del sitio, URL de GitHub.
3. Marcá como **revisada** con el switch cuando la sea verificado.
4. **Archivá** incidencias resueltas o que ya no necesitás ver.
5. Usá el selector **Plataforma** en la barra de filtros para ver solo las incidencias de un entorno específico.


### Guardado y vista
1. La lista de incidencias esta vista para los usuarios con acceso
2. Firebase como base para el backend, BD todo el CRUD
3. Autenticación con Google
4. Las incidencias no se pueden eliminar solo se marcan como **revisado**

### Requisitos
1. Para el Frontend utiliza Bootstrap 5.3.6 y JS nativo(Puro) sin frameworks
2. DB con Firebase
3. Poder correr el proyecto desde Firebase y todo su alojamiento
4. Poder correr el proyecto en local
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

## 🏷️ Plataformas

Cada incidencia puede tener una **plataforma** asociada (campo de texto libre con sugerencias automáticas). Plataformas predefinidas: `Frontend UX`, `Backend`, `Direccion`, `MKT`, `Email`.

- El campo aparece en el formulario de creación/edición.
- Las plataformas en uso se muestran como opciones en el selector de la barra de filtros.
- Al seleccionar una plataforma, el timeline muestra solo las incidencias de ese entorno.
- El badge azul en cada card identifica visualmente la plataforma.

---

## ⌨️ Atajos

| Tecla | Acción |
|---|---|
| `N` | Nueva incidencia |
| `Esc` | Cerrar modal |

---

## 🎨 Sistema de diseño

- **Tipografía:** *Space Grotesk* de google fonts + *DM Sans* (UI) + *JetBrains Mono* (URLs, timestamps).
- **Paleta:** tinta neutra (`#1C1917`) sobre papel cálido (`#FAFAF9`), con acentos de ámbar (pendiente), esmeralda (revisado) y rosa (archivado).
- **Tokens CSS:** todos los colores, radios y tipografías están definidos como `--ink-*`, `--paper`, `--accent`, etc. en `:root` de `styles.css`.
- **Microinteracciones:** reveal en escalera al cargar el timeline, hover con lift sutil en cards, transiciones de 150–200 ms.
- **Responsive:** grid fluido con `minmax(340px, 1fr)`, stats colapsables en mobile, toolbar sticky.

---

## ⚠️ Notas

- El **límite de imagen** es 5 MB (configurable en `app.js` — `MAX_IMAGE_MB`).
- límite de aprox. **500KB/3 MB**. Si registrás muchas incidencias con imágenes pesadas, exportá periódicamente y limpiár.
- Las **imágenes** solo se pueden adjuntar si hay una carpeta conectada. Se guardan en `assets/img/YYYY-MM-DD/` y el JSON guarda solo la ruta relativa (sin base64), lo que mantiene el archivo liviano.
- Al abrir la app sin carpeta conectada, las incidencias con imágenes muestran un **placeholder** hasta que se vuelva a conectar la carpeta y se carguen los archivos.
- Al **importar un JSON externo** con rutas de imagen, las capturas se mostrarán como placeholder hasta que los archivos estén en la misma carpeta relativa.
