# ViewGroupRow Decorator

## 1. Propósito

Controlar el layout de columnas de propiedades dentro de grupos visuales en formularios generados automáticamente, especificando si campos se renderizan en una sola columna (SINGLE), dos columnas lado a lado (PAIR), o tres columnas (TRIPLE) mediante enum ViewGroupRow.

## 2. Alcance

### 2.1 Responsabilidades

- Asignar tipo de layout ViewGroupRow a propiedades específicas
- Determinar número de columnas para renderizado de campos en formulario
- Proporcionar método getViewGroupRows() para acceso a metadata de layout
- Permitir optimización de espacio horizontal en formularios
- Habilitar layouts responsivos adaptables a ancho de pantalla
- Soportar configuración combinada con @ViewGroup para organización completa

### 2.2 Límites

- No controla responsive breakpoints (responsabilidad de CSS)
- No valida que propiedades PAIR o TRIPLE sean compatibles visualmente
- No garantiza que propiedades agrupadas tengan mismo ViewGroupRow
- No afecta serialización, persistencia ni validación de propiedades
- No determina orden de propiedades (requiere @PropertyIndex)
- No crea dependencias funcionales entre propiedades en mismo row

## 3. Definiciones Clave

**ViewGroupRow Enum**: Enumeración que define tipos de layout de columnas: SINGLE (1 columna), PAIR (2 columnas), TRIPLE (3 columnas).

**ViewGroupRow.SINGLE**: Valor por defecto, propiedad ocupa ancho completo de formulario (100% width), renderizada una por fila.

**ViewGroupRow.PAIR**: Propiedad renderizada en 2 columnas, ocupando 50% width, dos propiedades PAIR lado a lado en misma fila.

**ViewGroupRow.TRIPLE**: Propiedad renderizada en 3 columnas, ocupando 33% width, tres propiedades TRIPLE lado a lado en misma fila.

**ViewGroupRow Map**: Estructura Record<string, ViewGroupRow> que mapea nombres de propiedades a sus layouts asignados.

**Row Grouping**: Algoritmo que agrupa propiedades consecutivas con mismo ViewGroupRow value para renderizado en misma fila.

**Responsive Layout**: Patrón donde PAIR y TRIPLE colapsan a SINGLE en pantallas pequeñas (móviles) mediante media queries CSS.

## 4. Descripción Técnica

### 4.1 Enumeración ViewGroupRow

```typescript
export enum ViewGroupRow {
    SINGLE = 'single',
    PAIR = 'pair',
    TRIPLE = 'triple'
}
```

Enum con valores string (no numéricos) para claridad en debugging y serialización. Valores son lowercase para consistencia con clases CSS.

### 4.2 Implementación del Decorador

```typescript
import type { ViewGroupRow } from "@/enums/view_group_row";

export const VIEW_GROUP_ROW_KEY = Symbol('view_group_row');

export function ViewGroupRowDecorator(rowType: ViewGroupRow): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        if (!proto[VIEW_GROUP_ROW_KEY]) {
            proto[VIEW_GROUP_ROW_KEY] = {};
        }
        proto[VIEW_GROUP_ROW_KEY][propertyKey] = rowType;
    };
}
```

Decorador almacena enum value en prototype usando Symbol. Nombre ViewGroupRowDecorator (no simplemente ViewGroupRow) evita conflicto con enum importado.

### 4.3 Método de Acceso en BaseEntity

```typescript
public getViewGroupRows(): Record<string, ViewGroupRow> {
    const proto = (this.constructor as any).prototype;
    return proto[VIEW_GROUP_ROW_KEY] || {};
}
```

Método recupera mapa completo de ViewGroupRows desde prototype. Retorna objeto vacío cuando no configurados. Propiedades sin decorador asumen SINGLE por defecto (manejo en UI).

### 4.4 Almacenamiento de Metadata

El metadata se almacena en:
- Ubicación: Constructor.prototype[VIEW_GROUP_ROW_KEY]
- Estructura: Record<string | symbol, ViewGroupRow>
- Vida útil: Permanente durante lifecycle de aplicación
- Herencia: Compartida entre instancias de clase
- Serialización: No incluida en toDictionary() ni persistencia

