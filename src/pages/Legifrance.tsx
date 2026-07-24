import { useEffect, useRef, useState } from "react";
import { Scale, Search, ExternalLink, AlertCircle, Loader2, BookOpen } from "lucide-react";
import {
  searchLegifrance,
  suggestLegifrance,
  legifranceUrl,
  CODES,
  type Fond,
  type SearchResultItem,
} from "@/lib/legifrance";

const FONDS: { value: Fond; label: string }[] = [
  { value: "ALL", label: "Tous les fonds" },
  { value: "CODE_DATE", label: "Codes (en vigueur)" },
  { value: "LODA_DATE", label: "Lois, ordonnances, décrets, arrêtés" },
  { value: "JORF", label: "Journal officiel (JORF)" },
  { value: "KALI", label: "Conventions collectives (KALI)" },
  { value: "JURI", label: "Jurisprudence judiciaire" },
];

function resultTitle(item: SearchResultItem): string {
  return (
    item.titles?.[0]?.title ??
    item.title ??
    (typeof item.nature === "string" ? item.nature : "Document") ??
    "Document"
  );
}

function resultId(item: SearchResultItem): string | undefined {
  return item.titles?.[0]?.id ?? item.titles?.[0]?.cid ?? item.id;
}

export default function Legifrance() {
  const [query, setQuery] = useState("");
  const [fond, setFond] = useState<Fond>("ALL");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Autocomplétion (débattue à 300 ms).
  useEffect(() => {
    if (suggestTimer.current) clearTimeout(suggestTimer.current);
    if (query.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    suggestTimer.current = setTimeout(async () => {
      try {
        const res = await suggestLegifrance(query.trim());
        const titres = new Set<string>();
        Object.values(res.results ?? {}).forEach((group) =>
          Object.values(group).forEach((v) => {
            if (v?.titre) titres.add(v.titre);
          }),
        );
        setSuggestions([...titres].slice(0, 6));
      } catch {
        setSuggestions([]);
      }
    }, 300);
    return () => {
      if (suggestTimer.current) clearTimeout(suggestTimer.current);
    };
  }, [query]);

  const runSearch = async (q?: string) => {
    const term = (q ?? query).trim();
    if (!term) return;
    setShowSuggest(false);
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const res = await searchLegifrance({ query: term, fond, pageSize: 15 });
      setResults(res.results ?? []);
      setTotal(res.totalResultNumber ?? res.results?.length ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la recherche.");
      setResults([]);
      setTotal(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* En-tête */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Scale className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Recherche Légifrance</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Recherchez dans les codes, lois, décrets, conventions collectives et la jurisprudence
            — données officielles de la DILA.
          </p>
        </div>
      </div>

      {/* Accès rapides aux codes */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground self-center mr-1">Accès rapide :</span>
        {Object.values(CODES).map((code) => (
          <a
            key={code.id}
            href={legifranceUrl(code.id) ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-muted/50 border border-border hover:border-primary hover:text-primary transition-colors"
          >
            <BookOpen className="w-3 h-3" />
            {code.label}
          </a>
        ))}
      </div>

      {/* Barre de recherche */}
      <div className="bg-card rounded-2xl border border-border shadow-sm p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggest(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") runSearch();
              }}
              onFocus={() => setShowSuggest(true)}
              onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
              placeholder="Ex. : durée du travail, congés payés, licenciement économique…"
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl bg-muted/30 border border-border outline-none focus:border-primary text-foreground"
            />
            {showSuggest && suggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-popover border border-border rounded-xl shadow-lg overflow-hidden">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setQuery(s);
                      runSearch(s);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors truncate"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <select
            value={fond}
            onChange={(e) => setFond(e.target.value as Fond)}
            className="text-sm rounded-xl bg-muted/30 border border-border px-3 py-2.5 text-foreground outline-none focus:border-primary"
          >
            {FONDS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => runSearch()}
            disabled={loading || !query.trim()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Rechercher
          </button>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Résultats */}
      {searched && !loading && !error && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {total === 0
              ? "Aucun résultat."
              : `${total} résultat${(total ?? 0) > 1 ? "s" : ""}${
                  results.length < (total ?? 0) ? ` (affichage des ${results.length} premiers)` : ""
                }`}
          </p>

          {results.map((item, i) => {
            const id = resultId(item);
            const url = legifranceUrl(id);
            return (
              <div
                key={id ?? i}
                className="bg-card rounded-xl border border-border p-4 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-foreground">{resultTitle(item)}</h3>
                    <div className="flex flex-wrap gap-2 mt-1.5 text-xs text-muted-foreground">
                      {item.nature && (
                        <span className="px-2 py-0.5 rounded-full bg-muted">{item.nature}</span>
                      )}
                      {item.date && <span>{item.date}</span>}
                      {item.titles?.[0]?.legalStatus && (
                        <span className="text-primary">{item.titles[0].legalStatus}</span>
                      )}
                    </div>
                  </div>
                  {url && (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline flex-shrink-0"
                    >
                      Ouvrir <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Avertissement */}
      <p className="text-[11px] text-muted-foreground text-center border-t border-border pt-4">
        Données issues de l'API Légifrance (DILA) sous Licence ouverte v2.0. Ce service fournit des
        informations générales et ne remplace pas un conseil juridique personnalisé.
      </p>
    </div>
  );
}
