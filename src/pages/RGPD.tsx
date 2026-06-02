import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Shield, FileText, AlertCircle, CheckCircle2,
  Eye, Database, Lock, UserCheck, Fingerprint, MessageSquare,
} from "lucide-react";

const SECTIONS = [
  { id: 1, icon: FileText,       title: "Introduction" },
  { id: 2, icon: UserCheck,      title: "Responsable du traitement" },
  { id: 3, icon: Database,       title: "Données collectées et finalités" },
  { id: 4, icon: CheckCircle2,   title: "Base légale du traitement" },
  { id: 5, icon: Database,       title: "Durées de conservation" },
  { id: 6, icon: UserCheck,      title: "Destinataires des données" },
  { id: 7, icon: Lock,           title: "Sécurité des données" },
  { id: 8, icon: Shield,         title: "Vos droits" },
  { id: 9, icon: Eye,            title: "Cookies" },
  { id: 10, icon: FileText,      title: "Modification de la politique" },
];

export default function RGPD() {
  return (
    <div className="min-h-screen flex flex-col bg-background">

      {/* Hero */}
      <section className="py-12 gradient-hero">
        <div className="container mx-auto px-4">
          <Link to="/">
            <Button variant="ghost" className="mb-6 text-primary-foreground hover:bg-primary-foreground/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <Shield className="h-12 w-12 text-primary-foreground" />
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary-foreground">
                Politique de Protection des Données
              </h1>
              <p className="text-primary-foreground/70 text-sm mt-1">
                Conformément au RGPD et à la loi Informatique et Libertés
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-grow py-12">
        <div className="container mx-auto px-4 max-w-4xl space-y-6">

          {/* 1. Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> 1. Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-2 text-sm">
              <p>
                FO COM UES ILIAD accorde une grande importance à la protection des données personnelles de ses adhérents et des utilisateurs du site.
              </p>
              <p>
                Cette politique vous informe de manière claire sur la collecte, l'utilisation, la conservation et la protection de vos données personnelles, conformément au Règlement Général sur la Protection des Données et à la loi Informatique et Libertés.
              </p>
            </CardContent>
          </Card>

          {/* 2. Responsable du traitement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" /> 2. Responsable du traitement
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm space-y-1">
              <p>Le responsable du traitement est :</p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li><strong className="text-foreground">FOCOM UES ILIAD</strong></li>
                <li>8 rue de la Ville l'Évêque, 75008 Paris</li>
                <li>Email : contact@focomues-iliad.fr</li>
              </ul>
            </CardContent>
          </Card>

          {/* 3. Données collectées */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" /> 3. Données collectées et finalités
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-1">Formulaire d'adhésion</h4>
                <p>
                  Données collectées : civilité, nom, prénom, adresse, téléphone, email, entreprise, statut professionnel, signature et informations nécessaires au bulletin d'adhésion officiel.
                </p>
                <p className="mt-1">
                  Finalité : générer un bulletin PDF officiel pré-rempli, permettre son téléchargement puis sa transmission au syndicat via la messagerie du site ou par email.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-1">Messagerie / demandes</h4>
                <p>
                  Données collectées : identité du demandeur, email, contenu du message, pièces jointes éventuelles. Finalité : répondre aux demandes, suivre les dossiers et accompagner les salariés.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Fingerprint className="h-4 w-4 text-primary" />
                  Compte adhérent
                  <Badge variant="outline" className="text-[10px] font-normal">Sans mot de passe</Badge>
                </h4>
                <p>
                  Données collectées : email, profil adhérent (prénom, nom), clé publique passkey (WebAuthn/FIDO2 — stockée côté serveur), carte adhérent, notifications et données nécessaires à l'accès à l'espace personnel.
                </p>
                <p className="mt-1">
                  Aucun mot de passe n'est collecté ni stocké. L'authentification repose sur des passkeys (empreinte digitale, reconnaissance faciale ou code PIN) et sur des liens de connexion à usage unique envoyés par email (magic link). Tout nouveau compte est soumis à validation par un administrateur avant accès à l'espace membre.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Fil d'actualités — réactions et commentaires
                </h4>
                <p>
                  Le fil d'actualités accessible via QR code permet aux visiteurs de réagir et de laisser des commentaires. Les réactions sont anonymes et associées à un identifiant de session temporaire stocké localement sur l'appareil. Les commentaires sont soumis à modération avant publication : ils ne sont visibles qu'après validation explicite par un administrateur.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-1">Newsletter</h4>
                <p>
                  Données collectées : adresse email. Finalité : envoi d'informations syndicales, actualités, alertes sociales et documents utiles. Désinscription possible à tout moment.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-1">Navigation et sécurité</h4>
                <p>
                  Données techniques : journaux de connexion, données de session, cookies nécessaires, informations utiles à la sécurité du site et au bon fonctionnement de l'authentification.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 4. Base légale */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" /> 4. Base légale du traitement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-2">
                <li>Votre consentement pour la newsletter, les formulaires et certaines communications.</li>
                <li>L'exécution de l'adhésion syndicale et la gestion du lien adhérent.</li>
                <li>L'intérêt légitime du syndicat pour informer, défendre et accompagner les salariés.</li>
                <li>Le respect des obligations légales applicables aux organisations syndicales.</li>
              </ul>
            </CardContent>
          </Card>

          {/* 5. Durées de conservation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" /> 5. Durées de conservation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-2">
                <li><strong className="text-foreground">Données d'adhésion :</strong> durée de l'adhésion puis archivage selon les obligations légales applicables.</li>
                <li><strong className="text-foreground">Compte adhérent :</strong> tant que le compte est actif ou jusqu'à demande de suppression.</li>
                <li><strong className="text-foreground">Messages / demandes :</strong> durée nécessaire au traitement et au suivi du dossier.</li>
                <li><strong className="text-foreground">Newsletter :</strong> jusqu'à désinscription.</li>
                <li><strong className="text-foreground">Cookies et données techniques :</strong> durée strictement nécessaire au fonctionnement et à la sécurité.</li>
              </ul>
            </CardContent>
          </Card>

          {/* 6. Destinataires */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" /> 6. Destinataires des données
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm space-y-2">
              <p>Vos données sont destinées uniquement :</p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Aux représentants FO COM habilités.</li>
                <li>Aux administrateurs autorisés du site.</li>
                <li>Aux prestataires techniques strictement nécessaires au fonctionnement du service, notamment Supabase.</li>
              </ul>
              <p>Vos données ne sont jamais vendues ou transmises à des tiers à des fins commerciales.</p>
            </CardContent>
          </Card>

          {/* 7. Sécurité */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" /> 7. Sécurité des données
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-2">
                <li>Connexions sécurisées en HTTPS.</li>
                <li>Authentification sans mot de passe par passkey (WebAuthn/FIDO2) — standard recommandé par l'ANSSI, résistant au phishing et aux fuites de données.</li>
                <li>Lien de connexion à usage unique (magic link) comme alternative sécurisée.</li>
                <li>Validation manuelle des nouveaux comptes par un administrateur.</li>
                <li>Accès restreint aux données personnelles.</li>
                <li>Gestion des rôles administrateurs.</li>
                <li>Stockage sécurisé des pièces jointes et documents.</li>
              </ul>
            </CardContent>
          </Card>

          {/* 8. Vos droits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" /> 8. Vos droits
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm space-y-2">
              <p>Conformément au RGPD, vous disposez des droits suivants :</p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Droit d'accès.</li>
                <li>Droit de rectification.</li>
                <li>Droit à l'effacement.</li>
                <li>Droit à la limitation du traitement.</li>
                <li>Droit à la portabilité.</li>
                <li>Droit d'opposition.</li>
              </ul>
              <p>Pour exercer vos droits : <strong className="text-foreground">contact@focomues-iliad.fr</strong></p>
              <p>
                Vous pouvez également introduire une réclamation auprès de la CNIL :{" "}
                <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  www.cnil.fr
                </a>
              </p>
            </CardContent>
          </Card>

          {/* 9. Cookies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" /> 9. Cookies
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm space-y-2">
              <p>Le site utilise principalement des cookies nécessaires au fonctionnement de l'application, à l'authentification et à la sécurité.</p>
              <p>Aucun cookie marketing n'est utilisé. Les cookies analytiques éventuels ne sont déposés qu'en cas de consentement.</p>
            </CardContent>
          </Card>

          {/* 10. Modification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> 10. Modification de la politique
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              <p>FOCOM UES ILIAD peut modifier cette politique afin de l'adapter aux évolutions légales, techniques ou organisationnelles.</p>
            </CardContent>
          </Card>

          {/* Dernière mise à jour */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Dernière mise à jour</p>
              <p className="text-xs text-amber-700 mt-1">
                Cette politique de confidentialité a été mise à jour le 2 juin 2026.
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
