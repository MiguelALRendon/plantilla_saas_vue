# TabOrder Decorator

## 1. Propósito

Controlar el orden de navegación por teclado mediante tecla Tab en formularios generados automáticamente, permitiendo definir secuencia lógica de foco entre campos de entrada independiente del orden visual o de declaración en código.

## 2. Alcance

### 2.1 Responsabilidades

- Asignar índice numérico de navegación por Tab a propiedades específicas
- Determinar secuencia de foco cuando usuario presiona Tab o Shift+Tab en formularios
- Ordenar propiedades de tipo Array para navegación consistente en componentes Array
- Proporcionar método getTabOrders() para acceso a metadata de orden
- Permitir saltos de índice para facilitar inserción de campos futuros
- Habilitar navegación por teclado accesible para usuarios con discapacidades

### 2.2 Límites

- No modifica el orden visual de campos en interfaz (requiere @PropertyIndex)
- No afecta ordenamiento de propiedades en ListView o DetailView
- No controla navegación entre diferentes formularios o vistas
- No gestiona foco inicial del formulario (primer campo)
- No implementa navegación bidireccional automática (Tab/Shift+Tab)
- No valida unicidad de tabIndex values (navegador maneja duplicados)

## 3. Definiciones Clave

**TabOrder**: Índice numérico entero asociado a propiedad que determina su posición en secuencia de navegación por teclado mediante tecla Tab.

**tabIndex HTML Attribute**: Atributo HTML estándar que controla orden de navegación por Tab, donde valores numéricos positivos definen orden específico.

**TabOrder Map**: Estructura Record<string, number> que mapea nombres de propiedades a sus índices de Tab asignados.

**Implicit TabOrder**: Valor Number.MAX_SAFE_INTEGER asignado a propiedades sin decorador @TabOrder explícito, colocándolas al final de secuencia de navegación.

**ArrayKeys Ordered**: Array de nombres de propiedades de tipo Array ordenado según TabOrder, usado por getArrayKeysOrdered() para componentesArray.

**Keyboard Navigation Flow**: Secuencia lógica de foco cuando usuario presiona Tab repetidamente, determinada por valores de TabOrder en orden ascendente.

## 4. Descripción Técnica

### 4.1 Implementación del Decorador

```typescript
export const TAB_ORDER_KEY = Symbol('tab_order');

export function TabOrder(order: number): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        if (!proto[TAB_ORDER_KEY]) {
            proto[TAB_ORDER_KEY] = {};
        }
        proto[TAB_ORDER_KEY][propertyKey] = order;
    };
}
```

Decorador simple que almacena índice numérico en prototype usando Symbol-based key. No valida rangos ni unicidad (navegador HTML maneja tabIndex duplicados ordenando por DOM order).

### 4.2 Métodos de Acceso en BaseEntity

```typescript
public getTabOrders(): Record<string, number> {
    const proto = (this.constructor as any).prototype;
    return proto[TAB_ORDER_KEY] || {};
}
```

Método que recupera mapa completo de TabOrders desde prototype. Retorna objeto vacío cuando no existen configurados, evitando errores de nullish access.

```typescript
public getArrayKeysOrdered(): string[] {
    const arrayKeys = this.getArrayKeys();
    const tabOrders = this.getTabOrders();
    
    return arrayKeys.sort((a, b) => {
        const orderA = tabOrders[a] ?? Number.MAX_SAFE_INTEGER;
        const orderB = tabOrders[b] ?? Number.MAX_SAFE_INTEGER;
        return orderA - orderB;
    });
}
```

Método específico que ordena propiedades Array según TabOrder. Propiedades sin decorador reciben MAX_SAFE_INTEGER, apareciendo al final en orden declarativo relativo.

### 4.3 Almacenamiento de Metadata

El metadata se almacena en:
- Ubicación: Constructor.prototype[TAB_ORDER_KEY]
- Estructura: Record<string | symbol, number>
- Vida útil: Permanente durante lifecycle de aplicación
- Herencia: Compartida entre todas las instancias de clase
- Serialización: No incluida en toDictionary() ni persistencia

## 5. Flujo de Funcionamiento

### 5.1 Fase de Declaración

```
Developer aplica @TabOrder(n) a propiedades de formulario
    ↓
TypeScript ejecuta decorador en tiempo de definición de clase
    ↓
TabOrder() almacena {propertyKey: order} en prototype[TAB_ORDER_KEY]
    ↓
Metadata disponible para todas las instancias futuras
    ↓
Propiedades sin decorador reciben orden implícito (MAX_SAFE_INTEGER)
```

