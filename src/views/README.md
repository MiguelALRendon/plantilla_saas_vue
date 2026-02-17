# Views Directory

## 1. Propósito

Contiene las vistas principales del framework que orquestan renderizado de componentes CRUD: vistas de lista con tabla paginada, vistas de detalle con formularios dinámicos, y vistas de lookup para selección de relaciones N:1.

## 2. Alcance

### Responsabilidades
- `default_listview.vue` - Vista de lista con DataTableComponent, filtros, paginación y acciones
- `default_detailview.vue` - Vista de detalle con formulario dinámico generado desde metadata
- `default_lookup_listview.vue` - Vista de lookup para selección en ListInputComponent
- `list.vue` - Vista wrapper para routing (deprecated/legacy)

### Límites
- NO contienen lógica de negocio - Delegan a BaseEntity
- NO ejecutan API calls directamente - BaseEntity methods las ejecutan
- NO deciden qué componentes renderizar - ComponentResolverService lo hace

## 3. Definiciones Clave

**DefaultListView**: Vista orquestadora de renderizado de tabla con datos desde Application.View.value.entity.  
**DefaultDetailView**: Vista generadora de formularios dinámicos iterando entity.metadata.properties.  
**ComponentResolverService**: Servicio que decide qué input component renderizar por property type.  
**View-Driven Rendering**: Router renderiza DefaultView, que lee Application.View para decidir qué vista mostrar.

## 4. Descripción Técnica

DefaultListView lee `Application.View.value.entity` para obtener entityClass, ejecuta `entity.list()` para poblar tabla, renderiza DataTableComponent con columnas desde @PropertyName decorators, acciones desde @ApiEndpoint. DefaultDetailView itera `entity.metadata.properties`, por cada property ejecuta ComponentResolverService para obtener input component apropiado, renderiza dinámicamente con v-model.

## 5. Flujo de Funcionamiento

**List View:**
1. Application.changeView(ProductEntity, ViewType.LIST)
2. Router renderiza DefaultListView
3. DefaultListView lee Application.View.value.entity
4. Ejecuta await ProductEntity.list()
5. Renderiza DataTableComponent con products array
6. Usuario click row → changeView(ProductEntity, ViewType.DETAIL, ViewMode.UPDATE, instance)

**Detail View:**
1. Application.changeView(ProductEntity, ViewType.DETAIL, ViewMode.CREATE)
2. Router renderiza DefaultDetailView
3. DefaultDetailView itera ProductEntity.metadata.properties
4. Por property 'name' (String TEXT) → ComponentResolverService → TextInputComponent
5. Renderiza `<TextInputComponent :entity="instance" propertyKey="name" v-model="instance.name" />`
6. Usuario escribe "iPhone"
7. Click Save → await instance.save() → toast success

## 6. Reglas Obligatorias

- SIEMPRE leer entity desde Application.View.value
- SIEMPRE usar ComponentResolverService para decidir componentes
- SIEMPRE ejecutar entity.isValidated() before save
- SIEMPRE mostrar loading states durante async operations
- SIEMPRE usar tokens CSS para estilos

## 7. Prohibiciones

1. NO hardcodear entity type - leer de Application.View
2. NO renderizar componentes hardcoded - usar ComponentResolverService
3. NO omitir validación before save
4. NO ejecutar multiple saves simultáneos
5. NO hardcodear CSS

## 8. Dependencias

- Application.View - Fuente de verdad de vista actual
- BaseEntity - Methods: list(), save(), delete(), isValidated()
- ComponentResolverService - Resuelve input components por property type
- DataTableComponent - Renderiza tabla en ListView
- Input Components (src/components/Form/) - Renderizados en DetailView
- constants.css - Tokens CSS

## 9. Relaciones

Application.changeView() → Router → DefaultListView/DefaultDetailView  
DefaultDetailView → ComponentResolverService → TextInputComponent/NumberInputComponent/etc.  
DefaultListView → DataTableComponent → muestra data de entity.list()

Documentos: `copilot/layers/04-components/views-overview.md`

## 10. Notas de Implementación

```vue
<!-- Router config  -->
{
    path: '/view',
    name: 'DefaultView',
    component: () => import('@/views/default_listview.vue'),  // or detailview
}
```

Uso:
```typescript
// Navegar a lista
Application.changeView(ProductEntity, ViewType.LIST);

// Navegar a detalle (crear)
Application.changeView(ProductEntity, ViewType.DETAIL, ViewMode.CREATE);

// Navegar a detalle (editar)
Application.changeView(ProductEntity, ViewType.DETAIL, ViewMode.UPDATE, productInstance);
```

## 11. Referencias Cruzadas

- [views-overview.md](../../../copilot/layers/04-components/views-overview.md)
- [application-singleton.md](../../../copilot/layers/03-application/application-singleton.md)
- [base-entity.md](../../../copilot/layers/02-base-entity/base-entity.md)
- Router: src/router/index.ts
