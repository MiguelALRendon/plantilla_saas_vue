# Types del Framework

## 1. Propósito

Los types definen definiciones de tipos TypeScript auxiliares que proporcionan tipado fuerte y soporte de assets para el framework. Incluyen el tipo Events que mapea todos los eventos del event bus global con sus payloads tipados, y las declaraciones assets.d.ts que permiten imports de imágenes con validación TypeScript. Garantizan seguridad de tipos en comunicación entre componentes vía event bus y en carga de recursos estáticos mediante imports de módulos.

## 2. Alcance

**UBICACION:** src/types/

**TYPES IMPLEMENTADOS:**
- Events: src/types/events.ts - Mapeo eventos event bus con payloads tipados
- assets.d.ts: src/types/assets.d.ts - Declaraciones módulos para imports imágenes

**EVENTOS DEFINIDOS (11 TOTAL):**
- validate-inputs: Disparar validación inputs formulario
- validate-entity: Disparar validación entidad completa
- toggle-sidebar: Controlar visibilidad sidebar navegación
- show-loading: Mostrar pantalla carga fullscreen
- hide-loading: Ocultar pantalla carga fullscreen
- show-modal: Mostrar modal global lookups
- hide-modal: Ocultar modal global
- show-confirmation: Mostrar diálogo confirmación
- hide-confirmation: Ocultar diálogo confirmación
- show-loading-menu: Mostrar popup carga pequeño
- hide-loading-menu: Ocultar popup carga pequeño

**FORMATOS ASSET SOPORTADOS:**
png, jpg, jpeg, svg, gif, webp

**INTEGRACION:**
Event bus usa librería mitt, Application.eventBus singleton global, assets procesados por Vite bundler.

## 3. Definiciones Clave

**Events type:**
Mapa de eventos del event bus que define nombres de eventos como keys y tipos de payload como values. Proporciona tipado fuerte para Application.eventBus.emit() y .on() validando que nombres de eventos existan y payloads coincidan con tipos esperados. Payload puede ser void sin datos, boolean para valores true/false, o boolean pipe void para opcionales.

**assets.d.ts declaraciones:**
Archivo declaraciones de tipos .d.ts que usa declare module para cada extensión imagen informando TypeScript que imports de archivos con esas extensiones retornan string siendo URL de imagen generada por Vite. Sin estas declaraciones TypeScript emite error Cannot find module para imports de imágenes.

**Event bus singleton:**
Instancia global mitt en Application.eventBus compartida por todos componentes del framework. Permite comunicación desacoplada entre componentes sin referencias directas. Requiere cleanup manual con eventBus.off() en onUnmounted para prevenir memory leaks.

**Vite asset processing:**
Bundler Vite procesa imports de assets retornando URL directa en desarrollo /src/assets/file.png y URL con hash en producción /assets/file-a3f4b2c8.png para cache busting. Assets no usados son tree-shakeable eliminándose del bundle final.

## 4. Descripción Técnica

**EVENTS TYPE DEFINITION:**
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
**ESTRUCTURA:** Key es nombre evento string literal, value es tipo payload. void indica sin payload, boolean payload booleano requerido, boolean pipe void payload booleano opcional. TypeScript valida nombres eventos en emit() y tipos payloads en on().

**VALIDATE-INPUTS EVENT:**
Payload void sin datos. Propósito disparar validación todos inputs formulario activos. Emitido por ValidateButton al click. Escuchado por todos componentes input TextInputComponent NumberInputComponent EmailInputComponent etc ejecutando validateInput() local al recibir evento.

**VALIDATE-ENTITY EVENT:**
Payload void sin datos. Propósito disparar validación completa entidad no solo inputs individuales. Emitido por ValidateButton después validate-inputs. Escuchado por entidades con validaciones custom complejas cross-field como startDate menor que endDate. ValidateButton ejecuta entity.validate() después emitir evento.

**TOGGLE-SIDEBAR EVENT:**
Payload boolean pipe void donde true fuerza abrir, false fuerza cerrar, undefined hace toggle alternando estado. Propósito controlar visibilidad sidebar navegación. Emitido por TopBarComponent botón hamburguesa. Escuchado por SideBarComponent actualizando isOpen ref según payload recibido.

