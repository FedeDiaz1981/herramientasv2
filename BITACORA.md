# Bitácora del Proyecto

Fecha: 5 de febrero de 2026

## Resumen
Proyecto Astro con Tailwind v3 para procesar y reconvertir archivos de Time Tracking. La interfaz principal incluye panel de control, métricas y bitácora de procesamiento. El manual de usuario se presenta como un modal integrado en la home.

## Historial de Cambios (alto nivel)
1. Inicialización del proyecto Astro (plantilla minimal) con Tailwind v3, PostCSS y Autoprefixer.
2. Integración de estilos globales y tokens de marca (colores, fuentes y sombras).
3. Implementación del panel principal de reconversión y su lógica de procesamiento de archivos.
4. Creación del manual de usuario como componente modal independiente.
5. Ajustes de buenas prácticas: accesibilidad básica, tipos de botón, scripts diferidos, y corrección de caracteres especiales.
6. Refactor a scripts externos en `public/scripts/` y creación de página `/manual`.
7. Configuración de lint/format con ESLint y Prettier.

## Estructura del Proyecto
- `src/pages/index.astro`
- `src/pages/manual.astro`
- `src/components/ReconversionPanel.astro`
- `src/components/ManualUsuarioModal.astro`
- `src/components/ManualUsuarioContent.astro`
- `src/styles/global.css`
- `tailwind.config.cjs`
- `astro.config.mjs`
- `postcss.config.cjs`
- `public/scripts/reconversion.js`
- `public/scripts/manual-modal.js`
- `public/scripts/manual-page.js`
- `public/`

## Componentes
- `ReconversionPanel.astro`
Panel principal. Controla carga de archivos, procesado, métricas y bitácora. Lógica JS inline para lectura y transformación de datos (XLSX).

- `ManualUsuarioModal.astro`
Manual de usuario en modal. Incluye guía, lógica y explicación del proceso. Se abre desde el botón “Manual de Usuario”.

## Estilos
- `src/styles/global.css`
Contiene estilos globales de Tailwind y clases específicas (`dot`, `bento-card`, `manual-*`, botones y elementos auxiliares).

## Dependencias clave
- `astro`
- `@astrojs/tailwind`
- `tailwindcss` (v3)
- `postcss`
- `autoprefixer`

## Scripts útiles
- `npm run dev` (desarrollo)
- `npm run build` (build)
- `npm run preview` (previsualización)
- `npm run lint`
- `npm run format`
- `npm run format:check`

## Notas de Buenas Prácticas aplicadas
- Botones con `type="button"` para evitar envíos no deseados.
- Modal con `role="dialog"` y `aria` básicos.
- Scripts externos con `defer`.
- Corrección de acentos y caracteres especiales en UI.
- Actualización del reloj en tiempo real en métricas.
- Lógica de frontend movida a archivos dedicados en `public/scripts/`.
