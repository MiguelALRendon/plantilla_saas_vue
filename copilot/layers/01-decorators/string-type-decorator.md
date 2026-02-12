# StringTypeDef Decorator

## 1. Propósito

Especificar el tipo semántico de propiedades string para determinar el componente de input HTML apropiado y aplicar validaciones específicas de formato, permitiendo diferenciación entre texto plano, email, password, URL, teléfono y textarea mediante enum StringType.

## 2. Alcance

### 2.1 Responsabilidades

- Asignar tipo semántico StringType a propiedades string de entidades
- Determinar componente FormInput específico para renderizado (EmailInput, PasswordInput, TextInput, etc.)
- Aplicar validación automática de formato según tipo (email format, URL format)
- Configurar atributos HTML apropiados (type="email", type="password", type="tel", type="url")
- Proporcionar default value TEXT para propiedades string sin decorador explícito
- Habilitar autocomplete y teclados móviles específicos según tipo

### 2.2 Límites

- No valida contenido de strings, solo determina tipo de input UI
- No reemplaza @Validation decorator para reglas de validación personalizadas
- No afecta almacenamiento o serialización de valores string
- No transforma valores (ej: no hashea passwords automáticamente)
- No aplica máscaras de formato (requiere @Mask decorator)
- No determina longitud máxima de string (requiere validación explícita)

## 3. Definiciones Clave

**StringType Enum**: Enumeración que define tipos semánticos de strings disponibles: EMAIL, PASSWORD, TEXT, TELEPHONE, URL, TEXTAREA.

**StringType.TEXT**: Tipo por defecto para propiedades string, renderiza input type="text" estándar de una línea.

**StringType.EMAIL**: Tipo para direcciones de correo electrónico, renderiza input type="email" con validación de formato email automática del navegador.

**StringType.PASSWORD**: Tipo para contraseñas, renderiza input type="password" con caracteres ocultos y prevención de autocompletado.

**StringType.TELEPHONE**: Tipo para números telefónicos, renderiza input type="tel" con teclado numérico en dispositivos móviles.

**StringType.URL**: Tipo para URLs, renderiza input type="url" con validación de formato URL del navegador.

**StringType.TEXTAREA**: Tipo para texto multilínea, renderiza textarea HTML en lugar de input, permite edición de texto extenso.

**StringTypeMap**: Record<string, StringType> que mapea nombres de propiedades a sus tipos asignados, con default StringType.TEXT para propiedades no decoradas.

## 4. Descripción Técnica

### 4.1 Enumeración StringType

```typescript
export enum StringType {
    EMAIL,
    PASSWORD,
    TEXT,
    TELEPHONE,
    URL,
    TEXTAREA
}
```

Enum numérico donde cada valor representa un tipo semántico de string. Valores numéricos internos (0, 1, 2...) son irrelevantes para uso externo, solo nombres importan.

### 4.2 Implementación del Decorador

```typescript
import { StringType } from "@/enums/string_type";

export const STRING_TYPE_KEY = Symbol('string_type');

export function StringTypeDef(stringType: StringType): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        if (!proto[STRING_TYPE_KEY]) {
            proto[STRING_TYPE_KEY] = {};
        }
        proto[STRING_TYPE_KEY][propertyKey] = stringType;
    };
}
```

Decorador simple que almacena valor StringType enum en prototype usando Symbol-based key. No realiza validación de tipo de propiedad (TypeScript garantiza que solo se aplica a strings).

### 4.3 Método de Acceso en BaseEntity

```typescript
public getStringType(): Record<string, StringType> {
    const proto = (this.constructor as any).prototype;
    const stringTypes = proto[STRING_TYPE_KEY] || {};
    const properties = (this.constructor as typeof BaseEntity).getProperties();
    const result: Record<string, StringType> = {};
    
    for (const key of Object.keys(properties)) {
        result[key] = stringTypes[key] ?? StringType.TEXT;
    }
    
    return result;
}
```

Método que:
1. Recupera stringTypes configurados desde prototype
2. Itera sobre todas las propiedades de entidad
3. Asigna StringType.TEXT por defecto a propiedades sin decorador explícito
4. Retorna Record completo con tipo para cada propiedad
5. Garantiza que todas las propiedades tienen StringType (nunca undefined)

