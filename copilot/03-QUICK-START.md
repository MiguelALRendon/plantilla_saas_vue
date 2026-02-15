# Quick Start - Creación de Primera Entidad CRUD

## 1. Propósito

Este documento proporciona una guía práctica paso a paso para crear una primera entidad CRUD completamente funcional en el framework en un tiempo estimado de 10 a 15 minutos. El objetivo es demostrar la velocidad y simplicidad del framework mediante la creación de un módulo "Customer" con formulario de edición generado automáticamente, tabla de listado, validaciones, integración con API y operaciones CRUD completas.

## 2. Alcance

Esta guía cubre:

- Creación del archivo de entidad Customer con todos los decoradores necesarios
- Registro del módulo en Application
- Verificación del resultado en la interfaz de usuario
- Prueba de funcionalidad CRUD básica
- Agregado de validación personalizada
- Organización de campos mediante ViewGroup
- Adición de validación asíncrona
- Relaciones con otras entidades
- Listas de elementos relacionados
- Personalización de vistas
- Solución de problemas comunes
- Consejos finales de optimización

## 3. Definiciones Clave

**Entidad CRUD**: Clase que hereda de BaseEntity y que tiene operaciones completas de Create, Read, Update, Delete.

**Tiempo de implementación**: 10-15 minutos para crear una entidad completamente funcional.

**Hot-reload**: Característica de Vite que recarga automáticamente la aplicación al guardar cambios.

**Pre-requisitos**: Proyecto instalado con dependencias y servidor de desarrollo en ejecución.

**Decorador mínimo**: Conjunto de decoradores obligatorios para que una entidad sea funcional: @ModuleName, @PropertyName, @Persistent, @ApiEndpoint.

**Validación en tiempo real**: Validación que se ejecuta mientras el usuario escribe en los campos del formulario.

**ViewGroup**: Agrupación de campos en secciones colapsables para mejorar la organización del formulario.

## 4. Descripción Técnica

### Pre-requisitos Técnicos

Sistema operativo: Windows (según contexto)
Node.js y npm instalados
Dependencias del proyecto instaladas mediante:

```bash
npm install
```

Servidor de desarrollo ejecutándose mediante:

```bash
npm run dev
```

URL de desarrollo: http://localhost:5173

### Estructura de Archivo de Entidad

Un archivo de entidad típico contiene:

1. Imports de BaseEntity y decoradores necesarios
2. Decoradores de clase (módulo y API)
3. Declaración de clase extendiendo BaseEntity
4. Propiedades con decoradores de metadata

### Decoradores Obligatorios para CRUD Funcional

**Decoradores de Clase**:
- @ModuleName: Nombre visible en sidebar
- @ModuleIcon: Icono visual del módulo
- @ApiEndpoint: URL del endpoint de API
- @ApiMethods: Métodos HTTP permitidos
- @Persistent: Habilita persistencia
- @DefaultProperty: Propiedad de identificación por defecto
- @PrimaryProperty: Clave primaria
- @UniquePropertyKey: Clave única para URLs

**Decoradores de Propiedad**:
- @PropertyIndex: Orden de renderizado
- @PropertyName: Nombre y tipo de la propiedad
- @Required: Marca campo como obligatorio
- @CSSColumnClass: Ancho de columna en tabla
- @HelpText: Texto de ayuda para el usuario
- @StringTypeDef: Tipo específico de string (EMAIL, PASSWORD, etc.)

### Código Completo de Entidad Customer

```typescript
import { BaseEntity } from './base_entity';
import { 
    PropertyName, 
    ModuleName, 
    ModuleIcon,
    Required,
    ApiEndpoint,
    ApiMethods,
    Persistent,
    PrimaryProperty,
    DefaultProperty,
    UniquePropertyKey,
    PropertyIndex,
    StringTypeDef,
    HelpText,
    CSSColumnClass
} from '@/decorations';
import { StringType } from '@/enums/string_type';
import ICONS from '@/constants/icons';

@DefaultProperty('name')
@PrimaryProperty('id')
@UniquePropertyKey('id')
@ModuleName('Customers')
@ModuleIcon(ICONS.USERS)
@ApiEndpoint('/api/customers')
@ApiMethods(['GET', 'POST', 'PUT', 'DELETE'])
@Persistent()
export class Customer extends BaseEntity {
    
    @PropertyIndex(1)
    @PropertyName('ID', Number)
    @CSSColumnClass('table-length-small')
    @Required(true)
    id!: number;
    
    @PropertyIndex(2)
    @PropertyName('Customer Name', String)
    @CSSColumnClass('table-length-medium')
    @Required(true)
    @HelpText('Full name of the customer')
    name!: string;
    
    @PropertyIndex(3)
    @PropertyName('Email', String)
    @StringTypeDef(StringType.EMAIL)
    @Required(true)
    @HelpText('Customer email address')
    email!: string;
    
    @PropertyIndex(4)
    @PropertyName('Phone', String)
    @CSSColumnClass('table-length-short')
    phone?: string;
    
    @PropertyIndex(5)
    @PropertyName('Active', Boolean)
    active!: boolean;
}
```

