import { useState } from "react";
import { Bot, Scale, BookOpen, Clock, Umbrella, Briefcase, Heart, ChevronRight, Sparkles } from "lucide-react";
import ChatbotJuridique from "@/components/ChatbotJuridique";
import { buildCcntContext } from "@/lib/ccntContext";

interface Theme {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
  questions: string[];
}

const themes: Theme[] = [
  {
    id: "licenciement",
    label: "Licenciement",
    icon: Briefcase,
    description: "Droits, indemnités, procédure",
    questions: [
      "Quelles sont les étapes d'un licenciement pour motif personnel ?",
      "Comment calculer mon indemnité de licenciement CCNT ?",
      "Puis-je contester mon licenciement ?",
    ],
  },
  {
    id: "temps-travail",
    label: "Temps de travail",
    icon: Clock,
    description: "Heures sup., RTT, forfaits jours",
    questions: [
      "Comment sont calculées mes heures supplémentaires ?",
      "Mon employeur peut-il refuser mes RTT ?",
      "Qu'est-ce que le forfait jours CCNT ?",
    ],
  },
  {
    id: "conges-absences",
    label: "Congés & absences",
    icon: Umbrella,
    description: "CP, mariage, deuil, maladie",
    questions: [
      "Combien de jours de congé pour mon mariage ?",
      "Mes congés sont-ils maintenus en cas d'arrêt maladie ?",
      "Qu'est-ce que le CET CCNT ?",
    ],
  },
  {
    id: "maladie-prevoyance",
    label: "Maladie & prévoyance",
    icon: Heart,
    description: "Maintien de salaire, arrêts",
    questions: [
      "Quel est le maintien de salaire prévu par la CCNT ?",
      "Y a-t-il un délai de carence à Iliad ?",
      "Comment déclarer un accident du travail ?",
    ],
  },
  {
    id: "harcelement",
    label: "Harcèlement",
    icon: Scale,
    description: "Moral, sexuel, protection",
    questions: [
      "Que faire face à du harcèlement moral ?",
      "Suis-je protégé si je dénonce un harcèlement ?",
      "L'employeur doit-il agir immédiatement ?",
    ],
  },
  {
    id: "greve",
    label: "Grève & représentation",
    icon: BookOpen,
    description: "Droit de grève, salariés protégés",
    questions: [
      "Mon employeur peut-il me sanctionner si je fais grève ?",
      "Quelle retenue sur salaire est autorisée lors d'une grève ?",
      "Quels salariés bénéficient d'une protection spéciale ?",
    ],
  },
];

export default function AssistantJuridique() {
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [initialQuestion, setInitialQuestion] = useState<string | undefined>();

  const handleThemeSelect = (theme: Theme) => {
    setSelectedTheme(theme);
    setInitialQuestion(undefined);
  };

  const handleQuestionClick = (question: string, theme: Theme) => {
    setSelectedTheme(theme);
    setInitialQuestion(question);
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Bot className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assistant Juridique</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Posez vos questions sur le droit du travail, la CCNT et les accords UES Iliad
          </p>
        </div>
      </div>

      {/* Avertissement légal */}
      <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
        <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>
          Cet assistant IA fournit des <strong>informations générales</strong> sur le droit du travail.
          Pour une situation personnelle complexe, contactez un délégué FOCOM ou un conseiller juridique.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Panneau gauche : thèmes */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Choisir un thème
          </h2>
          <div className="space-y-2">
            {themes.map((theme) => {
              const Icon = theme.icon;
              const isActive = selectedTheme?.id === theme.id;
              return (
                <div key={theme.id} className="space-y-1">
                  <button
                    onClick={() => handleThemeSelect(theme)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-card border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{theme.label}</p>
                      <p className={`text-xs truncate ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {theme.description}
                      </p>
                    </div>
                    <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform ${isActive ? "rotate-90" : ""}`} />
                  </button>

                  {/* Questions suggérées pour le thème actif */}
                  {isActive && (
                    <div className="ml-4 space-y-1">
                      {theme.questions.map((q) => (
                        <button
                          key={q}
                          onClick={() => handleQuestionClick(q, theme)}
                          className="w-full text-left text-xs px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted border border-border hover:border-primary/30 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Lien vers VosDroits */}
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Consultez aussi notre page{" "}
              <a href="/vos-droits" className="text-primary hover:underline font-medium">
                Vos Droits
              </a>{" "}
              pour des fiches thématiques détaillées.
            </p>
          </div>
        </div>

        {/* Panneau droit : chatbot */}
        <div className="lg:col-span-3">
          <ChatbotJuridique
            key={`${selectedTheme?.id}-${initialQuestion}`}
            initialQuestion={initialQuestion}
            ccntContext={selectedTheme ? buildCcntContext(selectedTheme.id) : undefined}
          />
        </div>
      </div>
    </div>
  );
}
