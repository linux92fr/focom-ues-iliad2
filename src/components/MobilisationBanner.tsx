import { ArrowRight, MessageCircle, Megaphone } from "lucide-react";

const STRIKE_SITE_URL = "https://greve.focomues-iliad.fr";

export default function MobilisationBanner() {
  return (
    <div className="relative z-40 overflow-hidden bg-[#d71920] text-white shadow-sm">
      <a
        href={STRIKE_SITE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Consulter le bilan de la mobilisation du 5 novembre 2026 et donner votre avis"
        className="group flex min-h-12 items-center gap-3 border-y border-white/15 px-3 py-2 outline-none transition-colors hover:bg-[#b9141c] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white sm:px-5"
      >
        <Megaphone className="h-4 w-4 shrink-0 text-white" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-col items-center justify-center gap-0.5 text-center sm:flex-row sm:gap-2">
            <span className="text-xs font-extrabold uppercase tracking-[0.1em] sm:text-sm">
              5 novembre : la mobilisation a eu lieu
            </span>
            <span className="hidden text-white/70 sm:inline" aria-hidden="true">·</span>
            <span className="text-[11px] font-medium text-white/90 sm:text-xs">
              À présent, faisons entendre les réalités des salariés d’Iliad
            </span>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[11px] font-black text-[#b9141c] transition-transform group-hover:translate-x-0.5 sm:text-xs">
          <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
          Donner mon avis <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </a>
    </div>
  );
}
