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

## Supabase y administración

Define `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en el entorno de Vite, y ejecuta [supabase/congreso.sql](supabase/congreso.sql) en el SQL Editor de Supabase.

El panel administrativo está disponible en `/#admin`. Permite autenticar usuarios y gestionar patrocinadores, paneles, sedes, medios y mensajes de contacto.

Configura [supabase/email-confirmation.html](supabase/email-confirmation.html) en `Authentication > Email Templates > Confirm signup`. La URL de confirmación devuelve al usuario a `/#admin`.

Durante el desarrollo puedes previsualizar el correo en [http://localhost:5173/email-confirmation.html](http://localhost:5173/email-confirmation.html).

## Estructura

- `src/features/`: secciones independientes de la landing y sus CSS Modules.
- `src/components/`: componentes compartidos.
- `src/data/`: contenido tipado del congreso.
- `src/hooks/`: lógica reutilizable de cuenta regresiva, animación y accesibilidad.
- `src/styles/`: tokens de diseño y estilos globales.
- `public/assets/`: imágenes y videos servidos directamente.

El diseño aplica los tokens definidos en `src/styles/tokens.css`, los estilos de
cada sección en su CSS Module y el punto de quiebre móvil de 760 px.
