/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_NAME: string;
    readonly VITE_APP_VERSION: string;
    readonly VITE_API_BASE_URL: string;
    readonly VITE_API_TIMEOUT: string;
    readonly VITE_API_RETRY_ATTEMPTS: string;
    readonly VITE_ENVIRONMENT: string;
    readonly VITE_LOG_LEVEL: string;
    readonly VITE_AUTH_TOKEN_KEY: string;
    readonly VITE_AUTH_REFRESH_TOKEN_KEY: string;
    readonly VITE_SESSION_TIMEOUT: string;
    readonly VITE_ITEMS_PER_PAGE: string;
    readonly VITE_MAX_FILE_SIZE: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

declare module '*.vue' {
    import type { DefineComponent } from 'vue';
    const component: DefineComponent<{}, {}, any>;
    export default component;
}
