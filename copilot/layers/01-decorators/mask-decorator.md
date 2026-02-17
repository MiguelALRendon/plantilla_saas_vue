# Mask Decorator

## 1. Propósito

El decorador `@Mask()` aplica formateo automático de entrada a campos de texto mediante patrones predefinidos que guían al usuario mientras teclea. Este decorador transforma la experiencia de entrada de datos al proporcionar feedback visual instantáneo sobre el formato esperado, facilitando la correcta captura de información estructurada como números telefónicos, tarjetas de crédito, códigos postales, y otros formatos estandarizados.

**Casos de uso principales:**
- Números telefónicos que requieren formato específico por país o región
- Números de seguro social, tarjetas de crédito, y otros identificadores con estructura fija
- Fechas y horas en formatos personalizados
- Códigos postales, placas vehiculares, y números de cuenta con delimitadores específicos
- Direcciones MAC, direcciones IP, y otros identificadores técnicos con separadores

**Objetivos del decorador:**
- Mejorar experiencia de usuario mediante formato automático durante escritura
- Reducir errores de entrada al mostrar visualmente el formato esperado
- Proporcionar validación visual en tiempo real sin necesidad de esperar al blur o submit
- Estandarizar formatos de entrada en toda la aplicación
- Separar responsabilidades entre formato de entrada (Mask) y formato de visualización (DisplayFormat)

**Diferenciación crítica:**
- `@Mask`: Formatea durante entrada (input event), afecta cómo usuario escribe
- `@DisplayFormat`: Formatea durante visualización (celdas de tabla, campos readonly), afecta cómo se muestra

## 2. Alcance

### Responsabilidades

- Almacenar metadata de máscaras mediante Symbol dedicado en prototype
- Definir patrones de máscara con caracteres especiales (# para dígitos, A para mayúsculas, etc.)
- Proporcionar configuración de dirección de aplicación (izquierda-derecha o derecha-izquierda)
- Integrarse con composable `useMask` para lógica de aplicación de máscara en tiempo real
- Mantener valor crudo sin formato para persistencia y validaciones
- Coordinar con sistema de metadata de BaseEntity para acceso unificado

### Límites

- No realiza validación de datos (usar @Validation para ese propósito)
- No formatea valores para visualización en listas o campos readonly (usar @DisplayFormat)
- No modifica el valor almacenado en backend (solo formatea presentación en UI)
- No proporciona conversión de mayúsculas/minúsculas (solo formato de estructura)
- No soporta máscaras dinámicas que cambien según contenido (máscaras son estáticas)
- No previene entrada de caracteres inválidos (solo reorganiza caracteres válidos según patrón)

## 3. Definiciones Clave

**MASK_KEY (Symbol):**
- Identificador único para almacenar configuración de máscaras en prototype
- Ubicación: `prototype` de la clase entity
- Tipo: `Symbol`
- Valor almacenado: Objeto con propiedades como keys y MaskConfig como values

**MaskConfig (Interface):**
```typescript
interface MaskConfig {
    mask: string;      // Patrón de máscara
    side: MaskSides;   // Dirección de aplicación
}
```

**MaskSides (Enum):**
```typescript
enum MaskSides {
    LEFT = 'left',     // Aplicar máscara de izquierda a derecha
    RIGHT = 'right'    // Aplicar máscara de derecha a izquierda (default)
}
```

**NOTA CRÍTICA:** El nombre correcto del enum es **MaskSides** (plural), NO MaskSide (singular).

**Caracteres especiales de máscara:**
- `#`: Dígito numérico (0-9)
- `A`: Letra mayúscula (A-Z)
- `a`: Letra minúscula (a-z)
- `X`: Alfanumérico en mayúsculas (A-Z, 0-9)
- `*`: Cualquier carácter
- Otros: Caracteres literales (paréntesis, guiones, espacios, etc.)

**getMask() (Método de instancia):**
- Accessor de BaseEntity que obtiene configuración de máscara para propiedad
- Parámetros: `propertyKey: string`
- Retorno: `MaskConfig | undefined`
- Ubicación: `src/entities/base_entity.ts` línea ~890

**Valor crudo vs valor formateado:**
- Valor crudo: Caracteres sin formato (ej: "5551234567")
- Valor formateado: Con delimitadores aplicados (ej: "(555) 123-4567")
- Backend recibe: Valor crudo
- Usuario ve: Valor formateado

**useMask composable:**
- Función Vue composable que aplica máscara en tiempo real
- Ubicación: `src/composables/useMask.ts`
- Retorna: `{ displayValue, rawValue, applyMask }`

## Implementación

### Código del Decorador

```typescript
// src/decorations/mask_decorator.ts

import { MaskSide } from '@/enums/mask_sides';

/**
 * Symbol para almacenar metadata de mask
 */
export const MASK_KEY = Symbol('mask');

/**
 * Configuración de máscara
 */
export interface MaskConfig {
    mask: string;
    side: MaskSide;
}

/**
 * @Mask() - Aplica formato de máscara a entrada de texto
 * 
 * @param mask - Patrón de máscara


## 4. Descripción Técnica

### 4.1. Implementación del Decorador

**Ubicación:** `src/decorations/mask_decorator.ts` (línea ~1-45)

```typescript
import { MaskSide } from '@/enums/mask_sides';

/**
 * Symbol para almacenar metadata de mask
 */
export const MASK_KEY = Symbol('mask');

/**
 * Configuración de máscara
 */
export interface MaskConfig {
    mask: string;
    side: MaskSide;
}

/**
 * @Mask() - Aplica formato de máscara a entrada de texto
 * 
 * @param mask - Patrón de máscara
 * @param side - Dirección de aplicación (left/right)
 * @returns PropertyDecorator
 */
export function Mask(mask: string, side: MaskSide = MaskSide.RIGHT): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        // Inicializar metadata si no existe
        if (!target[MASK_KEY]) {
            target[MASK_KEY] = {};
        }
        
        // Guardar configuración
        target[MASK_KEY][propertyKey] = {
            mask: mask,
            side: side
        };
    };
}
```

**Elementos técnicos:**

1. **Symbol MASK_KEY:**
   - Identificador único para evitar colisiones en prototype
   - Almacena objeto con configuraciones de máscara por propiedad
   - Accesible desde BaseEntity y componentes UI

2. **Interface MaskConfig:**
   - Define estructura de configuración de máscara
   - Propiedades: `mask` (string) y `side` (MaskSide enum)
   - Usado en metadata y retorno de métodos accessors

3. **Parámetro mask:**
   - String que define patrón con caracteres especiales
   - Caracteres literales (paréntesis, guiones) se insertan tal cual
   - Placeholders (# A a X *) se reemplazan por entrada de usuario

4. **Parámetro side:**
   - Enum MaskSide con valores LEFT o RIGHT
   - Default: MaskSide.RIGHT (aplicar de derecha a izquierda)
   - Afecta cómo se interpola entrada progresiva del usuario

### 4.2. Enum MaskSide

**Ubicación:** `src/enums/mask_sides.ts` (línea ~1-15)

```typescript
/**
 * Dirección de aplicación de máscara
 */