### 4.4 Almacenamiento de Metadata

El metadata se almacena en:
- Ubicación: Constructor.prototype[STRING_TYPE_KEY]
- Estructura: Record<string | symbol, StringType>
- Vida útil: Permanente durante lifecycle de aplicación
- Herencia: Compartida entre instancias de misma clase
- Default: StringType.TEXT para propiedades no decoradas

## 5. Flujo de Funcionamiento

### 5.1 Fase de Declaración

```
Developer declara entidad con propiedades string
    ↓
Aplica @StringTypeDef(StringType.EMAIL) a propiedad específica
    ↓
TypeScript ejecuta decorador en tiempo de definición de clase
    ↓
StringTypeDef() almacena StringType.EMAIL en prototype[STRING_TYPE_KEY]
    ↓
{email: StringType.EMAIL} disponible para todas las instancias
    ↓
Propiedades string sin decorador reciben TEXT por defecto
```

### 5.2 Fase de Renderizado de Formulario

```
FormInput component necesita renderizar propiedad string
    ↓
Llama entity.getStringType() para obtener mapa completo
    ↓
getStringType() retorna {name: TEXT, email: EMAIL, password: PASSWORD, ...}
    ↓
Component obtiene stringType[propertyKey] para propiedad actual
    ↓
Switch/case determina componente específico a renderizar:
    - EMAIL → EmailInputComponent
    - PASSWORD → PasswordInputComponent
    - TEXTAREA → TextareaInputComponent
    - TEXT → TextInputComponent (default)
    ↓
Component renderiza input HTML con type apropiado
    ↓
Navegador aplica validación nativa según type
```

### 5.3 Fase de Validación en Navegador

```
Usuario ingresa valor en input type="email"
    ↓
Navegador valida formato email automáticamente
    ↓
Si formato inválido, navegador previene submit de formulario
    ↓
Navegador muestra mensaje de error nativo
    ↓
Framework respeta validación navegador antes de ejecutar validaciones personalizadas
```

### 5.4 Ejemplo de Flujo Completo

Dada esta entidad:
```typescript
class User extends BaseEntity {
    name: string; // Sin decorador → TEXT
    @StringTypeDef(StringType.EMAIL) email: string;
    @StringTypeDef(StringType.PASSWORD) password: string;
    @StringTypeDef(StringType.TEXTAREA) bio: string;
}
```

Renderizado resultante:
- name: `<input type="text">` (default TEXT)
- email: `<input type="email">` con validación email
- password: `<input type="password">` con caracteres ocultos
- bio: `<textarea>` multilínea

## 6. Reglas Obligatorias

### 6.1 Aplicación del Decorador

1. @StringTypeDef debe aplicarse solo a propiedades de tipo string
2. Parámetro stringType debe ser valor de enum StringType
3. No aplicar múltiples @StringTypeDef a misma propiedad
4. No aplicar @StringTypeDef a propiedades number, boolean, Date, etc.
5. StringType debe importarse desde @/enums/string_type

### 6.2 Selección de StringType

6. Usar EMAIL para emails, activa validación de formato email en navegador
7. Usar PASSWORD para contraseñas, oculta caracteres en UI
8. Usar TELEPHONE para teléfonos, activa teclado numérico en móviles
9. Usar URL para URLs, activa validación de formato URL en navegador
10. Usar TEXTAREA para texto multilínea de más de 100 caracteres aproximadamente
11. Usar TEXT (o no aplicar decorador) para strings simples de una línea

### 6.3 Interacción con Otros Decoradores

12. @StringTypeDef y @Mask son compatibles, Mask formatea después de determinar input type
13. @StringTypeDef y @Validation son independientes, validaciones adicionales se ejecutan normalmente
14. @StringTypeDef no afecta @DisplayFormat en ListView
15. PASSWORD type debe combinarse con @Required si contraseña es obligatoria
16. TEXTAREA debe combinarse con @PropertyIndex para controlar orden visual

### 6.4 Componentes de UI

