# Onboarding - Maktub

Implementacion frontend multi-pagina basada en Figma para el flujo de onboarding de Maktub: bienvenida, registro, confirmacion, compra de membresia, login y recuperacion de contrasena.

## Pantallas incluidas

- `index.html`: bienvenida y aceptacion de terminos.
- `crear-cuenta.html`: registro de cuenta.
- `confirmacion-token.html`: verificacion de codigo.
- `membercheckout.html`: seleccion de membresia.
- `checkout.html`: pago en cripto.
- `bienvenida.html`: confirmacion final.
- `inicio-sesion.html`: login.
- `olvidaste-contrasena.html`: solicitud de recuperacion.
- `ingresar-pin.html`: validacion de PIN.
- `definir-contrasena.html`: nueva contrasena.
- `confirmacion-guardado-contrasena.html`: exito de actualizacion.
- `uikit.html`: UI Kit visual y estados base.
- `UIcomponents.html`: referencia adicional de componentes.

## Estructura

```text
/project
├── index.html
├── crear-cuenta.html
├── confirmacion-token.html
├── membercheckout.html
├── checkout.html
├── bienvenida.html
├── inicio-sesion.html
├── olvidaste-contrasena.html
├── ingresar-pin.html
├── definir-contrasena.html
├── confirmacion-guardado-contrasena.html
├── uikit.html
├── UIcomponents.html
├── css/
│   ├── tokens.css
│   └── styles.css
├── js/
│   └── main.js
├── assets/
│   ├── icons/
│   ├── img/
│   └── webfont/
└── README.md
```

## Stack

- HTML5 semantico.
- Bootstrap `5.3.8` para grid, flex y responsive.
- CSS modular con prefijo `mk-`.
- Tokens de diseno centralizados en `css/tokens.css`.
- JavaScript Vanilla en `js/main.js`.
- Bootstrap Icons `1.11.3`.
- Tipografia local `HK Guise` mas `Satoshi` como apoyo.

## Decisiones tecnicas y de diseno

- Se promovio al root la implementacion mas madura del flujo para cumplir la estructura solicitada y dejar un entrypoint claro en `index.html`.
- Se mantuvo un shell visual reutilizable con mismo fondo, logo y card container para asegurar consistencia entre pantallas.
- Los tokens concentran color, tipografia, radios, sombras, espaciado y tamanos, lo que facilita escalar el sistema a nuevas vistas sin duplicar reglas.
- La UI usa una arquitectura reusable por bloques: botones, inputs, strength meter, stepper, cards, estados de validacion y layouts de formulario.
- Se priorizo accesibilidad con `skip link`, labels asociados, `aria-live`, `aria-invalid`, foco visible y mensajes de error especificos.
- El flujo es mobile-first y usa breakpoints de Bootstrap y CSS propio para evitar overflow horizontal y mantener jerarquia visual en desktop, tablet y mobile.

## QA funcional y visual

- Validacion de terminos para habilitar CTAs.
- Validacion de nombre, apellido, correo y contrasena.
- Medidor de fortaleza de contrasena.
- Toggle de mostrar/ocultar contrasena.
- Autoavance de PIN y feedback inline.
- Estados `hover`, `focus`, `active`, `disabled` y `error` cubiertos en componentes base.
- Assets e iconos locales organizados en `assets/` para no depender del export manual posterior.

## Como ejecutar

1. Abre `index.html` en el navegador para iniciar el flujo.
2. Si prefieres servidor local, ejecuta `python3 -m http.server 8000`.
3. Visita `http://localhost:8000`.

## Notas

- El proyecto conserva el mismo lenguaje visual en todas las paginas para que nuevas vistas puedan reutilizar el fondo y header sin rehacer layout base.
- `uikit.html` funciona como referencia de QA y catalogo rapido de componentes usados en el onboarding.
