# ModuleCustomComponents Decorator

**Referencias:**
- [Module Default Component](module-default-component-decorator.md) - ModuleDefaultComponent para componente base
- [Module Detail Component](module-detail-component-decorator.md) - ModuleDetailComponent para DetailView completa
- [Module List Component](module-list-component-decorator.md) - ModuleListComponent para ListView completa
- [Property Name](property-name-decorator.md) - PropertyName define propiedades con custom components
- [Base Entity Core](../../02-base-entity/base-entity-core.md) - getModuleCustomComponents accessor

**Ubicación:** `src/decorations/module_custom_components_decorator.ts`

---

## 1. Propósito

El decorador `@ModuleCustomComponents()` define un Map de componentes Vue personalizados asociados a propiedades específicas de una entidad. Permite establecer override granular a nivel de propiedad individual para reemplazar componentes de formulario sin afectar el ModuleDefaultComponent del módulo ni la resolución type-based global del framework. Este decorador proporciona control fino sobre experiencia de usuario permitiendo componentes especializados donde se requieren capacidades avanzadas mientras mantiene consistencia en resto de propiedades. El Map almacenado contiene pares propertyName-Component que se consultan durante component resolution en DetailView antes de aplicar ModuleDefaultComponent o fallback type-based. Los casos de uso incluyen rich text editors para campos de descripción larga, image uploaders para campos de imagen, color pickers para selección de colores, tags inputs para palabras clave, markdown editors para biografías, y cualquier componente especializado que mejore interacción del usuario sobre inputs HTML estándar. La precedencia es crítica: ModuleCustomComponents tiene prioridad máxima sobre ModuleDefaultComponent module-level y type-based components framework-level, asegurando que override por propiedad siempre se respete. Los componentes personalizados deben adherirse a interface v-model proporcionando prop modelValue y emitiendo update:modelValue para mantener reactividad bidireccional con entity. Este decorator participa en cadena de resolución de componentes ejecutada en DefaultDetailView donde para cada propiedad se verifica primero existencia de custom component property-specific antes de aplicar module default o type-based fallback. La arquitectura permite lazy loading de componentes complejos mediante defineAsyncComponent mejorando performance inicial cargando solo componentes necesarios cuando usuario accede al formulario. El decorator se aplica a clase de entidad definiendo Map completo de overrides en single declaración evitando decoradores separados por propiedad. Los componentes reciben metadata de propiedad permitiendo adaptación contextual según configuración de decoradores como @Required @Disabled @Readonly @HelpText. La responsabilidad de validar tipo correcto de valor emitido recae en componente personalizado manteniendo contrato con entity. Este sistema facilita modularidad permitiendo reutilizar componentes especializados across múltiples entities sin duplicar código de resolución. Los beneficios incluyen control fino por propiedad, override selectivo sin cambiar defaults, capacidad de integrar librerías third-party para funcionalidades complejas, mayor precedencia asegurando consistencia en decisiones de diseño, y facilidad de testing al centralizar overrides en declaración de clase.

## 2. Alcance

### Responsabilidades

El decorador `@ModuleCustomComponents()` es responsable de:

1. **Almacenar Map de Custom Components:** Guarda Map con pares propertyName-Component Vue en metadata de clase accesible mediante Symbol MODULE_CUSTOM_COMPONENTS_KEY

2. **Proporcionar API de Consulta:** Expone métodos getModuleCustomComponents() para obtener Map completo y getCustomComponentForProperty(propertyName) para resolver componente de propiedad específica

3. **Integración con Component Resolution:** Participa en cadena de resolución de componentes en DefaultDetailView donde se verifica primero antes de ModuleDefaultComponent y type-based fallback

4. **Conversión Object a Map:** Transforma Record<string, Component> recibido en parámetro a Map<string, Component> para acceso optimizado O(1) durante runtime

5. **Precedencia Máxima:** Asegura que componentes custom property-specific tengan mayor precedencia que module-level defaults o type-based components framework

6. **Soporte Lazy Loading:** Permite integración con defineAsyncComponent para cargar componentes complejos bajo demanda mejorando performance

### Límites (Lo que NO hace)

El decorador `@ModuleCustomComponents()` NO es responsable de:

1. **NO Renderiza Componentes:** No ejecuta lógica de renderizado, DefaultDetailView component es responsable de invocar component resolved

2. **NO Valida Props de Componentes:** No verifica que componentes personalizados implementen interface v-model correctamente, componente debe adherirse a contrato

3. **NO Maneja State de Componentes:** No gestiona estado interno de componentes custom, cada componente es responsable de su reactividad

4. **NO Proporciona Componentes Default:** No incluye componentes base, developer debe importar y referenciar componentes Vue existentes o crear custom

5. **NO Afecta ListView:** Solo afecta DetailView rendering, ListView usa lógica separada que no consulta ModuleCustomComponents

6. **NO Valida Tipos de Valores:** No valida que valor emitido por custom component sea tipo correcto para propiedad, responsabilidad del componente

7. **NO Provee Fallback Automático:** Si custom component falla loading, framework debe manejar error, decorator solo almacena referencia

8. **NO Modifica ModuleDefaultComponent:** No interfiere con module default, existen independientemente con orden de precedencia definido

## 3. Definiciones Clave

### MODULE_CUSTOM_COMPONENTS_KEY

**Definición:** Symbol único utilizado como key en metadataStore de clase para almacenar Map de custom components por propiedad. El Symbol evita colisiones con otras metadata keys y proporciona encapsulation.

```typescript
export const MODULE_CUSTOM_COMPONENTS_KEY = Symbol('module_custom_components');
```

**Uso:** Aplicado mediante decorador, accedido mediante BaseEntity methods getModuleCustomComponents() y getCustomComponentForProperty().

### ModuleCustomComponents Map

**Definición:** Map<string, Component> que asocia propertyName (string) a Component Vue. El Map se almacena directamente en clase decorated mediante MODULE_CUSTOM_COMPONENTS_KEY.

**Estructura:**
```typescript
Product[MODULE_CUSTOM_COMPONENTS_KEY] = Map {
    'description' => RichTextEditor,
    'mainImage' => ImageUploader,
    'color' => ColorPicker
}
```

**Características:** O(1) lookup performance, permite iterar componentes, soporta has() check, facilita debugging mostrando entries en devtools.

### Component Resolution Chain

**Definición:** Orden de precedencia aplicado en DefaultDetailView para determinar qué componente Vue renderizar para cada propiedad de entity.

**Orden de Precedencia:**
1. **ModuleCustomComponents (property-specific)** - Prioridad máxima
2. **ModuleDefaultComponent (module-level)** - Prioridad media
3. **Type-based Component (String → InputText, Number → InputNumber)** - Prioridad baja
4. **Fallback (InputText)** - Último recurso

**Ejemplo:**
```typescript
function resolveComponent(propertyName: string, propertyType: any): Component {
    // 1. Custom component específico
    const customComponent = entityClass.getCustomComponentForProperty(propertyName);
    if (customComponent) return customComponent;
    
    // 2. Module default component
    const moduleDefaultComponent = entityClass.getModuleDefaultComponent();
    if (moduleDefaultComponent) return moduleDefaultComponent;
    
    // 3. Type-based component
    if (propertyType === String) return InputText;
    if (propertyType === Number) return InputNumber;
    
    // 4. Fallback
    return InputText;
}
```

### v-model Contract

**Definición:** Interface requerida que todo custom component debe implementar para integrar con entity binding bidireccional en formularios.

