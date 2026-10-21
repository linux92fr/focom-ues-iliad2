import AdminLayout, { AdminAuthGuard } from '@/components/admin/AdminLayout';
import { useState, FormEvent, ChangeEvent } from 'react';
import { Wand2, Bot, ArrowRight, Copy, Check, FileText, Image as ImageIcon, MessageCircle, Newspaper, Loader2, Paperclip, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { supabase } from '@/integrations/supabase/client';
import StudioGitHubAssistant from '@/components/admin/StudioGitHubAssistant';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

type Mode = 'article' | 'summary' | 'correction' | 'image' | 'chat' | 'code';
type ChatMessage = { role: 'user' | 'assistant'; content: string };
type Attachment = { id: string; name: string; content: string; size: number };

const MAX_TEXT = 30000;
const MAX_CODE_TEXT = 20000;
const MAX_CHAT_TEXT = 8000;
const MAX_IMAGE_PROMPT = 2000;
const MAX_ATTACHMENTS = 5;
const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;
const MAX_ATTACHMENT_CHARS = 10000;

const MODES: { value: Mode; label: string; desc: string; icon: typeof Wand2 }[] = [
  { value: 'article', label: 'Article', desc: 'Articles syndicaux et actualités', icon: Newspaper },
  { value: 'summary', label: 'Résumé', desc: 'PDF, accords et textes', icon: FileText },
  { value: 'correction', label: 'Correction', desc: 'Orthographe et reformulation', icon: Wand2 },
  { value: 'image', label: 'Image', desc: 'Illustrations pour les publications', icon: ImageIcon },
  { value: 'chat', label: 'Assistant', desc: 'Questions des salariés', icon: MessageCircle },
  { value: 'code', label: 'Code', desc: 'Générer, expliquer et corriger du code', icon: Bot },
];

const CODE_MODEL_GROUPS = [
  { label: 'Alibaba', models: ['qwen3.8-max', 'qwen3.8-flash', 'qwen3.7-plus', 'qwen3.7-max', 'qwen3.7-flash', 'qwen3.6-plus', 'qwen3.6-flash', 'qwen3-coder-plus', 'qwen3-coder-flash'] },
  { label: 'AWS Bedrock · Anthropic', models: ['us.anthropic.claude-sonnet-5-5', 'us.anthropic.claude-sonnet-5', 'us.anthropic.claude-sonnet-4-6', 'us.anthropic.claude-sonnet-4-5-20250929-v1:0', 'us.anthropic.claude-opus-5-5', 'us.anthropic.claude-opus-5', 'us.anthropic.claude-opus-4-8', 'us.anthropic.claude-opus-4-7', 'us.anthropic.claude-opus-4-6-v1', 'us.anthropic.claude-opus-4-5-20251101-v1:0', 'us.anthropic.claude-haiku-5-5', 'us.anthropic.claude-haiku-4-5-20251001-v1:0', 'us.anthropic.claude-fable-5-1', 'us.anthropic.claude-fable-5'] },
  { label: 'Cohere', models: ['command-a-plus-05-2026'] },
  { label: 'DeepSeek', models: ['deepseek-v4-pro', 'deepseek-flash'] },
  { label: 'Google AI', models: ['gemini-4-argon', 'gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.1-pro-preview', 'gemini-3.1-flash-lite-preview', 'gemini-3-flash-preview'] },
  { label: 'Mistral', models: ['mistral-small-2603', 'mistral-medium-3-5', 'mistral-large-2512'] },
  { label: 'OpenAI', models: ['gpt-5.3-codex', 'gpt-6.1-sol', 'gpt-6-sol', 'gpt-6-luna', 'gpt-6-astra', 'gpt-5.6-terra', 'gpt-5.6-sol', 'gpt-5.6-luna', 'gpt-5.5-pro', 'gpt-5.5', 'gpt-5.4-nano', 'gpt-5.4-mini', 'gpt-5.4', 'gpt-5', 'gpt-4o', 'o3'] },
  { label: 'OpenRouter', models: ['moonshotai/kimi-k3', 'moonshotai/kimi-k2.7-code', 'moonshotai/kimi-k2.6', 'meta/muse-wonder', 'meta/muse-spark-1.3', 'meta/muse-spark-1.2', 'meta/muse-spark-1.1'] },
  { label: 'xAI', models: ['grok-4.7', 'grok-4.6', 'grok-4.5', 'grok-4.3'] },
  { label: 'Z.AI', models: ['glm-5.3', 'glm-5.2', 'glm-5.1', 'glm-5'] },
];

const attachmentAccept = 'application/pdf,.pdf,text/*,.txt,.md,.csv,.json,.xml,.html,.htm,.css,.scss,.ts,.tsx,.js,.jsx,.mjs,.cjs,.py,.java,.php,.rb,.go,.rs,.sql,.yaml,.yml,.env,.log';

async function extractPdfText(file: File) {
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) throw new Error('Sélectionne un fichier PDF.');
  if (file.size > 15 * 1024 * 1024) throw new Error('Le PDF dépasse la limite de 15 Mo.');
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
  let extracted = '';
  for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 100); pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    extracted += textContent.items.map((item) => ('str' in item ? item.str : '')).join(' ') + '\n\n';
    if (extracted.length >= MAX_TEXT) break;
  }
  if (!extracted.trim()) throw new Error('Aucun texte extractible. Le PDF est peut-être un scan : utilise un PDF avec texte OCR.');
  return extracted.slice(0, MAX_TEXT);
}