## 5. Flujo de Funcionamiento

### 5.1 Fase de Declaración

```
Developer diseña formulario con optimización de espacio horizontal
    ↓
Aplica @ViewGroupRowDecorator(ViewGroupRow.PAIR) a propiedades breves
    ↓
Aplica ViewGroupRow.SINGLE a propiedades largas (textarea, etc)
    ↓
TypeScript ejecuta decoradores en definición de clase
    ↓
ViewGroupRowDecorator() almacena {propertyKey: enum value} en prototype
    ↓
Metadata disponible para renderizado de formulario
```

### 5.2 Fase de Renderizado de Formulario

```
FormLayout component necesita renderizar propiedades
    ↓
Llama entity.getViewGroupRows() para obtener mapa de layouts
    ↓
Itera propiedades en orden (getKeys())
    ↓
Para cada propiedad, obtiene rowType = viewGroupRows[key] || SINGLE
    ↓
Agrupa propiedades consecutivas con mismo rowType
    ↓
Renderiza row container con CSS grid:
    - SINGLE: grid-template-columns: 1fr
    - PAIR: grid-template-columns: 1fr 1fr
    - TRIPLE: grid-template-columns: 1fr 1fr 1fr
    ↓
Aplica responsive CSS para colapsar a SINGLE en móviles
```

### 5.3 Algoritmo de Agrupación por Rows

```typescript
function groupByRows(entity: BaseEntity): Array<{ rowType: ViewGroupRow, properties: string[] }> {
    const keys = entity.getKeys();
    const viewGroupRows = entity.getViewGroupRows();
    const rows: Array<{ rowType: ViewGroupRow, properties: string[] }> = [];
    
    let currentRow: { rowType: ViewGroupRow, properties: string[] } | null = null;
    
    for (const key of keys) {
        const rowType = viewGroupRows[key] || ViewGroupRow.SINGLE;
        
        // Si es SINGLE, siempre crear nuevo row
        if (rowType === ViewGroupRow.SINGLE) {
            rows.push({ rowType: ViewGroupRow.SINGLE, properties: [key] });
            currentRow = null;
            continue;
        }
        
        // Si no hay currentRow o tipo diferente, crear nuevo
        if (!currentRow || currentRow.rowType !== rowType) {
            currentRow = { rowType, properties: [key] };
            rows.push(currentRow);
            continue;
        }
        
        // Si currentRow está lleno, crear nuevo
        const maxInRow = rowType === ViewGroupRow.PAIR ? 2 : 3;
        if (currentRow.properties.length >= maxInRow) {
            currentRow = { rowType, properties: [key] };
            rows.push(currentRow);
        } else {
            // Agregar a currentRow existente
            currentRow.properties.push(key);
        }
    }
    
    return rows;
}
```

### 5.4 Ejemplo de Uso Completo

```typescript
class ContactForm extends BaseEntity {
    // PAIR - Dos campos lado a lado
    @ViewGroupRowDecorator(ViewGroupRow.PAIR)
    @PropertyIndex(1)
    firstName: string;
    
    @ViewGroupRowDecorator(ViewGroupRow.PAIR)
    @PropertyIndex(2)
    lastName: string;
    
    // SINGLE - Campo ancho completo
    @ViewGroupRowDecorator(ViewGroupRow.SINGLE)
    @PropertyIndex(3)
    @StringTypeDef(StringType.EMAIL)
    email: string;
    
    // TRIPLE - Tres campos lado a lado
    @ViewGroupRowDecorator(ViewGroupRow.TRIPLE)
    @PropertyIndex(4)
    city: string;
    
    @ViewGroupRowDecorator(ViewGroupRow.TRIPLE)
    @PropertyIndex(5)
    state: string;
    
    @ViewGroupRowDecorator(ViewGroupRow.TRIPLE)
    @PropertyIndex(6)
    zipCode: string;
    
    // SINGLE - Textarea ancho completo
    @ViewGroupRowDecorator(ViewGroupRow.SINGLE)
    @PropertyIndex(7)
    @StringTypeDef(StringType.TEXTAREA)
    notes: string;
}

const form = new ContactForm();
const rows = form.getViewGroupRows();
// {
//   firstName: 'pair',
//   lastName: 'pair',
//   email: 'single',
//   city: 'triple',
//   state: 'triple',
//   zipCode: 'triple',
//   notes: 'single'
// }
```