### Registro en Application

Ubicación del código: src/models/application.ts

```typescript
import { Customer } from '@/entities/customer';

// Localizar la línea con ModuleList.push
Application.ModuleList.value.push(Products, Customer);
```

## 5. Flujo de Funcionamiento

### Paso 1: Crear Archivo de Entidad (2 minutos)

1. Navegar a directorio: src/entities/
2. Crear archivo: customer.ts
3. Copiar el código completo de entidad Customer del ejemplo anterior
4. Guardar el archivo

### Paso 2: Registrar el Módulo (1 minuto)

1. Abrir archivo: src/models/application.ts
2. Agregar import: `import { Customer } from '@/entities/customer';`
3. Localizar línea: `Application.ModuleList.value.push(Products);`
4. Modificar a: `Application.ModuleList.value.push(Products, Customer);`
5. Guardar el archivo

### Paso 3: Ver el Resultado (Inmediato)

1. El hot-reload de Vite recargará automáticamente la aplicación
2. Abrir navegador en http://localhost:5173
3. Verificar que aparece "Customers" en el Sidebar
4. Click en "Customers"

Resultado en Vista de Lista:
- Tabla con columnas: ID, Customer Name, Email, Phone, Active
- Columnas con anchos definidos por CSSColumnClass
- Click en cualquier fila abre el detalle

Resultado en Vista de Detalle (Click en "New" o en una fila):
- Input numérico para ID
- Input de texto para Name con help text
- Input de email para Email con validación HTML5
- Input de texto para Phone
- Checkbox para Active
- Botones: Save, Validate, New, Refresh

Validaciones Automáticas:
- ID y Name requeridos (asterisco rojo)
- Email requerido y formato válido
- Validación en tiempo real al escribir
- Mensajes de error específicos

### Paso 4: Probar Funcionalidad (5 minutos)

#### Crear Nuevo Cliente

1. Click en botón "New"
2. Llenar los campos:
   - ID: 1
   - Customer Name: John Doe
   - Email: john@example.com
   - Phone: 555-1234
   - Active: checked
3. Click en "Save"

Resultado esperado:
- Loading popup aparece
- Llamada POST a /api/customers se ejecuta
- Toast de éxito se muestra (aunque la API no exista)
- O mensaje de error si no hay backend (comportamiento esperado)

#### Validar Campos Vacíos

1. Click en "New"
2. No llenar ningún campo
3. Click en "Save"

Resultado esperado:
- Campos requeridos marcados en rojo
- Mensajes "Field is required" visibles
- No se ejecuta el guardado

#### Detectar Cambios

1. Editar un campo cualquiera
2. Intentar cambiar de módulo (click en Products)

Resultado esperado:
- Modal de confirmación aparece: "¿Salir sin guardar?"
- Opciones: Continuar / Cancelar
- Si se cancela, permanece en la vista actual
- Si se continúa, descarta cambios y navega

### Paso 5: Agregar Validación Custom (2 minutos)

Modificar src/entities/customer.ts, agregar import:

```typescript
import { Validation } from '@/decorations';
```

Modificar la propiedad email agregando decorador antes de @PropertyName:

```typescript
@PropertyIndex(3)
@Validation(
    (entity) => entity.email?.includes('@'), 
    'Email must contain @'
)
@PropertyName('Email', String)
@StringTypeDef(StringType.EMAIL)
@Required(true)
@HelpText('Customer email address')
email!: string;
```

Guardar y probar:

1. Escribir email sin @: "test"
2. Ver error: "Email must contain @"
3. Agregar @: "test@example.com"
4. Error desaparece

### Paso 6: Agrupar Campos (Opcional, 2 minutos)

