# 📘 Tutorial 1: CRUD Básico - Crear Tu Primer Módulo

**Referencias:**
- `../01-FRAMEWORK-OVERVIEW.md` - Conceptos generales
- `../03-QUICK-START.md` - Inicio rápido
- `../layers/01-decorators/property-name-decorator.md` - PropertyName
- `../layers/01-decorators/required-decorator.md` - Required
- `../examples/classic-module-example.md` - Ejemplo completo

---

## 🎯 Objetivo

Al completar este tutorial, habrás creado un módulo CRUD completo y funcional para gestionar una entidad **Book** (Libro), con:

- ✅ Lista de registros con paginación
- ✅ Formulario de creación/edición
- ✅ Validaciones básicas
- ✅ Persistencia en backend (simulado)
- ✅ Navegación automática

**Tiempo estimado:** 15-20 minutos

---

## 📋 Requisitos Previos

### 1. Conocimientos
- TypeScript básico
- Vue 3 Composition API (básico)
- Concepto de decoradores (no es necesario dominarlos)

### 2. Entorno
- Proyecto plantilla_saas_vue clonado
- Dependencias instaladas (`npm install`)
- Servidor de desarrollo corriendo (`npm run dev`)

---

## 🚀 Paso 1: Crear la Entidad

### 1.1 Crear Archivo de Entidad

Crea el archivo `src/entities/book.ts`:

```typescript
import { BaseEntity } from './base_entitiy';
import {
    PropertyName,
    PropertyIndex,
    Required,
    ModuleName,
    ModuleIcon,
    ApiEndpoint,
    Persistent
} from '@/decorations';

@ModuleName('Book', 'Books')           // Nombres singular y plural
@ModuleIcon('book')                    // Icono en menú (MDI icon name)
@ApiEndpoint('/api/books')             // URL para CRUD
@Persistent(true, 'id')                // Habilitar persistencia, PK = 'id'
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

### 1.2 ¿Qué Acabas de Hacer?

#### Decoradores de Clase (en la clase Book):

- **`@ModuleName('Book', 'Books')`**: Define cómo aparece en el menú y encabezados
- **`@ModuleIcon('book')`**: Icono del menú lateral (usa Material Design Icons)
- **`@ApiEndpoint('/api/books')`**: URL base para operaciones CRUD
- **`@Persistent(true, 'id')`**: Habilita guardado en backend y define que 'id' es la clave primaria

#### Decoradores de Propiedades:

- **`@PropertyIndex(n)`**: Define el orden de aparición en formularios y tablas
- **`@PropertyName('Label', Type)`**: Etiqueta visible y tipo de dato
- **`@Required(true)`**: Campo obligatorio (validación automática)

---

## 🚀 Paso 2: Registrar el Módulo (1 min)

### 2.1 Editar application.ts

Abre `src/models/application.ts` y agrega el import y registro del módulo al final del archivo:

```typescript
// Al final de src/models/application.ts
import { Products } from '@/entities/products';
import { Book } from '@/entities/book';  // ← AGREGAR ESTA LÍNEA

const Application = ApplicationClass.getInstance();

// Registrar módulos
Application.ModuleList.value.push(Products);
Application.ModuleList.value.push(Book);  // ← AGREGAR ESTA LÍNEA

export default Application;
export { Application };
```

### 2.2 ¿Qué Hace Esto?

- `Application.ModuleList.value.push(Book)` agrega el módulo Book al array de módulos disponibles
- El menú lateral se genera automáticamente leyendo `ModuleList.value`
- Las rutas genéricas `/:module` y `/:module/:oid` funcionan para todos los módulos
- No se crean rutas específicas; el router usa el nombre del módulo para identificarlo

**Listo! El módulo ya está registrado.**

### 2.3 Alternativa: Registrar Múltiples Módulos

También puedes agregar múltiples módulos en una sola línea:

```typescript
Application.ModuleList.value.push(Products, Book, Customer, Order);
```

---

## 🚀 Paso 3: Crear Mock Backend (Simulado)

Como no tenemos backend real aún, crearemos un mock para simular la API.

### 3.1 Instalar Mock Service Worker (Opcional)

Si quieres simular backend realista:

```bash
npm install msw --save-dev
```

### 3.2 Crear Mock Handlers

Crea `src/mocks/handlers.ts`:

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
    // GET /api/books - Lista todos los libros
    rest.get('/api/books', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json(books)
        );
    }),

    // GET /api/books/:id - Obtener un libro
    rest.get('/api/books/:id', (req, res, ctx) => {
        const { id } = req.params;
        const book = books.find(b => b.id === parseInt(id as string));
        
        if (!book) {
            return res(ctx.status(404), ctx.json({ error: 'Book not found' }));
        }
        
        return res(ctx.status(200), ctx.json(book));
    }),

    // POST /api/books - Crear libro
    rest.post('/api/books', async (req, res, ctx) => {
        const data = await req.json();
        
        const newBook = {
            id: nextId++,
            ...data
        };
        
        books.push(newBook);
        
        return res(ctx.status(201), ctx.json(newBook));
    }),

    // PUT /api/books/:id - Actualizar libro
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

    // DELETE /api/books/:id - Eliminar libro
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

### 3.3 Inicializar Mock Service Worker

Crea `src/mocks/browser.ts`:

```typescript
import { setupWorker } from 'msw';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
```

### 3.4 Activar en Desarrollo

Edita `src/main.js`:

```javascript
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import Application from './models/application';