**Requirements:**
- **Prop:** `modelValue` de tipo any para recibir valor inicial de entity property
- **Emit:** `update:modelValue` con nuevo valor cuando usuario modifica input
- **Reactividad:** Component debe reactaminar cuando modelValue prop cambia externamente

**Ejemplo:**
```typescript
interface Props {
    modelValue: any;
    property?: PropertyMetadata;  // Opcional
}

const emit = defineEmits<{
    (e: 'update:modelValue', value: any): void
}>();

// Emitir cambios
function handleChange(newValue: any) {
    emit('update:modelValue', newValue);
}
```

### Tipo Record<string, Component>

**Definición:** Objeto TypeScript donde keys son propertyNames (string) y values son Component Vue references. Utilizado como parámetro de decorador para especificar custom components.

**Ejemplo:**
```typescript
import RichTextEditor from '@/components/Form/RichTextEditor.vue';
import ImageUploader from '@/components/Form/ImageUploader.vue';


@ModuleCustomComponents({
    description: RichTextEditor,   // propertyName: Component
    mainImage: ImageUploader
})
export class Product extends BaseEntity {}
```

**Conversión a Map:** Decorator convierte Record a Map mediante `new Map(Object.entries(components))` para optimizar lookups runtime.

### Custom Component File Structure

**Definición:** Componente Vue .vue con template, script setup TypeScript, y styles scoped que implementa lógica especializada para propiedad específica.

**Características esperadas:**
- Single File Component (.vue)
- `<script setup lang="ts">` con props tipados
- Implementación v-model contract (modelValue prop + update:modelValue emit)
- Opcional: prop `property` para recibir metadata
- Styles scoped para evitar contaminación CSS
- Handling de edge cases (valores undefined, null, empty string)

### Lazy Loading de Componentes

**Definición:** Técnica de cargar componentes Vue bajo demanda sin incluirlos en bundle inicial, aplicable a custom components complejos para mejorar performance.

**Implementación:**
```typescript
import { defineAsyncComponent } from 'vue';

const RichTextEditor = defineAsyncComponent(() =>
    import('@/components/Form/RichTextEditor.vue')
);

const ImageUploader = defineAsyncComponent(() =>
    import('@/components/Form/ImageUploader.vue')
);

@ModuleCustomComponents({
    description: RichTextEditor,  // Lazy loaded
    mainImage: ImageUploader      // Lazy loaded
})
export class Product extends BaseEntity {}
```

**Beneficios:** Reduce tamaño de bundle inicial, carga componentes solo cuando usuario accede a DetailView, mejora First Contentful Paint (FCP).



## 4. Descripción Técnica

### 4.1. Implementación del Decorador

**Ubicación:** `src/decorations/module_custom_components_decorator.ts` (línea ~1-25)

```typescript
import type { Component } from 'vue';

/**
 * Symbol para almacenar metadata de module custom components
 */
export const MODULE_CUSTOM_COMPONENTS_KEY = Symbol('module_custom_components');

/**
 * @ModuleCustomComponents() - Define componentes Vue por propiedad
 * 
 * @param components - Map de propertyName → Component
 * @returns ClassDecorator
 */
export function ModuleCustomComponents(
    components: Record<string, Component>
): ClassDecorator {
    return function (target: Function) {
        // Convertir a Map para mejor acceso
        const componentsMap = new Map<string, Component>(
            Object.entries(components)
        );
        (target as any)[MODULE_CUSTOM_COMPONENTS_KEY] = componentsMap;
    };
}
```

**Elementos técnicos:**

1. **Symbol MODULE_CUSTOM_COMPONENTS_KEY:**
   - Identificador único evita colisiones con otras metadata keys
   - Almacena Map en clase directamente, no en prototype
   - Symbol es único garantizando encapsulation

2. **Parámetro components:**
   - Tipo `Record<string, Component>` para sintaxis object literal
   - Keys son propertyNames (strings)
   - Values son Component Vue references

3. **Conversión Object.entries a Map:**
   - `Object.entries()` convierte record a array de tuplas [key, value]
   - `new Map()` constructor acepta iterable de tuplas
   - Map proporciona O(1) lookup mejor que object property access

4. **Decorador aplicado a target:**
   - ClassDecorator recibe constructor function como target
   - Metadata se almacena en clase (static), no instancia
   - Accesible mediante métodos estáticos de BaseEntity

### 4.2. Metadata Storage

**Estructura en clase:**

```typescript
// Ejemplo: Product con custom components
Product[MODULE_CUSTOM_COMPONENTS_KEY] = Map {
    'description' => RichTextEditor,
    'mainImage' => ImageUploader,
    'color' => ColorPicker
}

// Ejemplo: User con custom components
User[MODULE_CUSTOM_COMPONENTS_KEY] = Map {
    'avatar' => AvatarUploader,
    'bio' => MarkdownEditor,
    'permissions' => PermissionsGrid
}
```

**Características del almacenamiento:**
- Map almacenado directamente en clase constructor
- No se almacena en prototype (diferente de property decorators)
- Cada entity class tiene su propio Map independiente
- Map puede iterar entries, verificar has(), obtener size

### 4.3. Accessors en BaseEntity

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~280-310)

```typescript
/**
 * Obtiene el Map de custom components del módulo
 * 
 * @returns Map<string, Component> o undefined
 */
public static getModuleCustomComponents(): Map<string, Component> | undefined {
    return (this as any)[MODULE_CUSTOM_COMPONENTS_KEY];
}

/**
 * Obtiene custom component para una propiedad específica
 * 
 * @param propertyName - Nombre de la propiedad
 * @returns Componente Vue o undefined
 */
public static getCustomComponentForProperty(propertyName: string): Component | undefined {
    const customComponents = this.getModuleCustomComponents();
    return customComponents?.get(propertyName);
}

/**
 * Obtiene custom component para una propiedad (método de instancia)
 */
public getCustomComponentForProperty(propertyName: string): Component | undefined {
    const constructor = this.constructor as typeof BaseEntity;
    return constructor.getCustomComponentForProperty(propertyName);
}
```

**Métodos disponibles:**

1. **getModuleCustomComponents() (estático):**
   - Retorna Map completo de propertyName → Component
   - Retorna undefined si decorador no aplicado
   - Útil para iterar todos custom components

2. **getCustomComponentForProperty() (estático):**
   - Acepta propertyName string
   - Retorna Component específico o undefined
   - O(1) lookup mediante Map.get()

3. **getCustomComponentForProperty() (instancia):**
   - Versión instancia que delega a método estático
   - Útil cuando solo se tiene entity instance
   - Accede mediante this.constructor

### 4.4. Integración con Component Resolution

**Ubicación:** `src/views/default_detailview.vue`

