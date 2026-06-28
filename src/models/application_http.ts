import type { AxiosError, AxiosInstance } from 'axios';
import type { Ref } from 'vue';
import type { Router } from 'vue-router';

import { ToastType } from '@/enums/toast_type';
import { GetLanguagedText } from '@/helpers/language_helper';
import { isCanceled } from '@/composables/useCancellableLoader';
import type { RetryableAxiosRequestConfig } from '@/types/service.types';

import type { AppConfiguration } from './app_configuration';
import type { ApplicationUIService } from './application_ui_service';
import { logger } from '@/utils/logger';

/** Minimal surface the HTTP interceptors need from the Application singleton. */
export interface HttpInterceptorHost {
    axiosInstance: AxiosInstance;
    AppConfiguration: Ref<AppConfiguration>;
    ApplicationUIService: ApplicationUIService;
    router: Router | null;
}

/** i18n interpolation: translates `path` and replaces `{key}` tokens. */
function formatText(path: string, replacements: Record<string, string | number> = {}): string {
    let text = GetLanguagedText(path);
    for (const [key, value] of Object.entries(replacements)) {
        text = text.split(`{${key}}`).join(String(value));
    }
    return text;
}

/**
 * Configures request (auth + CSRF headers) and response (retry/backoff, 401 refresh,
 * centralized error toasts) interceptors on the host's axios instance.
 * Extracted from ApplicationClass to keep the singleton focused (SRP).
 */
export function setupHttpInterceptors(app: HttpInterceptorHost): void {
    app.axiosInstance.interceptors.request.use(
        (config) => {
            const token = sessionStorage.getItem(app.AppConfiguration.value.authTokenKey);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            const mutatingMethods = ['post', 'put', 'patch', 'delete'];
            if (config.method && mutatingMethods.includes(config.method.toLowerCase())) {
                const csrfToken = sessionStorage.getItem('csrf_token');
                if (csrfToken) {
                    config.headers['X-CSRF-Token'] = csrfToken;
                }
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    app.axiosInstance.interceptors.response.use(
        (response) => response,
        async (error: AxiosError) => {
            const status = error.response?.status;
            const requestConfig = error.config as RetryableAxiosRequestConfig | undefined;

            if (requestConfig && requestConfig.__retryCount === undefined) {
                requestConfig.__retryCount = 0;
            }

            if (status === undefined) {
                // Intentional cancellation via AbortController — do not retry or notify.
                if (isCanceled(error)) {
                    return Promise.reject(error);
                }
                // T233: Retry with bounded exponential backoff for offline/transient connectivity errors
                if (
                    requestConfig &&
                    (requestConfig.__retryCount ?? 0) < app.AppConfiguration.value.apiRetryAttempts
                ) {
                    requestConfig.__retryCount = (requestConfig.__retryCount ?? 0) + 1;
                    const retryDelay = Math.pow(2, requestConfig.__retryCount) * 1000;
                    app.ApplicationUIService.showToast(
                        formatText('errors.connection_retrying', {
                            current: requestConfig.__retryCount,
                            max: app.AppConfiguration.value.apiRetryAttempts
                        }),
                        ToastType.WARNING
                    );
                    await new Promise((resolve) => setTimeout(resolve, retryDelay));
                    return app.axiosInstance.request(requestConfig);
                }
                app.ApplicationUIService.showToast(
                    GetLanguagedText('errors.connection_error'),
                    ToastType.ERROR
                );
                return Promise.reject(error);
            }

            switch (status) {
                case 401: {
                    const isLoginEndpoint = requestConfig?.url?.includes('/auth/login');

                    if (isLoginEndpoint) {
                        const responseData = error.response?.data as Record<string, unknown> | undefined;
                        const errors = responseData?.errors;
                        const message = Array.isArray(errors) && errors.length > 0
                            ? errors.map(String).join(', ')
                            : GetLanguagedText('errors.invalid_credentials');
                        app.ApplicationUIService.showToast(message, ToastType.ERROR);
                        (error as unknown as Record<string, unknown>).__handled = true;
                    } else {
                        const refreshToken = sessionStorage.getItem(app.AppConfiguration.value.authRefreshTokenKey);
                        if (refreshToken && requestConfig && !requestConfig.__retryCount) {
                            try {
                                const refreshResponse = await app.axiosInstance.post(
                                    '/auth/refresh',
                                    {},
                                    { headers: { Authorization: `Bearer ${refreshToken}` } }
                                );
                                const newAccessToken = (refreshResponse.data as Record<string, unknown>).access_token as string;
                                sessionStorage.setItem(app.AppConfiguration.value.authTokenKey, newAccessToken);
                                requestConfig.__retryCount = 1;
                                requestConfig.headers = {
                                    ...requestConfig.headers,
                                    Authorization: `Bearer ${newAccessToken}`,
                                };
                                return app.axiosInstance.request(requestConfig);
                            } catch (refreshError) {
                                logger.error('[HTTP] Token refresh failed — forcing logout.', refreshError);
                            }
                        }
                        sessionStorage.removeItem(app.AppConfiguration.value.authTokenKey);
                        sessionStorage.removeItem(app.AppConfiguration.value.authRefreshTokenKey);
                        sessionStorage.removeItem('current_user');
                        app.ApplicationUIService.showToast(
                            GetLanguagedText('errors.session_expired'),
                            ToastType.ERROR
                        );
                        if (app.router) {
                            app.router.push('/login').catch(() => {});
                        }
                    }
                    break;
                }

                case 403:
                    app.ApplicationUIService.showToast(
                        GetLanguagedText('errors.no_permissions'),
                        ToastType.ERROR
                    );
                    break;

                case 404:
                    app.ApplicationUIService.showToast(
                        GetLanguagedText('errors.resource_not_found'),
                        ToastType.WARNING
                    );
                    break;

                case 422: {
                    const responseData = error.response?.data as Record<string, unknown> | undefined;
                    const validationErrors = responseData?.errors as Record<string, unknown> | undefined;

                    if (validationErrors && Object.keys(validationErrors).length > 0) {
                        const messages = Object.values(validationErrors)
                            .flatMap((item) => (Array.isArray(item) ? item : [item]))
                            .map((item) => String(item))
                            .join(', ');

                        app.ApplicationUIService.showToast(
                            formatText('validation.validation_errors', { messages }),
                            ToastType.ERROR
                        );
                    } else {
                        app.ApplicationUIService.showToast(
                            GetLanguagedText('validation.validation_data_error'),
                            ToastType.ERROR
                        );
                    }
                    break;
                }

                case 500:
                case 502:
                case 503:
                    if (
                        requestConfig &&
                        (requestConfig.__retryCount ?? 0) < app.AppConfiguration.value.apiRetryAttempts
                    ) {
                        requestConfig.__retryCount = (requestConfig.__retryCount ?? 0) + 1;

                        app.ApplicationUIService.showToast(
                            formatText('errors.server_retrying', {
                                current: requestConfig.__retryCount,
                                max: app.AppConfiguration.value.apiRetryAttempts
                            }),
                            ToastType.WARNING
                        );

                        const delay = Math.pow(2, requestConfig.__retryCount) * 1000;
                        await new Promise((resolve) => setTimeout(resolve, delay));
                        return app.axiosInstance.request(requestConfig);
                    }

                    app.ApplicationUIService.showToast(
                        GetLanguagedText('errors.server_error'),
                        ToastType.ERROR
                    );
                    break;

                default:
                    app.ApplicationUIService.showToast(
                        formatText('errors.unexpected_error_with_status', { status }),
                        ToastType.ERROR
                    );
            }

            return Promise.reject(error);
        }
    );
}