Resultado en UI:
```
[First Name    ] [Last Name     ]  ← PAIR row

[Email                          ]  ← SINGLE row

[City    ] [State    ] [ZipCode]  ← TRIPLE row

[Notes                          ]  ← SINGLE row
[                               ]
```

## 6. Reglas Obligatorias

### 6.1 Aplicación del Decorador

1. @ViewGroupRowDecorator debe aplicarse a propiedades, nunca a clase
2. Parámetro rowType debe ser valor de enum ViewGroupRow
3. Importar ViewGroupRow desde @/enums/view_group_row
4. No aplicar múltiples @ViewGroupRowDecorator a misma propiedad (último prevalece)
5. Default es SINGLE si no se aplica decorador

### 6.2 Selección de ViewGroupRow

6. Usar SINGLE para campos largos (textarea, rich text, file upload)
7. Usar PAIR para campos breves relacionados (firstName/lastName, city/state)
8. Usar TRIPLE para campos muy breves (day/month/year, phone parts)
9. Considerar ancho de labels al elegir PAIR o TRIPLE
10. PAIR máximo 2 propiedades consecutivas, TRIPLE máximo 3

### 6.3 Organización de Propiedades

11. Agrupar propiedades PAIR consecutivamente para renderizado en misma fila
12. Propiedades SINGLE interrumpen agrupación de PAIR/TRIPLE
13. Usar @PropertyIndex para controlar orden y agrupación
14. No mezclar PAIR y TRIPLE en misma fila (diferente rowType)
15. Propiedades cortas consecutivas con mismo rowType se agrupan automáticamente

### 6.4 Interacción con Otros Decorators

16. @ViewGroupRowDecorator y @ViewGroup son compatibles, ViewGroup agrupa secciones
17. @ViewGroupRowDecorator y @PropertyIndex obligatorios juntos para control preciso
18. @StringTypeDef StringType.TEXTAREA debe tener ViewGroupRow.SINGLE
19. @HideInDetailView hace irrelevante ViewGroupRow (no renderiza)
20. @ReadOnly no afecta ViewGroupRow (readonly fields usan mismo layout)

### 6.5 Responsive Design

21. Implementar media queries para colapsar PAIR/TRIPLE a SINGLE en móviles
22. Breakpoint típico: <768px colapsa a SINGLE
23. Testear formularios en diferentes tamaños de pantalla
24. Considerar touch targets en móviles (no campos demasiado estrechos)
25. Labels pueden requerir wrap o truncate en layouts estrechos

## 7. Prohibiciones

### 7.1 Prohibiciones de Implementación

1. PROHIBIDO aplicar @ViewGroupRowDecorator a clase (es property decorator)
2. PROHIBIDO usar strings literales en lugar de enum ViewGroupRow
3. PROHIBIDO crear valores custom de ViewGroupRow (enum es cerrado)
4. PROHIBIDO modificar valores de enum ViewGroupRow
5. PROHIBIDO aplicar ViewGroupRowDecorator sin @PropertyIndex (orden indeterminado)

### 7.2 Prohibiciones de Uso

6. PROHIBIDO usar PAIR/TRIPLE para textarea o campos largos
7. PROHIBIDO asumir que PAIR/TRIPLE renderiza exactamente 2/3 campos sin agrupación
8. PROHIBIDO depender de ViewGroupRow para lógica de validación
9. PROHIBIDO serializar ViewGroupRow metadata en APIs
10. PROHIBIDO usar ViewGroupRow para determinar qué propiedades son importantes