```vue
<template>
  <div class="detail-view">
    <div v-for="property in properties" :key="property.name" class="form-group">
      <label>{{ property.displayName }}</label>
      
      <component 
        :is="resolveComponent(property.name, property.type)"
        v-model="entity[property.name]"
        :property="property"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { BaseEntity } from '@/entities/base_entitiy';
import InputText from '@/components/Form/InputText.vue';
import InputNumber from '@/components/Form/InputNumber.vue';

interface Props {
    entity: BaseEntity;
}

const props = defineProps<Props>();

const properties = computed(() => {
    return props.entity.constructor.getProperties();
});

/**
 * Resuelve el componente para una propiedad según orden de precedencia:
 * 1. ModuleCustomComponents (property-specific)
 * 2. ModuleDefaultComponent (module-level)
 * 3. Type-based component (String → InputText, Number → InputNumber, etc.)
 */
function resolveComponent(propertyName: string, propertyType: any): Component {
    const entityClass = props.entity.constructor as typeof BaseEntity;
    
    // 1. Custom component para esta propiedad específica (HIGHEST PRIORITY)
    const customComponent = entityClass.getCustomComponentForProperty(propertyName);
    if (customComponent) {
        return customComponent;
    }
    
    // 2. Module default component
    const moduleDefaultComponent = entityClass.getModuleDefaultComponent();
    if (moduleDefaultComponent) {
        return moduleDefaultComponent;
    }
    
    // 3. Type-based component (LOWEST PRIORITY)
    if (propertyType === String) return InputText;
    if (propertyType === Number) return InputNumber;
    // ...otros tipos
    
    return InputText; // Fallback
}
</script>
```

**Component binding:**
```vue
<component 
    :is="resolveComponent(propertyName, propertyType)"
    v-model="entity[propertyName]"
    :property="propertyMetadata"
/>
```

- `v-model` establece binding bidireccional con entity property
- `:property` pass metadata opcional para componente use decorators info
- `resolveComponent` determina cuál component renderizar

### 4.5. Ejemplo de Custom Component (RichTextEditor)

**Ubicación:** `src/components/Form/RichTextEditor.vue`

```vue
<template>
  <div class="rich-text-editor">
    <div class="editor-toolbar">
      <button @click="execCommand('bold')" title="Bold"><b>B</b></button>
      <button @click="execCommand('italic')" title="Italic"><i>I</i></button>
      <button @click="execCommand('underline')" title="Underline"><u>U</u></button>
      <button @click="execCommand('insertUnorderedList')" title="Bullet List">• List</button>
      <button @click="execCommand('insertOrderedList')" title="Numbered List">1. List</button>
    </div>
    
    <div 
      ref="editorContent"
      class="editor-content"
      contenteditable="true"
      @input="handleInput"
      v-html="modelValue"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
    modelValue: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
}>();

const editorContent = ref<HTMLElement>();

function execCommand(command: string) {
    document.execCommand(command, false);
}

function handleInput() {
    if (editorContent.value) {
        emit('update:modelValue', editorContent.value.innerHTML);
    }
}

watch(() => props.modelValue, (newValue) => {
    if (editorContent.value && editorContent.value.innerHTML !== newValue) {
        editorContent.value.innerHTML = newValue;
    }
});
</script>

<style scoped>
.rich-text-editor {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
}

.editor-toolbar {
    display: flex;
    gap: 8px;
    padding: 8px;
    border-bottom: 1px solid #e5e7eb;
    background: #f9fafb;
}

.editor-toolbar button {
    padding: 4px 8px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    background: white;
    cursor: pointer;
}

.editor-toolbar button:hover {
    background: #f3f4f6;
}

.editor-content {
    min-height: 200px;
    padding: 12px;
    outline: none;
}
</style>
```

**Uso en entity:**
```typescript
import { ModuleCustomComponents } from '@/decorations/module_custom_components_decorator';
import RichTextEditor from '@/components/Form/RichTextEditor.vue';

@ModuleName('Products')
@ModuleCustomComponents({
    description: RichTextEditor  // Solo para 'description'
})
export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    id!: number;
    
    @PropertyName('Product Name', String)
    name!: string;  // Usa InputText normal
    
    @PropertyName('Description', String)
    description!: string;  // Usa RichTextEditor
    
    @PropertyName('Price', Number)
    price!: number;  // Usa InputNumber normal
}
```

## 5. Flujo de Funcionamiento

### Fase 1: Decoración de Clase (Design Time)

```typescript
import RichTextEditor from '@/components/Form/RichTextEditor.vue';
import ImageUploader from '@/components/Form/ImageUploader.vue';

@ModuleCustomComponents({
    description: RichTextEditor,
    mainImage: ImageUploader
})  // ← 1. Decorador aplicado durante compilación TypeScript
export class Product extends BaseEntity {
    // ...
}
```

**Acciones:**
1. TypeScript procesa decorador en tiempo de compilación
2. Función `ModuleCustomComponents()` se ejecuta
3. Object.entries() convierte record a array de tuplas
4. new Map() crea Map de tuplas
5. Map se almacena en Product[MODULE_CUSTOM_COMPONENTS_KEY]
6. Metadata disponible en runtime

### Fase 2: Carga de Entity Class (Runtime - Inicialización)

```typescript
// Application carga clase Product
Application.View.value.entityClass = Product;

// Metadata ya disponible en clase
console.log(Product.getModuleCustomComponents());
// Map { 'description' => RichTextEditor, 'mainImage' => ImageUploader }

console.log(Product.getCustomComponentForProperty('description'));
// RichTextEditor component reference
```

**Acciones:**
1. Aplicación carga entity class en Application singleton
2. Metadata de decorador ya almacenada en constructor
3. Métodos estáticos pueden consultar metadata sin instanciación
4. Map disponible para component resolution

### Fase 3: Renderizado de DetailView

```vue
<script setup>
const entity = ref(new Product());
const properties = computed(() => Product.getProperties());

function resolveComponent(propertyName, propertyType) {
    // Paso 1: Buscar custom component para propiedad
    const customComponent = Product.getCustomComponentForProperty(propertyName);
    //  'description' → RichTextEditor
    //  'mainImage' → ImageUploader
    //  'name' → undefined
    
    if (customComponent) {
        return customComponent;  // ← Custom component si existe
    }
    
    // Paso 2: Buscar module default component
    const moduleDefaultComponent = Product.getModuleDefaultComponent();
    if (moduleDefaultComponent) {
        return moduleDefaultComponent;
    }
    
    // Paso 3: Type-based component
    if (propertyType === String) return InputText;
    if (propertyType === Number) return InputNumber;
    
    // Paso 4: Fallback
    return InputText;
}
</script>

<template>
  <div>
    <!-- name: resuelve a InputText (type-based, no custom) -->
    <component :is="resolveComponent('name', String)" v-model="entity.name" />
    
    <!-- description: resuelve a RichTextEditor (custom component) -->
    <component :is="resolveComponent('description', String)" v-model="entity.description" />
    
    <!-- mainImage: resuelve a ImageUploader (custom component) -->
    <component :is="resolveComponent('mainImage', String)" v-model="entity.mainImage" />
    
    <!-- price: resuelve a InputNumber (type-based, no custom) -->
    <component :is="resolveComponent('price', Number)" v-model="entity.price" />
  </div>
</template>
```

**Acciones:**
1. DetailView itera propiedades de entity
2. Para cada propiedad invoca resolveComponent()
3. resolveComponent busca en orden: custom → default → type-based → fallback
4. Component correcto se renderiza con v-model binding

### Fase 4: Interacción de Usuario (User Input)

```typescript
// Usuario edita descripción en RichTextEditor
// RichTextEditor emite update:modelValue con HTML

function handleInput() {
    const htmlContent = editorContent.value.innerHTML;
    emit('update:modelValue', htmlContent);
    // Emitido: "<p>Nuevo contenido con <strong>negrita</strong></p>"
}

// v-model actualiza entity.description automáticamente
entity.description = "<p>Nuevo contenido con <strong>negrita</strong></p>"
```

