import Application from '@/models/application';
import { ConfMenuType as confMenuType } from '@/enums/conf_menu_type';
import { GetLanguagedText } from '@/helpers/language_helper';
import { isCanceled } from '@/composables/useCancellableLoader';
import { PERSISTENT_KEY } from '@/decorations';

import { getErrorMessage, joinUrl } from './entity_http_utils';

import type { BaseEntity } from './base_entity';
import type { ConcreteEntityClass, EntityData } from '@/types/entity.types';
import type { ListQueryParams, PaginatedListResult } from '@/types/service.types';

/**
 * EntityRepository — data-access layer for entities. Encapsulates the read/query
 * HTTP operations (single, list, paginated) so BaseEntity delegates persistence I/O
 * here instead of owning it directly (SRP). Behaviour is identical to the previous
 * BaseEntity static methods.
 *
 * On request failure this layer only emits `'data-error'` on the shared event bus —
 * it never calls `ApplicationUIService` directly, so the data layer stays decoupled
 * from UI concerns. `ApplicationClass` owns the reaction (opening the confirmation menu).
 */

/** Emits the shared `'data-error'` event so Application can react with UI feedback. */
function emitDataError(title: string, error: unknown): void {
    Application.eventBus.emit('data-error', {
        type: confMenuType.ERROR,
        title,
        message: getErrorMessage(error),
    });
}

/** Retrieves a single entity by its unique identifier. */
export async function getElement<T extends BaseEntity>(
    EntityClass: ConcreteEntityClass<T>,
    entityObjectId: string,
    signal?: AbortSignal
): Promise<T> {
    const constructorMetadata = EntityClass as unknown as Record<PropertyKey, unknown>;
    if (!Boolean(constructorMetadata[PERSISTENT_KEY])) {
        return new EntityClass({});
    }

    const endpoint = EntityClass.getApiEndpoint();

    if (!endpoint) {
        throw new Error(GetLanguagedText('errors.api_endpoint_not_defined'));
    }

    try {
        const response = await Application.axiosInstance.get(joinUrl(endpoint, entityObjectId), { signal });
        const mappedData = EntityClass.mapFromPersistentKeys(response.data as EntityData);
        const instance = new EntityClass(mappedData);
        instance.afterGetElement();
        return instance;
    } catch (error: unknown) {
        if (isCanceled(error)) {
            throw error;
        }
        const tempInstance = new EntityClass({});
        tempInstance.getElementFailed();
        emitDataError(GetLanguagedText('errors.error_obtaining_element'), error);
        throw error;
    }
}

/** Retrieves a list of entities. Handles flat-array and paginated-envelope responses. */
export async function getElementList<T extends BaseEntity>(
    EntityClass: ConcreteEntityClass<T>,
    paramsOrFilter: ListQueryParams | string = ''
): Promise<T[]> {
    const constructorMetadata = EntityClass as unknown as Record<PropertyKey, unknown>;
    if (!Boolean(constructorMetadata[PERSISTENT_KEY])) {
        return [];
    }

    const endpoint = EntityClass.getApiEndpoint();

    if (!endpoint) {
        throw new Error(GetLanguagedText('errors.api_endpoint_not_defined'));
    }

    // Normalise to params object so the API receives standard query keys
    const params: Record<string, unknown> =
        typeof paramsOrFilter === 'string'
            ? { filter: paramsOrFilter }
            : { ...paramsOrFilter };

    try {
        const response = await Application.axiosInstance.get(endpoint, { params });
        const responseData = response.data as unknown;

        // Detect paginated envelope { data: [...], total, ... }
        const rawItems: unknown[] =
            responseData &&
            typeof responseData === 'object' &&
            !Array.isArray(responseData) &&
            'data' in (responseData as object)
                ? (responseData as { data: unknown[] }).data
                : (responseData as unknown[]);

        const instances = rawItems.map((item: unknown) => {
            const mappedData = EntityClass.mapFromPersistentKeys(item as EntityData);
            return new EntityClass(mappedData);
        });
        instances.forEach((instance) => instance.afterGetElementList());
        return instances;
    } catch (error: unknown) {
        const tempInstance = new EntityClass({});
        tempInstance.getElementListFailed();
        emitDataError(GetLanguagedText('errors.error_obtaining_list'), error);
        throw error;
    }
}

/** Retrieves a paginated list with server-side metadata; paginates flat arrays in-memory. */
export async function getElementListPaginated<T extends BaseEntity>(
    EntityClass: ConcreteEntityClass<T>,
    params: ListQueryParams = {}
): Promise<PaginatedListResult<T>> {
    const constructorMetadata = EntityClass as unknown as Record<PropertyKey, unknown>;
    if (!Boolean(constructorMetadata[PERSISTENT_KEY])) {
        return {
            data: [],
            total: 0,
            page: params.page ?? 1,
            limit: params.limit ?? 20,
        };
    }

    const endpoint = EntityClass.getApiEndpoint();

    if (!endpoint) {
        throw new Error(GetLanguagedText('errors.api_endpoint_not_defined'));
    }

    const { page = 1, limit = 20, filter = '', signal } = params;

    try {
        const response = await Application.axiosInstance.get(endpoint, {
            params: { page, limit, filter },
            signal,
        });
        const responseData = response.data as unknown;

        // Detect paginated envelope { data: [...], total, page?, limit? }
        if (
            responseData &&
            typeof responseData === 'object' &&
            !Array.isArray(responseData) &&
            'data' in (responseData as object) &&
            'total' in (responseData as object)
        ) {
            const envelope = responseData as {
                data: unknown[];
                total: number;
                page?: number;
                limit?: number;
            };
            const instances = envelope.data.map((item: unknown) => {
                const mappedData = EntityClass.mapFromPersistentKeys(item as EntityData);
                return new EntityClass(mappedData);
            });
            instances.forEach((instance) => instance.afterGetElementList());
            return {
                data: instances,
                total: envelope.total,
                page: envelope.page ?? page,
                limit: envelope.limit ?? limit
            };
        }

        // Flat array response — paginate in-memory and report full length as total
        const allItems = responseData as unknown[];
        const allInstances = allItems.map((item: unknown) => {
            const mappedData = EntityClass.mapFromPersistentKeys(item as EntityData);
            return new EntityClass(mappedData);
        });
        allInstances.forEach((instance) => instance.afterGetElementList());
        const start = (page - 1) * limit;
        const pageData = allInstances.slice(start, start + limit);
        return {
            data: pageData,
            total: allInstances.length,
            page,
            limit
        };
    } catch (error: unknown) {
        if (isCanceled(error)) {
            throw error;
        }
        const tempInstance = new EntityClass({});
        tempInstance.getElementListFailed();
        emitDataError(GetLanguagedText('errors.error_obtaining_list'), error);
        throw error;
    }
}
