import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { AppConfiguration } from '@/models/app_configuration';
import { createDefaultAppConfig } from '@/models/app_configuration';

/**
 * Pinia store backing Application.AppConfiguration.
 * Exposes all AppConfiguration fields as reactive state visible in Vue DevTools.
 */
export const useAppConfigStore = defineStore('appConfig', () => {
    const config = ref<AppConfiguration>(createDefaultAppConfig());

    return { config };
});
