# Types del Framework

## Propósito

Los types definen definiciones de tipos TypeScript auxiliares para el framework. Incluyen:
1. **Events**: Tipo que define todos los eventos del event bus (mitt)
2. **assets.d.ts**: Declaraciones de módulos para imports de assets (imágenes)

---

## 1. Events - Eventos del Event Bus

### Ubicación
`src/types/events.ts`

### Código
```typescript
export type Events = {
    'validate-inputs': void;
    'validate-entity': void;
    'toggle-sidebar': boolean | void;
    'show-loading': void;
    'hide-loading': void;
    'show-modal': void;
    'hide-modal': void;
    'show-confirmation': void;
    'hide-confirmation': void;
    'show-loading-menu': void;
    'hide-loading-menu': void;
};
```

### Descripción

Define el mapa de eventos que se pueden emitir y escuchar a través del event bus (`Application.eventBus`). El event bus usa la librería `mitt` y este tipo proporciona **tipado fuerte** para que TypeScript valide:
- Nombres de eventos (no puedes emitir un evento que no existe)
- Tipo de payload de cada evento (algunos eventos no llevan datos, otros llevan boolean)

### Estructura

```typescript
type Events = {
    'nombre-evento': TipoDelPayload;
}
```

- **Key**: Nombre del evento (string literal)
- **Value**: Tipo del payload que se envía con el evento
  - `void`: Sin payload
  - `boolean`: Payload es un booleano
  - `boolean | void`: Puede llevar booleano opcional

### Eventos Disponibles

#### 1. validate-inputs
```typescript
'validate-inputs': void;
```

**Payload**: Ninguno

**Propósito**: Disparar validación de todos los inputs de formulario activos en la vista actual.

**Emitido por**: `ValidateButton` al hacer click

**Escuchado por**: Todos los componentes de input (TextInputComponent, NumberInputComponent, etc.)

**Ejemplo**:
```typescript
// ValidateButton.vue
function handleValidate() {
    Application.eventBus.emit('validate-inputs');  // ← Emite sin payload
}

// TextInputComponent.vue
onMounted(() => {
    Application.eventBus.on('validate-inputs', () => {
        validateInput();  // ← Ejecuta validación local
    });
});
```

---

#### 2. validate-entity
```typescript
'validate-entity': void;
```

**Payload**: Ninguno

**Propósito**: Disparar validación completa de la entidad actual (no solo inputs individuales).

**Emitido por**: `ValidateButton` después de validar inputs

**Escuchado por**: Entidades que implementan validaciones custom complejas

**Ejemplo**:
```typescript
// ValidateButton.vue
async function handleValidate() {
    Application.eventBus.emit('validate-inputs');
    await nextTick();
    Application.eventBus.emit('validate-entity');  // ← Validación a nivel entidad
    
    const entity = Application.View.value.entityObject;
    const isValid = await entity?.validate();
    Application.View.value.isValid = isValid;
}

// En componente custom que escucha
Application.eventBus.on('validate-entity', async () => {
    const entity = Application.View.value.entityObject;
    const crossFieldValidation = entity.startDate < entity.endDate;
    if (!crossFieldValidation) {
        console.error('End date must be after start date');
    }
});
```

---

#### 3. toggle-sidebar
```typescript
'toggle-sidebar': boolean | void;
```

**Payload**: `boolean` (opcional) - `true` = abrir, `false` = cerrar, `undefined` = toggle

**Propósito**: Controlar visibilidad del sidebar de navegación.

**Emitido por**: `TopBarComponent` (botón hamburguesa), navegación mobile

**Escuchado por**: `SideBarComponent`

**Ejemplo**:
```typescript
// TopBarComponent.vue - Botón hamburguesa
function toggleSidebar() {
    Application.eventBus.emit('toggle-sidebar');  // ← Toggle (abrir/cerrar)
}

// SideBarComponent.vue
const isOpen = ref(true);

Application.eventBus.on('toggle-sidebar', (forceState?: boolean) => {
    if (forceState !== undefined) {
        isOpen.value = forceState;  // ← Forzar estado específico
    } else {
        isOpen.value = !isOpen.value;  // ← Toggle
    }
});

// Casos de uso:
Application.eventBus.emit('toggle-sidebar', true);   // ← Abrir (forzado)
Application.eventBus.emit('toggle-sidebar', false);  // ← Cerrar (forzado)
Application.eventBus.emit('toggle-sidebar');         // ← Toggle
```

