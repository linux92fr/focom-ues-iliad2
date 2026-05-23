import { Building2, Briefcase, TrendingUp, GraduationCap, Pencil, FileCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ScenarioParams, ExemplePreset, Dispositif, ColonneType } from './types';

export const SCENARIO_DIRECTION: ScenarioParams = {
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

export const SCENARIO_SYNDICATS: { [K in keyof ScenarioParams]: number | null } = {
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

export const SCENARIO_ACCORD: ScenarioParams = {
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

export const EXEMPLES_PRESETS: ExemplePreset[] = [
  {
    id: 'ex1_salarie',
    label: 'Ex. 1 — Emploi salarié',
    description: 'Employé SMIC, 6 ans, congé mobilité',
    badge: '~1 867 €/mois',
    salaire: '1867', anciennete: '6', age: '40', categorie: 'employe',
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
    salaire: '1867', anciennete: '6', age: '40', categorie: 'employe',
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
    salaire: '1867', anciennete: '6', age: '40', categorie: 'employe',
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
    salaire: '2150.5', anciennete: '6', age: '40', categorie: 'employe',
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
    salaire: '2150.5', anciennete: '6', age: '40', categorie: 'employe',
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
    salaire: '2150.5', anciennete: '6', age: '40', categorie: 'employe',
    dispositif: 'reconversion',
    notes: [
      'Rupture accord = 11 612,70 € (art. 26.l)',
      'Aide formation RNCP = 10 000 € (art. 26.m-2)',
      'Congé mobilité = 2 150,5 × 75% × 9 = 14 515,88 € (art. 26.e/f)',
      'Total accord ≈ 36 128 €',
    ],
  },
];

export const DISPOSITIFS: {
  id: NonNullable<Dispositif>;
  label: string;
  icon: React.ElementType;
  description: string;
  color: string;
}[] = [
  { id: 'mobilite_interne',    label: 'Mobilité interne',             icon: Building2,     description: 'Poste en décroissance → autre poste Free/Iliad', color: 'blue'   },
  { id: 'emploi_salarie',      label: 'Emploi salarié externe',       icon: Briefcase,     description: 'Congé mobilité + rupture avec indemnité majorée', color: 'green'  },
  { id: 'creation_entreprise', label: "Création d'entreprise",        icon: TrendingUp,    description: 'Prime création + congé mobilité',               color: 'orange' },
  { id: 'reconversion',        label: 'Reconversion professionnelle', icon: GraduationCap, description: 'Formation RNCP + congé mobilité',               color: 'purple' },
];

export const JOURS_DEMENAGEMENT_DIR:    Record<string, number> = { seul: 1, couple: 2, enfant1: 2, enfant2plus: 3 };
export const JOURS_DEMENAGEMENT_SYN:    Record<string, number> = { seul: 1, couple: 3, enfant1: 3, enfant2plus: 5 };
export const JOURS_DEMENAGEMENT_ACCORD: Record<string, number> = { seul: 1, couple: 2, enfant1: 2, enfant2plus: 3 };

export const colorConfig: Record<string, { bg: string; text: string; border: string }> = {
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-300'   },
  green:  { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-300'  },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-300' },
};

export const EXEMPLE_GROUPS = [
  { label: 'Exemple 1 — SMIC (~1 867 €)',       subtitle: '~20% des salariés UES ILIAD',  color: 'blue'  as const, ids: ['ex1_salarie', 'ex1_creation', 'ex1_reconversion'] },
  { label: 'Exemple 2 — Tranche 2 001-2 300 €', subtitle: '~1/5 des salariés UES ILIAD', color: 'green' as const, ids: ['ex2_salarie', 'ex2_creation', 'ex2_reconversion'] },
];

export const COLONNE_STYLES: Record<ColonneType, { header: string; total: string; badge?: React.ReactNode }> = {
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
