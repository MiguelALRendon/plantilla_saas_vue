import { Language } from '@/enums/language';
import ICONS from '@/constants/icons';

export interface AppConfiguration {
    appName: string;
    appVersion: string;
    squared_app_logo_image: string;
    apiBaseUrl: string;
    apiTimeout: number;
    apiRetryAttempts: number;
    environment: string;
    logLevel: string;
    authTokenKey: string;
    authRefreshTokenKey: string;
    sessionTimeout: number;
    itemsPerPage: number;
    maxFileSize: number;
    isDarkMode: boolean;
    selectedLanguage: Language;
    asyncValidationDebounce: number;
}

/**
 * Builds a fresh AppConfiguration from Vite env vars (falling back to sane defaults).
 * Single source of truth shared by `ApplicationClass`'s pre-Pinia bootstrap ref and
 * `useAppConfigStore` so both never drift out of sync.
 */
export function createDefaultAppConfig(): AppConfiguration {
    return {
        appName: (import.meta.env.VITE_APP_NAME as string) || 'My SaaS Application',
        appVersion: (import.meta.env.VITE_APP_VERSION as string) || '1.0.0',
        squared_app_logo_image: (import.meta.env.VITE_SQUARED_APP_LOGO_IMAGE as string) || ICONS.SQUARED_APP_LOGO,
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
    };
}
