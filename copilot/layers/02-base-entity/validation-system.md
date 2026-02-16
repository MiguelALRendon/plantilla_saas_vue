# BaseEntity: Sistema de Validación

## 1. Propósito

BaseEntity implementa un sistema de validación de tres niveles que ejecuta automáticamente pre-guardado para garantizar integridad de datos. El sistema valida propiedades en cascada: verificación de campos requeridos (nivel 1), ejecución de reglas síncronas como regex o rangos (nivel 2), y ejecución de validaciones asíncronas que consultan backend para verificar unicidad o disponibilidad (nivel 3). La validación integrada bloquea operaciones save/update si detecta errores, acumula mensajes de error por propiedad, emite eventos al eventBus, y provee feedback visual en componentes UI mediante reactive binding a validationErrors.

## 2. Alcance

**Responsabilidades cubiertas:**
- Método principal validateInputs() que coordina validación completa de entidad
- Validación nivel 1 (Required): verificación de campos obligatorios no vacíos
- Validación nivel 2 (Sync): ejecución de funciones síncronas con reglas de negocio
- Validación nivel 3 (Async): ejecución de funciones asíncronas con llamadas HTTP
- Métodos de acceso: isRequired(), requiredMessage(), isValidation(), validationMessage(), isAsyncValidation(), asyncValidationMessage()
- Almacenamiento de errores en validationErrors (Record<string, string[]>)
- Emisión de eventos 'validation-passed' y 'validation-failed' al eventBus
- Integración automática con save() que aborta persistencia si validación falla
- Métodos de validación de configuración: validateModuleConfiguration(), validatePersistenceConfiguration(), validateApiMethod()

**Límites del alcance:**
- No previene asignación de valores inválidos (validación es reactiva, no preventiva)
- No implementa validación granular por campo individual (solo validación completa)
- No distingue entre warnings y errors (solo manejo de errores bloqueantes)
- No implementa validación cross-entity (solo propiedades de instancia actual)
- No maneja dependencias complejas entre validaciones (ejecución lineal)

## 3. Definiciones Clave

**validateInputs():** Método principal que coordina la ejecución secuencial de los tres niveles de validación sobre todas las propiedades de la entidad, acumula errores en validationErrors, emite eventos al eventBus, y retorna boolean indicando éxito o fallo.

**Nivel 1 - Required Validation:** Primera capa que verifica que campos marcados con @Required tengan valor no vacío (no null, undefined, ni string vacío). Ejecuta mediante isRequired(key) que evalúa el decorador y requiredMessage(key) que obtiene mensaje de error.

**Nivel 2 - Sync Validation:** Segunda capa que ejecuta funciones síncronas definidas en decorador @Validation para verificar reglas de negocio como regex patterns, rangos numéricos, o lógica condicional. Ejecuta mediante isValidation(key) y validationMessage(key).

**Nivel 3 - Async Validation:** Tercera capa que ejecuta funciones asíncronas definidas en decorador @AsyncValidation para verificar condiciones que requieren consultas al servidor (unicidad de username, disponibilidad de email). Ejecuta mediante isAsyncValidation(key) y asyncValidationMessage(key).

**validationErrors:** Property pública de tipo Record<string, string[]> que almacena mapeo de propertyKey a array de mensajes de error acumulados durante validateInputs(). Se reinicia en cada validación y se usa para binding reactivo en componentes UI.

**validateModuleConfiguration():** Método que valida configuración mínima de decoradores requeridos para funcionar como módulo: @ModuleName, @ModuleIcon, @DefaultProperty, @PrimaryProperty. Retorna boolean y muestra dialog de error si falla.

**validatePersistenceConfiguration():** Método que valida configuración completa para operaciones CRUD con API: ejecuta validateModuleConfiguration() más validación de @UniquePropertyKey, @ApiEndpoint, @ApiMethods. Usado pre-save/update/delete.

**validateApiMethod(method):** Método que valida si método HTTP específico está permitido en @ApiMethods de la entidad. Retorna boolean y muestra dialog si método no permitido.

**Short-circuit optimization:** Si validación de nivel inferior falla (ej. Required), los niveles superiores (Validation, AsyncValidation) no se ejecutan para esa propiedad, optimizando performance y evitando requests innecesarios.

**Reactive error binding:** Los componentes UI hacen computed sobre entity.validationErrors[propertyKey] para mostrar mensajes de error en tiempo real sin necesidad de polling o eventos manuales.

## 4. Descripción Técnica

