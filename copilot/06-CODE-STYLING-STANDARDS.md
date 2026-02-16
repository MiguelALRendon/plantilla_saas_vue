# CONTRATO DE ESTÁNDARES DE CODE STYLING - Framework SaaS Vue

**Versión:** 1.2.0  
**Fecha de Creación:** 15 de Febrero, 2026  
**Última Actualización:** 15 de Febrero, 2026  
**Estado:** ACTIVO Y VINCULANTE

## 1. Propósito

Establecer principios contractuales vinculantes que regulen el formateo, estructura y estilo del código TypeScript, JavaScript y Vue del Framework SaaS Vue, garantizando consistencia absoluta, legibilidad determinista, mantenibilidad estructural y prevención de alucinaciones de IA mediante reglas explícitas y verificables de escritura de código.

Este contrato define reglas obligatorias de indentación, uso de comillas, construcción de strings, estructuración de imports, organización de código, documentación obligatoria, tipado estricto, convenciones de commits y prohibiciones específicas que aseguran que todo código generado, modificado o revisado cumpla con estándares uniformes y predecibles.

## 2. Alcance

Este contrato aplica a:
- Todo código TypeScript en `/src/**/*.ts`
- Todo código Vue en `/src/**/*.vue` (template, script, style)
- Todo archivo JavaScript en `/src/**/*.js`
- Archivos de configuración TypeScript (`tsconfig.json`, `tsconfig.node.json`)
- Archivos de configuración de build (`vite.config.js`)
- Todo código generado por agentes de IA
- Todo código modificado manualmente por desarrolladores
- Todo código sometido a revisión pre-commit
- Mensajes de commit en Git
- Nombres de branches en Git
- Documentación inline (comentarios JSDoc)

Este contrato NO aplica a:
- Archivos Markdown de documentación (`.md`) - regulados por [00-CONTRACT.md](00-CONTRACT.md) § 6.7
- Archivos CSS (regulados por [04-UI-DESIGN-SYSTEM-CONTRACT.md](04-UI-DESIGN-SYSTEM-CONTRACT.md))
- Archivos JSON de configuración que no sean `tsconfig.json`
- Código de dependencias en `node_modules/`
- Archivos generados automáticamente por herramientas (`.d.ts` de librerías)

## 3. Definiciones Clave

**Code Styling:** Conjunto de reglas explícitas y obligatorias que definen la forma exacta en que el código debe escribirse, incluyendo formateo, estructura, organización y documentación, garantizando consistencia visual y semántica absoluta.

**Indentación:** Espaciado horizontal utilizado para indicar jerarquía estructural en bloques de código, expresiones y definiciones anidadas.

**Template Literal:** Sintaxis de cadena de texto delimitada por backticks (\`) que permite interpolación de expresiones mediante `${expression}`, obligatoria para cualquier string que incluya variables o expresiones dinámicas.

**Tipado Explícito:** Declaración obligatoria del tipo de dato para variables, parámetros de función, valores de retorno y propiedades de clase, prohibiendo inferencia implícita no controlada y uso de tipo `any`.

**Region:** Comentario estructural que agrupa y delimita secciones de código dentro de archivos, utilizado para organizar propiedades, métodos y métodos override en clases y componentes.

**Import Order:** Orden jerárquico obligatorio de declaraciones de importación que agrupa imports por tipo y origen, separados por líneas en blanco, facilitando lectura y detección de dependencias circulares.

**Trailing Comma:** Coma final después del último elemento en arrays, objetos y listas de parámetros multilinea, obligatoria para facilitar diffs de git y prevenir errores de sintaxis al agregar elementos.

**JSDoc Comment:** Comentario estructurado con sintaxis `/** */` que documenta propósito, parámetros, retorno y comportamiento de funciones, métodos y propiedades, obligatorio para toda declaración pública.

**Override Method:** Método de clase que sobrescribe implementación heredada de clase padre (BaseEntity u otra), identificado con decorador `@Override` o comentario explícito, organizado en región separada.

**Commit Message:** Mensaje de confirmación de cambios en Git que describe modificaciones realizadas, sigue formato estructurado con tipo, alcance y descripción, escrito obligatoriamente en inglés y requiere autorización del usuario antes de ejecutar commit.

## 4. Descripción Técnica

### 4.1 Naturaleza del Sistema de Code Styling

El sistema de code styling del Framework SaaS Vue opera bajo principios de **determinismo absoluto** y **consistencia verificable**, eliminando ambigüedad en la escritura de código mediante reglas explícitas que cubren todos los aspectos de formateo, estructura y documentación.

Principio operativo: El código debe ser visualmente consistente, semánticamente claro y estructuralmente predecible. Ningún desarrollador ni agente de IA debe tomar decisiones de estilo; todas las decisiones están contractualmente definidas.

### 4.2 Arquitectura del Sistema de Reglas

```
┌─────────────────────────────────────────────────────┐
│         CODE STYLING STANDARDS (Este Contrato)     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌────────────────┐  ┌────────────────┐           │
│  │  FORMATEO      │  │  ESTRUCTURA    │           │
│  │  - Indentación │  │  - Imports     │           │
│  │  - Comillas    │  │  - Regions     │           │
│  │  - Spacing     │  │  - Orden       │           │
│  └────────────────┘  └────────────────┘           │
│                                                     │
│  ┌────────────────┐  ┌────────────────┐           │
│  │  TYPESCRIPT    │  │  DOCUMENTACIÓN │           │
│  │  - Tipado      │  │  - JSDoc       │           │
│  │  - Enums       │  │  - Comentarios │           │
│  │  - Interfaces  │  │  - Inline      │           │
│  └────────────────┘  └────────────────┘           │
│                                                     │
│  ┌────────────────┐  ┌────────────────┐           │
│  │  GIT           │  │  NAMING        │           │
│  │  - Commits     │  │  (05-ENF §6.8) │           │
│  │  - Branches    │  │  - Reforzado   │           │
│  └────────────────┘  └────────────────┘           │
│                                                     │
└─────────────────────────────────────────────────────┘
                       ▲
                       │
         ┌─────────────┴──────────────┐
         │                            │
┌────────┴────────┐        ┌──────────┴─────────┐
│  00-CONTRACT    │        │  05-ENFORCEMENT    │
│  (Master)       │        │  §6.8 Naming       │
└─────────────────┘        └────────────────────┘
```

### 4.3 Jerarquía Normativa

```
MI LÓGICA (Axiomas A1-A4)
    ↓
00-CONTRACT.md (Contrato Principal)
    ↓
05-ENFORCEMENT-TECHNICAL-CONTRACT.md (Enforcement)
    ↓
06-CODE-STYLING-STANDARDS.md (Este Contrato)
```

Este contrato es subordinado a MI LÓGICA, [00-CONTRACT.md](00-CONTRACT.md) y [05-ENFORCEMENT-TECHNICAL-CONTRACT.md](05-ENFORCEMENT-TECHNICAL-CONTRACT.md). En caso de conflicto interpretativo, prevalece la jerarquía establecida.

### 4.4 Integración con tsconfig.json

Este contrato refuerza y extiende configuraciones establecidas en `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,                    // ← Reforzado por § 6.4
    "noUnusedLocals": true,            // ← Reforzado por § 6.4
    "noUnusedParameters": true,        // ← Reforzado por § 6.4
    "experimentalDecorators": true,    // ← Obligatorio por arquitectura
    "emitDecoratorMetadata": true      // ← Obligatorio por arquitectura
  }
}
```

Toda configuración TypeScript establecida en `tsconfig.json` es **obligatoria y vinculante**. Ningún agente de IA ni desarrollador puede proponer deshabilitación de flags de strict mode sin autorización explícita vía proceso de Breaking Change definido en [05-ENFORCEMENT-TECHNICAL-CONTRACT.md](05-ENFORCEMENT-TECHNICAL-CONTRACT.md) § 6.4.

### 4.5 Refuerzo de Naming Conventions (05-ENFORCEMENT § 6.8)

Este contrato **refuerza y extiende** las reglas de naming conventions establecidas en [05-ENFORCEMENT-TECHNICAL-CONTRACT.md](05-ENFORCEMENT-TECHNICAL-CONTRACT.md) § 6.8, añadiendo reglas de formateo y estructura para garantizar aplicación consistente.

Ver sección 6.9 de este contrato para detalles completos de integración.

## 5. Flujo de Funcionamiento

### 5.1 Flujo de Escritura de Código

```
┌──────────────────────────────────────────────────────┐
│ INICIO: Desarrollador o IA escribe código           │
└───────────────────┬──────────────────────────────────┘
                    │
┌───────────────────▼──────────────────────────────────┐
│ FASE 1: Aplicación de Reglas de Formateo            │
│ 1. Indentación: 4 espacios (§ 6.1.1)                │
│ 2. Comillas: Simples por defecto (§ 6.1.2)          │
│ 3. Strings: Template literals si hay variables      │
│    (§ 6.1.3)                                         │
│ 4. Semicolons: Obligatorios (§ 6.1.4)               │
│ 5. Line length: Separar parámetros (§ 6.1.5)        │
│ 6. Spacing: Operadores y llaves (§ 6.1.7)           │
└───────────────────┬──────────────────────────────────┘
                    │
┌───────────────────▼──────────────────────────────────┐
│ FASE 2: Estructura de Código                        │
│ 1. Imports: Ordenar por tipo (§ 6.2.1)              │
│ 2. Regions: PROPERTIES → METHODS → OVERRIDES        │
│    (§ 6.2.4)                                         │
│ 3. Variables: Por orden de flujo (§ 6.2.3)          │
│ 4. Funciones: Utilidad → Overrides → Alfabético     │
│    (§ 6.2.5)                                         │
└───────────────────┬──────────────────────────────────┘
                    │
┌───────────────────▼──────────────────────────────────┐
│ FASE 3: TypeScript Strict                           │
│ 1. Tipado: Explícito, prohibido 'any' (§ 6.4.1)     │
│ 2. Retornos: Tipo declarado siempre (§ 6.4.2)       │
│ 3. Enums: Solo nombres, sin valores (§ 6.4.4)       │
│ 4. Interfaces: Siempre sobre types (§ 6.4.5)        │
└───────────────────┬──────────────────────────────────┘
                    │
┌───────────────────▼──────────────────────────────────┐
│ FASE 4: Documentación Obligatoria                   │
│ 1. JSDoc: Todas propiedades públicas (§ 6.5.1)      │
│ 2. JSDoc: Todos métodos públicos (§ 6.5.2)          │
│ 3. Comentarios: Parámetros y constructores          │
│    (§ 6.5.3)                                         │
└───────────────────┬──────────────────────────────────┘
                    │
