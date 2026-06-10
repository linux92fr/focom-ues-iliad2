import { test, expect } from '@playwright/test';

// La modal d'authentification utilise une connexion sans mot de passe
// (passkey + lien magique par email). Elle n'a plus d'onglets
// Connexion/Inscription, de champs mot de passe ni de connexion via
// réseaux sociaux. Les tests ci-dessous reflètent cette UI.

test.describe('Modal d\'authentification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/espace-adherent');
    await page.waitForLoadState('domcontentloaded');
    await page.getByRole('button', { name: /Se connecter/i }).click({ timeout: 10000 });
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10000 });
  });

  test('affiche le titre Espace Adhérent', async ({ page }) => {
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Espace Adhérent')).toBeVisible({ timeout: 10000 });
  });

  test('met en avant l\'authentification sans mot de passe', async ({ page }) => {
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText(/sans mot de passe/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('affiche le champ email et le bouton de lien de connexion', async ({ page }) => {
    const dialog = page.getByRole('dialog');
    await expect(dialog.locator('#auth-email')).toBeVisible({ timeout: 10000 });
    await expect(dialog.getByRole('button', { name: /Recevoir un lien de connexion/i })).toBeVisible({ timeout: 10000 });
  });

  test('affiche le champ prénom et nom (première inscription)', async ({ page }) => {
    const dialog = page.getByRole('dialog');
    await expect(dialog.locator('#auth-name')).toBeVisible({ timeout: 10000 });
  });

  test('le champ email est de type email et requis', async ({ page }) => {
    const dialog = page.getByRole('dialog');
    const email = dialog.locator('#auth-email');
    await expect(email).toHaveAttribute('type', 'email', { timeout: 10000 });
    await expect(email).toHaveAttribute('required', '', { timeout: 10000 });
  });
});
