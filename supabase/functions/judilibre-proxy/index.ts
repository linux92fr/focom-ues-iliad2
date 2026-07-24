import "@supabase/functions-js/edge-runtime.d.ts";

/**
 * Proxy sécurisé vers l'API JUDILIBRE (Cour de cassation) exposée par PISTE.
 *
 * - Authentification OAuth2 (client_credentials) gérée côté serveur, comme le
 *   proxy Légifrance : mêmes identifiants PISTE (l'application est autorisée
 *   pour les deux API). Réutilise donc les secrets existants.
 * - Endpoints JUDILIBRE en GET (query params). Liste blanche d'actions.
 *
 * Secrets (réutilise ceux du proxy Légifrance) :
 *   PISTE_CLIENT_ID | LEGIFRANCE_CLIENT_ID
 *   PISTE_CLIENT_SECRET | LEGIFRANCE_CLIENT_SECRET
 *   PISTE_ENV | LEGIFRANCE_ENV   ("production" [défaut] ou "sandbox")
 *   ALLOWED_ORIGIN               (facultatif)
 */

const ENV = (Deno.env.get("PISTE_ENV") ?? Deno.env.get("LEGIFRANCE_ENV") ?? "production").toLowerCase();
const IS_SANDBOX = ENV === "sandbox";

const OAUTH_URL = IS_SANDBOX
  ? "https://sandbox-oauth.piste.gouv.fr/api/oauth/token"
  : "https://oauth.piste.gouv.fr/api/oauth/token";

const API_BASE = IS_SANDBOX
  ? "https://sandbox-api.piste.gouv.fr/cassation/judilibre/v1.0"
  : "https://api.piste.gouv.fr/cassation/judilibre/v1.0";

const CLIENT_ID = Deno.env.get("PISTE_CLIENT_ID") ?? Deno.env.get("LEGIFRANCE_CLIENT_ID") ?? "";
const CLIENT_SECRET =
  Deno.env.get("PISTE_CLIENT_SECRET") ?? Deno.env.get("LEGIFRANCE_CLIENT_SECRET") ?? "";

const ALLOWED_ORIGINS = (Deno.env.get("ALLOWED_ORIGIN") ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

/** Liste blanche : action → endpoint GET de l'API JUDILIBRE. */
const ACTIONS: Record<string, string> = {
  search: "/search",
  decision: "/decision",
  taxonomy: "/taxonomy",
  healthcheck: "/healthcheck",
  stats: "/stats",
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

/** Construit une query string à partir d'un objet (les tableaux → clés répétées). */
function buildQuery(params: Record<string, unknown> | undefined): string {
  const usp = new URLSearchParams();
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === "") continue;
      if (Array.isArray(value)) {
        value.forEach((v) => {
          if (v !== undefined && v !== null && v !== "") usp.append(key, String(v));
        });
      } else {
        usp.append(key, String(value));
      }
    }
  }
  const s = usp.toString();
  return s ? `?${s}` : "";
}

// --- Cache mémoire du token OAuth ---
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  const now = Date.now();
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
      { error: "Configuration manquante : définissez PISTE_CLIENT_ID/SECRET (ou LEGIFRANCE_CLIENT_ID/SECRET)." },
      500,
      corsHeaders,
    );
  }

  let payload: { action?: string; params?: Record<string, unknown> };
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
    const query = buildQuery(payload.params);

    const upstream = await fetch(`${API_BASE}${endpoint}${query}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    const text = await upstream.text();
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }

    if (!upstream.ok) {
      console.error(
        `judilibre upstream ${upstream.status} on ${endpoint} (env=${ENV}) :`,
        text.slice(0, 800),
      );
      return json(
        { error: `API JUDILIBRE ${upstream.status}`, details: data },
        upstream.status,
        corsHeaders,
      );
    }

    return json(data, 200, corsHeaders);
  } catch (err) {
    console.error("judilibre-proxy error", err);
    return json({ error: err instanceof Error ? err.message : String(err) }, 500, corsHeaders);
  }
});
