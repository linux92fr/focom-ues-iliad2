import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { messages, ccntContext } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Messages requis" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
      return new Response(JSON.stringify({ error: "Clé API manquante" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: data.error?.message ?? "Erreur API" }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ reply: data.content?.[0]?.text ?? "" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Erreur serveur" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