### 5.2 Fase de Renderizado de Formulario

```
FormInput component renderiza campo de entrada
    ↓
Component invoca entity.getTabOrders()
    ↓
Obtiene tabOrder para propertyKey específico
    ↓
Si existe, aplica atributo tabindex={order} a input HTML
    ↓
Si no existe, navegador usa orden DOM natural
    ↓
Resultado: Inputs con tabindex explícito en HTML
```

### 5.3 Fase de Navegación por Usuario

```
Usuario ingresa en formulario (primer campo recibe foco)
    ↓
Usuario presiona Tab
    ↓
Navegador busca siguiente elemento con tabindex
    ↓
Si hay tabindex numéricos, navega en orden ascendente
    ↓
Si no hay tabindex, navega en orden DOM
    ↓
Foco se mueve al siguiente input según TabOrder
    ↓
Usuario continúa navegando con Tab/Shift+Tab
```

### 5.4 Ejemplo de Flujo Completo

Dada esta entidad:
```typescript
class ContactForm extends BaseEntity {
    @TabOrder(3) email: string;
    @TabOrder(1) firstName: string;
    @TabOrder(2) lastName: string;
    phone: string; // Sin TabOrder
}
```

Secuencia de navegación:
1. Tab 1: firstName
2. Tab 2: lastName  
3. Tab 3: email
4. Tab 4: phone (orden DOM, sin tabindex)

HTML resultante:
```html
<input name="firstName" tabindex="1">
<input name="lastName" tabindex="2">
<input name="email" tabindex="3">
<input name="phone"> <!-- Sin tabindex -->
```

## 6. Reglas Obligatorias

### 6.1 Aplicación del Decorador

1. @TabOrder debe aplicarse a propiedades de clase, nunca a clase completa
2. Orden debe ser número entero positivo mayor o igual a 1
3. No aplicar @TabOrder a propiedades no renderizadas en formularios
4. No aplicar a propiedades con @HideInDetailView si se ocultan en formulario
5. Aplicar TabOrder solo a propiedades editables (no readonly-only)

### 6.2 Gestión de Índices

6. Usar secuencias incrementales (1, 2, 3...) para claridad
7. Empezar desde 1, no desde 0 (convención HTML tabindex)
8. Permitir gaps (1, 3, 7) para facilitar inserción de campos futuros
9. No preocuparse por duplicados (navegador los maneja por orden DOM)
10. Documentar razón de índices no secuenciales si se usan

### 6.3 Interacción con Otros Decoradores

11. @TabOrder y @PropertyIndex son independientes, pueden tener valores diferentes
12. Considerar sincronizar TabOrder con PropertyIndex para coherencia UX
13. Propiedades con @Disabled no necesitan TabOrder (no focusables)
14. Propiedades con @ReadOnly aún pueden tener TabOrder (focusables para selección)
15. @TabOrder afecta solo DetailView (formularios), no ListView (tablas)

### 6.4 Ordenamiento de Arrays

16. getArrayKeysOrdered() usa TabOrder para ordenar propiedades Array
17. Aplicar @TabOrder a propiedades Array si se quiere control de ordenamiento
18. Propiedades Array sin TabOrder aparecen al final en orden declarativo
19. TabOrder de Arrays no afecta navegación dentro del componente Array
20. Usar TabOrder para determinar secuencia visual de componentes Array en página

### 6.5 Accesibilidad

21. TabOrder bien definido mejora accesibilidad para usuarios de teclado
22. Secuencia lógica de Tab es crítica para screen readers
23. Evitar saltos ilógicos de foco (ej: campo 1 → campo 10 → campo 2)
24. Agrupar campos relacionados con TabOrder relacionado sequencialmente
25. Testear navegación completa con Tab para validar flujo lógico

## 7. Prohibiciones

### 7.1 Prohibiciones de Implementación

1. PROHIBIDO usar valores negativos como TabOrder
2. PROHIBIDO usar 0 como TabOrder (0 tiene significado especial en HTML: excluir de Tab navigation)
3. PROHIBIDO usar números decimales como TabOrder (1.5 es inválido)
4. PROHIBIDO usar Infinity o NaN como TabOrder
5. PROHIBIDO aplicar múltiples @TabOrder a misma propiedad

### 7.2 Prohibiciones de Uso

