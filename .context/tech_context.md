# Contexto tecnológico

## Runtime, lenguajes y dependencias

| Elemento | Versión declarada | Uso |
|---|---:|---|
| Node.js | No fijada en el repositorio | Runtime habitual de Vite y scripts npm; confirmar versión compatible en el entorno de build |
| React | `^18.3.1` | UI y estado de componentes |
| React DOM | `^18.3.1` | Montaje en navegador |
| TypeScript | `^5.7.0` | Tipado estático |
| Vite | `^6.0.0` | Servidor local, build y preview |
| `@supabase/supabase-js` | `^2.118.0` | Autenticación y acceso a Supabase |
| `@types/react` | `^18.3.0` | Tipos de React |
| `@types/react-dom` | `^18.3.0` | Tipos de React DOM |

El manifiesto no fija versiones exactas: los rangos `^` permiten actualizaciones compatibles según semver. No se observan scripts o dependencias declaradas para ESLint, Prettier, Vitest, Jest, Testing Library o Playwright.

## Build, desarrollo y configuración

Comandos definidos en `package.json`:

```sh
npm install
npm run dev       # Vite dev server
npm run build     # tsc -b && vite build
npm run preview   # Vite preview del build
```

La configuración raíz de Vite es mínima (`defineConfig({})`). TypeScript se divide en:

- `tsconfig.app.json`: código de aplicación, `target: ES2022`, librerías de navegador, `jsx: react-jsx`, `strict: true`, `noUnusedLocals`, `noUnusedParameters` y `noFallthroughCasesInSwitch`.
- `tsconfig.node.json`: configuración de Vite, `target/lib: ES2023` y `strict: true`.
- `tsconfig.json`: referencias a ambos proyectos.

## Variables de entorno

`src/vite-env.d.ts` declara opcionalmente:

| Variable | Propósito |
|---|---|
| `VITE_SUPABASE_URL` | URL pública del proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clave pública/anon del SDK Supabase |

Vite expone al navegador las variables prefijadas con `VITE_`. Estas variables no son secretos de servidor. La clave `anon` solo es segura con políticas RLS correctas; no se deben agregar claves `service_role`, contraseñas o credenciales privadas al frontend. No hay `.env.example` documentado en la estructura revisada. El `README.md` indica configurar ambas variables y ejecutar `supabase/congreso.sql` desde el SQL Editor.

Si falta cualquiera de las variables, `supabaseClient.ts` exporta `null`: la app pública sigue renderizando, el contacto usa `mailto` y el panel muestra una nota de configuración pendiente.

## Persistencia

La base de datos es PostgreSQL de Supabase; no hay persistencia local propia del frontend ni un ORM. El esquema SQL define:

- `congress_editions`: ciudad, periodo, slug y estado de publicación.
- `sponsorship_tiers`: código/etiqueta de nivel.
- `sponsors`: marcas asociadas a edición y nivel.
- `panels` y `panel_speakers`: agenda, sesiones y ponentes.
- `venues` y `venue_amenities`: sedes y amenidades.
- `media_items`: imágenes, videos y medios aliados.
- `contact_messages`: solicitudes de contacto, seguimiento, notas internas y estado.

Hay índices por edición/orden, publicación o fecha de mensaje, y restricciones/checks para estados, tipos y niveles. El script inicial inserta niveles y tres ediciones semilla. La landing contiene también datos tipados locales y assets estáticos; el esquema no debe interpretarse como fuente activa para todas las secciones públicas.

## Seguridad de datos y RLS

`congreso.sql` habilita Row Level Security para las tablas del esquema. Declara políticas para lectura pública de contenidos activos/publicados, inserción pública en `contact_messages` y administración por usuarios autenticados. `fix-rls-admin.sql` instala políticas `FOR ALL TO authenticated` para resolver autorizaciones del backoffice.

**Límite importante:** `authenticated` no es equivalente a “administrador”. Con estas políticas cualquier usuario con sesión puede administrar las tablas cubiertas. El mismo SQL advierte que producción debería restringir permisos a un rol admin propio. Verifica y endurece las políticas en el proyecto Supabase de despliegue. Las políticas existentes no deben ampliarse como sustituto de autorización por rol.

## Manejo de estado y lógica asíncrona

- Estado de routing simple: el hash `#admin` y un listener `hashchange` en `App`.
- Selección de interés/nivel: estado de `App` compartido con niveles de patrocinio y formulario.
- Campos de contacto: estado local en `ContactForm`, con unión discriminada para `idle`, `invalid`, `submitting`, `success` y `error`.
- Administración: estado local React para sesión, sección activa, formularios, filas, edición y avisos.
- Hooks de navegador: `useCountdown` usa un intervalo con limpieza; `useAnimatedStats` usa `IntersectionObserver` y `requestAnimationFrame` con limpieza; `useReducedMotion` escucha cambios de `matchMedia` y retira el listener.
- No se declara Redux, Zustand, Context global de dominio ni caché de consultas.

## Testing y calidad

No se encontró runner de pruebas, archivos de pruebas ni script `test` declarado. Por tanto:

- La validación existente más directa es `npm run build`, que ejecuta primero el chequeo TypeScript (`tsc -b`) y después `vite build`.
- No se puede afirmar cobertura automatizada, pruebas de integración o pruebas end-to-end.
- Para funcionalidades nuevas, considerar pruebas cuando se incorpore formalmente un runner; hasta entonces, documentar validación manual y ejecutar build.
- El proyecto no declara lint/format en `package.json`; seguir formato y patrones locales sin afirmar que ESLint/Prettier esté configurado.

## Despliegue y operación

El build de Vite genera un sitio estático publicable en hosting compatible con SPA. En despliegue:

1. Instalar dependencias mediante npm e invocar `npm run build`.
2. Configurar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en el entorno de build.
3. Publicar los artefactos de salida de Vite (por defecto, `dist/`).
4. Configurar el hosting para servir `index.html` en la ruta raíz y preservar el acceso `/#admin`.
5. Aplicar `supabase/congreso.sql` al proyecto correspondiente y revisar las políticas RLS antes de abrir el acceso público.
6. Configurar la plantilla de confirmación de registro con `supabase/email-confirmation.html` en Authentication > Email Templates > Confirm signup, además de URLs permitidas de redirección de Supabase.

El `README.md` describe ejecución local mediante `npm run dev` y previsualización de producción con `npm run preview`. No se ven en la estructura revisada workflows CI/CD ni una plataforma de hosting fijada. La URL `/#admin` es una ruta de UI, no un control de autorización; esta última depende de Auth y RLS.

## Recursos del cliente

- `index.html` declara idioma español, viewport, descripción y preconnect a Google Fonts.
- Los assets en `public/assets/` se publican con rutas `/assets/...`.
- El punto de quiebre indicado por el README e instrucciones del proyecto es 760 px.
- `vendor/react.js`, `vendor/react-dom.js` y `support.js` aparecen en el árbol, pero el arranque de aplicación documentado por Vite usa imports de paquetes npm y `src/main.tsx`; no deben tratarse como una capa activa sin verificar el uso.
