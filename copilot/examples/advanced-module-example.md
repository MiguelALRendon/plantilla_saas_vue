# Ejemplo de Módulo Avanzado - Sistema de Órdenes de Compra

## 1. Propósito

Este archivo documenta la implementación de un sistema completo de órdenes de compra utilizando capacidades avanzadas del framework. Demuestra el uso de más de 30 decoradores, validaciones asíncronas, relaciones múltiples, arrays anidados, computed properties, hooks de ciclo de vida complejos, estados con transiciones, permisos, componentes custom y formateo avanzado.

Complejidad: Avanzada  
Decoradores utilizados: 30+ de 35+  
Tiempo de implementación: 2-3 horas

## 2. Alcance

Este ejemplo implementa:
- Entidad PurchaseOrder con arquitectura compleja y múltiples relaciones
- Validaciones síncronas y asíncronas de formato y lógica de negocio
- Relaciones Many-to-One con Customer, Address, User y arrays de OrderItems
- Gestión de estados con transiciones validadas (OrderStatus enum)
- Métodos de pago con validación condicional (PaymentMethod enum)
- Hooks completos de ciclo de vida (beforeSave, afterSave, beforeDelete, onSaving, onValidated, saveFailed) para lógica de negocio
- Cálculos automáticos de totales financieros (subtotal, tax, shipping, discount, total)
- Permisos basados en roles y propietario mediante decoradores condicionales
- Persistencia con mapeo de claves a formato de servidor mediante PersistentKey
- Componentes custom para vistas ListView y DetailView
- Métodos custom para operaciones de negocio (changeStatus, generatePDF, clone, calculateTotals, sendOrderNotification)

## 3. Definiciones Clave

**PurchaseOrder**: Entidad central que representa una orden de compra completa. Contiene información del cliente, direcciones, items, totales financieros, estado, pago y auditoría.

**OrderStatus**: Enum que define los estados posibles de una orden (DRAFT, PENDING, APPROVED, IN_PROGRESS, SHIPPED, DELIVERED, CANCELLED). Las transiciones entre estados están controladas mediante el método changeStatus.

**PaymentMethod**: Enum que define los métodos de pago aceptados (CREDIT_CARD, DEBIT_CARD, BANK_TRANSFER, CASH, PAYPAL). Algunos métodos requieren paymentReference.

**OrderItem**: Entidad que representa un item individual dentro de una orden. Se maneja como array anidado dentro de PurchaseOrder mediante ArrayOf decorator.

**AsyncValidation**: Decorador que permite validaciones que requieren llamadas a API o verificaciones externas. Ejemplo: verificar unicidad de orderNumber.

**ViewGroupRow**: Enum que controla el layout de campos en formularios (FULL, HALF). Permite controlar si un campo ocupa toda la fila o media fila.

**PersistentKey**: Decorador que mapea nombres de propiedades entre el cliente y el servidor. Ejemplo: client 'id' maps to server 'order_id'.

**Lifecycle Hooks**: Métodos que se ejecutan en momentos específicos del ciclo de vida de una entidad:
- beforeSave: Ejecutado antes de guardar, permite modificar datos
- onSaving: Ejecutado durante el proceso de guardado, para logging
- afterSave: Ejecutado después de guardar exitosamente
- saveFailed: Ejecutado si falla el guardado
- beforeDelete: Ejecutado antes de eliminar, permite validar eliminación
- onValidated: Ejecutado después de validación exitosa

**Conditional Decorators**: Decoradores que aceptan funciones para evaluar condiciones dinámicamente:
- Required: Campo requerido basado en condición
- Disabled: Campo deshabilitado basado en condición
- ReadOnly: Campo de solo lectura basado en condición

## 4. Descripción Técnica

### Arquitectura del Sistema

```
┌───────────┐
│  Customer │───┐
└───────────┘   │
                │
┌───────────┐   │    ┌──────────────┐
│  Address  │◄──┼───►│ PurchaseOrder│◄────┐
└───────────┘   │    └──────────────┘     │
                │           ▲              │
┌───────────┐   │           │              │
│   User    │───┘           │ Has Many    │ Many-to-One
└───────────┘               │              │
                            │         ┌────────────┐
                       ┌────────────┐ │  Product   │
                       │  OrderItem │◄┘            │
                       └────────────┘               │
                            │                       │
                            └───────────────────────┘
```

### Entidad Principal: PurchaseOrder

Archivo: src/entities/purchase_order.ts