6. PROHIBIDO asumir que TabOrder controla orden visual de campos
7. PROHIBIDO modificar directamente prototype[TAB_ORDER_KEY]
8. PROHIBIDO usar TabOrder para ordenar propiedades en ListView
9. PROHIBIDO usar TabOrder para controlar secuencia de validación
10. PROHIBIDO usar TabOrder para determinar orden de persistencia en API

### 7.3 Prohibiciones de Lógica

11. PROHIBIDO implementar lógica de negocio basada en valores de TabOrder
12. PROHIBIDO usar TabOrder como identificador de propiedad
13. PROHIBIDO exponer valores de TabOrder en UI de usuario final
14. PROHIBIDO serializar TabOrder metadata en requests HTTP
15. PROHIBIDO usar TabOrder para determinar prioridad de campos

### 7.4 Prohibiciones de Accesibilidad

16. PROHIBIDO usar valores de TabOrder muy altos (>999) sin razón clara
17. PROHIBIDO crear saltos ilógicos de foco (1 → 50 → 2)
18. PROHIBIDO usar TabOrder para forzar navegación circular
19. PROHIBIDO ignorar TabOrder en implementaciones personalizadas de FormInput
20. PROHIBIDO usar TabOrder para ocultar campos de navegación (usar @HideInDetailView)

## 8. Dependencias

### 8.1 Dependencias Directas

**Symbol (JavaScript Nativo)**
- Propósito: Crear TAB_ORDER_KEY único para storage de metadata
- Uso: Almacenar metadata sin colisiones de namespace
- Crítico: Sí, sin Symbol podría sobrescribir propiedades de entidad

**PropertyDecorator (TypeScript)**
- Propósito: Tipado de decorador de propiedad
- Uso: Garantizar firma correcta de función TabOrder()
- Crítico: Sí, TypeScript rechazará decorador sin tipo correcto

**BaseEntity.prototype**
- Propósito: Almacenamiento de metadata compartida
- Uso: Contiene Record<string, number> con TabOrders
- Crítico: Sí, instancias necesitan acceder a metadata de clase

### 8.2 Dependencias de BaseEntity

**getTabOrders() Method**
- Propósito: Recuperar mapa completo de TabOrders
- Uso: Invocado por getArrayKeysOrdered() y componentes de UI
- Crítico: Sí, sin este método no se puede acceder a metadata

**getArrayKeys() Method**
- Propósito: Obtener lista de propiedades de tipo Array
- Uso: Fuente de keys para getArrayKeysOrdered()
- Crítico: Sí, necesario para ordenamiento de Arrays

**Array.prototype.sort()**
- Propósito: Algoritmo de ordenamiento de propiedades
- Uso: Comparación de TabOrder values en getArrayKeysOrdered()
- Crítico: Sí, sort() es mecanismo de ordenamiento

**Number.MAX_SAFE_INTEGER**
- Propósito: Valor sentinel para propiedades sin TabOrder
- Uso: Colocar propiedades no decoradas al final
- Crítico: Sí, garantiza que propiedades con TabOrder preceden a sin TabOrder

### 8.3 Dependencias de UI Components

**FormInput Components**
- Propósito: Renderizar inputs con atributo tabindex
- Uso: Consultan entity.getTabOrders() para cada campo
- Crítico: Sí, sin componentes TabOrder no tiene efecto visible

**HTML tabindex Attribute**
- Propósito: Atributo estándar para controlar orden de navegación
- Uso: tabindex="1", tabindex="2", etc.
- Crítico: Sí, mecanismo de enforcement de TabOrder en navegador

**Browser Tab Navigation**
- Propósito: Navegación por teclado nativa del navegador
- Uso: Presionar Tab/Shift+Tab para navegar entre inputs
- Crítico: Sí, funcionalidad de navegación depende del navegador

### 8.4 Dependencias Opcionales

**@PropertyIndex Decorator**
- Relación: Decorador hermano para orden visual
- Diferencia: TabOrder controla navegación, PropertyIndex controla visualización
- Recomendación: Sincronizar ambos para coherencia UX

**Array Input Components**
- Relación: Componentes que renderizan propiedades Array
- Uso: getArrayKeysOrdered() determina secuencia de componentes
- Impacto: TabOrder afecta orden visual de componentes Array en página

**Accessibility Tools**
- Relación: Screen readers y herramientas de accesibilidad
- Uso: Respetan tabindex para navegación y anuncio de campos
- Importancia: Crítico para usuarios con discapacidades

