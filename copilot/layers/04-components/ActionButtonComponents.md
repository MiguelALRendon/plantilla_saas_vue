# Action Button Components

## 1. Propósito

Colección de componentes de botón especializados que implementan operaciones estándar del framework (CRUD, validación, navegación) para proporcionar interface de usuario consistente en barras de acciones. GenericButtonComponent sirve como plantilla base demostrativa, NewButtonComponent crea nuevas instancias de entidades, RefreshButtonComponent recarga datos desde API, ValidateButtonComponent ejecuta validación sin persistir, SaveButtonComponent persiste entidad mediante POST/PUT, SaveAndNewButtonComponent persiste y crea nueva instancia consecutivamente, y SendToDeviceButtonComponent actúa como placeholder para funcionalidad futura de sincronización con dispositivos externos. Todos los botones se renderizan dinámicamente en ActionsComponent según contexto (vista list/detail, entidad persistente/no persistente).

## 2. Alcance

Este documento cubre los siete componentes de botón de acción ubicados en src/components/Buttons/: GenericButtonComponent.vue, NewButtonComponent.vue, RefreshButtonComponent.vue, ValidateButtonComponent.vue, SaveButtonComponent.vue, SaveAndNewButtonComponent.vue, SendToDeviceButtonComponent.vue. Incluye estructura de template con iconos GGICONS, métodos de acción que invocan operaciones de BaseEntity (save, refresh, validateInputs, createNewInstance), integración con Application.View para acceso a entityObject y entityClass, sistema de configuración automática mediante Application.setButtonList(), reglas de visibilidad según ViewType y persistencia, manejo de estados async/await, feedback mediante toasts de ApplicationUIService, y CSS classes para variantes de color (info, success-green, warning, secondary, accent, primary). No cubre implementación interna de métodos CRUD en BaseEntity ni lógica de routing en Application.changeViewToDetailView.

## 3. Definiciones Clave

**GenericButtonComponent**: Componente plantilla sin funcionalidad implementada, sirve como base para crear botones custom adicionales siguiendo patrón establecido.

**NewButtonComponent**: Botón que invoca EntityClass.createNewInstance() para generar entidad vacía y navega a DetailView, visible en LISTVIEW y DETAILVIEW sin restricción de persistencia.

**RefreshButtonComponent**: Botón que invoca entity.refresh() para recargar datos actuales desde API, requiere que entity.isPersistent() retorne true, visible en ambas vistas.

**ValidateButtonComponent**: Botón que invoca entity.validateInputs() ejecutando validaciones required/sync/async sin persistir cambios, visible solo en DETAILVIEW sin restricción de persistencia.

**SaveButtonComponent**: Botón que invoca entity.save() ejecutando POST (entidad nueva) o PUT (entidad existente), visible solo en DETAILVIEW y requiere @Persistent() decorator.

**SaveAndNewButtonComponent**: Botón que invoca entity.save() seguido de createNewInstance() y changeViewToDetailView(), permitiendo ingreso rápido de múltiples registros consecutivos, visible solo en DETAILVIEW con @Persistent().

**Application.setButtonList()**: Método que configura dinámicamente Application.ListButtons.value con array de componentes de botón según ViewType y persistencia actual, invocado automáticamente en cambios de vista.

## 4. Descripción Técnica

El sistema de botones de acción se estructura mediante componentes Vue independientes que comparten patrón arquitectural común. Cada componente define template con estructura: button.button con clase de color específica, span interior conteniendo icono GGICONS mediante binding :class="GGCLASS" y {{ GGICONS.CONSTANT }}, texto descriptivo del botón. Event handler @click vinculado a método específico del componente.

**Estructura de Métodos**: Todos los métodos de acción siguen patrón: obtener referencias a Application.View.value.entityObject y Application.View.value.entityClass, realizar verificaciones de precondiciones (isPersistent check para operaciones de persistencia), invocar métodos async de BaseEntity con await, manejar navegación post-acción si necesario. Ejemplo en SaveButtonComponent: verifica entity && entity.isPersistent(), invoca await entity.save() que internamente ejecuta beforeSave hook, validateInputs, HTTP request, afterSave hook, y muestra toast de confirmación.

