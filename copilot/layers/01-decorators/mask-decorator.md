# 🎭 Mask Decorator

**Referencias:**
- `string-type-decorator.md` - StringType puede combinarse con Mask
- `display-format-decorator.md` - DisplayFormat formatea salida, Mask formatea entrada
- `../../02-base-entity/base-entity-core.md` - getMask() accessor
- `../../tutorials/02-validations.md` - Máscaras en formularios

---

## 📍 Ubicación en el Código

**Archivo:** `src/decorations/mask_decorator.ts`  
**Enum:** `src/enums/mask_sides.ts`

---

## 🎯 Propósito

El decorador `@Mask()` aplica **formateo automático de entrada** a campos de texto, guiando al usuario a ingresar datos en un formato específico mientras escribe.

**Beneficios:**
- Mejora UX con formato automático
- Reduce errores de entrada
- Validación visual en tiempo real
- Formatos estándar (teléfono, tarjeta,  SSN, fecha, etc.)

**Diferencia con @DisplayFormat:**
- `@Mask`: Formatea **entrada** (mientras usuario escribe)
- `@DisplayFormat`: Formatea **salida** (cómo se muestra)

---

## 📝 Sintaxis

```typescript
@Mask(mask: string, side?: MaskSide)
propertyName: string;
```

### Parámetros

| Parámetro | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
| `mask` | `string` | Sí | - | Patrón de máscara (ver sintaxis abajo) |
| `side` | `MaskSide` | No | `MaskSide.RIGHT` | Dirección de aplicación de la máscara |

### Sintaxis de Máscara

| Carácter | Significado | Ejemplo |
|----------|-------------|---------|
| `#` | Dígito (0-9) | `###` → `123` |
| `A` | Letra mayúscula (A-Z) | `AAA` → `ABC` |
| `a` | Letra minúscula (a-z) | `aaa` → `abc` |
| `X` | Alfanumérico (A-Z, 0-9) | `XXX` → `A1B` |
| `*` | Cualquier carácter | `***` → `a2$` |
| Otros | Carácter literal | `(###) ###-####` → `(123) 456-7890` |

### MaskSide Enum

```typescript
// src/enums/mask_sides.ts

export enum MaskSide {
    LEFT = 'left',    // Aplicar desde izquierda
    RIGHT = 'right'   // Aplicar desde derecha (default)
}
```

---

## 💾 Implementación

### Código del Decorador

```typescript
// src/decorations/mask_decorator.ts

import { MaskSide } from '@/enums/mask_sides';

/**
 * Symbol para almacenar metadata de mask
 */
export const MASK_METADATA = Symbol('mask');

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
        if (!target[MASK_METADATA]) {
            target[MASK_METADATA] = {};
        }
        
        // Guardar configuración
        target[MASK_METADATA][propertyKey] = {
            mask: mask,
            side: side
        };
    };
}
```

**Ubicación:** `src/decorations/mask_decorator.ts` (línea ~1-45)

---

## 🔍 Metadata Storage

### Estructura en Prototype

```typescript
Product.prototype[MASK_METADATA] = {
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

### Acceso desde BaseEntity

```typescript
// src/entities/base_entitiy.ts

/**
 * Obtiene la configuración de máscara de una propiedad
 * 
 * @param propertyKey - Nombre de la propiedad
 * @returns Configuración de máscara o undefined
 */
public getMask(propertyKey: string): MaskConfig | undefined {
    const constructor = this.constructor as typeof BaseEntity;
    const maskMetadata = constructor.prototype[MASK_METADATA];
    
    if (!maskMetadata || !maskMetadata[propertyKey]) {
        return undefined;
    }
    
    return maskMetadata[propertyKey];
}

/**
 * Obtiene la configuración de máscara (método estático)
 */
public static getMask(propertyKey: string): MaskConfig | undefined {
    const maskMetadata = this.prototype[MASK_METADATA];
    
    if (!maskMetadata || !maskMetadata[propertyKey]) {
        return undefined;
    }
    
    return maskMetadata[propertyKey];
}
```

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~890-920)

---

## 🎨 Impacto en UI

### MaskInput Component

```typescript
// src/composables/useMask.ts

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
            // Aplicar desde izquierda (similar)
            // ... implementación
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

### TextInput con Mask

```vue
<!-- src/components/Form/TextInput.vue -->

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
import type BaseEntity from '@/entities/base_entitiy';

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

// ...
</script>
```

**Ubicación:** `src/components/Form/TextInput.vue`

---

## 🧪 Ejemplos de Uso

### 1. Teléfono (US Format)

```typescript
import { Mask } from '@/decorations/mask_decorator';
import { PropertyName } from '@/decorations/property_name_decorator';
import BaseEntity from '@/entities/base_entitiy';

export class Customer extends BaseEntity {
    @PropertyName('Phone', String)
    @Mask('(###) ###-####')
    phone!: string;
}
```

