import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileDown, Newspaper, CalendarDays, Wifi, EyeOff, Shield } from "lucide-react";
import logoFocom from "@/assets/logo-focom.png";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

const SITE_URL = "https://beta.focomues-iliad.fr";

const THEME_COLORS: Record<string, string> = {
  nao: "bg-red-100 text-red-700",
  elections: "bg-blue-100 text-blue-700",
  droits: "bg-teal-100 text-teal-700",
  sante: "bg-green-100 text-green-700",
  teletravail: "bg-purple-100 text-purple-700",
  general: "bg-slate-100 text-slate-700",
};

function useInView(ref: React.RefObject<Element>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("in-view"); obs.disconnect(); } },
      { threshold: 0.08 }
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
      className="translate-y-3 opacity-0 transition-all duration-500 [&.in-view]:translate-y-0 [&.in-view]:opacity-100"
    >
      {children}
    </div>
  );
}

type FeedItem =
  | { kind: "tract"; id: string; date: string; title: string; theme: string; file_url: string | null; cover_url: string | null }
  | { kind: "article"; id: string; date: string; title: string; slug: string; category: string | null; image_url: string | null; excerpt: string | null };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function relativeDate(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "Aujourd'hui";
  if (d === 1) return "Hier";
  if (d < 7) return `Il y a ${d} jours`;
  return formatDate(iso);
}

export default function FilActualites() {
  const { isAuthenticated } = useAdminAuth();
  const [unpublishing, setUnpublishing] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: tracts = [] } = useQuery({
    queryKey: ["fil-tracts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("tracts")
        .select("id, title, theme_id, published_at, file_url, image_url")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(20);
      return data ?? [];
    },
  });

  const { data: articles = [] } = useQuery({
    queryKey: ["fil-articles"],
    queryFn: async () => {
      const { data } = await supabase
        .from("articles")
        .select("id, title, slug, category, published_at, image_url, excerpt")
        .eq("is_published", true)
        .eq("status", "publie")
        .order("published_at", { ascending: false })
        .limit(20);
      return data ?? [];
    },
  });

  const handleUnpublish = async (item: FeedItem) => {
    const key = `${item.kind}-${item.id}`;
    setUnpublishing(key);
    if (item.kind === "tract") {
      await supabase.from("tracts").update({ is_published: false }).eq("id", item.id);
    } else {
      await supabase.from("articles").update({ is_published: false, status: "brouillon" }).eq("id", item.id);
    }
    await queryClient.invalidateQueries({ queryKey: item.kind === "tract" ? ["fil-tracts"] : ["fil-articles"] });
    setUnpublishing(null);
  };

  const feed: FeedItem[] = [
    ...tracts.map((t) => ({
      kind: "tract" as const,
      id: t.id,
      date: t.published_at ?? "",
      title: t.title,
      theme: (t.theme_id as string) ?? "general",
      file_url: t.file_url ?? null,
      cover_url: t.image_url ?? null,
    })),
    ...articles.map((a) => ({
      kind: "article" as const,
      id: a.id,
      date: a.published_at ?? "",
      title: a.title,
      slug: a.slug,
      category: a.category ?? null,
      image_url: a.image_url ?? null,
      excerpt: a.excerpt ?? null,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
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
            className="text-xs text-red-600 font-semibold px-3 py-1.5 rounded-full border border-red-200 hover:bg-red-50 transition-colors shrink-0"
          >
            Site complet →
          </Link>
        </div>
        {/* Bandeau admin */}
        {isAuthenticated && (
          <div className="bg-amber-50 border-t border-amber-200 px-4 py-1.5 flex items-center justify-between max-w-lg mx-auto">
            <p className="text-[11px] text-amber-700 flex items-center gap-1 font-medium">
              <Shield className="w-3 h-3" /> Mode administration — boutons de dépublication actifs
            </p>
            <Link to="/admin" className="text-[11px] text-amber-700 underline">Admin →</Link>
          </div>
        )}
      </header>

      <main className="max-w-lg mx-auto px-4 py-5">
        {feed.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Wifi className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Aucun contenu publié pour le moment</p>
          </div>
        ) : (
          <div className="space-y-3">
            {feed.map((item, i) => {
              const key = `${item.kind}-${item.id}`;
              const isLoading = unpublishing === key;
              return (
                <AnimatedItem key={key} delay={Math.min(i * 50, 400)}>
                  {item.kind === "tract" ? (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex gap-3 p-3">
                      {item.cover_url ? (
                        <img src={item.cover_url} alt={item.title} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl shrink-0 bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                          <FileDown className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full">
                            <FileDown className="w-2.5 h-2.5" /> Tract
                          </span>
                          <Badge className={`text-[10px] py-0 ${THEME_COLORS[item.theme] ?? THEME_COLORS.general}`}>
                            {item.theme}
                          </Badge>
                        </div>
                        <p className="text-sm font-semibold text-slate-900 leading-tight line-clamp-2">{item.title}</p>
                        <div className="flex items-center justify-between mt-1.5 gap-2">
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0">
                            <CalendarDays className="w-3 h-3" />{item.date ? relativeDate(item.date) : ""}
                          </p>
                          <div className="flex items-center gap-2">
                            {item.file_url && (
                              <a href={item.file_url} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-700">
                                <FileDown className="w-3 h-3" /> PDF
                              </a>
                            )}
                            {isAuthenticated && (
                              <Button size="sm" variant="ghost"
                                className="h-6 px-2 text-[11px] text-amber-600 hover:text-amber-700 hover:bg-amber-50 gap-1"
                                disabled={isLoading}
                                onClick={() => handleUnpublish(item)}>
                                <EyeOff className="w-3 h-3" />
                                {isLoading ? "…" : "Dépublier"}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex gap-3 p-3 hover:border-red-200 transition-colors">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.title} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl shrink-0 bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                          <Newspaper className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">
                            <Newspaper className="w-2.5 h-2.5" /> Actualité
                          </span>
                          {item.category && (
                            <Badge variant="outline" className="text-[10px] py-0">{item.category}</Badge>
                          )}
                        </div>
                        <Link to={`/actualites/${item.slug}`} className="text-sm font-semibold text-slate-900 leading-tight line-clamp-2 hover:text-red-600 block">
                          {item.title}
                        </Link>
                        <div className="flex items-center justify-between mt-1 gap-2">
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0">
                            <CalendarDays className="w-3 h-3" />{item.date ? relativeDate(item.date) : ""}
                          </p>
                          {isAuthenticated && (
                            <Button size="sm" variant="ghost"
                              className="h-6 px-2 text-[11px] text-amber-600 hover:text-amber-700 hover:bg-amber-50 gap-1"
                              disabled={isLoading}
                              onClick={() => handleUnpublish(item)}>
                              <EyeOff className="w-3 h-3" />
                              {isLoading ? "…" : "Dépublier"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </AnimatedItem>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <footer className="text-center pt-6 pb-8 space-y-2">
          <img src={logoFocom} alt="FOCOM" className="h-10 w-10 mx-auto object-contain opacity-50" />
          <p className="text-xs text-slate-400">
            FOCOM UES ILIAD — <a href={SITE_URL} className="underline">{SITE_URL.replace("https://", "")}</a>
          </p>
          <p className="text-[11px] text-slate-300">Flux mis à jour en temps réel</p>
        </footer>
      </main>
    </div>
  );
}
