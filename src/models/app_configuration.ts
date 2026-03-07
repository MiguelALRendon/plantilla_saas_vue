import { Language } from '@/enums/language';

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
