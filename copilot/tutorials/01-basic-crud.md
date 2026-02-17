# Tutorial 1: CRUD Básico - Implementación de Módulo Completo

## 1. Propósito

Este tutorial proporciona instrucciones paso a paso para implementar un módulo CRUD completo y funcional utilizando el framework. El tutorial guía al desarrollador a través de la creación de una entidad Book (Libro) con todas las funcionalidades necesarias para operaciones de persistencia, validación y gestión de datos.

### Objetivos de Aprendizaje

El desarrollador implementará:
- Lista de registros con sistema de paginación automática
- Formulario de creación y edición de entidades
- Sistema de validaciones básicas integrado
- Mecanismo de persistencia con backend simulado
- Sistema de navegación automática entre vistas

Duración estimada de implementación: 15-20 minutos

## 2. Alcance

### Incluye

- Implementación completa de entidad Book heredando de BaseEntity
- Configuración de decoradores de clase y propiedades
- Registro de módulo en Application singleton
- Implementación de Mock Service Worker para simulación de backend
- Configuración de validaciones síncronas básicas
- Implementación de formateo de datos y organización de UI
- Operaciones CRUD completas (Create, Read, Update, Delete)

### No Incluye

- Validaciones asíncronas con servidor real
- Relaciones entre entidades (ver Tutorial 03-relations.md)
- Personalización avanzada de componentes UI
- Implementación de backend real
- Gestión de permisos y autenticación
- Optimizaciones de rendimiento para grandes volúmenes de datos

## 3. Definiciones Clave

### Términos Fundamentales

**BaseEntity**: Clase base abstracta que proporciona funcionalidad CRUD, sistema de validación, serialización, y gestión de estado para todas las entidades del framework.

**Decorador de Clase**: Función TypeScript que agrega metadatos a nivel de clase para configurar comportamiento del módulo (ModuleName, ModuleIcon, ApiEndpoint, Persistent).

**Decorador de Propiedad**: Función TypeScript que agrega metadatos a propiedades individuales para configurar visualización, validación y comportamiento (PropertyIndex, PropertyName, Required, Validation).

**Application Singleton**: Instancia única global que gestiona la lista de módulos, configuración de Axios, sistema de eventos, y estado de la aplicación.

**Mock Service Worker (MSW)**: Biblioteca que intercepta peticiones HTTP a nivel de service worker para simular respuestas de API sin servidor real.

**ModuleList**: Array reactivo en Application que contiene las clases de entidades registradas, utilizado para generación automática de menú y rutas.

**PropertyIndex**: Decorador que define el orden de aparición de propiedades en formularios y tablas mediante valor numérico.

**ViewGroup**: Decorador que agrupa propiedades relacionadas en secciones colapsables del formulario.

## 4. Descripción Técnica

### Arquitectura del Sistema CRUD

El framework implementa un patrón de arquitectura basado en metadatos donde los decoradores definen la configuración de entidades, y los componentes genéricos leen estos metadatos para generar automáticamente la interfaz de usuario.

### Componentes Principales

**Capa de Entidad**
```typescript
@ModuleName('Books')
@ModuleIcon('book')
@ApiEndpoint('/api/books')
@Persistent()
export class Book extends BaseEntity {
    // Propiedades con decoradores
}
```

Los decoradores de clase configuran:
- Nombre del módulo para UI
- Icono del módulo en menú lateral
- Endpoint base para operaciones HTTP
- Persistencia habilitada con clave primaria

**Sistema de Decoradores de Propiedades**

`@PropertyIndex(n)`: Establece orden numérico de visualización (1, 2, 3...).

`@PropertyName('Label', Type)`: Define etiqueta visible y tipo de dato (String, Number, Date, Class).

`@Required(true)`: Marca campo como obligatorio, activando validación automática pre-guardado.

`@Validation(fn, message)`: Agrega validación síncrona personalizada con función y mensaje de error.

`@DisplayFormat(fn)`: Aplica función de formateo para visualización en listas (ejemplo: formateo de moneda).

`@HelpText(text)`: Agrega texto de ayuda contextual debajo del campo en formularios.

`@ViewGroup(name)`: Organiza campos en secciones colapsables con nombre especificado.

### Sistema de Registro de Módulos

```typescript
const Application = ApplicationClass.getInstance();
Application.ModuleList.value.push(Book);
```

El registro agrega la clase al array reactivo ModuleList, lo que activa:
- Generación automática de entrada en menú lateral
- Habilitación de rutas genéricas `/:module` y `/:module/:oid`
- Disponibilidad del módulo en lookups y relaciones

