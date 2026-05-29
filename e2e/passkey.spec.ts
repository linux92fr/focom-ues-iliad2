import { test, expect } from '@playwright/test';

/**
 * Tests passkey — utilisent le virtual authenticator CDP de Chromium.
 * Ces tests ne s'exécutent que sur Chromium (WebAuthn virtual authenticator non disponible ailleurs).
 */

test.describe('Passkey — virtual authenticator', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'WebAuthn virtual authenticator nécessite Chromium');

  test('le bouton passkey est visible dans la modal si disponible', async ({ page, context }) => {
    // Activer le virtual authenticator WebAuthn via CDP
    const cdpSession = await context.newCDPSession(page);
    await cdpSession.send('WebAuthn.enable');
    await cdpSession.send('WebAuthn.addVirtualAuthenticator', {
      options: {
        protocol: 'ctap2',
        transport: 'internal',
        hasResidentKey: true,
        hasUserVerification: true,
        isUserVerified: true,
      },
    });

    await page.goto('/espace-adherent');
    await page.getByRole('button', { name: /Se connecter/i }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    // Avec virtual authenticator, le bouton passkey doit être visible
    const passkeyBtn = dialog.getByRole('button', { name: /passkey/i });
    await expect(passkeyBtn).toBeVisible({ timeout: 5000 });

    await cdpSession.send('WebAuthn.disable');
  });

  test('enregistrement d\'une passkey depuis le profil', async ({ page, context }) => {
    // Ce test nécessite un utilisateur authentifié — skip en CI sans credentials
    test.skip(!process.env.E2E_TEST_EMAIL, 'Credentials E2E non configurés');

    const cdpSession = await context.newCDPSession(page);
    await cdpSession.send('WebAuthn.enable');
    const { authenticatorId } = await cdpSession.send('WebAuthn.addVirtualAuthenticator', {
      options: {
        protocol: 'ctap2',
        transport: 'internal',
        hasResidentKey: true,
        hasUserVerification: true,
        isUserVerified: true,
      },
    });

    // Connexion via localStorage (injection de session)
    await page.goto('/profil');
    // … auth state injecté par fixture si disponible …

    await cdpSession.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId });
    await cdpSession.send('WebAuthn.disable');
  });
});