Agregar import:

```typescript
import { ViewGroup } from '@/decorations';
```

Modificar decoradores de propiedades:

```typescript
@PropertyIndex(1)
@ViewGroup('Basic Information')
@PropertyName('ID', Number)
@CSSColumnClass('table-length-small')
@Required(true)
id!: number;

@PropertyIndex(2)
@ViewGroup('Basic Information')
@PropertyName('Customer Name', String)
@CSSColumnClass('table-length-medium')
@Required(true)
@HelpText('Full name of the customer')
name!: string;

@PropertyIndex(3)
@ViewGroup('Contact Information')
@PropertyName('Email', String)
@StringTypeDef(StringType.EMAIL)
@Required(true)
@HelpText('Customer email address')
email!: string;

@PropertyIndex(4)
@ViewGroup('Contact Information')
@PropertyName('Phone', String)
@CSSColumnClass('table-length-short')
phone?: string;

@PropertyIndex(5)
@ViewGroup('Status')
@PropertyName('Active', Boolean)
active!: boolean;
```

Resultado: Formulario con secciones colapsables:
- Basic Information
  - ID
  - Customer Name
- Contact Information
  - Email
  - Phone
- Status
  - Active

## 6. Reglas Obligatorias

- El archivo de entidad DEBE ubicarse en src/entities/
- La entidad DEBE heredar de BaseEntity
- Los decoradores de clase DEBEN colocarse antes de la declaración de clase
- Los decoradores de propiedad DEBEN colocarse antes de la declaración de propiedad
- El operador definite assignment (!) DEBE usarse en todas las propiedades
- @ModuleName es OBLIGATORIO para que el módulo aparezca en el sistema
- @Persistent es OBLIGATORIO para operaciones CRUD
- @ApiEndpoint es OBLIGATORIO para entidades persistentes
- @PropertyName es OBLIGATORIO para que una propiedad sea visible
- La entidad DEBE registrarse en Application.ModuleList
- PropertyIndex DEBE ser consecutivo para orden correcto
- El servidor de desarrollo DEBE estar ejecutándose para ver cambios

## 7. Prohibiciones

- NO crear archivo de entidad fuera de src/entities/
- NO omitir el operador definite assignment (!) en propiedades
- NO registrar la misma entidad múltiples veces en ModuleList
- NO usar decoradores de validación sin @PropertyName
- NO mezclar tipos incompatibles en @PropertyName (nombre, tipo)
- NO crear entidad sin heredar de BaseEntity
- NO usar @ApiMethods sin @ApiEndpoint
- NO usar @Persistent sin @ApiEndpoint
- NO omitir @RequiredProperty y @UniquePropertyKey si se necesitan operaciones de actualización
- NO agregar lógica de negocio en el archivo de entidad (usar hooks de ciclo de vida)

## 8. Dependencias

### Dependencias de Imports

- BaseEntity desde './base_entity'
- Decoradores desde '@/decorations'
- StringType desde '@/enums/string_type'
- ICONS desde '@/constants/icons'

### Dependencias del Sistema

- Application debe estar instanciado
- Router debe estar configurado
- Servidor de desarrollo (Vite) debe estar en ejecución
- Dependencias npm deben estar instaladas

### Dependencias de Entidades Relacionadas

- Si se usan relaciones, las entidades relacionadas deben existir y estar registradas
- Si se usa @PropertyName con otra entidad, esa entidad debe heredar de BaseEntity

## 9. Relaciones

### Customer → BaseEntity

Customer hereda todos los métodos CRUD, validación y gestión de estado de BaseEntity.

### Customer → Application

Customer se registra en Application.ModuleList para aparecer en el sistema.
Application proporciona servicios de UI (toasts, modales, loading) a Customer.

### Customer → Componentes UI

Los componentes generados leen metadatos de Customer para renderizar formularios y tablas.
Los inputs de formulario se vinculan a instancias de Customer mediante v-model.

### Customer → API Backend

Customer se comunica con /api/customers mediante Application.axiosInstance.
Las operaciones CRUD de Customer generan peticiones HTTP automáticas.

### Customer → Router

La navegación a /customers carga la vista de lista de Customer.
La navegación a /customers/123 carga la vista de detalle de Customer con ID 123.

## 10. Notas de Implementación

### Solución de Problemas Comunes

**Problema: Módulo no aparece en Sidebar**