---

#### 4. show-loading
```typescript
'show-loading': void;
```

**Payload**: Ninguno

**Propósito**: Mostrar pantalla de carga fullscreen (`LoadingScreenComponent`).

**Emitido por**: Operaciones asíncronas largas (guardado, carga de datos, etc.)

**Escuchado por**: `LoadingScreenComponent`

**Ejemplo**:
```typescript
// SaveButton.vue
async function handleSave() {
    Application.eventBus.emit('show-loading');  // ← Mostrar loader
    
    try {
        await entity.save();
        Application.ApplicationUIService.pushToast({
            type: ToastType.SUCCESS,
            title: 'Guardado exitoso'
        });
    } catch (error) {
        Application.ApplicationUIService.pushToast({
            type: ToastType.ERROR,
            title: 'Error al guardar'
        });
    } finally {
        Application.eventBus.emit('hide-loading');  // ← Ocultar loader
    }
}

// LoadingScreenComponent.vue
const isLoading = ref(false);

Application.eventBus.on('show-loading', () => {
    isLoading.value = true;
});
```

---

#### 5. hide-loading
```typescript
'hide-loading': void;
```

**Payload**: Ninguno

**Propósito**: Ocultar pantalla de carga fullscreen.

**Emitido por**: Operaciones asíncronas al completarse (tanto éxito como error)

**Escuchado por**: `LoadingScreenComponent`

**Ejemplo**: Ver ejemplo de `show-loading` arriba

---

#### 6. show-modal
```typescript
'show-modal': void;
```

**Payload**: Ninguno

**Propósito**: Mostrar modal global (lookups, diálogos custom).

**Emitido por**: `ApplicationUIService.openModal()`

**Escuchado por**: Componente modal principal que controla visibilidad

**Ejemplo**:
```typescript
// ApplicationUIService
openModal({ component, onFunction }) {
    this.modal.value = {
        modalView: component,
        modalOnCloseFunction: onFunction,
        viewType: ViewTypes.LOOKUPVIEW
    };
    
    this.eventBus.emit('show-modal');  // ← Dispara visibilidad
}

// Modal wrapper component
const isModalVisible = ref(false);

Application.eventBus.on('show-modal', () => {
    isModalVisible.value = true;
});
```

---

#### 7. hide-modal
```typescript
'hide-modal': void;
```

**Payload**: Ninguno

**Propósito**: Ocultar modal global.

**Emitido por**: `ApplicationUIService.closeModalOnFunction()`, cierre manual

**Escuchado por**: Componente modal principal

**Ejemplo**:
```typescript
// ApplicationUIService
closeModalOnFunction(param: any) {
    const callback = this.modal.value.modalOnCloseFunction;
    
    if (callback) {
        callback(param);  // Ejecutar callback primero
    }
    
    this.eventBus.emit('hide-modal');  // ← Ocultar modal
    
    // Resetear estado
    this.modal.value = {
        modalView: null,
        modalOnCloseFunction: null,
        viewType: ViewTypes.DEFAULTVIEW
    };
}
```

---

#### 8. show-confirmation
```typescript
'show-confirmation': void;
```

**Payload**: Ninguno

**Propósito**: Mostrar diálogo de confirmación (`ConfirmationDialogComponent`).

**Emitido por**: `ApplicationUIService.openConfirmationMenu()`

**Escuchado por**: `ConfirmationDialogComponent`

**Ejemplo**:
```typescript
// ApplicationUIService
openConfirmationMenu(options: confirmationMenu) {
    this.confirmationMenu.value = {
        type: options.type,
        title: options.title,
        message: options.message,
        confirmationAction: options.confirmationAction,
        acceptButtonText: options.acceptButtonText,
        cancelButtonText: options.cancelButtonText
    };
    
    this.eventBus.emit('show-confirmation');  // ← Mostrar diálogo
}

// ConfirmationDialogComponent.vue
const isVisible = ref(false);

Application.eventBus.on('show-confirmation', () => {
    isVisible.value = true;
});
```

---

#### 9. hide-confirmation
```typescript
'hide-confirmation': void;
```

**Payload**: Ninguno

**Propósito**: Ocultar diálogo de confirmación.

