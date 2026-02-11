# 📦 ComponentContainerComponent

**Referencias:**
- `core-components.md` - Componentes core del framework
- `../03-application/application-singleton.md` - Application
- `views-overview.md` - Vistas del sistema
- `LoadingScreenComponent.md` - Pantalla de carga
- `TopBarComponent.md` - Barra superior
- `ActionsComponent.md` - Barra de acciones

---

## 📍 Ubicación en el Código

**Archivo:** `src/components/ComponentContainerComponent.vue`

---

## 🎯 Propósito

`ComponentContainerComponent` es el **contenedor principal** para todas las vistas del framework. Es responsable de:

1. **Renderizar dinámicamente** el componente de vista actual
2. **Gestionar transiciones** entre vistas
3. **Integrar** TopBar, ActionsComponent y LoadingScreen
4. **Escuchar cambios** en `Application.View.value.component`

**Patrón:** Container Component + Dynamic Component Rendering

---

## 🏗️ Estructura

### Componentes Hijos

El contenedor integra tres componentes fijos:

```vue
<TopBarComponent />           <!-- Barra superior con título del módulo -->
<ActionsComponent />          <!-- Botones flotantes de acción -->
<component :is="currentComponent" />  <!-- Vista dinámica actual -->
<LoadingScreenComponent />    <!-- Overlay de carga -->
```

### Jerarquía Visual

```
┌─────────────────────────────────────────┐
│ ViewContainer                           │
│ ┌─────────────────────────────────────┐ │
│ │ TopBarComponent                     │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ ComponentContainer                  │ │
│ │ ┌─────────────────────────────────┐ │ │
│ │ │ ActionsComponent (floating)     │ │ │
│ │ └─────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────┐ │ │
│ │ │ <component :is="currentComp" /> │ │ │
│ │ │ (Vista dinámica)                │ │ │
│ │ └─────────────────────────────────┘ │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ LoadingScreenComponent (overlay)    │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## ⚙️ Funcionamiento

### Inicialización

Al crearse el componente:

```typescript
created() {
    // Obtener componente inicial de Application.View
    const init = Application.View.value.component;
    if (init) {
        this.currentComponent = markRaw(init);
    }

    // Configurar watcher para cambios de vista
    watch(() => Application.View.value.component, async (newVal) => {
        if (newVal) {
            // Mostrar loading
            Application.ApplicationUIService.showLoadingScreen();
            
            // Esperar 400ms (transición suave)
            await new Promise(resolve => setTimeout(resolve, 400));
            
            // Cambiar componente (markRaw para optimización)
            this.currentComponent = markRaw(newVal);
            
            // Ocultar loading
            Application.ApplicationUIService.hideLoadingScreen();
        }
    });
}
```

### Flujo de Cambio de Vista

```
1. Usuario hace acción (ej: click en sidebar)
        ↓
2. Application.changeView() actualiza Application.View.value.component
        ↓
3. Watcher detecta el cambio
        ↓
4. Se muestra LoadingScreenComponent (showLoadingScreen)
        ↓
5. Espera 400ms (transición visual)
        ↓
6. Se actualiza currentComponent con markRaw()
        ↓
7. Vue renderiza el nuevo componente dinámicamente
        ↓