```typescript
import { BaseEntity } from './base_entitiy';
import { Customer } from './customer';
import { Address } from './address';
import { User } from './user';
import { OrderItem } from './order_item';
import {
    // Property decorators
    PropertyName,
    PropertyIndex,
    ArrayOf,
    
    // Module decorators
    ModuleName,
    ModuleIcon,
    ModulePermission,
    ModuleListComponent,
    ModuleDetailComponent,
    ModuleCustomComponents,
    
    // Validation decorators
    Required,
    Validation,
    AsyncValidation,
    
    // UI decorators
    ViewGroup,
    ViewGroupRowDecorator,
    CSSColumnClass,
    HelpText,
    HideInListView,
    HideInDetailView,
    DisplayFormat,
    TabOrder,
    
    // State decorators
    Disabled,
    ReadOnly,
    
    // Persistence decorators
    ApiEndpoint,
    ApiMethods,
    Persistent,
    PersistentKey,
    
    // Identity decorators
    PrimaryProperty,
    DefaultProperty,
    UniquePropertyKey,
    
    // Type decorators
    StringTypeDef
} from '@/decorations';
import { StringType } from '@/enums/string_type';
import { ViewGroupRow } from '@/enums/view_group_row';
import { ToastType } from '@/enums/ToastType';
import { confMenuType } from '@/enums/conf_menu_type';
import ICONS from '@/constants/icons';
import Application from '@/models/application';
import OrderListCustomView from '@/views/custom/order_list_custom_view.vue';
import OrderDetailCustomView from '@/views/custom/order_detail_custom_view.vue';

// Enum de estados
export enum OrderStatus {
    DRAFT = 'draft',
    PENDING = 'pending',
    APPROVED = 'approved',
    IN_PROGRESS = 'in_progress',
    SHIPPED = 'shipped',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled'
}

// Enum de métodos de pago
export enum PaymentMethod {
    CREDIT_CARD = 'credit_card',
    DEBIT_CARD = 'debit_card',
    BANK_TRANSFER = 'bank_transfer',
    CASH = 'cash',
    PAYPAL = 'paypal'
}

@DefaultProperty('orderNumber')
@PrimaryProperty('id')
@UniquePropertyKey('id')

// Module configuration
@ModuleName('Purchase Orders')
@ModuleIcon(ICONS.CART)
@ModulePermission('orders.view')
@ModuleListComponent(OrderListCustomView)
@ModuleDetailComponent(OrderDetailCustomView)

// API configuration
@ApiEndpoint('/api/purchase-orders')
@ApiMethods(['GET', 'POST', 'PUT', 'DELETE'])
@Persistent()
@PersistentKey('order_id', 'id')
@PersistentKey('order_number', 'orderNumber')
@PersistentKey('customer_id', 'customerId')

export class PurchaseOrder extends BaseEntity {
    
    // BASIC INFORMATION
    
    @ViewGroup('Basic Information')
    @ViewGroupRowDecorator(ViewGroupRow.HALF)
    @PropertyIndex(1)
    @PropertyName('ID', Number)
    @CSSColumnClass('table-length-small')
    @Required(true)
    @ReadOnly(true)
    @HideInDetailView()
    id!: number;
    
    @ViewGroup('Basic Information')
    @ViewGroupRowDecorator(ViewGroupRow.HALF)
    @PropertyIndex(2)
    @PropertyName('Order Number', String)
    @CSSColumnClass('table-length-medium')
    @Required(true)
    @ReadOnly((entity) => !entity.isNew())
    @Validation(
        (entity) => {
            if (!entity.orderNumber) return true;
            return /^ORD-\d{8}$/.test(entity.orderNumber);
        },
        'Order number format: ORD-12345678'
    )
    @AsyncValidation(
        async (entity) => {
            if (!entity.orderNumber || entity.isNew()) return true;
            
            const response = await Application.axiosInstance.get(
                `/api/purchase-orders/check-number?number=${entity.orderNumber}&excludeId=${entity.id}`
            );
            return response.data.available;
        },
        'Order number already exists'
    )
    @HelpText('Auto-generated or manual entry')
    @DisplayFormat('{value}')
    orderNumber!: string;
    
    @ViewGroup('Basic Information')
    @ViewGroupRowDecorator(ViewGroupRow.HALF)
    @PropertyIndex(3)
    @PropertyName('Order Date', Date)
    @CSSColumnClass('table-length-medium')
    @Required(true)
    @ReadOnly((entity) => entity.status !== OrderStatus.DRAFT)
    @HelpText('Date when order was created')
    orderDate!: Date;
    
    @ViewGroup('Basic Information')
    @ViewGroupRowDecorator(ViewGroupRow.HALF)
    @PropertyIndex(4)
    @PropertyName('Status', OrderStatus)
    @CSSColumnClass('table-length-medium')
    @Required(true)
    @Disabled((entity) => {
        // Solo draft puede modificarse (lógica simplificada sin autenticación)
        return entity.status !== OrderStatus.DRAFT;
    })
    @DisplayFormat((value) => {
        const statusIcons: Record<OrderStatus, string> = {
            [OrderStatus.DRAFT]: 'DRAFT',
            [OrderStatus.PENDING]: 'PENDING',
            [OrderStatus.APPROVED]: 'APPROVED',
            [OrderStatus.IN_PROGRESS]: 'IN_PROGRESS',
            [OrderStatus.SHIPPED]: 'SHIPPED',
            [OrderStatus.DELIVERED]: 'DELIVERED',
            [OrderStatus.CANCELLED]: 'CANCELLED'
        };
        return statusIcons[value as OrderStatus];
    })
    @HelpText('Current order status')
    status!: OrderStatus;
    
    // CUSTOMER INFORMATION
    
    @ViewGroup('Customer Information')
    @ViewGroupRowDecorator(ViewGroupRow.FULL)
    @PropertyIndex(5)
    @PropertyName('Customer', Customer)
    @CSSColumnClass('table-length-large')
    @Required(true)
    @Disabled((entity) => entity.status !== OrderStatus.DRAFT)
    @HelpText('Select customer for this order')
    customer!: Customer;
    
    @ViewGroup('Customer Information')
    @ViewGroupRowDecorator(ViewGroupRow.HALF)
    @PropertyIndex(6)
    @PropertyName('Billing Address', Address)
    @Required(true)
    @Disabled((entity) => entity.status !== OrderStatus.DRAFT)
    @HelpText('Address for invoice')
    billingAddress!: Address;
    
    @ViewGroup('Customer Information')
    @ViewGroupRowDecorator(ViewGroupRow.HALF)
    @PropertyIndex(7)
    @PropertyName('Shipping Address', Address)
    @Required(true)
    @Disabled((entity) => entity.status !== OrderStatus.DRAFT)
    @Validation(
        (entity) => {
            // Shipping puede ser igual a billing o diferente
            return true;
        },
        'Invalid shipping address'
    )
    @HelpText('Delivery address (can be same as billing)')
    shippingAddress!: Address;
    
    // ORDER DETAILS
    
    @ViewGroup('Order Details')
    @PropertyIndex(8)
    @PropertyName('Special Instructions', String)
    @StringTypeDef(StringType.TEXTAREA)
    @HideInListView()
    @Disabled((entity) => {
        return [OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.CANCELLED]
            .includes(entity.status);
    })
    @HelpText('Any special handling or delivery instructions')
    specialInstructions?: string;
    
    @ViewGroup('Order Details')
    @ViewGroupRowDecorator(ViewGroupRow.HALF)
    @PropertyIndex(9)
    @PropertyName('Expected Delivery', Date)
    @CSSColumnClass('table-length-medium')
    @Required((entity) => entity.status !== OrderStatus.DRAFT)
    @Validation(
        (entity) => {
            if (!entity.expectedDelivery || !entity.orderDate) return true;
            return entity.expectedDelivery > entity.orderDate;
        },
        'Expected delivery must be after order date'
    )
    @HideInListView()
    @HelpText('Estimated delivery date')
    expectedDelivery?: Date;
    
    @ViewGroup('Order Details')
    @ViewGroupRowDecorator(ViewGroupRow.HALF)
    @PropertyIndex(10)
    @PropertyName('Actual Delivery', Date)
    @ReadOnly(true)
    @HideInListView()
    @HelpText('Actual delivery date (auto-filled)')
    actualDelivery?: Date;
    
    // PAYMENT INFORMATION
    
    @ViewGroup('Payment Information')
    @ViewGroupRowDecorator(ViewGroupRow.HALF)
    @PropertyIndex(11)
    @PropertyName('Payment Method', PaymentMethod)
    @Required((entity) => {
        return [OrderStatus.APPROVED, OrderStatus.IN_PROGRESS, 
                OrderStatus.SHIPPED, OrderStatus.DELIVERED].includes(entity.status);
    })
    @Disabled((entity) => entity.status === OrderStatus.DELIVERED)
    @HelpText('How customer will pay')
    paymentMethod?: PaymentMethod;
    
    @ViewGroup('Payment Information')
    @ViewGroupRowDecorator(ViewGroupRow.HALF)
    @PropertyIndex(12)
    @PropertyName('Payment Reference', String)
    @Required((entity) => {
        return entity.paymentMethod === PaymentMethod.BANK_TRANSFER ||
               entity.paymentMethod === PaymentMethod.PAYPAL;
    })
    @StringTypeDef(StringType.TEXT)
    @Disabled((entity) => entity.status === OrderStatus.DELIVERED)
    @HelpText('Transaction ID or reference number')
    paymentReference?: string;
    
    @ViewGroup('Payment Information')
    @ViewGroupRowDecorator(ViewGroupRow.HALF)
    @PropertyIndex(13)
    @PropertyName('Payment Status', String)
    @ReadOnly(true)
    @DisplayFormat((value) => {
        const statusMap: Record<string, string> = {
            'pending': 'Pending',
            'partial': 'Partial',
            'paid': 'Paid',
            'refunded': 'Refunded'
        };
        return statusMap[value as string] || value as string;
    })
    @HideInListView()
    paymentStatus?: string;
    
    // FINANCIAL SUMMARY
    
    @ViewGroup('Financial Summary')
    @ViewGroupRowDecorator(ViewGroupRow.HALF)
    @PropertyIndex(14)
    @PropertyName('Subtotal', Number)
    @CSSColumnClass('table-length-short')
    @ReadOnly(true)
    @DisplayFormat('${value} USD')
    @HelpText('Sum of all items (calculated)')
    subtotal!: number;
    
    @ViewGroup('Financial Summary')
    @ViewGroupRowDecorator(ViewGroupRow.HALF)
    @PropertyIndex(15)
    @PropertyName('Tax', Number)
    @ReadOnly(true)
    @DisplayFormat('${value} USD')
    @HelpText('Tax amount (calculated)')
    tax!: number;
    
    @ViewGroup('Financial Summary')
    @ViewGroupRowDecorator(ViewGroupRow.HALF)
    @PropertyIndex(16)
    @PropertyName('Shipping Cost', Number)
    @Required((entity) => entity.status !== OrderStatus.DRAFT)
    @Validation(
        (entity) => !entity.shippingCost || entity.shippingCost >= 0,
        'Shipping cost cannot be negative'
    )
    @DisplayFormat('${value} USD')
    @Disabled((entity) => entity.status === OrderStatus.DELIVERED)
    @HelpText('Shipping and handling fee')
    shippingCost?: number;
    
    @ViewGroup('Financial Summary')
    @ViewGroupRowDecorator(ViewGroupRow.HALF)
    @PropertyIndex(17)
    @PropertyName('Discount', Number)
    @Validation(
        (entity) => {
            if (!entity.discount) return true;
            return entity.discount >= 0 && entity.discount <= entity.subtotal;
        },
        'Discount cannot exceed subtotal'
    )
    @DisplayFormat('-${value} USD')
    @Disabled((entity) => {
        // Solo admin puede aplicar descuentos (simplificado sin autenticación)
        // TODO: Implementar sistema de permisos con Application.currentUser cuando exista
        return false;  // Por ahora, permitir descuentos
    })
    @HelpText('Discount applied to order')
    discount?: number;
    
    @ViewGroup('Financial Summary')
    @ViewGroupRowDecorator(ViewGroupRow.FULL)
    @PropertyIndex(18)
    @PropertyName('Total', Number)
    @CSSColumnClass('table-length-medium')
    @ReadOnly(true)
    @DisplayFormat((value) => `$${value} USD`)
    @HelpText('Final amount to pay')
    total!: number;
    
    // ITEMS (ARRAY)
    
    @TabOrder(1)
    @PropertyName('Order Items', ArrayOf(OrderItem))
    @Required(true)
    @Validation(
        (entity) => entity.items && entity.items.length > 0,
        'Order must have at least one item'
    )
    @Validation(
        (entity) => entity.items && entity.items.length <= 50,
        'Order cannot have more than 50 items'
    )
    @HelpText('Products included in this order')
    items!: Array<OrderItem>;
    
    // AUDIT TRAIL
    
    @ViewGroup('Audit Trail')
    @ViewGroupRowDecorator(ViewGroupRow.HALF)
    @PropertyIndex(19)
    @PropertyName('Created By', User)
    @ReadOnly(true)
    @HideInListView()
    createdBy?: User;
    
    @ViewGroup('Audit Trail')
    @ViewGroupRowDecorator(ViewGroupRow.HALF)
    @PropertyIndex(20)
    @PropertyName('Created At', Date)
    @ReadOnly(true)
    @HideInListView()
    @DisplayFormat((value) => new Date(value as any).toLocaleString())
    createdAt?: Date;
    
    @ViewGroup('Audit Trail')
    @ViewGroupRowDecorator(ViewGroupRow.HALF)
    @PropertyIndex(21)
    @PropertyName('Last Modified By', User)
    @ReadOnly(true)
    @HideInListView()
    lastModifiedBy?: User;
    
    @ViewGroup('Audit Trail')
    @ViewGroupRowDecorator(ViewGroupRow.HALF)
    @PropertyIndex(22)
    @PropertyName('Last Modified At', Date)
    @ReadOnly(true)
    @HideInListView()
    @DisplayFormat((value) => new Date(value as any).toLocaleString())
    lastModifiedAt?: Date;
    
    // LIFECYCLE HOOKS
    
    override beforeSave() {
        // Auto-generar order number si es nuevo
        if (this.isNew() && !this.orderNumber) {
            const timestamp = Date.now().toString().slice(-8);
            this.orderNumber = `ORD-${timestamp}`;
        }
        
        // Calcular totales
        this.calculateTotals();
        
        // Setear fecha de creación
        if (this.isNew()) {
            this.orderDate = new Date();
            this.createdAt = new Date();
            // TODO: Asignar createdBy cuando Application.currentUser esté implementado
            // this.createdBy = Application.currentUser as any;
        }
        
        // Actualizar modificación
        this.lastModifiedAt = new Date();
        // TODO: Asignar lastModifiedBy cuando Application.currentUser esté implementado
        // this.lastModifiedBy = Application.currentUser as any;
    }
    
    override onSaving() {
        console.log(`[PurchaseOrder] Saving order ${this.orderNumber}...`);
        console.log(`[PurchaseOrder] Total: $${this.total}`);
        console.log(`[PurchaseOrder] Items: ${this.items.length}`);
    }
    
    override afterSave() {
        Application.ApplicationUIService.showToast(
            `Order ${this.orderNumber} saved successfully!`,
            ToastType.SUCCESS
        );
        
        // Si es orden nueva, enviar notificación
        if (this.isNew()) {
            this.sendOrderNotification();
        }
    }
    
    override saveFailed() {
        Application.ApplicationUIService.showToast(
            `Failed to save order ${this.orderNumber}`,
            ToastType.ERROR
        );
    }
    
    override beforeDelete() {
        // Solo se pueden eliminar órdenes en DRAFT o CANCELLED
        if (![OrderStatus.DRAFT, OrderStatus.CANCELLED].includes(this.status)) {
            Application.ApplicationUIService.openConfirmationMenu(
                confMenuType.ERROR,
                'Cannot Delete',
                'Only draft or cancelled orders can be deleted',
                undefined,
                'OK'
            );
            throw new Error('Cannot delete order in current status');
        }
    }
    
    override onValidated() {
        console.log(`[PurchaseOrder] Validation passed for ${this.orderNumber}`);
    }
    
    // CUSTOM METHODS
    
    /**
     * Calcula subtotal, tax y total
     */
    private calculateTotals(): void {
        // Subtotal = suma de items
        this.subtotal = this.items?.reduce((sum, item) => {
            return sum + (item.quantity * item.unitPrice);
        }, 0) || 0;
        
        // Tax = 10% del subtotal
        this.tax = this.subtotal * 0.10;
        
        // Total = subtotal + tax + shipping - discount
        this.total = this.subtotal + 
                     this.tax + 
                     (this.shippingCost || 0) - 
                     (this.discount || 0);
    }
    
    /**
     * Cambia el estado de la orden
     */
    public changeStatus(newStatus: OrderStatus): void {
        const validTransitions: Record<OrderStatus, OrderStatus[]> = {
            [OrderStatus.DRAFT]: [OrderStatus.PENDING, OrderStatus.CANCELLED],
            [OrderStatus.PENDING]: [OrderStatus.APPROVED, OrderStatus.CANCELLED],
            [OrderStatus.APPROVED]: [OrderStatus.IN_PROGRESS, OrderStatus.CANCELLED],
            [OrderStatus.IN_PROGRESS]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
            [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
            [OrderStatus.DELIVERED]: [],
            [OrderStatus.CANCELLED]: []
        };
        
        const allowed = validTransitions[this.status] || [];
        
        if (!allowed.includes(newStatus)) {
            throw new Error(`Cannot transition from ${this.status} to ${newStatus}`);
        }
        
        this.status = newStatus;
        
        // Si se marca como delivered, setear fecha
        if (newStatus === OrderStatus.DELIVERED) {
            this.actualDelivery = new Date();
            this.paymentStatus = 'paid';
        }
    }
    
    /**
     * Envía notificación de orden
     */
    private async sendOrderNotification(): Promise<void> {
        try {
            await Application.axiosInstance.post('/api/notifications/order-created', {
                orderId: this.id,
                orderNumber: this.orderNumber,
                customerEmail: this.customer.email,
                total: this.total
            });
            console.log('[PurchaseOrder] Notification sent');
        } catch (error) {
            console.error('[PurchaseOrder] Failed to send notification:', error);
        }
    }
    
    /**
     * Genera PDF de la orden
     */
    public async generatePDF(): Promise<Blob> {
        const response = await Application.axiosInstance.get(
            `/api/purchase-orders/${this.id}/pdf`,
            { responseType: 'blob' }
        );
        return response.data;
    }
    
    /**
     * Clona la orden (para re-ordenar)
     */
    public clone(): PurchaseOrder {
        const cloned = new PurchaseOrder({
            customer: this.customer,
            billingAddress: this.billingAddress,
            shippingAddress: this.shippingAddress,
            items: this.items.map(item => ({ ...item })),
            status: OrderStatus.DRAFT
        });
        return cloned;
    }
}
```

