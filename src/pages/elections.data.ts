/**
 * elections.data.ts
 * Source unique de vérité — données réelles issues des résultats officiels e-votez.net
 * Scrutin du 21/04/2026 — UES ILIAD — CSE
 */

// ─── Types exportés ───────────────────────────────────────────────────────────

export interface Candidat {
  name: string;
  photo?: string;
  role?: string; // <-- Ajout de la fonction
}

export interface CandidatFlat {
  name: string;
  photo?: string;
  role?: string; // <-- Ajout de la fonction
  titulaire: boolean;
}

export interface SyndicatScores {
  signatures: number;
  pct: number;
  sieges: number;
}

export interface SyndicatResult {
  nom: string;
  couleur: string;
  titulaires?: SyndicatScores;
  suppleants?: SyndicatScores;
}

export interface CandidatVoix {
  nom: string;
  voix: number;
  elu?: boolean;
}

export interface RetroStep {
  date: string;
  label: string;
  type: 'info' | 'candidature' | 'vote' | 'resultat';
}

// Types Supabase réexportés pour Elections.tsx
export interface Candidate {
  id: string;
  name: string;
  list_name?: string;
  college?: string;
  is_titular?: boolean;
  display_order?: number;
  photo_url?: string;
}

export interface ElectionEvent {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  event_type: string;
}

export interface ElectionDocument {
  id: string;
  title: string;
  description?: string;
  document_type: string;
  list_name?: string;
  file_url: string;
  published_at: string;
}

export interface ParticipationCollege {
  nom: string;
  display_order: number;
  taux_college?: number;
  tit_inscrits?: number;
  tit_votants?: number;
  tit_taux?: number;
  sup_inscrits?: number;
  sup_votants?: number;
  sup_taux?: number;
}

export interface ParticipationSnapshot {
  id: string;
  date: string;
  heure: string;
  taux_etablissement?: number;
  participation_colleges?: ParticipationCollege[];
}

// ─── Couleurs ─────────────────────────────────────────────────────────────────

export const SYNDICAT_COLORS: Record<string, string> = {
  FO:        '#E85D04',
  CFDT:      '#0057A8',
  'CFE-CGC': '#6B21A8',
  CFTC:      '#15803D',
  CGT:       '#B91C1C',
  SUD:       '#BE185D',
  UNSA:      '#0369A1',
};

export const PRINT_COLORS = {
  red:   '#C8102E',
  dark:  '#1a1a2e',
  smoke: '#F5F5F5',
  mid:   '#555555',
};

// ─── Candidats 2ème tour — Employés / Techniciens / Non-Cadres ────────────────
// Liste FO — avec ajout des fonctions (role)

export const CANDIDATS_T2_TITULAIRES: Candidat[] = [
  { name: "N'deye Yacine SIDIBE",   photo: '/candidats/nysidibe.jpg',  role: 'Support Administratif - Free Réseau' },
  { name: 'Fabien RACAULT',          photo: '/candidats/fracault.png',  role: 'Technicien Fibre - XMI - Free Réseau' },
  { name: 'Awa BA DIALLO',           photo: '/candidats/adiallo.png',   role: 'Recouvrement - Iliad' },
  { name: 'Fadil KENDIRA',           photo: '/candidats/fkendira.png',  role: 'TMRE -ex-PDEM - Free Réseau ' },
  { name: 'Aurelien DESMARS',        photo: '/candidats/adesmars.png',  role: 'TMRE -ex-CDEM - Free Réseau' },
  { name: 'Sofiane ZIOUI',           photo: '/candidats/szioui.png',    role: 'Technicien PCI - Free Réseau' },
  { name: 'Yann DADIA',              photo: '/candidats/ydadia.png',    role: 'TMRE - ex-CDEM - Free Réseau' },
  { name: 'Jean Patrick DE BOISROLIN', photo: '/candidats/undefined',   role: 'Technicien UPR' },
  { name: 'Souleymane NDAO',         photo: '/candidats/sndao.png',     role: 'Technicien Fibre - XMI - Free Réseau' },
  { name: 'Henri DIBOUE IPOUMB',     photo: '/candidats/hdiboue.png',   role: 'TMRE -ex-CDEM - Free Réseau' },
  { name: 'Kaissane ABDOU',          photo: '/candidats/kbenabdou.png', role: 'Technicien UPR - Free Réseau' },
  { name: 'Anthony LAVILLE',         photo: '/candidats/alaville.png',  role: 'Technicien Fibre - Free Réseau' },
  { name: 'Abdelhakim ADNANE',       photo: '/candidats/aadnane.jpg',   role: 'Technicien UPR - Free Réseau' },
  { name: 'Saint Cyr TCHAKOUNTE BANEKIA', photo: '/candidats/sctchakounte.png', role: "Technicien d'Opérations Radio - Déploiement Radio" },
  { name: 'Ugo SOSPEDRA',            photo: '/candidats/usospedra.png', role: 'Technicien Fibre - Free Réseau' },
  { name: 'Nicolas RIVES',           photo: '/candidats/nrives.png',    role: 'Superviseur Travaux UPR - Free Réseau' },
  { name: 'Romain BURRET',           photo: '/candidats/rburret.jpg',   role: 'Technicien UPR - Free Réseaau' },
];

