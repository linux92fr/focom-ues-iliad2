import {
  BellRing,
  CheckCircle2,
  Mail,
  Megaphone,
  Newspaper,
  Scale,
  ShieldCheck,
} from 'lucide-react';

import { NewsletterSubscriptionForm } from '@/components/NewsletterSubscriptionForm';
import { PageBreadcrumb } from '@/components/PageBreadcrumb';
import { PortalPageHero } from '@/components/PortalPageHero';

const CONTENT_TYPES = [
  {
    icon: Newspaper,
    title: 'Actualités FO COM',
    description: 'Les communiqués et informations marquantes de la vie syndicale.',
  },
  {
    icon: Megaphone,
    title: 'CSE, NAO et mobilisations',
    description: "Les sujets qui concernent directement votre quotidien à l'UES Iliad.",
  },
  {
    icon: Scale,
    title: 'Vos droits',
    description: 'Des repères pratiques et les évolutions utiles pour les salariés.',
  },
];

export default function Newsletter() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 p-3 sm:p-4 lg:p-8">
      <div className="mx-auto w-full max-w-[1400px] space-y-6">
        <PageBreadcrumb steps={[{ label: 'Newsletter' }]} />

        <PortalPageHero
          eyebrow="Newsletter FO COM"
          title="L'essentiel FO COM, directement dans votre boîte mail."
          description="Recevez les informations qui comptent pour les salariés de l'UES Iliad, sans avoir à chercher partout."
          icon={Mail}
          badge="Un email utile, sans spam"
          aside={
            <>
              <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-4 backdrop-blur-sm">
                <Newspaper className="h-5 w-5 text-red-300" />
                <p className="mt-3 text-sm font-extrabold">Informations ciblées</p>
                <p className="mt-1 text-xs leading-relaxed text-white/65">Uniquement les sujets utiles à votre vie professionnelle.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-4 backdrop-blur-sm">
                <ShieldCheck className="h-5 w-5 text-teal-300" />
                <p className="mt-3 text-sm font-extrabold">Désinscription libre</p>
                <p className="mt-1 text-xs leading-relaxed text-white/65">Vous gardez le contrôle, à tout moment.</p>
              </div>
            </>
          }
        />

        <div className="grid items-start gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] sm:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <BellRing className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-red-600">Ce que vous recevrez</p>
                <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">Une information utile, pas du bruit.</h2>
              </div>
            </div>

            <div className="mt-7 space-y-3">
              {CONTENT_TYPES.map((item) => (
                <article key={item.title} className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-teal-700 shadow-sm ring-1 ring-slate-200/70">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">{item.description}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-teal-100 bg-teal-50/70 p-4 text-xs leading-relaxed text-teal-900/75">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
              <span>Votre adresse est utilisée uniquement pour l'envoi de la newsletter FO COM UES ILIAD.</span>
            </div>
          </section>

          <section className="relative overflow-hidden rounded-3xl bg-[#13233A] p-5 text-white shadow-xl sm:p-7 lg:sticky lg:top-20">
            <div aria-hidden="true" className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-red-600/20 blur-3xl" />
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-teal-300 ring-1 ring-white/10">
                <Mail className="h-6 w-6" />
              </div>
              <p className="mt-5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-teal-300">Abonnement</p>
              <h2 className="mt-2 text-2xl font-extrabold">Restez informé avec FO COM.</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/65">
                Entrez votre adresse email pour recevoir les prochaines informations FO COM UES ILIAD.
              </p>
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                <NewsletterSubscriptionForm />
              </div>
              <p className="mt-4 text-xs leading-relaxed text-white/45">
                Vous pouvez vous désabonner à tout moment depuis le lien présent dans nos emails.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