┌───────────────────▼──────────────────────────────────┐
│ FASE 5: Validación Pre-Commit                       │
│ 1. Revisión manual arquitecto                       │
│ 2. Verificación contra checklist § 9.1              │
│ 3. Aprobación o rechazo                             │
└───────────────────┬──────────────────────────────────┘
                    │
┌───────────────────▼──────────────────────────────────┐
│ FASE 6: Commit (Solo con autorización)              │
│ 1. Mensaje en inglés (§ 6.6.1)                      │
│ 2. Formato estructurado (§ 6.6.1)                   │
│ 3. Autorización del usuario explícita (§ 6.6.3)     │
└──────────────────────────────────────────────────────┘
```

### 5.2 Flujo de Generación de Código por IA

```
IA genera código
    │
    ├─→ Aplica reglas de formateo (§ 6.1)
    │
    ├─→ Estructura según regions (§ 6.2.4)
    │
    ├─→ Tipado explícito, sin 'any' (§ 6.4)
    │
    ├─→ Documenta con JSDoc (§ 6.5)
    │
    ├─→ Declara cumplimiento en AOM (05-ENF § 5.4)
    │       ├─ "Cumplo 06-CODE-STYLING § 6.1.1: Indentación 4 espacios"
    │       ├─ "Cumplo 06-CODE-STYLING § 6.1.3: Template literals usados"
    │       ├─ "Cumplo 06-CODE-STYLING § 6.4.1: Tipado explícito, sin any"
    │       └─ "Cumplo 06-CODE-STYLING § 6.5.1: JSDoc en propiedades"
    │
    └─→ Entrega código + Declaración de Cumplimiento
            │
            └─→ Arquitecto revisa y aprueba/rechaza
```

## 6. Reglas Obligatorias

### 6.1 Reglas de Formateo

#### 6.1.1 Indentación

**REGLA OBLIGATORIA:**

Toda indentación DEBE utilizar **4 espacios**. PROHIBIDO uso de tabs.

**Aplicación:**

```typescript
// CORRECTO - 4 espacios
export class Product extends BaseEntity {
    id!: number;
    name!: string;

    constructor() {
        super();
        this.id = 0;
    }

    public getFullName(): string {
        if (this.name) {
            return `Product: ${this.name}`;
        }
        return 'Unnamed';
    }
}

// INCORRECTO - 2 espacios
export class Product extends BaseEntity {
  id!: number;
  name!: string;
}

// INCORRECTO - Tabs
export class Product extends BaseEntity {
	id!: number;
	name!: string;
}
```

**Configuración EditorConfig obligatoria:**

```ini
[*.{ts,js,vue}]
indent_style = space
indent_size = 4
```

#### 6.1.2 Comillas

**REGLA OBLIGATORIA:**

Usar **comillas simples** (`'`) por defecto para strings literales.

Usar **comillas dobles** (`"`) únicamente en:
- Atributos HTML en templates Vue
- Strings que contienen comillas simples como contenido
- JSON (donde son obligatorias)

**Aplicación:**

```typescript
// CORRECTO - Comillas simples
const moduleName: string = 'Products';
const endpoint: string = '/api/products';
const icon: string = 'fa-box';

// CORRECTO - Dobles cuando contiene comillas simples
const message: string = "Can't load products";
const sql: string = "SELECT * FROM users WHERE name = 'John'";

// INCORRECTO - Dobles sin razón
const moduleName: string = "Products";
const endpoint: string = "/api/products";
```

**En templates Vue:**

```vue
<!-- CORRECTO - Atributos HTML con comillas dobles -->
<TextInputComponent 
    :label="propertyName"
    :value="entityObject[key]"
    class="input-field"
/>

<!-- CORRECTO - Strings en script con comillas simples -->
<script setup lang="ts">
const title: string = 'Product Details';
const endpoint: string = '/api/products';
</script>
```

#### 6.1.3 Construcción de Strings con Variables

**REGLA OBLIGATORIA - PROHIBICIÓN ABSOLUTA DE CONCATENACIÓN:**

PROHIBIDO uso de operador `+` para concatenar strings con variables.

