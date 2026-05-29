import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_ALLOW_HEADERS = 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version';

function getCorsHeaders(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': isAllowedOrigin(origin) ? origin : 'null',
    'Access-Control-Allow-Headers': CORS_ALLOW_HEADERS,
  };
}

function getRpIdFromOrigin(origin: string): string {
  try {
    const url = new URL(origin);
    return url.hostname;
  } catch {
    return "focomues-iliad.fr";
  }
}

function isAllowedOrigin(origin: string): boolean {
  if (!origin) return false;
  return (
    origin.includes('localhost') ||
    origin.includes('lovable.app') ||
    origin === 'https://focomues-iliad.fr' ||
    origin.includes('focomues-iliad.fr')
  );
}

function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64UrlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// ── CBOR minimal decoder (WebAuthn-specific structures) ──────────────────────

function decodeCBOR(data: Uint8Array): unknown {
  let offset = 0;

  function readUint(n: number): number {
    let val = 0;
    for (let i = 0; i < n; i++) val = val * 256 + data[offset++];
    return val;
  }

  function decodeItem(): unknown {
    const initial = data[offset++];
    const majorType = initial >> 5;
    const info = initial & 0x1f;
    let length: number;
    if (info < 24) length = info;
    else if (info === 24) length = readUint(1);
    else if (info === 25) length = readUint(2);
    else if (info === 26) length = readUint(4);
    else throw new Error(`Unsupported CBOR additional info: ${info}`);

    switch (majorType) {
      case 0: return length;
      case 1: return -1 - length;
      case 2: { const b = data.slice(offset, offset + length); offset += length; return b; }
      case 3: { const b = data.slice(offset, offset + length); offset += length; return new TextDecoder().decode(b); }
      case 4: { const arr: unknown[] = []; for (let i = 0; i < length; i++) arr.push(decodeItem()); return arr; }
      case 5: { const map = new Map<unknown, unknown>(); for (let i = 0; i < length; i++) { const k = decodeItem(); map.set(k, decodeItem()); } return map; }
      default: throw new Error(`Unsupported CBOR major type: ${majorType}`);
    }
  }
  return decodeItem();
}

function readUint16BE(_buf: Uint8Array, _offset: number): number {
  return (_buf[_offset] << 8) | _buf[_offset + 1];
}

function readUint32BE(buf: Uint8Array, offset: number): number {
  return ((buf[offset] << 24) | (buf[offset + 1] << 16) | (buf[offset + 2] << 8) | buf[offset + 3]) >>> 0;
}

function parseAuthData(authData: Uint8Array): {
  rpIdHash: Uint8Array;
  flags: number;
  signCount: number;
  credentialPublicKey?: Uint8Array;
} {
  const rpIdHash = authData.slice(0, 32);
  const flags = authData[32];
  const signCount = readUint32BE(authData, 33);
  let credentialPublicKey: Uint8Array | undefined;
  if (flags & 0x40) { // AT flag: attested credential data present
    let off = 37 + 16; // skip AAGUID
    const credIdLen = readUint16BE(authData, off); off += 2;
    off += credIdLen; // skip credentialId
    credentialPublicKey = authData.slice(off);
  }
  return { rpIdHash, flags, signCount, credentialPublicKey };
}

async function verifyCOSESignature(
  coseKeyBytes: Uint8Array,
  authenticatorData: Uint8Array,
  clientDataJSONBytes: Uint8Array,
  signatureBytes: Uint8Array,
): Promise<boolean> {
  const coseKey = decodeCBOR(coseKeyBytes) as Map<number, unknown>;
  const alg = coseKey.get(3) as number;

  const clientDataHash = new Uint8Array(
    await crypto.subtle.digest('SHA-256', clientDataJSONBytes)
  );
  const verificationData = new Uint8Array(authenticatorData.length + clientDataHash.length);
  verificationData.set(authenticatorData);
  verificationData.set(clientDataHash, authenticatorData.length);

  if (alg === -7) {
    // ES256 — ECDSA P-256
    const x = coseKey.get(-2) as Uint8Array;
    const y = coseKey.get(-3) as Uint8Array;
    const jwk = {
      kty: 'EC', crv: 'P-256',
      x: base64UrlEncode(x.buffer as ArrayBuffer),
      y: base64UrlEncode(y.buffer as ArrayBuffer),
    };
    const cryptoKey = await crypto.subtle.importKey(
      'jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']
    );
    return crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, cryptoKey, signatureBytes, verificationData);
  }

  if (alg === -257) {
    // RS256 — RSASSA-PKCS1-v1_5
    const n = coseKey.get(-1) as Uint8Array;
    const e = coseKey.get(-2) as Uint8Array;
    const jwk = {
      kty: 'RSA',
      n: base64UrlEncode(n.buffer as ArrayBuffer),
      e: base64UrlEncode(e.buffer as ArrayBuffer),
      alg: 'RS256',
    };
    const cryptoKey = await crypto.subtle.importKey(
      'jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']
    );
    return crypto.subtle.verify({ name: 'RSASSA-PKCS1-v1_5' }, cryptoKey, signatureBytes, verificationData);
  }

  throw new Error(`Algorithme COSE non supporté: ${alg}`);
}

