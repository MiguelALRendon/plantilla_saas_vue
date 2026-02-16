import { MaskSides } from '@/enums/mask_sides';

/**
 * Symbol key used to store input mask metadata on decorated properties.
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.1.2}
 */
export const MASK_KEY = Symbol('mask');

/**
 * Decorator that applies input masking to text fields for structured data entry.
 *
 * This decorator enforces input patterns for fields like phone numbers, credit cards,
 * dates, or custom formatted strings. It uses a mask template and specifies which
 * side to apply the mask from (left or right).
 *
 * @param {string} mask - The mask template string (e.g., '(###) ###-####' for phone, '####-####-####-####' for credit card)
 * @param {MaskSides} side - Direction to apply mask: MaskSides.LEFT or MaskSides.RIGHT
 * @returns {PropertyDecorator} A property decorator function that attaches input mask metadata
 *
 * @example
 * ```typescript
 * import { MaskSides } from '@/enums/mask_sides';
 *
 * export class Cliente extends BaseEntity {
 *   @PropertyName('Teléfono')
 *   @Mask('(###) ###-####', MaskSides.LEFT)
 *   telefono: string = '';
 *
 *   @PropertyName('Código Postal')
 *   @Mask('#####', MaskSides.LEFT)
 *   codigoPostal: string = '';
 * }
 * ```
 *
 * @see {@link 01-FRAMEWORK-OVERVIEW.md | Framework Overview §3.1}
 * @see {@link 01-BASIC-CRUD.md | CRUD Tutorial §2.4}
 */
export function Mask(mask: string, side: MaskSides): PropertyDecorator {
    return function (target: object, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        if (!proto[MASK_KEY]) {
            proto[MASK_KEY] = {};
        }
        proto[MASK_KEY][propertyKey] = { mask, side };
    };
}
