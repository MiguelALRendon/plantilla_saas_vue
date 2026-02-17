# Buttons Components Directory

## 1. Propósito

Contiene componentes de botones especializados que ejecutan acciones comunes del framework: guardar, validar, crear nuevo, refrescar datos. Integrados con Application Layer y BaseEntity para operaciones CRUD estándar.

## 2. Alcance

### Responsabilidades
- `SaveButtonComponent.vue` - Guarda entity actual ejecutando entity.save()
- `SaveAndNewButtonComponent.vue` - Guarda y navega a creación de nuevo registro
- `NewButtonComponent.vue` - Navega a vista de creación
- `RefreshButtonComponent.vue` - Refresca datos ejecutando entity.refresh()
- `ValidateButtonComponent.vue` - Ejecuta entity.isValidated() mostrando errores
- `GenericButtonComponent.vue` - Botón base customizable con slots
- `SendToDeviceButtonComponent.vue` - Botón específico para envío a dispositivos

### Límites
- NO implementan lógica de negocio compleja
- NO manejan routing directamente (usan Application.changeView)
- NO procesan datos - delegan a BaseEntity methods

## 3. Definiciones Clave

**Action Button**: Botón especializado que ejecuta una operación específica del framework.  
**SaveAndNew Pattern**: Guarda entity actual y navega inmediatamente a creación de nuevo registro.  
**Validation Button**: Trigger manual de validación, útil para debugging o validación before save.

## 4. Descripción Técnica

Botones implementan pattern de composición: GenericButtonComponent como base con slots para icono y texto, otros botones lo extienden con lógica específica. Props comunes: entity (BaseEntity instance), disabled (boolean), loading (boolean). Métodos onClick ejecutan async operations con try-catch, mostrando toasts de éxito/error mediante ApplicationUIService.

## 5. Flujo de Funcionamiento

**SaveButton:**
1. Usuario click en SaveButton
2. Button ejecuta handleSave()
3. this.loading = true
4. await this.entity.save()
5. ApplicationUIService.showSuccessToast('Saved')
6. this.loading = false
7. Button disabled durante loading

**SaveAndNew:**
1. Click → await entity.save()
2. Success → Application.changeView(entityClass, ViewType.DETAIL, ViewMode.CREATE)
3. Router navega a nueva vista de creación
4. Form vacío renderizado

## 6. Reglas Obligatorias

- SIEMPRE mostrar loading state durante async operations
- SIEMPRE usar try-catch con toasts de error
- SIEMPRE deshabilitar botón durante loading
- SIEMPRE usar tokens CSS (var(--btn-primary), var(--spacing-md))
- SIEMPRE recibir entity via props, NO acceder a Application.View directamente

## 7. Prohibiciones

1. NO ejecutar múltiples operaciones simultáneas
2. NO omitir loading states
3. NO hardcodear textos - usar props o i18n
4. NO hardcodear CSS - usar tokens
5. NO modificar entity sin ejecutar save()

## 8. Dependencias

- BaseEntity - Methods: save(), refresh(), isValidated(), delete()
- ApplicationUIService - showSuccessToast(), showErrorToast(), showLoadingPopup()
- Application - changeView() para navegación
- constants.css - Tokens: --btn-*, --spacing-*, --transition-*
- GGICONS - Iconos de botones

## 9. Relaciones

DefaultDetailView → SaveButton, SaveAndNewButton, NewButton, ValidateButton  
GenericButtonComponent → Base para todos los buttons especializados  
BaseEntity.save() → Llamado por SaveButton y SaveAndNewButton

Documentos: `copilot/layers/04-components/` (varios)

## 10. Notas de Implementación

```vue
<!-- DefaultDetailView.vue -->
<template>
    <div class="actions">
        <SaveButtonComponent :entity="currentEntity" />
        <SaveAndNewButtonComponent :entity="currentEntity" />
        <RefreshButtonComponent :entity="currentEntity" />
        <ValidateButtonComponent :entity="currentEntity" />
    </div>
</template>
```

Uso de GenericButton:
```vue
<GenericButtonComponent @click="customAction" :loading="isLoading">
    <template #icon>🔔</template>
    <template #text>Custom Action</template>
</GenericButtonComponent>
```

## 11. Referencias Cruzadas

- [views-overview.md](../../../copilot/layers/04-components/views-overview.md)
- [base-entity.md](../../../copilot/layers/02-base-entity/base-entity.md)
- [04-UI-DESIGN-SYSTEM-CONTRACT.md](../../../copilot/04-UI-DESIGN-SYSTEM-CONTRACT.md)
- Tokens CSS: src/css/constants.css
