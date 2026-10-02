import { useEffect, useState } from "react";
import { ExternalLink, HeartPulse, Phone, ShieldCheck, X } from "lucide-react";

const STORAGE_KEY = "focom-octobre-rose-2026-seen";

export default function OctobreRosePopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!sessionStorage.getItem(STORAGE_KEY)) {
        const timer = window.setTimeout(() => setOpen(true), 700);
        return () => window.clearTimeout(timer);
      }
    } catch {
      setOpen(true);
    }
  }, []);

  const close = () => {
    try { sessionStorage.setItem(STORAGE_KEY, "1"); } catch {}
    setOpen(false);
  };

  const goToInformation = () => {
    close();
    window.setTimeout(() => {
      document.getElementById("octobre-rose")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="octobre-rose-popup-title">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <button type="button" onClick={close} aria-label="Fermer" className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-md transition hover:bg-white hover:text-slate-900">
          <X className="h-5 w-5" />
        </button>

        <div className="relative overflow-hidden bg-gradient-to-br from-pink-600 via-rose-500 to-fuchsia-600 px-6 pb-7 pt-8 text-white sm:px-9">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border-[32px] border-white/10" />
          <div className="pointer-events-none absolute -bottom-20 -left-12 h-44 w-44 rounded-full border-[28px] border-white/10" />
          <div className="relative">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.16em] backdrop-blur">
              <HeartPulse className="h-4 w-4" /> Octobre Rose 2026
            </div>
            <h2 id="octobre-rose-popup-title" className="max-w-xl text-3xl font-black leading-tight sm:text-4xl">Cancer du sein : s’informer, se faire dépister</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base">
              Le dépistage précoce et l’accès à une information fiable peuvent faire la différence. Retrouvez les recommandations officielles, les chiffres clés et les contacts utiles.
            </p>
          </div>
        </div>

        <div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-7">
          <div className="rounded-2xl border border-pink-100 bg-pink-50 p-4">
            <ShieldCheck className="mb-2 h-5 w-5 text-pink-600" />
            <p className="text-sm font-extrabold text-slate-900">Dépistage organisé</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">Mammographie et examen clinique tous les 2 ans pour les femmes de 50 à 74 ans sans symptômes ni facteur de risque particulier.</p>
          </div>
          <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
            <HeartPulse className="mb-2 h-5 w-5 text-rose-600" />
            <p className="text-sm font-extrabold text-slate-900">61 214 cas en 2023</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">12 765 décès ont été recensés en 2023 en France métropolitaine.</p>
          </div>
          <div className="rounded-2xl border border-fuchsia-100 bg-fuchsia-50 p-4">
            <Phone className="mb-2 h-5 w-5 text-fuchsia-600" />
            <p className="text-sm font-extrabold text-slate-900">Cancer Info</p>
            <a href="tel:0805123124" className="mt-1 block text-lg font-black text-fuchsia-700 hover:underline">0 805 123 124</a>
            <p className="text-xs text-slate-500">Service et appel gratuits</p>
          </div>
        </div>

        <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 sm:px-7">
          <p className="text-xs leading-relaxed text-slate-500">
            <strong className="text-slate-700">ALD et cancers :</strong> depuis le 1er octobre 2026, le décret n° 2026-285 supprime l’exonération de participation pour certains médicaments à service médical rendu faible. Cette mesure ne supprime pas le dispositif ALD.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <a href="https://www.cancer.fr/presse/sante-des-femmes-l-inca-reaffirme-l-importance-de-la-prevention-et-du-depistage-des-cancers-du-sein" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-pink-200 bg-white px-4 py-2.5 text-sm font-bold text-pink-700 hover:bg-pink-50">
              Source INCa <ExternalLink className="h-4 w-4" />
            </a>
            <button type="button" onClick={goToInformation} className="inline-flex items-center justify-center gap-2 rounded-xl bg-pink-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-pink-700">
              Voir toutes les informations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
