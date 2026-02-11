# Enums del Framework

## Propósito

Los enums definen conjuntos cerrados de valores que se usan a lo largo del framework para tipado fuerte, validación y lógica condicional. Cada enum representa un dominio específico: tipos de vistas, formatos de strings, disposición de formularios, tipos de notificaciones, etc.

---

## 1. ViewTypes - Tipos de Vistas

### Ubicación
`src/enums/view_type.ts`

### Código
```typescript
export enum ViewTypes {
    LISTVIEW,
    DETAILVIEW,
    DEFAULTVIEW,
    CUSTOMVIEW,
    LOOKUPVIEW
}
```

### Descripción

Define los diferentes tipos de vistas que puede tener `Application.View.value.viewType`. Este enum controla qué botones de acción se muestran y cómo se comporta la navegación.

### Valores

| Valor | Descripción | Uso Principal |
|-------|-------------|---------------|
| **LISTVIEW** | Vista de listado de entidades en tabla | `DefaultListView`, muestra botones: New, Refresh |
| **DETAILVIEW** | Vista de detalle/edición de una entidad | `DefaultDetailView`, muestra botones: Save, Validate, SaveAndNew |
| **DEFAULTVIEW** | Vista predeterminada del sistema | (No implementado actualmente, reservado) |
| **CUSTOMVIEW** | Vista personalizada sin lógica predeterminada | Para vistas que no son CRUD estándar |
| **LOOKUPVIEW** | Vista de selección en modal | `DefaultLookupListView`, no muestra botones de acción |

### Ejemplos de Uso

#### Establecer viewType al montar vista
```typescript
// En DefaultListView
mounted() {
    Application.View.value.viewType = ViewTypes.LISTVIEW;
}

// En DefaultDetailView (implícito al usar changeViewToDetailView)
Application.changeViewToDetailView(entity);
// Internamente establece: Application.View.value.viewType = ViewTypes.DETAILVIEW;
```

#### Condicional basado en viewType
```typescript
// En ActionsComponent para decidir qué botones mostrar
computed: {
    ListButtons(): Array<Component> {
        const viewType = Application.View.value.viewType;
        
        if (viewType === ViewTypes.LISTVIEW) {
            return [NewButton, RefreshButton];
        } else if (viewType === ViewTypes.DETAILVIEW) {
            return [SaveButton, ValidateButton, SaveAndNewButton];
        }
        
        return [];
    }
}
```

#### En custom components
```typescript
// Verificar si estamos en modo edición
if (Application.View.value.viewType === ViewTypes.DETAILVIEW) {
    console.log('Usuario está editando:', Application.View.value.entityObject);
}
```

### Consideraciones

- ⚠️ **DEFAULTVIEW no usado**: Este valor está reservado pero no tiene implementación actual
- ⚠️ **CUSTOMVIEW flexible**: Permite vistas que no siguen el patrón CRUD estándar
- ✅ **Control de UI**: Determina qué elementos de interfaz se muestran (botones, navegación)

---

## 2. StringType - Tipos de Campos String

### Ubicación
`src/enums/string_type.ts`

### Código
```typescript
export enum StringType {
    EMAIL,
    PASSWORD,
    TEXT,
    TELEPHONE,
    URL,
    TEXTAREA
}
```

### Descripción

Define el tipo de input HTML que debe usarse para una propiedad `string`. Se usa con el decorador `@StringType()` para que `DefaultDetailView` renderice el componente de formulario correcto.

### Valores

| Valor | Input HTML | Componente Renderizado | Uso |
|-------|------------|------------------------|-----|
| **EMAIL** | `<input type="email">` | `EmailInputComponent` | Correos electrónicos con validación de formato |
| **PASSWORD** | `<input type="password">` | `PasswordInputComponent` | Contraseñas (texto oculto) |
| **TEXT** | `<input type="text">` | `TextInputComponent` | Texto corto de una línea (default) |
| **TELEPHONE** | `<input type="tel">` | (No implementado) | Números telefónicos |
| **URL** | `<input type="url">` | (No implementado) | URLs con validación |
| **TEXTAREA** | `<textarea>` | `TextAreaComponent` | Texto largo multi-línea |

