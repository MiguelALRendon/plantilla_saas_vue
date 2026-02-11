# ⚡ ActionsComponent

**Referencias:**
- `core-components.md` - Componentes core del framework
- `buttons-overview.md` - Botones del sistema
- `ComponentContainerComponent.md` - Contenedor principal
- `../03-application/application-singleton.md` - Application

---

## 📍 Ubicación en el Código

**Archivo:** `src/components/ActionsComponent.vue`

---

## 🎯 Propósito

`ActionsComponent` es la **barra flotante de botones de acción** que se muestra en la parte superior derecha de cada vista. Renderiza dinámicamente los botones apropiados según el contexto de la vista actual.

**Características:**
- 🎈 Posición sticky (flotante)
- 🔄 Botones dinámicos según tipo de vista
- 📱 Responsive a scroll
- ⚡ Integrado con `Application.ListButtons`

---

## 🏗️ Estructura

### Template

```vue
<div class="floating-actions" :class="{ 'at-top': isAtTop }">
    <component v-for="component in Application.ListButtons" :is="component" />
</div>
```

**Renderizado Dinámico:** Itera sobre `Application.ListButtons.value` y renderiza cada componente de botón.

---

## ⚙️ Funcionamiento

### Data Properties

```typescript
{
    Application: ApplicationClass,              // Singleton de Application
    isAtTop: boolean,                           // Si el scroll está en el tope
    scrollContainer: HTMLElement | null         // Contenedor con scroll
}
```

### Ciclo de Vida

#### Mounted

```typescript
mounted() {
    // Buscar el contenedor padre con scroll
    this.scrollContainer = this.$el.closest('.ComponentContainer');
    
    if (this.scrollContainer) {
        // Escuchar eventos de scroll
        this.scrollContainer.addEventListener('scroll', this.handleScroll);
        
        // Verificar estado inicial
        this.handleScroll();
    }
}
```

#### BeforeUnmount

```typescript
beforeUnmount() {
    if (this.scrollContainer) {
        // Limpiar event listener
        this.scrollContainer.removeEventListener('scroll', this.handleScroll);
    }
}
```

---

## 📊 Gestión de Scroll

### handleScroll()

```typescript
handleScroll() {
    if (this.scrollContainer) {
        // Detectar si estamos en el tope
        this.isAtTop = this.scrollContainer.scrollTop === 0;
    }
}
```

**Efecto:** Cuando `isAtTop` es true, se aplica la clase CSS `.at-top` que puede cambiar la apariencia de los botones.

---

## 🔄 Botones Dinámicos

### Gestión desde Application

Los botones se configuran automáticamente en `Application.setButtonList()`:

```typescript
// En Application.setButtonList()
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
```

---

## 🎨 Estilos

### Floating Actions Base

```css
.floating-actions {
    position: sticky;           /* Sticky en el scroll */
    top: 0;                     /* Pegado al tope */
    right: 0;
    width: auto;
    margin-left: auto;          /* Alineado a la derecha */
    z-index: 10;
    display: flex;
    flex-direction: row;        /* Botones en fila horizontal */
    gap: 0.5rem;
    padding: 0.5rem;
    transition: all 0.3s ease;
}
```

### Estado At-Top

```css
.floating-actions.at-top {
    /* Estilos especiales cuando está en el tope */
    box-shadow: none;
}
```

**Uso:** Permite diferentes estilos visuales cuando el usuario ha hecho scroll vs. cuando está en el tope.

---

## 📝 Ejemplo de Uso

### Cambio de Vista Automático

```typescript
// El usuario navega a una vista de lista
Application.changeViewToListView(Products);

// Application.setButtonList() se ejecuta automáticamente
// ActionsComponent detecta el cambio en Application.ListButtons
// Renderiza automáticamente:
// - NewButtonComponent
// - RefreshButtonComponent
```

### Vista de Detalle Persistente

```typescript
// El usuario abre un producto
const product = new Products({ id: 1, name: "Laptop" });
Application.changeViewToDetailView(product);

// ActionsComponent renderiza:
// - NewButtonComponent
// - RefreshButtonComponent
// - ValidateButtonComponent
// - SaveButtonComponent
// - SaveAndNewButtonComponent
// - SendToDeviceButtonComponent
```

### Vista de Detalle No Persistente

```typescript
// Entidad sin @Persistent() decorator
Application.changeViewToDetailView(nonPersistentEntity);

// ActionsComponent renderiza solo:
// - NewButtonComponent
// - RefreshButtonComponent
// - ValidateButtonComponent
// - SendToDeviceButtonComponent
// (No se muestran botones de Save)
```