### Arquitectura Event-Driven con Tres Niveles

El sistema implementa arquitectura **event-driven** donde validateInputs() emite evento y los componentes ejecutan validación en cascada de tres niveles:

```
┌──────────────────────────────────────────────────┐
│  BaseEntity.validateInputs()                     │
│  Application.eventBus.emit('validate-inputs')    │
└────────────────┬─────────────────────────────────┘
                │
                ↓ (Evento broadcast)
        ┌───────┴────────┐
        │                │
┌───────▼───────┐  ┌──────▼──────┐
│ TextInput     │  │ NumberInput │  ... (Todos los components)
│ Component     │  │ Component   │
└───────┬───────┘  └──────┬──────┘
        │                │
        └───────┬────────┘
                │
                ↓ (Cada componente valida)
┌─────────────────────────────────────────┐
│   NIVEL 1: Required Validation          │  ← Más básico
│   ¿Campo obligatorio tiene valor?       │
└─────────────┬───────────────────────────┘
              │ ✓ Pasa
              ↓
┌─────────────────────────────────────────┐
│   NIVEL 2: Sync Validation              │  ← Reglas síncronas
│   ¿Valor cumple reglas (regex, rango)?  │
└─────────────┬───────────────────────────┘
              │ ✓ Pasa
              ↓
┌─────────────────────────────────────────┐
│   NIVEL 3: Async Validation             │  ← Validaciones con API
│   ¿Valor único/disponible en servidor?  │
└─────────────┬───────────────────────────┘
              │ Si falla: Application.View.value.isValid = false
              ↓
┌─────────────────────────────────────────┐
│  Application.View.value.isValid         │
│  (Estado acumulado de todos los inputs) │
└─────────────┬───────────────────────────┘
              │
              ↓
    validateInputs() retorna isValid
         VÁLIDO → Procede save()
```

### Método Principal: validateInputs()

#### Firma

#### Firma

```typescript
public async validateInputs(): Promise<boolean>
```

Valida todas las propiedades de la entidad ejecutando los 3 niveles de validación. Retorna true si todos los campos son válidos, false si existe al menos un error.

####Uso Básico

```typescript
const product = new Product({
    name: '',  // Requerido pero vacío
    price: -10  // Precio negativo (inválido)
});

const isValid = await product.validateInputs();
// Retorna: false

console.log(product.validationErrors);
// {
//   name: ['Name is required'],
//   price: ['Price must be positive']
// }
```

#### Implementación Real (Event-Driven)

```typescript
public async validateInputs(): Promise<boolean> {
    // 1. Inicializar estado de validación como válido
    Application.View.value.isValid = true;
    
    // 2. Mostrar loading durante validación
    Application.ApplicationUIService.showLoadingMenu();
    
    // 3. Esperar tick para que loading se muestre
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // 4. EMISIÓN DEL EVENTO - Los componentes escuchan y validan
    Application.eventBus.emit('validate-inputs');
    
    // 5. Esperar validaciones asíncronas de todos los campos
    const keys = this.getKeys();
    const asyncValidationPromises = keys.map(key => this.isAsyncValidation(key));
    await Promise.all(asyncValidationPromises);
    
    // 6. Esperar procesamiento de resultados de validación
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // 7. Ejecutar hook post-validación
    this.onValidated();
    
    // 8. Ocultar loading
    Application.ApplicationUIService.hideLoadingMenu();
    
    // 9. Retornar estado final (actualizado por componentes)
    return Application.View.value.isValid;
}
```

**Ubicación:** src/entities/base_entity.ts líneas 567-590.

**IMPORTANTE:** validateInputs() NO ejecuta validaciones directamente. En su lugar:
1. Emite evento `'validate-inputs'` al EventBus
2. Los **componentes de formulario** (TextInputComponent, NumberInputComponent, etc.) escuchan el evento
3. Cada componente ejecuta sus propias validaciones (Required, Validation, AsyncValidation)
4. Si un componente falla, actualiza `Application.View.value.isValid = false`
5. validateInputs() retorna el estado final acumulado por todos los componentes

Esta arquitectura **event-driven** permite validación descentralizada donde cada input es responsable de validarse a sí mismo.

### Métodos de Nivel 1: Required Validation

#### isRequired(key: string): boolean

Evalúa si un campo es requerido según decorador @Required.

```typescript
// Definición
@PropertyName('Name', String)
@Required(true)
name!: string;

// Uso
entity.isRequired('name');  // true
entity.isRequired('description');  // false
```

