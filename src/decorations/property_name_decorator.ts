import type { BaseEntity } from '@/entities/base_entitiy';
import { EnumAdapter } from '@/models/enum_adapter';

export const PROPERTY_NAME_KEY = Symbol('property_name');
export const PROPERTY_TYPE_KEY = Symbol('property_type');
export const ARRAY_ELEMENT_TYPE_KEY = Symbol('array_element_type');

export type PropertyType = typeof String | typeof Number | typeof Date | typeof Boolean | (new (...args: any[]) => BaseEntity) | any;

class ArrayTypeWrapper {
    constructor(public elementType: new (...args: any[]) => BaseEntity) {}
}

export function ArrayOf<T extends BaseEntity>(elementType: new (...args: any[]) => T): ArrayTypeWrapper {
    return new ArrayTypeWrapper(elementType);
}

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
        
        // Detectar si es un ArrayTypeWrapper
        if (type instanceof ArrayTypeWrapper) {
            proto[PROPERTY_TYPE_KEY][propertyKey] = Array;
            
            if (!proto[ARRAY_ELEMENT_TYPE_KEY]) {
                proto[ARRAY_ELEMENT_TYPE_KEY] = {};
            }
            proto[ARRAY_ELEMENT_TYPE_KEY][propertyKey] = type.elementType;
        } else {
            const isEnum = typeof type === 'object' && !type.prototype;
            proto[PROPERTY_TYPE_KEY][propertyKey] = isEnum ? new EnumAdapter(type) : type;
        }
    };
}