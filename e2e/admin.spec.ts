import { test, expect } from '@playwright/test';

test.describe('Espace admin — protection des routes', () => {
  test('/admin redirige vers /admin/login si non connecté', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForURL(/\/admin\/login/, { timeout: 8000 });
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('/admin/actualites redirige vers /admin/login si non connecté', async ({ page }) => {
    await page.goto('/admin/actualites');
    await page.waitForURL(/\/admin\/login/, { timeout: 8000 });
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('/admin/adherents redirige vers /admin/login si non connecté', async ({ page }) => {
    await page.goto('/admin/adherents');
    await page.waitForURL(/\/admin\/login/, { timeout: 8000 });
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('page /admin/login affiche le formulaire de connexion admin', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.locator('h1, h2').first()).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });
});