export enum MaskSide {
    /**
     * Aplicar máscara de izquierda a derecha
     * Útil para formatos variables donde usuario puede ingresar cantidad variable
     */
    LEFT = 'left',
    
    /**
     * Aplicar máscara de derecha a izquierda (default)
     * Útil para formatos fijos donde todos los caracteres son requeridos
     */
    RIGHT = 'right'
}
```

### 4.3. Metadata Storage

**Estructura en prototype:**

```typescript
// Ejemplo: Customer con campos enmascarados
Customer.prototype[MASK_KEY] = {
    'phone': { 
        mask: '(###) ###-####', 
        side: MaskSide.RIGHT 
    },
    'ssn': { 
        mask: '###-##-####', 
        side: MaskSide.RIGHT 
    },
    'creditCard': { 
        mask: '#### #### #### ####', 
        side: MaskSide.RIGHT 
    }
}
```

**Características del almacenamiento:**
- Metadata se almacena como objeto (no array) con propertyKey como keys
- Cada propiedad tiene su propio MaskConfig independiente
- Múltiples propiedades pueden tener máscaras en misma entidad
- Dirección (side) puede ser diferente por propiedad

### 4.4. Accessors en BaseEntity

**Ubicación:** `src/entities/base_entity.ts` (línea ~890-920)

```typescript
/**
 * Obtiene la configuración de máscara de una propiedad
 * 
 * @param propertyKey - Nombre de la propiedad
 * @returns Configuración de máscara o undefined
 */
public getMask(propertyKey: string): MaskConfig | undefined {
    const constructor = this.constructor as typeof BaseEntity;
    const maskMetadata = constructor.prototype[MASK_KEY];
    
    if (!maskMetadata || !maskMetadata[propertyKey]) {
        return undefined;
    }
    
    return maskMetadata[propertyKey];
}

/**
 * Obtiene la configuración de máscara (método estático)
 */
public static getMask(propertyKey: string): MaskConfig | undefined {
    const maskMetadata = this.prototype[MASK_KEY];
    
    if (!maskMetadata || !maskMetadata[propertyKey]) {
        return undefined;
    }
    
    return maskMetadata[propertyKey];
}
```

**Métodos disponibles:**

1. **getMask() (instancia):**
   - Obtiene MaskConfig para propiedad específica
   - Retorna `undefined` si no hay máscara configurada
   - Accede mediante constructor de instancia

2. **getMask() (estático):**
   - Versión estática para uso sin instancia
   - Útil en componentes que solo tienen referencia a clase
   - Misma lógica que versión de instancia

### 4.5. Composable useMask

**Ubicación:** `src/composables/useMask.ts`

```typescript
import { ref, watch } from 'vue';
import type { MaskConfig } from '@/decorations/mask_decorator';
import { MaskSide } from '@/enums/mask_sides';

