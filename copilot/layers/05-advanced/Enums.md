# Enums del Framework

## 1. Propósito

Los enums del framework definen conjuntos cerrados de valores que se usan para tipado fuerte TypeScript, validación y lógica condicional a lo largo del sistema. Cada enum representa un dominio específico: tipos de vistas para controlar navegación, formatos de strings para renderizado de inputs, disposición de formularios, tipos de notificaciones toast, y tipos de diálogos de confirmación. Proporcionan constantes type-safe que previenen valores inválidos y facilitan refactoring.

## 2. Alcance

**UBICACION GENERAL:** src/enums/

**ENUMS IMPLEMENTADOS:**
- ViewTypes: src/enums/view_type.ts - Controla tipo de vista activa
- StringType: src/enums/string_type.ts - Define tipo de input HTML para strings
- ViewGroupRow: src/enums/view_group_row.ts - Controla diseño de filas en formularios
- ToastType: src/enums/ToastType.ts - Tipos visuales de notificaciones toast
- confMenuType: src/enums/conf_menu_type.ts - Tipos visuales de diálogos confirmación

**ENUMS RESERVADOS NO IMPLEMENTADOS:**
- DetailTypes: src/enums/detail_type.ts - Modo NEW vs EDIT no usado actualmente
- MaskSides: src/enums/mask_sides.ts - Decorador @Mask no exportado

**INTEGRACION:**
Usados por Application.View, decoradores, componentes de formulario, sistema de UI notifications.

## 3. Definiciones Clave

**ViewTypes enum:**
Define 5 tipos de vistas posibles: LISTVIEW muestra tabla de registros con botones New/Refresh, DETAILVIEW muestra formulario edición con botones Save/Validate, LOOKUPVIEW muestra modal selección sin botones acción, CUSTOMVIEW permite vistas personalizadas, DEFAULTVIEW reservado sin implementación.

**StringType enum:**
Define 6 tipos de input HTML para properties string: EMAIL input type email con validación formato, PASSWORD input type password texto oculto, TEXT input type text default, TEXTAREA textarea element multilínea, TELEPHONE y URL reservados sin componentes dedicados.

**ViewGroupRow enum:**
Define 3 disposiciones de campos por fila: SINGLE un campo ocupa 100% ancho, PAIR dos campos ocupan 50% cada uno, TRIPLE tres campos ocupan 33.33% cada uno. Default es PAIR si no especificado.

**ToastType enum:**
Define 4 tipos notificaciones temporales: SUCCESS verde con check para operaciones exitosas, ERROR rojo con X para fallos, INFO azul con i para información general, WARNING amarillo con advertencia para avisos.

**confMenuType enum:**
Define 4 tipos diálogos modales: INFO azul para confirmaciones generales, SUCCESS verde para operaciones exitosas, WARNING amarillo para acciones destructivas, ERROR rojo para errores graves.

## 4. Descripción Técnica

**VIEWTYPES ENUM:**
```typescript
export enum ViewTypes {
    LISTVIEW,     // 0
    DETAILVIEW,   // 1
    DEFAULTVIEW,  // 2
    CUSTOMVIEW,   // 3
    LOOKUPVIEW    // 4
}
```
**USO:** Application.View.value.viewType determina qué botones muestra ActionsComponent y comportamiento navegación. LISTVIEW renderiza NewButton y RefreshButton, DETAILVIEW renderiza SaveButton ValidateButton SaveAndNewButton, LOOKUPVIEW no renderiza botones.

**STRINGTYPE ENUM:**
```typescript
export enum StringType {
    EMAIL,      // 0 - EmailInputComponent
    PASSWORD,   // 1 - PasswordInputComponent
    TEXT,       // 2 - TextInputComponent (default)
    TELEPHONE,  // 3 - No implementado
    URL,        // 4 - No implementado
    TEXTAREA    // 5 - TextAreaComponent
}
```
**USO:** DefaultDetailView usa entity.getStringType()[propertyName] para determinar qué componente input renderizar. Se obtiene desde metadata $BaseEntityMetadata.StringType poblada por decorador @StringTypeDef.

**VIEWGROUPROW ENUM:**
```typescript
export enum ViewGroupRow {
    SINGLE = 'single',  // 100% width
    PAIR = 'pair',      // 50% + 50% width
    TRIPLE = 'triple'   // 33% + 33% + 33% width
}
```
**USO:** DefaultDetailView.groupedProperties agrupa properties consecutivas con mismo viewGroupRow value en misma fila. SINGLE renderiza div normal, PAIR renderiza FormRowTwoItemsComponent, TRIPLE renderiza FormRowThreeItemsComponent.

