# ViewGroup Decorator

## 1. Propósito

Agrupar propiedades relacionadas de entidades en secciones visuales organizadas dentro de formularios generados automáticamente, permitiendo categorización lógica de campos mediante nombres de grupo que estructuran interfaces de usuario complejas.

## 2. Alcance

### 2.1 Responsabilidades

- Asignar nombre de grupo visual a propiedades específicas de entidad
- Permitir agrupación lógica de campos relacionados en formularios
- Proporcionar método getViewGroups() para acceso a metadata de agrupación
- Facilitar renderizado de secciones colapsables o tabs en interfaces
- Habilitar organización semántica de formularios con múltiples categorías de datos
- Soportar agrupación combinada con @PropertyIndex para ordenamiento dentro de grupos

### 2.2 Límites

- No controla el layout visual específico de grupos (responsabilidad de componentes)
- No determina si grupos son tabs, accordions, o fieldsets (decisión de UI)
- No ordena grupos entre sí (responsabilidad de componente renderizador)
- No valida que groupName sea único o predefinido
- No afecta serialización, persistencia ni validación de propiedades
- No crea relaciones funcionales entre propiedades del mismo grupo

## 3. Definiciones Clave

**ViewGroup**: Nombre de categoría visual que agrupa propiedades relacionadas en sección específica de formulario.

**GroupName**: String identificador de grupo usado para categorización de propiedades, típicamente descriptivo (Personal Information, Address, Payment Details).

**ViewGroup Map**: Estructura Record<string, string> que mapea nombres de propiedades a sus groupNames asignados.

**Ungrouped Properties**: Propiedades sin decorador @ViewGroup que se renderizan en sección default o primera del formulario.

**Group-Based Layout**: Patrón de UI donde formulario se divide en secciones etiquetadas, cada sección conteniendo propiedades del mismo ViewGroup.

**Collapsible Groups**: Implementación común donde cada ViewGroup es sección expandible/colapsable independientemente.

## 4. Descripción Técnica

### 4.1 Implementación del Decorador

```typescript
export const VIEW_GROUP_KEY = Symbol('view_group');

export function ViewGroup(groupName: string): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        if (!proto[VIEW_GROUP_KEY]) {
            proto[VIEW_GROUP_KEY] = {};
        }
        proto[VIEW_GROUP_KEY][propertyKey] = groupName;
    };
}
```

Decorador simple que almacena string de groupName en prototype usando Symbol-based key. No valida formato ni existencia de groupName, acepta cualquier string proporcionado.

### 4.2 Método de Acceso en BaseEntity

```typescript
public getViewGroups(): Record<string, string> {
    const proto = (this.constructor as any).prototype;
    return proto[VIEW_GROUP_KEY] || {};
}
```

Método que recupera mapa completo de ViewGroups desde prototype. Retorna objeto vacío cuando no existen configurados. No incluye propiedades sin grupo (aplicación debe manejar caso default).

### 4.3 Almacenamiento de Metadata

El metadata se almacena en:
- Ubicación: Constructor.prototype[VIEW_GROUP_KEY]
- Estructura: Record<string | symbol, string>
- Vida útil: Permanente durante lifecycle de aplicación
- Herencia: Compartida entre instancias de clase
- Serialización: No incluida en toDictionary() ni persistencia

## 5. Flujo de Funcionamiento

### 5.1 Fase de Declaración

```
Developer diseña entidad con múltiples categorías de datos
    ↓
Aplica @ViewGroup("GroupName") a propiedades relacionadas
    ↓
TypeScript ejecuta decoradores en definición de clase
    ↓
ViewGroup() almacena {propertyKey: "GroupName"} en prototype
    ↓
Metadata disponible para renderizado de formulario
```

### 5.2 Fase de Renderizado de Formulario

```
DetailView component necesita renderizar formulario
    ↓
Llama entity.getViewGroups() para obtener mapa de grupos
    ↓
Obtiene lista de propiedades vía entity.getKeys()
    ↓
Agrupa propiedades por ViewGroup:
    Map<GroupName, PropertyKey[]>
    ↓
Para cada grupo, renderiza sección con título GroupName
    ↓
Dentro de cada sección, renderiza FormInputs de propiedades del grupo
    ↓
Propiedades sin grupo se renderizan en sección "General" o primera
```

