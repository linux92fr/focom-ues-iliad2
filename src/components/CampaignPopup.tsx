import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Mail, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { NewsletterSubscriptionForm } from "@/components/NewsletterSubscriptionForm";

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
  newsletter_enabled: boolean;
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
    // Le popup reste fermé pour la page en cours si le stockage est indisponible.
  }
}

export default function CampaignPopup() {
  const [candidate, setCandidate] = useState<CampaignPopupRecord | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const authenticatedRef = useRef(false);

  const loadPopup = useCallback(async (authenticated: boolean) => {
    const { data, error } = await supabase
      .from("popups")
      .select("id,title,content,button_text,button_url,image_url,start_date,end_date,is_active,show_to_authenticated,show_to_anonymous,display_frequency,position,newsletter_enabled")
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
    const fallbackPopup: CampaignPopupRecord = {
      id: "ouverture-permanences-fo-2026",
      title: "Les permanences FO COM sont ouvertes !",
      content: "FO COM UES ILIAD met en place des permanences syndicales pour être au plus près des salariés, vous écouter, répondre à vos questions et vous accompagner dans vos démarches.\\n\\nÀ Paris, retrouvez-nous les 1er et 3e mercredis de chaque mois, de 12 h à 14 h, au local FO situé au 16 rue de la Ville-l’Évêque, Paris 8e. Les rendez-vous peuvent être demandés directement depuis notre page dédiée.\\n\\nUne permanence téléphonique sera également disponible très prochainement : un numéro dédié sera opérationnel dans les prochains jours afin de faciliter les contacts. Les informations pratiques seront communiquées dès son activation.",
      button_text: "Découvrir les permanences",
      button_url: "/permanences",
      image_url: null,
      start_date: null,
      end_date: null,
      is_active: true,
      show_to_authenticated: true,
      show_to_anonymous: true,
      display_frequency: "session",
      position: "center",
      newsletter_enabled: true,
    };
    setCandidate(eligible ?? (wasAlreadySeen(fallbackPopup) ? null : fallbackPopup));
  }, []);

  const close = useCallback(() => {
    if (candidate) rememberSeen(candidate);
    setIsOpen(false);
  }, [candidate]);

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
      window.setTimeout(() => {
        if (mounted) void loadPopup(authenticated);
      }, 0);
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

  if (!candidate || !isOpen) return null;
  const position = candidate.position === "top"
    ? "items-start pt-5"
    : candidate.position === "bottom"
      ? "items-end pb-5"
      : "items-center";

  return (
    <div
      className={`fixed inset-0 z-[100] flex justify-center overflow-y-auto bg-slate-950/75 p-3 backdrop-blur-sm sm:p-5 ${position}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="campaign-popup-title"
      onClick={close}
    >
      <div
        className={`relative ${candidate.position === "center" || !candidate.position ? "my-auto" : "my-4"} flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-y-auto rounded-2xl bg-white shadow-2xl sm:rounded-3xl`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Fermer la fenêtre"
          className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-slate-600 shadow-lg ring-1 ring-slate-200 transition hover:text-slate-900"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="h-2 shrink-0 bg-gradient-to-r from-red-600 via-red-500 to-teal-600" />
        {candidate.image_url && <img src={candidate.image_url} alt="" className="max-h-64 w-full object-cover" />}
        <div className="p-5 sm:p-8">
          <p className="mb-3 inline-flex rounded-full bg-red-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-red-700">
            Ouverture officielle
          </p>
          <h2 id="campaign-popup-title" className="pr-10 text-2xl font-black leading-tight text-slate-900 sm:text-3xl">
            {candidate.title}
          </h2>
          {candidate.id === "ouverture-permanences-fo-2026" ? (
            <div className="mt-5 space-y-4 text-sm leading-6 text-slate-700 sm:text-base">
              <p>FO COM UES ILIAD met en place des <strong className="font-extrabold text-slate-950">permanences syndicales</strong> pour être au plus près des salariés, vous écouter, répondre à vos questions et vous accompagner dans vos démarches.</p>
              <div className="rounded-2xl border border-red-100 bg-red-50/70 p-4 sm:p-5">
                <p className="mb-3 flex items-center gap-2 font-extrabold text-red-700"><span aria-hidden="true">📍</span> Permanences à Paris</p>
                <div className="space-y-2 text-slate-800">
                  <p><strong className="font-extrabold">Quand ?</strong> Les 1er et 3e mercredis de chaque mois</p>
                  <p><strong className="font-extrabold">Horaires :</strong> de 12 h à 14 h</p>
                  <p><strong className="font-extrabold">Lieu :</strong> Local FO, 16 rue de la Ville-l’Évêque, Paris 8e</p>
                </div>
                <p className="mt-3 text-sm font-semibold text-red-700">Vous pouvez dès maintenant demander un rendez-vous depuis notre page dédiée.</p>
              </div>
              <div className="rounded-2xl border border-teal-100 bg-teal-50/80 p-4 sm:p-5">
                <p className="font-extrabold text-teal-900">📞 Bientôt : une permanence téléphonique</p>
                <p className="mt-2 text-teal-950">Un <strong className="font-extrabold">numéro dédié sera opérationnel dans les prochains jours</strong> afin de faciliter vos contacts avec FO COM. Les modalités pratiques seront communiquées dès son activation.</p>
              </div>
            </div>
          ) : (
            <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600 sm:text-base">
              {candidate.content.replace(/\\\\n/g, "\\n").replace(/\\n/g, "\\n")}
            </div>
          )}
          {candidate.newsletter_enabled !== false && (
            <section className="mt-6 rounded-2xl bg-slate-950 p-4 text-white sm:p-5" aria-label="Inscription à la newsletter">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600"><Mail className="h-5 w-5 text-white" /></span>
                <div>
                  <h3 className="text-base font-extrabold">Restez informés avec FO COM</h3>
                  <p className="text-xs text-slate-300">L’essentiel de l’actualité sociale et syndicale du groupe ILIAD.</p>
                </div>
              </div>
              <NewsletterSubscriptionForm />
              <p className="mt-3 text-[11px] leading-4 text-slate-400">Inscription facultative. Vos données sont utilisées uniquement pour l’envoi de la newsletter. Désinscription possible à tout moment.</p>
            </section>
          )}
          <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={close} className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">
              Fermer
            </button>
            {candidate.button_url && (
              <a href={candidate.button_url} onClick={close} className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700">
                {candidate.button_text || "En savoir plus"} <ArrowRight className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