**Sistema de Iconos**: Utiliza constantes GGICONS importadas desde constants/ggicons.ts, renderizadas mediante Google Material Icons via clase GGCLASS. Mapeo: ADD (plus), REMOVE (minus), REFRESH (sync), CHECK (checkmark), SAVE (floppy disk), SAVE2 (floppy con plus), DEVICES (phone). Iconos proporcionan reconocimiento visual inmediato de función del botón.

**Configuración Dinámica en Application.setButtonList()**: Switch  statement evalúa Application.View.value.viewType, para LISTVIEW configura array [NewButtonComponent, RefreshButtonComponent], para DETAILVIEW evalúa isPersistentEntity mediante entityObject?.isPersistent(). Si persistente: array completo [New, Refresh, Validate, Save, SaveAndNew, SendToDevice]. Si no persistente: array reducido [New, Refresh, Validate, SendToDevice] excluyendo botones de persistencia. Todos los componentes envueltos en markRaw() para prevenir reactividad innecesaria de definiciones de componente.

**Integración con ActionsComponent**: ActionsComponent renderiza dinámicamente Application.ListButtons.value mediante v-for y component :is directive, creando instancia de cada botón en tiempo de ejecución. Cambios en ListButtons.value disparan re-render automático, garantizando que barra de acciones siempre refleje botones apropiados para contexto actual.

## 5. Flujo de Funcionamiento

El flujo operacional comienza cuando Application.changeView() o Application.changeViewToDetailView() o Application.changeViewToListView() ejecuta, disparando actualización de Application.View.value con nueva entityClass, entityObject y viewType. Subsecuentemente, Application.setButtonList() se invoca automáticamente, evaluando nuevo contexto y reconfigurando Application.ListButtons.value.

**Fase de Renderizado**: ActionsComponent observa reactivamente Application.ListButtons.value. Cuando detecta cambio, Vue re-ejecuta v-for iterando sobre array de componentes. Para cada componente, renderiza mediante component :is="buttonComponent", instanciando componente y montándolo en DOM. Resultado visual: barra de botones actualizada reflejando operaciones disponibles para vista/entidad actual.

**Fase de Interacción Usuario con NewButtonComponent**:
1. Usuario hace click en botón New con icono ADD
2. Método openNewDetailView() se ejecuta
3. Obtiene Application.View.value.entityClass (ej: Products)
4. Invoca (entityClass as any).createNewInstance() que retorna nueva instancia con propiedades inicializadas según @DefaultProperty decorators
5. Invoca Application.changeViewToDetailView(newEntity)
6. Application actualiza View.value.entityObject = newEntity, View.value.viewType = DETAILVIEW
7. Router actualiza URL a /:module/new
8. ComponentContainer re-renderiza con default_detailview.vue
9. DetailView muestra formulario vacío para nueva entidad
10. setButtonList() reconfigura botones para DETAILVIEW

**Fase de Interacción Usuario con SaveButtonComponent**:
1. Usuario hace click en botón Save con icono SAVE
2. Método saveItem() se ejecuta como async function
3. Obtiene entity desde Application.View.value.entityObject
4. Verifica entity && entity.isPersistent() (sin esto, operación termina silenciosamente)
5. Invoca await entity.save()
6. BaseEntity.save() internamente: ejecuta beforeSave() hook, invoca validateInputs() y verifica Application.View.value.isValid, determina HTTP method (POST si no tiene id, PUT si tiene), construye payload mediante toJSON(), ejecuta axios request a API endpoint, procesa response actualizando propiedades de entidad, ejecuta afterSave() hook, invoca ApplicationUIService.showToast('Entity saved', SUCCESS)
7. Control retorna a saveItem() sin acciones adicionales
8. Usuario permanece en DetailView con entidad actualizada mostrada

