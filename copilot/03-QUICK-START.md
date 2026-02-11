# 🚀 Quick Start - Tu Primera Entidad CRUD en 10 Minutos

**Referencias:**
- `01-FRAMEWORK-OVERVIEW.md` - Visión general del framework
- `02-FLOW-ARCHITECTURE.md` - Arquitectura de flujos
- `tutorials/01-basic-crud.md` - Tutorial CRUD completo
- `layers/01-decorators/` - Documentación de decoradores

---

## ⚡ Objetivo

Crear una entidad "Customer" completamente funcional con:
- ✅ Formulario de edición generado automáticamente
- ✅ Tabla de listado
- ✅ Validaciones
- ✅ Integración con API
- ✅ CRUD completo

**Tiempo estimado:** 10-15 minutos

---

## 📋 Pre-requisitos

```bash
# Proyecto ya instalado con:
npm install

# Servidor de desarrollo corriendo:
npm run dev
```

---

## 🎯 Paso 1: Crear Archivo de Entidad (2 min)

Crea el archivo: `src/entities/customer.ts`

```typescript
import { BaseEntity } from './base_entitiy';
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

@DefaultProperty('name')           // Propiedad para mostrar identificador
@PrimaryProperty('id')             // Clave primaria
@UniquePropertyKey('id')           // Clave única para URLs
@ModuleName('Customers')           // Nombre del módulo
@ModuleIcon(ICONS.USERS)           // Icono en sidebar
@ApiEndpoint('/api/customers')     // Endpoint de API
@ApiMethods(['GET', 'POST', 'PUT', 'DELETE'])  // Métodos permitidos
@Persistent()                      // Habilita persistencia
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

---

## 🔌 Paso 2: Registrar el Módulo (1 min)

Edita: `src/models/application.ts`

```typescript
// Al final del archivo, ANTES del export default
import { Customer } from '@/entities/customer';

// En la línea donde está:
// Application.ModuleList.value.push(Products);

// Agrega:
Application.ModuleList.value.push(Products, Customer);
```

**Listo! El módulo ya está registrado.**

---

## 🎨 Paso 3: Ver el Resultado (Inmediato)

1. **Guarda los archivos** (el hot-reload de Vite recargará automáticamente)
2. **Abre el navegador** (http://localhost:5173)
3. **Verás en el Sidebar** un nuevo item "Customers"
4. **Click en Customers**

### Lo que verás automáticamente:

#### 📋 Vista de Lista
- Tabla con columnas: ID, Customer Name, Email, Phone, Active
- Columnas con anchos definidos por CSSColumnClass
- Click en cualquier fila abre el detalle

#### ✏️ Vista de Detalle (Click en "New" o en una fila)
- Input numérico para ID
- Input de texto para Name con help text
- Input de email para Email (con validación HTML5)
- Input de texto para Phone
- Checkbox para Active
- Botones: Save, Validate, New, Refresh

#### ✅ Validaciones Automáticas
- ID y Name requeridos (asterisco rojo)
- Email requerido y formato válido
- Validación en tiempo real al escribir
- Mensajes de error específicos

---

## 🧪 Paso 4: Probar Funcionalidad (5 min)

### Crear Nuevo Cliente

1. **Click en botón "New"**
2. **Llena los campos:**
   - ID: 1
   - Customer Name: John Doe
   - Email: john@example.com
   - Phone: 555-1234
   - Active: ✓ (checked)
3. **Click en "Save"**

**Verás:**
- Loading popup
- Llamada POST a `/api/customers`
- Toast de éxito (aunque la API no exista aún)
- O error si no hay backend (esperado)

### Validar Campos Vacíos

1. **Click en "New"**
2. **No llenes nada**
3. **Click en "Save"**

**Verás:**
- Campos requeridos marcados en rojo
- Mensajes "Field is required"
- No se ejecuta el guardado

### Detectar Cambios

1. **Edita un campo**
2. **Intenta cambiar de módulo (click en Products)**

**Verás:**
- Modal de confirmación: "¿Salir sin guardar?"
- Opciones: Continuar / Cancelar

---

## 🎓 Paso 5: Agregar Validación Custom (2 min)

Edita `src/entities/customer.ts`, agrega decorador a email:

```typescript
import { Validation } from '@/decorations';

// En la propiedad email, ANTES de @PropertyName:
@Validation(
    (entity) => entity.email?.includes('@'), 
    'Email must contain @'
)
@PropertyName('Email', String)
// ... resto de decoradores
email!: string;
```

**Ahora prueba:**
1. Escribe email sin @: "test"
2. Verás error: "Email must contain @"

---

## 🚀 Paso 6: Agrupar Campos (Opcional, 2 min)

Para organizar mejor el formulario:

```typescript
import { ViewGroup } from '@/decorations';