**Acciones:**
1. Usuario escribe en RichTextEditor contenteditable
2. handleInput captura cambio mediante @input event
3. Component extrae innerHTML de editor
4. emit('update:modelValue', innerHTML) actualiza v-model
5. entity.description se actualiza reactivamente
6. Vue detecta cambio y actualiza computed properties

### Fase 5: Guardado (Submit)

```typescript
// Usuario clickea Save
async function saveProduct() {
    await product.save();
    
    // Request al backend:
    // POST /api/products
    // {
    //     name: "Product Name",
    //     description: "<p>HTML content</p>",  ← Valor formateado por RichTextEditor
    //     mainImage: "https://example.com/image.jpg",  ← URL de ImageUploader
    //     price: 99.99
    // }
}
```

**Acciones:**
1. Entity contiene valores actualizados por custom components
2. `save()` serializa entity a JSON
3. Backend recibe valores en formato producido por custom components
4. Backend valida y almacena datos
5. Response retorna entity actualizada

## 6. Reglas Obligatorias

### 6.1. Custom Components Deben Implementar v-model Contract

**Regla:** Todo custom component debe aceptar prop `modelValue` y emitir evento `update:modelValue` para integrar con v-model binding.

```typescript
// CORRECTO
interface Props {
    modelValue: any;
}

const emit = defineEmits<{
    (e: 'update:modelValue', value: any): void
}>();

function handleChange(newValue: any) {
    emit('update:modelValue', newValue);
}

// INCORRECTO
interface Props {
    value: any;  // Prop incorrecto
}

const emit = defineEmits<{
    (e: 'change', value: any): void  // Evento incorrecto
}>();
```

### 6.2. Property Names Deben Coincidir Exactamente

**Regla:** Keys en ModuleCustomComponents deben coincidir exactamente con propertyKey definido por @PropertyName. Case-sensitive.

```typescript
// CORRECTO
@ModuleCustomComponents({
    description: RichTextEditor  // Coincide con property 'description'
})
export class Product extends BaseEntity {
    @PropertyName('Description', String)
    description!: string;  // propertyKey es 'description'
}

// INCORRECTO
@ModuleCustomComponents({
    Description: RichTextEditor  // No coincide: 'Description' !== 'description'
})
export class Product extends BaseEntity {
    @PropertyName('Description', String)
    description!: string;
}
```

### 6.3. Custom Components Tienen Precedencia Sobre Module Default

**Regla:** Si exist ModuleCustomComponents para propiedad, siempre debe usarse sobre ModuleDefaultComponent.

```typescript
@ModuleDefaultComponent(BrandedInput)  // Default para todas
@ModuleCustomComponents({
    description: RichTextEditor  // Override para 'description'
})
export class Product extends BaseEntity {
    name!: string;        // Usa BrandedInput (default)
    description!: string; // DEBE usar RichTextEditor (custom), NO BrandedInput
}
```

### 6.4. Components Deben ser Referencias Válidas

**Regla:** Values en ModuleCustomComponents deben ser Component Vue válidos importados correctamente.

```typescript
// CORRECTO
import RichTextEditor from '@/components/Form/RichTextEditor.vue';

@ModuleCustomComponents({
    description: RichTextEditor  // Component importado correctamente
})

// INCORRECTO
@ModuleCustomComponents({
    description: 'RichTextEditor'  // String, NO component
})

// INCORRECTO
@ModuleCustomComponents({
    description: undefined  // undefined, NO component
})
```

### 6.5. Lazy Loading Debe Usar defineAsyncComponent

**Regla:** Si se hace lazy loading de custom components, usar defineAsyncComponent de Vue para carga correcta.

```typescript
// CORRECTO
import { defineAsyncComponent } from 'vue';

const RichTextEditor = defineAsyncComponent(() =>
    import('@/components/Form/RichTextEditor.vue')
);

@ModuleCustomComponents({
    description: RichTextEditor  // Lazy loaded correctamente
})

// INCORRECTO
const RichTextEditor = () => import('@/components/Form/RichTextEditor.vue');  // NO usar arrow function directa

@ModuleCustomComponents({
    description: RichTextEditor  // NO funcionará correctamente
})
```

### 6.6. Components Deben Validar Sus Propios Valores

**Regla:** Custom components son responsables de validar tipo y formato de valores emitidos. No asumir que framework validará.

```typescript
// CORRECTO - Component valida antes de emitir
function handleChange(newValue: string) {
    // Validar formato hex color
    if (!/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
        console.error('Invalid color format');
        return;
    }
    
    emit('update:modelValue', newValue);
}

// INCORRECTO - Emitir sin validar
function handleChange(newValue: string) {
    emit('update:modelValue', newValue);  // NO valida, puede emitir valor inválido
}
```

## 7. Prohibiciones

### 7.1. NO Modificar ModuleDefaultComponent Desde Custom Component

**Prohibición:** Custom components no deben intentar modificar ModuleDefaultComponent de módulo.

```typescript
// PROHIBIDO
import { ModuleCustomComponents } from '@/decorations/module_custom_components_decorator';

export class Product extends BaseEntity {
    static {
        // NO intentar modificar ModuleDefaultComponent aquí
        this.setModuleDefaultComponent(CustomComponent);
    }
}

// PERMITIDO - Usar decoradores apropiados
@ModuleDefaultComponent(BrandedInput)
@ModuleCustomComponents({
    description: RichTextEditor
})
export class Product extends BaseEntity {}
```

### 7.2. NO Usar Custom Components Para ListView

**Prohibición:** ModuleCustomComponents NO afecta ListView rendering. ListView usa lógica separada.

```typescript
// PROHIBIDO - Asumir que custom component se usa en ListView
@ModuleCustomComponents({
    description: RichTextEditor  // Solo afecta DetailView, NO ListView
})
export class Product extends BaseEntity {
    description!: string;  // En ListView usa @DisplayFormat o rendering default
}

// PERMITIDO - Usar @DisplayFormat para ListView
@DisplayFormat((value: string) => value.substring(0, 100))
@ModuleCustomComponents({
    description: RichTextEditor  // DetailView usa RichTextEditor
})
export class Product extends BaseEntity {
    description!: string;  // ListView usa DisplayFormat truncation
}
```

### 7.3. NO Almacenar State en Decorator Mismo

**Prohibición:** Decorator no debe almacenar state dinámico. Solo configuración estática.

```typescript
// PROHIBIDO - State dinámico en decorator
let currentEditorValue = '';

export function ModuleCustomComponents(components: Record<string, Component>) {
    return function (target: Function) {
        currentEditorValue = 'something';  // NO almacenar state aquí
        (target as any)[MODULE_CUSTOM_COMPONENTS_KEY] = new Map(Object.entries(components));
    };
}

// PERMITIDO - State en components
const editorValue = ref('');  // State en component Vue

```

### 7.4. NO Usar Property Names No Existentes

**Prohibición:** No definir custom components para propiedades que no existen en entity.

```typescript
// PROHIBIDO
@ModuleCustomComponents({
    nonExistentProperty: RichTextEditor  // Esta propiedad NO existe en Product
})
export class Product extends BaseEntity {
    name!: string;
    price!: number;
}

// PERMITIDO
@ModuleCustomComponents({
    name: CustomNameInput  // Propiedad 'name' existe
})
export class Product extends BaseEntity {
    name!: string;
    price!: number;
}
```

### 7.5. NO Combinar Múltiples Decoradores @ModuleCustomComponents

**Prohibición:** No aplicar múltiples `@ModuleCustomComponents` a misma clase. Solo uno permitido.

