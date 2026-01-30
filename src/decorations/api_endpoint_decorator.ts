export const API_ENDPOINT_KEY = Symbol('api_endpoint');

export function ApiEndpoint(path: string): ClassDecorator {
    return function (target: Function) {
        (target as any)[API_ENDPOINT_KEY] = path;
    };
}