---

## 🔄 Flujo Completo

```
1. Usuario cambia de vista
        ↓
2. Application.changeView() actualiza Application.View
        ↓
3. Application.setButtonList() se ejecuta (timeout 405ms)
        ↓
4. Application.ListButtons.value se actualiza con nuevos botones
        ↓
5. ActionsComponent detecta el cambio (reactividad)
        ↓
6. Vue renderiza los nuevos botones
        ↓
7. Cada botón se monta y escucha clicks
```

---

## ⚡ Reactividad

### Botones Reactivos

```vue
<component v-for="component in Application.ListButtons" :is="component" />
```

**Reactividad de Vue:**
- Cuando `Application.ListButtons.value` cambia, Vue automáticamente:
  1. Desmonta los botones anteriores
  2. Monta los nuevos botones
  3. Mantiene el orden correcto

### Scroll Reactivo

```vue
<div :class="{ 'at-top': isAtTop }">
```

**Reactividad Manual:**
- `isAtTop` se actualiza en cada evento de scroll
- Vue actualiza la clase CSS automáticamente

---

## 🎯 Posicionamiento

### Sticky Position

```
┌─────────────────────────────────────┐
│ ComponentContainer (scroll)         │
│ ┌─────────────────────────────────┐ │
│ │ [New] [Refresh] [Save]          │ │ ← Sticky, siempre visible
│ └─────────────────────────────────┘ │
│                                     │
│ Contenido de la vista...            │
│ (puede hacer scroll)                │
│                                     │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

**Ventaja:** Los botones siempre están accesibles sin importar el scroll.

---

## 🎨 Personalización

### Agregar Botón Personalizado

```typescript
// 1. Crear el componente del botón
// CustomButtonComponent.vue
export default {
    name: 'CustomButtonComponent',
    template: '<button @click="handleClick">Custom</button>',
    methods: {
        handleClick() {
            console.log('Custom action!');
        }
    }
}

// 2. Agregar a Application.ListButtons
import { markRaw } from 'vue';
import CustomButtonComponent from '@/components/Buttons/CustomButtonComponent.vue';

Application.ListButtons.value.push(markRaw(CustomButtonComponent));
```

---

## 🔗 Componentes de Botones

ActionsComponent puede renderizar:

### Botones Estándar

1. **NewButtonComponent** - Crear nueva entidad
2. **RefreshButtonComponent** - Actualizar datos
3. **ValidateButtonComponent** - Validar formulario
4. **SaveButtonComponent** - Guardar entidad
5. **SaveAndNewButtonComponent** - Guardar y crear nueva
6. **SendToDeviceButtonComponent** - Enviar a dispositivo

Ver documentación individual de cada botón en `Buttons/`.

---

## ⚠️ Consideraciones

### 1. Timeout de 405ms

```typescript
setTimeout(() => {
    this.setButtonList();
}, 405);
```

**Razón:** Se ejecuta después de la transición de cambio de vista (400ms) + 5ms de buffer.

### 2. markRaw() Obligatorio

```typescript
// ✅ CORRECTO
Application.ListButtons.value.push(markRaw(NewButtonComponent));

// ❌ INCORRECTO (problemas de rendimiento)
Application.ListButtons.value.push(NewButtonComponent);
```

### 3. Z-Index

```css
z-index: 10;
```

Los botones están **por encima** del contenido de la vista pero **por debajo** de modales (z-index: 1000+).

---

## 🐛 Debugging

### Ver Botones Actuales

```javascript
console.log('Current buttons:', Application.ListButtons.value);
```

### Ver Estado de Scroll

```javascript
// En la consola del navegador
const actions = document.querySelector('.floating-actions');
console.log('Is at top:', actions.classList.contains('at-top'));
```

---

## 📚 Resumen

`ActionsComponent` es el **gestor de botones de acción** del framework:

- ✅ Posición sticky flotante (siempre visible)
- ✅ Botones dinámicos según contexto de vista
- ✅ Integrado con Application.ListButtons
- ✅ Detecta scroll para ajustar estilos
- ✅ Renderizado eficiente con markRaw()
- ✅ Fácilmente extensible con nuevos botones

Los botones se configuran automáticamente, el desarrollador solo necesita:
1. Definir la entidad con decoradores
2. Navegar a la vista
3. Los botones correctos aparecen automáticamente