/**
 * Composable para aplicar máscara a input
 */
export function useMask(initialValue: string, maskConfig: MaskConfig) {
    const displayValue = ref(applyMask(initialValue, maskConfig));
    const rawValue = ref(extractRawValue(initialValue, maskConfig));
    
    /**
     * Aplica máscara a un valor
     */
    function applyMask(value: string, config: MaskConfig): string {
        if (!value) return '';
        
        const mask = config.mask;
        const raw = value.replace(/[^0-9A-Za-z]/g, '');  // Solo caracteres válidos
        
        let result = '';
        let maskIndex = 0;
        let rawIndex = 0;
        
        if (config.side === MaskSide.RIGHT) {
            // Aplicar desde derecha
            while (maskIndex < mask.length && rawIndex < raw.length) {
                const maskChar = mask[maskIndex];
                
                if (maskChar === '#' || maskChar === 'A' || maskChar === 'a' || 
                    maskChar === 'X' || maskChar === '*') {
                    // Placeholder → insertar carácter de raw
                    result += raw[rawIndex];
                    rawIndex++;
                } else {
                    // Carácter literal → insertar directamente
                    result += maskChar;
                }
                
                maskIndex++;
            }
        } else {
            // Aplicar desde izquierda (similar logic)
            // ...
        }
        
        return result;
    }
    
    /**
     * Extrae valor sin formato
     */
    function extractRawValue(value: string, config: MaskConfig): string {
        return value.replace(/[^0-9A-Za-z]/g, '');
    }
    
    /**
     * Validar carácter según placeholder
     */
    function isValidChar(char: string, placeholder: string): boolean {
        switch (placeholder) {
            case '#':
                return /[0-9]/.test(char);
            case 'A':
                return /[A-Z]/.test(char);
            case 'a':
                return /[a-z]/.test(char);
            case 'X':
                return /[A-Z0-9]/.test(char);
            case '*':
                return true;
            default:
                return false;
        }
    }
    
    return {
        displayValue,
        rawValue,
        applyMask
    };
}
```

**Funcionalidad:**
- `applyMask()`: Aplica patrón de máscara a string raw
- `extractRawValue()`: Extrae caracteres sin delimitadores
- `isValidChar()`: Valida si carácter cumple con placeholder
- Retorna refs reactivos para integración con Vue components

### 4.6. Integración con TextInput Component

**Ubicación:** `src/components/Form/TextInput.vue`

```vue
<template>
  <div class="form-group">
    <label :for="inputId">
      {{ propertyLabel }}
      <span v-if="isRequired" class="required">*</span>
    </label>
    
    <input
      :id="inputId"
      v-model="displayValue"
      type="text"
      :placeholder="maskPlaceholder"
      :disabled="isDisabled"
      :readonly="isReadOnly"
      @input="handleInput"
      @blur="validate"
    />
    
    <p v-if="helpText" class="help-text">
      {{ helpText }}
    </p>
    
    <p v-if="validationError" class="error-text">
      {{ validationError }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useMask } from '@/composables/useMask';
import type BaseEntity from '@/entities/base_entity';

const props = defineProps<{
    modelValue: string;
    property: string;
    entity: BaseEntity;
    entityClass: typeof BaseEntity;
}>();

const emit = defineEmits<{
    'update:modelValue': [value: string];
}>();

// Obtener configuración de máscara
const maskConfig = computed(() => {
    return props.entity.getMask(props.property);
});

// Si hay máscara, usar useMask composable
const { displayValue, rawValue, applyMask } = maskConfig.value
    ? useMask(props.modelValue, maskConfig.value)
    : { 
        displayValue: ref(props.modelValue), 
        rawValue: ref(props.modelValue),
        applyMask: (val: string) => val
      };

