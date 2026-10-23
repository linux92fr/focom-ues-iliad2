import { useMemo, useState, FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bot, Loader2, Send, Plus, Copy, Check, Sparkles } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };
const DEFAULT_MODEL = "gpt-4.1-mini";
const MODEL_GROUPS = [
  { label: "OpenAI", models: ["gpt-4.1-mini", "gpt-4.1", "gpt-4o-mini", "gpt-4o", "gpt-5-mini", "gpt-5.4", "gpt-5.5", "gpt-6-sol", "gpt-6-luna"] },
  { label: "DeepSeek", models: ["deepseek-flash", "deepseek-v4-pro"] },
  { label: "Qwen", models: ["qwen-flash", "qwen-plus", "qwen-max", "qwen3.6-flash", "qwen3.6-plus", "qwen3.7-flash", "qwen3.7-plus"] },
  { label: "Mistral", models: ["mistral-small-latest", "mistral-small-2603", "mistral-medium-3-5", "mistral-large-latest", "mistral-large-2512"] },
  { label: "GLM", models: ["glm-5", "glm-5.1", "glm-5.2", "glm-5.3"] },
  { label: "Autres", models: ["moonshotai/kimi-k2.6", "moonshotai/kimi-k2.7-code", "meta/muse-spark-1.3"] },
];

export default function AssistantIAPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  const flatModels = useMemo(() => MODEL_GROUPS.flatMap((group) => group.models), []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const question = input.trim();
    if (!question || loading) return;
    const next: Message[] = [...messages, { role: "user", content: question }];
    setMessages(next); setInput(""); setError(""); setLoading(true);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke("min-ai", {
        body: { action: "assistant-chat", model, messages: next },
      });
      if (invokeError) throw new Error(invokeError.message);
      if (data?.error) throw new Error(data.error);
      if (typeof data?.reply !== "string" || !data.reply.trim()) throw new Error("La réponse de l’IA est vide.");
      setMessages([...next, { role: "assistant", content: data.reply.trim() }]);
    } catch (err) {
      setMessages(next);
      setError(err instanceof Error ? err.message : "L’assistant IA est temporairement indisponible.");
    } finally { setLoading(false); }
  };

  const copy = async (content: string, index: number) => {
    await navigator.clipboard.writeText(content);
    setCopied(index);
    window.setTimeout(() => setCopied(null), 1500);
  };

  return <main className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8">
    <header className="flex items-start gap-3">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10"><Bot className="h-6 w-6 text-primary" /></div>
      <div className="min-w-0 flex-1">
        <h2 className="text-2xl font-bold text-foreground">Assistant IA</h2>
        <p className="mt-1 text-sm text-muted-foreground">Un assistant généraliste pour poser des questions, rédiger, synthétiser ou explorer des idées.</p>
      </div>
      <button type="button" onClick={() => { setMessages([]); setError(""); }} disabled={loading || messages.length === 0} className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-foreground disabled:opacity-50"><Plus className="h-4 w-4" /><span className="hidden sm:inline">Nouvelle discussion</span></button>
    </header>

    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="font-semibold text-foreground">Conversation</p><p className="text-xs text-muted-foreground">Le modèle choisi s’applique aux prochains messages.</p></div>
        <label className="flex items-center gap-2 text-sm text-foreground"><span className="whitespace-nowrap">Modèle IA</span><select value={model} onChange={(e) => setModel(e.target.value)} disabled={loading} className="max-w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">{MODEL_GROUPS.map((group) => <optgroup key={group.label} label={group.label}>{group.models.map((item) => <option key={item} value={item}>{item}</option>)}</optgroup>)}</select></label>
      </div>

      {messages.length === 0 ? <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
        <div className="mb-4 rounded-2xl bg-primary/10 p-4"><Sparkles className="h-8 w-8 text-primary" /></div>
        <h3 className="text-lg font-semibold text-foreground">Que souhaites-tu savoir ?</h3>
        <p className="mt-2 max-w-lg text-sm text-muted-foreground">Pose une question, demande une explication, prépare un texte ou fais résumer des informations. Vérifie les faits et références importants avant de les réutiliser.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">{["Explique-moi simplement…", "Aide-moi à rédiger…", "Résume les points clés de…"].map((hint) => <button key={hint} type="button" onClick={() => setInput(hint)} className="rounded-full border border-border px-3 py-2 text-xs text-foreground hover:border-primary/50">{hint}</button>)}</div>
      </div> : <div className="max-h-[55vh] min-h-72 space-y-4 overflow-y-auto p-4 sm:p-6">{messages.map((message, index) => <article key={index} className={message.role === "user" ? "ml-5 rounded-xl bg-primary/10 p-4 sm:ml-16" : "mr-5 rounded-xl border border-border bg-background p-4 sm:mr-16"}>
        <div className="mb-2 flex items-center justify-between gap-3"><span className="text-xs font-semibold text-muted-foreground">{message.role === "user" ? "Vous" : "Assistant IA"}</span>{message.role === "assistant" && <button type="button" onClick={() => copy(message.content, index)} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">{copied === index ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}{copied === index ? "Copié" : "Copier"}</button>}</div>
        <div className="whitespace-pre-wrap break-words text-sm leading-6 text-foreground">{message.content}</div>
      </article>)}{loading && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Réponse en cours…</div>}</div>}

      {error && <div role="alert" className="mx-4 mb-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
      <form onSubmit={submit} className="border-t border-border bg-muted/20 p-3 sm:p-4">
        <label htmlFor="assistant-ia-prompt" className="sr-only">Votre message</label>
        <div className="flex items-end gap-2"><textarea id="assistant-ia-prompt" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (input.trim() && !loading) e.currentTarget.form?.requestSubmit(); } }} rows={3} maxLength={8000} disabled={loading} placeholder="Écris ta question… (Entrée pour envoyer, Maj+Entrée pour une nouvelle ligne)" className="min-w-0 flex-1 resize-y rounded-xl border border-border bg-background p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /><button type="submit" disabled={loading || !input.trim()} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"><Send className="h-4 w-4" /><span className="hidden sm:inline">Envoyer</span></button></div>
        <p className="mt-2 text-xs text-muted-foreground">Limite de 8 000 caractères par message. N’envoie pas de données personnelles ou confidentielles. Les réponses peuvent contenir des erreurs.</p>
      </form>
    </section>
    <p className="text-xs leading-relaxed text-muted-foreground">Accès réservé aux comptes autorisés. Les messages sont transmis à 1min.ai pour génération, selon les conditions et la conservation du fournisseur. Le modèle par défaut est {DEFAULT_MODEL} ; sa disponibilité dépend du catalogue de ton compte.</p>
  </main>;
}