17. FormInput component debe implementar switch para cada StringType
18. EMAIL inputs deben usar input type="email" HTML5
19. PASSWORD inputs deben usar input type="password" HTML5
20. TEXTAREA debe renderizar <textarea> no <input>
21. URL inputs deben usar input type="url" HTML5
22. TELEPHONE inputs deben usar input type="tel" HTML5

### 6.5 Validación

23. Validación de navegador (HTML5) se ejecuta primero
24. @Validation decorators se ejecutan después de validación nativa
25. StringType no reemplaza validaciones personalizadas
26. EMAIL y URL activan validación automática de formato
27. PASSWORD no encripta valores, solo oculta en UI

## 7. Prohibiciones

### 7.1 Prohibiciones de Implementación

1. PROHIBIDO aplicar @StringTypeDef a propiedades no-string
2. PROHIBIDO usar strings literales en lugar de enum StringType
3. PROHIBIDO crear StringType values personalizados (enum es cerrado)
4. PROHIBIDO modificar valores de enum StringType
5. PROHIBIDO usar valores numéricos de enum directamente

### 7.2 Prohibiciones de Uso

6. PROHIBIDO asumir que PASSWORD encripta valores automáticamente
7. PROHIBIDO usar EMAIL sin validación adicional en backend
8. PROHIBIDO usar TELEPHONE para validar formato de teléfono (es solo UI hint)
9. PROHIBIDO usar URL sin sanitización en backend
10. PROHIBIDO depender solo de validación de navegador para seguridad

### 7.3 Prohibiciones de Lógica

11. PROHIBIDO implementar lógica de negocio basada en StringType values
12. PROHIBIDO serializar StringType metadata en APIs públicas
13. PROHIBIDO usar StringType para determinar tipo de base de datos
14. PROHIBIDO exponer valores PASSWORD en logs o consola
15. PROHIBIDO usar StringType como mecanismo de autorización

### 7.4 Prohibiciones de Componentes

16. PROHIBIDO renderizar PASSWORD type en ListView
17. PROHIBIDO ignorar StringType.TEXTAREA renderizándolo como input
18. PROHIBIDO aplicar máscaras incompatibles (ej: máscara numérica a EMAIL)
19. PROHIBIDO cambiar StringType dinámicamente en runtime
20. PROHIBIDO usar type="text" cuando StringType indica type específico

## 8. Dependencias

### 8.1 Dependencias Directas

**StringType Enum**
- Ubicación: @/enums/string_type
- Propósito: Definir tipos semánticos de strings disponibles
- Valores: EMAIL, PASSWORD, TEXT, TELEPHONE, URL, TEXTAREA
- Crítico: Sí, decorador requiere enum para tipado fuerte

**Symbol (JavaScript Nativo)**
- Propósito: Crear STRING_TYPE_KEY único para storage
- Uso: Almacenar metadata sin colisiones de namespace
- Crítico: Sí, sin Symbol podría sobrescribir propiedades de entidad

**PropertyDecorator (TypeScript)**
- Propósito: Tipado de decorador de propiedad
- Uso: Garantizar firma correcta de función StringTypeDef()
- Crítico: Sí, TypeScript rechazará decorador sin tipo correcto

### 8.2 Dependencias de BaseEntity

**BaseEntity.getProperties()**
- Propósito: Obtener lista completa de propiedades para iterar
- Uso: getStringType() itera properties para asignar defaults
- Crítico: Sí, necesario para aplicar TEXT default a propiedades no decoradas

**BaseEntity.prototype**
- Propósito: Almacenamiento de metadata compartida
- Uso: Contiene Record<string, StringType> accesible por instancias
- Crítico: Sí, instancias necesitan acceder a metadata de clase

### 8.3 Dependencias de UI Components

**EmailInputComponent**
- Propósito: Renderizar input type="email"
- Uso: Activado cuando stringType === StringType.EMAIL
- Crítico: Sí, sin componente decorador no tiene efecto visible

**PasswordInputComponent**
- Propósito: Renderizar input type="password"
- Uso: Activado cuando stringType === StringType.PASSWORD
- Crítico: Sí, necesario para ocultar contraseñas en UI

**TextareaInputComponent**
- Propósito: Renderizar <textarea> multilínea
- Uso: Activado cuando stringType === StringType.TEXTAREA
- Crítico: Sí, único componente para texto extenso

