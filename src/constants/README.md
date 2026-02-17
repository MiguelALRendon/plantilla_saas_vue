# Constants Directory

## 1. Propósito

Contiene constantes JavaScript/TypeScript que definen iconos reutilizables del framework: GGICONS (Google Icons como strings Unicode) y custom icons SVG. Centraliza definición de iconos para uso consistente en todos los componentes.

## 2. Alcance

### Responsabilidades
- `ggicons.ts` - Exporta constantes GGICONS (Google Icons) como strings Unicode y GGCLASS para class names
- `icons.ts` - Define custom icons SVG y otros iconos no-Google

### Límites
- NO contiene lógica de renderizado - Solo constantes
- NO modifica iconos en runtime - Son valores inmutables
- NO contiene assets binarios - Solo strings/code

## 3. Definiciones Clave

**GGICONS**: Objeto con propiedades que mapean nombres semánticos a caracteres Unicode de Google Icons (ej: `GGICONS.CHECK = '\ue5ca'`).

**GGCLASS**: String con class name de Google Icons font: `'gg-icons'`, aplicado a spans para renderizar iconos.

**Unicode Icons**: Google Icons renderizados mediante font icon con content Unicode en pseudo-element ::before.

## 4. Descripción Técnica

`ggicons.ts` exporta:
```typescript
export const GGICONS = {
    CHECK: '\ue5ca',
    CANCEL: '\ue5c9',
    ADD: '\ue145',
    DELETE: '\ue872',
    EDIT: '\ue3c9',
    SEARCH: '\ue8b6',
    // ... ~50 iconos
};

export const GGCLASS = 'gg-icons';
```

Componentes usan:
```vue
<span :class="GGCLASS">{{ GGICONS.CHECK }}</span>
```

CSS en constants.css define font-face para Google Icons, pseudo-element ::before renderiza Unicode como icono.

`icons.ts` puede exportar SVG paths o custom icon definitions para iconos no disponibles en Google Icons.

## 5. Flujo de Funcionamiento

1. BooleanInputComponent necesita icono CHECK
2. Importa `import { GGICONS, GGCLASS } from '@/constants/ggicons'`
3. Template renderiza: `<span :class="GGCLASS">{{ modelValue ? GGICONS.CHECK : GGICONS.CANCEL }}</span>`
4. CSS aplica font-family: 'Material Icons' a .gg-icons
5. Unicode '\ue5ca' se renderiza como ✓ icono

## 6. Reglas Obligatorias

- SIEMPRE importar desde este directorio, NO hardcodear Unicode strings
- SIEMPRE usar GGCLASS para class names de Google Icons
- SIEMPRE agregar nuevos iconos a constantes, NO inline en componentes
- Naming convention: UPPERCASE_SNAKE_CASE (CHECK, ADD, DELETE_FOREVER)

## 7. Prohibiciones

1. NO hardcodear Unicode strings en componentes - usar GGICONS
2. NO usar inline SVG en múltiples componentes - centralizar en icons.ts
3. NO modificar constantes en runtime
4. NO crear objetos GGICONS duplicados en otros archivos

## 8. Dependencias

- Google Icons font (cargada en constants.css via @font-face)
- Componentes que usan iconos: BooleanInputComponent, ArrayInputComponent, ModalComponent, ToastComponent, ButtonComponents

## 9. Relaciones

GGICONS → Componentes (BooleanInputComponent, ButtonComponents, etc.)  
constants.css → Define font-face para Google Icons  
icons.ts → Custom icons para casos especiales

Usado en: src/components/Form/, src/components/Buttons/, src/components/Modal/

## 10. Notas de Implementación

```typescript
// ggicons.ts
export const GGICONS = {
    // Actions
    CHECK: '\ue5ca',
    CANCEL: '\ue5c9',
    ADD: '\ue145',
    DELETE: '\ue872',
    EDIT: '\ue3c9',
    SAVE: '\ue161',
    
    // Navigation
    ARROW_BACK: '\ue5c4',
    ARROW_FORWARD: '\ue5c8',
    
    // Status
    ERROR: '\ue000',
    WARNING: '\ue002',
    INFO: '\ue88e',
    SUCCESS: '\ue86c',
};

export const GGCLASS = 'gg-icons';
```

Uso en componente:
```vue
<script setup>
import { GGICONS, GGCLASS } from '@/constants/ggicons';
</script>

<template>
    <button>
        <span :class="GGCLASS">{{ GGICONS.SAVE }}</span>
        Save
    </button>
</template>
```

CSS (constants.css):
```css
@font-face {
    font-family: 'Material Icons';
    src: url('/fonts/MaterialIcons.woff2') format('woff2');
}

.gg-icons {
    font-family: 'Material Icons';
    font-size: 1.5rem;
}
```

## 11. Referencias Cruzadas

- [boolean-input-component.md](../../../copilot/layers/04-components/boolean-input-component.md) - Usa CHECK/CANCEL
- [modal-components.md](../../../copilot/layers/04-components/modal-components.md) - Usa varios iconos
- Google Icons Reference: https://fonts.google.com/icons
- constants.css: Define font-face
