# CONTRATO DE SISTEMA DE DISEÑO UI/CSS - Framework SaaS Vue

**Versión:** 1.0.0  
**Fecha de Creación:** 13 de Febrero, 2026  
**Última Actualización:** 13 de Febrero, 2026  
**Estado:** ACTIVO Y VINCULANTE

## 1. Propósito

Establecer principios contractuales vinculantes que regulen el desarrollo, mantenimiento y extensión del sistema de interfaz de usuario y hojas de estilo CSS del Framework SaaS Vue, garantizando consistencia visual, mantenibilidad estructural, escalabilidad controlada y coherencia arquitectónica con MI LÓGICA.

Este contrato define reglas obligatorias para organización CSS, sistema de tokens, estrategia de layout, jerarquía visual, responsividad, optimización y política anti-hardcode, asegurando que la capa de presentación opere bajo principios deterministas y centralizados.

## 2. Alcance

Este contrato aplica a:
- Toda hoja de estilo CSS del framework ubicada en `/src/css/`
- Todo componente Vue que contenga estilos scoped o globales
- Todo sistema de tokens de diseño definido en `constants.css`
- Toda modificación, extensión o creación de estilos visuales
- Toda estrategia de responsividad implementada
- Todo manejo de estados visuales mediante clases dinámicas
- Toda animación, transición o transformación CSS
- Toda jerarquía z-index implementada
- Toda integración de estilos con la arquitectura de metadatos del framework

Este contrato NO aplica a:
- Lógica JavaScript/TypeScript no relacionada con manipulación visual
- Backend o API REST
- Arquitectura de decoradores o BaseEntity (regulado por 00-CONTRACT.md)
- Sistema de persistencia o validaciones de negocio

## 3. Definiciones Clave

**Sistema de Tokens:** Conjunto centralizado de variables CSS definidas en `constants.css` que representan valores repetibles del sistema de diseño: colores, espaciados, sombras, radios, duraciones, breakpoints, z-index y transformaciones estándar.

**constants.css:** Archivo obligatorio ubicado en `/src/css/constants.css` que centraliza todas las variables CSS globales del sistema mediante custom properties CSS (`:root`). Constituye fuente única de verdad para identidad visual.

**main.css:** Archivo obligatorio ubicado en `/src/css/main.css` que define estilos base globales, normalizaciones, utilidades comunes y configuración tipográfica. Opera como capa de fundación visual.

**Política Anti-Hardcode:** Prohibición absoluta de valores literales repetidos en estilos. Todo valor repetible debe extraerse como token en `constants.css`.

**Desktop-First Adaptativo:** Estrategia de diseño que prioriza experiencia de escritorio pero exige adaptación estructural real para dispositivos móviles, prohibiendo reducción artificial de layout.

**Box-Sizing Universal:** Regla inmutable `box-sizing: border-box` aplicada a todos los contenedores estructurales del sistema, garantizando cálculo predecible de dimensiones.

**Z-Index Contractual:** Sistema jerárquico predefinido de valores z-index centralizados como tokens, prohibiendo valores numéricos arbitrarios.

**Identidad Visual Centralizada:** Principio que establece que ningún componente puede introducir paletas, tipografías o escalas visuales independientes del sistema de tokens.

**Estados Visuales:** Cambios de apariencia manejados exclusivamente mediante agregado o eliminación de clases CSS, prohibiendo estilos inline dinámicos.

**Layout Thrashing:** Degradación de performance causada por lecturas y escrituras intercaladas del DOM que fuerzan recálculos de layout. Prohibido contractualmente.

## 4. Descripción Técnica

### 4.1 Arquitectura CSS del Framework

El framework implementa arquitectura CSS basada en tres pilares fundamentales:

**Capa 1 - Sistema de Tokens (`constants.css`)**  
Definición centralizada de variables CSS globales mediante custom properties. Constituye fuente única de verdad visual.

**Capa 2 - Fundación Global (`main.css`)**  
Normalización de estilos base, configuración tipográfica, utilidades comunes y clases estructurales reutilizables.