export const CANDIDATS_T2_SUPPLEANTS: Candidat[] = [
  { name: 'Sylvie JAYAKUMAR',        photo: '/candidats/sjayakumar.jpg', role: 'Gestionnaire Flotte Automobile - Iliad' },
  { name: 'Mody DIAWARA',            photo: '/candidats/mdiawara.png',   role: 'Référent Opérationnel Pôle Gestion des Prestataires' },
  { name: 'Aicha BEGUEDAR',          photo: '/candidats/abeguedar.png',  role: 'Assistante Technique - Transport' },
  { name: 'David ETTLIN',            photo: '/candidats/dettlin.png',    role: 'Référent TM - ex-CQIS' },
  { name: 'Mohamed Ali LATIF',       photo: '/candidats/mlatif.png',     role: 'Technicien Fibre - Free Réseau' },
  { name: 'Jose DELATTRE',           photo: '/candidats/jdelattre.png',  role: "Concepteur Systeme d'Information - SI ABONNES" },
  { name: 'Ronald LOUBACHE',         photo: '/candidats/rloubache.png',  role: 'Superviseur de Travaux UPR - Free Réseau' },
  { name: 'Mohamed Anas TIKZI',      photo: '/candidats/mtkzi.png',      role: 'Technicien Fibre - Free Réseau' },
  { name: 'Lucas EBERHARD',          photo: '/candidats/leberhard.png',  role: 'Salle Monitoring et Supervision NOC - ex-VSI' },
  { name: 'Ahmed LAMAALLEM',         photo: '/candidats/alaamalaal.png', role: 'Technicien UPR - Free Réseaau' },
  { name: 'Ibrahim SYLLA',           photo: '/candidats/isylla.jpg',     role: 'TMRE - ex-CDEM - Free Réseaau' },
  { name: 'Benoit DOUVILLE',         photo: '/candidats/bdouville.png',  role: 'TMRE - ex-CDEM - Free Réseaau' },
  { name: 'Chawki BENIDIR',          photo: '/candidats/cbenidir.png',   role: 'Technicien UPR - Free Réseaau' },
  { name: 'El Hassan ERRADI',        photo: '/candidats/elerradi.jpg',   role: 'Technicien Fibre - Free Réseau' },
  { name: 'Alwarid YOUSSOUF',        photo: '/candidats/ayoussouf.jpg',  role: 'Assistant Administratif - Opérations Réseau' },
  { name: 'Sekou Oumar CISSE',       photo: undefined,                   role: 'Technicien Fibre - Free Résea' },
  { name: 'Bertrand AUBRY',          photo: undefined,                   role: 'TMRE -ex-CDEM - Free Réseau' },
];

/** Liste à plat utilisée par ProfessionDeFoiT2 */
export const CANDIDATS_T2_FLAT: CandidatFlat[] = [
  ...CANDIDATS_T2_TITULAIRES.map(c => ({ ...c, titulaire: true  })),
  ...CANDIDATS_T2_SUPPLEANTS.map(c => ({ ...c, titulaire: false })),
];

// ─── Résultats 1er tour — Collège Employés / Techniciens / Non-Cadres ─────────
// Electeurs : 2 774 | Votants T : 1 045 | Votes valables T : 1 020 | Blancs : 25
// Votants S : 1 043 | Votes valables S : 1 016 | Blancs : 27

