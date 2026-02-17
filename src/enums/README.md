# Enums Directory

## 1. Propósito

Contiene enumeraciones TypeScript que definen conjuntos cerrados de valores válidos usados en todo el framework: tipos de vista, tipos de string, tipos de confirmación, tipos de toast, máscaras y agrupaciones de formulario.

## 2. Alcance

### Responsabilidades
- `view_type.ts` - ViewType enum (LIST, DETAIL, CUSTOM)
- `detail_type.ts` - DetailType/ViewMode enum (CREATE, UPDATE, READ)
- `string_type.ts` - StringType enum (TEXT, EMAIL, PASSWORD, TEXTAREA, PHONE)
- `ToastType.ts` - ToastType enum (SUCCESS, ERROR, INFO, WARNING)
- `conf_menu_type.ts` - ConfirmationType enum (INFO, SUCCESS, WARNING, ERROR)
- `view_group_row.ts` - ViewGroupRow enum para layouts de formulario
- `mask_sides.ts` - MaskSides enum (LEFT, RIGHT, BOTH) para máscaras de input

### Límites
- NO contienen lógica - Solo definiciones de constantes
- NO son mutables - Enums TypeScript son inmutables
- NO contienen métodos - Solo mapeos clave-valor

## 3. Definiciones Clave

**Enum**: Conjunto nombrado de constantes relacionadas que restringen valores válidos de una variable.  
**EnumAdapter**: Convierte enums a arrays de {value, label} para uso en componentes select.  
**Type Safety**: TypeScript verifica en compile-time que solo valores válidos del enum sean asignados.

## 4. Descripción Técnica

Enums TypeScript implementados como `enum NombreEnum { VALOR1 = 'VALOR1', VALOR2 = 'VALOR2' }`. Compilados a JavaScript objects bidireccionales con mappings nombre→valor y valor→nombre. Usados en decoradores (@PropertyName('Name', String, StringType.EMAIL)), componentes (if type === ViewType.LIST), y conditions de renderizado.

## 5. Flujo de Funcionamiento

1. Entidad declara property con enum: `@PropertyName('Email', String, StringType.EMAIL)`
2. ComponentResolverService lee metadata: `stringType === StringType.EMAIL`
3. Resuelve EmailInputComponent
4. EnumAdapter.toArray(StringType) genera options para selects
5. Component renderiza con type-safety garantizado

## 6. Reglas Obligatorias

- SIEMPRE usar valores del enum, NO strings literales
- SIEMPRE definir enums con valores string explícitos: `VALOR = 'VALOR'`
- SIEMPRE usar EnumAdapter.toArray() para conversión a arrays
- SIEMPRE importar enums desde este directorio
- NUNCA modificar enums en runtime

## 7. Prohibiciones

1. NO usar valores mágicos - usar enum members
2. NO crear enums duplicados en otros archivos
3. NO mutar valores de enums en runtime
4. NO omitir valores string explícitos
5. NO usar number enums

## 8. Dependencias

- TypeScript - Enum syntax y type checking
- EnumAdapter (src/models/enum_adapter.ts) - Conversión a arrays
- Decoradores - Usan enums como parámetros (@PropertyName con StringType)
- Components - Verifican values contra enums

## 9. Relaciones

Decoradores → Enums (StringType, ViewType, DetailType)  
ComponentResolverService → ViewType, StringType para resolución  
ApplicationUIService → ToastType, ConfirmationType  
View class → ViewType, ViewMode/DetailType

Documentos: `copilot/layers/05-advanced/Types.md`

## 10. Notas de Implementación

```typescript
// Definición de enum
export enum ViewType {
    LIST = 'LIST',
    DETAIL = 'DETAIL',
    CUSTOM = 'CUSTOM'
}

// Uso en código
if (Application.View.value.viewType === ViewType.LIST) {
    // renderizar lista
}

// Conversión para select
const options = EnumAdapter.toArray(StringType);
// [{ value: 'TEXT', label: 'Text' }, { value: 'EMAIL', label: 'Email' }, ...]
```

## 11. Referencias Cruzadas

- [Types.md](../../../copilot/layers/05-advanced/Types.md)
- [enum_adapter.ts](../models/enum_adapter.ts)
- [property-name-decorator.md](../../../copilot/layers/01-decorators/property-name-decorator.md)
- Usado en: src/models/, src/components/, src/decorations/, src/entities/
