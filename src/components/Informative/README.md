# Informative Components Directory

## 1. Propósito

Contiene componentes informativos que muestran datos de manera visual sin permitir edición: toasts para notificaciones temporales, tablas de detalle read-only y lookup items para vistas de solo lectura.

## 2. Alcance

### Responsabilidades
- `ToastContainerComponent.vue` - Contenedor de toasts en esquina superior derecha
- `ToastItemComponent.vue` - Toast individual con mensaje, icono y auto-close
- `DetailViewTableComponent.vue` - Tabla read-only para mostrar datos en vista detalle
- `LookupItemComponent.vue` - Item individual en listas de lookup/búsqueda

### Límites
- NO permiten edición de datos
- NO ejecutan validaciones
- NO mantienen estado persistente

## 3. Definiciones Clave

**Toast**: Notificación temporal auto-dismissible con 4 tipos (SUCCESS, ERROR, INFO, WARNING).  
**Auto-Close**: Toasts desaparecen automáticamente tras duration (default 3000ms).  
**DetailViewTable**: Tabla HTML renderizada en DefaultDetailView modo READ para mostrar properties.

## 4. Descripción Técnica

ToastContainerComponent mantiene array reactive de toasts, agregando elementos al recibir evento 'show-toast'. ToastItemComponent renderiza cada toast con icono dinámico según type, aplicando CSS transitions para entrada/salida. DetailViewTableComponent itera entity properties generando rows con labels y valores formateados.

## 5. Flujo de Funcionamiento

1. Código ejecuta `Application.ApplicationUIService.showSuccessToast('Saved')`
2. ApplicationUIService emite 'show-toast' con Toast instance
3. ToastContainerComponent.toasts.push(toast)
4. ToastItemComponent renderiza con animación slide-in
5. setTimeout ejecuta auto-close tras 3000ms
6. Animación slide-out, toast removido de array

## 6. Reglas Obligatorias

- SIEMPRE usar auto-close para toasts (excepto type ERROR puede ser sticky)
- SIEMPRE renderizar ToastContainerComponent en App.vue
- SIEMPRE aplicar z-index mediante var(--z-toast)
- SIEMPRE usar tokens CSS para colores, spacing, transitions

## 7. Prohibiciones

1. NO usar toasts para mensajes críticos que requieren confirmación
2. NO renderizar toasts sin ToastContainerComponent montado
3. NO hardcodear duration - usar configuración de Toast instance
4. NO hardcodear CSS - usar tokens

## 8. Dependencias

- Application.eventBus - Evento: show-toast
- ApplicationUIService - Métodos: showSuccessToast(), showErrorToast(), showInfoToast(), showWarningToast()
- Toast class - DTO con message, type, duration
- GGICONS - Iconos para toasts (CHECK, ERROR, INFO, WARNING)
- constants.css - Tokens: --z-toast, --toast-*, colores

## 9. Relaciones

ApplicationUIService → ToastContainerComponent (emite eventos)  
BaseEntity.save() → showSuccessToast() / showErrorToast()  
DefaultDetailView → DetailViewTableComponent (renderiza en modo READ)

Documentos: `copilot/layers/04-components/ToastComponents.md`

## 10. Notas de Implementación

```vue
<!-- App.vue -->
<ToastContainerComponent />
```

Uso:
```typescript
try {
    await entity.save();
    Application.ApplicationUIService.showSuccessToast('Product saved successfully');
} catch (error) {
    Application.ApplicationUIService.showErrorToast('Failed to save product');
}
```

## 11. Referencias Cruzadas

- [ToastComponents.md](../../../copilot/layers/04-components/ToastComponents.md)
- [ui-services.md](../../../copilot/layers/03-application/ui-services.md)
- [04-UI-DESIGN-SYSTEM-CONTRACT.md](../../../copilot/04-UI-DESIGN-SYSTEM-CONTRACT.md)
- Tokens CSS: src/css/constants.css