### 7.3 Prohibiciones de Layout

11. PROHIBIDO mezclar PAIR y TRIPLE en misma fila (requiere rowType consistente)
12. PROHIBIDO usar TRIPLE en formularios estrechos sin responsive design
13. PROHIBIDO omitir media queries para colapso en móviles
14. PROHIBIDO asumir que labels caben en layouts estrechos sin testing
15. PROHIBIDO usar ViewGroupRow como reemplazo de CSS Grid custom

### 7.4 Prohibiciones de Lógica

16. PROHIBIDO implementar lógica de negocio basada en ViewGroupRow values
17. PROHIBIDO usar ViewGroupRow para determinar relaciones entre propiedades
18. PROHIBIDO modificar valores basado en rowType
19. PROHIBIDO usar ViewGroupRow para control de acceso
20. PROHIBIDO depender de orden de renderizado sin @PropertyIndex explícito

## 8. Dependencias

### 8.1 Dependencias Directas

**ViewGroupRow Enum**
- Ubicación: @/enums/view_group_row
- Valores: SINGLE ('single'), PAIR ('pair'), TRIPLE ('triple')
- Crítico: Sí, decorador requiere enum para tipado fuerte

**Symbol (JavaScript Nativo)**
- Propósito: Crear VIEW_GROUP_ROW_KEY único para storage
- Uso: Almacenar metadata sin colisiones
- Crítico: Sí, sin Symbol podría sobrescribir propiedades

**PropertyDecorator (TypeScript)**
- Propósito: Tipado de decorador de propiedad
- Uso: Garantizar firma correcta de ViewGroupRowDecorator()
- Crítico: Sí, TypeScript rechazará decorador incorrecto

### 8.2 Dependencias de BaseEntity

**getViewGroupRows() Method**
- Propósito: Recuperar mapa completo de ViewGroupRows
- Retorno: Record<string, ViewGroupRow>
- Crítico: Sí, sin este método no se puede acceder a metadata

**getKeys() Method**
- Propósito: Obtener lista ordenada de propiedades
- Uso: Fuente de keys para iterar y agrupar por rows
- Crítico: Sí, necesario para agrupación en orden correcto

### 8.3 Dependencias de UI Components

**FormLayout Components**
- Propósito: Renderizar formulario con rows de columnas
- Uso: Consulta getViewGroupRows() y aplica CSS Grid
- Crítico: Sí, sin componente ViewGroupRow no tiene efecto visible

**CSS Grid**
- Propósito: Sistema de layout para columnas
- Grid Templates: 1fr, 1fr 1fr, 1fr 1fr 1fr
- Crítico: Sí, mecanismo de renderizado de columnas

**Media Queries CSS**
- Propósito: Responsive collapse a SINGLE en móviles
- Breakpoint: Típicamente @media (max-width: 768px)
- Crítico: Sí, esencial para mobile UX

### 8.4 Dependencias Opcionales

**@PropertyIndex Decorator**
- Relación: Crítico para control de orden y agrupación
- Uso: Especificar orden explícito de propiedades en formulario
- Sin PropertyIndex: Orden indeterminado, agrupación incorrecta

**@ViewGroup Decorator**
- Relación: Complementario, ViewGroup agrupa secciones
- Uso: ViewGroupRow controla columnas dentro de secciones
- Patrón: ViewGroup + ViewGroupRow para layout completo

**@StringTypeDef Decorator**
- Relación: TEXTAREA debe usar SINGLE, no PAIR/TRIPLE
- Validación: Verificar consistencia en UI
- Recomendación: Aplicar SINGLE automáticamente a TEXTAREA

## 9. Relaciones

### 9.1 Decoradores de Layout

**@PropertyIndex**
- Naturaleza: Crítico para ViewGroupRow
- Razón: PropertyIndex determina orden, ViewGroupRow agrupa consecutivos
- Uso: Siempre aplicar PropertyIndex cuando se usa ViewGroupRow
- Ejemplo: @PropertyIndex(1) @ViewGroupRowDecorator(PAIR) firstName

