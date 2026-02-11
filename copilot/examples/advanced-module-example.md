# 🚀 Ejemplo de Módulo Avanzado - Sistema de Órdenes de Compra

**Referencias:**
- `classic-module-example.md` - Ejemplo clásico
- `../01-FRAMEWORK-OVERVIEW.md` - Overview
- `../layers/01-decorators/` - Todos los decoradores
- `../layers/05-advanced/` - Patrones avanzados

---

## 🎯 Objetivo del Ejemplo

Sistema completo de órdenes de compra con:
- ✅ **30+ decoradores** utilizados
- ✅ **Validaciones asíncronas** complejas
- ✅ **Relaciones múltiples** entre entidades
- ✅ **Arrays anidados** (OrderItems)
- ✅ **Computed properties**
- ✅ **Hooks de ciclo de vida** complejos
- ✅ **Estados** y transiciones
- ✅ **Permisos** y lógica condicional
- ✅ **Componentes custom**
- ✅ **Formateo** avanzado
- ✅ **Persistencia** con mapeo de claves

**Complejidad:** Avanzada  
**Decoradores utilizados:** 30+ de 35+  
**Tiempo de implementación:** 2-3 horas

---

## 🏗️ Arquitectura del Sistema

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

---

## 📝 Entidad Principal: PurchaseOrder

### Archivo: `src/entities/purchase_order.ts`

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
    
    // ═══════════════════════════════════════
    // BASIC INFORMATION
    // ═══════════════════════════════════════
    
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
    @DisplayFormat('🔢 {value}')
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
        // Solo admin o owner puede cambiar status
        const currentUser = Application.currentUser;
        return !(currentUser?.isAdmin || entity.createdBy?.id === currentUser?.id);
    })
    @DisplayFormat((value) => {
        const statusIcons: Record<OrderStatus, string> = {
            [OrderStatus.DRAFT]: '📝',
            [OrderStatus.PENDING]: '⏳',
            [OrderStatus.APPROVED]: '✅',
            [OrderStatus.IN_PROGRESS]: '🔄',
            [OrderStatus.SHIPPED]: '📦',
            [OrderStatus.DELIVERED]: '🎉',
            [OrderStatus.CANCELLED]: '❌'
        };
        return `${statusIcons[value as OrderStatus]} ${value}`;
    })
    @HelpText('Current order status')
    status!: OrderStatus;
    
    // ═══════════════════════════════════════
    // CUSTOMER INFORMATION
    // ═══════════════════════════════════════
    
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
    
    // ═══════════════════════════════════════
    // ORDER DETAILS
    // ═══════════════════════════════════════
    
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
    
    // ═══════════════════════════════════════
    // PAYMENT INFORMATION
    // ═══════════════════════════════════════
    
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
            'pending': '⏳ Pending',
            'partial': '🔵 Partial',
            'paid': '✅ Paid',
            'refunded': '↩️ Refunded'
        };
        return statusMap[value as string] || value as string;
    })
    @HideInListView()
    paymentStatus?: string;
    
    // ═══════════════════════════════════════
    // FINANCIAL SUMMARY
    // ═══════════════════════════════════════
    
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
        // Solo admin puede aplicar descuentos
        return !Application.currentUser?.isAdmin;
    })
    @HelpText('Discount applied to order')
    discount?: number;
    
    @ViewGroup('Financial Summary')
    @ViewGroupRowDecorator(ViewGroupRow.FULL)
    @PropertyIndex(18)
    @PropertyName('Total', Number)
    @CSSColumnClass('table-length-medium')
    @ReadOnly(true)
    @DisplayFormat((value) => `💰 $${value} USD`)
    @HelpText('Final amount to pay')
    total!: number;
    
    // ═══════════════════════════════════════
    // ITEMS (ARRAY)
    // ═══════════════════════════════════════
    
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
    
    // ═══════════════════════════════════════
    // AUDIT TRAIL
    // ═══════════════════════════════════════
    
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
    
    // ═══════════════════════════════════════
    // LIFECYCLE HOOKS
    // ═══════════════════════════════════════
    
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
            this.createdBy = Application.currentUser as any;
        }
        
        // Actualizar modificación
        this.lastModifiedAt = new Date();
        this.lastModifiedBy = Application.currentUser as any;
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
    
    // ═══════════════════════════════════════
    // CUSTOM METHODS
    // ═══════════════════════════════════════
    
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

