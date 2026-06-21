import { test, expect } from '@playwright/test';

/**
 * Smoke E2E del login. Solo-UI (no requiere backend):
 * valida el guard de rutas y el render del formulario generado desde los
 * metadatos de la entidad User, vía los selectores `data-testid` estables.
 */
test.describe('Login (solo-UI)', () => {
    test('redirige a /login cuando no hay sesión', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveURL(/\/login/);
    });

    test('el formulario de login se renderiza desde los metadatos de User', async ({ page }) => {
        await page.goto('/login');
        await expect(page.getByTestId('login-form')).toBeVisible();
        await expect(page.getByTestId('input-usuario')).toBeVisible();
        await expect(page.getByTestId('input-contraseña')).toBeVisible();
        await expect(page.getByTestId('login-submit')).toBeVisible();
    });
});
