import { useState, useRef, useEffect } from "react";
import { Bot, Send, User, RotateCcw, Sparkles, AlertCircle, ThumbsUp, ThumbsDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  initialQuestion?: string;
  ccntContext?: string;
  themeId?: string;
}

export default function ChatbotJuridique({ initialQuestion, ccntContext, themeId }: Props) {
  const themeKey = themeId ?? "general";

  const [sessionId] = useState<string>(() => {
    const stored = localStorage.getItem(`chatSession_${themeKey}`);
    if (stored) return stored;
    const newId = crypto.randomUUID();
    localStorage.setItem(`chatSession_${themeKey}`, newId);
    return newId;
  });

  const [messages, setMessages]         = useState<Message[]>([]);
  const [input, setInput]               = useState("");
  const [loading, setLoading]           = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [feedback, setFeedback]         = useState<Record<number, "up" | "down">>({});
  const bottomRef  = useRef<HTMLDivElement>(null);
  const sentInitial = useRef(false);

  // ── Load history + feedback on mount ──────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: session } = await supabase
        .from("chat_sessions")
        .select("messages")
        .eq("id", sessionId)
        .maybeSingle();

      if (cancelled) return;

      if (session?.messages && Array.isArray(session.messages) && session.messages.length > 0) {
        setMessages(session.messages as Message[]);

        const { data: fb } = await supabase
          .from("chat_feedback")
          .select("message_index, rating")
          .eq("session_id", sessionId);

        if (!cancelled && fb) {
          const map: Record<number, "up" | "down"> = {};
          fb.forEach((f) => { map[f.message_index] = f.rating as "up" | "down"; });
          setFeedback(map);
        }
      }

      if (!cancelled) setHistoryLoading(false);
    })();
    return () => { cancelled = true; };
  }, [sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!historyLoading && initialQuestion?.trim() && !sentInitial.current) {
      sentInitial.current = true;
      sendMessage(initialQuestion);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion, historyLoading]);

  // ── Persist session ────────────────────────────────────────────────────────
  const saveSession = async (msgs: Message[]) => {
    await supabase.from("chat_sessions").upsert(
      { id: sessionId, theme_id: themeId ?? null, messages: msgs, updated_at: new Date().toISOString() },
      { onConflict: "id" },
    );
  };

  // ── Send message ───────────────────────────────────────────────────────────
  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const next: Message[] = [...messages, { role: "user", content }];
    setMessages(next);
    if (!text) setInput("");
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("chat-juridique", {
        body: {
          messages: next.map((m) => ({ role: m.role, content: m.content })),
          ccntContext: ccntContext ?? null,
        },
      });

      if (fnError) throw new Error(fnError.message);

      const reply = data?.reply ?? "Je n'ai pas pu générer de réponse. Veuillez réessayer.";
      const final: Message[] = [...next, { role: "assistant", content: reply }];
      setMessages(final);
      await saveSession(final);
    } catch {
      setError("Une erreur s'est produite. Vérifiez votre connexion ou contactez un délégué FOCOM.");
      setMessages([...next, {
        role: "assistant",
        content: "Une erreur s'est produite. Veuillez réessayer ou contacter directement un délégué FOCOM.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  // ── Feedback ───────────────────────────────────────────────────────────────
  const handleFeedback = async (msgIndex: number, rating: "up" | "down") => {
    const current = feedback[msgIndex];
    const next = current === rating ? null : rating;

    setFeedback((prev) => {
      const updated = { ...prev };
      if (next === null) delete updated[msgIndex];
      else updated[msgIndex] = next;
      return updated;
    });

    if (next === null) {
      await supabase.from("chat_feedback")
        .delete()
        .eq("session_id", sessionId)
        .eq("message_index", msgIndex);
    } else {
      await supabase.from("chat_feedback").upsert(
        { session_id: sessionId, message_index: msgIndex, rating: next },
        { onConflict: "session_id,message_index" },
      );
    }
  };

  // ── Reset ──────────────────────────────────────────────────────────────────
  const handleReset = () => {
    const newId = crypto.randomUUID();
    localStorage.setItem(`chatSession_${themeKey}`, newId);
    // Force remount by navigating — parent uses key prop, so just clear local state
    setMessages([]);
    setFeedback({});
    setError(null);
    sentInitial.current = false;
    // Store the new session id for the next interaction
    (window as unknown as Record<string, unknown>)[`__chatSessionId_${themeKey}`] = newId;
    // Reload is not ideal; instead patch sessionId via ref trick
    // Since sessionId is derived from localStorage at init, next sendMessage will use old id.
    // Simplest correct fix: reload the component via parent key change.
    // Here we patch localStorage and the closure by using a ref.
    sessionIdRef.current = newId;
  };

  // Keep a mutable ref so handleReset can update it without needing to remount
  const sessionIdRef = useRef(sessionId);

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

      {/* Erreur */}
      {error && (
        <div className="mx-4 mt-3 flex items-start gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Zone de messages */}
      <div className="h-80 overflow-y-auto p-4 space-y-4 bg-muted/10">

        {historyLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">Comment puis-je vous aider ?</p>
              <p className="text-xs text-muted-foreground mt-1">Posez une question ou choisissez une suggestion</p>
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
        ) : (
          messages.map((msg, i) => (
            <div key={i}>
              <div className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                )}
                <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-background border border-border text-foreground rounded-bl-sm shadow-sm"
                }`}>
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Feedback thumbs under assistant messages */}
              {msg.role === "assistant" && (
                <div className="flex gap-1 ml-9 mt-1.5">
                  <button
                    onClick={() => handleFeedback(i, "up")}
                    title="Réponse utile"
                    className={`w-6 h-6 flex items-center justify-center rounded-md transition-colors ${
                      feedback[i] === "up"
                        ? "text-green-600 bg-green-50 border border-green-200"
                        : "text-muted-foreground/40 hover:text-green-600 hover:bg-green-50"
                    }`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleFeedback(i, "down")}
                    title="Réponse inexacte"
                    className={`w-6 h-6 flex items-center justify-center rounded-md transition-colors ${
                      feedback[i] === "down"
                        ? "text-red-500 bg-red-50 border border-red-200"
                        : "text-muted-foreground/40 hover:text-red-500 hover:bg-red-50"
                    }`}
                  >
                    <ThumbsDown className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}

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
            onClick={handleReset}
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

      <div className="px-4 py-2 border-t border-border bg-muted/20">
        <p className="text-[10px] text-muted-foreground text-center">
          Cet assistant fournit des informations générales. Pour une consultation juridique, contactez un délégué FOCOM.
        </p>
      </div>
    </div>
  );
}
