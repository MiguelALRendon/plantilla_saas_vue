# CSS Directory

## 1. Propósito

Contiene los estilos CSS globales del framework organizados por responsabilidad: tokens de diseño en constants.css (única fuente de verdad), estilos de formularios, estilos de tablas y estilos principales de aplicación. Implementa la **Política Anti-Hardcode** (04-UI-CONTRACT §6.4) mediante sistema centralizado de tokens CSS.

## 2. Alcance

### Responsabilidades
- `constants.css` - **Fuente de verdad única** de tokens CSS: colores, spacing, typography, transitions, z-index, dimensiones de componentes (~300 tokens definidos)
- `form.css` - Estilos globales de formularios y inputs (floating labels, focus states, validation feedback)
- `table.css` - Estilos de tablas CRUD (headers, rows, pagination, sorting indicators)
- `main.css` - Estilos base de aplicación, resets CSS, layout grid, scrollbars

### Límites
- NO contiene estilos de componentes específicos - Esos usan `<style scoped>`
- NO define lógica JavaScript - Solo CSS puro
- NO modifica tokens en runtime - Son constantes

## 3. Definiciones Clave

**CSS Tokens**: Variables CSS (custom properties) definidas en `:root` que actúan como single source of truth para valores de diseño (ej: `--primary-color`, `--spacing-md`, `--transition-normal`).

