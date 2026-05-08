import { useState, FormEvent } from 'react';
import { Wand2, Bot, ArrowRight, Copy, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import PageHeader from '@/components/PageHeader';

type Mode = 'corriger' | 'reformuler' | 'simplifier';

const MODES: { value: Mode; label: string; desc: string }[] = [
  { value: 'corriger', label: 'Corriger', desc: 'Orthographe et grammaire' },
  { value: 'reformuler', label: 'Reformuler', desc: 'Autre formulation' },
  { value: 'simplifier', label: 'Simplifier', desc: 'Langage accessible' },
];

const modePrompts: Record<Mode, string> = {
  corriger: "Corrige l'orthographe et la grammaire du texte syndical suivant, sans en changer le fond ni le ton. Retourne uniquement le texte corrigé, sans commentaires.",
  reformuler: "Reformule ce texte syndical en gardant le même sens mais avec d'autres mots, dans un style professionnel. Retourne uniquement le texte reformulé.",
  simplifier: "Simplifie ce texte syndical pour le rendre accessible à tous les salariés. Évite le jargon juridique. Retourne uniquement le texte simplifié.",
};

export default function AI() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<Mode>('corriger');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setIsLoading(true);
    setError('');
    setOutput('');

    try {
      const { data, error: fnError } = await supabase.functions.invoke('chat-juridique', {
        body: {
          messages: [
            {
              role: 'user',
              content: `${modePrompts[mode]}\n\nTexte :\n${input}`,
            },
          ],
        },
      });

      if (fnError) throw new Error(fnError.message);
      setOutput(data?.reply ?? '');
    } catch {
      setError('Une erreur est survenue. Réessayez plus tard.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto space-y-8">
      <PageHeader
        title="Outils IA"
        subtitle="Améliorez vos textes syndicaux ou posez vos questions juridiques"
        icon={<Wand2 className="w-6 h-6" />}
      />

      {/* Bannière assistant juridique */}
      <Link
        to="/assistant-juridique"
        className="flex items-center gap-4 p-4 bg-primary/5 border border-primary/20 hover:border-primary/50 rounded-xl transition-colors group"
      >
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
          <Bot className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-foreground text-sm">Assistant Juridique FOCOM</p>
          <p className="text-xs text-muted-foreground">Posez vos questions sur la CCNT et les accords UES Iliad</p>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </Link>

      {/* Outil de texte */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-5">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Wand2 className="w-4 h-4" /> Assistant de texte
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Corrigez, reformulez ou simplifiez vos textes syndicaux.
          </p>
        </div>

        {/* Sélecteur de mode */}
        <div className="flex gap-2 flex-wrap">
          {MODES.map((m) => (
            <button
              key={m.value}
              onClick={() => setMode(m.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                mode === m.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
              }`}
            >
              <span className="block">{m.label}</span>
              <span className={`block text-xs font-normal ${mode === m.value ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                {m.desc}
              </span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Saisissez votre texte ici (max 1 000 caractères)..."
            className="w-full p-3 border border-border rounded-xl h-36 resize-none bg-muted/20 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm text-foreground placeholder-muted-foreground"
            disabled={isLoading}
            maxLength={1000}
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">{input.length}/1000</span>
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Traitement...' : 'Transformer'}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {output && (
          <div className="bg-muted/30 rounded-xl border border-border p-4 space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-foreground">Résultat :</h3>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copié !' : 'Copier'}
              </button>
            </div>
            <p className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">{output}</p>
          </div>
        )}
      </div>
    </div>
  );
}
