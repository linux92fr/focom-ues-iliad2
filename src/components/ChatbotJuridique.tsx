import { useState, useRef, useEffect } from "react";
import { Bot, Send, User, RotateCcw, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  initialQuestion?: string;
  ccntContext?: string;
}

export default function ChatbotJuridique({ initialQuestion, ccntContext }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sentInitial = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Envoie automatiquement la question suggérée si elle change
  useEffect(() => {
    if (initialQuestion && initialQuestion.trim() && !sentInitial.current) {
      sentInitial.current = true;
      sendMessage(initialQuestion);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion]);

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(newMessages);
    if (!text) setInput("");
    setLoading(true);

    const systemPrompt = [
      "Tu es un assistant juridique expert en droit du travail français, au service des salariés du groupe Iliad (Free, Free Mobile, Free Réseau, Alice, etc.) affiliés au syndicat FO COM UES ILIAD (FOCOM).",
      "",
      "Tes connaissances couvrent :",
      "- Le Code du travail français",
      "- La Convention Collective Nationale des Télécommunications (CCNT, IDCC 2148)",
      "- Les accords d'entreprise UES Iliad (astreintes, temps de travail, nuit, télétravail, etc.)",
      "- La jurisprudence sociale récente",
      "",
      ccntContext ? `Contexte spécifique à cette thématique :\n${ccntContext}` : "",
      "",
      "Règles impératives :",
      "- Réponds toujours en français",
      "- Sois précis, concis et bienveillant",
      "- Cite les articles du Code du travail ou de la CCNT lorsque c'est pertinent",
      "- Mentionne si l'accord Iliad est plus favorable que la CCNT ou la loi",
      "- Ne fournis jamais de consultation juridique officielle — oriente vers un délégué FOCOM pour les cas complexes",
      "- Si tu n'as pas l'information, dis-le clairement",
    ].filter(Boolean).join("\n");

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();
      const reply = data.content?.[0]?.text ?? "Je n'ai pas pu générer de réponse. Veuillez réessayer.";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content:
            "Une erreur s'est produite. Veuillez réessayer ou contacter directement un délégué FOCOM.",
        },
      ]);
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
    "Comment fonctionne le maintien de salaire CCNT ?",
    "Que faire face à un harcèlement au travail ?",
    "Comment utiliser mon CPF ?",
  ];

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">

      {/* En-tête */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/30">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Bot className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            Assistant Juridique FOCOM
            <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
              <Sparkles className="w-2.5 h-2.5" /> IA
            </span>
          </p>
          <p className="text-xs text-muted-foreground">CCNT Télécoms (IDCC 2148) · Accords UES Iliad</p>
        </div>
      </div>

      {/* Zone de messages */}
      <div className="h-80 overflow-y-auto p-4 space-y-4 bg-muted/10">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">Comment puis-je vous aider ?</p>
              <p className="text-xs text-muted-foreground mt-1">
                Posez une question ou choisissez une suggestion
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 max-w-md">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-xs px-3 py-1.5 bg-background border border-border rounded-full text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
            )}
            <div
              className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-background border border-border text-foreground rounded-bl-sm shadow-sm"
              }`}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5 justify-start">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <div className="bg-background border border-border rounded-2xl rounded-bl-sm px-3.5 py-2.5 shadow-sm">
              <div className="flex gap-1 items-center h-4">
                <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Zone de saisie */}
      <div className="p-3 border-t border-border bg-background flex gap-2 items-end">
        {messages.length > 0 && (
          <button
            onClick={() => { setMessages([]); sentInitial.current = false; }}
            title="Nouvelle conversation"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0"
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
          className="flex-1 resize-none text-sm text-foreground placeholder-muted-foreground outline-none bg-muted/30 border border-border rounded-xl px-3 py-2 max-h-28"
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-primary-foreground transition-colors flex-shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}