**Fase de Interacción Usuario con SaveAndNewButtonComponent**:
1-7. Pasos idénticos a SaveButtonComponent hasta finalización de entity.save()
8. Método continúa ejecutando: obtiene entityClass desde Application.View.value.entityClass
9. Invoca (entityClass as any).createNewInstance() generando nueva instancia vacía
10. Invoca Application.changeViewToDetailView(newEntity)
11. DetailView re-renderiza con formulario vacío
12. Usuario puede inmediatamente comenzar ingreso de siguiente entidad sin clicks adicionales

Este flujo permite workflows de ingreso rápido donde usuario crea múltiples registros consecutivamente, útil en escenarios de captura de datos masiva.

## 6. Reglas de Uso

Las reglas obligatorias para uso correcto de Action Button Components son:

**Regla de Configuración Automática**: Los botones NUNCA deben importarse ni renderizarse manualmente en templates de vistas. Application.setButtonList() gestiona automáticamente configuración según contexto. Agregar botones manualmente causa duplicación e inconsistencias.

**Regla de Verificación isPersistent**: SIEMPRE verificar entity.isPersistent() antes de invocar métodos de persistencia (save, refresh). Código ejemplo obligatorio:
```typescript
if (entity && entity.isPersistent()) {
    await entity.save();
}
```
Omitir esta verificación en entidades no decoradas con @Persistent() causa errores de runtime cuando save() intenta acceder a endpoint inexistente.

**Regla de Async/Await**: Todos los métodos que invocan operaciones de BaseEntity (save, refresh, validateInputs) DEBEN usar async/await. Ejemplo correcto:
```typescript
async saveItem() {
    await entity.save();
}
```
Sin await, ejecución continúa antes de completar operación, causando estados inconsistentes y feedback prematuro.

**Regla de Acceso a Application.View**: Acceder a entityObject y entityClass SIEMPRE mediante Application.View.value, nunca almacenar referencias locales. Application.View es reactive y garantiza valores actualizados. Referencias locales almacenadas pueden quedar obsoletas tras cambios de vista.

**Regla de markRaw en setButtonList**: Componentes agregados a Application.ListButtons.value DEBEN envolverse en markRaw(). Ejemplo:
```typescript
this.ListButtons.value = [markRaw(NewButtonComponent), markRaw(SaveButtonComponent)];
```
Sin markRaw(), Vue intenta hacer componentes reactivos causando overhead innecesario y warnings en consola.

**Regla de Emisión de Eventos**: Los Action Button Components NO deben emitir eventos custom. Toda comunicación con Application ocurre mediante invocaciones directas de métodos. No usar $emit() ni eventBus en estos componentes.

**Regla de Props**: Los Action Button Components NO reciben props. Acceden a datos necesarios mediante Application singleton. Diseños que  requieran props indican arquitectura incorrecta.

## 7. Prohibiciones

Las siguientes prácticas están estrictamente prohibidas:

**Prohibido Renderizado Manual de Botones**: NUNCA importar action button components en templates de vistas. Ejemplo prohibido:
```vue
<template>
    <NewButtonComponent />  <!-- INCORRECTO -->
    <SaveButtonComponent /> <!-- INCORRECTO -->
</template>
```
Estos componentes son gestionados exclusivamente por ActionsComponent mediante configuration dinámica.

**Prohibido Modificar Application.ListButtons Directamente desde Componentes**: NUNCA modificar Application.ListButtons.value desde botones individuales ni desde vistas. Única excepción autorizada: Application.setButtonList(). Modificaciones directas rompen flujo de configuración y causan estados impredecibles.

**Prohibido Invocar save() sin isPersistent Check**: NUNCA invocar entity.save() sin verificación previa:
```typescript
// PROHIBIDO
async saveItem() {
    await entity.save();  // Falla si not @Persistent
}

// CORRECTO
async saveItem() {
    if (entity && entity.isPersistent()) {
        await entity.save();
    }
}
```

