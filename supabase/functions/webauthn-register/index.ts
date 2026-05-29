import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const RP_NAME = "FOCOM UES ILIAD";

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

function generateChallenge(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array.buffer);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { action, ...data } = await req.json();

    const origin = req.headers.get('origin') || data.origin || 'https://focomues-iliad.fr';
    const rpId = getRpIdFromOrigin(origin);

    console.log(`[webauthn-register] Action: ${action}, Origin: ${origin}, RP_ID: ${rpId}`);

    if (action === 'generate-options') {
      const { email, userId, authenticatorType } = data;

      console.log(`[webauthn-register] Generate options for userId: ${userId}, email: ${email}`);

      if (!email && !userId) {
        return new Response(
          JSON.stringify({ error: 'Email ou userId requis' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      let existingCredentials: string[] = [];
      if (userId) {
        const { data: creds } = await supabase
          .from('passkey_credentials')
          .select('credential_id')
          .eq('user_id', userId);
        existingCredentials = creds?.map((c: { credential_id: string }) => c.credential_id) || [];
        console.log(`[webauthn-register] Found ${existingCredentials.length} existing credentials`);
      }

      const challenge = generateChallenge();

      const { error: challengeError } = await supabase.from('webauthn_challenges').insert({
        challenge,
        user_id: userId || null,
        email: email || null,
        type: 'registration',
      });

      if (challengeError) {
        console.error('[webauthn-register] Challenge insert error:', challengeError);
      }

      const userHandle = userId || crypto.randomUUID();

      const authenticatorSelection: Record<string, unknown> = {
        residentKey: 'preferred',
        userVerification: 'preferred',
        requireResidentKey: false,
      };

      let allowedTransports: string[] = [];

      if (authenticatorType === 'platform') {
        authenticatorSelection.authenticatorAttachment = 'platform';
        allowedTransports = ['internal'];
      } else if (authenticatorType === 'cross-platform') {
        authenticatorSelection.authenticatorAttachment = 'cross-platform';
        allowedTransports = ['usb', 'nfc'];
      } else {
        allowedTransports = ['internal', 'usb', 'nfc'];
      }

      const options = {
        challenge,
        rp: { name: RP_NAME, id: rpId },
        user: {
          id: base64UrlEncode(new TextEncoder().encode(userHandle).buffer as ArrayBuffer),
          name: email,
          displayName: email,
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },
          { alg: -257, type: 'public-key' },
        ],
        timeout: 60000,
        attestation: 'none',
        excludeCredentials: existingCredentials.map(id => ({
          id,
          type: 'public-key',
          transports: allowedTransports,
        })),
        authenticatorSelection,
      };

      console.log('[webauthn-register] Options generated successfully');

      return new Response(
        JSON.stringify({ options, rpId }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'verify-registration') {
      console.log('[webauthn-register] Starting verify-registration');

      const { credential, email, userId, friendlyName } = data;

      if (!credential || !credential.response) {
        return new Response(
          JSON.stringify({ error: 'Credential invalide - données manquantes' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!credential.id || !credential.response.clientDataJSON || !credential.response.attestationObject) {
        return new Response(
          JSON.stringify({ error: 'Credential incomplet - champs manquants' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: challengeData, error: challengeError } = await supabase
        .from('webauthn_challenges')
        .select('*')
        .eq('type', 'registration')
        .or(`user_id.eq.${userId},email.eq.${email}`)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (challengeError || !challengeData) {
        console.error('[webauthn-register] Challenge error:', challengeError);
        return new Response(
          JSON.stringify({ error: 'Challenge expiré ou invalide' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      try {
        const clientDataJSON = JSON.parse(
          new TextDecoder().decode(base64UrlDecode(credential.response.clientDataJSON))
        );

        if (clientDataJSON.challenge !== challengeData.challenge) {
          return new Response(
            JSON.stringify({ error: 'Challenge mismatch' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (!isAllowedOrigin(clientDataJSON.origin)) {
          console.error(`[webauthn-register] Origin not allowed: ${clientDataJSON.origin}`);
          return new Response(
            JSON.stringify({ error: 'Origin non autorisée' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (decodeError: unknown) {
        console.error('[webauthn-register] Error decoding clientDataJSON:', decodeError);
        return new Response(
          JSON.stringify({ error: 'Erreur de décodage des données client' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      let finalUserId = userId;

      if (!finalUserId && email) {
        const { data: userData } = await supabase.auth.admin.listUsers();
        const user = userData?.users?.find((u: { email?: string }) => u.email === email);

        if (!user) {
          return new Response(
            JSON.stringify({ error: "Utilisateur non trouvé. Connectez-vous d'abord avec email/mot de passe." }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        finalUserId = user.id;
      }

      const credentialId = credential.id;
      const deviceType = credential.authenticatorAttachment === 'platform' ? 'singleDevice' : 'multiDevice';

      const rawTransports: string[] = credential.response.transports || ['internal'];
      const safeTransports = rawTransports.filter((t: string) =>
        ['internal', 'usb', 'nfc'].includes(t)
      );

      const { error: insertError } = await supabase
        .from('passkey_credentials')
        .insert({
          user_id: finalUserId,
          credential_id: credentialId,
          public_key: credential.response.attestationObject,
          counter: 0,
          device_type: deviceType,
          transports: safeTransports,
          friendly_name: friendlyName || 'Passkey',
        });

      if (insertError) {
        console.error('[webauthn-register] Insert error:', insertError);
        return new Response(
          JSON.stringify({ error: "Erreur lors de l'enregistrement du passkey", details: insertError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      await supabase.from('webauthn_challenges').delete().eq('id', challengeData.id);

      console.log('[webauthn-register] Credential inserted successfully');

      return new Response(
        JSON.stringify({ success: true, message: 'Passkey enregistré avec succès' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Action non reconnue' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[webauthn-register] Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur interne du serveur';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
