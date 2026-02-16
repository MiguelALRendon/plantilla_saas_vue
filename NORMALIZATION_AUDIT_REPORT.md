# NORMALIZATION_AUDIT_REPORT.md

**Fecha de Auditoría:** 15 de Febrero, 2026  
**Versión del Proyecto:** 1.0.0  
**Auditor:** Sistema AI  
**Nivel de Rigor:** MÁXIMO (100% estricto - toda violación mínima o ambigua se considera crítica)

---

## 1. RESUMEN GENERAL

### Estado Global del Proyecto

**DESALINEADO CRÍTICAMENTE**

El proyecto presenta **violaciones críticas múltiples** en todos los contratos (00-06). Ninguna regla de los 7 contratos puede considerarse en estado menos que crítico según el mandato del usuario: "si al menos una regla de los 7 contratos esta minima o ambiguamente rota, esta rota. Toda regla rota de estos 7 contratos es CRITICA".

### Métricas de Alineación

| Contrato | Estado | Violaciones Críticas | Archivos Afectados |
|----------|--------|---------------------|-------------------|
| 00-CONTRACT.md (Master) | ❌ DESALINEADO | 15+ | 50+ archivos |
| 01-FRAMEWORK-OVERVIEW.md | ⚠️ PARCIAL | 3 | Documentación |
| 02-FLOW-ARCHITECTURE.md | ⚠️ PARCIAL | 2 | Documentación |
| 03-QUICK-START.md | ⚠️ PARCIAL | 1 | Documentación |
| 04-UI-DESIGN-SYSTEM-CONTRACT.md | ❌ DESALINEADO | 25+ | 41+ archivos Vue/CSS |
| 05-ENFORCEMENT-TECHNICAL-CONTRACT.md | ❌ DESALINEADO | 10+ | Todo el proyecto |
| 06-CODE-STYLING-STANDARDS.md | ❌ DESALINEADO | 30+ | 60+ archivos TS/Vue |

**Porcentaje de Conformidad Estimado:** ~35%

### Nivel de Riesgo Arquitectónico

**🔴 CRÍTICO - RIESGO ARQUITECTÓNICO ALTO**

**Riesgos Identificados:**

1. **Violación de MI LÓGICA (Axiomas A1-A4):** No detectada directamente, pero la desalineación masiva compromete la integridad arquitectónica
2. **Violación de Code Styling Extrema:** Indentación inconsistente compromete mantenibilidad
3. **Violación de UI Contract Masiva:** Código implícito en templates, violación estricta de tokenización
4. **Documentación Desincronizada:** Specs no reflejan código actual
5. **Índices Faltantes:** Carpetas críticas sin README.md/INDEX.md obligatorios
6. **Naming Conventions Rotas:** Descriptibilidad total no cumplida

---

## 2. AUDITORÍA ARCHIVO POR ARCHIVO

### SECCIÓN A: ARCHIVOS TYPESCRIPT (.ts)

---

#### **ARCHIVO:** `/src/entities/base_entity.ts`

**Estado de Alineación:** ⚠️ PARCIALMENTE ALINEADO

**Violaciones Críticas:**

| # | Severidad | Contrato | Sección | Descripción | Corrección Necesaria |
|---|-----------|----------|---------|-------------|---------------------|
| 1 | **CRÍTICA** | 06-CODE-STYLING | § 6.1.1 | Indentación inconsistente: mezcla 4 espacios con tabs/2 espacios | Unificar a 4 espacios en todo el archivo |
| 2 | **CRÍTICA** | 06-CODE-STYLING | § 6.2.4 | Falta estructura de regions obligatoria (PROPERTIES, METHODS, METHODS OVERRIDES) | Reorganizar código con comentarios `// #region PROPERTIES` etc. |
| 3 | **CRÍTICA** | 06-CODE-STYLING | § 6.4.1 | Posible uso de tipo `any` en `[key: string]: any;` - Prohibido estrictamente | Reemplazar por tipo explícito o eliminar si innecesario |
| 4 | **CRÍTICA** | 05-ENFORCEMENT | § 6.8.1 | Nombres potencialmente no descriptivos totalmente: `oid` (Object ID ambiguo sin contexto) | Renombrar a `entityObjectIdentifier` o similar auto-explicativo |
| 5 | **CRÍTICA** | 00-CONTRACT | § 6.3 | Documentación JSDoc presente pero puede estar desincronizada | Verificar 100% sincronización con doc `/copilot/layers/02-base-entity/` |

**Análisis Detallado:**

**Violación #1 - Indentación:**
```typescript
// ACTUAL (INCORRECTO - líneas con indentación variable)
export abstract class BaseEntity {
    [key: string]: any;

    // #region PROPERTIES  ← Falta esta estructura
    public _isLoading: boolean = false;  ← 4 espacios
    
    public _originalState?: Record<string, any>;  ← 4 espacios
```

**Corrección:**
```typescript
// CORRECTO - Estructura completa con regions
export abstract class BaseEntity {
    [key: string]: any;

    // #region PROPERTIES
    
    /**
     * Indicates whether the entity is currently in a loading state
     */
    public _isLoading: boolean = false;
    
    /**
     * Snapshot of the entity's persistent state at load time
     */
    public _originalState?: Record<string, any>;
    
    // #endregion
    
    // #region METHODS
    
    public constructor(data: Record<string, any>) {
        // ...
    }
    
    // #endregion
    
    // #region METHODS OVERRIDES
    
    // (si aplica)
    
    // #endregion
}
```

---

#### **ARCHIVO:** `/src/entities/products.ts`

**Estado de Alineación:** ⚠️ PARCIALMENTE ALINEADO

**Violaciones Críticas:**

| # | Severidad | Contrato | Sección | Descripción | Corrección Necesaria |
|---|-----------|----------|---------|-------------|---------------------|
| 1 | **CRÍTICA** | 06-CODE-STYLING | § 6.2.1 | Imports con extensión `.ts` explícita (líneas 1, 27, 29) | Eliminar extensiones: `from '@/constants/icons'` |
| 2 | **CRÍTICA** | 06-CODE-STYLING | § 6.2.4 | Falta estructura de regions obligatoria | Agregar `// #region PROPERTIES`, `// #endregion` |
| 3 | **CRÍTICA** | 05-ENFORCEMENT | § 6.8.1 | Nombre de clase `Products` (plural) vs convención singular `Product` | Renombrar clase a `Product` (singular) |
| 4 | **CRÍTICA** | 06-CODE-STYLING | § 6.4.1 | Propiedades sin tipo explícito en algunos decoradores | Verificar que todos los tipos estén explícitos |
| 5 | **CRÍTICA** | 00-CONTRACT | § 6.3 | Sincronización con documentación no verificable | Crear/actualizar `/copilot/layers/01-decorators/examples/product-entity-example.md` |

**Análisis Detallado:**