Causa: No registrado en Application
Solución:
```typescript
// En application.ts
Application.ModuleList.value.push(Customer);
```

**Problema: Error "Cannot find module '@/entities/customer'"**

Causa: Archivo no creado o ruta incorrecta
Solución: Verificar que existe src/entities/customer.ts con contenido correcto

**Problema: Campos no se validan**

Causa: No tiene decorador @Required
Solución:
```typescript
@Required(true)
@PropertyName('Name', String)
name!: string;
```

**Problema: No guarda en API**

Causa: Decoradores de persistencia faltantes
Solución:
```typescript
@ApiEndpoint('/api/customers')
@ApiMethods(['POST', 'PUT'])
@Persistent()
export class Customer extends BaseEntity { ... }
```

### Tips de Optimización

1. Usar PropertyIndex para controlar orden de campos de forma explícita
2. ViewGroup mejora UX en formularios grandes con muchos campos
3. HelpText ayuda a usuarios a entender qué datos ingresar
4. CSSColumnClass controla anchos de columnas en tablas para mejor legibilidad
5. AsyncValidation permite validar contra servidor para datos únicos
6. Hooks (beforeSave, afterSave) permiten agregar lógica custom sin modificar framework

### Extensiones Avanzadas

#### Agregar Validación Asíncrona

```typescript
import { AsyncValidation } from '@/decorations';

@AsyncValidation(async (entity) => {
    // Simula llamada a API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Valida que email no exista
    const response = await fetch(`/api/customers/check-email?email=${entity.email}`);
    const data = await response.json();
    return data.available;
}, 'Email already exists')
@PropertyName('Email', String)
email!: string;
```

#### Agregar Relaciones con Otras Entidades

```typescript
import { Company } from './company';

@PropertyIndex(6)
@PropertyName('Company', Company)
@Required(true)
company!: Company;
```

Resultado: Select generado automáticamente con lista de compañías.

#### Agregar Listas de Elementos Relacionados

```typescript
@PropertyIndex(7)
@PropertyName('Orders', ArrayOf(Order))
orders!: Array<Order>;
```

Resultado: Tab con tabla de órdenes y botones Add/Remove generados automáticamente.

#### Personalizar Vista con Componente Custom

```typescript
import CustomCustomerDashboard from '@/views/custom_customer_dashboard.vue';

@ModuleDefaultComponent(CustomCustomerDashboard)
@ModuleName('Customers')
export class Customer extends BaseEntity { ... }
```

Resultado: Componente custom se renderiza en lugar del generado automáticamente.

### Resultados Obtenidos

Al completar esta guía se habrá creado una entidad completamente funcional con:

- UI generada automáticamente
- Validaciones en tiempo real
- Estado gestionado automáticamente
- Integración con API lista para usar
- Navegación con Router configurada
- Detección de cambios sin guardar

Código escrito: aproximadamente 80 líneas
Código equivalente generado automáticamente: aproximadamente 2000 líneas
Ratio de productividad: 1:25 (25 veces más productivo)

## 11. Referencias Cruzadas

### Documentos del Framework

- 00-CONTRACT.md: Contrato obligatorio de desarrollo
- 01-FRAMEWORK-OVERVIEW.md: Visión general del framework
- 02-FLOW-ARCHITECTURE.md: Arquitectura detallada de flujos

### Tutoriales Completos

- tutorials/01-basic-crud.md: CRUD paso a paso con más detalle
- tutorials/02-validations.md: Sistema de validaciones avanzadas
- tutorials/03-relations.md: Relaciones entre entidades en profundidad
- tutorials/04-custom-components.md: Componentes personalizados

### Referencia de Decoradores

- layers/01-decorators/property-decorators.md: Decoradores de propiedad
- layers/01-decorators/validation-decorators.md: Decoradores de validación
- layers/01-decorators/module-decorators.md: Decoradores de módulo
- layers/01-decorators/api-decorators.md: Decoradores de API

### Ejemplos Completos

- examples/classic-module-example.md: Módulo clásico completo
- examples/advanced-module-example.md: Módulo avanzado con características complejas

### Documentación de Componentes

- layers/04-components/form-components.md: Componentes de formulario
- layers/04-components/button-components.md: Componentes de botones
- layers/04-components/informative-components.md: Componentes informativos

---

**Última actualización:** 11 de Febrero, 2026  
**Versión:** 1.0.0