// Placeholder de la máscara (ej: (___) ___-____)
const maskPlaceholder = computed(() => {
    if (!maskConfig.value) return '';
    return maskConfig.value.mask.replace(/[#AaX*]/g, '_');
});

function handleInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const newValue = input.value;
    
    if (maskConfig.value) {
        // Aplicar máscara
        displayValue.value = applyMask(newValue, maskConfig.value);
        
        // Emitir valor crudo (sin formato)
        emit('update:modelValue', rawValue.value);
    } else {
        // Sin máscara, emitir directamente
        emit('update:modelValue', newValue);
    }
}
</script>
```

**Flujo de integración:**
1. Component obtiene MaskConfig mediante `entity.getMask(property)`
2. Si existe máscara, instancia `useMask` composable
3. Placeholder se genera reemplazando placeholders con underscores
4. En @input, aplica máscara y emite valor crudo al parent
5. Usuario ve valor formateado, pero model contiene valor crudo

## 5. Flujo de Funcionamiento

### Fase 1: Decoración de Propiedad (Design Time)

```typescript
export class Customer extends BaseEntity {
    @PropertyName('Phone', String)
    @Mask('(###) ###-####')  // ← 1. Decorador aplicado en tiempo de compilación
    phone!: string;
}
```

**Acciones:**
1. TypeScript procesa decorador durante compilación
2. Función `Mask()` se ejecuta inmediatamente
3. PropertyDecorator almacena MaskConfig en `Customer.prototype[MASK_KEY]['phone']`
4. Metadata queda disponible para runtime

### Fase 2: Carga de Entity Class (Runtime - Inicialización)

```typescript
// Application carga clase Customer
Application.View.value.entityClass = Customer;

// Metadata ya está disponible en prototype
console.log(Customer.getMask('phone')); 
// { mask: '(###) ###-####', side: MaskSide.RIGHT }
```

**Acciones:**
1. Aplicación carga clase entity en Application singleton
2. Metadata de decoradores ya está almacenada en prototype
3. Métodos estáticos pueden consultar metadata sin instanciación

### Fase 3: Renderizado de TextInput (DetailView)

```vue
<script setup>
const maskConfig = computed(() => {
    return entity.getMask('phone');
    // Retorna: { mask: '(###) ###-####', side: MaskSide.RIGHT }
});

const { displayValue, rawValue, applyMask } = maskConfig.value
    ? useMask(entity.phone, maskConfig.value)
    : { displayValue: ref(''), rawValue: ref(''), applyMask: (v) => v };
</script>

<template>
  <input
    v-model="displayValue"
    :placeholder="'(___) ___-____'"
    @input="handleInput"
  />
</template>
```

**Acciones:**
1. Component obtiene MaskConfig mediante accessor
2. Si existe, instancia useMask composable con valor inicial
3. Composable calcula displayValue (formateado) y rawValue (crudo)
4. Placeholder se genera reemplazando # A a X * con underscores

### Fase 4: Entrada de Usuario (Input Event)

```typescript
// Usuario escribe progresivamente: 5 → 55 → 555 → 5551 → ...

handleInput(event) {
    const newValue = event.target.value;
    // newValue podría ser "555" o "(555" dependiendo de lo que usuario escribió
    
    // applyMask normaliza entrada
    displayValue.value = applyMask(newValue, maskConfig.value);
    // displayValue: "(555) 123-4567"
    
    // extractRawValue remueve delimitadores
    rawValue.value = extractRawValue(displayValue.value);
    // rawValue: "5551234567"
    
    // Emitir valor crudo a parent component
    emit('update:modelValue', rawValue.value);
}
```

**Acciones:**
1. Usuario escribe carácter en input
2. Event handler captura nuevo valor
3. `applyMask()` aplica patrón de máscara
4. `extractRawValue()` obtiene valor sin delimitadores
5. Emit actualiza model con valor crudo
6. displayValue se actualiza mostrando formato

### Fase 5: Guardado (Submit)

```typescript
// Usuario ve en pantalla: (555) 123-4567
// Valor en entity.phone: "5551234567" (valor crudo)

async function saveEntity() {
    await customer.save();
    
    // Request al backend:
    // POST /api/customers
    // { phone: "5551234567" }  ← Valor crudo sin formato
}
```

**Acciones:**
1. Entity contiene valor crudo (sin delimitadores)
2. `save()` envía valor crudo al backend
3. Backend recibe y almacena valor sin formato
4. Al cargar de nuevo, formato se aplica nuevamente en UI

## 6. Reglas Obligatorias

### 6.1. Máscaras para Formatos Estructurados Deben Usar @Mask

**Regla:** Datos con formato estructurado conocido (teléfonos, tarjetas, SSN, etc.) deben usar @Mask para guiar entrada.

```typescript
// CORRECTO
export class Customer extends BaseEntity {
    @PropertyName('Phone', String)
    @Mask('(###) ###-####')
    phone!: string;
}

// INCORRECTO
export class Customer extends BaseEntity {
    @PropertyName('Phone', String)
    phone!: string;
}
```

### 6.2. Valor Backend Debe Ser Crudo (Sin Formato)

**Regla:** Backend debe recibir y almacenar valor sin delimitadores. Formato es solo presentational en UI.

```typescript
// CORRECTO - Emitir valor crudo
function handleInput() {
    emit('update:modelValue', rawValue.value);  // "5551234567"
}

// INCORRECTO - Emitir valor formateado
function handleInput() {
    emit('update:modelValue', displayValue.value);  // "(555) 123-4567"
}
```

### 6.3. Validaciones Deben Operar Sobre Valor Crudo

**Regla:** @Validation debe validar valor sin formato, no valor con delimitadores aplicados.

```typescript
// CORRECTO
@Mask('(###) ###-####')
@Validation((value: string) => {
    const raw = value.replace(/\D/g, '');  // Extraer dígitos
    if (raw.length !== 10) {
        return 'Phone must be 10 digits';
    }
    return null;
})
phone!: string;

// INCORRECTO
@Mask('(###) ###-####')
@Validation((value: string) => {
    if (value.length !== 14) {  // Longitud incorrecta
        return 'Invalid phone';
    }
    return null;
})
phone!: string;
```

### 6.4. Placeholder debe Mostrar Ejemplo de Máscara

**Regla:** Placeholder de input debe mostrar formato esperado reemplazando placeholders con underscores.

```typescript
// CORRECTO
const maskPlaceholder = computed(() => {
    if (!maskConfig.value) return '';
    return maskConfig.value.mask.replace(/[#AaX*]/g, '_');
    // "(###) ###-####" → "(___) ___-____"
});

// INCORRECTO
const maskPlaceholder = "Enter phone number";  // No muestra formato
```

### 6.5. Máscaras con Formato Fijo Deben Usar MaskSide.RIGHT

**Regla:** Para formatos con longitud fija (teléfonos, SSN, tarjetas), usar MaskSide.RIGHT (default).

```typescript
// CORRECTO
@Mask('(###) ###-####', MaskSide.RIGHT)  // o simplemente @Mask('(###) ###-####')
phone!: string;

// INCORRECTO para formato fijo
@Mask('(###) ###-####', MaskSide.LEFT)  
phone!: string;
```

### 6.6. Máscaras Complejas Deben Documentarse en HelpText

**Regla:** Máscaras no obvias deben incluir @HelpText con ejemplo.

```typescript
// CORRECTO
@Mask('XX:XX:XX:XX:XX:XX')
@HelpText('MAC Address format: A1:B2:C3:D4:E5:F6')
macAddress!: string;

// INCORRECTO
@Mask('XX:XX:XX:XX:XX:XX')
macAddress!: string;
```

## 7. Prohibiciones

### 7.1. NO Validar con Valor Formateado

**Prohibición:** No asumir que valor en validación incluye delimitadores de máscara.

```typescript
// PROHIBIDO
@Mask('(###) ###-####')
@Validation((value: string) => {
    if (!value.startsWith('(')) {
        return 'Invalid format';
    }
    return null;
})
phone!: string;

// PERMITIDO
@Mask('(###) ###-####')
@Validation((value: string) => {
    const raw = value.replace(/\D/g, '');  // Extraer crudo
    if (raw.length !== 10) {
        return 'Phone must be 10 digits';
    }
    return null;
})
phone!: string;
```

### 7.2. NO Usar Mask Para Formateo de Visualización

**Prohibición:** No usar @Mask para formatear valores en ListView o campos readonly. Usar @DisplayFormat.

```typescript
// PROHIBIDO
@Mask('$###,###.##')
@HideInDetailView()
price!: number;  // Mask es para entrada, no visualización

// PERMITIDO
@DisplayFormat((value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`)
@HideInDetailView()
price!: number;  // DisplayFormat para visualización
```

### 7.3. NO Almacenar Valor Formateado en Backend

**Prohibición:** No enviar valor con delimitadores al backend. Almacenar solo valor crudo.

```typescript
// PROHIBIDO
async function saveEntity() {
    const dataToSave = {
        phone: displayValue.value  // "(555) 123-4567" con delimitadores
    };
    await api.post('/customers', dataToSave);
}

// PERMITIDO
async function saveEntity() {
    const dataToSave = {
        phone: rawValue.value  // "5551234567" crudo
    };
    await api.post('/customers', dataToSave);
}
```

### 7.4. NO Usar Máscaras Excesivamente Complejas

**Prohibición:** No crear máscaras con más de 20-25 caracteres. Afecta usabilidad y performance.

```typescript
// PROHIBIDO
@Mask('(##) ####-####/####/####/####')  // Demasiado complejo
complexField!: string;

// PERMITIDO
@Mask('#### #### #### ####')  // Razonable
creditCard!: string;
```

### 7.5. NO Combinar Mask con StringType Incompatible

**Prohibición:** No usar @Mask en campos TEXTAREA, HTML, JSON. Solo TEXT inputs.

```typescript
// PROHIBIDO
@StringType(StringTypeEnum.TEXTAREA)
@Mask('###-###')  // Mask no aplica a textarea
description!: string;

// PERMITIDO
@StringType(StringTypeEnum.TEXT)  // o sin StringType (default text)
@Mask('###-###')  // Mask para text input
code!: string;
```

### 7.6. NO Asumir Que Mask Valida Datos

**Prohibición:** Máscara solo formatea, no valida. Agregar @Validation explícita.

```typescript
// PROHIBIDO - Sin validación
@Mask('(###) ###-####')
phone!: string;
// Usuario puede ingresar datos inválidos que cumplan máscara

// PERMITIDO - Con validación
@Mask('(###) ###-####')
@Validation((value: string) => {
    const raw = value.replace(/\D/g, '');
    
    if (raw.length !== 10) {
        return 'Must be 10 digits';
    }
    
    const areaCode = parseInt(raw.substring(0, 3));
    if (areaCode < 200) {
        return 'Invalid area code';
    }
    
    return null;
})
phone!: string;
```

## 8. Dependencias

### 8.1. BaseEntity (Core)

**Relación:** BaseEntity proporciona accessor para obtener configuración de máscara.

**Dependencias:**
```typescript
// src/entities/base_entity.ts
import { MASK_KEY, type MaskConfig } from '@/decorations/mask_decorator';

public getMask(propertyKey: string): MaskConfig | undefined
public static getMask(propertyKey: string): MaskConfig | undefined
```

**Uso:** Decorador almacena metadata, BaseEntity la lee mediante accessors.

### 8.2. useMask Composable

**Relación:** Composable Vue que implementa lógica de aplicación de máscara en tiempo real.

**Dependencias:**
```typescript
// src/composables/useMask.ts
import type { MaskConfig } from '@/decorations/mask_decorator';
import { MaskSide } from '@/enums/mask_sides';

export function useMask(initialValue: string, maskConfig: MaskConfig)
```

**Uso:** Components de formulario instancian composable con MaskConfig obtenido de entity.

### 8.3. TextInput Component

**Relación:** Component de input de texto que aplica máscaras si están configuradas.

**Dependencias:**
```vue
<!-- src/components/Form/TextInput.vue -->
<script setup>
import { useMask } from '@/composables/useMask';

const maskConfig = computed(() => entity.getMask(property));
const { displayValue, rawValue, applyMask } = useMask(modelValue, maskConfig.value);
</script>
```

**Uso:** Component consulta configuración y aplica máscara automáticamente en inputs.

### 8.4. @StringType Decorator

**Relación:** Mask solo aplica a StringType.TEXT (default). No compatible con TEXTAREA, HTML, JSON.

**Restricción:**
```typescript
// Compatible
@StringType(StringTypeEnum.TEXT)  // o sin @StringType
@Mask('###-####')
code!: string;

// No compatible
@StringType(StringTypeEnum.TEXTAREA)
@Mask('###-####')  // No se aplicará
description!: string;
```

### 8.5. @Validation Decorator

**Relación:** Validaciones operan sobre valor crudo, no formateado.

**Coordinación:**
```typescript
@Mask('(###) ###-####')
@Validation((value: string) => {
    // value es crudo "5551234567"
    const raw = value.replace(/\D/g, '');
    return raw.length === 10 ? null : 'Invalid phone';
})
phone!: string;
```

### 8.6. @DisplayFormat Decorator

**Relación:** DisplayFormat formatea salida (ListView, readonly), Mask formatea entrada (input editable).

**Diferenciación:**
```typescript
// Mask para entrada
@Mask('###-##-####')
ssn!: string;

// DisplayFormat para salida
@DisplayFormat((value: string) => `XXX-XX-${value.substring(5)}`)
ssnDisplay!: string;
```

### 8.7. @HelpText Decorator

**Relación:** HelpText debe documentar formato esperado cuando máscara no es obvia.

**Uso conjunto:**
```typescript
@Mask('XX:XX:XX:XX:XX:XX')
@HelpText('MAC Address (e.g., A1:B2:C3:D4:E5:F6)')
macAddress!: string;
```

## 9. Relaciones

### 9.1. Con @Required (Complementario)

**Relación:** Mask guía entrada, Required valida que se proporcionó.

```typescript
@Mask('(###) ###-####')
@Required()
phone!: string;
// Mask: Formatea entrada
// Required: Valida que no esté vacío
```

### 9.2. Con @HelpText (Documentación)

**Relación:** HelpText documenta ejemplo de formato esperado.

```typescript
@Mask('####-####-####-####')
@HelpText('Enter 16-digit credit card number')
creditCard!: string;
```

### 9.3. Con @Readonly (Exclusión mutua)

**Relación:** Mask no aplica en campos readonly (no son editables).

```typescript
@Mask('(###) ###-####')
@Readonly()
phone!: string;
// Mask no tiene efecto porque campo no es editable
```

### 9.4. Con @DisplayFormat (Separación de responsabilidades)

**Relación:** Mask para entrada editable, DisplayFormat para visualización readonly.

```typescript
export class Customer extends BaseEntity {
    // Entrada en formulario
    @Mask('(###) ###-####')
    phoneEditable!: string;
    
    // Visualización en tabla
    @DisplayFormat((value: string) => {
        const raw = value.replace(/\D/g, '');
        return `(${raw.substring(0,3)}) ${raw.substring(3,6)}-${raw.substring(6)}`;
    })
    @HideInDetailView()
    phoneFormatted!: string;
}
```

### 9.5. Con @Validation (Complementario obligatorio)

**Relación:** Mask formatea, Validation valida. Siempre usar juntos.

```typescript
@Mask('###-##-####')
@Validation((value: string) => {
    const raw = value.replace(/\D/g, '');
    
    if (raw.length !== 9) {
        return 'SSN must be 9 digits';
    }
    
    if (/^(012345678|123456789)$/.test(raw)) {
        return 'Sequential SSN not allowed';
    }
    
    return null;
})
ssn!: string;
```

### 9.6. Con DefaultValue (Inicialización)

**Relación:** DefaultValue proporciona valor inicial que se formatea con máscara.

```typescript
@Mask('###-####')
@DefaultValue('0005555')
code!: string;
// Al crear nueva instancia, displayValue será "000-5555"
```

## 10. Notas de Implementación

### Nota 1: MaskSide RIGHT vs LEFT

MaskSide.RIGHT (default) interpola de derecha a izquierda, útil para formatos fijos:

```typescript
@Mask('(###) ###-####', MaskSide.RIGHT)
// Usuario escribe: 5 → 5
//                  55 → 55
//                  555 → (555
//                  5551 → (555) 1
//                  ...
```

MaskSide.LEFT interpola de izquierda a derecha, útil para campos con longitud variable:

```typescript
@Mask('####-####-####-####', MaskSide.LEFT)
// Usuario escribe: 1 → 1___-____-____-____
//                  12 → 12__-____-____-____
//                  ...
```

### Nota 2: Máscaras Comunes y Patrones

Tabla de máscaras frecuentemente utilizadas:

| Tipo | Máscara | Ejemplo |
|------|---------|---------|
| Teléfono US | `(###) ###-####` | (555) 123-4567 |
| SSN | `###-##-####` | 123-45-6789 |
| Tarjeta | `#### #### #### ####` | 4532 0151 1283 0366 |
| Fecha | `##/##/####` | 01/05/2025 |
| ZIP Code | `#####` | 12345 |
| ZIP+4 | `#####-####` | 12345-6789 |
| Placa | `AAA-####` | ABC-1234 |
| MAC Address | `XX:XX:XX:XX:XX:XX` | A1:B2:C3:D4:E5:F6 |

### Nota 3: Validación de Caracteres en useMask

Composable valida automáticamente que caracteres ingresados cumplan con placeholder:

```typescript
function isValidChar(char: string, placeholder: string): boolean {
    switch (placeholder) {
        case '#':
            return /[0-9]/.test(char);  // Solo dígitos
        case 'A':
            return /[A-Z]/.test(char);  // Solo mayúsculas
        case 'a':
            return /[a-z]/.test(char);  // Solo minúsculas
        case 'X':
            return /[A-Z0-9]/.test(char);  // Alfanumérico mayúsculas
        case '*':
            return true;  // Cualquier carácter
        default:
            return false;
    }
}
```

### Nota 4: Placeholder Generation

Placeholder se genera reemplazando placeholders con underscores:

```typescript
const maskPlaceholder = computed(() => {
    if (!maskConfig.value) return '';
    return maskConfig.value.mask.replace(/[#AaX*]/g, '_');
});

// Ejemplos:
// "(###) ###-####" → "(___) ___-____"
// "###-##-####" → "___-__-____"
// "#### #### #### ####" → "____ ____ ____ ____"
```

### Nota 5: Backend Debe Recibir Valor Crudo

Backend no debe esperar delimitadores:

```typescript
// Frontend envía:
{
    phone: "5551234567"  // ← Valor crudo
}

// Backend NO recibe:
{
    phone: "(555) 123-4567"  // ← Con formato
}

// Backend puede reformatear para clientes que lo necesiten:
// GET /api/customers/42
// Response puede incluir ambos si es necesario:
{
    phone: "5551234567",
    phoneFormatted: "(555) 123-4567"  // ← Computed por backend
}
```

### Nota 6: Testing de Máscaras

Test de aplicación de máscara:

```typescript
import { describe, it, expect } from 'vitest';
import { useMask } from '@/composables/useMask';
import { MaskSide } from '@/enums/mask_sides';

describe('useMask composable', () => {
    it('should apply phone mask correctly', () => {
        const config = { mask: '(###) ###-####', side: MaskSide.RIGHT };
        const { applyMask } = useMask('', config);
        
        expect(applyMask('5551234567', config)).toBe('(555) 123-4567');
    });
    
    it('should extract raw value', () => {
        const config = { mask: '(###) ###-####', side: MaskSide.RIGHT };
        const { extractRawValue } = useMask('', config);
        
        expect(extractRawValue('(555) 123-4567', config)).toBe('5551234567');
    });
});
```

### Nota 7: Performance Considerations

UseMask debe ser eficiente porque se ejecuta en cada keystroke:

```typescript
// EFICIENTE: Regex simple para extraer caracteres
const raw = value.replace(/[^0-9A-Za-z]/g, '');

// INEFICIENTE: Loops anidados o regex complejos
for (let i = 0; i < value.length; i++) {
    for (let j = 0; j < mask.length; j++) {
        // Lógica compleja...
    }
}
```

### Nota 8: Copy-Paste Behavior

Usuario puede pegar valor formateado o crudo, composable debe normalizar:

```typescript
// Usuario copia y pega: "(555) 123-4567" o "5551234567"
// Ambos deben resultar en mismo displayValue: "(555) 123-4567"

function handlePaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text') || '';
    
    // Limpiar cualquier formato previo
    const raw = pastedText.replace(/[^0-9A-Za-z]/g, '');
    
    // Aplicar máscara
    displayValue.value = applyMask(raw, maskConfig.value);
}
```

### Nota 9: Dynamic Mask NO Soportado

Máscaras son estáticas, no pueden cambiar dinámicamente según contenido:

```typescript
// NO POSIBLE: Máscara dinámica por país
// @Mask((entity) => entity.country === 'US' ? '(###) ###-####' : '#### ### ###')

// ALTERNATIVA: Lógica en component
<template>
  <TextInput v-if="entity.country === 'US'" :mask="usMask" />
  <TextInput v-else :mask="internationalMask" />
</template>
```

### Nota 10: Accessibility Considerations

Máscaras deben ser accesibles para screen readers:

```vue
<template>
  <input
    :aria-label="propertyLabel"
    :aria-describedby="`${inputId}-help ${inputId}-error`"
    :placeholder="maskPlaceholder"
  />
  
  <span :id="`${inputId}-help`" class="help-text">
    {{ helpText || `Format: ${maskPlaceholder}` }}
  </span>
  
  <span :id="`${inputId}-error`" class="error-text" v-if="validationError">
    {{ validationError }}
  </span>
</template>
```

## 11. Referencias Cruzadas

### Documentación de Framework

- [Base Entity Core](../02-base-entity/base-entity-core.md) - Método `getMask()`
- [Metadata Access](../02-base-entity/metadata-access.md) - Sistema de metadata y accessors

### Decoradores Relacionados

- [StringType Decorator](string-type-decorator.md) - Tipos de input (TEXT compatible con Mask)
- [DisplayFormat Decorator](display-format-decorator.md) - Formateo de salida (complementario a Mask para entrada)
- [Validation Decorator](validation-decorator.md) - Validación de valor crudo
- [HelpText Decorator](help-text-decorator.md) - Documentación de formato esperado
- [Required Decorator](required-decorator.md) - Validación de campo requerido
- [Readonly Decorator](readonly-decorator.md) - Mask no aplica en readonly

### Componentes y Composables

- TextInput Component (src/components/Form/TextInput.vue) - Implementación de input con máscara
- useMask Composable (src/composables/useMask.ts) - Lógica de aplicación de máscara

### Enums

- MaskSide Enum (src/enums/mask_sides.ts) - Dirección de aplicación (LEFT/RIGHT)

### Tutoriales

- [Validations Tutorial](../../tutorials/02-validations.md) - Uso de máscaras con validaciones

**Ubicación del archivo fuente:**
- Decorador: `src/decorations/mask_decorator.ts` (~45 líneas)
- Enum: `src/enums/mask_sides.ts` (~15 líneas)
- Composable: `src/composables/useMask.ts` (~200 líneas)

**Símbolos exportados:**
```typescript
export const MASK_KEY: Symbol
export interface MaskConfig { mask: string; side: MaskSide; }
export function Mask(mask: string, side?: MaskSide): PropertyDecorator
export enum MaskSide { LEFT = 'left', RIGHT = 'right' }
export function useMask(initialValue: string, maskConfig: MaskConfig)
```
| MAC Address | `XX:XX:XX:XX:XX:XX` | A1:B2:C3:D4:E5:F6 |
| IP Address | `###.###.###.###` | 192.168.1.1 |
| Currency | `$###,###.##` | $1,234.56 |

---

## Referencias Adicionales

- `string-type-decorator.md` - StringType puede combinarse con Mask
- `display-format-decorator.md` - DisplayFormat para salida, Mask para entrada
- `validation-decorator.md` - Validar valor crudo con máscara
- `help-text-decorator.md` - Help text mostrando ejemplo de máscara
- `../02-base-entity/base-entity-core.md` - getMask() implementation
- `../../tutorials/02-validations.md` - Máscaras en tutorial

---

**Última actualización:** 10 de Febrero, 2026  
**Archivo fuente:** `src/decorations/mask_decorator.ts`  
**Enum:** `src/enums/mask_sides.ts`  
**Líneas:** ~45 (decorator), ~15 (enum)
