import { ArrowRight, Megaphone } from "lucide-react";

const STRIKE_SITE_URL = "https://greve.focomues-iliad.fr";

export default function MobilisationBanner() {
  return (
    <div className="relative z-40 overflow-hidden bg-[#d71920] text-white shadow-sm">
      <a
        href={STRIKE_SITE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Découvrir le site de la mobilisation du 5 novembre 2026"
        className="group flex min-h-11 items-center gap-3 border-y border-white/15 px-3 py-2 outline-none transition-colors hover:bg-[#b9141c] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white sm:px-5"
      >
        <Megaphone className="h-4 w-4 shrink-0 text-white" aria-hidden="true" />
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="mobilisation-marquee-track flex w-max items-center gap-10 whitespace-nowrap text-xs font-extrabold uppercase tracking-[0.12em] sm:text-sm">
            <span>Jeudi 5 novembre 2026 · Mobilisons-nous pour nos salaires, nos emplois et nos droits</span>
            <span aria-hidden="true">•</span>
            <span>Retrouvez toutes les informations et préparez votre mobilisation</span>
            <span aria-hidden="true">•</span>
            <span>Jeudi 5 novembre 2026 · Mobilisons-nous pour nos salaires, nos emplois et nos droits</span>
            <span aria-hidden="true">•</span>
            <span>Retrouvez toutes les informations et préparez votre mobilisation</span>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[11px] font-black text-[#b9141c] transition-transform group-hover:translate-x-0.5 sm:text-xs">
          Voir le site <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </a>
    </div>
  );
}
