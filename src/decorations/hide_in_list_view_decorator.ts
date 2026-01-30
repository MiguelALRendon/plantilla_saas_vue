export const HIDE_IN_LIST_VIEW_KEY = Symbol('hide_in_list_view');

export function HideInListView(): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        if (!proto[HIDE_IN_LIST_VIEW_KEY]) {
            proto[HIDE_IN_LIST_VIEW_KEY] = {};
        }
        
        proto[HIDE_IN_LIST_VIEW_KEY][propertyKey] = true;
    };
}