**Prohibido Uso de Métodos Síncronos para Operaciones Async**: NUNCA definir métodos como síncronos cuando invocan operaciones async de BaseEntity:
```typescript
// PROHIBIDO
saveItem() {
    entity.save();  // Retorna Promise, no espera completion
}

// CORRECTO
async saveItem() {
    await entity.save();
}
```

**Prohibido Acceso Directo a Router**: NUNCA usar this.$router.push() en action buttons. Navegación DEBE delegarse a Application.changeViewToDetailView() o Application.changeViewToListView() que sincronizan router con estado de Application.

**Prohibido Duplicar Lógica de Validación**: NUNCA implementar lógica de validación custom en botones. ValidateButtonComponent DEBE invocar entity.validateInputs() exclusivamente. Duplicar lógica causa divergencia entre validaciones.

**Prohibido Hardcodear Clases CSS de Color**: NUNCA usar class="button" sin variante de color. Cada botón DEBE tener clase de color específica: .info, .success-green, .warning, .secondary, .accent, .primary, .alert. Mantiene consistencia visual y usabilidad.

## 8. Dependencias

Action Button Components mantienen dependencias críticas con:

**Dependencia de Application Singleton** (models/application.ts):
- Application.View: Ref<ViewState> con entityObject, entityClass, viewType
- Application.changeViewToDetailView(entity): Método para navegación a detail view
- Application.ListButtons: Ref<Component[]> array de botones para ActionsComponent
- Application.setButtonList(): Método que configura botones según contexto
- Si signatures de estos métodos cambian, todos los botones requieren actualización

**Dependencia de BaseEntity** (entities/base_entity.ts):
- createNewInstance(): Método estático que genera instancia con defaults
- save(): Método async que persiste mediante POST/PUT
- refresh(): Método async que recarga datos mediante GET
- validateInputs(): Método async que ejecuta validaciones en todas las propiedades
- isPersistent(): Método que retorna boolean indicando si clase tiene @Persistent decorator
- Si BaseEntity modifica implementación de estos métodos, comportamiento de botones cambia

**Dependencia de ApplicationUIService** (models/application-ui-service.ts):
- showToast(message, type): Método para mostrar notificaciones toast
- Invocado automáticamente por BaseEntity.save(), BaseEntity.refresh(), entity.validateInputs()
- Botones no invocan directamente, pero dependen de feedback visual

**Dependencia de ViewType Enum** (enums/view_type.ts):
- LISTVIEW: Constante para identificar vista de lista
- DETAILVIEW: Constante para identificar vista de detalle
- Usado en Application.setButtonList() para switch statement
- Si enum cambia o agrega valores, setButtonList() requiere actualización

**Dependencia de GGICONS** (constants/ggicons.ts):
- ADD, REMOVE, REFRESH, CHECK, SAVE, SAVE2, DEVICES: Constantes de iconos
- Si constantes cambian o se eliminan, templates de botones se rompen

**Dependencia de ActionsComponent** (components/ActionsComponent.vue):
- Componente contenedor que renderiza botones desde Application.ListButtons.value
- Sin ActionsComponent montado, botones no se muestran aunque estén configurados

**Dependencia de CSS Variables**:
- --info-blue, --success-green, --warning-orange, --secondary-gray, --accent-purple, --primary-blue, --error-red
- Si variables CSS no están definidas, botones pierden styling de color

## 9. Relaciones con Otros Componentes

Action Button Components participan en las siguientes relaciones arquitecturales:

**Relación con ActionsComponent**: ActionsComponent es contenedor padre que renderiza dinámicamente todos los action buttons. Observa Application.ListButtons.value reactivamente y usa component :is directive para instanciar cada botón. Relación unidireccional: ActionsComponent renderiza botones, botones no comunican de vuelta. Cuando Application.ListButtons.value cambia, Vue desmonta botones anteriores y monta nuevos automáticamente.

