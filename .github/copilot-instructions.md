# Guías de programación y contexto del proyecto para GitHub Copilot

> **Alcance:** el proyecto parte de una página de aterrizaje estática exportada desde una herramienta de diseño (`Main.dc.html` con `DCLogic`). **Todo el código nuevo o refactorizado debe generarse en la estructura modular de la sección 2, repartido en archivos separados, y nunca concentrado en un único archivo.** `Main.dc.html` queda como referencia heredada de contenido, diseño y comportamiento.

---

## 1. Contexto tecnológico

### 1.1 Estado actual (heredado)
- Página de aterrizaje independiente en HTML, en español. La lógica vive en `Main.dc.html`, en la clase `Component extends DCLogic`, con enlaces de plantilla (`{{...}}`, `<sc-for>`, `<sc-if>`).
- `vendor/react.js`, `vendor/react-dom.js` y `support.js` son el entorno de ejecución incluido; son de solo lectura.
- La mayor parte del diseño usa estilos en línea y un bloque `<style>` con algunas clases `cn-`.
- No hay `package.json`, empaquetador ni pruebas.

### 1.2 Stack objetivo (código generado)
- **Framework:** React 18+ con TypeScript (`.tsx` / `.ts`).
- **Herramienta de compilación:** Vite. Si el repositorio aún no tiene `package.json`, `tsconfig.json`, `vite.config.ts` e `index.html` de entrada, genéralos como parte de la estructura.
- **Componentes:** exclusivamente funcionales.
- **Estilos:** CSS Modules (`*.module.css`) junto a cada componente, más tokens globales en `src/styles/`.
- **Estado:** `useState` / `useReducer` para estado local; Context API solo si varias secciones comparten estado. Zustand o Redux Toolkit solo si un módulo lo justifica.
- **Iconos:** Lucide React.

---

## 2. Estructura del proyecto (obligatoria)

```text
/
├── index.html                  # Punto de entrada de Vite
├── package.json
├── tsconfig.json
├── vite.config.ts
├── Main.dc.html                # Referencia heredada (no ampliar)
├── support.js                  # Entorno heredado (solo lectura)
├── vendor/                     # Entorno heredado (solo lectura)
├── public/                     # Archivos servidos tal cual (favicon, etc.)
└── src/
    ├── main.tsx                # Montaje de la aplicación
    ├── App.tsx                 # Composición de secciones, sin lógica de negocio
    ├── assets/                 # Imágenes y videos del evento
    ├── components/
    │   ├── ui/                 # Componentes atómicos: Button, Input, Card…
    │   └── layout/             # Header, Footer, Navbar, Container
    ├── features/               # Una carpeta por sección de la página
    │   ├── hero/
    │   ├── countdown/
    │   ├── stats/
    │   ├── video/
    │   └── contact-form/
    ├── hooks/                  # Hooks reutilizables: useCountdown, useReducedMotion…
    ├── styles/
    │   ├── tokens.css          # Variables de diseño (sección 4)
    │   └── base.css            # Valores predeterminados del documento
    ├── types/                  # Tipos compartidos
    └── utils/                  # Funciones puras
```

### 2.1 Reglas de separación en archivos

- **Un componente por archivo.** Cada componente vive en su propio `NombreComponente.tsx`.
- **Estilos junto al componente**, en `NombreComponente.module.css`. Nunca dentro del `.tsx`.
- **Lógica fuera de la presentación.** Temporizadores, efectos, llamadas de red y Web APIs (scroll, resize, reproducción de video) van en hooks `use[Nombre].ts`, dentro de `hooks/` si se reutilizan o dentro de la carpeta de la sección si son exclusivos.
- **Datos fuera del marcado.** Los contenidos repetidos (ponentes, estadísticas, paneles) van en `data.ts` dentro de la sección y se renderizan con `.map()`.
- **Tipos** en `types/` si se comparten, o en el propio archivo si son exclusivos del componente.
- **Cada sección** de `features/` incluye un `index.ts` que reexporta su componente principal.

Ejemplo de una sección:

```text
src/features/countdown/
├── Countdown.tsx
├── Countdown.module.css
├── useCountdown.ts
├── types.ts
└── index.ts
```

### 2.2 Migración desde `Main.dc.html`

Al migrar una parte de la página, extrae de `Main.dc.html` el contenido, los textos, el orden visual y el comportamiento, y recréalos en los archivos correspondientes de `src/`. Traduce el estado de `DCLogic` (`this.state`, `this.setState`, `renderVals()`) a hooks, y `<sc-for>` / `<sc-if>` a `.map()` y renderizado condicional. No añadas código nuevo a `Main.dc.html`.

---

## 3. Arquitectura y generación de código

### 3.1 TypeScript
- Define `interface` o `type` para las `Props` de cada componente.
- No uses `any`; usa genéricos o `unknown` con type guards para entradas dinámicas.

