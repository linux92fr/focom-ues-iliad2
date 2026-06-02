import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield, FileText, AlertCircle, CheckCircle2,
  Eye, Database, Lock, UserCheck, Fingerprint, MessageSquare, Mail,
} from "lucide-react";

export default function RGPD() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 p-3 sm:p-4 lg:p-8">

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-[#13233A] p-6 text-white shadow-xl sm:p-8 lg:p-10 mb-6">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border-[52px] border-white/5" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-red-600/20 blur-3xl" />
        <div className="relative">
          <Badge className="mb-4 border border-white/15 bg-white/10 text-white hover:bg-white/10">
            <Shield className="mr-1 h-3.5 w-3.5" /> RGPD
          </Badge>
          <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
            Politique de Protection des Données
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
            Conformément au Règlement Général sur la Protection des Données et à la loi Informatique et Libertés.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="bg-red-600 text-white hover:bg-red-700">
              <a href="#droits"><Shield className="mr-2 h-4 w-4" /> Vos droits</a>
            </Button>
            <Button asChild variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
              <Link to="/contact"><Mail className="mr-2 h-4 w-4" /> Nous contacter</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="space-y-4 max-w-4xl mx-auto">

        {/* 1. Introduction */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
            <FileText className="h-5 w-5 text-red-600" /> 1. Introduction
          </h2>
          <div className="text-sm text-slate-600 space-y-2">
            <p>FO COM UES ILIAD accorde une grande importance à la protection des données personnelles de ses adhérents et des utilisateurs du site.</p>
            <p>Cette politique vous informe de manière claire sur la collecte, l'utilisation, la conservation et la protection de vos données personnelles.</p>
          </div>
        </div>

        {/* 2. Responsable du traitement */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-red-600" /> 2. Responsable du traitement
          </h2>
          <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside ml-1">
            <li><strong className="text-slate-900">FOCOM UES ILIAD</strong></li>
            <li>8 rue de la Ville l'Évêque, 75008 Paris</li>
            <li>Email : contact@focomues-iliad.fr</li>
          </ul>
        </div>

        {/* 3. Données collectées */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Database className="h-5 w-5 text-red-600" /> 3. Données collectées et finalités
          </h2>
          <div className="space-y-4 text-sm text-slate-600">
            <div>
              <p className="font-semibold text-slate-900 mb-1">Formulaire d'adhésion</p>
              <p>Civilité, nom, prénom, adresse, téléphone, email, entreprise, statut professionnel et signature. Finalité : générer un bulletin PDF pré-rempli à transmettre au syndicat.</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900 mb-1">Messagerie / demandes</p>
              <p>Identité, email, contenu du message et pièces jointes. Finalité : répondre aux demandes et accompagner les salariés.</p>
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
              <p className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
                <Fingerprint className="h-4 w-4 text-red-600" /> Compte adhérent
                <Badge variant="outline" className="text-[10px] font-normal border-slate-300">Sans mot de passe</Badge>
              </p>
              <p>Email, prénom, nom et clé publique passkey (WebAuthn/FIDO2 — stockée côté serveur). Aucun mot de passe n'est collecté ni stocké. L'authentification repose sur des passkeys (empreinte, visage ou code PIN) et des liens à usage unique (magic link). Tout nouveau compte est soumis à <strong className="text-slate-800">validation par un administrateur</strong> avant accès à l'espace membre.</p>
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
              <p className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-red-600" /> Fil d'actualités — réactions et commentaires
              </p>
              <p>Les réactions sont anonymes, associées à un identifiant de session temporaire stocké sur l'appareil. Les commentaires sont soumis à <strong className="text-slate-800">modération avant publication</strong>.</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900 mb-1">Newsletter</p>
              <p>Adresse email uniquement. Désinscription possible à tout moment.</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900 mb-1">Navigation et sécurité</p>
              <p>Journaux de connexion, données de session et cookies nécessaires au fonctionnement et à la sécurité.</p>
            </div>
          </div>
        </div>

        {/* 4 & 5 côte à côte */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-red-600" /> 4. Base légale
            </h2>
            <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside ml-1">
              <li>Votre consentement pour la newsletter et les formulaires.</li>
              <li>L'exécution de l'adhésion syndicale.</li>
              <li>L'intérêt légitime du syndicat.</li>
              <li>Les obligations légales applicables.</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Database className="h-5 w-5 text-red-600" /> 5. Durées de conservation
            </h2>
            <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside ml-1">
              <li><strong className="text-slate-800">Adhésion :</strong> durée de l'adhésion puis archivage légal.</li>
              <li><strong className="text-slate-800">Compte :</strong> jusqu'à suppression.</li>
              <li><strong className="text-slate-800">Messages :</strong> durée du traitement.</li>
              <li><strong className="text-slate-800">Newsletter :</strong> jusqu'à désinscription.</li>
            </ul>
          </div>
        </div>

        {/* 6. Destinataires */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-red-600" /> 6. Destinataires des données
          </h2>
          <div className="text-sm text-slate-600 space-y-2">
            <p>Vos données sont destinées uniquement :</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Aux représentants FO COM habilités.</li>
              <li>Aux administrateurs autorisés du site.</li>
              <li>Aux prestataires techniques nécessaires (Supabase — serveurs UE).</li>
            </ul>
            <p className="font-medium text-slate-800">Vos données ne sont jamais vendues ou transmises à des tiers à des fins commerciales.</p>
          </div>
        </div>

        {/* 7. Sécurité */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Lock className="h-5 w-5 text-red-600" /> 7. Sécurité des données
          </h2>
          <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside ml-1">
            <li>Connexions sécurisées HTTPS.</li>
            <li>Authentification sans mot de passe par passkey (WebAuthn/FIDO2) — standard recommandé par l'ANSSI, résistant au phishing.</li>
            <li>Lien de connexion à usage unique (magic link) comme alternative.</li>
            <li>Validation manuelle des nouveaux comptes par un administrateur.</li>
            <li>Accès restreint aux données personnelles et gestion des rôles.</li>
            <li>Stockage sécurisé des pièces jointes.</li>
          </ul>
        </div>

        {/* 8. Vos droits */}
        <div id="droits" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" /> 8. Vos droits
          </h2>
          <div className="text-sm text-slate-600 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {["Accès", "Rectification", "Effacement", "Limitation", "Portabilité", "Opposition"].map((droit) => (
                <div key={droit} className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-center text-xs font-medium text-slate-700">
                  {droit}
                </div>
              ))}
            </div>
            <p>Pour exercer vos droits : <strong className="text-slate-900">contact@focomues-iliad.fr</strong></p>
            <p>
              Réclamation auprès de la CNIL :{" "}
              <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline font-medium">
                www.cnil.fr
              </a>
            </p>
          </div>
        </div>

        {/* 9 & 10 côte à côte */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Eye className="h-5 w-5 text-red-600" /> 9. Cookies
            </h2>
            <p className="text-sm text-slate-600">Uniquement des cookies nécessaires au fonctionnement, à l'authentification et à la sécurité. Aucun cookie marketing.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-red-600" /> 10. Évolution
            </h2>
            <p className="text-sm text-slate-600">FOCOM UES ILIAD peut modifier cette politique afin de l'adapter aux évolutions légales, techniques ou organisationnelles.</p>
          </div>
        </div>

        {/* Mise à jour */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Dernière mise à jour</p>
            <p className="text-xs text-amber-700 mt-0.5">Cette politique de confidentialité a été mise à jour le 2 juin 2026.</p>
          </div>
        </div>

      </div>
    </main>
  );
}
