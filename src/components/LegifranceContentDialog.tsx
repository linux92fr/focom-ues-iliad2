import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { Loader2, ExternalLink, AlertCircle, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getArticle,
  consultLegi,
  consultCode,
  legifranceUrl,
  type LegifranceArticle,
  type ConsultSection,
  type ConsultTextResponse,
} from "@/lib/legifrance";

export interface LegifranceContentTarget {
  id?: string;
  title: string;
}

interface Props {
  target: LegifranceContentTarget | null;
  onOpenChange: (open: boolean) => void;
}

const ARTICLE_RE = /^(LEGIARTI|JORFARTI|KALIARTI|CETATARTI|CNILARTI)/;
const CODE_RE = /^LEGITEXT/;

/** Aplati récursivement tous les articles d'un texte (articles + sections imbriquées). */
function flattenArticles(res: ConsultTextResponse): LegifranceArticle[] {
  const out: LegifranceArticle[] = [];
  const walkSections = (sections?: ConsultSection[]) => {
    (sections ?? []).forEach((s) => {
      (s.articles ?? []).forEach((a) => out.push(a));
      walkSections(s.sections);
    });
  };
  (res.articles ?? []).forEach((a) => out.push(a));
  walkSections(res.sections);
  return out;
}

/** Titres de sections (pour un sommaire quand aucun article n'est renvoyé). */
function collectSectionTitles(sections?: ConsultSection[]): string[] {
  const out: string[] = [];
  (sections ?? []).forEach((s) => {
    if (s.title) out.push(s.title);
    out.push(...collectSectionTitles(s.sections));
  });
  return out;
}

function articleHtml(a: LegifranceArticle): string {
  return a.texteHtml || a.content || a.texte || "";
}

export default function LegifranceContentDialog({ target, onOpenChange }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [heading, setHeading] = useState("");
  const [articles, setArticles] = useState<LegifranceArticle[]>([]);
  const [sectionTitles, setSectionTitles] = useState<string[]>([]);

  const open = target !== null;
  const url = legifranceUrl(target?.id);

  useEffect(() => {
    if (!target?.id) {
      setArticles([]);
      setSectionTitles([]);
      setError(null);
      setHeading(target?.title ?? "");
      return;
    }

    let cancelled = false;
    const id = target.id;
    setLoading(true);
    setError(null);
    setArticles([]);
    setSectionTitles([]);
    setHeading(target.title);

    (async () => {
      try {
        if (ARTICLE_RE.test(id)) {
          const res = await getArticle(id);
          const art = res.article;
          if (cancelled) return;
          setArticles(art ? [art] : []);
          setHeading(art?.num ? `Article ${art.num}` : target.title);
        } else {
          const res = CODE_RE.test(id)
            ? await consultCode({ textId: id })
            : await consultLegi({ textId: id });
          if (cancelled) return;
          setHeading(res.title || target.title);
          const flat = flattenArticles(res);
          setArticles(flat);
          if (flat.length === 0) setSectionTitles(collectSectionTitles(res.sections));
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Impossible de charger le contenu.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [target]);

  const hasContent = articles.some((a) => articleHtml(a).trim().length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-start gap-2 pr-6 text-base">
            <FileText className="w-4 h-4 mt-1 flex-shrink-0 text-primary" />
            <span>{heading || "Texte juridique"}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 -mx-1 px-1">
          {loading && (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Chargement du contenu…
            </div>
          )}

          {!loading && error && (
            <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && hasContent && (
            <div className="space-y-6">
              {articles
                .filter((a) => articleHtml(a).trim().length > 0)
                .map((a, i) => (
                  <article key={a.id ?? i} className="space-y-2">
                    {a.num && (
                      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        Article {a.num}
                        {a.etat && a.etat !== "VIGUEUR" && (
                          <span className="text-[10px] font-normal text-amber-600 dark:text-amber-500 uppercase">
                            {a.etat}
                          </span>
                        )}
                      </h3>
                    )}
                    <div
                      className="text-sm leading-relaxed text-foreground/90 [&_p]:mb-2 [&_a]:text-primary [&_a]:underline"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(articleHtml(a)) }}
                    />
                    {(a.notaHtml || a.nota) && (
                      <div className="text-xs text-muted-foreground border-l-2 border-border pl-3 mt-1">
                        <span className="font-medium">NOTA : </span>
                        <span
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(a.notaHtml || a.nota || ""),
                          }}
                        />
                      </div>
                    )}
                  </article>
                ))}
            </div>
          )}

          {/* Aucun article de contenu : afficher un sommaire des sections si dispo. */}
          {!loading && !error && !hasContent && sectionTitles.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Ce texte est volumineux — voici son sommaire. Ouvrez-le sur Légifrance pour le
                détail article par article.
              </p>
              <ul className="text-sm space-y-1 list-disc pl-5">
                {sectionTitles.slice(0, 60).map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          )}

          {!loading && !error && !hasContent && sectionTitles.length === 0 && (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Le contenu détaillé n'est pas disponible pour ce document.
            </p>
          )}
        </div>

        {url && (
          <div className="pt-2 border-t border-border">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
            >
              Voir la version officielle sur Légifrance <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