**Capa 3 - Estilos Específicos (`form.css`, `table.css`, componentes scoped)**  
Estilos especializados que consumen tokens de Capa 1 y heredan fundación de Capa 2.

### 4.2 Organización de Archivos CSS

Estructura obligatoria:

```
/src/css/
├── constants.css    (Tokens de diseño - INMUTABLE SIN AUTORIZACIÓN)
├── main.css         (Fundación global - CRECE SOLO SI NECESARIO)
├── form.css         (Estilos formularios)
└── table.css        (Estilos tablas)
```

### 4.3 Sistema de Layout

El framework implementa **Flexbox** como sistema de layout predominante.

Configuración base obligatoria:
```css
* {
    box-sizing: border-box;
}
```

Todo contenedor flex debe declarar `box-sizing: border-box` para garantizar cálculo dimensional predecible.

### 4.4 Estrategia de Responsividad

**Desktop-First Adaptativo**

Orden de prioridad:
1. Desktop grande (>1440px)
2. Laptop (1024px-1440px)
3. Tablet (768px-1024px)
4. Mobile (<768px)

Cada componente debe poseer comportamiento nativo móvil, no reducción artificial de layout desktop.

### 4.5 Integración con Arquitectura del Framework

Los estilos CSS integran con:
- **Application (Singleton):** Manejo de clases dinámicas para estados globales (dark-mode, modal-open)
- **BaseEntity:** No interactúa directamente con CSS
- **Metadatos:** Decoradores como `@CssColumnClass` definen clases aplicables a elementos UI generados
- **Componentes Reactivos:** Estilos scoped consumen tokens centralizados

## 5. Flujo de Funcionamiento

### 5.1 Flujo de Definición de Estilos

1. **Identificación de Valor:** Desarrollador identifica necesidad de color, espaciado, sombra u otro valor visual
2. **Consulta de Tokens:** Verifica existencia en `constants.css`
3. **Uso o Creación:**
   - Si existe: usa variable CSS existente
   - Si no existe: crea nuevo token en `constants.css` previo análisis de duplicación
4. **Aplicación en Componente:** Referencia token en estilo scoped o global
5. **Validación:** Verifica ausencia de valores hardcodeados

### 5.2 Flujo de Adaptación Responsiva

1. **Diseño Desktop:** Implementación inicial para resolución escritorio
2. **Definición de Breakpoints:** Identificación de puntos de quiebre según tokens
3. **Reorganización Estructural:** Adaptación de layout para tablet y mobile mediante media queries
4. **Validación Mobile:** Verificación de experiencia nativa móvil (sin scroll horizontal, sin texto ilegible)
5. **Testing Cross-Device:** Pruebas en múltiples resoluciones

### 5.3 Flujo de Estados Visuales

1. **Evento de Interacción:** Usuario interactúa con componente (click, hover, focus)
2. **Emisión de Evento:** Componente emite evento via eventBus o método directo
3. **Actualización de Clases:** Application o componente agrega/elimina clase CSS vía `classList.add()` / `classList.remove()`
4. **Transición Visual:** CSS aplica transición definida en tokens
5. **Estado Final:** Componente refleja nuevo estado visual

## 6. Reglas Obligatorias

### 6.1 Subordinación a MI LÓGICA

```
MI LÓGICA > 00-CONTRACT.md > 04-UI-DESIGN-SYSTEM-CONTRACT.md
```

Este contrato es subordinado a MI LÓGICA y al contrato principal `00-CONTRACT.md`. En caso de conflicto interpretativo, prevalece la jerarquía establecida.

Este contrato regula exclusivamente aspectos visuales y de presentación sin alterar arquitectura core, sistema de decoradores, BaseEntity, Application ni flujo de datos del framework.

### 6.2 Obligatoriedad de Archivos CSS Centralizados

**constants.css**

Obligaciones:
- Debe existir en `/src/css/constants.css`
- Debe mantenerse normalizado y organizado
- Solo puede crecer cuando sea estrictamente necesario
- Prohibido duplicar valores fuera de este archivo
- Toda variable global debe centralizarse aquí
- Debe incluir sección de dark-mode