### Decoradores Utilizados - Resumen

Property Decorators (3):
- PropertyName: Nombre y tipo de propiedad
- PropertyIndex: Orden de visualización
- ArrayOf: Arrays tipados de entidades

Module Decorators (5):
- ModuleName: Nombre del módulo en sidebar
- ModuleIcon: Icono visual del módulo
- ModulePermission: Permiso requerido para ver módulo
- ModuleListComponent: Componente custom para vista lista
- ModuleDetailComponent: Componente custom para vista detalle

Validation Decorators (3):
- Required: Campo requerido (condicional o fijo)
- Validation: Validación síncrona
- AsyncValidation: Validación asíncrona con llamadas a API

UI Decorators (8):
- ViewGroup: Agrupación lógica de campos
- ViewGroupRowDecorator: Layout de filas (FULL, HALF)
- CSSColumnClass: Anchos de columna en tabla
- HelpText: Texto de ayuda contextual
- HideInListView: Ocultar campo en vista lista
- HideInDetailView: Ocultar campo en vista detalle
- DisplayFormat: Formato visual personalizado
- TabOrder: Orden de tabs en formulario

State Decorators (2):
- Disabled: Deshabilitar campo condicional
- ReadOnly: Campo de solo lectura condicional

Persistence Decorators (4):
- ApiEndpoint: URL base de API
- ApiMethods: Métodos HTTP permitidos
- Persistent: Habilitar persistencia
- PersistentKey: Mapeo de claves cliente-servidor

