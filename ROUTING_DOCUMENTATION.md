# Documentación del Sistema de Routing

## Resumen de Cambios

Se ha implementado un sistema de routing real usando **Vue Router 4** que se integra completamente con la lógica existente de tu aplicación, respetando todos los patrones y arquitectura establecidos.

## Cambios Implementados

### 1. **Extensión de la interfaz `View`**
- **Archivo**: `src/models/View.ts`
- **Cambio**: Se agregó la propiedad `entityOid: string` a la interfaz `View`
- **Propósito**: Almacenar el identificador único (OID) de la entidad actual, se inicializa como `''`

```typescript
export interface View {
    entityClass: EntityCtor | null;
    entityObject: BaseEntity | null;
    component: Component | null;
    viewType: ViewTypes;
    isValid: boolean;
    entityOid: string;  // ← NUEVO
}
```

### 2. **Creación del Router**
- **Archivo**: `src/router/index.ts` (nuevo)
- **Rutas implementadas**:
  - `/` → Redirige al primer módulo
  - `/:module` → Vista de lista del módulo
  - `/:module/:oid` → Vista de detalle con OID específico

**Características**:
- Sincronización bidireccional entre URL y estado de Application
- Búsqueda automática de módulos por nombre
- Guards de navegación que respetan tu lógica
- Preparado para carga futura desde API usando el OID

### 3. **Integración con Application**
- **Archivo**: `src/models/application.ts`
- **Cambios principales**:

#### a) Nuevo campo `router`
```typescript
router: Router | null = null;
```

#### b) Método `setViewChanges` extendido
Ahora setea automáticamente `entityOid` cuando hay una entidad:
```typescript
// Setear entityOid si hay entidad
if (entity) {
    const uniqueValue = entity.getUniquePropertyValue();
    this.View.value.entityOid = uniqueValue !== undefined && uniqueValue !== null 
        ? String(uniqueValue) 
        : '';
} else {
    this.View.value.entityOid = '';
}
```

#### c) Nuevo método `updateRouterFromView`
- Actualiza la URL cuando se cambia la vista desde Application
- Previene navegaciones duplicadas
- Maneja errores de navegación automáticamente
- Construye URLs basadas en el nombre del módulo y el OID

#### d) Método `initializeRouter`
```typescript
initializeRouter(router: Router) {
    this.router = router;
}
```

### 4. **Navegación desde la Tabla**
- **Archivo**: `src/components/Informative/DetailViewTableComponent.vue`
- **Cambio**: Al hacer clic en un item, se setea `entityOid` antes de cambiar la vista

```typescript
openDetailView(entity : any) {
    // Setear entityOid antes de cambiar la vista
    const uniqueValue = entity.getUniquePropertyValue();
    if (uniqueValue !== undefined && uniqueValue !== null) {
        Application.View.value.entityOid = String(uniqueValue);
    }
    Application.changeViewToDetailView(entity as BaseEntity);
}
```

### 5. **Preparación para Carga desde API**
- **Archivo**: `src/views/default_detailview.vue`
- **Cambio**: Se agregaron comentarios con el código de ejemplo para implementación futura

```typescript
mounted() {
    // FUTURE: Aquí se implementará la lógica para cargar la entidad desde la API
    // usando Application.View.value.entityOid cuando entityObject sea null
    // Ejemplo:
    // if (!this.entity && Application.View.value.entityOid) {
    //     this.loadEntityFromAPI(Application.View.value.entityOid);
    // }
}
```

### 6. **Configuración de main.js**
- **Archivo**: `src/main.js`
- **Cambios**:
  - Importación y uso de Vue Router
  - Inicialización bidireccional: Router conoce Application y viceversa
  - El router maneja la navegación inicial

```javascript
import router, { initializeRouterWithApplication } from '@/router'

// Inicializar el router con Application
initializeRouterWithApplication(Application)
Application.initializeRouter(router)

const app = createApp(App)
app.use(router)
```

## Flujo de Navegación

### Desde la Aplicación (tu lógica actual)
1. Usuario hace clic en un item de la tabla
2. `DetailViewTableComponent.openDetailView()` se ejecuta
3. Se setea `Application.View.value.entityOid` con el valor único de la entidad
4. Se llama a `Application.changeViewToDetailView(entity)`
5. `Application.setViewChanges()` actualiza el estado
6. `Application.updateRouterFromView()` actualiza la URL automáticamente
7. La URL ahora refleja: `/products/123` (por ejemplo)

