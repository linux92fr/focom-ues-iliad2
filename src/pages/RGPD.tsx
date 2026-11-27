import { Link } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Cookie,
  Database,
  FileText,
  Lock,
  Mail,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LegalSection } from "@/components/LegalSection";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { PortalPageHero } from "@/components/PortalPageHero";

const sections = [
  { id: "introduction", number: "01", label: "Introduction", icon: FileText },
  { id: "responsable", number: "02", label: "Responsable du traitement", icon: UserCheck },
  { id: "donnees", number: "03", label: "Données et finalités", icon: Database },
  { id: "bases-legales", number: "04", label: "Bases légales", icon: CheckCircle2 },
  { id: "conservation", number: "05", label: "Durées de conservation", icon: Clock },
  { id: "destinataires", number: "06", label: "Destinataires", icon: Users },
  { id: "securite", number: "07", label: "Sécurité", icon: Lock },
  { id: "droits", number: "08", label: "Vos droits", icon: ShieldCheck },
  { id: "cookies", number: "09", label: "Cookies", icon: Cookie },
  { id: "modifications", number: "10", label: "Modifications", icon: RefreshCw },
];

const rights = [
  "Droit d’accès",
  "Droit de rectification",
  "Droit à l’effacement",
  "Droit à la limitation",
  "Droit à la portabilité",
  "Droit d’opposition",
];