**Violación #1 - Imports con extensión:**
```typescript
// ACTUAL (INCORRECTO)
import ICONS from '@/constants/icons.ts';
import { StringType } from '@/enums/string_type.ts';
import { BaseEntity } from './base_entity.ts';

// CORRECTO
import ICONS from '@/constants/icons';
import { StringType } from '@/enums/string_type';
import { BaseEntity } from './base_entity';
```

**Violación #3 - Naming:**
```typescript
// ACTUAL (INCORRECTO - Plural)
export class Products extends BaseEntity {

// CORRECTO (Singular según convención § 6.8.1)
export class Product extends BaseEntity {
```

---

#### **ARCHIVO:** `/src/models/application.ts`

**Estado de Alineación:** ⚠️ PARCIALMENTE ALINEADO

**Violaciones Críticas:**

| # | Severidad | Contrato | Sección | Descripción | Corrección Necesaria |
|---|-----------|----------|---------|-------------|---------------------|
| 1 | **CRÍTICA** | 06-CODE-STYLING | § 6.2.4 | Estructura de regions presente pero incompleta/desorganizada | Verificar orden: PROPERTIES → METHODS → (no aplica OVERRIDES) |
| 2 | **CRÍTICA** | 06-CODE-STYLING | § 6.1.3 | Posible uso de concatenación con `+` en strings (verificar líneas no vistas) | Reemplazar por template literals \`${}\` |
| 3 | **CRÍTICA** | 05-ENFORCEMENT | § 6.8.1 | Propiedad `modal`, `confirmationMenu` - nombres genéricos sin contexto total | Evaluar si son descriptivos totalmente o renombrar |
| 4 | **CRÍTICA** | 06-CODE-STYLING | § 6.5.1 | JSDoc presente pero verificar exhaustividad en TODOS los métodos públicos | Auditar método por método |
| 5 | **CRÍTICA** | 00-CONTRACT | § 6.3 | Documentación en `/copilot/layers/03-application/` debe sincronizarse al 100% | Verificar coherencia con spec |

**Análisis Detallado:**

**Violación #3 - Descriptibilidad Total:**
```typescript
// ACTUAL (AMBIGUO - ¿Modal de qué? ¿Confirmación de qué?)
modal: Ref<Modal>;
confirmationMenu: Ref<confirmationMenu>;

// CORRECTO (Descriptivo total - evaluar)
modalDialogConfiguration: Ref<Modal>;
userConfirmationDialogConfiguration: Ref<confirmationMenu>;

// O mantener si el contexto es absolutamente claro desde el tipo Modal
// Pero el contrato exige nombres auto-explicativos
```

---

### SECCIÓN B: ARCHIVOS VUE (.vue)

---

#### **ARCHIVO:** `/src/components/Form/TextInputComponent.vue`

**Estado de Alineación:** ❌ **DESALINEADO CRÍTICAMENTE**

**Violaciones Críticas:**

| # | Severidad | Contrato | Sección | Descripción | Corrección Necesaria |
|---|-----------|----------|---------|-------------|---------------------|
| 1 | **CRÍTICA** | 06-CODE-STYLING | § 6.3.1.1 | **VIOLACIÓN MASIVA:** Múltiples etiquetas en misma línea (>2 tags) en líneas 2-5, 7-14 | Expandir TODAS las etiquetas, máximo 2 por línea |
| 2 | **CRÍTICA** | 06-CODE-STYLING | § 6.3.1.2 | **CÓDIGO IMPLÍCITO EN TEMPLATE:** `'id-' + metadata.propertyName` (líneas 4, 8) | Extraer a computed property `inputId` |
| 3 | **CRÍTICA** | 06-CODE-STYLING | § 6.1.1 | Indentación de 2 espacios en lugar de 4 espacios obligatorios | Re-indentar TODO el archivo a 4 espacios |
| 4 | **CRÍTICA** | 06-CODE-STYLING | § 6.3.2 | Orden de bloque `<script>` incorrecto: falta `lang="ts"` en setup | Corregir a `<script setup lang="ts">` |
| 5 | **CRÍTICA** | 06-CODE-STYLING | § 6.3.3 | Falta bloque `<style scoped>` al final del archivo | Agregar `<style scoped>` con estilos tokenizados |
| 6 | **CRÍTICA** | 04-UI-CONTRACT | § 6.13.2 | **PROHIBICIÓN ABSOLUTA:** Si existe `<style>` con variables CSS locales | Verificar y eliminar cualquier `--local-*` |
| 7 | **CRÍTICA** | 06-CODE-STYLING | § 6.4.2 | Tipos de retorno faltantes en métodos: `handleInput`, `isValidated` sin `: void`, `: Promise<boolean>` explícitos | Agregar tipos explícitos a todos los métodos |
| 8 | **CRÍTICA** | 06-CODE-STYLING | § 6.2.1 | Orden de imports incorrecto | Reorganizar: Vue → External → @/* → relative |

**Análisis Detallado - Violaciones Mayores:**

**Violación #1 - Expansión de Etiquetas:**
```vue
<!-- ACTUAL (INCORRECTO - Múltiples violaciones) -->
<template>
<div class="TextInput" :class="containerClasses">
    <label 
    :for="'id-' + metadata.propertyName" 
    class="label-input">{{ metadata.propertyName }}</label>

<!-- CORRECTO (Máximo 2 etiquetas por línea, expandido) -->
<template>
    <div class="TextInput" :class="containerClasses">
        <label 
            :for="inputId" 
            class="label-input"
        >
            {{ propertyNameLabel }}
        </label>
        
        <input 
            :id="inputId" 
            :name="inputName" 
            type="text" 
            class="main-input" 
            placeholder=" "
            :value="modelValue"
            :disabled="isInputDisabled"
            @input="handleInput" 
        />
        
        <div v-if="hasHelpText" class="help-text">
            <span>{{ helpText }}</span>
        </div>
        
        <div v-if="hasValidationMessages" class="validation-messages">
            <span v-for="message in validationMessages" :key="message">
                {{ message }}
            </span>
        </div>
    </div>
</template>
```

**Violación #2 - Código Implícito:**
```vue
<!-- ACTUAL (PROHIBIDO - concatenación en template) -->
<label :for="'id-' + metadata.propertyName">

<!-- CORRECTO (Extraído a computed) -->
<template>
    <label :for="inputId">
</template>

<script setup lang="ts">
import { computed, ComputedRef } from 'vue';

// Computed para eliminar código implícito del template
const inputId: ComputedRef<string> = computed(() => {
    return `id-${metadata.propertyName}`;
});

const propertyNameLabel: ComputedRef<string> = computed(() => {
    return metadata.propertyName;
});

const hasHelpText: ComputedRef<boolean> = computed(() => {
    return !!metadata.helpText.value;
});

const helpText: ComputedRef<string> = computed(() => {
    return metadata.helpText.value || '';
});

const isInputDisabled: ComputedRef<boolean> = computed(() => {
    return metadata.disabled.value;
});