export const RESULTATS_EMPLOYES_T1: SyndicatResult[] = [
  {
    nom: 'FO',
    couleur: SYNDICAT_COLORS['FO'],
    titulaires: { signatures: 358, pct: 35.10, sieges: 0 },
    suppleants: { signatures: 352, pct: 34.65, sieges: 0 },
  },
  {
    nom: 'SUD',
    couleur: SYNDICAT_COLORS['SUD'],
    titulaires: { signatures: 196, pct: 19.22, sieges: 0 },
    suppleants: { signatures: 202, pct: 19.88, sieges: 0 },
  },
  {
    nom: 'CFDT',
    couleur: SYNDICAT_COLORS['CFDT'],
    titulaires: { signatures: 230, pct: 22.55, sieges: 0 },
    suppleants: { signatures: 229, pct: 22.54, sieges: 0 },
  },
  {
    nom: 'CGT',
    couleur: SYNDICAT_COLORS['CGT'],
    titulaires: { signatures: 115, pct: 11.27, sieges: 0 },
    suppleants: { signatures: 118, pct: 11.61, sieges: 0 },
  },
  {
    nom: 'UNSA',
    couleur: SYNDICAT_COLORS['UNSA'],
    titulaires: { signatures: 115, pct: 11.27, sieges: 0 },
    suppleants: { signatures: 107, pct: 10.53, sieges: 0 },
  },
  {
    nom: 'CFTC',
    couleur: SYNDICAT_COLORS['CFTC'],
    titulaires: { signatures: 6,   pct: 0.59,  sieges: 0 },
    suppleants: { signatures: 8,   pct: 0.79,  sieges: 0 },
  },
];

// ─── Résultats 1er tour — Collège Cadres ─────────────────────────────────────
// Electeurs : 2 112 | Votants T : 1 239 | Votes valables T : 1 222 | Blancs : 17
// Votants S : 1 238 | Votes valables S : 1 219 | Blancs : 19

export const RESULTATS_CADRES_T1: SyndicatResult[] = [
  {
    nom: 'CFE-CGC',
    couleur: SYNDICAT_COLORS['CFE-CGC'],
    titulaires: { signatures: 267, pct: 21.85, sieges: 3 },
    suppleants: { signatures: 274, pct: 22.48, sieges: 4 },
  },
  {
    nom: 'UNSA',
    couleur: SYNDICAT_COLORS['UNSA'],
    titulaires: { signatures: 258, pct: 21.11, sieges: 3 },
    suppleants: { signatures: 251, pct: 20.59, sieges: 3 },
  },
  {
    nom: 'FO',
    couleur: SYNDICAT_COLORS['FO'],
    titulaires: { signatures: 252, pct: 20.62, sieges: 3 },
    suppleants: { signatures: 238, pct: 19.52, sieges: 3 },
  },
  {
    nom: 'CFDT',
    couleur: SYNDICAT_COLORS['CFDT'],
    titulaires: { signatures: 217, pct: 17.76, sieges: 2 },
    suppleants: { signatures: 228, pct: 18.70, sieges: 2 },
  },
  {
    nom: 'SUD',
    couleur: SYNDICAT_COLORS['SUD'],
    titulaires: { signatures: 190, pct: 15.55, sieges: 2 },
    suppleants: { signatures: 189, pct: 15.50, sieges: 2 },
  },
  {
    nom: 'CGT',
    couleur: SYNDICAT_COLORS['CGT'],
    titulaires: { signatures: 38,  pct: 3.11,  sieges: 0 },
    suppleants: { signatures: 39,  pct: 3.20,  sieges: 0 },
  },
];

// ─── Voix détaillées FO — 1er tour Employés ───────────────────────────────────

export const FO_TITULAIRES_EMP: CandidatVoix[] = [
  { nom: "N'deye Yacine SIDIBE",     voix: 357 },
  { nom: 'Fabien RACAULT',            voix: 354 },
  { nom: 'Awa BA DIALLO',             voix: 357 },
  { nom: 'Fadil KENDIRA',             voix: 354 },
  { nom: 'Aurelien DESMARS',          voix: 354 },
  { nom: 'Henri DIBOUE IPOUMB',       voix: 354 },
  { nom: 'Yann DADIA',                voix: 353 },
  { nom: 'Sofiane ZIOUI',             voix: 354 },
  { nom: 'Souleymane NDAO',           voix: 355 },
  { nom: 'Jean Patrick DE BOISROLIN', voix: 355 },
  { nom: 'Lucas EBERHARD',            voix: 355 },
  { nom: 'El Hassan ERRADI',          voix: 353 },
  { nom: 'Abdelhakim ADNANE',         voix: 353 },
  { nom: 'Anthony LAVILLE',           voix: 354 },
  { nom: 'Ugo SOSPEDRA',              voix: 354 },
  { nom: 'Nicolas RIVES',             voix: 354 },
  { nom: 'Romain BURRET',             voix: 354 },
];