**Política Anti-Hardcode (§6.4)**: Prohibición absoluta de valores CSS literales (400px, #FF0000, 0.5s) en componentes. TODOS los valores DEBEN usar tokens: `var(--modal-width)`, `var(--color-primary)`, `var(--transition-quick)`.

**Design System**: Conjunto completo de tokens que garantiza consistencia visual: ~35 colores, ~10 spacing values, ~8 font sizes, ~15 component-specific dimensions, ~5 transitions, ~10 z-index layers.

**Scoped Styles**: Componentes Vue usan `<style scoped>` para CSS component-specific, pero SIEMPRE referenciando tokens de constants.css.

## 4. Descripción Técnica

`constants.css` define ~300 CSS custom properties en `:root`:

**Categorías de tokens:**
- **Colores** (~35): --primary, --secondary, --white, --black, --gray-*, --lavender, --sky, --accent-red, --success-green, etc.
- **Spacing** (~10): --spacing-xs (0.5rem), --spacing-sm, --spacing-md, --spacing-lg, --spacing-xl, --spacing-xxl
- **Typography** (~8): --font-size-xs, --font-size-sm, --font-size-base, --font-size-lg, --font-weight-normal, --font-weight-medium, --font-weight-bold
- **Transitions** (~5): --transition-quick (0.3s), --transition-normal (0.5s), --transition-slow (0.8s), --timing-ease, --timing-bounce
- **Z-Index** (~10): --z-base (1), --z-sidebar (100), --z-dropdown (200), --z-modal (1000), --z-toast (1500), --z-tooltip (2000)
- **Component Dimensions** (~20): --topbar-height (50px), --sidebar-width-collapsed, --sidebar-width-expanded, --modal-*, --toast-*, --button-height, etc.
- **Borders** (~5): --border-radius, --border-radius-large, --border-radius-full, --border-width-thin, --border-gray
- **Shadows** (~5): --shadow-light, --shadow-dark, --shadow-focus
- **Table** (~8): --table-width-*, --table-row-min-height
- **Filter Effects** (~3): --filter-brightness-hover

`form.css` implementa floating label pattern, validation states (.nonvalidated, .is-invalid), disabled states, focus rings con var(--color-focus).

`table.css` define grid layouts de DataTableComponent, striped rows con var(--bg-gray), hover states con var(--filter-brightness-hover).

## 5. Flujo de Funcionamiento

**Desarrollo de Componente:**
1. Developer crea BooleanInputComponent
2. Necesita border-radius para botón
3. Consulta constants.css → encuentra `--border-radius-large: 1rem`
4. Escribe CSS scoped: `border-radius: var(--border-radius-large);`
5. NO hardcodea `border-radius: 1rem` (violación de §6.4)

**Cambio de Theme:**
1. Design team decide cambiar primary color de #3498DB a #2980B9
2. Update único: `constants.css` línea 15: `--primary: #2980B9;`
3. Todos los 50+ componentes que usan `var(--primary)` actualizan automáticamente
4. Zero refactoring en componentes

**Creación de Nuevo Token:**
1. Developer necesita `--sidebar-footer-max-height: 70px`
2. Agrega en constants.css sección "Component-specific dimensions"
3. Documenta en spec: `copilot/layers/04-components/SideBarComponent.md`
4. Usa en código: `max-height: var(--sidebar-footer-max-height);`
5. Commit token + spec update + code change siguiendo SPEC FIRST methodology

## 6. Reglas Obligatorias

### 6.1 Política Anti-Hardcode Absoluta

**NUNCA** usar valores CSS literales en componentes. **SIEMPRE** usar tokens:

```css
/* ✅ CORRECTO */
.component {
    width: var(--modal-width);
    color: var(--primary);
    transition: var(--transition-normal) var(--timing-ease);
}

/* ❌ INCORRECTO - Violación de §6.4 */
.component {
    width: 400px;
    color: #3498DB;
    transition: 0.5s ease;
}
```

### 6.2 Unit-less Zero

SIEMPRE usar `0` sin unidades para valores cero, NO `0px`, `0rem`:

```css
/* ✅ CORRECTO */
border: 0 solid transparent;
margin: 0;

/* ❌ INCORRECTO */
border: 0px solid transparent;
margin: 0rem;
```

### 6.3 Creación de Nuevos Tokens

Al crear token nuevo:
1. Agregar en constants.css en sección apropiada
2. Documentar en spec correspondiente (.md file)
3. Usar en código
4. Commit todo junto

### 6.4 Naming Convention

Tokens DEBEN seguir patrón semántico:
- `--component-property-variant` (ej: --button-background-disabled)
- `--category-size` (ej: --spacing-md)
- `--z-layer` (ej: --z-modal)

### 6.5 No Eliminar Tokens

NUNCA eliminar tokens sin verificar ausencia de uso en codebase. Usar grep search antes de deprecar.

## 7. Prohibiciones

1. NO hardcodear valores CSS en componentes - 04-UI-CONTRACT §6.4
2. NO crear tokens duplicados con nombres diferentes
3. NO usar `!important` excepto casos excepcionales documentados
4. NO definir tokens en archivos que no sean constants.css
5. NO usar inline styles `style="width: 200px"` - usar classes con tokens
6. NO crear archivos CSS adicionales sin justificación arquitectónica
7. NO modificar tokens sin actualizar spec correspondiente
8. NO usar valores mágicos - documentar significado de cada token
9. NO omitir unidades en valores no-zero (20 → 20px)
10. NO usar color names (red, blue) - usar hex/rgb

## 8. Dependencias

- Vite - CSS bundling y hot reload
- Vue 3 - Scoped styles en componentes SFC
- PostCSS - CSS processing

**Consumidores de tokens:**
- Todos los componentes en src/components/ (60+ archivos .vue)
- Todos los specs en copilot/layers/ documentando uso correcto

## 9. Relaciones

constants.css → TODOS los componentes .vue (source of truth)  
form.css → Input Components (TextInputComponent, etc.)  
table.css → DataTableComponent, DetailViewTableComponent  
main.css → App.vue, layout components

Documentos: `copilot/04-UI-DESIGN-SYSTEM-CONTRACT.md` §6.4

## 10. Notas de Implementación

### Importación en main.ts

```typescript
// main.ts
import '@/css/main.css';
import '@/css/constants.css';
import '@/css/form.css';
import '@/css/table.css';
```

### Uso en Componentes

```vue
<template>
    <div class="modal">...</div>
</template>

<style scoped>
.modal {
    width: var(--modal-width);
    height: var(--modal-height);
    background-color: var(--white);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-dark);
    z-index: var(--z-modal);
    transition: opacity var(--transition-normal) var(--timing-ease);
}
</style>
```

### Agregar Nuevo Token

```css
/* constants.css - Component-specific dimensions section */
--my-component-max-width: 600px;
--my-component-padding: var(--spacing-lg);
```

Luego documentar en `copilot/layers/04-components/my-component.md`:
```markdown
## CSS Tokens Obligatorios

- **--my-component-max-width**: Ancho máximo del componente
- **--my-component-padding**: Padding interno
```

## 11. Referencias Cruzadas

**Contratos:**
- [04-UI-DESIGN-SYSTEM-CONTRACT.md](../../../copilot/04-UI-DESIGN-SYSTEM-CONTRACT.md) - §6.4 Política Anti-Hardcode (CRÍTICO)
- [05-ENFORCEMENT-TECHNICAL-CONTRACT.md](../../../copilot/05-ENFORCEMENT-TECHNICAL-CONTRACT.md) - §6.9 Spec-First Design

**Specs de Componentes (todos usan tokens):**
- [modal-components.md](../../../copilot/layers/04-components/modal-components.md) - Tokens de modales
- [SideBarComponent.md](../../../copilot/layers/04-components/SideBarComponent.md) - Tokens de sidebar
- [boolean-input-component.md](../../../copilot/layers/04-components/boolean-input-component.md) - Tokens de inputs

**Ubicación:** `src/css/`  
**Nivel de importancia:** CRÍTICO - Base del design system