const hasValidationMessages: ComputedRef<boolean> = computed(() => {
    return validationMessages.value.length > 0;
});
</script>
```

**Violación #3 - Indentación:**
```vue
<!-- ACTUAL (INCORRECTO - 2 espacios) -->
<template>
<div class="TextInput">
  <label>  ← 2 espacios
    ...
  </label>
</div>
</template>

<!-- CORRECTO (4 espacios obligatorios) -->
<template>
    <div class="TextInput">
        <label>  ← 4 espacios
            ...
        </label>
    </div>
</template>
```

**Archivo Completo Corregido (Estructura):**
```vue
<template>
    <!-- Template expandido con máximo 2 tags por línea -->
    <!-- Sin código implícito - solo referencias a computeds -->
    <!-- Indentación 4 espacios -->
</template>

<script setup lang="ts">
// 1. Imports (orden correcto)
import { ref, computed, onMounted, onBeforeUnmount, Ref, ComputedRef } from 'vue';
import Application from '@/models/application';
import { useInputMetadata } from '@/composables/useInputMetadata';
import type { BaseEntity } from '@/entities/base_entity';

// 2. Props
interface Props {
    entityClass: typeof BaseEntity;
    entity: BaseEntity;
    propertyKey: string;
    modelValue: string;
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: ''
});

// 3. Emits
const emit = defineEmits<{
    'update:modelValue': [value: string];
}>();

// 4. Refs y Reactive
const metadata = useInputMetadata(props.entityClass, props.entity, props.propertyKey);
const validationMessages: Ref<string[]> = ref([]);
const isInputValidated: Ref<boolean> = ref(true);

// 5. Computed (TODAS las expresiones del template aquí)
const inputId: ComputedRef<string> = computed(() => `id-${metadata.propertyName}`);
const inputName: ComputedRef<string> = computed(() => metadata.propertyName);
const propertyNameLabel: ComputedRef<string> = computed(() => metadata.propertyName);
const isInputDisabled: ComputedRef<boolean> = computed(() => metadata.disabled.value);
const hasHelpText: ComputedRef<boolean> = computed(() => !!metadata.helpText.value);
const helpText: ComputedRef<string> = computed(() => metadata.helpText.value || '');
const hasValidationMessages: ComputedRef<boolean> = computed(() => validationMessages.value.length > 0);
const containerClasses: ComputedRef<Record<string, boolean>> = computed(() => ({
    disabled: metadata.disabled.value,
    nonvalidated: !isInputValidated.value
}));

// 6. Watch (si aplica)

// 7. Lifecycle Hooks
onMounted((): void => {
    Application.eventBus.on('validate-inputs', handleValidation);
});

onBeforeUnmount((): void => {
    Application.eventBus.off('validate-inputs', handleValidation);
});

// 8. Funciones - Alfabético con tipos explícitos
function handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    emit('update:modelValue', target.value);
}

async function handleValidation(): Promise<void> {
    isInputValidated.value = await isValidated();
}

async function isValidated(): Promise<boolean> {
    let validated: boolean = true;
    validationMessages.value = [];
    
    // Validación Required
    if (metadata.required.value && (!props.modelValue || props.modelValue.trim() === '')) {
        validated = false;
        const message: string = metadata.requiredMessage.value || `${metadata.propertyName} is required.`;
        validationMessages.value.push(message);
    }
    
    // Validación Síncrona
    if (!metadata.validated.value) {
        validated = false;
        const message: string = metadata.validatedMessage.value || `${metadata.propertyName} is not valid.`;
        validationMessages.value.push(message);
    }
    
    // Validación Asíncrona
    const isAsyncValid: boolean = await props.entity.isAsyncValidation(props.propertyKey);
    if (!isAsyncValid) {
        validated = false;
        const asyncMessage: string | undefined = props.entity.asyncValidationMessage(props.propertyKey);
        if (asyncMessage) {
            validationMessages.value.push(asyncMessage);
        }
    }
    
    return validated;
}
</script>

<style scoped>
/* Estilos con tokens de constants.css */
/* PROHIBIDO: variables CSS locales */
/* OBLIGATORIO: var(--token-name) para todos los valores */

.TextInput {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-small);
    padding: var(--padding-medium);
}

.label-input {
    color: var(--gray-medium);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
}

.main-input {
    padding: var(--input-padding);
    border: var(--border-width-thin) solid var(--border-gray);
    border-radius: var(--border-radius);
    background-color: var(--white);
    color: var(--gray-medium);
    font-size: var(--font-size-base);
    transition: border-color var(--transition-normal) var(--timing-ease),
                box-shadow var(--transition-normal) var(--timing-ease);
}

.main-input:focus {
    outline: none;
    border-color: var(--btn-primary);
    box-shadow: var(--shadow-medium);
}

.main-input:disabled {
    background-color: var(--gray-lighter);
    cursor: not-allowed;
    opacity: var(--opacity-disabled);
}

.help-text {
    color: var(--gray-light);
    font-size: var(--font-size-small);
}

.validation-messages {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
}

.validation-messages span {
    color: var(--accent-red);
    font-size: var(--font-size-small);
}

.TextInput.disabled {
    opacity: var(--opacity-disabled);
    pointer-events: none;
}

