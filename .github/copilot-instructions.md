# Guías de programación y contexto del proyecto para GitHub Copilot

> **Alcance:** estas reglas describen el proyecto **tal como existe hoy**: una página de aterrizaje estática basada en `DCLogic`. La sección 9 recoge las convenciones que aplicarían **solo si** el proyecto se migra explícitamente a React + TypeScript; mientras esa migración no exista en el repositorio, ignórala.

---

## 1. Contexto tecnológico

- **Tipo de proyecto:** página de aterrizaje independiente en HTML, en español, exportada desde una herramienta de diseño visual.
- **Motor de renderizado y lógica:** la lógica interactiva vive en `Main.dc.html`, en la clase `Component extends DCLogic`, junto con los enlaces de plantilla del motor (`{{...}}`, `<sc-for>`, `<sc-if>`).
- **Dependencias incluidas:** `vendor/react.js` y `vendor/react-dom.js` proporcionan el entorno de renderizado y `support.js` el entorno de Design Component. **No** es una aplicación React convencional: no hay JSX ni proceso de compilación de componentes.
- **Estilos:** la mayor parte del diseño heredado usa estilos en línea. Un bloque `<style>` dentro de la página define reglas globales, animaciones y algunas clases con prefijo `cn-`. No hay hojas de estilo separadas ni framework CSS.
- **Herramientas:** no hay `package.json`, gestor de paquetes (`npm`, `pnpm`, `yarn`), empaquetador (Vite, Webpack, Babel), archivos `.env` ni ejecutor de pruebas. La página se sirve como sitio estático; el README recomienda un servidor HTTP local para visualizarla.

---

## 2. Estructura de directorios

```text
/
├── Main.dc.html       # Marcado, estilos y lógica DCLogic de la página
├── README.md          # Notas de exportación y guía para visualizar localmente
├── support.js         # Entorno de Design Component incluido (generado, solo lectura)
├── assets/            # Imágenes y videos del evento
└── vendor/
    ├── react.js       # Dependencia incluida para el renderizado (solo lectura)
    └── react-dom.js   # Dependencia incluida para el renderizado del DOM (solo lectura)
```

No existen `src/`, hojas de estilo separadas, pruebas automatizadas, manifiesto de paquetes ni configuración de compilación.

---

## 3. Arquitectura y generación de código

- **Patrón de componentes:** la página es un único Design Component. La plantilla HTML y la clase `Component extends DCLogic` se mantienen juntas en `Main.dc.html`. Conserva las convenciones del motor; no introduzcas JSX ni componentes React convencionales.
- **Sintaxis de plantillas:** usa únicamente los enlaces del motor:
  - Interpolación: `{{...}}`
  - Bucles: `<sc-for>`
  - Condicionales: `<sc-if>`
- **Estado y flujo de datos:**
  - Usa exclusivamente `this.state` y `this.setState` dentro de la clase. El estado actual controla la cuenta regresiva, la selección de panel y edición, los campos del formulario, la reproducción del video y las estadísticas animadas.
  - Expón el comportamiento a la plantilla mediante `renderVals()`.
  - No mutes el estado directamente (p. ej. `this.state.items.push(...)`); crea copias nuevas y pásalas a `this.setState`.
  - No crees variables globales ni estado compartido externo.
  - Mantén los contenidos repetidos basados en datos (arreglos en el estado o en la clase) y muéstralos con `<sc-for>`.
- **Efectos y temporizadores:** encapsula temporizadores, observadores, listeners y cualquier llamada de red dentro de la lógica del componente, y libéralos cuando dejen de ser necesarios.
- **Archivos y nombres:** conserva los nombres actuales y la estructura de página independiente, salvo que el cambio solicitado requiera otro archivo. No hay convenciones de módulos ni exportaciones de aplicación.
- **Archivos de solo lectura:** no modifiques `support.js` ni `vendor/` para implementar funciones de la página.
- **Recursos multimedia:** no modifiques ni sobrescribas los archivos existentes de `assets/`. Los recursos nuevos van en `assets/` y se referencian con rutas relativas, siguiendo el patrón actual.

---

## 4. Sistema de diseño y CSS

### 4.1 Tokens de diseño

| Token | Valor | Uso |
|---|---|---|
| Verde profundo | `#06201A` | Color principal |
| Verde bosque | `#0B3328` | Color secundario |
| Lima | `#C8F135` | Acento |
| Neutros claros | `#F4F5EF`, `#F4F3EE`, `#FFFFFF` | Fondos |
| Neutro oscuro | `#111827` | Texto sobre fondos claros |
| Tipografía de cuerpo | `Manrope`, con alternativas sans-serif | Texto |
| Tipografía de exhibición | `Bebas Neue`, con las alternativas existentes | Encabezados |

Al introducir o consolidar estilos, declara estos valores como propiedades personalizadas de CSS y referéncialos desde ellas:

```css
:root {
  --cn-color-deep: #06201A;
  --cn-color-forest: #0B3328;
  --cn-color-lime: #C8F135;
  --cn-color-bg: #F4F5EF;
  --cn-color-bg-alt: #F4F3EE;
  --cn-color-white: #FFFFFF;
  --cn-color-ink: #111827;
  --cn-font-body: "Manrope", system-ui, sans-serif;
  --cn-font-display: "Bebas Neue", "Arial Narrow", sans-serif;
  --cn-content-width: 1280px;
}
```

No dispersas nuevos valores de color ni fuentes de marca fuera de estas variables. Si hace falta un color nuevo, añádelo primero como variable.

### 4.2 Metodología de estilos

- **No** añadas estilos en línea (`style="..."`) en marcado nuevo o refactorizado. La única excepción aceptable son valores estrictamente dinámicos calculados en tiempo de ejecución que no puedan expresarse con clases o variables CSS.
- **Estilos en línea heredados:** no los reescribas de forma masiva. Cuando un cambio solicitado modifique una sección, migra a clases `cn-` los estilos en línea de esa sección; deja intactas las demás.
- Escribe las reglas nuevas en el bloque `<style>` de la página, con clases de prefijo `cn-` (p. ej. `.cn-hero-container`).
- No uses selectores de etiqueta directos ni selectores globales amplios para estilos de componentes. Las reglas globales se reservan para valores predeterminados intencionales del documento que ya existen.
- Usa Flexbox para la maquetación general y Grid para grupos de imágenes o rejillas.
- Usa tipografía fluida con `clamp()` y unidades relativas (`rem`, `%`).
- Mantén el ancho de contenido centrado de aproximadamente `1280px` y la jerarquía visual existente.

---

## 5. Diseño adaptable

- El punto de quiebre móvil del proyecto es **`760px`** (es la regla presente en la hoja de estilos actual). Síguelo al cambiar el comportamiento adaptable.
- Añade puntos de quiebre adicionales solo cuando la maquetación lo requiera.
- Conserva los diseños con ajuste de contenido (`flex-wrap`) y tamaños fluidos existentes.

---

## 6. Accesibilidad (a11y) y rendimiento