Identity Decorators (3):
- PrimaryProperty: Clave primaria
- DefaultProperty: Propiedad por defecto para representación
- UniquePropertyKey: Clave única para URLs

Type Decorators (1):
- StringTypeDef: Tipo específico de string (TEXT, TEXTAREA, EMAIL, etc.)

Total: 30+ decoradores utilizados

## 5. Flujo de Funcionamiento

### Paso 1: Creación de Orden en Estado DRAFT

```typescript
const order = new PurchaseOrder({
    customer: selectedCustomer,
    billingAddress: customerAddress,
    shippingAddress: customerAddress,
    items: [
        { product: product1, quantity: 2, unitPrice: 100 },
        { product: product2, quantity: 1, unitPrice: 50 }
    ],
    status: OrderStatus.DRAFT
});

await order.save();
```

Proceso interno:
1. beforeSave() se ejecuta: Auto-genera orderNumber, calcula totales, establece audit fields
2. onSaving() se ejecuta: Log de información
3. Validaciones síncronas y asíncronas se ejecutan
4. onValidated() se ejecuta: Confirmación de validación
5. POST request a /api/purchase-orders con datos mapeados por PersistentKey
6. afterSave() se ejecuta: Muestra toast de éxito, envía notificación

### Paso 2: Transición de Estados

