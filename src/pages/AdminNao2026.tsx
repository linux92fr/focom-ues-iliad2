import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp, Clock, Users, Scale, Download, RefreshCw, Star, PieChart
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════════════════════════
//  Configuration & Types
// ═══════════════════════════════════════════════════════════════════════════════

const COMPANY_SIZE = 4886; // Nombre total de salariés

interface Response {
  id: string;
  created_at: string;
  categorie: string;
  anciennete: string;
  site: string;
  salaires_priorite: string;
  temps_priorite: string;
  social_priorite: string;
  egalite_priorite: string;
  salaires_commentaire: string;
  temps_commentaire: string;
  social_commentaire: string;
  egalite_commentaire: string;
  top3: string[];
  situation_personnelle: string;
  message_deleguees: string;
  satisfaction_globale: number;
}

const REVENDICATIONS_LABELS: Record<string, string> = {
  aug25:    'Augmentation collective +2,5 %',
  smic:     'Indexation automatique sur le SMIC',
  transp:   'Transparence des fiches de paie',
  ppv:      'Prime de partage de la valeur',
  subro:    'Subrogation & suppression délai de carence',
  fh:       'Rattrapage salarial Femmes-Hommes',
  reclass:  'Reclassification seuil D → Agent de Maîtrise',
  medaille: 'Médaille du travail à la retraite',
  trajet:   'Temps de trajet = temps de travail',
  tps_trav: 'Ouverture négociation temps de travail',
  ia:       'Accord IA & Digitalisation',
  tr:       'Ticket-restaurant à 12,50 €',
  qvct:     'Budget convivialité QVCT 200 €',
  tele:     'Indemnité télétravail 59 €/mois',
  oeuvres:  'Budget œuvres sociales à 1 %',
  voiture:  'Véhicules de fonction',
};

// ── Helpers ────────────────────────────────────────────────────────────────
function countBy<T>(arr: T[], key: (item: T) => string) {
  return arr.reduce((acc, item) => {
    const k = key(item) || 'Non renseigné';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

// Calcul du pourcentage basé sur le total choisi
function calculatePct(count: number, total: number) {
  return total === 0 ? 0 : Math.round((count / total) * 100);
}

function Bar({ value, total, color = '#C0392B' }: { value: number; total: number; color?: string }) {
  const percentage = calculatePct(value, total);
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, background: color }}
        />
      </div>
      <div className="flex flex-col items-end w-20">
        <span className="text-xs font-black" style={{ color }}>{value} voix</span>
        <span className="text-[10px] text-muted-foreground">{percentage}%</span>
      </div>
    </div>
  );
}

