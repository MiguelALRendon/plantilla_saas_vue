export const HELP_TEXT_KEY = Symbol('help_text');

export function HelpText(text: string): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
        const proto = target.constructor.prototype;
        if (!proto[HELP_TEXT_KEY]) {
            proto[HELP_TEXT_KEY] = {};
        }
        proto[HELP_TEXT_KEY][propertyKey] = text;
    };
}
