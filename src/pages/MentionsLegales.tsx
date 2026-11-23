import { Link } from "react-router-dom";
import {
  Building2,
  CalendarDays,
  FileText,
  Gavel,
  Globe2,
  Mail,
  MapPin,
  Scale,
  ScrollText,
  Server,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LegalSection } from "@/components/LegalSection";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { PortalPageHero } from "@/components/PortalPageHero";

const quickLinks = [
  { to: "/rgpd", label: "Politique RGPD", icon: ShieldCheck },
  { to: "/contact", label: "Nous contacter", icon: Mail },
  { to: "/adhesion", label: "Adhérer à FO COM", icon: UserRound },
];

export default function MentionsLegales() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 p-3 sm:p-4 lg:p-8">
      <div className="mx-auto w-full max-w-[1500px] space-y-6">
        <PageBreadcrumb steps={[{ label: "Mentions légales" }]} />

        <PortalPageHero
          eyebrow="Informations légales"
          title="Mentions légales"
          description="Informations relatives à l’éditeur du site, à son administration, à son hébergement et aux règles d’utilisation applicables."
          icon={FileText}
          badge="Transparence et obligations légales"
          actions={
            <>
              <Button asChild className="bg-red-600 text-white hover:bg-red-700">
                <Link to="/rgpd">
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Consulter la politique RGPD
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                <a href="mailto:contact@focomues-iliad.fr">
                  <Mail className="mr-2 h-4 w-4" />
                  Contacter le syndicat
                </a>
              </Button>
            </>
          }
          aside={
            <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-4 backdrop-blur-sm">
              <Globe2 className="h-5 w-5 text-teal-300" />
              <p className="mt-3 text-sm font-extrabold">Site officiel FO COM UES ILIAD</p>
              <p className="mt-1 text-xs leading-relaxed text-white/65">
                Informations à jour sur l’éditeur, l’hébergement et le traitement des données.
              </p>
            </div>
          }
        />

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            <LegalSection number="01" title="Identification de l’organisation" icon={Building2}>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Dénomination</p>
                  <p className="mt-2 font-extrabold text-slate-900">FOCOM UES ILIAD</p>
                  <p className="mt-1 text-xs leading-relaxed">Section syndicale Force Ouvrière Communication</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <MapPin className="h-4 w-4 text-red-600" />
                  <p className="mt-2 font-extrabold text-slate-900">8 rue de la Ville l’Évêque</p>
                  <p className="mt-1 text-xs">75008 Paris, France</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <Mail className="h-4 w-4 text-red-600" />
                  <a className="mt-2 block font-extrabold text-slate-900 hover:text-red-600" href="mailto:contact@focomues-iliad.fr">
                    contact@focomues-iliad.fr
                  </a>
                  <a className="mt-1 block text-xs hover:text-red-600" href="tel:+33187154311">01 87 15 43 11</a>
                </div>
              </div>
            </LegalSection>

            <LegalSection number="02" title="Direction et administration" icon={UserRound}>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Direction de publication</p>
                  <p className="mt-2 font-bold text-slate-900">FO COM UES ILIAD</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Administration technique</p>
                  <p className="mt-2 font-bold text-slate-900">Fadil KENDIRA</p>
                  <p className="mt-1 text-xs">Délégué syndical · Administrateur du site</p>
                </div>
              </div>
            </LegalSection>

            <LegalSection number="03" title="Hébergement du site" icon={Server}>
              <div className="space-y-3">
                <p><strong className="text-slate-900">Site web :</strong> hébergement web et déploiement applicatif.</p>
                <p><strong className="text-slate-900">Base de données :</strong> Supabase, avec des serveurs situés dans l’Union européenne.</p>
                <p><strong className="text-slate-900">Nom de domaine :</strong> focomues-iliad.fr.</p>
              </div>
            </LegalSection>

            <LegalSection number="04" title="Traitement des données d’adhésion" icon={ScrollText}>
              <div className="space-y-3">
                <p>
                  <strong className="text-slate-900">Génération du bulletin :</strong> le formulaire permet de générer un bulletin PDF officiel prérempli à partir des informations saisies.
                </p>
                <p>
                  <strong className="text-slate-900">Transmission :</strong> le bulletin peut être téléchargé ou envoyé par e-mail à FO COM, avec une copie facultative adressée à l’adhérent.
                </p>
                <p>
                  <strong className="text-slate-900">Données bancaires :</strong> lorsque le prélèvement est choisi, les coordonnées nécessaires sont intégrées uniquement au bulletin destiné à une transmission sécurisée. Elles sont exclues des e-mails générés par le site.
                </p>
                <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4 text-teal-900">
                  <ShieldCheck className="mb-2 h-5 w-5" />
                  <p className="font-bold">Protection des données</p>
                  <p className="mt-1 text-xs leading-relaxed">
                    Consultez la <Link to="/rgpd" className="font-bold underline underline-offset-2">politique de protection des données</Link> pour connaître les finalités, les durées de conservation et vos droits.
                  </p>
                </div>
              </div>
            </LegalSection>

            <LegalSection number="05" title="Propriété intellectuelle" icon={Scale}>
              <p>
                L’ensemble du contenu du site, notamment les textes, images, graphismes, logos et documents, appartient à FOCOM UES ILIAD ou est utilisé avec autorisation. Toute reproduction, distribution, modification ou publication est interdite sans accord préalable.
              </p>
            </LegalSection>

            <LegalSection number="06" title="Limitation de responsabilité" icon={Gavel}>
              <p>
                FOCOM UES ILIAD s’efforce d’assurer l’exactitude et la mise à jour des informations diffusées. L’organisation ne peut toutefois garantir l’exhaustivité ou l’absence d’erreur de l’ensemble des contenus mis à disposition.
              </p>
            </LegalSection>

            <LegalSection number="07" title="Droit applicable" icon={Scale}>
              <p>
                Le site et les présentes mentions légales sont régis par le droit français. En cas de litige, les tribunaux français seront seuls compétents.
              </p>
            </LegalSection>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-6">
            <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm">
              <CardContent className="p-5">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-red-600">Accès rapides</p>
                <div className="mt-4 space-y-2">
                  {quickLinks.map(({ to, label, icon: Icon }) => (
                    <Link
                      key={to}
                      to={to}
                      className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-slate-200/80 bg-[#13233A] text-white shadow-sm">
              <CardContent className="p-5">
                <CalendarDays className="h-5 w-5 text-teal-300" />
                <p className="mt-3 text-sm font-extrabold">Dernière mise à jour</p>
                <p className="mt-1 text-xs text-white/65">23 novembre 2026</p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}
