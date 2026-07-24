import { supabase } from "@/integrations/supabase/client";

/**
 * Client frontend de l'API Légifrance, via l'Edge Function `legifrance-proxy`.
 * Aucune donnée d'authentification ici : tout passe par le proxy serveur.
 */

export type LegifranceAction =
  | "search"
  | "suggest"
  | "getArticle"
  | "getArticleWithId"
  | "consultCode"
  | "consultLegi"
  | "consultJuri"
  | "consultKaliText"
  | "consultJorf"
  | "tableMatieres"
  | "ping";

async function callProxy<T>(action: LegifranceAction, params: unknown): Promise<T> {
  const { data, error } = await supabase.functions.invoke("legifrance-proxy", {
    body: { action, params },
  });

  if (error) {
    // Tente de récupérer un message d'erreur détaillé renvoyé par le proxy.
    // NB : on extrait le message dans une variable AVANT de throw, sinon le throw
    // serait capturé par le catch du parsing et on perdrait le détail.
    let message = error.message || "Erreur Légifrance";
    const context = (error as { context?: Response } | null)?.context;
    if (context) {
      try {
        const payload = await context.clone().json();
        message = payload?.error || payload?.message || payload?.details || message;
        if (payload?.details && typeof payload.details === "object") {
          const detailMsg =
            (payload.details as { message?: string; error?: string }).message ??
            (payload.details as { message?: string; error?: string }).error;
          if (detailMsg) message = `${message} — ${detailMsg}`;
        }
      } catch {
        /* corps non JSON : on garde error.message */
      }
    }
    throw new Error(message);
  }

  if (data && typeof data === "object" && "error" in data && (data as { error?: string }).error) {
    throw new Error((data as { error: string }).error);
  }

  return data as T;
}

// --- Types de recherche (sous-ensemble de l'API) ---

export type Fond =
  | "ALL"
  | "CODE_DATE"
  | "CODE_ETAT"
  | "LODA_DATE"
  | "LODA_ETAT"
  | "JORF"
  | "JURI"
  | "KALI"
  | "CETAT"
  | "CONSTIT"
  | "CIRC";

export interface SearchResultItem {
  titles?: { id?: string; cid?: string; title?: string; legalStatus?: string }[];
  title?: string;
  id?: string;
  nature?: string;
  date?: string;
  origin?: string;
  type?: string;
  sections?: unknown[];
  [key: string]: unknown;
}

export interface SearchResponse {
  totalResultNumber?: number;
  results?: SearchResultItem[];
  executionTime?: number;
  [key: string]: unknown;
}

/**
 * Recherche générique en texte plein sur un fonds donné.
 * Par défaut : recherche dans tous les champs (ALL), tri par pertinence.
 */
export function searchLegifrance(options: {
  query: string;
  fond?: Fond;
  pageSize?: number;
  pageNumber?: number;
  sort?: string;
  typeChamp?: string;
  typeRecherche?: "UN_DES_MOTS" | "EXACTE" | "TOUS_LES_MOTS_DANS_UN_CHAMP";
}): Promise<SearchResponse> {
  const {
    query,
    fond = "ALL",
    pageSize = 10,
    pageNumber = 1,
    sort = "PERTINENCE",
    typeChamp = "ALL",
    typeRecherche = "TOUS_LES_MOTS_DANS_UN_CHAMP",
  } = options;

  return callProxy<SearchResponse>("search", {
    fond,
    recherche: {
      champs: [
        {
          typeChamp,
          criteres: [{ valeur: query, typeRecherche, operateur: "ET" }],
          operateur: "ET",
        },
      ],
      filtres: [],
      pageNumber,
      pageSize,
      operateur: "ET",
      sort,
      typePagination: "DEFAUT",
    },
  });
}

// --- Suggestions / autocomplétion ---

export interface SuggestResponse {
  totalResultNumber?: number;
  results?: Record<string, Record<string, { titre?: string; id?: string; type?: string }>>;
  executionTime?: number;
  [key: string]: unknown;
}

export function suggestLegifrance(searchText: string): Promise<SuggestResponse> {
  return callProxy<SuggestResponse>("suggest", { searchText });
}

// --- Consultation d'un article par identifiant ---

export interface LegifranceArticle {
  id?: string;
  num?: string;
  texte?: string;
  texteHtml?: string;
  nota?: string;
  notaHtml?: string;
  etat?: string;
  dateDebut?: string;
  dateFin?: string;
  cid?: string;
  content?: string;
  [key: string]: unknown;
}

export interface ArticleResponse {
  article?: LegifranceArticle;
  [key: string]: unknown;
}

