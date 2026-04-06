import type { AxiosRequestConfig } from 'axios';

/**
 * Generic transformation function used by data services.
 */
export type TransformFunction = (value: unknown, ...extraArgs: unknown[]) => unknown;

/**
 * Query parameters for paginated list API requests.
 * Supports server-side pagination via page, limit, and optional filter.
 * §8A — T215
 */
export interface ListQueryParams {
    page?: number;
    limit?: number;
    filter?: string;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
}

/**
 * Paginated API response contract.
 * Used  by getElementListPaginated() to map server pagination metadata.
 * §8A — T215
 */
export interface PaginatedListResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

/**
 * Transformer contract for API ↔ entity conversions.
 */
export interface Transformer {
    toAPI?(value: unknown, ...extraArgs: unknown[]): unknown;
    fromAPI?(value: unknown): unknown;
}

/**
 * Schema definition by property key.
 */
export interface TransformationSchema {
    [propertyKey: string]: Transformer;
}

/**
 * Axios request config extended with retry metadata.
 */
export interface RetryableAxiosRequestConfig extends AxiosRequestConfig {
    __retryCount?: number;
}