### Ejemplo de Uso

```typescript
import { StringType } from '@/enums/string_type';
import { StringTypeDecorator } from '@/decorations';

class User extends BaseEntity {
    @PropertyName("Nombre")
    @StringType(StringType.TEXT)  // ← Input normal (default, puede omitirse)
    name: string = "";

    @PropertyName("Email")
    @StringType(StringType.EMAIL)  // ← Input tipo email
    email: string = "";

    @PropertyName("Contraseña")
    @StringType(StringType.PASSWORD)  // ← Input oculto
    password: string = "";

    @PropertyName("Biografía")
    @StringType(StringType.TEXTAREA)  // ← Textarea multi-línea
    bio: string = "";

    @PropertyName("Sitio Web")
    @StringType(StringType.URL)  // ← (No implementado, renderiza como TEXT)
    website: string = "";
}
```

### Cómo se Usa en DefaultDetailView

```vue
<!-- DefaultDetailView template -->
<TextInputComponent 
    v-if="entityClass.getPropertyType(prop) === String && 
          entity.getStringType()[prop] == StringType.TEXT"
    :entity="entity"
    :property-key="prop"
    v-model="entity[prop]" />

<EmailInputComponent
    v-if="entityClass.getPropertyType(prop) === String && 
          entity.getStringType()[prop] == StringType.EMAIL"
    :entity="entity"
    :property-key="prop"
    v-model="entity[prop]" />

<PasswordInputComponent
    v-if="entityClass.getPropertyType(prop) === String && 
          entity.getStringType()[prop] == StringType.PASSWORD"
    :entity="entity"
    :property-key="prop"
    v-model="entity[prop]" />

<TextAreaComponent
    v-if="entityClass.getPropertyType(prop) === String && 
          entity.getStringType()[prop] == StringType.TEXTAREA"
    :entity="entity"
    :property-key="prop"
    v-model="entity[prop]" />
```

### Obtener StringType de una Propiedad

```typescript
// En BaseEntity
getStringType(): Record<string, StringType> {
    const metadata = this.constructor.prototype.$BaseEntityMetadata;
    return metadata?.StringType || {};
}

// Uso
const user = new User();
console.log(user.getStringType());
// { email: StringType.EMAIL, password: StringType.PASSWORD, bio: StringType.TEXTAREA }
```

### Consideraciones

- ⚠️ **TELEPHONE y URL no implementados**: Existen en el enum pero no tienen componente dedicado, renderizan como TEXT
- ⚠️ **Default es TEXT**: Si no aplicas `@StringType()`, se asume TEXT
- ✅ **Validación automática**: EMAIL valida formato email, PASSWORD oculta caracteres

---

## 3. ViewGroupRow - Disposición de Filas

### Ubicación
`src/enums/view_group_row.ts`

### Código
```typescript
export enum ViewGroupRow {
    SINGLE = 'single',
    PAIR = 'pair',
    TRIPLE = 'triple'
}
```

### Descripción

Define cuántos campos se muestran por fila en `DefaultDetailView`. Se usa con el decorador `@ViewGroupRow()` para controlar el layout del formulario.

### Valores

| Valor | Campos por Fila | Componente Renderizado | Ancho por Campo |
|-------|----------------|------------------------|-----------------|
| **SINGLE** | 1 campo | `<div>` | 100% |
| **PAIR** | 2 campos | `FormRowTwoItemsComponent` | 50% cada uno |
| **TRIPLE** | 3 campos | `FormRowThreeItemsComponent` | 33.33% cada uno |

### Ejemplo de Uso

