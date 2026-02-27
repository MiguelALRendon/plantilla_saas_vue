# UI Design System Checklist: Framework SaaS Vue

**Purpose**: Validate compliance with UI/CSS design system rules before implementation review
**Contract**: [`/copilot/04-UI-DESIGN-SYSTEM-CONTRACT.md`](/copilot/04-UI-DESIGN-SYSTEM-CONTRACT.md)
**Created**: 2026-02-27
**Feature**: [spec.md](../spec.md) §9 UI Design System Contract

---

## Archivos CSS Centralizados (§6.2)

- [ ] `src/css/constants.css` existe y centraliza TODAS las variables CSS globales
- [ ] `src/css/main.css` existe, importa `constants.css` y contiene solo estilos base globales
- [ ] `src/css/form.css` existe con estilos de formularios usando exclusivamente tokens
- [ ] `src/css/table.css` existe con estilos de tablas usando exclusivamente tokens
- [ ] `main.css` NO contiene estilos específicos de componentes individuales

---

## Sistema de Tokens — Completitud de `constants.css` (§6.3)

- [ ] **Colores**: colores base (blanco, negro), escala de grises, colores de acento
- [ ] **Colores de botones**: primary, secondary, info, success, warning, accent
- [ ] **Colores dark-mode**: bloque override con atributo `[data-theme="dark"]` o equivalente
- [ ] **Espaciados**: padding small/medium/large, margin small/medium/large
- [ ] **Dimensiones estándar**: sidebar width, container widths, header/button heights
- [ ] **Sombras**: shadow-light, shadow-medium, shadow-dark, shadow-white, overlay-dark, overlay-light
- [ ] **Bordes**: border-radius estándar, border-radius circle, colores de borde
- [ ] **Transiciones — Duraciones**: `--transition-fast: 0.15s`, `--transition-normal: 0.3s`, `--transition-slow: 0.5s`
- [ ] **Transiciones — Timing**: `ease`, `ease-in-out`, `cubic-bezier(0.68, -0.55, 0.27, 1.55)` para rebote
- [ ] **Z-Index** jerarquía completa: `--z-base: 1`, `--z-dropdown: 100`, `--z-sticky: 200`, `--z-overlay: 500`, `--z-modal: 1000`, `--z-toast: 1500`, `--z-tooltip: 2000`
- [ ] **Breakpoints**: `--breakpoint-mobile: 768px`, `--breakpoint-tablet: 1024px`, `--breakpoint-laptop: 1440px`, `--breakpoint-desktop: 1920px`
- [ ] **Tipografía**: font-size base, headings (h1–h6), font-weight estándar, line-height
- [ ] **Opacidades**: opacity-hover, opacity-disabled, opacity-overlay

---

## Política Anti-Hardcode (§6.4)

- [ ] Sin colores hex directos (`#xxxxxx`) en ningún archivo CSS (salvo excepción documentada con comentario)
- [ ] Sin colores `rgb()`/`rgba()` hardcodeados — usar `var(--overlay-*)` para transparencias
- [ ] Sin valores numéricos `px` repetidos — usar `var(--spacing-*)` o `var(--*-height)`
- [ ] Sin `z-index` numéricos — usar exclusivamente `var(--z-*)`
- [ ] Sin duraciones hardcodeadas (`0.3s`, `500ms`) — usar `var(--transition-*)`
- [ ] Sin `border-radius` numérico repetido — usar `var(--radius-*)`
- [ ] Sin `box-shadow` literal — usar `var(--shadow-*)`
- [ ] Sin `font-size` numérico — usar `var(--text-*)`
- [ ] Sin `opacity` valores intermedios — usar `var(--opacity-*)` (excepto `0` y `1`)
- [ ] Excepciones (valores únicos demostrables) documentadas con comentario `/* Excepción: razón */`

---

## Estilos en Componentes Vue (§6.13)

- [ ] Todo componente Vue usa `<style scoped>` por defecto
- [ ] Uso de `<style>` sin scoped tiene comentario de justificación obligatorio
- [ ] Ningún componente Vue **define** variables CSS propias (`:root { --local-var: ... }` está prohibido)
- [ ] Todos los valores en estilos scoped consumen tokens via `var(--token-name)`
- [ ] Sin valores hardcodeados en estilos scoped (colores, px repetidos, z-index numéricos)

---

## Sistema de Layout (§6.5)

- [ ] `box-sizing: border-box` aplicado universalmente (`*, *::before, *::after`)
- [ ] Flexbox usado como sistema de layout predominante
- [ ] Contenedores flex declaran `display: flex` con `flex-direction`, `justify-content`, `align-items` cuando aplica
- [ ] Se usa `gap` entre elementos flex en lugar de `margin` cuando es posible
- [ ] Sin uso de `float` para layout estructural
- [ ] Sin `position: absolute` como mecanismo de layout principal

---

## Z-Index (§6.6)

- [ ] Todo `z-index` usa exclusivamente tokens (`var(--z-*)`)
- [ ] Sin valores arbitrarios (`z-index: 9999`, `z-index: 99999`)
- [ ] Sin escalamiento improvisado (`calc(var(--z-modal) + 50)`)

---

## Responsividad Desktop-First (§6.7)

- [ ] Diseño base optimizado para escritorio (>1024px)
- [ ] Media queries usando valores de breakpoints tokenizados
- [ ] Mobile (<768px): layout reorganizado estructuralmente (no solo "encoger")
- [ ] Sin scroll horizontal en ninguna resolución
- [ ] Touch targets mínimo 44×44px en mobile
- [ ] Tipografía legible sin zoom en mobile (mínimo 12px)
- [ ] Sin botones con altura menor a 40px

---

## Identidad Visual (§6.8)

- [ ] Sin paletas de colores independientes fuera de `constants.css`
- [ ] Sin definición de tipografías fuera del sistema de tokens/`main.css`
- [ ] Sin sombras custom fuera de tokens definidos
- [ ] Sin gradientes inline no centralizados en `constants.css`
- [ ] Toda extensión de paleta está agregada a `constants.css`

---

## Estados Visuales (§6.9)

- [ ] Apertura/cierre de modales usa clases CSS (`classList.add/remove`), no `element.style.*`
- [ ] Sin estilos inline dinámicos desde JavaScript (`element.style.display = 'block'`)
- [ ] Clases de estado presentes donde aplica: `.active`, `.disabled`, `.loading`, `.error`, `.success`, `.focus`

---

## Optimización de Performance (§6.10)

- [ ] Animaciones usan solo `transform` y `opacity` (sin animar `width`, `height`, `top`, `left`, `margin`, `padding`)
- [ ] Duraciones de animación usan tokens (`var(--transition-normal)`, `var(--transition-slow)`)
- [ ] Toda animación tiene timing function declarada
- [ ] Sin selectores universales innecesarios (`* { transition: all 5s }`)
- [ ] Anidación de selectores limitada a máximo 3 niveles
- [ ] Sin `!important` sin justificación documentada

---

## Cobertura de Auditoría

| Área | Regla Clave | Estado |
|------|-------------|--------|
| constants.css presente | §6.2 | - |
| Tokens completos (14 categorías) | §6.3 | - |
| Sin hex hardcodeados | §6.4.2 | - |
| Sin z-index numéricos | §6.6 | - |
| Scoped por defecto en Vue | §6.13.1 | - |
| Sin variables CSS locales en Vue | §6.13.2 | - |
| box-sizing universal | §6.5 | - |
| Animaciones con transform/opacity | §6.10 | - |
| Touch targets mobile ≥44px | §6.7 | - |
| Media queries con tokens | §6.11 | - |