**main.css**

Obligaciones:
- Debe existir en `/src/css/main.css`
- Debe contener únicamente estilos base globales
- No puede contener estilos específicos de componentes
- Solo puede crecer cuando sea estrictamente necesario
- Debe importar `constants.css` o consumir sus tokens

### 6.3 Sistema Universal de Tokens

**Lista Obligatoria de Tokens**

`constants.css` DEBE incluir obligatoriamente tokens para:

**Colores:**
- Colores base (blanco, negro)
- Escala de grises
- Colores de acento
- Colores de botones (primary, secondary, info, success, warning, accent)
- Gradientes predefinidos
- Colores dark-mode

**Espaciados y Dimensiones:**
- Padding estándar (small, medium, large)
- Margin estándar (small, medium, large)
- Anchos estándar (sidebar, containers)
- Alturas estándar (header, footer, buttons)

**Sombras:**
- Shadow light
- Shadow medium
- Shadow dark
- Shadow white
- Overlays (dark, light)

**Bordes:**
- Border-radius estándar
- Border-radius circle
- Border-radius pequeño (si aplica)
- Colores de borde

**Transiciones:**
- Duraciones estándar (fast: 0.15s, normal: 0.3s, slow: 0.5s)
- Timing functions predefinidas (ease, ease-in-out, cubic-bezier específica)

**Z-Index:**
- z-base: 1
- z-dropdown: 100
- z-sticky: 200
- z-overlay: 500
- z-modal: 1000
- z-toast: 1500
- z-tooltip: 2000

**Breakpoints:**
- breakpoint-mobile: 768px
- breakpoint-tablet: 1024px
- breakpoint-laptop: 1440px
- breakpoint-desktop: 1920px

**Tipografía:**
- Font-size base
- Font-size headings (h1, h2, h3, h4, h5, h6)
- Font-weight estándar
- Line-height estándar

**Opacidades:**
- Opacidad hover
- Opacidad disabled
- Opacidad overlay

**Transformaciones:**
- Scale hover
- Translate estándar (si aplica)
- Rotate estándar (si aplica)

### 6.4 Política Anti-Hardcode

Prohibido absolutamente:

```css
/* PROHIBIDO */
.component {
    width: 300px;                  /* Dimensión fija arbitraria */
    color: #3b82f6;               /* Color directo */
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);  /* Sombra literal */
    z-index: 999;                 /* Z-index arbitrario */
    transition: all 0.2s;         /* Duración hardcodeada */
    border-radius: 8px;           /* Radio literal */
}
```

Obligatorio:

```css
/* OBLIGATORIO */
.component {
    max-width: var(--container-width);
    color: var(--btn-primary);
    box-shadow: var(--shadow-medium);
    z-index: var(--z-modal);
    transition: all var(--transition-normal);
    border-radius: var(--border-radius);
}
```

Excepción única: Valores irrepetibles demostrados como únicos en el sistema y documentados como tal.

### 6.5 Sistema de Layout Flexbox

Todo contenedor estructural del framework debe operar bajo:

```css
* {
    box-sizing: border-box;
}
```

Regla inmutable. No puede modificarse sin autorización explícita según `00-CONTRACT.md` sección 6.2.

Obligatorio en contenedores flex:
- Declarar `display: flex`
- Especificar `flex-direction` si difiere de `row`
- Especificar `justify-content` y `align-items` según necesidad
- Usar `gap` en lugar de margin entre elementos flex cuando sea posible

Prohibido:
- Mezclar paradigmas Grid sin justificación documental
- Uso de floats para layout estructural
- Position absolute para layout principal

### 6.6 Sistema de Z-Index Contractual

Todo uso de `z-index` debe emplear tokens predefinidos.

Jerarquía oficial:

```css
:root {
    --z-base: 1;
    --z-dropdown: 100;
    --z-sticky: 200;
    --z-overlay: 500;
    --z-modal: 1000;
    --z-toast: 1500;
    --z-tooltip: 2000;
}
```

