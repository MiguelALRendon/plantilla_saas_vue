import type { BaseEntity } from '@/entities/base_entity';
import { EnumAdapter } from '@/models/enum_adapter';

/**
 * Symbol key used to store property display names on decorated properties.
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.1.2}
 */
export const PROPERTY_NAME_KEY = Symbol('property_name');

/**
 * Symbol key used to store property type metadata on decorated properties.
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.1.2}
 */
export const PROPERTY_TYPE_KEY = Symbol('property_type');

/**
 * Symbol key used to store array element type metadata on decorated properties.
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.1.2}
 */
export const ARRAY_ELEMENT_TYPE_KEY = Symbol('array_element_type');

/**
 * Type definition for property types supported by the framework.
 */
export type PropertyType =
    | typeof String
    | typeof Number
    | typeof Date
    | typeof Boolean
    | (new (...args: any[]) => BaseEntity)
    | any;

/**
 * Internal wrapper class for array type definitions.
 */
class ArrayTypeWrapper {
    constructor(public elementType: new (...args: any[]) => BaseEntity) {}
}

/**
 * Helper function to define array property types with entity relationships.
 *
 * This function wraps an entity constructor to indicate that the property is an array
 * of that entity type. Used for one-to-many relationships.
 *
 * @param {new (...args: any[]) => T} elementType - The constructor of the entity type contained in the array
 * @returns {ArrayTypeWrapper} A wrapper object indicating array type with element metadata
 *
 * @example
 * ```typescript
 * export class Pedido extends BaseEntity {
 *   @PropertyName('Items', ArrayOf(ItemPedido))
 *   items: ItemPedido[] = [];
 * }
 * ```
 *
 * @see {@link 03-RELATIONS.md | Relations Tutorial §2.4}
 */
export function ArrayOf<T extends BaseEntity>(elementType: new (...args: any[]) => T): ArrayTypeWrapper {
    return new ArrayTypeWrapper(elementType);
}

/**
 * Decorator that defines the human-readable display name and type for an entity property.
 *
 * This is the **MOST IMPORTANT** decorator - every entity property should have it.
 * It serves dual purposes: (1) provides the UI label for the property, and (2) establishes
 * runtime type metadata for the meta-programming system. Without this decorator, the property
 * will not appear in auto-generated forms and tables.
 *
 * @param {string} name - The display name shown in UI labels (e.g., 'Nombre Completo', 'Precio Unitario')
 * @param {PropertyType} type - The property type (String, Number, Date, Boolean, Entity constructor, Enum, or ArrayOf(Entity))
 * @returns {PropertyDecorator} A property decorator function that attaches name and type metadata
 *
 * @example
 * ```typescript
 * import { TipoProducto } from '@/enums/tipo_producto';
 * import { Marca } from './marca';
 *
 * export class Producto extends BaseEntity {
 *   @PropertyName('Nombre', String)
 *   nombre: string = '';
 *
 *   @PropertyName('Precio', Number)
 *   precio: number = 0;
 *
 *   @PropertyName('Fecha Alta', Date)
 *   fechaAlta: Date = new Date();
 *
 *   @PropertyName('Activo', Boolean)
 *   activo: boolean = true;
 *
 *   @PropertyName('Tipo', TipoProducto) // Enum
 *   tipo: TipoProducto = TipoProducto.SIMPLE;
 *
 *   @PropertyName('Marca', Marca) // Relación
 *   marca: Marca = new Marca();
 *
 *   @PropertyName('Variantes', ArrayOf(ProductoVariante)) // Array de entidades
 *   variantes: ProductoVariante[] = [];
 * }
 * ```
 *
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.1}
 * @see {@link 01-BASIC-CRUD.md | CRUD Tutorial §2.2}
 * @see {@link 03-RELATIONS.md | Relations Tutorial}
 */
export function PropertyName(name: string, type: PropertyType): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        if (!proto[PROPERTY_NAME_KEY]) {
            proto[PROPERTY_NAME_KEY] = {};
        }
        proto[PROPERTY_NAME_KEY][propertyKey] = name;

        if (!proto[PROPERTY_TYPE_KEY]) {
            proto[PROPERTY_TYPE_KEY] = {};
        }

        // Detectar si es un ArrayTypeWrapper
        if (type instanceof ArrayTypeWrapper) {
            proto[PROPERTY_TYPE_KEY][propertyKey] = Array;

            if (!proto[ARRAY_ELEMENT_TYPE_KEY]) {
                proto[ARRAY_ELEMENT_TYPE_KEY] = {};
            }
            proto[ARRAY_ELEMENT_TYPE_KEY][propertyKey] = type.elementType;
        } else {
            const isEnum = typeof type === 'object' && !type.prototype;
            proto[PROPERTY_TYPE_KEY][propertyKey] = isEnum ? new EnumAdapter(type) : type;
        }
    };
}