### Mock Backend con MSW

MSW intercepta peticiones HTTP mediante service worker, permitiendo desarrollo sin backend:

```typescript
export const handlers = [
    rest.get('/api/books', (req, res, ctx) => res(ctx.json(books))),
    rest.post('/api/books', async (req, res, ctx) => { /* crear */ }),
    rest.put('/api/books/:id', async (req, res, ctx) => { /* actualizar */ }),
    rest.delete('/api/books/:id', (req, res, ctx) => { /* eliminar */ })
];
```

### Flujo de Operación CRUD

**Create**: POST a endpoint con datos serializados → Backend retorna entidad con ID → Actualización de lista.

**Read**: GET a endpoint → Deserialización automática a instancias de clase → Renderizado en tabla.

**Update**: PUT a endpoint/:id con datos modificados → Backend retorna entidad actualizada → Actualización de estado.

**Delete**: DELETE a endpoint/:id → Backend confirma eliminación → Remoción de lista y navegación.

## 5. Flujo de Funcionamiento

### Secuencia de Inicialización del Módulo

```
1. Definición de Entidad
   ├─ Crear archivo src/entities/book.ts
   ├─ Extender BaseEntity
   ├─ Aplicar decoradores de clase
   └─ Definir propiedades con decoradores

2. Registro en Application
   ├─ Import de clase Book en application.ts
   └─ Push a Application.ModuleList.value

3. Generación Automática
   ├─ Menú lateral lee ModuleList y crea entradas
   ├─ Router genérico habilita rutas /:module
   └─ Componente detecta módulo y renderiza vista

4. Interacción Usuario
   ├─ Click en menú → Navegación a /books
   ├─ Vista lista renderiza tabla con getElementList()
   └─ Click "New" → Navegación a /books/new
```

### Flujo de Guardado de Entidad

```
Usuario completa formulario → Click "Save"
    ↓
BaseEntity.save() ejecuta
    ↓
validatePersistenceConfiguration()
    ├─ Verifica @Persistent presente
    ├─ Verifica @ApiEndpoint configurado
    └─ Verifica clave primaria definida
    ↓
validateInputs()
    ├─ Emite evento 'validate-inputs'
    ├─ Cada input ejecuta validaciones Required
    ├─ Ejecuta validaciones Validation síncronas
    └─ Ejecuta validaciones AsyncValidation (si existen)
    ↓
¿Todas validaciones pasan?
    ├─ NO → Detiene guardado, muestra errores en campos
    └─ SÍ → Continúa
        ↓
        Serialización de datos
        ├─ Convierte instancia a objeto plano
        └─ Aplica transformaciones según decoradores
        ↓
        HTTP Request
        ├─ Nuevo: POST /api/books con body
        └─ Existente: PUT /api/books/:id con body
        ↓
        Respuesta Backend
        ├─ 200/201: Deserialización de respuesta
        ├─ Actualización de estado interno
        ├─ Toast de éxito
        └─ Navegación a lista
        
        └─ 4xx/5xx: Captura error
            ├─ Toast de error con mensaje
            └─ Formulario permanece abierto
```

### Flujo de Validación

```
Trigger de Validación (Save o manual)
    ↓
entity.validateInputs()
    ↓
Para cada propiedad:
    ↓
    NIVEL 1: isRequired()
    ├─ Lee metadata de @Required
    ├─ Si es función: evalúa función con entidad
    ├─ Si es boolean true: verifica valor no vacío
    └─ Falla → validated = false, agrega mensaje
    ↓
    NIVEL 2: isValidation()
    ├─ Lee metadata de @Validation
    ├─ Ejecuta función síncrona con entidad
    ├─ Retorna boolean
    └─ Falla → validated = false, agrega mensaje
    ↓
    NIVEL 3: isAsyncValidation()
    ├─ Lee metadata de @AsyncValidation
    ├─ Ejecuta función asíncrona con entidad
    ├─ Await resultado
    └─ Falla → validated = false, agrega mensaje
    ↓
Agrega validationMessages a componente
    ↓
Renderiza errores en UI
```

### Flujo de Mock Backend

```
Frontend emite HTTP Request
    ↓
Service Worker intercepta
    ↓
MSW handler coincide con ruta
    ↓
Ejecuta lógica de handler
    ├─ GET: Retorna array/objeto de memoria
    ├─ POST: Agrega a array, genera ID
    ├─ PUT: Actualiza item en array
    └─ DELETE: Remueve item de array
    ↓
Service Worker retorna response
    ↓
Frontend procesa como response real
```

