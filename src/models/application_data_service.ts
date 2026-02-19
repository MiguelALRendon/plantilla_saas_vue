import type { BaseEntity } from '@/entities/base_entity';
import type { TransformationSchema } from '@/types/service.types';

/**
 * Concrete entity constructor type for instantiable entities.
 */
type EntityConstructor<T extends BaseEntity = BaseEntity> = new (data: Record<string, unknown>) => T;

/**
 * Abstract entity constructor type that accepts both abstract and concrete constructors.
 * Used for type metadata where the actual constructor may be abstract (BaseEntity subclasses).
 */
type AbstractEntityConstructor<T extends BaseEntity = BaseEntity> = abstract new (data: Record<string, unknown>) => T;

/**
 * Service for data transformations between API payloads and entity values.
 */
export class ApplicationDataService {
    /**
     * Catalog of reusable transformers.
     */
    readonly transformers = {
        date: {
            toAPI: (value: Date | null | undefined): string | null => {
                if (!value || !(value instanceof Date)) {
                    return null;
                }

                return value.toISOString();
            },
            fromAPI: (value: string | null | undefined): Date | null => {
                if (!value) {
                    return null;
                }

                const parsedDate = new Date(value);
                return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
            },
        },
        decimal: {
            toAPI: (value: number | null | undefined, decimals: number = 2): string | null => {
                if (value === null || value === undefined) {
                    return null;
                }

                return value.toFixed(decimals);
            },
            fromAPI: (value: string | number | null | undefined): number | null => {
                if (value === null || value === undefined) {
                    return null;
                }

                const parsed = typeof value === 'number' ? value : parseFloat(value);
                return Number.isNaN(parsed) ? null : parsed;
            },
        },
        boolean: {
            toAPI: (value: boolean | null | undefined): boolean | null => value ?? null,
            fromAPI: (value: boolean | string | number | null | undefined): boolean | null => {
                if (value === null || value === undefined) {
                    return null;
                }

                if (typeof value === 'boolean') {
                    return value;
                }

                if (typeof value === 'string') {
                    return value.toLowerCase() === 'true' || value === '1';
                }

                if (typeof value === 'number') {
                    return value === 1;
                }

                return null;
            },
        },
        enum: <T extends Record<string, string | number>>(enumType: T) => ({
            toAPI: (value: T[keyof T] | null | undefined): string | number | null => value ?? null,
            fromAPI: (value: string | number | null | undefined): T[keyof T] | null => {
                if (value === null || value === undefined) {
                    return null;
                }

                const enumValues = Object.values(enumType);
                return enumValues.includes(value as T[keyof T]) ? (value as T[keyof T]) : null;
            },
        }),
        entity: <T extends BaseEntity>(entityConstructor: AbstractEntityConstructor<T>) => ({
            toAPI: (value: T | null | undefined): Record<string, unknown> | null => {
                if (!value) {
                    return null;
                }

                return value.toPersistentObject();
            },
            fromAPI: (value: Record<string, unknown> | null | undefined): T | null => {
                if (!value || typeof value !== 'object') {
                    return null;
                }

                return new (entityConstructor as EntityConstructor<T>)(value);
            },
        }),
        arrayOfEntities: <T extends BaseEntity>(entityConstructor: AbstractEntityConstructor<T>) => ({
            toAPI: (value: T[] | null | undefined): Record<string, unknown>[] | null => {
                if (!value || !Array.isArray(value)) {
                    return null;
                }

                return value.map((item) => item.toPersistentObject());
            },
            fromAPI: (value: Record<string, unknown>[] | null | undefined): T[] | null => {
                if (!value || !Array.isArray(value)) {
                    return null;
                }

                return value.map((item) => new (entityConstructor as EntityConstructor<T>)(item));
            },
        }),
    };

    /**
     * Applies transformations from API payload into entity format.
     */
    public applyTransformationsFromAPI<T extends Record<string, unknown>>(
        data: Record<string, unknown>,
        schema: TransformationSchema
    ): T {
        const result: Record<string, unknown> = {};

        for (const [key, value] of Object.entries(data)) {
            const transformer = schema[key];
            result[key] = transformer?.fromAPI ? transformer.fromAPI(value) : value;
        }

        return result as T;
    }

    /**
     * Applies transformations from entity format into API payload.
     */
    public applyTransformationsToAPI<T extends Record<string, unknown>>(
        data: Record<string, unknown>,
        schema: TransformationSchema
    ): T {
        const result: Record<string, unknown> = {};

        for (const [key, value] of Object.entries(data)) {
            const transformer = schema[key];
            result[key] = transformer?.toAPI ? transformer.toAPI(value) : value;
        }

        return result as T;
    }
}