## 9. Relaciones

### 9.1 Decoradores de Ordenamiento

**@PropertyIndex**
- Naturaleza: Decorador hermano con propósito diferente
- Diferencia: PropertyIndex controla orden visual, TabOrder controla navegación
- Interacción: Ninguna, son completamente independientes
- Escenario: Formulario puede tener orden visual diferente de orden de navegación
- Recomendación: Sincronizar valores para evitar confusión de usuario

Ejemplo de diferencia:
```typescript
class Form extends BaseEntity {
    @PropertyIndex(1) @TabOrder(3) zipCode: string;
    @PropertyIndex(2) @TabOrder(1) firstName: string;
    @PropertyIndex(3) @TabOrder(2) lastName: string;
}
```
Orden visual: zipCode, firstName, lastName
Orden Tab: firstName, lastName, zipCode

### 9.2 Decoradores de Estado

**@Disabled**
- Interacción: Campos disabled no reciben foco, TabOrder ignorado
- Comportamiento: Navegador salta campos disabled en Tab navigation
- Implicación: No aplicar TabOrder a campos siempre disabled

**@ReadOnly**
- Interacción: Campos readonly son focusables, TabOrder se respeta
- Comportamiento: Tab navega a campo readonly para permitir selección de texto
- Uso: Aplicar TabOrder a readonly para incluir en secuencia de navegación

### 9.3 Decoradores de Visibilidad

**@HideInDetailView**
- Interacción: Campos ocultos no se renderizan, TabOrder no aplica
- Comportamiento: Sin input HTML, sin tabindex
- Implicación: No aplicar TabOrder a campos ocultos en formulario

**@HideInListView**
- Interacción: No afecta TabOrder (ListView no tiene navegación Tab típicamente)
- Comportamiento: TabOrder solo relevante en DetailView (formularios)

### 9.4 BaseEntity Methods

**getTabOrders()**
- Retorno: Record<string, number>
- Uso: Recuperar mapa completo de TabOrders
- Invocado por: getArrayKeysOrdered(), FormInput components

**getArrayKeysOrdered()**
- Relación: Único método que consume TabOrder automáticamente
- Propósito: Ordenar propiedades Array para componentes Array
- Algoritmo: Ordena arrayKeys por TabOrder, sin TabOrder al final

**getKeys()**
- Diferencia: getKeys() usa PropertyIndex, no TabOrder
- Propósito: Orden visual, no navegación
- Independiente: No consulta TAB_ORDER_KEY

### 9.5 Componentes de UI

**FormInput Component**
- Consumo: Llama entity.getTabOrders()[propertyKey]
- Aplicación: Agrega tabindex={order} a input HTML
- Condicional: Solo aplica tabindex si TabOrder está configurado

**DetailViewTable Component**
- Relación: Renderiza formularios donde TabOrder aplica
- Responsabilidad: Asegurar que inputs respetan tabindex

**ListView Component**
- Relación: No usa TabOrder (tablas no tienen Tab navigation típicamente)
- Excepción: Si inline editing implementado, debe considerar TabOrder

**Array Input Components**
- Relación: Usa getArrayKeysOrdered() para determinar secuencia
- Impacto: TabOrder controla orden de renderizado de componentes Array
- Ejemplo: Múltiples UIInputArray en página ordenados por TabOrder

### 9.6 Accesibilidad

**Screen Readers**
- Dependencia: Respetan tabindex para orden de anuncio de campos
- Importancia: TabOrder determina secuencia lógica para usuarios ciegos
- Validación: Testear con NVDA/JAWS para validar orden correcto

**Keyboard-Only Users**
- Dependencia: Tab es única forma de navegación entre campos
- Importancia: TabOrder determina eficiencia de navegación
- Validación: Testear con Tab repetidamente sin mouse

## 10. Notas de Implementación

### 10.1 Patrones de Uso Comunes

**Orden de Navegación Lógico**
```typescript
class CustomerForm extends BaseEntity {
    @TabOrder(1) @PropertyIndex(1) firstName: string;
    @TabOrder(2) @PropertyIndex(2) lastName: string;
    @TabOrder(3) @PropertyIndex(3) email: string;
    @TabOrder(4) @PropertyIndex(4) phone: string;
    @TabOrder(5) @PropertyIndex(5) address: string;
}
```