```typescript
import { ViewGroupRow } from '@/enums/view_group_row';

class Product extends BaseEntity {
    @PropertyName("Título del Producto")
    @ViewGroupRow(ViewGroupRow.SINGLE)  // ← Ancho completo
    title: string = "";

    @PropertyName("Precio")
    @ViewGroupRow(ViewGroupRow.PAIR)  // ← Mitad izquierda
    price: number = 0;

    @PropertyName("Stock")
    @ViewGroupRow(ViewGroupRow.PAIR)  // ← Mitad derecha (va en la misma fila que price)
    stock: number = 0;

    @PropertyName("Alto")
    @ViewGroupRow(ViewGroupRow.TRIPLE)  // ← Tercio izquierdo
    height: number = 0;

    @PropertyName("Ancho")
    @ViewGroupRow(ViewGroupRow.TRIPLE)  // ← Tercio centro
    width: number = 0;

    @PropertyName("Profundidad")
    @ViewGroupRow(ViewGroupRow.TRIPLE)  // ← Tercio derecho
    depth: number = 0;
}
```

**Resultado visual**:
```
┌─────────────────────────────────────┐
│ [Título: ___________________]       │ ← SINGLE (100%)
└─────────────────────────────────────┘

┌──────────────────┬──────────────────┐
│ [Precio: ____]   │ [Stock: _____]   │ ← PAIR (50% + 50%)
└──────────────────┴──────────────────┘

┌───────────┬───────────┬─────────────┐
│ [Alto: _] │ [Ancho: _]│ [Prof: ___] │ ← TRIPLE (33% + 33% + 33%)
└───────────┴───────────┴─────────────┘
```

### Agrupación Automática en DefaultDetailView

```typescript
// DefaultDetailView agrupa propiedades consecutivas con mismo viewGroupRow
computed: {
    groupedProperties() {
        const viewGroupRows = this.entity.getViewGroupRows();
        
        for (const prop of keys) {
            const rowType = viewGroupRows[prop] || ViewGroupRow.PAIR;  // ← Default PAIR
            const lastChunk = groups[currentGroup][groups[currentGroup].length - 1];
            
            // Si la última fila tiene el mismo tipo, agregar a esa fila
            if (lastChunk && lastChunk.rowType === rowType) {
                lastChunk.properties.push(prop);
            } else {
                // Crear nueva fila
                groups[currentGroup].push({
                    rowType: rowType,
                    properties: [prop]
                });
            }
        }
    }
}
```

**Ejemplo de agrupación**:
```typescript
class Example extends BaseEntity {
    @ViewGroupRow(ViewGroupRow.PAIR)
    field1: string = "";  // Fila 1 con 2 campos
    
    @ViewGroupRow(ViewGroupRow.PAIR)
    field2: string = "";  // Va en fila 1 junto con field1
    
    @ViewGroupRow(ViewGroupRow.TRIPLE)
    field3: string = "";  // Fila 2 con 3 campos
    
    @ViewGroupRow(ViewGroupRow.TRIPLE)
    field4: string = "";  // Va en fila 2
    
    @ViewGroupRow(ViewGroupRow.TRIPLE)
    field5: string = "";  // Va en fila 2
    
    @ViewGroupRow(ViewGroupRow.SINGLE)
    field6: string = "";  // Fila 3 con 1 campo
}

// Resultado:
// Fila 1: [field1] [field2]
// Fila 2: [field3] [field4] [field5]
// Fila 3: [field6________________]
```

### Consideraciones

- ⚠️ **Default es PAIR**: Si no especificas `@ViewGroupRow()`, se asume PAIR
- ⚠️ **Límite de campos**: Si defines TRIPLE pero solo tienes 2 campos consecutivos, no se llenan los 3 slots
- ✅ **Responsive**: Los componentes FormRow usan CSS Grid para adaptarse a pantallas pequeñas

---

## 4. ToastType - Tipos de Notificaciones

### Ubicación
`src/enums/ToastType.ts`

### Código
```typescript
export enum ToastType {
    SUCCESS,
    ERROR,
    INFO,
    WARNING
}
```

### Descripción

Define los tipos de notificaciones toast (toasts emergentes temporales). Cada tipo tiene un color y icono específico definido en `ToastItemComponent`.

### Valores