**SHOW-LOADING EVENT:**
Payload void sin datos. Propósito mostrar LoadingScreenComponent pantalla carga fullscreen con z-index 99999 bloqueando toda UI. Emitido por operaciones asíncronas largas como save() load() fetchData(). Escuchado por LoadingScreenComponent estableciendo isLoading ref true. Siempre debe tener hide-loading correspondiente en finally block.

**HIDE-LOADING EVENT:**
Payload void sin datos. Propósito ocultar LoadingScreenComponent. Emitido por operaciones asíncronas al completarse tanto éxito como error en finally block garantizando ejecución. Escuchado por LoadingScreenComponent estableciendo isLoading ref false.

**SHOW-MODAL EVENT:**
Payload void sin datos. Propósito mostrar modal global para lookups y diálogos custom. Emitido por ApplicationUIService.openModal() después establecer modal.value con modalView component y modalOnCloseFunction callback. Escuchado por componente modal principal estableciendo isModalVisible ref true.

**HIDE-MODAL EVENT:**
Payload void sin datos. Propósito ocultar modal global. Emitido por ApplicationUIService.closeModalOnFunction() después ejecutar callback onCloseFunction. Escuchado por componente modal principal estableciendo isModalVisible ref false. ApplicationUIService resetea modal.value a defaults con modalView null.

**SHOW-CONFIRMATION EVENT:**
Payload void sin datos. Propósito mostrar ConfirmationDialogComponent diálogo confirmación usuario. Emitido por ApplicationUIService.openConfirmationMenu() recibiendo objeto con type title message confirmationAction callbacks. Escuchado por ConfirmationDialogComponent estableciendo isVisible ref true.

**HIDE-CONFIRMATION EVENT:**
Payload void sin datos. Propósito ocultar ConfirmationDialogComponent. Emitido por ApplicationUIService.closeConfirmationMenu() después ejecutar confirmationAction callback si usuario hace clic Aceptar. Escuchado por ConfirmationDialogComponent estableciendo isVisible ref false. ApplicationUIService resetea confirmationMenu.value a defaults.

**SHOW-LOADING-MENU Y HIDE-LOADING-MENU EVENTS:**
Payload void sin datos. Propósito mostrar/ocultar LoadingPopupComponent popup carga pequeño con z-index 1100 más discreto que show-loading fullscreen. Emitido por operaciones asíncronas que no requieren bloquear toda pantalla como fetchSuggestions(). Escuchado por LoadingPopupComponent estableciendo isVisible ref. Diferencia show-loading es fullscreen overlay bloqueando UI, show-loading-menu es popup centrado no bloqueante.

**ASSETS.D.TS DECLARATIONS:**
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
**FUNCIONAMIENTO:** Cada declare module informa TypeScript que imports de archivos con esa extensión retornan default export tipo string siendo URL imagen. Sin declaraciones TypeScript emite error Cannot find module para imports imágenes. Vite procesa import retornando URL directa en dev /src/assets/logo.png y URL con hash producción /assets/logo-a3f4b2c8.png.

## 5. Flujo de Funcionamiento

**PASO 1 - Emitir Evento Validate-Inputs:**
Usuario hace clic en ValidateButton, ejecuta handleValidate() llamando Application.eventBus.emit('validate-inputs'), event bus mitt notifica todos listeners registrados para evento validate-inputs, cada componente input TextInputComponent EmailInputComponent etc recibe notificación ejecutando handler que llama validateInput() local.

**PASO 2 - Validación Inputs Individual:**
Cada input ejecuta validateInput() obteniendo metadata con getPropertyMetadata() validando required unique mask format, actualiza hasError ref según resultado, renderiza mensaje error si failed validation, emite updated:hasError a parent component con nuevo estado error.

**PASO 3 - Emitir Evento Validate-Entity:**
ValidateButton espera nextTick() para permitir inputs actualizar estados, luego emite Application.eventBus.emit('validate-entity'), entidad o componentes custom con validaciones cross-field reciben evento ejecutando validation logic compleja como comparar startDate menor que endDate.