```typescript
// PROHIBIDO
@ModuleCustomComponents({
    description: RichTextEditor
})
@ModuleCustomComponents({  // Segundo decorator sobrescribe primero
    mainImage: ImageUploader
})
export class Product extends BaseEntity {}

// PERMITIDO - Un decorator con múltiples entries
@ModuleCustomComponents({
    description: RichTextEditor,
    mainImage: ImageUploader  // Múltiples propiedades en single decorator
})
export class Product extends BaseEntity {}
```

### 7.6. NO Asumir Que Todos Custom Components Cargan Exitosamente

**Prohibición:** No asumir que lazy loaded components siempre cargarán exitosamente. Manejar errores.

```typescript
// PROHIBIDO - Sin error handling
const RichTextEditor = defineAsyncComponent(() =>
    import('@/components/Form/RichTextEditor.vue')  // Puede fallar
);

// PERMITIDO - Con error handling
const RichTextEditor = defineAsyncComponent({
    loader: () => import('@/components/Form/RichTextEditor.vue'),
    errorComponent: ErrorComponentFallback,
    delay: 200,
    timeout: 3000
});
```

## 8. Dependencias e Integraciones

### 8.1. BaseEntity (Core)

**Relación:** BaseEntity proporciona accessors estáticos e instancia para consultar custom components.

**Dependencias:**
```typescript
// src/entities/base_entitiy.ts
import { MODULE_CUSTOM_COMPONENTS_KEY } from '@/decorations/module_custom_components_decorator';

public static getModuleCustomComponents(): Map<string, Component> | undefined
public static getCustomComponentForProperty(propertyName: string): Component | undefined
public getCustomComponentForProperty(propertyName: string): Component | undefined
```

**Uso:** Decorador almacena Map, BaseEntity lo lee mediante accessors.

### 8.2. DefaultDetailView Component

**Relación:** DefaultDetailView ejecuta component resolution chain para renderizar custom components.

**Dependencias:**
```vue
<!-- src/views/default_detailview.vue -->
<script setup>
import type { BaseEntity } from '@/entities/base_entitiy';

function resolveComponent(propertyName: string, propertyType: any): Component {
    const customComponent = entityClass.getCustomComponentForProperty(propertyName);
    if (customComponent) return customComponent;
    // ... resto de resolution chain
}
</script>
```

**Uso:** DetailView invoca getCustomComponentForProperty() para cada propiedad.

### 8.3. Vue Component System

**Relación:** Custom components son Vue Single File Components standard.

**Requirements:**
- Implementar v-model contract (modelValue prop + update:modelValue emit)
- Tipado TypeScript para props
- Optional: Recibir prop :property con metadata

**Integración:**
```vue
<component 
    :is="customComponent"
    v-model="entity[propertyName]"
    :property="propertyMetadata"
/>
```

### 8.4. @ModuleDefaultComponent Decorator

**Relación:** ModuleDefaultComponent proporciona fallback module-level, precedencia menor que ModuleCustomComponents.

**Coordinación:**
```typescript
// ModuleDefaultComponent: Componente para TODAS las propiedades
@ModuleDefaultComponent(BrandedInput)

// ModuleCustomComponents: Override para propiedades específicas
@ModuleCustomComponents({
    description: RichTextEditor  // Override solo 'description'
})

export class Product extends BaseEntity {
    name!: string;        // Usa BrandedInput (default)
    description!: string; // Usa RichTextEditor (custom override)
    price!: number;       // Usa BrandedInput (default)
}
```

### 8.5. @PropertyName Decorator

**Relación:** PropertyName define propiedades que pueden tener custom components asociados.

**Dependencia:**
```typescript
@ModuleCustomComponents({
    description: RichTextEditor  // 'description' debe existir como property
})
export class Product extends BaseEntity {
    @PropertyName('Description', String)
    description!: string;  // PropertyName define esta propiedad
}
```

### 8.6. defineAsyncComponent (Vue API)

**Relación:** API de Vue para lazy loading de custom components mejorando performance.

**Uso:**
```typescript
import { defineAsyncComponent } from 'vue';

const RichTextEditor = defineAsyncComponent(() =>
    import('@/components/Form/RichTextEditor.vue')
);

@ModuleCustomComponents({
    description: RichTextEditor  // Lazy loaded
})
```

### 8.7. Application Singleton

**Relación:** Application singleton carga entity class haciendo metadata disponible.

**Flow:**
```typescript
// Application carga entity
Application.View.value.entityClass = Product;

// Metadata accesible
const customComponents = Product.getModuleCustomComponents();
```

## 9. Relaciones con Otros Elementos

### 9.1. Con @ModuleDefaultComponent (Precedencia)

**Relación:** ModuleCustomComponents tiene mayor precedencia que ModuleDefaultComponent.

```typescript
@ModuleDefaultComponent(BrandedInput)  // Prioridad media
@ModuleCustomComponents({
    description: RichTextEditor  // Prioridad alta (override)
})
export class Product extends BaseEntity {
    name!: string;        // BrandedInput
    description!: string; // RichTextEditor (override)
    price!: number;       // BrandedInput
}
```

### 9.2. Con @ModuleDetailComponent (Separación)

**Relación:** ModuleDetailComponent reemplaza DetailView completa, ModuleCustomComponents solo overrides propiedades individuales.

```typescript
// ModuleDetailComponent: Reemplaza DetailView entera
@ModuleDetailComponent(CustomDetailView)
export class Product extends BaseEntity {}

// ModuleCustomComponents: Override propiedades dentro de DetailView default
@ModuleCustomComponents({
    description: RichTextEditor
})
export class Product extends BaseEntity {}

// NO combinar - ModuleDetailComponent tiene precedencia total
```

### 9.3. Con @DisplayFormat (Separación ListView vs DetailView)

**Relación:** DisplayFormat afecta ListView rendering, ModuleCustomComponents afecta DetailView editing.

```typescript
@DisplayFormat((value: string) => value.substring(0, 100))  // ListView
@ModuleCustomComponents({
    description: RichTextEditor  // DetailView
})
export class Product extends BaseEntity {
    description!: string;
    // ListView: muestra truncado con DisplayFormat
    // DetailView: edita con RichTextEditor
}
```

### 9.4. Con @PropertyName (Dependencia)

**Relación:** PropertyName define propiedades, ModuleCustomComponents asocia componentes a esas propiedades.

```typescript
@ModuleCustomComponents({
    description: RichTextEditor  // Referencia 'description'
})
export class Product extends BaseEntity {
    @PropertyName('Description', String)
    description!: string;  // Debe existir y coincidir
}
```

### 9.5. Con @Readonly/@Disabled (Afecta Custom Components)

**Relación:** Custom components deben respetar metadata de @Readonly/@Disabled.

```typescript
@ModuleCustomComponents({
    description: RichTextEditor
})
export class Product extends BaseEntity {
    @PropertyName('Description', String)
    @Readonly()
    description!: string;  // RichTextEditor debe renderizar readonly
}

// Custom component recibe metadata
<component 
    :is="RichTextEditor"
    v-model="entity.description"
    :property="{ readonly: true }"  // Metadata incluye readonly
/>
```

### 9.6. Con Type-based Components (Fallback)

**Relación:** Type-based components son fallback cuando ModuleCustomComponents y ModuleDefaultComponent no definidos.

