const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

const EDITOR_ROLES = "admin,secretaire,representant,redacteur";

async function getCallerUserId(supabaseUrl: string, serviceKey: string, authHeader: string) {
  const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { Authorization: authHeader, apikey: serviceKey },
  });
  if (!res.ok) return null;
  const body = await res.json();
  return typeof body?.id === "string" ? body.id : null;
}

async function callerIsEditor(supabaseUrl: string, serviceKey: string, userId: string) {
  const res = await fetch(
    `${supabaseUrl}/rest/v1/user_roles?user_id=eq.${userId}&role=in.(${EDITOR_ROLES})&select=role&limit=1`,
    { headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } },
  );
  const roles = await res.json();
  return Array.isArray(roles) && roles.length > 0;
}

async function restGet(supabaseUrl: string, serviceKey: string, path: string) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`REST GET ${path} -> ${res.status}`);
  return res.json();
}

async function restInsert(supabaseUrl: string, serviceKey: string, table: string, row: Record<string, unknown>) {
  await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(row),
  });
}

function normalizePhone(value: string): string | null {
  const cleaned = value.replace(/[\s.-]/g, "");
  return /^\+?[0-9]{8,15}$/.test(cleaned) ? cleaned.replace(/^\+/, "") : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const accessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
  const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
  const apiVersion = Deno.env.get("WHATSAPP_API_VERSION") ?? "v22.0";
  const siteUrl = (Deno.env.get("PUBLIC_SITE_URL") ?? Deno.env.get("SITE_URL") ?? "https://beta.focomues-iliad.fr").replace(/\/+$/, "");
  const templateByKind: Record<string, string> = {
    article: Deno.env.get("WHATSAPP_TEMPLATE_ARTICLE") ?? "nouvelle_actualite",
    event: Deno.env.get("WHATSAPP_TEMPLATE_EVENT") ?? "nouvel_evenement",
  };

  if (!accessToken || !phoneNumberId) {
    return json({ error: "Secrets WhatsApp manquants : définir WHATSAPP_ACCESS_TOKEN et WHATSAPP_PHONE_NUMBER_ID" }, 503);
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return json({ error: "Non autorisé" }, 401);
  const userId = await getCallerUserId(supabaseUrl, serviceKey, authHeader);
  if (!userId) return json({ error: "Token invalide" }, 401);
  if (!(await callerIsEditor(supabaseUrl, serviceKey, userId))) return json({ error: "Accès refusé" }, 403);

  let payload: { kind?: unknown; id?: unknown };
  try {
    payload = await req.json();
  } catch {
    return json({ error: "JSON invalide" }, 400);
  }
  const kind = payload?.kind;
  const id = typeof payload?.id === "string" ? payload.id : null;
  if ((kind !== "article" && kind !== "event") || !id) {
    return json({ error: "Paramètres requis : kind ('article' ou 'event') et id" }, 400);
  }

  let title: string;
  let url: string;
  if (kind === "article") {
    const rows = await restGet(supabaseUrl, serviceKey, `articles?id=eq.${id}&is_published=eq.true&select=title,slug&limit=1`);
    if (!Array.isArray(rows) || rows.length === 0) return json({ error: "Article introuvable ou non publié" }, 404);
    title = String(rows[0].title ?? "");
    url = `${siteUrl}/actualites/${rows[0].slug}`;
  } else {
    const rows = await restGet(supabaseUrl, serviceKey, `events?id=eq.${id}&is_public=eq.true&select=title&limit=1`);
    if (!Array.isArray(rows) || rows.length === 0) return json({ error: "Événement introuvable ou non public" }, 404);
    title = String(rows[0].title ?? "");
    url = `${siteUrl}/agenda`;
  }

  const prefColumn = kind === "article" ? "notify_articles" : "notify_actions";
  const subscribers = await restGet(
    supabaseUrl,
    serviceKey,
    `notification_preferences?select=user_id,whatsapp_number&notify_whatsapp=eq.true&whatsapp_number=not.is.null&${prefColumn}=eq.true`,
  );

  const template = templateByKind[kind];
  const summary = { sent: 0, failed: 0, total: 0 };

  for (const sub of Array.isArray(subscribers) ? subscribers : []) {
    const phone = normalizePhone(String(sub?.whatsapp_number ?? ""));
    if (!phone) continue;
    summary.total += 1;

    const message = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phone,
      type: "template",
      template: {
        name: template,
        language: { code: "fr" },
        components: [
          {
            type: "body",
            parameters: [{ type: "text", text: title }, { type: "text", text: url }],
          },
        ],
      },
    };

    let status = "failed";
    let messageId: string | null = null;
    let providerResponse: unknown = null;
    try {
      const res = await fetch(`https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(message),
      });
      providerResponse = await res.json().catch(() => null);
      if (res.ok) {
        status = "sent";
        summary.sent += 1;
        const messages = (providerResponse as { messages?: { id?: string }[] } | null)?.messages;
        if (messages && messages[0]?.id) messageId = String(messages[0].id);
      } else {
        summary.failed += 1;
      }
    } catch (err) {
      summary.failed += 1;
      providerResponse = { error: String(err) };
    }

    await restInsert(supabaseUrl, serviceKey, "whatsapp_notifications", {
      user_id: sub?.user_id ?? null,
      kind,
      target_id: id,
      title,
      phone,
      status,
      message_id: messageId,
      provider_response: providerResponse,
    });
  }

  return json({ kind, title, url, template, ...summary });
});
