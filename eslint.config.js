import pluginVue from 'eslint-plugin-vue';
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';

/**
 * ESLint flat config (ESLint 9 + vue-ts). Refuerza las reglas duras del proyecto.
 * `no-explicit-any` es error (los hooks del plugin además lo bloquean en edición).
 * El resto del backlog legacy queda como warning para no romper CI; se irá limpiando.
 */
export default defineConfigWithVueTs(
    {
        name: 'app/files',
        files: ['src/**/*.{ts,vue}', 'tests/unit/**/*.ts'],
    },
    {
        name: 'app/ignores',
        ignores: ['dist/**', 'coverage/**', 'docs/**', 'claude-plugin/**', 'tests/e2e/**'],
    },
    pluginVue.configs['flat/essential'],
    vueTsConfigs.recommended,
    {
        name: 'app/rules',
        rules: {
            // Regla dura del proyecto: prohibido `any` (los hooks del plugin además lo bloquean).
            '@typescript-eslint/no-explicit-any': 'error',
            // Backlog legacy: visible como warning para no romper CI; limpieza progresiva.
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            '@typescript-eslint/no-unsafe-function-type': 'warn',
            '@typescript-eslint/no-empty-object-type': 'warn',
            'prefer-const': 'warn',
            'vue/valid-v-for': 'warn',
            'vue/require-v-for-key': 'warn',
            'vue/valid-v-on': 'warn',
            'vue/no-side-effects-in-computed-properties': 'warn',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
            ],
        },
    },
);