export const FO_SUPPLEANTS_EMP: CandidatVoix[] = [
  { nom: 'Sylvie JAYAKUMAR',          voix: 347 },
  { nom: 'Mody DIAWARA',              voix: 347 },
  { nom: 'Aicha BEGUEDAR',            voix: 352 },
  { nom: 'David ETTLIN',              voix: 347 },
  { nom: 'Ahmed LAMAALLEM',           voix: 347 },
  { nom: 'Jose DELATTRE',             voix: 347 },
  { nom: 'Ronald LOUBACHE',           voix: 347 },
  { nom: 'Mohamed Anas TIKZI',        voix: 351 },
  { nom: 'Saint Cyr TCHAKOUNTE BANEKIA', voix: 350 },
  { nom: 'Kaissane ABDOU',            voix: 350 },
  { nom: 'Ibrahim SYLLA',             voix: 350 },
  { nom: 'Benoit DOUVILLE',           voix: 350 },
  { nom: 'Chawki BENIDIR',            voix: 350 },
  { nom: 'Alwarid YOUSSOUF',          voix: 350 },
  { nom: 'Mohamed Ali LATIF',         voix: 351 },
  { nom: 'Sekou Oumar CISSE',         voix: 351 },
  { nom: 'Bertrand AUBRY',            voix: 350 },
];

// ─── Voix détaillées FO — 1er tour Cadres ────────────────────────────────────

export const FO_TITULAIRES_CAD: CandidatVoix[] = [
  { nom: 'Cornelia NOUATIN',          voix: 251, elu: true  },
  { nom: 'Mounir ZERARKA',            voix: 251, elu: true  },
  { nom: 'Eloise ALLARD',             voix: 251, elu: true  },
  { nom: 'Serge CHARLES',             voix: 251, elu: false },
  { nom: 'Rose DENAKPO',              voix: 251, elu: false },
  { nom: 'Philippe REGNIER COURTINES',voix: 251, elu: false },
  { nom: 'Jacques PALACIOS',          voix: 251, elu: false },
  { nom: 'Fouad KHETTAR',             voix: 252, elu: false },
  { nom: 'Chokri ZIDELMAL',           voix: 251, elu: false },
  { nom: 'Jean Michel MOUNIER',       voix: 251, elu: false },
  { nom: 'Abdelfatih BENBERKANE',     voix: 251, elu: false },
  { nom: 'Kamal MOULZIM',             voix: 251, elu: false },
  { nom: 'Didier BROU',               voix: 251, elu: false },
];

export const FO_SUPPLEANTS_CAD: CandidatVoix[] = [
  { nom: 'Elise EL KHOURY',           voix: 237, elu: true  },
  { nom: 'Haissa DOGHEMANE',          voix: 237, elu: true  },
  { nom: 'Amandine THON',             voix: 238, elu: true },
  { nom: 'Soufiane BELGHARBI',        voix: 238, elu: false },
  { nom: 'Yvette NOGLO',              voix: 238, elu: false },
  { nom: 'Jim FANELLI',               voix: 238, elu: false },
  { nom: 'Julien TEILLAUD',           voix: 238, elu: false },
  { nom: 'Rachid ABBAS',              voix: 238, elu: false },
  { nom: 'Christian FARES',           voix: 238, elu: false },
  { nom: 'Lyes BELHOCINE',            voix: 238, elu: false },
  { nom: 'Nadim BOUADMA',             voix: 238, elu: false },
  { nom: 'Stephane DENOBILI',         voix: 238, elu: false },
  { nom: 'Abdellah ABBAOUI',          voix: 238, elu: false },
];

// ─── Rétro-planning ───────────────────────────────────────────────────────────

export const RETROPLANNING: RetroStep[] = [
  { date: '11 mars 2026',   label: "Signature du Protocole d'Accord Préélectoral (PAP)",              type: 'info'        },
  { date: '16 mars 2026',   label: 'Affichage de la liste électorale provisoire',                      type: 'info'        },
  { date: '23 mars 2026',   label: 'Date limite de dépôt des candidatures — 1er tour',                 type: 'candidature' },
  { date: '26 mars 2026',   label: 'Envoi des professions de foi et des listes aux électeurs',         type: 'info'        },
  { date: '14 avril 2026',  label: 'Ouverture du scrutin électronique — 1er tour (10h00)',             type: 'vote'        },
  { date: '21 avril 2026',  label: 'Clôture du scrutin électronique — 1er tour (14h00)',               type: 'vote'        },
  { date: '21 avril 2026',  label: 'Proclamation des résultats du 1er tour (14h05)',                   type: 'resultat'    },
  { date: '23 avril 2026',  label: 'Date limite de dépôt des candidatures — 2ème tour (12h00)',        type: 'candidature' },
  { date: '29 avril 2026',  label: 'Ouverture du scrutin électronique — 2ème tour Employés (10h00)',   type: 'vote'        },
  { date: '6 mai 2026',     label: 'Clôture du scrutin électronique — 2ème tour Employés (14h00)',     type: 'vote'        },
  { date: '6 mai 2026',     label: 'Proclamation des résultats du 2ème tour (14h05)',                  type: 'resultat'    },
];

