# 📋 ModuleCustomComponents Decorator

**Referencias:**
- `module-default-component-decorator.md` - ModuleDefaultComponent para componente base
- `module-detail-component-decorator.md` - ModuleDetailComponent para DetailView completa
- `module-list-component-decorator.md` - ModuleListComponent para ListView completa
- `property-name-decorator.md` - PropertyName define propiedades que pueden tener custom components
- `../../02-base-entity/base-entity-core.md` - getModuleCustomComponents() accessor

---

## 📍 Ubicación en el Código

**Archivo:** `src/decorations/module_custom_components_decorator.ts`

---

## 🎯 Propósito

El decorador `@ModuleCustomComponents()` define un **Map de componentes Vue personalizados** por **propiedad específica**. Permite override granular de componentes para propiedades individuales sin cambiar el ModuleDefaultComponent.

**Beneficios:**
- Control fino por propiedad
- Override selectivo sin cambiar default
- Componentes especializados (rich text, file upload, color picker)
- Mayor precedencia que ModuleDefaultComponent

---

## 📝 Sintaxis

```typescript
import type { Component } from 'vue';

@ModuleCustomComponents({
    propertyName: CustomComponent,
    anotherProperty: AnotherComponent
})
export class EntityName extends BaseEntity {
    // ...
}
```

### Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `components` | `Record<string, Component>` | Sí | Map de propiedad → componente |

---

## 💾 Implementación

### Código del Decorador

```typescript
// src/decorations/module_custom_components_decorator.ts

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

**Ubicación:** `src/decorations/module_custom_components_decorator.ts` (línea ~1-25)

---

## 🔍 Metadata Storage

### Estructura en Class

```typescript
// Metadata se guarda como Map en la clase
Product[MODULE_CUSTOM_COMPONENTS_KEY] = Map {
    'description' => RichTextEditor,
    'mainImage' => ImageUploader,
    'color' => ColorPicker
}

User[MODULE_CUSTOM_COMPONENTS_KEY] = Map {
    'avatar' => AvatarUploader,
    'bio' => MarkdownEditor,
    'permissions' => PermissionsGrid
}
```

### Acceso desde BaseEntity

```typescript
// src/entities/base_entitiy.ts

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

**Ubicación:** `src/entities/base_entitiy.ts` (línea ~280-310)

---

## 🎨 Impacto en DetailView

### Component Resolution Chain

```vue
<!-- views/default_detailview.vue -->

<template>
  <div class="detail-view">
    <div v-for="property in properties" :key="property.name" class="form-group">
      <label>{{ property.displayName }}</label>
      
      <!-- Renderizar componente apropiado según precedencia -->
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

---

## 🧪 Ejemplos de Uso

### 1. Rich Text Editor para Descripción

```vue
<!-- components/Form/RichTextEditor.vue -->

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

```typescript
import { ModuleCustomComponents } from '@/decorations/module_custom_components_decorator';
import RichTextEditor from '@/components/Form/RichTextEditor.vue';

@ModuleName('Products')
@ModuleCustomComponents({
    description: RichTextEditor  // ← Solo para 'description'
})
export class Product extends BaseEntity {
    @PropertyName('Product ID', Number)
    id!: number;
    
    @PropertyName('Product Name', String)
    name!: string;  // ← Usa InputText normal
    
    @PropertyName('Description', String)
    description!: string;  // ← Usa RichTextEditor
    
    @PropertyName('Price', Number)
    price!: number;  // ← Usa InputNumber normal
}
```

---

### 2. Image Uploader para Fotos

```vue
<!-- components/Form/ImageUploader.vue -->

<template>
  <div class="image-uploader">
    <div v-if="previewUrl" class="image-preview">
      <img :src="previewUrl" alt="Preview" />
      <button @click="removeImage" class="remove-button">✕</button>
    </div>
    
    <div v-else class="upload-zone" @click="triggerFileInput">
      <input 
        ref="fileInput"
        type="file"
        accept="image/*"
        @change="handleFileUpload"
        style="display: none"
      />
      <div class="upload-icon">📷</div>
      <p>Click to upload image</p>
    </div>
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

const fileInput = ref<HTMLInputElement>();
const previewUrl = ref(props.modelValue);

watch(() => props.modelValue, (newValue) => {
    previewUrl.value = newValue;
});

function triggerFileInput() {
    fileInput.value?.click();
}

async function handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (!file) return;
    
    // Preview local
    const reader = new FileReader();
    reader.onload = (e) => {
        previewUrl.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
    
    // Upload a servidor
    const formData = new FormData();
    formData.append('image', file);
    
    try {
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
