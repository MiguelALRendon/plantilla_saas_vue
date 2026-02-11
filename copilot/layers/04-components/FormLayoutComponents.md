# 📦 Form Layout Components

**Referencias:**
- `form-inputs.md` - Componentes de inputs
- `core-components.md` - Componentes core del framework

---

## 📍 Ubicación en el Código

**Archivos:**
- `src/components/Form/FormGroupComponent.vue` - Agrupador de secciones
- `src/components/Form/FormRowTwoItemsComponent.vue` - Fila con 2 items
- `src/components/Form/FormRowThreeItemsComponent.vue` - Fila con 3 items

---

## 🎯 Propósito

Componentes de **layout para formularios** que organizan inputs en grupos y filas con diseño responsivo.

---

## 📦 FormGroupComponent

### Propósito

Agrupa inputs bajo un **título con borde visual**. Usado para separar secciones lógicas en formularios.

### Props

```typescript
{
    title: string  // Título del grupo (required)
}
```

### Estructura

```vue
<template>
<div class="form-group">
    <div class="form-group-header">
        <span>{{ title }}</span>
    </div>

    <div class="form-group-body">
        <div class="form-group-body-container">
            <div class="form-group-body-content">
                <slot></slot>  <!-- Contenido del formulario -->
            </div>
        </div>
    </div>
</div>
</template>
```

---

## 🎨 Estilos de FormGroup

### Base

```css
.form-group {
    background-color: var(--white);
    border-radius: var(--border-radius);
    margin-block: 1rem;              /* Espaciado vertical */
    box-shadow: var(--shadow-light);
}
```

### Header

```css
.form-group-header {
    font-weight: bold;
    font-size: 1.25rem;
    color: var(--gray-medium);
    padding: 1rem;
    border-bottom: 1px solid var(--gray-lighter);
    height: 30px;
    max-height: 30px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
}
```

### Body

```css
.form-group-body {
    padding-block: 1rem;
    padding-inline: 0.5rem;
}

.form-group-body-container {
    display: grid;
    grid-template-rows: 1fr;
    transition: grid-template-rows 0.3s ease;
}

.form-group-body-content {
    overflow: visible;
}
```

---

## 📝 Ejemplo de FormGroup

```vue
<FormGroupComponent title="Customer Information">
    <TextInputComponent 
        :entity="customer"
        property-key="name"
        v-model="customer.name" />
    
    <EmailInputComponent 
        :entity="customer"
        property-key="email"
        v-model="customer.email" />
    
    <TextInput Component 
        :entity="customer"
        property-key="phone"
        v-model="customer.phone" />
</FormGroupComponent>
```

**Resultado Visual:**
```
┌─────────────────────────────────────┐
│ Customer Information                │
├─────────────────────────────────────┤
│ Name:    [___________________]      │
│ Email:   [___________________]      │
│ Phone:   [___________________]      │
└─────────────────────────────────────┘
```

---

## 📐 FormRowTwoItemsComponent

### Propósito

Crea una **fila con 2 columnas** para colocar 2 inputs lado a lado.

### Estructura

```vue
<template>
    <div class="form-row-2">
        <slot></slot>
    </div>
</template>
```

**Muy simple:** Solo aplica layout de 2 columnas.

### Estilos

```css
.form-row-2 {
    display: grid;
    grid-template-columns: repeat(2, 1fr);  /* 2 columnas iguales */
    column-gap: 1rem;                       /* Espacio entre columnas */
}
```

---

## 📝 Ejemplo de FormRowTwoItems

```vue
<FormGroupComponent title="Address">
    <FormRowTwoItemsComponent>
        <TextInputComponent 
            :entity="address"
            property-key="street"
            v-model="address.street" />
        
        <TextInputComponent 
            :entity="address"
            property-key="city"
            v-model="address.city" />
    </FormRowTwoItemsComponent>
</FormGroupComponent>
```

**Resultado Visual:**
```
┌─────────────────────────────────────┐
│ Address                             │
├─────────────────────────────────────┤
│ Street: [__________] City: [_______]│
└─────────────────────────────────────┘
```

---

## 📐 FormRowThreeItemsComponent

### Propósito

Crea una **fila con 3 columnas** para colocar 3 inputs lado a lado.

### Estructura

```vue
<template>
    <div class="form-row-3">
        <slot></slot>
    </div>
</template>
```

### Estilos

```css
.form-row-3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);  /* 3 columnas iguales */
    column-gap: 1rem;                       /* Espacio entre columnas */
}
```

---

## 📝 Ejemplo de FormRowThreeItems

```vue
<FormGroupComponent title="Date Range">
    <FormRowThreeItemsComponent>
        <NumberInputComponent 
            :entity="filter"
            property-key="year"
            v-model="filter.year" />
        
        <NumberInputComponent 
            :entity="filter"
            property-key="month"
            v-model="filter.month" />
        
        <NumberInputComponent 
            :entity="filter"
            property-key="day"
            v-model="filter.day" />
    </FormRowThreeItemsComponent>
</FormGroupComponent>
```

**Resultado Visual:**
```
┌─────────────────────────────────────┐
│ Date Range                          │
├─────────────────────────────────────┤
│ Year: [____] Month: [__] Day: [___] │
└─────────────────────────────────────┘
```

---

## 🎨 Integración con @ViewGroupRow

### Decorador ViewGroupRow