- Usa etiquetas semánticas HTML5 (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`) y una jerarquía correcta de encabezados.
- Asocia cada control de formulario con un `<label>` explícito.
- Proporciona `alt` descriptivo en todas las imágenes; usa `alt=""` solo en imágenes puramente decorativas.
- Añade `loading="lazy"` a las imágenes que estén fuera del viewport inicial.
- Etiqueta los controles y expresa sus estados con ARIA cuando el estado afecte a la interfaz (`aria-label`, `aria-expanded`, `aria-controls`, `aria-selected`, `aria-pressed`).
- Todos los elementos interactivos deben funcionar con teclado y mostrar un indicador de foco visible (`:focus-visible`).
- Respeta `@media (prefers-reduced-motion: reduce)` en animaciones, transiciones y movimiento automático (incluidos video y contadores animados).

---

## 7. Flujo de generación paso a paso

Al responder o generar código para este proyecto, sigue siempre este orden:

1. **Estructura semántica HTML:** valida o construye el marcado con regiones principales, encabezados de sección, etiquetas y atributos de accesibilidad.
2. **Estilos con ámbito limitado:** implementa la maquetación y el diseño adaptable en el bloque `<style>`, con clases `.cn-*` y los tokens oficiales; nada de estilos en línea ni globales.
3. **Lógica e interactividad:** implementa el comportamiento en `DCLogic` con `this.setState`, `renderVals()` y los enlaces `{{...}}`, `<sc-for>` y `<sc-if>`, sin presuponer dependencias ni procesos de compilación inexistentes.

---

## 8. Antipatrones y restricciones absolutas

- 🚫 NO introduzcas JSX, TypeScript ni sintaxis de componentes React convencionales.
- 🚫 NO uses estilos en línea en marcado nuevo o refactorizado.
- 🚫 NO definas colores o fuentes de marca fuera de las variables de diseño.
- 🚫 NO contamines el ámbito global de CSS ni uses selectores de etiqueta sin el prefijo `.cn-*`.
- 🚫 NO mutes el estado directamente; usa siempre `this.setState` con valores nuevos.
- 🚫 NO crees variables globales ni estado compartido fuera del componente.
- 🚫 NO modifiques `support.js`, `vendor/` ni los archivos existentes de `assets/`.
- 🚫 NO importes librerías externas (p. ej. jQuery) ni dependencias que no estén en el repositorio.
- 🚫 NO supongas la existencia de `package.json`, `.env`, empaquetadores, gestores de paquetes o ejecutores de pruebas.

---

## 9. Anexo: convenciones en caso de migración a React + TypeScript

> ⚠️ **No aplica al proyecto actual.** Activa este anexo solo si el repositorio contiene explícitamente la migración: existen `package.json`, `src/` y archivos `.tsx`. En ese caso sustituye a las secciones 1, 2, 3, 8 y al paso 3 de la sección 7 en lo que se contradigan. Los tokens (sección 4), el punto de quiebre (sección 5), la accesibilidad (sección 6) y el orden de trabajo HTML → estilos → lógica siguen vigentes.

### 9.1 Stack y fuente de verdad

- **React 18+** con **TypeScript en modo estricto** (`"strict": true` en `tsconfig.json`). El código debe ser compatible también con React 19.
- **Vite o Next.js**, según lo que indique `package.json` en la raíz. Determina cuál es antes de generar código; no mezcles convenciones de ambos.
- **`package.json` es la fuente de verdad de las dependencias.** Usa solo librerías que ya estén declaradas en él. Si una tarea requiere una nueva, propónla explícitamente en vez de importarla.

### 9.2 Estructura de directorios

```text
src/
├── assets/        # Imágenes, fuentes, vectores
├── components/
│   ├── ui/        # Componentes atómicos (Button, Input, Card)
│   └── layout/    # Header, Footer, Navbar, contenedores
├── features/      # Secciones de la página, cada una autocontenida
│   ├── hero/
│   ├── countdown/
│   └── contact-form/
├── hooks/         # Hooks reutilizables entre features (useCountdown, useScroll)
├── styles/        # tokens.css, estilos base y temas
├── types/         # Tipos compartidos entre features
└── utils/         # Funciones puras sin dependencias de React
```

- Un hook o tipo usado por **una sola** feature vive dentro de esa feature; muévelo a `hooks/` o `types/` cuando lo use una segunda.
- No crees archivos `index.ts` de reexportación salvo que el proyecto ya los use.

### 9.3 Nombres de archivo

| Elemento | Convención | Ejemplo |
|---|---|---|
| Componente | PascalCase, un componente exportado por archivo | `HeroSection.tsx` |
| Estilos del componente | Mismo nombre + `.module.css` | `HeroSection.module.css` |
| Hook | camelCase con prefijo `use` | `useCountdown.ts` |
| Utilidad | camelCase | `formatDate.ts` |
| Prueba | Mismo nombre + `.test` | `HeroSection.test.tsx` |

Usa exportaciones con nombre (`export function`), no `export default`, salvo donde el framework lo exija (páginas y layouts de Next.js).

### 9.4 Componentes

- Solo **componentes funcionales**. La única excepción son los *error boundaries* (ver 9.9).
- Tipa las props directamente en la firma de la función. **No** uses `React.FC`.
- Las props opcionales llevan valor por defecto en la desestructuración.
- Un componente que crece más allá de una responsabilidad se divide; la lógica no visual pasa a un hook.

Ejemplo de referencia:

```tsx
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'accent';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  isLoading = false,
  disabled,
  type = 'button',
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = [styles.button, styles[variant], className]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      {...props}
      type={type}
      className={classes}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
    >
      {isLoading && <span className={styles.spinner} aria-hidden="true" />}
      {children}
    </button>
  );
}
```

Puntos clave del ejemplo: `{...props}` va **antes** de las props controladas para que no las sobrescriba; `disabled` combina el valor recibido con el estado de carga; `type="button"` evita envíos accidentales de formularios; el indicador de carga es decorativo y el texto del botón sigue siendo accesible.

### 9.5 TypeScript

- Prohibido `any`. Para entradas dinámicas usa `unknown` con *type guards* o genéricos.
- Usa `import type` para importar solo tipos.
- Modela estados excluyentes con uniones discriminadas en lugar de varios booleanos:

```ts
type FormStatus =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success' }
  | { kind: 'error'; message: string };
```

- Valida en tiempo de ejecución todo dato externo (respuestas de API, parámetros de URL) antes de tratarlo como un tipo concreto.

### 9.6 Estado

- Estado local con `useState`; usa `useReducer` cuando varias piezas de estado cambian juntas.
- **No guardes estado derivado.** Si un valor se puede calcular a partir de props o de otro estado, calcúlalo durante el render.
- Nunca mutes el estado: usa funciones updater puras (`setItems(prev => [...prev, item])`).
- Estado compartido: primero eleva el estado al ancestro común; recurre a Context y, si está en las dependencias, a Zustand o Redux Toolkit solo cuando varias ramas lejanas lo necesiten.

### 9.7 Efectos y custom hooks

- Encapsula temporizadores, listeners, observadores y Web APIs (scroll, resize, `matchMedia`) en hooks `use[Nombre].ts`.
- **Todo efecto que se suscribe a algo debe devolver su función de limpieza.**
- Declara todas las dependencias de `useEffect`; no silencies la regla `react-hooks/exhaustive-deps`.
- Pasa a los hooks valores primitivos (números, cadenas) en lugar de objetos que cambien de identidad en cada render.

Ejemplo de referencia:

```ts
import { useEffect, useState } from 'react';

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(targetTime: number): TimeLeft {
  const diff = Math.max(0, targetTime - Date.now());
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor(diff / 3_600_000) % 24,
    minutes: Math.floor(diff / 60_000) % 60,
    seconds: Math.floor(diff / 1_000) % 60,
  };
}

