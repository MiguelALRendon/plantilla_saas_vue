# 🔘 Button Components Overview

**Referencias:**
- `../03-application/application-singleton.md` - Application gestiona botones
- `../02-base-entity/crud-operations.md` - CRUD llamado por botones

---

## 📍 Ubicación en el Código

**Carpeta:** `src/components/Buttons/`  
**Export:** `src/components/Buttons/index.ts`

---

## 🎯 Propósito

Los **componentes de botones** proporcionan acciones estándar para las vistas del framework. Son gestionados automáticamente por Application según el contexto de vista actual.

**Concepto fundamental:**  
> Application.setButtonList() determina qué botones mostrar según el ViewType (ListView vs DetailView) y si la entidad es persistente.

---

## 📦 Botones Disponibles

### 1. SaveButtonComponent
**Archivo:** `SaveButtonComponent.vue`  
**Acción:** Guardar entidad actual  
**Método:** `entity.save()`  
**Estilo:** `button secondary`  
**Icono:** SAVE  
**Visibilidad:** Solo en DetailView con entidades persistentes

### 2. NewButtonComponent
**Archivo:** `NewButtonComponent.vue`  
**Acción:** Crear nueva instancia de entidad  
**Método:** `entityClass.createNewInstance()` + `Application.changeViewToDetailView()`  
**Estilo:** `button info`  
**Icono:** ADD  
**Visibilidad:** ListView y DetailView

### 3. RefreshButtonComponent
**Archivo:** `RefreshButtonComponent.vue`  
**Acción:** Recargar entidad actual desde servidor  
**Método:** `entity.refresh()`  
**Estilo:** `button success-green`  
**Icono:** REFRESH  
**Visibilidad:** ListView y DetailView

### 4. ValidateButtonComponent
**Archivo:** `ValidateButtonComponent.vue`  
**Acción:** Validar campos sin guardar  
**Método:** `entity.validateInputs()`  
**Estilo:** `button warning`  
**Icono:** CHECK  
**Visibilidad:** DetailView

### 5. SaveAndNewButtonComponent
**Archivo:** `SaveAndNewButtonComponent.vue`  
**Acción:** Guardar y crear nueva instancia  
**Método:** `entity.save()` + `createNewInstance()`  
**Estilo:** `button accent`  
**Icono:** SAVE2  
**Visibilidad:** Solo en DetailView con entidades persistentes

### 6. SendToDeviceButtonComponent
**Archivo:** `SendToDeviceButtonComponent.vue`  
**Acción:** Sin implementación actual (placeholder)  
**Método:** Ninguno  
**Estilo:** `button primary`  
**Icono:** DEVICES  
**Visibilidad:** DetailView

### 7. GenericButtonComponent
**Archivo:** `GenericButtonComponent.vue`  
**Acción:** Botón genérico sin funcionalidad predefinida  
**Método:** Ninguno  
**Estilo:** `button`  
**Visibilidad:** Uso manual

---

## 🔧 Configuración Automática en Application

### Lógica de setButtonList()

**Ubicación:** `src/models/application.ts` (línea ~239)

```typescript
setButtonList() {
    const isPersistentEntity = this.View.value.entityObject?.isPersistent() ?? false;
    
    switch (this.View.value.viewType) {
        case ViewTypes.LISTVIEW:
            this.ListButtons.value = [
                markRaw(NewButtonComponent),
                markRaw(RefreshButtonComponent)
            ];
            break;
            
        case ViewTypes.DETAILVIEW:
            if (isPersistentEntity) {
                this.ListButtons.value = [
                    markRaw(NewButtonComponent),
                    markRaw(RefreshButtonComponent),
                    markRaw(ValidateButtonComponent),
                    markRaw(SaveButtonComponent),
                    markRaw(SaveAndNewButtonComponent),
                    markRaw(SendToDeviceButtonComponent)
                ];
            } else {
                this.ListButtons.value = [
                    markRaw(NewButtonComponent),
                    markRaw(RefreshButtonComponent),
                    markRaw(ValidateButtonComponent),
                    markRaw(SendToDeviceButtonComponent)
                ];
            }
            break;
            
        default:
            this.ListButtons.value = [];
            break;
    }
}
```