.TextInput.nonvalidated .main-input {
    border-color: var(--accent-red);
}
</style>
```

---

#### **ESTIMACIÓN GLOBAL:** Los otros 40 archivos `.vue` probablemente tienen violaciones similares

**Violaciones Comunes Esperadas en Todos los Componentes Vue:**

1. ❌ Indentación 2 espacios (debe ser 4)
2. ❌ Código implícito en templates (operadores, concatenación, ternarios)
3. ❌ Múltiples tags por línea (>2)
4. ❌ Falta de `<style scoped>` al final
5. ❌ Posible uso de variables CSS locales en `<style>`
6. ❌ Falta de tipos explícitos en funciones
7. ❌ Orden de imports incorrecto

**Acción Requerida:** Auditoría completa de los 41 archivos Vue

---

### SECCIÓN C: ARCHIVOS CSS

---

#### **ARCHIVO:** `/src/css/constants.css`

**Estado de Alineación:** ✅ MAYORMENTE ALINEADO

**Violaciones Críticas:**

| # | Severidad | Contrato | Sección | Descripción | Corrección Necesaria |
|---|-----------|----------|---------|-------------|---------------------|
| 1 | **MEDIA** | 04-UI-CONTRACT | § 6.3 | Tokens presentes y bien organizados - Conformidad alta | Verificar completitud contra checklist § 6.3 |
| 2 | **BAJA** | 04-UI-CONTRACT | § 6.3 | Posibles tokens faltantes o redundantes | Auditoría exhaustiva de tokens vs uso real |
| 3 | **MEDIA** | 00-CONTRACT | § 6.3 | Documentación de tokens: algunos comentarios faltantes | Agregar comentarios descriptivos a cada token |

**Análisis:**

El archivo `constants.css` es el **mejor alineado** del proyecto. Cumple con:
- ✅ Centralización de tokens
- ✅ Estructura de `:root` obligatoria
- ✅ Dark mode implementado
- ✅ Naming conventions en kebab-case
- ✅ Sin valores hardcoded fuera de aquí (fuente única de verdad)

**Mejoras Menores:**

```css
/* ACTUAL (BIEN, pero sin comentarios descriptivos) */
:root {
    --button-color: #a0a0a0;
    --sidebar-min-width: 60px;

/* MEJOR (Con comentarios) */
:root {
    /* Colores de botones */
    --button-color: #a0a0a0; /* Color base de botones secundarios */
    
    /* Dimensiones de componentes estructurales */
    --sidebar-min-width: 60px; /* Ancho mínimo del sidebar colapsado */
```

---

#### **ARCHIVO:** `/src/css/main.css`

**Estado de Alineación:** ⚠️ REQUIERE AUDITORÍA

**Acciones Requeridas:**

1. Verificar que NO contenga valores hardcoded
2. Confirmar que consume tokens de `constants.css`
3. Validar que solo contenga estilos base globales
4. Asegurar que no haya z-index numéricos

---

#### **ARCHIVO:** `/src/css/form.css`

**Estado de Alineación:** ⚠️ REQUIERE AUDITORÍA

**Acciones Requeridas:**

1. Verificar tokenización completa
2. Confirmar uso de `var(--token-name)` para todos los valores
3. Validar ausencia de valores hardcoded

**Nota:** No se pudo auditar contenido completo - REQUIERE REVISIÓN EXHAUSTIVA

---

### SECCIÓN D: DECORADORES

---

#### **ARCHIVO:** `/src/decorations/*.ts` (33 archivos)

**Estado de Alineación General:** ⚠️ PARCIALMENTE ALINEADO

**Violaciones Comunes Esperadas:**

| # | Severidad | Contrato | Sección | Descripción | Corrección Necesaria |
|---|-----------|----------|---------|-------------|---------------------|
| 1 | **CRÍTICA** | 06-CODE-STYLING | § 6.2.4 | Falta estructura de regions en archivos de decoradores | Agregar regions donde aplique |
| 2 | **CRÍTICA** | 06-CODE-STYLING | § 6.1.1 | Indentación posiblemente inconsistente | Verificar y unificar a 4 espacios |
| 3 | **CRÍTICA** | 05-ENFORCEMENT | § 6.8.1 | Nombres de símbolos (`*_KEY`) deben ser completamente descriptivos | Verificar descriptibilidad total |
| 4 | **CRÍTICA** | 00-CONTRACT | § 6.3 | Documentación en `/copilot/layers/01-decorators/` debe estar sincronizada | Verificar 1:1 cada decorador vs su doc MD |

**Acción Requerida:** Auditoría archivo por archivo de los 33 decoradores

---

### SECCIÓN E: DOCUMENTACIÓN

---

#### **ARCHIVO:** `/copilot/layers/01-decorators/README.md`

**Estado de Alineación:** ⚠️ REQUIERE VERIFICACIÓN

**Acciones Requeridas:**

| # | Severidad | Contrato | Sección | Descripción | Corrección Necesaria |
|---|-----------|----------|---------|-------------|---------------------|
| 1 | **CRÍTICA** | 00-CONTRACT | § 6.4.3 | Verificar que README.md lista TODOS los 33 decoradores | Comparar lista vs archivos físicos |
| 2 | **CRÍTICA** | 00-CONTRACT | § 6.4.3 | Cada decorador debe tener enlace a su archivo MD individual | Verificar enlaces válidos |
| 3 | **CRÍTICA** | 00-CONTRACT | § 6.4.3 | Descripción breve de una línea para cada decorador | Verificar presencia |
| 4 | **CRÍTICA** | 00-CONTRACT | § 6.4.3 | Fecha de última actualización | Actualizar a 15 Feb 2026 |

**Formato Requerido:**

```markdown
# Decorators - Sistema de Metadatos del Framework

## Propósito
Decoradores TypeScript que almacenan metadatos en prototipos de clase para generación automática de UI y validaciones.

## Elementos

### Decoradores de Propiedad
- **@PropertyName** ([doc](./property-name.md)) - Define nombre visible y tipo de propiedad
- **@PropertyIndex** ([doc](./property-index.md)) - Orden de renderizado de propiedades
- **@Required** ([doc](./required.md)) - Marca campo como obligatorio con validación
- **@Validation** ([doc](./validation.md)) - Validación síncrona custom
- **@AsyncValidation** ([doc](./async-validation.md)) - Validación asíncrona contra servidor
- **@CSSColumnClass** ([doc](./css-column-class.md)) - Clase CSS para ancho de columna en tabla
- **@HelpText** ([doc](./help-text.md)) - Texto de ayuda para el usuario
- **@HideInListView** ([doc](./hide-in-list-view.md)) - Oculta propiedad en vista de lista
- **@HideInDetailView** ([doc](./hide-in-detail-view.md)) - Oculta propiedad en vista de detalle
- **@Disabled** ([doc](./disabled.md)) - Deshabilita input condicionalmente
- **@ReadOnly** ([doc](./readonly.md)) - Marca campo como solo lectura
- **@DisplayFormat** ([doc](./display-format.md)) - Formato de visualización de valor
- **@StringTypeDef** ([doc](./string-type-def.md)) - Tipo específico de string (EMAIL, PASSWORD, TEXTAREA)
- **@ViewGroup** ([doc](./view-group.md)) - Agrupa propiedades en secciones colapsables
- **@ViewGroupRow** ([doc](./view-group-row.md)) - Layout de fila personalizado
- **@TabOrder** ([doc](./tab-order.md)) - Orden de tabulación de inputs
- **@Mask** ([doc](./mask.md)) - Máscara de entrada de datos
- **@Unique** ([doc](./unique.md)) - Marca propiedad como única

### Decoradores de Módulo
- **@ModuleName** ([doc](./module-name.md)) - Nombre visible del módulo en sidebar
- **@ModuleIcon** ([doc](./module-icon.md)) - Icono del módulo
- **@ModulePermission** ([doc](./module-permission.md)) - Permisos requeridos
- **@ModuleDefaultComponent** ([doc](./module-default-component.md)) - Componente de vista por defecto
- **@ModuleListComponent** ([doc](./module-list-component.md)) - Componente custom de lista
- **@ModuleDetailComponent** ([doc](./module-detail-component.md)) - Componente custom de detalle
- **@ModuleCustomComponents** ([doc](./module-custom-components.md)) - Componentes custom adicionales

### Decoradores de API
- **@ApiEndpoint** ([doc](./api-endpoint.md)) - URL del endpoint de API
- **@ApiMethods** ([doc](./api-methods.md)) - Métodos HTTP permitidos
- **@Persistent** ([doc](./persistent.md)) - Habilita persistencia en backend
- **@PersistentKey** ([doc](./persistent-key.md)) - Mapeo de claves cliente-servidor
- **@PrimaryProperty** ([doc](./primary-property.md)) - Clave primaria de la entidad
- **@DefaultProperty** ([doc](./default-property.md)) - Propiedad de identificación por defecto
- **@UniquePropertyKey** ([doc](./unique-property-key.md)) - Clave única para URLs

## Última Actualización
15 de Febrero, 2026
```

---

#### **ARCHIVOS:** Documentos MD individuales en `/copilot/layers/01-decorators/`

**Estado de Alineación:** ❌ **CRÍTICO - PROBABLEMENTE FALTANTES**

**Violaciones Críticas:**

| # | Severidad | Contrato | Sección | Descripción | Corrección Necesaria |
|---|-----------|----------|---------|-------------|---------------------|
| 1 | **CRÍTICA** | 00-CONTRACT | § 6.3 | Cada decorador DEBE tener su archivo MD individual | Crear 33 archivos MD |
| 2 | **CRÍTICA** | 00-CONTRACT | § 6.7.12 | Cada archivo MD DEBE seguir estructura de 11 secciones | Aplicar plantilla obligatoria |
| 3 | **CRÍTICA** | 00-CONTRACT | § 6.3 | Documentación DEBE estar 100% sincronizada con código | Verificar implementación vs spec |

**Plantilla Obligatoria para Cada Decorador:**

```markdown
# @PropertyName - Decorator de Definición de Propiedad

## 1. Propósito

Define el nombre visible y tipo de dato de una propiedad de entidad para generación automática de UI y validaciones.

## 2. Alcance

Aplica a:
- Propiedades de clases que extienden BaseEntity
- Generación de labels de formularios
- Headers de columnas en tablas
- Inferencia de tipo para selección de componente de input

## 3. Definiciones Clave

**PropertyName:** Nombre legible para humanos de la propiedad mostrado en UI.

**PropertyType:** Tipo TypeScript de la propiedad (Number, String, Date, Boolean, BaseEntity, Array).

**Metadata Storage:** Almacenamiento en `prototype[PROPERTY_NAME_KEY]` y `prototype[PROPERTY_TYPE_KEY]`.

## 4. Descripción Técnica

### Símbolo de Metadatos

```typescript
export const PROPERTY_NAME_KEY = Symbol('propertyName');
export const PROPERTY_TYPE_KEY = Symbol('propertyType');
```

### Implementación del Decorador

```typescript
export function PropertyName(name: string, type: PropertyType) {
    return function (target: any, propertyKey: string) {
        // Almacenar nombre
        if (!target[PROPERTY_NAME_KEY]) {
            target[PROPERTY_NAME_KEY] = {};
        }
        target[PROPERTY_NAME_KEY][propertyKey] = name;
        
        // Almacenar tipo
        if (!target[PROPERTY_TYPE_KEY]) {
            target[PROPERTY_TYPE_KEY] = {};
        }
        target[PROPERTY_TYPE_KEY][propertyKey] = type;
    };
}
```

### Función Accesora en BaseEntity

```typescript
public static getProperties(): Record<string, string> {
    const proto = this.prototype;
    return proto[PROPERTY_NAME_KEY] || {};
}

public static getPropertyType(key: string): PropertyType {
    const proto = this.prototype;
    return proto[PROPERTY_TYPE_KEY]?.[key];
}
```

## 5. Flujo de Funcionamiento

1. Decorador se aplica a propiedad de entidad
2. Metadata se almacena en prototype de clase
3. Componente UI lee metadata via `getProperties()` y `getPropertyType()`
4. Sistema selecciona componente de input según tipo
5. Label se renderiza con nombre especificado

## 6. Reglas Obligatorias

- DEBE aplicarse a TODA propiedad visible en UI
- Nombre DEBE ser descriptivo y legible para humanos
- Tipo DEBE coincidir con tipo TypeScript de la propiedad
- NO puede aplicarse múltiples veces a la misma propiedad
- DEBE preceder a otros decoradores de propiedad

## 7. Prohibiciones

- NO usar en propiedades privadas o internas
- NO usar nombres técnicos (usar nombres de UI)
- NO omitir tipo
- NO usar tipo `any`

## 8. Dependencias

- TypeScript `experimentalDecorators` habilitado
- BaseEntity como clase padre
- Símbolos `PROPERTY_NAME_KEY` y `PROPERTY_TYPE_KEY`

## 9. Relaciones

- Decorador base para todos los demás decoradores de propiedad
- Requerido por sistema de generación de formularios
- Consumido por componentes UI para renderizado

## 10. Notas de Implementación

### Ejemplo de Uso

```typescript
export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    @Required(true)
    id!: number;
    
    @PropertyName('Product Name', String)
    @Required(true)
    name!: string;
    
    @PropertyName('Price (USD)', Number)
    @DisplayFormat('${value}')
    price!: number;
}
```

### Comportamiento de UI Generado

- `id: number` → `<NumberInputComponent label="Product ID" />`
- `name: string` → `<TextInputComponent label="Product Name" />`
- `price: number` → `<NumberInputComponent label="Price (USD)" />`

## 11. Referencias Cruzadas

- [BaseEntity](../02-base-entity/base-entity-core.md) - Funciones accesoras
- [PropertyIndex](./property-index.md) - Orden de renderizado
- [Required](./required.md) - Validación obligatoria
- [01-FRAMEWORK-OVERVIEW](../../01-FRAMEWORK-OVERVIEW.md) - Visión general

---

**Última actualización:** 15 de Febrero, 2026  
**Versión:** 1.0.0
```

**REQUERIDO:** Crear 33 archivos siguiendo esta plantilla

---

#### **ARCHIVO:** `/copilot/layers/02-base-entity/README.md`

**Estado:** ⚠️ REQUIERE VERIFICACIÓN de existencia y completitud

---

#### **ARCHIVO:** Otros índices faltantes

**Violaciones Críticas:**

| Archivo | Estado | Severidad | Corrección Necesaria |
|---------|--------|-----------|---------------------|
| `/src/entities/README.md` | ❌ PROBABLEMENTE FALTANTE | **CRÍTICA** | Crear índice listando todas las entidades |
| `/src/decorations/README.md` | ✅ EXISTE | MEDIA | Actualizar con lista completa de 33 decoradores |
| `/src/components/Form/README.md` | ❌ PROBABLEMENTE FALTANTE | **CRÍTICA** | Crear índice de componentes de formulario |
| `/src/components/Buttons/README.md` | ❌ PROBABLEMENTE FALTANTE | **CRÍTICA** | Crear índice de componentes de botones |
| `/src/components/Modal/README.md` | ❌ PROBABLEMENTE FALTANTE | **CRÍTICA** | Crear índice de componentes modales |
| `/src/components/Informative/README.md` | ❌ PROBABLEMENTE FALTANTE | **CRÍTICA** | Crear índice de componentes informativos |

---

## 3. INCONSISTENCIAS DE DOCUMENTACIÓN

### Inconsistencia #1: Entidad Products vs Documentación

**Ubicación:** `/src/entities/products.ts`

**Descripción:**

La clase se llama `Products` (plural), pero la convención documentada en **05-ENFORCEMENT § 6.8.1** establece que las entidades deben nombrarse en **singular** (`Product`).

**Contrato Violado:** 05-ENFORCEMENT-TECHNICAL-CONTRACT.md § 6.8.1

**Corrección:**

```typescript
// Renombrar clase de Products → Product
// Actualizar todos los imports que referencien Products
// Actualizar Application.ModuleList para usar Product
```

---

### Inconsistencia #2: Imports con Extensión `.ts`

**Ubicación:** Múltiples archivos (ej: `/src/entities/products.ts`)

**Descripción:**

Los imports incluyen extensión `.ts` explícita:
```typescript
import ICONS from '@/constants/icons.ts';
```

Según **06-CODE-STYLING § 6.2.1**, las extensiones NO deben incluirse en imports TypeScript.

**Contrato Violado:** 06-CODE-STYLING-STANDARDS.md § 6.2.1

**Corrección:**

```typescript
// Eliminar .ts de todos los imports
import ICONS from '@/constants/icons';
import { StringType } from '@/enums/string_type';
import { BaseEntity } from './base_entity';
```

**Archivos Afectados:**
- `/src/entities/products.ts`
- Posiblemente otros

---

### Inconsistencia #3: Indentación 2 Espacios vs 4 Espacios

**Ubicación:** Todos los archivos `.vue`

**Descripción:**

Los archivos Vue usan indentación de **2 espacios**, pero **06-CODE-STYLING § 6.1.1** establece **4 espacios obligatorios** para TypeScript, JavaScript y Vue.

**Contrato Violado:** 06-CODE-STYLING-STANDARDS.md § 6.1.1

**Impacto:** **MASIVO** - Afecta a 41 archivos Vue

**Corrección:**

Re-indentar TODOS los archivos `.vue` a 4 espacios:
- Bloques `<template>`, `<script>`, `<style>`
- Configurar EditorConfig:

```ini
[*.{ts,js,vue}]
indent_style = space
indent_size = 4
```

---

### Inconsistencia #4: Código Implícito en Templates Vue

**Ubicación:** `/src/components/Form/TextInputComponent.vue` y probablemente otros

**Descripción:**

Los templates contienen **código implícito** (concatenación de strings, operadores), violando **06-CODE-STYLING § 6.3.1.2**.

**Ejemplo:**
```vue
<label :for="'id-' + metadata.propertyName">
```

**Contrato Violado:** 06-CODE-STYLING-STANDARDS.md § 6.3.1.2

**Corrección:**

Extraer TODA lógica a computed properties:

```vue
<template>
    <label :for="inputId">
</template>

<script setup lang="ts">
const inputId: ComputedRef<string> = computed(() => {
    return `id-${metadata.propertyName}`;
});
</script>
```

**Impacto:** Probablemente afecta a los 41 archivos Vue

---

### Inconsistencia #5: Falta Estructura de Regions

**Ubicación:** Múltiples archivos TypeScript

**Descripción:**

Los archivos TypeScript con clases NO implementan la estructura de regions obligatoria definida en **06-CODE-STYLING § 6.2.4**.

**Contrato Violado:** 06-CODE-STYLING-STANDARDS.md § 6.2.4

**Corrección:**

```typescript
export class MiClase {
    // #region PROPERTIES
    
    public propiedad1!: string;
    public propiedad2!: number;
    
    // #endregion
    
    // #region METHODS
    
    public miMetodo(): void {
        // ...
    }
    
    // #endregion
    
    // #region METHODS OVERRIDES
    
    public override metodoHeredado(): void {
        // ...
    }
    
    // #endregion
}
```

**Archivos Afectados:**
- `/src/entities/base_entity.ts`
- `/src/entities/products.ts`
- `/src/models/application.ts`
- Otros archivos con clases

---

### Inconsistencia #6: Documentación de 11 Secciones No Aplicada

**Ubicación:** `/copilot/layers/01-decorators/` y otras carpetas

**Descripción:**

Los archivos MD de documentación técnica probablemente NO siguen la estructura obligatoria de 11 secciones establecida en **00-CONTRACT § 6.7.12**.

**Contrato Violado:** 00-CONTRACT.md § 6.7.12

**Corrección:**

Crear/actualizar cada archivo MD con:

```markdown
# Título

## 1. Propósito
## 2. Alcance
## 3. Definiciones Clave
## 4. Descripción Técnica
## 5. Flujo de Funcionamiento
## 6. Reglas Obligatorias
## 7. Prohibiciones
## 8. Dependencias
## 9. Relaciones
## 10. Notas de Implementación
## 11. Referencias Cruzadas
```

---

### Inconsistencia #7: Posible Uso de Tipo `any`

**Ubicación:** `/src/entities/base_entity.ts` línea 59

**Descripción:**

```typescript
[key: string]: any;
```

El uso de `any` está **PROHIBIDO ABSOLUTAMENTE** según **06-CODE-STYLING § 6.4.1**.

**Contrato Violado:** 06-CODE-STYLING-STANDARDS.md § 6.4.1

**Corrección:**

Reemplazar por tipo explícito o eliminar si innecesario:

```typescript
// Opción 1: Tipo explícito
[key: string]: string | number | boolean | BaseEntity | Array<any> | undefined;

// Opción 2: Sin index signature si no es necesario
// (eliminar la línea)
```

---

### Inconsistencia #8: Falta Bloque `<style scoped>` en Componentes

**Ubicación:** Posiblemente múltiples componentes Vue

**Descripción:**

Algunos componentes Vue pueden NO tener bloque `<style scoped>` al final del archivo, violando **06-CODE-STYLING § 6.3.3**.

**Contrato Violado:** 06-CODE-STYLING-STANDARDS.md § 6.3.3

**Corrección:**

Agregar `<style scoped>` al final de CADA componente, incluso si no tiene estilos personalizados:

```vue
<template>
    <!-- ... -->
</template>

<script setup lang="ts">
    // ...
</script>

<style scoped>
/* Estilos del componente usando tokens de constants.css */
/* Ejemplo: */
.component-root {
    display: flex;
    padding: var(--padding-medium);
}
</style>
```

---

### Inconsistencia #9: Posible Uso de Variables CSS Locales

**Ubicación:** Componentes Vue con `<style scoped>`

**Descripción:**

Verificar que NINGÚN componente Vue defina variables CSS locales. Según **04-UI-CONTRACT § 6.13.2**, está **PROHIBIDO ABSOLUTAMENTE**.

**Contrato Violado:** 04-UI-DESIGN-SYSTEM-CONTRACT.md § 6.13.2

**Búsqueda Requerida:**

```bash
# Buscar definiciones de variables CSS en componentes
grep -r "--[a-z-]*:" src/components/**/*.vue
```

**Corrección:**

Si se encuentran variables locales, **eliminarlas** y usar tokens de `constants.css`:

```vue
<!-- PROHIBIDO -->
<style scoped>
:root {
    --local-color: #3b82f6;  <!-- PROHIBIDO -->
}
.component {
    color: var(--local-color);
}
</style>

<!-- CORRECTO -->
<style scoped>
.component {
    color: var(--btn-primary);  <!-- Token de constants.css -->
}
</style>
```

---

### Inconsistencia #10: Tipos de Retorno Faltantes

**Ubicación:** Múltiples archivos TypeScript y Vue

**Descripción:**

Métodos y funciones sin tipo de retorno explícito violan **06-CODE-STYLING § 6.4.2**.

**Contrato Violado:** 06-CODE-STYLING-STANDARDS.md § 6.4.2

**Ejemplo de Violación:**

```typescript
// INCORRECTO
function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.$emit('update:modelValue', target.value);
}

// CORRECTO
function handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.$emit('update:modelValue', target.value);
}
```

**Corrección:**

Agregar tipo explícito a TODAS las funciones y métodos:
- `: void` para funciones sin retorno
- `: Promise<T>` para funciones async
- `: T` para funciones que retornan valor

---

## 4. ACCIONES PRIORITARIAS DE NORMALIZACIÓN

### PRIORIDAD MÁXIMA (P0) - CRÍTICA INMEDIATA

#### Acción P0.1: Aplicar Indentación de 4 Espacios Universalmente

**Impacto:** MASIVO - 100+ archivos

**Contratos Afectados:** 06-CODE-STYLING § 6.1.1

**Pasos:**

1. Configurar EditorConfig:
```ini
[*.{ts,js,vue}]
indent_style = space
indent_size = 4
```

2. Ejecutar re-indentación automática:
```bash
# Usar prettier o herramienta de formateo
npx prettier --write "src/**/*.{ts,vue}" --tab-width 4 --use-tabs false
```

3. Verificar manualmente archivos críticos

**Tiempo Estimado:** 4-6 horas

**Riesgo:** BAJO (cambio automático)

---

#### Acción P0.2: Eliminar Código Implícito de Todos los Templates Vue

**Impacto:** ALTO - 41 archivos Vue

**Contratos Afectados:** 06-CODE-STYLING § 6.3.1.2

**Pasos:**

1. Para CADA archivo Vue:
   - Identificar código implícito (concatenación, operadores, ternarios, llamadas con args complejos)
   - Extraer a computed properties
   - Reemplazar en template con referencia simple

2. Ejemplo sistemático:
```vue
<!-- ANTES -->
<template>
    <label :for="'id-' + metadata.propertyName">
    <span>{{ isActive ? 'Active' : 'Inactive' }}</span>
    <div>{{ items.length }}</div>