**TextInputComponent**
- Propósito: Renderizar input type="text" default
- Uso: Activado cuando stringType === StringType.TEXT
- Crítico: Sí, fallback para strings genéricos

**TelephoneInputComponent**
- Propósito: Renderizar input type="tel"
- Uso: Activado cuando stringType === StringType.TELEPHONE
- Opcional: Puede caer back a TextInput si no implementado

**URLInputComponent**
- Propósito: Renderizar input type="url"
- Uso: Activado cuando stringType === StringType.URL
- Opcional: Puede caer back a TextInput si no implementado

### 8.4 Dependencias Opcionales

**@Mask Decorator**
- Relación: Formatea entrada según patrón
- Compatibilidad: Aplicar después de determinar StringType
- Ejemplo: TELEPHONE con máscara (555) 555-5555

**@Validation Decorator**
- Relación: Validación adicional después de navegador
- Compatibilidad: EMAIL con @Validation de formato personalizado
- Ejemplo: EMAIL con validación de dominio específico

**HTML5 Input Validation**
- Relación: Validación nativa de navegador
- Uso: type="email" y type="url" activan validación automática
- Crítico: Parcial, mejora UX pero no reemplaza validación backend

## 9. Relaciones

### 9.1 Componentes de Input

**EmailInputComponent**
- StringType: EMAIL
- HTML: `<input type="email">`
- Validación: Formato email automático del navegador
- Atributos: autocomplete="email", spellcheck="false"
- Ejemplo: usuario@dominio.com

**PasswordInputComponent**
- StringType: PASSWORD
- HTML: `<input type="password">`
- Comportamiento: Caracteres ocultos como •••••
- Atributos: autocomplete="new-password" para nuevas contraseñas
- Seguridad: No guarda en historial de navegador

**TextareaInputComponent**
- StringType: TEXTAREA
- HTML: `<textarea rows="4">`
- Uso: Biografías, descripciones, comentarios, notas
- Atributos: Redimensionable, múltiples líneas

**TextInputComponent**
- StringType: TEXT (default)
- HTML: `<input type="text">`
- Uso: Nombres, títulos, strings simples
- Atributos: autocomplete="on", spellcheck="true"

**TelephoneInputComponent**
- StringType: TELEPHONE
- HTML: `<input type="tel">`
- Comportamiento: Teclado numérico en iOS/Android
- Ejemplo: +1 (555) 555-5555

**URLInputComponent**
- StringType: URL
- HTML: `<input type="url">`
- Validación: Formato URL automático del navegador
- Ejemplo: https://example.com

### 9.2 Decoradores Complementarios

**@Mask**
- Interacción: Formatea valor según patrón después de input type
- Compatibilidad: TELEPHONE con máscara de teléfono
- Ejemplo: @StringTypeDef(StringType.TELEPHONE) @Mask("(999) 999-9999")

**@Validation**
- Interacción: Validación adicional a validación de navegador
- Uso: EMAIL con validación de dominio corporativo
- Ejemplo: @Validation(email => email.endsWith('@company.com'))

**@Required**
- Interacción: Marcado de campo como obligatorio
- Compatibilidad: Aplica a todos los StringTypes
- HTML: Agrega atributo required a inputs

**@HelpText**
- Interacción: Texto de ayuda debajo de input
- Uso: PASSWORD con requisitos de complejidad
- Ejemplo: "Mínimo 8 caracteres, incluir mayúsculas y números"

**@PropertyName**
- Interacción: Label del input
- Aplicación: Todos los StringTypes usan PropertyName como label
- Ejemplo: "Email Address" para propiedad email

### 9.3 BaseEntity Methods

**getStringType()**
- Retorno: Record<string, StringType>
- Default: StringType.TEXT para propiedades no decoradas
- Uso: Invocado por FormInput para determinar componente

**toDictionary()**
- Interacción: STRING_TYPE no afecta serialización
- Comportamiento: Valores string se incluyen sin transformación
- Advertencia: PASSWORD values no se ocultan en payload

### 9.4 Validación en Capas

