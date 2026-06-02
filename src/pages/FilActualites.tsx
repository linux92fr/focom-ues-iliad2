import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { FileDown, Newspaper, CalendarDays, ArrowRight, Wifi } from "lucide-react";
import logoFocom from "@/assets/logo-focom.png";

const SITE_URL = "https://beta.focomues-iliad.fr";

function useInView(ref: React.RefObject<Element>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("in-view"); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref]);
}

function AnimatedItem({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useInView(ref as React.RefObject<Element>);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className="translate-y-4 opacity-0 transition-all duration-500 [&.in-view]:translate-y-0 [&.in-view]:opacity-100"
    >
      {children}
    </div>
  );
}

export default function FilActualites() {
  const { data: tracts = [] } = useQuery({
    queryKey: ["fil-tracts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("tracts")
        .select("id, title, subtitle, theme, published_at, file_url, cover_url")
        .eq("published", true)
        .order("published_at", { ascending: false })
        .limit(6);
      return data ?? [];
    },
  });

  const { data: articles = [] } = useQuery({
    queryKey: ["fil-articles"],
    queryFn: async () => {
      const { data } = await supabase
        .from("articles")
        .select("id, title, slug, category, published_at, image_url, excerpt")
        .eq("published", true)
        .order("published_at", { ascending: false })
        .limit(6);
      return data ?? [];
    },
  });

  const themeColors: Record<string, string> = {
    nao: "bg-red-100 text-red-700",
    elections: "bg-blue-100 text-blue-700",
    droits: "bg-teal-100 text-teal-700",
    sante: "bg-green-100 text-green-700",
    teletravail: "bg-purple-100 text-purple-700",
    general: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header compact mobile */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3 max-w-lg mx-auto">
          <img src={logoFocom} alt="FOCOM" className="h-9 w-9 object-contain" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-slate-900 leading-tight">FOCOM UES ILIAD</p>
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <Wifi className="w-3 h-3" /> Fil d'actualités en direct
            </p>
          </div>
          <Link
            to="/"
            className="text-xs text-red-600 font-semibold px-3 py-1.5 rounded-full border border-red-200 hover:bg-red-50 transition-colors"
          >
            Site complet →
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5 space-y-6">

        {/* Tracts récents */}
        {tracts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileDown className="w-4 h-4 text-red-600" /> Derniers tracts
              </h2>
              <Link to="/tracts" className="text-xs text-red-600 font-medium flex items-center gap-1">
                Tous <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {tracts.map((tract, i) => (
                <AnimatedItem key={tract.id} delay={i * 60}>
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex gap-3 p-3">
                    {tract.cover_url ? (
                      <img
                        src={tract.cover_url}
                        alt={tract.title}
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl flex-shrink-0 bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                        <FileDown className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <Badge className={`text-[10px] mb-1 ${themeColors[tract.theme] ?? themeColors.general}`}>
                        {tract.theme}
                      </Badge>
                      <p className="text-sm font-semibold text-slate-900 leading-tight line-clamp-2">{tract.title}</p>
                      {tract.file_url && (
                        <a
                          href={tract.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-semibold text-red-600 hover:text-red-700"
                        >
                          <FileDown className="w-3 h-3" /> Télécharger PDF
                        </a>
                      )}
                    </div>
                  </div>
                </AnimatedItem>
              ))}
            </div>
          </section>
        )}

        {/* Actualités récentes */}
        {articles.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-red-600" /> Actualités
              </h2>
              <Link to="/actualites" className="text-xs text-red-600 font-medium flex items-center gap-1">
                Toutes <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {articles.map((article, i) => (
                <AnimatedItem key={article.id} delay={i * 60}>
                  <Link
                    to={`/actualites/${article.slug}`}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex gap-3 p-3 hover:border-red-200 transition-colors block"
                  >
                    {article.image_url ? (
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl flex-shrink-0 bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                        <Newspaper className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      {article.category && (
                        <Badge variant="outline" className="text-[10px] mb-1">{article.category}</Badge>
                      )}
                      <p className="text-sm font-semibold text-slate-900 leading-tight line-clamp-2">{article.title}</p>
                      {article.published_at && (
                        <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" />
                          {new Date(article.published_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      )}
                    </div>
                  </Link>
                </AnimatedItem>
              ))}
            </div>
          </section>
        )}

        {tracts.length === 0 && articles.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <Wifi className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Aucun contenu publié pour le moment</p>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center pt-4 pb-8 space-y-2">
          <img src={logoFocom} alt="FOCOM" className="h-10 w-10 mx-auto object-contain opacity-60" />
          <p className="text-xs text-slate-400">
            FOCOM UES ILIAD — <a href={SITE_URL} className="underline">{SITE_URL.replace("https://", "")}</a>
          </p>
          <p className="text-[11px] text-slate-300">Flux mis à jour en temps réel</p>
        </footer>
      </main>
    </div>
  );
}