| Valor | Color de Fondo | Uso Típico | Icono |
|-------|---------------|------------|-------|
| **SUCCESS** | Verde (`#10b981`) | Operaciones exitosas (guardado, eliminado) | ✓ Check |
| **ERROR** | Rojo (`#ef4444`) | Errores, validaciones fallidas | ✗ Error |
| **INFO** | Azul (`#3b82f6`) | Información general, notificaciones | ℹ Info |
| **WARNING** | Amarillo (`#f59e0b`) | Advertencias, avisos | ⚠ Warning |

### Ejemplo de Uso

```typescript
import { ToastType } from '@/enums/ToastType';
import Application from '@/models/application';

// Toast de éxito
Application.ApplicationUIService.pushToast({
    type: ToastType.SUCCESS,
    title: 'Guardado exitoso',
    message: 'El producto se guardó correctamente',
    duration: 3000
});

// Toast de error
Application.ApplicationUIService.pushToast({
    type: ToastType.ERROR,
    title: 'Error al guardar',
    message: 'No se pudo conectar con el servidor',
    duration: 5000
});

// Toast de información
Application.ApplicationUIService.pushToast({
    type: ToastType.INFO,
    title: 'Actualización disponible',
    message: 'Hay una nueva versión del sistema',
    duration: 4000
});

// Toast de advertencia
Application.ApplicationUIService.pushToast({
    type: ToastType.WARNING,
    title: 'Campos incompletos',
    message: 'Por favor completa todos los campos requeridos',
    duration: 3000
});
```

### Uso en SaveButton

```typescript
// SaveButton.vue - Ejemplo real del framework
async handleSave() {
    const entity = Application.View.value.entityObject;
    
    try {
        await entity.save();
        
        Application.ApplicationUIService.pushToast({
            type: ToastType.SUCCESS,  // ← Verde, icono check
            title: 'Guardado exitoso',
            message: `${entity.constructor.name} guardado correctamente`
        });
        
        Application.changeViewToListView(entity.constructor);
    } catch (error) {
        Application.ApplicationUIService.pushToast({
            type: ToastType.ERROR,  // ← Rojo, icono error
            title: 'Error al guardar',
            message: error.message
        });
    }
}
```

### Mapeo en ToastItemComponent

```vue
<!-- ToastItemComponent.vue -->
<script setup lang="ts">
const getBackgroundColor = computed(() => {
    switch (props.toast.type) {
        case ToastType.SUCCESS: return '#10b981';
        case ToastType.ERROR: return '#ef4444';
        case ToastType.INFO: return '#3b82f6';
        case ToastType.WARNING: return '#f59e0b';
        default: return '#6b7280';
    }
});
</script>
```

### Consideraciones

- ✅ **Uso consistente**: Usa SUCCESS para éxitos, ERROR para fallos, INFO para notificaciones, WARNING para advertencias
- ✅ **Duración variable**: SUCCESS típicamente 3s, ERROR/WARNING 5s (más tiempo para leer)
- ⚠️ **Solo visual**: El tipo solo afecta color/icono, no la función del toast

---

## 5. confMenuType - Tipos de Menús de Confirmación

### Ubicación
`src/enums/conf_menu_type.ts`

### Código
```typescript
export enum confMenuType {
    INFO,
    SUCCESS,
    WARNING,
    ERROR
}
```

### Descripción

Define los tipos visuales de `ConfirmationDialogComponent`. Similar a `ToastType` pero para diálogos modales de confirmación (no para toasts).

### Valores

| Valor | Color de Header | Uso Típico |
|-------|----------------|------------|
| **INFO** | Azul | Información general que requiere confirmación |
| **SUCCESS** | Verde | Confirmar operaciones exitosas |
| **WARNING** | Amarillo | Advertencias que requieren confirmación del usuario |
| **ERROR** | Rojo | Errores graves que requieren confirmación para continuar |

### Ejemplo de Uso

