import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";

const MentionsLegales = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
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
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary-foreground">
              Mentions Légales
            </h1>
          </div>
        </div>
      </section>

      <main className="flex-grow py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Identification de l'organisation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Dénomination</h3>
                  <p>FOCOM UES ILIAD</p>
                  <p>Section syndicale Force Ouvrière Communication</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Adresse</h3>
                  <p>8 rue de la Ville l'Évêque</p>
                  <p>75008 Paris, France</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Contact</h3>
                  <p>Téléphone : <Link to="/le-syndicat" className="text-red-600 hover:underline">01 87 15 43 11</Link></p>
                  <p>Email : contact@focomues-iliad.fr</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Direction & Administration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-muted-foreground">
                <p>
                  <strong>Direction de publication :</strong> FO COM UES ILIAD
                </p>
                <p>
                  <strong>Administration technique :</strong> Fadil KENDIRA — Délégué Syndical — Administrateur du site focomues-iliad.fr
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hébergement du site</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-muted-foreground">
                <p><strong>Site web :</strong> hébergement web et déploiement applicatif.</p>
                <p><strong>Base de données :</strong> Supabase — serveurs situés dans l'Union Européenne.</p>
                <p><strong>Nom de domaine :</strong> focomues-iliad.fr.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Traitement des données d'adhésion</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-muted-foreground">
                <p>
                  <strong>Génération du bulletin :</strong> le formulaire d'adhésion permet de générer un bulletin PDF officiel pré-rempli à partir des informations saisies par l'utilisateur.
                </p>
                <p>
                  <strong>Transmission :</strong> le bulletin peut être téléchargé puis transmis à FO COM via la messagerie du site ou par email.
                </p>
                <p>
                  <strong>Données bancaires :</strong> si l'utilisateur opte pour le prélèvement, les coordonnées nécessaires sont intégrées au bulletin PDF officiel transmis au syndicat.
                </p>
                <p>
                  Pour plus d'informations, consultez notre <Link to="/rgpd" className="text-primary hover:underline">Politique de Protection des Données</Link>.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Propriété intellectuelle</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>
                  L'ensemble du contenu de ce site, incluant les textes, images, graphismes, logos, documents et éléments visuels, est la propriété de FOCOM UES ILIAD ou fait l'objet d'une autorisation d'utilisation. Toute reproduction, distribution, modification ou publication est interdite sans accord préalable.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Limitation de responsabilité</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>
                  FOCOM UES ILIAD s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site. Toutefois, l'organisation ne peut garantir l'exactitude, la précision ou l'exhaustivité de toutes les informations mises à disposition.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Droit applicable</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>
                  Le présent site et les présentes mentions légales sont régis par le droit français. En cas de litige, les tribunaux français seront seuls compétents.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MentionsLegales;
