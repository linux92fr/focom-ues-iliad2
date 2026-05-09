/**
 * Construit un contexte textuel sur la CCNT et les accords Iliad
 * en fonction de la thématique active dans VosDroits.
 * Ce contexte est injecté dans le system prompt du chatbot juridique.
 */
export function buildCcntContext(themeId?: string): string {
  const base = `Convention Collective Nationale des Télécommunications (CCNT, IDCC 2148) — UES Iliad (Free, Free Mobile, Free Réseau, Alice).`;

  const contexts: Record<string, string> = {
    greve: `${base}
- Droit de grève : constitutionnel, applicable à tout salarié du secteur privé.
- Art. L2511-1 : le licenciement d'un gréviste est nul sauf faute lourde (intention de nuire).
- Retenue sur salaire : strictement proportionnelle à la durée d'arrêt (art. L2511-1 al. 2).
- Remplacement par CDD interdit (art. L1242-6).
- Prime réservée aux non-grévistes : discrimination prohibée (Cass. soc. 19/03/2025).`,

    representants: `${base}
- Salariés protégés : délégués syndicaux, membres CSE, représentants de proximité, défenseurs syndicaux.
- Licenciement impossible sans autorisation préalable de l'inspecteur du travail.
- Protection pendant le mandat + 6 mois après sa fin.
- Loi n° 2025-989 du 24 oct. 2025 : suppression de la limite de 3 mandats successifs au CSE.
- Discrimination syndicale interdite (art. L2141-5).`,

    harcelement: `${base}
- Harcèlement moral : agissements répétés dégradant les conditions de travail (art. L1152-1).
- Harcèlement sexuel : art. L1153-1 — délit pénal.
- Le dénonciateur est protégé contre toute sanction (art. L1152-2).
- Depuis le 2 juillet 2025 (Décret n° 2025-595) : protection contre la discrimination liée au projet parental (AMP, adoption).
- Obligation de l'employeur d'agir dès la première manifestation de souffrance (Cass. soc. 08/01/2025).`,

    "temps-travail": `${base}
- Durée légale : 35 h/semaine (art. L3121-27).
- CCNT IDCC 2148 : contingent annuel de 130 heures supplémentaires.
- Durée quotidienne max : 10 h (12 h exceptionnel) ; hebdomadaire max : 46 h/semaine ou 44 h sur 10 semaines.
- Périodes de haute activité (> 39 h/sem) : max 12 semaines/an et 3 semaines consécutives.
- Loi DDADUE (22 avril 2024) : acquisition de congés payés pendant les arrêts maladie.
- Forfait jours : inopposable sans entretien annuel sur la charge de travail (Cass. soc. 12/07/2023).`,

    "conges-absences": `${base}
- Congés annuels : 30 jours ouvrables (5 semaines).
- Mariage du salarié : 6 jours CCNT (contre 4 jours légaux) ✅ plus favorable.
- Décès d'un enfant : 12 jours CCNT (dont 8 jours de congé de deuil si enfant < 25 ans).
- CET accessible dès 1 an d'ancienneté en CDI.
- RTT : durée conventionnelle max 1 603 h/an ; au-delà de 39 h/sem, les heures génèrent des RTT.`,

    licenciement: `${base}
- Cause réelle et sérieuse obligatoire (art. L1232-1).
- Indemnité légale plancher : 1/4 de mois/an jusqu'à 10 ans, 1/3 au-delà.
- Indemnité CCNT (plus favorable) : 3 %/an (1–9 ans), 4 %/an (10–25 ans) du salaire annuel brut. Majoration pour les 50 ans et plus. Plafond global : 101 % du salaire annuel brut.
- Indemnité de retraite CCNT : 20 % à 10 ans, 40 % à 20 ans, 60 % à 30 ans d'ancienneté.
- Rupture conventionnelle en contexte de harcèlement : nulle si vice du consentement (Cass. soc. 11/03/2025).
- Délai pour saisir les prud'hommes : 12 mois.`,

    "maladie-prevoyance": `${base}
- Maintien de salaire CCNT dès 6 mois d'ancienneté (légal : 1 an).
- Aucun délai de carence conventionnel (le délai de carence SS de 3 jours est compensé).
- Du 1er au 45e jour : 100 % du salaire net (IJSS + complément employeur).
- Du 46e au 105e jour : 75 % du salaire net.
- Burn-out : peut être reconnu comme accident du travail si survenu dans des circonstances identifiables (Cass. soc. 06/03/2024).
- Déclaration accident du travail : dans les 24 h à l'employeur, l'employeur a 48 h pour déclarer à la CPAM.`,

    "sante-securite": `${base}
- Obligation générale de sécurité de l'employeur (art. L4121-1).
- Droit de retrait : danger grave et imminent pour la vie ou la santé (art. L4131-1).
- Document Unique d'Évaluation des Risques Professionnels (DUERP) : obligatoire, consultable par tout salarié.
- Burn-out reconnaissable comme accident du travail (Cass. soc. 06/03/2024).`,

    "contrat-travail": `${base}
- 7 groupes de classification (A à G) selon complexité, autonomie, impact et connaissances.
- SMIC 2026 : 11,88 €/h brut (≈ 1 801,80 € brut mensuel pour 35 h/semaine).
- Minima annuels garantis CCNT 2026 : de 22 757 € (Groupe A seuil 1) à 84 250 € (Groupe G seuil 2).
- Partage de la valeur obligatoire depuis 2025 pour les entreprises de 11 à 49 salariés bénéficiaires 3 ans consécutifs.
- Télétravail : double volontariat — ni l'employeur ni le salarié ne peut l'imposer.
- Astreintes Iliad : forfait 40 €/j (Free Mobile) ou 15 €/j + 0,82 €/h (Free Réseau) en semaine.`,

    formation: `${base}
- CPF : 500 €/an (plafonné à 5 000 €) ou 800 €/an (8 000 €) pour les peu qualifiés.
- Entretien professionnel : obligatoire tous les 2 ans — absence = abondement correctif de 3 000 € sur le CPF.
- Loi n° 2025-989 du 24 oct. 2025 : création de la « période de reconversion » unifiant PRO-A et Transco.`,
  };

  return contexts[themeId ?? ""] ?? base;
}