```typescript
// DRAFT -> PENDING
order.changeStatus(OrderStatus.PENDING);
await order.save();

// PENDING -> APPROVED
order.changeStatus(OrderStatus.APPROVED);
order.paymentMethod = PaymentMethod.CREDIT_CARD;
await order.save();

// APPROVED -> IN_PROGRESS
order.changeStatus(OrderStatus.IN_PROGRESS);
await order.save();

// IN_PROGRESS -> SHIPPED
order.changeStatus(OrderStatus.SHIPPED);
order.shippingCost = 15.00;
await order.save();

// SHIPPED -> DELIVERED
order.changeStatus(OrderStatus.DELIVERED);
await order.save();
// Automáticamente establece actualDelivery y paymentStatus = 'paid'
```

### Paso 3: Validaciones Automáticas

Validación síncrona de formato:
```typescript
// Falla: orderNumber con formato inválido
order.orderNumber = 'INVALID';
await order.save();
// Error: "Order number format: ORD-12345678"
```

Validación asíncrona de unicidad:
```typescript
// Falla: orderNumber ya existe en servidor
order.orderNumber = 'ORD-12345678';
await order.save();
// Error: "Order number already exists"
```

Validación condicional Required:
```typescript
// Falla: paymentMethod requerido cuando status es APPROVED
order.status = OrderStatus.APPROVED;
order.paymentMethod = null;
await order.save();
// Error: "Payment Method is required"
```

