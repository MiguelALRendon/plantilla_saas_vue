import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración E2E de Playwright para la app SaaS Vue.
 * - Levanta el dev server (Vite) automáticamente en http://localhost:5173.
 * - Para flujos CRUD reales, el backend `saas-api` debe correr en http://localhost:8200.
 * Activar: `npm install` && `npx playwright install chromium`. Correr: `npm run test:e2e`.
 */
export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    reporter: 'html',
    use: {
        baseURL: 'http://localhost:5173',
        trace: 'on-first-retry',
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    ],
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:5173',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
    },
});