```typescript
import { confMenuType } from '@/enums/conf_menu_type';
import Application from '@/models/application';

// Confirmar eliminación (WARNING)
Application.ApplicationUIService.openConfirmationMenu({
    title: '¿Eliminar producto?',
    message: 'Esta acción no se puede deshacer',
    type: confMenuType.WARNING,
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
    onConfirm: () => {
        entity.delete();
    }
});

// Error que requiere confirmación (ERROR)
Application.ApplicationUIService.openConfirmationMenu({
    title: 'Error crítico',
    message: 'No se pudo conectar con el servidor. Reintentar?',
    type: confMenuType.ERROR,
    confirmText: 'Reintentar',
    cancelText: 'Cancelar',
    onConfirm: () => {
        retryConnection();
    }
});

// Información (INFO)
Application.ApplicationUIService.openConfirmationMenu({
    title: 'Guardar cambios?',
    message: 'Tienes cambios sin guardar',
    type: confMenuType.INFO,
    confirmText: 'Guardar',
    cancelText: 'Descartar',
    onConfirm: () => {
        entity.save();
    }
});

// Éxito (SUCCESS)
Application.ApplicationUIService.openConfirmationMenu({
    title: 'Proceso completado',
    message: 'La importación se realizó correctamente',
    type: confMenuType.SUCCESS,
    confirmText: 'Ver resultados',
    cancelText: 'Cerrar',
    onConfirm: () => {
        router.push('/results');
    }
});
```

### Uso en ConfirmationDialogComponent

```vue
<!-- ConfirmationDialogComponent.vue -->
<script setup lang="ts">
const getHeaderColor = computed(() => {
    switch (props.menu.type) {
        case confMenuType.INFO: return 'var(--color-primary)';     // Azul
        case confMenuType.SUCCESS: return 'var(--color-success)';  // Verde
        case confMenuType.WARNING: return 'var(--color-warning)';  // Amarillo
        case confMenuType.ERROR: return 'var(--color-error)';      // Rojo
        default: return 'var(--color-text)';
    }
});
</script>
```

### Consideraciones

- ⚠️ **Diferente a ToastType**: Aunque los nombres son iguales, son enums diferentes para contextos diferentes
- ✅ **Uso semántico**: Usa WARNING para confirmaciones de acciones destructivas, ERROR para errores graves
- ⚠️ **No confundir con Toast**: confMenuType es para modales con botones, ToastType es para notificaciones temporales

---

## 6. DetailTypes - Tipos de Detalle (FUTURO)

### Ubicación
`src/enums/detail_type.ts`

### Código
```typescript
export enum DetailTypes {
    NEW,
    EDIT
}
```

### Descripción

⚠️ **No implementado actualmente**. Este enum está definido pero no se usa en el código del framework. Su propósito aparente sería distinguir entre modos de creación (NEW) y edición (EDIT) en `DefaultDetailView`.

### Uso Previsto (No Implementado)

```typescript
// Uso hipotético futuro
if (Application.View.value.detailType === DetailTypes.NEW) {
    // Modo creación: resetear campos, generar IDs, etc.
    entity = new EntityClass();
} else if (Application.View.value.detailType === DetailTypes.EDIT) {
    // Modo edición: cargar entidad existente desde API
    entity = await EntityClass.load(Application.View.value.entityOid);
}
```

### Estado Actual

Actualmente se determina el modo implícitamente:
- **NEW**: Si `Application.View.value.entityOid === 'new'`
- **EDIT**: Si `Application.View.value.entityOid` contiene un ID válido

### Consideraciones

- ⚠️ **No usar**: Este enum existe pero no está integrado en el framework
- 📝 **Documentación futura**: Si se implementa, permitiría lógica condicional más explícita

---

## 7. MaskSides - Lados de Máscara (DECORADOR NO EXPORTADO)

### Ubicación
`src/enums/mask_sides.ts`

### Código
```typescript
export enum MaskSides {
    START,
    END
}
```

### Descripción

⚠️ **Decorador @Mask() no exportado**. Este enum definiría desde qué lado aplicar una máscara de formato (ej: para números de cuenta, teléfonos). El decorador `@Mask()` existe en el código pero no está exportado en `src/decorations/index.ts`.

### Uso Previsto (No Implementado)

