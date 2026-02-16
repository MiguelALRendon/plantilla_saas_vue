/**
 * Symbol key used to store disabled state metadata on decorated properties.
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.1.2}
 */
export const DISABLED_KEY = Symbol('disabled');

/**
 * Type definition for disabled conditions: static boolean or dynamic function.
 */
export type DisabledCondition = boolean | ((instance: any) => boolean);

/**
 * Metadata structure for disabled property state.
 */
export interface DisabledMetadata {
    /** The condition determining whether the property is disabled */
    condition: DisabledCondition;
}

/**
 * Decorator that controls whether a property input field is disabled (read-only) in forms.
 * 
 * This decorator supports both static disabling (always disabled) and dynamic disabling
 * (conditional based on entity state). Commonly used for auto-generated fields,
 * foreign keys, or fields that should be read-only after creation.
 * 
 * @param {DisabledCondition} condition - Boolean or function returning boolean to determine disabled state
 * @returns {PropertyDecorator} A property decorator function that attaches disabled metadata
 * 
 * @example
 * ```typescript
 * export class Usuario extends BaseEntity {
 *   @PropertyName('ID')
 *   @Disabled(true) // Always disabled
 *   id: number = 0;
 * 
 *   @PropertyName('Email')
 *   @Disabled((u: Usuario) => u.id > 0) // Disabled after creation
 *   email: string = '';
 * }
 * ```
 * 
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.1}
 * @see {@link 02-FLOW-ARCHITECTURE.md | Architecture Flow §4.3}
 */
export function Disabled(condition: DisabledCondition): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        if (!proto[DISABLED_KEY]) {
            proto[DISABLED_KEY] = {};
        }
        
        proto[DISABLED_KEY][propertyKey] = {
            condition: condition
        };
    };
}
