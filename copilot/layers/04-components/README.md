# 🧩 Layer 4: Vue Components

Esta capa documenta todos los **componentes Vue** del framework SaaS. Los componentes están organizados por categoría funcional.

---

## 📂 Estructura de Componentes

### **Core Components** (Layout & Navigation)
- `TopBarComponent.vue` - Barra superior con navegación
- `SideBarComponent.vue` - Barra lateral con módulos
- `SideBarItemComponent.vue` - Item individual del sidebar
- `TabControllerComponent.vue` - Controlador de tabs
- `TabComponent.vue` - Tab individual
- `ActionsComponent.vue` - Barra de acciones
- `ComponentContainerComponent.vue` - Contenedor genérico
- `LoadingScreenComponent.vue` - Pantalla de carga
- `DropdownMenu.vue` - Dropdown menu contextual

### **Form Components** (src/components/Form/)
- `TextInputComponent.vue` - Input de texto
- `NumberInputComponent.vue` - Input numérico
- `BooleanInputComponent.vue` - Checkbox/Switch
- `DateInputComponent.vue` - Selector de fecha
- `EmailInputComponent.vue` - Input de email
- `PasswordInputComponent.vue` - Input de contraseña
- `TextAreaComponent.vue` - Textarea multilinea
- `ArrayInputComponent.vue` - Input para arrays
- `ObjectInputComponent.vue` - Input para objetos
- `ListInputComponent.vue` - Input con lista de opciones
- `FormGroupComponent.vue` - Grupo de form fields
- `FormRowTwoItemsComponent.vue` - Row con 2 campos
- `FormRowThreeItemsComponent.vue` - Row con 3 campos

### **Button Components** (src/components/Buttons/)
- `SaveButtonComponent.vue` - Botón de guardar
- `NewButtonComponent.vue` - Botón de nuevo
- `SaveAndNewButtonComponent.vue` - Guardar y nuevo
- `RefreshButtonComponent.vue` - Botón de recargar
- `ValidateButtonComponent.vue` - Botón de validar
- `SendToDeviceButtonComponent.vue` - Enviar a dispositivo
- `GenericButtonComponent.vue` - Botón genérico configurable

### **Modal Components** (src/components/Modal/)
- `ModalComponent.vue` - Modal base
- `ConfirmationDialogComponent.vue` - Dialog de confirmación
- `LoadingPopupComponent.vue` - Popup de loading

### **Informative Components** (src/components/Informative/)
- `DetailViewTableComponent.vue` - Tabla para DetailView
- `LookupItem.vue` - Item de lookup/búsqueda
- `ToastContainerComponent.vue` - Contenedor de toasts
- `ToastItemComponent.vue` - Toast individual

### **Views** (src/views/)
- `default_detailview.vue` - Vista de detalle default
- `default_listview.vue` - Vista de lista default
- `default_lookup_listview.vue` - Vista de lookup default
- `list.vue` - Vista de lista genérica

---

## 📖 Convenciones de Documentación

Cada componente está documentado con:
- **Descripción**: Qué hace el componente
- **Utilidad**: Para qué se usa
- **Props**: Propiedades con tipos y valores default
- **Events**: Eventos emitidos
- **Slots**: Slots disponibles
- **Ejemplos**: Casos de uso comunes

---

## 🔗 Referencias

- **Decoradores**: `../01-decorators/` - Decoradores que configuran componentes
- **BaseEntity**: `../02-base-entity/` - Entidad base que usa componentes
- **Application**: `../03-application/` - Aplicación que renderiza componentes

---

**Total Componentes:** ~40  
**Última actualización:** 10 de Febrero, 2026
