import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Building2, Server, BookOpen, Scale, ShieldCheck, Fingerprint } from "lucide-react";

const MentionsLegales = () => {
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
            <FileText className="h-12 w-12 text-primary-foreground" />
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary-foreground">
                Mentions Légales
              </h1>
              <p className="text-primary-foreground/70 text-sm mt-1">
                www.focomues-iliad.fr — mise à jour le 2 juin 2026
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-grow py-12">
        <div className="container mx-auto px-4 max-w-4xl space-y-6">

          {/* Identification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" /> Identification de l'organisation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground text-sm">
              <div>
                <h3 className="font-semibold text-foreground mb-1">Dénomination</h3>
                <p>FOCOM UES ILIAD</p>
                <p>Section syndicale Force Ouvrière Communication</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Adresse</h3>
                <p>8 rue de la Ville l'Évêque</p>
                <p>75008 Paris, France</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Contact</h3>
                <p>Email : contact@focomues-iliad.fr</p>
              </div>
            </CardContent>
          </Card>

          {/* Direction & Administration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" /> Direction & Administration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground text-sm">
              <p>
                <strong className="text-foreground">Direction de publication :</strong> FO COM UES ILIAD
              </p>
              <p>
                <strong className="text-foreground">Administration technique :</strong> Fadil KENDIRA — Délégué Syndical — Administrateur du site www.focomues-iliad.fr
              </p>
            </CardContent>
          </Card>

          {/* Hébergement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-primary" /> Hébergement du site
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground text-sm">
              <p>
                <strong className="text-foreground">Site web :</strong> Sevalla by Kinsta — infrastructure cloud, hébergement applicatif.
              </p>
              <p>
                <strong className="text-foreground">Base de données :</strong> Supabase — serveurs situés dans l'Union Européenne.
              </p>
              <p>
                <strong className="text-foreground">Nom de domaine :</strong> www.focomues-iliad.fr
              </p>
            </CardContent>
          </Card>

          {/* Traitement des données */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" /> Traitement des données et authentification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground text-sm">
              <p>
                <strong className="text-foreground">Génération du bulletin :</strong> le formulaire d'adhésion permet de générer un bulletin PDF officiel pré-rempli à partir des informations saisies par l'utilisateur.
              </p>
              <p>
                <strong className="text-foreground">Transmission :</strong> le bulletin peut être téléchargé puis transmis à FO COM via la messagerie du site ou par email.
              </p>
              <p>
                <strong className="text-foreground">Données bancaires :</strong> si l'utilisateur opte pour le prélèvement, les coordonnées nécessaires sont intégrées au bulletin PDF officiel transmis au syndicat.
              </p>
              <div className="flex items-start gap-2 bg-primary/5 border border-primary/20 rounded-lg p-3 mt-2">
                <Fingerprint className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-foreground mb-0.5">
                    Authentification sans mot de passe
                    <Badge variant="outline" className="ml-2 text-[10px] font-normal">WebAuthn / FIDO2</Badge>
                  </p>
                  <p>
                    Aucun mot de passe n'est utilisé ni stocké. L'accès à l'espace membre repose sur des passkeys (empreinte digitale, reconnaissance faciale ou code PIN) ou sur des liens de connexion à usage unique envoyés par email (magic link). Tout nouveau compte est soumis à validation par un administrateur avant accès aux fonctionnalités membres.
                  </p>
                </div>
              </div>
              <p>
                Pour plus d'informations, consultez notre{" "}
                <Link to="/rgpd" className="text-primary hover:underline">Politique de Protection des Données</Link>.
              </p>
            </CardContent>
          </Card>

          {/* Propriété intellectuelle */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" /> Propriété intellectuelle
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              <p>
                L'ensemble du contenu de ce site, incluant les textes, images, graphismes, logos, documents et éléments visuels, est la propriété de FOCOM UES ILIAD ou fait l'objet d'une autorisation d'utilisation. Toute reproduction, distribution, modification ou publication est interdite sans accord préalable.
              </p>
            </CardContent>
          </Card>

          {/* Limitation de responsabilité */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" /> Limitation de responsabilité
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              <p>
                FOCOM UES ILIAD s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site. Toutefois, l'organisation ne peut garantir l'exactitude, la précision ou l'exhaustivité de toutes les informations mises à disposition.
              </p>
            </CardContent>
          </Card>

          {/* Droit applicable */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" /> Droit applicable
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              <p>
                Le présent site et les présentes mentions légales sont régis par le droit français. En cas de litige, les tribunaux français seront seuls compétents.
              </p>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
};

export default MentionsLegales;
