# 1) Rol del asistente
Actúa como un **Frontend Architect + UI Designer + QA**.
Debes generar código **ordenado, escalable y listo para producción**.

---

# 2) Contexto del proyecto
- Nombre del proyecto: [Backoffice - Maktub]
- 5 secciones cada una en un html por separado solo crea la primer sección del diseño y las otras paginas deja el encabezado con el boton seleccionado y dejar preparado 

---

# 3) Objetivo principal
Maquetar el dashboard respetando el diseño de figma 1:1 version 1440px  1024 y 360px adjunto proporcionado y aplicando colores,tipografia, jerarquia visual, espaciados y componentes.
Implementa estos 3 diseños desde Figma.


---

# 4) Alcance del proyecto

## Incluye:
- Componentes reutilizables
- Responsive (Desktop / Tablet / Mobile)
- Estados hover, active y disabled
- Agregar las meta para SEO y metadatos necesarios para el SEO


## Excluye:
- Backend
- Autenticación real
- Consumo de APIs

---

# 5) Stack técnico
- HTML5 semántico
- Bootstrap 5.3.8
- CSS puro (archivo externo)
- JavaScript Vanilla
- Chast.js https://www.chartjs.org/docs/latest/ para Graficas crear archivo css para editar los colores de las gráficas de ser necesario.
- Iconos de Bootstrap 5.3.8 https://icons.getbootstrap.com/ Temporales y reemplazables por SVG desde archivos

---

# 6) Reglas de diseño y sistema
- Todas las propiedades configurables deben vivir en `:root`
  - Colores
  - Tipografías
  - Spacing
  - Border-radius
- Naming claro y escalable (BEM o prefijo de proyecto)
- Componentes reutilizables
- No estilos inline
- Sin posiciones absolutas
- todo el maquetado debe ser con el Grid de bootstrap
- No dependencias innecesarias
- 2 Tipografías 
  - Header principales HK Guise agregado en la carpeta webfont
  - Curpos de texto "Satoshi" https://fonts.cdnfonts.com/css/satoshi
                

---

# 7) Estructura de archivos obligatoria

/project
├── index.html
├── carteras.html - sin contenido
├── membresias.html - sin contenido
├── referidos.html - sin contenido
├── transacciones.html - sin contenido
│
├── css/
│   ├── tokens.css
│   └── styles.css
├── js/
│   └── main.js
├── assets/
│   ├── img/
│   └── icons/
└── README.md

---

# 8) Buenas prácticas obligatorias
- Mobile First del figma adjunto
- Todas las clases deben iniciar con el prefijo cm-
- Accesibilidad básica (labels, contrastes, aria)
- HTML semántico
- Clases reutilizables
- Validaciones de formularios
- Código comentado solo en CSS y JS cuando sea necesario

---

# 9) Entregables
- Proyecto completo listo para ejecutar
- Código limpio y claro
- UI Kit con los componentes
- README con:
  - Cómo ejecutar el proyecto
  - Estructura
  - Decisiones técnicas

---

# 10) Criterios de aceptación (QA)
- El layout debe coincidir visualmente con el diseño 1:1
- Responsive correcto sin saltos
- Variables funcionando desde `:root`
- Componentes reutilizables sin estilos inline
- Proyecto entendible para otro desarrollador