---

## 📊 Decoradores Utilizados - Resumen

### Property Decorators (10)
- `@PropertyName` - Nombre y tipo
- `@PropertyIndex` - Orden
- `@ArrayOf` - Arrays tipados

### Module Decorators (6)
- `@ModuleName` - Nombre del módulo
- `@ModuleIcon` - Icono
- `@ModulePermission` - Permisos
- `@ModuleListComponent` - Vista lista custom
- `@ModuleDetailComponent` - Vista detalle custom
- `@ModuleCustomComponents` - Componentes adicionales

### Validation Decorators (3)
- `@Required` - Requerido (condicional)
- `@Validation` - Validación síncrona
- `@AsyncValidation` - Validación asíncrona

### UI Decorators (10)
- `@ViewGroup` - Agrupación
- `@ViewGroupRowDecorator` - Layout de filas
- `@CSSColumnClass` - Anchos
- `@HelpText` - Ayuda
- `@HideInListView` - Ocultar en lista
- `@HideInDetailView` - Ocultar en detalle
- `@DisplayFormat` - Formato visual
- `@TabOrder` - Orden de tabs

### State Decorators (2)
- `@Disabled` - Deshabilitar condicional
- `@ReadOnly` - Solo lectura condicional

### Persistence Decorators (4)
- `@ApiEndpoint` - Endpoint
- `@ApiMethods` - Métodos HTTP
- `@Persistent` - Persistencia habilitada
- `@PersistentKey` - Mapeo de claves

### Identity Decorators (3)
- `@PrimaryProperty` - Clave primaria
- `@DefaultProperty` - Propiedad por defecto
- `@UniquePropertyKey` - Clave única

### Type Decorators (1)
- `@StringTypeDef` - Tipo específico de string

**Total: 30+ decoradores**

---

## 🎨 Características Avanzadas Implementadas

### 1. Validaciones Asíncronas
```typescript
@AsyncValidation(
    async (entity) => {
        const response = await Application.axiosInstance.get(
            `/api/purchase-orders/check-number?number=${entity.orderNumber}`
        );
        return response.data.available;
    },
    'Order number already exists'
)
orderNumber!: string;
```

### 2. Estados Condicionales
```typescript
@Disabled((entity) => entity.status !== OrderStatus.DRAFT)
customer!: Customer;

@ReadOnly((entity) => !entity.isNew())
orderNumber!: string;

@Required((entity) => entity.status !== OrderStatus.DRAFT)
expectedDelivery?: Date;
```

### 3. DisplayFormat Avanzado
```typescript
@DisplayFormat((value) => {
    const statusIcons: Record<OrderStatus, string> = {
        [OrderStatus.DRAFT]: '📝',
        [OrderStatus.PENDING]: '⏳',
        // ...
    };
    return `${statusIcons[value as OrderStatus]} ${value}`;
})
status!: OrderStatus;
```

### 4. Hooks Completos
```typescript
override beforeSave() {
    // Auto-generar order number
    // Calcular totales
    // Setear audit fields
}

override afterSave() {
    // Toast de éxito
    // Enviar notificación
}

override beforeDelete() {
    // Validar que se puede eliminar
}
```

### 5. Métodos Custom
```typescript
public changeStatus(newStatus: OrderStatus): void
public async generatePDF(): Promise<Blob>
public clone(): PurchaseOrder
private calculateTotals(): void
private async sendOrderNotification(): Promise<void>
```

### 6. Persistencia con Mapeo
```typescript
@PersistentKey('order_id', 'id')
@PersistentKey('order_number', 'orderNumber')
@PersistentKey('customer_id', 'customerId')

// Cliente: { id: 123, orderNumber: 'ORD-12345678' }
// Server:  { order_id: 123, order_number: 'ORD-12345678' }
```

---

## 📚 Referencias Adicionales

- `classic-module-example.md` - Ejemplo básico
- `../layers/01-decorators/` - Todos los decoradores
- `../tutorials/04-custom-components.md` - Componentes custom
- `../tutorials/05-advanced-patterns.md` - Patrones avanzados

---

**Última actualización:** 10 de Febrero, 2026  
**Complejidad:** Avanzada  
**Decoradores utilizados:** 30+