**PASO 4 - Validación Entidad Completa:**
ValidateButton obtiene entity desde Application.View.value.entityObject, llama await entity.validate() que itera todas properties ejecutando getPropertyValidations() y validateProperty(), retorna boolean isValid true si todas properties pasan, ValidateButton actualiza Application.View.value.isValid con resultado permitiendo SaveButton habilitar/deshabilitar según validation state.

**PASO 5 - Toggle Sidebar Mobile:**
Usuario hace clic botón hamburguesa TopBarComponent en mobile viewport, ejecuta toggleSidebar() llamando Application.eventBus.emit('toggle-sidebar') sin payload undefined, SideBarComponent tiene listener que recibe forceState undefined ejecutando isOpen.value = !isOpen.value alternando estado colapsado/expandido con CSS transition.

**PASO 6 - Loading Pattern Async:**
Usuario hace clic SaveButton iniciando operación asíncrona, código ejecuta Application.eventBus.emit('show-loading'), LoadingScreenComponent listener establece isLoading true renderizando fullscreen overlay con spinner icono, operación ejecuta try con await entity.save() luego finally con Application.eventBus.emit('hide-loading'), LoadingScreenComponent listener establece isLoading false ocultando overlay, usuario puede interactuar UI nuevamente.

**PASO 7 - Modal Lookup Selection:**
Usuario hace clic en ObjectInputComponent para seleccionar relación 1:1, ejecuta openLookup() llamando ApplicationUIService.openModal() pasando component LookupView y onCloseFunction callback, service establece modal.value con datos y emite show-modal, modal wrapper component listener establece isModalVisible true renderizando LookupView dentro modal con backdrop, usuario selecciona registro ejecutando onCloseFunction con selectedEntity, service emite hide-modal ocultando modal, ObjectInputComponent actualiza modelValue con selectedEntity.

**PASO 8 - Confirmation Dialog Destructive:**
Usuario hace clic botón Delete en ActionsComponent, código llama ApplicationUIService.openConfirmationMenu() pasando type confMenuType.WARNING title "Eliminar registro?" message y confirmationAction callback con entity.delete(), service establece confirmationMenu.value y emite show-confirmation, ConfirmationDialogComponent listener establece isVisible true renderizando modal con header amarillo, usuario hace clic Aceptar ejecutando confirmationAction() con delete() o Cancelar cerrando, service emite hide-confirmation ocultando dialog.

**PASO 9 - Import Asset Imagen:**
Desarrollador escribe import statement "import logo from '@/assets/logo.png'" en componente Vue, TypeScript consulta assets.d.ts verificando declare module '*.png' confirming tipo string, Vite intercepta import procesando archivo, en dev retorna URL directa "/src/assets/logo.png", en prod copia archivo a dist/ con hash retornando "/assets/logo-a3f4b2c8.png", componente recibe string URL usando en src attribute de img element.

**PASO 10 - Event Bus Cleanup:**
Componente Vue monta registrando listener con Application.eventBus.on('validate-inputs', handler), almacena referencia handler function para cleanup posterior, componente desmonta ejecutando onUnmounted hook llamando Application.eventBus.off('validate-inputs', handler) removiendo listener, previene memory leak evitando handler ejecute en componente ya desmontado.

## 6. Reglas Obligatorias

**REGLA 1:** SIEMPRE emitir hide-loading en finally block garantizando ejecución tanto success como error, NUNCA solo en try evitando loading screen stuck si exception.

**REGLA 2:** SIEMPRE ejecutar eventBus.off() en onUnmounted() para listeners registrados con on(), NUNCA dejar listeners registrados después component unmount causando memory leaks.

**REGLA 3:** SIEMPRE usar eventos definidos en Events type, NUNCA emitir eventos custom no registrados perdiendo validación TypeScript.

**REGLA 4:** SIEMPRE emitir validate-inputs antes validate-entity permitiendo inputs actualizar estados, NUNCA validar entidad sin dar tiempo inputs procesar.

**REGLA 5:** SIEMPRE usar show-loading para operaciones bloqueantes largas más 1 segundo, show-loading-menu para operaciones rápidas no bloqueantes, mantener consistencia UX.

