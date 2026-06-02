import { useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HelpCircle, Search, ChevronDown, ChevronUp, MessageSquare, Phone, Mail, UserPlus, Shield, FileText, Trophy, FolderOpen } from "lucide-react";

const faqData = [
  {
    category: "Adhésion",
    icon: UserPlus,
    questions: [
      {
        question: "Comment adhérer à FO COM UES ILIAD ?",
        answer: "Depuis la page Adhésion, remplissez le formulaire. Le site génère un bulletin officiel PDF pré-rempli que vous pouvez télécharger, signer puis transmettre à FO COM via Mes demandes ou par email.",
      },
      {
        question: "Le bulletin PDF est-il le document officiel ?",
        answer: "Oui. Le formulaire sert à remplir automatiquement le bulletin officiel avec les champs correspondants. Vous gardez la main pour le télécharger et l’envoyer.",
      },
      {
        question: "Puis-je transmettre mon bulletin via le site ?",
        answer: "Oui. Après téléchargement, vous pouvez utiliser Mes demandes pour transmettre le bulletin ou contacter directement un représentant FO COM.",
      },
    ],
  },
  {
    category: "Droits salariés",
    icon: Shield,
    questions: [
      {
        question: "À quoi sert la page Vos droits ?",
        answer: "Elle regroupe des repères pratiques sur le temps de travail, les congés, la santé au travail, la rémunération, les contrats et les droits collectifs. En cas de doute, contactez FO COM.",
      },
      {
        question: "L’assistant juridique remplace-t-il un conseil personnalisé ?",
        answer: "Non. Il donne une première orientation. Une situation juridique dépend des faits, des documents et du contexte. FO COM peut vous aider à analyser votre dossier.",
      },
      {
        question: "Que faire en cas de difficulté au travail ?",
        answer: "Conservez les éléments factuels, notez les dates, gardez les messages utiles et contactez rapidement un représentant FO COM ou utilisez Mes demandes.",
      },
    ],
  },
  {
    category: "CSE et élections",
    icon: Trophy,
    questions: [
      {
        question: "Les élections CSE 2026 sont-elles terminées ?",
        answer: "Oui. La page Élections est désormais une page d’archive et de bilan : résultats définitifs, participation et élus FO COM.",
      },
      {
        question: "Où trouver les élus FO COM ?",
        answer: "Les élus sont visibles sur la page Élections et les représentants FO COM sont présentés sur la page Le syndicat.",
      },
      {
        question: "À quoi sert le CSE ?",
        answer: "Le CSE est consulté sur les sujets économiques, sociaux, organisationnels et conditions de travail. Les élus portent également les réclamations individuelles et collectives.",
      },
    ],
  },
  {
    category: "Mes demandes",
    icon: MessageSquare,
    questions: [
      {
        question: "À quoi sert Mes demandes ?",
        answer: "Cet espace permet de transmettre une question, un document, un bulletin d’adhésion ou un dossier à FO COM, puis de suivre les échanges.",
      },
      {
        question: "Puis-je joindre un document ?",
        answer: "Oui, selon les fonctionnalités disponibles, vous pouvez transmettre les éléments nécessaires à l’analyse de votre dossier.",
      },
      {
        question: "Mes échanges sont-ils confidentiels ?",
        answer: "Les demandes sont destinées aux personnes habilitées à les traiter. Évitez toutefois d’envoyer des informations inutiles ou excessives.",
      },
    ],
  },
  {
    category: "Documents utiles",
    icon: FolderOpen,
    questions: [
      {
        question: "Où trouver les accords et documents ?",
        answer: "La page Documents utiles centralise les accords, modèles, ressources pratiques et documents syndicaux disponibles.",
      },
      {
        question: "Je ne trouve pas un document, que faire ?",
        answer: "Contactez FO COM via la page Contact ou Mes demandes. Un représentant pourra vous orienter vers le bon document.",
      },
      {
        question: "Les documents sont-ils régulièrement mis à jour ?",
        answer: "Ils sont mis à jour progressivement. Les contenus liés aux négociations, élections et droits sont priorisés.",
      },
    ],
  },
  {
    category: "Contact FO COM",
    icon: Mail,
    questions: [
      {
        question: "Comment contacter FO COM ?",
        answer: "Vous pouvez utiliser la page Contact, envoyer un message via Mes demandes ou joindre directement un représentant FO COM depuis la page Le syndicat.",
      },
      {
        question: "Quel numéro appeler ?",
        answer: "Un numéro de contact sera bientôt disponible. En attendant, utilisez le formulaire de contact ou les coordonnées directes des représentants affichées sur la page du syndicat.",
      },
      {
        question: "Puis-je contacter FO COM sans être adhérent ?",
        answer: "Oui. FO COM peut vous orienter et vous informer. L’adhésion permet ensuite de renforcer l’action collective et l’accompagnement syndical.",
      },
    ],
  },
];

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openQuestions, setOpenQuestions] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState("Toutes");

  const categories = ["Toutes", ...faqData.map((d) => d.category)];

  const toggleQuestion = (key: string) => {
    setOpenQuestions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredData = faqData
    .filter((section) => activeCategory === "Toutes" || section.category === activeCategory)
    .map((section) => ({
      ...section,
      questions: section.questions.filter(
        (q) =>
          searchQuery === "" ||
          q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((section) => section.questions.length > 0);

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 p-3 sm:p-4 lg:p-8">
      <section className="relative overflow-hidden rounded-3xl bg-[#13233A] p-6 text-white shadow-xl sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border-[52px] border-white/5" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-red-600/25 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <Badge className="mb-4 border border-white/15 bg-white/10 text-white hover:bg-white/10">
              <HelpCircle className="mr-1 h-3.5 w-3.5" /> FAQ
            </Badge>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              Questions fréquentes
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/80 sm:text-lg">
              Retrouvez rapidement les réponses utiles sur l’adhésion, vos droits, le CSE, les demandes, les documents et les contacts FO COM.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="bg-red-600 text-white hover:bg-red-700">
                <Link to="/contact"><Mail className="mr-2 h-4 w-4" /> Contacter FO COM</Link>
              </Button>
              <Button asChild variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                <Link to="/mes-reclamations"><MessageSquare className="mr-2 h-4 w-4" /> Faire une demande</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              { icon: UserPlus, title: "Adhésion", text: "Bulletin PDF, transmission, parcours." },
              { icon: Shield, title: "Droits", text: "Repères et accompagnement FO COM." },
              { icon: FileText, title: "Documents", text: "Accords, ressources et modèles." },
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

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher une question..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-red-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6 space-y-5">
        {filteredData.map((section, idx) => {
          const Icon = section.icon;
          return (
            <Card key={section.category} className="border-slate-200 bg-white shadow-sm">
              <CardContent className="p-5 sm:p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900">{section.category}</h2>
                </div>
                <div className="space-y-3">
                  {section.questions.map((q, i) => {
                    const key = `${idx}-${i}`;
                    const isOpen = openQuestions[key];
                    return (
                      <div key={q.question} className="overflow-hidden rounded-xl border border-slate-100">
                        <button
                          onClick={() => toggleQuestion(key)}
                          className="flex w-full items-center justify-between gap-4 p-4 text-left transition-colors hover:bg-slate-50"
                        >
                          <span className="text-sm font-semibold text-slate-900">{q.question}</span>
                          {isOpen ? <ChevronUp className="h-5 w-5 shrink-0 text-slate-400" /> : <ChevronDown className="h-5 w-5 shrink-0 text-slate-400" />}
                        </button>
                        {isOpen && <div className="px-4 pb-4 text-sm leading-relaxed text-slate-600">{q.answer}</div>}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {filteredData.length === 0 && (
        <div className="py-12 text-center">
          <HelpCircle className="mx-auto mb-3 h-12 w-12 text-slate-300" />
          <p className="text-slate-500">Aucune question trouvée</p>
        </div>
      )}

      <section className="mt-8 rounded-3xl bg-gradient-to-br from-teal-600 to-teal-700 p-6 text-white shadow-lg sm:p-8">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="text-xl font-extrabold">Vous ne trouvez pas votre réponse ?</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-teal-50">
              Contactez vos représentants FO COM ou transmettez une demande depuis votre espace. Nous sommes là pour vous aider.
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