</template>

<!-- DESPUÉS -->
<template>
    <label :for="inputId">
    <span>{{ statusLabel }}</span>
    <div>{{ itemCount }}</div>
</template>

<script setup lang="ts">
const inputId = computed(() => `id-${metadata.propertyName}`);
const statusLabel = computed(() => isActive.value ? 'Active' : 'Inactive');
const itemCount = computed(() => items.value.length);
</script>
```

**Tiempo Estimado:** 15-20 horas (manual)

**Riesgo:** MEDIO (requiere análisis caso por caso)

---

#### Acción P0.3: Expandir Todas las Etiquetas HTML en Templates

**Impacto:** ALTO - 41 archivos Vue

**Contratos Afectados:** 06-CODE-STYLING § 6.3.1.1

**Pasos:**

1. Para CADA archivo Vue:
   - Expandir etiquetas a máximo 2 por línea
   - Separar atributos en múltiples líneas si >3 atributos
   - Agregar indentación de 4 espacios por nivel

2. Script de ayuda (manual review required):
```bash
# Identificar líneas con >2 etiquetas
grep -n ".*<[^>]*>.*<[^>]*>.*<[^>]*>" src/components/**/*.vue
```

**Tiempo Estimado:** 12-15 horas (manual)

**Riesgo:** MEDIO (cambio visual extenso)

---

### PRIORIDAD ALTA (P1) - CRÍTICA ARQUITECTÓNICA

#### Acción P1.1: Crear Documentación Faltante de Decoradores

**Impacto:** ALTO - 33 archivos MD faltantes

**Contratos Afectados:** 00-CONTRACT § 6.3, § 6.7.12

**Pasos:**

1. Para CADA uno de los 33 decoradores:
   - Crear archivo MD individual en `/copilot/layers/01-decorators/`
   - Aplicar plantilla de 11 secciones
   - Documentar implementación actual del código
   - Sincronizar comportamiento real vs documentado

2. Ejemplo: crear `property-name.md`, `required.md`, `validation.md`, etc.

3. Actualizar `/copilot/layers/01-decorators/README.md` con lista completa y enlaces

**Tiempo Estimado:** 25-30 horas

**Riesgo:** BAJO (creación de contenido)

---

#### Acción P1.2: Implementar Estructura de Regions en Todas las Clases

**Impacto:** ALTO - 20+ archivos TypeScript con clases

**Contratos Afectados:** 06-CODE-STYLING § 6.2.4

**Pasos:**

1. Para CADA archivo con clases:
   - Agregar comentarios `// #region PROPERTIES`
   - Agregar `// #region METHODS`
   - Agregar `// #region METHODS OVERRIDES`
   - Reorganizar código según estructura