```typescript
@ModuleCustomComponents({
    description: RichTextEditor  // Override solo 'description'
})
export class Product extends BaseEntity {
    name!: string;        // Usa InputText (type-based fallback)
    description!: string; // Usa RichTextEditor (custom)
    price!: number;       // Usa InputNumber (type-based fallback)
}
```

## 10. Notas de Implementación

### Nota 1: Order of Precedence en Component Resolution

Component resolution sigue orden estricto:

```typescript
function resolveComponent(propertyName: string, propertyType: any): Component {
    // 1. ModuleCustomComponents (HIGHEST)
    const customComponent = entityClass.getCustomComponentForProperty(propertyName);
    if (customComponent) return customComponent;
    
    // 2. ModuleDefaultComponent (MIDDLE)
    const moduleDefaultComponent = entityClass.getModuleDefaultComponent();
    if (moduleDefaultComponent) return moduleDefaultComponent;
    
    // 3. Type-based Component (LOW)
    if (propertyType === String) return InputText;
    if (propertyType === Number) return InputNumber;
    if (propertyType === Boolean) return InputCheckbox;
    if (propertyType === Date) return InputDate;
    
    // 4. Fallback (LOWEST)
    return InputText;
}
```

### Nota 2: Map vs Object para Storage

Decorator convierte Record a Map por ventajas:

```typescript
// Object.entries + Map constructor
const componentsMap = new Map<string, Component>(
    Object.entries(components)
);

// Ventajas de Map:
// - O(1) lookup con .get(key)
// - .has(key) para checking existence
// - .size para count
// - Iterable con .entries(), .keys(), .values()
// - No colisión con Object.prototype properties
```

### Nota 3: Custom Component Props Contract

Custom components pueden recibir props adicionales:

```typescript
interface Props {
    modelValue: any;              // REQUIRED: valor actual
    property?: PropertyMetadata;  // OPTIONAL: metadata de decoradores
}

// PropertyMetadata incluye:
interface PropertyMetadata {
    name: string;
    displayName: string;
    type: any;
    required: boolean;
    readonly: boolean;
    disabled: boolean;
    helpText?: string;
    // ... otros decoradores
}
```

### Nota 4: Lazy Loading Strategy

Lazy load componentes grandes para performance:

```typescript
// RichTextEditor, ImageUploader, etc. son grandes
const RichTextEditor = defineAsyncComponent({
    loader: () => import('@/components/Form/RichTextEditor.vue'),
    loadingComponent: LoadingSpinner,
    errorComponent: ErrorFallback,
    delay: 200,      // Delay antes de mostrar loading
    timeout: 3000    // Timeout para mostrar error
});

@ModuleCustomComponents({
    description: RichTextEditor  // Carga cuando DetailView abre
})
```

**Beneficios:**
- Bundle inicial más pequeño
-First Contentful Paint mejorado
- Carga bajo demanda cuando usuario accede DetailView

### Nota 5: Testing Custom Components Integration

Test que component resolution funciona:

```typescript
import { mount } from '@vue/test-utils';
import DefaultDetailView from '@/views/default_detailview.vue';
import RichTextEditor from '@/components/Form/RichTextEditor.vue';

describe('ModuleCustomComponents integration', () => {
    it('should resolve custom component for property', () => {
        const product = new Product();
        
        const wrapper = mount(DefaultDetailView, {
            props: { entity: product }
        });
        
        // Find component for 'description' property
        const descriptionComponent = wrapper.findComponent(RichTextEditor);
        expect(descriptionComponent.exists()).toBe(true);
    });
    
    it('should fallback to type-based for properties without custom', () => {
        const product = new Product();
        
        const wrapper = mount(DefaultDetailView, {
            props: { entity: product }
        });
        
        // 'name' no tiene custom component, usa InputText
        const nameComponent = wrapper.findComponent(InputText);
        expect(nameComponent.exists()).toBe(true);
    });
});
```

### Nota 6: Error Handling en Lazy Loading

Manejar fallos de carga:

```vue
<!-- ErrorFallback.vue -->
<template>
  <div class="error-fallback">
    <p>Failed to load custom component.</p>
    <button @click="retry">Retry</button>
  </div>
</template>

<script setup>
function retry() {
    location.reload();
}
</script>
```

```typescript
const RichTextEditor = defineAsyncComponent({
    loader: () => import('@/components/Form/RichTextEditor.vue'),
    errorComponent: ErrorFallback,  // Muestra si falla
    timeout: 3000
});
```

### Nota 7: Component Caching

Vue cachea async components después de primera carga:

```typescript
// Primera vez: descarga component
const RichTextEditor = defineAsyncComponent(() => 
    import('@/components/Form/RichTextEditor.vue')
);

// Uso en entity
@ModuleCustomComponents({
    description: RichTextEditor
})

// Segunda vez usuario abre DetailView: usa cache
// No re-descarga component
```

### Nota 8: TypeScript Type Safety

Aprovechar TypeScript para type safety:

```typescript
import type { Component } from 'vue';

// Type-safe component references
const RichTextEditor: Component = defineAsyncComponent(() =>
    import('@/components/Form/RichTextEditor.vue')
);

// Type-safe ModuleCustomComponents parameter
@ModuleCustomComponents({
    description: RichTextEditor,  // TypeScript verifica es Component
    mainImage: ImageUploader      // TypeScript verifica es Component
})
```

### Nota 9: DevTools Inspection

Map es inspectable en Vue DevTools:

```javascript
// En devtools console:
const customComponents = Product.getModuleCustomComponents();
console.log([...customComponents]);
// [ ['description', RichTextEditor], ['mainImage', ImageUploader] ]

console.log(customComponents.get('description'));
// RichTextEditor component definition
```

### Nota 10: Performance Monitoring

Monitor performance de custom components:

```typescript
function resolveComponent(propertyName: string, propertyType: any): Component {
    const startTime = performance.now();
    
    const customComponent = entityClass.getCustomComponentForProperty(propertyName);
    
    const endTime = performance.now();
    if (endTime - startTime > 5) {
        console.warn(`Slow component resolution for ${propertyName}: ${endTime - startTime}ms`);
    }
    
    return customComponent || fallback;
}
```

## 11. Referencias Cruzadas

### Documentación de Framework

- [Base Entity Core](../../02-base-entity/base-entity-core.md) - Métodos `getModuleCustomComponents()` y `getCustomComponentForProperty()`
- [Metadata Access](../../02-base-entity/metadata-access.md) - Sistema de metadata y accessors

### Decoradores Relacionados

- [Module Default Component](module-default-component-decorator.md) - Componente default module-level (precedencia media)
- [Module Detail Component](module-detail-component-decorator.md) - Componente para DetailView completa (reemplaza toda vista)
- [Module List Component](module-list-component-decorator.md) - Componente para ListView completa
- [Property Name](property-name-decorator.md) - Define propiedades que pueden asociarse a custom components
- [Display Format](display-format-decorator.md) - Formatea salida ListView (separado de custom components DetailView)
- [Readonly Decorator](readonly-decorator.md) - Custom components deben respetar readonly metadata
- [Disabled Decorator](disabled-decorator.md) - Custom components deben respetar disabled metadata

### Componentes Vue

- DefaultDetailView (src/views/default_detailview.vue) - Ejecuta component resolution chain
- InputText (src/components/Form/InputText.vue) - Type-based fallback para String
- InputNumber (src/components/Form/InputNumber.vue) - Type-based fallback para Number

### API de Vue

- defineAsyncComponent - Lazy loading de custom components
- Component type - Tipo TypeScript para component references
- v-model directive - Binding bidireccional con custom components

