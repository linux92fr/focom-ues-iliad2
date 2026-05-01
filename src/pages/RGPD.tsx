import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, FileText, AlertCircle, CheckCircle2, Eye, Database, Lock, UserCheck } from "lucide-react";

const LOGO_IMAGE = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663612648040/LldXxCbhFdcPcHwX.png";

export default function RGPD() {
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
                <p className="text-[11px] text-slate-500 font-medium tracking-wide uppercase">Politique de Confidentialité</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4 lg:p-8">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-8 sm:p-12 mb-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-10 h-10" />
            <h2 className="text-2xl sm:text-4xl font-extrabold">Politique de Confidentialité</h2>
          </div>
          <p className="text-teal-100 text-base sm:text-lg">
            Protection de vos données personnelles conformément au RGPD
          </p>
        </section>

        {/* Content */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8">
          {/* Introduction */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              1. Introduction
            </h3>
            <div className="text-sm text-slate-600 space-y-2">
              <p>
                La FOCOM UES ILIAD accorde une grande importance à la protection des données personnelles de ses adhérents et des utilisateurs de son site.
              </p>
              <p>
                La présente politique de confidentialité a pour objet de vous informer de manière claire et transparente sur la manière dont nous collectons, utilisons et protégeons vos données personnelles, conformément au Règlement Général sur la Protection des Données (RGPD) n°2016/679 du 27 avril 2016 et à la loi Informatique et Libertés du 6 janvier 1978 modifiée.
              </p>
            </div>
          </section>

          {/* Responsable de traitement */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-teal-600" />
              2. Responsable du traitement
            </h3>
            <div className="text-sm text-slate-600 space-y-1">
              <p>Le responsable du traitement des données est :</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>FOCOM UES ILIAD</strong></li>
                <li>8 rue de la Ville l'Évêque, 75008 Paris</li>
                <li>Téléphone : 01 87 15 43 11</li>
                <li>Email : contact@focomues-iliad.fr</li>
              </ul>
            </div>
          </section>

          {/* Données collectées */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-teal-600" />
              3. Données collectées
            </h3>
            <div className="text-sm text-slate-600 space-y-2">
              <p>Nous sommes amenés à collecter les suivantes :</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Via le formulaire de contact :</strong> nom, prénom, adresse email, sujet et contenu du message</li>
                <li><strong>Via le formulaire d'adhésion :</strong> nom, prénom, adresse, téléphone, email, entreprise, service</li>
                <li><strong>Données de navigation :</strong> adresse IP, pages visitées, date et heure de connexion</li>
              </ul>
            </div>
          </section>

          {/* Finalités */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-teal-600" />
              4. Finalités du traitement
            </h3>
            <div className="text-sm text-slate-600 space-y-2">
              <p>Vos données sont collectées pour les finalités suivantes :</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Traiter vos demandes de contact et vous répondre</li>
                <li>Gérer votre adhésion au syndicat</li>
                <li>Vous informer sur nos actions et actualités</li>
                <li>Améliorer notre site et nos services</li>
                <li>Assurer la sécurité de notre site</li>
              </ul>
            </div>
          </section>

          {/* Base légale */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-teal-600" />
              5. Base légale du traitement
            </h3>
            <div className="text-sm text-slate-600 space-y-2">
              <p>Le traitement de vos données est fondé sur :</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Votre consentement :</strong> pour l'envoi de newsletters et communications</li>
                <li><strong>L'exécution d'un contrat :</strong> pour la gestion de votre adhésion</li>
                <li><strong>L'intérêt légitime :</strong> pour l'amélioration de nos services</li>
                <li><strong>L'obligation légale :</strong> pour le respect de nos obligations syndicales</li>
              </ul>
            </div>
          </section>

          {/* Durée de conservation */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-teal-600" />
              6. Durée de conservation
            </h3>
            <div className="text-sm text-slate-600 space-y-2">
              <p>Vos données sont conservées pendant les durées suivantes :</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Données de contact :</strong> 1 an après le dernier échange</li>
                <li><strong>Données d'adhésion :</strong> durée de l'adhésion + 3 ans</li>
                <li><strong>Données de navigation :</strong> 13 mois</li>
              </ul>
            </div>
          </section>

          {/* Destinataires */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-teal-600" />
              7. Destinataires des données
            </h3>
            <div className="text-sm text-slate-600 space-y-2">
              <p>
                Vos données sont destinées aux membres autorisés de la FOCOM UES ILIAD. Elles ne sont en aucun cas vendues, louées ou transmises à des tiers à des fins commerciales.
              </p>
              <p>
                Nos sous-traitants (hébergeur, prestataire technique) sont contractuellement tenus de respecter la confidentialité de vos données.
              </p>
            </div>
          </section>

          {/* Sécurité */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-teal-600" />
              8. Sécurité des données
            </h3>
            <div className="text-sm text-slate-600 space-y-2">
              <p>
                Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Chiffrement des données sensibles</li>
                <li>Accès restreint aux données personnelles</li>
                <li>Formation de notre personnel à la protection des données</li>
                <li>Procédures de sauvegarde régulières</li>
              </ul>
            </div>
          </section>

          {/* Vos droits */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-teal-600" />
              9. Vos droits
            </h3>
            <div className="text-sm text-slate-600 space-y-2">
              <p>Conformément au RGPD, vous disposez des droits suivants :</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Droit d'accès :</strong> obtenir la confirmation que vos données sont traitées et y accéder</li>
                <li><strong>Droit de rectification :</strong> corriger des données inexactes ou incomplètes</li>
                <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données</li>
                <li><strong>Droit à la limitation :</strong> restreindre le traitement de vos données</li>
                <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
                <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
              </ul>
              <p className="mt-3">
                Pour exercer vos droits, contactez-nous à : <strong>contact@focomues-iliad.fr</strong>
              </p>
              <p>
                Vous pouvez également introduire une réclamation auprès de la <strong>CNIL</strong> (Commission Nationale de l'Informatique et des Libertés) : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-700 underline">www.cnil.fr</a>
              </p>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-teal-600" />
              10. Cookies
            </h3>
            <div className="text-sm text-slate-600 space-y-2">
              <p>
                Notre site utilise des cookies strictement nécessaires à son fonctionnement. Nous n'utilisons pas de cookies publicitaires ou de traçage.
              </p>
              <p>
                Vous pouvez configurer votre navigateur pour bloquer les cookies, mais cela peut affecter le fonctionnement du site.
              </p>
            </div>
          </section>

          {/* Modifications */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              11. Modifications de la politique
            </h3>
            <p className="text-sm text-slate-600">
              La FOCOM UES ILIAD se réserve le droit de modifier la présente politique de confidentialité à tout moment pour la conformer aux évolutions légales et réglementaires. Vous serez informé de toute modification substantielle.
            </p>
          </section>
        </div>

        {/* Alert */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Dernière mise à jour</p>
            <p className="text-xs text-amber-700 mt-1">
              Cette politique de confidentialité a été mise à jour le 1er mai 2026.
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