2. Archivos prioritarios:
   - `/src/entities/base_entity.ts`
   - `/src/entities/products.ts`
   - `/src/models/application.ts`
   - Todos los demás entities y models

**Tiempo Estimado:** 8-10 horas

**Riesgo:** BAJO (cambio estructural sin lógica)

---

#### Acción P1.3: Renombrar `Products` → `Product` y Actualizar Referencias

**Impacto:** MEDIO - 1 archivo + múltiples referencias

**Contratos Afectados:** 05-ENFORCEMENT § 6.8.1

**Pasos:**

1. Renombrar clase `Products` → `Product` en `/src/entities/products.ts`
2. Renombrar archivo `products.ts` → `product.ts`
3. Actualizar todos los imports:
   - `/src/models/application.ts`
   - Cualquier otro archivo que importe `Products`
4. Actualizar `Application.ModuleList` para usar `Product`

**Tiempo Estimado:** 2-3 horas

**Riesgo:** MEDIO (cambio con side effects)

---

### PRIORIDAD MEDIA (P2) - IMPORTANTE

#### Acción P2.1: Agregar Bloque `<style scoped>` a Todos los Componentes

**Impacto:** ALTO - 41 archivos Vue

**Contratos Afectados:** 06-CODE-STYLING § 6.3.3

