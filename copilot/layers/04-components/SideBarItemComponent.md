# SideBarItemComponent

## 1. Propósito

Componente Vue que representa un item individual de módulo en el sidebar de navegación lateral. Cada instancia de SideBarItemComponent corresponde a una entidad registrada en Application.ModuleList y proporciona navegación directa hacia la vista de lista predeterminada del módulo. El componente detecta automáticamente si representa el módulo actualmente visualizado y aplica estilos visuales distintivos para indicar el estado activo.

## 2. Alcance

Este documento cubre el componente SideBarItemComponent ubicado en src/components/SideBarItemComponent.vue. Incluye la definición de props, template structure, computed properties, métodos de navegación, sistema de detección de estado activo, integración con decoradores de BaseEntity para obtención de metadata, manejo de eventos de click, estilos CSS dinámicos según estado, y el flujo completo de navegación entre módulos. No cubre la implementación del componente padre SideBarComponent ni la lógica interna de Application.changeViewToDefaultView.

## 3. Definiciones Clave

**SideBarItemComponent**: Componente Vue hijo renderizado dentro de SideBarComponent que representa visualmente un módulo individual mediante icono y nombre.

**isActive**: Computed property que determina si este item representa el módulo actualmente activo comparando el nombre del módulo de la vista actual con el módulo del item.

**setNewView**: Método que ejecuta la navegación hacia la vista predeterminada del módulo representado por este item al invocar Application.changeViewToDefaultView.

**Module Prop**: Prop requerida que recibe una clase que extiende BaseEntity, representando el módulo a renderizar.

**Estado Activo**: Condición visual del item cuando su módulo coincide con Application.View.value.entityClass, indicado mediante clase CSS .active.

## 4. Descripción Técnica

El componente SideBarItemComponent se estructura mediante tres elementos principales: la definición de props, el template reactivo y la lógica computada de estado activo.

**Props**: El componente recibe una única prop llamada module de tipo typeof BaseEntity. Esta prop es requerida y representa la clase de entidad del módulo a renderizar. La validación TypeScript requiere casting especial: type: Function as unknown as PropType typeof BaseEntity debido a que las clases son funciones constructoras en JavaScript.

**Template Structure**: El elemento raíz es un div con clase base side-bar-item. La directiva :class vincula dinámicamente la clase active cuando la computed property isActive retorna true. El evento @click está vinculado al método setNewView. El template contiene dos elementos hijos: un div.icon que renderiza una imagen obtenida mediante module.getModuleIcon y un span.module-title que muestra el texto obtenido mediante module.getModuleName.

**Computed Property isActive**: Esta propiedad computada implementa la lógica de detección de estado activo. Accede a Application.View.value.entityClass para obtener la clase de entidad actualmente visualizada. Invoca getModuleName en ambas clases (actual y prop module) y compara los nombres resultantes. Retorna true si coinciden, false en caso contrario. Esta comparación es reactiva y se re-evalúa automáticamente cuando Application.View.value.entityClass cambia.

**Método setNewView**: Este método maneja el evento click. Su implementación consiste en una única llamada: Application.changeViewToDefaultView(this.module as typeof BaseEntity). El casting as typeof BaseEntity asegura type safety. Este método delega toda la lógica de navegación al Application singleton, siguiendo el principio de separación de responsabilidades.

**Integración con Metadata System**: El componente no almacena información de icono ni nombre. En su lugar, invoca métodos estáticos de la clase BaseEntity: getModuleIcon y getModuleName. Estos métodos leen metadata establecida por decoradores @ModuleIcon y @ModuleName aplicados a la clase entidad. Este diseño desacopla la presentación de la definición de metadata.

## 5. Flujo de Funcionamiento

El ciclo operacional del componente sigue este flujo:

**Fase de Renderizado Inicial**:
1. SideBarComponent itera Application.ModuleList.value
2. Para cada módulo, instancia SideBarItemComponent con prop :module
3. El template accede a module.getModuleIcon() para obtener la ruta del icono desde decorador @ModuleIcon
4. El template accede a module.getModuleName​() para obtener el nombre desde decorador @ModuleName
5. La computed property isActive se evalúa comparando Application.View.value.entityClass?.getModuleName() con this.module.getModuleName()
6. Si isActive retorna true, la clase CSS active se añade al elemento raíz

**Fase de Interacción del Usuario**:
1. Usuario hace click en el div.side-bar-item
2. El evento click dispara el método setNewView()
3. setNewView() invoca Application.changeViewToDefaultView(this.module)
4. Application singleton actualiza Application.View.value.entityClass con la nueva clase de módulo
5. Application redirige el router a la URL correspondiente al módulo
6. La actualización de Application.View.value dispara re-evaluación de isActive en todos los SideBarItemComponent montados