### Flujo de Actualización

```
1. Vista cambia (changeView)
        ↓
2. setTimeout 405ms
        ↓
3. setButtonList() ejecuta
        ↓
4. Application.ListButtons.value actualizado
        ↓
5. ActionsComponent reactivo renderiza botones
```

---

## 🎨 Uso de Iconos

Todos los botones usan el sistema de iconos **Google Material Symbols**.

```typescript
import { GGICONS, GGCLASS } from '@/constants/ggicons';

// En template:
<span :class="GGCLASS">{{ GGICONS.SAVE }}</span>
```

**Ubicación constantes:** `src/constants/ggicons.ts`

---

## 📊 Estructura Común de Botones

```vue
<template>
    <button class="button [variant]" @click="[method]">
        <span :class="GGCLASS">{{ GGICONS.[ICON] }}</span>
        [Label]
    </button>
</template>

<script lang="ts">
import { GGICONS, GGCLASS } from '@/constants/ggicons';
import Application from '@/models/application';

export default {
    name: '[ComponentName]',
    methods: {
        async [method]() {
            const entity = Application.View.value.entityObject;
            // Lógica de acción
        }
    },
    data() {
        return {
            GGCLASS,
            GGICONS,
        };
    }
}
</script>

<style scoped>
.button.[variant] span {
    font-size: 1.1rem;
    margin-right: 0.15rem;
}
</style>
```

---

## 🎯 Variantes de Estilo

| Clase CSS | Color | Uso |
|-----------|-------|-----|
| `button secondary` | Azul | Acciones principales (Save) |
| `button info` | Azul claro | Información (New) |
| `button success-green` | Verde | Éxito/Refrescar (Refresh) |
| `button warning` | Amarillo | Advertencia (Validate) |
| `button accent` | Morado | Acento (Save and New) |
| `button primary` | Azul oscuro | Primario (Send to Device) |
| `button` | Gris | Genérico |

**CSS:** Definidos en `src/css/main.css`

---

## 🔗 Integración con ActionsComponent

Los botones se renderizan en `ActionsComponent.vue`:

```vue
<template>
    <div class="actions-container">
        <component
            v-for="(button, index) in Application.ListButtons.value"
            :key="index"
            :is="button"
        />
    </div>
</template>
```

**Ubicación:** `src/components/ActionsComponent.vue`

---

## 📝 Notas Importantes

1. **markRaw()**: Todos los componentes se envuelven en `markRaw()` para evitar reactividad innecesaria
2. **Delay de 405ms**: El setButtonList() se ejecuta con delay para sincronizar con animaciones de transición
3. **Entidades no persistentes**: No muestran botones Save/SaveAndNew
4. **SendToDevice**: Botón placeholder sin funcionalidad implementada actualmente
5. **Acceso a Application**: Todos los botones acceden directamente al singleton Application

---

---

## 📝 Detalle de Componentes

### SaveButtonComponent - Detalle Completo

**Archivo:** `src/components/Buttons/SaveButtonComponent.vue`

```vue
<template>
    <button class="button secondary" @click="saveItem">
        <span :class="GGCLASS">{{ GGICONS.SAVE }}</span>
        Save
    </button>
</template>

<script lang="ts">
import { GGICONS, GGCLASS } from '@/constants/ggicons';
import Application from '@/models/application';

export default {
    name: 'SaveButtonComponent',
    methods: {
        async saveItem() {
            const entity = Application.View.value.entityObject;
            if (entity && entity.isPersistent()) {
                await entity.save();
            }
        }
    },
    data() {
        return {
            GGCLASS,
            GGICONS,
        };
    }
}
</script>

<style scoped>
.button.secondary span{
    font-size: 1.1rem;
    margin-right: 0.15rem;
}
</style>
```

**Funcionamiento:**
1. Obtiene entidad actual de `Application.View.value.entityObject`
2. Verifica que sea persistente con `isPersistent()`
3. Llama a `entity.save()` (método asíncrono)
4. `save()` ejecuta validaciones y hace POST/PUT según `isNew()`

---

### ValidateButtonComponent - Detalle Completo