**Validación de Navegador (Primera Capa)**
- Activada por: type="email", type="url" HTML5
- Ejecución: Antes de submit de formulario
- Mensajes: Nativos del navegador (no personalizables fácilmente)

**Validación de Framework (Segunda Capa)**
- Decoradores: @Required, @Validation
- Ejecución: Después de validación de navegador
- Mensajes: Personalizables

**Validación de Backend (Tercera Capa)**
- Ubicación: API endpoints
- Propósito: Seguridad y consistencia de datos
- Crítico: Siempre validar, nunca confiar solo en UI

### 9.5 Renderizado en Diferentes Vistas

**DetailView (Formulario)**
- Comportamiento: Renderiza input apropiado según StringType
- EMAIL: EmailInputComponent con type="email"
- PASSWORD: PasswordInputComponent con caracteres ocultos
- TEXTAREA: TextareaInputComponent multilínea

**ListView (Tabla)**
- Comportamiento: StringType ignorado, valores mostrados como texto
- Excepción: PASSWORD nunca debe mostrarse en ListView
- Recomendación: Aplicar @HideInListView a propiedades PASSWORD

**ReadOnly Fields**
- EMAIL: Mostrar como texto con link mailto:
- PASSWORD: Mostrar como ••••• o no mostrar
- URL: Mostrar como link clickable
- TEXTAREA: Mostrar texto completo con line breaks

## 10. Notas de Implementación

### 10.1 Patrones de Uso Comunes

**Entidad User con Múltiples StringTypes**
```typescript
class User extends BaseEntity {
    @PropertyName("Full Name")
    name: string; // Default: TEXT
    
    @PropertyName("Email Address")
    @StringTypeDef(StringType.EMAIL)
    @Required()
    email: string;
    
    @PropertyName("Password")
    @StringTypeDef(StringType.PASSWORD)
    @Required()
    @HideInListView()
    password: string;
    
    @PropertyName("Phone Number")
    @StringTypeDef(StringType.TELEPHONE)
    @Mask("(999) 999-9999")
    phone: string;
    
    @PropertyName("Website")
    @StringTypeDef(StringType.URL)
    website: string;
    
    @PropertyName("Biography")
    @StringTypeDef(StringType.TEXTAREA)
    bio: string;
}
```

Resultado: Formulario con inputs especializados para cada tipo de dato.

**Validación Combinada - Email Corporativo**
```typescript
class Employee extends BaseEntity {
    @StringTypeDef(StringType.EMAIL)
    @Validation(
        (emp: Employee) => emp.email.endsWith('@company.com'),
        "Debe ser email corporativo @company.com"
    )
    email: string;
}
```

Navegador valida formato email general, @Validation valida dominio específico.

**Password con Requisitos de Seguridad**
```typescript
class Account extends BaseEntity {
    @StringTypeDef(StringType.PASSWORD)
    @Required()
    @Validation(
        (acc: Account) => acc.password.length >= 8,
        "Mínimo 8 caracteres"
    )
    @Validation(
        (acc: Account) => /[A-Z]/.test(acc.password),
        "Debe incluir al menos una mayúscula"
    )
    @HelpText("Mínimo 8 caracteres, incluir mayúsculas y números")
    password: string;
}
```

Múltiples validaciones garantizan complejidad de contraseña.

### 10.2 Casos de Comportamiento Especial

**Password en ListView - Seguridad**
```typescript
class User extends BaseEntity {
    @StringTypeDef(StringType.PASSWORD)
    @HideInListView() // CRÍTICO: No mostrar passwords en tabla
    password: string;
}
```

Siempre ocultar passwords en ListView para prevenir exposición.

**Textarea con Longitud Máxima**
```typescript
class Post extends BaseEntity {
    @StringTypeDef(StringType.TEXTAREA)
    @Validation(
        (post: Post) => post.content.length <= 5000,
        "Máximo 5000 caracteres"
    )
    content: string;
}
```

TEXTAREA permite texto extenso pero validación límita longitud.

**Email con Normalización**
```typescript
class ContactForm extends BaseEntity {
    @StringTypeDef(StringType.EMAIL)
    email: string;
    
    beforeSave() {
        this.email = this.email.toLowerCase().trim();
    }
}
```