8. Se oculta LoadingScreenComponent (hideLoadingScreen)
```

---

## 🔑 Propiedades

### Data

```typescript
{
    currentComponent: Component | null  // Componente de vista actual a renderizar
    GGICONS: object                     // Constantes de iconos GG
    GGCLASS: string                     // Clase CSS para iconos GG
}
```

---

## 🎨 Estilos

### ViewContainer

```css
.ViewContainer {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    max-height: 100vh;
    background-color: var(--white);
}
```

Contenedor principal de toda la vista. Layout en columna vertical.

### ComponentContainer

```css
.ComponentContainer {
    width: 100%;
    height: 100%;
    max-height: calc(100vh - 50px);   /* Resta altura del TopBar */
    overflow: auto;                   /* Scroll interno */
    padding: 1rem;
    background-color: var(--bg-gray);
    border-radius: var(--border-radius);
}
```

Área con scroll donde se renderizan las vistas dinámicas.

---

## 📊 Uso en el Framework

### Router

El router renderiza este componente para todas las rutas de módulos:

```typescript
{
    path: '/:module',
    name: 'ModuleList',
    component: { template: '<component-container-component />' }
},
{
    path: '/:module/:oid',
    name: 'ModuleDetail',
    component: { template: '<component-container-component />' }
}
```

### Registro Global

Este componente se registra globalmente en `main.js`:

```typescript
import ComponentContainerComponent from '@/components/ComponentContainerComponent.vue';
app.component('component-container-component', ComponentContainerComponent);
```

---

## 🔄 Integración con Application

### Lectura de Estado

```typescript
// El componente reactivo se obtiene de Application
const currentView = Application.View.value.component;
```

### Watcher Reactivo

```typescript
watch(() => Application.View.value.component, (newComponent) => {
    // Reacciona automáticamente a cambios en Application.View
});
```

---

## 💡 Optimización: markRaw()

### ¿Por qué markRaw()?

```typescript
this.currentComponent = markRaw(newVal);
```

**Razón:** Los componentes Vue son objetos complejos. `markRaw()` los marca como no reactivos, evitando que Vue intente hacer tracking profundo de sus propiedades internas.

**Beneficios:**
- ⚡ Mejor rendimiento
- 💾 Menor uso de memoria
- 🚀 Renderizado más rápido

**Regla:** Siempre usar `markRaw()` con componentes dinámicos.

---

## 📝 Ejemplo de Uso

### Cambio de Vista Automático

```typescript
// En cualquier parte del código
import Application from '@/models/application';

// Cambiar a vista de lista de productos
Application.changeViewToListView(Products);

// El ComponentContainerComponent automáticamente:
// 1. Detecta el cambio
// 2. Muestra loading
// 3. Renderiza DefaultListView
// 4. Oculta loading
```

---

## 🎯 Ciclo de Vida Completo

### Montaje Inicial

```
1. App.vue se monta
        ↓
2. Router detecta URL inicial
        ↓
3. Router carga ComponentContainerComponent
        ↓
4. ComponentContainerComponent.created() se ejecuta
        ↓
5. Lee Application.View.value.component
        ↓
6. Asigna currentComponent con markRaw()
        ↓
7. Vue renderiza el componente dinámico
        ↓
8. TopBar, Actions y Loading también se montan
```

### Cambio de Vista

```
1. Usuario hace click en sidebar item
        ↓
2. SideBarItemComponent.setNewView() llama a:
   Application.changeViewToDefaultView(module)
        ↓
3. Application actualiza View.value.component
        ↓
4. Watcher en ComponentContainerComponent detecta cambio
        ↓
5. Muestra loading overlay (400ms)
        ↓
6. Actualiza currentComponent
        ↓
7. Vue desmonta componente anterior y monta el nuevo
        ↓
8. Oculta loading overlay
```

---

## ⚠️ Consideraciones Importantes

### 1. Transición de 400ms

La espera de 400ms es intencional para dar feedback visual al usuario:

```typescript
await new Promise(resolve => setTimeout(resolve, 400));
```

Si se elimina, el cambio es tan rápido que el usuario puede no percibir que cambió algo.

### 2. Component Reactividad

El watcher solo reacciona cuando `Application.View.value.component` **cambia de referencia**, no cuando cambian propiedades internas del componente.

### 3. Limpieza de Componentes

Vue automáticamente limpia el componente anterior cuando se asigna uno nuevo a `currentComponent`.

---

## 🔗 Componentes Relacionados

- **TopBarComponent** - Muestra título y breadcrumbs
- **ActionsComponent** - Renderiza botones flotantes
- **LoadingScreenComponent** - Overlay de carga durante transiciones
- **Application.View** - Estado reactivo de vista actual

---

## 🐛 Debugging

### Ver Componente Actual

```javascript
console.log('Current component:', Application.View.value.component);
console.log('Current view type:', Application.View.value.viewType);
console.log('Current entity class:', Application.View.value.entityClass);
```

### Ver Cambios de Vista

```javascript
Application.eventBus.on('*', (type, event) => {
    console.log('Event:', type, event);
});
```

---

## 📚 Resumen

`ComponentContainerComponent` es el **corazón del sistema de renderizado dinámico**:

- ✅ Renderiza vistas dinámicamente según `Application.View`
- ✅ Maneja transiciones suaves con loading
- ✅ Integra TopBar, Actions y Loading
- ✅ Optimizado con markRaw() para mejor rendimiento
- ✅ Scroll interno aislado por vista
- ✅ Registrado globalmente para uso en router

Es el **único componente** que el router necesita conocer. Todas las vistas se renderizan dentro de él.
