import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
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
  Mail,
  FileText,
  Users,
  ChevronRight,
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

const quickAccess = [
  {
    icon: Bot,
    title: "Assistant juridique",
    description: "Posez une question et obtenez une première orientation.",
    href: "#assistant-juridique",
  },
  {
    icon: FileText,
    title: "Documents utiles",
    description: "Accords, modèles, ressources et documents pratiques.",
    href: "/documents-utiles",
  },
  {
    icon: Users,
    title: "Contacter FO COM",
    description: "Un représentant peut vous aider à analyser votre situation.",
    href: "/contact",
  },
];

export default function VosDroits() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 p-3 sm:p-4 lg:p-8">
      <section className="relative overflow-hidden rounded-3xl bg-[#13233A] p-6 text-white shadow-xl sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border-[52px] border-white/5" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-red-600/25 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <Badge className="mb-4 border border-white/15 bg-white/10 text-white hover:bg-white/10">
              <Scale className="mr-1 h-3.5 w-3.5" /> Vos droits
            </Badge>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              Comprendre, vérifier et défendre vos droits
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/80 sm:text-lg">
              Retrouvez des repères pratiques sur le travail, la rémunération, le contrat, la protection sociale, la santé au travail et la formation. En cas de doute, FO COM peut vous accompagner.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="bg-red-600 text-white hover:bg-red-700">
                <a href="#assistant-juridique"><Bot className="mr-2 h-4 w-4" /> Poser une question</a>
              </Button>
              <Button asChild variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                <Link to="/contact"><Mail className="mr-2 h-4 w-4" /> Contacter FO COM</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              { icon: Scale, title: "Repères", text: "Identifier rapidement les sujets à vérifier." },
              { icon: Shield, title: "Protection", text: "Ne pas rester seul face à une difficulté." },
              { icon: Bot, title: "Assistant", text: "Une première orientation disponible en ligne." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <item.icon className="mb-3 h-5 w-5 text-red-200" />
                <p className="font-bold">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/70">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {quickAccess.map((item) => (
          <Card key={item.title} className="border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <CardContent className="p-5">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                <item.icon className="h-5 w-5" />
              </div>
              <h2 className="font-extrabold text-slate-900">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.description}</p>
              {item.href.startsWith("#") ? (
                <Button asChild variant="ghost" className="mt-3 px-0 text-red-600 hover:bg-transparent hover:text-red-700">
                  <a href={item.href}>Accéder <ChevronRight className="ml-1 h-4 w-4" /></a>
                </Button>
              ) : (
                <Button asChild variant="ghost" className="mt-3 px-0 text-red-600 hover:bg-transparent hover:text-red-700">
                  <Link to={item.href}>Accéder <ChevronRight className="ml-1 h-4 w-4" /></Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.title} className="overflow-hidden border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-white pb-4">
              <div className="flex gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <category.icon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-extrabold text-slate-900">{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <Accordion type="single" collapsible className="w-full">
                {category.items.map((item, itemIndex) => (
                  <AccordionItem key={item.question} value={`item-${category.title}-${itemIndex}`}>
                    <AccordionTrigger className="text-left text-sm font-semibold text-slate-900">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-relaxed text-slate-500">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </section>

      <section id="assistant-juridique" className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Assistant juridique FO COM</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">
              Les échanges passent par l'Edge Function Supabase sécurisée <span className="font-medium">chat-juridique</span>. L’outil donne une première orientation et ne remplace pas un accompagnement personnalisé.
            </p>
          </div>
        </div>
        <ChatbotJuridique themeId="vos-droits" />
      </section>

      <section className="mt-8 rounded-3xl bg-gradient-to-br from-teal-600 to-teal-700 p-6 text-white shadow-lg sm:p-8">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="text-xl font-extrabold">Besoin d’aide personnalisée ?</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-teal-50">
              Une réponse dépend toujours des faits, du contrat, des accords applicables et des preuves disponibles. FO COM peut vous accompagner.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="bg-white text-teal-700 hover:bg-teal-50">
              <Link to="/contact"><Mail className="mr-2 h-4 w-4" /> Contact</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20">
              <Link to="/le-syndicat"><Phone className="mr-2 h-4 w-4" /> Nos représentants</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