### Tutoriales

- [Basic CRUD Tutorial](../../tutorials/01-basic-crud.md) - Uso básico de formularios
- [Advanced Module Example](../../examples/advanced-module-example.md) - Ejemplo con custom components

**Ubicación del archivo fuente:**
- Decorador: `src/decorations/module_custom_components_decorator.ts` (~25 líneas)

**Símbolos exportados:**
```typescript
export const MODULE_CUSTOM_COMPONENTS_KEY: Symbol
export function ModuleCustomComponents(components: Record<string, Component>): ClassDecorator
```

**Ejemplos de Custom Components:**
- RichTextEditor.vue - Editor wysiwyg con toolbar
- ImageUploader.vue - Upload de imágenes con preview
- ColorPicker.vue - Selector de colores con presets
- TagsInput.vue - Input de tags con comma-separated storage
- MarkdownEditor.vue - Editor markdown con preview tab
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        
        // Emitir URL del servidor
        emit('update:modelValue', data.url);
    } catch (error) {
        console.error('Upload failed:', error);
        alert('Failed to upload image');
    }
}

function removeImage() {
    previewUrl.value = '';
    emit('update:modelValue', '');
}
</script>

<style scoped>
.image-uploader {
    width: 100%;
}

.image-preview {
    position: relative;
    width: 200px;
}

.image-preview img {
    width: 100%;
    border-radius: 8px;
}

.remove-button {
    position: absolute;
    top: 8px;
    right: 8px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    cursor: pointer;
}

.upload-zone {
    border: 2px dashed #d1d5db;
    border-radius: 8px;
    padding: 40px;
    text-align: center;
    cursor: pointer;
}

.upload-zone:hover {
    border-color: #2563eb;
    background: #f9fafb;
}

.upload-icon {
    font-size: 48px;
    margin-bottom: 12px;
}
</style>
```

```typescript
import ImageUploader from '@/components/Form/ImageUploader.vue';

@ModuleName('Products')
@ModuleCustomComponents({
    description: RichTextEditor,
    mainImage: ImageUploader,     // ← ImageUploader para mainImage
    thumbnailImage: ImageUploader  // ← ImageUploader para thumbnailImage
})
export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    id!: number;
    
    @PropertyName('Product Name', String)
    name!: string;
    
    @PropertyName('Description', String)
    description!: string;
    
    @PropertyName('Main Image', String)
    mainImage!: string;  // ← ImageUploader
    
    @PropertyName('Thumbnail', String)
    thumbnailImage!: string;  // ← ImageUploader
    
    @PropertyName('Price', Number)
    price!: number;
}
```

---

### 3. Color Picker para Color

```vue
<!-- components/Form/ColorPicker.vue -->

<template>
  <div class="color-picker">
    <div class="color-preview" :style="{ backgroundColor: modelValue }"></div>
    
    <input 
      type="color" 
      :value="modelValue"
      @input="handleColorChange"
      class="color-input"
    />
    
    <input 
      type="text" 
      :value="modelValue"
      @input="handleTextChange"
      placeholder="#000000"
      class="color-text"
    />
    
    <div class="preset-colors">
      <div 
        v-for="color in presetColors" 
        :key="color"
        class="preset-color"
        :style="{ backgroundColor: color }"
        @click="selectColor(color)"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
    modelValue: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
}>();

const presetColors = [
    '#000000', '#ffffff', '#ef4444', '#f59e0b', 
    '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'
];

function handleColorChange(event: Event) {
    const target = event.target as HTMLInputElement;
    emit('update:modelValue', target.value);
}

function handleTextChange(event: Event) {
    const target = event.target as HTMLInputElement;
    emit('update:modelValue', target.value);
}

function selectColor(color: string) {
    emit('update:modelValue', color);
}
</script>

<style scoped>
.color-picker {
    display: flex;
    align-items: center;
    gap: 12px;
}

.color-preview {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    border: 2px solid #e5e7eb;
}

.color-input {
    width: 60px;
    height: 40px;
    border: none;
    cursor: pointer;
}

.color-text {
    padding: 8px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    width: 100px;
}

.preset-colors {
    display: flex;
    gap: 8px;
}

.preset-color {
    width: 32px;
    height: 32px;
    border-radius: 4px;
    cursor: pointer;
    border: 2px solid #e5e7eb;
}

.preset-color:hover {
    border-color: #2563eb;
}
</style>
```

```typescript
import ColorPicker from '@/components/Form/ColorPicker.vue';

@ModuleName('Products')
@ModuleCustomComponents({
    description: RichTextEditor,
    mainImage: ImageUploader,
    color: ColorPicker  // ← ColorPicker para color
})
export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    id!: number;
    
    @PropertyName('Product Name', String)
    name!: string;
    
    @PropertyName('Color', String)
    color!: string;  // ← ColorPicker (hex value)
    
    @PropertyName('Price', Number)
    price!: number;
}
```

---

### 4. Tags Input para Keywords

```vue
<!-- components/Form/TagsInput.vue -->

<template>
  <div class="tags-input">
    <div class="tags-container">
      <div 
        v-for="(tag, index) in tags" 
        :key="index"
        class="tag"
      >
        {{ tag }}
        <button @click="removeTag(index)" class="tag-remove">×</button>
      </div>
      
      <input 
        v-model="inputValue"
        type="text"
        placeholder="Add tag..."
        @keydown.enter.prevent="addTag"
        @keydown.comma.prevent="addTag"
        class="tag-input"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface Props {
    modelValue: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
}>();

const inputValue = ref('');

// Parse comma-separated string to array
const tags = computed(() => {
    return props.modelValue ? props.modelValue.split(',').map(t => t.trim()) : [];
});

function addTag() {
    const tag = inputValue.value.trim();
    if (!tag) return;
    
    const newTags = [...tags.value, tag];
    emit('update:modelValue', newTags.join(', '));
    inputValue.value = '';
}

function removeTag(index: number) {
    const newTags = tags.value.filter((_, i) => i !== index);
    emit('update:modelValue', newTags.join(', '));
}
</script>

<style scoped>
.tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    min-height: 40px;
}

.tag {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    background: #2563eb;
    color: white;
    border-radius: 4px;
    font-size: 14px;
}

.tag-remove {
    background: none;
    border: none;
    color: white;
    font-size: 18px;
    cursor: pointer;
    padding: 0;
    width: 20px;
    height: 20px;
}

.tag-input {
    flex: 1;
    border: none;
    outline: none;
    min-width: 120px;
}
</style>
```

```typescript
import TagsInput from '@/components/Form/TagsInput.vue';

@ModuleName('Products')
@ModuleCustomComponents({
    description: RichTextEditor,
    mainImage: ImageUploader,
    color: ColorPicker,
    keywords: TagsInput  // ← TagsInput para keywords
})
export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    id!: number;
    
    @PropertyName('Product Name', String)
    name!: string;
    
    @PropertyName('Keywords', String)
    keywords!: string;  // ← TagsInput (comma-separated)
    
    @PropertyName('Price', Number)
    price!: number;
}
```

---

### 5. Markdown Editor para Bio

```vue
<!-- components/Form/MarkdownEditor.vue -->