**TOASTTYPE ENUM:**
```typescript
export enum ToastType {
    SUCCESS,  // 0 - Verde #10b981
    ERROR,    // 1 - Rojo #ef4444
    INFO,     // 2 - Azul #3b82f6
    WARNING   // 3 - Amarillo #f59e0b
}
```
**USO:** ApplicationUIService.pushToast recibe objeto con type property ToastType, ToastItemComponent mapea type a backgroundColor con computed property getBackgroundColor.

**CONFMENUTYPE ENUM:**
```typescript
export enum confMenuType {
    INFO,     // 0 - Azul header
    SUCCESS,  // 1 - Verde header
    WARNING,  // 2 - Amarillo header
    ERROR     // 3 - Rojo header
}
```
**USO:** ApplicationUIService.openConfirmationMenu recibe objeto con type property confMenuType, ConfirmationDialogComponent mapea type a getHeaderColor computed.

**DETAILTYPES ENUM NO USADO:**
```typescript
export enum DetailTypes {
    NEW,   // 0
    EDIT   // 1
}
```
**ESTADO:** Definido pero no integrado en framework. Actualmente modo se determina implícitamente: entityOid === 'new' es NEW, entityOid con ID válido es EDIT.

**MASKSIDES ENUM NO FUNCIONAL:**
```typescript
export enum MaskSides {
    START,  // 0 - Ocultar desde inicio
    END     // 1 - Ocultar desde final
}
```
**ESTADO:** Decorador @Mask existe pero no exportado en decorations/index.ts, no puede usarse actualmente.

## 5. Flujo de Funcionamiento

**PASO 1 - Establecer View Type al Montar:**
Componente vista ejecuta mounted hook, establece Application.View.value.viewType = ViewTypes.LISTVIEW o DETAILVIEW según contexto, ActionsComponent reacciona a cambio con computed property ListButtons.

**PASO 2 - Renderizado Condicional Componentes:**
DefaultDetailView itera properties de entity, obtiene stringType con entity.getStringType()[propertyName], renderiza EmailInputComponent si StringType.EMAIL, PasswordInputComponent si StringType.PASSWORD, TextAreaComponent si StringType.TEXTAREA, TextInputComponent default si StringType.TEXT o undefined.

**PASO 3 - Agrupación Layout Formulario:**
DefaultDetailView.groupedProperties itera properties obteniendo viewGroupRow desde entity.getViewGroupRows(), agrupa properties consecutivas con mismo rowType value, crea chunks con rowType SINGLE/PAIR/TRIPLE y array de properties, renderiza FormRowTwoItemsComponent para PAIR con 2 fields o FormRowThreeItemsComponent para TRIPLE con 3 fields.

**PASO 4 - Mostrar Toast Notification:**
Usuario ejecuta acción como save, código llama ApplicationUIService.pushToast pasando objeto con type ToastType.SUCCESS y message, ToastItemComponent se renderiza con backgroundColor verde #10b981 desde computed getBackgroundColor, toast se auto-elimina después de duration milisegundos default 3000.

**PASO 5 - Abrir Confirmation Dialog:**
Usuario intenta acción destructiva como delete, código llama ApplicationUIService.openConfirmationMenu pasando objeto con type confMenuType.WARNING y callbacks onConfirm/onCancel, ConfirmationDialogComponent se renderiza con header amarillo, usuario hace clic Confirm ejecutando callback o Cancel cerrando modal.

**PASO 6 - Navegación Entre Vistas:**
Usuario hace clic en fila de tabla ejecutando openDetailView, Application.changeViewToDetailView actualiza Application.View.value.viewType = ViewTypes.DETAILVIEW, router navega a /module/oid, ActionsComponent re-renderiza mostrando botones SaveButton ValidateButton en lugar de NewButton RefreshButton.

**PASO 7 - Debugging Enum Values:**
Desarrollador ejecuta console.log ViewTypes[Application.View.value.viewType] obteniendo string legible "DETAILVIEW", o console.log ViewGroupRow.PAIR obteniendo valor "pair", facilitando debugging con nombres descriptivos en lugar de números enum.

## 6. Reglas Obligatorias

**REGLA 1:** SIEMPRE establecer Application.View.value.viewType al montar vista, NUNCA dejarlo undefined.

**REGLA 2:** SIEMPRE usar StringType.EMAIL para properties email activando validación HTML5 nativa.

**REGLA 3:** SIEMPRE agrupar properties con mismo ViewGroupRow consecutivamente para renderizado correcto en misma fila.

