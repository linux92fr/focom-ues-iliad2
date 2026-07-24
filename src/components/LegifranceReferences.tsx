import { useEffect, useState } from "react";
import { BookOpen, ExternalLink, Scale } from "lucide-react";
import { searchLegifrance, legifranceUrl, type SearchResultItem } from "@/lib/legifrance";

interface Props {
  /** Texte de la question de l'utilisateur servant de requête Légifrance. */
  query?: string;
  /** Fonds à interroger (par défaut : tous). */
  fond?: Parameters<typeof searchLegifrance>[0]["fond"];
  /** Nombre maximum de références affichées. */
  max?: number;
}

function title(item: SearchResultItem): string {
  return item.titles?.[0]?.title ?? item.title ?? "Texte de référence";
}

function refId(item: SearchResultItem): string | undefined {
  return item.titles?.[0]?.id ?? item.titles?.[0]?.cid ?? item.id;
}

/**
 * Affiche des références juridiques officielles (Légifrance) liées à une question.
 *
 * Dégradation silencieuse : si l'API n'est pas encore accessible (accès PISTE non
 * activé), en erreur, ou sans résultat, le composant ne rend rien — il n'affiche
 * jamais d'erreur à l'utilisateur. Il « s'allumera » automatiquement dès que
 * l'accès Légifrance sera actif.
 */
export default function LegifranceReferences({ query, fond = "ALL", max = 4 }: Props) {
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const term = query?.trim();
    if (!term || term.length < 4) {
      setResults([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await searchLegifrance({ query: term, fond, pageSize: max });
        if (!cancelled) setResults((res.results ?? []).slice(0, max));
      } catch {
        // Dégradation silencieuse : on n'affiche aucune erreur.
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [query, fond, max]);

  // Rien à montrer (pas d'accès, pas de résultat) → composant invisible.
  if (loading || results.length === 0) return null;

  return (
    <div className="mt-3 rounded-xl border border-border bg-muted/20 p-3">
      <div className="flex items-center gap-1.5 mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <Scale className="w-3 h-3" />
        Sources officielles · Légifrance
      </div>
      <ul className="space-y-1.5">
        {results.map((item, i) => {
          const id = refId(item);
          const url = legifranceUrl(id);
          return (
            <li key={id ?? i}>
              <a
                href={url ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-2 text-xs text-foreground hover:text-primary transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-muted-foreground group-hover:text-primary" />
                <span className="flex-1 leading-snug">
                  {title(item)}
                  {item.nature && (
                    <span className="ml-1.5 text-[10px] text-muted-foreground">({item.nature})</span>
                  )}
                </span>
                <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-[10px] text-muted-foreground">
        Textes issus de l'API Légifrance (DILA) — vérifiez toujours la version en vigueur.
      </p>
    </div>
  );
}
