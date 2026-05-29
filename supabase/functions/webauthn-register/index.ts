import { createClient } from 'npm:@supabase/supabase-js@2';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
} from 'npm:@simplewebauthn/server';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

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

  const authHeader = req.headers.get('authorization');
  if (!authHeader) return json({ error: 'Non authentifié' }, 401, corsHeaders);

  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) return json({ error: 'Session invalide' }, 401, corsHeaders);

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  try {
    const body = await req.json();
    const { action, credential, challengeId, friendlyName } = body;
    const rpId = getRpId(origin || 'https://focomues-iliad.fr');
    const expectedOrigin = origin || 'https://focomues-iliad.fr';

    if (action === 'generate-options') {
      const { data: existingCreds } = await supabase
        .from('passkey_credentials')
        .select('credential_id')
        .eq('user_id', user.id);

      const excludeCredentials = (existingCreds || []).map(c => ({
        id: c.credential_id,
        type: 'public-key' as const,
      }));

      const options = await generateRegistrationOptions({
        rpName: 'FOCOM UES ILIAD',
        rpID: rpId,
        userName: user.email || user.id,
        userDisplayName: user.user_metadata?.first_name
          ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim()
          : user.email || '',
        excludeCredentials,
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'preferred',
          residentKey: 'preferred',
        },
      });

      const expiresAt = new Date(Date.now() + 120000).toISOString();
      const { data: challenge } = await supabase
        .from('webauthn_challenges')
        .insert({ challenge: options.challenge, user_id: user.id, expires_at: expiresAt })
        .select('id')
        .single();

      return json({ ...options, challengeId: challenge?.id }, 200, corsHeaders);
    }

    if (action === 'verify') {
      if (!challengeId || !credential) {
        return json({ error: 'Missing challengeId or credential' }, 400, corsHeaders);
      }

      const { data: challengeRow } = await supabase
        .from('webauthn_challenges')
        .select('*')
        .eq('id', challengeId)
        .eq('user_id', user.id)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (!challengeRow) return json({ error: 'Challenge invalide ou expiré' }, 400, corsHeaders);

      const verification = await verifyRegistrationResponse({
        response: credential,
        expectedChallenge: challengeRow.challenge,
        expectedOrigin,
        expectedRPID: rpId,
      });

      if (!verification.verified || !verification.registrationInfo) {
        return json({ error: 'Vérification échouée' }, 401, corsHeaders);
      }

      const { credential: cred } = verification.registrationInfo;
      const publicKeyB64 = btoa(String.fromCharCode(...cred.publicKey))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

      await supabase.from('passkey_credentials').insert({
        user_id: user.id,
        credential_id: cred.id,
        public_key: publicKeyB64,
        counter: cred.counter,
        name: friendlyName || `Passkey ${new Date().toLocaleDateString('fr-FR')}`,
        aaguid: verification.registrationInfo.aaguid,
      });

      await supabase.from('webauthn_challenges').delete().eq('id', challengeId);

      return json({ success: true }, 200, corsHeaders);
    }

    return json({ error: 'Action non reconnue' }, 400, corsHeaders);
  } catch (err: unknown) {
    console.error('[webauthn-register]', err);
    return json({ error: err instanceof Error ? err.message : 'Erreur interne' }, 500, corsHeaders);
  }
});