<template>
  <div class="markdown-editor">
    <div class="editor-tabs">
      <button 
        :class="{ active: activeTab === 'edit' }"
        @click="activeTab = 'edit'"
      >
        Edit
      </button>
      <button 
        :class="{ active: activeTab === 'preview' }"
        @click="activeTab = 'preview'"
      >
        Preview
      </button>
    </div>
    
    <div class="editor-content">
      <textarea 
        v-if="activeTab === 'edit'"
        v-model="internalValue"
        @input="handleInput"
        class="markdown-textarea"
        placeholder="# Title\n\nWrite markdown here..."
      ></textarea>
      
      <div 
        v-else
        class="markdown-preview"
        v-html="renderedMarkdown"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
// import { marked } from 'marked';

interface Props {
    modelValue: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
}>();

const activeTab = ref<'edit' | 'preview'>('edit');
const internalValue = ref(props.modelValue);

const renderedMarkdown = computed(() => {
    // return marked(internalValue.value);
    // Simplified for demo (sin marked library)
    return internalValue.value
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>');
});

function handleInput() {
    emit('update:modelValue', internalValue.value);
}
</script>

<style scoped>
.markdown-editor {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
}

.editor-tabs {
    display: flex;
    border-bottom: 1px solid #e5e7eb;
}

.editor-tabs button {
    flex: 1;
    padding: 12px;
    border: none;
    background: #f9fafb;
    cursor: pointer;
}

.editor-tabs button.active {
    background: white;
    border-bottom: 2px solid #2563eb;
}

.editor-content {
    min-height: 300px;
}

.markdown-textarea {
    width: 100%;
    min-height: 300px;
    padding: 16px;
    border: none;
    outline: none;
    resize: vertical;
    font-family: monospace;
}

.markdown-preview {
    padding: 16px;
}
</style>
```

```typescript
import MarkdownEditor from '@/components/Form/MarkdownEditor.vue';
import AvatarUploader from '@/components/Form/AvatarUploader.vue';

@ModuleName('Users')
@ModuleCustomComponents({
    avatar: AvatarUploader,
    bio: MarkdownEditor  // ← MarkdownEditor para bio
})
export class User extends BaseEntity {
    @PropertyName('User ID', Number)
    id!: number;
    
    @PropertyName('Full Name', String)
    fullName!: string;
    
    @PropertyName('Email', String)
    email!: string;
    
    @PropertyName('Avatar', String)
    avatar!: string;  // ← AvatarUploader
    
    @PropertyName('Bio', String)
    bio!: string;  // ← MarkdownEditor
}
```

---

## ⚠️ Consideraciones Importantes

### 1. Component Resolution Order (Precedence)

```typescript
/**
 * Orden de precedencia para resolver componentes:
 * 
 * 1. ModuleCustomComponents (property-specific) ← HIGHEST
 * 2. ModuleDefaultComponent (module-level)
 * 3. Type-based component (String → InputText)
 * 4. Fallback (InputText) ← LOWEST
 */

// Ejemplo:
@ModuleDefaultComponent(BrandedInput)  // Para TODAS las propiedades
@ModuleCustomComponents({
    description: RichTextEditor  // Solo para 'description' (override)
})
export class Product extends BaseEntity {
    name!: string;        // ← Usa BrandedInput (ModuleDefaultComponent)
    description!: string; // ← Usa RichTextEditor (ModuleCustomComponents override)
    price!: number;       // ← Usa BrandedInput (ModuleDefaultComponent)
}
```

### 2. Custom Component MUST Accept v-model

```typescript
// Todos los custom components deben aceptar v-model
interface Props {
    modelValue: any;
}

const emit = defineEmits<{
    (e: 'update:modelValue', value: any): void
}>();

// Emitir cuando cambia el valor
function handleChange(newValue: any) {
    emit('update:modelValue', newValue);
}
```

### 3. Custom Component Props

```typescript
// Los custom components reciben prop adicional 'property'
<component 
    :is="customComponent"
    v-model="entity[propertyName]"
    :property="propertyMetadata"  // ← Metadata de la propiedad
/>

// En el componente:
interface Props {
    modelValue: any;
    property?: PropertyMetadata;  // Opcional
}
```

### 4. Testing ModuleCustomComponents

```typescript
describe('Product ModuleCustomComponents', () => {
    it('should have custom components map', () => {
        const customComponents = Product.getModuleCustomComponents();
        
        expect(customComponents).toBeInstanceOf(Map);
        expect(customComponents?.get('description')).toBe(RichTextEditor);
        expect(customComponents?.get('mainImage')).toBe(ImageUploader);
    });
    
    it('should resolve custom component over default', () => {
        const descriptionComponent = Product.getCustomComponentForProperty('description');
        expect(descriptionComponent).toBe(RichTextEditor);
        
        const nameComponent = Product.getCustomComponentForProperty('name');
        expect(nameComponent).toBeUndefined();  // No custom component
    });
});
```

### 5. Performance with Complex Components

```typescript
// Lazy load componentes complejos
const RichTextEditor = defineAsyncComponent(() =>
    import('@/components/Form/RichTextEditor.vue')
);

const ImageUploader = defineAsyncComponent(() =>
    import('@/components/Form/ImageUploader.vue')
);

@ModuleCustomComponents({
    description: RichTextEditor,  // ← Lazy loaded
    mainImage: ImageUploader      // ← Lazy loaded
})
export class Product extends BaseEntity {
    // ...
}
```

---

## 📊 Comparación: ModuleCustomComponents vs ModuleDefaultComponent vs Type-based

| Característica | ModuleCustomComponents | ModuleDefaultComponent | Type-based Component |
|----------------|------------------------|------------------------|----------------------|
| **Scope** | Per-property | Module-level | Global framework |
| **Precedence** | Highest | Middle | Lowest |
| **Granularidad** | Muy alta | Media | Baja |
| **Override** | Propiedad específica | Todas las propiedades | Todas las entidades |
| **Uso** | Componentes especializados | UI consistente en módulo | Componentes base |
| **Ejemplo** | RichTextEditor para 'description' | BrandedInput para todas | InputText para String |

### Ejemplo Combinado

```typescript
// Type-based: InputText para todos los String (framework)
// ModuleDefaultComponent: BrandedInput para todas las propiedades de Product
// ModuleCustomComponents: RichTextEditor solo para 'description'

@ModuleName('Products')
@ModuleDefaultComponent(BrandedInput)
@ModuleCustomComponents({
    description: RichTextEditor,
    mainImage: ImageUploader,
    color: ColorPicker
})
export class Product extends BaseEntity {
    @PropertyName('Name', String)
    name!: string;  // ← BrandedInput (module default)
    
    @PropertyName('SKU', String)
    sku!: string;  // ← BrandedInput (module default)
    
    @PropertyName('Description', String)
    description!: string;  // ← RichTextEditor (custom override)
    
    @PropertyName('Main Image', String)
    mainImage!: string;  // ← ImageUploader (custom override)
    
    @PropertyName('Color', String)
    color!: string;  // ← ColorPicker (custom override)
    
    @PropertyName('Price', Number)
    price!: number;  // ← BrandedInput (module default adapta Number)
}
```

---

## 📚 Referencias Adicionales

- `module-default-component-decorator.md` - Componente default por módulo
- `module-detail-component-decorator.md` - Componente para DetailView
- `module-list-component-decorator.md` - Componente para ListView
- `property-name-decorator.md` - Define propiedades
- `../../02-base-entity/base-entity-core.md` - getModuleCustomComponents()
- `../../03-application/application-views.md` - Component resolution

---

**Última actualización:** 10 de Febrero, 2026  
**Archivo fuente:** `src/decorations/module_custom_components_decorator.ts`  
**Líneas:** ~25
