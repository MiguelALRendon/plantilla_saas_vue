import { defineStore } from 'pinia';
import { ref } from 'vue';

import { Language } from '@/enums/language';
import type { AppConfiguration } from '@/models/app_configuration';

/**
 * Pinia store backing Application.AppConfiguration.
 * Exposes all AppConfiguration fields as reactive state visible in Vue DevTools.
 */
export const useAppConfigStore = defineStore('appConfig', () => {
    const config = ref<AppConfiguration & { asyncValidationDebounce: number }>({
        appName: (import.meta.env.VITE_APP_NAME as string) || 'My SaaS Application',
        appVersion: (import.meta.env.VITE_APP_VERSION as string) || '1.0.0',
        apiBaseUrl: (import.meta.env.VITE_API_BASE_URL as string) || 'https://api.my-saas-app.com',
        apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
        apiRetryAttempts: Number(import.meta.env.VITE_API_RETRY_ATTEMPTS) || 3,
        environment: (import.meta.env.VITE_ENVIRONMENT as string) || 'development',
        logLevel: (import.meta.env.VITE_LOG_LEVEL as string) || 'info',
        authTokenKey: (import.meta.env.VITE_AUTH_TOKEN_KEY as string) || 'auth_token',
        authRefreshTokenKey: (import.meta.env.VITE_AUTH_REFRESH_TOKEN_KEY as string) || 'refresh_token',
        sessionTimeout: Number(import.meta.env.VITE_SESSION_TIMEOUT) || 3600000,
        itemsPerPage: Number(import.meta.env.VITE_ITEMS_PER_PAGE) || 20,
        maxFileSize: Number(import.meta.env.VITE_MAX_FILE_SIZE) || 5242880,
        isDarkMode: false,
        selectedLanguage: (Number(import.meta.env.VITE_SELECTED_LANGUAGE) as Language) || Language.EN,
        asyncValidationDebounce: Number(import.meta.env.VITE_ASYNC_VALIDATION_DEBOUNCE) || 300,
    });

    return { config };
});
