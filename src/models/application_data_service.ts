import type { TransformationSchema } from '@/types/service.types';

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
