import { useState, FormEvent, ChangeEvent } from 'react';
import { Wand2, Bot, ArrowRight, Copy, Check, FileText, Image as ImageIcon, MessageCircle, Newspaper, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { supabase } from '@/integrations/supabase/client';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

type Mode = 'article' | 'summary' | 'correction' | 'image' | 'chat';
type ChatMessage = { role: 'user' | 'assistant'; content: string };
const MODES: { value: Mode; label: string; desc: string; icon: typeof Wand2 }[] = [
  { value: 'article', label: 'Article', desc: 'Articles syndicaux et actualités', icon: Newspaper },
  { value: 'summary', label: 'Résumé', desc: 'PDF, accords et textes', icon: FileText },
  { value: 'correction', label: 'Correction', desc: 'Orthographe et reformulation', icon: Wand2 },
  { value: 'image', label: 'Image', desc: 'Illustrations pour les publications', icon: ImageIcon },
  { value: 'chat', label: 'Assistant', desc: 'Questions des salariés', icon: MessageCircle },
];

export default function AI() {
  const [mode, setMode] = useState<Mode>('article');
  const [input, setInput] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [output, setOutput] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageStatus, setImageStatus] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const invoke = async (body: Record<string, unknown>) => {
    const { data, error: fnError } = await supabase.functions.invoke('1min-ai', { body });
    if (fnError) throw new Error(fnError.message);
    if (data?.error) throw new Error(data.error);
    return data;
  };

  const extractPdf = async (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error('Sélectionne un fichier PDF.');
    }
    if (file.size > 15 * 1024 * 1024) throw new Error('Le PDF dépasse la limite de 15 Mo.');
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
    let extracted = '';
    for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 100); pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      extracted += textContent.items.map((item) => ('str' in item ? item.str : '')).join(' ') + '\n\n';
      if (extracted.length >= 30000) break;
    }
    if (!extracted.trim()) throw new Error('Aucun texte extractible. Le PDF est peut-être un scan : utilise un PDF avec texte OCR.');
    setInput(extracted.slice(0, 30000));
  };

  const handlePdf = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError('');
    setIsLoading(true);
    try {
      await extractPdf(file);
      setMode('summary');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lecture du PDF impossible.');
    } finally {
      setIsLoading(false);
      event.target.value = '';
    }
  };

  const handleTextSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!input.trim()) return;
    setIsLoading(true); setError(''); setOutput('');
    try {
      const data = await invoke({ action: mode, text: input.trim() });
      setOutput(data.result ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally { setIsLoading(false); }
  };

  const handleImageSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!imagePrompt.trim()) return;
    setIsLoading(true); setError(''); setImageUrl(''); setImageStatus('Génération en cours…');
    try {
      const started = await invoke({ action: 'image', prompt: imagePrompt.trim() });
      const recordId = started?.result?.aiRecord?.uuid;
      if (!recordId) throw new Error('La génération a démarré sans identifiant de résultat.');
      for (let attempt = 0; attempt < 15; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const checked = await invoke({ action: 'image-result', prompt: recordId });
        const record = checked?.result;
        if (record?.status === 'SUCCESS' && checked?.temporaryUrl) {
          setImageUrl(checked.temporaryUrl); setImageStatus('Image prête. Le lien fourni par 1min.ai est temporaire.'); return;
        }
        if (record?.status === 'FAILURE') throw new Error('La génération de l’image a échoué. Essaie une autre description.');
        setImageStatus('Génération en cours… (' + (attempt + 1) + '/15)');
      }
      setImageStatus('La génération prend plus de temps que prévu. Relance une demande dans quelques instants.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'La génération d’image a échoué.');
      setImageStatus('');
    } finally { setIsLoading(false); }
  };

  const handleChat = async (event: FormEvent) => {
    event.preventDefault();
    const question = chatInput.trim();
    if (!question || isLoading) return;
    const next = [...messages, { role: 'user' as const, content: question }];
    setMessages(next); setChatInput(''); setIsLoading(true); setError('');
    try {
      const data = await invoke({ action: 'chat', messages: next });
      setMessages([...next, { role: 'assistant', content: data.reply ?? '' }]);
    } catch (err) {
      setMessages(next);
      setError(err instanceof Error ? err.message : 'L’assistant est indisponible.');
    } finally { setIsLoading(false); }
  };

  const copyOutput = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true); window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Wand2 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Studio IA — 1min.ai</h1>
          <p className="text-muted-foreground text-sm mt-1">Rédaction syndicale, synthèse documentaire, correction, visuels et assistant salarié.</p>
        </div>
      </div>

      <Link to="/assistant-juridique" className="flex items-center gap-4 p-4 bg-primary/5 border border-primary/20 hover:border-primary/50 rounded-xl transition-colors group">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0"><Bot className="w-5 h-5 text-primary-foreground" /></div>
        <div className="flex-1"><p className="font-semibold text-foreground text-sm">Assistant Juridique FOCOM</p><p className="text-xs text-muted-foreground">Accès à l’assistant juridique interne déjà présent sur le site.</p></div>
        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
      </Link>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        {MODES.map((item) => {
          const Icon = item.icon;
          return <button key={item.value} type="button" onClick={() => { setMode(item.value); setError(''); }} className={`text-left rounded-xl border p-3 transition-colors ${mode === item.value ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border bg-card hover:border-primary/40'}`}>
            <Icon className="w-5 h-5 text-primary mb-2" />
            <span className="block text-sm font-semibold text-foreground">{item.label}</span>
            <span className="block text-xs text-muted-foreground mt-1">{item.desc}</span>
          </button>;
        })}
      </div>

      {error && <div role="alert" className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 text-sm text-destructive">{error}</div>}

      {(mode === 'article' || mode === 'summary' || mode === 'correction') && <section className="bg-card rounded-xl border border-border p-5 sm:p-6 space-y-4">
        <div><h2 className="font-bold text-foreground">{mode === 'article' ? 'Rédiger un article ou une actualité' : mode === 'summary' ? 'Résumer un PDF ou un document' : 'Corriger et améliorer un texte'}</h2>
          <p className="text-sm text-muted-foreground mt-1">{mode === 'summary' ? 'Importe un PDF ou colle le texte d’un accord, d’une décision ou d’un document juridique.' : mode === 'article' ? 'Décris le sujet, les faits établis, les chiffres et les messages à faire passer. Relis le résultat avant publication.' : 'Le sens initial sera conservé autant que possible.'}</p></div>
        {mode === 'summary' && <label className="block"><span className="text-sm font-medium text-foreground">Importer un PDF (15 Mo maximum)</span><input type="file" accept="application/pdf,.pdf" onChange={handlePdf} disabled={isLoading} className="block w-full mt-2 text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-primary" /></label>}
        <form onSubmit={handleTextSubmit} className="space-y-3">
          <textarea value={input} onChange={(e) => setInput(e.target.value)} maxLength={30000} rows={9} disabled={isLoading} placeholder={mode === 'article' ? 'Sujet, contexte, revendications, faits vérifiés…' : mode === 'summary' ? 'Le texte extrait du PDF apparaîtra ici. Tu peux aussi coller directement le contenu…' : 'Colle ici le texte à corriger…'} className="w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <div className="flex flex-wrap items-center justify-between gap-3"><span className="text-xs text-muted-foreground">{input.length.toLocaleString('fr-FR')}/30 000 caractères</span><button type="submit" disabled={isLoading || !input.trim()} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">{isLoading && <Loader2 className="w-4 h-4 animate-spin" />}{isLoading ? 'Traitement…' : mode === 'article' ? 'Rédiger' : mode === 'summary' ? 'Résumer le document' : 'Corriger le texte'}</button></div>
        </form>
        {output && <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3"><div className="flex justify-between items-center gap-3"><h3 className="font-semibold text-foreground">Résultat à relire</h3><button type="button" onClick={copyOutput} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary">{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{copied ? 'Copié' : 'Copier'}</button></div><div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{output}</div></div>}
      </section>}

      {mode === 'image' && <section className="bg-card rounded-xl border border-border p-5 sm:p-6 space-y-4">
        <div><h2 className="font-bold text-foreground">Générer une illustration</h2><p className="text-sm text-muted-foreground mt-1">Décris une scène, une ambiance et le format souhaité. Évite d’inclure des informations confidentielles.</p></div>
        <form onSubmit={handleImageSubmit} className="space-y-3"><textarea value={imagePrompt} onChange={(e) => setImagePrompt(e.target.value)} rows={4} maxLength={2000} disabled={isLoading} placeholder="Ex. : illustration réaliste d’une réunion de salariés dans une entreprise française, ambiance professionnelle, format horizontal…" className="w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /><div className="flex justify-between items-center gap-3"><span className="text-xs text-muted-foreground">{imagePrompt.length}/2 000</span><button type="submit" disabled={isLoading || imagePrompt.trim().length < 5} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">{isLoading && <Loader2 className="w-4 h-4 animate-spin" />}{isLoading ? 'Génération…' : 'Générer l’image'}</button></div></form>
        {imageStatus && <p className="text-sm text-muted-foreground">{imageStatus}</p>}
        {imageUrl && <div className="space-y-3"><img src={imageUrl} alt="Illustration générée par 1min.ai" className="max-w-full rounded-xl border border-border" /><a href={imageUrl} target="_blank" rel="noreferrer" className="text-sm text-primary underline">Ouvrir / enregistrer l’image</a></div>}
      </section>}

      {mode === 'chat' && <section className="bg-card rounded-xl border border-border p-5 sm:p-6 space-y-4">
        <div><h2 className="font-bold text-foreground">Assistant IA pour les salariés</h2><p className="text-sm text-muted-foreground mt-1">Réponses générales sur le travail et les droits des salariés. Les réponses juridiques doivent être vérifiées, et ne remplacent pas un accompagnement syndical.</p></div>
        <div className="min-h-36 max-h-[28rem] overflow-y-auto rounded-xl bg-muted/20 p-3 space-y-3">{messages.length === 0 && <p className="text-sm text-muted-foreground p-2">Exemple : « Quels documents conserver en cas de désaccord sur mes horaires ? »</p>}{messages.map((message, i) => <div key={i} className={`rounded-xl p-3 text-sm whitespace-pre-wrap ${message.role === 'user' ? 'ml-6 bg-primary/10 text-foreground' : 'mr-6 bg-card border border-border text-foreground'}`}><p className="text-xs font-semibold mb-1 text-muted-foreground">{message.role === 'user' ? 'Vous' : 'Assistant IA'}</p>{message.content}</div>)}{isLoading && <p className="text-sm text-muted-foreground animate-pulse">L’assistant prépare une réponse…</p>}</div>
        <form onSubmit={handleChat} className="flex flex-col sm:flex-row gap-2"><textarea value={chatInput} onChange={(e) => setChatInput(e.target.value)} rows={2} maxLength={4000} disabled={isLoading} placeholder="Pose ta question…" className="min-w-0 flex-1 rounded-xl border border-border bg-background p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /><button type="submit" disabled={isLoading || !chatInput.trim()} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">{isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}Envoyer</button></form>
      </section>}

      <p className="text-xs leading-relaxed text-muted-foreground">Confidentialité : les textes transmis sont envoyés à 1min.ai pour traitement et peuvent être conservés selon les règles du fournisseur. N’envoie pas de données personnelles ou confidentielles sans autorisation. Vérifie les résumés, références juridiques et contenus générés avant toute diffusion. L’usage dépend des crédits et limites de ton compte 1min.ai.</p>
    </div>
  );
}