**Fase de Actualización de Estado**:
1. La reactividad de Vue detecta cambio en Application.View.value.entityClass
2. Todos los items del sidebar re-evalúan su computed property isActive
3. El item cuyo module coincide con la nueva entityClass obtiene isActive === true
4. Vue aplica la clase active a ese item
5. El item anteriormente activo pierde la clase active
6. CSS transitions aplican animaciones suaves durante el cambio de clases

Este flujo garantiza que siempre haya exactamente un item activo coincidiendo con el módulo visualizado en Application.View.

## 6. Reglas Obligatorias

Las reglas obligatorias para el uso correcto de SideBarItemComponent son:

**Regla de Prop Requerida**: La prop module DEBE ser proporcionada siempre. El componente no tiene fallback ni validación adicional. Pasar undefined o null causará errores de runtime al invocar getModuleName() o getModuleIcon().

**Regla de Clase BaseEntity**: La prop module DEBE ser una clase que extienda BaseEntity. Clases que no hereden de BaseEntity no tendrán los métodos getModuleName ni getModuleIcon, causando errores de invocación de método.

**Regla de Decoradores**: La clase pasada como module DEBE tener aplicados los decoradores @ModuleName y @ModuleIcon. Sin estos decoradores, getModuleName() retornará undefined o el nombre de clase por defecto, y getModuleIcon​() retornará undefined o string vacío, resultando en UI inconsistente.

**Regla de Unique Keys**: Cuando se renderizan múltiples SideBarItemComponent mediante v-for, DEBE proporcionarse una :key única. Típicamente se usa :key="module.name" donde module.name es el nombre de la clase constructora.

**Regla de Contexto Application**: El componente DEBE usarse en un contexto donde Application singleton esté inicializado. Accesos a Application.View.value o Application.changeViewToDefaultView fallarán si Application no está disponible globalmente.

**Regla de Iconos**: Las rutas retornadas por module.getModuleIcon() DEBEN apuntar a archivos existentes en src/assets/icons/ o ser URLs absolutas válidas. Rutas inválidas resultarán en imágenes rotas sin fallback visual.

**Regla de Evento Click**: No debe agregarse lógica adicional al evento @click. Toda lógica de navegación debe delegarse a Application.changeViewToDefaultView. Agregar lógica personalizada puede causar desincronización entre URL, estado de Application y estado visual del sidebar.

## 7. Prohibiciones

Las siguientes prácticas están estrictamente prohibidas:

**Prohibido Modificar Props Internamente**: NUNCA modificar this.module dentro del componente. Las props son inmutables y su modificación viola el flujo de datos unidireccional de Vue. Ejemplo prohibido: this.module = OtraClase.

**Prohibido Manipular DOM Directamente**: NUNCA usar document.querySelector o similar para manipular el DOM del componente. Todo cambio de estado visual debe manejarse mediante reactividad de Vue y clases CSS dinámicas. Ejemplo prohibido: this.$el.classList.add('active').

**Prohibido Almacenar Estado Local de Activo**: NUNCA crear data property para almacenar estado activo (ej: isCurrentModule: false). El estado activo DEBE derivarse exclusivamente de la computed property isActive que consulta Application.View. Duplicar este estado causa desincronización.

**Prohibido Navegar con Router Directamente**: NUNCA usar this.$router.push() para navegación. Toda navegación DEBE delegarse a Application.changeViewToDefaultView que gestiona sincronización entre router, estado de aplicación y vistas. Ejemplo prohibido: this.$router.push('/products').

**Prohibido Emit de Eventos**: NUNCA emitir eventos custom desde este componente. El componente es auto-contenido y maneja toda su lógica internamente mediante Application singleton. Ejemplo prohibido: this.$emit('module-selected', this.module).

**Prohibido Uso de Watchers**: NUNCA agregar watchers a module o Application.View. Los computed properties proporcionan toda la reactividad necesaria de forma eficiente. Watchers innecesarios degradan performance.

**Prohibido Hardcodear Iconos o Nombres**: NUNCA hardcodear valores de icono o nombre en el template. Toda metadata DEBE obtenerse mediante getModuleIcon() y getModuleName() que leen decoradores. Ejemplo prohibido: v-if="module.name === 'Products'".

## 8. Dependencias

SideBarItemComponent mantiene las siguientes dependencias críticas:

**Dependencia de BaseEntity** (src/entities/base_entity.ts):
- Tipo requerido para prop module
- Métodos getModuleName(): Retorna string con nombre del módulo desde decorador @ModuleName
- Método getModuleIcon(): Retorna string con ruta de icono desde decorador @ModuleIcon
- Si BaseEntity modifica signatures de estos métodos, el componente requiere actualización

**Dependencia de Application Singleton** (models/application.ts):
- Application.View: Ref<ViewState> que almacena estado de vista actual
- Application.View.value.entityClass: Clase BaseEntity actualmente visualizada
- Application.changeViewToDefaultView(entityClass): Método que ejecuta navegación completa
- Application.ModuleList: Usado por componente padre para iterar módulos
- Si Application cambia estructura de View o signature de changeViewToDefaultView, rompe funcionalidad

**Dependencia de Decoradores**:
- @ModuleName (src/decorations/module_name_decorator.ts): Establece metadata de nombre
- @ModuleIcon (src/decorations/module_icon_decorator.ts): Establece metadata de icono
- Sin estos decoradores en clases de entidad, getModuleName/getModuleIcon retornan valores undefined

**Dependencia de CSS Variables**:
- --sidebar-min-width: Define tamaño de iconos y dimensiones del item
- --gray-lightest: Color de estado hover
- --grad-red-warm: Gradiente para estado activo
- --white: Color de texto en estado activo
- --shadow-white: Drop shadow de iconos
- Si estas variables CSS no están definidas, los estilos fallan silenciosamente

**Dependencia de Vue 3**:
- Composition API para computed properties
- Reactivity system para detección de cambios en Application.View
- Template directives :class, @click, :src
- PropType para type definitions
- Versiones de Vue 2 no son compatibles

**Dependencia de TypeScript**:
- Type safety para prop module: typeof BaseEntity
- PropType import desde vue
- Casting as typeof BaseEntity en setNewView
- JavaScript puro requeriría eliminación de tipos

## 9. Relaciones

SideBarItemComponent participa en las siguientes relaciones arquitecturales:

**Relación Padre-Hijo con SideBarComponent**:
- SideBarComponent es el componente padre que renderiza múltiples instancias de SideBarItemComponent
- SideBarComponent obtiene lista de módulos desde Application.ModuleList.value
- Usa v-for para iterar y crear un SideBarItemComponent por módulo
- SideBarItemComponent NO comunica eventos de vuelta al padre
- Relación unidireccional: padre proporciona prop module, hijo maneja navegación independientemente

**Relación con Application Singleton**:
- SideBarItemComponent consulta Application.View.value para determinar estado activo
- SideBarItemComponent invoca Application.changeViewToDefaultView para navegación
- Application actúa como source of truth central, no hay estado duplicado en el componente
- Múltiples SideBarItemComponent observan el mismo Application.View reactivamente

**Relación con TopBarComponent**:
- No hay dependencia directa entre componentes
- Ambos consumen Application.View para diferentes propósitos
- TopBarComponent muestra breadcrumbs del módulo actual
- SideBarItemComponent indica visualmente el módulo actual
- Sincronización implícita mediante Application.View compartido

**Relación con Default Views (ListVjson/DetailView)**:
- SideBarItemComponent dispara navegación hacia DefaultListView mediante Application.changeViewToDefaultView
- DefaultListView se monta cuando la navegación completa
- No hay referencia directa entre estos componentes
- Comunicación mediada completamente por Application singleton

**Relación con Router de Vue**:
- Application.changeViewToDefaultView actualiza router internamente
- SideBarItemComponent NO accede directamente a $router
- Cambios de ruta causan actualizaciones de Application.View
- Actualizaciones de Application.View causan re-evaluación de isActive

**Relación con Sistema de Decoradores**:
- SideBarItemComponent es consumidor pasivo de metadata establecida por decoradores
- No modifica ni lee directamente decoradores
- Accede a metadata procesada mediante métodos getter de BaseEntity
- Decoradores @ModuleName y @ModuleIcon son dependencias indirectas

## 10. Notas de Implementación

Consideraciones importantes para implementación y mantenimiento:

**Performance de Computed Property isActive**:
La computed property isActive se re-evalúa en TODOS los SideBarItemComponent montados cada vez que Application.View.value.entityClass cambia. Con 20+ módulos, esto significa 20+ evaluaciones por navegación. Sin embargo, las computed properties de Vue están optimizadas con memoization y solo disparan re-renders si el valor retornado cambia. En práctica, el impacto es mínimo. No optimizar prematuramente con watchers o flags manuales.