**Relación con default_detailview.vue y default_listview**: Las vistas default no referencian botones directamente. ActionsComponent está montado en layout principal (App.vue o similar) visible en todas las vistas. Cuando usuario navega entre vistas, Application.setButtonList() reconfigura botones automáticamente. No hay dependencia directa código-a-código entre vistas y botones.

**Relación con BaseEntity CRUD Methods**: NewButtonComponent invoca createNewInstance() método estático. Save/SaveAndNew invocan save() método de instancia. Refresh invoca refresh() método de instancia. Validate invoca validateInputs() método de instancia. Relación de dependencia fuerte: botones son inútiles sin BaseEntity funcional. BaseEntity no conoce existencia de botones, relación unidireccional.

**Relación con Application.changeViewToDetailView()**: NewButtonComponent y SaveAndNewButtonComponent invocan este método para navegación. Método actualiza Application.View, sincroniza router, dispara setButtonList(). Botones dependen de este método para navegación correcta, no deben usar $router directamente.

**Relación con Decoradores**: @Persistent decorator determina si SaveButtonComponent y SaveAndNewButtonComponent son visibles. entity.isPersistent() lee metadata establecida por decorator. @DefaultProperty decorator influye en valores iniciales de instancias creadas por NewButtonComponent.createNewInstance(). Decoradores actúan como configuration oculta que controla comportamiento de botones.

**Relación con Toast System**: ApplicationUIService.showToast() invocado desde BaseEntity methods muestra feedback visual. Botones no invocan showToast() directamente, pero dependen de él para UX. Toast visible cuando save() completa exitosamente o cuando validateInputs() detecta errores.

**Relación con FormInputComponents**: ValidateButtonComponent dispara validación que marca inputs con estado .nonvalidated. Los inputs escuchan evento validate-inputs en eventBus y actualizan UI. Relación indirecta: botón dispara validation, inputs reaccionan, no hay comunicación directa.

## 10. Notas de Implementación

Consideraciones importantes para implementación y mantenimiento:

**Patrón de Verificación isPersistent()**: Todos los botones de persistencia (Save, SaveAndNew, Refresh) verifican entity.isPersistent() antes de invocar operaciones. Esta verificación es pattern crítico porque entidades sin @Persistent decorator tienen endpoint === '' causando errores 404 al intentar peticiones HTTP. En lugar de prevenir montaje de botones (filtrado en setButtonList()), verificación en runtime permite mayor flexibilidad si se agregan decoradores dinámicamente en futuro.

**Casting as any en createNewInstance()**: NewButtonComponent y SaveAndNewButtonComponent usan (entityClass as any).createNewInstance() porque TypeScript no infiere correctamente que todas las clases que extienden BaseEntity tienen este método estático. Alternativa: definir interface TypedBaseEntity con método estático, pero aumenta complejidad. Casting actual es pragmático y type-safe en runtime.

**Razón de markRaw() en setButtonList()**: Vue 3 por defecto convierte todo en reactive proxies. Definiciones de componentes no necesitan ser reactivas (solo sus instancias). markRaw() previene que Vue envuelva definiciones de componente en Proxy, reduciendo overhead. Sin markRaw(), console muestra warnings sobre non-extensible objects. Performance gain es marginal pero buena práctica.

**Timing de setButtonList() Invocation**: setButtonList() se invoca en changeView, changeViewToDetailView, changeViewToListView. NO se invoca en mounted de botones individuales. Esto garantiza reconfiguración antes de renderizado de nuevos botones. Si setButtonList() se invocara después de mount, habría frame visual con botones incorrectos.

**SendToDeviceButtonComponent como Placeholder**: Este botón NO tiene implementación funcional. Incluido en configuración para demostrar extensibilidad. En implementaciones reales, podría enviar datos a dispositivo Bluetooth, generar código QR, sincronizar con app móvil, etc. Mantener como placeholder demuestra a desarrolladores dónde agregar funcionalidad custom.

