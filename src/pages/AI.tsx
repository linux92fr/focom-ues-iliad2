import { useState, FormEvent } from 'react';
import PageShell from '@/components/PageShell';

type Mode = 'corriger' | 'reformuler' | 'simplifier';

const MODES: { value: Mode; label: string }[] = [
  { value: 'corriger', label: '✏️ Corriger' },
  { value: 'reformuler', label: '🔄 Reformuler' },
  { value: 'simplifier', label: '💡 Simplifier' },
];

export default function AI() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<Mode>('corriger');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setIsLoading(true);
    setError('');
    setOutput('');
    try {
      const response = await fetch('/api/ai-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input, mode }),
      });
      if (!response.ok) throw new Error('Erreur serveur');
      const data = await response.json();
      setOutput(data.result);
    } catch {
      setError('Une erreur est survenue. Réessayez plus tard.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageShell subtitle="Assistant IA">
      <div className="max-w-2xl mx-auto py-6 space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Assistant de texte</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Corrigez, reformulez ou simplifiez vos textes syndicaux.
            </p>
          </div>

          {/* Sélecteur de mode */}
          <div className="flex gap-2 flex-wrap">
            {MODES.map((m) => (
              <button
                key={m.value}
                onClick={() => setMode(m.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  mode === m.value
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-teal-400'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Saisissez votre texte ici (max 1000 caractères)..."
              className="w-full p-3 border border-slate-200 rounded-lg h-36 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
              disabled={isLoading}
              maxLength={1000}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">{input.length}/1000</span>
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Traitement...' : 'Envoyer'}
              </button>
            </div>
          </form>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {output && (
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 space-y-2">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-semibold text-slate-700">Résultat :</h2>
                <button
                  onClick={() => navigator.clipboard.writeText(output)}
                  className="text-xs text-slate-400 hover:text-teal-600 transition-colors"
                >
                  📋 Copier
                </button>
              </div>
              <p className="whitespace-pre-wrap text-sm text-slate-800">{output}</p>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
