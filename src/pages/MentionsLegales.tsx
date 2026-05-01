import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, FileText, AlertCircle } from "lucide-react";

const LOGO_IMAGE = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663612648040/LldXxCbhFdcPcHwX.png";

export default function MentionsLegales() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/")} className="p-2 rounded-lg hover:bg-slate-100">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <img src={LOGO_IMAGE} alt="FO Com" className="h-12 w-12 object-contain" />
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-slate-900 leading-tight">FOCOM UES ILIAD</h1>
                <p className="text-[11px] text-slate-500 font-medium tracking-wide uppercase">Mentions Légales</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4 lg:p-8">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-2xl p-8 sm:p-12 mb-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-10 h-10" />
            <h2 className="text-2xl sm:text-4xl font-extrabold">Mentions Légales</h2>
          </div>
          <p className="text-slate-300 text-base sm:text-lg">
            Informations légales relatives au site focomues-iliad.fr
          </p>
        </section>

        {/* Content */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8">
          {/* Éditeur */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-teal-600" />
              1. Éditeur du site
            </h3>
            <div className="text-sm text-slate-600 space-y-2">
              <p>Le site <strong>focomues-iliad.fr</strong> est édité par :</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>FOCOM UES ILIAD</strong> – Syndicat Force Ouvrière</li>
                <li>Unité Économique et Sociale (UES) ILIAD</li>
                <li>8 rue de la Ville l'Évêque, 75008 Paris</li>
                <li>Téléphone : 01 87 15 43 11</li>
                <li>Email : contact@focomues-iliad.fr</li>
              </ul>
            </div>
          </section>

          {/* Directeur de publication */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-teal-600" />
              2. Directeur de publication
            </h3>
            <p className="text-sm text-slate-600">
              Le directeur de publication est le Secrétaire Général de la FOCOM UES ILIAD.
            </p>
          </section>

          {/* Hébergeur */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-teal-600" />
              3. Hébergeur du site
            </h3>
            <div className="text-sm text-slate-600 space-y-1">
              <p>Le site est hébergé par :</p>
              <p><strong>Amazon Web Services (AWS)</strong></p>
              <p>67 boulevard du Général Leclerc</p>
              <p>92110 Clichy, France</p>
            </div>
          </section>

          {/* Propriété intellectuelle */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-teal-600" />
              4. Propriété intellectuelle
            </h3>
            <div className="text-sm text-slate-600 space-y-2">
              <p>
                L'ensemble des contenus présents sur ce site (textes, images, logos, icônes, vidéos, etc.) sont la propriété exclusive de la FOCOM UES ILIAD ou de leurs auteurs respectifs.
              </p>
              <p>
                Toute reproduction, représentation, modification ou adaptation, totale ou partielle, est strictement interdite sans l'autorisation préalable et écrite de la FOCOM UES ILIAD.
              </p>
              <p>
                Les marques et logos apposés sur le site sont des marques déposées. Leur utilisation sans autorisation constitue une contrefaçon.
              </p>
            </div>
          </section>

          {/* Données personnelles */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-teal-600" />
              5. Données personnelles
            </h3>
            <div className="text-sm text-slate-600 space-y-2">
              <p>
                La FOCOM UES ILIAD s'engage à protéger les données personnelles des utilisateurs du site conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés.
              </p>
              <p>
                Les informations collectées via le formulaire de contact sont destinées uniquement aux membres du syndicat et ne sont en aucun cas transmises à des tiers.
              </p>
              <p>
                Pour plus d'informations, consultez notre{" "}
                <button onClick={() => navigate("/rgpd")} className="text-teal-600 hover:text-teal-700 underline">
                  politique de confidentialité
                </button>
                .
              </p>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-teal-600" />
              6. Cookies
            </h3>
            <div className="text-sm text-slate-600 space-y-2">
              <p>
                Le site peut être amené à déposer des cookies sur votre terminal pour assurer son bon fonctionnement et améliorer l'expérience utilisateur.
              </p>
              <p>
                Vous pouvez configurer votre navigateur pour accepter ou refuser les cookies. Le refus des cookies peut limiter certaines fonctionnalités du site.
              </p>
            </div>
          </section>

          {/* Responsabilité */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-teal-600" />
              7. Responsabilité
            </h3>
            <div className="text-sm text-slate-600 space-y-2">
              <p>
                La FOCOM UES ILIAD s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur le site. Toutefois, la FOCOM ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition.
              </p>
              <p>
                En conséquence, l'utilisateur est informé qu'il utilise les informations fournies sous sa seule responsabilité.
              </p>
            </div>
          </section>

          {/* Liens hypertextes */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-teal-600" />
              8. Liens hypertextes
            </h3>
            <div className="text-sm text-slate-600 space-y-2">
              <p>
                Le site peut contenir des liens vers des sites tiers. La FOCOM UES ILIAD n'exerce aucun contrôle sur ces sites et ne saurait être tenue responsable de leur contenu ou de leurs pratiques en matière de protection des données.
              </p>
            </div>
          </section>

          {/* Droit applicable */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-teal-600" />
              9. Droit applicable
            </h3>
            <p className="text-sm text-slate-600">
              Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux français seront compétents.
            </p>
          </section>
        </div>

        {/* Alert */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Dernière mise à jour</p>
            <p className="text-xs text-amber-700 mt-1">
              Ces mentions légales ont été mises à jour le 1er mai 2026.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-white border-t border-slate-200 py-6">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">© 2026 FOCOM UES ILIAD – Tous droits réservés</p>
            <div className="flex gap-4">
              <button onClick={() => navigate("/mentions-legales")} className="text-xs text-slate-500 hover:text-slate-700">
                Mentions légales
              </button>
              <button onClick={() => navigate("/rgpd")} className="text-xs text-slate-500 hover:text-slate-700">
                Politique de confidentialité
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
