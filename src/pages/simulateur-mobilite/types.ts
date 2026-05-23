export type Categorie = 'employe' | 'cadre';

export interface ScenarioParams {
  indemInstallation: number;
  aidePermis: number;
  dureeCongeSalarie: number;
  dureeCongeSalarieSenior: number;
  dureeCongeCreation: number;
  dureeCongeCreationSenior: number;
  dureeCongeReconversion: number;
  dureeCongeReconversionSenior: number;
  tauxCongeMobilite: number;
  abondementCPF: number;
  primeCreationEntreprise: number;
  primeCreationAutoEntrepreneur: number;
  aideFormationRNCP: number;
  bonificationSeniorRQTH: number;
  multiplicateurAdditionnelle: number;
  plafondIndemniteMajoree: number;
  tauxConcretisationRapide: number;
  primeForfaitaireInstallationGeo: number;
  aideLogementsLoyers: number;
  primeMobiliteInterne: number;
  bonusSeniorMobiliteInterne: number;
}

export const PRIME_MOBILITE_INTERNE_FOCOM = {
  decroissance_vers_tension:   20_000,
  decroissance_vers_equilibre: 15_000,
  equilibre_vers_tension:      12_500,
} as const;

export type TypeMobiliteInterne = keyof typeof PRIME_MOBILITE_INTERNE_FOCOM;

export interface ExemplePreset {
  id: string;
  label: string;
  description: string;
  badge: string;
  salaire: string;
  anciennete: string;
  age: string;
  categorie: Categorie;
  dispositif: NonNullable<Dispositif>;
  notes: string[];
}

export type Dispositif =
  | 'mobilite_interne'
  | 'emploi_salarie'
  | 'creation_entreprise'
  | 'reconversion'
  | null;

export interface Profil {
  salaireBrut: string;
  anciennete: string;
  age: string;
  rqth: boolean;
  categorie: Categorie;
}

export interface Options {
  mobiliteGeo: boolean;
  situationFamiliale: 'seul' | 'couple' | 'enfant1' | 'enfant2plus';
  typeMobiliteInterne: TypeMobiliteInterne;
  concretisationRapide: boolean;
  typeAutoEntrepreneur: boolean;
}

export interface LigneResultat {
  key: string;
  label: string;
  montantDir: number;
  montantSyn: number | null;
  montantAccord: number;
  montantAccordSP: number;
  detail?: string;
  detailSyn?: string;
  detailAccord?: string;
  detailAccordSP?: string;
  highlight?: boolean;
}

export type ColonneType = 'direction' | 'syndicat' | 'accord' | 'accordSP';
