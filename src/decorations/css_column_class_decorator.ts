export const CSS_COLUMN_CLASS_KEY = Symbol('css_column_class');

export function CSSColumnClass(cssClass: string): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        if (!proto[CSS_COLUMN_CLASS_KEY]) {
            proto[CSS_COLUMN_CLASS_KEY] = {};
        }
        proto[CSS_COLUMN_CLASS_KEY][propertyKey] = cssClass;
    };
}