// Importar entidades
import { Product } from './entities/products';
import { Book } from './entities/book';

// AGREGAR: Iniciar mock en desarrollo
if (import.meta.env.DEV) {
    import('./mocks/browser').then(({ worker }) => {
        worker.start();
    });
}

// ... resto del código
```

---

## 🚀 Paso 4: ¡Probarlo!

### 4.1 Iniciar Servidor

```bash
npm run dev
```

### 4.2 Abrir Navegador

Navega a `http://localhost:5173` (o el puerto que indique)

### 4.3 Verificar Menú

Deberías ver en el menú lateral:

```
├─ 📦 Products
├─ 📚 Books        ← NUEVO
```

### 4.4 Navegar a Books

Haz click en "Books" → Verás la lista:

```
╔═════════════════════════════════════════════════════════╗
║                        Books                            ║
╠═════════════════════════════════════════════════════════╣
║  [+ New Book]                                           ║
╠═════════════════════════════════════════════════════════╣
║  ID │ Title                    │ Author          │ ... ║
║─────┼─────────────────────────┼─────────────────┼─────║
║  1  │ Clean Code               │ Robert C. Mar...│ ... ║
║  2  │ The Pragmatic Programmer │ Andrew Hunt...  │ ... ║
╚═════════════════════════════════════════════════════════╝
```

### 4.5 Crear Nuevo Libro

1. Click en **[+ New Book]**
2. Completa el formulario:
   ```
   Title:             [The Phoenix Project                    ]
   Author:            [Gene Kim                               ]
   ISBN:              [978-1942788294                         ]
   Publication Year:  [2013                                   ]
   Pages:             [432                                    ]
   Price:             [29.99                                  ]
   ```
3. Click **[Save]**
4. ¡El libro aparece en la lista!

### 4.6 Editar Libro

1. Click en cualquier fila de la tabla
2. Modifica campos (ej: cambiar precio)
3. Click **[Save]**
4. Los cambios se reflejan en la lista

### 4.7 Eliminar Libro

1. Click en un libro para editarlo
2. Click **[Delete]**
3. Confirma la eliminación
4. El libro desaparece de la lista

---

## 📚 Paso 5: Agregar Validaciones

### 5.1 Validación de Rango para Páginas

Edita `src/entities/book.ts`, modifica la propiedad `pages`:

```typescript
import { Validation } from '@/decorations';  // Agregar import

// ...

@PropertyIndex(6)
@PropertyName('Pages', Number)
@Validation(
    (entity) => !entity.pages || (entity.pages > 0 && entity.pages < 10000),
    'Pages must be between 1 and 10,000'
)
pages?: number;
```

**Prueba:** Intenta crear un libro con -5 páginas o 50000 páginas → Verás el error.

### 5.2 Validación de Formato ISBN

Modifica la propiedad `isbn`:

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

**Prueba:** Intenta crear un libro con ISBN inválido (ej: "123ABC") → Error de validación.

### 5.3 Validación de Precio Positivo

Modifica la propiedad `price`:

```typescript
@PropertyIndex(7)
@PropertyName('Price', Number)
@Validation(
    (entity) => !entity.price || entity.price > 0,
    'Price must be positive'
)
price?: number;
```

---

## 📚 Paso 6: Mejorar UI

### 6.1 Agregar DisplayFormat para Precio

```typescript
import { DisplayFormat } from '@/decorations';  // Agregar import

@PropertyIndex(7)
@PropertyName('Price', Number)
@DisplayFormat((value) => value ? `$${value.toFixed(2)}` : '-')  // ← NUEVO
@Validation(
    (entity) => !entity.price || entity.price > 0,
    'Price must be positive'
)
price?: number;
```

**Resultado:** En la lista verás `$39.99` en lugar de `39.99`.

### 6.2 Agregar Texto de Ayuda

```typescript
import { HelpText } from '@/decorations';  // Agregar import

@PropertyIndex(4)
@PropertyName('ISBN', String)
@Required(true)
@HelpText('International Standard Book Number (format: 978-0-123456-78-9)')  // ← NUEVO
@Validation(
    (entity) => /^(978|979)-?\d{1,5}-?\d{1,7}-?\d{1,7}-?\d{1}$/.test(entity.isbn),
    'Invalid ISBN format (expected: 978-0-123456-78-9)'
)
isbn!: string;
```

**Resultado:** Aparece texto de ayuda debajo del campo ISBN.

### 6.3 Organizar con ViewGroups

