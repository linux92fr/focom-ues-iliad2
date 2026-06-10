import { test, expect } from '@playwright/test';

test.describe('Espace admin — protection des routes', () => {
  test('/admin redirige vers /admin/login si non connecté', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForURL(/\/admin\/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('/admin/actualites redirige vers /admin/login si non connecté', async ({ page }) => {
    await page.goto('/admin/actualites');
    await page.waitForURL(/\/admin\/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('/admin/adherents redirige vers /admin/login si non connecté', async ({ page }) => {
    await page.goto('/admin/adherents');
    await page.waitForURL(/\/admin\/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('page /admin/login affiche le formulaire de connexion admin', async ({ page }) => {
    await page.goto('/admin/login');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByRole('heading', { name: /FOCOM UES ILIAD/i })).toBeVisible({ timeout: 10000 });

    // La connexion par identifiants est un accès de secours : si une passkey
    // est disponible, le formulaire est masqué derrière un bouton à déplier.
    const userInput = page.getByPlaceholder(/Nom d'utilisateur ou email/i);
    if (!(await userInput.isVisible())) {
      await page.getByRole('button', { name: /Accès de secours|Connexion par identifiants/i }).click();
    }
    await expect(userInput).toBeVisible({ timeout: 10000 });
    await expect(page.getByPlaceholder(/Mot de passe/i)).toBeVisible({ timeout: 10000 });
  });
});