async function readAttachment(file: File): Promise<Attachment> {
  if (file.size > MAX_ATTACHMENT_SIZE) throw new Error(`${file.name} dépasse la limite de 10 Mo.`);
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  const isText = file.type.startsWith('text/') || ['application/json', 'application/xml'].includes(file.type) || /\.(txt|md|csv|json|xml|html?|css|scss|ts|tsx|js|jsx|mjs|cjs|py|java|php|rb|go|rs|sql|ya?ml|env|log)$/i.test(file.name);
  if (!isPdf && !isText) throw new Error(`${file.name} n’est pas un fichier PDF ou texte pris en charge.`);
  const raw = isPdf ? await extractPdfText(file) : await file.text();
  const content = raw.length > MAX_ATTACHMENT_CHARS ? raw.slice(0, MAX_ATTACHMENT_CHARS) + '\n\n[Contenu tronqué à 10 000 caractères pour rester dans les limites IA.]' : raw;
  if (!content.trim()) throw new Error(`${file.name} ne contient pas de texte exploitable.`);
  return { id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2)}`, name: file.name, size: file.size, content: content.trim() };
}

function AttachmentPanel({ attachments, onFiles, onRemove, disabled, reading }: { attachments: Attachment[]; onFiles: (event: ChangeEvent<HTMLInputElement>) => void; onRemove: (id: string) => void; disabled: boolean; reading: boolean }) {
  return <div className='rounded-lg border border-border bg-muted/20 p-4 space-y-3'>
    <label className='block'>
      <span className='flex items-center gap-2 text-sm font-semibold text-foreground'><Paperclip className='w-4 h-4' />Fichiers joints</span>
      <span className='block text-xs text-muted-foreground mt-1'>PDF avec texte OCR ou fichiers texte/code. Maximum {MAX_ATTACHMENTS} fichiers, 10 Mo par fichier. Leur contenu est ajouté comme contexte à la demande IA.</span>
      <input type='file' multiple accept={attachmentAccept} onChange={onFiles} disabled={disabled || reading || attachments.length >= MAX_ATTACHMENTS} className='block w-full mt-2 text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-primary disabled:opacity-50' />
    </label>
    {reading && <p className='inline-flex items-center gap-2 text-xs text-muted-foreground'><Loader2 className='w-3.5 h-3.5 animate-spin' />Lecture des fichiers…</p>}
    {attachments.length > 0 && <ul className='space-y-2'>
      {attachments.map((attachment) => <li key={attachment.id} className='flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2 text-sm'>
        <span className='min-w-0 truncate text-foreground'>{attachment.name}</span>
        <button type='button' onClick={() => onRemove(attachment.id)} disabled={disabled || reading} className='inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive disabled:opacity-50'><X className='w-3.5 h-3.5' />Retirer</button>
      </li>)}
    </ul>}
  </div>;
}

function AIStudio() {
  const [mode, setMode] = useState<Mode>('article');
  const [input, setInput] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [codePrompt, setCodePrompt] = useState('');
  const [codeModel, setCodeModel] = useState('gpt-5.3-codex');
  const [codeReasoning, setCodeReasoning] = useState('medium');
  const [imageSize, setImageSize] = useState('1024x1024');
  const [imageQuality, setImageQuality] = useState('medium');
  const [output, setOutput] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageStatus, setImageStatus] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isReadingAttachment, setIsReadingAttachment] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const invoke = async (body: Record<string, unknown>) => {
    const { data, error: fnError } = await supabase.functions.invoke('min-ai', { body });
    if (fnError) throw new Error(fnError.message);
    if (data?.error) throw new Error(data.error);
    return data;
  };

  const buildPromptWithAttachments = (base: string, maxLength: number) => {
    if (!attachments.length) return base;
    const joined = attachments.map((attachment) => `Fichier joint : ${attachment.name}\n${attachment.content}`).join('\n\n');
    const prompt = `${base}\n\n---\nFichiers joints fournis par l’utilisateur (à utiliser comme contexte, sans inventer ce qui n’y figure pas) :\n\n${joined}`;
    if (prompt.length > maxLength) throw new Error(`Le texte et les fichiers joints dépassent la limite de ${maxLength.toLocaleString('fr-FR')} caractères. Retire un fichier ou raccourcis la demande.`);
    return prompt;
  };

  const handleAttachmentFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    setError('');
    if (attachments.length + files.length > MAX_ATTACHMENTS) {
      setError(`Ajoute ${MAX_ATTACHMENTS} fichiers maximum.`);
      event.target.value = '';
      return;
    }
    setIsReadingAttachment(true);
    try {
      const next = await Promise.all(files.map(readAttachment));
      setAttachments((current) => [...current, ...next].slice(0, MAX_ATTACHMENTS));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lecture du fichier impossible.');
    } finally {
      setIsReadingAttachment(false);
      event.target.value = '';
    }
  };

  const removeAttachment = (id: string) => setAttachments((current) => current.filter((attachment) => attachment.id !== id));

  const extractPdf = async (file: File) => setInput(await extractPdfText(file));

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
      const data = await invoke({ action: mode, text: buildPromptWithAttachments(input.trim(), MAX_TEXT) });
      setOutput(data.result ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally { setIsLoading(false); }
  };

  const handleCodeSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!codePrompt.trim() || isLoading) return;
    setIsLoading(true); setError(''); setOutput('');
    try {
      const data = await invoke({ action: 'code', text: buildPromptWithAttachments(codePrompt.trim(), MAX_CODE_TEXT), model: codeModel, reasoning: codeReasoning });
      setOutput(data.result ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'La génération du code a échoué.');
    } finally { setIsLoading(false); }
  };

  const handleImageSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!imagePrompt.trim()) return;
    setIsLoading(true); setError(''); setImageUrl(''); setImageStatus('Génération en cours…');
    try {
      const promptWithAttachments = buildPromptWithAttachments(imagePrompt.trim(), MAX_IMAGE_PROMPT);
      const started = await invoke({ action: 'image', prompt: promptWithAttachments, size: imageSize, quality: imageQuality });
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
    setError('');
    let requestQuestion = question;
    try {
      requestQuestion = buildPromptWithAttachments(question, MAX_CHAT_TEXT);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Les fichiers joints sont trop volumineux.');
      return;
    }
    const next = [...messages, { role: 'user' as const, content: question }];
    const requestMessages = [...messages, { role: 'user' as const, content: requestQuestion }];
    setMessages(next); setChatInput(''); setIsLoading(true);
    try {
      const data = await invoke({ action: 'chat', messages: requestMessages });
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

  const attachmentsBlock = <AttachmentPanel attachments={attachments} onFiles={handleAttachmentFiles} onRemove={removeAttachment} disabled={isLoading} reading={isReadingAttachment} />;

  return <div className='p-4 lg:p-8 max-w-5xl mx-auto space-y-6'>
    <div className='flex items-start gap-3'>
      <div className='w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0'><Wand2 className='w-5 h-5 text-primary' /></div>
      <div><h1 className='text-2xl font-bold text-foreground'>Studio IA</h1><p className='text-muted-foreground text-sm mt-1'>Rédaction syndicale, synthèse documentaire, correction, visuels et assistant salarié.</p></div>
    </div>

    <Link to='/assistant-juridique' className='flex items-center gap-4 p-4 bg-primary/5 border border-primary/20 hover:border-primary/50 rounded-xl transition-colors group'>
      <div className='w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0'><Bot className='w-5 h-5 text-primary-foreground' /></div>
      <div className='flex-1'><p className='font-semibold text-foreground text-sm'>Assistant Juridique FOCOM</p><p className='text-xs text-muted-foreground'>Accès à l’assistant juridique interne déjà présent sur le site.</p></div>
      <ArrowRight className='w-4 h-4 text-muted-foreground group-hover:text-primary' />
    </Link>

    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2'>
      {MODES.map((item) => {
        const Icon = item.icon;
        return <button key={item.value} type='button' onClick={() => { setMode(item.value); setError(''); }} className={`text-left rounded-xl border p-3 transition-colors ${mode === item.value ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border bg-card hover:border-primary/40'}`}>
          <Icon className='w-5 h-5 text-primary mb-2' />
          <span className='block text-sm font-semibold text-foreground'>{item.label}</span>
          <span className='block text-xs text-muted-foreground mt-1'>{item.desc}</span>
        </button>;
      })}
    </div>

    {error && <div role='alert' className='bg-destructive/10 border border-destructive/20 rounded-xl p-3 text-sm text-destructive'>{error}</div>}

    {(mode === 'article' || mode === 'summary' || mode === 'correction') && <section className='bg-card rounded-xl border border-border p-5 sm:p-6 space-y-4'>
      <div><h2 className='font-bold text-foreground'>{mode === 'article' ? 'Rédiger un article ou une actualité' : mode === 'summary' ? 'Résumer un PDF ou un document' : 'Corriger et améliorer un texte'}</h2>
        <p className='text-sm text-muted-foreground mt-1'>{mode === 'summary' ? 'Importe un PDF ou colle le texte d’un accord, d’une décision ou d’un document juridique.' : mode === 'article' ? 'Décris le sujet, les faits établis, les chiffres et les messages à faire passer. Relis le résultat avant publication.' : 'Le sens initial sera conservé autant que possible.'}</p></div>
      {mode === 'summary' && <label className='block'><span className='text-sm font-medium text-foreground'>Importer un PDF dans la zone de texte (15 Mo maximum)</span><input type='file' accept='application/pdf,.pdf' onChange={handlePdf} disabled={isLoading} className='block w-full mt-2 text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-primary' /></label>}
      {attachmentsBlock}
      <form onSubmit={handleTextSubmit} className='space-y-3'>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} maxLength={MAX_TEXT} rows={9} disabled={isLoading} placeholder={mode === 'article' ? 'Sujet, contexte, revendications, faits vérifiés…' : mode === 'summary' ? 'Le texte extrait du PDF apparaîtra ici. Tu peux aussi coller directement le contenu…' : 'Colle ici le texte à corriger…'} className='w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30' />
        <div className='flex flex-wrap items-center justify-between gap-3'><span className='text-xs text-muted-foreground'>{input.length.toLocaleString('fr-FR')}/30 000 caractères hors fichiers joints</span><button type='submit' disabled={isLoading || isReadingAttachment || !input.trim()} className='inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50'>{isLoading && <Loader2 className='w-4 h-4 animate-spin' />}{isLoading ? 'Traitement…' : mode === 'article' ? 'Rédiger' : mode === 'summary' ? 'Résumer le document' : 'Corriger le texte'}</button></div>
      </form>
      {output && <div className='rounded-xl border border-border bg-muted/20 p-4 space-y-3'><div className='flex justify-between items-center gap-3'><h3 className='font-semibold text-foreground'>Résultat à relire</h3><button type='button' onClick={copyOutput} className='inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary'>{copied ? <Check className='w-4 h-4' /> : <Copy className='w-4 h-4' />}{copied ? 'Copié' : 'Copier'}</button></div><div className='whitespace-pre-wrap text-sm leading-relaxed text-foreground'>{output}</div></div>}
    </section>}

    {mode === 'image' && <section className='bg-card rounded-xl border border-border p-5 sm:p-6 space-y-4'>
      <div><h2 className='font-bold text-foreground'>Générer une illustration</h2><p className='text-sm text-muted-foreground mt-1'>Décris une scène, une ambiance et le format souhaité. Tu peux aussi joindre un fichier texte ou PDF comme contexte. Évite d’inclure des informations confidentielles.</p></div>
      {attachmentsBlock}
      <form onSubmit={handleImageSubmit} className='space-y-4'>
        <textarea value={imagePrompt} onChange={(e) => setImagePrompt(e.target.value)} rows={4} maxLength={MAX_IMAGE_PROMPT} disabled={isLoading} placeholder='Ex. : illustration réaliste d’une réunion de salariés dans une entreprise française, ambiance professionnelle…' className='w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30' />
        <div className='space-y-4 rounded-lg border border-border bg-muted/20 p-4'>
          <label className='block space-y-2'><span className='block text-sm font-semibold text-foreground'>1. Format de l’image</span><select value={imageSize} onChange={(e) => setImageSize(e.target.value)} disabled={isLoading} className='w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground'><option value='1024x1024'>Carré (1:1) — publications</option><option value='1536x1024'>Paysage (3:2) — articles et site</option><option value='1024x1536'>Portrait (2:3) — affiches</option></select></label>
          <label className='block space-y-2'><span className='block text-sm font-semibold text-foreground'>2. Qualité de génération</span><select value={imageQuality} onChange={(e) => setImageQuality(e.target.value)} disabled={isLoading} className='w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground'><option value='low'>Rapide / économique</option><option value='medium'>Équilibrée (recommandée)</option><option value='high'>Qualité élevée</option></select><span className='block text-xs text-muted-foreground'>Choisis le niveau de qualité avant de cliquer sur « Générer l’image ». Une qualité élevée peut consommer davantage de crédits.</span></label>
        </div>
        <div className='flex flex-wrap justify-between items-center gap-3'><span className='text-xs text-muted-foreground'>{imagePrompt.length}/2 000 caractères hors fichiers joints</span><button type='submit' disabled={isLoading || isReadingAttachment || imagePrompt.trim().length < 5} className='inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50'>{isLoading && <Loader2 className='w-4 h-4 animate-spin' />}{isLoading ? 'Génération…' : 'Générer l’image'}</button></div>
      </form>
      {imageStatus && <p className='text-sm text-muted-foreground'>{imageStatus}</p>}
      {imageUrl && <div className='space-y-3'><img src={imageUrl} alt='Illustration générée par 1min.ai' className='max-w-full rounded-xl border border-border' /><a href={imageUrl} target='_blank' rel='noreferrer' className='text-sm text-primary underline'>Ouvrir / enregistrer l’image</a></div>}
    </section>}

    {mode === 'code' && <section className='bg-card rounded-xl border border-border p-5 sm:p-6 space-y-4'>
      <div><h2 className='font-bold text-foreground'>Assistant de programmation</h2><p className='text-sm text-muted-foreground mt-1'>Décris ce que tu veux créer, corriger ou comprendre. La réponse sera affichée dans une zone prête à copier.</p></div>
      <form onSubmit={handleCodeSubmit} className='space-y-4'>
        <label className='block space-y-2'><span className='block text-sm font-semibold text-foreground'>Demande ou code à traiter</span><textarea value={codePrompt} onChange={(e) => setCodePrompt(e.target.value)} rows={8} maxLength={MAX_CODE_TEXT} disabled={isLoading} placeholder='Ex. : écris une fonction TypeScript, explique ce code ou corrige cette erreur…' className='w-full rounded-xl border border-border bg-background p-3 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30' /><span className='block text-xs text-muted-foreground'>{codePrompt.length.toLocaleString('fr-FR')}/20 000 caractères hors fichiers joints</span></label>
        {attachmentsBlock}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'><label className='block space-y-2'><span className='block text-sm font-semibold text-foreground'>Modèle IA</span><select value={codeModel} onChange={(e) => setCodeModel(e.target.value)} disabled={isLoading} className='w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground'>{CODE_MODEL_GROUPS.map((group) => <optgroup key={group.label} label={group.label}>{group.models.map((model) => <option key={model} value={model}>{model}</option>)}</optgroup>)}</select><span className='block text-xs text-muted-foreground'>GPT-5.3 Codex est sélectionné par défaut. La disponibilité dépend de l’API 1min.ai et de ton compte.</span></label>
        <label className='block space-y-2'><span className='block text-sm font-semibold text-foreground'>Niveau de raisonnement demandé</span><select value={codeReasoning} onChange={(e) => setCodeReasoning(e.target.value)} disabled={isLoading} className='w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground'><option value='low'>Rapide — réponse concise</option><option value='medium'>Équilibré — recommandé</option><option value='high'>Approfondi — cas limites et sécurité</option></select><span className='block text-xs text-muted-foreground'>Ce niveau guide la consigne envoyée au modèle ; tous les fournisseurs ne proposent pas un paramètre natif.</span></label></div>
        <div className='flex flex-wrap items-center justify-between gap-3'><span className='text-xs text-muted-foreground'>Vérifie et teste le code avant de le déployer.</span><button type='submit' disabled={isLoading || isReadingAttachment || !codePrompt.trim()} className='inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50'>{isLoading ? <Loader2 className='w-4 h-4 animate-spin' /> : <Bot className='w-4 h-4' />}{isLoading ? 'Génération du code…' : 'Générer le code'}</button></div>
      </form>
      {output && <div className='rounded-xl border border-border bg-muted/20 p-4 space-y-3'><div className='flex flex-wrap justify-between items-center gap-3'><h3 className='font-semibold text-foreground'>Réponse — code prêt à copier</h3><button type='button' onClick={copyOutput} className='inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary'>{copied ? <Check className='w-4 h-4' /> : <Copy className='w-4 h-4' />}{copied ? 'Copié' : 'Copier la réponse'}</button></div><pre className='max-h-[38rem] overflow-auto rounded-lg border border-border bg-background p-4 text-xs sm:text-sm leading-relaxed text-foreground whitespace-pre-wrap break-words'><code>{output}</code></pre></div>}
    </section>}

    {mode === 'code' && <StudioGitHubAssistant />}

    {mode === 'chat' && <section className='bg-card rounded-xl border border-border p-5 sm:p-6 space-y-4'>
      <div><h2 className='font-bold text-foreground'>Assistant IA pour les salariés</h2><p className='text-sm text-muted-foreground mt-1'>Réponses générales sur le travail et les droits des salariés. Les réponses juridiques doivent être vérifiées, et ne remplacent pas un accompagnement syndical.</p></div>
      {attachmentsBlock}
      <div className='min-h-36 max-h-[28rem] overflow-y-auto rounded-xl bg-muted/20 p-3 space-y-3'>{messages.length === 0 && <p className='text-sm text-muted-foreground p-2'>Exemple : « Quels documents conserver en cas de désaccord sur mes horaires ? »</p>}{messages.map((message, i) => <div key={i} className={`rounded-xl p-3 text-sm whitespace-pre-wrap ${message.role === 'user' ? 'ml-6 bg-primary/10 text-foreground' : 'mr-6 bg-card border border-border text-foreground'}`}><p className='text-xs font-semibold mb-1 text-muted-foreground'>{message.role === 'user' ? 'Vous' : 'Assistant IA'}</p>{message.content}</div>)}{isLoading && <p className='text-sm text-muted-foreground animate-pulse'>L’assistant prépare une réponse…</p>}</div>
      <form onSubmit={handleChat} className='flex flex-col sm:flex-row gap-2'><textarea value={chatInput} onChange={(e) => setChatInput(e.target.value)} rows={2} maxLength={4000} disabled={isLoading} placeholder='Pose ta question…' className='min-w-0 flex-1 rounded-xl border border-border bg-background p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30' /><button type='submit' disabled={isLoading || isReadingAttachment || !chatInput.trim()} className='inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50'>{isLoading ? <Loader2 className='w-4 h-4 animate-spin' /> : <MessageCircle className='w-4 h-4' />}Envoyer</button></form>
    </section>}

    <p className='text-xs leading-relaxed text-muted-foreground'>Confidentialité : les textes transmis sont envoyés à FOCOM UES ILIAD pour traitement et peuvent être conservés selon les règles du fournisseur. N’envoie pas de données personnelles ou confidentielles sans autorisation. Vérifie les résumés, références juridiques et contenus générés avant toute diffusion. L’usage dépend des crédits et limites de ton compte.</p>
  </div>;
}

export default function AdminAI() {
  return <AdminAuthGuard><AdminLayout title='Studio IA' breadcrumb={['Administration', 'Studio IA']}><AIStudio /></AdminLayout></AdminAuthGuard>;
}
