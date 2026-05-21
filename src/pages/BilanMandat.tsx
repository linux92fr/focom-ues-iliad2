import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Eye,
  FileText,
  Handshake,
  Heart,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";

const YEARS = [
  {
    year: 2022,
    label: "Fondations du mandat",
    reclamations: 122,
    consultations: 20,
    accords: 4,
    expertises: 3,
    highlights: [
      { icon: "shield", text: "Fort de sa majorité au CSE, FO COM a pesé de tout son poids dans les négociations pour défendre les salariés de l'UES ILIAD." },
      { icon: "alert", text: "Expertise RPS engagée malgré la contestation de l'employeur devant le tribunal — la justice a donné raison au CSE." },
      { icon: "eye", text: "Expertise sur les orientations stratégiques et la situation économique et financière de l'entreprise." },
      { icon: "handshake", text: "4 accords signés : dialogue social, financement du CSE, mutuelle & prévoyance, rémunération NAO." },
    ],
  },
  {
    year: 2023,
    label: "Mobilisation et avancées sociales",
    reclamations: 171,
    consultations: 32,
    accords: 3,
    expertises: 4,
    highlights: [
      { icon: "trending", text: "Refonte complète du régime des astreintes : révision des rémunérations soirs/week-ends, respect des repos obligatoires et revalorisation des primes." },
      { icon: "users", text: "Grèves et pétitions organisées par FO COM pour faire entendre les salariés face aux décisions de la Direction." },
      { icon: "eye", text: "Expertise économique révélant les marges financières du groupe ILIAD." },
      { icon: "handshake", text: "3 accords signés : minima conventionnels 2023, communications du CSE, temps de travail." },
    ],
  },
  {
    year: 2024,
    label: "Vigilance et résistance",
    reclamations: 190,
    consultations: 51,
    accords: 1,
    expertises: 5,
    highlights: [
      { icon: "alert", text: "Opposition du CSE à la suspension du télétravail — la Direction a maintenu sa décision malgré l'expertise et l'avis défavorable." },
      { icon: "shield", text: "Expertise RPS avec recommandations cruciales sur l'organisation du travail et les pratiques managériales." },
      { icon: "trending", text: "Alerte sur les fragilités structurelles : baisse des embauches, tensions organisationnelles." },
      { icon: "handshake", text: "Mise en place d'un plan d'épargne retraite obligatoire Assunet." },
    ],
  },
  {
    year: 2025,
    label: "Conquêtes concrètes",
    reclamations: 192,
    consultations: 53,
    accords: 0,
    expertises: 4,
    highlights: [
      { icon: "check", text: "Temps de repos imposé avant et après les HNO pour les techniciens itinérants Free Réseau Maintenance." },
      { icon: "check", text: "Panier repas porté à 9 € pour les techniciens itinérants, contre 6,50 € proposés par la Direction." },
      { icon: "eye", text: "Expertise majeure sur la réorganisation Maintenance & Transport et sur les orientations stratégiques 2028." },
      { icon: "file", text: "192 réclamations déposées, 53 consultations traitées — un record sur le mandat." },
    ],
  },
  {
    year: 2026,
    label: "En cours — 1er trimestre",
    reclamations: 70,
    consultations: 8,
    accords: 0,
    expertises: 2,
    badge: "En cours",
    highlights: [
      { icon: "shield", text: "Expertise sur les orientations stratégiques en cours." },
      { icon: "alert", text: "Expertise Risques Psychosociaux engagée." },
      { icon: "file", text: "70 réclamations individuelles et collectives déposées." },
      { icon: "eye", text: "8 consultations traitées au premier trimestre 2026." },
    ],
  },
];

const TOTALS = {
  reclamations: 745,
  consultations: 164,
  accords: 8,
  expertises: 18,
};

const commitments = [
  {
    icon: Shield,
    title: "Défendre",
    color: "bg-red-50 text-red-600",
    items: ["Respect des accords", "Santé & sécurité", "RPS", "Droit à la déconnexion"],
  },
  {
    icon: Handshake,
    title: "Négocier",
    color: "bg-teal-50 text-teal-600",
    items: ["Salaires & primes", "Astreintes", "Temps de travail", "Mutuelle & prévoyance"],
  },
  {
    icon: Users,
    title: "Agir ensemble",
    color: "bg-red-50 text-red-600",
    items: ["Réclamations", "Pétitions", "Expertises", "Informations régulières"],
  },
];

function HighlightIcon({ type }: { type: string }) {
  const cls = "h-4 w-4 shrink-0";
  switch (type) {
    case "shield": return <Shield className={cls} />;
    case "alert": return <AlertTriangle className={cls} />;
    case "eye": return <Eye className={cls} />;
    case "handshake": return <Handshake className={cls} />;
    case "trending": return <TrendingUp className={cls} />;
    case "users": return <Users className={cls} />;
    case "check": return <CheckCircle2 className={cls} />;
    case "file": return <FileText className={cls} />;
    default: return <BookOpen className={cls} />;
  }
}