**Archivo:** `src/components/Buttons/ValidateButtonComponent.vue`

```vue
<template>
    <button class="button warning" @click="saveItem">
        <span :class="GGCLASS">{{ GGICONS.CHECK }}</span>
        Validate
    </button>
</template>

<script lang="ts">
import { GGICONS, GGCLASS } from '@/constants/ggicons';
import Application from '@/models/application';

export default {
    name: 'ValidateButtonComponent',
    methods: {
        async saveItem() {
            const entity = Application.View.value.entityObject;
            if (entity) {
                await entity.validateInputs();
            }
        }
    },
    data() {
        return {
            GGCLASS,
            GGICONS,
        };
    }
}
</script>
```

**Funcionamiento:**
1. Obtiene entidad actual
2. Llama a `validateInputs()` que emite evento `'validate-inputs'`
3. Todos los inputs ejecutan sus validaciones
4. NO guarda, solo valida

**Uso:** Verificar validez sin guardar cambios.

---

### NewButtonComponent

**Archivo:** `src/components/Buttons/NewButtonComponent.vue`

**Método:**
```typescript
methods: {
    createNew() {
        const entityClass = Application.View.value.entityClass;
        if (entityClass) {
            const newInstance = entityClass.createNewInstance();
            Application.changeViewToDetailView(newInstance);
        }
    }
}
```

**Funcionamiento:**
1. Obtiene clase de entidad actual
2. Crea nueva instancia con `createNewInstance()`
3. Navega a DetailView con nueva instancia

---

### RefreshButtonComponent

**Archivo:** `src/components/Buttons/RefreshButtonComponent.vue`

**Método:**
```typescript
methods: {
    async refresh() {
        const entity = Application.View.value.entityObject;
        if (entity) {
            await entity.refresh(); // Recarga desde servidor
        }
    }
}
```

**Funcionamiento:**
1. Obtiene entidad actual
2. Llama a `refresh()` que hace GET y actualiza datos
3. Descarta cambios locales sin guardar

---

### SaveAndNewButtonComponent

**Archivo:** `src/components/Buttons/SaveAndNewButtonComponent.vue`

**Método:**
```typescript
methods: {
    async saveAndNew() {
        const entity = Application.View.value.entityObject;
        if (entity && entity.isPersistent()) {
            await entity.save();
            const newInstance = entity.constructor.createNewInstance();
            Application.changeViewToDetailView(newInstance);
        }
    }
}
```

**Funcionamiento:**
1. Guarda entidad actual
2. Crea nueva instancia de la misma clase
3. Navega a DetailView con nueva instancia

**Uso:** Crear múltiples registros consecutivos.

---

### SendToDeviceButtonComponent

**Archivo:** `src/components/Buttons/SendToDeviceButtonComponent.vue`

**Estado:** Sin implementación funcional actual (placeholder)

```typescript
methods: {
    sendToDevice() {
        // TODO: Implementar funcionalidad
        console.log('Send to device clicked');
    }
}
```

---

### GenericButtonComponent

**Archivo:** `src/components/Buttons/GenericButtonComponent.vue`

**Sin funcionalidad predefinida.** Para uso manual en componentes custom.

---

## 🔄 Ciclo de Vida de Botones

```
Application.changeView() ejecuta
    ↓
setTimeout 405ms (espera animación)
    ↓
setButtonList() ejecuta
    ↓
Determina ViewType (LISTVIEW/DETAILVIEW)
    ↓
Verifica isPersistent()
    ↓
Actualiza Application.ListButtons.value
    ↓
ActionsComponent renderiza botones
    ↓
Usuario hace click
    ↓
Método del botón ejecuta
    ↓
Interactúa con entity o Application
```

---

## 🎯 Decisión de Botones según Contexto

### ListView + Entidad Persistente
- ✅ New
- ✅ Refresh
- ❌ Save (no hay entidad individual)
- ❌ Validate (no hay formulario)

### DetailView + Entidad Persistente
- ✅ New
- ✅ Refresh
- ✅ Validate
- ✅ Save
- ✅ SaveAndNew
- ✅ SendToDevice

