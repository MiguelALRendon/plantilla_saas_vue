# Modal Components Directory

## 1. Propósito

Contiene los componentes de modales del framework que implementan overlays modales para confirmación, loading states y diálogos personalizados. Integrados con ApplicationUIService mediante EventBus para control centralizado desde cualquier parte de la aplicación.

## 2. Alcance

### Responsabilidades
- `ModalComponent.vue` - Modal genérico customizable con header, body, footer
- `ConfirmationDialogComponent.vue` - Diálogo de confirmación con 4 tipos (INFO, SUCCESS, WARNING, ERROR)
- `LoadingPopupComponent.vue` - Overlay de loading con spinner animado

### Límites
- NO gestiona estado global - Application.eventBus controla visibilidad
- NO ejecuta lógica de negocio - Solo renderiza y ejecuta callbacks
- NO mantiene queue de modales - Un modal a la vez

## 3. Definiciones Clave

**Modal Overlay**: Capa z-index elevado que oscurece contenido y muestra diálogo centrado.  
**EventBus Integration**: Subscriben a eventos 'show-modal', 'show-confirmation-dialog', 'toggle-loading-popup'.  
**Callback Pattern**: acceptCallback y cancelCallback ejecutados al click en botones.

## 4. Descripción Técnica

Componentes montados permanentemente en App.vue, inicialmente ocultos (isVisible: false). ApplicationUIService emite eventos con payload de configuración (Modal instance). Listeners actualizan estado reactivo local y muestran modal. CSS usa var(--z-modal), var(--overlay-dark), transiciones para animaciones.

## 5. Flujo de Funcionamiento

1. Código ejecuta `Application.ApplicationUIService.showConfirmationDialog(config)`
2. ApplicationUIService emite 'show-confirmation-dialog' con payload Modal
3. ConfirmationDialogComponent listener recibe evento
4. Actualiza isVisible = true, config = payload
5. Renderiza modal con animación CSS
6. Usuario click Accept → ejecuta config.acceptCallback()
7. Emite 'close', isVisible = false

## 6. Reglas Obligatorias

- SIEMPRE limpiar EventBus listeners en beforeUnmount()
- SIEMPRE usar tokens CSS (var(--modal-header-footer-height), var(--z-modal))
- SIEMPRE montar en App.vue, NO renderizar condicionalmente
- SIEMPRE ejecutar callbacks en try-catch
- SIEMPRE usar overlay clickable para cerrar

## 7. Prohibiciones

1. NO renderizar múltiples modales simultáneamente
2. NO modificar z-index con valores hardcoded
3. NO olvidar cleanup de EventBus
4. NO hardcodear CSS - usar tokens de constants.css

## 8. Dependencias

- Application.eventBus - Events: show-modal, show-confirmation-dialog, toggle-loading-popup
- ApplicationUIService - Métodos: showSimpleModal(), showConfirmationDialog(), showLoadingPopup()
- Modal class - DTO con title, message, callbacks, type
- constants.css - Tokens: --modal-*, --z-modal, --overlay-dark

## 9. Relaciones

ApplicationUIService → emite eventos → ModalComponent/ConfirmationDialogComponent/LoadingPopupComponent escuchan  
DefaultDetailView → llama ApplicationUIService → muestra modales de confirmación  
API requests → muestran LoadingPopupComponent durante async operations

Documentos: `copilot/layers/04-components/modal-components.md`

## 10. Notas de Implementación

```vue
<!-- App.vue -->
<template>
    <ModalComponent />
    <ConfirmationDialogComponent />
    <LoadingPopupComponent />
</template>
```

Uso:
```typescript
Application.ApplicationUIService.showConfirmationDialog({
    title: 'Delete Product',
    message: 'Are you sure?',
    type: ConfirmationType.WARNING,
    acceptCallback: async () => await entity.delete()
});
```

## 11. Referencias Cruzadas

- [modal-components.md](../../../copilot/layers/04-components/modal-components.md)
- [ui-services.md](../../../copilot/layers/03-application/ui-services.md)
- [04-UI-DESIGN-SYSTEM-CONTRACT.md](../../../copilot/04-UI-DESIGN-SYSTEM-CONTRACT.md) §6.4
- Tokens CSS: src/css/constants.css