@PropertyIndex(1)
@ViewGroup('Basic Information')  // 👈 Agregar grupo
@PropertyName('ID', Number)
// ...
id!: number;

@PropertyIndex(2)
@ViewGroup('Basic Information')  // 👈 Mismo grupo
@PropertyName('Customer Name', String)
// ...
name!: string;

@PropertyIndex(3)
@ViewGroup('Contact Information')  // 👈 Nuevo grupo
@PropertyName('Email', String)
// ...
email!: string;

@PropertyIndex(4)
@ViewGroup('Contact Information')
@PropertyName('Phone', String)
// ...
phone?: string;

@PropertyIndex(5)
@ViewGroup('Status')  // 👈 Otro grupo
@PropertyName('Active', Boolean)
active!: boolean;
```

**Resultado:**
Formulario con secciones colapsables:
- Basic Information
  - ID
  - Customer Name
- Contact Information
  - Email
  - Phone
- Status
  - Active

---

## 🎯 ¡Listo!

Ya tienes una entidad completamente funcional con:
- ✅ UI generada automáticamente
- ✅ Validaciones
- ✅ Estado gestionado
- ✅ Integración con API lista
- ✅ Navegación con Router
- ✅ Detección de cambios

---

## 🔥 Próximos Pasos

### Agregar Validación Asíncrona

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

### Agregar Relaciones

```typescript
import { Company } from './company';

@PropertyIndex(6)
@PropertyName('Company', Company)
@Required(true)
company!: Company;
```

**Genera automáticamente:** Select con lista de compañías

### Agregar Listas

```typescript
@PropertyIndex(7)
@PropertyName('Orders', ArrayOf(Order))
orders!: Array<Order>;
```

**Genera automáticamente:** Tab con tabla de órdenes + botones Add/Remove

### Personalizar Vista

```typescript
import CustomCustomerDashboard from '@/views/custom_customer_dashboard.vue';

@ModuleDefaultComponent(CustomCustomerDashboard)
@ModuleName('Customers')
export class Customer extends BaseEntity { ... }
```

**Resultado:** Tu componente custom en lugar del generado

---

## 🐛 Solución de Problemas

### Módulo no aparece en Sidebar

**Causa:** No registrado en Application

**Solución:**
```typescript
// En application.ts
Application.ModuleList.value.push(Customer);
```

### Error: "Cannot find module '@/entities/customer'"

**Causa:** Archivo no creado o ruta incorrecta

**Solución:** Verifica que existe `src/entities/customer.ts`

### Campos no se validan

**Causa:** No tiene decorador `@Required`

**Solución:**
```typescript
@Required(true)
@PropertyName('Name', String)
name!: string;
```

### No guarda en API

**Causa:** Decoradores de persistencia faltantes

**Solución:**
```typescript
@ApiEndpoint('/api/customers')
@ApiMethods(['POST', 'PUT'])
@Persistent()
export class Customer extends BaseEntity { ... }
```

---

## 📚 Documentación Adicional

### Tutoriales Completos
- `tutorials/01-basic-crud.md` - CRUD paso a paso
- `tutorials/02-validations.md` - Validaciones avanzadas
- `tutorials/03-relations.md` - Relaciones entre entidades
- `tutorials/04-custom-components.md` - Componentes personalizados

### Referencia de Decoradores
- `layers/01-decorators/property-decorators.md`
- `layers/01-decorators/validation-decorators.md`
- `layers/01-decorators/module-decorators.md`

### Ejemplos Completos
- `examples/classic-module-example.md` - Módulo clásico
- `examples/advanced-module-example.md` - Módulo avanzado

---

## 💡 Tips Finales

1. **Usa PropertyIndex** para controlar orden de campos
2. **ViewGroup** mejora UX en formularios grandes
3. **HelpText** ayuda a usuarios a entender campos
4. **CSSColumnClass** controla anchos de columnas
5. **AsyncValidation** para validar contra servidor
6. **Hooks** (beforeSave, afterSave) para lógica custom

---

## 🎉 Felicidades

Has creado tu primera entidad CRUD completa en menos de 15 minutos.

**Código escrito:** ~80 líneas  
**Código generado automáticamente:** ~2000 líneas equivalentes  
**Ratio:** 1:25 (25x más productivo)

---

**Siguiente lectura recomendada:**  
`tutorials/01-basic-crud.md` - Para profundizar en cada decorador

**Última actualización:** 10 de Febrero, 2026
