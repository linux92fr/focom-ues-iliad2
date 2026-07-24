import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { Loader2, ExternalLink, FileText, Info } from "lucide-react";
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
  consultJuri,
  consultKaliText,
  consultJorf,
  legifranceUrl,
  type LegifranceArticle,
  type ConsultSection,
  type ConsultTextResponse,
} from "@/lib/legifrance";

export interface LegifranceContentTarget {
  id?: string;
  title: string;
  /** Extraits de recherche (HTML avec <mark>) servant d'aperçu de repli. */
  snippets?: string[];
}

interface Props {
  target: LegifranceContentTarget | null;
  onOpenChange: (open: boolean) => void;
}

const ARTICLE_RE = /^(LEGIARTI|JORFARTI|KALIARTI|CETATARTI|CNILARTI)/;

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
  const [heading, setHeading] = useState("");
  const [articles, setArticles] = useState<LegifranceArticle[]>([]);
  const [juriHtml, setJuriHtml] = useState<string | null>(null);
  const [sectionTitles, setSectionTitles] = useState<string[]>([]);

  const open = target !== null;
  const url = legifranceUrl(target?.id);
  const snippets = target?.snippets ?? [];

  useEffect(() => {
    if (!open) return;
    const id = target?.id;
    setLoading(true);
    setArticles([]);
    setJuriHtml(null);
    setSectionTitles([]);
    setHeading(target?.title ?? "");

    let cancelled = false;

    (async () => {
      if (!id) {
        if (!cancelled) setLoading(false);
        return;
      }
      try {
        if (ARTICLE_RE.test(id)) {
          const res = await getArticle(id);
          if (cancelled) return;
          const art = res.article;
          setArticles(art ? [art] : []);
          if (art?.num) setHeading(`Article ${art.num}`);
        } else if (id.startsWith("JURITEXT") || id.startsWith("CETATTEXT")) {
          const res = await consultJuri(id);
          if (cancelled) return;
          setJuriHtml(res.text?.texteHtml || res.text?.texte || null);
          if (res.text?.titreLong || res.text?.titre) {
            setHeading(res.text.titreLong || res.text.titre || target!.title);
          }
        } else if (id.startsWith("KALI")) {
          const res = await consultKaliText(id);
          if (cancelled) return;
          if (res.title) setHeading(res.title);
          const flat = flattenArticles(res);
          setArticles(flat);
          if (flat.length === 0) setSectionTitles(collectSectionTitles(res.sections));
        } else if (id.startsWith("JORFTEXT")) {
          const res = await consultJorf(id);
          if (cancelled) return;
          if (res.title) setHeading(res.title);
          const flat = flattenArticles(res);
          setArticles(flat);
          if (flat.length === 0) setSectionTitles(collectSectionTitles(res.sections));
        } else if (id.startsWith("LEGITEXT")) {
          // consultCode pour les codes, consultLegi pour les autres textes LEGI.
          const res = await consultLegi({ textId: id }).catch(() => consultCode({ textId: id }));
          if (cancelled) return;
          if (res.title) setHeading(res.title);
          const flat = flattenArticles(res);
          setArticles(flat);
          if (flat.length === 0) setSectionTitles(collectSectionTitles(res.sections));
        }
        // Types non gérés → on retombe sur les extraits de recherche (snippets).
      } catch {
        // Échec de consultation → repli silencieux sur les extraits (aucune erreur affichée).
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, target]);

  const contentArticles = articles.filter((a) => articleHtml(a).trim().length > 0);
  const hasArticles = contentArticles.length > 0;
  const hasContent = Boolean(juriHtml) || hasArticles;
  const showSnippets = !loading && !hasContent && snippets.length > 0;
  const showSommaire = !loading && !hasContent && !showSnippets && sectionTitles.length > 0;
  const showEmpty = !loading && !hasContent && !showSnippets && !showSommaire;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-start gap-2 pr-6 text-base">
            <FileText className="w-4 h-4 mt-1 flex-shrink-0 text-primary" />
            <span
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(heading || "Texte juridique"),
              }}
            />
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 -mx-1 px-1">
          {loading && (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Chargement du contenu…
            </div>
          )}

          {!loading && juriHtml && (
            <div
              className="text-sm leading-relaxed text-foreground/90 [&_p]:mb-2 [&_a]:text-primary [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(juriHtml) }}
            />
          )}

          {!loading && hasArticles && (
            <div className="space-y-6">
              {contentArticles.map((a, i) => (
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

          {showSnippets && (
            <div className="space-y-2">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Info className="w-3.5 h-3.5" /> Aperçu des passages correspondant à votre recherche :
              </p>
              <div className="space-y-2">
                {snippets.map((s, i) => (
                  <div
                    key={i}
                    className="text-sm leading-relaxed text-foreground/90 bg-muted/30 border border-border rounded-lg px-3 py-2 [&_mark]:bg-primary/20 [&_mark]:text-foreground [&_mark]:rounded [&_mark]:px-0.5"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(s) }}
                  />
                ))}
              </div>
            </div>
          )}

          {showSommaire && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Ce texte est volumineux — voici son sommaire. Ouvrez-le sur Légifrance pour le détail
                article par article.
              </p>
              <ul className="text-sm space-y-1 list-disc pl-5">
                {sectionTitles.slice(0, 60).map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          )}

          {showEmpty && (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Le contenu détaillé n'est pas disponible ici. Consultez la version officielle sur
              Légifrance ci-dessous.
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