**@ViewGroup**
- Naturaleza: Complementario, diferentes niveles de organización
- Diferencia: ViewGroup crea secciones, ViewGroupRow controla columnas dentro
- Uso conjunto: @ViewGroup("Contact") @ViewGroupRowDecorator(PAIR)
- Patrón: Secciones con layouts de columnas optimizados

**@TabOrder**
- Relación: Independiente, controla navegación no layout visual
- Uso: TabOrder puede diferir de orden visual en rows
- Ejemplo: Tab navegación horizontal atravesando rows verticales

### 9.2 Decoradores de Metadata

**@StringTypeDef**
- Interacción: TEXTAREA requiere SINGLE (ancho completo)
- Validación: No usar PAIR/TRIPLE con TEXTAREA
- Password/Email: Compatibles con cualquier rowType

**@HideInDetailView**
- Interacción: Propiedades ocultas no renderizan, ViewGroupRow irrelevante
- Efecto: Row puede quedar incompleto si ocultan propiedades
- Manejo: Componente ajusta grid a propiedades visibles

### 9.3 BaseEntity Methods

**getViewGroupRows()**
- Retorno: Record<string, ViewGroupRow>
- Uso: Consulta de metadata para layout de formulario
- Default: SINGLE para propiedades sin decorador

**getKeys()**
- Relación: Fuente de propiedades en orden para agrupar
- Algoritmo: Iterar keys, agrupar consecutivos con mismo rowType
- Crítico: Orden determinado por PropertyIndex

### 9.4 Componentes de UI

**FormLayout Component**
- Consumo: Llama getViewGroupRows() y agrupa por rows
- Renderizado: CSS Grid con template-columns según rowType
- Responsive: Media queries para colapso móvil

**RowContainer Component**
- Propósito: Wrapper de row con CSS Grid
- Classes: .row-single, .row-pair, .row-triple
- Grid: grid-template-columns configurado por rowType

### 9.5 Patrones de Layout

**Name Fields - PAIR**
```typescript
@ViewGroupRowDecorator(ViewGroupRow.PAIR) firstName: string;
@ViewGroupRowDecorator(ViewGroupRow.PAIR) lastName: string;
```
Renderizado: [First Name] [Last Name] en misma fila

**Address Fields - TRIPLE**
```typescript
@ViewGroupRowDecorator(ViewGroupRow.TRIPLE) city: string;
@ViewGroupRowDecorator(ViewGroupRow.TRIPLE) state: string;
@ViewGroupRowDecorator(ViewGroupRow.TRIPLE) zipCode: string;
```
Renderizado: [City] [State] [Zip] en misma fila

**Date Parts - TRIPLE**
```typescript
@ViewGroupRowDecorator(ViewGroupRow.TRIPLE) day: number;
@ViewGroupRowDecorator(ViewGroupRow.TRIPLE) month: number;
@ViewGroupRowDecorator(ViewGroupRow.TRIPLE) year: number;
```
Renderizado: [DD] [MM] [YYYY] en misma fila

**Full Width Fields - SINGLE**
```typescript
@ViewGroupRowDecorator(ViewGroupRow.SINGLE) email: string;
@ViewGroupRowDecorator(ViewGroupRow.SINGLE) notes: string;
```
Renderizado: Cada campo en su propia fila ancho completo

## 10. Notas de Implementación

### 10.1 Patrones de Uso Comunes