### 5.3 Algoritmo de Agrupación en UI

```typescript
function groupProperties(entity: BaseEntity): Map<string, string[]> {
    const viewGroups = entity.getViewGroups();
    const allKeys = entity.getKeys();
    const grouped = new Map<string, string[]>();
    
    // Inicializar grupo default
    grouped.set('General', []);
    
    for (const key of allKeys) {
        const groupName = viewGroups[key] || 'General';
        
        if (!grouped.has(groupName)) {
            grouped.set(groupName, []);
        }
        
        grouped.get(groupName)!.push(key);
    }
    
    // Eliminar grupo General si está vacío
    if (grouped.get('General')!.length === 0) {
        grouped.delete('General');
    }
    
    return grouped;
}
```

### 5.4 Ejemplo de Uso Completo

```typescript
class Employee extends BaseEntity {
    // Personal Information Group
    @ViewGroup("Personal Information")
    @PropertyIndex(1)
    firstName: string;
    
    @ViewGroup("Personal Information")
    @PropertyIndex(2)
    lastName: string;
    
    @ViewGroup("Personal Information")
    @PropertyIndex(3)
    email: string;
    
    // Employment Details Group
    @ViewGroup("Employment Details")
    @PropertyIndex(10)
    position: string;
    
    @ViewGroup("Employment Details")
    @PropertyIndex(11)
    department: string;
    
    @ViewGroup("Employment Details")
    @PropertyIndex(12)
    salary: number;
    
    // Propiedades sin grupo (renderizadas en "General")
    id: number;
    createdAt: Date;
}

const employee = new Employee();
const groups = employee.getViewGroups();
// {
//   firstName: "Personal Information",
//   lastName: "Personal Information",
//   email: "Personal Information",
//   position: "Employment Details",
//   department: "Employment Details",
//   salary: "Employment Details"
// }
```

Resultado en UI:
```
[Personal Information]
  - First Name: [____]
  - Last Name:  [____]
  - Email:      [____]

[Employment Details]
  - Position:   [____]
  - Department: [____]
  - Salary:     [____]

[General]
  - ID:         [____]
  - Created At: [____]
```

## 6. Reglas Obligatorias

### 6.1 Aplicación del Decorador

1. @ViewGroup debe aplicarse a propiedades de clase, nunca a clase completa
2. groupName debe ser string descriptivo legible por usuarios
3. Usar mismo groupName para todas las propiedades de grupo
4. groupName case-sensitive ("Address" ≠ "address")
5. groupName puede contener espacios y caracteres especiales

### 6.2 Nombrado de Grupos

6. Nombres de grupo deben ser descriptivos ("Contact Information", no "Group1")
7. Usar Title Case para nombres de grupo ("Personal Details")
8. Mantener nombres consistentes en toda la aplicación
9. Evitar nombres técnicos, usar términos de negocio
10. Considerar internacionalización (i18n) para nombres de grupo

### 6.3 Organización de Propiedades

11. Agrupar propiedades relacionadas semánticamente
12. Limitar grupos a 3-7 propiedades para usabilidad óptima
13. Usar @PropertyIndex dentro de grupos para ordenamiento explícito
14. Propiedades sin @ViewGroup se agrupan en sección default
15. No duplicar propiedades entre múltiples grupos (cada propiedad un solo grupo)

### 6.4 Interacción con Otros Decoradores

16. @ViewGroup y @PropertyIndex son compatibles, PropertyIndex ordena dentro de grupo
17. @ViewGroup no afecta @HideInDetailView (propiedades ocultas no renderizan)
18. @ViewGroup independiente de @Required, @Validation, @ReadOnly
19. Usar @ViewGroupRow para control de layout dentro de grupo
20. @TabOrder puede diferir de orden visual dentro de ViewGroup

### 6.5 Renderizado en UI

