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
  Clock,
  Euro,
  Briefcase,
  Shield,
  Heart,
  GraduationCap,
  Phone,
  Bot,
} from "lucide-react";
import ChatbotJuridique from "@/components/ChatbotJuridique";

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
        answer: "Tout salarié a droit à 2,5 jours ouvrables de congés par mois de travail effectif, soit 30 jours ouvrables, soit 5 semaines pour une année complète.",
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
        answer: "La prime d'ancienneté n'est pas obligatoire légalement mais peut être prévue par la convention collective, un accord d'entreprise ou le contrat de travail.",
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
        answer: "Pour un CDI : 2 mois pour les ouvriers et employés, 3 mois pour les agents de maîtrise et techniciens, 4 mois pour les cadres. Elle peut être renouvelée si un accord le prévoit.",
      },
      {
        question: "Quelles sont les mentions obligatoires du contrat ?",
        answer: "Le contrat doit notamment mentionner l'identité des parties, le lieu de travail, le poste, la date de début, la durée du travail, la rémunération et la convention collective applicable.",
      },
      {
        question: "Comment modifier mon contrat de travail ?",
        answer: "Toute modification d'un élément essentiel du contrat nécessite l'accord du salarié. Un refus ne peut pas constituer une faute, sauf abus particulier.",
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
        answer: "Selon votre ancienneté, la loi, la convention collective ou les accords d'entreprise peuvent prévoir un maintien de salaire en complément des indemnités journalières de Sécurité sociale.",
      },
      {
        question: "Quelle est la durée du congé maternité ?",
        answer: "La durée dépend de la situation familiale : 16 semaines pour les deux premiers enfants, 26 semaines à partir du troisième, et davantage en cas de naissances multiples.",
      },
      {
        question: "Qu'est-ce qu'un accident du travail ?",
        answer: "C'est un accident survenu par le fait ou à l'occasion du travail. Il doit être déclaré rapidement à l'employeur, qui le déclare ensuite à la CPAM.",
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
        answer: "Une visite d'information et de prévention est organisée après l'embauche, puis renouvelée périodiquement selon la situation du salarié et les risques du poste.",
      },
      {
        question: "Qu'est-ce que le droit d'alerte ?",
        answer: "Le salarié peut alerter l'employeur sur une situation de danger grave et imminent. Il peut exercer son droit de retrait si le danger persiste.",
      },
      {
        question: "Comment signaler un harcèlement ?",
        answer: "Vous pouvez alerter les représentants du personnel, le médecin du travail, l'inspection du travail ou votre syndicat. Le harcèlement peut aussi relever du pénal.",
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
        answer: "Le Compte Personnel de Formation est consultable sur moncompteformation.gouv.fr. Il permet de financer des formations éligibles selon vos droits disponibles.",
      },
      {
        question: "Ai-je droit à un bilan de compétences ?",
        answer: "Oui, le bilan de compétences est accessible à tout salarié, notamment via le CPF ou dans certains dispositifs d'accompagnement professionnel.",
      },
      {
        question: "Qu'est-ce que la VAE ?",
        answer: "La Validation des Acquis de l'Expérience permet d'obtenir tout ou partie d'un diplôme grâce à son expérience professionnelle.",
      },
    ],
  },
];

export default function VosDroits() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
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

      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Card key={category.title} className="overflow-hidden">
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
                      <AccordionItem key={item.question} value={`item-${itemIndex}`}>
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

          <section className="mt-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Assistant juridique FO COM</h2>
                <p className="text-sm text-muted-foreground">
                  Les échanges passent par l'Edge Function Supabase sécurisée <span className="font-medium">chat-juridique</span>.
                </p>
              </div>
            </div>
            <ChatbotJuridique themeId="vos-droits" />
          </section>

          <Card className="mt-12 gradient-hero border-0">
            <CardContent className="p-8 text-center">
              <h2 className="font-serif text-2xl font-bold text-primary-foreground mb-4">
                Besoin d'aide personnalisée ?
              </h2>
              <p className="text-primary-foreground/90 mb-6 max-w-2xl mx-auto">
                Nos délégués syndicaux sont à votre disposition pour vous accompagner dans vos démarches et défendre vos droits.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/contact">
                    <Phone className="h-4 w-4 mr-2" />
                    Nous contacter
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
