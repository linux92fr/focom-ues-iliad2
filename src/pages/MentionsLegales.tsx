import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";

const MentionsLegales = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">

      {/* Hero */}
      <section className="py-12 gradient-hero">
        <div className="container mx-auto px-4">
          <Link to="/">
            <Button
              variant="ghost"
              className="mb-6 text-primary-foreground hover:bg-primary-foreground/10"
            >
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
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Éditeur du site</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-muted-foreground">
                <p>
                  <strong>FOCOM UES ILIAD</strong><br />
                  Section syndicale Force Ouvrière Communication<br />
                  Adresse : Paris, France<br />
                  Email : contact@focomues-iliad.fr
                </p>
                <p>
                  Directeur de la publication : KENDIRA Fadil
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hébergement</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-muted-foreground">
                <p>
                  Ce site est hébergé par :<br />
                  <strong>O2switch / Supabase</strong><br />
                  Services d'hébergement web
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Propriété intellectuelle</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-muted-foreground">
                <p>
                  L'ensemble de ce site relève de la législation française et internationale
                  sur le droit d'auteur et la propriété intellectuelle. Tous les droits de
                  reproduction sont réservés, y compris pour les documents téléchargeables
                  et les représentations iconographiques et photographiques.
                </p>
                <p>
                  La reproduction de tout ou partie de ce site sur un support électronique
                  quel qu'il soit est formellement interdite sauf autorisation expresse du
                  directeur de la publication.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Protection des données personnelles</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-muted-foreground">
                <p>
                  Conformément au Règlement Général sur la Protection des Données (RGPD) et
                  à la loi Informatique et Libertés, vous disposez d'un droit d'accès, de
                  rectification, de suppression et d'opposition aux données personnelles
                  vous concernant.
                </p>
                <p>
                  Pour exercer ces droits, vous pouvez nous contacter à l'adresse email
                  suivante : contact@focomues-iliad.fr
                </p>
                <p>
                  Les informations collectées sur ce site sont utilisées uniquement dans le
                  cadre de la relation syndicale et ne sont jamais transmises à des tiers
                  sans votre consentement.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cookies</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-muted-foreground">
                <p>
                  Ce site utilise des cookies essentiels au fonctionnement de l'application,
                  notamment pour la gestion de l'authentification des utilisateurs.
                </p>
                <p>
                  Aucun cookie à des fins publicitaires ou de suivi marketing n'est utilisé
                  sur ce site.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Limitation de responsabilité</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-muted-foreground">
                <p>
                  Les informations contenues sur ce site sont aussi précises que possible et
                  le site est périodiquement remis à jour, mais peut toutefois contenir des
                  inexactitudes, des omissions ou des lacunes.
                </p>
                <p>
                  Si vous constatez une lacune, erreur ou ce qui parait être un
                  dysfonctionnement, merci de bien vouloir le signaler par email à
                  contact@focomues-iliad.fr.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Droit applicable</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-muted-foreground">
                <p>
                  Le présent site et les présentes mentions légales sont régis par le droit
                  français. En cas de litige, les tribunaux français seront seuls compétents.
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
