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

Si ya existe la tabla `venue_amenities` relacionada con sedes, ejecuta primero [supabase/edition-amenities.sql](supabase/edition-amenities.sql). Esta migración transaccional e idempotente obtiene `edition_id` de la sede de cada registro y reemplaza la relación `venue_id` por una clave foránea directa a `congress_editions`. Conserva los IDs y el contenido; si algún registro no tiene una edición válida o hay relaciones contradictorias, aborta sin aplicar los cambios. También adapta la política de lectura pública a ediciones publicadas o archivadas. Eliminar una sede ya no elimina las amenidades o fotos; eliminar la edición sí.

Si la API devuelve `PGRST200` al relacionar `congress_editions` con `venue_amenities`, ejecuta el archivo completo [supabase/edition-amenities.sql](supabase/edition-amenities.sql), incluso si ya existe la columna `edition_id`: el script comprueba la clave foránea y la crea si falta, valida los registros y solicita la recarga de la caché de PostgREST al confirmar la transacción. Cambiar los tipos de TypeScript no modifica el esquema de Supabase. Si la clave ya existe y solo falta actualizar la caché, ejecuta `NOTIFY pgrst, 'reload schema';` y vuelve a cargar la página.

El panel administrativo está disponible en `/#admin`. Permite autenticar usuarios y gestionar patrocinadores, paneles, sedes, medios y mensajes de contacto.

### Burbuja de redes sociales (configuración global)

Ejecuta o vuelve a ejecutar [supabase/social-settings.sql](supabase/social-settings.sql) tanto en instalaciones nuevas como existentes. Crea `social_links`, una tabla global independiente de las ediciones que permite guardar múltiples enlaces, incluso más de uno por red. El script importa automáticamente la configuración anterior de `social_settings` sin eliminarla ni sobrescribir enlaces; en instalaciones nuevas agrega un WhatsApp de ejemplo desactivado. El acceso público solo puede leer enlaces activos y la administración autenticada puede gestionarlos. El script es transaccional, idempotente y recarga la caché de PostgREST.

En **Configuración global** del administrador, agrega un enlace por cada perfil o contacto, elige la red, proporciona su URL HTTPS y configura la etiqueta accesible y el orden. WhatsApp admite `https://api.whatsapp.com/send?phone=NUMERO` o `https://wa.me/NUMERO`, con número internacional de 7 a 15 dígitos, sin espacios ni signos. Telegram admite perfiles y canales en `https://t.me/...` o `https://telegram.me/...`. Facebook admite páginas y perfiles en `https://facebook.com/...` o `https://fb.com/...`. Activa **Mostrar en la landing** para cada enlace que deba publicarse. El registro inicial está desactivado y conserva un número de ejemplo no válido para evitar redirecciones accidentales.

Un botón discreto aparece fijo en la esquina inferior derecha, también en móvil. Al abrirlo, los enlaces activos se apilan verticalmente con su etiqueta e icono. Escape cierra la lista; esta distribución evita cubrir la página cuando está cerrada y mantiene cada red identificable. Por defecto los enlaces abren en una pestaña nueva con `noopener noreferrer`; cada enlace permite cambiar ese comportamiento. Se consultan al montar la landing: después de guardar, vuelve a la landing o recarga la página para ver los cambios. Si no hay enlaces activos, no se muestra el botón. Los errores se registran en consola y en `app_errors`, sin crear enlaces inválidos. El control es accesible por teclado, tiene foco visible y anuncia si el menú está abierto.

Pruebas de configuración y enlace: `node --test src/features/social/socialSettings.test.mjs`.

### Revivir Eventos

Ejecuta [supabase/archive-events.sql](supabase/archive-events.sql) después del esquema base para ampliar una instalación existente y cargar los videos y fotos originales de Mérida 2025 y Monterrey 2026. El script es transaccional e idempotente: no sobrescribe registros existentes y puede ejecutarse nuevamente sin duplicar sus datos. Ejecuta también [supabase/archive-carousel.sql](supabase/archive-carousel.sql) en bases existentes para permitir leer el año y la ciudad de ediciones `draft` sin exponer sus sedes ni fotos antes de publicarlas.