21. Componente de UI determina representación visual (tabs, accordions, fieldsets)
22. Orden de grupos en UI determinado por componente, no por decorador
23. Grupos pueden ser colapsables para mejorar navegación en formularios largos
24. Grupos vacíos (todas propiedades ocultas) no deben renderizarse
25. Responsive design: considerar stacking vertical de grupos en móviles

## 7. Prohibiciones

### 7.1 Prohibiciones de Implementación

1. PROHIBIDO aplicar @ViewGroup a clase (es property decorator)
2. PROHIBIDO usar null, undefined o string vacío como groupName
3. PROHIBIDO usar números como groupName ("1", "2"), usar nombres descriptivos
4. PROHIBIDO aplicar múltiples @ViewGroup a misma propiedad
5. PROHIBIDO asumir orden de renderizado de grupos sin control explícito

### 7.2 Prohibiciones de Nombrado

6. PROHIBIDO usar nombres técnicos de código como groupName
7. PROHIBIDO usar abreviaturas oscuras (usar nombres completos)
8. PROHIBIDO inconsistencia de case ("Personal Info" vs "personal info")
9. PROHIBIDO nombres excesivamente largos (>50 caracteres)
10. PROHIBIDO caracteres especiales problemáticos (@, #, $, %)

### 7.3 Prohibiciones de Uso

11. PROHIBIDO usar ViewGroup para controlar lógica de validación
12. PROHIBIDO asumir que propiedades del mismo grupo se validan juntas
13. PROHIBIDO usar groupName para identificar propiedades programáticamente
14. PROHIBIDO serializar ViewGroup metadata en APIs
15. PROHIBIDO depender de ViewGroup para funcionalidad backend

### 7.4 Prohibiciones de Lógica

16. PROHIBIDO implementar lógica de negocio basada en ViewGroup
17. PROHIBIDO usar ViewGroup para relaciones entre entidades
18. PROHIBIDO modificar valores de propiedades basado en grupo
19. PROHIBIDO usar ViewGroup para control de acceso o permisos
20. PROHIBIDO asumir que ViewGroup crea dependencias entre propiedades

## 8. Dependencias

### 8.1 Dependencias Directas

**Symbol (JavaScript Nativo)**
- Propósito: Crear VIEW_GROUP_KEY único para storage
- Uso: Almacenar metadata sin colisiones de namespace
- Crítico: Sí, sin Symbol podría sobrescribir propiedades

**PropertyDecorator (TypeScript)**
- Propósito: Tipado de decorador de propiedad
- Uso: Garantizar firma correcta de función ViewGroup()
- Crítico: Sí, TypeScript rechazará decorador incorrecto

**BaseEntity.prototype**
- Propósito: Almacenamiento de metadata compartida
- Uso: Contiene Record<string, string> con ViewGroups
- Crítico: Sí, instancias acceden a metadata vía prototype

### 8.2 Dependencias de BaseEntity

**getViewGroups() Method**
- Propósito: Recuperar mapa completo de ViewGroups
- Retorno: Record<string, string>
- Crítico: Sí, sin este método no se puede acceder a metadata

**getKeys() Method**
- Propósito: Obtener lista ordenada de propiedades
- Uso: Fuente de propiedades para agrupar
- Crítico: Sí, necesario para iterar propiedades y agrupar

### 8.3 Dependencias de UI Components

**DetailView Components**
- Propósito: Renderizar formulario con secciones agrupadas
- Uso: Consulta getViewGroups() y renderiza grupos
- Crítico: Sí, sin componente ViewGroup no tiene efecto visible

**Group Container Components**
- Tipos: FieldsetComponent, AccordionComponent, TabsComponent
- Propósito: Renderizar grupos como secciones visuales
- Crítico: Sí, diferentes implementaciones para diferentes UX

### 8.4 Dependencias Opcionales

**@PropertyIndex Decorator**
- Relación: Ordena propiedades dentro de cada grupo
- Uso: Aplicar PropertyIndex dentro de mismo ViewGroup
- Patrón: ViewGroup agrupa, PropertyIndex ordena

**@ViewGroupRow Decorator**
- Relación: Controla layout de columnas dentro de grupo
- Uso: Determina si propiedades se renderizan single, pair, triple
- Patrón: ViewGroup crea sección, ViewGroupRow controla columnas

**@HideInDetailView Decorator**
- Relación: Propiedades ocultas no aparecen en grupos
- Efecto: Grupo puede quedar vacío si todas propiedades ocultas
- Manejo: No renderizar grupos vacíos

## 9. Relaciones

### 9.1 Decoradores de Layout

**@PropertyIndex**
- Naturaleza: Complementario, ambos controlan organización visual
- Diferencia: ViewGroup agrupa secciones, PropertyIndex ordena dentro de sección
- Uso conjunto: @ViewGroup("Contact") @PropertyIndex(1)
- Recomendación: Usar índices secuenciales dentro de cada grupo

**@ViewGroupRow**
- Naturaleza: Complementario, controla columnas dentro de grupo
- Diferencia: ViewGroup crea sección, ViewGroupRow define layout de columnas
- Uso conjunto: @ViewGroup("Address") @ViewGroupRow(ViewGroupRow.PAIR)
- Patrón: Dos propiedades lado a lado dentro de grupo Address

**@TabOrder**
- Relación: Independiente, controla navegación no visualización
- Uso: TabOrder puede diferir de orden visual en ViewGroup
- Ejemplo: Navegación lógica diferente de agrupación visual

### 9.2 Decoradores de Visibilidad

**@HideInDetailView**
- Interacción: Propiedades con ViewGroup pueden ocultarse
- Efecto: Grupo puede quedar vacío si todas ocultas
- Manejo: Componente no renderiza grupos vacíos

**@HideInListView**
- Interacción: No afecta ViewGroup (ListView no agrupa por defecto)
- Uso: ViewGroup solo relevante en DetailView (formularios)

### 9.3 BaseEntity Methods

**getViewGroups()**
- Retorno: Record<string, string> (propertyKey → groupName)
- Uso: Consulta de metadata para agrupación en UI
- Invocado por: DetailView, FormLayoutComponent

**getKeys()**
- Relación: Fuente de propiedades para iterar y agrupar
- Uso: getKeys() + getViewGroups() = agrupación completa
- Algoritmo: Iterar keys, agrupar según viewGroups map

### 9.4 Componentes de UI

**DetailView Component**
- Consumo: Llama getViewGroups() y agrupa propiedades
- Renderizado: Crea secciones visuales por grupo
- Layout: Fieldsets, accordions, tabs según implementación

**FieldsetComponent**
- Propósito: Renderizar grupo como <fieldset> HTML
- Uso: Sección con borde y legend (nombre de grupo)
- UX: Simple, todos los grupos visibles simultáneamente

**AccordionComponent**
- Propósito: Renderizar grupos como acordeón colapsable
- Uso: Solo un grupo expandido a la vez
- UX: Ideal para formularios largos con muchos grupos

**TabsComponent**
- Propósito: Renderizar grupos como tabs horizontales
- Uso: Navegación entre grupos mediante tabs
- UX: Ideal para formularios muy largos, claramente separados

### 9.5 Patrones de Agrupación

**Personal vs Professional**
```typescript
@ViewGroup("Personal Information") firstName: string;
@ViewGroup("Personal Information") email: string;
@ViewGroup("Professional Details") position: string;
@ViewGroup("Professional Details") department: string;
```

**Address Grouping**
```typescript
@ViewGroup("Billing Address") billingStreet: string;
@ViewGroup("Billing Address") billingCity: string;
@ViewGroup("Shipping Address") shippingStreet: string;
@ViewGroup("Shipping Address") shippingCity: string;
```

**Temporal Grouping**
```typescript
@ViewGroup("Creation Info") createdAt: Date;
@ViewGroup("Creation Info") createdBy: string;
@ViewGroup("Modification Info") updatedAt: Date;
@ViewGroup("Modification Info") updatedBy: string;
```

## 10. Notas de Implementación

### 10.1 Patrones de Uso Comunes

**Formulario de Empleado con Grupos**
```typescript
class Employee extends BaseEntity {
    // Personal Information
    @ViewGroup("Personal Information")
    @PropertyIndex(1)
    firstName: string;
    
    @ViewGroup("Personal Information")
    @PropertyIndex(2)
    lastName: string;
    
    @ViewGroup("Personal Information")
    @PropertyIndex(3)
    @StringTypeDef(StringType.EMAIL)
    email: string;
    
    // Employment Details
    @ViewGroup("Employment Details")
    @PropertyIndex(10)
    position: string;
    
    @ViewGroup("Employment Details")
    @PropertyIndex(11)
    department: string;
    
    @ViewGroup("Employment Details")
    @PropertyIndex(12)
    startDate: Date;
    
    // Compensation
    @ViewGroup("Compensation")
    @PropertyIndex(20)
    salary: number;
    
    @ViewGroup("Compensation")
    @PropertyIndex(21)
    bonus: number;
}
```

**Address Form con Múltiples Direcciones**
```typescript
class Order extends BaseEntity {
    @ViewGroup("Billing Address")
    billingStreet: string;
    
    @ViewGroup("Billing Address")
    billingCity: string;
    
    @ViewGroup("Billing Address")
    billingZipCode: string;
    
    @ViewGroup("Shipping Address")
    shippingStreet: string;
    
    @ViewGroup("Shipping Address")
    shippingCity: string;
    
    @ViewGroup("Shipping Address")
    shippingZipCode: string;
    
    @ViewGroup("Order Details")
    orderNumber: string;
    
    @ViewGroup("Order Details")
    orderDate: Date;
}
```

### 10.2 Implementación en Componentes

**DetailView con Fieldsets**
```vue
<template>
    <form class="detail-view">
        <fieldset v-for="(properties, groupName) in groupedProperties" :key="groupName">
            <legend>{{ groupName }}</legend>
            <FormInput
                v-for="propertyKey in properties"
                :key="propertyKey"
                :entity="entity"
                :propertyKey="propertyKey"
            />
        </fieldset>
    </form>
</template>

<script>
export default {
    computed: {
        groupedProperties() {
            const viewGroups = this.entity.getViewGroups();
            const allKeys = this.entity.getKeys();
            const grouped = new Map();
            
            grouped.set('General', []);
            
            for (const key of allKeys) {
                const groupName = viewGroups[key] || 'General';
                if (!grouped.has(groupName)) {
                    grouped.set(groupName, []);
                }
                grouped.get(groupName).push(key);
            }
            
            if (grouped.get('General').length === 0) {
                grouped.delete('General');
            }
            
            return grouped;
        }
    }
};
</script>

<style>
fieldset {
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 16px;
    margin-bottom: 16px;
}

legend {
    font-weight: bold;
    font-size: 1.1rem;
    padding: 0 8px;
}
</style>
```

**DetailView con Accordion Colapsable**
```vue
<template>
    <div class="accordion-form">
        <div v-for="(properties, groupName, index) in groupedProperties" :key="groupName" class="accordion-item">
            <div class="accordion-header" @click="toggleGroup(groupName)">
                <h3>{{ groupName }}</h3>
                <span class="icon">{{ expandedGroups.has(groupName) ? '▼' : '▶' }}</span>
            </div>
            <div v-show="expandedGroups.has(groupName)" class="accordion-content">
                <FormInput
                    v-for="propertyKey in properties"
                    :key="propertyKey"
                    :entity="entity"
                    :propertyKey="propertyKey"
                />
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            expandedGroups: new Set(['General']) // Primer grupo expandido por defecto
        };
    },
    methods: {
        toggleGroup(groupName) {
            if (this.expandedGroups.has(groupName)) {
                this.expandedGroups.delete(groupName);
            } else {
                this.expandedGroups.add(groupName);
            }
            this.$forceUpdate(); // Force reactivity
        }
    }
};
</script>
```

**DetailView con Tabs**
```vue
<template>
    <div class="tabbed-form">
        <div class="tabs">
            <button
                v-for="(properties, groupName) in groupedProperties"
                :key="groupName"
                @click="activeTab = groupName"
                :class="{ active: activeTab === groupName }"
            >
                {{ groupName }}
            </button>
        </div>
        
        <div class="tab-content">
            <div v-for="(properties, groupName) in groupedProperties" :key="groupName">
                <div v-show="activeTab === groupName">
                    <FormInput
                        v-for="propertyKey in properties"
                        :key="propertyKey"
                        :entity="entity"
                        :propertyKey="propertyKey"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            activeTab: 'General'
        };
    },
    mounted() {
        // Set first group as active
        const firstGroup = Object.keys(this.groupedProperties)[0];
        if (firstGroup) {
            this.activeTab = firstGroup;
        }
    }
};
</script>

<style>
.tabs {
    display: flex;
    border-bottom: 2px solid #ddd;
}

.tabs button {
    padding: 12px 24px;
    border: none;
    background: transparent;
    cursor: pointer;
}

.tabs button.active {
    border-bottom: 3px solid #4CAF50;
    font-weight: bold;
}
</style>
```

### 10.3 Testing y Validación

**Unit Test de ViewGroup**
```typescript
test('getViewGroups returns configured groups', () => {
    class TestEntity extends BaseEntity {
        @ViewGroup("Group A") propA: string;
        @ViewGroup("Group A") propB: string;
        @ViewGroup("Group B") propC: string;
    }
    
    const entity = new TestEntity();
    const groups = entity.getViewGroups();
    
    expect(groups.propA).toBe("Group A");
    expect(groups.propB).toBe("Group A");
    expect(groups.propC).toBe("Group B");
});

test('properties without ViewGroup not in map', () => {
    class TestEntity extends BaseEntity {
        @ViewGroup("Grouped") grouped: string;
        ungrouped: string;
    }
    
    const entity = new TestEntity();
    const groups = entity.getViewGroups();
    
    expect(groups.grouped).toBe("Grouped");
    expect(groups.ungrouped).toBeUndefined();
});
```

**Integration Test de Agrupación UI**
```typescript
test('DetailView groups properties correctly', () => {
    class User extends BaseEntity {
        @ViewGroup("Personal") firstName: string;
        @ViewGroup("Personal") lastName: string;
        @ViewGroup("Contact") email: string;
        @ViewGroup("Contact") phone: string;
    }
    
    const user = new User();
    const wrapper = mount(DetailView, { props: { entity: user } });
    
    const fieldsets = wrapper.findAll('fieldset');
    expect(fieldsets).toHaveLength(2); // Personal y Contact
    
    const personalLegend = wrapper.find('legend:contains("Personal")');
    expect(personalLegend.exists()).toBe(true);
    
    const contactLegend = wrapper.find('legend:contains("Contact")');
    expect(contactLegend.exists()).toBe(true);
});
```

### 10.4 Debugging y Diagnóstico

**Inspeccionar Grupos**
```typescript
const employee = new Employee();
const viewGroups = employee.getViewGroups();
console.log('ViewGroups:', viewGroups);
// {
//   firstName: "Personal Information",
//   lastName: "Personal Information",
//   position: "Employment Details",
//   ...
// }

// Agrupar propiedades
const grouped = new Map();
const keys = employee.getKeys();
for (const key of keys) {
    const group = viewGroups[key] || 'General';
    if (!grouped.has(group)) {
        grouped.set(group, []);
    }
    grouped.get(group).push(key);
}
console.log('Grouped properties:', Object.fromEntries(grouped));
// {
//   "Personal Information": ["firstName", "lastName", "email"],
//   "Employment Details": ["position", "department"],
//   "General": ["id", "createdAt"]
// }
```

### 10.5 Migraciones y Refactoring

**Agregar ViewGroup a Entidad Existente**
```typescript
// Antes - Sin agrupación
class Employee extends BaseEntity {
    firstName: string;
    lastName: string;
    position: string;
    department: string;
}

// Después - Con agrupación
class Employee extends BaseEntity {
    @ViewGroup("Personal Information") firstName: string;
    @ViewGroup("Personal Information") lastName: string;
    @ViewGroup("Employment Details") position: string;
    @ViewGroup("Employment Details") department: string;
}
```

Verificar que DetailView implementa lógica de agrupación.

**Cambiar Nombre de Grupo**
```typescript
// Antes
@ViewGroup("Contact Info") email: string;

// Después
@ViewGroup("Contact Information") email: string; // Nombre más formal
```

Buscar y reemplazar todas las ocurrencias del groupName antiguo.

## 11. Referencias Cruzadas

### 11.1 Documentación Relacionada

**copilot/layers/02-base-entity/metadata-access.md**
- Sección: Métodos de Acceso a Metadata de Layout
- Contenido: Implementación de getViewGroups()
- Relevancia: Único método de acceso a ViewGroup metadata

**copilot/layers/01-decorators/property-index-decorator.md**
- Relación: Ordenamiento de propiedades dentro de grupos
- Uso conjunto: ViewGroup agrupa, PropertyIndex ordena
- Patrón: Índices secuenciales dentro de cada grupo

**copilot/layers/01-decorators/view-group-row-decorator.md**
- Relación: Layout de columnas dentro de grupos
- Uso conjunto: ViewGroup crea sección, ViewGroupRow controla columnas
- Patrón: PAIR para propiedades lado a lado dentro de grupo

**copilot/layers/01-decorators/tab-order-decorator.md**
- Relación: Navegación puede diferir de agrupación visual
- Independencia: TabOrder y ViewGroup son ortogonales
- Ejemplo: Navegación cruzando grupos

**copilot/layers/01-decorators/hide-in-detail-view-decorator.md**
- Interacción: Propiedades ocultas no aparecen en grupos
- Manejo: Grupos vacíos no se renderizan
- Validación: Verificar que grupo tiene propiedades visibles

### 11.2 BaseEntity Core

**copilot/layers/02-base-entity/base-entity-core.md**
- Método: getViewGroups()
- Almacenamiento: prototype[VIEW_GROUP_KEY]

**copilot/layers/02-base-entity/metadata-access.md**
- Sección: Métodos de Layout y Presentación
- Contenido: getViewGroups() implementation details

### 11.3 Componentes de UI

**copilot/layers/04-components/DetailViewTable.md**
- Consumo: Usa getViewGroups() para agrupar formulario
- Renderizado: Crea secciones visuales por grupo
- Implementación: Fieldsets, accordions, o tabs

**copilot/layers/04-components/FormLayoutComponents.md**
- Relación: Componentes de layout que respetan ViewGroup
- Tipos: FieldsetComponent, AccordionComponent, TabsComponent

### 11.4 Código Fuente

**src/decorations/view_group_decorator.ts**
- Líneas: 1-12
- Exports: VIEW_GROUP_KEY, ViewGroup

**src/entities/base_entity.ts**
- Líneas 277-280: Método getViewGroups()
- Dependencias: Importa VIEW_GROUP_KEY

### 11.5 Tutoriales y Ejemplos

**copilot/tutorials/01-basic-crud.md**
- Sección: Organización de Formularios
- Ejemplo: Employee con grupos Personal y Employment
- Patrón: Agrupación lógica de campos relacionados

**copilot/examples/advanced-module-example.md**
- Sección: Formularios Complejos con Múltiples Secciones
- Patrón: Accordion colapsable para formularios largos
- Técnica: ViewGroup + ViewGroupRow para layout avanzado

### 11.6 Contratos y Arquitectura

**copilot/00-CONTRACT.md**
- Sección 4.2: Metadata de Layout
- Principio: ViewGroup define organización visual de formularios
- Sección 8.1: Decoradores como configuración de UI

**copilot/01-FRAMEWORK-OVERVIEW.md**
- Sección: Sistema de Agrupación Visual
- Contexto: ViewGroup dentro del ecosistema de decoradores de layout
- Flujo: Entity → ViewGroup → Secciones UI

**copilot/02-FLOW-ARCHITECTURE.md**
- Sección: Renderizado de Formularios Agrupados
- Flujo: getViewGroups() → Agrupación → Sección rendering
- Garantía: Propiedades agrupadas renderizadas juntas