export default function AdminNao2026() {
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'synthese' | 'commentaires' | 'raw'>('synthese');
  
  // État pour basculer entre % répondants et % population totale
  const [viewMode, setViewMode] = useState<'respondents' | 'company'>('respondents');

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('nao_2026_responses')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setResponses(data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const totalRespondents = responses.length;
  const currentTotal = viewMode === 'respondents' ? totalRespondents : COMPANY_SIZE;

  // ── Calculs Top 3 ──
  const top3Count: Record<string, number> = {};
  responses.forEach(r => {
    (r.top3 || []).forEach(id => {
      top3Count[id] = (top3Count[id] || 0) + 1;
    });
  });
  const top3Sorted = Object.entries(top3Count).sort((a, b) => b[1] - a[1]);

  const avgSatisfaction = responses.length 
    ? (responses.reduce((a, b) => a + (b.satisfaction_globale || 0), 0) / responses.length).toFixed(1)
    : '—';

  const exportCSV = () => {
    const headers = ['Date', 'Catégorie', 'Ancienneté', 'Site', 'Salaires', 'Temps', 'Social', 'Égalité', 'Top3', 'Satisfaction'];
    const rows = responses.map(r => [
      new Date(r.created_at).toLocaleDateString('fr-FR'),
      r.categorie, r.anciennete, r.site,
      r.salaires_priorite, r.temps_priorite, r.social_priorite, r.egalite_priorite,
      (r.top3 || []).join(' | '),
      r.satisfaction_globale,
    ]);
    const csv = [headers, ...rows].map(row => row.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'nao2026_reponses.csv'; a.click();
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>
  );

  return (
    <div className="p-4 lg:p-8">

      <main className="container mx-auto px-4 py-24 max-w-5xl">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-foreground">Résultats NAO 2026</h1>
            <p className="text-muted-foreground mt-1">
              {totalRespondents} réponse{totalRespondents > 1 ? 's' : ''} sur {COMPANY_SIZE} salariés
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchData}>
              <RefreshCw className="w-4 h-4 mr-2" />Actualiser
            </Button>
            <Button size="sm" onClick={exportCSV}>
              <Download className="w-4 h-4 mr-2" />Export CSV
            </Button>
          </div>
        </div>

        {/* ── KPIs ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Taux participation', value: `${calculatePct(totalRespondents, COMPANY_SIZE)}%`, icon: Users, color: '#C0392B' },
            { label: 'Satisfaction moy.', value: `${avgSatisfaction}/5`, icon: Star, color: '#F5A623' },
            { label: 'Avec commentaires', value: responses.filter(r => r.salaires_commentaire || r.temps_commentaire || r.social_commentaire || r.egalite_commentaire).length, icon: TrendingUp, color: '#003189' },
            { label: 'Messages délégués', value: responses.filter(r => r.message_deleguees).length, icon: Scale, color: '#2E7D32' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: color + '20' }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <div className="text-2xl font-black text-foreground">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>

        {/* ── Toggle Mode de Vue ── */}
        <div className="flex items-center justify-end gap-3 mb-6">
          <span className="text-xs font-bold text-muted-foreground uppercase">Base de calcul :</span>
          <div className="flex bg-muted p-1 rounded-lg">
            <button 
              onClick={() => setViewMode('respondents')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === 'respondents' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground'}`}
            >
              % Répondants
            </button>
            <button 
              onClick={() => setViewMode('company')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === 'company' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground'}`}
            >
              % Entreprise ({COMPANY_SIZE})
            </button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-2 mb-6 border-b border-border">
          {(['synthese', 'commentaires', 'raw'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-semibold capitalize border-b-2 transition-all -mb-px ${
                tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}>
              {t === 'synthese' ? 'Synthèse' : t === 'commentaires' ? 'Commentaires' : 'Données brutes'}
            </button>
          ))}
        </div>

        {/* ════════ SYNTHÈSE ════════ */}
        {tab === 'synthese' && (
          <div className="space-y-8">

            {/* Top 3 revendications */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Top revendications plébiscitées
                </h2>
                <Badge variant="outline" className="text-[10px]">Taux : {calculatePct(totalRespondents, COMPANY_SIZE)}%</Badge>
              </div>
              <div className="space-y-3">
                {top3Sorted.map(([id, count], i) => (
                  <div key={id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium flex items-center gap-2">
                        {i < 3 && <span className="text-xs font-black text-primary">#{i + 1}</span>}
                        {REVENDICATIONS_LABELS[id] || id}
                      </span>
                      <span className="text-muted-foreground text-xs">{calculatePct(count, currentTotal)} %</span>
                    </div>
                    <Bar value={count} total={currentTotal} color={i === 0 ? '#C0392B' : i === 1 ? '#E74C3C' : '#922B21'} />
                  </div>
                ))}
              </div>
            </div>

            {/* Priorités thématiques */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-bold mb-4">Priorités par thématique</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { key: 'salaires_priorite', label: 'Salaires & Primes', icon: TrendingUp },
                  { key: 'temps_priorite',    label: 'Temps de travail',  icon: Clock },
                  { key: 'social_priorite',   label: 'Avantages sociaux', icon: Users },
                  { key: 'egalite_priorite',  label: 'Égalité',           icon: Scale },
                ].map(({ key, label, icon: Icon }) => {
                  const counts = countBy(responses, r => (r as any)[key]);
                  return (
                    <div key={key} className="space-y-2">
                      <p className="text-sm font-bold flex items-center gap-2">
                        <Icon className="w-4 h-4 text-primary" />{label}
                      </p>
                      {['haute', 'moyenne', 'faible'].map(p => (
                        <div key={p}>
                          <div className="flex justify-between text-xs mb-0.5">
                            <span className="capitalize text-muted-foreground">{p}</span>
                            <span>{counts[p] || 0} voix</span>
                          </div>
                          <Bar
                            value={counts[p] || 0} total={currentTotal}
                            color={p === 'haute' ? '#22C55E' : p === 'moyenne' ? '#F59E0B' : '#94A3B8'}
                          />
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Profil répondants */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-bold mb-4">Représentativité du profil</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { label: 'Catégorie', key: 'categorie' },
                  { label: 'Ancienneté', key: 'anciennete' },
                  { label: 'Site', key: 'site' },
                ].map(({ label, key }) => {
                  const counts = countBy(responses, r => (r as any)[key]);
                  return (
                    <div key={key}>
                      <p className="text-sm font-bold mb-2">{label}</p>
                      <div className="space-y-2">
                        {Object.entries(counts).map(([val, count]) => (
                          <div key={val}>
                            <div className="flex justify-between text-xs mb-0.5">
                              <span className="text-muted-foreground">{val}</span>
                              <span>{calculatePct(count, currentTotal)} %</span>
                            </div>
                            <Bar value={count} total={currentTotal} color="#003189" />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ════════ COMMENTAIRES ════════ */}
        {tab === 'commentaires' && (
          <div className="space-y-4">
            {responses.filter(r => r.situation_personnelle || r.message_deleguees).map(r => (
              <div key={r.id} className="rounded-2xl border border-border bg-card p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{new Date(r.created_at).toLocaleDateString('fr-FR')}</span>
                  <span>·</span><span>{r.categorie}</span>
                  <span>·</span><span>{r.site}</span>
                  {r.satisfaction_globale && (
                    <span className="ml-auto flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {r.satisfaction_globale}/5
                    </span>
                  )}
                </div>
                {r.situation_personnelle && (
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Situation personnelle</p>
                    <p className="text-sm text-foreground leading-relaxed">{r.situation_personnelle}</p>
                  </div>
                )}
                {r.message_deleguees && (
                  <div>
                    <p className="text-xs font-bold text-primary uppercase mb-1">Message aux délégués</p>
                    <p className="text-sm text-foreground leading-relaxed border-l-2 border-primary pl-3">{r.message_deleguees}</p>
                  </div>
                )}
              </div>
            ))}
            {responses.filter(r => r.situation_personnelle || r.message_deleguees).length === 0 && (
              <p className="text-center text-muted-foreground py-12">Aucun commentaire pour le moment.</p>
            )}
          </div>
        )}

        {/* ════════ DONNÉES BRUTES ════════ */}
        {tab === 'raw' && (
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-xs">
              <thead className="bg-muted">
                <tr>
                  {['Date', 'Catégorie', 'Ancienneté', 'Site', 'Salaires', 'Temps', 'Social', 'Égalité', 'Top 3', 'Satisfaction'].map(h => (
                    <th key={h} className="px-3 py-2 text-left font-bold text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {responses.map((r, i) => (
                  <tr key={r.id} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                    <td className="px-3 py-2">{new Date(r.created_at).toLocaleDateString('fr-FR')}</td>
                    <td className="px-3 py-2">{r.categorie}</td>
                    <td className="px-3 py-2">{r.anciennete}</td>
                    <td className="px-3 py-2">{r.site}</td>
                    <td className="px-3 py-2">{r.salaires_priorite}</td>
                    <td className="px-3 py-2">{r.temps_priorite}</td>
                    <td className="px-3 py-2">{r.social_priorite}</td>
                    <td className="px-3 py-2">{r.egalite_priorite}</td>
                    <td className="px-3 py-2">{(r.top3 || []).map(id => REVENDICATIONS_LABELS[id] || id).join(', ')}</td>
                    <td className="px-3 py-2">{r.satisfaction_globale ? `${r.satisfaction_globale}/5` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </main>

    </div>
  );
}
