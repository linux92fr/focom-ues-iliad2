// ─── Données statiques & helpers pour la page Elections ──────────────────────
import type {
  Candidat,
  FoVoix,
  SyndicatResult,
  RetroStep,
  RetroType,
  FoContact,
} from './elections.types';

// ── Couleurs officielles des organisations syndicales ──
export const SYNDICAT_COLORS: Record<string, string> = {
  FO: '#D10A11',
  CFDT: '#005BAC',
  'CFE-CGC': '#003E7E',
  CFTC: '#0093D0',
  CGT: '#E30613',
  SUD: '#F39200',
  UNSA: '#EC6608',
};

// ── Candidats 2e tour — Employés / Techniciens / Non-Cadres ──
export const CANDIDATS_T2_TITULAIRES: Candidat[] = [
  { name: 'À compléter', role: 'Technicien' },
];

export const CANDIDATS_T2_SUPPLEANTS: Candidat[] = [
  { name: 'À compléter', role: 'Technicien' },
];

// ── Résultats 1er tour — Collège Employés ──
export const RESULTATS_EMPLOYES_T1: SyndicatResult[] = [
  {
    nom: 'FO',
    couleur: SYNDICAT_COLORS.FO,
    titulaires: { signatures: 358, pct: 35.10, sieges: 0 },
    suppleants: { signatures: 352, pct: 34.65, sieges: 0 },
  },
  {
    nom: 'CFDT',
    couleur: SYNDICAT_COLORS.CFDT,
    titulaires: { signatures: 250, pct: 24.51, sieges: 0 },
    suppleants: { signatures: 248, pct: 24.41, sieges: 0 },
  },
  {
    nom: 'CGT',
    couleur: SYNDICAT_COLORS.CGT,
    titulaires: { signatures: 210, pct: 20.59, sieges: 0 },
    suppleants: { signatures: 208, pct: 20.47, sieges: 0 },
  },
  {
    nom: 'SUD',
    couleur: SYNDICAT_COLORS.SUD,
    titulaires: { signatures: 120, pct: 11.76, sieges: 0 },
    suppleants: { signatures: 122, pct: 12.01, sieges: 0 },
  },
  {
    nom: 'UNSA',
    couleur: SYNDICAT_COLORS.UNSA,
    titulaires: { signatures: 82, pct: 8.04, sieges: 0 },
    suppleants: { signatures: 86, pct: 8.46, sieges: 0 },
  },
];

// ── Résultats 1er tour — Collège Cadres ──
export const RESULTATS_CADRES_T1: SyndicatResult[] = [
  {
    nom: 'CFE-CGC',
    couleur: SYNDICAT_COLORS['CFE-CGC'],
    titulaires: { signatures: 410, pct: 33.55, sieges: 5 },
    suppleants: { signatures: 405, pct: 33.22, sieges: 5 },
  },
  {
    nom: 'CFDT',
    couleur: SYNDICAT_COLORS.CFDT,
    titulaires: { signatures: 305, pct: 24.96, sieges: 3 },
    suppleants: { signatures: 310, pct: 25.43, sieges: 3 },
  },
  {
    nom: 'FO',
    couleur: SYNDICAT_COLORS.FO,
    titulaires: { signatures: 252, pct: 20.62, sieges: 3 },
    suppleants: { signatures: 238, pct: 19.52, sieges: 3 },
  },
  {
    nom: 'CGT',
    couleur: SYNDICAT_COLORS.CGT,
    titulaires: { signatures: 150, pct: 12.27, sieges: 1 },
    suppleants: { signatures: 148, pct: 12.14, sieges: 1 },
  },
  {
    nom: 'SUD',
    couleur: SYNDICAT_COLORS.SUD,
    titulaires: { signatures: 105, pct: 8.59, sieges: 1 },
    suppleants: { signatures: 118, pct: 9.68, sieges: 1 },
  },
];

// ── Détail voix FO — Collège Employés (1er tour) ──
export const FO_TITULAIRES_EMP: FoVoix[] = [
  { nom: 'Candidat·e 1', voix: 0 },
];
export const FO_SUPPLEANTS_EMP: FoVoix[] = [
  { nom: 'Candidat·e 1', voix: 0 },
];

