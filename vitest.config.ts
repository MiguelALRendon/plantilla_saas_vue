import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

/**
 * Configuración de Vitest (tests unitarios). Reusa el plugin de Vue y el alias `@`.
 * Los tests E2E (Playwright) viven en tests/e2e y se excluyen de aquí.
 */
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    test: {
        environment: 'jsdom',
        globals: true,
        include: ['tests/unit/**/*.spec.ts'],
    },
});
