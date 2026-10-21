# Portico Lab — sistema visual compartido

## Identidad que prevalece
- Sitio de estudio arquitectónico y laboratorio de materialidad.
- Conservar el lenguaje aprobado: fondo negro, texto blanco, acentos cromados violeta/cian; Montserrat para lectura, Unbounded para títulos y Space Mono para navegación/datos.
- La estructura visual parte de una lámina técnica: retícula precisa, jerarquía clara, proyectos reales y anotaciones breves. La idea propia es que la lógica de una estructura irregular se convierta en el orden de lectura.
- Mantener la composición particular de cada página. Concordancia significa que navegación, escala, controles, bordes, estados de interacción y comportamiento móvil se sienten del mismo sistema.

## Reglas comunes
- Navegación compartida, activa y accesible en todas las páginas públicas; en móvil se presenta en una franja horizontal desplazable con blancos táctiles de 44 px.
- Títulos con Unbounded; texto legible con Montserrat; metadatos y navegación con Space Mono.
- Fondo negro, superficies cercanas al negro, borde gris de bajo contraste visual, texto secundario gris claro. Cromo violeta/cian reservado para estado activo o acción destacada.
- Radios repetibles de 14–16 px; botones con mínimo táctil de 44 px; contorno de foco cian claramente visible.
- Animación sutil, nunca necesaria para entender el contenido; respetar `prefers-reduced-motion`.
- Móvil primero: sin desbordamiento horizontal de contenido; navegación puede desplazarse horizontalmente; imágenes mantienen su proporción y se prioriza el contenido esencial.
- No sustituir Montserrat/Unbounded/Space Mono por tipografías genéricas sugeridas automáticamente. No reemplazar el negro/cromo aprobado por paletas genéricas. No modificar carrito ni configuración de pagos dentro del trabajo visual.

## Aplicación de UI/UX Pro Max
Se adaptan sus pautas verificadas de consistencia, navegación móvil, controles táctiles, contraste, foco y movimiento reducido. Su sugerencia automática de estilo claro gris/naranja y Archivo/Space Grotesk se descartó porque contradice decisiones de marca explícitas.

## Concordancia entre portadas
- Inicio, Servicios y Nosotros comparten una portada tipo lámina dividida: texto a la izquierda, pieza visual enmarcada a la derecha, márgenes/radios/jerarquías equivalentes y adaptación apilada en móvil.
- Cada pestaña tiene un recurso visual propio: lámpara estática en Inicio; diagrama BIM animado en Servicios; fotografía del taller en Nosotros. No reutilizar fotos de proyectos entre pestañas; en Nosotros, las fichas seleccionadas pueden usar diagramas vectoriales propios.
- El movimiento es técnico y discreto, solo decorativo y desactivado con `prefers-reduced-motion`.