La sección muestra en un carrusel manual las ediciones `archived` y `published`, ordenadas por año. Las ediciones `draft` aparecen fuera del carrusel, como tarjetas estáticas de **Próximamente** con sus fechas, sin publicar sus medios. Las demás ediciones muestran el video, portada y fotos asociados; cada tarjeta mantiene el diseño con marcadores accesibles cuando le falte video o galería. Si no existen ediciones, se muestra una tarjeta vacía informativa. No hay movimiento automático; los controles, desplazamiento táctil y teclado respetan `prefers-reduced-motion`.

Desde **Sedes** en el administrador puedes elegir cualquier edición y editar la descripción, la portada (`venues.image_url`), el video (`video_url`) y su etiqueta accesible (`video_label`). El título se construye con el año y la ciudad de `congress_editions`.

En **Amenidades y fotos de edición**, el selector y la tabla identifican la edición (año y ciudad), no la sede. Se pueden capturar registros para cualquier edición, incluso sin sede. Un registro sin `image_url` conserva su función de amenidad y aparece junto a la sede pública de esa misma edición. Un registro con imagen se convierte en una foto del archivo de la edición: `image_url` corresponde a `photos[].src`, `alt_text` a `photos[].alt` (o la etiqueta si no hay texto alternativo), y `display_order` determina el orden. Las fotos no se muestran como amenidades. Los campos multimedia aceptan URLs absolutas o rutas locales como `/assets/foto.jpg`. Si falta contenido en ediciones ya publicables, la tarjeta muestra espacios con el aviso «Video no disponible» o «Foto no disponible».

Pruebas del mapeo por edición: `node --test src/features/archive/archive.test.mjs`.

La sección pública de patrocinadores consulta Supabase al abrir la landing y al volver a la pestaña o recuperar el foco. Los cambios de URL de los logos se reflejan en la siguiente consulta. Si no hay patrocinadores activos con niveles compatibles, se muestran los logos locales; si una consulta falla, se conserva la lista visible y se registra el error en la consola.

Configura [supabase/email-confirmation.html](supabase/email-confirmation.html) en `Authentication > Email Templates > Confirm signup`. La URL de confirmación devuelve al usuario a `/#admin`.

Durante el desarrollo puedes previsualizar el correo en [http://localhost:5173/email-confirmation.html](http://localhost:5173/email-confirmation.html).

## Distribución de patrocinadores

Los logos de patrocinadores se consultan únicamente para la edición con estado `published`, y el título «Nuestros patrocinadores» muestra el año de esa edición. No hay respaldo de logos locales ni se muestran placeholders: las secciones Diamante, Oro y Plata permanecen visibles aunque no tengan patrocinadores. Los logos se distribuyen en una cuadrícula fija por nivel, sin carrusel ni duplicación: Diamante muestra uno por fila, Oro dos y Plata hasta seis en pantallas amplias (tres en tablet y dos en móvil). Las tarjetas mantienen una altura uniforme y cada logo conserva su proporción dentro del mismo espacio visual. Diamante usa un marco uniforme más amplio; los demás niveles mantienen sus medidas.

## Estructura

- `src/features/`: secciones independientes de la landing y sus CSS Modules.
- `src/components/`: componentes compartidos.
- `src/data/`: contenido tipado del congreso.
- `src/hooks/`: lógica reutilizable de cuenta regresiva, animación y accesibilidad.
- `src/styles/`: tokens de diseño y estilos globales.
- `public/assets/`: imágenes y videos servidos directamente.

El diseño aplica los tokens definidos en `src/styles/tokens.css`, los estilos de
cada sección en su CSS Module y el punto de quiebre móvil de 760 px.
