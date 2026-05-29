import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const isWebAuthnSupported = (): boolean =>
  typeof window !== 'undefined' && !!window.PublicKeyCredential;

export const isPlatformAuthenticatorAvailable = async (): Promise<boolean> => {
  if (!isWebAuthnSupported()) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
};

function base64urlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
  const binary = atob(padded);
  const buffer = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) view[i] = binary.charCodeAt(i);
  return buffer;
}

function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let str = '';
  bytes.forEach(b => { str += String.fromCharCode(b); });
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

interface UseWebAuthnReturn {
  isLoading: boolean;
  error: string | null;
  authenticateWithPasskey: (email?: string) => Promise<{ success: boolean; linkData?: unknown; user?: { first_name?: string; last_name?: string; email?: string } }>;
  registerPasskey: (friendlyName?: string) => Promise<{ success: boolean }>;
  checkPlatformAuthenticator: () => Promise<boolean>;
}

export const useWebAuthn = (): UseWebAuthnReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authenticateWithPasskey = async (email?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Phase 1 : obtenir le challenge et les options
      const { data: resp, error: optErr } = await supabase.functions.invoke(
        'webauthn-authenticate',
        { body: { action: 'generate-options', email } }
      );
      if (optErr) throw new Error(optErr.message);
      if (resp?.error) throw new Error(resp.error);

      const { options } = resp as {
        options: {
          challenge: string;
          allowCredentials?: { id: string; type: string; transports?: string[] }[];
          timeout?: number;
          rpId?: string;
          userVerification?: string;
        };
        rpId: string;
      };

      // Convertir challenge et allowCredentials en ArrayBuffer
      const publicKeyOptions: PublicKeyCredentialRequestOptions = {
        challenge: base64urlToBuffer(options.challenge),
        timeout: options.timeout ?? 60000,
        rpId: options.rpId,
        userVerification: (options.userVerification as UserVerificationRequirement) ?? 'preferred',
        allowCredentials: (options.allowCredentials ?? []).map(c => ({
          id: base64urlToBuffer(c.id),
          type: 'public-key' as const,
          transports: (c.transports ?? []) as AuthenticatorTransport[],
        })),
      };

      const assertion = await navigator.credentials.get({ publicKey: publicKeyOptions }) as PublicKeyCredential;
      if (!assertion) throw new Error('Authentification annulée');

      const response = assertion.response as AuthenticatorAssertionResponse;
      const credentialJSON = {
        id: assertion.id,
        rawId: bufferToBase64url(assertion.rawId),
        type: assertion.type,
        response: {
          authenticatorData: bufferToBase64url(response.authenticatorData),
          clientDataJSON: bufferToBase64url(response.clientDataJSON),
          signature: bufferToBase64url(response.signature),
          userHandle: response.userHandle ? bufferToBase64url(response.userHandle) : null,
        },
      };

      // Phase 2 : vérifier
      const { data: verifyData, error: verifyErr } = await supabase.functions.invoke(
        'webauthn-authenticate',
        { body: { action: 'verify-authentication', credential: credentialJSON, email } }
      );
      if (verifyErr) throw new Error(verifyErr.message);
      if (verifyData?.error) throw new Error(verifyData.error);

      return { success: true, linkData: verifyData.linkData, user: verifyData.user };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur passkey';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const registerPasskey = async (friendlyName?: string, authenticatorType?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Récupérer l'utilisateur courant pour transmettre userId + email
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('Non connecté');

      const { data: resp, error: optErr } = await supabase.functions.invoke(
        'webauthn-register',
        {
          body: {
            action: 'generate-options',
            email: currentUser.email,
            userId: currentUser.id,
            authenticatorType,
          },
        }
      );
      if (optErr) throw new Error(optErr.message);
      if (resp?.error) throw new Error(resp.error);

      const { options } = resp as {
        options: {
          challenge: string;
          user: { id: string };
          excludeCredentials?: { id: string }[];
        };
        rpId: string;
      };

      const publicKeyOptions: PublicKeyCredentialCreationOptions = {
        ...(options as unknown as PublicKeyCredentialCreationOptions),
        challenge: base64urlToBuffer(options.challenge),
        user: {
          ...(options.user as unknown as PublicKeyCredentialUserEntity),
          id: base64urlToBuffer(options.user.id),
        },
        excludeCredentials: (options.excludeCredentials ?? []).map(c => ({
          id: base64urlToBuffer(c.id),
          type: 'public-key' as const,
        })),
      };

      const credential = await navigator.credentials.create({ publicKey: publicKeyOptions }) as PublicKeyCredential;
      if (!credential) throw new Error('Création annulée');

      const response = credential.response as AuthenticatorAttestationResponse;
      const credentialJSON = {
        id: credential.id,
        rawId: bufferToBase64url(credential.rawId),
        type: credential.type,
        authenticatorAttachment: credential.authenticatorAttachment,
        response: {
          attestationObject: bufferToBase64url(response.attestationObject),
          clientDataJSON: bufferToBase64url(response.clientDataJSON),
          transports: response.getTransports ? response.getTransports() : [],
        },
      };

      const { data: verifyData, error: verifyErr } = await supabase.functions.invoke(
        'webauthn-register',
        {
          body: {
            action: 'verify-registration',
            credential: credentialJSON,
            email: currentUser.email,
            userId: currentUser.id,
            friendlyName,
          },
        }
      );
      if (verifyErr) throw new Error(verifyErr.message);
      if (verifyData?.error) throw new Error(verifyData.error);

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur enregistrement passkey';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const checkPlatformAuthenticator = () => isPlatformAuthenticatorAvailable();

  return { isLoading, error, authenticateWithPasskey, registerPasskey, checkPlatformAuthenticator };
};
