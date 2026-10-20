import { useState, FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GitPullRequest, Loader2, FileCode2, ShieldCheck, ExternalLink } from "lucide-react";

type ProposedFile = { path: string; sha: string; originalContent: string; content: string; summary: string };
type Proposal = { summary: string; files: ProposedFile[]; model: string };

export default function StudioGitHubAssistant() {
  const [prompt, setPrompt] = useState("");
  const [pathsText, setPathsText] = useState("src/pages/admin/AdminAI.tsx\nsupabase/functions/1min-ai/index.ts");
  const [model, setModel] = useState("gpt-5.3-codex");
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ url: string; number: number; branch: string } | null>(null);

  const invoke = async (body: Record<string, unknown>) => {
    const { data, error: fnError } = await supabase.functions.invoke("github-code-pr", { body });
    if (fnError) throw new Error(fnError.message);
    if (data?.error) throw new Error(data.error);
    return data;
  };

  const propose = async (event: FormEvent) => {
    event.preventDefault();
    if (isLoading) return;
    setIsLoading(true); setError(""); setSuccess(null); setProposal(null);
    try {
      const paths = [...new Set(pathsText.split("\n").map((path) => path.trim()).filter(Boolean))];
      const data = await invoke({ action: "propose", prompt: prompt.trim(), paths, model });
      if (!data.proposal?.files?.length) throw new Error(data.error || "Aucun changement n’a été proposé. Précise les fichiers et le résultat attendu.");
      setProposal(data.proposal);
      setTitle("feat(ai): " + prompt.trim().replace(/\s+/g, " ").slice(0, 75));
    } catch (err) {
      setError(err instanceof Error ? err.message : "La proposition a échoué.");
    } finally { setIsLoading(false); }
  };

  const createPR = async () => {
    if (!proposal || isLoading) return;
    setIsLoading(true); setError(""); setSuccess(null);
    try {
      const data = await invoke({
        action: "create-pr",
        title: title.trim(),
        summary: proposal.summary,
        files: proposal.files.map(({ path, sha, content }) => ({ path, sha, content })),
      });
      setSuccess(data.pullRequest);
      setProposal(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "La création de la pull request a échoué.");
    } finally { setIsLoading(false); }
  };

  return (
    <section className="rounded-xl border border-primary/25 bg-primary/5 p-5 sm:p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-2"><GitPullRequest className="h-5 w-5 text-primary" /></div>
        <div>
          <h3 className="font-bold text-foreground">Proposer des changements sur GitHub</h3>
          <p className="mt-1 text-sm text-muted-foreground">L’IA lit les fichiers indiqués, propose leur contenu modifié et attend ta validation avant de créer une pull request en brouillon. Aucun push sur main.</p>
        </div>
      </div>

      <div className="flex gap-2 rounded-lg border border-border bg-background p-3 text-xs text-muted-foreground">
        <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
        <span>Accès réservé aux administrateurs. Le backend limite les chemins, vérifie que les fichiers n’ont pas changé entre l’analyse et la création, et conserve les secrets côté serveur.</span>
      </div>

      <form onSubmit={propose} className="space-y-3">
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-foreground">Modification souhaitée</span>
          <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} required minLength={8} maxLength={8000} rows={4} disabled={isLoading} placeholder="Ex. : analyse le composant Studio IA et ajoute un aperçu des changements, sans modifier les droits d'accès…" className="w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-foreground">Fichiers à fournir comme contexte (un chemin par ligne, 8 maximum)</span>
          <textarea value={pathsText} onChange={(event) => setPathsText(event.target.value)} rows={3} disabled={isLoading} className="w-full rounded-lg border border-border bg-background p-3 font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <span className="block text-xs text-muted-foreground">Commence par les fichiers concernés et ajoute les composants, types ou fonctions dont ils dépendent. Les workflows, secrets et migrations de base de données sont exclus.</span>
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-foreground">Modèle de code</span>
          <select value={model} onChange={(event) => setModel(event.target.value)} disabled={isLoading} className="w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground">
            <option value="gpt-5.3-codex">GPT-5.3 Codex</option>
            <option value="gpt-5.5">GPT-5.5</option>
            <option value="gpt-5.4">GPT-5.4</option>
            <option value="qwen3-coder-plus">Qwen Coder Plus</option>
            <option value="deepseek-v4-pro">DeepSeek V4 Pro</option>
          </select>
        </label>
        <button type="submit" disabled={isLoading || prompt.trim().length < 8 || !pathsText.trim()} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCode2 className="h-4 w-4" />}
          {isLoading ? "Analyse et proposition…" : "Analyser et proposer les changements"}
        </button>
      </form>

      {error && <div role="alert" className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      {proposal && <div className="space-y-4 rounded-xl border border-border bg-background p-4">
        <div>
          <h4 className="font-semibold text-foreground">Proposition à vérifier</h4>
          <p className="mt-1 text-sm text-muted-foreground">{proposal.summary || "Relis chaque fichier avant de créer la pull request."} · Modèle : {proposal.model}</p>
        </div>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-foreground">Titre de la pull request</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} required className="w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground" />
        </label>
        {proposal.files.map((file, index) => <div key={file.path} className="space-y-2 rounded-lg border border-border p-3">
          <div><p className="break-all font-mono text-xs font-semibold text-foreground">{file.path}</p><p className="mt-1 text-xs text-muted-foreground">{file.summary || "Contenu proposé par l’IA"}</p></div>
          <details>
            <summary className="cursor-pointer text-sm text-primary">Afficher le contenu actuel</summary>
            <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-muted/30 p-3 text-xs whitespace-pre-wrap">{file.originalContent}</pre>
          </details>
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-foreground">Contenu proposé (modifiable)</span>
            <textarea value={file.content} onChange={(event) => setProposal((current) => current ? ({ ...current, files: current.files.map((item, itemIndex) => itemIndex === index ? { ...item, content: event.target.value } : item) }) : current)} rows={10} maxLength={50000} className="w-full rounded-lg border border-border bg-background p-3 font-mono text-xs text-foreground" />
          </label>
        </div>)}
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setProposal(null)} disabled={isLoading} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground">Annuler</button>
          <button type="button" onClick={createPR} disabled={isLoading || title.trim().length < 5 || !proposal.files.length || proposal.files.some((file) => !file.content.trim())} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GitPullRequest className="h-4 w-4" />}
            Créer la pull request en brouillon
          </button>
        </div>
        <p className="text-xs text-muted-foreground">La PR reste en brouillon et ne fusionne rien. Vérifie le diff GitHub et attends les contrôles CI avant de demander la fusion.</p>
      </div>}

      {success && <div className="space-y-2 rounded-lg border border-border bg-background p-4">
        <p className="font-semibold text-foreground">Pull request en brouillon créée : #{success.number}</p>
        <p className="text-sm text-muted-foreground">Branche : <code>{success.branch}</code>. Aucun changement n’a été fusionné dans main.</p>
        <a href={success.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-primary underline">Examiner la pull request <ExternalLink className="h-4 w-4" /></a>
      </div>}
    </section>
  );
}