## 6. Reglas Obligatorias

### Reglas de Definición de Entidad

1. Toda entidad CRUD DEBE extender BaseEntity.
2. Toda entidad persistente DEBE tener decorador @Persistent con clave primaria.
3. Toda entidad persistente DEBE tener decorador @ApiEndpoint con ruta base.
4. Toda entidad DEBE tener decorador @ModuleName con nombres singular y plural.
5. Toda propiedad visible DEBE tener decorador @PropertyIndex con valor numérico único.
6. Toda propiedad visible DEBE tener decorador @PropertyName con etiqueta y tipo.
7. El decorador @Required DEBE aplicarse solo a propiedades con tipo no opcional (!).
8. Los valores de PropertyIndex DEBEN ser secuenciales comenzando en 1.

### Reglas de Registro

1. El módulo DEBE registrarse en Application.ModuleList.value mediante push.
2. El registro DEBE ocurrir después de todos los imports en application.ts.
3. La clase registrada DEBE ser la clase de entidad, no una instancia.
4. El orden de push determina el orden en menú lateral.

### Reglas de Validación

1. Las validaciones @Required se ejecutan ANTES que @Validation.
2. Las validaciones @Validation se ejecutan ANTES que @AsyncValidation.
3. Las funciones de validación DEBEN retornar boolean (true = válido, false = inválido).
4. Los mensajes de error DEBEN ser strings descriptivos del problema.
5. Las funciones de @Validation NO DEBEN ser asíncronas.
6. Las funciones de @AsyncValidation DEBEN ser asíncronas y retornar Promise<boolean>.

### Reglas de Mock Backend

7. Los handlers DEBEN coincidir exactamente con las rutas de @ApiEndpoint.
2. Los IDs generados DEBEN ser únicos e incrementales.
3. Las respuestas POST DEBEN retornar status 201 con objeto creado incluyendo ID.
4. Las respuestas GET DEBEN retornar status 200 con array o objeto.
5. Las respuestas PUT DEBEN retornar status 200 con objeto actualizado.
6. Las respuestas DELETE DEBEN retornar status 200 con confirmación.
7. Los handlers DEBEN retornar 404 cuando el recurso no existe.

## 7. Prohibiciones

### Prohibiciones de Arquitectura

1. NO modificar BaseEntity directamente para agregar funcionalidad específica de entidad.
2. NO crear rutas específicas para módulos que usen el sistema genérico.
3. NO instanciar Application múltiples veces. Usar singleton existente.
4. NO modificar ModuleList directamente sin usar push o métodos de array.
5. NO agregar lógica de negocio en decoradores. Decoradores solo almacenan metadatos.

### Prohibiciones de Implementación

1. NO omitir @PropertyIndex en propiedades visibles. Resultado: orden impredecible.
2. NO usar mismo valor de PropertyIndex en múltiples propiedades. Resultado: colisiones.
3. NO aplicar @Required a propiedades con tipo opcional (?). Resultado: inconsistencia.
4. NO usar async functions en @Validation. Usar @AsyncValidation en su lugar.
5. NO hardcodear valores en getters. Usar @DefaultProperty para valores default.
6. NO modificar directamente validationMessages array. Usar métodos de validación.

### Prohibiciones de UI

1. NO crear componentes personalizados para campos simples sin necesidad demostrada.
2. NO sobreescribir estilos globales de validación sin considerar impacto en otros módulos.
3. NO deshabilitar validaciones del lado cliente para mejorar UX. Backend debe validar también.
4. NO usar ViewGroups excesivamente. Máximo 4-5 grupos por formulario.

## 8. Dependencias

### Dependencias de Código

**Obligatorias:**
- `BaseEntity` de `@/entities/base_entity` - Clase base para todas las entidades
- Decoradores de `@/decorations/index` - Sistema de metadatos
- `Application` de `@/models/application` - Singleton de aplicación

**Opcionales:**
- `msw` (npm package) - Mock Service Worker para simulación de backend
- Constantes de `@/constants/icons` - Definiciones de iconos Material Design
- Enums de `@/enums/*` - Tipos enumerados para configuración

### Dependencias de Framework

- Vue 3.x - Framework de UI
- TypeScript 4.x+ - Soporte de decoradores experimentales
- Vite - Build tool y dev server
- Axios - Cliente HTTP (integrado en Application)

### Configuración Requerida

**tsconfig.json** debe incluir:
```json
{
  "experimentalDecorators": true,
  "emitDecoratorMetadata": true
}
```

## 9. Relaciones