Lifecycle hook normaliza email antes de guardar.

**URL con Protocolo Automático**
```typescript
class Link extends BaseEntity {
    @StringTypeDef(StringType.URL)
    url: string;
    
    beforeSave() {
        if (this.url && !this.url.startsWith('http')) {
            this.url = 'https://' + this.url;
        }
    }
}
```

Agrega protocolo https:// si usuario no lo incluye.

### 10.3 Implementación en Componentes

**FormInput Component - Switch de StringType**
```typescript
// FormInput.vue
<template>
    <EmailInputComponent v-if="stringType === StringType.EMAIL" />
    <PasswordInputComponent v-else-if="stringType === StringType.PASSWORD" />
    <TextareaInputComponent v-else-if="stringType === StringType.TEXTAREA" />
    <TelephoneInputComponent v-else-if="stringType === StringType.TELEPHONE" />
    <URLInputComponent v-else-if="stringType === StringType.URL" />
    <TextInputComponent v-else />
</template>

<script>
import { StringType } from '@/enums/string_type';

export default {
    computed: {
        stringType() {
            const stringTypes = this.entity.getStringType();
            return stringTypes[this.propertyKey];
        }
    }
}
</script>
```

**EmailInputComponent Ejemplo**
```vue
<template>
    <input
        type="email"
        v-model="value"
        :required="isRequired"
        autocomplete="email"
        spellcheck="false"
        placeholder="usuario@ejemplo.com"
    />
</template>
```

**PasswordInputComponent Ejemplo**
```vue
<template>
    <div class="password-input">
        <input
            :type="showPassword ? 'text' : 'password'"
            v-model="value"
            :required="isRequired"
            autocomplete="new-password"
        />
        <button @click="showPassword = !showPassword" type="button">
            {{ showPassword ? '🙈' : '👁️' }}
        </button>
    </div>
</template>
```

**TextareaInputComponent Ejemplo**
```vue
<template>
    <textarea
        v-model="value"
        :required="isRequired"
        rows="4"
        :maxlength="maxLength"
    />
</template>
```

### 10.4 Validación de Formato en Backend

No confiar solo en validación de navegador. Backend debe validar:

**Email Validation Backend**
```typescript
// Backend API endpoint
function validateEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}
```

**URL Validation Backend**
```typescript
function validateURL(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}
```

**Password Hashing Backend**
```typescript
import bcrypt from 'bcrypt';

async function hashPassword(plainPassword: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(plainPassword, saltRounds);
}
```

### 10.5 Debugging y Diagnóstico

**Inspeccionar StringTypes de Entidad**
```typescript
const user = new User();
const stringTypes = user.getStringType();
console.log('StringTypes:', stringTypes);
// Output: { name: 0, email: 0, password: 1, bio: 5 }
// (0=TEXT, 1=PASSWORD, 5=TEXTAREA según enum values)

// Verificar tipo específico
console.log('Email type:', stringTypes.email === StringType.EMAIL);
```

**Testear Renderizado de Componentes**
```typescript
import { mount } from '@vue/test-utils';
import FormInput from '@/components/FormInput.vue';

test('renders EmailInputComponent for EMAIL string type', () => {
    const user = new User({ email: 'test@example.com' });
    const wrapper = mount(FormInput, {
        props: { entity: user, propertyKey: 'email' }
    });
    
    expect(wrapper.find('input[type="email"]').exists()).toBe(true);
});
```

### 10.6 Migraciones y Refactoring

**Agregar StringTypeDef a Entidad Existente**
1. Identificar propiedades string que necesitan tipos específicos
2. Aplicar @StringTypeDef apropiado (EMAIL, PASSWORD, etc.)
3. Actualizar componentes de UI si son personalizados
4. Testear renderizado de formularios
5. Verificar que validación de navegador funciona correctamente

**Cambiar StringType de Propiedad**
```typescript
// Antes
@StringTypeDef(StringType.TEXT)
description: string;

// Después (si se necesita multilínea)
@StringTypeDef(StringType.TEXTAREA)
description: string;
```

Cambio automático de input a textarea, sin cambios en backend.

