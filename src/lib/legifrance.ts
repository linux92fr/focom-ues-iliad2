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
  | "tableMatieres"
  | "ping";

async function callProxy<T>(action: LegifranceAction, params: unknown): Promise<T> {
  const { data, error } = await supabase.functions.invoke("legifrance-proxy", {
    body: { action, params },
  });

  if (error) {
    // Tente de récupérer un message d'erreur détaillé renvoyé par le proxy.
    const context = (error as { context?: Response } | null)?.context;
    if (context) {
      try {
        const payload = await context.clone().json();
        throw new Error(payload?.error || payload?.message || error.message);
      } catch {
        /* fallthrough */
      }
    }
    throw new Error(error.message || "Erreur Légifrance");
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

export interface ArticleResponse {
  article?: {
    id?: string;
    num?: string;
    texte?: string;
    etat?: string;
    dateDebut?: string;
    dateFin?: string;
    cid?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export function getArticle(id: string): Promise<ArticleResponse> {
  return callProxy<ArticleResponse>("getArticle", { id });
}

// --- Consultation d'un texte du fonds CODE (ex. Code du travail) ---

export interface CodeResponse {
  title?: string;
  sections?: unknown[];
  articles?: unknown[];
  [key: string]: unknown;
}

/**
 * Consulte un CODE (table des matières si `sctCid` omis, sinon une section).
 * `textId` : Chronical ID du code (ex. Code du travail : "LEGITEXT000006072050").
 */
export function consultCode(options: {
  textId: string;
  date?: string;
  sctCid?: string;
}): Promise<CodeResponse> {
  const { textId, date = new Date().toISOString().slice(0, 10), sctCid } = options;
  return callProxy<CodeResponse>("consultCode", {
    textId,
    date,
    ...(sctCid ? { sctCid } : {}),
  });
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
