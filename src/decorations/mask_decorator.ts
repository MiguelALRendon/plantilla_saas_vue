import { MaskSides } from "@/enums/mask_sides";

export const MASK_KEY = Symbol('mask');

export function Mask(mask: string, side: MaskSides): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        if (!proto[MASK_KEY]) {
            proto[MASK_KEY] = {};
        }
        proto[MASK_KEY][propertyKey] = { mask, side };
    };
}
