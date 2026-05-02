import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Scale,
  FileText,
  Clock,
  Euro,
  Briefcase,
  Shield,
  Heart,
  GraduationCap,
  Phone,
  ArrowRight,
} from "lucide-react";

const VosDroits = () => {
  const categories = [
    {
      icon: Clock,
      title: "Temps de travail",
      description: "Durée légale, heures supplémentaires, repos",
      items: [
        {
          question: "Quelle est la durée légale du travail ?",
          answer: "La durée légale du travail est de 35 heures par semaine. Au-delà, les heures sont considérées comme des heures supplémentaires et doivent être majorées.",
        },
        {
          question: "Quels sont mes droits aux congés payés ?",
          answer: "Tout salarié a droit à 2,5 jours ouvrables de congés par mois de travail effectif, soit 30 jours ouvrables (5 semaines) pour une année complète.",
        },
        {
          question: "Qu'est-ce que le droit à la déconnexion ?",
          answer: "Le droit à la déconnexion garantit le respect des temps de repos et de congé. L'employeur doit mettre en place des dispositifs de régulation de l'utilisation des outils numériques.",
        },
      ],
    },
    {
      icon: Euro,
      title: "Rémunération",
      description: "Salaire, primes, avantages",
      items: [
        {
          question: "Quand doit être versé mon salaire ?",
          answer: "Le salaire doit être versé à intervalles réguliers, au moins une fois par mois pour les salariés mensualisés. L'employeur doit remettre un bulletin de paie.",
        },
        {
          question: "Ai-je droit à une prime d'ancienneté ?",
          answer: "La prime d'ancienneté n'est pas obligatoire légalement mais peut être prévue par la convention collective ou le contrat de travail.",
        },
        {
          question: "Qu'est-ce que l'égalité salariale ?",
          answer: "À travail égal, salaire égal. L'employeur doit assurer une égalité de rémunération entre les femmes et les hommes pour un même travail ou un travail de valeur égale.",
        },
      ],
    },
    {
      icon: Briefcase,
      title: "Contrat de travail",
      description: "CDI, CDD, période d'essai",
      items: [
        {
          question: "Quelle est la durée de ma période d'essai ?",
          answer: "Pour un CDI : 2 mois pour les ouvriers/employés, 3 mois pour les agents de maîtrise, 4 mois pour les cadres. Elle peut être renouvelée une fois si un accord le prévoit.",
        },
        {
          question: "Quelles sont les mentions obligatoires du contrat ?",
          answer: "Le contrat doit mentionner : identité des parties, lieu de travail, titre du poste, date de début, durée de travail, rémunération, convention collective applicable.",
        },
        {
          question: "Comment modifier mon contrat de travail ?",
          answer: "Toute modification d'un élément essentiel du contrat nécessite l'accord du salarié. Un refus ne peut constituer une faute, sauf abus.",
        },
      ],
    },
    {
      icon: Shield,
      title: "Protection sociale",
      description: "Maladie, maternité, accidents",
      items: [
        {
          question: "Quels sont mes droits en cas de maladie ?",
          answer: "Après un an d'ancienneté, vous avez droit au maintien de salaire par l'employeur en complément des indemnités journalières de la Sécurité sociale.",
        },
        {
          question: "Quelle est la durée du congé maternité ?",
          answer: "16 semaines pour les 1er et 2ème enfants (6 avant + 10 après), 26 semaines à partir du 3ème enfant, 34 semaines pour des jumeaux.",
        },
        {
          question: "Qu'est-ce qu'un accident du travail ?",
          answer: "Un accident survenu par le fait ou à l'occasion du travail. Il doit être déclaré dans les 24h à l'employeur qui dispose de 48h pour le déclarer à la CPAM.",
        },
      ],
    },
    {
      icon: Heart,
      title: "Santé au travail",
      description: "Prévention, médecine du travail",
      items: [
        {
          question: "À quelle fréquence dois-je voir le médecin du travail ?",
          answer: "Une visite d'information et de prévention est organisée dans les 3 mois suivant l'embauche, puis renouvelée tous les 5 ans maximum.",
        },
        {
          question: "Qu'est-ce que le droit d'alerte ?",
          answer: "Le salarié a le droit d'alerter l'employeur sur toute situation de danger grave et imminent. Il peut exercer son droit de retrait si le danger persiste.",
        },
        {
          question: "Comment signaler un harcèlement ?",
          answer: "Vous pouvez alerter les représentants du personnel, le médecin du travail, l'inspection du travail ou votre syndicat. Le harcèlement est un délit pénal.",
        },
      ],
    },
    {
      icon: GraduationCap,
      title: "Formation",
      description: "CPF, plan de formation, bilan",
      items: [
        {
          question: "Comment utiliser mon CPF ?",
          answer: "Le Compte Personnel de Formation est alimenté de 500€/an (800€ pour les peu qualifiés). Consultez vos droits sur moncompteformation.gouv.fr",
        },
        {
          question: "Ai-je droit à un bilan de compétences ?",
          answer: "Oui, le bilan de compétences est accessible à tout salarié, soit dans le cadre du CPF, soit dans le cadre d'un congé de bilan de compétences.",
        },
        {
          question: "Qu'est-ce que la VAE ?",
          answer: "La Validation des Acquis de l'Expérience permet d'obtenir un diplôme grâce à son expérience professionnelle. Il faut justifier d'au moins 1 an d'expérience.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">

      {/* Hero */}
      <section className="py-16 gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <Scale className="h-16 w-16 text-primary-foreground mx-auto mb-4" />
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            Vos Droits
          </h1>
          <p className="text-primary-foreground/90 max-w-2xl mx-auto">
            Informez-vous sur vos droits en tant que salarié
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <category.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-serif">{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.items.map((item, itemIndex) => (
                      <AccordionItem key={itemIndex} value={`item-${itemIndex}`}>
                        <AccordionTrigger className="text-left text-sm">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-sm">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA */}
          <Card className="mt-12 gradient-hero border-0">
            <CardContent className="p-8 text-center">
              <h2 className="font-serif text-2xl font-bold text-primary-foreground mb-4">
                Besoin d'aide personnalisée ?
              </h2>
              <p className="text-primary-foreground/90 mb-6 max-w-2xl mx-auto">
                Nos délégués syndicaux sont à votre disposition pour vous accompagner
                dans toutes vos démarches et défendre vos droits.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact">
                  <Button size="lg" variant="secondary">
                    <Phone className="h-4 w-4 mr-2" />
                    Nous contacter
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

    </div>
  );
};

export default VosDroits;