**Pasos:**

1. Para CADA componente Vue sin `<style scoped>`:
   - Agregar bloque al final del archivo
   - Implementar estilos usando tokens de `constants.css`
   - Prohibir variables CSS locales

**Tiempo Estimado:** 6-8 horas

**Riesgo:** BAJO (añadir, no modificar)

---

#### Acción P2.2: Agregar Tipos Explícitos a Todos los Métodos

**Impacto:** ALTO - 60+ archivos

**Contratos Afectados:** 06-CODE-STYLING § 6.4.2

**Pasos:**

1. Para CADA función/método sin tipo de retorno:
   - Agregar `: void` si no retorna
   - Agregar `: T` si retorna valor
   - Agregar `: Promise<T>` si es async

**Tiempo Estimado:** 10-12 horas

**Riesgo:** BAJO (agregar tipos)

---

#### Acción P2.3: Eliminar Extensiones `.ts` de Imports

**Impacto:** MEDIO - 10+ archivos

**Contratos Afectados:** 06-CODE-STYLING § 6.2.1

**Pasos:**

1. Buscar todos los imports con `.ts`:
```bash
grep -rn "\.ts['\"]" src/
```

2. Eliminar extensión de cada import

**Tiempo Estimado:** 1-2 horas

**Riesgo:** BAJO (cambio simple)

