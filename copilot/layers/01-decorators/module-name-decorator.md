# ModuleName Decorator

## 1. Propósito

El decorador `@ModuleName` define el nombre del módulo de entidad que se mostrará en la interfaz de usuario de la aplicación. Este decorador almacena un string que identifica el módulo en el menú de navegación lateral, headers de vistas, breadcrumbs y referencias generales en UI.

## 2. Alcance

### Responsabilidades

- Definir nombre display del módulo mediante un parámetro string
- Almacenar metadata usando MODULE_NAME_KEY Symbol en el prototype de la clase
- Proporcionar accessor method `getModuleName()` para obtener el nombre
- Integrarse con SideBarComponent para renderizar items de navegación
- Integrarse con vistas (ListView, DetailView) para headers

### Límites

- No afecta funcionalidad backend o API endpoints
- No genera rutas automáticamente
- No valida unicidad de nombres entre módulos
- No maneja internacionalización directamente
- No controla capitalización o formato del nombre

## 3. Definiciones Clave

**MODULE_NAME_KEY**: Symbol único que identifica la metadata de module name almacenada en prototype. Implementación: `export const MODULE_NAME_KEY = Symbol('module_name')`.

**getModuleName()**: Método accessor estático en BaseEntity que retorna el string con el nombre del módulo. Retorna `string | undefined` - retorna `undefined` si el decorador no fue aplicado a la clase.

**SideBarComponent**: Componente UI que consume la metadata de module name para renderizar items del menú de navegación.

## 4. Descripción Técnica

### Implementación del Decorador

**Archivo:** `src/decorations/module_name_decorator.ts`

```typescript
export const MODULE_NAME_KEY = Symbol('module_name');

export function ModuleName(name: string): ClassDecorator {
    return function (target: Function) {
        (target as any)[MODULE_NAME_KEY] = name;
    };
}
```

**Parámetros:**
- `name: string` - Nombre del módulo a mostrar en UI

**Retorno:** `ClassDecorator` - Función que modifica la clase target almacenando el nombre en el Symbol MODULE_NAME_KEY directamente en el objeto target (no en prototype).

**Comportamiento:** El decorador toma el string `name` y lo almacena directamente en el Symbol MODULE_NAME_KEY en el objeto de clase. No crea objetos complejos ni estructuras adicionales, simplemente almacena el valor string puro.

### Metadata Storage

```typescript
// El decorador almacena directamente:
(Product as any)[MODULE_NAME_KEY] = 'Products';
(Customer as any)[MODULE_NAME_KEY] = 'Customers';
(Order as any)[MODULE_NAME_KEY] = 'Orders';
```

El storage es a nivel de clase (no prototype estrictamente, pero accesible desde la clase). El Symbol key previene colisiones con propiedades o métodos reales de la entidad.

### BaseEntity Accessor Implementation

**Archivo:** `src/entities/base_entitiy.ts`

```typescript
public static getModuleName(): string | undefined {
    return (this as any)[MODULE_NAME_KEY];
}
```

**Línea aproximada:** 204-206

**Retorno:** `string | undefined`
- Retorna el string almacenado si el decorador fue aplicado
- Retorna `undefined` si el decorador NO fue aplicado a la clase

**Uso:**
```typescript
const moduleName = Product.getModuleName(); // → 'Products'
const moduleName = Customer.getModuleName(); // → 'Customers'
```

No existe fallback automático. Si el decorador no fue aplicado, el método retorna `undefined` y es responsabilidad del código consumidor manejar este caso.

### Uso Típico

```typescript
import { BaseEntity } from '@/entities/base_entitiy';
import { ModuleName, ModuleIcon, ApiEndpoint, Persistent } from '@/decorations';

@ModuleName('Products')
@ModuleIcon('inventory')
@ApiEndpoint('/api/products')
@Persistent()
export class Product extends BaseEntity {
    // ... propiedades
}

// Acceso al nombre:
const name = Product.getModuleName(); // → 'Products'
```

### SideBarComponent Integration