function generateChallenge(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array.buffer);
}

serve(async (req) => {
  const origin = req.headers.get('origin') || 'https://focomues-iliad.fr';

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: getCorsHeaders(origin) });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { action, ...data } = await req.json();
    const rpId = getRpIdFromOrigin(origin);

    console.log(`[webauthn-authenticate] Action: ${action}, Origin: ${origin}, RP_ID: ${rpId}`);

    if (action === 'generate-options') {
      const { email } = data;

      console.log(`[webauthn-authenticate] Generating options, email: ${email || 'none (discoverable)'}`);

      let allowCredentials: { id: string; type: string; transports: string[] }[] = [];
      let userId: string | null = null;

      if (email) {
        const { data: userData, error: userError } = await supabase.auth.admin.listUsers();

        if (userError) {
          console.error('[webauthn-authenticate] Error listing users:', userError);
          return new Response(
            JSON.stringify({ error: "Erreur lors de la recherche de l'utilisateur", details: userError.message }),
            { status: 500, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } }
          );
        }

        const user = userData?.users?.find((u: { email?: string }) => u.email === email);

        if (user) {
          userId = user.id;
          const { data: creds, error: credsError } = await supabase
            .from('passkey_credentials')
            .select('credential_id, transports')
            .eq('user_id', user.id);

          if (credsError) {
            console.error('[webauthn-authenticate] Error fetching credentials:', credsError);
          }

          if (!creds || creds.length === 0) {
            console.log(`[webauthn-authenticate] No passkeys found for user ${email}`);
            return new Response(
              JSON.stringify({ error: 'Aucun passkey trouvé pour cet email. Vérifiez votre adresse ou créez un passkey depuis votre profil.' }),
              { status: 400, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } }
            );
          }

          allowCredentials = creds.map((c: { credential_id: string; transports?: string[] }) => {
            let safeTransports = ['internal', 'usb', 'nfc'];

            if (c.transports && Array.isArray(c.transports) && c.transports.length > 0) {
              safeTransports = c.transports.filter((t: string) =>
                ['internal', 'usb', 'nfc'].includes(t)
              );
              if (safeTransports.length === 0) safeTransports = ['internal'];
            }

            return { id: c.credential_id, type: 'public-key', transports: safeTransports };
          });

          console.log(`[webauthn-authenticate] Found ${allowCredentials.length} credentials for user ${userId}`);
        } else {
          console.log(`[webauthn-authenticate] No user found with email: ${email}`);
          return new Response(
            JSON.stringify({ error: 'Aucun passkey trouvé pour cet email. Vérifiez votre adresse ou créez un passkey depuis votre profil.' }),
            { status: 400, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } }
          );
        }
      } else {
        console.log('[webauthn-authenticate] Using discoverable credentials (no email provided)');
      }

      const challenge = generateChallenge();

      const { error: challengeInsertError } = await supabase.from('webauthn_challenges').insert({
        challenge,
        user_id: userId,
        email: email || null,
        type: 'authentication',
      });

      if (challengeInsertError) {
        console.error('[webauthn-authenticate] Error storing challenge:', challengeInsertError);
        return new Response(
          JSON.stringify({ error: 'Erreur lors de la création du challenge', details: challengeInsertError.message }),
          { status: 500, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } }
        );
      }

      const options = {
        challenge,
        timeout: 60000,
        rpId,
        userVerification: 'preferred',
        ...(allowCredentials.length > 0 && { allowCredentials }),
      };

      return new Response(
        JSON.stringify({ options, rpId }),
        { headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'verify-authentication') {
      const { credential, email } = data;

      if (!credential || !credential.response) {
        return new Response(
          JSON.stringify({ error: 'Credential invalide' }),
          { status: 400, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } }
        );
      }

      console.log(`[webauthn-authenticate] Verifying credential ID: ${credential.id}`);

      const { data: storedCredential, error: credError } = await supabase
        .from('passkey_credentials')
        .select('*, user_id')
        .eq('credential_id', credential.id)
        .single();

      if (credError || !storedCredential) {
        console.error('[webauthn-authenticate] Credential not found:', credError);
        return new Response(
          JSON.stringify({ error: 'Passkey non reconnu. Vérifiez que vous utilisez le bon appareil.' }),
          { status: 400, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } }
        );
      }

      // CRIT-3 : lier le challenge à l'utilisateur du credential
      const { data: challengeData, error: challengeError } = await supabase
        .from('webauthn_challenges')
        .select('*')
        .eq('type', 'authentication')
        .or(`user_id.eq.${storedCredential.user_id},user_id.is.null`)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (challengeError || !challengeData) {
        console.error('[webauthn-authenticate] Challenge error:', challengeError);
        return new Response(
          JSON.stringify({ error: 'Challenge expiré ou invalide. Veuillez réessayer.' }),
          { status: 400, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } }
        );
      }

      // Vérifier clientDataJSON
      const clientDataJSONBytes = base64UrlDecode(credential.response.clientDataJSON);
      const clientDataJSON = JSON.parse(new TextDecoder().decode(clientDataJSONBytes));

      if (clientDataJSON.challenge !== challengeData.challenge) {
        return new Response(
          JSON.stringify({ error: 'Challenge mismatch' }),
          { status: 400, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } }
        );
      }

      if (!isAllowedOrigin(clientDataJSON.origin)) {
        console.error(`[webauthn-authenticate] Origin not allowed: ${clientDataJSON.origin}`);
        return new Response(
          JSON.stringify({ error: 'Origine non autorisée' }),
          { status: 400, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } }
        );
      }

      if (clientDataJSON.type !== 'webauthn.get') {
        return new Response(
          JSON.stringify({ error: 'Type de cérémonie incorrecte' }),
          { status: 400, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } }
        );
      }

      // Parser authenticatorData
      const authDataBytes = base64UrlDecode(credential.response.authenticatorData);
      if (authDataBytes.length < 37) {
        return new Response(
          JSON.stringify({ error: 'authenticatorData trop court' }),
          { status: 400, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } }
        );
      }

      // Vérifier rpIdHash
      const expectedRpIdHashBuf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(rpId));
      const expectedRpIdHash = new Uint8Array(expectedRpIdHashBuf);
      const actualRpIdHash = authDataBytes.slice(0, 32);
      if (!actualRpIdHash.every((b, i) => b === expectedRpIdHash[i])) {
        return new Response(
          JSON.stringify({ error: 'rpIdHash invalide' }),
          { status: 400, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } }
        );
      }

      // CRIT-2 : vérifier le compteur
      const assertionSignCount = readUint32BE(authDataBytes, 33);
      if (storedCredential.counter > 0 && assertionSignCount <= storedCredential.counter) {
        console.error(`[webauthn-authenticate] Counter check failed: stored=${storedCredential.counter} received=${assertionSignCount}`);
        return new Response(
          JSON.stringify({ error: 'Compteur de signature invalide — authenticateur possiblement cloné' }),
          { status: 400, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } }
        );
      }

      // CRIT-1 : vérifier la signature cryptographique si la clé est au format COSE
      if (storedCredential.public_key_format === 'cose') {
        const coseKeyBytes = base64UrlDecode(storedCredential.public_key);
        const signatureBytes = base64UrlDecode(credential.response.signature);
        const valid = await verifyCOSESignature(coseKeyBytes, authDataBytes, clientDataJSONBytes, signatureBytes);
        if (!valid) {
          console.error('[webauthn-authenticate] Signature verification failed');
          return new Response(
            JSON.stringify({ error: 'Signature WebAuthn invalide' }),
            { status: 400, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } }
          );
        }
        console.log('[webauthn-authenticate] Signature cryptographique vérifiée avec succès');
      } else {
        console.warn('[webauthn-authenticate] Credential legacy (format attestation_object) — signature non vérifiée, demander ré-enregistrement');
      }

      const newCounter = assertionSignCount > 0 ? assertionSignCount : (storedCredential.counter || 0) + 1;
      await supabase
        .from('passkey_credentials')
        .update({ counter: newCounter, last_used_at: new Date().toISOString() })
        .eq('id', storedCredential.id);

      await supabase.from('webauthn_challenges').delete().eq('id', challengeData.id);

      const { data: userData } = await supabase.auth.admin.getUserById(storedCredential.user_id);

      if (!userData?.user) {
        return new Response(
          JSON.stringify({ error: 'Utilisateur non trouvé' }),
          { status: 400, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } }
        );
      }

      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: userData.user.email!,
        options: { redirectTo: origin },
      });

      if (linkError || !linkData?.properties?.hashed_token) {
        console.error('[webauthn-authenticate] Link generation error:', linkError);
        return new Response(
          JSON.stringify({ error: 'Erreur de génération du lien de connexion' }),
          { status: 500, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } }
        );
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('user_id', storedCredential.user_id)
        .single();

      console.log(`[webauthn-authenticate] Authentication successful for user: ${userData.user.email}`);

      return new Response(
        JSON.stringify({
          success: true,
          linkData,
          user: {
            id: userData.user.id,
            email: userData.user.email,
            first_name: profile?.first_name,
            last_name: profile?.last_name,
          },
        }),
        { headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Action non reconnue' }),
      { status: 400, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[webauthn-authenticate] Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur interne du serveur';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } }
    );
  }
});
