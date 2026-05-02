import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Megaphone, TrendingUp, Clock, Users, Scale,
  CheckCircle2, ChevronRight, ChevronLeft, Send,
  Star, MessageSquare, ThumbsUp, ThumbsDown, Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import logoFocom from '@/assets/jolly-roger.png';
import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════════════════════════
//  Types & données
// ═══════════════════════════════════════════════════════════════════════════════

type Priorite = 'haute' | 'moyenne' | 'faible' | null;

interface ReponseTheme {
  priorite: Priorite;
  commentaire: string;
  typeAugmentation?: 'pourcentage' | 'euros' | 'indifferent' | null;
}

interface FormData {
  // Étape 1 — Profil
  categorie: string;
  anciennete: string;
  site: string;

  // Étape 2 — Priorités thématiques
  themes: {
    salaires: ReponseTheme;
    temps:    ReponseTheme;
    social:   ReponseTheme;
    egalite:  ReponseTheme;
  };

  // Étape 3 — Revendications clés
  top5: string[];

  // Étape 4 — Expression libre
  situationPersonnelle: string;
  messageDeleguees: string;
  satisfactionGlobale: number | null;
}

const CATEGORIES =[
  { value: 'employe', label: 'Employé(e)' },
  { value: 'technicien', label: 'Technicien(ne)' },
  { value: 'cadre', label: 'Cadre' },
];

const ANCIENNETES =[
  { value: 'moins2', label: 'Moins de 2 ans' },
  { value: '2_5', label: '2 à 5 ans' },
  { value: '5_10', label: '5 à 10 ans' },
  { value: '10_20', label: '10 à 20 ans' },
  { value: 'plus20', label: 'Plus de 20 ans' },
];

const SITES =[
  { value: 'paris', label: 'Paris / Île-de-France' },
  { value: 'province', label: 'Province' },
  { value: 'itinerant', label: 'Itinérant(e)' },
  { value: 'teletravail', label: 'Principalement en télétravail' },
];

const THEMES =[
  {
    key: 'salaires' as const,
    label: 'Salaires & Primes',
    color: 'emerald',
    icon: TrendingUp,
    description: 'Augmentation collective, indexation SMIC, prime de partage, subrogation, transparence paie',
  },
  {
    key: 'temps' as const,
    label: 'Temps de travail',
    color: 'blue',
    icon: Clock,
    description: 'Temps de trajet, accord temps de travail, digitalisation & IA',
  },
  {
    key: 'social' as const,
    label: 'Avantages sociaux',
    color: 'orange',
    icon: Users,
    description: 'Ticket-restaurant, télétravail, QVCT, œuvres sociales, véhicules',
  },
  {
    key: 'egalite' as const,
    label: 'Égalité & Reconnaissance',
    color: 'purple',
    icon: Scale,
    description: 'Égalité F/H, reclassification seuil D, médaille du travail',
  },
];

const REVENDICATIONS_COURTES =[
  { id: 'aug25',     label: 'Augmentation collective +2,5 %',           categorie: 'emerald' },
  { id: 'smic',      label: 'Indexation automatique sur le SMIC',        categorie: 'emerald' },
  { id: 'transp',    label: 'Transparence des fiches de paie',           categorie: 'emerald' },
  { id: 'ppv',       label: 'Prime de partage de la valeur',             categorie: 'emerald' },
  { id: 'subro',     label: 'Subrogation & suppression délai de carence',categorie: 'emerald' },
  { id: 'fh',        label: 'Rattrapage salarial Femmes-Hommes',         categorie: 'purple'  },
  { id: 'reclass',   label: 'Reclassification seuil D → Agent de Maîtrise', categorie: 'purple' },
  { id: 'medaille',  label: 'Médaille du travail à la retraite',         categorie: 'purple'  },
  { id: 'trajet',    label: 'Temps de trajet = temps de travail',        categorie: 'blue'    },
  { id: 'tps_trav',  label: 'Ouverture négociation temps de travail',    categorie: 'blue'    },
  { id: 'ia',        label: 'Accord IA & Digitalisation',                categorie: 'blue'    },
  { id: 'tr',        label: 'Ticket-restaurant à 12,50 €',               categorie: 'orange'  },
  { id: 'qvct',      label: 'Budget convivialité QVCT 200 €',            categorie: 'orange'  },
  { id: 'tele',      label: 'Indemnité télétravail 59 €/mois',           categorie: 'orange'  },
  { id: 'oeuvres',   label: 'Budget œuvres sociales à 1 %',              categorie: 'orange'  },
  { id: 'voiture',   label: 'Véhicules de fonction',                     categorie: 'orange'  },
];

