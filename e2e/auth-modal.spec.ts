import { test, expect } from '@playwright/test';

test.describe('Modal d\'authentification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/espace-adherent');
    await page.getByRole('button', { name: /Se connecter/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('affiche les onglets Connexion et Inscription', async ({ page }) => {
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('tab', { name: /Connexion/i })).toBeVisible();
    await expect(dialog.getByRole('tab', { name: /Inscription/i })).toBeVisible();
  });

  test('affiche les champs email et mot de passe dans l\'onglet Connexion', async ({ page }) => {
    const dialog = page.getByRole('dialog');
    await expect(dialog.locator('#login-email')).toBeVisible();
    await expect(dialog.locator('#login-password')).toBeVisible();
  });

  test('onglet Inscription affiche les champs requis', async ({ page }) => {
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('tab', { name: /Inscription/i }).click();
    await expect(dialog.locator('#signup-name')).toBeVisible();
    await expect(dialog.locator('#signup-email')).toBeVisible();
  });

  test('inscription rejette un mot de passe trop court', async ({ page }) => {
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('tab', { name: /Inscription/i }).click();
    const pwInput = dialog.locator('#signup-password');
    await expect(pwInput).toHaveAttribute('minlength', '12');
  });

  test('bouton "Continuer avec Facebook" visible', async ({ page }) => {
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('button', { name: /Facebook/i })).toBeVisible();
  });
});
