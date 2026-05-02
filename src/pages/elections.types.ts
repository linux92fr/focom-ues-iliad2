// ─── Types partagés pour la page Elections ───────────────────────────────────

export interface Candidat {
  name: string;
  photo?: string;
  role?: string;
  fonction?: string;
}

export interface FoVoix {
  nom: string;
  voix: number;
  elu?: boolean;
}

export interface SyndicatScrutin {
  signatures: number;
  pct: number;
  sieges: number;
}

export interface SyndicatResult {
  nom: string;
  couleur: string;
  titulaires?: SyndicatScrutin;
  suppleants?: SyndicatScrutin;
}

// Candidats Supabase
export interface Candidate {
  id: string;
  full_name: string;
  role?: string | null;
  college?: string | null;
  type?: string | null;
  photo_url?: string | null;
  display_order?: number | null;
}

// Evénements calendrier Supabase
export interface ElectionEvent {
  id: string;
  title: string;
  description?: string | null;
  event_date: string;
  event_type: string;
}

// Documents Supabase
export interface ElectionDocument {
  id: string;
  title: string;
  description?: string | null;
  document_type: string;
  list_name?: string | null;
  file_url: string;
  published_at: string;
}

// Participation (snapshots)
export interface ParticipationCollege {
  id?: string;
  nom: string;
  display_order: number;
  tit_inscrits?: number | null;
  tit_votants?: number | null;
  tit_taux?: number | null;
  sup_inscrits?: number | null;
  sup_votants?: number | null;
  sup_taux?: number | null;
  taux_college?: number | null;
}

export interface ParticipationSnapshot {
  id?: string;
  date: string;
  heure: string;
  taux_etablissement?: number | null;
  created_at?: string;
  participation_colleges?: ParticipationCollege[];
}

// Rétro-planning
export type RetroType = 'info' | 'candidature' | 'vote' | 'resultat';

export interface RetroStep {
  date: string;
  label: string;
  type: RetroType;
}

// Contact FO
export interface FoContact {
  nom: string;
  tel: string;
  email: string;
}
