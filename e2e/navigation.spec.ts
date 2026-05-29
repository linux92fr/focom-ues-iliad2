import { test, expect } from '@playwright/test';

test.describe('Navigation publique', () => {
  test('page accueil charge correctement', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveTitle(/FO Com/i, { timeout: 10000 });
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('page /espace-adherent affiche le CTA de connexion si non connecté', async ({ page }) => {
    await page.goto('/espace-adherent');
    await page.waitForLoadState('domcontentloaded');
    const loginBtn = page.getByRole('button', { name: /Se connecter/i });
    await expect(loginBtn).toBeVisible({ timeout: 10000 });
  });

  test('clic sur "Se connecter" ouvre la modal auth', async ({ page }) => {
    await page.goto('/espace-adherent');
    await page.waitForLoadState('domcontentloaded');
    await page.getByRole('button', { name: /Se connecter/i }).click({ timeout: 10000 });
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Espace Adhérent/i)).toBeVisible({ timeout: 10000 });
  });

  test('page FAQ accessible sans connexion', async ({ page }) => {
    await page.goto('/faq');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('page /profil redirige vers accueil si non connecté', async ({ page }) => {
    await page.goto('/profil');
    await page.waitForURL('/', { timeout: 10000 });
    await expect(page).toHaveURL('/');
  });
});