**Comportamiento:**
```
Usuario escribe: 5551234567
Campo muestra:   (555) 123-4567
Valor guardado:  5551234567 (sin formato)
```

---

### 2. SSN (Social Security Number)

```typescript
export class Employee extends BaseEntity {
    @PropertyName('SSN', String)
    @Mask('###-##-####')
    ssn!: string;
}
```

**Comportamiento:**
```
Usuario escribe: 123456789
Campo muestra:   123-45-6789
Valor guardado:  123456789
```

---

### 3. Tarjeta de Crédito

```typescript
export class Payment extends BaseEntity {
    @PropertyName('Credit Card', String)
    @Mask('#### #### #### ####')
    creditCard!: string;
}
```

**Comportamiento:**
```
Usuario escribe: 4532015112830366
Campo muestra:   4532 0151 1283 0366
Valor guardado:  4532015112830366
```

---

### 4. Fecha (Custom Format)

```typescript
export class Event extends BaseEntity {
    @PropertyName('Event Date', String)
    @Mask('##/##/####')
    date!: string;
}
```

**Comportamiento:**
```
Usuario escribe: 01052025
Campo muestra:   01/05/2025
Valor guardado:  01052025
```

---

### 5. ZIP Code

```typescript
export class Address extends BaseEntity {
    @PropertyName('ZIP Code', String)
    @Mask('#####')
    zipCode!: string;
    
    @PropertyName('ZIP+4', String)
    @Mask('#####-####')
    zipCodeExtended!: string;
}
```

**Comportamiento:**
```
zipCode:         12345
zipCodeExtended: 12345-6789
```

---

### 6. Placa de Vehículo

```typescript
export class Vehicle extends BaseEntity {
    @PropertyName('License Plate', String)
    @Mask('AAA-####')
    licensePlate!: string;
}
```

**Comportamiento:**
```
Usuario escribe: ABC1234
Campo muestra:   ABC-1234
Valor guardado:  ABC1234
```

---

### 7. Código de Producto (Custom)

```typescript
export class Product extends BaseEntity {
    @PropertyName('SKU', String)
    @Mask('XXXX-####')
    sku!: string;
}
```

**Comportamiento:**
```
Usuario escribe: PROD0042
Campo muestra:   PROD-0042
Valor guardado:  PROD0042
```

---

### 8. MAC Address

```typescript
export class NetworkDevice extends BaseEntity {
    @PropertyName('MAC Address', String)
    @Mask('XX:XX:XX:XX:XX:XX')
    macAddress!: string;
}
```

**Comportamiento:**
```
Usuario escribe: A1B2C3D4E5F6
Campo muestra:   A1:B2:C3:D4:E5:F6
Valor guardado:  A1B2C3D4E5F6
```

---

### 9. Máscara con Lado Izquierdo

```typescript
import { MaskSide } from '@/enums/mask_sides';

export class BankAccount extends BaseEntity {
    @PropertyName('Account Number', String)
    @Mask('####-####-####-####', MaskSide.LEFT)
    accountNumber!: string;
}
```

**Comportamiento:**
```
Usuario escribe: 123
Campo muestra:   123_-____-____-____
(Máscara se aplica de izquierda a derecha)
```

---

### 10. Combo Mask + Validation

```typescript
import { Mask } from '@/decorations/mask_decorator';
import { Validation } from '@/decorations/validation_decorator';
import { HelpText } from '@/decorations/help_text_decorator';

export class Customer extends BaseEntity {
    @PropertyName('Phone', String)
    @Required()
    @Mask('(###) ###-####')
    @HelpText('Format: (555) 123-4567')
    @Validation((value: string) => {
        // Validar valor crudo (sin formato)
        const raw = value.replace(/\D/g, '');
        
        if (raw.length !== 10) {
            return 'Phone number must be 10 digits';
        }
        
        if (!raw.startsWith('2') && !raw.startsWith('3') && 
            !raw.startsWith('4') && !raw.startsWith('5')) {
            return 'Invalid area code';
        }
        
        return null;
    })
    phone!: string;
}
```

**Resultado:**
- Help text: "Format: (555) 123-4567"
- Máscara: Formatea automáticamente mientras escribe
- Validación: Valida valor crudo (10 dígitos, área code válido)

---

## 🎯 MaskSide: LEFT vs RIGHT

### RIGHT (Default)

Máscara se aplica de **derecha a izquierda**, útil para formatos fijos:

```typescript
@Mask('(###) ###-####', MaskSide.RIGHT)
phone!: string;

// Usuario escribe progresivamente:
'5'         → '5'
'55'        → '55'
'555'       → '(555'
'5551'      → '(555) 1'
'55512'     → '(555) 12'
'555123'    → '(555) 123'
'5551234'   → '(555) 123-4'
'55512345'  → '(555) 123-45'
'555123456' → '(555) 123-456'
'5551234567'→ '(555) 123-4567'
```

### LEFT

Máscara se aplica de **izquierda a derecha**, útil para datos variables:

```typescript
@Mask('####-####-####-####', MaskSide.LEFT)
accountNumber!: string;

// Usuario escribe progresivamente:
'1'        → '1___-____-____-____'
'12'       → '12__-____-____-____'
'123'      → '123_-____-____-____'
'1234'     → '1234-____-____-____'
'12345'    → '1234-5___-____-____'
...
```

---

## ⚠️ Consideraciones Importantes

### 1. Mask vs DisplayFormat

```typescript
// @Mask: Formatea ENTRADA (mientras usuario escribe)
@PropertyName('Phone', String)
@Mask('(###) ###-####')
phone!: string;

// @DisplayFormat: Formatea SALIDA (cómo se muestra en lista)
@PropertyName('Price', Number)
@DisplayFormat((value: number) => `$${value.toFixed(2)}`)
price!: number;

// Pueden combinarse:
@PropertyName('Amount', Number)
@Mask('###,###.##')              // Entrada
@DisplayFormat((v) => `$${v}`)   // Salida
amount!: number;
```

### 2. Valor Guardado es Crudo

```typescript
// Usuario ve:     (555) 123-4567
// Valor guardado: 5551234567
// Request al servidor:
{
    phone: "5551234567"  // ← Sin formato
}
```

### 3. Validación en Valor Crudo

```typescript
// ✅ CORRECTO: Validar valor crudo
@Mask('(###) ###-####')
@Validation((value: string) => {
    const raw = value.replace(/\D/g, '');  // Remover no-dígitos
    
    if (raw.length !== 10) {
        return 'Must be 10 digits';
    }
    
    return null;
})
phone!: string;

// ❌ INCORRECTO: Validar valor formateado
@Mask('(###) ###-####')
@Validation((value: string) => {
    if (value.length !== 14) {  // ← value es "(555) 123-4567" con formato
        return 'Invalid phone';
    }
    return null;
})
phone!: string;
```

### 4. Máscaras Simples Primero

```typescript
// ✅ BUENO: Máscara simple
@Mask('###-##-####')
ssn!: string;

// ⚠️ COMPLEJO: Máscaras muy complejas pueden afectar performance
@Mask('(##) ####-####/####/####')
complexField!: string;
```

### 5. Máscara NO Valida

```typescript
// Máscara solo FORMATEA, no valida
@Mask('(###) ###-####')
phone!: string;

// Usuario puede escribir: (abc) def-ghij
// Máscara permite cualquier carácter en placeholders

// ✅ Agregar validación:
@Mask('(###) ###-####')
@Validation((value: string) => {
    const raw = value.replace(/\D/g, '');
    return raw.length === 10 ? null : 'Invalid phone';
})
phone!: string;
```

---

## 📚 Máscaras Comunes

| Tipo | Máscara | Ejemplo |
|------|---------|---------|
| Teléfono (US) | `(###) ###-####` | (555) 123-4567 |
| Teléfono Internacional | `+## (###) ###-####` | +1 (555) 123-4567 |
| SSN | `###-##-####` | 123-45-6789 |
| Tarjeta | `#### #### #### ####` | 4532 0151 1283 0366 |
| Fecha | `##/##/####` | 01/05/2025 |
| Hora | `##:##` | 14:30 |
| ZIP | `#####` | 12345 |
| ZIP+4 | `#####-####` | 12345-6789 |
| Placa | `AAA-####` | ABC-1234 |
| MAC Address | `XX:XX:XX:XX:XX:XX` | A1:B2:C3:D4:E5:F6 |
| IP Address | `###.###.###.###` | 192.168.1.1 |
| Currency | `$###,###.##` | $1,234.56 |

---

## 📚 Referencias Adicionales

- `string-type-decorator.md` - StringType puede combinarse con Mask
- `display-format-decorator.md` - DisplayFormat para salida, Mask para entrada
- `validation-decorator.md` - Validar valor crudo con máscara
- `help-text-decorator.md` - Help text mostrando ejemplo de máscara
- `../../02-base-entity/base-entity-core.md` - getMask() implementation
- `../../tutorials/02-validations.md` - Máscaras en tutorial

---

**Última actualización:** 10 de Febrero, 2026  
**Archivo fuente:** `src/decorations/mask_decorator.ts`  
**Enum:** `src/enums/mask_sides.ts`  
**Líneas:** ~45 (decorator), ~15 (enum)