const COLOR_MAP: Record<string, { bg: string; light: string; border: string; text: string; badge: string }> = {
  emerald: {
    bg: 'bg-emerald-500', light: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-300 dark:border-emerald-700', text: 'text-emerald-700 dark:text-emerald-400',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
  },
  blue: {
    bg: 'bg-blue-500', light: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-300 dark:border-blue-700', text: 'text-blue-700 dark:text-blue-400',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  },
  orange: {
    bg: 'bg-orange-500', light: 'bg-orange-50 dark:bg-orange-950/30',
    border: 'border-orange-300 dark:border-orange-700', text: 'text-orange-700 dark:text-orange-400',
    badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
  },
  purple: {
    bg: 'bg-purple-500', light: 'bg-purple-50 dark:bg-purple-950/30',
    border: 'border-purple-300 dark:border-purple-700', text: 'text-purple-700 dark:text-purple-400',
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
//  Sous-composants
// ═══════════════════════════════════════════════════════════════════════════════

const PrioriteBtn = ({
  value, current, onChange,
}: { value: Priorite; current: Priorite; onChange: (v: Priorite) => void }) => {
  const configs = {
    haute:  { label: 'Priorité haute',  icon: ThumbsUp,   active: 'bg-emerald-500 text-white border-emerald-500' },
    moyenne:{ label: 'Neutre',          icon: Minus,      active: 'bg-amber-400 text-white border-amber-400'    },
    faible: { label: 'Moins urgent',    icon: ThumbsDown, active: 'bg-slate-400 text-white border-slate-400'    },
  } as const;

  if (!value) return null;
  const cfg = configs[value];
  const Icon = cfg.icon;
  const isActive = current === value;

  return (
    <button
      type="button"
      onClick={() => onChange(isActive ? null : value)}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 text-xs font-semibold transition-all duration-150',
        isActive ? cfg.active : 'border-border bg-background text-muted-foreground hover:border-primary/40',
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </button>
  );
};

const SelectionPuce = ({
  value, label, selected, onClick, color = 'primary',
}: { value: string; label: string; selected: boolean; onClick: () => void; color?: string }) => {
  const c = COLOR_MAP[color] ?? {};
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-xs font-medium transition-all duration-150 text-left',
        selected
          ? cn('border-primary bg-primary text-primary-foreground')
          : 'border-border bg-background text-foreground hover:border-primary/40',
      )}
    >
      <span className={cn(
        'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
        selected ? 'border-white bg-white' : 'border-muted-foreground',
      )}>
        {selected && <span className="w-2 h-2 rounded-full bg-primary" />}
      </span>
      {label}
    </button>
  );
};

const EtoileNote = ({ value, onChange }: { value: number | null; onChange: (v: number) => void }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(n => (
      <button
        key={n}
        type="button"
        onClick={() => onChange(n)}
        className="transition-transform hover:scale-110"
      >
        <Star
          className={cn(
            'w-8 h-8 transition-colors',
            value !== null && n <= value
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-muted-foreground/30 fill-none',
          )}
        />
      </button>
    ))}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
//  Étapes
// ═══════════════════════════════════════════════════════════════════════════════

const ETAPES =[
  { num: 1, label: 'Votre profil' },
  { num: 2, label: 'Thématiques' },
  { num: 3, label: 'Top 5' },
  { num: 4, label: 'Expression libre' },
];