**Emitido por**: `ApplicationUIService.closeConfirmationMenu()`, botones Aceptar/Cancelar

**Escuchado por**: `ConfirmationDialogComponent`

**Ejemplo**:
```typescript
// ConfirmationDialogComponent.vue
function handleConfirm() {
    const action = Application.ApplicationUIService.confirmationMenu.value.confirmationAction;
    
    if (action) {
        action();  // Ejecutar acción de confirmación
    }
    
    Application.ApplicationUIService.closeConfirmationMenu();  // ← Cierra y emite 'hide-confirmation'
}

// ApplicationUIService
closeConfirmationMenu() {
    this.eventBus.emit('hide-confirmation');
    
    // Resetear estado
    this.confirmationMenu.value = {
        type: confMenuType.INFO,
        title: "",
        message: "",
        confirmationAction: undefined
    };
}
```

---

#### 10. show-loading-menu
```typescript
'show-loading-menu': void;
```

**Payload**: Ninguno

**Propósito**: Mostrar popup de carga (`LoadingPopupComponent`) - diferente de `show-loading` (fullscreen).

**Emitido por**: Operaciones asíncronas que no requieren bloquear toda la pantalla

**Escuchado por**: `LoadingPopupComponent`

**Diferencia con show-loading**:
- `show-loading`: Fullscreen overlay (z-index: 99999), bloquea toda la UI
- `show-loading-menu`: Popup centrado (z-index: 1100), más discreto

**Ejemplo**:
```typescript
// Operación que no requiere bloquear toda la pantalla
async function loadSuggestions() {
    Application.eventBus.emit('show-loading-menu');  // ← Popup pequeño
    
    try {
        const suggestions = await fetchSuggestions();
        displaySuggestions(suggestions);
    } finally {
        Application.eventBus.emit('hide-loading-menu');
    }
}

// LoadingPopupComponent.vue
const isVisible = ref(false);

Application.eventBus.on('show-loading-menu', () => {
    isVisible.value = true;
});
```

---

#### 11. hide-loading-menu
```typescript
'hide-loading-menu': void;
```

**Payload**: Ninguno

**Propósito**: Ocultar popup de carga.

**Emitido por**: Al completar operaciones asíncronas que mostraron `LoadingPopupComponent`

**Escuchado por**: `LoadingPopupComponent`

**Ejemplo**: Ver ejemplo de `show-loading-menu` arriba

---

### Uso del Event Bus

#### Emitir Eventos
```typescript
// Sin payload
Application.eventBus.emit('validate-inputs');

// Con payload
Application.eventBus.emit('toggle-sidebar', true);  // Abrir sidebar

// TypeScript valida
Application.eventBus.emit('evento-inexistente');  // ❌ Error: tipo no existe
Application.eventBus.emit('validate-inputs', 123);  // ❌ Error: payload debe ser void
```

#### Escuchar Eventos
```typescript
// Listener básico
Application.eventBus.on('show-loading', () => {
    console.log('Loading started');
});

// Listener con payload tipado
Application.eventBus.on('toggle-sidebar', (isOpen?: boolean) => {
    console.log('Sidebar toggled:', isOpen);
});

// Remover listener
const handler = () => { /* ... */ };
Application.eventBus.on('show-modal', handler);
Application.eventBus.off('show-modal', handler);
```

#### Listener de Una Vez
```typescript
// Se ejecuta solo una vez y luego se desregistra automáticamente
Application.eventBus.once('hide-loading', () => {
    console.log('Loading finished (this only runs once)');
});
```

#### Cleanup en Componentes Vue
```vue
<script setup lang="ts">
import { onUnmounted } from 'vue';
import Application from '@/models/application';

const handleValidate = () => {
    console.log('Validating...');
};

// Registrar listener
Application.eventBus.on('validate-inputs', handleValidate);

// Limpiar al desmontar
onUnmounted(() => {
    Application.eventBus.off('validate-inputs', handleValidate);
});
</script>
```

### Ventajas del Tipado Fuerte

#### ✅ Autocompletado
```typescript
Application.eventBus.emit('');  // ← Ctrl+Space muestra todos los eventos disponibles
```

#### ✅ Validación de Payload
```typescript
Application.eventBus.emit('toggle-sidebar', 'invalid');  
// ❌ Error: Argument of type 'string' is not assignable to parameter of type 'boolean | void'
```