```typescript
import { ViewGroupRow } from '@/enums/view_group_row';

@PropertyName('First Name', String)
@ViewGroup('Personal Info')
@ViewGroupRowDecorator(ViewGroupRow.TWO)  // Fila de 2 items
firstName!: string;

@PropertyName('Last Name', String)
@ViewGroup('Personal Info')
@ViewGroupRowDecorator(ViewGroupRow.TWO)  // Fila de 2 items (misma fila)
lastName!: string;

@PropertyName('Email', String)
@ViewGroup('Personal Info')
@ViewGroupRowDecorator(ViewGroupRow.SINGLE)  // Fila completa
email!: string;
```

**Resultado Automático:**
```
┌─────────────────────────────────────┐
│ Personal Info                       │
├─────────────────────────────────────┤
│ First Name: [_______] Last: [______]│  ← FormRowTwoItems
│ Email: [_________________________]  │  ← Fila completa
└─────────────────────────────────────┘
```

---

## 🔄 Uso en default_detailview.vue

### Generación Automática de Layout

```typescript
// En default_detailview.vue (lógica simplificada)
const groupedProperties = computed(() => {
    const groups = entity.getViewGroups();
    const rows = entity.getViewGroupRows();
    
    // Agrupar propiedades y determinar tipo de fila
    return organizeByGroupsAndRows(groups, rows);
});
```

```vue
<FormGroupComponent :title="groupName" v-for="group in groupedProperties">
    <template v-for="(chunk, index) in group">
        <component :is="getRowComponent(chunk.rowType)">
            <div v-for="prop in chunk.properties">
                <!-- Inputs aquí -->
            </div>
        </component>
    </template>
</FormGroupComponent>
```

### getRowComponent()

```typescript
methods: {
    getRowComponent(rowType: string) {
        switch(rowType) {
            case 'two':
                return FormRowTwoItemsComponent;
            case 'three':
                return FormRowThreeItemsComponent;
            default:
                return 'div';  // Fila simple
        }
    }
}
```

---

## 💡 Ventajas del Sistema

### 1. Responsive Automático

```css
/* Con CSS Grid, es fácil hacer responsive */
@media (max-width: 768px) {
    .form-row-2, .form-row-3 {
        grid-template-columns: 1fr;  /* 1 columna en móvil */
    }
}
```

### 2. Consistencia Visual

Todos los formularios tienen el mismo look & feel sin escribir CSS manualmente.

### 3. Código Limpio

```vue
<!-- ❌ SIN componentes de layout -->
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
    <input />
    <input />
</div>

<!-- ✅ CON componentes de layout -->
<FormRowTwoItemsComponent>
    <TextInput />
    <TextInput />
</FormRowTwoItemsComponent>
```

---

## 🎯 Patrón de Uso Completo

```vue
<template>
    <FormGroupComponent title="Product Details">
        <!-- Fila completa -->
        <TextInputComponent 
            :entity="product"
            property-key="name"
            v-model="product.name" />
        
        <!-- Fila con 2 items -->
        <FormRowTwoItemsComponent>
            <NumberInputComponent 
                :entity="product"
                property-key="price"
                v-model="product.price" />
            
            <NumberInputComponent 
                :entity="product"
                property-key="stock"
                v-model="product.stock" />
        </FormRowTwoItemsComponent>
        
        <!-- Fila con 3 items -->
        <FormRowThreeItemsComponent>
            <NumberInputComponent 
                :entity="product"
                property-key="length"
                v-model="product.length" />
            
            <NumberInputComponent 
                :entity="product"
                property-key="width"
                v-model="product.width" />
            
            <NumberInputComponent 
                :entity="product"
                property-key="height"
                v-model="product.height" />
        </FormRowThreeItemsComponent>
    </FormGroupComponent>
</template>
```

---

## ⚠️ Consideraciones

### 1. Número de Hijos

```typescript
// ✅ CORRECTO
<FormRowTwoItemsComponent>
    <Input1 />
    <Input2 />
</FormRowTwoItemsComponent>

// ⚠️ FUNCIONA pero no se ve bien
<FormRowTwoItemsComponent>
    <Input1 />  <!-- Solo 1 input, ocupa 50% del ancho -->
</FormRowTwoItemsComponent>

// ❌ NO RECOMENDADO
<FormRowTwoItemsComponent>
    <Input1 />
    <Input2 />
    <Input3 />  <!-- 3 en fila de 2 -->
</FormRowTwoItemsComponent>
```

### 2. Anidamiento

```vue
<!-- ❌ NO anidar FormRow dentro de FormRow -->
<FormRowTwoItemsComponent>
    <FormRowTwoItemsComponent>
        <!-- ... -->
    </FormRowTwoItemsComponent>
</FormRowTwoItemsComponent>

<!-- ✅ Cada FormRow es independiente -->
<FormRowTwoItemsComponent>...</FormRowTwoItemsComponent>
<FormRowThreeItemsComponent>...</FormRowThreeItemsComponent>
```

---

## 🔗 Componentes Relacionados

- **Todos los Form Inputs** - Contenido de rows
- **default_detailview.vue** - Usa estos componentes
- **@ViewGroup** - Agrupa propiedades
- **@ViewGroupRow** - Define tipo de fila

---

## 📚 Resumen

Componentes de **layout para formularios**:

**FormGroupComponent:**
- ✅ Agrupa inputs bajo un título
- ✅ Card con sombra y bordes
- ✅ Header destacado
- ✅ Espaciado consistente

**FormRowTwoItemsComponent:**
- ✅ Grid de 2 columnas
- ✅ Inputs lado a lado
- ✅ Gap entre columnas

**FormRowThreeItemsComponent:**
- ✅ Grid de 3 columnas
- ✅ 3 inputs en una fila
- ✅ Ideal para campos pequeños

**Juntos crean:** Formularios organizados, consistentes y responsivos sin CSS manual.