```typescript
// Uso hipotético si @Mask() estuviera exportado
class BankAccount extends BaseEntity {
    @Mask("****-****-****-####", MaskSides.START)  // Ocultar primeros dígitos
    accountNumber: string = "";  // Muestra: ****-****-****-1234

    @Mask("####-####-####-****", MaskSides.END)  // Ocultar últimos dígitos
    cardNumber: string = "";  // Muestra: 4532-1234-5678-****
}
```

### Valores

| Valor | Descripción |
|-------|-------------|
| **START** | Aplicar máscara desde el inicio (ocultar primeros caracteres) |
| **END** | Aplicar máscara desde el final (ocultar últimos caracteres) |

### Consideraciones

- ⚠️ **No funcional**: El decorador @Mask() no está exportado, no se puede usar
- 📝 **Implementación futura**: Si se exporta @Mask(), este enum permitiría formatear datos sensibles

---

## Resumen de Enums

| Enum | Ubicación | Estado | Uso Principal |
|------|-----------|--------|---------------|
| **ViewTypes** | `view_type.ts` | ✅ Implementado | Controla tipo de vista activa (LISTVIEW, DETAILVIEW, etc.) |
| **StringType** | `string_type.ts` | ✅ Implementado | Define tipo de input para strings (EMAIL, PASSWORD, TEXTAREA, etc.) |
| **ViewGroupRow** | `view_group_row.ts` | ✅ Implementado | Controla disposición de campos (SINGLE, PAIR, TRIPLE) |
| **ToastType** | `ToastType.ts` | ✅ Implementado | Define tipo visual de toasts (SUCCESS, ERROR, INFO, WARNING) |
| **confMenuType** | `conf_menu_type.ts` | ✅ Implementado | Define tipo visual de diálogos de confirmación |
| **DetailTypes** | `detail_type.ts` | ⚠️ Definido, no usado | (Futuro) Distinguiría entre NEW/EDIT en DefaultDetailView |
| **MaskSides** | `mask_sides.ts` | ⚠️ Decorador no exportado | (Futuro) Controlaría lado de aplicación de máscara |

---

## Patrones de Uso Comunes

### 1. Definir tipo de vista al montar componente
```typescript
mounted() {
    Application.View.value.viewType = ViewTypes.LISTVIEW;
}
```

### 2. Condicional basado en tipo de vista
```typescript
if (Application.View.value.viewType === ViewTypes.DETAILVIEW) {
    // Lógica específica de edición
}
```

### 3. Aplicar decoradores de string
```typescript
@StringType(StringType.EMAIL)
email: string = "";
```

### 4. Controlar layout de formulario
```typescript
@ViewGroupRow(ViewGroupRow.PAIR)
field1: string = "";
```

### 5. Mostrar notificación
```typescript
Application.ApplicationUIService.pushToast({
    type: ToastType.SUCCESS,
    title: 'Éxito',
    message: 'Operación completada'
});
```

### 6. Mostrar diálogo de confirmación
```typescript
Application.ApplicationUIService.openConfirmationMenu({
    type: confMenuType.WARNING,
    title: '¿Continuar?',
    message: 'Esta acción es irreversible',
    onConfirm: () => { /* ... */ }
});
```

---

## Debugging

### Ver tipo de vista actual
```typescript
console.log('Current view type:', ViewTypes[Application.View.value.viewType]);
// Output: "Current view type: DETAILVIEW"
```

### Ver string types de una entidad
```typescript
const entity = new MyEntity();
console.log('String types:', entity.getStringType());
// Output: { email: 0, password: 1, bio: 5 }  // 0=EMAIL, 1=PASSWORD, 5=TEXTAREA
```

### Ver view group rows
```typescript
const entity = new MyEntity();
console.log('View group rows:', entity.getViewGroupRows());
// Output: { field1: 'pair', field2: 'pair', field3: 'single' }
```

### Ver nombres legibles de enum
```typescript
console.log('Toast type name:', ToastType[ToastType.SUCCESS]);
// Output: "Toast type name: SUCCESS"

console.log('View group row value:', ViewGroupRow.PAIR);
// Output: "View group row value: pair"
```
