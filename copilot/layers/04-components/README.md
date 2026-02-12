# Layer 4: Vue Components - Índice General

## 1. Propósito

Proporcionar un índice completo y estructura organizativa de toda la documentación de componentes Vue que conforman el sistema de interfaz de usuario del Framework SaaS. Este documento actúa como punto de entrada central para localizar documentación específica de cualquier componente, entender la arquitectura de capas de UI, y comprender cómo los componentes se relacionan con decoradores, entidades y Application singleton.

## 2. Alcance

### 2.1 Responsabilidades

- Catalogar todos los componentes Vue del framework organizados por categoría funcional
- Mapear ubicación física de componentes en estructura de carpetas src/components/
- Enumerar componentes core de layout y navegación
- Listar componentes de formularios con tipos de entrada
- Documentar componentes de botones de acción
- Referenciar componentes de modales y diálogos
- Indexar componentes informativos y de visualización de datos
- Listar vistas default generadas automáticamente
- Mantener referencias a documentación detallada individual de cada componente

### 2.2 Límites

- No documenta implementación interna de componentes (cada componente tiene su .md propio)
- No explica props, events, o slots específicos (ver documento individual)
- No proporciona código fuente completo (solo referencias)
- No cubre lógica de negocio de BaseEntity (ver capa 02-base-entity)
- No documenta decoradores (ver capa 01-decorators)
- No explica Application singleton (ver capa 03-application)

## 3. Definiciones Clave

**Componente Vue**: Unidad reutilizable de UI que encapsula template, script y estilos. Todos heredan de Vue 3 Composition API con reactivity system.

**Core Components**: Componentes estructurales de layout (TopBar, SideBar, Tabs, Container) que forman skeleton de aplicación y no cambian entre módulos.

**Form Components**: Componentes de entrada de datos ubicados en src/components/Form/ que renderizan inputs basándose en metadata de decoradores PropertyName, Required, Disabled, HelpText, Validation.

**Button Components**: Componentes de acción ubicados en src/components/Buttons/ que ejecutan operaciones CRUD y presentan feedback mediante Application.ListButtons.value array dinámico.

**Modal Components**: Componentes overlay ubicados en src/components/Modal/ controlados por Application.modal.value que bloquean interacción y requieren confirmación o input usuario.

**Informative Components**: Componentes de visualización read-only ubicados en src/components/Informative/ que muestran datos formateados sin permitir edición (tablas detail, toasts, lookup items).

**Default Views**: Vistas generadas automáticamente (default_detailview, default_listview, default_lookup_listview) ubicadas en src/views/ que construyen UI desde metadata sin programación manual.

## 4. Descripción Técnica

El sistema de componentes Vue del framework opera en tres niveles de abstracción:

**Nivel 1 - Core Layout**: TopBarComponent, SideBarComponent, ComponentContainerComponent proveen estructura fija application shell. Renderizados una vez en App.vue, persisten durante toda sesión usuario. Gestionan navegación módulos mediante Application.ChangeModule(), coordinan con Vue Router, y controlan estado global UI.

**Nivel 2 - Dynamic Views**: default_listview.vue, default_detailview.vue, default_lookup_listview.vue son vistas meta-programadas que leen metadata entidades mediante BaseEntity getters estáticos (getPropertyNames(), getRequired(), getDisabled()) y generan formularios/tablas dinámicamente sin código hard-coded. Instanciadas mediante Vue Router cuando Application.View.value.viewType cambia.

**Nivel 3 - Atomic Components**: TextInputComponent, NumberInputComponent, BooleanInputComponent, etc. son componentes leaf reusables sin children components complejos. Consumen metadata mediante composable useInputMetadata(entity, propertyKey) que retorna computed refs actualizados reactivamente. Emiten eventos v-model standard Vue 3.

Flujo de renderizado completo:

1. Usuario selecciona módulo en SideBar
2. Application.ChangeModule(TargetEntity) ejecuta
3. Router navega a /module-name/list route
4. default_listview.vue monta y lee metadatos estáticos TargetEntity
5. Para cada propiedad no oculta, renderiza columna tabla con getFormattedValue()
6. Usuario click row, router navega /module-name/detail/:id
7. default_detailview.vue monta, instancia entity = new TargetEntity(), llama await entity.getElement(id)
8. Para cada propiedad, renderiza input apropiado determinado por getPropertyType()
9. Cada input usa useInputMetadata(entity, propertyKey) obtener required, disabled, validated, helpText computeds
10. Usuario edita inputs, v-model bidirectional actualiza entity properties directamente
11. Usuario click Save button, DefaultButtons.SaveButton llama await entity.save()

Este diseño elimina necesidad programar formularios manualmente. Toda configuración UI reside en decoradores aplicados a entity class.

## 5. Flujo de Funcionamiento

Ciclo de vida componentes en contexto navegación usuario:

**Inicialización Aplicación:**
1. main.js crea app Vue, registra Router, monta App.vue
2. App.vue renderiza TopBarComponent, SideBarComponent, ComponentContainerComponent, LoadingScreenComponent
3. SideBarComponent lee Application.ModuleList y genera SideBarItemComponent por cada entity registrada
4. ComponentContainerComponent contiene `<router-view>` donde vistas dinámicas se renderizan

**Navegación a ListView:**
1. Usuario click SideBarItemComponent de módulo Products
2. SideBarItemComponent emite evento, ejecuta Application.ChangeModule(Product)
3. Application actualiza View.value.entityClass = Product, View.value.viewType = ViewTypes.LISTVIEW
4. Router push a /products/list
5. default_listview.vue component monta
6. En setup(), ejecuta Application.setButtonList(ViewTypes.LISTVIEW) que actualiza ListButtons con NewButton, RefreshButton
7. ActionsComponent detecta cambio ListButtons.value reactivamente, renderiza botones
8. default_listview.vue llama await Product.getElementList(), recibe array entities
9. Para cada entity, para cada propiedad, llama entity.getFormattedValue(propertyKey) render cell value
10. Usuario ve tabla poblada con datos

**Navegación a DetailView:**
1. Usuario click row en tabla ListView
2. default_listview.vue ejecuta router.push(`/products/detail/${entity.id}`)
3. Router navega, default_detailview.vue monta
4. En setup(), lee route.params.id, crea entity = new Product()
5. Si id existe, ejecuta await entity.getElement(id), pobla entity properties desde API response
6. Application.setButtonList(ViewTypes.DETAILVIEW) actualiza ListButtons con SaveButton, ValidateButton, SaveAndNewButton
7. Para cada propiedad entity, determina component input apropiado:
   - Si type string y stringType email → EmailInputComponent
   - Si type number → NumberInputComponent
   - Si type boolean → BooleanInputComponent
   - Si type array → ArrayInputComponent
   - Default → TextInputComponent
8. Cada input component recibe props :entity="entity" :propertyKey="'productName'"
9. Input component ejecuta useInputMetadata(entity, propertyKey) en setup()
10. Composable retorna object con computed refs: required, disabled, validated, helpText, requiredMessage, validatedMessage
11. Input renderiza con v-model="entity[propertyKey]", muestra helpText si existe, aplica disabled si true, muestra validation errors si validated false

**Guardado de Entity:**
1. Usuario modifica inputs, v-model actualiza entity.productName, entity.price, etc. directamente
2. Usuario click SaveButton en ActionsComponent
3. SaveButton ejecuta await Application.CurrentEntity.save()
4. BaseEntity save() ejecuta validation cascade: required → validation → asyncValidation
5. Si validación falla, errores aparecen en inputs mediante validatedMessage computed
6. Si validación pasa, ejecuta beforeSave() hooks
7. Construye payload mediante this.toObject()
8. Si entity.id null → POST ApiEndpoint, sino → PUT ApiEndpoint/id
9. Recibe response, actualiza entity properties mediante updateFromDictionary(response.data)
10. Ejecuta afterSave() hooks
11. Application emite eventBus 'entity-saved'
12. Inputs detectan cambios reactivamente, se actualizan