Prohibido:
- Valores numéricos arbitrarios (`z-index: 9999`)
- Valores no definidos en tokens
- Escalamiento improvisado (`z-index: calc(var(--z-modal) + 50)`)

Obligatorio:
- Uso exclusivo de tokens
- Documentar nuevos niveles si se crean
- Actualizar jerarquía en `constants.css`

### 6.7 Estrategia Desktop-First Adaptativo

**Desktop-First:**

Diseño principal optimizado para resoluciones de escritorio (>1024px).

**Adaptativo (NO reduccionista):**

Obligaciones para mobile (<768px):
- Reorganización estructural real del layout
- Navegación adaptada (hamburger menu si necesario)
- Tipografía nativa móvil (legible sin zoom)
- Interacciones táctiles consideradas
- Espaciado apropiado para touch targets (mínimo 44x44px)

Prohibido:
- Scroll horizontal
- Compactación artificial
- Tipografía reducida extrema (<12px)
- Botones diminutos (<40px alto)
- Simplemente "encoger" layout desktop

**Breakpoints Obligatorios:**

```css
/* Mobile */
@media (max-width: 767px) { /* ... */ }

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) { /* ... */ }

/* Laptop */
@media (min-width: 1024px) and (max-width: 1439px) { /* ... */ }

/* Desktop */
@media (min-width: 1440px) { /* ... */ }
```

### 6.8 Identidad Visual Centralizada

Prohibido:
- Introducir paletas de colores independientes
- Definir tipografías fuera del sistema declarado
- Crear sombras custom fuera de tokens
- Usar radios no definidos en tokens
- Definir gradientes inline no centralizados

Obligatorio:
- Toda identidad visual deriva del sistema central de tokens
- Variables deben consumirse mediante `var(--token-name)`
- Extensiones de paleta deben agregarse a `constants.css`
- Tipografía definida en `main.css` o tokens

### 6.9 Manejo de Estados Visuales

**Apertura/Cierre de Modales:**

Obligatorio:
- Manejo mediante agregado/remoción de clase en elemento
- Emisión de evento via eventBus si aplica
- Estado manejado por Application o componente padre

Prohibido:
- Estilos inline dinámicos (`element.style.display = 'block'`)
- Manipulación directa de propiedades CSS via JavaScript

**Ejemplo válido:**

```javascript
// JavaScript
Application.eventBus.emit('modal:open', { target: 'user-form' });
document.body.classList.add('modal-open');

// CSS
body.modal-open {
    overflow: hidden;
}
```

**Estados de Componentes:**

Clases de estado obligatorias:
- `.active` - Elemento activo
- `.disabled` - Elemento deshabilitado
- `.loading` - Estado de carga
- `.error` - Estado de error
- `.success` - Estado de éxito
- `.focus` - Estado de foco

### 6.10 Optimización de Performance

**Animaciones:**

Obligatorio:
- Usar únicamente `transform` y `opacity` para animaciones
- Duraciones estándar: `var(--transition-normal)` (0.3s) o `var(--transition-slow)` (0.5s)
- Timing function: `ease` o `ease-in-out`

Excepción controlada:
- `cubic-bezier(0.68, -0.55, 0.27, 1.55)` para efectos de rebote documentados

Prohibido:
- Animar propiedades que causen layout thrashing (`width`, `height`, `top`, `left`, `margin`, `padding`)
- Duraciones arbitrarias hardcodeadas
- Animaciones sin timing function

**Ejemplo válido:**

```css
.modal {
    opacity: 0;
    transform: translateY(-20px);
    transition: opacity var(--transition-normal) ease,
                transform var(--transition-normal) ease;
}

.modal.active {
    opacity: 1;
    transform: translateY(0);
}
```

**Selectores:**

Obligatorio:
- Limitar anidación a máximo 3 niveles
- Preferir clases sobre selectores de tipo
- Usar especificidad mínima necesaria

Prohibido:
- Selectores universales innecesarios (`* { transition: all 5s }`)
- Descendientes profundos (`.a .b .c .d .e .f`)
- !important salvo casos justificados

### 6.11 Responsividad Crítica

Declarado como **estado crítico contractual**.

