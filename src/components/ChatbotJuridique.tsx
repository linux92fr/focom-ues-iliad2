import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { findLegalAnswer } from '@/lib/legalMatcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Scale, Send, Bot, User, BookOpen, Gavel, Lightbulb, AlertCircle } from 'lucide-react';

// ---- Types ----

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  articles?: { numero: string; titre: string; contenu: string; exemple?: string }[];
  jurisprudences?: { reference: string; resume: string; portee: string }[];
  conseils?: string[];
  theme?: string;
  confidence?: 'high' | 'medium' | 'low';
  timestamp: Date;
}

interface ChatbotProps {
  initialQuestion?: string;
  ccntContext?: string;
}

const SUGGESTED_QUESTIONS = [
  "Peut-on me licencier pendant une grève ?",
  "Combien d'heures supplémentaires ai-je droit ?",
  "Que faire en cas de harcèlement moral ?",
  "Quels sont mes droits en tant que délégué syndical ?",
  "Comment contester un licenciement ?",
  "C'est quoi le droit de retrait ?",
];

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: `Bonjour ! Je suis votre assistant juridique spécialisé en **droit du travail**.

Je peux répondre à vos questions sur le Code du travail français : grève, licenciement, harcèlement, temps de travail, contrats, formation professionnelle et bien plus.

Posez votre question ou choisissez un sujet ci-dessous.

⚠️ *Cet assistant fournit des informations générales. Pour votre situation personnelle, consultez un représentant syndical ou un avocat spécialisé.*`,
  timestamp: new Date(),
};

// ---- Sous-composants ----

function ConfidenceBadge({ confidence }: { confidence?: 'high' | 'medium' | 'low' }) {
  if (!confidence || confidence === 'high') return null;
  if (confidence === 'medium') {
    return (
      <Badge variant="secondary" className="text-xs gap-1">
        <AlertCircle className="w-3 h-3" />
        Réponse partielle — reformulez si besoin
      </Badge>
    );
  }
  return (
    <Badge variant="destructive" className="text-xs gap-1 bg-orange-100 text-orange-700 border-orange-200">
      <AlertCircle className="w-3 h-3" />
      Question hors domaine
    </Badge>
  );
}

function MarkdownText({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (!line) return <br key={i} />;
        const rendered = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        if (line.startsWith('- ')) {
          return (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-primary mt-1 shrink-0">•</span>
              <span dangerouslySetInnerHTML={{ __html: rendered.slice(2) }} />
            </div>
          );
        }
        return <p key={i} dangerouslySetInnerHTML={{ __html: rendered }} />;
      })}
    </div>
  );
}