// ═══════════════════════════════════════════════════════════════════════════════
//  Page principale
// ═══════════════════════════════════════════════════════════════════════════════

const FormulaireNao2026 = () => {
  const[etape, setEtape] = useState(1);
  const [envoye, setEnvoye] = useState(false);

  const [form, setForm] = useState<FormData>({
    categorie: '',
    anciennete: '',
    site: '',
    themes: {
      salaires: { priorite: null, commentaire: '' },
      temps:    { priorite: null, commentaire: '' },
      social:   { priorite: null, commentaire: '' },
      egalite:  { priorite: null, commentaire: '' },
    },
    top5:[],
    situationPersonnelle: '',
    messageDeleguees: '',
    satisfactionGlobale: null,
  });

  // ── Helpers ────────────────────────────────────────────────────────────────

  const setTheme = (key: keyof FormData['themes'], field: keyof ReponseTheme, value: unknown) => {
    setForm(f => ({
      ...f,
      themes: { ...f.themes, [key]: { ...f.themes[key], [field]: value } },
    }));
  };

  const toggleTop5 = (id: string) => {
    setForm(f => {
      if (f.top5.includes(id)) return { ...f, top5: f.top5.filter(x => x !== id) };
      if (f.top5.length >= 5) return f; // max 5
      return { ...f, top5:[...f.top5, id] };
    });
  };

  const etape1Valide = form.categorie && form.anciennete && form.site;
  const etape3Valide = form.top5.length === 5;

  const handleSoumettre = async () => {
    try {
      const dataToInsert = {
        categorie: form.categorie,
        anciennete: form.anciennete,
        site: form.site,
        salaires_priorite: form.themes.salaires.priorite,
        salaires_commentaire: form.themes.salaires.commentaire,
        temps_priorite: form.themes.temps.priorite,
        temps_commentaire: form.themes.temps.commentaire,
        social_priorite: form.themes.social.priorite,
        social_commentaire: form.themes.social.commentaire,
        egalite_priorite: form.themes.egalite.priorite,
        egalite_commentaire: form.themes.egalite.commentaire,
        top5: form.top5,
        situation_personnelle: form.situationPersonnelle,
        message_deleguees: form.messageDeleguees,
        satisfaction_globale: form.satisfactionGlobale,
        salaires_type_augmentation: form.themes.salaires.typeAugmentation,
      };

      // ✅ CORRECTION : On a supprimé le .select()
      // On ne demande plus à Supabase de nous renvoyer la donnée, on lui demande juste de l'enregistrer.
      const { error } = await supabase
        .from('nao_2026_responses')
        .insert([dataToInsert]);

      if (error) throw error;

      // Si on arrive ici, c'est que l'insertion a réussi !
      setEnvoye(true);

    } catch (error) {
      console.error('Erreur lors de l\'envoi :', error);
      alert("Une erreur est survenue lors de l'envoi. Veuillez réessayer.");
    }
  };      

  // ── Rendu confirmation ─────────────────────────────────────────────────────

  if (envoye) {
    return (
      <div className="p-4 lg:p-8">
        <main className="container mx-auto px-4 py-24">
          <div className="max-w-lg mx-auto text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-foreground mb-2">Merci pour votre contribution !</h1>
              <p className="text-muted-foreground leading-relaxed">
                Votre avis a bien été transmis à la délégation FOCOM UES ILIAD.
                Il sera pris en compte dans la préparation des négociations NAO 2026.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-muted/30 p-5 text-sm text-muted-foreground leading-relaxed text-left space-y-1">
              <p className="font-semibold text-foreground">Ce que nous en ferons :</p>
              <p>• Synthèse anonymisée de tous les retours</p>
              <p>• Hiérarchisation des priorités collectives</p>
              <p>• Présentation à l'ouverture des négociations</p>
            </div>
            <Button asChild variant="outline">
              <Link to="/nao2026">← Retour aux revendications NAO 2026</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // ── Rendu principal ────────────────────────────────────────────────────────

  return (
    <div className="p-4 lg:p-8">

      <main className="container mx-auto px-4 py-24">
        <div className="max-w-2xl mx-auto space-y-8">

          {/* ── Hero ─────────────────────────────────────────────────────── */}
          <div className="relative overflow-hidden rounded-3xl bg-primary px-7 py-10 text-primary-foreground">
            <div className="absolute inset-0 opacity-10 pointer-events-none" aria-hidden>
              <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full bg-white" />
              <div className="absolute -bottom-12 -left-8 w-72 h-72 rounded-full bg-white" />
            </div>
            <div className="relative z-10 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <img src={logoFocom} alt="Logo FOCOM" className="h-8 w-auto brightness-0 invert" />
                <Badge className="bg-white/20 text-white border-0 text-xs font-bold gap-1.5">
                  <Megaphone className="w-3 h-3" />NAO 2026
                </Badge>
                <Badge className="bg-yellow-400 text-yellow-900 border-0 text-xs font-bold">FOCOM</Badge>
              </div>
              <h1 className="text-3xl font-black leading-tight">
                Donnez votre avis<br />
                <span className="text-yellow-300">sur la NAO 2026</span>
              </h1>
              <p className="text-primary-foreground/80 text-sm leading-relaxed max-w-md">
                Vos réponses sont <strong className="text-white">anonymes</strong> et serviront directement
                à prioriser nos revendications en négociation. Comptez environ <strong className="text-white">2-3 minutes</strong>.
              </p>
              {/* Snapshot évolutif */}
              <div className="flex items-start gap-2 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-3 max-w-md">
                <span className="text-yellow-300 text-base leading-none mt-0.5 shrink-0">📸</span>
                <p className="text-xs text-primary-foreground/75 leading-relaxed">
                  <strong className="text-white">Snapshot des négociations en cours</strong> — Les propositions listées ici
                  ne sont pas exhaustives et peuvent évoluer à l'issue de chaque séance.
                  Votre avis reste précieux à tout moment du processus : ce formulaire sera actualisé en conséquence.
                </p>
              </div>
            </div>
          </div>

          {/* ── Barre de progression ─────────────────────────────────────── */}
          <div className="space-y-3">
            <div className="flex justify-between">
              {ETAPES.map(e => (
                <div key={e.num} className="flex flex-col items-center gap-1 flex-1">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all',
                    etape > e.num  ? 'bg-primary border-primary text-primary-foreground' :
                    etape === e.num ? 'bg-primary/10 border-primary text-primary' :
                    'bg-muted border-border text-muted-foreground',
                  )}>
                    {etape > e.num ? <CheckCircle2 className="w-4 h-4" /> : e.num}
                  </div>
                  <span className={cn(
                    'text-[10px] font-medium text-center leading-tight hidden sm:block',
                    etape === e.num ? 'text-primary' : 'text-muted-foreground',
                  )}>{e.label}</span>
                </div>
              ))}
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${((etape - 1) / (ETAPES.length - 1)) * 100}%` }}
              />
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════
              ÉTAPE 1 — Profil
          ════════════════════════════════════════════════════════════════ */}
          {etape === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">Votre profil</h2>
                <p className="text-sm text-muted-foreground">Ces informations sont anonymes et permettent d'analyser les résultats par catégorie.</p>
              </div>

              {/* Catégorie */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Votre catégorie professionnelle</label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, categorie: c.value }))}
                      className={cn(
                        'px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all',
                        form.categorie === c.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background text-foreground hover:border-primary/40',
                      )}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ancienneté */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Votre ancienneté dans le Groupe</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ANCIENNETES.map(a => (
                    <button
                      key={a.value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, anciennete: a.value }))}
                      className={cn(
                        'px-3 py-2.5 rounded-xl border-2 text-xs font-medium transition-all',
                        form.anciennete === a.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background text-foreground hover:border-primary/40',
                      )}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Site */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Votre situation géographique</label>
                <div className="grid grid-cols-2 gap-2">
                  {SITES.map(s => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, site: s.value }))}
                      className={cn(
                        'px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all',
                        form.site === s.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background text-foreground hover:border-primary/40',
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground flex items-start gap-1 pt-1">
                  <span className="shrink-0">💡</span>
                  Si vous êtes itinérant(e) en Île-de-France, sélectionnez <strong className="text-foreground mx-1">Paris / Île-de-France</strong>.
                </p>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              ÉTAPE 2 — Thématiques
          ════════════════════════════════════════════════════════════════ */}
          {etape === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">Les grandes thématiques</h2>
                <p className="text-sm text-muted-foreground">Pour chaque thème, indiquez son niveau de priorité à vos yeux et ajoutez un commentaire si vous le souhaitez.</p>
              </div>

              {THEMES.map(theme => {
                const c = COLOR_MAP[theme.color];
                const Icon = theme.icon;
                const rep = form.themes[theme.key];
                return (
                  <div key={theme.key} className={cn('rounded-2xl border-2 p-5 space-y-3', c.light, c.border)}>
                    <div className="flex items-center gap-3">
                      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', c.bg)}>
                        <Icon className="w-4.5 h-4.5 text-white" />
                      </div>
                      <div>
                        <p className={cn('font-bold text-sm', c.text)}>{theme.label}</p>
                        <p className="text-xs text-muted-foreground leading-snug">{theme.description}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {(['haute', 'moyenne', 'faible'] as Priorite[]).map(p => (
                        <PrioriteBtn
                          key={p}
                          value={p}
                          current={rep.priorite}
                          onChange={v => setTheme(theme.key, 'priorite', v)}
                        />
                      ))}
                    </div>

                    {theme.key === 'salaires' && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground">
                          Préférez-vous une augmentation exprimée en…
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { value: 'pourcentage', label: '% (ex : +2,5 %)' },
                            { value: 'euros',       label: '€ (ex : +60 €/mois)' },
                            { value: 'indifferent', label: 'Peu importe' },
                          ].map(opt => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setTheme('salaires', 'typeAugmentation', 
                                form.themes.salaires.typeAugmentation === opt.value ? null : opt.value
                              )}
                              className={cn(
                                'px-3 py-1.5 rounded-lg border-2 text-xs font-semibold transition-all',
                                form.themes.salaires.typeAugmentation === opt.value
                                  ? 'border-emerald-500 bg-emerald-500 text-white'
                                  : 'border-border bg-background text-muted-foreground hover:border-emerald-400/50',
                              )}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <textarea
                      value={rep.commentaire}
                      onChange={e => setTheme(theme.key, 'commentaire', e.target.value)}
                      placeholder="Commentaire libre (facultatif)…"
                      rows={2}
                      className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              ÉTAPE 3 — Top 5
          ════════════════════════════════════════════════════════════════ */}
          {etape === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">Vos 5 revendications prioritaires</h2>
                <p className="text-sm text-muted-foreground">
                  Parmi les 16 revendications FOCOM, choisissez les <strong>5 qui vous semblent les plus urgentes</strong> pour vous personnellement.
                  {form.top5.length > 0 && (
                    <span className="ml-2 text-primary font-semibold">{form.top5.length}/5 sélectionnée{form.top5.length > 1 ? 's' : ''}</span>
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {REVENDICATIONS_COURTES.map(r => (
                  <SelectionPuce
                    key={r.id}
                    value={r.id}
                    label={r.label}
                    selected={form.top5.includes(r.id)}
                    onClick={() => toggleTop5(r.id)}
                    color={r.categorie}
                  />
                ))}
              </div>

              {form.top5.length === 5 && (
                <div className="rounded-xl bg-primary/10 border border-primary/20 px-4 py-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <p className="text-xs text-primary font-medium">Parfait ! Vous avez sélectionné vos 5 priorités.</p>
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              ÉTAPE 4 — Expression libre
          ════════════════════════════════════════════════════════════════ */}
          {etape === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">Expression libre</h2>
                <p className="text-sm text-muted-foreground">Cette étape est entièrement facultative. Partagez ce que vous souhaitez avec vos représentants.</p>
              </div>

              {/* Situation personnelle */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  Votre situation ou ressenti (facultatif)
                </label>
                <p className="text-xs text-muted-foreground">Impact de l'inflation, charge de travail, conditions au quotidien… Partagez ce que vous vivez.</p>
                <textarea
                  value={form.situationPersonnelle}
                  onChange={e => setForm(f => ({ ...f, situationPersonnelle: e.target.value }))}
                  placeholder="Ex : Depuis 2022 mon pouvoir d'achat a baissé de manière significative, notamment à cause de…"
                  rows={4}
                  className="w-full text-sm rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>

              {/* Message aux déléguées */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-muted-foreground" />
                  Un message pour la délégation FOCOM (facultatif)
                </label>
                <p className="text-xs text-muted-foreground">Un point important à défendre, une demande spécifique, une idée…</p>
                <textarea
                  value={form.messageDeleguees}
                  onChange={e => setForm(f => ({ ...f, messageDeleguees: e.target.value }))}
                  placeholder="Ex : Il serait important que vous insistiez particulièrement sur…"
                  rows={4}
                  className="w-full text-sm rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>

              {/* Note de satisfaction */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Star className="w-4 h-4 text-muted-foreground" />
                  Satisfaction globale sur vos conditions de travail actuelles
                </label>
                <div className="flex flex-col items-start gap-2">
                  <EtoileNote
                    value={form.satisfactionGlobale}
                    onChange={v => setForm(f => ({ ...f, satisfactionGlobale: v }))}
                  />
                  {form.satisfactionGlobale && (
                    <p className="text-xs text-muted-foreground">
                      {['', 'Très insatisfait(e)', 'Insatisfait(e)', 'Neutre', 'Satisfait(e)', 'Très satisfait(e)'][form.satisfactionGlobale]}
                    </p>
                  )}
                </div>
              </div>

              {/* Récapitulatif */}
              <div className="rounded-2xl border border-border bg-muted/30 p-5 space-y-3">
                <p className="text-sm font-bold text-foreground">Récapitulatif de vos choix</p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Catégorie : <span className="text-foreground font-medium">{CATEGORIES.find(c => c.value === form.categorie)?.label ?? '—'}</span></p>
                  <p>Ancienneté : <span className="text-foreground font-medium">{ANCIENNETES.find(a => a.value === form.anciennete)?.label ?? '—'}</span></p>
                  <p>Top 5 : <span className="text-foreground font-medium">{form.top5.map(id => REVENDICATIONS_COURTES.find(r => r.id === id)?.label).join(' · ')}</span></p>
                </div>
              </div>
            </div>
          )}

          {/* ── Navigation ───────────────────────────────────────────────── */}
          <div className="flex items-center justify-between pt-2">
            {etape > 1 ? (
              <Button variant="outline" onClick={() => setEtape(e => e - 1)}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Précédent
              </Button>
            ) : (
              <Button variant="ghost" asChild>
                <Link to="/nao2026">← Retour</Link>
              </Button>
            )}

            {etape < 4 ? (
              <Button
                onClick={() => setEtape(e => e + 1)}
                disabled={etape === 1 ? !etape1Valide : etape === 3 ? !etape3Valide : false}
              >
                Suivant
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSoumettre} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Send className="w-4 h-4 mr-2" />
                Envoyer mon avis
              </Button>
            )}
          </div>

          {/* ── Disclaimer ──────────────────────────────────────────────── */}
          <p className="text-center text-xs text-muted-foreground pb-4">
            Formulaire anonyme — FOCOM UES ILIAD — NAO 2026. Aucune donnée personnelle identifiable n'est collectée.
          </p>

        </div>
      </main>

    </div>
  );
};

export default FormulaireNao2026;
