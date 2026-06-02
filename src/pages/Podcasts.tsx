import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, Mic, Rss, Play, Clock, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import PodcastPlayer from "@/components/PodcastPlayer";
import AuthModal from "@/components/AuthModal";

const SUPABASE_URL = "https://qinekdmyycyujsrcsfbe.supabase.co";
const RSS_URL = `${SUPABASE_URL}/functions/v1/podcast-rss`;

interface Podcast {
  id: string;
  episode_number: number;
  title: string;
  description: string | null;
  transcript: string | null;
  audio_url: string;
  cover_url: string | null;
  duration_seconds: number | null;
  is_members_only: boolean;
  published_at: string | null;
}

function formatDuration(s: number | null): string {
  if (!s) return "";
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h${(m % 60).toString().padStart(2, "0")}`;
  return `${m} min`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default function Podcasts() {
  const { user, isValidated } = useAuth();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [openTranscript, setOpenTranscript] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);

  const { data: episodes = [], isLoading } = useQuery({
    queryKey: ["podcasts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("podcasts")
        .select("*")
        .eq("is_published", true)
        .order("episode_number", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Podcast[];
    },
  });

  const canAccess = (ep: Podcast) => !ep.is_members_only || isValidated;

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 p-3 sm:p-4 lg:p-8">

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-[#13233A] p-6 text-white shadow-xl sm:p-8 lg:p-10 mb-6">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border-[52px] border-white/5" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-red-600/20 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <Badge className="mb-4 border border-white/15 bg-white/10 text-white hover:bg-white/10">
              <Mic className="mr-1 h-3.5 w-3.5" /> Podcast mensuel
            </Badge>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
              Le Podcast FO COM
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
              Chaque mois, vos délégués FO COM décryptent l'actualité sociale, vos droits et les négociations en cours au sein d'UES ILIAD.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={RSS_URL} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20 gap-2">
                  <Rss className="h-4 w-4" /> S'abonner (RSS)
                </Button>
              </a>
            </div>
          </div>

          <div className="grid gap-3">
            {[
              { icon: Mic, title: "Mensuel", text: "Un nouvel épisode chaque mois" },
              { icon: Lock, title: "Exclusif", text: "Certains épisodes réservés aux adhérents" },
              { icon: Rss, title: "Compatible", text: "Spotify, Apple Podcasts, Podcast Addict…" },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur flex items-center gap-3">
                <item.icon className="h-5 w-5 text-red-300 shrink-0" />
                <div>
                  <p className="font-bold text-sm">{item.title}</p>
                  <p className="text-xs text-white/60 mt-0.5">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Liste des épisodes */}
      <div className="max-w-3xl mx-auto space-y-4">

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-3xl bg-white border border-slate-200 p-5 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-xl bg-slate-100 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-100 rounded w-1/4" />
                    <div className="h-5 bg-slate-100 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && episodes.length === 0 && (
          <div className="rounded-3xl bg-white border border-slate-200 p-12 text-center shadow-sm">
            <Mic className="h-12 w-12 text-slate-200 mx-auto mb-4" />
            <p className="font-semibold text-slate-900">Aucun épisode publié pour l'instant</p>
            <p className="text-sm text-slate-500 mt-1">Le premier épisode arrive très bientôt.</p>
          </div>
        )}

        {episodes.map((ep) => {
          const isActive = activeId === ep.id;
          const accessible = canAccess(ep);

          return (
            <div key={ep.id} className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden transition-shadow hover:shadow-md">

              {/* En-tête de l'épisode */}
              <div className="p-4 sm:p-5">
                <div className="flex gap-4">
                  {/* Miniature */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl bg-slate-100 overflow-hidden">
                    {ep.cover_url
                      ? <img src={ep.cover_url} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-2xl font-black text-slate-300">
                          #{ep.episode_number}
                        </div>
                    }
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge variant="outline" className="text-[10px] border-slate-200 text-slate-500">
                        Épisode {ep.episode_number}
                      </Badge>
                      {ep.is_members_only && (
                        <Badge className="text-[10px] bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
                          <Lock className="w-2.5 h-2.5 mr-1" /> Adhérents
                        </Badge>
                      )}
                    </div>
                    <p className="font-bold text-slate-900 leading-snug">{ep.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      {ep.published_at && <span>{formatDate(ep.published_at)}</span>}
                      {ep.duration_seconds && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {formatDuration(ep.duration_seconds)}
                        </span>
                      )}
                    </div>
                    {ep.description && (
                      <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{ep.description}</p>
                    )}
                  </div>
                </div>

                {/* Bouton play */}
                <div className="mt-4">
                  {accessible ? (
                    <Button
                      onClick={() => setActiveId(isActive ? null : ep.id)}
                      size="sm"
                      className={`gap-2 rounded-xl ${isActive ? "bg-slate-800 hover:bg-slate-700" : "bg-red-600 hover:bg-red-700"} text-white`}
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      {isActive ? "Fermer le lecteur" : "Écouter"}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setAuthOpen(true)}
                      size="sm"
                      variant="outline"
                      className="gap-2 rounded-xl border-amber-300 text-amber-700 hover:bg-amber-50"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      {user ? "Compte en attente de validation" : "Se connecter pour écouter"}
                    </Button>
                  )}
                </div>
              </div>

              {/* Lecteur audio (si actif) */}
              {isActive && accessible && (
                <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                  <PodcastPlayer
                    audioUrl={ep.audio_url}
                    title={ep.title}
                    episodeNumber={ep.episode_number}
                    coverUrl={ep.cover_url ?? undefined}
                    durationSeconds={ep.duration_seconds ?? undefined}
                  />
                </div>
              )}

              {/* Transcription */}
              {ep.transcript && accessible && (
                <div className="border-t border-slate-100">
                  <button
                    onClick={() => setOpenTranscript(openTranscript === ep.id ? null : ep.id)}
                    className="w-full flex items-center justify-between px-4 sm:px-5 py-3 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <span>Transcription / Résumé</span>
                    {openTranscript === ep.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {openTranscript === ep.id && (
                    <div className="px-4 sm:px-5 pb-5">
                      <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {ep.transcript}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info abonnement */}
      {episodes.length > 0 && (
        <div className="max-w-3xl mx-auto mt-6 rounded-2xl bg-white border border-slate-200 p-4 flex flex-col sm:flex-row items-center gap-4 shadow-sm">
          <Rss className="h-8 w-8 text-orange-500 shrink-0" />
          <div className="text-center sm:text-left">
            <p className="font-semibold text-slate-900 text-sm">Abonnez-vous sur votre appli préférée</p>
            <p className="text-xs text-slate-500 mt-0.5">Copiez le lien RSS dans Spotify, Apple Podcasts, Podcast Addict, AntennaPod…</p>
          </div>
          <a href={RSS_URL} target="_blank" rel="noopener noreferrer" className="shrink-0">
            <Button size="sm" variant="outline" className="gap-2 rounded-xl">
              <ExternalLink className="w-3.5 h-3.5" /> Lien RSS
            </Button>
          </a>
        </div>
      )}

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </main>
  );
}