```typescript
import { ViewGroup } from '@/decorations';  // Agregar import

// Grupo: Información Básica
@PropertyIndex(2)
@PropertyName('Title', String)
@ViewGroup('Basic Information')  // ← NUEVO
@Required(true)
title!: string;

@PropertyIndex(3)
@PropertyName('Author', String)
@ViewGroup('Basic Information')  // ← NUEVO
@Required(true)
author!: string;

@PropertyIndex(4)
@PropertyName('ISBN', String)
@ViewGroup('Basic Information')  // ← NUEVO
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
@ViewGroup('Publication Details')  // ← NUEVO
publicationYear?: number;

@PropertyIndex(6)
@PropertyName('Pages', Number)
@ViewGroup('Publication Details')  // ← NUEVO
@Validation(
    (entity) => !entity.pages || (entity.pages > 0 && entity.pages < 10000),
    'Pages must be between 1 and 10,000'
)
pages?: number;

// Grupo: Pricing
@PropertyIndex(7)
@PropertyName('Price', Number)
@ViewGroup('Pricing')  // ← NUEVO
@DisplayFormat((value) => value ? `$${value.toFixed(2)}` : '-')
@Validation(
    (entity) => !entity.price || entity.price > 0,
    'Price must be positive'
)
price?: number;
```

**Resultado:** Formulario organizado en 3 secciones colapsables.

---

## 🎉 Resultado Final

### Código Completo: `src/entities/book.ts`

```typescript
import { BaseEntity } from './base_entitiy';
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

@ModuleName('Book', 'Books')
@ModuleIcon('book')
@ApiEndpoint('/api/books')
@Persistent(true, 'id')
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

✅ CRUD completo (Create, Read, Update, Delete)  
✅ Lista con columnas automáticas  
✅ Formulario de detalle automático  
✅ Validaciones de campos requeridos  
✅ Validaciones de formato (ISBN)  
✅ Validaciones de rango (páginas, precio)  
✅ Formato de display ($39.99)  
✅ Textos de ayuda  
✅ Organización en grupos  
✅ Navegación automática  
✅ Menú lateral automático  
✅ Persistencia simulada (mock backend)

---

## 🧠 Conceptos Clave Aprendidos

### 1. Define Once, Works Everywhere
Definiste la entidad **una sola vez** con decoradores, y obtuviste:
- Formulario automático
- Lista/tabla automática
- Validaciones
- Navegación
- CRUD completo

### 2. Decoradores como Metadatos
Los decoradores no ejecutan lógica, solo **almacenan información** que el framework lee después.

### 3. BaseEntity es el Motor
`Book extends BaseEntity` te da:
- Métodos CRUD (save, update, delete, getElementList, etc.)
- Sistema de validación (3 niveles)
- Serialización/deserialización automática
- Gestión de estado (dirty tracking, originalState)
- Hooks de ciclo de vida

### 4. Application es el Orquestador
`Application.ModuleList.value.push(Book)` registra el módulo y el sistema gestiona:
- Lista de módulos disponibles
- Router (rutas genéricas)
- Axios instance centralizada
- Event bus (mitt)
- Estado global de la aplicación

---

## 🚀 Próximos Pasos

### Tutorial 2: Validaciones Avanzadas
- AsyncValidation (verificar unicidad en servidor)
- Validaciones condicionales
- Validaciones entre múltiples campos

### Tutorial 3: Relaciones entre Entidades
- ObjectInput (Uno a uno)
- ArrayInput (Uno a muchos)
- Cascading saves

### Tutorial 4: Customización de UI
- Componentes custom
- ModuleDefaultComponent
- ModuleListComponent y ModuleDetailComponent

### Tutorial 5: Patrones Avanzados
- Lifecycle hooks (beforeSave, afterSave)
- Entity managers
- Soft deletes
- Auditing (createdAt, updatedAt, createdBy)

---

## 🐛 Troubleshooting

### Problema: "Book not found in menu"
**Solución:** Verifica que agregaste `Application.ModuleList.value.push(Book)` en `src/models/application.ts`.

### Problema: "No API endpoint defined"
**Solución:** Agrega `@ApiEndpoint('/api/books')` a la clase Book.

### Problema: "Cannot save without validation"
**Solución:** Verifica que los decoradores `@Required()` estén correctamente aplicados y que usas `@Persistent()` en la clase.

### Problema: "Validación no funciona"
**Solución:** Verifica que importaste `Validation` desde `@/decorations` y que la función de validación retorna un booleano.

### Problema: "Mock no intercepta peticiones"
**Solución:** Verifica que MSW está inicializado en `main.js` y que `worker.start()` se ejecutó antes de montar la app.

---

## 📚 Referencias

- `../01-FRAMEWORK-OVERVIEW.md` - Conceptos completos
- `../layers/01-decorators/` - Documentación de todos los decoradores
- `../layers/02-base-entity/crud-operations.md` - Métodos CRUD
- `../examples/classic-module-example.md` - Ejemplo de inventario
- `02-validations.md` - Próximo tutorial (validaciones avanzadas)

---

**¡Felicidades!** 🎉 Has creado tu primer módulo CRUD completo con el framework.

---

**Última actualización:** 10 de Febrero, 2026  
**Duración:** 15-20 minutos  
**Nivel:** Principiante
