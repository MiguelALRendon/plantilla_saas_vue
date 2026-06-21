import { test, expect } from '@playwright/test';

/**
 * CRUD E2E autenticado. Requiere el backend `saas-api` (http://localhost:8200) y credenciales.
 * Se OMITE salvo que se definan las variables de entorno E2E_USER y E2E_PASS.
 * Selectores estables: data-testid="data-table" | "btn-new" | "input-<propertyKey>" | "login-*".
 *
 * Ejemplo:
 *   E2E_USER=admin E2E_PASS=secreto E2E_MODULE=capitulo npm run test:e2e
 */
const user = process.env.E2E_USER;
const pass = process.env.E2E_PASS;
const moduleName = process.env.E2E_MODULE ?? 'capitulo';

test.describe('CRUD autenticado', () => {
    test.skip(!user || !pass, 'Define E2E_USER y E2E_PASS (y levanta saas-api) para correr este flujo.');

    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.getByTestId('input-usuario').fill(user as string);
        await page.getByTestId('input-contraseña').fill(pass as string);
        await page.getByTestId('login-submit').click();
        await expect(page).not.toHaveURL(/\/login/);
    });

    test('lista el módulo y abre el formulario de alta', async ({ page }) => {
        await page.goto(`/${moduleName}`);
        await expect(page.getByTestId('data-table')).toBeVisible();
        await page.getByTestId('btn-new').click();
        await expect(page).toHaveURL(new RegExp(`/${moduleName}/new`));
    });
});
