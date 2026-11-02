import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type CampaignPopupRecord = {
  id: string;
  title: string;
  content: string;
  button_text: string | null;
  button_url: string | null;
  image_url: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  show_to_authenticated: boolean;
  show_to_anonymous: boolean;
  display_frequency: string | null;
  position: string | null;
};

const storageKey = (id: string) => `focom-campaign-popup-${id}-seen`;

function wasAlreadySeen(item: CampaignPopupRecord) {
  try {
    if (item.display_frequency === "once") return localStorage.getItem(storageKey(item.id)) === "1";
    if (item.display_frequency === "session") return sessionStorage.getItem(storageKey(item.id)) === "1";
  } catch {
    return false;
  }
  return false;
}

function rememberSeen(item: CampaignPopupRecord) {
  try {
    if (item.display_frequency === "once") localStorage.setItem(storageKey(item.id), "1");
    if (item.display_frequency === "session") sessionStorage.setItem(storageKey(item.id), "1");
  } catch {
    // Le popup reste simplement fermé pour la page en cours si le stockage est indisponible.
  }
}

export default function CampaignPopup() {
  const [candidate, setCandidate] = useState<CampaignPopupRecord | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const authenticatedRef = useRef(false);

  const loadPopup = useCallback(async (authenticated: boolean) => {
    const { data, error } = await supabase
      .from("popups")
      .select("id,title,content,button_text,button_url,image_url,start_date,end_date,is_active,show_to_authenticated,show_to_anonymous,display_frequency,position")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Chargement des campagnes popup impossible :", error);
      setCandidate(null);
      return;
    }

    const now = Date.now();
    const eligible = ((data ?? []) as CampaignPopupRecord[]).find((item) => {
      const starts = !item.start_date || new Date(item.start_date).getTime() <= now;
      const ends = !item.end_date || new Date(item.end_date).getTime() >= now;
      const audience = authenticated ? item.show_to_authenticated : item.show_to_anonymous;
      return starts && ends && audience && !wasAlreadySeen(item);
    });
    setCandidate(eligible ?? null);
  }, []);

  useEffect(() => {
    let mounted = true;
    const initialise = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      const authenticated = Boolean(data.session?.user);
      authenticatedRef.current = authenticated;
      await loadPopup(authenticated);
    };
    void initialise();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const authenticated = Boolean(session?.user);
      authenticatedRef.current = authenticated;
      // Defer the query until Supabase has finished processing the auth event.
      window.setTimeout(() => { if (mounted) void loadPopup(authenticated); }, 0);
    });
    const channel = supabase
      .channel("public-campaign-popups")
      .on("postgres_changes", { event: "*", schema: "public", table: "popups" }, () => void loadPopup(authenticatedRef.current))
      .subscribe();

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
      void supabase.removeChannel(channel);
    };
  }, [loadPopup]);

  useEffect(() => {
    if (!candidate) {
      setIsOpen(false);
      return;
    }
    const timer = window.setTimeout(() => setIsOpen(true), 700);
    return () => window.clearTimeout(timer);
  }, [candidate?.id]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, close]);

  const close = useCallback(() => {
    if (candidate) rememberSeen(candidate);
    setIsOpen(false);
  }, [candidate]);

  if (!candidate || !isOpen) return null;
  const position = candidate.position === "top"
    ? "items-start pt-5"
    : candidate.position === "bottom"
      ? "items-end pb-5"
      : "items-center";

  return (
    <div className={`fixed inset-0 z-[100] flex justify-center overflow-y-auto bg-slate-950/75 p-3 backdrop-blur-sm sm:p-5 ${position}`}
      role="dialog" aria-modal="true" aria-labelledby="campaign-popup-title" onClick={close}>
      <div className={`relative ${candidate.position === "center" || !candidate.position ? "my-auto" : "my-4"} flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-y-auto rounded-2xl bg-white shadow-2xl sm:rounded-3xl`}
        onClick={(event) => event.stopPropagation()}>
        <button type="button" onClick={close} aria-label="Fermer la fenêtre"
          className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-slate-600 shadow-lg ring-1 ring-slate-200 transition hover:text-slate-900">
          <X className="h-5 w-5" />
        </button>
        <div className="h-2 shrink-0 bg-gradient-to-r from-red-600 via-red-500 to-teal-600" />
        {candidate.image_url && <img src={candidate.image_url} alt="" className="max-h-64 w-full object-cover" />}
        <div className="p-5 sm:p-8">
          <h2 id="campaign-popup-title" className="pr-10 text-2xl font-black leading-tight text-slate-900 sm:text-3xl">{candidate.title}</h2>
          <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600 sm:text-base">{candidate.content}</div>
          <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={close} className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Fermer</button>
            {candidate.button_url && <a href={candidate.button_url} onClick={close} className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700">{candidate.button_text || "En savoir plus"}<ArrowRight className="h-4 w-4" /></a>}
          </div>
        </div>
      </div>
    </div>
  );
}