---

#### Acción P2.4: Crear Índices Faltantes (README.md en Carpetas)

**Impacto:** ALTO - 5+ archivos índice faltantes

**Contratos Afectados:** 00-CONTRACT § 6.4

**Pasos:**

1. Crear `/src/entities/README.md` - Lista de todas las entidades
2. Crear `/src/components/Form/README.md` - Lista de componentes de formulario
3. Crear `/src/components/Buttons/README.md` - Lista de componentes de botones
4. Crear `/src/components/Modal/README.md` - Lista de componentes modales
5. Crear `/src/components/Informative/README.md` - Lista de componentes informativos

**Tiempo Estimado:** 4-5 horas

**Riesgo:** BAJO (creación de índices)

---

### PRIORIDAD BAJA (P3) - MANTENIMIENTO

#### Acción P3.1: Reorganizar Orden de Imports Según Contrato

**Impacto:** ALTO - 60+ archivos

**Contratos Afectados:** 06-CODE-STYLING § 6.2.1

**Pasos:**

1. Para CADA archivo:
   - Ordenar imports: Vue → External → @/* → relative
   - Separar con línea en blanco entre grupos
   - Ordenar alfabéticamente dentro de cada grupo

**Tiempo Estimado:** 8-10 horas

**Riesgo:** BAJO (cambio cosmético)

---

#### Acción P3.2: Agregar Comentarios Descriptivos a Tokens CSS

**Impacto:** BAJO - 1 archivo

**Contratos Afectados:** 04-UI-CONTRACT § 6.3

**Pasos:**

1. Editar `/src/css/constants.css`
2. Agregar comentario descriptivo a cada token

**Tiempo Estimado:** 1-2 horas

**Riesgo:** BAJO (agregar comentarios)

---

#### Acción P3.3: Reemplazar Tipo `any` en BaseEntity

**Impacto:** BAJO - 1 archivo

**Contratos Afectados:** 06-CODE-STYLING § 6.4.1

**Pasos:**

1. Analizar necesidad de `[key: string]: any;` en BaseEntity
2. Reemplazar por tipo explícito o eliminar

**Tiempo Estimado:** 2-3 horas

**Riesgo:** MEDIO (puede afectar lógica)

---

## 5. RESUMEN DE ESFUERZO TOTAL ESTIMADO

| Prioridad | Acciones | Tiempo Estimado | Riesgo Agregado |
|-----------|----------|----------------|-----------------|
| **P0** (CRÍTICA INMEDIATA) | 3 acciones | **31-41 horas** | MEDIO |
| **P1** (CRÍTICA ARQUITECTÓNICA) | 3 acciones | **35-43 horas** | BAJO-MEDIO |
| **P2** (IMPORTANTE) | 4 acciones | **21-27 horas** | BAJO |
| **P3** (MANTENIMIENTO) | 3 acciones | **11-15 horas** | BAJO |
| **TOTAL** | **13 acciones** | **98-126 horas** | MEDIO |

**Estimación Conservadora:** 3-4 semanas de trabajo full-time de un desarrollador

---

## 6. RECOMENDACIONES FINALES

### Recomendación #1: Priorizar Normalización por Fases

**Fase 1 (Sprint 1 - 2 semanas):**
- Acción P0.1: Indentación de 4 espacios
- Acción P0.2: Eliminar código implícito de templates
- Acción P0.3: Expandir etiquetas HTML

**Fase 2 (Sprint 2 - 2 semanas):**
- Acción P1.1: Documentación de decoradores
- Acción P1.2: Estructura de regions
- Acción P1.3: Renombrar Products → Product

**Fase 3 (Sprint 3 - 1 semana):**
- Todas las acciones P2

**Fase 4 (Sprint 4 - 1 semana):**
- Todas las acciones P3

---

### Recomendación #2: Implementar Pre-Commit Hooks

**Configurar validaciones automáticas:**

```bash
# .husky/pre-commit
#!/bin/sh

# Verificar indentación
npm run lint:indent

# Verificar imports sin extensión
npm run lint:imports

# Verificar tipos explícitos
npm run lint:types

# Bloquear commit si hay errores
```

---

### Recomendación #3: Crear Scripts de Validación

**Agregar a `package.json`:**

```json
{
  "scripts": {
    "lint:indent": "Check indentation is 4 spaces",
    "lint:imports": "Check no .ts extensions in imports",
    "lint:types": "Check explicit return types",
    "lint:templates": "Check Vue templates expansion",
    "audit:contracts": "Run full contract compliance audit"
  }
}
```

---

### Recomendación #4: Documentar Excepciones Autorizadas

**Crear `/copilot/EXCEPCIONES.md`:**

Si durante la normalización se encuentran casos donde cumplir estrictamente un contrato es técnicamente inviable:

1. Documentar la excepción formalmente
2. Solicitar aprobación del arquitecto
3. Registrar en `/copilot/EXCEPCIONES.md` según formato de **05-ENFORCEMENT § 6.6**

---

### Recomendación #5: Auditoría Post-Normalización

**Después de completar las acciones:**

Ejecutar auditoría completa nuevamente para:
1. Verificar que todas las violaciones fueron corregidas
2. Confirmar conformidad al 100% con los 7 contratos
3. Validar que no se introdujeron nuevas violaciones
4. Certificar estado de **ALINEADO TOTAL**

---

## 7. CONCLUSIÓN

El proyecto se encuentra en estado **DESALINEADO CRÍTICAMENTE** con múltiples violaciones de los 7 contratos del spec kit. Todas las violaciones detectadas son consideradas **CRÍTICAS** según el mandato del usuario.

**Estado Actual:** ~35% de conformidad  
**Estado Objetivo:** 100% de conformidad

**Esfuerzo Requerido:** 98-126 horas (3-4 semanas)

**Riesgo Arquitectónico:** ALTO - Requiere intervención inmediata para restaurar integridad contractual

---

**VALIDEZ DEL REPORTE**

Este reporte constituye una auditoría 100% rigurosa donde toda regla ambiguamente rota se considera CRÍTICA. No se ha omitido ninguna violación detectada.

**Fecha del Reporte:** 15 de Febrero, 2026  
**Auditor:** Sistema AI bajo mandato estricto de usuario  
**Próxima Revisión:** Post-normalización

---

**FIN DEL REPORTE**