### Relaciones con Otros Tutoriales

**Tutorial 02 (Validaciones)**: Extiende las validaciones básicas de este tutorial con:
- AsyncValidation para verificación en servidor
- Validaciones condicionales complejas
- Validaciones cross-field

**Tutorial 03 (Relaciones)**: Construye sobre este tutorial agregando:
- Objetos anidados con ObjectInputComponent
- Arrays de entidades con ArrayInputComponent
- Lookups y selección de entidades relacionadas

### Relaciones con Capas del Framework

**Capa de Decoradores (01-decorators/)**: Este tutorial utiliza decoradores documentados en:
- property-name-decorator.md
- required-decorator.md
- validation-decorator.md
- module-name-decorator.md
- api-endpoint-decorator.md

**Capa de Base Entity (02-base-entity/)**: Hereda funcionalidad de:
- crud-operations.md - Métodos save(), update(), delete()
- validation-system.md - Sistema de 3 niveles de validación
- state-and-conversion.md - Conversión entre instancias y JSON

**Capa de Componentes (04-components/)**: Genera automáticamente:
- TextInputComponent para campos String
- NumberInputComponent para campos Number
- default_detail_view.vue para formulario
- default_list_view.vue para tabla

**Capa de Application (03-application/)**: Integra con:
- ModuleList para registro
- Router genérico para navegación
- ApplicationUIService para toasts y modales

## 10. Notas de Implementación

### Requisitos Previos de Entorno

**Conocimientos Técnicos Necesarios:**
- TypeScript: Sintaxis básica, tipos, interfaces
- Vue 3 Composition API: Conceptos básicos de reactividad
- Decoradores: Comprensión conceptual (no requerido dominio profundo)

**Configuración de Entorno:**
- Proyecto plantilla_saas_vue clonado en sistema local
- Dependencias instaladas mediante `npm install`
- Servidor de desarrollo ejecutándose con `npm run dev`

### Paso 1: Creación de Archivo de Entidad

Crear archivo `src/entities/book.ts` con la siguiente implementación:

```typescript
import { BaseEntity } from './base_entity';
import {
    PropertyName,
    PropertyIndex,
    Required,
    ModuleName,
    ModuleIcon,
    ApiEndpoint,
    Persistent
} from '@/decorations';

@ModuleName('Books')                   // Nombre del módulo
@ModuleIcon('book')                    // Icono en menú (MDI icon name)
@ApiEndpoint('/api/books')             // URL para CRUD
@Persistent()                          // Habilitar persistencia
export class Book extends BaseEntity {
    // Propiedad 1: ID (autogenerado)
    @PropertyIndex(1)
    @PropertyName('ID', Number)
    id?: number;

    // Propiedad 2: Título (requerido)
    @PropertyIndex(2)
    @PropertyName('Title', String)
    @Required(true)
    title!: string;

    // Propiedad 3: Autor (requerido)
    @PropertyIndex(3)
    @PropertyName('Author', String)
    @Required(true)
    author!: string;

    // Propiedad 4: ISBN (requerido)
    @PropertyIndex(4)
    @PropertyName('ISBN', String)
    @Required(true)
    isbn!: string;

    // Propiedad 5: Año de publicación (opcional)
    @PropertyIndex(5)
    @PropertyName('Publication Year', Number)
    publicationYear?: number;

    // Propiedad 6: Páginas (opcional)
    @PropertyIndex(6)
    @PropertyName('Pages', Number)
    pages?: number;

    // Propiedad 7: Precio (opcional)
    @PropertyIndex(7)
    @PropertyName('Price', Number)
    price?: number;
}
```

**Análisis de Decoradores de Clase:**

`@ModuleName('Books')`: Define nombre del módulo que aparecerá en UI y menú de navegación.

`@ModuleIcon('book')`: Especifica icono Material Design para menú lateral. Referencia MDI icon name sin prefijo.

`@ApiEndpoint('/api/books')`: Define URL base para operaciones CRUD. Todas las peticiones HTTP usarán este endpoint como prefijo.

`@Persistent()`: Activa sistema de persistencia habilitando operaciones CRUD con backend mediante API REST.

**Análisis de Decoradores de Propiedades:**

`@PropertyIndex(n)`: Define secuencia de visualización en formularios y tablas mediante orden numérico ascendente.

`@PropertyName('Label', Type)`: Establece etiqueta visible en UI y tipo de dato para determinación automática de componente de input.

`@Required(true)`: Marca propiedad como obligatoria, activando validación automática que previene guardado si campo está vacío.

