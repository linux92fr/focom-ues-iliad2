import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown,
  BadgeEuro,
  CheckCircle2,
  ChevronRight,
  Download,
  FileText,
  Heart,
  LockKeyhole,
  PenLine,
  Send,
  Shield,
  Users,
} from 'lucide-react';

import AdhesionFormFOCOM from '@/components/AdhesionFormFOCOM';
import { PageBreadcrumb } from '@/components/PageBreadcrumb';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const ADVANTAGES = [
  {
    icon: Shield,
    title: 'Protection juridique',
    description: "Assistance et défense en cas de conflit avec l'employeur.",
  },
  {
    icon: Users,
    title: 'Représentation',
    description: "Votre voix portée dans les instances de l'entreprise.",
  },
  {
    icon: Heart,
    title: 'Solidarité',
    description: "Faire partie d'un collectif fort et solidaire.",
  },
];

const STEPS = [
  {
    icon: PenLine,
    title: 'Remplissez',
    description: 'Saisissez vos informations et signez directement en ligne.',
  },
  {
    icon: FileText,
    title: 'Téléchargez',
    description: 'Le bulletin officiel FO COM est généré automatiquement en PDF.',
  },
  {
    icon: Send,
    title: 'Transmettez',
    description: 'Envoyez-le par email ou via la messagerie du site.',
  },
];

const GUARANTEES = [
  {
    icon: LockKeyhole,
    title: 'Signature sécurisée',
    description: 'Vos informations servent uniquement à générer votre bulletin.',
  },
  {
    icon: BadgeEuro,
    title: '35 € par trimestre',
    description: 'Cotisation déductible fiscalement à hauteur de 66 %.',
  },
  {
    icon: FileText,
    title: 'Document officiel',
    description: 'Un bulletin FO COM pré-rempli et prêt à transmettre.',
  },
];

const Adhesion = () => (
  <main className="min-h-screen overflow-x-hidden bg-slate-50 p-3 sm:p-4 lg:p-8">
    <div className="mx-auto w-full max-w-[1500px] space-y-6">
      <PageBreadcrumb steps={[{ label: 'Adhérer à FO COM' }]} />

      <section className="relative overflow-hidden rounded-[2rem] bg-[#13233A] text-white shadow-xl shadow-slate-900/10 ring-1 ring-slate-900/5">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full border-[58px] border-white/[0.04]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-red-600/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-1/3 top-0 h-full w-56 skew-x-[-18deg] bg-gradient-to-b from-teal-400/[0.06] to-transparent"
        />

        <div className="relative grid gap-9 px-5 py-9 sm:px-8 sm:py-11 lg:grid-cols-[1.18fr_0.82fr] lg:items-center lg:px-12 lg:py-14">
          <div>
            <Badge className="mb-5 border border-white/15 bg-white/10 px-3 py-1.5 text-white hover:bg-white/10">
              <PenLine className="mr-1.5 h-3.5 w-3.5 text-red-300" /> Bulletin officiel pré-rempli
            </Badge>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-300">
              FO COM UES ILIAD
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Votre adhésion,
              <br />
              votre force.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/75 sm:text-lg sm:leading-8">
              Remplissez le formulaire, signez en ligne et téléchargez votre bulletin d'adhésion
              officiel, prêt à transmettre à votre section FO COM.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button
                asChild
                className="rounded-xl bg-red-600 px-5 font-bold text-white shadow-lg shadow-red-950/20 hover:bg-red-700"
              >
                <a href="#formulaire-adhesion">
                  Commencer l'adhésion <ArrowDown className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-xl border-white/25 bg-white/10 px-5 font-semibold text-white hover:bg-white/20 hover:text-white"
              >
                <a href="/bulletin-adhesion.pdf" target="_blank" rel="noopener noreferrer">
                  <Download className="mr-2 h-4 w-4" /> PDF vierge
                </a>
              </Button>
            </div>
          </div>

          <div className="grid gap-3">
            {STEPS.map((step, index) => (
              <div
                key={step.title}
                className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.08] p-4 backdrop-blur-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-teal-300 ring-1 ring-white/10">
                  <step.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-extrabold">
                    <span className="mr-2 text-red-300">0{index + 1}</span>
                    {step.title}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-white/65">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-3 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm sm:grid-cols-3 sm:p-5">
        {GUARANTEES.map((guarantee, index) => (
          <div key={guarantee.title} className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                index === 1 ? 'bg-red-50 text-red-600' : 'bg-teal-50 text-teal-700'
              }`}
            >
              <guarantee.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-slate-800">{guarantee.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{guarantee.description}</p>
            </div>
          </div>
        ))}
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[0.82fr_1.18fr]">
        <aside className="space-y-5 lg:sticky lg:top-20">
          <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-red-600">
                  Un collectif
                </p>
                <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
                  Pourquoi adhérer ?
                </h2>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              {ADVANTAGES.map((advantage) => (
                <div key={advantage.title} className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    {React.createElement(advantage.icon, { className: 'h-5 w-5' })}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">{advantage.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">{advantage.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 via-teal-800 to-[#075e59] p-5 text-white shadow-lg shadow-teal-900/10 sm:p-6">
            <div
              aria-hidden="true"
              className="absolute -right-12 -top-12 h-40 w-40 rounded-full border-[32px] border-white/5"
            />
            <div className="relative">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-teal-200">
                <BadgeEuro className="h-4 w-4" /> Cotisation
              </div>
              <div className="mt-3 flex items-end gap-2">
                <p className="text-5xl font-black tabular-nums">35 €</p>
                <p className="pb-1 text-sm text-teal-100/80">par trimestre</p>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-teal-50/80">
                Une cotisation déductible fiscalement à hauteur de 66 %.
              </p>
              <div className="mt-5 space-y-3">
                {['Prélèvement automatique possible', 'Participation aux décisions syndicales'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs text-white/85">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-300" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <FileText className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-lg font-extrabold text-slate-900">Vous préférez le papier ?</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Téléchargez le bulletin officiel vierge, puis remplissez-le manuellement.
            </p>
            <Button asChild variant="outline" className="mt-4 w-full rounded-xl border-slate-200 font-semibold">
              <a href="/bulletin-adhesion.pdf" target="_blank" rel="noopener noreferrer">
                <Download className="mr-2 h-4 w-4" /> Télécharger le bulletin
              </a>
            </Button>
          </section>

          <div className="flex items-center justify-between gap-3 px-1 text-sm">
            <span className="text-slate-500">Une question sur votre adhésion ?</span>
            <Link to="/contact" className="inline-flex shrink-0 items-center gap-1 font-bold text-red-600 hover:text-red-700">
              Contact <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </aside>

        <section id="formulaire-adhesion" className="scroll-mt-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-red-600">
                Formulaire en ligne
              </p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Créez votre bulletin FO COM
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
                Toutes les sections sont modifiables. Votre PDF est généré après signature.
              </p>
            </div>
            <Badge variant="outline" className="w-fit gap-1.5 border-teal-200 bg-teal-50 text-teal-700">
              <LockKeyhole className="h-3.5 w-3.5" /> Traitement sécurisé
            </Badge>
          </div>

          <AdhesionFormFOCOM />
        </section>
      </div>
    </div>
  </main>
);

export default Adhesion;
