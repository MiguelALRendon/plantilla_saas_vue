# Decoradores del Sistema

## Propósito
Esta carpeta contiene todos los decoradores TypeScript del Framework SaaS Vue. Los decoradores almacenan metadatos en los prototipos de las clases mediante Symbols, permitiendo que el sistema genere automáticamente interfaces de usuario, validaciones y operaciones CRUD.

## Elementos

### Decoradores de Propiedad

#### Definición Básica
- **[property_name_decorator.ts](./property_name_decorator.ts)** - `@PropertyName(name, type)` - Define nombre visible y tipo de dato. **Símbolo:** PROPERTY_NAME_KEY, PROPERTY_TYPE_KEY. **Accesores:** getProperties(), getPropertyType()
- **[property_index_decorator.ts](./property_index_decorator.ts)** - `@PropertyIndex(order)` - Define orden de renderizado. **Símbolo:** PROPERTY_INDEX_KEY. **Accesor:** getPropertyIndices()
- **[css_column_class_decorator.ts](./css_column_class_decorator.ts)** - `@CSSColumnClass(className)` - Define clase CSS para columnas de tabla. **Símbolo:** CSS_COLUMN_CLASS_KEY. **Accesor:** getCSSClasses()

#### Estado de Propiedad
- **[default_property_decorator.ts](./default_property_decorator.ts)** - `@DefaultProperty(propertyKey)` - Define propiedad de identificación por defecto. **Símbolo:** DEFAULT_PROPERTY_KEY. **Accesor:** getDefaultPropertyValue()
- **[primary_property_decorator.ts](./primary_property_decorator.ts)** - `@PrimaryProperty(propertyKey)` - Define clave primaria. **Símbolo:** PRIMARY_PROPERTY_KEY. **Accesor:** getPrimaryPropertyValue()
- **[unique_decorator.ts](./unique_decorator.ts)** - `@UniquePropertyKey(propertyKey)` - Define clave única para URLs. **Símbolo:** UNIQUE_KEY. **Accesor:** getUniquePropertyValue()

#### Tipos Especiales
- **[string_type_decorator.ts](./string_type_decorator.ts)** - `@StringTypeDef(stringType)` - Define tipo de string (TEXT, EMAIL, PASSWORD, TEXTAREA). **Símbolo:** STRING_TYPE_KEY. **Accesor:** getStringType()
- **[mask_decorator.ts](./mask_decorator.ts)** - `@Mask(maskPattern)` - Define máscara de formato para inputs. **Símbolo:** MASK_KEY.

### Decoradores de Validación

- **[required_decorator.ts](./required_decorator.ts)** - `@Required(condition)` - Marca campo como obligatorio. **Símbolo:** REQUIRED_KEY. **Accesor:** isRequired()
- **[validation_decorator.ts](./validation_decorator.ts)** - `@Validation(fn, message)` - Validación síncrona custom. **Símbolo:** VALIDATION_KEY. **Accesor:** isValidation()
- **[async_validation_decorator.ts](./async_validation_decorator.ts)** - `@AsyncValidation(fn, message)` - Validación asíncrona contra servidor. **Símbolo:** ASYNC_VALIDATION_KEY. **Accesor:** isAsyncValidation()

### Decoradores de UI

#### Agrupación Visual
- **[view_group_decorator.ts](./view_group_decorator.ts)** - `@ViewGroup(groupName)` - Agrupa campos en secciones colapsables. **Símbolo:** VIEW_GROUP_KEY. **Accesor:** getViewGroups()
- **[view_group_row_decorator.ts](./view_group_row_decorator.ts)** - `@ViewGroupRowDecorator(row)` - Define fila de agrupación. **Símbolo:** VIEW_GROUP_ROW_KEY. **Accesor:** getViewGroupRows()
- **[tab_order_decorator.ts](./tab_order_decorator.ts)** - `@TabOrder(order)` - Define orden de tabs para arrays. **Símbolo:** TAB_ORDER_KEY.

#### Visibilidad
- **[hide_in_list_view_decorator.ts](./hide_in_list_view_decorator.ts)** - `@HideInListView()` - Oculta propiedad en vista de lista. **Símbolo:** HIDE_IN_LIST_VIEW_KEY. **Accesor:** isHideInListView()
- **[hide_in_detail_view_decorator.ts](./hide_in_detail_view_decorator.ts)** - `@HideInDetailView()` - Oculta propiedad en vista de detalle. **Símbolo:** HIDE_IN_DETAIL_VIEW_KEY. **Accesor:** isHideInDetailView()

#### Presentación
- **[display_format_decorator.ts](./display_format_decorator.ts)** - `@DisplayFormat(format)` - Define formato de visualización. **Símbolo:** DISPLAY_FORMAT_KEY. **Accesor:** getFormattedValue()
- **[help_text_decorator.ts](./help_text_decorator.ts)** - `@HelpText(text)` - Define texto de ayuda para el usuario. **Símbolo:** HELP_TEXT_KEY. **Accesor:** getHelpText()

