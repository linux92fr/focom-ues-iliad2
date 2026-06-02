import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { FileDown, Newspaper, CalendarDays, Wifi, EyeOff, Shield, Heart, MessageCircle, Send, Trash2, ChevronDown, ChevronUp, Clock } from "lucide-react";
import logoFocom from "@/assets/logo-focom.png";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

const SITE_URL = "https://focomues-iliad.fr";

const THEME_COLORS: Record<string, string> = {
  nao: "bg-red-100 text-red-700",
  elections: "bg-blue-100 text-blue-700",
  droits: "bg-teal-100 text-teal-700",
  sante: "bg-green-100 text-green-700",
  teletravail: "bg-purple-100 text-purple-700",
  general: "bg-slate-100 text-slate-700",
};

// Session anonyme persistée dans localStorage
function getSessionId(): string {
  const key = "focom_fil_session";
  let id = localStorage.getItem(key);
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(key, id); }
  return id;
}

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
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }}
      className="translate-y-3 opacity-0 transition-all duration-500 [&.in-view]:translate-y-0 [&.in-view]:opacity-100">
      {children}
    </div>
  );
}

type FeedItem =
  | { kind: "tract"; id: string; date: string; title: string; theme: string; file_url: string | null; cover_url: string | null }
  | { kind: "article"; id: string; date: string; title: string; slug: string; category: string | null; image_url: string | null };

