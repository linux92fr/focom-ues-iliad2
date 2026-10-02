import { useState } from "react";
import { ChevronDown, ExternalLink, HeartPulse, Phone, ShieldAlert, Stethoscope } from "lucide-react";

export default function OctobreRoseFlash() {
  const [open, setOpen] = useState(false);

  return (
    <section id="octobre-rose" className="mb-6 scroll-mt-6 overflow-hidden rounded-3xl border border-pink-200 bg-gradient-to-br from-pink-50 via-white to-rose-50 shadow-lg">
      <div className="relative overflow-hidden bg-gradient-to-r from-pink-600 via-rose-500 to-fuchsia-600 px-5 py-5 text-white sm:px-7">
        <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full border-[24px] border-white/15" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <HeartPulse className="h-6 w-6" />
            </div>
            <div>
              <div className="mb-1 text-xs font-extrabold uppercase tracking-[0.18em] text-pink-100">Octobre Rose 2026</div>
              <h2 className="text-2xl font-black sm:text-3xl">Cancer du sein : s’informer, se faire dépister, agir</h2>
              <p className="mt-1 text-sm text-white/90">Un rappel utile pour vous et vos proches — informations issues des organismes publics de référence.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-pink-700 shadow-sm transition hover:bg-pink-50"
            aria-expanded={open}
          >
            {open ? "Réduire" : "Voir les informations"}
            <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-pink-100 bg-white p-4">
          <div className="mb-3 flex items-center gap-2 text-pink-700">
            <Stethoscope className="h-5 w-5" />
            <h3 className="font-extrabold">Dépistage</h3>
          </div>
          <p className="text-sm leading-relaxed text-slate-600">
            Le dépistage organisé concerne les femmes de <strong>50 à 74 ans</strong>, sans symptômes ni facteur de risque particulier : une mammographie est proposée <strong>tous les 2 ans</strong>, avec prise en charge à 100 % et sans avance de frais.
          </p>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            Avant 50 ans, après 74 ans ou en cas de risque élevé, le suivi est à adapter avec un professionnel de santé.
          </p>
          <a href="https://www.ameli.fr/assure/sante/themes/cancer-sein/depistage-organise-50-74-ans" target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-pink-700 hover:underline">
            Conseils officiels de l’Assurance Maladie <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="rounded-2xl border border-pink-100 bg-white p-4">
          <div className="mb-3 flex items-center gap-2 text-rose-700">
            <HeartPulse className="h-5 w-5" />
            <h3 className="font-extrabold">Les chiffres clés</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-pink-50 p-3">
              <div className="text-2xl font-black text-pink-700">61 214</div>
              <div className="text-xs font-medium text-slate-600">nouveaux cas en 2023</div>
            </div>
            <div className="rounded-xl bg-rose-50 p-3">
              <div className="text-2xl font-black text-rose-700">12 765</div>
              <div className="text-xs font-medium text-slate-600">décès en 2023</div>
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            Le cancer du sein est le cancer le plus fréquent et le plus meurtrier chez les femmes en France. La survie nette à 5 ans est estimée à 88 % pour les femmes diagnostiquées entre 2010 et 2015.
          </p>
          <a href="https://www.cancer.fr/professionnels-de-sante/statistiques-et-chiffres-sur-les-cancers/epidemiologie-des-cancers/cancer-du-sein" target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-pink-700 hover:underline">
            Chiffres INCa <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="rounded-2xl border border-pink-100 bg-white p-4">
          <div className="mb-3 flex items-center gap-2 text-fuchsia-700">
            <Phone className="h-5 w-5" />
            <h3 className="font-extrabold">Besoin d’informations ?</h3>
          </div>
          <p className="text-sm text-slate-600">Cancer info, service de l’Institut national du cancer :</p>
          <a href="tel:0805123124" className="mt-2 block text-2xl font-black text-pink-700 hover:underline">0 805 123 124</a>
          <p className="text-xs text-slate-500">Service et appel gratuits · lundi-vendredi 9h-19h · samedi 9h-14h</p>
          <a href="https://www.cancer.fr/personnes-malades/droits-et-demarches/demarches-administratives-et-sociales/numeros-et-sites-d-information/cancer-info" target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-pink-700 hover:underline">
            Cancer info : informations et accompagnement <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      <div className="mx-4 mb-4 rounded-2xl border border-rose-100 bg-white p-4 sm:mx-6 sm:mb-6">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
          <div>
            <h3 className="font-extrabold text-slate-900">ALD et cancers : une évolution entrée en vigueur le 1er octobre 2026</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              Le décret n° 2026-285 supprime, pour les personnes en ALD, l’exonération de participation sur les médicaments dont le <strong>service médical rendu (SMR) est faible</strong>. Ces médicaments, remboursés à 15 %, ne sont donc plus pris en charge à 100 % au titre de l’ALD. Le principe de prise en charge à 100 % des autres soins en rapport avec l’ALD reste en vigueur.
            </p>
            {open && (
              <div className="mt-3 space-y-3 border-t border-slate-100 pt-3 text-sm leading-relaxed text-slate-600">
                <p>
                  <strong>Position FO COM :</strong> nous dénonçons cette évolution lorsqu’elle conduit à faire supporter un reste à charge supplémentaire à des personnes atteintes d’une maladie grave. Nous demandons que la protection des personnes malades et l’accès aux traitements restent prioritaires.
                </p>
                <p>
                  Pour les personnes concernées, il est donc important de distinguer les mesures effectivement entrées en vigueur des propositions de réforme et de vérifier ses droits avec son médecin, sa caisse d’Assurance Maladie ou un service d’information spécialisé.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a href="https://www.legifrance.gouv.fr/eli/decret/2026/4/16/2026-285/jo/texte" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold text-rose-700 hover:underline">
                    Décret du 16 avril 2026 <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <a href="https://www.assurance-maladie.ameli.fr/sites/default/files/2025-07_rapport-propositions-pour-2026_assurance-maladie.pdf" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold text-rose-700 hover:underline">
                    Propositions de l’Assurance Maladie 2026 <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-pink-100 bg-pink-50/70 px-4 py-3 text-xs leading-relaxed text-slate-600 sm:px-6">
        <strong>À surveiller :</strong> grosseur, modification récente du sein ou du mamelon, rougeur/œdème, aspect peau d’orange, ganglion sous l’aisselle ou écoulement anormal. En cas de symptôme, consultez un professionnel de santé sans attendre le prochain dépistage.
      </div>
    </section>
  );
}
