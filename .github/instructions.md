# Guía de arquitectura e instrucciones para desarrollo

## Estado real del proyecto

Este repositorio contiene una aplicación **React 18 + TypeScript + Vite**, con estilos CSS Modules y una integración con Supabase. La primera parte de `.github/copilot-instructions.md` describe una versión anterior basada en `Main.dc.html` y `DCLogic`; esa descripción no corresponde a la estructura actual. El anexo de migración a React + TypeScript de ese archivo sí aplica al estado actual, junto con las convenciones vigentes en el código.

La aplicación reúne una landing informativa para el Congreso Nacional de Aseguradoras y Hospitales y un backoffice para administrar contenido y mensajes.

## Estructura del proyecto

```text
/
├── index.html                    # Documento HTML inicial; carga fuentes y src/main.tsx
├── package.json                  # Dependencias y scripts de Vite/TypeScript
├── vite.config.ts                # Configuración de Vite
├── tsconfig*.json                 # Configuración TypeScript (app y configuración Node)
├── README.md                     # Instalación, ejecución y configuración de Supabase
├── public/
│   ├── email-confirmation.html   # Plantilla de confirmación para Supabase Auth
│   └── assets/                   # Imágenes, videos y logos servidos como estáticos
├── src/
│   ├── main.tsx                  # Montaje React y StrictMode
│   ├── App.tsx                   # Selección landing/admin y composición de la landing
│   ├── admin/
│   │   ├── AdminApp.tsx          # Autenticación y pantallas CRUD del backoffice
│   │   ├── AdminApp.module.css   # Estilos aislados del backoffice
│   │   └── adminTypes.ts         # Tipos de registros que consume el backoffice
│   ├── components/layout/
│   │   └── SectionBoundary.tsx   # Error boundary por sección de la landing
│   ├── data/                     # Datos tipados estáticos de paneles, perspectivas y sponsors
│   ├── features/
│   │   ├── contact/              # Formulario de interés y patrocinio
│   │   ├── footer/               # Pie de página
│   │   ├── header/               # Navegación
│   │   ├── hero/                 # Portada
│   │   ├── levels/               # Niveles de patrocinio
│   │   ├── media/                # Galería/medios
│   │   ├── panels/               # Programa y paneles
│   │   ├── perspectives/         # Contenido por perfil del sector
│   │   ├── sponsors/             # Marcas patrocinadoras
│   │   ├── stats/                # Cifras animadas
│   │   └── venue/                # Sede del congreso
│   ├── hooks/                    # Cuenta regresiva, animación y movimiento reducido
│   ├── lib/
│   │   └── supabaseClient.ts     # Cliente Supabase opcional
│   ├── styles/
│   │   ├── base.css              # Estilos globales y base
│   │   └── tokens.css            # Tokens de diseño cn-*
│   ├── types/
│   │   └── congress.ts           # Tipos compartidos del dominio del congreso
│   └── vite-env.d.ts             # Tipado de variables VITE_*
├── supabase/
│   ├── congreso.sql              # Esquema, datos iniciales y políticas RLS
│   ├── fix-rls-admin.sql         # Políticas adicionales para administración autenticada
│   └── email-confirmation.html   # Copia fuente de la plantilla de confirmación
└── vendor/
    ├── react.js                  # Recursos incluidos en el repositorio
    └── react-dom.js              # Recursos incluidos en el repositorio
```

Los archivos de `vendor/` y el runtime `support.js` son heredados/incluidos y no forman parte del flujo habitual de compilación React descrito por `package.json`. No se debe asumir que `Main.dc.html` existe: el punto de entrada presente es `src/main.tsx`.

## Patrones de diseño e invariantes

### Patrones que sí aparecen

- **Aplicación de página única con composición por features:** `App` organiza componentes funcionales independientes por sección.
- **Separación por feature:** cada sección visual se agrupa con su componente y CSS Module; el contenido que se repite o se comparte se modela en `src/data/` y `src/types/`.
- **Cliente de infraestructura compartido:** `src/lib/supabaseClient.ts` crea una única instancia de Supabase si se configuraron ambas variables requeridas; de lo contrario exporta `null`.
- **Backoffice CRUD:** `AdminApp` consulta y modifica tablas de Supabase para patrocinadores, paneles, sedes, medios y mensajes.
- **Error boundary por región:** `SectionBoundary` evita que un error de renderizado de una sección rompa toda la landing.
- **Hooks para efectos reutilizables:** cuenta regresiva, animación de estadísticas y preferencia de movimiento reducido viven en `src/hooks/`.

No se identifica una implementación de Clean Architecture, CQRS ni una capa Repository formal. Las llamadas a Supabase están en los componentes que las necesitan; no se debe documentar ni introducir una capa de repositorios como si ya existiera.

### Invariantes para cambios