### Paso 2: Registro del Módulo en Application

Editar archivo `src/models/application.ts` agregando import y registro:

```typescript
// Al final de src/models/application.ts
import { Products } from '@/entities/products';
import { Book } from '@/entities/book';  // Agregar import

const Application = ApplicationClass.getInstance();

// Registrar módulos
Application.ModuleList.value.push(Products);
Application.ModuleList.value.push(Book);  // Agregar registro

export default Application;
export { Application };
```

**Mecanismo de Registro:**

El método `push()` agrega la clase Book al array reactivo ModuleList. Este registro desencadena:
- Generación automática de entrada en menú lateral mediante lectura de metadatos
- Habilitación de rutas genéricas que funcionan para todos los módulos registrados
- No requiere creación de rutas específicas ni configuración adicional de router

**Alternativa de Registro Múltiple:**

```typescript
Application.ModuleList.value.push(Products, Book, Customer, Order);
```

### Paso 3: Implementación de Mock Backend

**Instalación de Mock Service Worker:**

```bash
npm install msw --save-dev
```

**Creación de Handlers:**

Crear archivo `src/mocks/handlers.ts`:

```typescript
import { rest } from 'msw';

// Base de datos en memoria
let books: any[] = [
    {
        id: 1,
        title: 'Clean Code',
        author: 'Robert C. Martin',
        isbn: '978-0132350884',
        publicationYear: 2008,
        pages: 464,
        price: 39.99
    },
    {
        id: 2,
        title: 'The Pragmatic Programmer',
        author: 'Andrew Hunt & David Thomas',
        isbn: '978-0135957059',
        publicationYear: 2019,
        pages: 352,
        price: 44.99
    }
];

let nextId = 3;

export const handlers = [
    rest.get('/api/books', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(books));
    }),

    rest.get('/api/books/:id', (req, res, ctx) => {
        const { id } = req.params;
        const book = books.find(b => b.id === parseInt(id as string));
        
        if (!book) {
            return res(ctx.status(404), ctx.json({ error: 'Book not found' }));
        }
        
        return res(ctx.status(200), ctx.json(book));
    }),

    rest.post('/api/books', async (req, res, ctx) => {
        const data = await req.json();
        
        const newBook = {
            id: nextId++,
            ...data
        };
        
        books.push(newBook);
        
        return res(ctx.status(201), ctx.json(newBook));
    }),

    rest.put('/api/books/:id', async (req, res, ctx) => {
        const { id } = req.params;
        const data = await req.json();
        
        const index = books.findIndex(b => b.id === parseInt(id as string));
        
        if (index === -1) {
            return res(ctx.status(404), ctx.json({ error: 'Book not found' }));
        }
        
        books[index] = { ...books[index], ...data };
        
        return res(ctx.status(200), ctx.json(books[index]));
    }),

    rest.delete('/api/books/:id', (req, res, ctx) => {
        const { id } = req.params;
        
        const index = books.findIndex(b => b.id === parseInt(id as string));
        
        if (index === -1) {
            return res(ctx.status(404), ctx.json({ error: 'Book not found' }));
        }
        
        books.splice(index, 1);
        
        return res(ctx.status(200), ctx.json({ success: true }));
    })
];
```

**Inicialización de Service Worker:**

Crear archivo `src/mocks/browser.ts`:

```typescript
import { setupWorker } from 'msw';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
```

**Activación en Modo Desarrollo:**

Editar `src/main.js`:

```javascript
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import Application from './models/application';

// Importar entidades
import { Product } from './entities/products';
import { Book } from './entities/book';

// Iniciar mock en desarrollo
if (import.meta.env.DEV) {
    import('./mocks/browser').then(({ worker }) => {
        worker.start();
    });
}

// ... resto del código
```

### Paso 4: Verificación de Implementación

**Iniciar Servidor de Desarrollo:**

```bash
npm run dev
```

**Verificación de Menú Lateral:**

Navegar a `http://localhost:5173`. El menú lateral debe mostrar:

```
├─ Products
├─ Books        [Nueva entrada]
```

**Verificación de Vista de Lista:**

Hacer click en "Books". La interfaz generada automáticamente mostrará tabla con columnas basadas en PropertyIndex y PropertyName.

**Operación de Creación:**

1. Click en botón "New Book"
2. Completar formulario con datos de prueba:
   - Title: The Phoenix Project
   - Author: Gene Kim
   - ISBN: 978-1942788294
   - Publication Year: 2013
   - Pages: 432
   - Price: 29.99
3. Click en botón "Save"
4. Verificar que el nuevo libro aparece en la lista