**Ubicación:** src/entities/base_entity.ts (línea ~275)

#### requiredMessage(key: string): string

Obtiene el mensaje de error para campo requerido.

```typescript
entity.requiredMessage('name');
// Retorna: "Name is required"
```

**Ubicación:** src/entities/base_entity.ts (línea ~285)

### Métodos de Nivel 2: Sync Validation

#### isValidation(key: string): boolean

Evalúa validación síncrona ejecutando función definida en decorador @Validation.

```typescript
// Definición
@PropertyName('Email', String)
@Validation(
    (entity) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(entity.email),
    'Invalid email format'
)
email!: string;

// Uso
const product = new Product({ email: 'invalid' });
product.isValidation('email');
// Retorna: false (no pasa regex)
```

**Ubicación:** src/entities/base_entity.ts (línea ~360)

#### validationMessage(key: string): string

Obtiene el mensaje de error de validación síncrona.

```typescript
product.validationMessage('email');
// Retorna: "Invalid email format"
```

**Ubicación:** src/entities/base_entity.ts (línea ~375)

### Métodos de Nivel 3: Async Validation

#### isAsyncValidation(key: string): Promise<boolean>

Evalúa validación asíncrona con llamada a API definida en decorador @AsyncValidation.

```typescript
// Definición
@PropertyName('Username', String)
@AsyncValidation(
    async (entity) => {
        const response = await fetch(`/api/check-username?username=${entity.username}`);
        return (await response.json()).available;
    },
    'Username already taken'
)
username!: string;

// Uso
const user = new User({ username: 'john_doe' });
const isAvailable = await user.isAsyncValidation('username');
// Retorna: true (disponible) o false (tomado)
```

**Ubicación:** src/entities/base_entity.ts (línea ~395)

#### asyncValidationMessage(key: string): string

Obtiene el mensaje de error de validación asíncrona.

```typescript
user.asyncValidationMessage('username');
// Retorna: "Username already taken"
```

**Ubicación:** src/entities/base_entity.ts (línea ~410)

### Almacenamiento de Errores: validationErrors

```typescript
public validationErrors: Record<string, string[]> = {};
```

Property pública que almacena todos los errores de validación encontrados. Mapea propertyKey a array de mensajes de error:

```typescript
const product = new Product({
    name: '',        // Required, vacío
    price: -10,      // Validación: debe ser positivo
    email: 'invalid' // Validación: formato inválido
});

await product.validateInputs();

console.log(product.validationErrors);
// {
//   name: ['Name is required'],
//   price: ['Price must be positive'],
//   email: ['Invalid email format']
// }
```

### Integración con save()

save() llama automáticamente a validateInputs() previo a ejecutar HTTP request:

```typescript
public async save(): Promise<this> {
    // ... beforeSave hook ...
    
    // VALIDACIÓN AUTOMÁTICA
    if (!await this.validateInputs()) {
        Application.showToast('Please fix validation errors', 'error');
        return this;  // ← No procede con save
    }
    
    // ... continúa con HTTP request ...
}
```

**Ubicación:** src/entities/base_entity.ts (línea ~720)

### Métodos de Validación de Configuración

#### validateModuleConfiguration(): boolean

Valida que la entidad tenga decoradores mínimos requeridos para funcionar como módulo en el framework.

**Validaciones obligatorias:**
1. @ModuleName debe estar definido
2. @ModuleIcon debe estar definido
3. @DefaultProperty debe estar definido
4. @PrimaryProperty debe estar definido

**Retorna:** true si configuración válida, false si hay errores

**Ubicación:** Línea 532

```typescript
public validateModuleConfiguration(): boolean {
    const errors: string[] = [];
    const entityClass = this.constructor as typeof BaseEntity;
    
    if (!entityClass.getModuleName()) {
        errors.push('El módulo no tiene definido @ModuleName');
    }
    
    if (!entityClass.getModuleIcon()) {
        errors.push('El módulo no tiene definido @ModuleIcon');
    }
    
    if (!(this.constructor as any)[DEFAULT_PROPERTY_KEY]) {
        errors.push('El módulo no tiene definido @DefaultProperty');
    }
    
    if (!this.getPrimaryPropertyKey()) {
        errors.push('El módulo no tiene definido @PrimaryProperty');
    }
    
    if (errors.length > 0) {
        Application.ApplicationUIService.openConfirmationMenu(
            confMenuType.ERROR,
            'Error de configuración del módulo',
            errors.join('\n'),
            undefined,
            'Aceptar',
            'Cerrar'
        );
        return false;
    }
    
    return true;
}
```