**Migrar Password Text a Password Type**
```typescript
// Antes
password: string; // Renderizado como text, visible

// Después
@StringTypeDef(StringType.PASSWORD)
@HideInListView()
password: string; // Renderizado como password, oculto

// Backend - Agregar hashing
function createUser(data) {
    data.password = await hashPassword(data.password);
    // ...
}
```

Requiere cambios en frontend (decorador) y backend (hashing).

## 11. Referencias Cruzadas

### 11.1 Documentación Relacionada

**copilot/layers/02-base-entity/metadata-access.md**
- Sección: Métodos de Acceso a Metadata de Tipos
- Contenido: Implementación detallada de getStringType()
- Relevancia: Mecanismo de acceso a StringType metadata

**copilot/layers/01-decorators/mask-decorator.md**
- Relación: Formateo de entrada según patrón
- Uso conjunto: TELEPHONE con mask de teléfono
- Patrón: StringType determina input, Mask formatea valor

**copilot/layers/01-decorators/validation-decorator.md**
- Relación: Validación adicional después de navegador
- Uso conjunto: EMAIL con validación de dominio específico
- Layers: HTML5 validation → @Validation → Backend validation

**copilot/layers/01-decorators/property-name-decorator.md**
- Relación: Label del input
- Uso: Todos los StringTypes usan PropertyName como label

**copilot/layers/01-decorators/hide-in-list-view-decorator.md**
- Relación: Ocultar campos sensibles en tabla
- Uso: PASSWORD siempre debe tener HideInListView
- Seguridad: Prevenir exposición de datos sensibles

### 11.2 Enumeraciones

**src/enums/string_type.ts**
- Contenido: Definición de enum StringType
- Valores: EMAIL, PASSWORD, TEXT, TELEPHONE, URL, TEXTAREA
- Uso: Importado por decorador y componentes

### 11.3 Componentes de UI

**copilot/layers/04-components/email-input-component.md**
- Propósito: Renderizar input type="email"
- StringType: EMAIL
- Validación: Formato email automático

**copilot/layers/04-components/password-input-component.md**
- Propósito: Renderizar input type="password"
- StringType: PASSWORD
- Seguridad: Caracteres ocultos, no autocompletado

**copilot/layers/04-components/textarea-input-component.md**
- Propósito: Renderizar textarea multilínea
- StringType: TEXTAREA
- Uso: Texto extenso (biografías, descripciones)

**copilot/layers/04-components/text-input-component.md**
- Propósito: Renderizar input type="text" default
- StringType: TEXT
- Uso: Strings simples de una línea

### 11.4 Código Fuente

**src/decorations/string_type_decorator.ts**
- Líneas: 1-13
- Contenido: Implementación completa del decorador
- Exports: STRING_TYPE_KEY, StringTypeDef

**src/entities/base_entity.ts**
- Líneas 264-276: Método getStringType()
- Dependencias: Importa STRING_TYPE_KEY, StringType
- Comportamiento: Default StringType.TEXT para propiedades no decoradas

### 11.5 Tutoriales y Ejemplos

**copilot/tutorials/01-basic-crud.md**
- Sección: Tipos de Propiedades String
- Ejemplo: User entity con email, password, bio
- Patrón: EMAIL + PASSWORD + TEXTAREA en misma entidad

**copilot/examples/advanced-module-example.md**
- Sección: Validación Avanzada de Strings
- Patrón: EMAIL con validación de dominio corporativo
- Técnica: Combinación de StringType y @Validation

### 11.6 Contratos y Arquitectura

**copilot/00-CONTRACT.md**
- Sección 4.2: Metadata de Propiedades
- Principio: StringType define comportamiento de UI
- Sección 8.1: Decoradores como configuración de componentes

**copilot/01-FRAMEWORK-OVERVIEW.md**
- Sección: Sistema de Tipos de Input
- Contexto: StringType dentro del ecosistema de decoradores
- Flujo: Entity → StringType → Component selection → HTML rendering

**copilot/02-FLOW-ARCHITECTURE.md**
- Sección: Renderizado de Formularios Dinámicos
- Flujo: getStringType() → Switch component → Input rendering
- Garantía: StringType respetado en generación de UI