export function useCountdown(targetTime: number): TimeLeft {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(targetTime));

  useEffect(() => {
    const id = window.setInterval(() => {
      setTimeLeft(getTimeLeft(targetTime));
    }, 1_000);
    return () => window.clearInterval(id);
  }, [targetTime]);

  return timeLeft;
}
```

### 9.8 Listas, formularios y datos

- **Listas:** cada elemento lleva una `key` estable y única tomada de los datos (un `id`). No uses el índice del arreglo si la lista puede reordenarse, filtrarse o crecer.
- **Formularios:** cada campo tiene `<label>` asociado. Los errores se muestran como texto vinculado con `aria-describedby` y se marcan con `aria-invalid`. Si `react-hook-form` y `zod` están en las dependencias, úsalos; si no, usa campos controlados y validación en una función pura.
- **Datos remotos:** realiza las peticiones dentro de un hook, cancélalas con `AbortController` en la limpieza del efecto y gestiona los estados de carga, error y vacío. Si TanStack Query está en las dependencias, úsalo en su lugar.

### 9.9 Errores

- Envuelve cada sección principal con un *error boundary* para que un fallo no deje la página en blanco.
- Si `react-error-boundary` está en las dependencias, úsalo. Si no, se permite **un único** componente de clase `ErrorBoundary` en `components/layout/`; es la única excepción a la prohibición de componentes de clase.

### 9.10 Solo si el proyecto usa Next.js (App Router)

- Los componentes son Server Components por defecto. Añade `'use client'` solo en los componentes que usen estado, efectos, eventos o APIs del navegador, y colócalo lo más abajo posible en el árbol.
- Componentes que dependan de la hora actual (como la cuenta regresiva) son Client Components, para evitar diferencias de hidratación.
- Usa `next/image` para imágenes y `next/font` para cargar `Manrope` y `Bebas Neue`.

### 9.11 Estilos

- **CSS Modules** por defecto, un archivo `.module.css` junto a cada componente.
- Los tokens de la sección 4 viven en `src/styles/tokens.css` como propiedades personalizadas y se importan una sola vez en la raíz. Los módulos los consumen con `var(--cn-...)`; no repitas valores literales.
- Si el proyecto ya tiene Tailwind configurado, mapea los tokens en la configuración del tema y no uses valores arbitrarios (`bg-[#06201A]`).
- `style={...}` solo para valores estrictamente dinámicos calculados en tiempo de ejecución.
- Mantén el punto de quiebre de `760px` definido en la sección 5.

### 9.12 Rendimiento

- `React.memo`, `useCallback` y `useMemo` solo cuando una medición (React DevTools Profiler) muestre un problema real.
- Carga diferida de secciones pesadas con `React.lazy` y `Suspense` (o `next/dynamic` en Next.js).
- Las imágenes llevan dimensiones explícitas para evitar saltos de maquetación.

### 9.13 Iconos

- Usa la librería de iconos que esté en las dependencias (Lucide React o React Icons).
- Los iconos decorativos llevan `aria-hidden="true"`; un botón que solo contiene un icono lleva `aria-label`.

### 9.14 Calidad y pruebas

- Respeta la configuración de ESLint y Prettier del repositorio. Si existen, las reglas de `eslint-plugin-react-hooks` y `eslint-plugin-jsx-a11y` no se desactivan.
- Si hay ejecutor de pruebas configurado (Vitest o Jest con Testing Library), acompaña los componentes y hooks nuevos con pruebas. Consulta elementos por rol y nombre accesible (`getByRole`), no por clases ni por `data-testid` salvo que no haya alternativa.

### 9.15 Antipatrones (React)

- 🚫 NO uses componentes de clase, salvo el `ErrorBoundary` descrito en 9.9.
- 🚫 NO uses `React.FC` ni el tipo `any`.
- 🚫 NO mutes el estado ni guardes en él valores derivados.
- 🚫 NO hagas llamadas de red ni efectos secundarios fuera de `useEffect` o de custom hooks.
- 🚫 NO dejes efectos sin función de limpieza cuando se suscriben a algo.
- 🚫 NO uses el índice del arreglo como `key` en listas dinámicas.
- 🚫 NO apliques estilos globales sin aislamiento ni valores de color o fuente fuera de los tokens.
- 🚫 NO importes dependencias que no estén declaradas en `package.json`.