**Operación de Edición:**

1. Click en cualquier fila de la tabla
2. Modificar valores de campos (ejemplo: actualizar precio)
3. Click en botón "Save"
4. Verificar que los cambios se reflejan en la lista

**Operación de Eliminación:**

1. Click en un libro para acceder a vista de detalle
2. Click en botón "Delete"
3. Confirmar la operación en modal de confirmación
4. Verificar que el libro desaparece de la lista

### Paso 5: Implementación de Validaciones

**Validación de Rango Numérico:**

Modificar propiedad `pages` en `src/entities/book.ts`:

```typescript
import { Validation } from '@/decorations';  // Agregar import

@PropertyIndex(6)
@PropertyName('Pages', Number)
@Validation(
    (entity) => !entity.pages || (entity.pages > 0 && entity.pages < 10000),
    'Pages must be between 1 and 10,000'
)
pages?: number;
```

**Prueba de Validación:** Intentar crear libro con -5 páginas o 50000 páginas. El sistema debe prevenir el guardado y mostrar mensaje de error.

**Validación de Formato con Expresión Regular:**

Modificar propiedad `isbn`:

```typescript
@PropertyIndex(4)
@PropertyName('ISBN', String)
@Required(true)
@Validation(
    (entity) => /^(978|979)-?\d{1,5}-?\d{1,7}-?\d{1,7}-?\d{1}$/.test(entity.isbn),
    'Invalid ISBN format (expected: 978-0-123456-78-9)'
)
isbn!: string;
```

**Prueba de Validación:** Intentar crear libro con ISBN "123ABC". El sistema debe mostrar error de formato.

**Validación de Valor Positivo:**

Modificar propiedad `price`:

```typescript
@PropertyIndex(7)
@PropertyName('Price', Number)
@Validation(
    (entity) => !entity.price || entity.price > 0,
    'Price must be positive'
)
price?: number;
```

### Paso 6: Mejoras de Interfaz de Usuario

**Formateo de Visualización para Moneda:**

```typescript
import { DisplayFormat } from '@/decorations';  // Agregar import

@PropertyIndex(7)
@PropertyName('Price', Number)
@DisplayFormat((value) => value ? `$${value.toFixed(2)}` : '-')
@Validation(
    (entity) => !entity.price || entity.price > 0,
    'Price must be positive'
)
price?: number;
```

Resultado: La lista mostrará valores como `$39.99` en lugar de `39.99`.

**Texto de Ayuda Contextual:**

```typescript
import { HelpText } from '@/decorations';  // Agregar import

@PropertyIndex(4)
@PropertyName('ISBN', String)
@Required(true)
@HelpText('International Standard Book Number (format: 978-0-123456-78-9)')
@Validation(
    (entity) => /^(978|979)-?\d{1,5}-?\d{1,7}-?\d{1,7}-?\d{1}$/.test(entity.isbn),
    'Invalid ISBN format (expected: 978-0-123456-78-9)'
)
isbn!: string;
```

Resultado: Aparece texto descriptivo debajo del campo ISBN en el formulario.

**Organización con ViewGroups:**

```typescript
import { ViewGroup } from '@/decorations';  // Agregar import

// Grupo: Información Básica
@PropertyIndex(2)
@PropertyName('Title', String)
@ViewGroup('Basic Information')
@Required(true)
title!: string;

@PropertyIndex(3)
@PropertyName('Author', String)
@ViewGroup('Basic Information')
@Required(true)
author!: string;

@PropertyIndex(4)
@PropertyName('ISBN', String)
@ViewGroup('Basic Information')
@Required(true)
@HelpText('International Standard Book Number (format: 978-0-123456-78-9)')
@Validation(
    (entity) => /^(978|979)-?\d{1,5}-?\d{1,7}-?\d{1,7}-?\d{1}$/.test(entity.isbn),
    'Invalid ISBN format'
)
isbn!: string;

// Grupo: Detalles de Publicación
@PropertyIndex(5)
@PropertyName('Publication Year', Number)
@ViewGroup('Publication Details')
publicationYear?: number;

@PropertyIndex(6)
@PropertyName('Pages', Number)
@ViewGroup('Publication Details')
@Validation(
    (entity) => !entity.pages || (entity.pages > 0 && entity.pages < 10000),
    'Pages must be between 1 and 10,000'
)
pages?: number;

// Grupo: Pricing
@PropertyIndex(7)
@PropertyName('Price', Number)
@ViewGroup('Pricing')
@DisplayFormat((value) => value ? `$${value.toFixed(2)}` : '-')
@Validation(
    (entity) => !entity.price || entity.price > 0,
    'Price must be positive'
)
price?: number;
```