export default function RGPD() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 p-3 sm:p-4 lg:p-8">
      <div className="mx-auto w-full max-w-[1500px] space-y-6">
        <PageBreadcrumb steps={[{ label: "Politique RGPD" }]} />

        <PortalPageHero
          eyebrow="RGPD · Confidentialité"
          title="Politique de protection des données"
          description="Comprenez quelles données FO COM UES ILIAD utilise, pourquoi elles sont collectées et comment exercer vos droits."
          icon={ShieldCheck}
          badge="Dernière mise à jour · 23 novembre 2026"
          actions={
            <>
              <Button asChild className="bg-red-600 text-white hover:bg-red-700">
                <a href="mailto:contact@focomues-iliad.fr">
                  <Mail className="mr-2 h-4 w-4" />
                  Exercer mes droits
                </a>
              </Button>
              <Button asChild variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                <Link to="/mentions-legales">
                  <FileText className="mr-2 h-4 w-4" />
                  Mentions légales
                </Link>
              </Button>
            </>
          }
          aside={
            <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-4 backdrop-blur-sm">
              <Lock className="h-5 w-5 text-teal-300" />
              <p className="mt-3 text-sm font-extrabold">Vos données restent sous contrôle</p>
              <p className="mt-1 text-xs leading-relaxed text-white/65">
                Principe de minimisation, accès limité et canaux séparés pour les données bancaires.
              </p>
            </div>
          }
        />

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            <LegalSection id="introduction" number="01" title="Introduction" icon={FileText}>
              <p>
                FO COM UES ILIAD accorde une grande importance à la protection des données personnelles de ses adhérents et des utilisateurs du site.
              </p>
              <p>
                Cette politique décrit la collecte, l’utilisation, la conservation et la protection de vos données conformément au Règlement général sur la protection des données et à la loi Informatique et Libertés.
              </p>
            </LegalSection>

            <LegalSection id="responsable" number="02" title="Responsable du traitement" icon={UserCheck}>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-extrabold text-slate-900">FOCOM UES ILIAD</p>
                <p className="mt-2">8 rue de la Ville l’Évêque, 75008 Paris</p>
                <p className="mt-1">Téléphone : <a className="font-semibold text-slate-900 hover:text-red-600" href="tel:+33187154311">01 87 15 43 11</a></p>
                <p className="mt-1">E-mail : <a className="font-semibold text-slate-900 hover:text-red-600" href="mailto:contact@focomues-iliad.fr">contact@focomues-iliad.fr</a></p>
              </div>
            </LegalSection>

            <LegalSection id="donnees" number="03" title="Données collectées et finalités" icon={Database}>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-extrabold text-slate-900">Formulaire d’adhésion</p>
                  <p className="mt-2 text-xs leading-relaxed">
                    Civilité, identité, coordonnées, entreprise, statut professionnel, signature et choix de transmission.
                  </p>
                  <p className="mt-2 text-xs leading-relaxed">
                    Finalité : générer le bulletin, le transmettre au syndicat et, sur demande, envoyer une copie à l’adhérent.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-extrabold text-slate-900">Messagerie et demandes</p>
                  <p className="mt-2 text-xs leading-relaxed">
                    Identité, adresse e-mail, contenu du message et pièces jointes éventuelles, afin de répondre aux demandes et de suivre les dossiers.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-extrabold text-slate-900">Compte adhérent</p>
                  <p className="mt-2 text-xs leading-relaxed">
                    Adresse e-mail, mot de passe chiffré, profil, carte adhérent, notifications et données nécessaires à l’espace personnel. Si vous utilisez la connexion avec Google, votre nom, votre adresse e-mail et votre photo de profil sont importés depuis votre compte Google.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-extrabold text-slate-900">Newsletter et sécurité</p>
                  <p className="mt-2 text-xs leading-relaxed">
                    Adresse e-mail pour les informations syndicales, et données techniques nécessaires au fonctionnement et à la sécurité du site.
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
                <Lock className="mb-2 h-5 w-5" />
                <p className="font-bold">Coordonnées bancaires SEPA</p>
                <p className="mt-1 text-xs leading-relaxed">
                  Elles ne sont pas incluses dans le bulletin envoyé par e-mail. Le mandat SEPA doit être transmis séparément par un canal sécurisé.
                </p>
              </div>
            </LegalSection>

            <LegalSection id="bases-legales" number="04" title="Bases légales du traitement" icon={CheckCircle2}>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "Votre consentement pour la newsletter, les formulaires et certaines communications.",
                  "L’exécution de l’adhésion syndicale et la gestion du lien adhérent.",
                  "L’intérêt légitime du syndicat pour informer, défendre et accompagner les salariés.",
                  "Le respect des obligations légales applicables aux organisations syndicales.",
                ].map((item) => (
                  <div key={item} className="flex gap-3 rounded-2xl border border-slate-200 p-4">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                    <p className="text-xs leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </LegalSection>

            <LegalSection id="conservation" number="05" title="Durées de conservation" icon={Clock}>
              <div className="divide-y divide-slate-100">
                {[
                  ["Données d’adhésion", "Durée de l’adhésion, puis archivage selon les obligations légales applicables."],
                  ["Compte adhérent", "Pendant l’activité du compte ou jusqu’à sa suppression."],
                  ["Messages et demandes", "Durée nécessaire au traitement et au suivi du dossier."],
                  ["Courriels d’adhésion", "Durée nécessaire au traitement, puis conservation selon les obligations applicables."],
                  ["Newsletter", "Jusqu’à votre désinscription."],
                  ["Cookies et données techniques", "Durée strictement nécessaire au fonctionnement et à la sécurité."],
                ].map(([title, text]) => (
                  <div key={title} className="grid gap-1 py-3 sm:grid-cols-[190px_1fr] sm:gap-4">
                    <p className="font-bold text-slate-900">{title}</p>
                    <p className="text-xs leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </LegalSection>

            <LegalSection id="destinataires" number="06" title="Destinataires des données" icon={Users}>
              <p>Vos données sont accessibles uniquement :</p>
              <ul className="space-y-2">
                {[
                  "aux représentants FO COM habilités ;",
                  "aux administrateurs autorisés du site ;",
                  "aux prestataires techniques strictement nécessaires, notamment Supabase et Resend pour l’envoi des courriels ;",
                  "à Google, uniquement lorsque vous choisissez la connexion Google, pour authentifier votre session.",
                ].map((item) => (
                  <li key={item} className="flex gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-xs">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                    {item}
                  </li>
                ))}
              </ul>
              <p>Vos données ne sont jamais vendues ni transmises à des tiers à des fins commerciales.</p>
            </LegalSection>

            <LegalSection id="securite" number="07" title="Sécurité des données" icon={Lock}>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "Connexions sécurisées en HTTPS.",
                  "Mots de passe chiffrés.",
                  "Accès restreint aux données personnelles.",
                  "Gestion des rôles administrateurs.",
                  "Stockage sécurisé des pièces jointes et documents.",
                  "Exclusion des coordonnées bancaires des e-mails générés par le site.",
                ].map((item) => (
                  <div key={item} className="flex gap-3 rounded-2xl border border-slate-200 p-4 text-xs">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                    {item}
                  </div>
                ))}
              </div>
            </LegalSection>

            <LegalSection id="droits" number="08" title="Vos droits" icon={ShieldCheck}>
              <p>Conformément au RGPD, vous pouvez exercer les droits suivants :</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {rights.map((right) => (
                  <div key={right} className="rounded-xl bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-700">
                    {right}
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4 text-teal-900">
                <Mail className="mb-2 h-5 w-5" />
                <p className="font-bold">Exercer vos droits</p>
                <p className="mt-1 text-xs leading-relaxed">
                  Écrivez à <a className="font-extrabold underline underline-offset-2" href="mailto:contact@focomues-iliad.fr">contact@focomues-iliad.fr</a>.
                </p>
                <p className="mt-2 text-xs leading-relaxed">
                  Vous pouvez également adresser une réclamation à la <a className="font-extrabold underline underline-offset-2" href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">CNIL</a>.
                </p>
              </div>
            </LegalSection>

            <LegalSection id="cookies" number="09" title="Cookies" icon={Cookie}>
              <p>
                Le site utilise principalement des cookies nécessaires à son fonctionnement, à l’authentification et à la sécurité.
              </p>
              <p>
                Aucun cookie marketing n’est utilisé. Les cookies analytiques éventuels ne sont déposés qu’en cas de consentement.
              </p>
            </LegalSection>

            <LegalSection id="modifications" number="10" title="Modification de la politique" icon={RefreshCw}>
              <p>
                FO COM UES ILIAD peut modifier cette politique afin de l’adapter aux évolutions légales, techniques ou organisationnelles.
              </p>
            </LegalSection>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-6">
            <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm">
              <CardContent className="p-5">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-red-600">Sommaire</p>
                <nav className="mt-4 space-y-1" aria-label="Sommaire de la politique RGPD">
                  {sections.map(({ id, number, label }) => (
                    <a
                      key={id}
                      href={`#${id}`}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-red-600"
                    >
                      <span className="w-5 text-[10px] font-extrabold text-slate-400">{number}</span>
                      {label}
                    </a>
                  ))}
                </nav>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-slate-200/80 bg-[#13233A] text-white shadow-sm">
              <CardContent className="p-5">
                <CalendarDays className="h-5 w-5 text-teal-300" />
                <p className="mt-3 text-sm font-extrabold">Dernière mise à jour</p>
                <p className="mt-1 text-xs text-white/65">23 novembre 2026</p>
                <Link to="/mentions-legales" className="mt-4 inline-flex text-xs font-bold text-teal-200 hover:text-white">
                  Consulter les mentions légales
                </Link>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}
