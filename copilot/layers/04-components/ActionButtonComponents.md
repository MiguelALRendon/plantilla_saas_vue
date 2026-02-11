# 🔘 Action Button Components

**Referencias:**
- `buttons-overview.md` - Visión general de botones
- `ActionsComponent.md` - Barra de acciones
- `../02-base-entity/crud-operations.md` - Operaciones CRUD
- `../03-application/application-singleton.md` - Application

---

## 📍 Ubicación en el Código

**Directorio:** `src/components/Buttons/`

**Archivos:**
- `GenericButtonComponent.vue` - Botón genérico base
- `NewButtonComponent.vue` - Crear nueva entidad
- `RefreshButtonComponent.vue` - Actualizar datos
- `ValidateButtonComponent.vue` - Validar formulario
- `SaveButtonComponent.vue` - Guardar entidad
- `SaveAndNewButtonComponent.vue` - Guardar y crear nueva
- `SendToDeviceButtonComponent.vue` - Enviar a dispositivo

---

## 🎯 Propósito

Botones de acción del framework que ejecutan operaciones comunes (CRUD, validación, etc.). Se renderizan dinámicamente en `ActionsComponent` según el contexto.

---

## 🔘 GenericButtonComponent

### Propósito

**Plantilla base** para botones. No tiene funcionalidad, solo demostración.

### Código

```vue
<template>
    <button class="button">Generic</button>
</template>

<script lang="ts">
export default {
    name: 'GenericButtonComponent'
}
</script>
```

**Uso:** Puedes extender este componente para crear botones personalizados.

---

## ➕ NewButtonComponent

### Propósito

Crea una **nueva instancia** de la entidad actual y navega a la vista de detalle.

### Código

```vue
<template>
    <button class="button info" @click="openNewDetailView">
        <span :class="GGCLASS">{{ GGICONS.ADD }}</span>
        New
    </button>
</template>

<script lang="ts">
export default {
    methods: {
        openNewDetailView() {
            const entityClass = Application.View.value.entityClass!;
            const newEntity = (entityClass as any).createNewInstance();
            Application.changeViewToDetailView(newEntity);
        }
    }
}
</script>
```

### Comportamiento

```
1. Usuario hace click en "New"
        ↓
2. Obtiene la clase de entidad actual (Application.View.value.entityClass)
        ↓
3. Crea nueva instancia vacía (createNewInstance())
        ↓
4. Navega a detail view con la nueva entidad
        ↓
5. URL cambia a /:module/new
        ↓
6. Usuario ve formulario vacío para llenar
```

### Cuando Aparece

- ✅ Vista de lista (LISTVIEW)
- ✅ Vista de detalle (DETAILVIEW)
- ✅ Siempre visible

---

## 🔄 RefreshButtonComponent

### Propósito

**Actualiza/recarga** los datos de la entidad actual desde el API.

### Código

```vue
<template>
    <button class="button success-green" @click="refreshList">
        <span :class="GGCLASS">{{ GGICONS.REFRESH }}</span>
        Refresh
    </button>
</template>

<script lang="ts">
export default {
    methods: {
        async refreshList() {
            const entity = Application.View.value.entityObject;
            if (entity && entity.isPersistent()) {
                await entity.refresh();
            }
        }
    }
}
</script>
```

### Comportamiento

```
1. Usuario hace click en "Refresh"
        ↓
2. Obtiene entidad actual (Application.View.value.entityObject)
        ↓
3. Verifica que sea persistente (isPersistent())
        ↓
4. Llama a entity.refresh()
        ↓
5. BaseEntity hace GET al API
        ↓
6. Actualiza datos de la entidad
        ↓
7. Vista se re-renderiza con datos frescos
```

### Cuando Aparece

- ✅ Vista de lista (LISTVIEW)
- ✅ Vista de detalle (DETAILVIEW)
- ✅ Siempre visible

---

## ✅ ValidateButtonComponent

### Propósito

**Valida el formulario** sin guardar. Muestra errores de validación.

### Código

```vue
<template>
    <button class="button warning" @click="validateForm">
        <span :class="GGCLASS">{{ GGICONS.CHECK }}</span>
        Validate
    </button>
</template>

<script lang="ts">
export default {
    methods: {
        async validateForm() {
            const entity = Application.View.value.entityObject;
            if (entity) {
                await entity.validateInputs();
            }
        }
    }
}
</script>
```

