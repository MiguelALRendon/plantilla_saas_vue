import { AsyncValidation, Validation } from '@/decorations';
import type { BaseEntity } from '@/entities/base_entity';
import Application from '@/models/application';

/**
 * Contractual validator catalog IDs for traceability with documentation.
 */
export const VALIDATOR_CATALOG: Readonly<Record<string, string>> = {
    'VALCAT-01': 'Validators.email',
    'VALCAT-02': 'Validators.minLength',
    'VALCAT-03': 'Validators.maxLength',
    'VALCAT-04': 'Validators.range',
    'VALCAT-05': 'Validators.min',
    'VALCAT-06': 'Validators.max',
    'VALCAT-07': 'Validators.pattern',
    'VALCAT-08': 'Validators.url',
    'VALCAT-09': 'Validators.phone',
    'VALCAT-10': 'Validators.notFuture',
    'VALCAT-11': 'Validators.notPast',
    'VALCAT-12': 'AsyncValidators.unique',
};

/**
 * Predefined synchronous validators.
 */
export class Validators {
    /**
     * Validates e-mail format.
    * ID: VALCAT-01
     */
    static email(message: string = 'Formato de email inválido'): PropertyDecorator {
        return this.withStringValue((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), message);
    }

    /**
     * Validates minimum string length.
        * ID: VALCAT-02
     */
    static minLength(min: number, message?: string): PropertyDecorator {
        return this.withStringValue((value) => value.length >= min, message || `Debe tener al menos ${min} caracteres`);
    }

    /**
     * Validates maximum string length.
        * ID: VALCAT-03
     */
    static maxLength(max: number, message?: string): PropertyDecorator {
        return this.withStringValue((value) => value.length <= max, message || `Debe tener máximo ${max} caracteres`);
    }

    /**
     * Validates numeric range.
        * ID: VALCAT-04
     */
    static range(min: number, max: number, message?: string): PropertyDecorator {
        return this.withNumberValue((value) => value >= min && value <= max, message || `Debe estar entre ${min} y ${max}`);
    }

    /**
     * Validates numeric minimum.
        * ID: VALCAT-05
     */
    static min(minimum: number, message?: string): PropertyDecorator {
        return this.withNumberValue((value) => value >= minimum, message || `Debe ser mayor o igual a ${minimum}`);
    }

    /**
     * Validates numeric maximum.
        * ID: VALCAT-06
     */
    static max(maximum: number, message?: string): PropertyDecorator {
        return this.withNumberValue((value) => value <= maximum, message || `Debe ser menor o igual a ${maximum}`);
    }

    /**
     * Validates string against regular expression.
        * ID: VALCAT-07
     */
    static pattern(regex: RegExp, message: string = 'Formato inválido'): PropertyDecorator {
        return this.withStringValue((value) => regex.test(value), message);
    }

    /**
     * Validates URL syntax.
        * ID: VALCAT-08
     */
    static url(message: string = 'URL inválida'): PropertyDecorator {
        return this.withStringValue((value) => {
            try {
                new URL(value);
                return true;
            } catch {
                return false;
            }
        }, message);
    }

    /**
     * Validates basic phone number format.
        * ID: VALCAT-09
     */
    static phone(message: string = 'Número de teléfono inválido'): PropertyDecorator {
        return this.withStringValue((value) => /^[\d\s\-\+\(\)]+$/.test(value) && value.replace(/\D/g, '').length >= 10, message);
    }

    /**
     * Validates date is not in the future.
        * ID: VALCAT-10
     */
    static notFuture(message: string = 'La fecha no puede ser futura'): PropertyDecorator {
        return this.withDateValue((value) => value <= new Date(), message);
    }

    /**
     * Validates date is not in the past.
        * ID: VALCAT-11
     */
    static notPast(message: string = 'La fecha no puede ser pasada'): PropertyDecorator {
        return this.withDateValue((value) => value >= new Date(), message);
    }

    private static withStringValue(predicate: (value: string) => boolean, message: string): PropertyDecorator {
        return this.withPropertyValue<string>((value) => {
            if (!value) {
                return true;
            }

            return predicate(value);
        }, message);
    }

    private static withNumberValue(predicate: (value: number) => boolean, message: string): PropertyDecorator {
        return this.withPropertyValue<number>((value) => {
            if (value === null || value === undefined) {
                return true;
            }

            return predicate(value);
        }, message);
    }

    private static withDateValue(predicate: (value: Date) => boolean, message: string): PropertyDecorator {
        return this.withPropertyValue<Date>((value) => {
            if (!value) {
                return true;
            }

            const dateValue = value instanceof Date ? value : new Date(value);
            if (Number.isNaN(dateValue.getTime())) {
                return false;
            }

            return predicate(dateValue);
        }, message);
    }

    private static withPropertyValue<T>(predicate: (value: T) => boolean, message: string): PropertyDecorator {
        return (target: object, propertyKey: string | symbol) => {
            Validation((entity: BaseEntity) => {
                const value = (entity as Record<string, unknown>)[propertyKey as string] as T;
                return predicate(value);
            }, message)(target, propertyKey);
        };
    }
}

/**
 * Predefined asynchronous validators.
 */
export class AsyncValidators {
    /**
     * Validates uniqueness against backend endpoint.
    * ID: VALCAT-12
     */
    static unique(endpoint: string, message: string = 'Este valor ya existe'): PropertyDecorator {
        return (target: object, propertyKey: string | symbol) => {
            AsyncValidation(async (entity: BaseEntity) => {
                const value = (entity as Record<string, unknown>)[propertyKey as string];

                if (!value) {
                    return true;
                }

                try {
                    const response = await Application.axiosInstance.get(endpoint, {
                        params: {
                            value,
                            id: entity.getUniquePropertyValue(),
                        },
                    });

                    return response.data?.isUnique === true;
                } catch (error: unknown) {
                    console.error('[AsyncValidators] Error validating uniqueness', error);
                    return false;
                }
            }, message)(target, propertyKey);
        };
    }
}
