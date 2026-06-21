import { GetLanguagedText } from '@/helpers/language_helper';

/** Joins an API endpoint with an ID segment, normalising any trailing slash on the base. */
export function joinUrl(endpoint: string, id: unknown): string {
    return `${endpoint.replace(/\/+$/, '')}/${String(id)}`;
}

/** Extracts a human-readable message from an unknown HTTP/axios error. */
export function getErrorMessage(error: unknown): string {
    if (error && typeof error === 'object') {
        const errorRecord = error as Record<string, unknown>;
        const response = errorRecord.response as Record<string, unknown> | undefined;
        const responseData = response?.data as Record<string, unknown> | undefined;
        const responseMessage = responseData?.message;

        if (typeof responseMessage === 'string' && responseMessage.length > 0) {
            return responseMessage;
        }

        const message = errorRecord.message;
        if (typeof message === 'string' && message.length > 0) {
            return message;
        }
    }

    return GetLanguagedText('errors.unknown_error');
}