export function getArticle(id: string): Promise<ArticleResponse> {
  return callProxy<ArticleResponse>("getArticle", { id });
}

// --- Consultation d'un texte (CODE / LODA / JORF…) ---

export interface ConsultSection {
  title?: string;
  etat?: string;
  id?: string;
  cid?: string;
  articles?: LegifranceArticle[];
  sections?: ConsultSection[];
  [key: string]: unknown;
}

export interface ConsultTextResponse {
  title?: string;
  nature?: string;
  etat?: string;
  cid?: string;
  id?: string;
  articles?: LegifranceArticle[];
  sections?: ConsultSection[];
  visa?: string;
  notice?: string;
  nota?: string;
  [key: string]: unknown;
}

/** Alias historique. */
export type CodeResponse = ConsultTextResponse;

/**
 * Consulte un CODE (table des matières si `sctCid` omis, sinon une section).
 * `textId` : Chronical ID du code (ex. Code du travail : "LEGITEXT000006072050").
 */
export function consultCode(options: {
  textId: string;
  date?: string;
  sctCid?: string;
}): Promise<ConsultTextResponse> {
  const { textId, date = new Date().toISOString().slice(0, 10), sctCid } = options;
  return callProxy<ConsultTextResponse>("consultCode", {
    textId,
    date,
    ...(sctCid ? { sctCid } : {}),
  });
}

/**
 * Consulte un texte du fonds LEGI/LODA (loi, décret, arrêté…) par son
 * identifiant de texte. Retourne le texte et ses articles.
 */
export function consultLegi(options: {
  textId: string;
  date?: string;
}): Promise<ConsultTextResponse> {
  const { textId, date = new Date().toISOString().slice(0, 10) } = options;
  return callProxy<ConsultTextResponse>("consultLegi", { textId, date });
}

/** Consulte une convention collective (fonds KALI) par son identifiant de texte. */
export function consultKaliText(id: string): Promise<ConsultTextResponse> {
  return callProxy<ConsultTextResponse>("consultKaliText", { id });
}

/** Consulte un texte du Journal officiel (fonds JORF) par son cid de texte. */
export function consultJorf(textCid: string): Promise<ConsultTextResponse> {
  return callProxy<ConsultTextResponse>("consultJorf", { textCid });
}

/** Réponse de consultation d'une décision de jurisprudence (fonds JURI). */
export interface JuriResponse {
  text?: {
    titre?: string;
    titreLong?: string;
    texteHtml?: string;
    texte?: string;
    juridiction?: string;
    nature?: string;
    dateTexte?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/** Consulte une décision de jurisprudence (fonds JURI) par son identifiant de texte. */
export function consultJuri(textId: string): Promise<JuriResponse> {
  return callProxy<JuriResponse>("consultJuri", { textId });
}

/**
 * Extrait les passages (extraits) déjà présents dans un résultat de recherche.
 * Ces extraits contiennent le texte correspondant à la requête (avec <mark>…</mark>)
 * et servent d'aperçu de repli lorsque la consultation complète n'est pas dispo.
 */
export function extractSnippets(item: SearchResultItem): string[] {
  const out: string[] = [];
  const sections = (item.sections ?? []) as Array<{
    extracts?: Array<{ values?: string[] }>;
  }>;
  sections.forEach((s) => {
    (s.extracts ?? []).forEach((ex) => {
      (ex.values ?? []).forEach((v) => {
        if (typeof v === "string" && v.trim()) out.push(v);
      });
    });
  });
  return out;
}

/** Codes fréquemment consultés (Chronical IDs stables). */
export const CODES = {
  travail: { id: "LEGITEXT000006072050", label: "Code du travail" },
  securiteSociale: { id: "LEGITEXT000006073189", label: "Code de la sécurité sociale" },
  penal: { id: "LEGITEXT000006070719", label: "Code pénal" },
  civil: { id: "LEGITEXT000006070721", label: "Code civil" },
} as const;

/** Construit l'URL publique Légifrance d'un texte/article à partir de son ID. */
export function legifranceUrl(id?: string): string | null {
  if (!id) return null;
  if (id.startsWith("LEGIARTI") || id.startsWith("JORFARTI") || id.startsWith("KALIARTI")) {
    return `https://www.legifrance.gouv.fr/codes/article_lc/${id}`;
  }
  if (id.startsWith("LEGITEXT") || id.startsWith("KALITEXT")) {
    return `https://www.legifrance.gouv.fr/codes/texte_lc/${id}`;
  }
  if (id.startsWith("JORFTEXT")) {
    return `https://www.legifrance.gouv.fr/jorf/id/${id}`;
  }
  return `https://www.legifrance.gouv.fr/search/all?query=${encodeURIComponent(id)}`;
}