TabOrder y PropertyIndex sincronizados para navegación y visualización coherente.

**TabOrder con Gaps para Extensibilidad**
```typescript
class OrderForm extends BaseEntity {
    @TabOrder(10) productName: string;
    @TabOrder(20) quantity: number;
    @TabOrder(30) price: number;
    // Insertar campo futuro con TabOrder(15) sin renumerar
}
```

Gaps de 10 permiten agregar campos entre existentes sin refactoring completo.

**Orden de Navegación Diferente de Visual**
```typescript
class PaymentForm extends BaseEntity {
    @PropertyIndex(1) @TabOrder(3) cardNumber: string;
    @PropertyIndex(2) @TabOrder(1) amount: number;
    @PropertyIndex(3) @TabOrder(2) description: string;
}
```

Visualización: cardNumber, amount, description
Navegación Tab: amount, description, cardNumber

Usuario ve cardNumber primero pero Tab focaliza amount primero (posiblemente para confirmación de monto).

**TabOrder para Propiedades Array**
```typescript
class Survey extends BaseEntity {
    @TabOrder(1) questions: Question[];
    @TabOrder(2) comments: Comment[];
    @TabOrder(3) attachments: File[];
}
```

getArrayKeysOrdered() retorna ['questions', 'comments', 'attachments'], determina orden de componentes Array en página.

### 10.2 Casos de Comportamiento Especial

**Colisión de TabOrder**
```typescript
class Form extends BaseEntity {
    @TabOrder(1) fieldA: string;
    @TabOrder(1) fieldB: string; // Mismo TabOrder
    @TabOrder(2) fieldC: string;
}
```

Comportamiento del navegador: fieldA y fieldB tendrán orden indeterminado entre sí (depende de orden DOM), ambos antes de fieldC. No es error, pero evitar para consistencia.

**Propiedades sin TabOrder**
```typescript
class Mixed extends BaseEntity {
    @TabOrder(1) first: string;
    middle: string; // Sin TabOrder
    @TabOrder(2) last: string;
}
```

Resultado: first → last → middle. Propiedades sin TabOrder aparecen después de todas las con TabOrder, en orden DOM.

**TabOrder en Campos ReadOnly**
```typescript
class Invoice extends BaseEntity {
    @TabOrder(1) @ReadOnly() invoiceNumber: string;
    @TabOrder(2) customerName: string;
    @TabOrder(3) amount: number;
}
```

Campo invoiceNumber es readonly pero focusable. Usuario puede Tab a él y seleccionar texto para copiar.

**TabOrder con Disabled Dinámico**
```typescript
class ConditionalForm extends BaseEntity {
    @TabOrder(1) mainField: string;
    
    @TabOrder(2)
    @Disabled((form: ConditionalForm) => !form.mainField)
    conditionalField: string;
}
```

Si conditionalField está disabled, navegador salta de TabOrder 1 directamente a TabOrder 3 (si existe).

### 10.3 Implementación en Componentes

**FormInput Component - Aplicación de tabindex**
```typescript
// FormInput.vue
<template>
    <input
        v-model="value"
        :tabindex="tabIndex"
        @focus="onFocus"
    />
</template>

<script>
export default {
    computed: {
        tabIndex() {
            const tabOrders = this.entity.getTabOrders();
            return tabOrders[this.propertyKey] ?? undefined;
        }
    },
    methods: {
        onFocus() {
            console.log(`Focused on ${this.propertyKey} with tabindex ${this.tabIndex}`);
        }
    }
}
</script>
```

Si TabOrder no está configurado, tabindex es undefined (navegador usa orden DOM).

**DetailView - Renderizado de Formulario**
```typescript
// DetailView.vue
<template>
    <form @submit.prevent="save">
        <FormInput
            v-for="key in entity.getKeys()"
            :key="key"
            :entity="entity"
            :propertyKey="key"
        />
    </form>
</template>
```

getKeys() determina orden visual (PropertyIndex), cada FormInput aplica tabindex (TabOrder).

**Array Component - Ordenamiento de Arrays**
```typescript
// ArrayContainer.vue
<template>
    <div v-for="arrayKey in arrayKeysOrdered" :key="arrayKey">
        <h3>{{ arrayKey }}</h3>
        <UIInputArray :entity="entity" :propertyKey="arrayKey" />
    </div>
</template>

<script>
export default {
    computed: {
        arrayKeysOrdered() {
            return this.entity.getArrayKeysOrdered();
        }
    }
}
</script>
```