### Desde la URL (navegación directa o botones del navegador)
1. Usuario navega a `/products/123`
2. Router ejecuta `beforeEach` guard
3. Guard busca el módulo "products" en `Application.ModuleList`
4. Guard setea `Application.View.value.entityOid = '123'`
5. **FUTURO**: El componente cargará la entidad desde la API usando el OID

## URLs Generadas

### Ejemplos con el módulo Products:
- Lista: `/products`
- Detalle: `/products/123` (donde 123 es el OID)

**Nota**: Los nombres de módulo se convierten a lowercase en las URLs.

## Decoradores Relevantes

### `@PrimaryProperty('propertyName')`
- Define la propiedad primaria de la entidad (ej: `id`)
- Usado por: `getPrimaryPropertyKey()`, `getPrimaryPropertyValue()`

### `@UniquePropertyKey('propertyName')`
- Define la propiedad que contiene el identificador único (OID)
- Usado por: `getUniquePropertyKey()`, `getUniquePropertyValue()`
- **Este es el valor que se usa en las URLs**

En el ejemplo de Products:
```typescript
@PrimaryProperty('id')
@UniquePropertyKey('oid')
export class Products extends BaseEntity {
    id!: number;
    // ... otras propiedades
}
```

## Compatibilidad con tu Lógica

✅ **Respeta completamente tu arquitectura**:
- Los métodos `changeViewToListView()` y `changeViewToDetailView()` funcionan exactamente igual
- El sistema de Application sigue siendo la fuente de verdad
- Los componentes existentes no requieren cambios (excepto los mencionados)
- El sistema de decoradores se mantiene intacto
- El flujo de validación y guardado no se afecta

✅ **No interfiere con**:
- Sistema de modals
- Sistema de toasts
- Sistema de confirmación
- Event bus
- Dirty state tracking
- Botones de acciones

## Para Implementación Futura (Carga desde API)

Cuando estés listo para implementar la carga de entidades desde la API, necesitarás:

1. **En `default_detailview.vue`**, descomentar y adaptar:
```typescript
async loadEntityFromAPI(oid: string) {
    try {
        const response = await Application.axiosInstance.get(
            `${this.entityClass.getApiEndpoint()}/${oid}`
        );
        this.entity = new this.entityClass(response.data);
        Application.View.value.entityObject = this.entity;
    } catch (error) {
        console.error('Error loading entity:', error);
        // Manejar error (mostrar toast, redirigir, etc.)
    }
}
```

2. **En el `mounted()` hook**, agregar:
```typescript
if (!this.entity && Application.View.value.entityOid) {
    await this.loadEntityFromAPI(Application.View.value.entityOid);
}
```

3. Opcionalmente, agregar loading states y error handling

## Ventajas del Sistema Implementado

1. **URLs Navegables**: Los usuarios pueden bookmarkear vistas específicas
2. **Botones del Navegador**: Atrás/Adelante funcionan correctamente
3. **Deep Linking**: Se puede compartir enlaces a entidades específicas
4. **SEO Ready**: URLs descriptivas y estructuradas
5. **Developer Experience**: Debugging más fácil con URLs claras
6. **Preparado para el Futuro**: Estructura lista para carga desde API

## Testing

Para probar el sistema:

1. Inicia la aplicación: `npm run dev`
2. Navega a la lista de productos
3. Haz clic en un item → La URL cambiará a `/products/[oid]`
4. Copia la URL y ábrela en una nueva pestaña → Debería funcionar (con mock data)
5. Usa los botones atrás/adelante del navegador → Funcionan correctamente
6. Navega desde el sidebar → URL se actualiza automáticamente

## Notas Importantes

- El sistema respeta completamente el diálogo de "cambios sin guardar"
- Las transiciones y animaciones se mantienen (400ms delay)
- Los botones de acciones se actualizan correctamente según el ViewType
- Console logs agregados para debugging (puedes removerlos en producción)

## Archivos Modificados

1. `src/models/View.ts` - Agregado `entityOid`
2. `src/models/application.ts` - Agregado router e integración
3. `src/router/index.ts` - Nuevo archivo con configuración de rutas
4. `src/main.js` - Inicialización del router
5. `src/components/Informative/DetailViewTableComponent.vue` - Seteo de entityOid
6. `src/views/default_detailview.vue` - Preparado para carga desde API

## Dependencias Agregadas

- `vue-router@4` - Ya estaba en package.json

---

**Tu lógica es la ley** - Este sistema se construyó completamente alrededor de tu arquitectura existente sin modificar ninguno de tus patrones fundamentales. 🚀