1. Mantén TypeScript estricto y evita `any`; valida datos externos antes de confiar en ellos.
2. Usa componentes funcionales; el único componente de clase existente es el `SectionBoundary`, necesario para implementar un error boundary.
3. Mantén cada feature autocontenida y su CSS en un CSS Module, siguiendo el patrón de los archivos existentes.
4. Usa `src/types/congress.ts` para los tipos de dominio compartidos; los tipos del backoffice están en `src/admin/adminTypes.ts`.
5. No mutar estado React: usa setters con valores nuevos o funciones updater.
6. Todo efecto que registre listeners, temporizadores, observadores u otros recursos debe limpiarlos al desmontar.
7. Respeta los tokens `--cn-*` de `src/styles/tokens.css`, el ancho de contenido existente y el breakpoint móvil de **760 px**.
8. Preserva el diseño adaptable, la semántica, el foco visible, etiquetas asociadas a campos y soporte para `prefers-reduced-motion`.
9. No reemplaces la landing con datos dinámicos de Supabase sin confirmar el alcance. Actualmente varias secciones consumen datos locales tipados y recursos estáticos.
10. No pongas credenciales privadas en el bundle. La aplicación usa la URL y la clave pública/anon de Supabase mediante variables `VITE_*`; la autorización efectiva debe residir en RLS.
11. Mantén `public/assets/` como recursos estáticos relativos al sitio y no alteres assets existentes salvo que la tarea lo requiera.
12. No añadas dependencias sin una necesidad concreta y una actualización explícita de `package.json`.

## Stack tecnológico

- React `^18.3.1` y React DOM `^18.3.1`.
- TypeScript `^5.7.0`, con configuración estricta.
- Vite `^6.0.0`, como servidor de desarrollo y herramienta de build/preview.
- `@supabase/supabase-js` `^2.118.0`, para autenticación y acceso a PostgreSQL gestionado por Supabase.
- CSS Modules y CSS estándar, sin framework de estilos declarado.
- Fuentes Manrope y Bebas Neue cargadas desde Google Fonts en `index.html`.
- Aplicación en español; HTML inicial con `lang="es"`.

Scripts disponibles: `npm run dev`, `npm run build` y `npm run preview`. No hay script de test, ESLint o formatter declarado en `package.json`.

## Flujo de funcionamiento

1. El navegador solicita `index.html`; Vite carga `src/main.tsx`.
2. `main.tsx` comprueba que exista `#root` y monta `<App />` bajo `StrictMode`.
3. `App` lee `window.location.hash`. Si es `#admin`, renderiza `AdminApp`; si no, compone la landing en orden: navegación, portada, cifras, perspectivas, patrocinadores, paneles, niveles de patrocinio, sede, formulario, medios y pie.
4. La landing usa componentes de `src/features/`, datos tipados de `src/data/`, assets de `public/assets/`, hooks y tokens/CSS Modules.
5. Seleccionar una opción de patrocinio actualiza el estado de `App`, que comparte la selección con los niveles y el formulario.
6. Al enviar el formulario, se validan nombre, empresa y correo. Con Supabase configurado se inserta un registro en `contact_messages`; sin cliente Supabase, se prepara un enlace `mailto` al correo de contacto.
7. En `/#admin`, `AdminApp` recupera y escucha el estado de sesión de Supabase Auth. Sin variables muestra un aviso de configuración; sin sesión presenta inicio/registro; con sesión permite administrar los módulos disponibles.
8. Las operaciones del backoffice consultan o escriben directamente las tablas de Supabase y muestran avisos de operación. Los permisos de base de datos se aplican mediante RLS.

## Prompt base para generación de código

```text
Actúa como contribuidor/a de este repositorio. Antes de editar, inspecciona los
componentes y convenciones existentes relacionados con la tarea.

Contexto: aplicación SPA en React 18 + TypeScript estricto + Vite. La landing
está en src/features/, el backoffice en src/admin/, los datos estáticos en
src/data/, los tipos compartidos en src/types/, los hooks en src/hooks/ y el
cliente Supabase opcional en src/lib/supabaseClient.ts. Usa CSS Modules,
tokens --cn-* y el breakpoint móvil de 760 px.

Objetivo:
[Describe aquí el comportamiento o cambio esperado.]

Restricciones:
- Conserva la arquitectura y el comportamiento no relacionado.
- Usa componentes funcionales y tipos estrictos; no uses `any`.
- No mutes estado. Limpia los efectos y suscripciones.
- Conserva accesibilidad, soporte para movimiento reducido y responsive.
- No añadas librerías ni asumas que los datos de la landing vienen de Supabase.
- Para datos persistidos, respeta las tablas y las políticas RLS existentes.

Entrega:
1. Implementa el cambio en los archivos mínimos necesarios.
2. Añade o actualiza pruebas solo si el repositorio ya dispone de infraestructura
   adecuada; no declares pruebas inexistentes.
3. Ejecuta `npm run build` o la validación enfocada más apropiada.
4. Resume los archivos cambiados, decisiones y validaciones realizadas.
```

## Nota de mantenimiento de instrucciones

La sección inicial actual de `.github/copilot-instructions.md` aún habla de la página exportada como `Main.dc.html`; contradice el árbol y los scripts vigentes. Hasta que se actualice ese archivo, usa el código y `package.json` actuales como fuente de verdad para decisiones de implementación. El anexo React/TypeScript de las instrucciones existentes es el que concuerda con el proyecto actual.
