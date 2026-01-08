import { StringType } from "@/enums/string_type";

export const STRING_TYPE_KEY = Symbol('string_type');

export function StringTypeDef(stringType: StringType): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        if (!proto[STRING_TYPE_KEY]) {
            proto[STRING_TYPE_KEY] = {};
        }
        proto[STRING_TYPE_KEY][propertyKey] = stringType;
    };
}