OBLIGATORIO uso de **template literals** (backticks \`) para cualquier string que incluya variables, expresiones o valores dinámicos.

**Aplicación:**

```typescript
// CORRECTO - Template literals
const userName: string = 'John';
const age: number = 30;
const message: string = `Hello ${userName}, you are ${age} years old`;
const endpoint: string = `/api/users/${userId}`;
const title: string = `Product: ${product.name} (${product.id})`;
const formatted: string = `Total: $${price.toFixed(2)}`;

// INCORRECTO - Concatenación con +
const message: string = 'Hello ' + userName + ', you are ' + age + ' years old';
const endpoint: string = '/api/users/' + userId;
const title: string = 'Product: ' + product.name + ' (' + product.id + ')';
```

**Casos especiales:**

```typescript
// CORRECTO - Variables en expresiones complejas
const label: string = `${isRequired ? '* ' : ''}${propertyName}`;
const status: string = `Status: ${isActive ? 'Active' : 'Inactive'}`;
const path: string = `${baseUrl}/${module}/${id}/details`;

// CORRECTO - Multilinea con template literals
const htmlContent: string = `
    <div class="product">
        <h1>${product.name}</h1>
        <p>Price: $${product.price}</p>
    </div>
`;

// INCORRECTO - Mezclar concatenación
const message: string = 'Hello ' + `${userName}`;
```

**Excepciones NO permitidas:**

No existen excepciones a esta regla. **SIEMPRE** template literals cuando hay variables.

#### 6.1.4 Semicolons

**REGLA OBLIGATORIA:**

Punto y coma (`;`) obligatorio al final de toda declaración y expresión que lo requiera.

**Aplicación:**

```typescript
// CORRECTO - Semicolons presentes
const name: string = 'Product';
let count: number = 0;
this.id = 10;
return this.name;
Application.changeViewToListView(Product);

// INCORRECTO - Sin semicolons
const name: string = 'Product'
let count: number = 0
this.id = 10
return this.name
```

**Casos especiales:**

```typescript
// CORRECTO - Interfaces y types (no requieren semicolon al final)
interface Product {
    id: number;      // ← Semicolon en propiedades
    name: string;    // ← Semicolon en propiedades
}                    // ← NO semicolon después de cierre

// CORRECTO - Clases
export class Product extends BaseEntity {
    id!: number;     // ← Semicolon en propiedades
    
    getName(): string {
        return this.name;    // ← Semicolon en return
    }                        // ← NO semicolon después de cierre de función
}                            // ← NO semicolon después de cierre de clase

// CORRECTO - Funciones flecha asignadas
const calculate = (): number => {
    return 10;
};  // ← Semicolon después de asignación
```

#### 6.1.5 Line Length y Separación de Parámetros

**REGLA OBLIGATORIA:**

Se prioriza legibilidad sobre compactación. Cuando una línea contenga múltiples parámetros, argumentos o propiedades, se DEBEN separar en líneas individuales si:

- La línea excede visualmente el ancho cómodo de lectura
- Hay más de 3 parámetros
- Los parámetros tienen tipos complejos
- Mejora significativamente la legibilidad

**Aplicación:**

```typescript
// CORRECTO - Parámetros en líneas separadas
public saveProduct(
    id: number,
    name: string,
    price: number,
    category: string
): Promise<Product> {
    // implementación
}

// CORRECTO - Llamada con argumentos separados
Application.ApplicationUIService.showToast(
    'Product saved successfully',
    ToastType.SUCCESS,
    5000
);

// CORRECTO - Línea corta puede estar en una línea
public getId(): number {
    return this.id;
}

// CORRECTO - Objeto con propiedades separadas
const config: ProductConfig = {
    id: 1,
    name: 'Product A',
    price: 99.99,
    stock: 100,
    isActive: true
};

// INCORRECTO - Demasiados parámetros en una línea
public saveProduct(id: number, name: string, price: number, category: string): Promise<Product> { }

// INCORRECTO - Llamada con argumentos apretados
Application.ApplicationUIService.showToast('Product saved successfully', ToastType.SUCCESS, 5000);
```

**Decoradores:**

```typescript
// CORRECTO - Un decorador por línea
@ModuleName('Products')
@ModuleIcon(ICONS.BOX)
@ApiEndpoint('/api/products')
@Persistent()
export class Product extends BaseEntity {
    
    @PropertyIndex(1)
    @PropertyName('ID', Number)
    @Required(true)
    id!: number;
}

// INCORRECTO - Múltiples decoradores en una línea
@ModuleName('Products') @ModuleIcon(ICONS.BOX) @ApiEndpoint('/api/products')
export class Product extends BaseEntity { }
```

#### 6.1.6 Trailing Commas

**REGLA OBLIGATORIA:**

Trailing comma (coma final) obligatoria en:
- Arrays multilinea
- Objetos multilinea
- Listas de parámetros multilinea
- Imports multilinea

**Aplicación:**

```typescript
// CORRECTO - Trailing commas presentes
const products: string[] = [
    'Product A',
    'Product B',
    'Product C',  // ← Trailing comma
];

const config: Config = {
    id: 1,
    name: 'Product',
    price: 99.99,  // ← Trailing comma
};

public saveProduct(
    id: number,
    name: string,
    price: number,  // ← Trailing comma
): Promise<Product> { }

import {
    BaseEntity,
    PropertyName,
    Required,  // ← Trailing comma
} from '@/decorations';

// INCORRECTO - Sin trailing commas
const products: string[] = [
    'Product A',
    'Product B',
    'Product C'   // ← Falta trailing comma
];

const config: Config = {
    id: 1,
    name: 'Product',
    price: 99.99  // ← Falta trailing comma
};
```

**Excepción:**

```typescript
// CORRECTO - Una línea, no requiere trailing comma
const colors: string[] = ['red', 'green', 'blue'];
const point: Point = { x: 10, y: 20 };
```

#### 6.1.7 Spacing (Espaciado)

**REGLA OBLIGATORIA:**

Espacios obligatorios en:
- Operadores aritméticos, lógicos y de comparación
- Después de comas
- Después de dos puntos en objetos
- Antes y después de llaves en objetos inline
- Después de palabras clave (`if`, `for`, `while`, `function`, etc.)

**Aplicación:**

```typescript
// CORRECTO - Spacing apropiado
const sum: number = a + b;
const isValid: boolean = (x > 10) && (y < 20);
const result: number = condition ? value1 : value2;

// Objetos
const config: Config = { id: 1, name: 'Product' };
const obj: MyObj = { key: value };

// Control flow
if (condition) {
    // código
}

for (let i: number = 0; i < length; i++) {
    // código
}

// Funciones
function calculate(a: number, b: number): number {
    return a + b;
}

// Arrays y llamadas
const arr: number[] = [1, 2, 3, 4];
const result: Product = getProduct(id, name, price);

// INCORRECTO - Sin spacing
const sum:number=a+b;
const isValid:boolean=(x>10)&&(y<20);
const config:Config={id:1,name:'Product'};
if(condition){
    // código
}
```

**Spacing en tipos genéricos:**

```typescript
// CORRECTO
const list: Array<Product> = [];
const map: Map<string, Product> = new Map();
const ref: Ref<Product | null> = ref(null);

// INCORRECTO
const list: Array <Product> = [];        // ← Espacio antes de <
const map: Map< string, Product > = new Map();  // ← Espacios dentro de <>
```

### 6.2 Reglas de Estructura de Código

#### 6.2.1 Import Order (Orden de Imports)

**REGLA OBLIGATORIA:**

Imports DEBEN organizarse en el siguiente orden jerárquico, separados por líneas en blanco:

1. **Vue framework** (vue, vue-router, pinia, etc.)
2. **Librerías externas** (axios, mitt, lodash, etc.)
3. **Imports aliased** (`@/*` - entities, decorations, models, etc.)
   - Primero: Interfaces y clases
   - Segundo: Types (al final)
4. **Imports relativos** (`./`, `../`)
   - Primero: Interfaces y clases
   - Segundo: Types (al final)

**Aplicación:**

```typescript
// CORRECTO - Orden jerárquico estricto
// 1. Vue framework
import { ref, computed, Ref, ComputedRef } from 'vue';
import { useRouter, Router } from 'vue-router';

// 2. Librerías externas
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import mitt, { Emitter } from 'mitt';

// 3. Imports aliased - Clases e interfaces
import { BaseEntity } from '@/entities/base_entity';
import {
    PropertyName,
    ModuleName,
    ApiEndpoint,
    Required,
} from '@/decorations';
import Application from '@/models/application';
import { ViewTypes } from '@/enums/view_types';

// 3. Imports aliased - Types (al final de aliased)
import type { Product } from '@/entities/product';
import type { Config } from '@/types/config';

// 4. Imports relativos - Clases e interfaces
import { helperFunction } from './utils';
import { CustomerService } from '../services/customer';

// 4. Imports relativos - Types (al final de relativos)
import type { LocalConfig } from './types';

// INCORRECTO - Sin orden, mezclado
import { BaseEntity } from '@/entities/base_entity';
import axios from 'axios';
import type { Product } from '@/entities/product';
import { ref } from 'vue';
import { helperFunction } from './utils';
import { PropertyName } from '@/decorations';
```

**Imports multilinea:**

```typescript
// CORRECTO - Alfabético dentro del grupo, trailing comma
import {
    ApiEndpoint,
    ApiMethods,
    ModuleName,
    Persistent,
    PropertyName,
    Required,
} from '@/decorations';

// INCORRECTO - Sin orden alfabético
import {
    PropertyName,
    Required,
    ModuleName,
    ApiEndpoint,
    Persistent,
    ApiMethods,
} from '@/decorations';
```

#### 6.2.2 Estructura General de Archivos TypeScript

**REGLA OBLIGATORIA:**

Todo archivo TypeScript con clases DEBE seguir el siguiente orden:

1. **Imports** (según § 6.2.1)
2. **Interfaces y Types locales** (si no están en archivo separado)
3. **Enums locales** (si no están en archivo separado)
4. **Constantes locales** del archivo
5. **Declaración de clase(s)**

Dentro de clases, seguir orden de § 6.2.4 (Regions).

**Aplicación:**

```typescript
// 1. Imports
import { BaseEntity } from '@/entities/base_entity';
import { PropertyName, Required } from '@/decorations';

// 2. Interfaces locales (si no están en archivo separado)
interface ProductConfig {
    id: number;
    name: string;
}

// 3. Enums locales (si no están en archivo separado)
enum ProductStatus {
    Active,
    Inactive,
    Discontinued,
}

// 4. Constantes locales
const DEFAULT_CATEGORY: string = 'General';

// 5. Clase
@ModuleName('Products')
export class Product extends BaseEntity {
    // ... implementación según § 6.2.4
}
```

#### 6.2.3 Definición de Variables por Orden de Flujo

**REGLA OBLIGATORIA:**

Variables dentro de funciones o métodos DEBEN definirse en orden de flujo lógico de uso.

Variables relacionadas DEBEN agruparse visualmente.

**Aplicación:**

```typescript
// CORRECTO - Variables en orden de flujo
public async saveProduct(): Promise<Product> {
    // Primero: Validación
    const isValid: boolean = this.validateInputs();
    
    // Segundo: Preparación de datos
    const endpoint: string = this.getApiEndpoint();
    const data: object = this.toPersistentObject();
    const primaryKey: number = this.getPrimaryPropertyValue();
    
    // Tercero: Ejecución
    let response: AxiosResponse<Product>;
    
    if (primaryKey) {
        response = await axios.put(`${endpoint}/${primaryKey}`, data);
    } else {
        response = await axios.post(endpoint, data);
    }
    
    // Cuarto: Procesamiento de resultado
    const savedProduct: Product = response.data;
    const message: string = `Product ${savedProduct.name} saved`;
    
    return savedProduct;
}

// INCORRECTO - Variables desordenadas
public async saveProduct(): Promise<Product> {
    const data: object = this.toPersistentObject();
    let response: AxiosResponse<Product>;
    const isValid: boolean = this.validateInputs();
    const savedProduct: Product = response.data;  // ← Usado antes de definir response
    const endpoint: string = this.getApiEndpoint();
}
```

**Variables de configuración al inicio:**

```typescript
// CORRECTO - Config al principio, luego flujo
public processOrder(orderId: number): void {
    // Configuración
    const maxRetries: number = 3;
    const timeout: number = 5000;
    const endpoint: string = '/api/orders';
    
    // Flujo
    const order: Order = this.getOrder(orderId);
    const isValid: boolean = this.validateOrder(order);
    
    if (isValid) {
        this.saveOrder(order);
    }
}
```

#### 6.2.4 Regions (Organización de Código en Clases)

**REGLA OBLIGATORIA:**

Toda clase DEBE organizar su código en tres regions obligatorias:

1. **PROPERTIES** - Propiedades de instancia
2. **METHODS** - Métodos propios de la clase
3. **METHODS OVERRIDES** - Métodos que sobrescriben clase padre

Cada region DEBE marcarse con comentario estructurado.

**Formato de Regions:**

```typescript
// #region PROPERTIES
// ... propiedades
// #endregion

// #region METHODS
// ... métodos
// #endregion

// #region METHODS OVERRIDES
// ... métodos override
// #endregion
```

**Aplicación completa:**

```typescript
import { BaseEntity } from '@/entities/base_entity';
import {
    PropertyName,
    ModuleName,
    Required,
} from '@/decorations';

/**
 * Product entity for inventory management
 */
@ModuleName('Products')
export class Product extends BaseEntity {
    
    // #region PROPERTIES
    
    /**
     * Unique identifier for the product
     */
    @PropertyName('ID', Number)
    @Required(true)
    id!: number;
    
    /**
     * Product display name
     */
    @PropertyName('Name', String)
    @Required(true)
    name!: string;
    
    /**
     * Product price in USD
     */
    @PropertyName('Price', Number)
    @Required(true)
    price!: number;
    
    // #endregion
    
    // #region METHODS
    
    /**
     * Calculates discounted price based on percentage
     * @param discountPercent Discount percentage (0-100)
     * @returns Discounted price
     */
    public calculateDiscount(discountPercent: number): number {
        return this.price * (1 - discountPercent / 100);
    }
    
    /**
     * Checks if product is in stock
     * @returns True if stock is greater than 0
     */
    public isInStock(): boolean {
        return this.stock > 0;
    }
    
    /**
     * Validates product data before save
     * @returns True if validation passes
     */
    private validateProductData(): boolean {
        return this.price > 0 && this.name.length > 0;
    }
    
    // #endregion
    
    // #region METHODS OVERRIDES
    
    /**
     * Override: Executes before saving product
     * Validates price is positive
     */
    public override beforeSave(): void {
        if (this.price < 0) {
            throw new Error('Price cannot be negative');
        }
    }
    
    /**
     * Override: Executes after successful save
     * Shows success message
     */
    public override afterSave(): void {
        Application.ApplicationUIService.showToast(
            `Product ${this.name} saved successfully`,
            ToastType.SUCCESS
        );
    }
    
    // #endregion
}
```

**Orden DENTRO de cada region:**

- **PROPERTIES**: Por orden de `@PropertyIndex` (si existe), sino por importancia lógica
- **METHODS**: 
  1. Métodos de utilidad propios del componente
  2. Ordenados alfabéticamente
- **METHODS OVERRIDES**:
  1. Métodos que sobrescriben clase padre
  2. Ordenados alfabéticamente

#### 6.2.5 Orden de Funciones

**REGLA OBLIGATORIA:**

Funciones dentro de la region **METHODS** DEBEN ordenarse:

1. **Métodos públicos de utilidad** (alfabético)
2. **Métodos protected de utilidad** (alfabético)
3. **Métodos private de utilidad** (alfabético)

Funciones dentro de la region **METHODS OVERRIDES** DEBEN ordenarse alfabéticamente.

**Aplicación:**

```typescript
// #region METHODS

// Públicos - Alfabético
public calculateDiscount(percent: number): number { }
public calculateTotal(): number { }
public getFormattedPrice(): string { }
public isInStock(): boolean { }

// Protected - Alfabético
protected formatCurrency(value: number): string { }
protected validatePrice(): boolean { }

// Private - Alfabético
private applyTax(amount: number): number { }
private roundToDecimals(value: number, decimals: number): number { }

// #endregion

// #region METHODS OVERRIDES

// Alfabético
public override afterSave(): void { }
public override beforeSave(): void { }
public override onSaving(): void { }

// #endregion
```

### 6.3 Reglas de Estructura de Componentes Vue

Esta sección establece reglas obligatorias para todos los aspectos de componentes Vue: estructura del bloque `<template>`, organización del bloque `<script>`, y formateo del bloque `<style>`.

#### 6.3.1 Estructura y Formateo del Bloque `<template>` en Componentes Vue

El bloque `<template>` en componentes Vue constituye la capa de presentación y DEBE seguir reglas estrictas de formateo y organización para garantizar legibilidad, mantenibilidad y prevención de código implícito no controlado.

##### 6.3.1.1 Expansión Obligatoria de Etiquetas HTML

**REGLA OBLIGATORIA:**

Todo HTML en bloques `<template>` de componentes Vue DEBE estar completamente expandido (desplegado).

**PROHIBICIÓN ABSOLUTA:** No puede haber más de **dos etiquetas** en la misma línea.

**Justificación:**

Esta regla garantiza:
- Legibilidad máxima del código de template
- Facilidad de debugging y localización de elementos
- Diffs de Git claros y precisos
- Prevención de líneas excesivamente largas
- Estructura visual jerárquica evidente

**Aplicación:**

```vue
<!-- CORRECTO - Etiquetas expandidas, máximo dos por línea -->
<template>
    <div class="product-card">
        <div class="product-header">
            <h2 class="product-title">{{ productName }}</h2>
            <span class="product-price">{{ formattedPrice }}</span>
        </div>
        <div class="product-body">
            <p class="product-description">
                {{ productDescription }}
            </p>
            <ul class="product-features">
                <li v-for="feature in features" :key="feature.id">
                    {{ feature.name }}
                </li>
            </ul>
        </div>
        <div class="product-actions">
            <button 
                :class="['btn', 'btn--primary', { 'btn--disabled': !isAvailable }]"
                :disabled="!isAvailable"
                @click="handleAddToCart"
            >
                Add to Cart
            </button>
        </div>
    </div>
</template>

<!-- INCORRECTO - Múltiples etiquetas en una línea -->
<template>
    <div class="product-card"><div class="product-header"><h2>{{ productName }}</h2></div></div>
</template>

<!-- INCORRECTO - Más de dos etiquetas por línea -->
<template>
    <div class="product-card"><div class="product-header"><h2 class="title">{{ productName }}</h2></div></div>
</template>

<!-- INCORRECTO - Etiquetas de cierre en línea con contenido complejo -->
<template>
    <div class="container"><span>{{ value }}</span><button @click="handler">Click</button></div>
</template>
```

**Casos Permitidos (máximo dos etiquetas por línea):**

```vue
<!-- CORRECTO - Etiqueta de apertura y cierre de contenedor simple en una línea -->
<template>
    <div class="container">
        <span>{{ simpleValue }}</span>
        <p>{{ simpleText }}</p>
    </div>
</template>

<!-- CORRECTO - Etiqueta auto-cerrada simple -->
<template>
    <div>
        <input type="text" />
        <br />
    </div>
</template>

<!-- CORRECTO - Dos etiquetas simples que forman unidad semántica -->
<template>
    <div>
        <label>Name:</label> <span>{{ name }}</span>
    </div>
</template>
```

**Excepciones NO permitidas:**

No existen excepciones. Incluso componentes simples DEBEN expandirse completamente.

##### 6.3.1.2 Prohibición de Código Implícito en Etiquetas

**REGLA OBLIGATORIA:**

En archivos Vue, **ninguna etiqueta puede contener código implícito**.

Todo código que deba ejecutarse (expresiones, operaciones, llamadas a métodos, operadores ternarios, lógica condicional) DEBE extraerse a una **variable computada** o **función** en el bloque `<script>`.

**PROHIBICIÓN ABSOLUTA:** Lógica de negocio, operaciones aritméticas, operadores ternarios, llamadas a métodos con argumentos complejos, o cualquier expresión que no sea una simple referencia a variable dentro de atributos o contenido de etiquetas.

**Justificación:**

Esta regla garantiza:
- Separación estricta entre presentación y lógica
- Testabilidad de código de negocio (las computeds y funciones son unit-testables)
- Legibilidad del template (el template debe ser declarativo, no imperativo)
- Reutilización de lógica
- Prevención de templates complejos e ilegibles
- Type safety completo en el script, no en el template

**Aplicación:**

```vue
<!-- INCORRECTO - Código implícito en template -->
<template>
    <div>
        <!-- PROHIBIDO - Operador ternario -->
        <span>{{ isActive ? 'Active' : 'Inactive' }}</span>
        
        <!-- PROHIBIDO - Operación aritmética -->
        <p>Total: ${{ price * quantity }}</p>
        
        <!-- PROHIBIDO - Llamada a método con expresión -->
        <button @click="saveProduct(product.id, isNew ? 'create' : 'update')">
            Save
        </button>
        
        <!-- PROHIBIDO - Lógica condicional compleja -->
        <div v-if="user && user.role === 'admin' && !user.isBlocked">
            Admin Panel
        </div>
        
        <!-- PROHIBIDO - Operaciones de string -->
        <h1>{{ 'Product: ' + product.name + ' (' + product.id + ')' }}</h1>
        
        <!-- PROHIBIDO - Acceso a propiedades anidadas con lógica -->
        <span>{{ product.category ? product.category.name : 'Uncategorized' }}</span>
    </div>
</template>

<!-- CORRECTO - Todo el código extraído a computeds y funciones -->
<template>
    <div>
        <!-- Variables computadas simples -->
        <span>{{ statusLabel }}</span>
        <p>{{ totalPrice }}</p>
        
        <!-- Funciones con parámetros simples -->
        <button @click="handleSaveProduct">
            Save
        </button>
        
        <!-- Computed para condición -->
        <div v-if="isAdminPanelVisible">
            Admin Panel
        </div>
        
        <!-- Computed para string formateado -->
        <h1>{{ productTitle }}</h1>
        
        <!-- Computed para lógica condicional -->
        <span>{{ categoryName }}</span>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, Ref, ComputedRef } from 'vue';