```tsx
// src/components/ui/Button.tsx
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button = ({
  variant = 'primary',
  isLoading = false,
  children,
  className = '',
  ...props
}: ButtonProps) => (
  <button
    className={`${styles.button} ${styles[variant]} ${className}`}
    disabled={isLoading || props.disabled}
    aria-busy={isLoading}
    {...props}
  >
    {children}
  </button>
);
```

### 3.2 Estado
- No mutes el estado directamente; usa funciones updater puras (`setItems(prev => [...prev, item])`).
- No crees variables globales mutables.
- Libera temporizadores, listeners y observadores en la función de limpieza de `useEffect`.

### 3.3 Rendimiento
- Usa `React.memo`, `useCallback` y `useMemo` solo cuando haya un impacto real.

---

## 4. Sistema de diseño y CSS

### 4.1 Tokens (`src/styles/tokens.css`)

| Token | Valor | Uso |
|---|---|---|
| Verde profundo | `#06201A` | Color principal |
| Verde bosque | `#0B3328` | Color secundario |
| Lima | `#C8F135` | Acento |
| Neutros claros | `#F4F5EF`, `#F4F3EE`, `#FFFFFF` | Fondos |
| Tipografía de cuerpo | `Manrope`, con alternativas sans-serif | Texto |
| Tipografía de exhibición | `Bebas Neue`, con alternativas | Encabezados |

```css
:root {
  --cn-color-deep: #06201A;
  --cn-color-forest: #0B3328;
  --cn-color-lime: #C8F135;
  --cn-color-bg: #F4F5EF;
  --cn-color-bg-alt: #F4F3EE;
  --cn-color-white: #FFFFFF;
  --cn-font-body: "Manrope", system-ui, sans-serif;
  --cn-font-display: "Bebas Neue", "Arial Narrow", sans-serif;
  --cn-content-width: 1280px;
  --cn-bp-mobile: 760px; /* referencia; en media queries usa el valor literal */
}
```

Los componentes referencian siempre estas variables; no escribas colores ni fuentes de marca directamente. Si hace falta un valor nuevo, añádelo primero aquí.

### 4.2 Metodología
- No uses `style={...}` en línea salvo para valores estrictamente dinámicos calculados en tiempo de ejecución.
- Los estilos de componente van en CSS Modules; solo `tokens.css` y `base.css` contienen reglas globales.
- Flexbox para la maquetación general, Grid para rejillas e imágenes, `clamp()` y unidades relativas para tamaños fluidos.
- Ancho de contenido centrado de aproximadamente `1280px`.

---

## 5. Diseño adaptable

- Punto de quiebre móvil: **`760px`** (el del diseño original).
- Añade puntos de quiebre adicionales solo si la maquetación lo requiere.
- Conserva los diseños con ajuste de contenido y tamaños fluidos del original.

---

## 6. Accesibilidad (a11y)

- Etiquetas semánticas (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`) y jerarquía correcta de encabezados.
- Cada control de formulario asociado a un `<label>` (`htmlFor` + `id`).
- `alt` descriptivo en todas las imágenes; `alt=""` solo para las decorativas. `loading="lazy"` en las que estén fuera del viewport inicial.
- ARIA cuando el estado afecte a la interfaz: `aria-label`, `aria-expanded`, `aria-controls`, `aria-selected`, `aria-pressed`.
- Todo elemento interactivo navegable por teclado, con foco visible (`:focus-visible`).
- Respeta `prefers-reduced-motion` en animaciones, contadores animados y reproducción automática de video (por ejemplo, con un hook `useReducedMotion`).

---

## 7. Flujo de generación paso a paso

1. **Archivos y estructura:** determina en qué carpeta de la sección 2 va cada pieza y crea los archivos separados (componente, estilos, hook, tipos, datos, `index.ts`).
2. **Estructura semántica:** escribe el marcado del componente con regiones, encabezados, etiquetas y atributos de accesibilidad.
3. **Estilos:** implementa la maquetación y el diseño adaptable en el `.module.css` del componente, usando los tokens.
4. **Lógica:** implementa el estado y los efectos en hooks, y conéctalos al componente.
5. **Composición:** importa la sección desde su `index.ts` en `App.tsx`.

---

## 8. Antipatrones y restricciones absolutas

- 🚫 NO generes todo el código en un único archivo (ni en `Main.dc.html`, ni en `App.tsx`, ni en un `.tsx` monolítico).
- 🚫 NO mezcles en un mismo archivo componente, estilos, lógica de efectos y datos.
- 🚫 NO añadas código nuevo a `Main.dc.html` ni modifiques `support.js` o `vendor/`.
- 🚫 NO uses componentes de clase.
- 🚫 NO uses `any`.
- 🚫 NO uses estilos en línea salvo valores estrictamente dinámicos.
- 🚫 NO escribas colores o fuentes de marca fuera de `tokens.css`.
- 🚫 NO apliques estilos globales fuera de `tokens.css` y `base.css`.
- 🚫 NO mutes el estado directamente.
- 🚫 NO hagas llamadas de red ni efectos secundarios fuera de `useEffect` o hooks.
- 🚫 NO uses librerías obsoletas (p. ej. jQuery).
