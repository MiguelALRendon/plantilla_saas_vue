/**
 * Symbol key used to store readonly state metadata on decorated properties.
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.1.2}
 */
export const READONLY_KEY = Symbol('readonly');

/**
 * Type definition for readonly conditions: static boolean or dynamic function.
 */
export type ReadOnlyCondition = boolean | ((instance: any) => boolean);

/**
 * Metadata structure for readonly property state.
 */
export interface ReadOnlyMetadata {
    /** The condition determining whether the property is readonly */
    condition: ReadOnlyCondition;
}

/**
 * Decorator that marks a property as readonly (non-editable) in form inputs.
 * 
 * This decorator prevents user editing of a property while still displaying its value.
 * Unlike @Disabled (which shows grayed-out fields), readonly fields maintain normal
 * appearance but reject input. Supports both static and dynamic readonly conditions.
 * 
 * @param {ReadOnlyCondition} [condition=true] - Boolean or function returning boolean to determine readonly state (defaults to always readonly)
 * @returns {PropertyDecorator} A property decorator function that attaches readonly metadata
 * 
 * @example
 * ```typescript
 * export class Factura extends BaseEntity {
 *   @PropertyName('Número Factura', String)
 *   @ReadOnly() // Always readonly
 *   numeroFactura: string = '';
 * 
 *   @PropertyName('Total', Number)
 *   @ReadOnly((f: Factura) => f.estado === 'CERRADA') // Readonly cuando cerrada
 *   total: number = 0;
 * }
 * ```
 * 
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.1}
 * @see {@link 02-FLOW-ARCHITECTURE.md | Architecture Flow §4.3}
 */
export function ReadOnly(condition: ReadOnlyCondition = true): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        if (!proto[READONLY_KEY]) {
            proto[READONLY_KEY] = {};
        }
        
        proto[READONLY_KEY][propertyKey] = {
            condition: condition
        };
    };
}