#### ✅ Refactoring Seguro
Si cambias el nombre de un evento en el tipo `Events`, TypeScript te mostrará TODOS los lugares donde se usa ese evento.

### Consideraciones

- ✅ **Tipado fuerte**: Previene errores comunes de eventos no definidos o payloads incorrectos
- ⚠️ **Global**: El event bus es singleton, todos los componentes comparten la misma instancia
- ⚠️ **Memory leaks**: Recuerda hacer `off()` en `onUnmounted()` para evitar memory leaks
- ✅ **Desacoplamiento**: Los componentes no necesitan referencias directas entre sí

### Debugging

```typescript
// Ver todos los listeners registrados (no disponible en mitt, solo para debugging manual)
console.log('Event bus:', Application.eventBus);

// Agregar logging a eventos
Application.eventBus.on('*', (type, payload) => {
    console.log(`Event fired: ${type}`, payload);
});

// Testear evento manualmente
Application.eventBus.emit('show-loading');
setTimeout(() => {
    Application.eventBus.emit('hide-loading');
}, 2000);
```

---

## 2. assets.d.ts - Declaraciones de Assets

### Ubicación
`src/types/assets.d.ts`

### Código
```typescript
declare module '*.png' {
  const value: string
  export default value
}

declare module '*.jpg' {
  const value: string
  export default value
}

declare module '*.jpeg' {
  const value: string
  export default value
}

declare module '*.svg' {
  const value: string
  export default value
}

declare module '*.gif' {
  const value: string
  export default value
}

declare module '*.webp' {
  const value: string
  export default value
}
```

### Descripción

Archivo de **declaraciones de tipos** (`.d.ts`) que permite a TypeScript entender cómo importar assets de imágenes sin errores de compilación. Sin este archivo, TypeScript no sabría qué tipo tiene un import de imagen.

### Problema que Resuelve

```typescript
// Sin assets.d.ts
import logo from '@/assets/logo.png';
// ❌ Error: Cannot find module '@/assets/logo.png' or its corresponding type declarations.

// Con assets.d.ts
import logo from '@/assets/logo.png';
// ✅ logo es de tipo string (URL de la imagen)
```

### Cómo Funciona

Cada `declare module` le dice a TypeScript:
> "Cuando encuentres un import de un archivo con esta extensión (`.png`, `.jpg`, etc.), 
> trata el default export como un `string` (que será la URL de la imagen)"

### Ejemplo de Uso

#### 1. Import de Imagen
```vue
<script setup lang="ts">
import logo from '@/assets/logo.png';
// logo: string = "/assets/logo-abc123.png" (URL generada por Vite)
</script>

<template>
    <img :src="logo" alt="Logo" />
</template>
```

#### 2. Import Dinámico
```typescript
// Cargar imagen condicionalmente
const getThemeLogo = (isDark: boolean): string => {
    if (isDark) {
        return import('@/assets/logo-dark.png');  // ← TypeScript sabe que retorna string
    } else {
        return import('@/assets/logo-light.png');
    }
};
```

#### 3. En Componentes de Ícono
```vue
<!-- IconComponent.vue -->
<script setup lang="ts">
import userIcon from '@/assets/icons/user.svg';
import settingsIcon from '@/assets/icons/settings.svg';

const icons = {
    user: userIcon,      // string
    settings: settingsIcon  // string
};

const props = defineProps<{
    name: keyof typeof icons;
}>();
</script>

<template>
    <img :src="icons[name]" class="icon" />
</template>
```

#### 4. Import de Múltiples Formatos
```typescript
// Todos estos imports funcionan correctamente
import banner from '@/assets/banner.jpg';      // string
import avatar from '@/assets/avatar.jpeg';     // string
import thumbnail from '@/assets/thumb.webp';   // string
import loading from '@/assets/loading.gif';    // string
import icon from '@/assets/icon.svg';          // string
```

### Interacción con Vite

Cuando importas una imagen, **Vite** (el bundler) hace lo siguiente:

1. **Desarrollo**: Retorna la URL directa al archivo
   ```typescript
   import logo from '@/assets/logo.png';
   console.log(logo);  // "/src/assets/logo.png"
   ```

