
import { useState, useCallback } from 'react';
import PageShell from '@/components/PageShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Calculator, TrendingUp, Briefcase, Building2, GraduationCap,
  CheckCircle2, AlertCircle, Euro, Star, ArrowUp,
  Pencil, Zap, FileCheck, Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Categorie = 'employe' | 'cadre';

interface ScenarioParams {
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

const SCENARIO_DIRECTION: ScenarioParams = {
  indemInstallation:               2_132.10,
  aidePermis:                       1_200,
  dureeCongeSalarie:                   6,
  dureeCongeSalarieSenior:             9,
  dureeCongeCreation:                  9,
  dureeCongeCreationSenior:            9,
  dureeCongeReconversion:              9,
  dureeCongeReconversionSenior:        9,
  tauxCongeMobilite:                0.75,
  abondementCPF:                    4_000,
  primeCreationEntreprise:         12_000,
  primeCreationAutoEntrepreneur:    8_000,
  aideFormationRNCP:               10_000,
  bonificationSeniorRQTH:           2_000,
  multiplicateurAdditionnelle:       1.5,
  plafondIndemniteMajoree:         50_000,
  tauxConcretisationRapide:         0.80,
  primeForfaitaireInstallationGeo:     0,
  aideLogementsLoyers:                 0,
  primeMobiliteInterne:            12_000,
  bonusSeniorMobiliteInterne:        500,
};

const SCENARIO_SYNDICATS: { [K in keyof ScenarioParams]: number | null } = {
  indemInstallation:               2_132.10,
  aidePermis:                       1_200,
  dureeCongeSalarie:                  12,
  dureeCongeSalarieSenior:            15,
  dureeCongeCreation:                 15,
  dureeCongeCreationSenior:           18,
  dureeCongeReconversion:             12,
  dureeCongeReconversionSenior:       15,
  tauxCongeMobilite:                0.80,
  abondementCPF:                    null,
  primeCreationEntreprise:         20_000,
  primeCreationAutoEntrepreneur:   10_000,
  aideFormationRNCP:               20_000,
  bonificationSeniorRQTH:           2_000,
  multiplicateurAdditionnelle:      null,
  plafondIndemniteMajoree:          null,
  tauxConcretisationRapide:         0.90,
  primeForfaitaireInstallationGeo:  2_000,
  aideLogementsLoyers:              null,
  primeMobiliteInterne:             null,
  bonusSeniorMobiliteInterne:        500,
};

const SCENARIO_ACCORD: ScenarioParams = {
  indemInstallation:               2_132.10,
  aidePermis:                       1_200,
  dureeCongeSalarie:                   6,
  dureeCongeSalarieSenior:             9,
  dureeCongeCreation:                  9,
  dureeCongeCreationSenior:            9,
  dureeCongeReconversion:              9,
  dureeCongeReconversionSenior:        9,
  tauxCongeMobilite:                0.75,
  abondementCPF:                    4_000,
  primeCreationEntreprise:         12_000,
  primeCreationAutoEntrepreneur:    8_000,
  aideFormationRNCP:               10_000,
  bonificationSeniorRQTH:           2_000,
  multiplicateurAdditionnelle:       1.5,
  plafondIndemniteMajoree:         70_000,
  tauxConcretisationRapide:         0.80,
  primeForfaitaireInstallationGeo:     0,
  aideLogementsLoyers:                 0,
  primeMobiliteInterne:            12_000,
  bonusSeniorMobiliteInterne:        500,
};

const PRIME_MOBILITE_INTERNE_FOCOM = {
  decroissance_vers_tension:   20_000,
  decroissance_vers_equilibre: 15_000,
  equilibre_vers_tension:      12_500,
} as const;

type TypeMobiliteInterne = keyof typeof PRIME_MOBILITE_INTERNE_FOCOM;

interface ExemplePreset {
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

const EXEMPLES_PRESETS: ExemplePreset[] = [
  {
    id: 'ex1_salarie',
    label: 'Ex. 1 — Emploi salarié',
    description: 'Employé SMIC, 6 ans, congé mobilité',
    badge: '~1 867 €/mois',
    salaire: '1867',
    anciennete: '6',
    age: '40',
    categorie: 'employe',
    dispositif: 'emploi_salarie',
    notes: [
      'ICL CCN = 1 867 × 12 × 3% × 6 = 4 032,72 €',
      'Accord signé : 1 ICL + 1,5 × ICL = 10 081,80 € (plaf. 70k€ — art. 26.l)',
      'Abondement CPF = 4 000 € (art. 26.m-1)',
      'Congé mobilité = 1 867 × 75% × 6 mois = 8 401,50 € (art. 26.e/f)',
      'Total accord ≈ 22 483 €',
    ],
  },
  {
    id: 'ex1_creation',
    label: 'Ex. 1 — Création entreprise',
    description: 'Employé SMIC, 6 ans, création classique',
    badge: '~1 867 €/mois',
    salaire: '1867',
    anciennete: '6',
    age: '40',
    categorie: 'employe',
    dispositif: 'creation_entreprise',
    notes: [
      'Rupture accord = 10 081,80 € (art. 26.l)',
      'Prime création = 12 000 € (art. 26.n)',
      'Congé mobilité = 1 867 × 75% × 9 mois = 12 602,25 € (art. 26.e/f)',
      'Total accord ≈ 34 684 €',
    ],
  },
  {
    id: 'ex1_reconversion',
    label: 'Ex. 1 — Reconversion',
    description: 'Employé SMIC, 6 ans, formation RNCP',
    badge: '~1 867 €/mois',
    salaire: '1867',
    anciennete: '6',
    age: '40',
    categorie: 'employe',
    dispositif: 'reconversion',
    notes: [
      'Rupture accord = 10 081,80 € (art. 26.l)',
      'Aide formation RNCP = 10 000 € (art. 26.m-2)',
      'Congé mobilité = 1 867 × 75% × 9 mois = 12 602,25 € (art. 26.e/f)',
      'Total accord ≈ 32 684 €',
    ],
  },
  {
    id: 'ex2_salarie',
    label: 'Ex. 2 — Emploi salarié',
    description: 'Tranche 2 001-2 300 € (moy.), 6 ans',
    badge: '~2 151 €/mois',
    salaire: '2150.5',
    anciennete: '6',
    age: '40',
    categorie: 'employe',
    dispositif: 'emploi_salarie',
    notes: [
      'ICL CCN = 2 150,5 × 12 × 3% × 6 = 4 645,08 €',
      'Accord signé : 1 ICL + 1,5 × ICL = 11 612,70 € (plaf. 70k€ — art. 26.l)',
      'Abondement CPF = 4 000 € (art. 26.m-1)',
      'Congé mobilité = 2 150,5 × 75% × 6 = 9 677,25 € (art. 26.e/f)',
      'Total accord ≈ 25 290 €',
    ],
  },
  {
    id: 'ex2_creation',
    label: 'Ex. 2 — Création entreprise',
    description: 'Tranche 2 001-2 300 €, création classique',
    badge: '~2 151 €/mois',
    salaire: '2150.5',
    anciennete: '6',
    age: '40',
    categorie: 'employe',
    dispositif: 'creation_entreprise',
    notes: [
      'Rupture accord = 11 612,70 € (art. 26.l)',
      'Prime création = 12 000 € (art. 26.n)',
      'Congé mobilité = 2 150,5 × 75% × 9 = 14 515,88 € (art. 26.e/f)',
      'Total accord ≈ 38 128 €',
    ],
  },
  {
    id: 'ex2_reconversion',
    label: 'Ex. 2 — Reconversion',
    description: 'Tranche 2 001-2 300 €, formation RNCP',
    badge: '~2 151 €/mois',
    salaire: '2150.5',
    anciennete: '6',
    age: '40',
    categorie: 'employe',
    dispositif: 'reconversion',
    notes: [
      'Rupture accord = 11 612,70 € (art. 26.l)',
      'Aide formation RNCP = 10 000 € (art. 26.m-2)',
      'Congé mobilité = 2 150,5 × 75% × 9 = 14 515,88 € (art. 26.e/f)',
      'Total accord ≈ 36 128 €',
    ],
  },
];

function resolveParam(
  key: keyof ScenarioParams,
  scenario: typeof SCENARIO_SYNDICATS | ScenarioParams,
): { value: number; isDefined: boolean } {
  if (scenario !== SCENARIO_SYNDICATS) {
    return { value: (scenario as ScenarioParams)[key], isDefined: true };
  }
  const v = (scenario as typeof SCENARIO_SYNDICATS)[key];
  if (v === null) return { value: SCENARIO_DIRECTION[key], isDefined: false };
  return { value: v, isDefined: true };
}

type Dispositif = 'mobilite_interne' | 'emploi_salarie' | 'creation_entreprise' | 'reconversion' | null;

interface Profil {
  salaireBrut: string;
  anciennete: string;
  age: string;
  rqth: boolean;
  categorie: Categorie;
}

interface Options {
  mobiliteGeo: boolean;
  situationFamiliale: 'seul' | 'couple' | 'enfant1' | 'enfant2plus';
  typeMobiliteInterne: TypeMobiliteInterne;
  concretisationRapide: boolean;
  typeAutoEntrepreneur: boolean;
}

interface LigneResultat {
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

const DISPOSITIFS: { id: NonNullable<Dispositif>; label: string; icon: React.ElementType; description: string; color: string }[] = [
  { id: 'mobilite_interne',    label: 'Mobilité interne',             icon: Building2,     description: 'Poste en décroissance → autre poste Free/Iliad', color: 'blue'   },
  { id: 'emploi_salarie',      label: 'Emploi salarié externe',       icon: Briefcase,     description: 'Congé mobilité + rupture avec indemnité majorée', color: 'green'  },
  { id: 'creation_entreprise', label: "Création d'entreprise",        icon: TrendingUp,    description: 'Prime création + congé mobilité',               color: 'orange' },
  { id: 'reconversion',        label: 'Reconversion professionnelle', icon: GraduationCap, description: 'Formation RNCP + congé mobilité',               color: 'purple' },
];

const JOURS_DEMENAGEMENT_DIR:    Record<string, number> = { seul: 1, couple: 2, enfant1: 2, enfant2plus: 3 };
const JOURS_DEMENAGEMENT_SYN:    Record<string, number> = { seul: 1, couple: 3, enfant1: 3, enfant2plus: 5 };
const JOURS_DEMENAGEMENT_ACCORD: Record<string, number> = { seul: 1, couple: 2, enfant1: 2, enfant2plus: 3 };

const colorConfig: Record<string, { bg: string; text: string; border: string }> = {
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-300'   },
  green:  { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-300'  },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-300' },
};

function formatEur(v: number) {
  return v.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
}

function calculerICLCCN(salaireAnnuelBrut: number, anciennete: number, isSenior: boolean): number {
  if (anciennete < 1) return 0;
  const tranche9  = Math.min(anciennete, 9);
  const tranche25 = Math.min(Math.max(0, anciennete - 9), 16);
  let icl = salaireAnnuelBrut * (tranche9 * 0.03 + tranche25 * 0.04);
  if (isSenior && anciennete >= 10) icl += salaireAnnuelBrut * 0.05;
  if (isSenior && anciennete >= 20) icl += salaireAnnuelBrut * 0.05;
  return Math.min(icl, salaireAnnuelBrut * 1.01);
}

function calculerIndemniteAdditionnelleFocom(
  salaireMensuelBrut: number,
  anciennete: number,
  categorie: Categorie,
  isSenior: boolean,
): number {
  if (categorie === 'employe') return 2_150 * anciennete;
  const salaireAnnuel = salaireMensuelBrut * 12;
  let pct = anciennete < 5 ? 0.10 : anciennete < 10 ? 0.20 : anciennete < 15 ? 0.30 : 0.40;
  if (isSenior) pct += 0.05;
  return salaireAnnuel * pct;
}

function calculerRuptureScenario(
  salaire: number,
  anciennete: number,
  multiplicateur: number,
  plafond: number,
  appliqueMajorationAgeICL: boolean,
): number {
  const icl = calculerICLCCN(salaire * 12, anciennete, appliqueMajorationAgeICL);
  return Math.min(icl + icl * multiplicateur, plafond);
}

function calculerRuptureScenarioSP(
  salaire: number,
  anciennete: number,
  multiplicateur: number,
  appliqueMajorationAgeICL: boolean,
): number {
  const icl = calculerICLCCN(salaire * 12, anciennete, appliqueMajorationAgeICL);
  return icl + icl * multiplicateur;
}

function calculerResultats(
  profil: Profil,
  dispositif: Dispositif,
  options: Options,
): LigneResultat[] {
  const salaire    = parseFloat(profil.salaireBrut) || 0;
  const anciennete = parseFloat(profil.anciennete) || 0;
  const age        = parseInt(profil.age) || 0;
  const isSenior   = age >= 50 || profil.rqth;
  const appliqueMajorationAgeICL = age >= 50;
  const { categorie } = profil;

  if (!salaire || !dispositif) return [];

  const lignes: LigneResultat[] = [];
  const dir = (k: keyof ScenarioParams) => SCENARIO_DIRECTION[k] as number;
  const acc = (k: keyof ScenarioParams) => SCENARIO_ACCORD[k] as number;
  const syn = (k: keyof ScenarioParams): number | null =>
    resolveParam(k, SCENARIO_SYNDICATS).isDefined ? (SCENARIO_SYNDICATS[k] as number) : null;

  if (dispositif === 'mobilite_interne') {
    const primeDirVal  = dir('primeMobiliteInterne');
    const primeAccVal  = acc('primeMobiliteInterne') + (isSenior ? acc('bonusSeniorMobiliteInterne') : 0);
    const primeSynVal  = PRIME_MOBILITE_INTERNE_FOCOM[options.typeMobiliteInterne]
                       + (isSenior ? (syn('bonusSeniorMobiliteInterne') ?? 500) : 0);

    lignes.push({
      key: 'prime_interne',
      label: 'Prime incitative mobilité interne',
      montantDir:      primeDirVal,
      montantSyn:      primeSynVal,
      montantAccord:   primeAccVal,
      montantAccordSP: primeAccVal,
      detail:          `Dir. : prime fixe ${formatEur(primeDirVal)}`,
      detailSyn:       `FOCOM : grille par type (${formatEur(PRIME_MOBILITE_INTERNE_FOCOM[options.typeMobiliteInterne])})${isSenior ? ' +500€ senior' : ''}`,
      detailAccord:    `Art. 23.5.d : 12 000€${isSenior ? ' +500€ senior/RQTH' : ''}`,
      detailAccordSP:  `Art. 23.5.d : 12 000€${isSenior ? ' +500€ senior/RQTH' : ''}`,
      highlight: true,
    });

    if (options.mobiliteGeo) {
      lignes.push({
        key: 'instal',
        label: "Indemnité d'installation",
        montantDir:      dir('indemInstallation'),
        montantSyn:      syn('indemInstallation'),
        montantAccord:   acc('indemInstallation'),
        montantAccordSP: acc('indemInstallation'),
        detail:          `Dir. : ${formatEur(dir('indemInstallation'))} (barème URSSAF)`,
        detailSyn:       "FOCOM : jusqu'à 2 132,10€ (majoré par enfant)",
        detailAccord:    'Art. 24.g : 2 132,10€ (barème URSSAF au 01/01/2026)',
        detailAccordSP:  'Art. 24.g : 2 132,10€ (barème URSSAF au 01/01/2026)',
      });

      lignes.push({
        key: 'permis',
        label: 'Aide au permis de conduire',
        montantDir:      dir('aidePermis'),
        montantSyn:      syn('aidePermis'),
        montantAccord:   acc('aidePermis'),
        montantAccordSP: acc('aidePermis'),
        detail:          `Dir. : ${formatEur(dir('aidePermis'))}`,
        detailSyn:       `FOCOM : ${formatEur(syn('aidePermis') ?? dir('aidePermis'))}`,
        detailAccord:    `Art. 24.g : ${formatEur(acc('aidePermis'))} (permis B)`,
        detailAccordSP:  `Art. 24.g : ${formatEur(acc('aidePermis'))} (permis B)`,
      });

      const joursDir  = JOURS_DEMENAGEMENT_DIR[options.situationFamiliale]    ?? 1;
      const joursSyn  = JOURS_DEMENAGEMENT_SYN[options.situationFamiliale]    ?? 1;
      const joursAcc  = JOURS_DEMENAGEMENT_ACCORD[options.situationFamiliale] ?? 1;
      lignes.push({
        key: 'demenagement',
        label: 'Jours de déménagement',
        montantDir:      (salaire / 22) * joursDir,
        montantSyn:      (salaire / 22) * joursSyn,
        montantAccord:   (salaire / 22) * joursAcc,
        montantAccordSP: (salaire / 22) * joursAcc,
        detail:          `Dir. : ${joursDir} jour(s)`,
        detailSyn:       `FOCOM : ${joursSyn} jour(s)`,
        detailAccord:    `Art. 24.2.a : ${joursAcc} jour(s)`,
        detailAccordSP:  `Art. 24.2.a : ${joursAcc} jour(s)`,
      });
    }
  }

  if (dispositif !== 'mobilite_interne') {
    const dureeKeys: Record<string, { std: keyof ScenarioParams; senior: keyof ScenarioParams }> = {
      emploi_salarie:      { std: 'dureeCongeSalarie',      senior: 'dureeCongeSalarieSenior'      },
      creation_entreprise: { std: 'dureeCongeCreation',     senior: 'dureeCongeCreationSenior'     },
      reconversion:        { std: 'dureeCongeReconversion', senior: 'dureeCongeReconversionSenior' },
    };
    const keys   = dureeKeys[dispositif];
    const durKey = isSenior ? keys.senior : keys.std;

    const dureeMoisDir    = dir(durKey);
    const dureeMoisAcc    = acc(durKey);
    const dureeMoisSynRaw = syn(durKey);
    const tauxDir         = dir('tauxCongeMobilite');
    const tauxAcc         = acc('tauxCongeMobilite');
    const tauxSynRaw      = syn('tauxCongeMobilite');
    const tauxSyn         = tauxSynRaw ?? tauxDir;

    const totalCongeDir = salaire * tauxDir * dureeMoisDir;
    const totalCongeAcc = salaire * tauxAcc * dureeMoisAcc;
    const totalCongeSyn = dureeMoisSynRaw !== null ? salaire * tauxSyn * dureeMoisSynRaw : null;

    lignes.push({
      key: 'conge_mobilite',
      label: 'Congé mobilité',
      montantDir:      totalCongeDir,
      montantSyn:      totalCongeSyn,
      montantAccord:   totalCongeAcc,
      montantAccordSP: totalCongeAcc,
      detail:          `Dir. : ${dureeMoisDir} mois à ${Math.round(tauxDir * 100)}%`,
      detailSyn:       dureeMoisSynRaw !== null
        ? `FOCOM : ${dureeMoisSynRaw} mois à ${Math.round(tauxSyn * 100)}% (min. 85% SMIC)`
        : undefined,
      detailAccord:    `Art. 26.e/f : ${dureeMoisAcc} mois à ${Math.round(tauxAcc * 100)}% (min. 85% SMIC)${isSenior && dispositif === 'emploi_salarie' ? ' — majoré +3 mois senior/RQTH' : ''}`,
      detailAccordSP:  `Art. 26.e/f : ${dureeMoisAcc} mois à ${Math.round(tauxAcc * 100)}% (min. 85% SMIC)`,
      highlight: true,
    });

    if (dispositif === 'emploi_salarie') {
      lignes.push({
        key: 'cpf',
        label: 'Abondement CPF (adaptation)',
        montantDir:      dir('abondementCPF'),
        montantSyn:      syn('abondementCPF'),
        montantAccord:   acc('abondementCPF'),
        montantAccordSP: acc('abondementCPF'),
        detail:          `Dir. : abondement CPF ${formatEur(dir('abondementCPF'))}`,
        detailSyn:       'FOCOM : frais réels (variable)',
        detailAccord:    `Art. 26.m-1 : abondement CPF ${formatEur(acc('abondementCPF'))}`,
        detailAccordSP:  `Art. 26.m-1 : abondement CPF ${formatEur(acc('abondementCPF'))}`,
      });
    }

    if (options.concretisationRapide) {
      const txDir    = dir('tauxConcretisationRapide');
      const txAcc    = acc('tauxConcretisationRapide');
      const txSynRaw = syn('tauxConcretisationRapide');
      lignes.push({
        key: 'concretisation',
        label: 'Prime concrétisation rapide (CDI)',
        montantDir:      totalCongeDir * txDir,
        montantSyn:      txSynRaw !== null ? (totalCongeSyn ?? totalCongeDir) * txSynRaw : null,
        montantAccord:   totalCongeAcc * txAcc,
        montantAccordSP: totalCongeAcc * txAcc,
        detail:          `Dir. : ${Math.round(txDir * 100)}% de l'allocation totale du congé`,
        detailSyn:       txSynRaw !== null ? `FOCOM : ${Math.round(txSynRaw * 100)}% de l'allocation totale du congé` : undefined,
        detailAccord:    `Art. 26.k : ${Math.round(txAcc * 100)}% allocation restante du congé non effectué`,
        detailAccordSP:  `Art. 26.k : ${Math.round(txAcc * 100)}% allocation restante du congé non effectué`,
        highlight: true,
      });
    }

    const majDir   = calculerRuptureScenario(salaire, anciennete, dir('multiplicateurAdditionnelle'), dir('plafondIndemniteMajoree'), appliqueMajorationAgeICL);
    const majAcc   = calculerRuptureScenario(salaire, anciennete, acc('multiplicateurAdditionnelle'), acc('plafondIndemniteMajoree'), appliqueMajorationAgeICL);
    const majAccSP = calculerRuptureScenarioSP(salaire, anciennete, acc('multiplicateurAdditionnelle'), appliqueMajorationAgeICL);

    const indemCCN = calculerICLCCN(salaire * 12, anciennete, appliqueMajorationAgeICL);
    const indemAdd = calculerIndemniteAdditionnelleFocom(salaire, anciennete, categorie, isSenior);
    const majSyn   = indemCCN + indemAdd;

    const isCappedDir = (indemCCN * (1 + dir('multiplicateurAdditionnelle'))) > dir('plafondIndemniteMajoree');
    const isCappedAcc = (indemCCN * (1 + acc('multiplicateurAdditionnelle'))) > acc('plafondIndemniteMajoree');

    lignes.push({
      key: 'rupture',
      label: 'Indemnité de rupture',
      montantDir:      majDir,
      montantSyn:      majSyn > 0 ? majSyn : null,
      montantAccord:   majAcc,
      montantAccordSP: majAccSP,
      detail:          `Dir. : 1 ICL + 1,5 × ICL = ${formatEur(majDir)}${isCappedDir ? ' ⚠ plafonné 50k€' : ''}`,
      detailSyn:       majSyn > 0 ? `FOCOM : ICL CCN ${formatEur(indemCCN)} + additionnelle ${formatEur(indemAdd)}` : undefined,
      detailAccord:    `Art. 26.l : 1 ICL + 1,5 × ICL = ${formatEur(majAcc)}${isCappedAcc ? ' ⚠ plafonné 70k€' : ' (plaf. 70k€)'}`,
      detailAccordSP:  `Sans plafond : 1 ICL + 1,5 × ICL = ${formatEur(majAccSP)}`,
      highlight: true,
    });

    if (dispositif === 'creation_entreprise') {
      const prDir = options.typeAutoEntrepreneur ? dir('primeCreationAutoEntrepreneur') : dir('primeCreationEntreprise');
      const prAcc = options.typeAutoEntrepreneur ? acc('primeCreationAutoEntrepreneur') : acc('primeCreationEntreprise');
      const prSyn = options.typeAutoEntrepreneur ? syn('primeCreationAutoEntrepreneur') : syn('primeCreationEntreprise');
      lignes.push({
        key: 'creation',
        label: "Prime d'aide à la création",
        montantDir:      prDir,
        montantSyn:      prSyn,
        montantAccord:   prAcc,
        montantAccordSP: prAcc,
        detail:          `Dir. : ${formatEur(prDir)} (${options.typeAutoEntrepreneur ? 'auto-entr.' : 'classique'})`,
        detailSyn:       prSyn !== null ? `FOCOM : ${formatEur(prSyn)}` : undefined,
        detailAccord:    `Art. 26.n : ${formatEur(prAcc)} — versé à l'inscription officielle`,
        detailAccordSP:  `Art. 26.n : ${formatEur(prAcc)} — versé à l'inscription officielle`,
        highlight: true,
      });
    }

    if (dispositif === 'reconversion') {
      const baseDir    = dir('aideFormationRNCP') + (isSenior ? dir('bonificationSeniorRQTH') : 0);
      const baseAcc    = acc('aideFormationRNCP') + (isSenior ? acc('bonificationSeniorRQTH') : 0);
      const baseSynRaw = syn('aideFormationRNCP');
      const bonusSyn   = isSenior ? (syn('bonificationSeniorRQTH') ?? 0) : 0;
      const baseSyn    = baseSynRaw !== null ? baseSynRaw + bonusSyn : null;
      lignes.push({
        key: 'formation',
        label: 'Aide à la formation RNCP',
        montantDir:      baseDir,
        montantSyn:      baseSyn,
        montantAccord:   baseAcc,
        montantAccordSP: baseAcc,
        detail:          `Dir. : ${formatEur(baseDir)}${isSenior ? ' (+2k€ senior)' : ''}`,
        detailSyn:       baseSyn !== null ? `FOCOM : ${formatEur(baseSyn)} HT` : undefined,
        detailAccord:    `Art. 26.m-2 : ${formatEur(baseAcc)} HT${isSenior ? ' (+2k€ ≥50 ans/RQTH)' : ''}`,
        detailAccordSP:  `Art. 26.m-2 : ${formatEur(baseAcc)} HT${isSenior ? ' (+2k€ ≥50 ans/RQTH)' : ''}`,
        highlight: true,
      });
    }
  }

  return lignes;
}

// ── ColonneResultat ──────────────────────────────────────────────────────────

type ColonneType = 'direction' | 'syndicat' | 'accord' | 'accordSP';

interface ColonneResultatProps {
  type: ColonneType;
  titre: string;
  sous_titre: string;
  lignes: LigneResultat[];
  getMontant: (l: LigneResultat) => number | null;
  getDetail:  (l: LigneResultat) => string | undefined;
}

const COLONNE_STYLES: Record<ColonneType, { header: string; total: string; badge?: React.ReactNode }> = {
  direction: {
    header: 'bg-muted text-foreground',
    total:  'text-foreground',
  },
  syndicat: {
    header: 'bg-primary text-primary-foreground',
    total:  'text-primary',
    badge: (
      <Badge className="shrink-0 bg-yellow-400 text-yellow-900 text-[10px] font-bold border-0 gap-1">
        <Pencil className="w-2.5 h-2.5" />FOCOM VF
      </Badge>
    ),
  },
  accord: {
    header: 'bg-emerald-700 text-white',
    total:  'text-emerald-700',
    badge: (
      <Badge className="shrink-0 bg-emerald-200 text-emerald-900 text-[10px] font-bold border-0 gap-1">
        <FileCheck className="w-2.5 h-2.5" />Signé
      </Badge>
    ),
  },
  accordSP: {
    header: 'bg-violet-700 text-white',
    total:  'text-violet-700',
    badge: (
      <Badge className="shrink-0 bg-violet-200 text-violet-900 text-[10px] font-bold border-0 gap-1">
        <FileCheck className="w-2.5 h-2.5" />Sans plafond
      </Badge>
    ),
  },
};

const ColonneResultat = ({ type, titre, sous_titre, lignes, getMontant, getDetail }: ColonneResultatProps) => {
  const styles       = COLONNE_STYLES[type];
  const total        = lignes.reduce((s, l) => s + (getMontant(l) ?? 0), 0);
  const hasUndefined = lignes.some(l => getMontant(l) === null);

  return (
    <div className="flex flex-col rounded-xl border border-border overflow-hidden shadow-sm h-full">
      <div className={cn('px-4 py-3', styles.header)}>
        <div className="flex items-center justify-between gap-2">
          <p className="font-bold text-sm leading-tight">{titre}</p>
          {styles.badge}
        </div>
        <p className="text-xs mt-0.5 opacity-70">{sous_titre}</p>
      </div>

      <div className="px-4 py-3 border-b border-border bg-card">
        <p className="text-xs text-muted-foreground mb-0.5">Total estimé</p>
        <p className={cn('font-extrabold tabular-nums text-2xl', styles.total)}>
          {hasUndefined && type === 'syndicat'
            ? <span className="italic text-xl">≥ {formatEur(total)}</span>
            : formatEur(total)
          }
        </p>
        {hasUndefined && type === 'syndicat' && (
          <p className="text-[10px] text-muted-foreground mt-0.5">Certains montants en frais réels</p>
        )}
      </div>

      <div className="flex-1 divide-y divide-border bg-card">
        {lignes.map(ligne => {
          const montant = getMontant(ligne);
          const detail  = getDetail(ligne);
          const showArrow =
            (type === 'accord'   && ligne.montantAccord   > ligne.montantDir) ||
            (type === 'accordSP' && ligne.montantAccordSP > ligne.montantDir) ||
            (type === 'syndicat' && (ligne.montantSyn ?? 0) > ligne.montantDir);

          return (
            <div key={ligne.key} className={cn('px-3 py-2.5', ligne.highlight ? 'bg-muted/40' : '')}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    {showArrow && <ArrowUp className="w-3 h-3 text-emerald-500 shrink-0" />}
                    <p className={cn('text-xs font-medium leading-snug', ligne.highlight ? 'text-foreground' : 'text-muted-foreground')}>
                      {ligne.label}
                    </p>
                  </div>
                  {detail && (
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{detail}</p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  {montant === null ? (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                      Variable
                    </span>
                  ) : montant === 0 && type === 'direction' ? (
                    <span className="text-xs text-muted-foreground italic">—</span>
                  ) : (
                    <span className={cn(
                      'text-xs font-bold tabular-nums',
                      showArrow
                        ? type === 'accordSP' ? 'text-violet-600' : 'text-emerald-600'
                        : ligne.highlight
                          ? type === 'accordSP' ? 'text-violet-700'
                          : type === 'accord'   ? 'text-emerald-700'
                          : type === 'syndicat' ? 'text-primary'
                          : 'text-foreground'
                          : 'text-muted-foreground',
                    )}>
                      {formatEur(montant)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── ExemplesRapides ──────────────────────────────────────────────────────────

const EXEMPLE_GROUPS = [
  { label: 'Exemple 1 — SMIC (~1 867 €)',       subtitle: '~20% des salariés UES ILIAD',  color: 'blue'  as const, ids: ['ex1_salarie', 'ex1_creation', 'ex1_reconversion'] },
  { label: 'Exemple 2 — Tranche 2 001-2 300 €', subtitle: '~1/5 des salariés UES ILIAD', color: 'green' as const, ids: ['ex2_salarie', 'ex2_creation', 'ex2_reconversion'] },
];

interface ExemplesRapidesProps {
  onLoad:   (preset: ExemplePreset) => void;
  activeId: string | null;
}

const ExemplesRapides = ({ onLoad, activeId }: ExemplesRapidesProps) => (
  <Card className="border-primary/20 bg-primary/3">
    <CardHeader className="pb-2 pt-4">
      <CardTitle className="flex items-center gap-2 text-base">
        <span className="w-6 h-6 rounded-full bg-amber-400 text-amber-900 text-xs font-bold flex items-center justify-center">
          <Zap className="w-3.5 h-3.5" />
        </span>
        Exemples rapides
      </CardTitle>
      <CardDescription className="text-xs">
        Profils types — accord GEPP signé le 9 avril 2026.
      </CardDescription>
    </CardHeader>
    <CardContent className="flex flex-col gap-3 pb-4">
      {EXEMPLE_GROUPS.map(group => {
        const c = colorConfig[group.color];
        return (
          <div key={group.label} className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className={cn('text-[11px] font-semibold', c.text)}>{group.label}</span>
              <span className="text-[10px] text-muted-foreground">— {group.subtitle}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {group.ids.map(id => {
                const preset   = EXEMPLES_PRESETS.find(p => p.id === id)!;
                const isActive = activeId === id;
                return (
                  <button key={id} type="button" onClick={() => onLoad(preset)}
                    className={cn(
                      'inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all',
                      isActive
                        ? `${c.bg} ${c.border} ${c.text} shadow-sm`
                        : 'bg-card border-border text-muted-foreground hover:border-primary/30 hover:text-foreground',
                    )}
                  >
                    {isActive && <CheckCircle2 className="w-3 h-3 shrink-0" />}
                    {preset.label.replace(/^Ex\. \d+ — /, '')}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      {activeId && (() => {
        const preset = EXEMPLES_PRESETS.find(p => p.id === activeId);
        if (!preset?.notes.length) return null;
        return (
          <div className="mt-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2.5 flex flex-col gap-1">
            <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wide mb-1.5">
              Détail accord signé — {preset.label}
            </p>
            {preset.notes.map((note, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <span className="text-[10px] font-mono text-emerald-600/60 shrink-0 mt-0.5">{i + 1}.</span>
                <p className="text-[11px] text-emerald-800 leading-snug font-mono">{note}</p>
              </div>
            ))}
          </div>
        );
      })()}
    </CardContent>
  </Card>
);

// ── Page principale ──────────────────────────────────────────────────────────

const SimulateurMobilite = () => {
  const [profil, setProfil] = useState<Profil>({
    salaireBrut: '', anciennete: '', age: '', rqth: false, categorie: 'employe',
  });
  const [dispositif, setDispositif]         = useState<Dispositif>(null);
  const [options, setOptions]               = useState<Options>({
    mobiliteGeo: false, situationFamiliale: 'seul',
    typeMobiliteInterne: 'decroissance_vers_tension',
    concretisationRapide: false, typeAutoEntrepreneur: false,
  });
  const [showResults, setShowResults]       = useState(false);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  const lignes       = showResults ? calculerResultats(profil, dispositif, options) : [];
  const canCalculate = !!profil.salaireBrut && !!profil.anciennete && !!profil.age && !!dispositif;
  const isSenior     = parseInt(profil.age) >= 50 || profil.rqth;

  const handleCalculer   = useCallback(() => { if (canCalculate) setShowResults(true); }, [canCalculate]);
  const handleLoadPreset = useCallback((preset: ExemplePreset) => {
    setProfil({ salaireBrut: preset.salaire, anciennete: preset.anciennete, age: preset.age, rqth: false, categorie: preset.categorie });
    setDispositif(preset.dispositif);
    setOptions(o => ({ ...o, concretisationRapide: false, typeAutoEntrepreneur: false }));
    setActivePresetId(preset.id);
    setShowResults(true);
  }, []);
  const handleReset = () => {
    setProfil({ salaireBrut: '', anciennete: '', age: '', rqth: false, categorie: 'employe' });
    setDispositif(null);
    setOptions({ mobiliteGeo: false, situationFamiliale: 'seul', typeMobiliteInterne: 'decroissance_vers_tension', concretisationRapide: false, typeAutoEntrepreneur: false });
    setShowResults(false);
    setActivePresetId(null);
  };

  return (
    <PageShell subtitle="Simulateur Mobilité">
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-screen-2xl mx-auto">

          {/* Hero */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Calculator className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-3">Simulateur Mobilité GEPP UES ILIAD</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Direction · FOCOM · Accord signé ·{' '}
              <strong className="text-violet-700">Accord (sans plafond)</strong>
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <Badge variant="outline" className="text-xs gap-1 text-primary border-primary/30 bg-primary/5">
                <Star className="w-3 h-3" />FOCOM — propositions VF 27/02/2026
              </Badge>
              <Badge className="text-xs gap-1 bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100">
                <FileCheck className="w-3 h-3" />Accord GEPP signé — 9 avr. 2026
              </Badge>
              <Badge className="text-xs gap-1 bg-violet-100 text-violet-800 border-violet-200 hover:bg-violet-100">
                <FileCheck className="w-3 h-3" />Colonne sans plafond (comparatif)
              </Badge>
            </div>
            {/* <div className="mt-5">
              <a
                href="/Accord_GEPP_UES_ILIAD_signe_FOCOM.pdf"
                download="Accord_GEPP_UES_ILIAD_signé_FOCOM.pdf"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-sm font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                Télécharger l&apos;accord GEPP signé (PDF)
              </a>
            </div> */}
          </div>

          <div className="grid lg:grid-cols-4 gap-6">

            {/* Formulaire */}
            <div className="flex flex-col gap-5">
              <ExemplesRapides onLoad={handleLoadPreset} activeId={activePresetId} />

              {/* Profil */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">1</span>
                    Votre profil
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'salaire',    label: 'Salaire brut mensuel (€)', placeholder: 'ex. 3500', field: 'salaireBrut' as const, step: undefined },
                      { id: 'anciennete', label: 'Ancienneté (années)',       placeholder: 'ex. 5',    field: 'anciennete'  as const, step: '0.5'    },
                      { id: 'age',        label: 'Âge',                       placeholder: 'ex. 42',   field: 'age'         as const, step: undefined },
                    ].map(({ id, label, placeholder, field, step }) => (
                      <div key={id} className="flex flex-col gap-1.5">
                        <Label htmlFor={id} className="text-xs">{label}</Label>
                        <Input id={id} type="number" min="0" placeholder={placeholder} step={step} value={profil[field]}
                          onChange={e => { setProfil(p => ({ ...p, [field]: e.target.value })); setShowResults(false); setActivePresetId(null); }} />
                      </div>
                    ))}
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs block mb-1">RQTH</Label>
                      <div className="flex gap-1">
                        {[{ val: false, label: 'Non' }, { val: true, label: 'Oui' }].map(({ val, label }) => (
                          <Button key={label} type="button" size="sm" variant={profil.rqth === val ? 'default' : 'outline'}
                            onClick={() => { setProfil(p => ({ ...p, rqth: val })); setShowResults(false); setActivePresetId(null); }}
                            className="flex-1 h-9 text-xs">{label}</Button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs">Catégorie professionnelle</Label>
                    <div className="flex gap-1.5">
                      {([{ val: 'employe', label: 'Employé / Tech.' }, { val: 'cadre', label: 'Cadre' }] as const).map(({ val, label }) => (
                        <Button key={val} type="button" size="sm" variant={profil.categorie === val ? 'default' : 'outline'}
                          onClick={() => { setProfil(p => ({ ...p, categorie: val })); setShowResults(false); setActivePresetId(null); }}
                          className="flex-1 h-9 text-xs">{label}</Button>
                      ))}
                    </div>
                  </div>
                  {isSenior && (
                    <Alert className="border-primary/30 bg-primary/5 py-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                      <AlertDescription className="text-xs">Bonifications senior/RQTH appliquées</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Dispositif */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">2</span>
                    Dispositif
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    {DISPOSITIFS.map(d => {
                      const c        = colorConfig[d.color];
                      const selected = dispositif === d.id;
                      const Icon     = d.icon;
                      return (
                        <button key={d.id} type="button"
                          onClick={() => { setDispositif(d.id); setShowResults(false); setActivePresetId(null); }}
                          className={cn('w-full text-left p-2.5 rounded-lg border-2 transition-all',
                            selected ? `${c.bg} ${c.border}` : 'border-border hover:border-primary/30 bg-card')}>
                          <div className="flex items-center gap-2">
                            <div className={cn('w-7 h-7 rounded-md flex items-center justify-center shrink-0', selected ? c.bg : 'bg-muted')}>
                              <Icon className={cn('w-3.5 h-3.5', selected ? c.text : 'text-muted-foreground')} />
                            </div>
                            <div>
                              <p className={cn('font-semibold text-xs', selected ? c.text : 'text-foreground')}>{d.label}</p>
                              <p className="text-[10px] text-muted-foreground leading-tight">{d.description}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Options */}
              {dispositif && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">3</span>
                      Options
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    {dispositif === 'mobilite_interne' && (
                      <>
                        <div className="flex flex-col gap-1.5">
                          <Label className="text-xs">Type de mobilité (FOCOM)</Label>
                          <div className="flex flex-col gap-1.5">
                            {([
                              { val: 'decroissance_vers_tension',   label: 'Décroissance → Tension (20k€)'   },
                              { val: 'decroissance_vers_equilibre', label: 'Décroissance → Équilibre (15k€)' },
                              { val: 'equilibre_vers_tension',      label: 'Équilibre → Tension (12,5k€)'    },
                            ] as const).map(({ val, label }) => (
                              <Button key={val} type="button" size="sm" variant={options.typeMobiliteInterne === val ? 'default' : 'outline'}
                                onClick={() => { setOptions(o => ({ ...o, typeMobiliteInterne: val })); setShowResults(false); }}
                                className="h-7 text-xs justify-start">{label}</Button>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Mobilité géographique (≥50km)</Label>
                          <div className="flex gap-1">
                            {[{ val: false, label: 'Non' }, { val: true, label: 'Oui' }].map(({ val, label }) => (
                              <Button key={label} type="button" size="sm" variant={options.mobiliteGeo === val ? 'default' : 'outline'}
                                onClick={() => { setOptions(o => ({ ...o, mobiliteGeo: val })); setShowResults(false); }}
                                className="h-7 text-xs px-2">{label}</Button>
                            ))}
                          </div>
                        </div>
                        {options.mobiliteGeo && (
                          <div className="flex flex-col gap-1.5">
                            <Label className="text-xs text-muted-foreground">Situation familiale</Label>
                            <div className="grid grid-cols-2 gap-1.5">
                              {([
                                { val: 'seul',        label: 'Seul(e)'     },
                                { val: 'couple',      label: 'Couple'      },
                                { val: 'enfant1',     label: '1-2 enfants' },
                                { val: 'enfant2plus', label: '3+ enfants'  },
                              ] as const).map(({ val, label }) => (
                                <Button key={val} type="button" size="sm" variant={options.situationFamiliale === val ? 'default' : 'outline'}
                                  onClick={() => { setOptions(o => ({ ...o, situationFamiliale: val })); setShowResults(false); }}
                                  className="h-7 text-xs">{label}</Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    {dispositif !== 'mobilite_interne' && (
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-xs">Concrétisation rapide (CDI)</Label>
                          <p className="text-[10px] text-muted-foreground">Accord signé 80% (art. 26.k)</p>
                        </div>
                        <div className="flex gap-1">
                          {[{ val: false, label: 'Non' }, { val: true, label: 'Oui' }].map(({ val, label }) => (
                            <Button key={label} type="button" size="sm" variant={options.concretisationRapide === val ? 'default' : 'outline'}
                              onClick={() => { setOptions(o => ({ ...o, concretisationRapide: val })); setShowResults(false); }}
                              className="h-7 text-xs px-2">{label}</Button>
                          ))}
                        </div>
                      </div>
                    )}
                    {dispositif === 'creation_entreprise' && (
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Type de création</Label>
                        <div className="flex gap-1">
                          {[{ val: false, label: 'Entreprise' }, { val: true, label: 'Auto-entr.' }].map(({ val, label }) => (
                            <Button key={label} type="button" size="sm" variant={options.typeAutoEntrepreneur === val ? 'default' : 'outline'}
                              onClick={() => { setOptions(o => ({ ...o, typeAutoEntrepreneur: val })); setShowResults(false); }}
                              className="h-7 text-xs px-2">{label}</Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Button size="lg" className="w-full" disabled={!canCalculate} onClick={handleCalculer}>
                <Calculator className="w-4 h-4 mr-2" />Calculer et comparer
              </Button>
              {showResults && (
                <Button variant="outline" size="sm" className="w-full" onClick={handleReset}>
                  Réinitialiser
                </Button>
              )}
            </div>

            {/* Résultats */}
            <div className="lg:col-span-3">
              {!showResults ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center p-12 rounded-2xl border-2 border-dashed border-border">
                    <Euro className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">Remplissez le formulaire</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">ou chargez un exemple ci-contre</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">

                  {/* 3 colonnes */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-3">
                    <ColonneResultat type="syndicat"  titre="Revendications FOCOM"       sous_titre="Propositions VF — 27 fév. 2026"         lignes={lignes} getMontant={l => l.montantSyn}      getDetail={l => l.detailSyn}     />
                    <ColonneResultat type="accord"    titre="Accord GEPP signé"          sous_titre="UES ILIAD — 9 avr. 2026 (plaf. 70k€)"  lignes={lignes} getMontant={l => l.montantAccord}    getDetail={l => l.detailAccord}  />
                    <ColonneResultat type="accordSP"  titre="Accord GEPP (sans plafond)" sous_titre="Rupture sans plafond 70k€"              lignes={lignes} getMontant={l => l.montantAccordSP}  getDetail={l => l.detailAccordSP}/>
                  </div>

                  <Alert className="border-amber-300 bg-amber-50">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-xs text-amber-800">
                      <strong>Simulation indicative.</strong>{' '}
                      Accord GEPP UES ILIAD signé le 9 avril 2026 —
                      Art. 26.e : durées congé (6 mois emploi salarié, +3 mois ≥50 ans/RQTH ; 9 mois création/reconversion) —
                      Art. 26.f : 75% — Art. 26.k : 80% concrétisation — Art. 26.l : ×2,5 plafonné <strong>70 000 €</strong> —
                      Art. 26.m : CPF 4k€, RNCP 10k€ (+2k€ senior) — Art. 26.n : création 12k€/8k€ — Art. 23.5.d : mobilité interne 12k€ +500€ senior/RQTH.
                    </AlertDescription>
                  </Alert>

                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </PageShell>
  );
};

export default SimulateurMobilite;