**REGLA 4:** SIEMPRE usar ToastType.SUCCESS para operaciones exitosas, ToastType.ERROR para fallos, mantener semántica consistente.

**REGLA 5:** SIEMPRE usar confMenuType.WARNING para acciones destructivas requiriendo confirmación explícita usuario.

**REGLA 6:** SIEMPRE usar decorador @StringTypeDef con StringType enum, NUNCA hardcodear strings "email" "password".

**REGLA 7:** SIEMPRE verificar Application.View.value.viewType antes de ejecutar lógica específica de vista.

## 7. Prohibiciones

**PROHIBIDO:** Usar valores mágicos numéricos 0/1/2 en lugar de enum constants ViewTypes.LISTVIEW/DETAILVIEW.

**PROHIBIDO:** Omitir StringType.EMAIL para properties email permitiendo input type="text" sin validación formato.

**PROHIBIDO:** Mezclar properties con diferentes ViewGroupRow values esperando renderizado en misma fila.

**PROHIBIDO:** Usar ToastType.SUCCESS para mostrar errores confundiendo semántica visual verde/rojo.

**PROHIBIDO:** Usar confMenuType.INFO para acciones destructivas que requieren advertencia WARNING clara.

**PROHIBIDO:** Usar DetailTypes o MaskSides enums que no están implementados actualmente.

**PROHIBIDO:** Crear properties tipo string sin especificar StringType asumiendo comportamiento default TEXT.

## 8. Dependencias

**COMPONENTES QUE CONSUMEN ENUMS:**
- ActionsComponent: Lee ViewTypes para determinar botones renderizados
- DefaultDetailView: Lee StringType y ViewGroupRow para renderizado formulario
- ToastItemComponent: Lee ToastType para mapear backgroundColor
- ConfirmationDialogComponent: Lee confMenuType para mapear headerColor
- EmailInputComponent: Activado por StringType.EMAIL
- PasswordInputComponent: Activado por StringType.PASSWORD
- TextAreaComponent: Activado por StringType.TEXTAREA
- FormRowTwoItemsComponent: Renderizado por ViewGroupRow.PAIR
- FormRowThreeItemsComponent: Renderizado por ViewGroupRow.TRIPLE

**DECORADORES RELACIONADOS:**
- @StringTypeDef: Establece StringType en metadata
- @ViewGroupRow: Establece ViewGroupRow en metadata

**SERVICIOS:**
- Application.View.value.viewType: Propiedad reactiva almacena ViewTypes
- ApplicationUIService.pushToast: Recibe ToastType
- ApplicationUIService.openConfirmationMenu: Recibe confMenuType

## 9. Relaciones

**VIEWTYPES CONTROLA:**
ActionsComponent.ListButtons computed renderiza NewButton/RefreshButton para LISTVIEW o SaveButton/ValidateButton/SaveAndNewButton para DETAILVIEW.

**STRINGTYPE DETERMINA:**
DefaultDetailView selección de componente: StringType.EMAIL → EmailInputComponent, StringType.PASSWORD → PasswordInputComponent, StringType.TEXTAREA → TextAreaComponent, StringType.TEXT o undefined → TextInputComponent.

**VIEWGROUPROW AGRUPA:**
DefaultDetailView.groupedProperties itera properties consecutivas con mismo viewGroupRow creando chunks, cada chunk renderiza FormRowTwoItemsComponent si PAIR o FormRowThreeItemsComponent si TRIPLE o div simple si SINGLE.

**TOASTTYPE Y CONFMENUTYPE SIMILAR:**
Ambos definen tipos SUCCESS/ERROR/INFO/WARNING pero para contextos diferentes: ToastType para notificaciones temporales auto-dismiss, confMenuType para modales requiriendo acción usuario explícita Confirm/Cancel.

## 10. Notas de Implementación

**EJEMPLO VIEWTYPES USAGE:**
```typescript
mounted() {
    Application.View.value.viewType = ViewTypes.LISTVIEW;
}

if (Application.View.value.viewType === ViewTypes.DETAILVIEW) {
    console.log('Usuario editando:', Application.View.value.entityObject);
}
```

**EJEMPLO STRINGTYPE USAGE:**
```typescript
import { StringType } from '@/enums/string_type';

class User extends BaseEntity {
    @PropertyName("Email", String)
    @StringTypeDef(StringType.EMAIL)
    email!: string;
    
    @PropertyName("Password", String)
    @StringTypeDef(StringType.PASSWORD)
    password!: string;
    
    @PropertyName("Bio", String)
    @StringTypeDef(StringType.TEXTAREA)
    bio!: string;
}
```