**Interacción con Modales:**
1. Usuario click button que requiere confirmación (ej. Delete)
2. Button ejecuta Application.openConfirmationMenu({ message: "Delete?", onConfirm: deleteHandler })
3. Application.modal.value actualiza con config modal
4. ConfirmationDialogComponent detecta cambio Application.modal.value reactivamente, se muestra
5. Usuario click Confirm, modal ejecuta onConfirm callback, cierra modal
6. Usuario click Cancel, modal solo cierra sin ejecutar callback

Este flujo demuestra reactividad end-to-end desde decoradores → metadata → componente → usuario → entity → API → componente actualizado.

## 6. Reglas Obligatorias

### 6.1 Core Components

- Core components (TopBar, SideBar, ComponentContainer) DEBEN renderizarse una sola vez en App.vue
- Core components NO DEBEN destruirse durante navegación entre módulos
- SideBarComponent DEBE iterar Application.ModuleList exclusivamente para generar items
- TopBarComponent DEBE mostrar Application.AppConfiguration.appName en header
- ComponentContainerComponent DEBE contener `<router-view>` sin wrappers adicionales que interfieran routing
- LoadingScreenComponent DEBE escuchar eventos show-loading y hide-loading del eventBus únicamente

### 6.2 Form Components

- Form components DEBEN aceptar props entity y propertyKey
- Form components DEBEN usar v-model="entity[propertyKey]" bidirectional binding
- Form components DEBEN ejecutar useInputMetadata(entity, propertyKey) en setup() obtener metadata
- Form components DEBEN renderizar helpText si metadata.helpText.value no es undefined
- Form components DEBEN aplicar disabled attribute si metadata.disabled.value === true
- Form components DEBEN mostrar validation errors si metadata.validated.value === false
- Form components DEBEN mostrar required indicator si metadata.required.value === true
- Form components NO DEBEN implementar lógica validación custom, delegar a BaseEntity validate()

### 6.3 Button Components

- Button components DEBEN acceder Application.CurrentEntity mediante Application.View.value.entityObject
- Button components DEBEN ejecutar operaciones async con try/catch y mostrar errors mediante Application.openToast()
- Button components DEBEN emitir eventos eventBus después operaciones exitosas para notificar otros components
- Button components NO DEBEN modificar Application.ListButtons directamente, solo leer
- SaveButton DEBE ejecutar await entity.save(), not direct API call
- RefreshButton DEBE re-ejecutar getElement() o getElementList() según viewType actual
- NewButton DEBE navegar a route detail con id = null creando entity nueva

### 6.4 Modal Components

- Modal components DEBEN escuchar Application.modal.value reactivamente determinar visibilidad
- Modal components DEBEN aplicar z-index alto (ej. 9999) asegurar overlay sobre todo content
- Modal components DEBEN bloquear interacción con content subyacente mediante pointer-events o backdrop
- Modal components DEBEN cerrar al ejecutar onConfirm o onCancel callbacks mediante Application.closeModal()
- Modal components NO DEBEN mantener state interno, toda config viene de Application.modal.value

### 6.5 Default Views

- Default views DEBEN ser agnósticas de entity específica, operar con Application.CurrentEntity
- Default views DEBEN leer metadata estática mediante BaseEntity getters estáticos en lugar iterar properties manualmente
- default_listview DEBE llamar getElementList() static method, not instance method
- default_detailview DEBE instanciar entity nueva si route.params.id undefined
- default_detailview DEBE llamar await entity.getElement(id) si id presente
- Default views NO DEBEN hard-code nombres propiedades, usar getPropertyNames() iterar dinámicamente

## 7. Prohibiciones

- NO crear componentes wrapper innecesarios que encapsulen default views sin agregar funcionalidad
- NO implementar form validation directamente en componentes, DEBE residir en BaseEntity
- NO acceder entity properties sin reactive wrapper (usar .value con refs/computeds)
- NO mutar Application state directamente, usar métodos Application.ChangeModule(), Application.setButtonList()
- NO renderizar inputs sin consultar metadata primero (useInputMetadata es obligatorio)
- NO hard-code strings UI en components, usar entity.getPropertyName(propertyKey) obtener labels
- NO mezclar lógica presentación con lógica negocio en form components
- NO ejecutar API calls directamente desde components, delegar a BaseEntity methods
- NO implementar routing manual en components, usar router.push() con routes definidos en router/index.js
- NO crear modales component-specific, usar Application.modal infrastructure centralizada

