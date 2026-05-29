import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

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
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
              JSON.stringify({ error: 'Aucun passkey enregistré pour cet utilisateur. Veuillez d\'abord en créer un depuis votre profil.' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
            JSON.stringify({ error: 'Aucun utilisateur trouvé avec cet email' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'verify-authentication') {
      const { credential, email } = data;

      if (!credential || !credential.response) {
        return new Response(
          JSON.stringify({ error: 'Credential invalide' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: challengeData, error: challengeError } = await supabase
        .from('webauthn_challenges')
        .select('*')
        .eq('type', 'authentication')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (challengeError || !challengeData) {
        console.error('[webauthn-authenticate] Challenge error:', challengeError);
        return new Response(
          JSON.stringify({ error: 'Challenge expiré ou invalide. Veuillez réessayer.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

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
        console.error(`[webauthn-authenticate] Origin not allowed: ${clientDataJSON.origin}`);
        return new Response(
          JSON.stringify({ error: 'Origine non autorisée' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (clientDataJSON.type !== 'webauthn.get') {
        return new Response(
          JSON.stringify({ error: 'Type de cérémonie incorrecte' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const newCounter = (storedCredential.counter || 0) + 1;
      await supabase
        .from('passkey_credentials')
        .update({ counter: newCounter, last_used_at: new Date().toISOString() })
        .eq('id', storedCredential.id);

      await supabase.from('webauthn_challenges').delete().eq('id', challengeData.id);

      const { data: userData } = await supabase.auth.admin.getUserById(storedCredential.user_id);

      if (!userData?.user) {
        return new Response(
          JSON.stringify({ error: 'Utilisateur non trouvé' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Action non reconnue' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[webauthn-authenticate] Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur interne du serveur';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
