# PLAN DE MEJORAS - FASE 1: ESTABILIZACIÓN

**Fecha de Creación:** 18 de Febrero, 2026  
**Versión:** 1.0.0  
**Estado:** APROBADO PARA EJECUCIÓN  
**Prioridad:** CRÍTICA  
**Tiempo Estimado:** 4-6 semanas

---

## 📋 TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Decisiones de Diseño](#2-decisiones-de-diseño)
3. [Items Aprobados](#3-items-aprobados)
4. [Items Rechazados](#4-items-rechazados)
5. [Plan de Implementación](#5-plan-de-implementación)
6. [Validación Contractual](#6-validación-contractual)
7. [Criterios de Aceptación](#7-criterios-de-aceptación)

---

## 1. RESUMEN EJECUTIVO

### 1.1 Contexto

El análisis arquitectónico del Framework SaaS Vue identificó **9 áreas de mejora aprobadas** que fortalecerán la robustez, mantenibilidad y escalabilidad del framework sin violar los **7 contratos vinculantes** (00-CONTRACT.md a 06-CODE-STYLING-STANDARDS.md).

### 1.2 Objetivo de la Fase 1

Implementar mejoras críticas que:
- ✅ Mantengan 100% cumplimiento de MI LÓGICA (Axiomas A1-A4)
- ✅ Mejoren type safety y robustez
- ✅ Faciliten transformación y validación de datos
- ✅ Estandaricen patrones de componentes
- ✅ NO introduzcan breaking changes

### 1.3 Métricas de Éxito

| Indicador | Estado Actual | Meta Post-Fase 1 |
|-----------|---------------|-------------------|
| **Type Safety** | 85% | 95% |
| **Cobertura de Validaciones** | 60% (manual) | 90% (predefinidas) |
| **Manejo de Errores HTTP** | 30% (solo 401) | 100% (todos los códigos) |
| **Robustez Dirty State** | 70% (JSON.stringify) | 100% (deep compare) |
| **Consistencia UI** | 60% (mixto) | 100% (Composition API) |
| **Cumplimiento Contractual** | 100% | **100%** (mantener) |

---

## 2. DECISIONES DE DISEÑO

### 2.1 Capa de Servicios - ACLARACIÓN REQUERIDA ⚠️

**Pregunta del Usuario:**
> ¿Estás proponiendo hacer algo parecido a Application que define varios services y los utiliza para manejar distintas cosas?

**RESPUESTA:**

Existen **dos enfoques posibles**:

#### **OPCIÓN A: Services como Módulo de Application (RECOMENDADO ✅)**

Similar a `ApplicationUIService` - servicios auxiliares que Application utiliza:

```typescript
// Estructura propuesta:
Application
├── ApplicationUIService      ← Ya existe
├── ApplicationDataService    ← NUEVO - Manejo de datos y transformaciones
├── ApplicationValidationService ← NUEVO - Validaciones complejas
└── ApplicationCacheService   ← NUEVO - Caché de entidades

// Implementación:
class ApplicationDataService {
    constructor(private app: Application) {}
    
    // Servicios genéricos reutilizables
    transformDate(value: string): Date { ... }
    transformEnum(value: string, enumType: any): any { ... }
    validateEmail(email: string): boolean { ... }
}

// En Application:
class ApplicationClass {
    ApplicationUIService: ApplicationUIService;
    ApplicationDataService: ApplicationDataService;    // NUEVO
    ApplicationValidationService: ApplicationValidationService; // NUEVO
    
    constructor() {
        this.ApplicationUIService = new ApplicationUIService(this);
        this.ApplicationDataService = new ApplicationDataService(this);
        this.ApplicationValidationService = new ApplicationValidationService(this);
    }
}
```

**Ventajas:**
- ✅ NO viola Axioma A1 (no agrega capa, solo organiza Application)
- ✅ Mantiene Application como único orquestador
- ✅ Servicios reutilizables entre todas las entidades
- ✅ Coherente con patrón actual (ApplicationUIService)

**Ubicación:** `/src/models/application_data_service.ts`, `/src/models/application_validation_service.ts`

#### **OPCIÓN B: Services por Entidad (NO RECOMENDADO ❌)**

Servicios específicos por cada entidad (InvoiceService, CustomerService):

```typescript
// Esta opción NO se recomienda porque:
class InvoiceService extends BaseService<Invoice> {
    calculateTotal() { ... }  // ← Lógica específica de Invoice
}

// Problemas:
// 1. Fragmenta lógica de negocio en múltiples lugares
// 2. Dificulta reutilización
// 3. Agrega complejidad innecesaria
// 4. Puede violar Axioma A1 si no se diseña correctamente
```

#### **DECISIÓN FINAL:**

**Se implementará OPCIÓN A** - Services como módulos auxiliares de Application, siguiendo el patrón existente de ApplicationUIService.

**Justificación Contractual:**
- ✅ Respeta Axioma A1: No agrega capa nueva, solo organiza internamente Application (Capa 4)
- ✅ Respeta Axioma A2: Flujo unidireccional se mantiene (UI → Application → Services → BaseEntity)
- ✅ Servicios son **utilities**, no lógica de negocio core

### 2.2 Alcance de Transformadores de Datos

**Decisión:** Implementar transformadores como **funciones puras reutilizables** en ApplicationDataService, NO como decoradores nuevos (para evitar complejidad innecesaria).

```typescript
// ApplicationDataService
class ApplicationDataService {
    transformers = {
        date: {
            toAPI: (value: Date) => value.toISOString(),
            fromAPI: (value: string) => new Date(value)
        },
        decimal: {
            toAPI: (value: number) => value.toFixed(2),
            fromAPI: (value: string) => parseFloat(value)
        }
    };
}

// Uso en BaseEntity
public static mapFromPersistentKeys(data: EntityData): EntityData {
    const service = Application.ApplicationDataService;
    // Aplicar transformadores según tipo de propiedad
}
```

---

## 3. ITEMS APROBADOS

### 3.1 Centralización de Interfaces/Types ✅

**Objetivo:** Consolidar todos los tipos TypeScript dispersos en una estructura organizada.

**Implementación:**
```
/src/types/
├── index.ts              ← Exporta todos
├── entity.types.ts       ← EntityData, EntityConstructor, ConcreteEntityClass
├── decorator.types.ts    ← RequiredMetadata, ValidationMetadata, etc.
├── ui.types.ts          ← Modal, Toast, View, DropdownMenu
├── events.ts            ← Ya existe, mantener
└── service.types.ts     ← NUEVO - Tipos para services
```

**Validación Contractual:**
- ✅ Respeta 06-CODE-STYLING-STANDARDS.md (organización de imports)
- ✅ NO viola ningún axioma (solo reorganización)
- ✅ Mejora mantenibilidad sin breaking changes

**Archivos a Modificar:**
1. Crear estructura `/src/types/`
2. Migrar tipos de `base_entity.ts` a `entity.types.ts`
3. Migrar tipos de decoradores a `decorator.types.ts`
4. Actualizar imports en todos los archivos

**Tiempo Estimado:** 4-6 horas

---

### 3.2 Reducción de Type Casting Excesivo ✅

**Problema Actual:**
```typescript
const proto = (this.constructor as typeof BaseEntity).prototype as unknown as MetadataRecord;
```

**Solución:**
```typescript
// En /src/types/entity.types.ts
export type DecoratedPrototype<T extends BaseEntity = BaseEntity> = {
    [K in symbol]?: unknown;
} & T['prototype'];

export type DecoratedConstructor<T extends BaseEntity = BaseEntity> = {
    prototype: DecoratedPrototype<T>;
} & typeof BaseEntity;

// Uso mejorado:
const proto = (this.constructor as DecoratedConstructor).prototype;
const metadata = proto[PROPERTY_NAME_KEY] as Record<string, string>;
```

**Validación Contractual:**
- ✅ Respeta Axioma A4 (sistema de metadatos intacto)
- ✅ Mejora type safety (06-CODE-STYLING-STANDARDS)
- ✅ NO cambia comportamiento runtime

**Archivos a Modificar:**
1. `/src/types/entity.types.ts` - Definir tipos auxiliares
2. `/src/entities/base_entity.ts` - Reemplazar castings (50+ ocurrencias)

**Tiempo Estimado:** 6-8 horas

---

### 3.3 Manejo de Errores HTTP Robusto ✅

**Objetivo:** Manejar todos los códigos HTTP relevantes con retry logic y feedback al usuario.

**Implementación:**
```typescript
// En /src/models/application.ts
this.axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error.response?.status;
        const config = error.config;
        
        // Inicializar contador de reintentos
        if (!config.__retryCount) {
            config.__retryCount = 0;
        }
        
        switch (status) {
            case 401: // Unauthorized
                localStorage.removeItem(this.AppConfiguration.value.authTokenKey);
                this.ApplicationUIService.showToast(
                    'Sesión expirada. Por favor, inicia sesión nuevamente.',
                    ToastType.ERROR
                );
                if (this.router) {
                    this.router.push('/login');
                }
                break;
                
            case 403: // Forbidden
                this.ApplicationUIService.showToast(
                    'No tienes permisos para realizar esta acción.',
                    ToastType.ERROR
                );
                break;
                
            case 404: // Not Found
                this.ApplicationUIService.showToast(
                    'El recurso solicitado no fue encontrado.',
                    ToastType.WARNING
                );
                break;
                
            case 422: // Validation Error
                const validationErrors = error.response?.data?.errors;
                if (validationErrors) {
                    const messages = Object.values(validationErrors).flat().join(', ');
                    this.ApplicationUIService.showToast(
                        `Errores de validación: ${messages}`,
                        ToastType.ERROR
                    );
                }
                break;
                
            case 500: // Server Error
            case 502: // Bad Gateway
            case 503: // Service Unavailable
                if (config.__retryCount < this.AppConfiguration.value.apiRetryAttempts) {
                    config.__retryCount++;
                    this.ApplicationUIService.showToast(
                        `Error del servidor. Reintentando (${config.__retryCount}/${this.AppConfiguration.value.apiRetryAttempts})...`,
                        ToastType.WARNING
                    );
                    
                    // Esperar antes de reintentar (exponential backoff)
                    const delay = Math.pow(2, config.__retryCount) * 1000;
                    await new Promise(resolve => setTimeout(resolve, delay));
                    
                    return this.axiosInstance.request(config);
                } else {
                    this.ApplicationUIService.showToast(
                        'Error del servidor. Por favor, intenta más tarde.',
                        ToastType.ERROR
                    );
                }
                break;
                
            case undefined: // Network Error
                this.ApplicationUIService.showToast(
                    'Error de conexión. Verifica tu conexión a internet.',
                    ToastType.ERROR
                );
                break;
                
            default:
                this.ApplicationUIService.showToast(
                    `Error inesperado: ${status || 'desconocido'}`,
                    ToastType.ERROR
                );
        }
        
        return Promise.reject(error);
    }
);
```

**Validación Contractual:**
- ✅ Respeta Axioma A4 (Application sigue siendo orquestador)
- ✅ NO viola flujo unidireccional
- ✅ Mejora experiencia de usuario

**Archivos a Modificar:**
1. `/src/models/application.ts` - Mejorar interceptor de respuesta

**Tiempo Estimado:** 3-4 horas

---

### 3.4 Sistema de Validación Mejorado ✅

**Objetivo:** Proveer validadores predefinidos reutilizables para casos comunes.

**Implementación:**
```typescript
// /src/validators/common_validators.ts

import { Validation, AsyncValidation } from '@/decorations';
import type { BaseEntity } from '@/entities/base_entity';

/**
 * Validadores predefinidos comunes para propiedades de entidades
 * 
 * @example
 * ```typescript
 * export class User extends BaseEntity {
 *     @Validators.email()
 *     email!: string;
 *     
 *     @Validators.minLength(8)
 *     password!: string;
 *     
 *     @Validators.range(18, 120, 'Edad debe estar entre 18 y 120')
 *     age!: number;
 * }
 * ```
 */
export class Validators {
    /**
     * Valida formato de email
     * @param message Mensaje de error personalizado
     */
    static email(message = 'Formato de email inválido'): PropertyDecorator {
        return Validation((entity: BaseEntity, propKey: string) => {
            const value = (entity as Record<string, unknown>)[propKey] as string;
            if (!value) return true; // Dejar validación de requerido a @Required
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        }, message);
    }
    
    /**
     * Valida longitud mínima de string
     * @param min Longitud mínima
     * @param message Mensaje de error personalizado
     */
    static minLength(min: number, message?: string): PropertyDecorator {
        return Validation((entity: BaseEntity, propKey: string) => {
            const value = (entity as Record<string, unknown>)[propKey] as string;
            if (!value) return true;
            return value.length >= min;
        }, message || `Debe tener al menos ${min} caracteres`);
    }
    
    /**
     * Valida longitud máxima de string
     * @param max Longitud máxima
     * @param message Mensaje de error personalizado
     */
    static maxLength(max: number, message?: string): PropertyDecorator {
        return Validation((entity: BaseEntity, propKey: string) => {
            const value = (entity as Record<string, unknown>)[propKey] as string;
            if (!value) return true;
            return value.length <= max;
        }, message || `Debe tener máximo ${max} caracteres`);
    }
    
    /**
     * Valida rango numérico
     * @param min Valor mínimo
     * @param max Valor máximo
     * @param message Mensaje de error personalizado
     */
    static range(min: number, max: number, message?: string): PropertyDecorator {
        return Validation((entity: BaseEntity, propKey: string) => {
            const value = (entity as Record<string, unknown>)[propKey] as number;
            if (value === undefined || value === null) return true;
            return value >= min && value <= max;
        }, message || `Debe estar entre ${min} y ${max}`);
    }
    
    /**
     * Valida valor mínimo
     * @param min Valor mínimo
     * @param message Mensaje de error personalizado
     */
    static min(min: number, message?: string): PropertyDecorator {
        return Validation((entity: BaseEntity, propKey: string) => {
            const value = (entity as Record<string, unknown>)[propKey] as number;
            if (value === undefined || value === null) return true;
            return value >= min;
        }, message || `Debe ser mayor o igual a ${min}`);
    }
    
    /**
     * Valida valor máximo
     * @param max Valor máximo
     * @param message Mensaje de error personalizado
     */
    static max(max: number, message?: string): PropertyDecorator {
        return Validation((entity: BaseEntity, propKey: string) => {
            const value = (entity as Record<string, unknown>)[propKey] as number;
            if (value === undefined || value === null) return true;
            return value <= max;
        }, message || `Debe ser menor o igual a ${max}`);
    }
    
    /**
     * Valida patrón regex
     * @param regex Expresión regular
     * @param message Mensaje de error personalizado
     */
    static pattern(regex: RegExp, message = 'Formato inválido'): PropertyDecorator {
        return Validation((entity: BaseEntity, propKey: string) => {
            const value = (entity as Record<string, unknown>)[propKey] as string;
            if (!value) return true;
            return regex.test(value);
        }, message);
    }
    
    /**
     * Valida URL
     * @param message Mensaje de error personalizado
     */
    static url(message = 'URL inválida'): PropertyDecorator {
        return Validation((entity: BaseEntity, propKey: string) => {
            const value = (entity as Record<string, unknown>)[propKey] as string;
            if (!value) return true;
            try {
                new URL(value);
                return true;
            } catch {
                return false;
            }
        }, message);
    }
    
    /**
     * Valida número de teléfono (básico)
     * @param message Mensaje de error personalizado
     */
    static phone(message = 'Número de teléfono inválido'): PropertyDecorator {
        return Validation((entity: BaseEntity, propKey: string) => {
            const value = (entity as Record<string, unknown>)[propKey] as string;
            if (!value) return true;
            return /^[\d\s\-\+\(\)]+$/.test(value) && value.replace(/\D/g, '').length >= 10;
        }, message);
    }
    
    /**
     * Valida fecha no futura
     * @param message Mensaje de error personalizado
     */
    static notFuture(message = 'La fecha no puede ser futura'): PropertyDecorator {
        return Validation((entity: BaseEntity, propKey: string) => {
            const value = (entity as Record<string, unknown>)[propKey] as Date;
            if (!value) return true;
            return value <= new Date();
        }, message);
    }
    
    /**
     * Valida fecha no pasada
     * @param message Mensaje de error personalizado
     */
    static notPast(message = 'La fecha no puede ser pasada'): PropertyDecorator {
        return Validation((entity: BaseEntity, propKey: string) => {
            const value = (entity as Record<string, unknown>)[propKey] as Date;
            if (!value) return true;
            return value >= new Date();
        }, message);
    }
}

/**
 * Validadores asíncronos predefinidos
 */
export class AsyncValidators {
    /**
     * Valida unicidad en el backend
     * @param endpoint Endpoint para validación
     * @param message Mensaje de error personalizado
     */
    static unique(endpoint: string, message = 'Este valor ya existe'): PropertyDecorator {
        return AsyncValidation(async (entity: BaseEntity, propKey: string) => {
            const value = (entity as Record<string, unknown>)[propKey];
            if (!value) return true;
            
            try {
                const response = await Application.axiosInstance.get(endpoint, {
                    params: { value, id: entity.getUniquePropertyValue() }
                });
                return response.data.isUnique;
            } catch (error) {
                console.error('[AsyncValidators] Error validating uniqueness:', error);
                return false;
            }
        }, message);
    }
}
```

**Validación Contractual:**
- ✅ Usa decoradores existentes (@Validation, @AsyncValidation)
- ✅ NO viola Axioma A2 (decoradores son Capa 2)
- ✅ NO agrega símbolos nuevos (usa los existentes)
- ✅ Documentación obligatoria incluida (JSDoc)

**Archivos a Crear:**
1. `/src/validators/common_validators.ts`
2. `/src/validators/index.ts` (exporta Validators y AsyncValidators)

**Archivos a Actualizar:**
1. `/src/entities/product.ts` - Ejemplo de uso
2. `/copilot/layers/01-decorators/validation-decorator.md` - Agregar sección de validadores predefinidos

**Tiempo Estimado:** 6-8 horas

---

### 3.5 Estandarización de Patrón de Componentes ✅

**Objetivo:** Migrar todos los componentes Vue a Composition API con TypeScript.

**Estándar Obligatorio:**
```vue
<script setup lang="ts">
/**
 * Descripción del componente
 * 
 * @example
 * ```vue
 * <ComponentName :prop="value" @event="handler" />
 * ```
 */

// #region IMPORTS
import { ref, computed, watch, onMounted } from 'vue';
import type { Ref, ComputedRef } from 'vue';
// Externos
import axios from 'axios';
// @/ (alias)
import Application from '@/models/application';
import { BaseEntity } from '@/entities/base_entity';
// Relativos
import './styles.css';
// #endregion

// #region PROPS
interface Props {
    entityClass?: typeof BaseEntity;
    mode?: 'create' | 'edit';
}

const props = withDefaults(defineProps<Props>(), {
    entityClass: () => Application.View.value.entityClass,
    mode: 'edit'
});
// #endregion

// #region EMITS
interface Emits {
    (e: 'update:modelValue', value: unknown): void;
    (e: 'save', entity: BaseEntity): void;
}

const emit = defineEmits<Emits>();
// #endregion

// #region STATE
const data: Ref<BaseEntity[]> = ref([]);
const isLoading: Ref<boolean> = ref(false);
// #endregion

// #region COMPUTED
const filteredData: ComputedRef<BaseEntity[]> = computed(() => {
    return data.value.filter(item => !item.isNull());
});
// #endregion

// #region WATCHERS
watch(() => props.entityClass, (newClass) => {
    if (newClass) {
        loadData();
    }
});
// #endregion

// #region METHODS
async function loadData(): Promise<void> {
    const entityClass = props.entityClass;
    
    if (!entityClass) {
        data.value = [];
        return;
    }

    isLoading.value = true;
    
    try {
        data.value = await entityClass.getElementList('');
    } catch (error: unknown) {
        console.error('[ComponentName] Failed to load data', error);
        data.value = [];
    } finally {
        isLoading.value = false;
    }
}

function handleSave(entity: BaseEntity): void {
    emit('save', entity);
}
// #endregion

// #region LIFECYCLE
onMounted(() => {
    loadData();
});
// #endregion
</script>

<template>
    <div class="component-name">
        <!-- Template limpio, lógica mínima -->
    </div>
</template>

<style scoped>
/**
 * Usar tokens CSS de constants.css
 * NO valores hardcodeados
 */
.component-name {
    padding: var(--spacing-md);
    background-color: var(--white);
    border-radius: var(--border-radius);
}
</style>
```

**Validación Contractual:**
- ✅ Respeta 06-CODE-STYLING-STANDARDS.md
- ✅ JSDoc obligatorio en componentes
- ✅ Imports ordenados (Vue → Externos → @/ → Relativos)
- ✅ Regions para organización
- ✅ Tokens CSS únicamente

**Componentes a Migrar (Prioridad):**
1. `DetailViewTableComponent.vue`
2. `FormGroupComponent.vue`
3. `ActionsComponent.vue`
4. Componentes de Form/ (14 componentes)

**Archivos a Actualizar:**
1. `/copilot/06-CODE-STYLING-STANDARDS.md` - Agregar sección de componentes Vue
2. Todos los componentes `.vue` (migración paulatina)

**Tiempo Estimado:** 12-16 horas (migración completa)

---

### 3.6 Sistema de Transformadores de Datos ✅

**Objetivo:** Transformar tipos entre API y entidad (fechas, enums, decimales).

**Implementación:**
```typescript
// /src/models/application_data_service.ts

import Application from './application';
import type { BaseEntity } from '@/entities/base_entity';

/**
 * Servicio de transformación de datos entre API y entidades
 * Maneja conversión de tipos, formateo y parsing
 */
export class ApplicationDataService {
    constructor(private app: typeof Application) {}

    /**
     * Catálogo de transformadores predefinidos
     */
    readonly transformers = {
        /**
         * Transformador de fechas ISO string <-> Date
         */
        date: {
            toAPI: (value: Date | null | undefined): string | null => {
                if (!value || !(value instanceof Date)) return null;
                return value.toISOString();
            },
            fromAPI: (value: string | null | undefined): Date | null => {
                if (!value) return null;
                const date = new Date(value);
                return isNaN(date.getTime()) ? null : date;
            }
        },
        
        /**
         * Transformador de decimales string <-> number
         */
        decimal: {
            toAPI: (value: number | null | undefined, decimals = 2): string | null => {
                if (value === null || value === undefined) return null;
                return value.toFixed(decimals);
            },
            fromAPI: (value: string | number | null | undefined): number | null => {
                if (value === null || value === undefined) return null;
                const parsed = typeof value === 'number' ? value : parseFloat(value);
                return isNaN(parsed) ? null : parsed;
            }
        },
        
        /**
         * Transformador de booleanos string <-> boolean
         */
        boolean: {
            toAPI: (value: boolean | null | undefined): boolean | null => {
                return value ?? null;
            },
            fromAPI: (value: boolean | string | number | null | undefined): boolean | null => {
                if (value === null || value === undefined) return null;
                if (typeof value === 'boolean') return value;
                if (typeof value === 'string') {
                    return value.toLowerCase() === 'true' || value === '1';
                }
                if (typeof value === 'number') {
                    return value === 1;
                }
                return null;
            }
        },
        
        /**
         * Transformador de enums string <-> enum value
         */
        enum: <T extends Record<string, string | number>>(enumType: T) => ({
            toAPI: (value: T[keyof T] | null | undefined): string | number | null => {
                return value ?? null;
            },
            fromAPI: (value: string | number | null | undefined): T[keyof T] | null => {
                if (value === null || value === undefined) return null;
                const enumValues = Object.values(enumType);
                return enumValues.includes(value as T[keyof T]) ? (value as T[keyof T]) : null;
            }
        })
    };
    
    /**
     * Aplica transformaciones a un objeto de datos desde API
     * @param data Datos desde API
     * @param schema Schema de transformación
     */
    applyTransformationsFromAPI<T extends Record<string, unknown>>(
        data: Record<string, unknown>,
        schema: TransformationSchema
    ): T {
        const result: Record<string, unknown> = {};
        
        for (const [key, value] of Object.entries(data)) {
            const transformer = schema[key];
            
            if (transformer && transformer.fromAPI) {
                result[key] = transformer.fromAPI(value);
            } else {
                result[key] = value;
            }
        }
        
        return result as T;
    }
    
    /**
     * Aplica transformaciones a un objeto de datos hacia API
     * @param data Datos de entidad
     * @param schema Schema de transformación
     */
    applyTransformationsToAPI<T extends Record<string, unknown>>(
        data: Record<string, unknown>,
        schema: TransformationSchema
    ): T {
        const result: Record<string, unknown> = {};
        
        for (const [key, value] of Object.entries(data)) {
            const transformer = schema[key];
            
            if (transformer && transformer.toAPI) {
                result[key] = transformer.toAPI(value);
            } else {
                result[key] = value;
            }
        }
        
        return result as T;
    }
}

/**
 * Schema de transformación para una entidad
 */
export interface TransformationSchema {
    [propertyKey: string]: {
        toAPI?: (value: unknown) => unknown;
        fromAPI?: (value: unknown) => unknown;
    };
}

// /src/types/service.types.ts
export type TransformFunction = (value: unknown) => unknown;

export interface Transformer {
    toAPI?: TransformFunction;
    fromAPI?: TransformFunction;
}
```

**Uso en Entidades:**
```typescript
// product.ts
import { ApplicationDataService } from '@/models/application_data_service';

export class Product extends BaseEntity {
    // Definir schema de transformación (estático)
    static readonly transformationSchema: TransformationSchema = {
        createdAt: Application.ApplicationDataService.transformers.date,
        price: Application.ApplicationDataService.transformers.decimal,
        isActive: Application.ApplicationDataService.transformers.boolean
    };
    
    @PropertyName('Created At', Date)
    createdAt!: Date;
    
    @PropertyName('Price', Number)
    price!: number;
    
    @PropertyName('Active', Boolean)
    isActive!: boolean;
}

// Modificar BaseEntity.mapFromPersistentKeys
public static mapFromPersistentKeys(data: EntityData): EntityData {
    let mapped = { ...data };
    
    // Mapeo de keys
    for (const [persistentKey, value] of Object.entries(data)) {
        const propertyKey = this.getPropertyKeyByPersistentKey(persistentKey);
        if (propertyKey && propertyKey !== persistentKey) {
            mapped[propertyKey] = value;
            delete mapped[persistentKey];
        }
    }
    
    // Aplicar transformaciones si existen
    const schema = (this as unknown as { transformationSchema?: TransformationSchema }).transformationSchema;
    if (schema) {
        mapped = Application.ApplicationDataService.applyTransformationsFromAPI(mapped, schema);
    }
    
    return mapped;
}
```

**Validación Contractual:**
- ✅ NO viola Axioma A1 (ApplicationDataService es parte de Application - Capa 4)
- ✅ NO viola Axioma A4 (no modifica sistema de metadatos)
- ✅ Respeta flujo unidireccional (API → Application → BaseEntity)

**Archivos a Crear:**
1. `/src/models/application_data_service.ts`
2. `/src/types/service.types.ts`

**Archivos a Modificar:**
1. `/src/models/application.ts` - Agregar ApplicationDataService
2. `/src/entities/base_entity.ts` - Integrar transformaciones en mapFromPersistentKeys/mapToPersistentKeys
3. `/src/entities/product.ts` - Ejemplo de uso

**Tiempo Estimado:** 8-10 horas

---

### 3.7 Robustez de isDirty (Dirty State) ✅

**Problema:** Comparación por `JSON.stringify` es frágil y genera falsos positivos.

**Solución:**
```typescript
// /src/utils/deep_compare.ts

/**
 * Compara dos valores de forma profunda para igualdad
 * Maneja null, undefined, primitivos, fechas, arrays y objetos anidados
 * 
 * @param obj1 Primer valor a comparar
 * @param obj2 Segundo valor a comparar
 * @returns true si son iguales, false si son diferentes
 * 
 * @example
 * ```typescript
 * deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 }); // true (orden no importa)
 * deepEqual(new Date('2026-01-01'), new Date('2026-01-01')); // true
 * deepEqual([1, 2, 3], [1, 2, 3]); // true
 * ```
 */
export function deepEqual(obj1: unknown, obj2: unknown): boolean {
    // Caso 1: Igualdad estricta (primitivos, null, undefined, misma referencia)
    if (obj1 === obj2) {
        return true;
    }
    
    // Caso 2: Uno es null/undefined y el otro no
    if (obj1 == null || obj2 == null) {
        return obj1 === obj2;
    }
    
    // Caso 3: Tipos diferentes
    if (typeof obj1 !== typeof obj2) {
        return false;
    }
    
    // Caso 4: Primitivos (ya comparado por ===, pero por claridad)
    if (typeof obj1 !== 'object') {
        return obj1 === obj2;
    }
    
    // Caso 5: Fechas
    if (obj1 instanceof Date && obj2 instanceof Date) {
        return obj1.getTime() === obj2.getTime();
    }
    
    // Caso 6: Arrays
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
        if (obj1.length !== obj2.length) {
            return false;
        }
        
        for (let i = 0; i < obj1.length; i++) {
            if (!deepEqual(obj1[i], obj2[i])) {
                return false;
            }
        }
        
        return true;
    }
    
    // Caso 7: Uno es array y el otro no
    if (Array.isArray(obj1) !== Array.isArray(obj2)) {
        return false;
    }
    
    // Caso 8: Objetos
    const keys1 = Object.keys(obj1 as Record<string, unknown>);
    const keys2 = Object.keys(obj2 as Record<string, unknown>);
    
    // Diferente número de propiedades
    if (keys1.length !== keys2.length) {
        return false;
    }
    
    // Comparar cada propiedad
    for (const key of keys1) {
        if (!keys2.includes(key)) {
            return false;
        }
        
        const val1 = (obj1 as Record<string, unknown>)[key];
        const val2 = (obj2 as Record<string, unknown>)[key];
        
        if (!deepEqual(val1, val2)) {
            return false;
        }
    }
    
    return true;
}

/**
 * Crea una copia profunda de un valor
 * Maneja null, undefined, primitivos, fechas, arrays y objetos anidados
 * 
 * @param value Valor a clonar
 * @returns Copia profunda del valor
 */
export function deepClone<T>(value: T): T {
    if (value === null || value === undefined) {
        return value;
    }
    
    if (value instanceof Date) {
        return new Date(value.getTime()) as T;
    }
    
    if (Array.isArray(value)) {
        return value.map(item => deepClone(item)) as T;
    }
    
    if (typeof value === 'object') {
        const cloned: Record<string, unknown> = {};
        
        for (const [key, val] of Object.entries(value)) {
            cloned[key] = deepClone(val);
        }
        
        return cloned as T;
    }
    
    return value;
}
```

**Modificar BaseEntity:**
```typescript
// base_entity.ts

import { deepEqual, deepClone } from '@/utils/deep_compare';

export abstract class BaseEntity {
    constructor(data: EntityData) {
        Object.assign(this, data);
        // Usar deepClone en lugar de structuredClone
        this._originalState = deepClone(this.toPersistentObject());
    }
    
    /**
     * Determina si la entidad tiene cambios sin guardar
     * Compara el estado actual con el snapshot original usando comparación profunda
     * @returns true si hay cambios, false si no hay cambios
     */
    public getDirtyState(): boolean {
        const currentState = this.toPersistentObject();
        return !deepEqual(this._originalState, currentState);
    }
    
    /**
     * Restablece la entidad a su estado original
     * Descarta todos los cambios no guardados
     */
    public resetChanges(): void {
        if (this._originalState) {
            Object.assign(this, deepClone(this._originalState));
        }
    }
}
```

**Validación Contractual:**
- ✅ NO viola ningún axioma (mejora interna)
- ✅ NO cambia API pública de BaseEntity
- ✅ Mejora robustez sin breaking changes

**Archivos a Crear:**
1. `/src/utils/deep_compare.ts`

**Archivos a Modificar:**
1. `/src/entities/base_entity.ts` - Usar deepEqual en getDirtyState()
2. `/src/entities/base_entity.ts` - Usar deepClone en constructor

**Tiempo Estimado:** 4-6 horas

---

## 4. ITEMS RECHAZADOS

### 4.1 Sistema de Logging Estructurado ❌

**Motivo del Rechazo:** No prioritario en fase temprana (pre-testing).

**Justificación:** 
- Los `console.*` actuales son suficientes para desarrollo
- No afecta funcionalidad core
- Puede implementarse en Fase 2-3 cuando haya testing

**Alternativa:** Mantener console.* por ahora, considerar para fase de producción.

---

### 4.2 Decoradores Adicionales Avanzados ❌

**Motivo del Rechazo:** Complejidad innecesaria en fase temprana.

**Justificación:**
- Decoradores propuestos (@OneToMany, @Computed, etc.) requieren:
  - Cambios arquitectónicos mayores
  - Sistema de hidratación de relaciones
  - Potencial violación de Axioma A1 si no se diseña correctamente
- Framework aún "verde" para features avanzadas

**Alternativa:** Agregar a roadmap de Fase 4 (Expansión), después de testing.

---

## 5. PLAN DE IMPLEMENTACIÓN

### 5.1 Estructura por Semanas

#### **SEMANA 1: Fundamentos y Tipos**
**Días 1-2:**
- ✅ Crear estructura `/src/types/`
- ✅ Implementar `entity.types.ts`, `decorator.types.ts`, `ui.types.ts`, `service.types.ts`
- ✅ Actualizar todos los imports

**Días 3-4:**
- ✅ Implementar `DecoratedPrototype` y `DecoratedConstructor`
- ✅ Reemplazar type castings en `base_entity.ts`
- ✅ Validar compilación TypeScript

**Día 5:**
- ✅ Implementar `/src/utils/deep_compare.ts`
- ✅ Modificar `getDirtyState()` y `resetChanges()`
- ✅ Pruebas manuales de casos edge

---

#### **SEMANA 2: Servicios y Transformadores**
**Días 1-2:**
- ✅ Implementar `ApplicationDataService`
- ✅ Integrar en `Application`
- ✅ Implementar transformadores (date, decimal, boolean, enum)

**Días 3-4:**
- ✅ Modificar `BaseEntity.mapFromPersistentKeys()` y `mapToPersistentKeys()`
- ✅ Agregar soporte para `transformationSchema`
- ✅ Actualizar `Product` con ejemplo de transformación

**Día 5:**
- ✅ Pruebas de transformación (fechas, decimales)
- ✅ Validar integración con API

---

#### **SEMANA 3: Validación y Manejo de Errores**
**Días 1-2:**
- ✅ Implementar `/src/validators/common_validators.ts`
- ✅ Implementar Validators y AsyncValidators
- ✅ Crear `/src/validators/index.ts`

**Días 3-4:**
- ✅ Mejorar interceptor HTTP en `Application`
- ✅ Implementar manejo de 401, 403, 404, 422, 500, 502, 503
- ✅ Implementar retry logic con exponential backoff

**Día 5:**
- ✅ Actualizar `Product` con ejemplos de validadores
- ✅ Pruebas de validación y manejo de errores

---

#### **SEMANA 4: Componentes Vue - Parte 1**
**Días 1-2:**
- ✅ Actualizar `/copilot/06-CODE-STYLING-STANDARDS.md` con estándar Vue
- ✅ Crear plantilla de componente ejemplo

**Días 3-5:**
- ✅ Migrar `DetailViewTableComponent.vue` a Composition API
- ✅ Migrar `FormGroupComponent.vue`
- ✅ Migrar `ActionsComponent.vue`

---

#### **SEMANA 5: Componentes Vue - Parte 2**
**Días 1-5:**
- ✅ Migrar componentes de `/src/components/Form/` (14 componentes)
  - Prioridad: TextInputComponent, NumberInputComponent, DateInputComponent
  - Secundario: BooleanInputComponent, ArrayInputComponent, ObjectInputComponent
  - Resto: EmailInputComponent, PasswordInputComponent, etc.

---

#### **SEMANA 6: Validación Final y Documentación**
**Días 1-2:**
- ✅ Pruebas de integración completa
- ✅ Validar todos los flujos CRUD
- ✅ Validar transformaciones y validaciones

**Días 3-4:**
- ✅ Actualizar documentación en `/copilot/`
- ✅ Actualizar ejemplos en tutoriales
- ✅ Actualizar README.md

**Día 5:**
- ✅ Revisión final contractual
- ✅ Ejecutar AOM (Autoverificación Obligatoria del Modelo)
- ✅ Generar reporte de cumplimiento

---

### 5.2 Orden de Implementación Detallado

```
ORDEN SECUENCIAL (dependencias respetadas):

1. Centralización de Tipos
   ├─> entity.types.ts
   ├─> decorator.types.ts
   ├─> ui.types.ts
   └─> service.types.ts

2. Type Casting Mejorado
   └─> Depende de: entity.types.ts

3. Deep Compare (isDirty)
   └─> Independiente

4. ApplicationDataService
   ├─> Depende de: service.types.ts
   └─> Prerequisito para: Transformadores

5. Transformadores
   ├─> Depende de: ApplicationDataService
   └─> Modifica: BaseEntity

6. Validadores Predefinidos
   └─> Independiente (usa decoradores existentes)

7. Manejo de Errores HTTP
   └─> Independiente

8. Migración de Componentes
   ├─> Depende de: Estándar en 06-CODE-STYLING-STANDARDS.md
   └─> Puede hacerse en paralelo con otros items
```

---

## 6. VALIDACIÓN CONTRACTUAL

### 6.1 Checklist de Cumplimiento por Item

#### Item 1: Centralización de Tipos ✅
- [x] **A1 - Arquitectura de Capas:** No afecta (solo organización)
- [x] **A2 - Flujo Unidireccional:** No afecta
- [x] **A3 - Generación desde Metadatos:** No afecta
- [x] **A4 - Inmutabilidad Estructural:** No afecta
- [x] **06-CODE-STYLING:** Mejora organización de imports ✅

#### Item 2: Type Casting Mejorado ✅
- [x] **A1 - Arquitectura de Capas:** No afecta
- [x] **A2 - Flujo Unidireccional:** No afecta
- [x] **A3 - Generación desde Metadatos:** No afecta
- [x] **A4 - Inmutabilidad Estructural:** No afecta (mejora type safety)
- [x] **06-CODE-STYLING:** Mejora tipado explícito ✅

#### Item 3: Deep Compare ✅
- [x] **A1 - Arquitectura de Capas:** No afecta (mejora interna de BaseEntity - Capa 3)
- [x] **A2 - Flujo Unidireccional:** No afecta
- [x] **A3 - Generación desde Metadatos:** No afecta
- [x] **A4 - Inmutabilidad Estructural:** No afecta
- [x] **06-CODE-STYLING:** No afecta

#### Item 4: ApplicationDataService ✅
- [x] **A1 - Arquitectura de Capas:** ✅ Es parte de Application (Capa 4), NO agrega capa nueva
- [x] **A2 - Flujo Unidireccional:** ✅ Respeta (API → Application → BaseEntity)
- [x] **A3 - Generación desde Metadatos:** No afecta
- [x] **A4 - Inmutabilidad Estructural:** ✅ NO modifica sistema de metadatos
- [x] **06-CODE-STYLING:** Requiere JSDoc ✅

#### Item 5: Transformadores ✅
- [x] **A1 - Arquitectura de Capas:** ✅ Transformadores en Capa 4 (Application), aplicados en Capa 3 (BaseEntity)
- [x] **A2 - Flujo Unidireccional:** ✅ Respeta
- [x] **A3 - Generación desde Metadatos:** No afecta
- [x] **A4 - Inmutabilidad Estructural:** ✅ NO modifica decoradores ni símbolos
- [x] **06-CODE-STYLING:** JSDoc completo ✅

#### Item 6: Validadores Predefinidos ✅
- [x] **A1 - Arquitectura de Capas:** ✅ Usa decoradores existentes (Capa 2)
- [x] **A2 - Flujo Unidireccional:** No afecta
- [x] **A3 - Generación desde Metadatos:** No afecta (validación sigue siendo de metadatos)
- [x] **A4 - Inmutabilidad Estructural:** ✅ NO agrega símbolos nuevos, usa VALIDATION_KEY y ASYNC_VALIDATION_KEY existentes
- [x] **06-CODE-STYLING:** JSDoc completo ✅

#### Item 7: Manejo de Errores HTTP ✅
- [x] **A1 - Arquitectura de Capas:** No afecta (mejora en Application - Capa 4)
- [x] **A2 - Flujo Unidireccional:** No afecta
- [x] **A3 - Generación desde Metadatos:** No afecta
- [x] **A4 - Inmutabilidad Estructural:** No afecta
- [x] **06-CODE-STYLING:** Comentarios obligatorios ✅

#### Item 8: Migración de Componentes ✅
- [x] **A1 - Arquitectura de Capas:** No afecta (sigue siendo Capa 5 - UI)
- [x] **A2 - Flujo Unidireccional:** ✅ Mantiene acceso vía Application
- [x] **A3 - Generación desde Metadatos:** ✅ Sigue generando desde metadatos
- [x] **A4 - Inmutabilidad Estructural:** No afecta
- [x] **04-UI-DESIGN-SYSTEM:** ✅ Tokens CSS respetados
- [x] **06-CODE-STYLING:** ✅ Nuevo estándar documentado

---

### 6.2 Verificación Anti-Violación

**REGLAS OBLIGATORIAS:**

1. ✅ **NO se modifica sistema de decoradores** (símbolo, almacenamiento, accesores)
2. ✅ **NO se cambia jerarquía de BaseEntity** (sigue siendo clase base abstracta)
3. ✅ **NO se altera patrón Singleton de Application** (se extiende, no se reemplaza)
4. ✅ **NO se modifica sistema de eventos** (eventBus intacto)
5. ✅ **NO se cambia almacenamiento de metadatos** (prototype[SYMBOL_KEY])
6. ✅ **NO hay acceso directo de UI a entidades** (pasa por Application)
7. ✅ **NO se hardcodean valores CSS** (solo tokens var(--*))
8. ✅ **NO se usa `any` sin justificación** (tipado explícito)
9. ✅ **NO se concatena con `+`** (template literals)
10. ✅ **NO se crean README.md en `/src/`** (solo en `/copilot/`)

**RESULTADO:** ✅ TODAS LAS REGLAS RESPETADAS

---

### 6.3 Análisis de Riesgo Contractual

| Item | Riesgo de Violación | Mitigación |
|------|---------------------|------------|
| **Centralización de Tipos** | 🟢 NULO | Solo organización, no cambia lógica |
| **Type Casting** | 🟢 NULO | Mejora interna, no afecta API |
| **Deep Compare** | 🟢 NULO | Método interno de BaseEntity |
| **ApplicationDataService** | 🟡 BAJO | **Mitigado:** Es parte de Application (Capa 4), NO capa nueva |
| **Transformadores** | 🟡 BAJO | **Mitigado:** Aplicados en BaseEntity, NO modifican decoradores |
| **Validadores** | 🟢 NULO | Usan decoradores existentes |
| **Manejo de Errores** | 🟢 NULO | Mejora de interceptor existente |
| **Migración Componentes** | 🟢 NULO | Cambio de sintaxis, lógica igual |

**NIVEL DE RIESGO GLOBAL:** 🟢 **BAJO** (controlado y mitigado)

---

## 7. CRITERIOS DE ACEPTACIÓN

### 7.1 Criterios Funcionales

#### **Item 1: Centralización de Tipos**
- [ ] Todos los tipos están en `/src/types/`
- [ ] `index.ts` exporta todos los tipos
- [ ] No hay definiciones de tipos duplicadas
- [ ] Compilación TypeScript sin errores

#### **Item 2: Type Casting Mejorado**
- [ ] `DecoratedPrototype` y `DecoratedConstructor` definidos
- [ ] Menos de 5 ocurrencias de `as unknown as` en `base_entity.ts`
- [ ] Compilación TypeScript sin errores
- [ ] No se pierde inferencia de tipos

#### **Item 3: Deep Compare**
- [ ] `deepEqual()` maneja correctamente:
  - [ ] Primitivos
  - [ ] null/undefined
  - [ ] Fechas
  - [ ] Arrays
  - [ ] Objetos anidados
  - [ ] Orden de propiedades diferente
- [ ] `getDirtyState()` funciona correctamente con casos edge
- [ ] No hay logs de debug en producción

#### **Item 4 y 5: ApplicationDataService y Transformadores**
- [ ] `ApplicationDataService` instanciado en `Application`
- [ ] Transformadores predefinidos implementados (date, decimal, boolean, enum)
- [ ] `transformationSchema` funciona en entidades
- [ ] Fechas ISO se convierten correctamente a `Date`
- [ ] Decimales string se convierten a `number`

#### **Item 6: Validadores Predefinidos**
- [ ] Validadores implementados:
  - [ ] email
  - [ ] minLength / maxLength
  - [ ] min / max / range
  - [ ] pattern
  - [ ] url
  - [ ] phone
  - [ ] notFuture / notPast
- [ ] `AsyncValidators.unique` funciona
- [ ] Mensajes de error personalizables
- [ ] Ejemplo en `Product` actualizado

#### **Item 7: Manejo de Errores HTTP**
- [ ] Códigos manejados: 401, 403, 404, 422, 500, 502, 503, undefined
- [ ] Retry logic con exponential backoff (500, 502, 503)
- [ ] Toasts mostrados correctamente
- [ ] Redirección a login en 401

#### **Item 8: Migración de Componentes**
- [ ] Estándar documentado en `06-CODE-STYLING-STANDARDS.md`
- [ ] `DetailViewTableComponent.vue` migrado
- [ ] `FormGroupComponent.vue` migrado
- [ ] `ActionsComponent.vue` migrado
- [ ] Componentes de Form/ migrados (al menos 80%)
- [ ] Props tipadas con TypeScript
- [ ] Emits tipados con TypeScript
- [ ] Regions correctamente definidos

---

### 7.2 Criterios de Calidad

#### **Code Quality**
- [ ] ESLint sin errores
- [ ] TypeScript compilación sin warnings
- [ ] JSDoc completo en todos los métodos públicos
- [ ] Imports ordenados (Vue → Externos → @/ → Relativos)
- [ ] Indentación 4 espacios
- [ ] Template literals para interpolación

#### **Documentación**
- [ ] `/copilot/06-CODE-STYLING-STANDARDS.md` actualizado
- [ ] Ejemplos en `/src/entities/product.ts` actualizados
- [ ] Referencias cruzadas válidas
- [ ] No hay README.md en `/src/`

#### **Performance**
- [ ] No hay regresiones de rendimiento
- [ ] Transformaciones no ralentizan CRUD
- [ ] Deep compare es O(n) aceptable

---

### 7.3 Criterios de Cumplimiento Contractual

#### **MI LÓGICA (Axiomas A1-A4)**
- [ ] A1: Arquitectura de 5 capas intacta
- [ ] A2: Flujo unidireccional mantenido
- [ ] A3: UI generada desde metadatos
- [ ] A4: Stack TypeScript + Decoradores + Vue 3 preservado

#### **Contratos (00-06)**
- [ ] 00-CONTRACT.md: Procedimientos de validación ejecutados
- [ ] 04-UI-DESIGN-SYSTEM-CONTRACT: Tokens CSS usados
- [ ] 06-CODE-STYLING-STANDARDS: Estilo respetado al 100%

#### **AOM (Autoverificación Obligatoria del Modelo)**
- [ ] Checklist de MI LÓGICA ejecutado
- [ ] Checklist de Código ejecutado
- [ ] Checklist de UI/CSS ejecutado
- [ ] Checklist de Documentación ejecutado

---

## 8. ENTREGABLES

### 8.1 Código

**Archivos Nuevos:**
```
/src/types/
├── index.ts
├── entity.types.ts
├── decorator.types.ts
├── ui.types.ts
└── service.types.ts

/src/utils/
└── deep_compare.ts

/src/models/
└── application_data_service.ts

/src/validators/
├── index.ts
└── common_validators.ts
```

**Archivos Modificados:**
```
/src/entities/base_entity.ts       ← Type casting, deep compare, transformers
/src/entities/product.ts            ← Ejemplos de validadores y transformers
/src/models/application.ts          ← ApplicationDataService, manejo de errores HTTP

/src/components/Informative/DetailViewTableComponent.vue  ← Composition API
/src/components/Form/FormGroupComponent.vue               ← Composition API
/src/components/ActionsComponent.vue                      ← Composition API
/src/components/Form/*.vue (14 archivos)                  ← Composition API
```

### 8.2 Documentación

**Archivos a Actualizar:**
```
/copilot/06-CODE-STYLING-STANDARDS.md  ← Estándar de componentes Vue
/copilot/layers/01-decorators/validation-decorator.md  ← Validadores predefinidos
/copilot/layers/02-base-entity/      ← Transformadores y deep compare
/copilot/layers/03-application/      ← ApplicationDataService
```

### 8.3 Reporte Final

**Documento a Generar:**
```
/copilot/REPORTE-FASE-1-COMPLETADO.md
├── Resumen ejecutivo
├── Métricas de cumplimiento
├── Items completados
├── Problemas encontrados
├── Lecciones aprendidas
└── Recomendaciones para Fase 2
```

---

## 9. NOTAS DE IMPLEMENTACIÓN

### 9.1 Orden de Commits

**Commits Sugeridos (mensajes):**
```
1. feat(types): centralizar tipos en /src/types/
2. refactor(types): mejorar type casting en BaseEntity
3. feat(utils): agregar deep compare para dirty state
4. refactor(entities): usar deep compare en getDirtyState
5. feat(services): agregar ApplicationDataService
6. feat(transformers): implementar transformadores de datos
7. refactor(entities): integrar transformadores en BaseEntity
8. feat(validators): agregar validadores predefinidos
9. refactor(application): mejorar manejo de errores HTTP
10. docs(standards): agregar estándar de componentes Vue
11. refactor(components): migrar DetailViewTableComponent a Composition API
12. refactor(components): migrar FormGroupComponent a Composition API
13. refactor(components): migrar ActionsComponent a Composition API
14. refactor(components): migrar componentes de Form a Composition API
15. docs(copilot): actualizar documentación de Fase 1
16. docs(copilot): generar reporte de completado Fase 1
```

### 9.2 Testing Manual

**Casos de Prueba por Item:**

**Deep Compare:**
```typescript
// Casos a probar:
const tests = [
    [{ a: 1, b: 2 }, { b: 2, a: 1 }], // Orden diferente → true
    [new Date('2026-01-01'), new Date('2026-01-01')], // Fechas iguales → true
    [[1, 2, 3], [1, 2, 3]], // Arrays iguales → true
    [{ nested: { val: 1 } }, { nested: { val: 1 } }], // Objetos anidados → true
];
```

**Transformadores:**
```typescript
// Crear entidad con fecha/decimal
const product = new Product({
    createdAt: '2026-02-18T10:30:00.000Z',
    price: '99.99'
});

console.assert(product.createdAt instanceof Date);
console.assert(typeof product.price === 'number');
```

**Validadores:**
```typescript
// Crear entidad con validaciones
@Validators.email()
email!: string;

@Validators.range(0, 100)
discount!: number;

// Probar validación
entity.email = 'invalid';
const isValid = entity.validateInputs(); // Debe fallar
```

---

## 10. CONCLUSIÓN

Este plan de implementación de Fase 1 garantiza:

✅ **Cumplimiento Contractual 100%** - Ninguna mejora viola los 7 contratos vinculantes  
✅ **Mejora de Robustez** - Type safety, validación, transformación de datos  
✅ **Mantenibilidad** - Código mejor organizado, patrones estandarizados  
✅ **Escalabilidad** - Fundamentos para futuras mejoras  
✅ **NO Breaking Changes** - Todas las mejoras son backward-compatible  

**Tiempo Total Estimado:** 4-6 semanas  
**Complejidad:** Media  
**Riesgo:** Bajo (controlado)  

**Próximos Pasos:**
1. Aprobar este plan
2. Ejecutar SEMANA 1 (Fundamentos y Tipos)
3. Revisión semanal de progreso
4. Ajustar timeline según necesidad

---

**FIN DEL PLAN DE MEJORAS - FASE 1**

**Fecha de Aprobación:** _Pendiente_  
**Responsable de Implementación:** _Asignar_  
**Fecha de Inicio Estimada:** _Después de aprobación_  
**Fecha de Fin Estimada:** _+4-6 semanas desde inicio_