## 8. Dependencias

### 8.1 Dependencias Internas

**Capa 01-decorators:**
- PropertyName decorator define labels inputs
- Required decorator determina si input muestra required indicator
- Disabled decorator controla disabled attribute inputs
- HelpText decorator provee texto ayuda debajo inputs
- Validation decorator define mensajes error validación
- DisplayFormat decorator formatea valores celdas ListViews
- HideInDetailView/HideInListView decorators controlan visibilidad properties

**Capa 02-base-entity:**
- BaseEntity.getPropertyNames() retorna array propertyKeys iterar
- BaseEntity.getPropertyType() determina qué input component renderizar
- BaseEntity.save() ejecuta persistence desde button components
- BaseEntity.delete() ejecuta eliminación desde button components
- Validation system proporciona validated flags consumidos por inputs
- Lifecycle hooks beforeSave/afterSave coordinan con UI updates

**Capa 03-application:**
- Application.View.value provee entityClass y entityObject actuales
- Application.ModuleList provee entities registradas para SideBar
- Application.ListButtons provee array buttons renderizar en ActionsComponent
- Application.modal controla visibilidad y config modal components
- Application.eventBus coordina comunicación entre components desacoplados
- Application.openToast() muestra notifications desde button components

### 8.2 Dependencias Externas

**Vue 3:**
- Composition API (ref, computed, reactive, watch) maneja state reactivo
- v-model directive bidirectional binding entre inputs y entity properties
- Teleport API renderiza modales en document.body
- Suspense maneja loading states async components

**Vue Router:**
- Router instance navega entre ListView/DetailView
- route.params provee id entity para DetailView
- Navigation guards pueden sincronizar con Application state

**Axios:**
- Application.axiosInstance usada por BaseEntity CRUD operations
- Responses procesadas y actualizan entity properties

## 9. Relaciones

### 9.1 Relación con Decoradores

Componentes consumen metadata definida por decoradores mediante:
- useInputMetadata composable accede getPropertyName(), isRequired(), isDisabled()
- default_listview lee isHiddenInListView() decidir qué columnas mostrar
- default_detailview lee isHiddenInDetailView() decidir qué inputs renderizar
- DisplayFormat decorator usado por getFormattedValue() en celdas tabla
- Componentes NUNCA modifican metadata, solo lectura unidireccional

### 9.2 Relación con BaseEntity

Componentes delegan toda lógica negocio y persistence a BaseEntity:
- Form inputs llaman v-model con entity[propertyKey] actualizando instancia directamente
- SaveButton ejecuta await entity.save() triggering validation cascade
- ListView ejecuta await Entity.getElementList() obtener datos
- DetailView ejecuta await entity.getElement(id) poblar formulario
- Componentes responden a cambios entity properties reactivamente vía computeds

### 9.3 Relación con Application

Application actúa como mediador entre componentes:
- Cambios Navigation en SideBar ejecutan Application.ChangeModule()
- Router sincroniza con Application.View.value.viewType
- Button visibility controlada por Application.ListButtons array
- Modales gestionados centralizadamente mediante Application.modal object
- Toasts mostrados mediante Application.ToastList array
- EventBus Application.eventBus desacopla componentes evitando prop drilling

### 9.4 Flujo de Datos Unidireccional

```
Decoradores → Metadata → BaseEntity → Application → Components → User Interaction → Entity Update → API → Component Reactivity
```

Este flujo garantiza single source of truth: decoradores definen comportamiento, BaseEntity implementa lógica, Application coordina state, components renderizan UI reactivamente.

## 10. Notas de Implementación

### 10.1 Performance Considerations