Obligaciones:
- Breakpoints deben consumirse desde tokens
- Unidades relativas preferidas (`rem`, `em`, `%`, `vw`, `vh`)
- Contenedores deben usar `max-width` en lugar de `width` fijo
- Imágenes deben usar `max-width: 100%` y `height: auto`
- Textos deben evitar `white-space: nowrap` sin justificación

Prohibiciones absolutas:
- Overflow horizontal (`overflow-x: scroll` sin justificación)
- Anchos fijos que excedan viewport
- Posicionamiento absolute que rompa layout mobile

### 6.12 Conformidad con Estructura Documental

Todo cambio, extensión o creación en sistema UI/CSS debe documentarse según lo establecido en `00-CONTRACT.md` sección 6.3:

- Crear o actualizar documentación MD correspondiente
- Seguir estructura obligatoria de 11 secciones
- Actualizar índices de carpetas afectadas
- Mantener referencias cruzadas actualizadas
- Sincronizar código CSS con documentación

## 7. Prohibiciones

### 7.1 Prohibiciones Arquitectónicas

Prohibido sin autorización explícita según `00-CONTRACT.md`:
- Modificar sistema de tokens centralizado en `constants.css`
- Eliminar `box-sizing: border-box` global
- Cambiar sistema de layout predominante (Flexbox)
- Alterar jerarquía z-index contractual
- Modificar breakpoints oficiales
- Cambiar estrategia Desktop-First
- Introducir framework CSS externo (Bootstrap, Tailwind) sin autorización

### 7.2 Prohibiciones de Hardcode

Prohibido absolutamente:
- Colores literales fuera de `constants.css`
- Dimensiones fijas repetidas no tokenizadas
- Sombras inline repetidas
- Z-index numéricos arbitrarios
- Duraciones de transición hardcodeadas
- Border-radius literales repetidos
- Opacidades hardcodeadas repetidas
- Transformaciones literales repetidas
- Breakpoints inline no tokenizados
- Gradientes inline no centralizados

### 7.3 Prohibiciones de Estados

Prohibido:
- Estilos inline dinámicos via JavaScript (`element.style.*`)
- Manipulación directa de CSS via `setAttribute('style', ...)`
- Uso de librerías de animación que ignoren sistema de tokens
- Estados manejados fuera de clases CSS

### 7.4 Prohibiciones de Performance

Prohibido:
- Animar `width`, `height`, `top`, `left`, `margin`, `padding`
- Transiciones en `*` sin especificidad (`* { transition: all 5s }`)
- Selectores descendientes profundos (>4 niveles)
- Uso excesivo de `!important`
- Layout thrashing por lecturas/escrituras DOM intercaladas

### 7.5 Prohibiciones Documentales

Prohibido:
- CSS sin documentación sincronizada si introduce sistema nuevo
- Tokens sin descripción en comentarios
- Extensiones no documentadas en índices correspondientes
- Referencias cruzadas rotas

## 8. Dependencias

Este contrato depende de:
- **00-CONTRACT.md:** Contrato principal que regula todo desarrollo del framework
- **01-FRAMEWORK-OVERVIEW.md:** Visión general de arquitectura donde UI se integra
- **02-FLOW-ARCHITECTURE.md:** Flujos donde presentación visual opera
- **MI LÓGICA:** Arquitectura fundamental del framework (Entidad → Decoradores → Metadatos → BaseEntity → Application → UI)
- **constants.css:** Archivo fuente de tokens de diseño
- **main.css:** Archivo de fundación visual
- **Application (Singleton):** Gestor de estado global que maneja clases dinámicas
- **Componentes Vue:** Consumidores de estilos y tokens

Este contrato es independiente de:
- Sistema de decoradores
- Lógica de BaseEntity
- Sistema de persistencia
- Validaciones de negocio

## 9. Relaciones

### 9.1 Relación con Contrato Principal

Este contrato es subordinado a `00-CONTRACT.md` y cumple:
- Estructura documental de 11 secciones (sección 6.7.12)
- Régimen de reestructuración documental (sección 6.7)
- Política de índices de carpetas (sección 6.4)
- Workflow de desarrollo (sección 6.6)
- Prohibiciones documentales (sección 7.2)