Ejemplo de uso correcto:

```typescript
@DefaultProperty('name')
@PrimaryProperty('id')
@ModuleName('Products')
@ModuleIcon(ICONS.BOX)
export class Product extends BaseEntity {
    @PropertyName('ID', Number)
    id!: number;
    
    @PropertyName('Name', String)
    name!: string;
}

const product = new Product({ id: 1, name: 'Widget' });
product.validateModuleConfiguration(); // true
```

Ejemplo de configuración incorrecta:

```typescript
// FALTA @ModuleName y @ModuleIcon
@DefaultProperty('name')
@PrimaryProperty('id')
export class BadProduct extends BaseEntity {
    @PropertyName('ID', Number)
    id!: number;
}

const badProduct = new BadProduct({ id: 1 });
badProduct.validateModuleConfiguration(); 
// false
// Muestra dialog con errores:
// "El módulo no tiene definido @ModuleName"
// "El módulo no tiene definido @ModuleIcon"
```

#### validatePersistenceConfiguration(): boolean

Valida que la entidad tenga configuración completa para operaciones CRUD con API.

**Validaciones obligatorias:**
1. Ejecuta validateModuleConfiguration() primero
2. @UniquePropertyKey debe estar definido
3. @ApiEndpoint debe estar definido
4. @ApiMethods debe estar definido

**Retorna:** true si configuración válida, false si hay errores

**Ubicación:** Línea 603

```typescript
public validatePersistenceConfiguration(): boolean {
    if (!this.validateModuleConfiguration()) {
        return false;
    }
    
    const errors: string[] = [];
    
    if (!this.getUniquePropertyKey()) {
        errors.push('La entidad no tiene definido @UniquePropertyKey');
    }
    
    if (!this.getApiEndpoint()) {
        errors.push('La entidad no tiene definido @ApiEndpoint');
    }
    
    if (!this.getApiMethods()) {
        errors.push('La entidad no tiene definido @ApiMethods');
    }
    
    if (errors.length > 0) {
        Application.ApplicationUIService.openConfirmationMenu(
            confMenuType.ERROR,
            'Error de configuración de persistencia',
            errors.join('\n'),
            undefined,
            'Aceptar',
            'Cerrar'
        );
        return false;
    }
    
    return true;
}
```

**Usado internamente en:**
- save() - Línea 713
- update() - Línea 768
- delete() - Línea 820

#### validateApiMethod(method: HttpMethod): boolean

Valida que un método HTTP específico esté permitido en los @ApiMethods de la entidad.

**Parámetros:**
- method: HttpMethod - Método HTTP a validar ('GET', 'POST', 'PUT', 'DELETE')

**Retorna:** true si método permitido, false si no

**Ubicación:** Línea 637

```typescript
public validateApiMethod(method: HttpMethod): boolean {
    if (!this.isApiMethodAllowed(method)) {
        Application.ApplicationUIService.openConfirmationMenu(
            confMenuType.ERROR,
            'Método no permitido',
            `El método ${method} no está permitido en esta entidad`,
            undefined,
            'Aceptar',
            'Cerrar'
        );
        return false;
    }
    return true;
}
```

**Usado internamente en:**
- save() - Línea 717 (valida POST o PUT según isNew())
- update() - Línea 772 (valida PUT)
- delete() - Línea 824 (valida DELETE)

### Integración con UI Components

Componentes UI hacen binding reactivo a validationErrors para mostrar errores en tiempo real:

```vue
<template>
  <div class="form-field" :class="{ 'has-error': hasErrors }">
    <label>{{ metadata.propertyName }}</label>
    
    <input
      v-model="modelValue"
      :class="{ 'input-error': hasErrors }"
      @blur="validate"
    />
    
    <!-- Mostrar mensajes de error -->
    <div v-if="hasErrors" class="error-messages">
      <span 
        v-for="(error, index) in errorMessages" 
        :key="index"
        class="error-message"
      >
        {{ error }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps(['entity', 'propertyKey', 'modelValue']);
const emit = defineEmits(['update:modelValue']);

const errorMessages = computed(() => {
    return props.entity.validationErrors[props.propertyKey] || [];
});

const hasErrors = computed(() => {
    return errorMessages.value.length > 0;
});

async function validate() {
    // Validar solo este campo
    await props.entity.validateInputs();
    
    // La UI se actualiza automáticamente gracias a computed()
}
</script>

<style scoped>
.has-error .input-error {
    border-color: var(--error-primary);
    background-color: var(--error-bg);
}

.error-messages {
    margin-top: 4px;
}

.error-message {
    display: block;
    color: var(--error-primary);
    font-size: 12px;
    margin-top: 2px;
}
</style>
```

