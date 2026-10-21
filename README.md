# Congreso Nacional de Aseguradoras y Hospitales

Landing page construida con React, TypeScript y Vite.

## Desarrollo

```sh
npm install
npm run dev
```

## Producción

```sh
npm run build
npm run preview
```

## Estructura

- `src/features/`: secciones independientes de la landing y sus CSS Modules.
- `src/components/`: componentes compartidos.
- `src/data/`: contenido tipado del congreso.
- `src/hooks/`: lógica reutilizable de cuenta regresiva, animación y accesibilidad.
- `src/styles/`: tokens de diseño y estilos globales.
- `public/assets/`: imágenes y videos servidos directamente.

El diseño aplica los tokens definidos en `src/styles/tokens.css`, los estilos de
cada sección en su CSS Module y el punto de quiebre móvil de 760 px.