Resultado: El formulario se organiza en 3 secciones colapsables.

### Implementación Completa Final

**Código Completo de src/entities/book.ts:**

```typescript
import { BaseEntity } from './base_entity';
import {
    PropertyName,
    PropertyIndex,
    Required,
    Validation,
    DisplayFormat,
    HelpText,
    ViewGroup,
    ModuleName,
    ModuleIcon,
    ApiEndpoint,
    Persistent
} from '@/decorations';

@ModuleName('Books')
@ModuleIcon('book')
@ApiEndpoint('/api/books')
@Persistent()
export class Book extends BaseEntity {
    @PropertyIndex(1)
    @PropertyName('ID', Number)
    id?: number;

    @PropertyIndex(2)
    @PropertyName('Title', String)
    @ViewGroup('Basic Information')
    @Required(true)
    title!: string;

    @PropertyIndex(3)
    @PropertyName('Author', String)
    @ViewGroup('Basic Information')
    @Required(true)
    author!: string;

    @PropertyIndex(4)
    @PropertyName('ISBN', String)
    @ViewGroup('Basic Information')
    @Required(true)
    @HelpText('International Standard Book Number (format: 978-0-123456-78-9)')
    @Validation(
        (entity) => /^(978|979)-?\d{1,5}-?\d{1,7}-?\d{1,7}-?\d{1}$/.test(entity.isbn),
        'Invalid ISBN format (expected: 978-0-123456-78-9)'
    )
    isbn!: string;

    @PropertyIndex(5)
    @PropertyName('Publication Year', Number)
    @ViewGroup('Publication Details')
    publicationYear?: number;

    @PropertyIndex(6)
    @PropertyName('Pages', Number)
    @ViewGroup('Publication Details')
    @Validation(
        (entity) => !entity.pages || (entity.pages > 0 && entity.pages < 10000),
        'Pages must be between 1 and 10,000'
    )
    pages?: number;

    @PropertyIndex(7)
    @PropertyName('Price', Number)
    @ViewGroup('Pricing')
    @DisplayFormat((value) => value ? `$${value.toFixed(2)}` : '-')
    @Validation(
        (entity) => !entity.price || entity.price > 0,
        'Price must be positive'
    )
    price?: number;
}
```

### Funcionalidades Implementadas

- CRUD completo (Create, Read, Update, Delete)
- Lista con columnas automáticas generadas desde metadatos
- Formulario de detalle automático basado en decoradores
- Validaciones de campos requeridos
- Validaciones de formato (ISBN mediante regex)
- Validaciones de rango (páginas, precio)
- Formato de display con símbolo de moneda
- Textos de ayuda contextual
- Organización en grupos colapsables
- Navegación automática entre vistas
- Menú lateral automático
- Persistencia simulada mediante Mock Service Worker

### Conceptos Técnicos Fundamentales

**Principio: Define Once Works Everywhere**

La definición de entidad mediante decoradores ocurre una sola vez, generando automáticamente:
- Formulario completo con campos tipados
- Lista/tabla con columnas apropiadas
- Sistema de validaciones integrado
- Navegación entre vistas
- Operaciones CRUD completas

**Decoradores como Sistema de Metadatos**

Los decoradores no ejecutan lógica directamente. Almacenan información en metadata que el framework lee en runtime para:
- Determinar tipo de componente a renderizar
- Configurar validaciones a ejecutar
- Establecer orden de visualización
- Definir formato de datos

**BaseEntity como Motor de Funcionalidad**

La extensión de BaseEntity proporciona:

Métodos CRUD:
- `save()`: Crear o actualizar según existencia de ID
- `update()`: Actualización específica
- `delete()`: Eliminación con confirmación
- `getElementList()`: Obtención de lista
- `getElement()`: Obtención de elemento individual

Sistema de Validación:
- Validación en 3 niveles (Required, Sync, Async)
- Gestión de mensajes de error
- Estado de validación por propiedad

Gestión de Estado:
- Serialización y deserialización automática
- Dirty tracking para cambios
- Original state para comparación
- Hooks de ciclo de vida

**Application como Orquestador Central**

El singleton Application gestiona:
- Lista de módulos registrados (ModuleList)
- Instancia de Axios configurada
- Event bus para comunicación entre componentes
- Estado global de la aplicación
- Servicio de UI (toasts, modales, confirmaciones)

### Próximos Pasos Sugeridos