**EJEMPLO VIEWGROUPROW USAGE:**
```typescript
import { ViewGroupRow } from '@/enums/view_group_row';

class Product extends BaseEntity {
    @PropertyName("Title", String)
    @ViewGroupRow(ViewGroupRow.SINGLE)
    title!: string;  // 100% width
    
    @PropertyName("Price", Number)
    @ViewGroupRow(ViewGroupRow.PAIR)
    price!: number;  // 50% width left
    
    @PropertyName("Stock", Number)
    @ViewGroupRow(ViewGroupRow.PAIR)
    stock!: number;  // 50% width right, misma fila que price
    
    @PropertyName("Height", Number)
    @ViewGroupRow(ViewGroupRow.TRIPLE)
    height!: number;  // 33% width left
    
    @PropertyName("Width", Number)
    @ViewGroupRow(ViewGroupRow.TRIPLE)
    width!: number;  // 33% width center
    
    @PropertyName("Depth", Number)
    @ViewGroupRow(ViewGroupRow.TRIPLE)
    depth!: number;  // 33% width right, misma fila que height y width
}
```

**EJEMPLO TOASTTYPE USAGE:**
```typescript
import { ToastType } from '@/enums/ToastType';

Application.ApplicationUIService.pushToast({
    type: ToastType.SUCCESS,
    title: 'Guardado exitoso',
    message: 'El producto se guardó correctamente',
    duration: 3000
});

Application.ApplicationUIService.pushToast({
    type: ToastType.ERROR,
    title: 'Error al guardar',
    message: 'No se pudo conectar con el servidor',
    duration: 5000
});
```

**EJEMPLO CONFMENUTYPE USAGE:**
```typescript
import { confMenuType } from '@/enums/conf_menu_type';

Application.ApplicationUIService.openConfirmationMenu({
    title: 'Eliminar producto?',
    message: 'Esta acción no se puede deshacer',
    type: confMenuType.WARNING,
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
    onConfirm: () => {
        entity.delete();
    }
});
```

**DEBUGGING ENUM VALUES:**
```typescript
console.log('Current view:', ViewTypes[Application.View.value.viewType]);
// Output: "Current view: DETAILVIEW"

console.log('String types:', entity.getStringType());
// Output: { email: 0, password: 1, bio: 5 }

console.log('View group rows:', entity.getViewGroupRows());
// Output: { field1: 'pair', field2: 'pair', field3: 'single' }

console.log('Toast type name:', ToastType[ToastType.SUCCESS]);
// Output: "Toast type name: SUCCESS"
```

**LIMITACIONES ACTUALES:**
StringType.TELEPHONE y StringType.URL definidos pero sin componentes dedicados, renderizan como TextInputComponent default.
DetailTypes.NEW y DetailTypes.EDIT definidos pero no integrados, modo se determina implícitamente con entityOid === 'new' check.
MaskSides.START y MaskSides.END definidos pero decorador @Mask no exportado en decorations/index.ts.
ViewTypes.DEFAULTVIEW reservado sin implementación actual.

**MAPEO COMPONENTES:**
StringType.EMAIL EmailInputComponent input type="email" validación HTML5
StringType.PASSWORD PasswordInputComponent input type="password" toggle visibility
StringType.TEXTAREA TextAreaComponent textarea element multilínea
StringType.TEXT TextInputComponent input type="text" default
ViewGroupRow.SINGLE div wrapper 100% width
ViewGroupRow.PAIR FormRowTwoItemsComponent CSS Grid 2 columns 50% each
ViewGroupRow.TRIPLE FormRowThreeItemsComponent CSS Grid 3 columns 33.33% each

## 11. Referencias Cruzadas

**DOCUMENTOS RELACIONADOS:**
- application-singleton.md: Application.View.value.viewType usage
- string-type-decorator.md: Decorador @StringTypeDef que usa StringType enum
- view-group-row-decorator.md: Decorador @ViewGroupRow que usa ViewGroupRow enum
- ActionsComponent.md: Componente que renderiza botones según ViewTypes
- email-input-component.md: Componente activado por StringType.EMAIL
- password-input-component.md: Componente activado por StringType.PASSWORD
- textarea-input-component.md: Componente activado por StringType.TEXTAREA
- ToastComponents.md: Sistema toast que usa ToastType enum
- DialogComponents.md: ConfirmationDialog que usa confMenuType enum
- FormLayoutComponents.md: FormRowTwoItems y FormRowThreeItems para ViewGroupRow

**UBICACION:** copilot/layers/05-advanced/Enums.md
**VERSION:** 1.0.0
**ULTIMA ACTUALIZACION:** 11 de Febrero, 2026
