import { test, expect } from '@playwright/test';

test.describe('Espace admin — protection des routes', () => {
  test('/admin redirige vers /admin/login si non connecté', async ({ page }) => {
    await page.goto('/admin');
    // AdminAuthGuard ou AdminDashboard doit rediriger
    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 8000 });
  });

  test('/admin/actualites redirige vers /admin/login si non connecté', async ({ page }) => {
    await page.goto('/admin/actualites');
    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 8000 });
  });

  test('/admin/adherents redirige vers /admin/login si non connecté', async ({ page }) => {
    await page.goto('/admin/adherents');
    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 8000 });
  });

  test('page /admin/login affiche le formulaire de connexion admin', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.getByRole('heading', { name: /admin/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });
});