**Tutorial 02 (Validaciones Avanzadas):**
- AsyncValidation para verificación de unicidad en servidor
- Validaciones condicionales complejas
- Validaciones entre múltiples campos (cross-field)

**Tutorial 03 (Relaciones entre Entidades):**
- ObjectInput para relaciones uno a uno
- ArrayInput para relaciones uno a muchos
- Cascading saves en relaciones

**Tutorial 04 (Customización de UI):**
- Componentes personalizados
- ModuleDefaultComponent custom
- ModuleListComponent y ModuleDetailComponent personalizados

**Tutorial 05 (Patrones Avanzados):**
- Lifecycle hooks (beforeSave, afterSave)
- Entity managers
- Soft deletes
- Auditing (createdAt, updatedAt, createdBy)

### Troubleshooting

**Problema Módulo no aparece en menú:**

Causa: Falta de registro en ModuleList.  
Solución: Verificar que `Application.ModuleList.value.push(Book)` existe en `src/models/application.ts`.

**Problema: Error "No API endpoint defined":**

Causa: Decorador @ApiEndpoint faltante o incorrecto.  
Solución: Agregar `@ApiEndpoint('/api/books')` a la clase Book.

**Problema: No se puede guardar entidad:**

Causa: Validaciones fallando o configuración de persistencia incorrecta.  
Solución:
1. Verificar decoradores @Required aplicados correctamente
2. Confirmar @Persistent presente en clase
3. Revisar que clave primaria está definida

**Problema: Validación no funciona:**

Causa: Import incorrecto o función de validación con error.  
Solución:
1. Verificar import de Validation desde @/decorations
2. Confirmar que función de validación retorna boolean
3. Verificar que la función no es asíncrona (usar @AsyncValidation para casos async)

**Problema: Mock no intercepta peticiones:**

Causa: MSW no inicializado correctamente.  
Solución:
1. Verificar que `worker.start()` se ejecuta en main.js
2. Confirmar que inicialización ocurre antes de montaje de app
3. Verificar que rutas en handlers coinciden con @ApiEndpoint

## 11. Referencias Cruzadas

### Documentación del Framework

**Guías Fundamentales:**
- [../01-FRAMEWORK-OVERVIEW.md](../01-FRAMEWORK-OVERVIEW.md) - Conceptos arquitectónicos completos del framework
- [../03-QUICK-START.md](../03-QUICK-START.md) - Guía de inicio rápido para desarrolladores

**Capas de Decoradores:**
- [../layers/01-decorators/property-name-decorator.md](../layers/01-decorators/property-name-decorator.md) - Especificación de @PropertyName
- [../layers/01-decorators/required-decorator.md](../layers/01-decorators/required-decorator.md) - Especificación de @Required
- [../layers/01-decorators/validation-decorator.md](../layers/01-decorators/validation-decorator.md) - Especificación de @Validation
- [../layers/01-decorators/module-name-decorator.md](../layers/01-decorators/module-name-decorator.md) - Especificación de @ModuleName
- [../layers/01-decorators/api-endpoint-decorator.md](../layers/01-decorators/api-endpoint-decorator.md) - Especificación de @ApiEndpoint

**Capa de Base Entity:**
- [../layers/02-base-entity/crud-operations.md](../layers/02-base-entity/crud-operations.md) - Métodos CRUD de BaseEntity
- [../layers/02-base-entity/validation-system.md](../layers/02-base-entity/validation-system.md) - Sistema de validación de 3 niveles
- [../layers/02-base-entity/state-and-conversion.md](../layers/02-base-entity/state-and-conversion.md) - Serialización y deserialización

### Ejemplos de Referencia

- [../examples/classic-module-example.md](../examples/classic-module-example.md) - Ejemplo completo de módulo clásico de inventario

### Tutoriales Relacionados

**Tutorial Siguiente:**
- [02-validations.md](02-validations.md) - Sistema avanzado de validaciones síncronas y asíncronas

**Tutoriales Posteriores:**
- [03-relations.md](03-relations.md) - Trabajo con relaciones entre entidades (ObjectInput, ArrayInput)

### Enlaces Externos

**Tecnologías Utilizadas:**
- Vue 3 Documentation: https://vuejs.org/
- TypeScript Decorators: https://www.typescriptlang.org/docs/handbook/decorators.html
- Mock Service Worker: https://mswjs.io/
- Material Design Icons: https://materialdesignicons.com/

### Fecha y Versión

Última actualización: 11 de Febrero, 2026  
Versión del documento: 2.0.0  
Estado: Completo