**REGLA 6:** SIEMPRE usar toggle-sidebar con payload true/false para forzar estados en navigation logic, undefined solo para user toggle manual botón hamburguesa.

**REGLA 7:** SIEMPRE incluir assets.d.ts en tsconfig types array permitiendo TypeScript reconocer declaraciones, NUNCA ignorar missing module errors para assets.

## 7. Prohibiciones

**PROHIBIDO:** Emitir eventos no definidos en Events type como Application.eventBus.emit('custom-event') perdiendo type safety.

**PROHIBIDO:** Emitir validate-inputs con payload numérico como emit('validate-inputs', 123) violando tipo void definido.

**PROHIBIDO:** Usar show-loading sin hide-loading correspondiente dejando loading screen visible permanentemente.

**PROHIBIDO:** Registrar listeners sin almacenar referencia handler function imposibilitando cleanup con off() posteriormente.

**PROHIBIDO:** Usar eventBus.once() para eventos críticos UI como show-modal que pueden necesitar re-emit múltiples veces sesión.

**PROHIBIDO:** Importar assets sin extensión como import logo from '@/assets/logo' causando module not found TypeScript.

**PROHIBIDO:** Confundir show-loading fullscreen bloqueante con show-loading-menu popup discreto usando incorrectamente según operación.

## 8. Dependencias

**LIBRERIAS EXTERNAS:**
- mitt: Event bus implementación TypeScript con tipado fuerte, instalada como dependency package.json
- vite: Bundler que procesa assets retornando URLs con hash producción

**MODELOS:**
- Application.eventBus: Instancia mitt singleton global
- Application.View.value.entityObject: Entidad target para validate-entity
- Application.View.value.viewType: Estado vista modificado con toggle
- Application.ApplicationUIService: Service con métodos openModal closeModalOnFunction openConfirmationMenu closeConfirmationMenu pushToast

**COMPONENTES QUE EMITEN:**
- ValidateButton: validate-inputs, validate-entity
- SaveButton: show-loading, hide-loading
- TopBarComponent: toggle-sidebar
- ApplicationUIService methods: show-modal, hide-modal, show-confirmation, hide-confirmation

**COMPONENTES QUE ESCUCHAN:**
- Todos input components: validate-inputs
- SideBarComponent: toggle-sidebar
- LoadingScreenComponent: show-loading, hide-loading
- LoadingPopupComponent: show-loading-menu, hide-loading-menu
- Modal wrapper: show-modal, hide-modal
- ConfirmationDialogComponent: show-confirmation, hide-confirmation

## 9. Relaciones

**EVENTS TYPE Y EVENT BUS:**
Events type define contrato tipado, Application.eventBus instancia mitt usa Events como generic type mitt<Events> proporcionando autocompletado emit() on() y validación payloads. Sin Events type mitt sería any perdiendo type safety.

**VALIDATE-INPUTS Y VALIDATE-ENTITY SECUENCIA:**
ValidateButton emite validate-inputs primero permitiendo inputs actualizar hasError states, aguarda nextTick() para asegurar DOM updated, luego emite validate-entity permitiendo validaciones complejas cross-field access correct error states. Orden crítico para validación UI correcta.

**SHOW-LOADING Y HIDE-LOADING PAIRING:**
Siempre emitidos en pares con hide-loading en finally block. LoadingScreenComponent mantiene contador interno incrementado por show-loading decrementado por hide-loading, muestra overlay mientras contador mayor que cero, permite múltiples operaciones asíncronas concurrentes mostrando loading hasta última complete.

**TOGGLE-SIDEBAR PAYLOAD VARIANCE:**
Payload boolean pipe void permite dos usos: navigation logic fuerza estados específicos con true/false para abrir sidebar automáticamente en rutas específicas, user interaction usa undefined para toggle manual alternando estado actual. Flexibilidad cubre ambos casos uso.

**SHOW-MODAL Y APPLICATIONUISERVICE:**
ApplicationUIService.openModal() establece modal.value con component datos antes emitir show-modal, modal wrapper component listener reacciona a evento pero lee datos desde Application.ApplicationUIService.modal.value, separación estado evento permite modal renderizar component correcto con props apropiadas.

