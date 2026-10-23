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

Define `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en un archivo `.env.local` en la raíz del proyecto:

```dotenv
VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_CLAVE_PUBLICA_ANON
```

Sustituye los valores de ejemplo por la URL y la clave pública `anon` de tu proyecto Supabase. No uses una clave `service_role`: Vite expone las variables `VITE_*` al navegador. El archivo `.env.local` está excluido de Git; un archivo llamado `env` (sin el punto inicial) no se carga automáticamente.

Reinicia `npm run dev` después de modificar estas variables. Para producción, defínelas en el entorno de compilación y vuelve a ejecutar `npm run build`.

Ejecuta [supabase/congreso.sql](supabase/congreso.sql) en el SQL Editor de Supabase y revisa las políticas RLS antes de habilitar acceso público.

El panel administrativo está disponible en `/#admin`. Permite autenticar usuarios y gestionar patrocinadores, paneles, sedes, medios y mensajes de contacto.

La sección pública de patrocinadores consulta Supabase al abrir la landing y al volver a la pestaña o recuperar el foco. Los cambios de URL de los logos se reflejan en la siguiente consulta. Si no hay patrocinadores activos con niveles compatibles, se muestran los logos locales; si una consulta falla, se conserva la lista visible y se registra el error en la consola.

Configura [supabase/email-confirmation.html](supabase/email-confirmation.html) en `Authentication > Email Templates > Confirm signup`. La URL de confirmación devuelve al usuario a `/#admin`.

Durante el desarrollo puedes previsualizar el correo en [http://localhost:5173/email-confirmation.html](http://localhost:5173/email-confirmation.html).

## Distribución de patrocinadores

Cada nivel distribuye de uno a seis patrocinadores en columnas de igual ancho; un único logo ocupa todo el ancho disponible. A partir de siete, el nivel se convierte en un carrusel manual con flechas, desplazamiento táctil y acceso por teclado, sin duplicar logos ni reproducción automática. En pantallas de hasta 760 px se muestran hasta dos columnas. El desplazamiento respeta la preferencia de movimiento reducido.

Las imágenes ocupan el ancho interior de su tarjeta y ajustan su altura automáticamente según su proporción original, sin un límite de altura fijo.

## Estructura

- `src/features/`: secciones independientes de la landing y sus CSS Modules.
- `src/components/`: componentes compartidos.
- `src/data/`: contenido tipado del congreso.
- `src/hooks/`: lógica reutilizable de cuenta regresiva, animación y accesibilidad.
- `src/styles/`: tokens de diseño y estilos globales.
- `public/assets/`: imágenes y videos servidos directamente.

El diseño aplica los tokens definidos en `src/styles/tokens.css`, los estilos de
cada sección en su CSS Module y el punto de quiebre móvil de 760 px.
