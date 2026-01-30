export const HIDE_IN_DETAIL_VIEW_KEY = Symbol('hide_in_detail_view');

export function HideInDetailView(): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        if (!proto[HIDE_IN_DETAIL_VIEW_KEY]) {
            proto[HIDE_IN_DETAIL_VIEW_KEY] = {};
        }
        
        proto[HIDE_IN_DETAIL_VIEW_KEY][propertyKey] = true;
    };
}
