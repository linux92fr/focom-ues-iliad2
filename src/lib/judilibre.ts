import { supabase } from "@/integrations/supabase/client";

/**
 * Client frontend de l'API JUDILIBRE (jurisprudence de la Cour de cassation),
 * via l'Edge Function `judilibre-proxy`. Aucune donnée d'authentification ici.
 */

export type JudilibreAction = "search" | "decision" | "taxonomy" | "healthcheck" | "stats";

async function callProxy<T>(action: JudilibreAction, params: unknown): Promise<T> {
  const { data, error } = await supabase.functions.invoke("judilibre-proxy", {
    body: { action, params },
  });

  if (error) {
    let message = error.message || "Erreur JUDILIBRE";
    const context = (error as { context?: Response } | null)?.context;
    if (context) {
      try {
        const payload = await context.clone().json();
        message = payload?.error || payload?.message || message;
      } catch {
        /* corps non JSON */
      }
    }
    throw new Error(message);
  }

  if (data && typeof data === "object" && "error" in data && (data as { error?: string }).error) {
    throw new Error((data as { error: string }).error);
  }

  return data as T;
}

export interface JudilibreResult {
  id: string;
  jurisdiction?: string;
  chamber?: string;
  number?: string;
  numbers?: string[];
  ecli?: string;
  formation?: string;
  publication?: string[];
  decision_date?: string;
  type?: string;
  solution?: string;
  summary?: string;
  themes?: string[];
  score?: number;
  /** Segments avec correspondances (<em>…</em>), regroupés par champ. */
  highlights?: Record<string, string[]>;
  [key: string]: unknown;
}

export interface JudilibreSearchResponse {
  page?: number;
  page_size?: number;
  total?: number;
  next_page?: string;
  previous_page?: string;
  results?: JudilibreResult[];
  [key: string]: unknown;
}

export interface JudilibreDecision extends JudilibreResult {
  text?: string;
  text_highlight?: string;
  update_date?: string;
  visa?: unknown[];
  zones?: unknown;
  [key: string]: unknown;
}

/** Recherche de décisions dans la base ouverte JUDILIBRE. */
export function searchJudilibre(options: {
  query: string;
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: "asc" | "desc";
  operator?: "and" | "or" | "exact";
  jurisdiction?: string[];
}): Promise<JudilibreSearchResponse> {
  const {
    query,
    page = 0,
    pageSize = 15,
    sort = "score",
    order = "desc",
    operator = "and",
    jurisdiction,
  } = options;

  return callProxy<JudilibreSearchResponse>("search", {
    query,
    page,
    page_size: pageSize,
    sort,
    order,
    operator,
    ...(jurisdiction && jurisdiction.length ? { jurisdiction } : {}),
  });
}

/** Récupère le contenu intégral d'une décision par son identifiant. */
export function getDecision(id: string, query?: string): Promise<JudilibreDecision> {
  return callProxy<JudilibreDecision>("decision", {
    id,
    ...(query ? { query } : {}),
  });
}

/** Concatène les segments de correspondance d'un résultat (HTML avec <em>). */
export function highlightSnippets(result: JudilibreResult): string[] {
  const out: string[] = [];
  Object.values(result.highlights ?? {}).forEach((segments) => {
    (segments ?? []).forEach((s) => {
      if (typeof s === "string" && s.trim()) out.push(s);
    });
  });
  return out;
}

/** URL publique Judilibre (Cour de cassation) d'une décision, si connue. */
export function judilibreUrl(result: { id?: string; ecli?: string }): string | null {
  if (result.ecli) {
    return `https://www.courdecassation.fr/decision/${encodeURIComponent(result.ecli)}`;
  }
  return null;
}