**Formulario de Contacto Optimizado**
```typescript
class Contact extends BaseEntity {
    // Row 1: PAIR - Name fields
    @PropertyIndex(1)
    @ViewGroupRowDecorator(ViewGroupRow.PAIR)
    firstName: string;
    
    @PropertyIndex(2)
    @ViewGroupRowDecorator(ViewGroupRow.PAIR)
    lastName: string;
    
    // Row 2: SINGLE - Email full width
    @PropertyIndex(3)
    @ViewGroupRowDecorator(ViewGroupRow.SINGLE)
    @StringTypeDef(StringType.EMAIL)
    email: string;
    
    // Row 3: PAIR - Contact method
    @PropertyIndex(4)
    @ViewGroupRowDecorator(ViewGroupRow.PAIR)
    @StringTypeDef(StringType.TELEPHONE)
    phone: string;
    
    @PropertyIndex(5)
    @ViewGroupRowDecorator(ViewGroupRow.PAIR)
    company: string;
    
    // Row 4: TRIPLE - Address components
    @PropertyIndex(6)
    @ViewGroupRowDecorator(ViewGroupRow.TRIPLE)
    city: string;
    
    @PropertyIndex(7)
    @ViewGroupRowDecorator(ViewGroupRow.TRIPLE)
    state: string;
    
    @PropertyIndex(8)
    @ViewGroupRowDecorator(ViewGroupRow.TRIPLE)
    zipCode: string;
    
    // Row 5: SINGLE - Notes full width
    @PropertyIndex(9)
    @ViewGroupRowDecorator(ViewGroupRow.SINGLE)
    @StringTypeDef(StringType.TEXTAREA)
    notes: string;
}
```

### 10.2 Implementación en Componentes

**FormLayout con CSS Grid**
```vue
<template>
    <form class="form-layout">
        <div
            v-for="(row, index) in rows"
            :key="index"
            :class="['form-row', `row-${row.rowType}`]"
        >
            <FormInput
                v-for="propertyKey in row.properties"
                :key="propertyKey"
                :entity="entity"
                :propertyKey="propertyKey"
            />
        </div>
    </form>
</template>

<script>
import { ViewGroupRow } from '@/enums/view_group_row';

export default {
    computed: {
        rows() {
            return this.groupByRows(this.entity);
        }
    },
    methods: {
        groupByRows(entity) {
            const keys = entity.getKeys();
            const viewGroupRows = entity.getViewGroupRows();
            const rows = [];
            
            let currentRow = null;
            
            for (const key of keys) {
                const rowType = viewGroupRows[key] || ViewGroupRow.SINGLE;
                
                // SINGLE siempre nuevo row
                if (rowType === ViewGroupRow.SINGLE) {
                    rows.push({ rowType: ViewGroupRow.SINGLE, properties: [key] });
                    currentRow = null;
                    continue;
                }
                
                // Nuevo row si tipo diferente o no existe
                if (!currentRow || currentRow.rowType !== rowType) {
                    currentRow = { rowType, properties: [key] };
                    rows.push(currentRow);
                    continue;
                }
                
                // Verificar si row está lleno
                const maxInRow = rowType === ViewGroupRow.PAIR ? 2 : 3;
                if (currentRow.properties.length >= maxInRow) {
                    currentRow = { rowType, properties: [key] };
                    rows.push(currentRow);
                } else {
                    currentRow.properties.push(key);
                }
            }
            
            return rows;
        }
    }
};
</script>

<style>
.form-row {
    display: grid;
    gap: 16px;
    margin-bottom: 16px;
}

.row-single {
    grid-template-columns: 1fr;
}

.row-pair {
    grid-template-columns: 1fr 1fr;
}

.row-triple {
    grid-template-columns: 1fr 1fr 1fr;
}

/* Responsive: Colapsar a SINGLE en móviles */
@media (max-width: 768px) {
    .row-pair,
    .row-triple {
        grid-template-columns: 1fr;
    }
}

/* Tablet: TRIPLE colapsa a PAIR */
@media (min-width: 769px) and (max-width: 1024px) {
    .row-triple {
        grid-template-columns: 1fr 1fr;
    }
}
</style>
```

### 10.3 Testing y Validación

