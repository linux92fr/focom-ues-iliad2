import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  FileText,
  Lock,
  Mail,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LegalSection } from "@/components/LegalSection";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { PortalPageHero } from "@/components/PortalPageHero";

const sections = [
  { id: "introduction", number: "01", label: "Introduction", icon: FileText },
  { id: "demande", number: "02", label: "Comment demander", icon: Mail },
  { id: "donnees", number: "03", label: "Données supprimées", icon: Trash2 },
  { id: "conservation", number: "04", label: "Données conservées", icon: Lock },
  { id: "delais", number: "05", label: "Délais", icon: Clock },
  { id: "facebook", number: "06", label: "Compte Facebook", icon: UserCheck },
  { id: "modifications", number: "07", label: "Modifications", icon: RefreshCw },
];

export default function SuppressionDonnees() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 p-3 sm:p-4 lg:p-8">
      <div className="mx-auto w-full max-w-[1500px] space-y-6">
        <PageBreadcrumb steps={[{ label: "Accueil" }, { label: "Suppression des données" }]} />

        <PortalPageHero
          eyebrow="RGPD · Vos données"
          title="Suppression des données utilisateur"
          description="Demandez l'effacement de votre compte et de vos données personnelles du site FOCOM UES ILIAD, conformément au droit à l'effacement du RGPD."
          icon={Trash2}
          badge="Dernière mise à jour · 27 novembre 2026"
          actions={
            <>
              <Button asChild className="bg-red-600 text-white hover:bg-red-700">
                <a href="mailto:contact@focomues-iliad.fr?subject=Suppression%20de%20mon%20compte">
                  <Mail className="mr-2 h-4 w-4" />
                  Demander ma suppression
                </a>
              </Button>
              <Button asChild variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                <Link to="/rgpd">
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Politique de confidentialité
                </Link>
              </Button>
            </>
          }
          aside={
            <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-4 backdrop-blur-sm">
              <Trash2 className="h-5 w-5 text-teal-300" />
              <p className="mt-3 text-sm font-extrabold">Effacement complet sur simple demande</p>
              <p className="mt-1 text-xs leading-relaxed text-white/65">
                Votre demande est traitée manuellement et confirmée par e-mail, sans frais ni justification à fournir.
              </p>
            </div>
          }
        />

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            <LegalSection id="introduction" number="01" title="Introduction" icon={FileText}>
              <p>
                Vous disposez d'un droit à l'effacement de vos données personnelles (article 17 du RGPD). Cette page vous indique comment demander la suppression de votre compte adhérent et des données associées, que votre compte ait été créé par e-mail ou via la connexion Facebook.
              </p>
            </LegalSection>

            <LegalSection id="demande" number="02" title="Comment demander la suppression" icon={Mail}>
              <p>Pour demander l'effacement de vos données :</p>
              <ul className="space-y-2">
                {[
                  "Envoyez un e-mail à contact@focomues-iliad.fr depuis l'adresse associée à votre compte (ou précisez-la dans le message), avec l'objet « Suppression de mon compte ».",
                  "Indiquez simplement votre volonté de supprimer votre compte : aucun motif n'est exigé.",
                  "Nous vous répondons pour confirmer la réception, puis de nouveau une fois la suppression effectuée.",
                ].map((item) => (
                  <li key={item} className="flex gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-xs">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-xs">
                Un responsable habilité du syndicat vérifie l'identité du demandeur avant toute suppression, afin d'éviter les demandes frauduleuses.
              </p>
            </LegalSection>

            <LegalSection id="donnees" number="03" title="Données supprimées" icon={Trash2}>
              <p>Lors de la suppression de votre compte, les données suivantes sont effacées :</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Compte et authentification", "Identifiants de connexion, mot de passe (chiffré), méthode d'authentification (e-mail ou Facebook), identité de connexion."],
                  ["Profil", "Nom, prénom, adresse e-mail, photo de profil, statut, numéro de téléphone."],
                  ["Contenus associés", "Messages et demandes envoyés via le site, pièces jointes, inscriptions aux formations, réactions et commentaires."],
                  ["Préférences et abonnements", "Inscription à la newsletter, préférences de notifications."],
                ].map(([title, text]) => (
                  <div key={title} className="rounded-2xl border border-slate-200 p-4">
                    <p className="font-extrabold text-slate-900">{title}</p>
                    <p className="mt-2 text-xs leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </LegalSection>

            <LegalSection id="conservation" number="04" title="Données éventuellement conservées" icon={Lock}>
              <p>
                Certaines données peuvent être conservées si le syndicat y est légalement tenu (obligations comptables, statutaires ou contentieuses), ou archivées sous forme anonyme lorsqu'elles ne permettent plus de vous identifier. Vous en êtes informé dans notre réponse.
              </p>
            </LegalSection>

            <LegalSection id="delais" number="05" title="Délais de traitement" icon={Clock}>
              <p>
                Votre demande est traitée dans un délai maximum d'un mois à compter de sa réception, conformément au RGPD. La confirmation de suppression vous est envoyée par e-mail.
              </p>
            </LegalSection>

            <LegalSection id="facebook" number="06" title="Vous vous êtes connecté avec Facebook ?" icon={UserCheck}>
              <p>
                Deux actions distinctes existent, selon ce que vous souhaitez :
              </p>
              <ul className="space-y-2">
                <li className="flex gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-xs">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                  {"Retirer l'autorisation Facebook : dans vos paramètres Facebook (paramètres > applications et sites web), retirez « FOCOM UES ILIAD ». Cela coupe l'accès à vos informations Facebook, sans supprimer votre compte sur notre site."}
                </li>
                <li className="flex gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-xs">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                  {"Effacer votre compte et vos données sur notre site : suivez la procédure décrite ci-dessus par e-mail. Nous supprimons alors votre compte, vos données et le lien avec votre identité Facebook."}
                </li>
              </ul>
            </LegalSection>

            <LegalSection id="modifications" number="07" title="Modifications de cette page" icon={RefreshCw}>
              <p>
                Cette page peut être mise à jour pour rester conforme aux exigences de Meta (Facebook Login) et à la réglementation. La date de dernière mise à jour figure en haut de page.
              </p>
            </LegalSection>
          </div>

          <aside className="sticky top-6 space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="font-extrabold text-slate-900">Sommaire</p>
              <ul className="mt-2 space-y-1">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900">
                      <s.icon className="h-3.5 w-3.5 text-teal-600" />
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4 text-teal-900">
              <Mail className="mb-2 h-5 w-5" />
              <p className="font-bold">Une question ?</p>
              <p className="mt-1 text-xs leading-relaxed">
                Écrivez à 
                <a className="font-semibold underline" href="mailto:contact@focomues-iliad.fr">contact@focomues-iliad.fr</a>
                , l'adresse de contact du responsable de traitement.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}