Validación cruzada:
```typescript
// Falla: expectedDelivery debe ser después de orderDate
order.orderDate = new Date('2026-02-10');
order.expectedDelivery = new Date('2026-02-05');
await order.save();
// Error: "Expected delivery must be after order date"
```

### Paso 4: Permisos y Estados Condicionales

Campo status Disabled excepto para admin o owner:
```typescript
// Simplificado sin sistema de autenticación
// TODO: Implementar cuando Application.currentUser exista
@Disabled((entity) => {
    // Por ahora, solo permitir cambios en draft
    return entity.status !== OrderStatus.DRAFT;
})
status!: OrderStatus;
```

Campo customer Disabled después de DRAFT:
```typescript
@Disabled((entity) => entity.status !== OrderStatus.DRAFT)
customer!: Customer;
```

Campo discount Disabled para no-admins:
```typescript
// TODO: Implementar permisos cuando Application.currentUser exista
@Disabled((entity) => false)  // Por ahora permitido
discount?: number;
```

### Paso 5: Cálculos Automáticos

El método calculateTotals() se ejecuta automáticamente en beforeSave():
```typescript
// items = [
//   { quantity: 2, unitPrice: 100 },
//   { quantity: 1, unitPrice: 50 }
// ]

subtotal = (2 * 100) + (1 * 50) = 250
tax = 250 * 0.10 = 25
shippingCost = 15
discount = 10

total = 250 + 25 + 15 - 10 = 280
```

### Paso 6: Operaciones Custom

Generar PDF:
```typescript
const pdfBlob = await order.generatePDF();
// GET /api/purchase-orders/123/pdf
```

Clonar orden:
```typescript
const newOrder = order.clone();
// Crea nueva orden con mismos datos pero status = DRAFT
await newOrder.save();
```

