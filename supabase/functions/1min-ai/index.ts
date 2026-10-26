import { createClient } from "@supabase/supabase-js";

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
  code: "Tu es un ingénieur logiciel senior. Réponds en français. Produis du code cohérent, maintenable, sécurisé et directement copiable. Indique le langage et les fichiers concernés si utile. N’invente pas les API ou fonctions disponibles dans l’environnement. Pour une correction, explique brièvement le problème, donne une solution complète puis propose des tests. Signale les hypothèses, dépendances et risques de sécurité. Ne prétends jamais avoir exécuté ou testé le code si ce n’est pas le cas.",
};
const MAX_TEXT = 30000;
const CODE_MODELS = new Set([
  "qwen3.8-max",
  "qwen3.8-flash",
  "qwen3.7-plus",
  "qwen3.7-max",
  "qwen3.7-flash",
  "qwen3.6-plus",
  "qwen3.6-flash",
  "qwen3-coder-plus",
  "qwen3-coder-flash",
  "us.anthropic.claude-sonnet-5-5",
  "us.anthropic.claude-sonnet-5",
  "us.anthropic.claude-sonnet-4-6",
  "us.anthropic.claude-sonnet-4-5-20250929-v1:0",
  "us.anthropic.claude-opus-5-5",
  "us.anthropic.claude-opus-5",
  "us.anthropic.claude-opus-4-8",
  "us.anthropic.claude-opus-4-7",
  "us.anthropic.claude-opus-4-6-v1",
  "us.anthropic.claude-opus-4-5-20251101-v1:0",
  "us.anthropic.claude-haiku-5-5",
  "us.anthropic.claude-haiku-4-5-20251001-v1:0",
  "us.anthropic.claude-fable-5-1",
  "us.anthropic.claude-fable-5",
  "command-a-plus-05-2026",
  "deepseek-v4-pro",
  "deepseek-flash",
  "gemini-4-argon",
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.1-pro-preview",
  "gemini-3.1-flash-lite-preview",
  "gemini-3-flash-preview",
  "mistral-small-2603",
  "mistral-medium-3-5",
  "mistral-large-2512",
  "gpt-5.3-codex",
  "gpt-6.1-sol",
  "gpt-6-sol",
  "gpt-6-luna",
  "gpt-6-astra",
  "gpt-5.6-terra",
  "gpt-5.6-sol",
  "gpt-5.6-luna",
  "gpt-5.5-pro",
  "gpt-5.5",
  "gpt-5.4-nano",
  "gpt-5.4-mini",
  "gpt-5.4",
  "gpt-5",
  "gpt-4o",
  "o3",
  "moonshotai/kimi-k3",
  "moonshotai/kimi-k2.7-code",
  "moonshotai/kimi-k2.6",
  "meta/muse-wonder",
  "meta/muse-spark-1.3",
  "meta/muse-spark-1.2",
  "meta/muse-spark-1.1",
  "grok-4.7",
  "grok-4.6",
  "grok-4.5",
  "grok-4.3",
  "glm-5.3",
  "glm-5.2",
  "glm-5.1",
  "glm-5",
]);


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
  const rolesHasAny = (currentRoles: Set<string>, allowed: Set<string>) => [...allowed].some((role) => currentRoles.has(role));
  const canUseImages = isAdmin || roles.has("redacteur");
  const canUseAssistant = ["admin", "redacteur", "representant", "secretaire", "tresorier", "gestionnaire_documents"].some((r) => roles.has(r));
  if (!canUseAssistant) return json({ error: "Votre rôle ne permet pas d'utiliser cet assistant." }, 403, headers);

  let payload: { action?: string; text?: string; prompt?: string; size?: string; quality?: string; model?: string; reasoning?: string; messages?: Array<{role: string; content: string}> };
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
      return json({ result: data.aiRecord, temporaryUrl: data.aiRecord.temporaryUrl ?? data.temporaryUrl ?? null }, 200, headers);
    } catch (error) {
      console.error("1min.ai image result failed", error);
      return json({ error: "Impossible de récupérer l'image pour le moment." }, 502, headers);
    }
  }

  if (action === "image") {
    if (!canUseImages) return json({ error: "La génération d'images est réservée aux administrateurs et rédacteurs." }, 403, headers);
    if (prompt.length < 5 || prompt.length > 2000) return json({ error: "Décris l'image (5 à 2 000 caractères)." }, 400, headers);
    const allowedSizes = ["1024x1024", "1536x1024", "1024x1536"];
    const size = typeof payload.size === "string" && allowedSizes.includes(payload.size) ? payload.size : "1024x1024";
    const allowedQualities = ["low", "medium", "high"];
    const quality = typeof payload.quality === "string" && allowedQualities.includes(payload.quality) ? payload.quality : "medium";
    try {
      const upstream = await fetch("https://api.1min.ai/api/features", {
        method: "POST",
        headers: { "Content-Type": "application/json", "API-KEY": ONE_MIN_API_KEY },
        body: JSON.stringify({
          type: "IMAGE_GENERATOR",
          model: "gpt-image-2",
          async: true,
          promptObject: { prompt, size, quality, n: 1, background: "auto", output_format: "png" },
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


  if (action === "assistant-chat") {
    const allowedRoles = new Set(["admin", "redacteur", "utilisateur_ia"]);
    if (!rolesHasAny(roles, allowedRoles)) return json({ error: "L’assistant IA est réservé aux administrateurs et rédacteurs." }, 403, headers);
    const model = typeof payload.model === "string" ? payload.model : "gpt-4.1-mini";
    const allowedModels = new Set([
      "gpt-4.1-mini", "gpt-4.1", "gpt-4o-mini", "gpt-4o", "gpt-5-mini", "gpt-5.4", "gpt-5.5", "gpt-6-sol", "gpt-6-luna",
      "deepseek-flash", "deepseek-v4-pro", "qwen-flash", "qwen-plus", "qwen-max", "qwen3.6-flash", "qwen3.6-plus", "qwen3.7-flash", "qwen3.7-plus",
      "mistral-small-latest", "mistral-small-2603", "mistral-medium-3-5", "mistral-large-latest", "mistral-large-2512",
      "glm-5", "glm-5.1", "glm-5.2", "glm-5.3", "moonshotai/kimi-k2.6", "moonshotai/kimi-k2.7-code", "meta/muse-spark-1.3",
    ]);
    if (!allowedModels.has(model)) return json({ error: "Le modèle demandé n’est pas autorisé." }, 400, headers);
    const incoming = Array.isArray(payload.messages) ? payload.messages : [];
    if (!incoming.length || incoming.length > 30) return json({ error: "La conversation doit contenir entre 1 et 30 messages." }, 400, headers);
    const safeMessages = incoming.filter((message) =>
      message && ["user", "assistant"].includes(message.role) &&
      typeof message.content === "string" && message.content.trim().length > 0
    ).map((message) => ({ role: message.role, content: message.content.trim().slice(0, 8000) }));
    if (!safeMessages.length || safeMessages[safeMessages.length - 1].role !== "user") {
      return json({ error: "Le dernier message doit être une question utilisateur." }, 400, headers);
    }
    if (safeMessages.reduce((sum, message) => sum + message.content.length, 0) > 30000) {
      return json({ error: "La conversation dépasse 30 000 caractères. Démarre une nouvelle discussion." }, 413, headers);
    }
    try {
      const upstream = await fetch("https://api.1min.ai/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${ONE_MIN_API_KEY}` },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: "Tu es un assistant IA généraliste destiné aux administrateurs et rédacteurs de FO COM UES ILIAD. Réponds en français par défaut, clairement et utilement. Distingue les faits des hypothèses. N'invente pas de sources, de chiffres ou de références juridiques ; indique ce qui doit être vérifié. Pour les questions de droit, précise que la réponse est informative et ne remplace pas une vérification des textes à jour. Ne demande pas de données personnelles inutiles." },
            ...safeMessages,
          ],
          max_completion_tokens: 1800,
          store: false,
        }),
        signal: AbortSignal.timeout(120000),
      });
      const data = await upstream.json().catch(() => ({}));
      if (!upstream.ok) {
        console.error("1min.ai assistant chat error", upstream.status, model);
        return json({ error: upstream.status === 429 ? "Limite ou crédits 1min.ai atteints." : "Le modèle sélectionné est indisponible ou la requête a été refusée par 1min.ai." }, upstream.status === 429 ? 429 : 502, headers);
      }
      const reply = data?.choices?.[0]?.message?.content;
      if (typeof reply !== "string" || !reply.trim()) return json({ error: "La réponse de l’IA est vide." }, 502, headers);
      return json({ reply: reply.trim(), model: data?.model ?? model }, 200, headers);
    } catch (error) {
      console.error("1min.ai assistant chat failed", error);
      return json({ error: "L’assistant IA est temporairement indisponible." }, 502, headers);
    }
  }

  if (action === "code") {
    if (!canUseText) return json({ error: "Votre rôle ne permet pas de générer du code." }, 403, headers);
    if (!text || text.length > 20000) return json({ error: "La demande de code est obligatoire et limitée à 20 000 caractères." }, 400, headers);
    const requestedModel = typeof payload.model === "string" ? payload.model : "gpt-5.3-codex";
    if (!CODE_MODELS.has(requestedModel)) return json({ error: "Le modèle demandé n’est pas autorisé." }, 400, headers);
    const reasoning = ["low", "medium", "high"].includes(payload.reasoning ?? "") ? payload.reasoning! : "medium";
    const reasoningInstructions: Record<string, string> = {
      low: "Niveau demandé : rapide. Va directement à la solution, avec une explication concise et sans complexité inutile.",
      medium: "Niveau demandé : équilibré. Vérifie les hypothèses importantes, propose une solution maintenable et explique comment la tester.",
      high: "Niveau demandé : approfondi. Analyse les cas limites, la sécurité, les erreurs possibles, les dépendances et les tests avant de proposer une solution complète.",
    };
    try {
      const upstream = await fetch("https://api.1min.ai/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + ONE_MIN_API_KEY },
        body: JSON.stringify({
          model: requestedModel,
          messages: [
            { role: "system", content: taskInstructions.code + "\n\n" + reasoningInstructions[reasoning] },
            { role: "user", content: text },
          ],
          max_completion_tokens: reasoning === "high" ? 6000 : reasoning === "medium" ? 4000 : 2500,
          store: false,
        }),
        signal: AbortSignal.timeout(120000),
      });
      const data = await upstream.json().catch(() => ({}));
      if (!upstream.ok) {
        console.error("1min.ai code error", upstream.status, requestedModel);
        return json({ error: upstream.status === 429 ? "Limite ou crédits 1min.ai atteints." : "Le modèle sélectionné est indisponible ou la requête a été refusée par 1min.ai." }, upstream.status === 429 ? 429 : 502, headers);
      }
      const result = data?.choices?.[0]?.message?.content;
      if (typeof result !== "string" || !result.trim()) return json({ error: "La réponse du modèle est vide." }, 502, headers);
      return json({ result: result.trim(), model: data?.model ?? requestedModel, reasoning }, 200, headers);
    } catch (error) {
      console.error("1min.ai code request failed", error);
      return json({ error: "Le service de génération de code est temporairement indisponible." }, 502, headers);
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