**Ubicación:** src/components/Form/TextInputComponent.vue (línea ~60)

## 5. Flujo de Funcionamiento

### Flujo de Ejecución de validateInputs()

```
1. validateInputs() llamado
        ↓
2. Inicializa validationErrors = {}
        ↓
3. Obtiene lista de propiedades: getProperties()
        ↓
4. Para cada propiedad:
        ↓
   a. Nivel 1: ¿isRequired? → valida no vacío
        ↓ (pasa)
   b. Nivel 2: ¿isValidation? → valida con función sync
        ↓ (pasa)
   c. Nivel 3: ¿isAsyncValidation? → valida con función async
        ↓
5. Acumula errores en validationErrors
        ↓
6. Si hay errores:
   - Emite evento 'validation-failed' en eventBus
   - Retorna false
        ↓
7. Si NO hay errores:
   - Emite evento 'validation-passed'
   - Retorna true
```

### Flujo Completo con save()

```
Usuario hace click "Save"
        ↓
entity.save() llamado
        ↓
beforeSave() hook ejecuta
        ↓
validateInputs() ejecuta
        ↓
¿Errores encontrados?
    ├─ SÍ → Muestra toast con errores
    │       → Retorna entity sin guardar
    │       → UI muestra errores en campos
    │
    └─ NO → Procede con serialización
          → Hace HTTP request (POST/PUT)
          → Actualiza entity con response
          → afterSave() hook ejecuta
          → Muestra toast de éxito
          → Retorna entity actualizado
```

### Short-Circuit en Validaciones

```typescript
// Si un campo tiene:
@Required(true)
@Validation((e) => e.name.length >= 3, 'Min 3 chars')
@AsyncValidation(async (e) => await checkUnique(e.name), 'Already exists')

// Y el valor está vacío:
// - Required falla → agrega error
// - Validation NO se ejecuta (valor vacío, no tiene sentido validar longitud)
// - AsyncValidation NO se ejecuta (no hacer request innecesario)
```

Si validación de nivel inferior falla (ejemplo: Required), los niveles superiores (Validation, AsyncValidation) no se ejecutan para esa propiedad, optimizando performance y evitando requests innecesarios.

### Flujo de Validación Reactiva en UI

```
Usuario escribe en input
        ↓
@blur event disparado
        ↓
validate() function ejecuta
        ↓
entity.validateInputs() llamado
        ↓
validationErrors actualizado
        ↓
computed() detecta cambio
        ↓
UI re-renderiza mostrando errores
```

## 6. Reglas Obligatorias

**Regla 1:** validateInputs() DEBE ejecutarse antes de save(), update(), o delete(). Esta validación está automáticamente integrada en estos métodos y no puede omitirse.

**Regla 2:** validationErrors DEBE reiniciarse en cada llamada a validateInputs() para evitar acumulación de errores obsoletos de validaciones anteriores.

**Regla 3:** Orden de ejecución de niveles es ESTRICTO e INMUTABLE: Required → Validation → AsyncValidation. Este orden no puede alterarse.

**Regla 4:** Si Required falla para una propiedad, Validation y AsyncValidation NO DEBEN ejecutarse para esa propiedad (short-circuit optimization).

**Regla 5:** validateInputs() DEBE emitir evento 'validation-failed' al eventBus si encuentra errores, y 'validation-passed' si no encuentra errores.

**Regla 6:** save() DEBE abortar operación y retornar instancia sin cambios si validateInputs() retorna false. No puede proceder con HTTP request.

**Regla 7:** validationErrors DEBE ser property pública accesible desde componentes UI para binding reactivo de mensajes de error.

**Regla 8:** validateModuleConfiguration() DEBE validarse previo a cualquier operación que requiera metadatos de módulo (inicialización de vistas).

**Regla 9:** validatePersistenceConfiguration() DEBE validarse previo a save(), update(), delete() para garantizar que decoradores de API estén configurados.

**Regla 10:** validateApiMethod(method) DEBE validarse en save() para POST/PUT, en update() para PUT, y en delete() para DELETE antes de ejecutar request.

**Regla 11:** Múltiples decoradores @Validation en una misma propiedad DEBEN ejecutarse todos secuencialmente, sin short-circuit entre ellos.

