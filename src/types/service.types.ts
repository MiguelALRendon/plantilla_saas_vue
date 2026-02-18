import type { AxiosRequestConfig } from 'axios';

/**
 * Generic transformation function used by data services.
 */
export type TransformFunction = (value: unknown, ...extraArgs: unknown[]) => unknown;

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