function relativeDate(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "Aujourd'hui";
  if (d === 1) return "Hier";
  if (d < 7) return `Il y a ${d} jours`;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

// --- Composant réaction + commentaires ---
function ItemInteractions({ itemType, itemId, isAdmin }: { itemType: "tract" | "article"; itemId: string; isAdmin: boolean }) {
  const sessionId = getSessionId();
  const queryClient = useQueryClient();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const reactKey = ["fil-reactions", itemType, itemId];
  const commKey = ["fil-comments", itemType, itemId];

  const { data: reactions = [] } = useQuery({
    queryKey: reactKey,
    queryFn: async () => {
      const { data } = await supabase.from("fil_reactions")
        .select("id, session_id")
        .eq("item_type", itemType).eq("item_id", itemId);
      return data ?? [];
    },
  });

  const { data: comments = [] } = useQuery({
    queryKey: commKey,
    enabled: commentsOpen,
    queryFn: async () => {
      const { data } = await supabase.from("fil_comments")
        .select("id, author_name, content, created_at")
        .eq("item_type", itemType).eq("item_id", itemId)
        .order("created_at", { ascending: true });
      return data ?? [];
    },
  });

  const hasReacted = reactions.some((r) => r.session_id === sessionId);

  const toggleReaction = useMutation({
    mutationFn: async () => {
      if (hasReacted) {
        await supabase.from("fil_reactions").delete()
          .eq("item_type", itemType).eq("item_id", itemId).eq("session_id", sessionId);
      } else {
        await supabase.from("fil_reactions").insert({ item_type: itemType, item_id: itemId, session_id: sessionId });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: reactKey }),
  });

  const addComment = useMutation({
    mutationFn: async () => {
      if (!authorName.trim() || !content.trim()) return;
      await supabase.from("fil_comments").insert({
        item_type: itemType,
        item_id: itemId,
        author_name: authorName.trim(),
        content: content.trim(),
        status: "pending",
      });
    },
    onSuccess: () => {
      setContent("");
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: commKey });
    },
  });

  const deleteComment = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("fil_comments").delete().eq("id", id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: commKey }),
  });

  const { data: commentCount = 0 } = useQuery({
    queryKey: ["fil-comments-count", itemType, itemId],
    queryFn: async () => {
      const { count } = await supabase.from("fil_comments")
        .select("id", { count: "exact", head: true })
        .eq("item_type", itemType).eq("item_id", itemId);
      return count ?? 0;
    },
  });

  return (
    <div className="border-t border-slate-100 mt-2 pt-2">
      {/* Barre réaction + commentaire */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => toggleReaction.mutate()}
          className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full transition-all ${
            hasReacted
              ? "bg-red-50 text-red-600"
              : "text-slate-400 hover:bg-slate-50 hover:text-red-500"
          }`}
        >
          <Heart className={`w-4 h-4 ${hasReacted ? "fill-red-500 text-red-500" : ""}`} />
          <span className="text-xs">{reactions.length > 0 ? reactions.length : ""}</span>
        </button>

        <button
          onClick={() => setCommentsOpen((v) => !v)}
          className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-xs">{commentCount > 0 ? commentCount : ""}</span>
          {commentsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Section commentaires dépliable */}
      {commentsOpen && (
        <div className="mt-3 space-y-3">
          {/* Liste */}
          {comments.length > 0 && (
            <div className="space-y-2">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-2 items-start">
                  <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs shrink-0">
                    {c.author_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 bg-slate-50 rounded-xl px-3 py-2">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-semibold text-slate-900">{c.author_name}</p>
                      <div className="flex items-center gap-1">
                        <p className="text-[10px] text-slate-400">{relativeDate(c.created_at)}</p>
                        {isAdmin && (
                          <button onClick={() => deleteComment.mutate(c.id)}
                            className="text-slate-300 hover:text-red-500 transition-colors">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Formulaire */}
          {submitted ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 flex items-center gap-2 text-amber-700 text-xs">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>Votre commentaire est en attente de modération. Il sera visible une fois approuvé.</span>
            </div>
          ) : (
            <div className="space-y-2">
              <Input
                placeholder="Votre prénom"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="h-8 text-sm"
                maxLength={50}
              />
              <div className="flex gap-2">
                <Textarea
                  placeholder="Votre message…"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="text-sm min-h-[60px] resize-none flex-1"
                  maxLength={500}
                />
                <Button
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white h-auto px-3 shrink-0"
                  disabled={!authorName.trim() || !content.trim() || addComment.isPending}
                  onClick={() => addComment.mutate()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-[10px] text-slate-400">Votre commentaire sera publié après modération.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Page principale ---
export default function FilActualites() {
  const { isAuthenticated } = useAdminAuth();
  const [unpublishing, setUnpublishing] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: tracts = [] } = useQuery({
    queryKey: ["fil-tracts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("tracts").select("id, title, theme_id, published_at, file_url, image_url")
        .eq("is_published", true).order("published_at", { ascending: false }).limit(20);
      return data ?? [];
    },
  });

  const { data: articles = [] } = useQuery({
    queryKey: ["fil-articles"],
    queryFn: async () => {
      const { data } = await supabase
        .from("articles").select("id, title, slug, category, published_at, image_url")
        .eq("is_published", true).eq("status", "publie")
        .order("published_at", { ascending: false }).limit(20);
      return data ?? [];
    },
  });

  const handleUnpublish = useCallback(async (item: FeedItem) => {
    const key = `${item.kind}-${item.id}`;
    setUnpublishing(key);
    if (item.kind === "tract") {
      await supabase.from("tracts").update({ is_published: false }).eq("id", item.id);
    } else {
      await supabase.from("articles").update({ is_published: false, status: "brouillon" }).eq("id", item.id);
    }
    await queryClient.invalidateQueries({ queryKey: item.kind === "tract" ? ["fil-tracts"] : ["fil-articles"] });
    setUnpublishing(null);
  }, [queryClient]);

  const feed: FeedItem[] = [
    ...tracts.map((t) => ({
      kind: "tract" as const, id: t.id, date: t.published_at ?? "",
      title: t.title, theme: (t.theme_id as string) ?? "general",
      file_url: t.file_url ?? null, cover_url: t.image_url ?? null,
    })),
    ...articles.map((a) => ({
      kind: "article" as const, id: a.id, date: a.published_at ?? "",
      title: a.title, slug: a.slug, category: a.category ?? null, image_url: a.image_url ?? null,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3 max-w-lg mx-auto">
          <img src={logoFocom} alt="FOCOM" className="h-9 w-9 object-contain" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-slate-900 leading-tight">FOCOM UES ILIAD</p>
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <Wifi className="w-3 h-3" /> Fil d'actualités en direct
            </p>
          </div>
          <Link to="/" className="text-xs text-red-600 font-semibold px-3 py-1.5 rounded-full border border-red-200 hover:bg-red-50 transition-colors shrink-0">
            Site complet →
          </Link>
        </div>
        {isAuthenticated && (
          <div className="bg-amber-50 border-t border-amber-200 px-4 py-1.5 flex items-center justify-between max-w-lg mx-auto">
            <p className="text-[11px] text-amber-700 flex items-center gap-1 font-medium">
              <Shield className="w-3 h-3" /> Mode administration actif
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
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3">
                    {/* Contenu de la carte */}
                    <div className="flex gap-3">
                      {/* Thumbnail */}
                      {(item.kind === "tract" ? item.cover_url : item.image_url) ? (
                        <img
                          src={(item.kind === "tract" ? item.cover_url : item.image_url)!}
                          alt={item.title}
                          className="w-16 h-16 rounded-xl object-cover shrink-0"
                        />
                      ) : (
                        <div className={`w-16 h-16 rounded-xl shrink-0 flex items-center justify-center ${
                          item.kind === "tract"
                            ? "bg-gradient-to-br from-red-500 to-red-700"
                            : "bg-gradient-to-br from-slate-600 to-slate-800"
                        }`}>
                          {item.kind === "tract"
                            ? <FileDown className="w-6 h-6 text-white" />
                            : <Newspaper className="w-6 h-6 text-white" />
                          }
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          {item.kind === "tract" ? (
                            <>
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full">
                                <FileDown className="w-2.5 h-2.5" /> Tract
                              </span>
                              <Badge className={`text-[10px] py-0 ${THEME_COLORS[item.theme] ?? THEME_COLORS.general}`}>
                                {item.theme}
                              </Badge>
                            </>
                          ) : (
                            <>
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">
                                <Newspaper className="w-2.5 h-2.5" /> Actualité
                              </span>
                              {item.category && (
                                <Badge variant="outline" className="text-[10px] py-0">{item.category}</Badge>
                              )}
                            </>
                          )}
                        </div>

                        {item.kind === "article" ? (
                          <Link to={`/actualites/${item.slug}`} className="text-sm font-semibold text-slate-900 leading-tight line-clamp-2 hover:text-red-600 block">
                            {item.title}
                          </Link>
                        ) : (
                          <p className="text-sm font-semibold text-slate-900 leading-tight line-clamp-2">{item.title}</p>
                        )}

                        <div className="flex items-center justify-between mt-1 gap-2">
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0">
                            <CalendarDays className="w-3 h-3" />{item.date ? relativeDate(item.date) : ""}
                          </p>
                          <div className="flex items-center gap-2">
                            {item.kind === "tract" && item.file_url && (
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

                    {/* Réactions + Commentaires */}
                    <ItemInteractions
                      itemType={item.kind}
                      itemId={item.id}
                      isAdmin={isAuthenticated}
                    />
                  </div>
                </AnimatedItem>
              );
            })}
          </div>
        )}

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
