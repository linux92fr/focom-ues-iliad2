const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

const ALLOWED_ORIGINS = (Deno.env.get("ALLOWED_ORIGIN") ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowed =
    ALLOWED_ORIGINS.length === 0 ||
    (origin !== null &&
      (ALLOWED_ORIGINS.includes(origin) ||
        origin.startsWith("http://localhost") ||
        origin.startsWith("http://127.0.0.1")));

  return {
    "Access-Control-Allow-Origin": allowed && origin ? origin : "null",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

function json(data: unknown, status: number, headers: Record<string, string>) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}

const BILLING_FALLBACK_REPLY = `L'assistant juridique IA est temporairement indisponible car le crédit API Anthropic est insuffisant.

La page Vos droits reste accessible, mais les réponses automatiques sont suspendues pour le moment.

Pour une question urgente ou personnalisée, contactez directement un représentant FO COM via la page Contact ou l'espace Réclamations.`;

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Méthode non autorisée" }, 405, corsHeaders);
  }

  try {
    const { messages, ccntContext } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return json({ error: "Messages requis" }, 400, corsHeaders);
    }

    const safeMessages = messages
      .filter((m: { role?: string; content?: string }) =>
        (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim().length > 0,
      )
      .map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      }));

    if (safeMessages.length === 0) {
      return json({ error: "Message vide" }, 400, corsHeaders);
    }

    const systemPrompt = [
      "Tu es un assistant juridique expert en droit du travail français, au service des salariés du groupe Iliad (Free, Free Mobile, Free Réseau, Alice, etc.) affiliés au syndicat FO COM UES ILIAD (FOCOM).",
      "",
      "Tes connaissances couvrent :",
      "- Le Code du travail français",
      "- La Convention Collective Nationale des Télécommunications (CCNT, IDCC 2148)",
      "- Les accords d'entreprise UES Iliad (astreintes, temps de travail, nuit, télétravail, etc.)",
      "- La jurisprudence sociale récente",
      "",
      ccntContext ? `Contexte spécifique à cette thématique :\n${ccntContext}` : "",
      "",
      "Règles impératives :",
      "- Réponds toujours en français",
      "- Sois précis, concis et bienveillant",
      "- Cite les articles du Code du travail ou de la CCNT lorsque c'est pertinent",
      "- Mentionne si l'accord Iliad est plus favorable que la CCNT ou la loi",
      "- Ne fournis jamais de consultation juridique officielle — oriente vers un délégué FOCOM pour les cas complexes",
      "- Si tu n'as pas l'information, dis-le clairement",
    ]
      .filter(Boolean)
      .join("\n");

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return json({ error: "Clé ANTHROPIC_API_KEY manquante dans les secrets Supabase" }, 500, corsHeaders);
    }

    const model = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-sonnet-4-20250514";

    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        system: systemPrompt,
        messages: safeMessages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const message = data?.error?.message ?? data?.message ?? "Erreur API Anthropic";
      console.error("Anthropic chat-juridique error", { status: response.status, message, model });

      if (message.toLowerCase().includes("credit balance is too low")) {
        return json({ reply: BILLING_FALLBACK_REPLY, degraded: true, reason: "anthropic_billing" }, 200, corsHeaders);
      }

      return json({ error: message, status: response.status, model }, response.status, corsHeaders);
    }

    return json({ reply: data.content?.[0]?.text ?? "" }, 200, corsHeaders);
  } catch (error) {
    console.error("chat-juridique server error", error);
    return json({ error: "Erreur serveur chat-juridique" }, 500, corsHeaders);
  }
});