**ASSETS.D.TS Y VITE CONFIG:**
assets.d.ts proporciona tipos TypeScript, vite.config.js configura procesamiento real assets con assetsInclude build.assetsDir options. Ambos archivos colaboran: d.ts para compile-time type checking, Vite para runtime asset processing transformación URLs.

## 10. Notas de Implementación

**EJEMPLO EMITIR EVENTOS:**
```typescript
// Sin payload
Application.eventBus.emit('validate-inputs');
Application.eventBus.emit('show-loading');

// Con payload boolean
Application.eventBus.emit('toggle-sidebar', true);  // Abrir forzado
Application.eventBus.emit('toggle-sidebar', false); // Cerrar forzado

// Payload opcional undefined
Application.eventBus.emit('toggle-sidebar');  // Toggle alternando

// TypeScript valida tipos
Application.eventBus.emit('validate-inputs', 123);  // Error: payload debe ser void
Application.eventBus.emit('evento-inexistente');    // Error: evento no existe
```

**EJEMPLO ESCUCHAR EVENTOS:**
```typescript
// Listener básico sin payload
Application.eventBus.on('show-loading', () => {
    console.log('Loading started');
    isLoading.value = true;
});

// Listener con payload tipado
Application.eventBus.on('toggle-sidebar', (isOpen?: boolean) => {
    if (isOpen !== undefined) {
        sidebarOpen.value = isOpen;  // Forzar estado
    } else {
        sidebarOpen.value = !sidebarOpen.value;  // Toggle
    }
});

// Listener one-time con once()
Application.eventBus.once('hide-loading', () => {
    console.log('Loading finished (ejecuta solo una vez)');
});
```

**EJEMPLO CLEANUP LISTENER:**
```vue
<script setup lang="ts">
import { onUnmounted } from 'vue';
import Application from '@/models/application';

// Almacenar referencia handler para cleanup
const handleValidate = () => {
    console.log('Validating inputs...');
    validateInput();
};

// Registrar listener
Application.eventBus.on('validate-inputs', handleValidate);

// Cleanup al desmontar componente
onUnmounted(() => {
    Application.eventBus.off('validate-inputs', handleValidate);
});
</script>
```

**EJEMPLO LOADING PATTERN:**
```typescript
async function saveEntity() {
    Application.eventBus.emit('show-loading');
    
    try {
        await entity.save();
        
        Application.ApplicationUIService.pushToast({
            type: ToastType.SUCCESS,
            title: 'Guardado exitoso',
            message: 'El registro se guardó correctamente'
        });
    } catch (error) {
        Application.ApplicationUIService.pushToast({
            type: ToastType.ERROR,
            title: 'Error al guardar',
            message: error.message
        });
    } finally {
        // Siempre ejecuta hide-loading tanto success como error
        Application.eventBus.emit('hide-loading');
    }
}
```

**EJEMPLO VALIDATE INPUTS Y ENTITY:**
```typescript
// ValidateButton.vue
async function handleValidate() {
    // Paso 1: Validar inputs individuales
    Application.eventBus.emit('validate-inputs');
    
    // Paso 2: Esperar DOM update
    await nextTick();
    
    // Paso 3: Validar entidad completa
    Application.eventBus.emit('validate-entity');
    
    // Paso 4: Ejecutar validation entity
    const entity = Application.View.value.entityObject;
    const isValid = await entity?.validate();
    
    // Paso 5: Actualizar estado vista
    Application.View.value.isValid = isValid;
    
    // Paso 6: Mostrar resultado
    if (isValid) {
        Application.ApplicationUIService.pushToast({
            type: ToastType.SUCCESS,
            title: 'Validación exitosa'
        });
    } else {
        Application.ApplicationUIService.pushToast({
            type: ToastType.ERROR,
            title: 'Errores de validación'
        });
    }
}
```

