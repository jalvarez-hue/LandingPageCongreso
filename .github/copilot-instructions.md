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
| Tipografía de cuerpo | `Manrope`, con alternativas sans-serif | Texto |
| Tipografía de exhibición | `Bebas Neue`, con las alternativas existentes | Encabezados |

Al introducir o consolidar estilos, declara estos valores como propiedades personalizadas de CSS y referéncialos desde ellas. Ejemplo de convención sugerida:

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
}
```

No dispersas nuevos valores de color ni fuentes de marca fuera de estas variables. Si hace falta un color nuevo (p. ej. un neutro oscuro para texto), añádelo primero como variable.

### 4.2 Metodología de estilos

- **No** añadas estilos en línea (`style="..."`) en marcado nuevo o refactorizado. La única excepción aceptable son valores estrictamente dinámicos calculados en tiempo de ejecución que no puedan expresarse con clases o variables CSS.
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

> ⚠️ **No aplica al proyecto actual.** Usa estas reglas solo si el repositorio contiene explícitamente una migración (p. ej. existen `src/`, `package.json` y archivos `.tsx`). En ese caso, sustituyen a las secciones 1–3 y 8 en lo que se contradigan; los tokens, la accesibilidad y el flujo de trabajo siguen vigentes.

- **Stack:** React 18+ con TypeScript (`.tsx`), Vite o Next.js según la configuración de la raíz.
- **Componentes:** solo componentes funcionales; prohibidos los componentes de clase.
- **Tipado:** define `interface` o `type` para las `Props` de cada componente; evita `any` (usa genéricos o `unknown` con type guards).
- **Estado:** `useState` / `useReducer` para estado local; Context API, Zustand o Redux Toolkit solo si un módulo lo requiere. Nunca mutar el estado; usar funciones updater puras.
- **Lógica:** encapsula llamadas a API, temporizadores y Web APIs (scroll, resize) en custom hooks `use[Nombre].ts`; ningún efecto secundario fuera de `useEffect` o hooks.
- **Estilos:** CSS Modules, Tailwind o clases con namespace, basados en los mismos tokens de la sección 4; `style={...}` solo para valores estrictamente dinámicos.
- **Rendimiento:** `React.memo`, `useCallback` y `useMemo` solo con impacto real medido.
- **Iconos:** Lucide React o React Icons.
- **Estructura sugerida:**

```text
src/
├── assets/        # Imágenes, fuentes, vectores
├── components/
│   ├── ui/        # Componentes atómicos (botones, entradas, tarjetas)
│   └── layout/    # Header, Footer, Navbar, contenedores
├── features/      # Secciones de la página (hero, formulario, etc.)
├── hooks/         # Hooks reutilizables (useCountdown, useScroll)
├── styles/        # Tokens y temas
├── types/         # Tipos compartidos
└── utils/         # Funciones puras
```
