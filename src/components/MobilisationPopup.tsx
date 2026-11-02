import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, Euro, FileText, Users, X } from "lucide-react";

const STORAGE_KEY = "focom-mobilisation-5-novembre-2026-seen";
const GUIDE_URL = "https://greve.focomues-iliad.fr/";

export default function MobilisationPopup() {
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

  useEffect(() => {
    if (!open) return;
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
  }, [open]);

  const close = () => {
    try { sessionStorage.setItem(STORAGE_KEY, "1"); } catch {}
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/75 p-2 backdrop-blur-sm sm:p-4"
      role="dialog" aria-modal="true" aria-labelledby="mobilisation-popup-title" onClick={close}>
      <div className="relative flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-y-auto overscroll-contain rounded-2xl bg-white shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}>
        <button type="button" onClick={close} aria-label="Fermer la fenêtre"
          className="absolute right-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-slate-600 shadow-lg ring-1 ring-slate-200 transition hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500">
          <X className="h-5 w-5" />
        </button>

        <div className="relative overflow-hidden bg-gradient-to-br from-[#b91c1c] via-[#dc2626] to-[#0f766e] px-5 pb-6 pt-8 text-white sm:px-9 sm:pb-8 sm:pt-10">
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border-[32px] border-white/10" />
          <div className="relative">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.12em]"><CalendarDays className="h-4 w-4" /> Jeudi 5 novembre 2026</div>
            <h2 id="mobilisation-popup-title" className="max-w-xl pr-10 text-2xl font-black leading-tight sm:text-4xl">Salaires, emploi, pouvoir d’achat : mobilisons-nous !</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base">La mobilisation concerne chacune et chacun d’entre nous. FO COM met à votre disposition un guide pour exercer votre droit de grève en connaissance de cause.</p>
          </div>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-6">
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4"><Euro className="mb-2 h-5 w-5 text-red-700" /><p className="font-extrabold text-slate-900">Pouvoir d’achat</p><p className="mt-1 text-xs leading-relaxed text-slate-600">Faire entendre les revendications salariales et défendre le niveau de vie.</p></div>
          <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4"><Users className="mb-2 h-5 w-5 text-teal-700" /><p className="font-extrabold text-slate-900">Emploi et conditions de travail</p><p className="mt-1 text-xs leading-relaxed text-slate-600">Agir face aux réorganisations et aux inquiétudes sur l’avenir des métiers.</p></div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><FileText className="mb-2 h-5 w-5 text-slate-700" /><p className="font-extrabold text-slate-900">Le droit de grève</p><p className="mt-1 text-xs leading-relaxed text-slate-600">Durée, modalités, absence et retenue sur salaire : les réponses dans le guide.</p></div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <p className="text-xs leading-relaxed text-slate-500">Une grève peut être exercée pour une durée limitée. Consultez le guide pour connaître les règles applicables à votre situation.</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={close} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100">Plus tard</button>
            <a href={GUIDE_URL} onClick={close} className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-red-700">Voir le guide pratique <ArrowRight className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
    </div>
  );
}
