import { useEffect, useRef, useState } from "react";
import DOMPurify from "dompurify";
import {
  Scale,
  Search,
  ExternalLink,
  AlertCircle,
  Loader2,
  BookOpen,
  FolderTree,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  searchLegifrance,
  suggestLegifrance,
  legifranceUrl,
  extractSnippets,
  articlePreviews,
  CODES,
  type Fond,
  type SearchResultItem,
} from "@/lib/legifrance";

/** Formate une date ISO en JJ/MM/AAAA (ou renvoie la chaîne telle quelle). */
function formatDate(value?: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) return value.slice(0, 10);
  return d.toLocaleDateString("fr-FR");
}

/** Sanitize un fragment HTML (titres/extraits avec <mark>) avant rendu. */
function clean(html: string): string {
  return DOMPurify.sanitize(html);
}
import LegifranceContentDialog, {
  type LegifranceContentTarget,
} from "@/components/LegifranceContentDialog";

// Recherche limitée au domaine du droit du travail.
// Un « scope » = un fond, éventuellement restreint à une convention (IDCC).
interface Scope {
  key: string;
  label: string;
  fond: Fond;
  idcc?: string;
}

const SCOPES: Scope[] = [
  { key: "code", label: "Code du travail & codes", fond: "CODE_DATE" },
  { key: "ccnt", label: "CCNT Télécoms (IDCC 2148)", fond: "KALI", idcc: "2148" },
  { key: "juri", label: "Jurisprudence sociale", fond: "JURI" },
  { key: "loda", label: "Lois & décrets (travail)", fond: "LODA_DATE" },
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
  const [scopeKey, setScopeKey] = useState<string>("code");
  const scope = SCOPES.find((s) => s.key === scopeKey) ?? SCOPES[0];
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<LegifranceContentTarget | null>(null);
  const [searched, setSearched] = useState(false);
  const [inForceOnly, setInForceOnly] = useState(false);
  const [grouped, setGrouped] = useState(true);

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

  const PAGE_SIZE = 15;

  const runSearch = async (q?: string, pageArg = 1) => {
    const term = (q ?? query).trim();
    // Un mot-clé est requis, sauf pour un scope restreint à une convention (IDCC),
    // où l'on peut parcourir tout le texte sans mot-clé.
    if (!term && !scope.idcc) return;
    setShowSuggest(false);
    setLoading(true);
    setError(null);
    setSearched(true);
    setPage(pageArg);
    try {
      const res = await searchLegifrance({
        query: term,
        fond: scope.fond,
        idcc: scope.idcc,
        pageNumber: pageArg,
        pageSize: PAGE_SIZE,
      });
      setResults(res.results ?? []);
      setTotal(res.totalResultNumber ?? res.results?.length ?? 0);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la recherche.");
      setResults([]);
      setTotal(null);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil((total ?? 0) / PAGE_SIZE));

  // Filtre « en vigueur » (côté client, sur la page courante).
  const displayed = results.filter((item) => {
    if (!inForceOnly) return true;
    const status = String(item.titles?.[0]?.legalStatus ?? item.etat ?? "");
    return !/ABROG|PERIME|ANNUL|MODIFIE_MORT/i.test(status);
  });

  // Regroupement par chapitre/section (arborescence simple).
  const chapterOf = (item: SearchResultItem): string => {
    const secs = item.sections as Array<{ title?: string }> | undefined;
    return secs?.[0]?.title?.trim() || resultTitle(item) || "Autres";
  };
  const groups: { chapter: string; items: SearchResultItem[] }[] = [];
  if (grouped) {
    const index = new Map<string, number>();
    displayed.forEach((item) => {
      const ch = chapterOf(item);
      if (!index.has(ch)) {
        index.set(ch, groups.length);
        groups.push({ chapter: ch, items: [] });
      }
      groups[index.get(ch)!].items.push(item);
    });
  }

  const renderCard = (item: SearchResultItem, key: React.Key) => {
    const id = resultId(item);
    const url = legifranceUrl(id);
    const previews = articlePreviews(item);
    const date = formatDate(item.date as string | undefined);
    return (
      <div
        key={key}
        className="bg-card rounded-xl border border-border p-4 hover:border-primary/40 transition-colors space-y-3"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <button
              type="button"
              onClick={() =>
                setSelected({ id, title: resultTitle(item), snippets: extractSnippets(item) })
              }
              className="text-sm font-medium text-foreground text-left hover:text-primary [&_mark]:bg-primary/20 [&_mark]:rounded [&_mark]:px-0.5"
              dangerouslySetInnerHTML={{ __html: clean(resultTitle(item)) }}
            />
            <div className="flex flex-wrap gap-2 mt-1.5 text-xs text-muted-foreground">
              {item.nature && <span className="px-2 py-0.5 rounded-full bg-muted">{item.nature}</span>}
              {date && <span>{date}</span>}
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
              title="Voir sur Légifrance"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary flex-shrink-0"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {previews.length > 0 ? (
          <div className="space-y-1.5">
            {previews.slice(0, 4).map((p, j) => (
              <button
                key={p.id ?? j}
                type="button"
                onClick={() =>
                  setSelected({
                    id: p.id ?? id,
                    title: p.num ? `Article ${p.num}` : resultTitle(item),
                    snippets: [p.html],
                  })
                }
                className="w-full text-left rounded-lg bg-muted/30 hover:bg-muted/60 border border-border px-3 py-2 transition-colors"
              >
                {p.num && <span className="text-xs font-semibold text-primary">Article {p.num}</span>}
                <span
                  className="block text-xs text-foreground/80 leading-relaxed mt-0.5 line-clamp-3 [&_mark]:bg-primary/20 [&_mark]:rounded [&_mark]:px-0.5"
                  dangerouslySetInnerHTML={{ __html: clean(p.html) }}
                />
              </button>
            ))}
            {previews.length > 4 && (
              <p className="text-[11px] text-muted-foreground pl-1">
                + {previews.length - 4} autre{previews.length - 4 > 1 ? "s" : ""} article
                {previews.length - 4 > 1 ? "s" : ""}…
              </p>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() =>
              setSelected({ id, title: resultTitle(item), snippets: extractSnippets(item) })
            }
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <BookOpen className="w-3 h-3" /> Lire le contenu
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* En-tête */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Scale className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Recherche juridique</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Droit du travail : Code du travail, conventions collectives et jurisprudence sociale
            — données officielles de la DILA (Légifrance).
          </p>
        </div>
      </div>

      {/* Accès rapides aux codes */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground self-center mr-1">Accès rapide :</span>
        {[CODES.travail, CODES.securiteSociale].map((code) => (
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
            value={scopeKey}
            onChange={(e) => setScopeKey(e.target.value)}
            className="text-sm rounded-xl bg-muted/30 border border-border px-3 py-2.5 text-foreground outline-none focus:border-primary"
          >
            {SCOPES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => runSearch()}
            disabled={loading || (!query.trim() && !scope.idcc)}
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
          {/* Barre d'outils : compteur + filtres */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {total === 0
                ? "Aucun résultat."
                : `${total} résultat${(total ?? 0) > 1 ? "s" : ""}${
                    totalPages > 1 ? ` · page ${page}/${totalPages}` : ""
                  }`}
            </p>
            {(total ?? 0) > 0 && (
              <div className="flex items-center gap-3 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground">
                  <input
                    type="checkbox"
                    checked={inForceOnly}
                    onChange={(e) => setInForceOnly(e.target.checked)}
                    className="accent-primary"
                  />
                  En vigueur uniquement
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground">
                  <input
                    type="checkbox"
                    checked={grouped}
                    onChange={(e) => setGrouped(e.target.checked)}
                    className="accent-primary"
                  />
                  Grouper par chapitre
                </label>
              </div>
            )}
          </div>

          {/* Liste (groupée par chapitre ou à plat) */}
          {grouped
            ? groups.map((g, gi) => (
                <div key={gi} className="space-y-2">
                  <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground pt-1">
                    <FolderTree className="w-3.5 h-3.5" />
                    <span
                      className="[&_mark]:bg-primary/20 [&_mark]:rounded [&_mark]:px-0.5"
                      dangerouslySetInnerHTML={{ __html: clean(g.chapter) }}
                    />
                    <span className="text-muted-foreground/60">({g.items.length})</span>
                  </h3>
                  <div className="space-y-2 pl-1 border-l-2 border-border/60">
                    <div className="space-y-2 pl-3">
                      {g.items.map((item, i) => renderCard(item, resultId(item) ?? `${gi}-${i}`))}
                    </div>
                  </div>
                </div>
              ))
            : displayed.map((item, i) => renderCard(item, resultId(item) ?? i))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => runSearch(undefined, page - 1)}
                disabled={page <= 1 || loading}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-sm text-foreground hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" /> Précédent
              </button>
              <span className="text-sm text-muted-foreground">
                Page {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => runSearch(undefined, page + 1)}
                disabled={page >= totalPages || loading}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-sm text-foreground hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Suivant <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Avertissement */}
      <p className="text-[11px] text-muted-foreground text-center border-t border-border pt-4">
        Données issues de l'API Légifrance (DILA) sous Licence ouverte v2.0. Ce service fournit des
        informations générales et ne remplace pas un conseil juridique personnalisé.
      </p>

      {/* Consultation du contenu en page */}
      <LegifranceContentDialog
        target={selected}
        onOpenChange={(o) => {
          if (!o) setSelected(null);
        }}
      />
    </div>
  );
}