**CSS Transitions y Performance**:
La transición de 0.4s ease en cambios de estado puede causar layout shifts si no se maneja cuidadosamente. La propiedad transform no está usada, lo que significa transiciones sobre background-color y color. Estas propiedades disparan repaint pero no reflow. Para mejor performance en listas largas, considerar usar transform para animaciones o reducir duración a 0.2s.

**Type Casting en TypeScript**:
El casting as unknown as PropType<typeof BaseEntity> es necesario porque TypeScript no infiere correctamente tipos de clase constructora en props de Vue. Este es un patrón aceptado en Vue 3 + TypeScript. Alternativa: usar PropType<BaseEntity> (tipo instancia) requeriría pasar instancias en lugar de clases, cambiando arquitectura fundamental.

**Memory Leaks Potenciales**:
El componente no mantiene referencias a timers, event listeners externos ni subscriptions. No requiere cleanup en beforeUnmount. La reactividad de computed properties se limpia automáticamente por Vue. Sin embargo, si se agregaran watchers manuales en el futuro, DEBEN limpiarse explícitamente.

**Estado Global vs Local**:
La decisión de NO mantener estado local de"activo" y derivarlo exclusivamente de Application.View es intencional. Esto garantiza single source of truth y elimina posibilidad de desincronización. El trade-off es dependencia fuerte de Application singleton, pero esto es aceptable dado que Application es fundamental en toda la arquitectura del framework.

**Customización de Estilos**:
Los estilos usan CSS variables (--gray-lightest, --grad-red-warm) lo que permite theming global. Para customización por módulo, se podría agregar computed property que retorne clase CSS basada en module.name: :class="[moduleSpecificClass, { active: isActive }]". Sin embargo, esto no está implementado para mantener consistencia visual entre módulos.

**Debugging Tips**:
Para depurar estado activo, usar Vue DevTools para inspeccionar: 1) Props → module (verificar clase correcta), 2) Computed → isActive (verificar true/false), 3) Application.View.value.entityClass en Root. Si isActive es incorrecto, típicamente indica discrepancia entre nombres retornados por getModuleName, posiblemente por decorador faltante o nombre mal configurado.

## 11. Referencias Cruzadas

SideBarItemComponent se relaciona con los siguientes documentos técnicos:

**Documentos de Componentes**:
- [SideBarComponent.md](SideBarComponent.md): Componente padre contenedor que renderiza múltiples SideBarItemComponent y gestiona estado collapsed del sidebar
- [TopBarComponent.md](TopBarComponent.md): Componente de barra superior que comparte dependencia en Application.View para mostrar breadcrumbs del módulo actual
- [ComponentContainerComponent.md](ComponentContainerComponent.md): Componente que renderiza la vista activa determinada por navegación desde SideBarItemComponent

**Documentos de Core**:
- [../02-base-entity/base-entity-core.md](../02-base-entity/base-entity-core.md): Documentación de BaseEntity incluyendo métodos getModuleName() y getModuleIcon() consumidos por este componente
- [../02-base-entity/entity-metadata-system.md](../02-base-entity/entity-metadata-system.md): Sistema de metadata que subyace a los métodos getter invocados por el componente
- [../03-application/application-singleton.md](../03-application/application-singleton.md): Documentación detallada de Application.View y Application.changeViewToDefaultView utilizados por el componente

**Documentos de Decoradores**:
- [../01-decorators/module-name-decorator.md](../01-decorators/module-name-decorator.md): Decorador @ModuleName que establece metadata de nombre consultada mediante getModuleName()
- [../01-decorators/module-icon-decorator.md](../01-decorators/module-icon-decorator.md): Decorador @ModuleIcon que establece metadata de icono consultada mediante getModuleIcon()

**Documentos de Arquitectura**:
- [../../02-FLOW-ARCHITECTURE.md](../../02-FLOW-ARCHITECTURE.md): Documenta flujo completo de navegación desde click en sidebar hasta renderizado de vista
- [../../01-FRAMEWORK-OVERVIEW.md](../../01-FRAMEWORK-OVERVIEW.md): Overview de arquitectura incluyendo rol de componentes de navegaciónen framework SaaS

**Documentos de Estilo**:
- [../../css/constants.css](../../css/constants.css): Define CSS variables utilizadas en estilos del componente (--sidebar-min-width, --grad-red-warm, etc.)

**Ejemplos de Uso**:
- [../../examples/classic-module-example.md](../../examples/classic-module-example.md): Ejemplo completo mostrando cómo decoradores @ModuleName y @ModuleIcon permiten renderizado automático en sidebar