// ── Détail voix FO — Collège Cadres (1er tour) ──
export const FO_TITULAIRES_CAD: FoVoix[] = [
  { nom: 'Candidat·e 1', voix: 0, elu: true },
  { nom: 'Candidat·e 2', voix: 0, elu: true },
  { nom: 'Candidat·e 3', voix: 0, elu: true },
];
export const FO_SUPPLEANTS_CAD: FoVoix[] = [
  { nom: 'Candidat·e 1', voix: 0, elu: true },
  { nom: 'Candidat·e 2', voix: 0, elu: true },
  { nom: 'Candidat·e 3', voix: 0, elu: true },
];

// ── Rétro-planning officiel ──
export const RETROPLANNING: RetroStep[] = [
  { date: '11/03/2026', label: 'Signature du Protocole d\'Accord Préélectoral (PAP)', type: 'info' },
  { date: '14/04/2026', label: 'Ouverture du 1er tour — Vote électronique', type: 'vote' },
  { date: '21/04/2026', label: 'Clôture du 1er tour', type: 'vote' },
  { date: '21/04/2026', label: 'Résultats 1er tour — Cadres définitifs, Employés 2e tour requis', type: 'resultat' },
  { date: '23/04/2026', label: 'Date limite de dépôt des candidatures (2e tour) — 12h00', type: 'candidature' },
  { date: '29/04/2026', label: 'Ouverture du 2e tour — 10h00', type: 'vote' },
  { date: '06/05/2026', label: 'Clôture du 2e tour — 14h00', type: 'vote' },
  { date: '06/05/2026', label: 'Résultats 2e tour — 14h05', type: 'resultat' },
];

// ── Engagements FO ──
export const FO_ENGAGEMENTS: string[] = [
  'Défendre vos droits individuels et collectifs avec détermination',
  'Négocier les meilleurs accords pour améliorer vos conditions de travail',
  'Informer régulièrement et transparentement tous les salariés',
  'Agir concrètement contre toute forme de discrimination',
  'Accompagner chacun(e) dans ses démarches professionnelles',
  'Mobiliser quand la situation l\'exige — pétitions, grèves, actions',
];

// ── Contacts FO COM UES Iliad ──
export const FO_CONTACTS: FoContact[] = [
  { nom: 'Délégué Syndical Central', tel: '01 00 00 00 00', email: 'contact@focomues-iliad.fr' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

/** Retourne true si la date au format "dd/mm/yyyy" est passée. */
export const dateIsPast = (dateStr: string): boolean => {
  const parts = dateStr.split('/');
  if (parts.length !== 3) return false;
  const [day, month, year] = parts.map(Number);
  return new Date(year, month - 1, day) < new Date();
};

// ── Rétro-planning : style / label par type ──
export const retroTypeStyle = (type: RetroType): string => {
  switch (type) {
    case 'info':
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800/40';
    case 'candidature':
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800/40';
    case 'vote':
      return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800/40';
    case 'resultat':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800/40';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

export const retroTypeLabel = (type: RetroType): string => {
  switch (type) {
    case 'info':
      return 'Info';
    case 'candidature':
      return 'Candidature';
    case 'vote':
      return 'Vote';
    case 'resultat':
      return 'Résultat';
    default:
      return type;
  }
};

// ── Événements Supabase : couleur / label par type ──
export const eventTypeColor = (type: string): string => {
  switch (type) {
    case 'depot_candidature':
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400';
    case 'vote':
    case 'vote_t1':
    case 'vote_t2':
      return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400';
    case 'resultat':
    case 'resultats':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400';
    case 'info':
    default:
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400';
  }
};

export const eventTypeLabel = (type: string): string => {
  switch (type) {
    case 'depot_candidature':
      return 'Dépôt candidature';
    case 'vote':
      return 'Vote';
    case 'vote_t1':
      return 'Vote 1er tour';
    case 'vote_t2':
      return 'Vote 2e tour';
    case 'resultat':
    case 'resultats':
      return 'Résultats';
    case 'info':
      return 'Info';
    default:
      return type;
  }
};

// ── Documents Supabase : couleur / label par type ──
export const documentTypeColor = (type: string): string => {
  switch (type) {
    case 'profession_de_foi':
      return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400';
    case 'tract':
      return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400';
    case 'autre':
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

export const documentTypeLabel = (type: string): string => {
  switch (type) {
    case 'profession_de_foi':
      return 'Profession de foi';
    case 'tract':
      return 'Tract';
    case 'autre':
      return 'Autre';
    default:
      return type;
  }
};
