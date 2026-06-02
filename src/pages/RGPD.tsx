import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Shield, FileText, AlertCircle, CheckCircle2, Eye, Database, Lock, UserCheck } from "lucide-react";

const LOGO_IMAGE = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663612648040/LldXxCbhFdcPcHwX.png";

export default function RGPD() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/")} className="p-2 rounded-lg hover:bg-slate-100" aria-label="Retour accueil">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <img loading="lazy" src={LOGO_IMAGE} alt="FO COM" className="h-12 w-12 object-contain" />
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-slate-900 leading-tight">FOCOM UES ILIAD</h1>
                <p className="text-[11px] text-slate-500 font-medium tracking-wide uppercase">Politique de confidentialité</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 lg:p-8">
        <section className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-8 sm:p-12 mb-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-10 h-10" />
            <h2 className="text-2xl sm:text-4xl font-extrabold">Politique de Protection des Données</h2>
          </div>
          <p className="text-teal-100 text-base sm:text-lg">
            Protection de vos données personnelles conformément au RGPD.
          </p>
        </section>

        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8">
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" /> 1. Introduction
            </h3>
            <div className="text-sm text-slate-600 space-y-2">
              <p>
                FO COM UES ILIAD accorde une grande importance à la protection des données personnelles de ses adhérents et des utilisateurs du site.
              </p>
              <p>
                Cette politique vous informe de manière claire sur la collecte, l’utilisation, la conservation et la protection de vos données personnelles, conformément au Règlement Général sur la Protection des Données et à la loi Informatique et Libertés.
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-teal-600" /> 2. Responsable du traitement
            </h3>
            <div className="text-sm text-slate-600 space-y-1">
              <p>Le responsable du traitement est :</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>FOCOM UES ILIAD</strong></li>
                <li>8 rue de la Ville l'Évêque, 75008 Paris</li>
                <li>Téléphone : <Link to="/le-syndicat" className="text-red-600 hover:underline">01 87 15 43 11</Link></li>
                <li>Email : contact@focomues-iliad.fr</li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-teal-600" /> 3. Données collectées et finalités
            </h3>
            <div className="text-sm text-slate-600 space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Formulaire d’adhésion</h4>
                <p>
                  Données collectées : civilité, nom, prénom, adresse, téléphone, email, entreprise, statut professionnel, signature et informations nécessaires au bulletin d’adhésion officiel.
                </p>
                <p className="mt-1">
                  Finalité : générer un bulletin PDF officiel pré-rempli, permettre son téléchargement puis sa transmission au syndicat via la messagerie du site ou par email.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Messagerie / demandes</h4>
                <p>
                  Données collectées : identité du demandeur, email, contenu du message, pièces jointes éventuelles. Finalité : répondre aux demandes, suivre les dossiers et accompagner les salariés.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Compte adhérent</h4>
                <p>
                  Données collectées : email, mot de passe chiffré, profil adhérent, carte adhérent, notifications et données nécessaires à l’accès à l’espace personnel.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Newsletter</h4>
                <p>
                  Données collectées : adresse email. Finalité : envoi d’informations syndicales, actualités, alertes sociales et documents utiles. Désinscription possible à tout moment.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Navigation et sécurité</h4>
                <p>
                  Données techniques : journaux de connexion, données de session, cookies nécessaires, informations utiles à la sécurité du site et au bon fonctionnement de l’authentification.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-teal-600" /> 4. Base légale du traitement
            </h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 ml-2">
              <li>Votre consentement pour la newsletter, les formulaires et certaines communications.</li>
              <li>L’exécution de l’adhésion syndicale et la gestion du lien adhérent.</li>
              <li>L’intérêt légitime du syndicat pour informer, défendre et accompagner les salariés.</li>
              <li>Le respect des obligations légales applicables aux organisations syndicales.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-teal-600" /> 5. Durées de conservation
            </h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 ml-2">
              <li><strong>Données d’adhésion :</strong> durée de l’adhésion puis archivage selon les obligations légales applicables.</li>
              <li><strong>Compte adhérent :</strong> tant que le compte est actif ou jusqu’à demande de suppression.</li>
              <li><strong>Messages / demandes :</strong> durée nécessaire au traitement et au suivi du dossier.</li>
              <li><strong>Newsletter :</strong> jusqu’à désinscription.</li>
              <li><strong>Cookies et données techniques :</strong> durée strictement nécessaire au fonctionnement et à la sécurité.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-teal-600" /> 6. Destinataires des données
            </h3>
            <div className="text-sm text-slate-600 space-y-2">
              <p>Vos données sont destinées uniquement :</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Aux représentants FO COM habilités.</li>
                <li>Aux administrateurs autorisés du site.</li>
                <li>Aux prestataires techniques strictement nécessaires au fonctionnement du service, notamment Supabase.</li>
              </ul>
              <p>Vos données ne sont jamais vendues ou transmises à des tiers à des fins commerciales.</p>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-teal-600" /> 7. Sécurité des données
            </h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 ml-2">
              <li>Connexions sécurisées en HTTPS.</li>
              <li>Mots de passe chiffrés.</li>
              <li>Accès restreint aux données personnelles.</li>
              <li>Gestion des rôles administrateurs.</li>
              <li>Stockage sécurisé des pièces jointes et documents.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-teal-600" /> 8. Vos droits
            </h3>
            <div className="text-sm text-slate-600 space-y-2">
              <p>Conformément au RGPD, vous disposez des droits suivants :</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Droit d’accès.</li>
                <li>Droit de rectification.</li>
                <li>Droit à l’effacement.</li>
                <li>Droit à la limitation du traitement.</li>
                <li>Droit à la portabilité.</li>
                <li>Droit d’opposition.</li>
              </ul>
              <p>Pour exercer vos droits : <strong>contact@focomues-iliad.fr</strong></p>
              <p>Vous pouvez également introduire une réclamation auprès de la CNIL : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-700 underline">www.cnil.fr</a></p>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-teal-600" /> 9. Cookies
            </h3>
            <div className="text-sm text-slate-600 space-y-2">
              <p>Le site utilise principalement des cookies nécessaires au fonctionnement de l’application, à l’authentification et à la sécurité.</p>
              <p>Aucun cookie marketing n’est utilisé. Les cookies analytiques éventuels ne sont déposés qu’en cas de consentement.</p>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" /> 10. Modification de la politique
            </h3>
            <p className="text-sm text-slate-600">FOCOM UES ILIAD peut modifier cette politique afin de l’adapter aux évolutions légales, techniques ou organisationnelles.</p>
          </section>
        </div>

        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Dernière mise à jour</p>
            <p className="text-xs text-amber-700 mt-1">Cette politique de confidentialité a été mise à jour le 21 mai 2026.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