// Props
interface Props {
    product: Product;
    isNew: boolean;
}

const props = defineProps<Props>();

// Refs
const isActive: Ref<boolean> = ref(true);
const price: Ref<number> = ref(0);
const quantity: Ref<number> = ref(1);

// Computeds - Toda la lógica extraída aquí
const statusLabel: ComputedRef<string> = computed(() => {
    return isActive.value ? 'Active' : 'Inactive';
});

const totalPrice: ComputedRef<string> = computed(() => {
    return `Total: $${price.value * quantity.value}`;
});

const isAdminPanelVisible: ComputedRef<boolean> = computed(() => {
    return user.value !== null && 
           user.value.role === 'admin' && 
           !user.value.isBlocked;
});

const productTitle: ComputedRef<string> = computed(() => {
    return `Product: ${props.product.name} (${props.product.id})`;
});

const categoryName: ComputedRef<string> = computed(() => {
    return props.product.category ? props.product.category.name : 'Uncategorized';
});

// Funciones - Handlers extraídos
function handleSaveProduct(): void {
    const mode: string = props.isNew ? 'create' : 'update';
    saveProduct(props.product.id, mode);
}

function saveProduct(id: number, mode: string): void {
    // Lógica de guardado
}
</script>
```

**Excepciones Permitidas (únicamente):**

```vue
<!-- PERMITIDO - Referencias simples a variables -->
<template>
    <div>
        <span>{{ productName }}</span>
        <p>{{ price }}</p>
        <button :disabled="isLoading">Save</button>
    </div>
</template>

<!-- PERMITIDO - v-for y v-if con variables simples -->
<template>
    <ul>
        <li v-for="item in items" :key="item.id">
            {{ item.name }}
        </li>
    </ul>
    <div v-if="isVisible">
        Content
    </div>
</template>

<!-- PERMITIDO - Binding directo de props/variables -->
<template>
    <TextInputComponent 
        :value="productName"
        :label="labelText"
        :disabled="isReadonly"
        @input="handleInput"
    />
</template>
```

**Casos Límite:**

```vue
<!-- INCORRECTO - Incluso operaciones "simples" deben extraerse -->
<template>
    <!-- NO permitido -->
    <span>{{ count + 1 }}</span>
    <p>{{ price.toFixed(2) }}</p>
    <div>{{ items.length }}</div>
</template>

<!-- CORRECTO - Extraer a computeds -->
<template>
    <span>{{ nextCount }}</span>
    <p>{{ formattedPrice }}</p>
    <div>{{ itemCount }}</div>
</template>

<script setup lang="ts">
const nextCount: ComputedRef<number> = computed(() => count.value + 1);
const formattedPrice: ComputedRef<string> = computed(() => price.value.toFixed(2));
const itemCount: ComputedRef<number> = computed(() => items.value.length);
</script>
```

#### 6.3.2 Estructura del Bloque `<script>` en Componentes Vue (Composition API)

**REGLA OBLIGATORIA:**

Componentes Vue con Composition API (setup) DEBEN seguir el siguiente orden:

```vue
<script setup lang="ts">
// 1. Imports (según § 6.2.1)

// 2. Props (defineProps)

// 3. Emits (defineEmits)

// 4. Refs y Reactive

// 5. Computed

// 6. Watch

// 7. Lifecycle Hooks (onMounted, onUnmounted, etc.)

// 8. Funciones/Métodos (alfabético)
</script>
```

**Aplicación:**

```vue
<script setup lang="ts">
// 1. Imports
import { ref, computed, onMounted, Ref, ComputedRef } from 'vue';
import { BaseEntity } from '@/entities/base_entity';
import Application from '@/models/application';

// 2. Props
interface Props {
    entityClass: typeof BaseEntity;
    initialValue?: string;
}

const props = defineProps<Props>();

// 3. Emits
const emit = defineEmits<{
    save: [entity: BaseEntity];
    cancel: [];
}>();

// 4. Refs y Reactive
const entityObject: Ref<BaseEntity | null> = ref(null);
const isLoading: Ref<boolean> = ref(false);
const errorMessage: Ref<string> = ref('');

// 5. Computed
const isValid: ComputedRef<boolean> = computed(() => {
    return entityObject.value !== null && !isLoading.value;
});

const displayName: ComputedRef<string> = computed(() => {
    return entityObject.value?.getDefaultPropertyValue() || 'Unnamed';
});

// 6. Watch
watch(
    () => props.entityClass,
    (newClass: typeof BaseEntity) => {
        loadEntity(newClass);
    }
);

// 7. Lifecycle Hooks
onMounted((): void => {
    initializeComponent();
});

// 8. Funciones - Alfabético
function handleCancel(): void {
    emit('cancel');
}

function handleSave(): void {
    if (entityObject.value) {
        emit('save', entityObject.value);
    }
}

function initializeComponent(): void {
    isLoading.value = true;
    // ... inicialización
    isLoading.value = false;
}

async function loadEntity(entityClass: typeof BaseEntity): Promise<void> {
    try {
        entityObject.value = new entityClass();
    } catch (error: unknown) {
        errorMessage.value = 'Failed to load entity';
    }
}
</script>
```

#### 6.3.3 Estructura del Bloque `<style>` en Componentes Vue

**REGLA OBLIGATORIA:**

Todo componente Vue DEBE colocar el bloque `<style scoped>` al **final del archivo**, después de `<template>` y `<script>` incluso si los estilos individuales del componente no son requeridos.

Orden obligatorio de secciones:

```vue
<template>
  <!-- 1. Template -->
</template>

<script setup lang="ts">
// 2. Script
</script>

