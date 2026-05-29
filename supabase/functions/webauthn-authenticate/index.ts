import { createClient } from 'npm:@supabase/supabase-js@2';
import {
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from 'npm:@simplewebauthn/server';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGIN') ?? '')
  .split(',').map(o => o.trim()).filter(Boolean);

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowed = ALLOWED_ORIGINS.length === 0 ||
    (origin !== null && (ALLOWED_ORIGINS.includes(origin) ||
      origin.startsWith('http://localhost') ||
      origin.startsWith('http://127.0.0.1')));
  return {
    'Access-Control-Allow-Origin': allowed && origin ? origin : 'null',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

function getRpId(origin: string): string {
  try { return new URL(origin).hostname; } catch { return 'localhost'; }
}

function json(data: unknown, status: number, headers: Record<string,string>) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  try {
    const body = await req.json();
    const { action, email, credential, challengeId } = body;
    const rpId = getRpId(origin || 'https://focomues-iliad.fr');
    const expectedOrigin = origin || 'https://focomues-iliad.fr';

    if (action === 'generate-options') {
      // Find credentials for user if email provided
      let allowCredentials: { id: string; type: 'public-key' }[] = [];
      if (email) {
        const { data: user } = await supabase.auth.admin.getUserByEmail(email);
        if (user?.user) {
          const { data: creds } = await supabase
            .from('passkey_credentials')
            .select('credential_id')
            .eq('user_id', user.user.id);
          if (creds) {
            allowCredentials = creds.map(c => ({ id: c.credential_id, type: 'public-key' as const }));
          }
        }
      }

      const options = await generateAuthenticationOptions({
        rpID: rpId,
        allowCredentials,
        userVerification: 'preferred',
        timeout: 60000,
      });

      // Store challenge
      const expiresAt = new Date(Date.now() + 60000).toISOString();
      const { data: challenge } = await supabase
        .from('webauthn_challenges')
        .insert({ challenge: options.challenge, email: email || null, expires_at: expiresAt })
        .select('id')
        .single();

      return json({ ...options, challengeId: challenge?.id }, 200, corsHeaders);
    }

    if (action === 'verify') {
      if (!challengeId || !credential) {
        return json({ error: 'Missing challengeId or credential' }, 400, corsHeaders);
      }

      // Get stored challenge
      const { data: challengeRow } = await supabase
        .from('webauthn_challenges')
        .select('*')
        .eq('id', challengeId)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (!challengeRow) {
        return json({ error: 'Challenge invalide ou expiré' }, 400, corsHeaders);
      }

      // Find credential
      const { data: credRow } = await supabase
        .from('passkey_credentials')
        .select('*')
        .eq('credential_id', credential.id)
        .single();

      if (!credRow) {
        return json({ error: 'Passkey non reconnu' }, 400, corsHeaders);
      }

      // Verify
      const verification = await verifyAuthenticationResponse({
        response: credential,
        expectedChallenge: challengeRow.challenge,
        expectedOrigin,
        expectedRPID: rpId,
        credential: {
          id: credRow.credential_id,
          publicKey: Uint8Array.from(atob(credRow.public_key.replace(/-/g,'+').replace(/_/g,'/')), c => c.charCodeAt(0)),
          counter: credRow.counter,
        },
      });

      if (!verification.verified) {
        return json({ error: 'Vérification échouée' }, 401, corsHeaders);
      }

      // Update counter and last_used_at
      await supabase
        .from('passkey_credentials')
        .update({
          counter: verification.authenticationInfo.newCounter,
          last_used_at: new Date().toISOString(),
        })
        .eq('credential_id', credential.id);

      // Delete used challenge
      await supabase.from('webauthn_challenges').delete().eq('id', challengeId);

      // Get user profile
      const { data: userData } = await supabase.auth.admin.getUserById(credRow.user_id);
      const userEmail = userData?.user?.email;
      if (!userEmail) return json({ error: 'Utilisateur non trouvé' }, 404, corsHeaders);

      // Generate magic link
      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: userEmail,
      });

      if (linkError || !linkData) {
        return json({ error: 'Impossible de créer le lien de connexion' }, 500, corsHeaders);
      }

      const firstName = userData?.user?.user_metadata?.first_name || '';
      return json({ success: true, linkData, user: { first_name: firstName } }, 200, corsHeaders);
    }

    return json({ error: 'Action non reconnue' }, 400, corsHeaders);
  } catch (err: any) {
    console.error('[webauthn-authenticate]', err);
    return json({ error: err.message || 'Erreur interne' }, 500, corsHeaders);
  }
});
