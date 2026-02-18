import type { BaseEntity } from '@/entities/base_entity';
import type { HttpMethod } from '@/decorations';
import type { TransformationSchema } from './service.types';

/**
 * Generic entity payload used during mapping, persistence and construction.
 */
export type EntityData = Record<string, unknown>;

/**
 * Generic metadata record used for symbol-indexed decorator storage.
 */
export type MetadataRecord = Record<PropertyKey, unknown>;

/**
 * Constructor signature for concrete entity instances.
 */
export type EntityConstructor<T extends BaseEntity = BaseEntity> = new (data: EntityData) => T;

/**
 * Runtime static contract required by BaseEntity static APIs.
 */
export type ConcreteEntityClass<T extends BaseEntity = BaseEntity> = EntityConstructor<T> & {
    getApiEndpoint(): string | undefined;
    mapFromPersistentKeys(data: EntityData): EntityData;
    getPersistentKeys(): Record<string, string>;
    getPropertyKeyByPersistentKey(persistentKey: string): string | undefined;
    getElementList(filter?: string): Promise<T[]>;
};

/**
 * Decorated prototype type for symbol-indexed metadata reads.
 */
export type DecoratedPrototype<T extends BaseEntity = BaseEntity> = T & MetadataRecord;

/**
 * Decorated constructor type for symbol-indexed metadata reads on class/constructor.
 */
export type DecoratedConstructor<T extends BaseEntity = BaseEntity> = {
    prototype: DecoratedPrototype<T>;
} & typeof BaseEntity & MetadataRecord;

/**
 * Static contract for entities that expose transformation schemas.
 */
export type TransformableEntityClass<T extends BaseEntity = BaseEntity> = ConcreteEntityClass<T> & {
    transformationSchema?: TransformationSchema;
    getApiMethods(): HttpMethod[] | undefined;
};
