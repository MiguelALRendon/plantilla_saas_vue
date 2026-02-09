export const DISPLAY_FORMAT_KEY = Symbol('display_format');

export type DisplayFormatFunction = (value: any) => string;
export type DisplayFormatValue = string | DisplayFormatFunction;

export function DisplayFormat(format: DisplayFormatValue): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        if (!proto[DISPLAY_FORMAT_KEY]) {
            proto[DISPLAY_FORMAT_KEY] = {};
        }
        proto[DISPLAY_FORMAT_KEY][propertyKey] = format;
    };
}