**Unit Test de ViewGroupRow**
```typescript
test('getViewGroupRows returns configured rows', () => {
    class TestEntity extends BaseEntity {
        @ViewGroupRowDecorator(ViewGroupRow.PAIR) fieldA: string;
        @ViewGroupRowDecorator(ViewGroupRow.PAIR) fieldB: string;
        @ViewGroupRowDecorator(ViewGroupRow.SINGLE) fieldC: string;
    }
    
    const entity = new TestEntity();
    const rows = entity.getViewGroupRows();
    
    expect(rows.fieldA).toBe(ViewGroupRow.PAIR);
    expect(rows.fieldB).toBe(ViewGroupRow.PAIR);
    expect(rows.fieldC).toBe(ViewGroupRow.SINGLE);
});

test('properties without ViewGroupRow assume SINGLE', () => {
    class TestEntity extends BaseEntity {
        @ViewGroupRowDecorator(ViewGroupRow.PAIR) paired: string;
        unpaired: string;
    }
    
    const entity = new TestEntity();
    const rows = entity.getViewGroupRows();
    
    expect(rows.paired).toBe(ViewGroupRow.PAIR);
    expect(rows.unpaired).toBeUndefined(); // UI asume SINGLE
});
```

**Integration Test de Row Grouping**
```typescript
test('groups consecutive PAIR properties in same row', () => {
    class TestEntity extends BaseEntity {
        @PropertyIndex(1) @ViewGroupRowDecorator(ViewGroupRow.PAIR) firstName: string;
        @PropertyIndex(2) @ViewGroupRowDecorator(ViewGroupRow.PAIR) lastName: string;
        @PropertyIndex(3) @ViewGroupRowDecorator(ViewGroupRow.SINGLE) email: string;
    }
    
    const entity = new TestEntity();
    const rows = groupByRows(entity);
    
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({
        rowType: ViewGroupRow.PAIR,
        properties: ['firstName', 'lastName']
    });
    expect(rows[1]).toEqual({
        rowType: ViewGroupRow.SINGLE,
        properties: ['email']
    });
});
```

### 10.4 Debugging y Diagnóstico

**Inspeccionar ViewGroupRows**
```typescript
const contact = new Contact();
const viewGroupRows = contact.getViewGroupRows();
console.log('ViewGroupRows:', viewGroupRows);
// {
//   firstName: 'pair',
//   lastName: 'pair',
//   email: 'single',
//   city: 'triple',
//   state: 'triple',
//   zipCode: 'triple'
// }

// Ver agrupación en rows
const rows = groupByRows(contact);
console.log('Rows:', rows);
// [
//   { rowType: 'pair', properties: ['firstName', 'lastName'] },
//   { rowType: 'single', properties: ['email'] },
//   { rowType: 'triple', properties: ['city', 'state', 'zipCode'] }
// ]
```

### 10.5 Migraciones y Refactoring

**Agregar ViewGroupRow a Formulario Existente**
```typescript
// Antes - Sin layout optimization
class Contact extends BaseEntity {
    firstName: string;
    lastName: string;
    email: string;
}

// Después - Con PAIR optimization
class Contact extends BaseEntity {
    @PropertyIndex(1)
    @ViewGroupRowDecorator(ViewGroupRow.PAIR)
    firstName: string;
    
    @PropertyIndex(2)
    @ViewGroupRowDecorator(ViewGroupRow.PAIR)
    lastName: string;
    
    @PropertyIndex(3)
    @ViewGroupRowDecorator(ViewGroupRow.SINGLE)
    email: string;
}
```

Verificar que FormLayout implementa CSS Grid con rowType classes.

**Cambiar Row Type**
```typescript
// Antes - SINGLE para todo
@ViewGroupRowDecorator(ViewGroupRow.SINGLE) city: string;
@ViewGroupRowDecorator(ViewGroupRow.SINGLE) state: string;
@ViewGroupRowDecorator(ViewGroupRow.SINGLE) zipCode: string;

// Después - TRIPLE para optimizar espacio
@ViewGroupRowDecorator(ViewGroupRow.TRIPLE) city: string;
@ViewGroupRowDecorator(ViewGroupRow.TRIPLE) state: string;
@ViewGroupRowDecorator(ViewGroupRow.TRIPLE) zipCode: string;
```

Testear que labels no truncan y campos son suficientemente anchos.

## 11. Referencias Cruzadas

### 11.1 Documentación Relacionada