<style scoped>
/* 3. Estilos (al final) */
</style>
```

**Organización interna obligatoria del bloque `<style scoped>`:**

```vue
<style scoped>
/* 1. Selector raíz del componente */

/* 2. Elementos estructurales hijos */

/* 3. Modificadores y estados (--disabled, --active, --error, etc.) */

/* 4. Pseudo-clases (:hover, :focus, :active, etc.) */

/* 5. Media queries (responsive, al final) */
</style>
```

**Aplicación completa:**

```vue
<template>
    <div :class="['text-input-component', { 'text-input-component--disabled': disabled, 'text-input-component--error': hasError }]">
        <label :for="inputId" class="label">{{ label }}</label>
        <input
            :id="inputId"
            v-model="localValue"
            :type="type"
            :disabled="disabled"
            class="input"
        />
        <span v-if="errorMessage" class="error-message">{{ errorMessage }}</span>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, Ref, ComputedRef } from 'vue';

interface Props {
    label: string;
    modelValue: string;
    type?: string;
    disabled?: boolean;
    error?: string;
}

const props = withDefaults(defineProps<Props>(), {
    type: 'text',
    disabled: false,
    error: ''
});

const emit = defineEmits<{
    'update:modelValue': [value: string];
}>();

const localValue: ComputedRef<string> = computed({
    get: (): string => props.modelValue,
    set: (value: string): void => emit('update:modelValue', value)
});

const inputId: string = `text-input-${Math.random().toString(36).substring(7)}`;
const hasError: ComputedRef<boolean> = computed(() => !!props.error);
const errorMessage: ComputedRef<string> = computed(() => props.error);
</script>

<style scoped>
/* 1. Raíz */
.text-input-component {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-small);
}

/* 2. Elementos */
.label {
    color: var(--gray-medium);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
}

.input {
    padding: var(--padding-medium);
    border: 1px solid var(--border-gray);
    border-radius: var(--border-radius);
    background-color: var(--white);
    color: var(--gray-medium);
    font-size: var(--font-size-base);
    transition: border-color var(--transition-normal) ease,
                box-shadow var(--transition-normal) ease;
}

.error-message {
    color: var(--accent-red);
    font-size: var(--font-size-small);
}

/* 3. Modificadores */
.text-input-component--disabled {
    opacity: var(--opacity-disabled);
    cursor: not-allowed;
}

.text-input-component--error .input {
    border-color: var(--accent-red);
}

/* 4. Pseudo-clases */
.input:focus {
    outline: none;
    border-color: var(--btn-primary);
    box-shadow: 0 0 0 3px var(--focus-light);
}

.input:hover:not(:disabled) {
    border-color: var(--gray-dark);
}

.input:disabled {
    background-color: var(--gray-lighter);
    cursor: not-allowed;
}

/* 5. Media queries */
@media (max-width: 767px) {
    .text-input-component {
        gap: var(--spacing-xsmall);
    }
    
    .input {
        padding: var(--padding-small);
        font-size: var(--font-size-small);
    }
}
</style>
```

##### 6.3.3.1 Prohibición Absoluta de Variables CSS Locales

**REGLA FUNDAMENTAL:**

Los componentes Vue **NO PUEDEN DEFINIR VARIABLES CSS PROPIAS**.

Prohibido absolutamente:

```vue
<!-- PROHIBIDO - Variables locales -->
<style scoped>
:root {
    --local-spacing: 16px;  /* ← PROHIBIDO */
    --local-color: #3b82f6; /* ← PROHIBIDO */
}

.component {
    --component-padding: 20px;  /* ← PROHIBIDO */
    padding: var(--component-padding);
}
</style>

<!-- PROHIBIDO - Cualquier definición de variable -->
<style scoped>
.selector {
    --any-variable: value;  /* ← PROHIBIDO EN CUALQUIER FORMA */
}
</style>
```

Obligatorio:

```vue
<!-- CORRECTO - Solo consumo de tokens centralizados -->
<style scoped>
.component {
    padding: var(--spacing-medium);     /* ← Token de constants.css */
    color: var(--gray-medium);          /* ← Token de constants.css */
    border-radius: var(--border-radius); /* ← Token de constants.css */
}
</style>
```

**Razón contractual:**

La definición de variables CSS en componentes:
- Fragmenta el sistema de diseño unificado
- Crea duplicación no controlada de valores
- Rompe la fuente única de verdad (`constants.css`)
- Impide auditoría centralizada de tokens
- Viola el principio de tokenización universal establecido en `04-UI-DESIGN-SYSTEM-CONTRACT.md` § 6.4

**Flujo correcto:**

```
Desarrollador necesita valor CSS
    ↓
¿Existe en constants.css?
    ├─→ SÍ: Usar var(--token-name)
    └─→ NO: Agregar a constants.css PRIMERO, luego usar
    ↓
NUNCA definir variable local en componente
```

##### 6.3.3.2 Convención de Nombres de Clases

**REGLA OBLIGATORIA:**

Usar convención BEM simplificada o clases semánticas:

**Opción 1 - BEM simplificado:**

```vue
<style scoped>
/* Bloque */
.component-name { }

/* Elemento */
.component-name__element { }

/* Modificador */
.component-name--modifier { }

/* Elemento con modificador */
.component-name__element--modifier { }
</style>
```

**Opción 2 - Clases semánticas anidadas:**

```vue
<style scoped>
.component-name { }
.component-name .header { }
.component-name .body { }
.component-name.disabled { }
</style>
```

**Prohibido:**

- Clases genéricas sin prefijo: `.button`, `.input`, `.container` (colisionan)
- Clases abreviadas cripícas: `.btn-pri`, `.txt-inp`, `.cmp` (no descriptivas)
- Selectores por ID: `#elementId` (no reutilizables)
- Selectores de tipo sin clase: `div`, `span`, `button` (demasiado genéricos)

##### 6.3.3.3 Limitación de Anidación

**REGLA OBLIGATORIA:**

Máximo **3 niveles de anidación** de selectores.

```vue
<!-- CORRECTO - Máximo 3 niveles -->
<style scoped>
.component { }
.component .child { }
.component .child .grandchild { }
</style>

<!-- INCORRECTO - 4+ niveles -->
<style scoped>
.component .child .grandchild .great-grandchild { } /* ← PROHIBIDO */
</style>
```

**Refactorización obligatoria si excede 3 niveles:**

```vue
<!-- Antes (INCORRECTO) -->
<style scoped>
.form .row .input .icon { }  /* 4 niveles */
</style>

<!-- Después (CORRECTO) -->
<style scoped>
.form .row .input { }
.input-icon { }  /* Clase directa */
</style>
```

### 6.4 Reglas TypeScript Strict

#### 6.4.1 Prohibición Absoluta de 'any'

**REGLA OBLIGATORIA:**

El uso de tipo `any` está **PROHIBIDO ABSOLUTAMENTE**.

Todo código DEBE estar completamente tipado con tipos explícitos.

**Aplicación:**

```typescript
// CORRECTO - Tipado explícito
function processData(data: Product[]): string[] {
    return data.map((item: Product) => item.name);
}

function handleError(error: Error): void {
    console.error(error.message);
}

function parseResponse(response: AxiosResponse<Product>): Product {
    return response.data;
}

// Casos desconocidos usar 'unknown'
function handleUnknownError(error: unknown): void {
    if (error instanceof Error) {
        console.error(error.message);
    } else {
        console.error('Unknown error occurred');
    }
}

// INCORRECTO - Uso de 'any'
function processData(data: any): any {  // ← PROHIBIDO
    return data.map((item: any) => item.name);
}

function handleError(error: any): void {  // ← PROHIBIDO
    console.error(error.message);
}
```

**Excepciones NO permitidas:**

No existen excepciones válidas. Si el tipo es desconocido, usar `unknown` y hacer type narrowing.

**Catch blocks:**

```typescript
// CORRECTO - Error tipado explícitamente
try {
    await this.save();
} catch (error: unknown) {
    if (error instanceof Error) {
        console.error(error.message);
    } else {
        console.error('Unknown error');
    }
}

// INCORRECTO
try {
    await this.save();
} catch (error) {  // ← Implícitamente 'any', PROHIBIDO
    console.error(error.message);
}
```

#### 6.4.2 Tipos de Retorno Explícitos

**REGLA OBLIGATORIA:**

Toda función, método o arrow function DEBE declarar explícitamente su tipo de retorno.

Toda variable DEBE declarar explícitamente su tipo.

**Aplicación:**

```typescript
// CORRECTO - Tipos de retorno explícitos
public getName(): string {
    return this.name;
}

public async save(): Promise<Product> {
    const response: AxiosResponse<Product> = await axios.post(endpoint, data);
    return response.data;
}

public validateInputs(): boolean {
    return this.isRequired('name') && this.name.length > 0;
}

const calculateTotal = (items: Product[]): number => {
    return items.reduce((sum: number, item: Product) => sum + item.price, 0);
};

// Variables con tipo explícito
const count: number = 10;
const name: string = 'Product';
const isActive: boolean = true;
const product: Product | null = null;
const products: Product[] = [];

// INCORRECTO - Sin tipos explícitos
public getName() {  // ← Falta tipo de retorno
    return this.name;
}

public async save() {  // ← Falta Promise<Product>
    const response = await axios.post(endpoint, data);  // ← Falta tipo
    return response.data;
}

const count = 10;  // ← Falta tipo
const name = 'Product';  // ← Falta tipo
```

**Funciones void:**

```typescript
// CORRECTO - Declarar void explícitamente
public resetState(): void {
    this.count = 0;
    this.name = '';
}

public showMessage(message: string): void {
    console.log(message);
}

// INCORRECTO
public resetState() {  // ← Falta void
    this.count = 0;
}
```

#### 6.4.3 Parámetros con Tipos Explícitos

**REGLA OBLIGATORIA:**

Todo parámetro de función o método DEBE tener tipo explícito.

**Aplicación:**

```typescript
// CORRECTO
public calculateDiscount(price: number, discountPercent: number): number {
    return price * (1 - discountPercent / 100);
}

public findProduct(
    id: number,
    includeInactive: boolean = false
): Product | null {
    return this.products.find((p: Product) => p.id === id && (includeInactive || p.isActive)) || null;
}

public processItems(
    items: Product[],
    callback: (item: Product) => void
): void {
    items.forEach(callback);
}

// INCORRECTO
public calculateDiscount(price, discountPercent) {  // ← Sin tipos
    return price * (1 - discountPercent / 100);
}
```

#### 6.4.4 Enums sin Valores Explícitos

**REGLA OBLIGATORIA:**

Los enums DEBEN definirse utilizando únicamente nombres de variables.

PROHIBIDO asignar valores explícitos (numéricos o strings) a enums.

Un enum es un enum definido por sus nombres identificadores, no por valores asignados.