**Async Validation en ValidateButtonComponent**: El método handleValidation de ValidateButtonComponent es async porque entity.validateInputs() es async (puede ejecutar @AsyncValidation decorators que hacen peticiones HTTP). Durante validación, UI no está bloqueada porque operación es non-blocking. Para validaciones lentas, considerar agregar loading spinner.

**CSS Classes y Accesibilidad**: Clases de color (.info, .success-green, etc.) no son solo visuales. Usuarios con daltonismo benefician de iconos distintivos. Combinación color + icono proporciona redundancia semántica. No confiar únicamente en color para diferenciar botones.

**Customización de Botones en Proyectos Derivados**: Para agregar botones custom, seguir patrón: 1) Crear componente en src/components/Buttons/, 2) Agregar a Application.setButtonList() en caso apropiado, 3) Usar markRaw(), 4) Seguir estructura template existing (button.button.color-class con span icon y texto). No romper patrón establecido para mantener consistencia.

## 11. Referencias Cruzadas

Action Button Components se relacionan con los siguientes documentos técnicos:

**Documentos de Componentes**:
- [ActionsComponent.md](ActionsComponent.md): Componente contenedor que renderiza dinámicamente todos los action buttons desde Application.ListButtons.value
- [default_detailview.md](default_detailview.md): Vista de detalle donde mayoría de botones (Save, Validate, SaveAndNew) son relevantes y visibles
- [default_listview.md](default_listview.md): Vista de lista donde NewButtonComponent y RefreshButtonComponent son únicos botones visibles
- [TopBarComponent.md](TopBarComponent.md): Componente de barra superior que contiene ActionsComponent en su layout

**Documentos de Core**:
- [../02-base-entity/base-entity-core.md](../02-base-entity/base-entity-core.md): Documenta métodos save(), refresh(), validateInputs(), createNewInstance(), isPersistent() invocados por botones
- [../02-base-entity/crud-operations.md](../02-base-entity/crud-operations.md): Documenta flujo completo de operaciones CRUD incluyendo hooks beforeSave/afterSave ejecutados por save()
- [../02-base-entity/validation-system.md](../02-base-entity/validation-system.md): Documenta sistema de validación de tres niveles activado por ValidateButtonComponent
- [../03-application/application-singleton.md](../03-application/application-singleton.md): Documenta Application.View, Application.ListButtons, setButtonList(), changeViewToDetailView()

**Documentos de Decoradores**:
- [../01-decorators/persistent-decorator.md](../01-decorators/persistent-decorator.md): Decorador @Persistent que determina visibilidad de SaveButtonComponent y SaveAndNewButtonComponent
- [../01-decorators/default-property-decorator.md](../01-decorators/default-property-decorator.md): Decorador @DefaultProperty que establece valores iniciales en instancias creadas por NewButtonComponent

**Documentos de Arquitectura**:
- [../../02-FLOW-ARCHITECTURE.md](../../02-FLOW-ARCHITECTURE.md): Documenta flujo completo desde click en botón hasta actualización de UI incluyendo sincronización router-Application-vistas
- [../../01-FRAMEWORK-OVERVIEW.md](../../01-FRAMEWORK-OVERVIEW.md): Overview de arquitectura explicando rol de action buttons en operaciones del usuario

**Documentos de Estilo**:
- [../../css/constants.css](../../css/constants.css): Define CSS variables para colores de botones (--info-blue, --success-green, --warning-orange, etc.)

**Documentos de Enums**:
- [../05-advanced/ViewType.md](../05-advanced/ViewType.md): Documenta enum ViewType usado en Application.setButtonList() para determinar configuración de botones

**Ejemplos de Uso**:
- [../../examples/classic-module-example.md](../../examples/classic-module-example.md): Ejemplo completo mostrando cómo decoradores @Persistent influyen en botones visibles en vistas generadas automáticamente

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