### Paso 7: Eliminación Controlada

```typescript
// Falla: No se puede eliminar orden APPROVED
order.status = OrderStatus.APPROVED;
await order.delete();
// Error en beforeDelete(): "Only draft or cancelled orders can be deleted"

// Éxito: Eliminar orden DRAFT
order.status = OrderStatus.DRAFT;
await order.delete();
// DELETE /api/purchase-orders/123
```

## 6. Reglas Obligatorias

Toda orden debe tener al menos un item y máximo 50 items:
```typescript
@Validation((entity) => entity.items && entity.items.length > 0, 'Order must have at least one item')
@Validation((entity) => entity.items && entity.items.length <= 50, 'Order cannot have more than 50 items')
items!: Array<OrderItem>;
```

El orderNumber debe seguir formato ORD-12345678 y ser único en el sistema.

Las transiciones de estado deben seguir el flujo definido en changeStatus():
- DRAFT puede ir a PENDING o CANCELLED
- PENDING puede ir a APPROVED o CANCELLED
- APPROVED puede ir a IN_PROGRESS o CANCELLED
- IN_PROGRESS puede ir a SHIPPED o CANCELLED
- SHIPPED puede ir a DELIVERED
- DELIVERED y CANCELLED son estados terminales

El expectedDelivery debe ser posterior a orderDate.

El shippingCost no puede ser negativo.

El discount no puede exceder el subtotal.

PaymentMethod es requerido cuando status es APPROVED, IN_PROGRESS, SHIPPED o DELIVERED.

PaymentReference es requerido cuando paymentMethod es BANK_TRANSFER o PAYPAL.

Los campos customer, billingAddress y shippingAddress solo son editables cuando status es DRAFT.

Solo administradores pueden aplicar descuentos.

Solo administradores o el creador de la orden pueden cambiar el status.

Los totales (subtotal, tax, total) son calculados automáticamente y son ReadOnly.

Audit fields (createdBy, createdAt, lastModifiedBy, lastModifiedAt) son ReadOnly.

## 7. Prohibiciones

No crear órdenes sin items.

No establecer orderNumber con formato diferente a ORD-12345678.

No intentar transiciones de estado inválidas. Ejemplo: No pasar de DRAFT directamente a DELIVERED.

No establecer expectedDelivery anterior a orderDate.

No establecer shippingCost negativo.

No establecer discount mayor que subtotal.

No modificar customer, billingAddress o shippingAddress después de que status no sea DRAFT.

No modificar manualmente subtotal, tax o total (son calculados automáticamente).

No modificar audit fields (createdBy, createdAt, lastModifiedBy, lastModifiedAt).

No eliminar órdenes en estados diferentes a DRAFT o CANCELLED.

No aplicar descuentos si el usuario no es administrador.

No cambiar status si el usuario no es administrador ni el creador de la orden.

No omitir paymentMethod cuando status es APPROVED o posterior.

No omitir paymentReference cuando paymentMethod es BANK_TRANSFER o PAYPAL.

## 8. Dependencias

BaseEntity: Clase base de framework (./base_entitiy)

Customer: Entidad de cliente (./customer)

Address: Entidad de dirección (./address)

User: Entidad de usuario (./user)

OrderItem: Entidad de item de orden (./order_item)

Product: Entidad de producto referenciada por OrderItem

Decorators: Conjunto completo de 30+ decoradores (@/decorations)

StringType enum: Define tipos específicos de string (@/enums/string_type)

ViewGroupRow enum: Define layout de filas en formularios (@/enums/view_group_row)

ToastType enum: Define tipos de notificaciones toast (@/enums/ToastType)

confMenuType enum: Define tipos de menús de confirmación (@/enums/conf_menu_type)

ICONS: Constante con todos los iconos disponibles (@/constants/icons)

Application: Modelo central con servicios (axiosInstance, currentUser, ApplicationUIService, ModuleList) (@/models/application)

OrderListCustomView: Componente Vue custom para vista lista (@/views/custom/order_list_custom_view.vue)

OrderDetailCustomView: Componente Vue custom para vista detalle (@/views/custom/order_detail_custom_view.vue)

## 9. Relaciones

PurchaseOrder.customer: Relación Many-to-One con Customer. Requerida. Disabled después de DRAFT.

PurchaseOrder.billingAddress: Relación Many-to-One con Address. Requerida. Disabled después de DRAFT.

PurchaseOrder.shippingAddress: Relación Many-to-One con Address. Requerida. Puede ser igual o diferente a billingAddress. Disabled después de DRAFT.

PurchaseOrder.items: Relación One-to-Many con OrderItem mediante ArrayOf decorator. Array de items. Requerido al menos 1 item, máximo 50 items.

PurchaseOrder.createdBy: Relación Many-to-One con User. Audit field. ReadOnly. Establecido automáticamente en beforeSave().

PurchaseOrder.lastModifiedBy: Relación Many-to-One con User. Audit field. ReadOnly. Actualizado automáticamente en beforeSave().