**copilot/layers/02-base-entity/metadata-access.md**
- Sección: Métodos de Acceso a Metadata de Layout
- Contenido: Implementación de getViewGroupRows()
- Relevancia: Único método de acceso a ViewGroupRow metadata

**copilot/layers/01-decorators/property-index-decorator.md**
- Relación: Crítico para ViewGroupRow, controla orden de agrupación
- Uso: Siempre aplicar PropertyIndex con ViewGroupRow
- Patrón: PropertyIndex determina orden, ViewGroupRow agrupa

**copilot/layers/01-decorators/view-group-decorator.md**
- Relación: Complementario, diferentes niveles de organización
- Diferencia: ViewGroup crea secciones, ViewGroupRow controla columnas
- Uso conjunto: Secciones con layouts de columnas optimizados

**copilot/layers/01-decorators/string-type-decorator.md**
- Interacción: TEXTAREA requiere SINGLE (ancho completo)
- Validación: No usar PAIR/TRIPLE con TEXTAREA
- Patrón: Verificar consistencia en metadata

**copilot/layers/01-decorators/hide-in-detail-view-decorator.md**
- Interacción: Propiedades ocultas no renderizan
- Efecto: Row puede quedar vacío o incompleto
- Manejo: Componente ajusta grid a propiedades visibles

### 11.2 BaseEntity Core

**copilot/layers/02-base-entity/base-entity-core.md**
- Método: getViewGroupRows()
- Almacenamiento: prototype[VIEW_GROUP_ROW_KEY]

**copilot/layers/02-base-entity/metadata-access.md**
- Sección: Métodos de Layout Avanzado
- Contenido: getViewGroupRows() implementation

### 11.3 Enumeraciones

**src/enums/view_group_row.ts**
- Contenido: Definición de enum ViewGroupRow
- Valores: SINGLE ('single'), PAIR ('pair'), TRIPLE ('triple')
- Uso: Importado por decorador y componentes

### 11.4 Componentes de UI

**copilot/layers/04-components/FormLayoutComponents.md**
- Consumo: Usa getViewGroupRows() para layout de columnas
- Renderizado: CSS Grid con template-columns
- Responsive: Media queries para colapso móvil

**copilot/layers/04-components/DetailViewTable.md**
- Relación: Renderiza formularios con rows optimizados
- Responsabilidad: Agrupar propiedades y aplicar CSS Grid

### 11.5 Código Fuente

**src/decorations/view_group_row_decorator.ts**
- Líneas: 1-14
- Exports: VIEW_GROUP_ROW_KEY, ViewGroupRowDecorator

**src/entities/base_entity.ts**
- Líneas 282-285: Método getViewGroupRows()
- Dependencias: Importa VIEW_GROUP_ROW_KEY, ViewGroupRow

### 11.6 Tutoriales y Ejemplos

**copilot/tutorials/01-basic-crud.md**
- Sección: Optimización de Layout de Formularios
- Ejemplo: Contact form con PAIR y TRIPLE
- Patrón: Optimización de espacio horizontal

**copilot/examples/advanced-module-example.md**
- Sección: Layouts Avanzados con ViewGroupRow
- Patrón: Formularios complejos con múltiples rowTypes
- Técnica: ViewGroup + ViewGroupRow para máxima organización

### 11.7 Contratos y Arquitectura

**copilot/00-CONTRACT.md**
- Sección 4.2: Metadata de Layout Avanzado
- Principio: ViewGroupRow controla columnas en formularios
- Sección 8.1: Decoradores como configuración de UI

**copilot/01-FRAMEWORK-OVERVIEW.md**
- Sección: Sistema de Layout de Formularios
- Contexto: ViewGroupRow dentro de decoradores de layout
- Flujo: Entity → ViewGroupRow → CSS Grid

**copilot/02-FLOW-ARCHITECTURE.md**
- Sección: Renderizado Responsivo de Formularios
- Flujo: getViewGroupRows() → Row grouping → CSS Grid → Responsive collapse
- Garantía: Layout optimizado respeta ViewGroupRow en todos los tamaños