**Aplicación:**

```typescript
// CORRECTO - Solo nombres
enum ViewTypes {
    ListView,
    DetailView,
    DefaultView,
}

enum ProductStatus {
    Active,
    Inactive,
    Discontinued,
    OutOfStock,
}

enum UserRole {
    Admin,
    Manager,
    User,
    Guest,
}

// Uso
const currentView: ViewTypes = ViewTypes.ListView;
const status: ProductStatus = ProductStatus.Active;

// INCORRECTO - Con valores asignados
enum ViewTypes {
    ListView = 'list',        // ← PROHIBIDO
    DetailView = 'detail',    // ← PROHIBIDO
    DefaultView = 'default',  // ← PROHIBIDO
}

enum ProductStatus {
    Active = 1,       // ← PROHIBIDO
    Inactive = 2,     // ← PROHIBIDO
    Discontinued = 3, // ← PROHIBIDO
}

enum UserRole {
    Admin = 'ADMIN',      // ← PROHIBIDO
    Manager = 'MANAGER',  // ← PROHIBIDO
    User = 'USER',        // ← PROHIBIDO
}
```

**Razón:**

Los enums TypeScript generan valores numéricos automáticamente (0, 1, 2, ...). Asignar valores explícitos introduce complejidad innecesaria, riesgo de colisiones y dependencia de valores mágicos. Los nombres de enum deben ser lo suficientemente descriptivos por sí mismos.

**Cuando se necesitan valores string para API:**

```typescript
// CORRECTO - Usar mapeo separado
enum ViewTypes {
    ListView,
    DetailView,
    DefaultView,
}

const ViewTypeStrings: Record<ViewTypes, string> = {
    [ViewTypes.ListView]: 'list',
    [ViewTypes.DetailView]: 'detail',
    [ViewTypes.DefaultView]: 'default',
};

// Uso
function getViewString(view: ViewTypes): string {
    return ViewTypeStrings[view];
}
```

#### 6.4.5 Interfaces sobre Types

**REGLA OBLIGATORIA:**

Siempre usar **interfaces** para definir estructuras de objetos.

Siempre usar **enums** para definir conjuntos de valores fijos.

**Aplicación:**

```typescript
// CORRECTO - Interfaces para objetos
interface Product {
    id: number;
    name: string;
    price: number;
    isActive: boolean;
}

interface ProductConfig {
    maxPrice: number;
    minStock: number;
    categories: string[];
}

interface ApiResponse<T> {
    data: T;
    status: number;
    message: string;
}

// CORRECTO - Enums para conjuntos fijos
enum ProductStatus {
    Active,
    Inactive,
    Discontinued,
}

// CORRECTO - Types para casos específicos (unions, intersections, mapped)
type ProductId = number;
type ProductName = string;
type ProductOrNull = Product | null;
type ReadonlyProduct = Readonly<Product>;
type PartialProduct = Partial<Product>;

// INCORRECTO - Type para objeto (debería ser interface)
type Product = {  // ← Debería ser interface
    id: number;
    name: string;
};
```

**Cuándo usar Type:**

- Unions: `type Status = 'active' | 'inactive';`
- Intersections: `type Extended = BaseType & AdditionalProps;`
- Mapped types: `type Readonly<T> = { readonly [P in keyof T]: T[P] };`
- Aliases de primitivos: `type ProductId = number;`

**Cuándo usar Interface:**

- Estructuras de objetos
- Contratos de API
- Props de componentes Vue
- Modelos de datos
- Cualquier estructura que pueda extenderse

### 6.5 Reglas de Documentación Obligatoria

#### 6.5.1 JSDoc en Propiedades de Clases

**REGLA OBLIGATORIA:**

Toda propiedad pública de clase DEBE tener comentario JSDoc que describa su propósito y utilidad real.

**Aplicación:**

```typescript
export class Product extends BaseEntity {
    
    /**
     * Unique identifier for the product in the database
     */
    @PropertyName('ID', Number)
    @Required(true)
    id!: number;
    
    /**
     * Display name of the product shown to users
     */
    @PropertyName('Name', String)
    @Required(true)
    name!: string;
    
    /**
     * Product price in USD, must be greater than 0
     */
    @PropertyName('Price', Number)
    @Required(true)
    price!: number;
    
    /**
     * Current stock quantity available for sale
     * Defaults to 0 on new products
     */
    @PropertyName('Stock', Number)
    stock!: number;
    
    /**
     * Indicates if the product is currently available for purchase
     */
    @PropertyName('Active', Boolean)
    isActive!: boolean;
}
```

**Propiedades private/protected:**

```typescript
export class Product extends BaseEntity {
    
    /**
     * Internal cache for calculated discount
     * Cleared on price changes
     */
    private cachedDiscount: number | null = null;
    
    /**
     * Original price before any modifications
     * Used for discount calculations
     */
    protected originalPrice: number = 0;
}
```

#### 6.5.2 JSDoc en Métodos y Funciones

**REGLA OBLIGATORIA:**

Todo método o función pública DEBE tener JSDoc que incluya:
- Descripción de propósito
- `@param` para cada parámetro (nombre, tipo, descripción)
- `@returns` para valor de retorno (tipo, descripción)
- `@throws` si puede lanzar errores (opcional pero recomendado)

**Aplicación:**

```typescript
/**
 * Calculates the discounted price based on percentage
 * @param discountPercent Discount percentage to apply (0-100)
 * @returns Final price after applying discount
 * @throws Error if discountPercent is negative or greater than 100
 */
public calculateDiscount(discountPercent: number): number {
    if (discountPercent < 0 || discountPercent > 100) {
        throw new Error('Discount percent must be between 0 and 100');
    }
    return this.price * (1 - discountPercent / 100);
}

/**
 * Validates if the product has sufficient stock for order
 * @param requestedQuantity Quantity requested by customer
 * @returns True if sufficient stock is available, false otherwise
 */
public hasStock(requestedQuantity: number): boolean {
    return this.stock >= requestedQuantity;
}

/**
 * Saves the product to the database via API
 * Executes validation before save and triggers lifecycle hooks
 * @returns Promise resolving to saved product with updated data
 * @throws Error if validation fails or API request fails
 */
public async save(): Promise<Product> {
    await this.validateInputs();
    const response: AxiosResponse<Product> = await Application.axiosInstance.post(
        this.getApiEndpoint(),
        this.toPersistentObject()
    );
    return response.data;
}

/**
 * Formats the price as currency string with symbol
 * @param includeSymbol If true, includes $ symbol prefix
 * @returns Formatted price string (e.g., "$99.99" or "99.99")
 */
public formatPrice(includeSymbol: boolean = true): string {
    const formatted: string = this.price.toFixed(2);
    return includeSymbol ? `$${formatted}` : formatted;
}
```

**Métodos sin parámetros o sin retorno:**

```typescript
/**
 * Resets the product to default state
 * Clears all modified properties and restores original values
 */
public resetToDefaults(): void {
    this.name = '';
    this.price = 0;
    this.stock = 0;
    this.isActive = false;
}

/**
 * Retrieves the current stock quantity
 * @returns Current stock available for sale
 */
public getStock(): number {
    return this.stock;
}
```

#### 6.5.3 Comentarios en Constructores

**REGLA OBLIGATORIA:**

Constructores DEBEN tener JSDoc que describa:
- Propósito del constructor
- `@param` para cada parámetro con descripción de su uso
- Inicializaciones importantes que realiza

**Aplicación:**

```typescript
/**
 * Creates a new Product instance
 * Initializes all properties with default values and calls parent constructor
 * @param id Product unique identifier (optional, defaults to 0)
 * @param name Product display name (optional, defaults to empty string)
 */
constructor(id: number = 0, name: string = '') {
    super();
    this.id = id;
    this.name = name;
    this.price = 0;
    this.stock = 0;
    this.isActive = true;
}

/**
 * Creates a new ProductService instance
 * Initializes axios client and configures default headers
 * @param baseUrl Base URL for product API endpoints
 * @param timeout Request timeout in milliseconds (default: 5000)
 */
constructor(
    private readonly baseUrl: string,
    private readonly timeout: number = 5000
) {
    this.initializeClient();
}
```

#### 6.5.4 Comentarios Inline

**REGLA OBLIGATORIA:**

Comentarios inline (una línea) DEBEN utilizarse para:
- Explicar lógica compleja o no obvia
- Marcar secciones de código (regions)
- Advertir sobre edge cases o comportamientos especiales

**Aplicación:**

```typescript
public async processOrder(orderId: number): Promise<void> {
    // Load order with related products
    const order: Order = await this.loadOrder(orderId);
    
    // Validate stock availability before processing
    for (const item of order.items) {
        if (!item.product.hasStock(item.quantity)) {
            throw new Error(`Insufficient stock for product ${item.product.name}`);
        }
    }
    
    // Calculate total with tax and discounts
    let total: number = 0;
    for (const item of order.items) {
        const subtotal: number = item.product.price * item.quantity;
        const discount: number = item.product.calculateDiscount(item.discountPercent);
        total += subtotal - discount;
    }
    
    // Apply tax rate (10%)
    const tax: number = total * 0.10;
    total += tax;
    
    order.total = total;
    await order.save();
}
```

**Prohibido:**

```typescript
// INCORRECTO - Comentarios obvios o redundantes
const count: number = 0;  // Initialize count to 0  ← Obvio
this.name = name;  // Set name  ← Redundante

// INCORRECTO - Comentarios que repiten el código
// Get product name
const name: string = this.getName();
```

### 6.6 Reglas de Git Conventions

#### 6.6.1 Formato de Commit Messages

**REGLA OBLIGATORIA:**

Commits DEBEN escribirse en **inglés** y seguir formato estructurado:

```
type(scope): subject

body (opcional)

footer (opcional)
```

**Tipos válidos:**

- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Formateo de código (no afecta lógica)
- `refactor`: Refactorización de código
- `perf`: Mejora de performance
- `test`: Agregar o modificar tests
- `chore`: Cambios en build, configs, dependencias

**Aplicación:**

```bash
# CORRECTO - Commits en inglés con formato estructurado
git commit -m "feat(entities): add Customer entity with CRUD operations"
git commit -m "fix(decorators): correct @Required validation message for empty strings"
git commit -m "docs(contract): update 00-CONTRACT.md with section 6.9"
git commit -m "refactor(base-entity): extract validation logic to separate method"
git commit -m "style(product): apply 4-space indentation and trailing commas"
git commit -m "perf(list-view): optimize rendering with virtual scrolling"

# Con body
git commit -m "feat(entities): add Product entity

- Implement CRUD operations
- Add validation for price and stock
- Configure API endpoint /api/products
- Document all properties with JSDoc"

# INCORRECTO - En español
git commit -m "agregado entidad Customer con operaciones CRUD"
git commit -m "corregido bug en decorador @Required"

# INCORRECTO - Sin formato
git commit -m "changes"
git commit -m "fix stuff"
git commit -m "work in progress"
```