TabOrder determina secuencia de componentes Array en página.

### 10.4 Testing y Validación

**Test de Navegación por Tab**
```typescript
import { mount } from '@vue/test-utils';
import DetailView from '@/views/DetailView.vue';

test('Tab navigation follows TabOrder', async () => {
    const entity = new MyEntity();
    const wrapper = mount(DetailView, { props: { entity } });
    
    const inputs = wrapper.findAll('input[tabindex]');
    const tabIndexes = inputs.map(input => input.attributes('tabindex'));
    
    // Verificar que tabIndexes están en orden ascendente
    const sorted = [...tabIndexes].sort((a, b) => Number(a) - Number(b));
    expect(tabIndexes).toEqual(sorted);
});
```

**Test de getArrayKeysOrdered**
```typescript
test('getArrayKeysOrdered respects TabOrder', () => {
    class TestEntity extends BaseEntity {
        @TabOrder(2) arrayB: string[];
        @TabOrder(1) arrayA: string[];
        arrayC: string[]; // Sin TabOrder
    }
    
    const entity = new TestEntity();
    const ordered = entity.getArrayKeysOrdered();
    
    expect(ordered).toEqual(['arrayA', 'arrayB', 'arrayC']);
});
```

**Validación de Accesibilidad Manual**
1. Abrir formulario en navegador
2. Presionar Tab repetidamente sin usar mouse
3. Verificar que foco se mueve en secuencia lógica
4. Verificar que Shift+Tab navega en reversa correctamente
5. Usar screen reader (NVDA) para validar orden de anuncio

### 10.5 Performance y Optimización

**Complejidad de getArrayKeysOrdered**
- Tiempo: O(n log n) donde n = número de propiedades Array
- Espacio: O(n) para array temporal
- Impacto: Negligible incluso con 50+ properties Array

**Cache de TabOrders**
No necesario típicamente. getTabOrders() es acceso directo a prototype, muy rápido. Cache solo si se invoca 1000+ veces por segundo.

**Minimizar Uso de TabOrder**
En formularios simples de 3-5 campos, orden DOM natural suele ser suficiente. TabOrder es valioso cuando:
- Orden visual difiere de orden lógico de navegación
- Formularios complejos con 20+ campos agrupados
- Campos condicionales que aparecen/desaparecen dinámicamente

### 10.6 Debugging y Diagnóstico

**Inspeccionar TabOrders**
```typescript
const entity = new MyEntity();
const tabOrders = entity.getTabOrders();
console.log('TabOrder map:', tabOrders);
// Output: { firstName: 1, lastName: 2, email: 3 }

const arrayKeysOrdered = entity.getArrayKeysOrdered();
console.log('Array keys ordered:', arrayKeysOrdered);
// Output: ['questions', 'comments', 'attachments']
```

**Visualizar tabindex en DevTools**
```javascript
// En consola del navegador
document.querySelectorAll('[tabindex]').forEach(el => {
    console.log(el.name, 'tabindex=', el.tabIndex);
});
```

**Testear Navegación en Navegador**
```javascript
// Resaltar elemento con foco
document.addEventListener('focusin', (e) => {
    console.log('Focused on:', e.target.name, 'tabindex=', e.target.tabIndex);
});
```

### 10.7 Migraciones y Refactoring

**Agregar TabOrder a Formulario Existente**
1. Identificar orden lógico de navegación deseado
2. Aplicar @TabOrder(1..n) siguiendo ese orden
3. Testear navegación con Tab repetidamente
4. Ajustar valores si secuencia no es lógica
5. Considerar sincronizar con @PropertyIndex

**Cambiar Orden de Navegación**
```typescript
// Antes
@TabOrder(1) lastName: string;
@TabOrder(2) firstName: string;

// Después (intercambiar orden)
@TabOrder(2) lastName: string;
@TabOrder(1) firstName: string;
```

Solo modificar valores numéricos, no mover declaraciones de propiedades.

**Insertar Campo en Secuencia Existente**
```typescript
// Antes
@TabOrder(10) fieldA: string;
@TabOrder(20) fieldC: string;

// Después (insertar fieldB entre A y C)
@TabOrder(10) fieldA: string;
@TabOrder(15) fieldB: string; // Nuevo campo
@TabOrder(20) fieldC: string;
```

Uso de gaps (10, 20) permite inserción sin renumerar todos los campos.

## 11. Referencias Cruzadas