### 9.2 Relación con Arquitectura del Framework

**Integración con Application:**
- Application maneja clases globales (dark-mode, modal-open)
- Application no define estilos, solo manipula clases
- Estilos responden reactivamente a cambios de clase

**Integración con Metadatos:**
- Decorador `@CssColumnClass` define clases aplicables a columnas de tabla
- Metadatos no contienen estilos, solo referencias a clases
- Componentes generados aplican clases leídas de metadatos

**Integración con Componentes:**
- Componentes consumen tokens centralizados
- Componentes pueden usar estilos scoped o globales
- Componentes no definen paletas independientes

### 9.3 Relación con Documentación

El sistema UI/CSS documentado en:
- `/copilot/layers/04-components/` - Documentación de componentes visuales
- Este contrato (`04-UI-DESIGN-SYSTEM-CONTRACT.md`) - Reglas CSS/UI
- Índices de carpetas actualizados según `00-CONTRACT.md` sección 6.4

## 10. Notas de Implementación

### 10.1 Versionamiento del Contrato

Este contrato sigue versionamiento semántico:
- **Major:** Cambios fundamentales en sistema de tokens, layout o estrategia visual
- **Minor:** Nuevos tokens, reglas adicionales, aclaraciones
- **Patch:** Correcciones tipográficas, actualización de ejemplos

Versión actual: **1.0.0**

Cambios en versión 1.0.0 (13 de Febrero, 2026):
- Creación inicial del contrato UI/Design System
- Definición de sistema universal de tokens
- Establecimiento de jerarquía z-index contractual
- Formalización de estrategia Desktop-First Adaptativo
- Obligatoriedad de box-sizing: border-box
- Política anti-hardcode
- Sistema de estados visuales
- Reglas de optimización de performance
- Integración con arquitectura del framework

### 10.2 Migración de Estilos Existentes

Para sistemas existentes que deban cumplir este contrato:

1. **Auditoría de Hardcode:** Identificar valores literales repetidos
2. **Tokenización:** Extraer valores a `constants.css`
3. **Refactorización:** Reemplazar literales por `var(--token)`
4. **Validación:** Confirmar ausencia de valores hardcodeados
5. **Documentación:** Actualizar documentación relevante

### 10.3 Creación de Nuevos Tokens

Proceso obligatorio:

1. **Verificación:** Confirmar que token no existe
2. **Justificación:** Documentar necesidad del nuevo token
3. **Naming:** Seguir convención de nombres establecida
4. **Ubicación:** Agregar a sección apropiada en `constants.css`
5. **Dark Mode:** Definir valor para dark-mode si aplica
6. **Documentación:** Agregar comentario descriptivo
7. **Actualización de Índices:** Registrar en documentación

### 10.4 Ejemplo de Componente Conforme

```vue
<template>
    <div class="text-input-component">
        <label :for="id" class="label">{{ label }}</label>
        <input
            :id="id"
            v-model="localValue"
            :type="type"
            :class="inputClasses"
            :disabled="disabled"
            @focus="handleFocus"
            @blur="handleBlur"
        />
        <span v-if="error" class="error-message">{{ error }}</span>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const props = defineProps<{
    id: string;
    label: string;
    modelValue: string;
    type?: string;
    disabled?: boolean;
    error?: string;
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
}>();

const localValue = computed({
    get: () => props.modelValue,
    set: (value: string) => emit('update:modelValue', value)
});

const isFocused = ref(false);

const inputClasses = computed(() => ({
    'input': true,
    'input--error': !!props.error,
    'input--disabled': props.disabled,
    'input--focus': isFocused.value
}));

const handleFocus = () => { isFocused.value = true; };
const handleBlur = () => { isFocused.value = false; };
</script>

<style scoped>
.text-input-component {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-small);
}

.label {
    color: var(--gray-medium);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
}

.input {
    padding: var(--padding-medium);
    border: 1px solid var(--border-gray);
    border-radius: var(--border-radius);
    background-color: var(--white);
    color: var(--gray-medium);
    transition: border-color var(--transition-normal) ease,
                box-shadow var(--transition-normal) ease;
}

.input--focus {
    border-color: var(--btn-primary);
    box-shadow: 0 0 0 3px var(--focus-light);
}

.input--error {
    border-color: var(--accent-red);
}

.input--disabled {
    background-color: var(--gray-lighter);
    cursor: not-allowed;
    opacity: var(--opacity-disabled);
}

.error-message {
    color: var(--accent-red);
    font-size: var(--font-size-small);
}
</style>
```