**Scope:**

- `entities`: Cambios en entidades
- `decorators`: Cambios en decoradores
- `components`: Cambios en componentes Vue
- `application`: Cambios en Application singleton
- `contract`: Cambios en contratos (documentación)
- `ui`: Cambios en UI/CSS
- `config`: Cambios en configuración (tsconfig, vite, etc.)

#### 6.6.2 Formato de Branch Names

**REGLA OBLIGATORIA:**

Branches DEBEN seguir formato: `type/short-description-in-english`

**Aplicación:**

```bash
# CORRECTO
git checkout -b feature/customer-entity
git checkout -b fix/validation-bug
git checkout -b docs/update-contract-06
git checkout -b refactor/base-entity-cleanup
git checkout -b style/apply-code-standards

# INCORRECTO
git checkout -b nueva-funcionalidad  # ← En español
git checkout -b fix_stuff             # ← Underscore
git checkout -b temp                  # ← No descriptivo
```

#### 6.6.3 Autorización de Commits

**REGLA OBLIGATORIA:**

Los commits **SOLO** pueden realizarse con **autorización explícita del usuario**.

Ningún agente de IA puede ejecutar `git commit` sin autorización previa.

**Flujo obligatorio:**

```
IA genera código
    │
    ├─→ IA propone cambios al usuario
    │
    ├─→ Usuario revisa cambios
    │
    ├─→ Usuario autoriza: "puedes hacer commit"
    │
    └─→ IA ejecuta commit con mensaje en inglés
```

**Aplicación:**

```typescript
// En conversación con usuario:
// IA: "He completado los cambios en Product entity. 
//      ¿Autoriza realizar commit con mensaje:
//      'feat(entities): add Product entity with CRUD operations'?"
//
// Usuario: "Sí, autorizado"
//
// IA ejecuta:
// git add src/entities/product.ts
// git commit -m "feat(entities): add Product entity with CRUD operations"
```

**PROHIBIDO:**

```typescript
// IA NO puede hacer:
git commit -m "changes"  // ← Sin autorización del usuario
```

### 6.7 Integración con tsconfig.json

**REGLA OBLIGATORIA:**

Toda configuración establecida en `tsconfig.json` es vinculante y DEBE respetarse.

**Configuraciones vinculantes:**

```json
{
  "compilerOptions": {
    "strict": true,                    // ← OBLIGATORIO - Modo estricto (§ 6.4)
    "noUnusedLocals": true,            // ← OBLIGATORIO - No variables sin usar
    "noUnusedParameters": true,        // ← OBLIGATORIO - No parámetros sin usar
    "noFallthroughCasesInSwitch": true,// ← OBLIGATORIO - Switch exhaustivo
    "experimentalDecorators": true,    // ← OBLIGATORIO - Requerido por arquitectura
    "emitDecoratorMetadata": true      // ← OBLIGATORIO - Requerido por arquitectura
  }
}
```

**Prohibiciones derivadas:**

- **Variables sin usar:** Todo `const`, `let`, `var` debe utilizarse o eliminarse
- **Parámetros sin usar:** Si un parámetro no se usa, prefijo con `_` (ej: `_unusedParam`)
- **Decoradores:** Configuración inmutable por MI LÓGICA (A4)

**Aplicación:**

```typescript
// CORRECTO - No variables sin usar
public calculateTotal(items: Product[]): number {
    const total: number = items.reduce(
        (sum: number, item: Product) => sum + item.price,
        0
    );
    return total;  // ← Variable usada
}

// CORRECTO - Parámetro sin usar con prefijo
public override beforeSave(_context?: unknown): void {
    // _context no se usa pero es parte de la firma
    this.validatePrice();
}

// INCORRECTO - Variable declarada pero no usada
public calculateTotal(items: Product[]): number {
    const count: number = items.length;  // ← Declarada pero no usada, ERROR
    return items.reduce(
        (sum: number, item: Product) => sum + item.price,
        0
    );
}
```

### 6.8 Herramientas de Enforcement (Configuraciones)

#### 6.8.1 EditorConfig (.editorconfig)

**REGLA OBLIGATORIA:**

Archivo `.editorconfig` DEBE existir en raíz del proyecto con siguiente configuración:

```ini
# .editorconfig
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.{ts,js,vue}]
indent_style = space
indent_size = 4

[*.{json,md}]
indent_size = 2

[*.vue]
indent_size = 4
```

#### 6.8.2 Archivo de Configuración ESLint (Futuro)

**NOTA CONTRACTUAL:**

Actualmente el proyecto NO tiene ESLint configurado. Este contrato establece bases para futura implementación cuando se autorice.

**Configuración recomendada (pendiente de autorización):**

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:vue/vue3-recommended"
  ],
  "rules": {
    "indent": ["error", 4],
    "quotes": ["error", "single"],
    "semi": ["error", "always"],
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "comma-dangle": ["error", "always-multiline"]
  }
}
```

## 7. Prohibiciones

### 7.1 Prohibiciones de Formateo

PROHIBIDO:
- Usar tabs para indentación (solo espacios)
- Usar indentación diferente a 4 espacios
- Omitir semicolons
- Concatenar strings con `+` cuando hay variables (usar template literals)
- Omitir trailing commas en estructuras multilinea
- Omitir espacios en operadores y llaves
- Usar comillas dobles sin razón justificada

### 7.2 Prohibiciones de Estructura

PROHIBIDO:
- Desordenar imports (debe seguir jerarquía § 6.2.1)
- Omitir regions en clases (PROPERTIES, METHODS, METHODS OVERRIDES)
- Mezclar orden de funciones (debe ser: utilidad → overrides → alfabético)
- Definir funciones antes que variables en mismo scope
- Importar types mezclados con clases (types van al final)

### 7.3 Prohibiciones TypeScript

PROHIBIDO:
- Usar tipo `any` bajo cualquier circunstancia
- Omitir tipos de retorno en funciones/métodos
- Omitir tipos de parámetros
- Omitir tipos en declaraciones de variables
- Asignar valores explícitos a enums (numéricos o strings)
- Usar `type` para definir objetos (usar `interface`)
- Dejar variables o parámetros sin usar sin prefijo `_`

### 7.4 Prohibiciones de Documentación

PROHIBIDO:
- Omitir JSDoc en propiedades públicas de clases
- Omitir JSDoc en métodos públicos
- Omitir `@param` en parámetros de funciones documentadas
- Omitir `@returns` en funciones que retornan valores
- Escribir comentarios obvios o redundantes
- Documentar código en español (siempre inglés)

### 7.5 Prohibiciones Git

PROHIBIDO:
- Escribir commits en español (solo inglés)
- Commits sin formato estructurado (type(scope): subject)
- Realizar commits sin autorización del usuario
- Branch names en español
- Mensajes de commit vagos ("changes", "fix", "update")

### 7.6 Prohibiciones Generales

PROHIBIDO:
- Desactivar flags de `strict: true` en tsconfig.json sin Breaking Change autorizado
- Introducir convenciones de código no documentadas en este contrato
- Modificar configuración de decoradores (`experimentalDecorators`, `emitDecoratorMetadata`)
- Generar código que viole 00-CONTRACT.md MI LÓGICA (A1-A4)
- Generar código que viole 05-ENFORCEMENT § 6.8 (Naming Conventions)

## 8. Dependencias

### 8.1 Dependencias de Contratos

Este contrato depende de:

- **[00-CONTRACT.md](00-CONTRACT.md)** - Contrato principal que establece MI LÓGICA y estructura documental
  - § 6.7: Formato de 11 secciones (aplicado en este contrato)
  - § 6.7.2: Principio de Inmutabilidad (tsconfig decorators inmutables)
  - § 6.7.3: Principio Anti-Alucinación (reglas explícitas previenen alucinaciones)

- **[05-ENFORCEMENT-TECHNICAL-CONTRACT.md](05-ENFORCEMENT-TECHNICAL-CONTRACT.md)** - Sistema de enforcement
  - § 5.4: Autoverificación Obligatoria del Modelo (AOM) - IA debe declarar cumplimiento de este contrato
  - § 6.8: Coherencia de Naming Conventions - Reforzado y extendido por este contrato
  - § 6.8.1: Naming Conventions Autorizadas - Integradas en § 6.9 de este contrato

### 8.2 Dependencias de Configuración

Este contrato refuerza y depende de:

- **tsconfig.json** - Configuración TypeScript vinculante
  - `strict: true` - Reforzado por § 6.4
  - `experimentalDecorators: true` - Obligatorio por MI LÓGICA A4
  - `noUnusedLocals`, `noUnusedParameters` - Reforzados por § 6.7

- **.editorconfig** - Configuración de editor (debe crearse según § 6.8.1)

### 8.3 Dependencias de Arquitectura

Este contrato es compatible con:

- **[01-FRAMEWORK-OVERVIEW.md](01-FRAMEWORK-OVERVIEW.md)** - Arquitectura de 5 capas
- **[02-FLOW-ARCHITECTURE.md](02-FLOW-ARCHITECTURE.md)** - Flujos del sistema
- **[04-UI-DESIGN-SYSTEM-CONTRACT.md](04-UI-DESIGN-SYSTEM-CONTRACT.md)** - Sistema UI/CSS (no se superpone)

## 9. Relaciones

### 9.1 Relación con 00-CONTRACT.md

Este contrato es **subordinado** a [00-CONTRACT.md](00-CONTRACT.md).

**Subordinación:**

```
MI LÓGICA (A1-A4) - Autoridad Suprema
    ↓
00-CONTRACT.md
    ↓
