import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const ONE_MIN_API_KEY = Deno.env.get("ONEMIN_API_KEY") ?? "";
const ALLOWED_ORIGINS = (Deno.env.get("ALLOWED_ORIGIN") ?? "https://focomues-iliad.fr,https://www.focomues-iliad.fr")
  .split(",").map((v) => v.trim()).filter(Boolean);

function cors(origin: string | null): Record<string, string> {
  const allowed = origin !== null && (ALLOWED_ORIGINS.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin));
  return {
    "Access-Control-Allow-Origin": allowed ? origin! : "null",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}
function json(data: unknown, status: number, headers: Record<string, string>) {
  return new Response(JSON.stringify(data), { status, headers: { ...headers, "Content-Type": "application/json" } });
}
const taskInstructions: Record<string, string> = {
  article: "Rédige un article syndical FO COM UES ILIAD en français, factuel, clair et structuré avec titre, chapô et intertitres. N'invente ni chiffre, ni citation, ni jurisprudence. Signale les éléments qui doivent être vérifiés.",
  correction: "Corrige l'orthographe, la grammaire et la clarté du texte en français sans changer le fond. Retourne le texte corrigé uniquement.",
  summary: "Résume fidèlement le document en français. Présente l'objet, les points essentiels, les obligations/délais/chiffres cités et les questions à vérifier. Distingue explicitement ce que le document dit de tes commentaires. Ne présente pas ce résumé comme un conseil juridique définitif.",
  chat: "Tu es l'assistant d'information FO COM UES ILIAD. Réponds en français, avec prudence et pédagogie. Pour les questions juridiques, précise les incertitudes et les sources/dates à vérifier. N'invente jamais d'article de loi, de jurisprudence, de règle interne ou de donnée. Rappelle que la réponse ne remplace pas l'analyse d'un représentant syndical.",
};
const MAX_TEXT = 30000;

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const headers = cors(origin);
  if (req.method === "OPTIONS") return new Response("ok", { headers });
  if (req.method !== "POST") return json({ error: "Méthode non autorisée." }, 405, headers);
  if (!origin || headers["Access-Control-Allow-Origin"] === "null") return json({ error: "Origine non autorisée." }, 403, headers);
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !ONE_MIN_API_KEY) {
    return json({ error: "Configuration serveur incomplète : secrets Supabase et ONEMIN_API_KEY requis." }, 503, headers);
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token || token === authHeader) return json({ error: "Authentification requise." }, 401, headers);

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData.user) return json({ error: "Session invalide ou expirée." }, 401, headers);

  const { data: roleRows, error: roleError } = await supabase
    .from("user_roles").select("role").eq("user_id", authData.user.id);
  if (roleError) {
    console.error("1min-ai role lookup failed", roleError.message);
    return json({ error: "Impossible de vérifier les autorisations." }, 403, headers);
  }
  const roles = new Set((roleRows ?? []).map((row) => row.role as string));
  const isAdmin = roles.has("admin");
  const canUseText = isAdmin || ["redacteur", "representant", "secretaire"].some((r) => roles.has(r));
  const canUseImages = isAdmin || roles.has("redacteur");
  const canUseAssistant = ["admin", "redacteur", "representant", "secretaire", "tresorier", "gestionnaire_documents"].some((r) => roles.has(r));
  if (!canUseAssistant) return json({ error: "Votre rôle ne permet pas d'utiliser cet assistant." }, 403, headers);

  let payload: { action?: string; text?: string; prompt?: string; messages?: Array<{role: string; content: string}> };
  try { payload = await req.json(); } catch { return json({ error: "Requête JSON invalide." }, 400, headers); }
  const action = payload.action ?? "";
  const text = typeof payload.text === "string" ? payload.text.trim() : "";
  const prompt = typeof payload.prompt === "string" ? payload.prompt.trim() : "";

  if (action === "image-result") {
    if (!canUseImages) return json({ error: "Accès réservé aux administrateurs et rédacteurs." }, 403, headers);
    const resultId = typeof payload.prompt === "string" ? payload.prompt.trim() : "";
    if (!/^[0-9a-f-]{20,60}$/i.test(resultId)) return json({ error: "Identifiant de génération invalide." }, 400, headers);
    try {
      const upstream = await fetch(`https://api.1min.ai/api/results/${encodeURIComponent(resultId)}`, {
        headers: { "API-KEY": ONE_MIN_API_KEY },
        signal: AbortSignal.timeout(20000),
      });
      const data = await upstream.json().catch(() => ({}));
      if (!upstream.ok || !data?.aiRecord) return json({ error: "Résultat introuvable ou inaccessible." }, 502, headers);
      return json({ result: data.aiRecord, temporaryUrl: data.temporaryUrl ?? null }, 200, headers);
    } catch (error) {
      console.error("1min.ai image result failed", error);
      return json({ error: "Impossible de récupérer l'image pour le moment." }, 502, headers);
    }
  }

  if (action === "image") {
    if (!canUseImages) return json({ error: "La génération d'images est réservée aux administrateurs et rédacteurs." }, 403, headers);
    if (prompt.length < 5 || prompt.length > 2000) return json({ error: "Décris l'image (5 à 2 000 caractères)." }, 400, headers);
    try {
      const upstream = await fetch("https://api.1min.ai/api/features", {
        method: "POST",
        headers: { "Content-Type": "application/json", "API-KEY": ONE_MIN_API_KEY },
        body: JSON.stringify({
          type: "IMAGE_GENERATOR",
          model: "gemini-3.1-flash-image-preview",
          async: true,
          promptObject: { prompt, num_outputs: 1, aspect_ratio: "16:9", output_format: "webp" },
        }),
        signal: AbortSignal.timeout(30000),
      });
      const data = await upstream.json().catch(() => ({}));
      if (!upstream.ok) {
        console.error("1min.ai image error", upstream.status);
        return json({ error: upstream.status === 429 ? "Limite ou crédits 1min.ai atteints." : "Le service de génération d'images a refusé la demande." }, upstream.status === 429 ? 429 : 502, headers);
      }
      return json({ result: data, action: "image" }, 200, headers);
    } catch (error) {
      console.error("1min.ai image request failed", error);
      return json({ error: "Le service d'images est temporairement indisponible." }, 502, headers);
    }
  }

  if (!canUseText) return json({ error: "Votre rôle ne permet pas d'utiliser les outils de rédaction." }, 403, headers);
  if (!Object.hasOwn(taskInstructions, action)) return json({ error: "Fonction inconnue." }, 400, headers);
  if (action === "chat") {
    const messages = Array.isArray(payload.messages) ? payload.messages : [];
    if (!messages.length || messages.length > 20) return json({ error: "Conversation invalide (20 messages maximum)." }, 400, headers);
    const safeMessages = messages.filter((m) => ["user", "assistant"].includes(m.role) && typeof m.content === "string" && m.content.trim())
      .map((m) => ({ role: m.role, content: m.content.trim().slice(0, 8000) }));
    if (!safeMessages.some((m) => m.role === "user")) return json({ error: "Une question est nécessaire." }, 400, headers);
    try {
      const upstream = await fetch("https://api.1min.ai/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${ONE_MIN_API_KEY}` },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          messages: [{ role: "system", content: taskInstructions.chat }, ...safeMessages],
          max_completion_tokens: 1200,
          store: false,
        }),
        signal: AbortSignal.timeout(120000),
      });
      const data = await upstream.json().catch(() => ({}));
      if (!upstream.ok) {
        console.error("1min.ai chat error", upstream.status);
        return json({ error: upstream.status === 429 ? "Limite ou crédits 1min.ai atteints." : "Le service IA a rencontré une erreur." }, upstream.status === 429 ? 429 : 502, headers);
      }
      const reply = data?.choices?.[0]?.message?.content;
      if (typeof reply !== "string" || !reply.trim()) return json({ error: "La réponse IA est vide." }, 502, headers);
      return json({ reply: reply.trim(), model: data?.model ?? "gpt-4.1-mini" }, 200, headers);
    } catch (error) {
      console.error("1min.ai chat request failed", error);
      return json({ error: "Le service IA est temporairement indisponible." }, 502, headers);
    }
  }

  if (!text || text.length > MAX_TEXT) return json({ error: "Le texte est obligatoire et limité à 30 000 caractères." }, 400, headers);
  const userPrompt = action === "article"
    ? `Sujet et éléments fournis par le rédacteur :\n${text}`
    : `Document ou texte à traiter :\n${text}`;
  try {
    const upstream = await fetch("https://api.1min.ai/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${ONE_MIN_API_KEY}` },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [{ role: "system", content: taskInstructions[action] }, { role: "user", content: userPrompt }],
        max_completion_tokens: action === "article" || action === "summary" ? 2500 : 1800,
        store: false,
      }),
      signal: AbortSignal.timeout(120000),
    });
    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      console.error("1min.ai text error", upstream.status);
      return json({ error: upstream.status === 429 ? "Limite ou crédits 1min.ai atteints." : "Le service IA a rencontré une erreur." }, upstream.status === 429 ? 429 : 502, headers);
    }
    const result = data?.choices?.[0]?.message?.content;
    if (typeof result !== "string" || !result.trim()) return json({ error: "La réponse IA est vide." }, 502, headers);
    return json({ result: result.trim(), model: data?.model ?? "gpt-4.1-mini" }, 200, headers);
  } catch (error) {
    console.error("1min.ai text request failed", error);
    return json({ error: "Le service IA est temporairement indisponible." }, 502, headers);
  }
});
