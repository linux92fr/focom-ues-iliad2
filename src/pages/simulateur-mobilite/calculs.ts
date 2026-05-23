import {
  SCENARIO_DIRECTION, SCENARIO_SYNDICATS, SCENARIO_ACCORD,
  JOURS_DEMENAGEMENT_DIR, JOURS_DEMENAGEMENT_SYN, JOURS_DEMENAGEMENT_ACCORD,
} from './constants';
import type { ScenarioParams, Profil, Dispositif, Options, LigneResultat, Categorie } from './types';
import { PRIME_MOBILITE_INTERNE_FOCOM } from './types';

export function formatEur(v: number) {
  return v.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
}

export function resolveParam(
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

export function calculerICLCCN(salaireAnnuelBrut: number, anciennete: number, isSenior: boolean): number {
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
  salaire: number, anciennete: number, multiplicateur: number,
  plafond: number, appliqueMajorationAgeICL: boolean,
): number {
  const icl = calculerICLCCN(salaire * 12, anciennete, appliqueMajorationAgeICL);
  return Math.min(icl + icl * multiplicateur, plafond);
}

function calculerRuptureScenarioSP(
  salaire: number, anciennete: number, multiplicateur: number,
  appliqueMajorationAgeICL: boolean,
): number {
  const icl = calculerICLCCN(salaire * 12, anciennete, appliqueMajorationAgeICL);
  return icl + icl * multiplicateur;
}

export function calculerResultats(
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
      key: 'prime_interne', label: 'Prime incitative mobilité interne',
      montantDir: primeDirVal, montantSyn: primeSynVal, montantAccord: primeAccVal, montantAccordSP: primeAccVal,
      detail:         `Dir. : prime fixe ${formatEur(primeDirVal)}`,
      detailSyn:      `FOCOM : grille par type (${formatEur(PRIME_MOBILITE_INTERNE_FOCOM[options.typeMobiliteInterne])})${isSenior ? ' +500€ senior' : ''}`,
      detailAccord:   `Art. 23.5.d : 12 000€${isSenior ? ' +500€ senior/RQTH' : ''}`,
      detailAccordSP: `Art. 23.5.d : 12 000€${isSenior ? ' +500€ senior/RQTH' : ''}`,
      highlight: true,
    });

    if (options.mobiliteGeo) {
      lignes.push({
        key: 'instal', label: "Indemnité d'installation",
        montantDir: dir('indemInstallation'), montantSyn: syn('indemInstallation'),
        montantAccord: acc('indemInstallation'), montantAccordSP: acc('indemInstallation'),
        detail: `Dir. : ${formatEur(dir('indemInstallation'))} (barème URSSAF)`,
        detailSyn: "FOCOM : jusqu'à 2 132,10€ (majoré par enfant)",
        detailAccord: 'Art. 24.g : 2 132,10€ (barème URSSAF au 01/01/2026)',
        detailAccordSP: 'Art. 24.g : 2 132,10€ (barème URSSAF au 01/01/2026)',
      });
      lignes.push({
        key: 'permis', label: 'Aide au permis de conduire',
        montantDir: dir('aidePermis'), montantSyn: syn('aidePermis'),
        montantAccord: acc('aidePermis'), montantAccordSP: acc('aidePermis'),
        detail: `Dir. : ${formatEur(dir('aidePermis'))}`,
        detailSyn: `FOCOM : ${formatEur(syn('aidePermis') ?? dir('aidePermis'))}`,
        detailAccord: `Art. 24.g : ${formatEur(acc('aidePermis'))} (permis B)`,
        detailAccordSP: `Art. 24.g : ${formatEur(acc('aidePermis'))} (permis B)`,
      });
      const joursDir = JOURS_DEMENAGEMENT_DIR[options.situationFamiliale]    ?? 1;
      const joursSyn = JOURS_DEMENAGEMENT_SYN[options.situationFamiliale]    ?? 1;
      const joursAcc = JOURS_DEMENAGEMENT_ACCORD[options.situationFamiliale] ?? 1;
      lignes.push({
        key: 'demenagement', label: 'Jours de déménagement',
        montantDir: (salaire / 22) * joursDir, montantSyn: (salaire / 22) * joursSyn,
        montantAccord: (salaire / 22) * joursAcc, montantAccordSP: (salaire / 22) * joursAcc,
        detail: `Dir. : ${joursDir} jour(s)`,
        detailSyn: `FOCOM : ${joursSyn} jour(s)`,
        detailAccord: `Art. 24.2.a : ${joursAcc} jour(s)`,
        detailAccordSP: `Art. 24.2.a : ${joursAcc} jour(s)`,
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
      key: 'conge_mobilite', label: 'Congé mobilité',
      montantDir: totalCongeDir, montantSyn: totalCongeSyn,
      montantAccord: totalCongeAcc, montantAccordSP: totalCongeAcc,
      detail: `Dir. : ${dureeMoisDir} mois à ${Math.round(tauxDir * 100)}%`,
      detailSyn: dureeMoisSynRaw !== null
        ? `FOCOM : ${dureeMoisSynRaw} mois à ${Math.round(tauxSyn * 100)}% (min. 85% SMIC)`
        : undefined,
      detailAccord: `Art. 26.e/f : ${dureeMoisAcc} mois à ${Math.round(tauxAcc * 100)}% (min. 85% SMIC)${isSenior && dispositif === 'emploi_salarie' ? ' — majoré +3 mois senior/RQTH' : ''}`,
      detailAccordSP: `Art. 26.e/f : ${dureeMoisAcc} mois à ${Math.round(tauxAcc * 100)}% (min. 85% SMIC)`,
      highlight: true,
    });

    if (dispositif === 'emploi_salarie') {
      lignes.push({
        key: 'cpf', label: 'Abondement CPF (adaptation)',
        montantDir: dir('abondementCPF'), montantSyn: syn('abondementCPF'),
        montantAccord: acc('abondementCPF'), montantAccordSP: acc('abondementCPF'),
        detail: `Dir. : abondement CPF ${formatEur(dir('abondementCPF'))}`,
        detailSyn: 'FOCOM : frais réels (variable)',
        detailAccord: `Art. 26.m-1 : abondement CPF ${formatEur(acc('abondementCPF'))}`,
        detailAccordSP: `Art. 26.m-1 : abondement CPF ${formatEur(acc('abondementCPF'))}`,
      });
    }

    if (options.concretisationRapide) {
      const txDir    = dir('tauxConcretisationRapide');
      const txAcc    = acc('tauxConcretisationRapide');
      const txSynRaw = syn('tauxConcretisationRapide');
      lignes.push({
        key: 'concretisation', label: 'Prime concrétisation rapide (CDI)',
        montantDir: totalCongeDir * txDir,
        montantSyn: txSynRaw !== null ? (totalCongeSyn ?? totalCongeDir) * txSynRaw : null,
        montantAccord: totalCongeAcc * txAcc, montantAccordSP: totalCongeAcc * txAcc,
        detail: `Dir. : ${Math.round(txDir * 100)}% de l'allocation totale du congé`,
        detailSyn: txSynRaw !== null ? `FOCOM : ${Math.round(txSynRaw * 100)}% de l'allocation totale du congé` : undefined,
        detailAccord: `Art. 26.k : ${Math.round(txAcc * 100)}% allocation restante du congé non effectué`,
        detailAccordSP: `Art. 26.k : ${Math.round(txAcc * 100)}% allocation restante du congé non effectué`,
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
      key: 'rupture', label: 'Indemnité de rupture',
      montantDir: majDir, montantSyn: majSyn > 0 ? majSyn : null,
      montantAccord: majAcc, montantAccordSP: majAccSP,
      detail: `Dir. : 1 ICL + 1,5 × ICL = ${formatEur(majDir)}${isCappedDir ? ' ⚠ plafonné 50k€' : ''}`,
      detailSyn: majSyn > 0 ? `FOCOM : ICL CCN ${formatEur(indemCCN)} + additionnelle ${formatEur(indemAdd)}` : undefined,
      detailAccord: `Art. 26.l : 1 ICL + 1,5 × ICL = ${formatEur(majAcc)}${isCappedAcc ? ' ⚠ plafonné 70k€' : ' (plaf. 70k€)'}`,
      detailAccordSP: `Sans plafond : 1 ICL + 1,5 × ICL = ${formatEur(majAccSP)}`,
      highlight: true,
    });

    if (dispositif === 'creation_entreprise') {
      const prDir = options.typeAutoEntrepreneur ? dir('primeCreationAutoEntrepreneur') : dir('primeCreationEntreprise');
      const prAcc = options.typeAutoEntrepreneur ? acc('primeCreationAutoEntrepreneur') : acc('primeCreationEntreprise');
      const prSyn = options.typeAutoEntrepreneur ? syn('primeCreationAutoEntrepreneur') : syn('primeCreationEntreprise');
      lignes.push({
        key: 'creation', label: "Prime d'aide à la création",
        montantDir: prDir, montantSyn: prSyn, montantAccord: prAcc, montantAccordSP: prAcc,
        detail: `Dir. : ${formatEur(prDir)} (${options.typeAutoEntrepreneur ? 'auto-entr.' : 'classique'})`,
        detailSyn: prSyn !== null ? `FOCOM : ${formatEur(prSyn)}` : undefined,
        detailAccord: `Art. 26.n : ${formatEur(prAcc)} — versé à l'inscription officielle`,
        detailAccordSP: `Art. 26.n : ${formatEur(prAcc)} — versé à l'inscription officielle`,
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
        key: 'formation', label: 'Aide à la formation RNCP',
        montantDir: baseDir, montantSyn: baseSyn, montantAccord: baseAcc, montantAccordSP: baseAcc,
        detail: `Dir. : ${formatEur(baseDir)}${isSenior ? ' (+2k€ senior)' : ''}`,
        detailSyn: baseSyn !== null ? `FOCOM : ${formatEur(baseSyn)} HT` : undefined,
        detailAccord: `Art. 26.m-2 : ${formatEur(baseAcc)} HT${isSenior ? ' (+2k€ ≥50 ans/RQTH)' : ''}`,
        detailAccordSP: `Art. 26.m-2 : ${formatEur(baseAcc)} HT${isSenior ? ' (+2k€ ≥50 ans/RQTH)' : ''}`,
        highlight: true,
      });
    }
  }

  return lignes;
}