// ─── Engagements FO ───────────────────────────────────────────────────────────

export const FO_ENGAGEMENTS: string[] = [
  'Défendre chaque salarié sans exception ni favoritisme',
  'Assurer une présence active dans toutes les négociations',
  'Informer les salariés de façon transparente et régulière',
  'Agir concrètement contre les réorganisations brutales',
  'Revendiquer des augmentations générales et un meilleur partage de la valeur',
  'Protéger le télétravail et la qualité de vie au travail',
  'Accompagner individuellement chaque salarié en difficulté',
  "Gérer les activités sociales et culturelles dans l'intérêt de tous",
];

// ─── Contacts ─────────────────────────────────────────────────────────────────

export const FO_CONTACTS = [
  { nom: "N'deye Yacine SIDIBE DS", tel: '06.23.29.02.23', email: 'nysidibe@yahoo.fr'   },
  { nom: 'Fabien RACAULT DS', tel: '06.31.57.33.42', email: 'fracault@gmail.com'   },
  { nom: 'Mounir ZERARKA DS', tel: '06.50.95.86.66', email: 'mounir.zerarka@gmail.com'   },
  { nom: 'Didier BROU DS',  tel: '06.50.54.10.32', email: '"dbrou@reseau.free.fr' },
  { nom: 'Fadil KENDIRA DS', tel: '06 50 77 28 25', email: 'fadil@focomues-iliad.fr'  },
  { nom: 'Fouad Khettar RS', tel: '06 58 33 38 46', email: 'fouadkhettar@icloud.com'  },
];

// ─── Fonctions utilitaires ────────────────────────────────────────────────────

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map(part => part[0].toUpperCase())
    .slice(0, 2)
    .join('');
}

export function dateIsPast(dateStr: string): boolean {
  const months: Record<string, number> = {
    janvier: 0, mars: 2, avril: 3, mai: 4, juin: 5,
    juillet: 6, septembre: 8, octobre: 9, novembre: 10,
    'février': 1, 'août': 7, 'décembre': 11,
  };
  const parts = dateStr.trim().split(' ');
  if (parts.length < 3) return false;
  const day   = parseInt(parts[0], 10);
  const month = months[parts[1].toLowerCase()];
  const year  = parseInt(parts[2], 10);
  if (isNaN(day) || month === undefined || isNaN(year)) return false;
  return new Date(year, month, day) < new Date();
}

// ─── Styles & labels utilitaires ─────────────────────────────────────────────

export function retroTypeStyle(type: RetroStep['type']): string {
  switch (type) {
    case 'info':        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800/40';
    case 'candidature': return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-800/40';
    case 'vote':        return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-800/40';
    case 'resultat':    return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800/40';
  }
}

export function retroTypeLabel(type: RetroStep['type']): string {
  switch (type) {
    case 'info':        return 'Information';
    case 'candidature': return 'Candidature';
    case 'vote':        return 'Vote';
    case 'resultat':    return 'Résultat';
  }
}

export function eventTypeColor(type: string): string {
  switch (type) {
    case 'vote':        return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'resultat':    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'candidature': return 'bg-purple-50 text-purple-700 border-purple-200';
    default:            return 'bg-blue-50 text-blue-700 border-blue-200';
  }
}

export function eventTypeLabel(type: string): string {
  switch (type) {
    case 'vote':        return 'Vote';
    case 'resultat':    return 'Résultat';
    case 'candidature': return 'Candidature';
    default:            return 'Événement';
  }
}

export function documentTypeColor(type: string): string {
  switch (type) {
    case 'profession_de_foi': return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'tract':             return 'bg-orange-50 text-orange-700 border-orange-200';
    default:                  return 'bg-gray-50 text-gray-700 border-gray-200';
  }
}

export function documentTypeLabel(type: string): string {
  switch (type) {
    case 'profession_de_foi': return 'Profession de foi';
    case 'tract':             return 'Tract';
    default:                  return 'Document';
  }
}