### Comportamiento

```
1. Usuario hace click en "Validate"
        ↓
2. Obtiene entidad actual
        ↓
3. Llama a entity.validateInputs()
        ↓
4. BaseEntity ejecuta validaciones:
   - Required fields
   - Sync validations (@Validation)
   - Async validations (@AsyncValidation)
        ↓
5. Si hay errores:
   - Toast "Validation errors"
   - Campos inválidos se marcan en rojo
        ↓
6. Si todo válido:
   - Toast "All validations passed"
```

### Cuando Aparece

- ✅ Vista de detalle (DETAILVIEW)
- ✅ Persistente o no persistente

---

## 💾 SaveButtonComponent

### Propósito

**Guarda la entidad** en el backend (POST si nueva, PUT si existe).

### Código

```vue
<template>
    <button class="button secondary" @click="saveItem">
        <span :class="GGCLASS">{{ GGICONS.SAVE }}</span>
        Save
    </button>
</template>

<script lang="ts">
export default {
    methods: {
        async saveItem() {
            const entity = Application.View.value.entityObject;
            if (entity && entity.isPersistent()) {
                await entity.save();
            }
        }
    }
}
</script>
```

### Comportamiento

```
1. Usuario hace click en "Save"
        ↓
2. Obtiene entidad actual
        ↓
3. Verifica que sea persistente
        ↓
4. Llama a entity.save()
        ↓
5. BaseEntity:
   - Ejecuta beforeSave() hook
   - Valida (validateInputs())
   - Si válido: POST o PUT al API
   - Actualiza entity con response
   - Ejecuta afterSave() hook
   - Toast "Entity saved"
        ↓
6. Vista permanece en detail view
```

### Cuando Aparece

- ✅ Vista de detalle (DETAILVIEW)
- ✅ **Solo si entidad es @Persistent()**

---

## 💾➕ SaveAndNewButtonComponent

### Propósito

**Guarda la entidad** y luego crea una nueva instancia para continuar ingresando datos.

### Código

```vue
<template>
    <button class="button accent" @click="saveItem">
        <span :class="GGCLASS">{{ GGICONS.SAVE2 }}</span>
        Save and New
    </button>
</template>

<script lang="ts">
export default {
    methods: {
        async saveItem() {
            const entity = Application.View.value.entityObject;
            if (entity && entity.isPersistent()) {
                await entity.save();
                
                const entityClass = Application.View.value.entityClass!;
                const newEntity = (entityClass as any).createNewInstance();
                Application.changeViewToDetailView(newEntity);
            }
        }
    }
}
</script>
```

### Comportamiento

```
1. Usuario hace click en "Save and New"
        ↓
2. Guarda entidad actual (await entity.save())
        ↓
3. Crea nueva instancia vacía
        ↓
4. Cambia vista a detail view con nueva instancia
        ↓
5. Formulario se limpia (nueva entidad)
        ↓
6. Usuario puede ingresar datos de siguiente entidad
```

**Caso de Uso:** Ingreso rápido de múltiples entidades (ej: crear 10 productos).

### Cuando Aparece

- ✅ Vista de detalle (DETAILVIEW)
- ✅ **Solo si entidad es @Persistent()**

---

## 📱 SendToDeviceButtonComponent

### Propósito

**Placeholder** para funcionalidad futura (enviar datos a dispositivo externo).

### Código

```vue
<template>
    <button class="button primary" @click="">
        <span :class="GGCLASS">{{ GGICONS.DEVICES }}</span>
        Send to Device
    </button>
</template>

<script lang="ts">
export default {
    name: 'SendToDeviceButtonComponent',
    methods: {
        // Sin implementación actual
    }
}
</script>
```

**Estado:** Sin funcionalidad implementada. Puede ser personalizado según necesidades.

### Cuando Aparece

- ✅ Vista de detalle (DETAILVIEW)
- ✅ Persistente o no persistente

---

## 🎨 Estilos de Botones

### Clases CSS Disponibles

```css
.button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

/* Variantes de color */
.button.info { background: var(--info-blue); color: white; }
.button.success-green { background: var(--success-green); color: white; }
.button.warning { background: var(--warning-orange); color: white; }
.button.secondary { background: var(--secondary-gray); color: white; }
.button.accent { background: var(--accent-purple); color: white; }
.button.primary { background: var(--primary-blue); color: white; }
.button.alert { background: var(--error-red); color: white; }
```

