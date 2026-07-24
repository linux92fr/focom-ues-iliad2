import { useState } from "react";
import DOMPurify from "dompurify";
import { Gavel, Search, ExternalLink, AlertCircle, Loader2, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  searchJudilibre,
  getDecision,
  highlightSnippets,
  judilibreUrl,
  type JudilibreResult,
  type JudilibreDecision,
} from "@/lib/judilibre";

function clean(html: string): string {
  return DOMPurify.sanitize(html);
}

function formatDate(value?: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? value.slice(0, 10) : d.toLocaleDateString("fr-FR");
}

/** Ligne de métadonnées lisible pour une décision. */
function metaLine(r: JudilibreResult): string {
  return [r.jurisdiction, r.chamber, r.formation, r.number ? `n° ${r.number}` : null]
    .filter(Boolean)
    .join(" · ");
}

export default function Judilibre() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<JudilibreResult[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const [selected, setSelected] = useState<JudilibreResult | null>(null);
  const [decision, setDecision] = useState<JudilibreDecision | null>(null);
  const [decisionLoading, setDecisionLoading] = useState(false);
  const [decisionError, setDecisionError] = useState<string | null>(null);

  const runSearch = async (q?: string) => {
    const term = (q ?? query).trim();
    if (!term) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const res = await searchJudilibre({ query: term, pageSize: 15 });
      setResults(res.results ?? []);
      setTotal(res.total ?? res.results?.length ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la recherche.");
      setResults([]);
      setTotal(null);
    } finally {
      setLoading(false);
    }
  };

  const openDecision = async (r: JudilibreResult) => {
    setSelected(r);
    setDecision(null);
    setDecisionError(null);
    setDecisionLoading(true);
    try {
      const d = await getDecision(r.id, query.trim() || undefined);
      setDecision(d);
    } catch (err) {
      setDecisionError(err instanceof Error ? err.message : "Impossible de charger la décision.");
    } finally {
      setDecisionLoading(false);
    }
  };

  const decisionHtml = decision?.text_highlight || decision?.text || "";

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* En-tête */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Gavel className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Jurisprudence — Cour de cassation</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Recherchez dans les décisions de justice (base ouverte JUDILIBRE de la Cour de cassation).
          </p>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="bg-card rounded-2xl border border-border shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") runSearch();
              }}
              placeholder="Ex. : licenciement sans cause réelle et sérieuse, harcèlement moral…"
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl bg-muted/30 border border-border outline-none focus:border-primary text-foreground"
            />
          </div>
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
              ? "Aucune décision trouvée."
              : `${total} décision${(total ?? 0) > 1 ? "s" : ""}${
                  results.length < (total ?? 0) ? ` (affichage des ${results.length} premières)` : ""
                }`}
          </p>

          {results.map((r) => {
            const snippets = highlightSnippets(r);
            const date = formatDate(r.decision_date);
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => openDecision(r)}
                className="w-full text-left bg-card rounded-xl border border-border p-4 hover:border-primary/40 transition-colors space-y-1.5"
              >
                <div className="flex items-center flex-wrap gap-2 text-xs text-muted-foreground">
                  {r.type && <span className="px-2 py-0.5 rounded-full bg-muted">{r.type}</span>}
                  <span className="font-medium text-foreground">{metaLine(r)}</span>
                  {date && <span>· {date}</span>}
                  {r.solution && <span className="text-primary">· {r.solution}</span>}
                </div>
                {r.summary && (
                  <p className="text-sm text-foreground/90 leading-relaxed line-clamp-3">{r.summary}</p>
                )}
                {snippets[0] && !r.summary && (
                  <p
                    className="text-sm text-foreground/80 leading-relaxed line-clamp-3 [&_em]:bg-primary/20 [&_em]:not-italic [&_em]:rounded [&_em]:px-0.5"
                    dangerouslySetInnerHTML={{ __html: clean(snippets[0]) }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      <p className="text-[11px] text-muted-foreground text-center border-t border-border pt-4">
        Données issues de l'API JUDILIBRE (Cour de cassation) sous Licence ouverte. Informations
        générales — ne remplace pas un conseil juridique.
      </p>

      {/* Modale : décision complète */}
      <Dialog open={selected !== null} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-start gap-2 pr-6 text-base">
              <FileText className="w-4 h-4 mt-1 flex-shrink-0 text-primary" />
              <span>{selected ? metaLine(selected) : "Décision"}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 -mx-1 px-1">
            {selected && (
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-3">
                {formatDate(selected.decision_date) && <span>{formatDate(selected.decision_date)}</span>}
                {selected.solution && <span className="text-primary">{selected.solution}</span>}
                {selected.ecli && <span className="font-mono">{selected.ecli}</span>}
              </div>
            )}

            {decisionLoading && (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Chargement de la décision…
              </div>
            )}

            {!decisionLoading && decisionError && (
              <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{decisionError}</span>
              </div>
            )}

            {!decisionLoading && !decisionError && decisionHtml && (
              <div
                className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line [&_em]:bg-primary/20 [&_em]:not-italic [&_em]:rounded [&_em]:px-0.5"
                dangerouslySetInnerHTML={{ __html: clean(decisionHtml) }}
              />
            )}

            {!decisionLoading && !decisionError && !decisionHtml && (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Le texte intégral n'est pas disponible pour cette décision.
              </p>
            )}
          </div>

          {selected && judilibreUrl(selected) && (
            <div className="pt-2 border-t border-border">
              <a
                href={judilibreUrl(selected) ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
                Voir sur courdecassation.fr <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