### DetailView + Entidad NO Persistente
- ✅ New
- ✅ Refresh
- ✅ Validate
- ❌ Save (no puede persistir)
- ❌ SaveAndNew (no puede persistir)
- ✅ SendToDevice

---

## 📋 Matriz de Disponibilidad

| Botón | ListView<br/>Persistente | DetailView<br/>Persistente | DetailView<br/>No Persistente |
|-------|:------------------------:|:------------------------:|:---------------------------:|
| New | ✅ | ✅ | ✅ |
| Refresh | ✅ | ✅ | ✅ |
| Validate | ❌ | ✅ | ✅ |
| Save | ❌ | ✅ | ❌ |
| SaveAndNew | ❌ | ✅ | ❌ |
| SendToDevice | ❌ | ✅ | ✅ |

---

## 🎨 CSS Classes Completas

```css
/* Base button */
.button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: var(--border-radius);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    transition: 0.3s ease;
}

/* Variants */
.button.secondary {
    background-color: var(--btn-secondary);
    color: var(--white);
}

.button.info {
    background-color: var(--btn-info);
    color: var(--white);
}

.button.success-green {
    background-color: var(--green-soft);
    color: var(--white);
}

.button.warning {
    background-color: var(--btn-warning);
    color: var(--dark);
}

.button.accent {
    background-color: var(--accent);
    color: var(--white);
}

.button.primary {
    background-color: var(--btn-primary);
    color: var(--white);
}

/* Icon sizing */
.button span {
    font-size: 1.1rem;
}
```

---

## 🔗 Integración con ActionsComponent

**Código en ActionsComponent.vue:**

```vue
<template>
    <div class="floating-actions" :class="{ 'at-top': isAtTop }">
        <component
            v-for="(component, index) in Application.ListButtons.value"
            :key="index"
            :is="component"
        />
    </div>
</template>
```

**Actualización:**

```typescript
// En application.ts
setButtonList() {
    const isPersistentEntity = this.View.value.entityObject?.isPersistent() ?? false;
    
    switch (this.View.value.viewType) {
        case ViewTypes.LISTVIEW:
            this.ListButtons.value = [
                markRaw(NewButtonComponent),
                markRaw(RefreshButtonComponent)
            ];
            break;
            
        case ViewTypes.DETAILVIEW:
            if (isPersistentEntity) {
                this.ListButtons.value = [
                    markRaw(NewButtonComponent),
                    markRaw(RefreshButtonComponent),
                    markRaw(ValidateButtonComponent),
                    markRaw(SaveButtonComponent),
                    markRaw(SaveAndNewButtonComponent),
                    markRaw(SendToDeviceButtonComponent)
                ];
            } else {
                this.ListButtons.value = [
                    markRaw(NewButtonComponent),
                    markRaw(RefreshButtonComponent),
                    markRaw(ValidateButtonComponent),
                    markRaw(SendToDeviceButtonComponent)
                ];
            }
            break;
            
        default:
            this.ListButtons.value = [];
            break;
    }
}
```

---

## 📝 Crear Botón Custom

Para agregar botones personalizados:

### 1. Crear Componente

```vue
<template>
    <button class="button info" @click="customAction">
        <span :class="GGCLASS">{{ GGICONS.CUSTOM }}</span>
        Custom Action
    </button>
</template>

<script lang="ts">
import { GGICONS, GGCLASS } from '@/constants/ggicons';
import Application from '@/models/application';

export default {
    name: 'CustomButtonComponent',
    methods: {
        async customAction() {
            const entity = Application.View.value.entityObject;
            // Tu lógica aquí
        }
    },
    data() {
        return { GGCLASS, GGICONS };
    }
}
</script>

<style scoped>
.button.info span {
    font-size: 1.1rem;
    margin-right: 0.15rem;
}
</style>
```

### 2. Registrar en Application

```typescript
import CustomButtonComponent from '@/components/Buttons/CustomButtonComponent.vue';

// En setButtonList()
this.ListButtons.value = [
    markRaw(CustomButtonComponent),
    // ... otros botones
];
```

---

**Total de Botones:** 7  
**Última actualización:** 11 de Febrero, 2026  
**Versión:** 1.0.0  
**Estado:** ✅ Completo