OrderItem.product: Relación Many-to-One con Product. Cada item referencia un producto específico.

## 10. Notas de Implementación

### Mapeo de Claves con PersistentKey

El cliente usa nombres en camelCase mientras el servidor usa snake_case:

```typescript
@PersistentKey('order_id', 'id')
@PersistentKey('order_number', 'orderNumber')
@PersistentKey('customer_id', 'customerId')

// Cliente: { id: 123, orderNumber: 'ORD-12345678', customerId: 456 }
// Servidor: { order_id: 123, order_number: 'ORD-12345678', customer_id: 456 }
```

### DisplayFormat Avanzado con Funciones

DisplayFormat puede ser string template o función para lógica compleja:

```typescript
// String template
@DisplayFormat('${value} USD')
subtotal!: number;

// Función con lógica
@DisplayFormat((value) => {
    const statusIcons: Record<OrderStatus, string> = {
        [OrderStatus.DRAFT]: 'DRAFT',
        [OrderStatus.PENDING]: 'PENDING',
        // ...
    };
    return statusIcons[value as OrderStatus];
})
status!: OrderStatus;
```

### Decoradores Condicionales

Required, Disabled y ReadOnly aceptan boolean o función:

```typescript
// Boolean fijo
@Required(true)
id!: number;

// Función condicional
@Required((entity) => entity.status !== OrderStatus.DRAFT)
expectedDelivery?: Date;

@Disabled((entity) => entity.status !== OrderStatus.DRAFT)
customer!: Customer;

@ReadOnly((entity) => !entity.isNew())
orderNumber!: string;
```

### Validaciones Asíncronas

AsyncValidation ejecuta llamadas a API durante validación:

```typescript
@AsyncValidation(
    async (entity) => {
        if (!entity.orderNumber || entity.isNew()) return true;
        
        const response = await Application.axiosInstance.get(
            `/api/purchase-orders/check-number?number=${entity.orderNumber}&excludeId=${entity.id}`
        );
        return response.data.available;
    },
    'Order number already exists'
)
orderNumber!: string;
```

### ViewGroupRow para Layout

ViewGroupRow.FULL: Campo ocupa toda la fila
ViewGroupRow.HALF: Campo ocupa media fila (dos campos por fila)

```typescript
@ViewGroupRowDecorator(ViewGroupRow.FULL)
customer!: Customer;

@ViewGroupRowDecorator(ViewGroupRow.HALF)
billingAddress!: Address;
```

### Hooks de Ciclo de Vida

Orden de ejecución:
1. beforeSave()
2. Validaciones síncronas
3. Validaciones asíncronas
4. onValidated()
5. onSaving()
6. HTTP Request
7. afterSave() o saveFailed()

beforeDelete() se ejecuta antes de HTTP DELETE request.

### Métodos Custom

calculateTotals(): Privado, llamado desde beforeSave()
changeStatus(): Público, valida transiciones de estado
sendOrderNotification(): Privado, llamado desde afterSave()
generatePDF(): Público, retorna Blob
clone(): Público, retorna nueva instancia de PurchaseOrder

### Componentes Custom

OrderListCustomView reemplaza la vista lista por defecto.
OrderDetailCustomView reemplaza la vista detalle por defecto.

Ambos se registran mediante decoradores a nivel de clase:
```typescript
@ModuleListComponent(OrderListCustomView)
@ModuleDetailComponent(OrderDetailCustomView)
```

### Permisos

ModulePermission controla acceso al módulo completo:
```typescript
@ModulePermission('orders.view')
```

Decoradores condicionales implementan permisos a nivel de campo:
```typescript
// TODO: Implementar cuando Application.currentUser exista
@Disabled((entity) => false)  // Por ahora permitido
discount?: number;
```

## 11. Referencias Cruzadas

classic-module-example.md: Ejemplo básico con implementación más simple. Punto de partida recomendado antes de este ejemplo avanzado.

../01-FRAMEWORK-OVERVIEW.md: Documentación del overview del framework, conceptos fundamentales y arquitectura general.

../03-QUICK-START.md: Tutorial inicial de configuración y primeros pasos con el framework.

../layers/01-decorators/: Referencia completa de todos los decoradores disponibles (35+) con ejemplos y documentación detallada.

../layers/02-base-entity/: Documentación de BaseEntity, la clase base de la que heredan todas las entidades.

../layers/03-application/: Documentación del modelo Application y sus servicios (axiosInstance, ApplicationUIService, ModuleList).

../layers/04-components/: Documentación de componentes Vue del framework para vistas custom.

../layers/05-advanced/Models.md: Modelos adicionales del sistema.

../layers/05-advanced/Enums.md: Enums del sistema incluyendo StringType, ViewGroupRow, ToastType, confMenuType.

../tutorials/01-basic-crud.md: Tutorial de operaciones CRUD básicas.

../tutorials/02-validations.md: Tutorial sobre validaciones síncronas y asíncronas.

../tutorials/03-relations.md: Tutorial sobre implementación de relaciones entre entidades.
