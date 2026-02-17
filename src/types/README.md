# Types Directory

## 1. Propósito

Contiene definiciones de tipos TypeScript y type declarations para assets y eventos del framework. Proporciona type safety y autocomplete en VSCode para eventos de EventBus y assets importados.

## 2. Alcance

### Responsabilidades
- `events.ts` - Type definitions para eventos de EventBus (show-modal, show-toast, etc.)
- `assets.d.ts` - Declare modules para importación de assets (imágenes, SVG, etc.)

### Límites
- NO contiene lógica ejecutable - Solo type definitions
- NO se compila a JavaScript - Solo para TypeScript type checking
- NO contiene interfaces de entidades - Esas están en src/entities/

## 3. Definiciones Clave

**Type Declaration**: Archivos `.d.ts` que definen tipos sin implementación, usados por TypeScript compiler.  
**EventBus Types**: Mapping de event names a payload types para type-safe event emission.  
**Module Declaration**: `declare module` permite importar archivos no-TS (PNG, SVG, JSON).

## 4. Descripción Técnica

`events.ts` define interface EventMap con mappings:
```typescript
interface EventMap {
    'show-modal': Modal;
    'show-toast': Toast;
    'toggle-sidebar': boolean | void;
}
```

Usada por mitt para type-safe emit/on. `assets.d.ts` declara:
```typescript
declare module '*.png' {
    const content: string;
    export default content;
}
```

Permite `import logo from '@/assets/logo.png'` sin TypeScript errors.

## 5. Flujo de Funcionamiento

1. Developer escribe: `Application.eventBus.emit('show-modal', payload)`
2. TypeScript verifica payload type contra EventMap['show-modal']
3. Si payload NO es Modal instance → compile error
4. VSCode muestra autocomplete de event names y payload types
5. Type safety garantizado en compile-time

## 6. Reglas Obligatorias

- SIEMPRE definir nuevos eventos en EventMap
- SIEMPRE usar typed eventBus: `EventBus<EventMap>`
- SIEMPRE declare modules para nuevos tipos de assets
- NUNCA usar `any` en event payloads

## 7. Prohibiciones

1. NO omitir types para eventos - agregar a EventMap
2. NO usar string literals para event names - usar EventMap keys
3. NO importar assets sin declarations
4. NO modificar types en runtime

## 8. Dependencias

- mitt - EventBus typings extendidos con EventMap
- TypeScript - Type checking system
- Vite - Asset handling con type declarations

## 9. Relaciones

EventMap → Application.eventBus → Componentes emit/listen con type safety  
assets.d.ts → import statements en components → libre de type errors

Documentos: `copilot/layers/05-advanced/Types.md`

## 10. Notas de Implementación

```typescript
// events.ts
import type { Modal, Toast } from '@/models';

export interface EventMap {
    'show-modal': Modal;
    'show-toast': Toast;
    'toggle-sidebar': boolean | void;
    'toggle-dropdown': string;
}

// Uso con type safety
import type { EventBus } from 'mitt';
import type { EventMap } from '@/types/events';

const eventBus: EventBus<EventMap> = mitt<EventMap>();

// Autocomplete de event names + type checking de payload
eventBus.emit('show-toast', toast);  // ✅ OK
eventBus.emit('show-toast', 'string');  // ❌ Error
```

## 11. Referencias Cruzadas

- [Types.md](../../../copilot/layers/05-advanced/Types.md)
- [event-bus.md](../../../copilot/layers/03-application/event-bus.md)
- TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html