06-CODE-STYLING-STANDARDS.md (Este Contrato)
```

En caso de conflicto, prevalece 00-CONTRACT.md.

**Aplicación de MI LÓGICA:**

- **A4 (Inmutabilidad Estructural):** TypeScript + Decoradores inmutables → Configuración `tsconfig.json` con `experimentalDecorators: true` es **contractualmente inmutable** (§ 6.7)

### 9.2 Relación con 05-ENFORCEMENT-TECHNICAL-CONTRACT.md

Este contrato **refuerza y extiende** [05-ENFORCEMENT-TECHNICAL-CONTRACT.md](05-ENFORCEMENT-TECHNICAL-CONTRACT.md) § 6.8.

**Refuerzo:**

- 05-ENF § 6.8 define **naming conventions** (PascalCase, camelCase, etc.)
- Este contrato (06-CST § 6.9) **refuerza** esas convenciones agregando reglas de formateo

**Autoverificación Obligatoria (AOM):**

Agentes de IA DEBEN declarar cumplimiento de este contrato al generar código:

```typescript
// Declaración AOM (según 05-ENF § 5.4):
// ✓ Cumplo 06-CODE-STYLING § 6.1.1: Indentación 4 espacios aplicada
// ✓ Cumplo 06-CODE-STYLING § 6.1.3: Template literals usados en líneas 15, 32, 47
// ✓ Cumplo 06-CODE-STYLING § 6.4.1: Tipado explícito sin 'any'
// ✓ Cumplo 06-CODE-STYLING § 6.5.1: JSDoc en todas propiedades públicas
// ✓ Cumplo 06-CODE-STYLING § 6.2.4: Regions aplicadas (PROPERTIES, METHODS, OVERRIDES)
// ✓ Cumplo 05-ENF § 6.8.1: Naming conventions respetadas (PascalCase para clases)
```

### 9.3 Relación con 04-UI-DESIGN-SYSTEM-CONTRACT.md

Este contrato **NO se superpone** con [04-UI-DESIGN-SYSTEM-CONTRACT.md](04-UI-DESIGN-SYSTEM-CONTRACT.md).

**Separación de responsabilidades:**

- **04-UI-DESIGN-SYSTEM:** Regula CSS, tokens, styling visual (archivos `.css`)
- **06-CODE-STYLING:** Regula TypeScript, JavaScript, Vue script (archivos `.ts`, `.js`, `.vue`)

**En archivos Vue:**

```vue
<!-- 04-UI regula <style> -->
<style scoped>
.product-card {
    padding: var(--spacing-medium);  /* ← 04-UI § 6.4 */
}
</style>

<!-- 06-CODE-STYLING regula <script> -->
<script setup lang="ts">
// 06-CST § 6.1.1: 4 espacios
// 06-CST § 6.4.1: Tipado explícito
const count: Ref<number> = ref(0);
</script>
```

### 9.4 Integración en Ecosystem Contractual

```
┌─────────────────────────────────────────────────┐
│             MI LÓGICA (A1-A4)                   │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│          00-CONTRACT.md (Master)                │
│  - MI LÓGICA Suprema                            │
│  - Formato 11 secciones                         │
│  - Cambios Mayores                              │
└───────┬──────────────────────────┬──────────────┘
        │                          │
        ▼                          ▼
┌───────────────┐        ┌─────────────────────┐
│ 05-ENFORCEMENT│◄───────┤ 06-CODE-STYLING     │
│ § 6.8 Naming  │        │ (Este Contrato)     │
│               │────────► Refuerza Naming      │
│               │        │ + Formateo          │
└───────────────┘        │ + Estructura        │
                         │ + TypeScript        │
                         │ + Documentación     │
                         │ + Git               │
                         └─────────────────────┘
```

## 10. Notas de Implementación

### 10.1 Aplicabilidad Inmediata

Este contrato es **ACTIVO Y VINCULANTE** desde su fecha de creación: 15 de Febrero, 2026.

Todo código generado, modificado o revisado a partir de esta fecha DEBE cumplir con las reglas establecidas.

### 10.2 Código Existente (Legacy)

Código escrito **antes** de este contrato:
- No requiere refactorización inmediata
- Debe refactorizarse progresivamente cuando se modifique
- Todo cambio en archivo legacy debe aplicar este contrato al código modificado

### 10.3 Prioridades de Aplicación

**Alta prioridad** (aplicar inmediatamente):
1. § 6.1.3: Template literals (PROHIBIDO concatenación `+`)
2. § 6.4.1: Prohibición de `any`
3. § 6.4.2: Tipos de retorno explícitos
4. § 6.6.3: Autorización de commits

**Media prioridad** (aplicar en refactorizaciones):
1. § 6.2.4: Regions (PROPERTIES, METHODS, OVERRIDES)
2. § 6.5: Documentación JSDoc completa
3. § 6.2.1: Import order estricto

**Baja prioridad** (aplicar cuando sea conveniente):
1. § 6.1.5: Separación de parámetros
2. § 6.2.5: Orden alfabético de funciones

### 10.4 Checklist de Verificación Pre-Commit

Antes de commit, verificar:

- [ ] § 6.1.1: Indentación 4 espacios
- [ ] § 6.1.2: Comillas simples por defecto
- [ ] § 6.1.3: Template literals usado (sin `+`)
- [ ] § 6.1.4: Semicolons presentes
- [ ] § 6.1.6: Trailing commas en multilinea
- [ ] § 6.1.7: Spacing en operadores y llaves
- [ ] § 6.2.1: Imports ordenados correctamente
- [ ] § 6.2.4: Regions aplicadas en clases (PROPERTIES, METHODS, OVERRIDES)
- [ ] § 6.4.1: Sin uso de `any`
- [ ] § 6.4.2: Tipos de retorno explícitos
- [ ] § 6.4.4: Enums sin valores asignados
- [ ] § 6.5.1: JSDoc en propiedades públicas
- [ ] § 6.5.2: JSDoc en métodos públicos
- [ ] § 6.6.1: Commit message en inglés con formato
- [ ] § 6.6.3: Autorización del usuario obtenida
- [ ] 05-ENF § 6.8.1: Naming conventions respetadas

### 10.5 Herramientas Recomendadas (Futuro)

**ESLint** (pendiente de configuración):
- Instalar: `npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin`
- Configurar según § 6.8.2
- Ejecutar: `npm run lint`

**Prettier** (pendiente de configuración):
- Instalar: `npm install --save-dev prettier`
- Configurar: 4 espacios, single quotes, trailing commas
- Ejecutar: `npm run format`

**Husky + lint-staged** (pendiente de configuración):
- Pre-commit hooks automáticos
- Validación antes de commit

**Nota:** Estas herramientas requieren autorización vía proceso de Breaking Change (05-ENF § 6.4).

### 10.6 Métricas de Compliance

**Objetivo:** 100% de cumplimiento en código nuevo

**Medición:**
- Commits rechazados por violación de reglas
- Code reviews enfocados en este contrato
- Auditorías periódicas de código

**No aceptable:**
- Código con `any`
- Concatenación con `+` en strings dinámicos
- Commits sin autorización
- Código sin JSDoc en propiedades/métodos públicos

### 10.7 Formación y Onboarding

**Nuevos desarrolladores:**
1. Leer [00-CONTRACT.md](00-CONTRACT.md) (MI LÓGICA)
2. Leer [05-ENFORCEMENT-TECHNICAL-CONTRACT.md](05-ENFORCEMENT-TECHNICAL-CONTRACT.md) § 6.8
3. Leer este contrato (06-CODE-STYLING-STANDARDS.md)
4. Revisar ejemplos de código conforme
5. Practicar con code review de pares

**Agentes de IA:**
1. Cargar contratos en contexto
2. Declarar cumplimiento vía AOM (05-ENF § 5.4)
3. Aplicar reglas en código generado
4. Solicitar autorización para commits

### 10.8 Evolución del Contrato

**Agregar nuevas reglas:**
- Requiere autorización de arquitecto
- Registrar en [BREAKING-CHANGES.md](BREAKING-CHANGES.md) si afecta código existente
- Actualizar checklist § 10.4

**Modificar reglas existentes:**
- Proceso de Breaking Change (05-ENF § 6.4)
- Justificación técnica demostrable
- Impacto en código legacy evaluado

## 11. Referencias Cruzadas

### 11.1 Referencias Directas a Otros Contratos

- **[00-CONTRACT.md](00-CONTRACT.md)** - Contrato principal
  - § 3: MI LÓGICA (A1-A4) - Axiomas inmutables
  - § 6.2: Autorización de Cambios Mayores
  - § 6.7: Formato de 11 secciones (aplicado en este contrato)
  - § 6.7.2: Principio de Inmutabilidad
  - § 6.7.3: Principio Anti-Alucinación

- **[05-ENFORCEMENT-TECHNICAL-CONTRACT.md](05-ENFORCEMENT-TECHNICAL-CONTRACT.md)** - Enforcement técnico
  - § 5.4: Autoverificación Obligatoria del Modelo (AOM)
  - § 6.4: Política de Breaking Changes
  - § 6.6: Registro de Excepciones
  - § 6.8: Coherencia de Naming Conventions (reforzado por § 6.9 de este contrato)
  - § 6.8.1: Naming Conventions Autorizadas (integradas en este contrato)

- **[04-UI-DESIGN-SYSTEM-CONTRACT.md](04-UI-DESIGN-SYSTEM-CONTRACT.md)** - Sistema UI/CSS
  - Separación de responsabilidades: UI/CSS vs TypeScript/JS

- **[BREAKING-CHANGES.md](BREAKING-CHANGES.md)** - Registro de breaking changes
  - Consultar para cambios en configuración TypeScript

- **[EXCEPCIONES.md](EXCEPCIONES.md)** - Registro de excepciones
  - Consultar para excepciones autorizadas a reglas de este contrato

### 11.2 Archivos de Configuración Vinculados

- **tsconfig.json** - Configuración TypeScript vinculante
  - § 6.7 de este contrato refuerza configuraciones

- **.editorconfig** - Configuración de editor
  - § 6.8.1 de este contrato especifica contenido obligatorio

### 11.3 Documentación Relacionada

- **[01-FRAMEWORK-OVERVIEW.md](01-FRAMEWORK-OVERVIEW.md)** - Arquitectura general
- **[02-FLOW-ARCHITECTURE.md](02-FLOW-ARCHITECTURE.md)** - Flujos del sistema
- **[03-QUICK-START.md](03-QUICK-START.md)** - Guía de inicio rápido

### 11.4 Documentación de Capas

- **[layers/01-decorators/README.md](layers/01-decorators/README.md)** - Sistema de decoradores
- **[layers/02-base-entity/README.md](layers/02-base-entity/README.md)** - BaseEntity
- **[layers/03-application/README.md](layers/03-application/README.md)** - Application singleton

### 11.5 Ejemplos de Código Conforme

- **[examples/classic-module-example.md](examples/classic-module-example.md)** - Módulo CRUD clásico
- **[examples/advanced-module-example.md](examples/advanced-module-example.md)** - Módulo avanzado
- **[tutorials/01-basic-crud.md](tutorials/01-basic-crud.md)** - Tutorial CRUD básico

### 11.6 Índices Maestros

- **[INDEX-MASTER.md](INDEX-MASTER.md)** - Navegación semántica completa
- **[copilot/README.md](README.md)** - Punto de entrada documentación

---

**FIN DEL CONTRATO 06-CODE-STYLING-STANDARDS.md**

**Versión:** 1.0.0  
**Estado:** ACTIVO Y VINCULANTE  
**Próxima Revisión:** Según necesidad o solicitud de arquitecto