**Regla 12:** AsyncValidation SOLO debe ejecutarse si Required y Validation han pasado exitosamente para evitar requests HTTP innecesarios.

## 7. Prohibiciones

**Prohibido:** Omitir validación en save()/update(). Estos métodos DEBEN llamar validateInputs() obligatoriamente.

**Prohibido:** Modificar validationErrors manualmente desde código externo. Solo validateInputs() debe escribir en esta property.

**Prohibido:** Ejecutar save() sin haber validado previamente. La validación automática es parte integral del flujo CRUD.

**Prohibido:** Alterar el orden de ejecución de niveles Required → Validation → AsyncValidation. Este orden es arquitectural.

**Prohibido:** Implementar validación preventiva que bloquee asignación de valores. La validación es reactiva, no preventiva.

**Prohibido:** Usar validationErrors para warnings no bloqueantes. Solo debe contener errores que impiden save().

**Prohibido:** Ejecutar AsyncValidation si Required o Validation han fallado para esa propiedad (violación de short-circuit).

**Prohibido:** Hacer override de validateInputs() sin llamar super.validateInputs() primero. Esto rompería validaciones base.

**Prohibido:** Emitir eventos 'validation-passed' o 'validation-failed' manualmente desde código externo. Solo validateInputs() debe emitirlos.

**Prohibido:** Implementar validación granular por campo sin pasar por validateInputs(). El sistema está diseñado para validación completa.

**Prohibido:** Aplicar validatePersistenceConfiguration() en entidades sin decoradores @ApiEndpoint/@ApiMethods. Debe fallar con dialog de error.

**Prohibido:** Continuar con save()/update()/delete() si validateApiMethod() retorna false. Debe abortar operación.

## 8. Dependencias

**Decoradores:**
- @Required: Define campos obligatorios (nivel 1)
- @Validation: Define reglas síncronas (nivel 2)
- @AsyncValidation: Define reglas asíncronas (nivel 3)
- @PropertyName: Define nombre legible para mensajes de error
- @ModuleName: Requerido por validateModuleConfiguration()
- @ModuleIcon: Requerido por validateModuleConfiguration()
- @DefaultProperty: Requerido por validateModuleConfiguration()
- @PrimaryProperty: Requerido por validateModuleConfiguration()
- @UniquePropertyKey: Requerido por validatePersistenceConfiguration()
- @ApiEndpoint: Requerido por validatePersistenceConfiguration()
- @ApiMethods: Requerido por validatePersistenceConfiguration()

**Application Singleton:**
- Application.eventBus: Para emitir eventos 'validation-passed' y 'validation-failed'
- Application.showToast(): Para mostrar mensajes de error en save()
- Application.ApplicationUIService.openConfirmationMenu(): Para mostrar dialogs de error de configuración

**BaseEntity Core:**
- getProperties(): Para obtener lista de propiedades a validar
- isRequired(key): Para verificar si campo es requerido
- requiredMessage(key): Para obtener mensaje de error Required
- isValidation(key): Para ejecutar validación síncrona
- validationMessage(key): Para obtener mensaje de error Validation
- isAsyncValidation(key): Para ejecutar validación asíncrona
- asyncValidationMessage(key): Para obtener mensaje de error AsyncValidation

**CRUD Operations:**
- save(): Llama validateInputs() y aborta si falla
- update(): Llama validateInputs() y aborta si falla
- delete(): Valida configuración antes de proceder

**TypeScript:**
- Promise<boolean>: Para soporte asíncrono en validateInputs()
- Record<string, string[]>: Para tipado de validationErrors

## 9. Relaciones

**Relación con Decoradores (1:N):**
BaseEntity.validateInputs() consume metadatos de múltiples decoradores (@Required, @Validation, @AsyncValidation) para ejecutar validaciones configuradas en entidad.

**Relación con CRUD Operations (1:1):**
save()/update()/delete() dependen directamente de validateInputs() como pre-requisito obligatorio antes de ejecutar HTTP requests.

**Relación con EventBus (N:1):**
Cada validación emite eventos ('validation-passed' o 'validation-failed') al Application.eventBus que pueden ser escuchados por múltiples componentes UI.

**Relación con UI Components (1:N):**
validationErrors es consumido por múltiples componentes de formulario mediante computed properties para mostrar errores en tiempo real.

**Relación con Lifecycle Hooks (N:1):**
beforeSave() hook se ejecuta ANTES de validateInputs() en el flujo save(), permitiendo preparación de datos pre-validación.

