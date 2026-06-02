import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText, Building2, Server, BookOpen, Scale,
  ShieldCheck, Fingerprint, Mail,
} from "lucide-react";

const MentionsLegales = () => {
  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 p-3 sm:p-4 lg:p-8">

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-[#13233A] p-6 text-white shadow-xl sm:p-8 lg:p-10 mb-6">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border-[52px] border-white/5" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-red-600/20 blur-3xl" />
        <div className="relative">
          <Badge className="mb-4 border border-white/15 bg-white/10 text-white hover:bg-white/10">
            <FileText className="mr-1 h-3.5 w-3.5" /> Mentions légales
          </Badge>
          <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
            Mentions Légales
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
            www.focomues-iliad.fr — mise à jour le 2 juin 2026
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
              <Link to="/rgpd"><ShieldCheck className="mr-2 h-4 w-4" /> Politique de confidentialité</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
              <Link to="/contact"><Mail className="mr-2 h-4 w-4" /> Nous contacter</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="space-y-4 max-w-4xl mx-auto">

        {/* Identification */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-red-600" /> Identification de l'organisation
          </h2>
          <div className="grid gap-4 sm:grid-cols-3 text-sm text-slate-600">
            <div>
              <p className="font-semibold text-slate-900 mb-1">Dénomination</p>
              <p>FOCOM UES ILIAD</p>
              <p>Section syndicale Force Ouvrière Communication</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900 mb-1">Adresse</p>
              <p>8 rue de la Ville l'Évêque</p>
              <p>75008 Paris, France</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900 mb-1">Contact</p>
              <p>contact@focomues-iliad.fr</p>
            </div>
          </div>
        </div>

        {/* Direction */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-red-600" /> Direction & Administration
          </h2>
          <div className="text-sm text-slate-600 space-y-2">
            <p><strong className="text-slate-900">Direction de publication :</strong> FO COM UES ILIAD</p>
            <p><strong className="text-slate-900">Administration technique :</strong> Fadil KENDIRA — Délégué Syndical — Administrateur du site www.focomues-iliad.fr</p>
          </div>
        </div>

        {/* Hébergement */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Server className="h-5 w-5 text-red-600" /> Hébergement du site
          </h2>
          <div className="grid gap-3 sm:grid-cols-3 text-sm">
            {[
              { label: "Site web", value: "Sevalla by Kinsta", sub: "Infrastructure cloud, hébergement applicatif" },
              { label: "Base de données", value: "Supabase", sub: "Serveurs dans l'Union Européenne" },
              { label: "Nom de domaine", value: "www.focomues-iliad.fr", sub: "Enregistré en France" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                <p className="font-semibold text-slate-900">{item.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Authentification */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-red-600" /> Traitement des données et authentification
          </h2>
          <div className="text-sm text-slate-600 space-y-3">
            <p><strong className="text-slate-900">Génération du bulletin :</strong> le formulaire d'adhésion génère un bulletin PDF officiel pré-rempli téléchargeable, puis transmissible au syndicat.</p>
            <p><strong className="text-slate-900">Données bancaires :</strong> si prélèvement, les coordonnées sont intégrées au bulletin PDF transmis au syndicat.</p>
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 flex items-start gap-3">
              <Fingerprint className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-slate-900 mb-1">
                  Authentification sans mot de passe
                  <Badge variant="outline" className="ml-2 text-[10px] font-normal border-slate-300">WebAuthn / FIDO2</Badge>
                </p>
                <p>Aucun mot de passe n'est utilisé ni stocké. L'accès repose sur des passkeys (empreinte, visage ou code PIN) ou sur des liens à usage unique envoyés par email (magic link). Tout nouveau compte est soumis à validation par un administrateur.</p>
              </div>
            </div>
            <p>
              Pour plus d'informations :{" "}
              <Link to="/rgpd" className="text-red-600 hover:underline font-medium">
                Politique de Protection des Données →
              </Link>
            </p>
          </div>
        </div>

        {/* PI & Responsabilité côte à côte */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-red-600" /> Propriété intellectuelle
            </h2>
            <p className="text-sm text-slate-600">L'ensemble du contenu (textes, images, logos, documents) est la propriété de FOCOM UES ILIAD. Toute reproduction sans accord préalable est interdite.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Scale className="h-5 w-5 text-red-600" /> Responsabilité & Droit applicable
            </h2>
            <p className="text-sm text-slate-600">FOCOM UES ILIAD s'efforce d'assurer l'exactitude des informations publiées. Le site est régi par le droit français ; les tribunaux français sont seuls compétents en cas de litige.</p>
          </div>
        </div>

      </div>
    </main>
  );
};

export default MentionsLegales;