El SideBarComponent itera sobre `Application.ModuleList.value` (array de clases de entidades) y para cada una obtiene el nombre del módulo llamando a `entityClass.getModuleName()`:

```vue
<template>
    <div v-for="entityClass in Application.ModuleList.value" 
         :key="entityClass.name"
         class="sidebar-item"
         @click="navigateToModule(entityClass)">
        <span class="icon">{{ getIcon(entityClass) }}</span>
        <span class="name">{{ entityClass.getModuleName() }}</span>
    </div>
</template>
```

**Ubicación:** `src/components/SideBarComponent.vue`

Si `getModuleName()` retorna `undefined`, el SideBarComponent debe manejar este caso, típicamente usando el class name como fallback o no mostrando el módulo.

## 5. Flujo de Funcionamiento

1. **Aplicación del Decorador**: Desarrollador aplica `@ModuleName('Products')` a la clase Product
2. **Almacenamiento**: Decorador ejecuta y almacena string 'Products' en `Product[MODULE_NAME_KEY]`
3. **Registro de Módulo**: Clase Product se agrega a `Application.ModuleList.value`
4. **Renderizado de Sidebar**: SideBarComponent itera módulos registrados
5. **Obtención de Nombre**: Para cada módulo llama `entityClass.getModuleName()`
6. **Lookup de Symbol**: `getModuleName()` retorna `this[MODULE_NAME_KEY]`
7. **Display en UI**: SideBarComponent renderiza el string retornado como nombre del item

## 6. Reglas Obligatorias

1. **@ModuleName DEBE aplicarse a todas las entidades user-facing**: Sin este decorador, `getModuleName()` retorna `undefined` y el módulo puede no aparecer correctamente en UI

2. **String DEBE ser human-readable**: Usar nombres descriptivos, no class names técnicos. Bueno: 'Products', 'Customers'. Malo: 'Prod', 'Cust'

3. **Convención de capitalización DEBE ser consistente**: Framework no enforcea, pero mantener consistencia. Recomendado: Title Case para nombres de módulos

4. **El string NO debe contener caracteres especiales problemáticos**: Evitar caracteres que puedan causar problemas en HTML rendering o routing

5. **NO intentar almacenar objetos complejos**: El decorator solo acepta y almacena strings simple. Intentar pasar objetos resultará en conversión a string "[object Object]"

6. **Consultar SIEMPRE via getModuleName()**: No acceder directamente al Symbol desde código externo. Usar el accessor method proporcionado

## 7. Prohibiciones

1. **NUNCA pasar más de un parámetro**: El decorador acepta exactamente un parámetro string. Código como `@ModuleName('Product', 'Products')` es inválido y causará error de compilación TypeScript

2. **NUNCA asumir que getModuleName() retorna valor**: Siempre manejar el caso `undefined`. Código que asume string causará errores runtime si decorador no fue aplicado

3. **NUNCA modificar MODULE_NAME_KEY directamente**: No ejecutar `Product[MODULE_NAME_KEY] = 'NewName'` desde código no-decorator. Usar solo el decorador para establecer el valor

4. **NUNCA usar nombres dinámicos en tiempo de runtime**: El decorador se ejecuta en tiempo de definición de clase (compile/load time), no runtime. No intentar `@ModuleName(someVariable)` con variables runtime

5. **NUNCA omitir el decorador en entidades registradas en ModuleList**: Si una entidad está en `Application.ModuleList`, DEBE tener `@ModuleName`. De lo contrario causará UI incompleto

## 8. Dependencias

**Dependencias Directas:**
- `src/decorations/module_name_decorator.ts`: Exporta MODULE_NAME_KEY Symbol y función ModuleName
- `src/entities/base_entitiy.ts`: Implementa método accessor `getModuleName()`
- TypeScript Decorators: Requiere experimentalDecorators enabled en tsconfig.json

**Dependencias en Runtime:**
- Symbol API de JavaScript para key collision-free
- Class-based inheritance para accessor methods compartidos

## 9. Relaciones