2. **Producción**: Retorna URL con hash para cache busting
   ```typescript
   import logo from '@/assets/logo.png';
   console.log(logo);  // "/assets/logo-a3f4b2c8.png"
   ```

### Extender para Otros Assets

Si necesitas soporte para otros tipos de archivos:

```typescript
// assets.d.ts
declare module '*.pdf' {
  const value: string
  export default value
}

declare module '*.mp4' {
  const value: string
  export default value
}

declare module '*.woff2' {
  const value: string
  export default value
}
```

### SVG como Componente Vue (Vite)

Si quieres usar SVGs como componentes Vue en lugar de URLs:

```typescript
// vite.config.js (requiere plugin)
import svgLoader from 'vite-svg-loader';

export default {
    plugins: [
        svgLoader()  // ← Permite import de SVG como componente
    ]
}

// assets.d.ts (actualizar declaración)
declare module '*.svg' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent;
  export default component;
}

// Uso
import LogoSvg from '@/assets/logo.svg';  // ← Componente Vue

<template>
    <LogoSvg class="logo" />  <!-- ← Renderiza SVG inline -->
</template>
```

### Consideraciones

- ✅ **Solo para TypeScript**: JavaScript puro no necesita estas declaraciones
- ✅ **Vite maneja los assets**: Este archivo solo provee tipos, Vite hace el procesamiento real
- ⚠️ **No valida existencia**: TypeScript no verifica si el archivo existe, solo que el tipo es correcto
- ✅ **Tree-shakeable**: Assets no usados no se incluyen en el bundle final

### Debugging

```typescript
// Ver URL generada
import logo from '@/assets/logo.png';
console.log('Logo URL:', logo);
// Desarrollo: "/src/assets/logo.png"
// Producción: "/assets/logo-a3f4b2c8.png"

// Verificar tipo
import banner from '@/assets/banner.jpg';
console.log(typeof banner);  // "string"
```

---

## Resumen de Types

| Type | Ubicación | Propósito | Uso Principal |
|------|-----------|-----------|---------------|
| **Events** | `types/events.ts` | Define eventos del event bus con tipado fuerte | `Application.eventBus.emit()`, `.on()` |
| **assets.d.ts** | `types/assets.d.ts` | Declaraciones para imports de imágenes | `import logo from '@/assets/logo.png'` |

---

## Patrones de Uso Comunes

### 1. Comunicación entre componentes con event bus
```typescript
// ComponentA.vue - Emisor
Application.eventBus.emit('validate-inputs');

// ComponentB.vue - Receptor
Application.eventBus.on('validate-inputs', () => {
    console.log('Validation requested by ComponentA');
});
```

### 2. Loading pattern
```typescript
async function loadData() {
    Application.eventBus.emit('show-loading');
    
    try {
        const data = await fetchData();
        return data;
    } finally {
        Application.eventBus.emit('hide-loading');
    }
}
```

### 3. Toggle UI elements
```typescript
// Abrir sidebar
Application.eventBus.emit('toggle-sidebar', true);

// Cerrar sidebar
Application.eventBus.emit('toggle-sidebar', false);

// Toggle (abrir si cerrado, cerrar si abierto)
Application.eventBus.emit('toggle-sidebar');
```

### 4. Import de assets en componentes
```vue
<script setup lang="ts">
import logo from '@/assets/logo.png';
import userIcon from '@/assets/icons/user.svg';
</script>

<template>
    <img :src="logo" alt="Logo" />
    <img :src="userIcon" alt="User" />
</template>
```

---

## Debugging Event Bus

### Ver eventos emitidos globalmente
```typescript
// Agregar en main.js o App.vue (solo para debugging)
Application.eventBus.on('*', (type, payload) => {
    console.log(`[EventBus] ${type}`, payload);
});

// Output:
// [EventBus] validate-inputs undefined
// [EventBus] show-loading undefined
// [EventBus] toggle-sidebar true
```

### Testear eventos manualmente
```typescript
// En consola del navegador
Application.eventBus.emit('show-loading');
setTimeout(() => {
    Application.eventBus.emit('hide-loading');
}, 2000);
```

### Verificar listeners registrados
```typescript
// mitt no expone listeners públicamente, pero puedes debuggear así:
const testHandler = () => console.log('Test handler');
Application.eventBus.on('show-modal', testHandler);

// Para remover:
Application.eventBus.off('show-modal', testHandler);
```