**Relación con Application Singleton (N:1):**
validateInputs() y métodos de validación de configuración dependen de servicios centralizados en Application (UIService, eventBus, showToast).

**Relación con Metadata System (1:N):**
validateModuleConfiguration() y validatePersistenceConfiguration() validan la presencia de múltiples metadatos configurados por decoradores.

## 10. Notas de Implementación

### Ejemplo 1: Validación Básica (Required + Validation)

```typescript
export class Product extends BaseEntity {
    @PropertyName('Product Name', String)
    @Required(true)
    @Validation(
        (entity) => entity.name.length >= 3,
        'Name must be at least 3 characters'
    )
    name!: string;
    
    @PropertyName('Price', Number)
    @Required(true)
    @Validation(
        (entity) => entity.price > 0,
        'Price must be positive'
    )
    price!: number;
}

// Test
const product = new Product({ name: 'AB', price: -10 });
await product.validateInputs();
// false

console.log(product.validationErrors);
// {
//   name: ['Name must be at least 3 characters'],
//   price: ['Price must be positive']
// }
```

### Ejemplo 2: Validación Condicional

```typescript
export class Order extends BaseEntity {
    @PropertyName('Shipping Method', String)
    shippingMethod!: string;  // 'pickup' o 'delivery'
    
    @PropertyName('Shipping Address', String)
    @Required((entity: Order) => entity.shippingMethod === 'delivery')
    shippingAddress?: string;
}

// Test 1: Pickup (address no requerida)
const order1 = new Order({ shippingMethod: 'pickup' });
await order1.validateInputs();  // true

// Test 2: Delivery sin address (error)
const order2 = new Order({ shippingMethod: 'delivery' });
await order2.validateInputs();  // false
// validationErrors: { shippingAddress: ['Shipping Address is required'] }
```

### Ejemplo 3: Validación con AsyncValidation

```typescript
export class User extends BaseEntity {
    @PropertyName('Username', String)
    @Required(true)
    @Validation(
        (entity) => /^[a-zA-Z0-9_]{3,20}$/.test(entity.username),
        'Username: 3-20 chars, alphanumeric and underscore only'
    )
    @AsyncValidation(
        async (entity) => {
            const response = await Application.axiosInstance.get(
                `/api/users/check-username?username=${entity.username}`
            );
            return response.data.available;
        },
        'Username already taken'
    )
    username!: string;
}

// Test
const user = new User({ username: 'jo' });
await user.validateInputs();
// false (falla en Validation: menos de 3 chars)

user.username = 'john_doe';
await user.validateInputs();
// Depende de la respuesta del servidor:
// - Si disponible → true
// - Si tomado → false con error "Username already taken"
```

### Ejemplo 4: Múltiples Validaciones en Un Campo

```typescript
export class Employee extends BaseEntity {
    @PropertyName('Email', String)
    @Required(true)
    @Validation(
        (entity) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(entity.email),
        'Invalid email format'
    )
    @Validation(
        (entity) => entity.email.endsWith('@company.com'),
        'Email must be from company domain'
    )
    @AsyncValidation(
        async (entity) => {
            const response = await Application.axiosInstance.get(
                `/api/employees/check-email?email=${entity.email}`
            );
            return response.data.available;
        },
        'Email already registered'
    )
    email!: string;
}

// Errores múltiples:
const employee = new Employee({ email: 'invalid' });
await employee.validateInputs();

console.log(employee.validationErrors.email);
// [
//   'Invalid email format',
//   'Email must be from company domain',
//   'Email already registered'  // (si también falla async)
// ]
```

### Ejemplo 5: Validación Cross-Field

```typescript
export class DateRange extends BaseEntity {
    @PropertyName('Start Date', Date)
    @Required(true)
    startDate!: Date;
    
    @PropertyName('End Date', Date)
    @Required(true)
    @Validation(
        (entity: DateRange) => {
            if (!entity.startDate || !entity.endDate) return true;
            return entity.endDate >= entity.startDate;
        },
        'End date must be after start date'
    )
    endDate!: Date;
}

// Test
const range = new DateRange({
    startDate: new Date('2024-12-31'),
    endDate: new Date('2024-01-01')  // Antes de startDate
});

await range.validateInputs();
// false
// validationErrors: { endDate: ['End date must be after start date'] }
```

### Ejemplo 6: Override validateInputs() para Custom Logic