- Usar v-once para content estático como labels no cambian
- Usar v-memo para cells tabla cumplen condiciones específicas
- Lazy load components pesados con defineAsyncComponent
- Virtualizar ListView con vue-virtual-scroller si entities > 1000
- Debounce inputs texto evitar re-renders excesivos durante typing
- Usar computed en lugar methods para valores derivados cacheados

### 10.2 Customización de Componentes

Para customizar UI específica módulo sin modificar defaults:
1. Aplicar @ModuleDetailComponent(CustomDetailView) en entity class
2. Crear CustomDetailView como componente Vue normal
3. Dentro CustomDetailView, acceder Application.CurrentEntity
4. Puede reutilizar form components standard llamándolos explícitamente
5. Router renderizará CustomDetailView en lugar default_detailview.vue

Ejemplo:
```typescript
@ModuleDetailComponent(() => import('./ProductCustomDetail.vue'))
class Product extends BaseEntity { }
```

### 10.3 Testing Components

- Test form components con mock entity usando metadata simulada
- Test button components con mock Application.CurrentEntity
- Test default views con mock router y mock entity class
- Usar @vue/test-utils mount() con shallow rendering evitar dependencies
- Mock useInputMetadata composable en tests unitarios
- Tests integración verificar flujo save → validation → API call → update

### 10.4 Debugging Tips

- Instalar Vue DevTools inspeccionar component tree y reactive state
- Verificar Application.View.value en console confirmar entityClass correcta
- Revisar metadata values llamando entity.getPropertyName('key') en console
- Confirmar ListButtons.value array contiene botones esperados
- Verificar eventBus events emitidos con Application.eventBus.all.forEach console logging

## 11. Referencias Cruzadas

**Documentación Individual Componentes:**
- [ActionsComponent.md](ActionsComponent.md) - Barra acciones con botones dinámicos
- [ComponentContainerComponent.md](ComponentContainerComponent.md) - Container principal vistas
- [LoadingScreenComponent.md](LoadingScreenComponent.md) - Overlay loading screen
- [TopBarComponent.md](TopBarComponent.md) - Barra superior navegación

**Core Components:**
- core-components.md - Documentación consolidada core layout components
- SideBarComponent.md - Sidebar navegación módulos
- SideBarItemComponent.md - Items individuales sidebar
- TabComponents.md - Sistema tabs DetailView

**Form Components:**
- form-inputs.md - Overview sistema form inputs
- text-input-component.md - Input texto standard
- number-input-component.md - Input numérico con validación
- boolean-input-component.md - Checkbox/Switch input
- date-input-component.md - Date picker input
- email-input-component.md - Email input con validación
- password-input-component.md - Password input oculto
- textarea-input-component.md - Textarea multilinea
- array-input-component.md - Input arrays complejos
- object-input-component.md - Input objects nested
- list-input-component.md - Select/dropdown opciones

**Button Components:**
- buttons-overview.md - Overview sistema botones acción
- ActionButtonComponents.md - Implementación buttons específicos

**Modal & Dialog Components:**
- modal-components.md - Sistema modales y diálogos
- DialogComponents.md - Diálogos confirmación y prompt
- ToastComponents.md - Sistema notifications toast

**Layout & Form Containers:**
- FormLayoutComponents.md - Containers agrupación form fields
- DetailViewTableComponent.md - Tabla DetailView campos readonly
- DropdownMenu.md - Dropdown menu contextual

**Default Views:**
- DefaultViews.md - Documentación vistas default generadas
- views-overview.md - Overview sistema vistas

**Composables:**
- useInputMetadata-composable.md - Composable metadata inputs
- ../../06-composables/useInputMetadata.md - Documentación detallada composable

**Otras Capas:**
- ../../01-decorators/ - Decoradores configuración componentes
- ../../02-base-entity/ - BaseEntity lógica negocio
- ../../03-application/ - Application singleton coordinación
- ../../05-advanced/Router.md - Configuración Vue Router

---

**Total Componentes Documentados:** 32  
**Componentes Core:** 9  
**Form Inputs:** 11  
**Buttons:** 7  
**Modals:** 3  
**Informative:** 4  
**Default Views:** 4
