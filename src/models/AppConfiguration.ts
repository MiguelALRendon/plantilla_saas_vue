export interface AppConfiguration {
    appName: string;
    appVersion: string;
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
}