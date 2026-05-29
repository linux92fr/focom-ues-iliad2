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
  authenticateWithPasskey: (email?: string) => Promise<{ success: boolean; linkData?: any; user?: any }>;
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
      const { data: optionsData, error: optionsError } = await supabase.functions.invoke(
        'webauthn-authenticate',
        { body: { action: 'generate-options', email } }
      );
      if (optionsError) throw new Error(optionsError.message);

      const { challengeId, ...credentialRequestOptions } = optionsData;

      // Convert base64url strings to ArrayBuffers
      const publicKeyOptions: PublicKeyCredentialRequestOptions = {
        ...credentialRequestOptions,
        challenge: base64urlToBuffer(credentialRequestOptions.challenge),
        allowCredentials: (credentialRequestOptions.allowCredentials || []).map((c: any) => ({
          ...c,
          id: base64urlToBuffer(c.id),
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

      const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
        'webauthn-authenticate',
        { body: { action: 'verify', credential: credentialJSON, challengeId } }
      );
      if (verifyError) throw new Error(verifyError.message);
      if (verifyData?.error) throw new Error(verifyData.error);

      return { success: true, linkData: verifyData.linkData, user: verifyData.user };
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const registerPasskey = async (friendlyName?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: optionsData, error: optionsError } = await supabase.functions.invoke(
        'webauthn-register',
        { body: { action: 'generate-options', friendlyName } }
      );
      if (optionsError) throw new Error(optionsError.message);

      const { challengeId, ...registrationOptions } = optionsData;

      const publicKeyOptions: PublicKeyCredentialCreationOptions = {
        ...registrationOptions,
        challenge: base64urlToBuffer(registrationOptions.challenge),
        user: {
          ...registrationOptions.user,
          id: base64urlToBuffer(registrationOptions.user.id),
        },
        excludeCredentials: (registrationOptions.excludeCredentials || []).map((c: any) => ({
          ...c,
          id: base64urlToBuffer(c.id),
        })),
      };

      const credential = await navigator.credentials.create({ publicKey: publicKeyOptions }) as PublicKeyCredential;
      if (!credential) throw new Error('Création annulée');

      const response = credential.response as AuthenticatorAttestationResponse;
      const credentialJSON = {
        id: credential.id,
        rawId: bufferToBase64url(credential.rawId),
        type: credential.type,
        response: {
          attestationObject: bufferToBase64url(response.attestationObject),
          clientDataJSON: bufferToBase64url(response.clientDataJSON),
        },
      };

      const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
        'webauthn-register',
        { body: { action: 'verify', credential: credentialJSON, challengeId, friendlyName } }
      );
      if (verifyError) throw new Error(verifyError.message);
      if (verifyData?.error) throw new Error(verifyData.error);

      return { success: true };
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const checkPlatformAuthenticator = () => isPlatformAuthenticatorAvailable();

  return { isLoading, error, authenticateWithPasskey, registerPasskey, checkPlatformAuthenticator };
};
