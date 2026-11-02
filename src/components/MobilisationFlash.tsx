import { ArrowRight, CalendarDays, CheckCircle2, Clock3, Euro, FileText, ShieldCheck, Users } from "lucide-react";

const GUIDE_URL = "https://greve.focomues-iliad.fr/";

export default function MobilisationFlash() {
  const points = [
    { icon: Euro, title: "Pouvoir d’achat", text: "Des salaires qui suivent enfin le coût de la vie." },
    { icon: Users, title: "Emploi et réorganisations", text: "Défendre nos emplois, nos métiers et nos conditions de travail." },
    { icon: ShieldCheck, title: "Services publics et industrie", text: "Des moyens et une politique industrielle qui préparent l’avenir." },
  ];

  return (
    <section id="mobilisation-5-novembre" className="mb-6 scroll-mt-6 overflow-hidden rounded-3xl border border-red-200 bg-gradient-to-br from-red-50 via-white to-teal-50 shadow-lg">
      <div className="relative overflow-hidden bg-gradient-to-r from-[#b91c1c] via-[#dc2626] to-[#0f766e] px-5 py-6 text-white sm:px-8">
        <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full border-[26px] border-white/15" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur"><CalendarDays className="h-6 w-6" /></div>
            <div>
              <div className="mb-1 text-xs font-extrabold uppercase tracking-[0.18em] text-red-100">Mobilisation nationale · jeudi 5 novembre 2026</div>
              <h2 className="text-2xl font-black leading-tight sm:text-3xl">Nos salaires, nos emplois, notre avenir : faisons entendre notre voix !</h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/90">Face à la baisse du pouvoir d’achat, aux réorganisations successives et aux inquiétudes sur l’emploi, FO COM appelle les salariés à se mobiliser.</p>
            </div>
          </div>
          <a href={GUIDE_URL} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-red-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-red-50">
            Tout comprendre et participer <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-6">
        {points.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-2xl border border-slate-100 bg-white p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-700"><Icon className="h-5 w-5" /></div>
            <h3 className="font-extrabold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">{text}</p>
          </div>
        ))}
      </div>

      <div className="mx-4 mb-4 flex flex-col gap-3 rounded-2xl border border-teal-100 bg-white p-4 sm:mx-6 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <FileText className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" />
          <div><p className="font-extrabold text-slate-900">Vous ne savez pas comment faire grève ?</p><p className="mt-1 text-sm text-slate-600">Retrouvez le guide pratique : modalités, durée, absence et impact sur le salaire.</p></div>
        </div>
        <a href={GUIDE_URL} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-teal-800">Consulter le guide <ArrowRight className="h-4 w-4" /></a>
      </div>
    </section>
  );
}
