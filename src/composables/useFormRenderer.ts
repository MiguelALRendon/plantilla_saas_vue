import type { Component } from 'vue';

import { DATE_TIME_LOCAL_SUFFIX } from '@/constants/datetime';
import { BaseEntity } from '@/entities/base_entity';
import { StringType } from '@/enums/string_type';
import { ENUM_TYPE_SENTINEL,
    inputRegistry,
    OBJECT_TYPE_SENTINEL,
} from '@/models/input_registry';

export interface FormRenderer {
    resolveInputForProp(entityClass: typeof BaseEntity, entity: BaseEntity, key: string): Component | null;
    getModelValue(entityClass: typeof BaseEntity, entity: BaseEntity, key: string): unknown;
    setModelValue(entity: BaseEntity, key: string, value: unknown): void;
    /** Returns any extra component-specific props required (e.g. propertyEnumValues, modelType). */
    getExtraProps(entityClass: typeof BaseEntity, entity: BaseEntity, key: string): Record<string, unknown>;
}

/**
 * T125 — useFormRenderer: composable exposing registry-based component resolution
 * and unified model value access/mutation for all entity input types.
 * Compatible with both Composition API and Options API method calls.
 */
export function useFormRenderer(): FormRenderer {
    /** Primitive constructors that the registry handles directly. Anything else is an entity relation. */
    const PRIMITIVE_TYPES = new Set<unknown>([String, Number, Boolean, Date]);

    function isEntityRelation(propType: unknown): propType is Function {
        return (
            typeof propType === 'function' &&
            !PRIMITIVE_TYPES.has(propType)
        );
    }

    function resolveInputForProp(
        entityClass: typeof BaseEntity,
        entity: BaseEntity,
        key: string
    ): Component | null {
        const propType: unknown = entityClass.getPropertyType(key);
        // Only String props carry a meaningful stringType; all others should use null.
        const stringType: StringType | null = propType === String
            ? ((entity.getStringType() as Record<string, StringType>)[key] ?? null)
            : null;

        // Enum properties: type stored as EnumAdapter instance (duck-typed by isEnumProperty)
        if (entity.isEnumProperty(key)) {
            return inputRegistry.resolve(ENUM_TYPE_SENTINEL, null);
        }

        // Entity relation: any function propType that isn't a known primitive
        if (isEntityRelation(propType)) {
            return inputRegistry.resolve(OBJECT_TYPE_SENTINEL, null);
        }

        return inputRegistry.resolve(propType as Function, stringType);
    }

    function getModelValue(
        entityClass: typeof BaseEntity,
        entity: BaseEntity,
        key: string
    ): unknown {
        const propType: unknown = entityClass.getPropertyType(key);

        if (propType === Number) {
            return Number(entity[key] ?? 0);
        }
        if (propType === Boolean) {
            return Boolean(entity[key]);
        }
        if (propType === Date) {
            const value = entity[key];
            if (!value) return '';
            const date = value instanceof Date ? value : new Date(`${String(value)}${DATE_TIME_LOCAL_SUFFIX}`);
            if (isNaN(date.getTime())) return '';
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
        if (isEntityRelation(propType)) {
            return entity[key] instanceof Object && typeof (entity[key] as Record<string, unknown>)['getDefaultPropertyValue'] === 'function'
                ? entity[key]
                : null;
        }
        if (entity.isEnumProperty(key)) {
            const val = entity[key];
            return typeof val === 'number' ? val : String(val ?? '');
        }
        // String (all subtypes)
        return String(entity[key] ?? '');
    }

    function setModelValue(entity: BaseEntity, key: string, value: unknown): void {
        const propType: unknown = (entity.constructor as typeof BaseEntity).getPropertyType(key);
        if (propType === Date) {
            entity[key] = value ? new Date(`${String(value)}${DATE_TIME_LOCAL_SUFFIX}`) : null;
        } else {
            entity[key] = value as (typeof entity)[typeof key];
        }
    }

    function getExtraProps(
        entityClass: typeof BaseEntity,
        entity: BaseEntity,
        key: string
    ): Record<string, unknown> {
        const extra: Record<string, unknown> = {};
        const propType: unknown = entityClass.getPropertyType(key);

        // EnumInputComponent requires propertyEnumValues: EnumAdapter
        if (entity.isEnumProperty(key)) {
            extra['propertyEnumValues'] = propType;
        }

        // ObjectInputComponent requires modelType: typeof BaseEntity
        if (isEntityRelation(propType)) {
            extra['modelType'] = propType;
        }

        return extra;
    }

    return { resolveInputForProp, getModelValue, setModelValue, getExtraProps };
}
