import type { GGIconKey } from '@/constants/ggicons';
import type { ViewTypes } from '@/enums/view_type';

export interface OnViewFunctionMetadata {
    icon: GGIconKey;
    text: string;
    viewTypes: ViewTypes[];
}

export const ON_VIEW_FUNCTION_KEY: unique symbol = Symbol('on_view_function');

export function OnViewFunction(icon: GGIconKey, text: string, viewTypes: ViewTypes[]): MethodDecorator {
    return function (
        target: object,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor
    ): void {
        // No-op when the decorator is attached to non-method targets.
        if (!descriptor || typeof descriptor.value !== 'function') {
            return;
        }

        const metadataContainer = target as Record<PropertyKey, unknown>;
        const current =
            (metadataContainer[ON_VIEW_FUNCTION_KEY] as Record<string | symbol, OnViewFunctionMetadata> | undefined) ??
            {};

        current[propertyKey] = {
            icon,
            text,
            viewTypes,
        };

        metadataContainer[ON_VIEW_FUNCTION_KEY] = current;
    };
}
