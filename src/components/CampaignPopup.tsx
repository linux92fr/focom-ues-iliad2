import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowRight, Mail, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { NewsletterSubscriptionForm } from "@/components/NewsletterSubscriptionForm";
import { safeImageUrl, safeLinkUrl } from "@/lib/safe-url";

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
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Referme toujours le <dialog> natif AVANT que son nœud ne disparaisse du DOM :
  // un dialog modal retiré sans close() peut laisser toute la page inert (visible
  // mais plus cliquable, la souris bouge, seul un refresh répare) selon les
  // navigateurs, car l'état modal n'est pas toujours nettoyé au retrait du nœud.
  const closeDialogNode = useCallback(() => {
    const dialog = dialogRef.current;
    if (dialog?.open) dialog.close();
  }, []);

  // Le nettoyage d'un useLayoutEffect s'exécute avant que React ne retire le nœud
  // du DOM (contrairement au useEffect de démontage, trop tardif) : il couvre le
  // cas d'un démontage pendant que la popup est encore ouverte.
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, [candidate?.id]);

  // Load the third-party chat only after an explicit contact/help interaction.
  useEffect(() => {
    const onContactIntent = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const trigger = target.closest('a[href^="mailto:"], a[href^="tel:"], [data-load-brevo="true"]');
      if (!trigger || document.querySelector('script[data-brevo-conversations]')) return;

      window.BrevoConversationsID = "6aef97f55cde61e176062a23";
      const script = document.createElement("script");
      script.async = true;
      script.dataset.brevoConversations = "true";
      script.src = "https://conversations-widget.brevo.com/brevo-conversations.js";
      document.head.appendChild(script);
    };

    document.addEventListener("click", onContactIntent, { passive: true });
    return () => document.removeEventListener("click", onContactIntent);
  }, []);

  const loadPopup = useCallback(async (authenticated: boolean) => {
    const { data, error } = await supabase
      .from("popups")
      .select("id,title,content,button_text,button_url,image_url,start_date,end_date,is_active,show_to_authenticated,show_to_anonymous,display_frequency,position,newsletter_enabled")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Chargement des campagnes popup impossible :", error);
      closeDialogNode();
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
      content: "FO COM UES ILIAD met en place des permanences syndicales pour être au plus près des salariés, vous écouter, répondre à vos questions et vous accompagner dans vos démarches.\\n\\nÀ Paris, retrouvez-nous les 1er et 3e mercredis de chaque mois, de 12 h à 14 h, au local FO situé au 16 rue de la Ville-l’Évêque, Paris 8e. Les rendez-vous peuvent être demandés directement depuis notre page dédiée.\\n\\nPermanence téléphonique : appelez le 01 84 16 67 54, du lundi au vendredi, de 10 h à 16 h.",
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
    const nextCandidate = eligible ?? (wasAlreadySeen(fallbackPopup) ? null : fallbackPopup);
    if (!nextCandidate) closeDialogNode();
    setCandidate(nextCandidate);
  }, [closeDialogNode]);

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
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  if (!candidate) return null;
  const imageUrl = safeImageUrl(candidate.image_url);
  const buttonUrl = safeLinkUrl(candidate.button_url);
  const renderedContent = candidate.content.replace(/\\\\n/g, "\\n").replace(/\\n/g, "\n");
  const position = candidate.position === "top"
    ? "items-start pt-5"
    : candidate.position === "bottom"
      ? "items-end pb-5"
      : "items-center";

  return (
    <dialog
      ref={dialogRef}
      className={`native-modal fixed inset-0 m-0 flex h-dvh w-dvw max-h-none max-w-none justify-center overflow-y-auto border-0 bg-transparent p-3 sm:p-5 ${position}`}
      aria-labelledby="campaign-popup-title"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
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
        {imageUrl && <img src={imageUrl} alt="" className="max-h-64 w-full object-cover" />}
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
                <p className="font-extrabold text-teal-900">📞 Permanence téléphonique FO COM</p>
                <p className="mt-2 text-teal-950">Appelez-nous au <a href="tel:+33184166754" className="font-extrabold underline underline-offset-4">01 84 16 67 54</a>, du lundi au vendredi, de 10 h à 16 h.</p>
              </div>
            </div>
          ) : (
            <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600 sm:text-base">
              {renderedContent}
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
            {buttonUrl && (
              <a href={buttonUrl} onClick={close} className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700">
                {candidate.button_text || "En savoir plus"} <ArrowRight className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </dialog>
  );
}
