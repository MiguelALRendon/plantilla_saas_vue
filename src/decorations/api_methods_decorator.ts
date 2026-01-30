export const API_METHODS_KEY = Symbol('api_methods');

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export function ApiMethods(methods: HttpMethod[]): ClassDecorator {
    return function (target: Function) {
        (target as any)[API_METHODS_KEY] = methods;
    };
}