**EJEMPLO IMPORT ASSETS:**
```vue
<script setup lang="ts">
// Imports tipados por assets.d.ts
import logo from '@/assets/logo.png';           // string
import banner from '@/assets/banner.jpg';       // string
import userIcon from '@/assets/icons/user.svg'; // string
import loading from '@/assets/loading.gif';     // string

// TypeScript valida existencia tipo
console.log(typeof logo);  // "string"

// Vite procesa URLs
// Dev: logo = "/src/assets/logo.png"
// Prod: logo = "/assets/logo-a3f4b2c8.png"
</script>

<template>
    <img :src="logo" alt="Logo" class="logo" />
    <img :src="banner" alt="Banner" class="banner" />
    <img :src="userIcon" alt="User" class="icon" />
    <img :src="loading" alt="Loading" v-if="isLoading" />
</template>
```

**EJEMPLO DEBUGGING EVENT BUS:**
```typescript
// Ver todos eventos emitidos globalmente
Application.eventBus.on('*', (type, payload) => {
    console.log(`[EventBus] ${type}`, payload);
});

// Output consola:
// [EventBus] validate-inputs undefined
// [EventBus] show-loading undefined
// [EventBus] toggle-sidebar true
// [EventBus] hide-loading undefined

// Testear evento manualmente
Application.eventBus.emit('show-loading');
setTimeout(() => {
    Application.eventBus.emit('hide-loading');
}, 2000);
```

**EJEMPLO CONFIRMATION DIALOG:**
```typescript
// Acción destructiva requiere confirmación
function handleDelete() {
    Application.ApplicationUIService.openConfirmationMenu({
        title: 'Eliminar registro?',
        message: 'Esta acción no se puede deshacer',
        type: confMenuType.WARNING,
        confirmationAction: async () => {
            Application.eventBus.emit('show-loading');
            
            try {
                await entity.delete();
                
                Application.ApplicationUIService.pushToast({
                    type: ToastType.SUCCESS,
                    title: 'Registro eliminado'
                });
                
                // Navegar a listview
                Application.changeViewToListView();
            } catch (error) {
                Application.ApplicationUIService.pushToast({
                    type: ToastType.ERROR,
                    title: 'Error al eliminar',
                    message: error.message
                });
            } finally {
                Application.eventBus.emit('hide-loading');
            }
        },
        acceptButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar'
    });
}
```

**LIMITACIONES ACTUALES:**
mitt no expone listeners registrados públicamente para debugging. Para verificar listener registrado correctamente emitir evento test manualmente observando comportamiento. assets.d.ts no valida existencia archivo, solo tipo string, archivo missing causa error runtime Vite no compile-time TypeScript. SVG como componente Vue requiere vite-svg-loader plugin adicional y actualizar declare module '*.svg' retornando DefineComponent en lugar de string.

**VENTAJAS TIPADO FUERTE:**
Autocompletado IDE con Ctrl+Space mostrando todos eventos disponibles al escribir emit(). Validación compile-time previene emitir eventos inexistentes. Refactoring seguro cambiando nombre evento actualiza automáticamente todos usages. Payload validation previene pasar tipos incorrectos como string en lugar de boolean. Documentation implícita tipos Events sirve como contrato API event bus.

## 11. Referencias Cruzadas

**DOCUMENTOS RELACIONADOS:**
- application-singleton.md: Application.eventBus instance y Application.View.value properties
- application-ui-service.md: ApplicationUIService métodos openModal closeModalOnFunction openConfirmationMenu que emiten eventos
- ValidateButton.md: Componente que emite validate-inputs y validate-entity
- SaveButton.md: Componente que usa show-loading hide-loading pattern
- TopBarComponent.md: Componente que emite toggle-sidebar
- SideBarComponent.md: Componente que escucha toggle-sidebar
- LoadingScreenComponent.md: Componente que escucha show-loading hide-loading
- ConfirmationDialogComponent.md: Componente que escucha show-confirmation hide-confirmation
- input-components.md: Componentes que escuchan validate-inputs
- ToastComponents.md: Sistema toast integrado con event patterns
- Modal documentation: Modal system integrado con show-modal hide-modal events

**UBICACION:** copilot/layers/05-advanced/Types.md
**VERSION:** 1.0.0
**ULTIMA ACTUALIZACION:** 11 de Febrero, 2026