**Utilizado por:**
- `SideBarComponent.vue`: Lee module names para renderizar menú de navegación
- Vistas default (ListView, DetailView): Potencialmente usan nombres para headers
- `Application.ModuleList`: Almacena clases con módulos, cada uno debe tener ModuleName

**Relacionado con:**
- `@ModuleIcon`: Define icono del módulo, usado junto a ModuleName en sidebar
- `@ModulePermission`: Define permisos del módulo, orthogonal pero relacionado
- `@ApiEndpoint`: Define endpoint API, usado en conjunto para módulos completos
- `@Persistent`: Habilita persistencia, cuarto decorador típico de clase

**No relacionado directamente con:**
- Decoradores de propiedades (@PropertyName, @Required, etc.): Scope diferente
- Router: ModuleName no genera rutas automáticamente

## 10. Notas de Implementación

### Ejemplo Completo de Módulo

```typescript
import { BaseEntity } from '@/entities/base_entitiy';
import {
    ModuleName,
    ModuleIcon,
    ApiEndpoint,
    Persistent,
    PropertyName,
    PropertyIndex,
    Required
} from '@/decorations';

@ModuleName('Products')
@ModuleIcon('inventory_2')
@ApiEndpoint('/api/products')
@Persistent()
export class Product extends BaseEntity {
    @PropertyIndex(1)
    @PropertyName('ID', Number)
    id?: number;

    @PropertyIndex(2)
    @PropertyName('Name', String)
    @Required()
    name!: string;

    @PropertyIndex(3)
    @PropertyName('Price', Number)
    price?: number;
}

// Uso:
const name = Product.getModuleName(); // → 'Products'
```

### Manejo de Undefined

```typescript
// Código defensivo en componentes:
const moduleName = entityClass.getModuleName();
const displayName = moduleName || entityClass.name; // Fallback a class name

// O validación explícita:
if (!entityClass.getModuleName()) {
    console.warn(`Entity ${entityClass.name} missing @ModuleName decorator`);
    return; // No renderizar módulo sin nombre
}
```

### Debugging

```typescript
// Verificar si decorador fue aplicado:
console.log('Module name:', Product.getModuleName());
// → 'Products' si decorador aplicado
// → undefined si decorador  missing

// Verificar Symbol directamente (solo debugging):
console.log('Symbol value:', (Product as any)[MODULE_NAME_KEY]);
```

### Convenciones de Naming

**Recomendadas:**
- Plural para módulos de entidades: 'Products', 'Customers', 'Orders'
- Title Case: 'Purchase Orders', 'Inventory Items'
- Nombres descriptivos completos: 'Customer Accounts' no 'Cust Acc'

**No recomendadas:**
- Singular para listas: 'Product' confunde si es uno o muchos
- Abreviados: 'Prod', 'Cust', 'Ord'
- Technical names: 'ProductEntity', 'CustomerClass'

## 11. Referencias Cruzadas

**Documentos relacionados:**
- [persistent-decorator.md](persistent-decorator.md): Otro decorador de clase fundamental
- [module-icon-decorator.md](module-icon-decorator.md): Decorador complementario para iconos
- [api-endpoint-decorator.md](api-endpoint-decorator.md): Define endpoint para CRUD
- [module-permission-decorator.md](module-permission-decorator.md): Control de acceso a módulos
- ../../02-base-entity/base-entity-core.md: Documentación de BaseEntity donde está definido getModuleName()
- ../../03-application/application-singleton.md: Application.ModuleList que contiene módulos registrados
- ../../04-components/SideBarComponent.md: Componente que consume module names

**Archivos de código:**
- `src/decorations/module_name_decorator.ts`: Implementación del decorador
- `src/entities/base_entitiy.ts`: Implementación del método accessor
- `src/components/SideBarComponent.vue`: Uso principal del module name

**Ejemplos relacionados:**
- [../examples/classic-module-example.md](../../examples/classic-module-example.md): Ejemplo completo de módulo usando @ModuleName
- [../examples/advanced-module-example.md](../../examples/advanced-module-example.md): Uso avanzado en módulos complejos