function YearCard({ data, index }: { data: typeof YEARS[number]; index: number }) {
  const [open, setOpen] = useState(index === 0);

  return (
    <article className="relative">
      {index < YEARS.length - 1 && (
        <div className="absolute left-8 top-20 hidden h-[calc(100%+2rem)] w-0.5 bg-red-200 lg:block" />
      )}

      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:border-red-100 hover:shadow-md">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center gap-4 px-4 py-5 text-left sm:px-6"
        >
          <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-red-600 text-white shadow-lg">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">Année</span>
            <span className="text-lg font-black">{data.year}</span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-black text-slate-900">{data.year}</h2>
              {data.badge && (
                <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  {data.badge}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-sm text-slate-500">{data.label}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
              <span className="rounded-lg bg-slate-50 px-2 py-1 font-semibold text-slate-600">{data.reclamations} réclamations</span>
              <span className="rounded-lg bg-slate-50 px-2 py-1 font-semibold text-slate-600">{data.consultations} consultations</span>
              <span className="rounded-lg bg-slate-50 px-2 py-1 font-semibold text-slate-600">{data.accords} accords</span>
              <span className="rounded-lg bg-slate-50 px-2 py-1 font-semibold text-slate-600">{data.expertises} expertises</span>
            </div>
          </div>

          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all ${open ? "rotate-180 bg-red-600 text-white" : "bg-slate-100 text-slate-400"}`}>
            <ChevronDown className="h-5 w-5" />
          </div>
        </button>

        {open && (
          <div className="border-t border-slate-100 bg-slate-50/60 px-4 pb-6 pt-4 sm:px-6">
            <ul className="space-y-3">
              {data.highlights.map((highlight, i) => (
                <li key={i} className="flex items-start gap-3 rounded-2xl bg-white p-3 text-sm leading-relaxed text-slate-600 shadow-sm">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                    <HighlightIcon type={highlight.icon} />
                  </span>
                  <span>{highlight.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}

export default function BilanMandat() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 p-3 sm:p-4 lg:p-8">
      <section className="relative overflow-hidden rounded-3xl bg-[#13233A] p-6 text-white shadow-xl sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border-[52px] border-white/5" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-red-600/25 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white/85 backdrop-blur">
              <Shield className="h-3.5 w-3.5 text-red-300" /> Bilan CSE 2022–2026
            </div>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              Un mandat d’actions concrètes pour défendre les salariés
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/80 sm:text-lg">
              Réclamations, consultations, expertises, accords et mobilisations : FO COM UES ILIAD a agi tout au long du mandat pour défendre les droits, la santé, les conditions de travail et le pouvoir d’achat des salariés.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/contact" className="inline-flex items-center justify-center rounded-lg bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700">
                Contacter FO COM
              </Link>
              <Link to="/elections" className="inline-flex items-center justify-center rounded-lg border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/20">
                Voir les résultats CSE
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Réclamations", value: `${TOTALS.reclamations}+`, icon: FileText },
              { label: "Consultations", value: TOTALS.consultations, icon: Users },
              { label: "Accords", value: TOTALS.accords, icon: Handshake },
              { label: "Expertises", value: TOTALS.expertises, icon: Eye },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <stat.icon className="mb-3 h-5 w-5 text-red-200" />
                <p className="text-3xl font-black text-white">{stat.value}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-wide text-white/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {commitments.map((item) => (
          <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${item.color}`}>
              <item.icon className="h-5 w-5" />
            </div>
            <h2 className="font-extrabold text-slate-900">{item.title}</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {item.items.map((entry) => (
                <li key={entry} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400" /> {entry}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="mt-8 space-y-5">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Notre action année par année</h2>
          <p className="mt-1 text-sm text-slate-500">Les temps forts du mandat, de 2022 au premier trimestre 2026.</p>
        </div>
        <div className="space-y-5">
          {YEARS.map((year, index) => (
            <YearCard key={year.year} data={year} index={index} />
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-3xl bg-gradient-to-br from-teal-600 to-teal-700 p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15">
              <Heart className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold">Notre engagement</h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-teal-50">
                Transparence, écoute et action : notre priorité, c’est vous. Ensemble, nous continuons à construire un monde du travail plus juste, plus respectueux et plus protecteur pour chaque salarié.
              </p>
            </div>
          </div>
          <Link to="/adhesion" className="inline-flex w-full items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-bold text-teal-700 hover:bg-teal-50 md:w-auto">
            Rejoindre FO COM
          </Link>
        </div>
      </section>

      <p className="mt-8 text-center text-xs text-slate-400">
        CSE 2022–2026 | FO COM UES ILIAD — mis à jour le 25 avril 2026.
      </p>
    </main>
  );
}
