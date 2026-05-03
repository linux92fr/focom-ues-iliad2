import { useState, useRef, useEffect } from "react";
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
  Bot,
  Send,
  User,
  Sparkles,
  RotateCcw,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
interface Message {
  role: "user" | "assistant";
  content: string;
}

// ── Composant Assistant IA ─────────────────────────────────────────────────
function AssistantJuridique() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `Tu es un assistant juridique spécialisé en droit du travail français, au service des salariés du groupe Iliad (Free, Alice, etc.) affiliés au syndicat FO COM UES ILIAD (FOCOM).
          
Ton rôle :
- Répondre aux questions sur le droit du travail français (Code du travail, conventions collectives, accords d'entreprise)
- Expliquer les droits des salariés de façon claire et accessible
- Orienter vers les délégués FOCOM si la situation est complexe
- Mentionner quand un conseil juridique professionnel est nécessaire

Règles :
- Réponds toujours en français
- Sois précis, concis et bienveillant
- Cite les articles de loi pertinents quand c'est utile
- Ne donne jamais de conseil constituant une consultation juridique officielle
- Si tu ne sais pas, dis-le clairement et invite à contacter un délégué FOCOM`,
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();
      const reply = data.content?.[0]?.text ?? "Je n'ai pas pu générer de réponse.";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...newMessages, {
        role: "assistant",
        content: "Une erreur s'est produite. Veuillez réessayer ou contacter directement un délégué FOCOM.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestions = [
    "Quels sont mes droits en cas de licenciement ?",
    "Comment fonctionne le télétravail chez Iliad ?",
    "Que faire en cas de harcèlement au travail ?",
    "Comment utiliser mon CPF ?",
  ];

  return (
    <div className="mt-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            Assistant Juridique IA
            <span className="inline-flex items-center gap-1 text-xs font-medium bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" /> Propulsé par Claude
            </span>
          </h2>
          <p className="text-sm text-slate-500">Posez vos questions sur le droit du travail — réponse immédiate</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Zone de messages */}
        <div className="h-96 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
                <Scale className="w-7 h-7 text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-700">Comment puis-je vous aider ?</p>
                <p className="text-sm text-slate-400 mt-1">Posez une question ou choisissez une suggestion ci-dessous</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setInput(s); }}
                    className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-full text-slate-600 hover:border-red-300 hover:text-red-600 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-red-600 text-white rounded-br-sm"
                  : "bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm"
              }`}>
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-slate-600" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center h-5">
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Zone de saisie */}
        <div className="p-3 border-t border-slate-200 bg-white flex gap-2 items-end">
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              title="Nouvelle conversation"
              className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Posez votre question juridique… (Entrée pour envoyer)"
            rows={1}
            className="flex-1 resize-none text-sm text-slate-900 placeholder-slate-400 outline-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 max-h-32"
            style={{ fieldSizing: "content" } as React.CSSProperties}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Disclaimer */}
        <p className="text-[10px] text-slate-400 text-center px-4 py-2 bg-slate-50 border-t border-slate-100">
          Cet assistant fournit des informations générales et ne constitue pas un conseil juridique officiel.
          Pour toute situation complexe, contactez un délégué FOCOM.
        </p>
      </div>
    </div>
  );
}

// ── Page principale ────────────────────────────────────────────────────────
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

          {/* Assistant IA Juridique */}
          <AssistantJuridique />

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