### 11.1 Documentación Relacionada

**copilot/layers/02-base-entity/metadata-access.md**
- Sección: Métodos de Acceso a Metadata de Navegación
- Contenido: Implementación detallada de getTabOrders() y getArrayKeysOrdered()
- Relevancia: Mecanismo de acceso a TabOrder metadata

**copilot/layers/01-decorators/property-index-decorator.md**
- Relación: Decorador hermano para orden visual
- Diferencia: PropertyIndex controla visualización, TabOrder controla navegación
- Uso conjunto: Sincronizar ambos para coherencia UX

**copilot/layers/01-decorators/disabled-decorator.md**
- Interacción: Campos disabled no reciben foco, TabOrder ignorado
- Comportamiento: Navegador salta campos disabled en Tab navigation

**copilot/layers/01-decorators/readonly-decorator.md**
- Interacción: Campos readonly son focusables, TabOrder se respeta
- Comportamiento: Tab navega a readonly para selección de texto

**copilot/layers/01-decorators/hide-in-detail-view-decorator.md**
- Interacción: Campos ocultos no renderizan, TabOrder no aplica
- Implicación: No aplicar TabOrder a campos ocultos en formulario

### 11.2 Componentes de UI

**copilot/layers/04-components/FormInput.md**
- Consumo: Consulta entity.getTabOrders()[propertyKey]
- Aplicación: Agrega tabindex={order} a input HTML
- Responsabilidad: Respetar TabOrder en renderizado

**copilot/layers/04-components/DetailViewTable.md**
- Relación: Renderiza formularios donde TabOrder determina navegación
- Responsabilidad: Asegurar que inputs respetan tabindex

**copilot/layers/04-components/array-input-component.md**
- Relación: Usa getArrayKeysOrdered() para secuencia de componentes
- Impacto: TabOrder controla orden de renderizado de UIInputArray

### 11.3 Código Fuente

**src/decorations/tab_order_decorator.ts**
- Líneas: 1-12
- Contenido: Implementación completa del decorador
- Exports: TAB_ORDER_KEY, TabOrder

**src/entities/base_entity.ts**
- Líneas 399-417: Métodos getTabOrders() y getArrayKeysOrdered()
- Dependencias: Importa TAB_ORDER_KEY desde decorator file
- Algoritmo: Ordenamiento con MAX_SAFE_INTEGER para sin TabOrder

### 11.4 Tutoriales y Ejemplos

**copilot/tutorials/01-basic-crud.md**
- Sección: Navegación por Teclado en Formularios
- Ejemplo: CustomerForm con TabOrder para navegación lógica
- Patrón: TabOrder sincronizado con PropertyIndex

**copilot/examples/advanced-module-example.md**
- Sección: Formularios Complejos con Navegación Optimizada
- Patrón: TabOrder con gaps para escalabilidad
- Técnica: Navegación diferente de orden visual

### 11.5 Contratos y Arquitectura

**copilot/00-CONTRACT.md**
- Sección 4.2: Metadata de Interfaz de Usuario
- Principio: TabOrder define comportamiento de navegación
- Sección 8.1: Decoradores como configuración de accesibilidad

**copilot/01-FRAMEWORK-OVERVIEW.md**
- Sección: Sistema de Navegación por Teclado
- Contexto: TabOrder dentro del ecosistema de decoradores
- Flujo: Entity → TabOrder → tabindex HTML → Browser navigation

**copilot/02-FLOW-ARCHITECTURE.md**
- Sección: Accesibilidad y Navegación
- Flujo: getTabOrders() → FormInput → tabindex attribute → Tab key navigation
- Garantía: TabOrder respetado en toda la cadena de navegación

### 11.6 Estándares Web y Accesibilidad

**HTML tabindex Specification**
- Estándar: WHATWG HTML Living Standard
- Valores: Integers positivos definen orden, 0 incluye en orden DOM, -1 excluye
- Comportamiento: Navegador ordena por tabindex ascendente, luego orden DOM

**WCAG 2.1 Guidelines**
- Criterio: 2.4.3 Focus Order (Level A)
- Requisito: Orden de navegación debe ser lógico y significativo
- Validación: TabOrder debe seguir flujo lógico de formulario

**WAI-ARIA Practices**
- Patrón: Form Design Pattern
- Recomendación: Mantener orden lógico de Tab para usuarios de teclado
- Testing: Validar con screen readers y navegación solo por teclado