**Características conformes:**
- Usa tokens exclusivamente
- Estados manejados por clases
- Box-sizing heredado de global
- Transiciones optimizadas (border-color, box-shadow)
- Sin valores hardcodeados
- Estructura semántica
- Accesibilidad (label, id, disabled)

### 10.5 Aplicabilidad

Al trabajar con sistema UI/CSS de este framework, se acepta contractualmente:
- Consumir tokens centralizados obligatoriamente
- Prohibir valores hardcodeados repetidos
- Seguir estrategia Desktop-First Adaptativo
- Mantener box-sizing: border-box universal
- Usar jerarquía z-index contractual
- Manejar estados mediante clases
- Optimizar animaciones (transform + opacity)
- Documentar extensiones del sistema
- Actualizar índices de carpetas afectadas

### 10.6 Reconocimiento en Contrato Principal

Según sección 11 de este contrato, el `00-CONTRACT.md` debe actualizarse para incluir:

**Nueva cláusula sugerida en sección 6 o nueva sección 8:**

```markdown
### 6.X Sistema UI/CSS

El sistema de interfaz de usuario y hojas de estilo CSS del framework se rige obligatoriamente por el contrato `04-UI-DESIGN-SYSTEM-CONTRACT.md`.

Toda modificación, extensión o creación de estilos visuales debe cumplir las reglas establecidas en dicho contrato subordinado.

El contrato UI/CSS es subordinado a MI LÓGICA y al presente contrato, pero vinculante en materia de diseño visual, tokens, layout, responsividad y optimización CSS.
```

**Actualización en sección 11 (Referencias Cruzadas):**

Agregar:
```markdown
- [04-UI-DESIGN-SYSTEM-CONTRACT.md](04-UI-DESIGN-SYSTEM-CONTRACT.md) - Contrato de sistema de diseño UI/CSS
```

## 11. Referencias Cruzadas

Documentos vinculados contractualmente:
- [00-CONTRACT.md](00-CONTRACT.md) - Contrato principal (autoridad superior)
- [01-FRAMEWORK-OVERVIEW.md](01-FRAMEWORK-OVERVIEW.md) - Visión general del framework
- [02-FLOW-ARCHITECTURE.md](02-FLOW-ARCHITECTURE.md) - Arquitectura y flujos
- [03-QUICK-START.md](03-QUICK-START.md) - Guía de inicio rápido
- [README.md](README.md) - Índice principal de documentación
- layers/04-components/ - Documentación de componentes que implementan este sistema
- /src/css/constants.css - Archivo físico de tokens de diseño
- /src/css/main.css - Archivo físico de fundación visual

Documentos que deben actualizarse:
- `00-CONTRACT.md` - Debe agregar cláusula reconociendo este contrato
- Índice de `/copilot/` - Debe listar este nuevo contrato

---

**VALIDEZ CONTRACTUAL**

Este contrato mantiene consistencia visual, mantenibilidad estructural y escalabilidad controlada del sistema UI/CSS del framework. Constituye protección de identidad visual y garantía de performance optimizada.

Este contrato es subordinado a MI LÓGICA y no modifica arquitectura core del framework. Regula exclusivamente aspectos de presentación visual.

**Versión:** 1.0.0  
**Fecha de Vigencia:** Desde el 13 de Febrero, 2026  
**Última Actualización:** 13 de Febrero, 2026  
**Estado:** ACTIVO Y VINCULANTE  
**Subordinado a:** MI LÓGICA y 00-CONTRACT.md