### Decoradores de Estado

- **[disabled_decorator.ts](./disabled_decorator.ts)** - `@Disabled(condition)` - Deshabilita campo condicionalmente. **Símbolo:** DISABLED_KEY. **Accesor:** isDisabled()
- **[readonly_decorator.ts](./readonly_decorator.ts)** - `@ReadOnly(condition)` - Marca campo como solo lectura. **Símbolo:** READONLY_KEY. **Accesor:** isReadOnly()

### Decoradores de Módulo

- **[module_name_decorator.ts](./module_name_decorator.ts)** - `@ModuleName(name)` - Define nombre del módulo visible en sidebar. **Símbolo:** MODULE_NAME_KEY. **Accesor:** getModuleName()
- **[module_icon_decorator.ts](./module_icon_decorator.ts)** - `@ModuleIcon(icon)` - Define icono del módulo. **Símbolo:** MODULE_ICON_KEY. **Accesor:** getModuleIcon()
- **[module_permission_decorator.ts](./module_permission_decorator.ts)** - `@ModulePermission(permission)` - Define permisos requeridos. **Símbolo:** MODULE_PERMISSION_KEY. **Accesor:** getModulePermission()

### Decoradores de Componentes

- **[module_list_component_decorator.ts](./module_list_component_decorator.ts)** - `@ModuleListComponent(component)` - Define componente custom para vista de lista. **Símbolo:** MODULE_LIST_COMPONENT_KEY. **Accesor:** getModuleListComponent()
- **[module_detail_component_decorator.ts](./module_detail_component_decorator.ts)** - `@ModuleDetailComponent(component)` - Define componente custom para vista de detalle. **Símbolo:** MODULE_DETAIL_COMPONENT_KEY. **Accesor:** getModuleDetailComponent()
- **[module_default_component_decorator.ts](./module_default_component_decorator.ts)** - `@ModuleDefaultComponent(component)` - Define componente por defecto del módulo. **Símbolo:** MODULE_DEFAULT_COMPONENT_KEY. **Accesor:** getModuleDefaultComponent()
- **[module_custom_components_decorator.ts](./module_custom_components_decorator.ts)** - `@ModuleCustomComponents(map)` - Define mapa de componentes custom. **Símbolo:** MODULE_CUSTOM_COMPONENTS_KEY. **Accesor:** getModuleCustomComponents()

### Decoradores de API

- **[api_endpoint_decorator.ts](./api_endpoint_decorator.ts)** - `@ApiEndpoint(url)` - Define URL del endpoint REST. **Símbolo:** API_ENDPOINT_KEY. **Accesor:** getApiEndpoint()
- **[api_methods_decorator.ts](./api_methods_decorator.ts)** - `@ApiMethods(methods)` - Define métodos HTTP permitidos. **Símbolo:** API_METHODS_KEY. **Accesor:** getApiMethods()
- **[persistent_decorator.ts](./persistent_decorator.ts)** - `@Persistent()` - Habilita persistencia en backend. **Símbolo:** PERSISTENT_KEY. **Accesor:** isPersistent()
- **[persistent_key_decorator.ts](./persistent_key_decorator.ts)** - `@PersistentKey(serverKey, clientKey)` - Mapea claves entre servidor y cliente. **Símbolo:** PERSISTENT_KEY_KEY.

### Archivo de Índice

- **[index.ts](./index.ts)** - Exporta todos los decoradores y sus tipos asociados para uso centralizado.

## Arquitectura de Metadatos

Los decoradores almacenan metadatos usando Symbols de JavaScript en el prototype de las clases:

```typescript
// Decorador almacena metadata
proto[SYMBOL_KEY][propertyKey] = value;

// BaseEntity lee metadata
const metadata = proto[SYMBOL_KEY];
```

Cada decorador define:
1. **Symbol único** para identificar el tipo de metadata
2. **Función decoradora** que recibe parámetros y retorna PropertyDecorator o ClassDecorator
3. **Almacenamiento en prototype** para acceso desde instancias y clase

## Convenciones

- Todos los decoradores deben exportar su Symbol asociado
- Los decoradores de propiedad deben ser PropertyDecorator
- Los decoradores de clase deben ser ClassDecorator
- BaseEntity debe tener métodos accesores para cada tipo de metadata
- Los metadatos deben ser inmutables una vez aplicados

## Referencias

- [BaseEntity Documentation](../../copilot/layers/02-base-entity/README.md)
- [Decorators Layer Documentation](../../copilot/layers/01-decorators/README.md)
- [Framework Overview](../../copilot/01-FRAMEWORK-OVERVIEW.md)

## Última Actualización
15 de Febrero, 2026
