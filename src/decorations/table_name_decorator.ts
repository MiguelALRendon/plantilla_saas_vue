export const TABLE_NAME_KEY = Symbol('table_name');

export function Table(name: string) {
    return function (constructor: Function) {
        (constructor as any)[TABLE_NAME_KEY] = name;
    };
}