function AssistantMessage({ message }: { message: Message }) {
  const hasExtras =
    (message.articles && message.articles.length > 0) ||
    (message.jurisprudences && message.jurisprudences.length > 0) ||
    (message.conseils && message.conseils.length > 0);

  return (
    <div className="flex gap-3 items-start">
      <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
        <Scale className="w-4 h-4 text-primary" />
      </div>

      <div className="flex-1 space-y-3 max-w-[90%]">
        {message.theme && message.theme !== 'Informations générales' && message.theme !== 'Hors sujet' && (
          <Badge variant="outline" className="text-xs text-primary border-primary/30">
            {message.theme}
          </Badge>
        )}

        <Card className="border-l-4 border-l-primary/40 shadow-sm">
          <CardContent className="p-4 text-sm text-foreground leading-relaxed">
            <MarkdownText text={message.content} />
            <ConfidenceBadge confidence={message.confidence} />
          </CardContent>
        </Card>

        {hasExtras && (
          <Accordion type="multiple" className="space-y-1">
            {message.articles && message.articles.length > 0 && (
              <AccordionItem value="articles" className="border rounded-lg px-3 bg-card shadow-sm">
                <AccordionTrigger className="text-xs font-semibold text-primary py-2 hover:no-underline">
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5" />
                    Articles du Code du travail ({message.articles.length})
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-3 space-y-3">
                  {message.articles.map((art) => (
                    <div key={art.numero} className="border-l-2 border-primary/30 pl-3 space-y-1">
                      <p className="text-xs font-bold text-primary">Art. {art.numero} – {art.titre}</p>
                      <p className="text-xs text-muted-foreground">{art.contenu}</p>
                      {art.exemple && (
                        <p className="text-xs text-foreground/70 italic bg-muted/40 rounded px-2 py-1">
                          💡 {art.exemple}
                        </p>
                      )}
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            )}

            {message.jurisprudences && message.jurisprudences.length > 0 && (
              <AccordionItem value="jurisprudences" className="border rounded-lg px-3 bg-card shadow-sm">
                <AccordionTrigger className="text-xs font-semibold text-amber-700 dark:text-amber-400 py-2 hover:no-underline">
                  <span className="flex items-center gap-2">
                    <Gavel className="w-3.5 h-3.5" />
                    Jurisprudences ({message.jurisprudences.length})
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-3 space-y-3">
                  {message.jurisprudences.map((jp) => (
                    <div key={jp.reference} className="border-l-2 border-amber-400/50 pl-3 space-y-1">
                      <p className="text-xs font-bold text-amber-700 dark:text-amber-400">{jp.reference}</p>
                      <p className="text-xs text-muted-foreground">{jp.resume}</p>
                      <p className="text-xs font-medium text-foreground/80">→ {jp.portee}</p>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            )}

            {message.conseils && message.conseils.length > 0 && (
              <AccordionItem value="conseils" className="border rounded-lg px-3 bg-card shadow-sm">
                <AccordionTrigger className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 py-2 hover:no-underline">
                  <span className="flex items-center gap-2">
                    <Lightbulb className="w-3.5 h-3.5" />
                    Conseils pratiques ({message.conseils.length})
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-3">
                  <ul className="space-y-1.5">
                    {message.conseils.map((conseil, i) => (
                      <li key={i} className="flex gap-2 items-start text-xs text-foreground/80">
                        <span className="text-emerald-600 mt-0.5 shrink-0">✓</span>
                        {conseil}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        )}
      </div>
    </div>
  );
}

function UserMessage({ message }: { message: Message }) {
  return (
    <div className="flex gap-3 items-start justify-end">
      <div className="max-w-[80%] bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-3 text-sm shadow-sm">
        {message.content}
      </div>
      <div className="shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center border">
        <User className="w-4 h-4 text-muted-foreground" />
      </div>
    </div>
  );
}

// ---- Composant principal ----

export default function ChatbotJuridique({ initialQuestion, ccntContext }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll automatique
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Écoute de la prop "initialQuestion" venant du composant parent VosDroits.tsx
  useEffect(() => {
    if (initialQuestion) {
      sendMessage(initialQuestion);
    }
  }, [initialQuestion]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // TODO: C'est ici que tu lieras ton API (Supabase / OpenAI) plus tard !
    // Pour le moment on utilise ton mock local findLegalAnswer.
    // L'API devra recevoir : "System Prompt: Tu es un assistant... \n\n" + ccntContext + "\n\nUser Question: " + trimmed
    
    setTimeout(() => {
      const result = findLegalAnswer(trimmed);
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: result.answer,
        articles: result.articles,
        jurisprudences: result.jurisprudences,
        conseils: result.conseils,
        theme: result.theme,
        confidence: result.confidence,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleReset = () => {
    setMessages([WELCOME_MESSAGE]);
    setInput('');
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-[600px] border rounded-xl overflow-hidden bg-background shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Assistant Droit du Travail</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Basé sur le Code du travail français
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs text-muted-foreground">
          Réinitialiser
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) =>
          msg.role === 'assistant' ? (
            <AssistantMessage key={msg.id} message={msg} />
          ) : (
            <UserMessage key={msg.id} message={msg} />
          )
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-3 items-center">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <Scale className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-card border rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-4">
                <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggested questions (shown only at start) */}
      {messages.length === 1 && (
        <div className="px-4 py-2 border-t bg-muted/30">
          <p className="text-xs text-muted-foreground mb-2">Questions fréquentes :</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="text-xs px-3 py-1.5 rounded-full border bg-background hover:bg-primary/5 hover:border-primary/40 transition-colors text-foreground/80"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t bg-card flex gap-2">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Posez votre question sur le droit du travail..."
          className="flex-1 text-sm"
          disabled={isTyping}
          maxLength={500}
        />
        <Button
          onClick={() => sendMessage(input)}
          disabled={isTyping || !input.trim()}
          size="icon"
          className="shrink-0"
          aria-label="Envoyer"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
