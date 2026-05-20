const ALLOWED_ORIGINS = (Deno.env.get("ALLOWED_ORIGIN") ?? "")
  .split(",")
  .map((origin) => origin.trim())
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

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function hasAny(text: string, words: string[]) {
  const normalized = normalize(text);
  return words.some((word) => normalized.includes(normalize(word)));
}

function internalReply(question: string) {
  if (hasAny(question, ["teletravail", "télétravail", "tt", "distance"])) {
    return `Télétravail\n\nVotre question concerne le télétravail. Les points à vérifier sont généralement : l'éligibilité, le nombre de jours autorisés, les modalités de demande, les éventuels refus et le respect du droit à la déconnexion.\n\nPour une réponse adaptée à votre situation dans l'UES ILIAD, contactez FO COM via la page Contact ou Mes réclamations.`;
  }

  if (hasAny(question, ["maladie", "arret", "arrêt", "maintien", "absence", "ijss", "salaire"])) {
    return `Arrêt maladie / maintien de salaire\n\nVotre question concerne un arrêt maladie ou le maintien de salaire. Les points à vérifier sont : dates d'arrêt, ancienneté, indemnités journalières, maintien employeur, prévoyance et éventuelle erreur sur bulletin de paie.\n\nPour contrôler précisément votre situation, transmettez les éléments à FO COM via Mes réclamations.`;
  }

  if (hasAny(question, ["harcelement", "harcèlement", "pression", "discrimination", "rps", "stress"])) {
    return `Situation sensible au travail\n\nVotre question semble concerner une situation de pression, de discrimination, de harcèlement ou de risques psychosociaux. Il est important de garder des traces factuelles : dates, messages, témoins, mails et événements précis.\n\nNe restez pas seul : contactez rapidement un représentant FO COM, la médecine du travail ou utilisez Mes réclamations.`;
  }

  if (hasAny(question, ["licenciement", "rupture", "preavis", "préavis", "sanction", "avertissement", "disciplinaire"])) {
    return `Rupture / sanction\n\nVotre question concerne probablement une rupture du contrat ou une procédure disciplinaire. Les points importants sont : documents reçus, délais, entretien éventuel, motif écrit, conséquences sur salaire, préavis et solde de tout compte.\n\nAvant de signer ou contester un document, contactez FO COM pour un accompagnement personnalisé.`;
  }

  if (hasAny(question, ["prime", "salaire", "augmentation", "nao", "variable", "remuneration", "rémunération"])) {
    return `Rémunération / primes\n\nVotre question concerne la rémunération. Il faut comparer : contrat de travail, bulletin de paie, règles de prime, objectifs éventuels, accords NAO et pratiques appliquées.\n\nEn cas d'écart ou d'incompréhension, FO COM peut vous aider à vérifier les éléments.`;
  }

  if (hasAny(question, ["conge", "congé", "cp", "rtt", "vacances", "absence"])) {
    return `Congés / absences\n\nVotre question concerne les congés ou absences. Les points à vérifier sont : compteurs, demande écrite, validation ou refus, délais internes, jours spécifiques et impact paie.\n\nEn cas de refus ou d'anomalie, demandez une trace écrite et contactez FO COM.`;
  }

  if (hasAny(question, ["formation", "cpf", "vae", "gepp", "evolution", "évolution", "competence", "compétence"])) {
    return `Formation / parcours professionnel\n\nVotre question concerne la formation ou l'évolution professionnelle. Les sujets utiles sont : CPF, entretien professionnel, bilan de compétences, VAE, GEPP et demandes de formation.\n\nFO COM peut vous aider à préparer une demande écrite ou à vérifier vos droits.`;
  }

  return `Assistant juridique interne FO COM\n\nJe fonctionne actuellement en mode interne, sans appel à une API IA externe. Je peux orienter sur les principaux thèmes : télétravail, arrêt maladie, rémunération, congés, sanction, rupture, formation, harcèlement, discrimination ou risques psychosociaux.\n\nReformulez votre question avec quelques mots-clés, ou contactez directement FO COM via la page Contact ou Mes réclamations pour une analyse personnalisée.`;
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Méthode non autorisée" }, 405, corsHeaders);

  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages)) {
      return json({ error: "Messages requis" }, 400, corsHeaders);
    }

    const safeMessages: ChatMessage[] = messages
      .filter((message: { role?: string; content?: string }) =>
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string" &&
        message.content.trim().length > 0,
      )
      .map((message: { role: "user" | "assistant"; content: string }) => ({
        role: message.role,
        content: message.content.trim(),
      }));

    const lastUserMessage = [...safeMessages].reverse().find((message) => message.role === "user");

    if (!lastUserMessage) {
      return json({ error: "Message utilisateur requis" }, 400, corsHeaders);
    }

    return json({ reply: internalReply(lastUserMessage.content), provider: "internal" }, 200, corsHeaders);
  } catch (error) {
    console.error("chat-juridique internal error", error);
    return json({ error: "Erreur serveur chat-juridique" }, 500, corsHeaders);
  }
});
