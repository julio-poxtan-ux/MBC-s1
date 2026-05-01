# Bitácora — MB Capital
**Plataforma de registro de incidencias para proyectos web.**

Stack: HTML · CSS · JavaScript nativo · Bootstrap 5.3.6 · Firebase (Auth + Firestore + Storage + Hosting)

---

## Estructura del proyecto

```
Managertask/
├── index.html              ← App principal (auth + UI completa)
├── favicon.png
├── firebase.json           ← Configuración Firebase Hosting
├── firestore.rules         ← Reglas de seguridad Firestore
├── storage.rules           ← Reglas de seguridad Storage
├── .firebaserc             ← Referencia al proyecto Firebase
├── assets/
│   ├── css/styles.css      ← Tokens de diseño + estilos
│   └── js/app.js           ← Lógica completa (CRUD, auth, filtros)
└── README.md
```

---

## Implementación en Firebase — paso a paso

### 1. Crear el proyecto en Firebase Console

1. Andá a [console.firebase.google.com](https://console.firebase.google.com)
2. Hacé clic en **Agregar proyecto**
3. Ingresá un nombre, por ejemplo `mb-bitacora`
4. Desactivá Google Analytics si no lo necesitás → **Crear proyecto**

---

### 2. Activar Authentication (Google)

1. En el menú lateral: **Authentication → Comenzar**
2. Pestaña **Sign-in method**
3. Habilitá **Google** → guardá
4. Configurá el **Dominio autorizado** (ya incluye `localhost` y el dominio de Firebase Hosting automáticamente)

---

### 3. Crear la base de datos Firestore

1. En el menú lateral: **Firestore Database → Crear base de datos**
2. Seleccioná **Modo de producción** (las reglas del proyecto ya están listas)
3. Elegí la región más cercana, por ejemplo `us-central`
4. Hacé clic en **Habilitar**

**Crear índice compuesto requerido:**

Firestore necesita un índice para la consulta principal. La primera vez que abras la app, verás en la consola del navegador un link directo para crearlo. O crealo manualmente:

- Ir a **Firestore → Índices → Compuestos → Agregar índice**
- Colección: `incidencias`
- Campos:
  - `archivada` — Ascendente
  - `creadoEn` — Descendente
- Ámbito de consulta: **Colección**

---

### 4. Configurar Firebase Storage

1. En el menú lateral: **Storage → Comenzar**
2. Seleccioná **Modo de producción**
3. Elegí la misma región que Firestore
4. Hacé clic en **Listo**

---

### 5. Registrar la app web y obtener la configuración

1. En la pantalla principal del proyecto, hacé clic en el ícono **`</>`** (Web)
2. Dale un nombre, por ejemplo `Bitácora Web`
3. Marcá la casilla **También configurar Firebase Hosting** → **Registrar app**
4. Copiá el objeto `firebaseConfig` que aparece:

```js
const firebaseConfig = {
  apiKey:            "...",
  authDomain:        "...",
  projectId:         "...",
  storageBucket:     "...",
  messagingSenderId: "...",
  appId:             "..."
};
```

5. Pegalo en `assets/js/app.js`, reemplazando el objeto `FIREBASE_CONFIG` al inicio del archivo (líneas 11–18).

---

### 6. Instalar Firebase CLI

Necesitás tener [Node.js](https://nodejs.org) instalado.

```bash
npm install -g firebase-tools
```

Verificá la instalación:

```bash
firebase --version
```

---

### 7. Iniciar sesión en Firebase CLI

```bash
firebase login
```

Se abrirá el navegador para autenticarte con Google.

---

### 8. Vincular el proyecto local

Dentro de la carpeta `Managertask/`, ejecutá:

```bash
firebase use --add
```

Seleccioná tu proyecto Firebase y dale el alias `default`.

O editá `.firebaserc` manualmente:

```json
{
  "projects": {
    "default": "tu-id-de-proyecto"
  }
}
```

El ID del proyecto lo encontrás en Firebase Console → Configuración del proyecto.

---

### 9. Desplegar reglas de seguridad

```bash
# Solo las reglas de Firestore
firebase deploy --only firestore:rules

# Solo las reglas de Storage
firebase deploy --only storage

# Ambas juntas
firebase deploy --only firestore:rules,storage
```

---

### 10. Desplegar la app en Firebase Hosting

```bash
firebase deploy --only hosting
```

Al finalizar verás la URL pública, por ejemplo:
```
https://mb-bitacora.web.app
```

**Despliegue completo (reglas + hosting):**

```bash
firebase deploy
```

---

## Desarrollo local

Para correr el proyecto localmente con emuladores:

### Opción A — Sin emuladores (más simple)

Serví el proyecto con cualquier servidor local. Con Node.js:

```bash
npx serve .
```

O con Python:

```bash
python3 -m http.server 5000
```

Luego abrí `http://localhost:5000` en el navegador.

> La app se conectará a Firebase en la nube (no al emulador). Necesitás agregar `localhost` como dominio autorizado en Firebase Console → Authentication → Dominios autorizados (ya está incluido por defecto).

---

### Opción B — Con Firebase Emulator Suite

```bash
firebase emulators:start
```

Esto levanta emuladores locales de Auth, Firestore y Storage en:

| Servicio   | Puerto |
|------------|--------|
| Auth       | 9099   |
| Firestore  | 8080   |
| Storage    | 9199   |
| Hosting    | 5000   |
| Emulator UI| 4000   |

Abrí `http://localhost:5000` para ver la app y `http://localhost:4000` para la interfaz del emulador.

> Para que `app.js` use los emuladores en vez de la nube, agregá esto antes de `subscribeIncidencias()`:
> ```js
> if (location.hostname === 'localhost') {
>   db.useEmulator('localhost', 8080);
>   auth.useEmulator('http://localhost:9099');
>   storage.useEmulator('localhost', 9199);
> }
> ```

---

## Modelo de datos (Firestore)

Colección: `incidencias`

| Campo           | Tipo        | Descripción                        |
|-----------------|-------------|-----------------------------------|
| `titulo`        | `string`    | Título de la incidencia            |
| `plataforma`    | `string`    | Frontend UX, Backend, MKT, etc.   |
| `comentario`    | `string`    | Descripción del problema           |
| `urlSitio`      | `string`    | URL del sitio afectado             |
| `urlGithub`     | `string`    | URL del issue/PR en GitHub         |
| `capturaActual` | `string`    | URL de imagen en Storage           |
| `capturaEsperada`| `string`   | URL de imagen en Storage           |
| `revisada`      | `boolean`   | `true` = solucionada               |
| `archivada`     | `boolean`   | `true` = archivada (oculta)        |
| `creadoEn`      | `Timestamp` | Fecha y hora de creación           |
| `updatedAt`     | `Timestamp` | Última modificación                |
| `usuarioId`     | `string`    | UID del usuario que la creó        |
| `usuarioEmail`  | `string`    | Email del usuario                  |

---

## Reglas de seguridad

Las reglas actuales permiten acceso completo solo a usuarios autenticados con Google. Si necesitás restringir por usuario, reemplazá `firestore.rules` con:

```
allow read, write: if request.auth != null
  && request.auth.uid == resource.data.usuarioId;
```

---

## Atajos de teclado

| Tecla | Acción            |
|-------|-------------------|
| `N`   | Nueva incidencia  |
| `Esc` | Cerrar modal      |

---

## Límites y consideraciones

- **Imágenes:** máximo 5 MB por archivo (PNG, JPG, WEBP)
- **Incidencias:** no se pueden eliminar, solo marcar como revisadas o archivar
- **Plataformas predefinidas:** Frontend UX · Backend · Dirección · MKT · Email (se pueden agregar libremente)
- **Plan gratuito Firebase (Spark):** 1 GB Storage · 50.000 lecturas/día · 20.000 escrituras/día — suficiente para uso interno de equipo
