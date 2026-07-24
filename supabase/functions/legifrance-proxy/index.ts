import "@supabase/functions-js/edge-runtime.d.ts";

/**
 * Proxy sécurisé vers l'API Légifrance (DILA) exposée par la plateforme PISTE.
 *
 * - L'authentification OAuth2 (client_credentials) est gérée côté serveur :
 *   le client_id / client_secret ne sont JAMAIS exposés au frontend.
 * - Le token OAuth (~1h de validité) est mis en cache en mémoire et réutilisé.
 * - Seules quelques "actions" sont autorisées (liste blanche) pour éviter
 *   d'exposer toute la surface de l'API.
 *
 * Secrets attendus (Supabase → Edge Functions → Secrets) :
 *   LEGIFRANCE_CLIENT_ID
 *   LEGIFRANCE_CLIENT_SECRET
 *   LEGIFRANCE_ENV        (facultatif : "production" [défaut] ou "sandbox")
 *   ALLOWED_ORIGIN        (facultatif : liste d'origines séparées par des virgules)
 */

const ENV = (Deno.env.get("LEGIFRANCE_ENV") ?? "production").toLowerCase();
const IS_SANDBOX = ENV === "sandbox";

const OAUTH_URL = IS_SANDBOX
  ? "https://sandbox-oauth.piste.gouv.fr/api/oauth/token"
  : "https://oauth.piste.gouv.fr/api/oauth/token";

const API_BASE = IS_SANDBOX
  ? "https://sandbox-api.piste.gouv.fr/dila/legifrance/lf-engine-app"
  : "https://api.piste.gouv.fr/dila/legifrance/lf-engine-app";

const CLIENT_ID = Deno.env.get("LEGIFRANCE_CLIENT_ID") ?? "";
const CLIENT_SECRET = Deno.env.get("LEGIFRANCE_CLIENT_SECRET") ?? "";

const ALLOWED_ORIGINS = (Deno.env.get("ALLOWED_ORIGIN") ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

/** Liste blanche : action → endpoint POST de l'API Légifrance. */
const ACTIONS: Record<string, string> = {
  search: "/search",
  suggest: "/suggest",
  getArticle: "/consult/getArticle",
  getArticleWithId: "/consult/getArticleWithIdEliOrAlias",
  consultCode: "/consult/code",
  consultLegi: "/consult/legiPart",
  tableMatieres: "/consult/code/tableMatieres",
  ping: "/search/ping",
};

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowed =
    ALLOWED_ORIGINS.length === 0 ||
    (origin !== null &&
      (ALLOWED_ORIGINS.includes(origin) ||
        origin.startsWith("http://localhost") ||
        origin.startsWith("http://127.0.0.1")));

  return {
    "Access-Control-Allow-Origin": allowed && origin ? origin : "null",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

function json(data: unknown, status: number, headers: Record<string, string>) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}

// --- Cache mémoire du token OAuth (partagé entre invocations à chaud) ---
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  // Marge de 60s avant expiration réelle.
  if (cachedToken && cachedToken.expiresAt - 60_000 > now) {
    return cachedToken.value;
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    scope: "openid",
  });

  const res = await fetch(OAUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`OAuth PISTE ${res.status} : ${detail.slice(0, 300)}`);
  }

  const data = await res.json();
  const expiresInMs = (Number(data.expires_in) || 3600) * 1000;
  cachedToken = { value: data.access_token, expiresAt: now + expiresInMs };
  return cachedToken.value;
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Méthode non autorisée" }, 405, corsHeaders);

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return json(
      { error: "Configuration manquante : définissez LEGIFRANCE_CLIENT_ID et LEGIFRANCE_CLIENT_SECRET." },
      500,
      corsHeaders,
    );
  }

  let payload: { action?: string; params?: unknown };
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Corps JSON invalide" }, 400, corsHeaders);
  }

  const action = payload?.action ?? "";
  const endpoint = ACTIONS[action];
  if (!endpoint) {
    return json(
      { error: `Action inconnue : « ${action} ». Actions valides : ${Object.keys(ACTIONS).join(", ")}.` },
      400,
      corsHeaders,
    );
  }

  try {
    const token = await getAccessToken();
    const isGet = action === "ping";

    const upstream = await fetch(`${API_BASE}${endpoint}`, {
      method: isGet ? "GET" : "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        ...(isGet ? {} : { "Content-Type": "application/json" }),
      },
      body: isGet ? undefined : JSON.stringify(payload.params ?? {}),
    });

    const text = await upstream.text();
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }

    if (!upstream.ok) {
      return json(
        { error: `API Légifrance ${upstream.status}`, details: data },
        upstream.status,
        corsHeaders,
      );
    }

    return json(data, 200, corsHeaders);
  } catch (err) {
    console.error("legifrance-proxy error", err);
    return json({ error: err instanceof Error ? err.message : String(err) }, 500, corsHeaders);
  }
});
