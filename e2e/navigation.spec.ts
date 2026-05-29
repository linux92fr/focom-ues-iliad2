import { test, expect } from '@playwright/test';

test.describe('Navigation publique', () => {
  test('page accueil charge correctement', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/FO Com/i);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('page /espace-adherent affiche le CTA de connexion si non connecté', async ({ page }) => {
    await page.goto('/espace-adherent');
    const loginBtn = page.getByRole('button', { name: /Se connecter/i });
    await expect(loginBtn).toBeVisible({ timeout: 8000 });
  });

  test('clic sur "Se connecter" ouvre la modal auth', async ({ page }) => {
    await page.goto('/espace-adherent');
    await page.getByRole('button', { name: /Se connecter/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/Espace Adhérent/i)).toBeVisible();
  });

  test('page FAQ accessible sans connexion', async ({ page }) => {
    await page.goto('/faq');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('page /profil redirige vers accueil si non connecté', async ({ page }) => {
    await page.goto('/profil');
    await page.waitForURL('/', { timeout: 8000 });
    await expect(page).toHaveURL('/');
  });
});