```typescript
export class PurchaseOrder extends BaseEntity {
    @PropertyName('Items', Array)
    @ArrayOf(OrderItem)
    items!: OrderItem[];
    
    // Override para validación custom
    async validateInputs(): Promise<boolean> {
        // Ejecutar validaciones base
        const baseValid = await super.validateInputs();
        
        // Validación custom: al menos 1 item
        if (this.items.length === 0) {
            this.validationErrors['items'] = ['Order must have at least one item'];
            return false;
        }
        
        // Validación custom: total no excede límite
        const total = this.items.reduce((sum, item) => sum + item.total, 0);
        if (total > 100000) {
            this.validationErrors['items'] = ['Order total exceeds $100,000 limit'];
            return false;
        }
        
        return baseValid;
    }
}
```

### Consideración 1: Orden de Ejecución

Las validaciones se ejecutan en orden estricto: Required → Validation → AsyncValidation. Si Required falla, Validation y AsyncValidation NO se ejecutan para ese campo (optimización).

### Consideración 2: Performance con AsyncValidation

Múltiples campos con AsyncValidation aumentan tiempo de validación. Tres campos con async validation = tres requests al servidor. validateInputs() puede tardar 100-500ms. Solución: Debounce en UI para evitar validar en cada tecla.

### Consideración 3: Validación NO Previene Asignación

```typescript
product.name = '';  // Asignado sin prevención

await product.validateInputs();  // false (error detectado)

console.log(product.name);  // '' (el valor sigue allí)
```

Validación solo detecta problemas, no previene asignación de valores inválidos.

### Consideración 4: validationErrors se Sobrescribe

Cada llamada a validateInputs() reinicia validationErrors:

```typescript
await product.validateInputs();  // Detecta errores
console.log(product.validationErrors);  // { name: [...] }

product.name = 'Valid Name';
await product.validateInputs();  // Re-valida
console.log(product.validationErrors);  // {} (limpio)
```

### Extensión 1: Validar Solo un Campo

```typescript
export class BaseEntity {
    async validateField(key: string): Promise<boolean> {
        const errors: string[] = [];
        
        // Required
        if (this.isRequired(key)) {
            const value = (this as any)[key];
            if (!value) {
                errors.push(this.requiredMessage(key));
            }
        }
        
        // Validation
        if (this.isValidation(key) && !this.isValidation(key)) {
            errors.push(this.validationMessage(key));
        }
        
        // AsyncValidation
        if (this.isAsyncValidation && !await this.isAsyncValidation(key)) {
            errors.push(this.asyncValidationMessage(key));
        }
        
        // Actualizar errores
        if (errors.length > 0) {
            this.validationErrors[key] = errors;
            return false;
        } else {
            delete this.validationErrors[key];
            return true;
        }
    }
}

// Uso
await product.validateField('name');
// Valida solo 'name', no otros campos
```

### Extensión 2: Validación con Warning vs Error

```typescript
export class Product extends BaseEntity {
    public validationWarnings: Record<string, string[]> = {};
    
    async validateInputs(): Promise<boolean> {
        const hasErrors = await super.validateInputs();
        
        // Agregar warnings (no bloquean save)
        if (this.price < 10) {
            this.validationWarnings['price'] = ['Price seems low, are you sure?'];
        }
        
        return hasErrors;  // Warnings no afectan resultado
    }
}
```

## 11. Referencias Cruzadas

**Documentos relacionados:**
- crud-operations.md: Integración de validateInputs() en save()/update()/delete()
- lifecycle-hooks.md: beforeSave() hook ejecutado previo a validateInputs()
- ../01-decorators/required-decorator.md: Configuración de campos obligatorios
- ../01-decorators/validation-decorator.md: Configuración de validaciones síncronas
- ../01-decorators/async-validation-decorator.md: Configuración de validaciones asíncronas
- ../../tutorials/02-validations.md: Tutorial completo de sistema de validación
- ../../02-FLOW-ARCHITECTURE.md: Arquitectura de flujos incluyendo validación

**Archivos fuente:**
- src/entities/base_entity.ts: Implementación completa del sistema de validación
- src/components/Form/TextInputComponent.vue: Binding reactivo de validationErrors en UI

**Líneas relevantes en código:**
- Línea 350-450: Implementación de validateInputs() y métodos de nivel
- Línea 532: validateModuleConfiguration()
- Línea 603: validatePersistenceConfiguration()
- Línea 637: validateApiMethod()
- Línea 720: Integración en save()

**Última actualización:** 11 de Febrero, 2026
