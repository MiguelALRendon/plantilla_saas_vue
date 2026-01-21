import type { BaseEntity } from '@/entities/base_entitiy';
import { EnumAdapter } from '@/models/enum_adapter';

export const PROPERTY_NAME_KEY = Symbol('property_name');
export const PROPERTY_TYPE_KEY = Symbol('property_type');

export type PropertyType = typeof String | typeof Number | typeof Date | typeof Boolean | (new (...args: any[]) => BaseEntity) | any;

export function PropertyName(name: string, type: PropertyType): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        if (!proto[PROPERTY_NAME_KEY]) {
            proto[PROPERTY_NAME_KEY] = {};
        }
        proto[PROPERTY_NAME_KEY][propertyKey] = name;
        
        if (!proto[PROPERTY_TYPE_KEY]) {
            proto[PROPERTY_TYPE_KEY] = {};
        }
        
        const isEnum = typeof type === 'object' && !type.prototype;
        proto[PROPERTY_TYPE_KEY][propertyKey] = isEnum ? new EnumAdapter(type) : type;
    };
}