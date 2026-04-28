# Onboarding + Acceso - Maktub

Implementación frontend multi-página basada en Figma para onboarding, checkout y acceso.

## Pantallas actuales

| Pantalla | Archivo HTML |
| --- | --- |
| Bienvenida / aceptación de términos | [index_1.html](./index_1.html) |
| Crear cuenta | [crear-cuenta.html](./crear-cuenta.html) |
| Confirmación de código (onboarding) | [confirmacion-token.html](./confirmacion-token.html) |
| Selección de membresía | [membercheckout.html](./membercheckout.html) |
| Checkout de pago (USDT) | [checkout.html](./checkout.html) |
| Bienvenida final al club | [bienvenida.html](./bienvenida.html) |
| Inicio de sesión | [inicio-sesion.html](./inicio-sesion.html) |
| Recuperar contraseña (correo) | [olvidaste-contrasena.html](./olvidaste-contrasena.html) |
| Ingresar PIN de recuperación | [ingresar-pin.html](./ingresar-pin.html) |
| Definir nueva contraseña | [definir-contrasena.html](./definir-contrasena.html) |
| Confirmación de contraseña actualizada | [confirmacion-guardado-contrasena.html](./confirmacion-guardado-contrasena.html) |
| UI Kit de inputs/estados | [uikit.html](./uikit.html) |
| Referencia de componentes base | [UIcomponents.html](./UIcomponents.html) |

## Flujos funcionales

### Flujo A: Onboarding principal

1. [index_1.html](./index_1.html)
2. [crear-cuenta.html](./crear-cuenta.html)
3. [confirmacion-token.html](./confirmacion-token.html)
4. [membercheckout.html](./membercheckout.html)
5. [checkout.html](./checkout.html)
6. [bienvenida.html](./bienvenida.html)

### Flujo B: Recuperación de contraseña

1. [olvidaste-contrasena.html](./olvidaste-contrasena.html)
2. [ingresar-pin.html](./ingresar-pin.html)
3. [definir-contrasena.html](./definir-contrasena.html)
4. [confirmacion-guardado-contrasena.html](./confirmacion-guardado-contrasena.html)
5. [inicio-sesion.html](./inicio-sesion.html)

## Estructura real del proyecto

```text
InicioSesion/
├── index_1.html
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
│   ├── js/
│   │   └── main.js
│   └── webfont/
├── .figma-assets/
└── README.md
```

## Stack

- HTML5 semántico.
- CSS modular (`css/tokens.css` + `css/styles.css`).
- JavaScript Vanilla (`js/main.js`).
- Bootstrap `5.3.8` y Bootstrap Icons `1.11.3`.
- Tipografía: Satoshi (Fontshare) + HK Guise (local en `assets/webfont/`).

## Cómo ejecutar

1. Abrir [index_1.html](./index_1.html) como punto de entrada del onboarding.
2. Abrir [inicio-sesion.html](./inicio-sesion.html) como punto de entrada del acceso/login.
3. Probar el resto de pantallas según los flujos anteriores.

## Estado de enlaces y consistencia (actualizado)

- Se normalizaron enlaces de retorno que apuntaban a archivos inexistentes (`index.html` y `home-index.html`) para usar [index_1.html](./index_1.html).
- En [index_1.html](./index_1.html), el enlace “Inicia sesión” ahora apunta a [inicio-sesion.html](./inicio-sesion.html).
- En [crear-cuenta.html](./crear-cuenta.html), el checkbox de términos quedó alineado con `js/main.js` (`mk-register-terms`), habilitando correctamente su validación.