---

## 📊 Configuración Automática

### En Application.setButtonList()

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
                // Entidad persistente: Botones completos
                this.ListButtons.value = [
                    markRaw(NewButtonComponent),
                    markRaw(RefreshButtonComponent),
                    markRaw(ValidateButtonComponent),
                    markRaw(SaveButtonComponent),
                    markRaw(SaveAndNewButtonComponent),
                    markRaw(SendToDeviceButtonComponent)
                ];
            } else {
                // Entidad no persistente: Sin botones de save
                this.ListButtons.value = [
                    markRaw(NewButtonComponent),
                    markRaw(RefreshButtonComponent),
                    markRaw(ValidateButtonComponent),
                    markRaw(SendToDeviceButtonComponent)
                ];
            }
            break;
    }
}
```

---

## 💡 Crear Botón Custom

### Paso 1: Crear Componente

```vue
<!-- CustomActionButtonComponent.vue -->
<template>
    <button class="button info" @click="handleCustomAction">
        <span :class="GGCLASS">{{ GGICONS.CUSTOM }}</span>
        Custom Action
    </button>
</template>

<script lang="ts">
import Application from '@/models/application';

export default {
    name: 'CustomActionButtonComponent',
    methods: {
        async handleCustomAction() {
            const entity = Application.View.value.entityObject;
            
            // Tu lógica personalizada aquí
            console.log('Custom action on entity:', entity);
            
            // Ejemplo: llamar a método custom de la entidad
            if (entity && 'customMethod' in entity) {
                await (entity as any).customMethod();
            }
        }
    }
}
</script>
```

### Paso 2: Registrar en Application

```typescript
// Modificar Application.setButtonList()
case ViewTypes.DETAILVIEW:
    this.ListButtons.value = [
        // ... botones existentes
        markRaw(CustomActionButtonComponent)  // Agregar custom button
    ];
    break;
```

---

## ⚠️ Consideraciones

### 1. isPersistent() Check

```typescript
// ✅ SIEMPRE verificar antes de save()
if (entity && entity.isPersistent()) {
    await entity.save();
}

// ❌ Sin verificación puede causar errores
await entity.save();  // Error si no es @Persistent()
```

### 2. Error Handling

Los métodos `save()`, `refresh()`, `validateInputs()` ya manejan errores internamente y muestran toasts.

### 3. Async Operations

```typescript
// ✅ Usar async/await
async saveItem() {
    await entity.save();
    // Continúa después de guardar
}

// ❌ Sin await
saveItem() {
    entity.save();  // No espera, continúa inmediatamente
}
```

---

## 🔗 Dependencias

**Todos los botones dependen de:**
- Application.View.value.entityObject
- Application.View.value.entityClass
- BaseEntity methods (save, refresh, validateInputs, etc.)
- ApplicationUIService (para toasts)

---

## 🐛 Debugging

### Ver Entidad Actual

```javascript
console.log('Current entity:', Application.View.value.entityObject);
console.log('Is persistent:', entity.isPersistent());
```

### Ver Botones Activos

```javascript
console.log('Active buttons:', Application.ListButtons.value);
```

### Simular Click

```javascript
// En la consola del navegador
document.querySelector('.button.info').click();
```

---

## 📚 Resumen

**Botones de Acción del Framework:**

| Botón | Vistas | Persistencia | Acción |
|-------|--------|-------------|--------|
| **New** | List, Detail | Cualquiera | Crear nueva instancia |
| **Refresh** | List, Detail | Cualquiera | Recargar datos |
| **Validate** | Detail | Cualquiera | Validar sin guardar |
| **Save** | Detail | Solo @Persistent | Guardar entidad |
| **Save & New** | Detail | Solo @Persistent | Guardar y crear nueva |
| **Send to Device** | Detail | Cualquiera | Placeholder |

**Características:**
- ✅ Configuración automática según contexto
- ✅ Integración con BaseEntity CRUD
- ✅ Manejo de errores interno
- ✅ Feedback con toasts
- ✅ Iconos consistentes
- ✅ Fácilmente extensible

Los botones son el **punto de entrada para operaciones de usuario** en el framework.
