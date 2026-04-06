// ─── Module Name ──────────────────────────────────────────────────────────────
export const MODULE_NAME_KEY = Symbol('module_name');

export function ModuleName(name: string): ClassDecorator {
    return function (target: Function) {
        (target as unknown as Record<PropertyKey, unknown>)[MODULE_NAME_KEY] = name;
    };
}

// ─── Module Icon ──────────────────────────────────────────────────────────────
export const MODULE_ICON_KEY = Symbol('module_icon');

export function ModuleIcon(icon: string): ClassDecorator {
    return function (target: Function) {
        (target as unknown as Record<PropertyKey, unknown>)[MODULE_ICON_KEY] = icon;
    };
}

// ─── API Endpoint ─────────────────────────────────────────────────────────────
export const API_ENDPOINT_KEY = Symbol('api_endpoint');

export function ApiEndpoint(path: string): ClassDecorator {
    return function (target: Function) {
        (target as unknown as Record<PropertyKey, unknown>)[API_ENDPOINT_KEY] = path;
    };
}

// ─── API Methods ──────────────────────────────────────────────────────────────
export const API_METHODS_KEY = Symbol('api_methods');

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export function ApiMethods(methods: HttpMethod[]): ClassDecorator {
    return function (target: Function) {
        (target as unknown as Record<PropertyKey, unknown>)[API_METHODS_KEY] = methods;
    };
}

// ─── Persistent ───────────────────────────────────────────────────────────────
export const PERSISTENT_KEY = Symbol('persistent');

export function Persistent(): ClassDecorator {
    return function (target: Function) {
        (target as unknown as Record<PropertyKey, unknown>)[PERSISTENT_KEY] = true;
    };
}

// ─── @Module composite ────────────────────────────────────────────────────────

/**
 * Configuration object for the @Module composite decorator.
 */
export interface ModuleConfig {
    /** Human-readable display name shown in the UI (required). */
    name: string;
    /** Icon identifier string for sidebar/navigation (optional). */
    icon?: string;
    /** REST API base path, e.g. '/products' (optional). */
    apiEndpoint?: string;
    /** Allowed HTTP methods for CRUD operations (optional). */
    apiMethods?: HttpMethod[];
    /**
     * Whether this entity is added to the sidebar module list.
     * Defaults to true when omitted.
     */
    persistent?: boolean;
}

/**
 * Composite class decorator that applies the most common module decorators in one call.
 *
 * Equivalent to stacking @ModuleName, @ModuleIcon, @ApiEndpoint, @ApiMethods, and @Persistent
 * individually. Use this when all metadata can be expressed through ModuleConfig.
 *
 * @example
 * ```typescript
 * @Module({ name: 'Product', icon: ICONS.PRODUCT, apiEndpoint: '/products' })
 * export class ProductEntity extends BaseEntity { ... }
 * ```
 */
export function Module(config: ModuleConfig): ClassDecorator {
    return (target) => {
        ModuleName(config.name)(target);
        if (config.icon) ModuleIcon(config.icon)(target);
        if (config.apiEndpoint) ApiEndpoint(config.apiEndpoint)(target);
        if (config.apiMethods) ApiMethods(config.apiMethods)(target);
        if (config.persistent !== false) Persistent()(target);
    };
}
