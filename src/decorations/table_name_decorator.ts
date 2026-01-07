export const TABLE_NAME_KEY = Symbol('table_name');

export function Table(name: string): ClassDecorator {
    return function (target: Function) {
        (target as any)[TABLE_NAME_KEY] = name;
    };
}
