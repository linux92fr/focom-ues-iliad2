import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import ChatbotJuridique from "@/components/ChatbotJuridique";
import CalculateurLicenciement from "@/components/CalculateurLicenciement";
import { buildCcntContext } from "@/lib/ccntContext";
import {
  Shield, Gavel, Megaphone, Scale, Clock, AlertTriangle,
  Users, FileText, Search, BookOpen, Building, Heart,
  ChevronRight, ExternalLink, Bell, Bot, Sparkles,
  Calendar, Activity, Layers, GraduationCap, Mail,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

interface PreavisRow {
  groupe: string;
  condition: string;
  duree: string;
}

interface PeriodeEssaiRow {
  groupe: string;
  dureeInitiale: string;
  renouvellement: string;
}

interface CongeSpecialRow {
  evenement: string;
  duree: string;
  note?: string;
  favorable?: boolean;
}

interface IndemniteRuptureCCNTRow {
  anciennete: string;
  moinsDe50ans: string;
  plusDe50ans: string;
}

interface IndemniteRetraiteRow {
  anciennete: string;
  indemnite: string;
}

interface ClassificationGroupeRow {
  groupe: string;
  diplome: string;
  complexite: string;
  autonomie: string;
  impact: string;
  connaissances: string;
}

interface MaladieRow {
  periode: string;
  anciennete: string;
  indemnisation: string;
}

interface MinimaConventionnel {
  groupe: string;
  seuil: string;
  salaire2025: number;
  salaire2026: number;
}

interface Jurisprudence {
  reference: string;
  date: string;
  juridiction: string;
  resume: string;
  portee: string;
}

interface ArticleCode {
  numero: string;
  titre: string;
  contenu: string;
  exemple?: string;
}

interface ThematiqueData {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  articles: ArticleCode[];
  jurisprudences: Jurisprudence[];
  conseils: string[];
  questionsSuggestions: string[];
}

interface MajorationRow {
  label: string;
  ccnt: string;
  accord: string;
  delta: "better" | "equal" | "info";
  note?: string;
}

interface AstreinteIliadRow {
  societe: "Free Mobile" | "Free Réseau";
  periode: string;
  forfait: string;
  majorationIntervention: string;
  note?: string;
}

// ─────────────────────────────────────────────────────────────────
// Données — Comparatif CCNT (IDCC 2148) vs Accord UES Iliad
// ─────────────────────────────────────────────────────────────────

const majorationsComparatives: MajorationRow[] = [
  { label: "Heures supp. 36e–43e heure", ccnt: "+25 %", accord: "+25 %", delta: "equal" },
  { label: "Heures supp. à partir de la 44e heure", ccnt: "+50 %", accord: "+50 %", delta: "equal" },
  {
    label: "Travail de nuit occasionnel (22h–6h)",
    ccnt: "+50 % ou repos équivalent",
    accord: "+50 % ou repos équivalent",
    delta: "equal",
    note: "Conforme CCNT art. 7 annexe 14 mars 2003",
  },
  { label: "Nuit occasionnelle un dimanche ou jour férié", ccnt: "+110 %", accord: "+110 %", delta: "equal" },
  {
    label: "Travailleur de nuit (statut) — hors dim./férié",
    ccnt: "Majoration selon accord d'entreprise",
    accord: "100 % (repos compensateur + majoration = 100 % de l'heure)",
    delta: "better",
    note: "L'accord Iliad garantit 100 % de compensation totale, au-delà du minimum légal.",
  },
  {
    label: "Travailleur de nuit (statut) — dimanche ou jour férié",
    ccnt: "Majoration selon accord d'entreprise",
    accord: "200 % (compensation équivalant à 2× l'heure de nuit)",
    delta: "better",
    note: "Doublement intégral de l'heure : repos compensateur + majoration de salaire à 100 %.",
  },
  {
    label: "Travail le dimanche (exceptionnel)",
    ccnt: "+100 % ou compensation en temps",
    accord: "+100 % ou compensation en temps",
    delta: "equal",
  },
  {
    label: "Travail un jour férié ordinaire",
    ccnt: "+50 % ou repos équivalent",
    accord: "+50 % ou repos équivalent",
    delta: "equal",
  },
];

const astreintesIliad: AstreinteIliadRow[] = [
  {
    societe: "Free Mobile",
    periode: "Semaine (jour ouvré)",
    forfait: "40 €/jour",
    majorationIntervention: "+55 % du taux horaire",
    note: "Décompte forfait jours : < 4h = ½ journée ; ≥ 4h = 1 journée",
  },
  {
    societe: "Free Mobile",
    periode: "Jour chômé (week-end, férié)",
    forfait: "80 €/jour",
    majorationIntervention: "+55 % du taux horaire",
    note: "Décompte forfait jours : < 4h = ½ journée ; ≥ 4h = 1 journée",
  },
  {
    societe: "Free Réseau",
    periode: "Semaine (jour ouvré)",
    forfait: "15 €/jour + 0,82 €/h",
    majorationIntervention: "+55 % du taux horaire + forfait 37,29 € (si terrain)",
    note: "Intervention à distance (sans déplacement) : pas de majoration des 55 %",
  },
  {
    societe: "Free Réseau",
    periode: "Jour chômé (week-end, férié)",
    forfait: "30 €/jour + 1,64 €/h",
    majorationIntervention: "+55 % du taux horaire + forfait 37,29 € (si terrain)",
    note: "Intervention à distance (sans déplacement) : pas de majoration des 55 %",
  },
];

const preavisIdcc2148: PreavisRow[] = [
  { groupe: "A et B", condition: "Ancienneté < 2 ans", duree: "1 mois" },
  { groupe: "A et B", condition: "Ancienneté ≥ 2 ans", duree: "2 mois" },
  { groupe: "C et D", condition: "Techniciens / Maîtrise", duree: "2 mois" },
  { groupe: "E, F et G", condition: "Cadres", duree: "3 mois" },
];

const periodeEssaiIdcc2148: PeriodeEssaiRow[] = [
  { groupe: "A et B", dureeInitiale: "1 mois", renouvellement: "1 fois (max légal : 2 mois)" },
  { groupe: "C et D", dureeInitiale: "2 mois", renouvellement: "1 fois (max légal : 3 mois)" },
  { groupe: "E, F et G", dureeInitiale: "3 mois", renouvellement: "1 fois (max légal : 4 mois)" },
];

const congesSpeciauxIdcc2148: CongeSpecialRow[] = [
  { evenement: "Mariage du salarié", duree: "6 jours", favorable: true, note: "Plus favorable que les 4 jours légaux" },
  { evenement: "Mariage d'un enfant", duree: "2 jours" },
  { evenement: "Naissance ou adoption d'un enfant", duree: "3 jours" },
  { evenement: "Décès d'un enfant", duree: "12 jours", note: "dont 8 jours de congé de deuil si l'enfant a moins de 25 ans" },
  { evenement: "Décès du conjoint, partenaire de PACS ou concubin", duree: "3 jours" },
  { evenement: "Décès du père ou de la mère", duree: "3 jours" },
  { evenement: "Décès du beau-père ou de la belle-mère", duree: "3 jours" },
  { evenement: "Décès d'un frère ou d'une sœur", duree: "3 jours" },
  { evenement: "Maladie ou accident d'un enfant de moins de 16 ans", duree: "3 jours / an" },
  { evenement: "Survenue d'un handicap chez son enfant", duree: "5 jours" },
];

const indemniteLicenciementCCNT: IndemniteRuptureCCNTRow[] = [
  { anciennete: "1 à 9 ans", moinsDe50ans: "3 % du salaire annuel brut / an", plusDe50ans: "3 % / an" },
  { anciennete: "10 à 25 ans", moinsDe50ans: "4 % du salaire annuel brut / an", plusDe50ans: "4 % / an + 5 % de majoration" },
  { anciennete: "Au-delà de 20 ans", moinsDe50ans: "4 % / an", plusDe50ans: "4 % / an + 10 % de majoration" },
];

const indemniteRetraiteCCNT: IndemniteRetraiteRow[] = [
  { anciennete: "10 ans d'ancienneté", indemnite: "20 % du salaire annuel brut" },
  { anciennete: "20 ans d'ancienneté", indemnite: "40 % du salaire annuel brut" },
  { anciennete: "30 ans d'ancienneté", indemnite: "60 % du salaire annuel brut" },
];

const maladiePreyoyanceIdcc2148: MaladieRow[] = [
  { periode: "Du 1er au 45e jour", anciennete: "6 mois minimum", indemnisation: "100 % du salaire net" },
  { periode: "Du 46e au 105e jour", anciennete: "6 mois minimum", indemnisation: "75 % du salaire net" },
];

const classificationGroupes: ClassificationGroupeRow[] = [
  { groupe: "A", diplome: "Scolarité obligatoire", complexite: "Actions ponctuelles simples de courte durée, non simultanées", autonomie: "Application de règles standardisées strictement organisées par un responsable", impact: "Limité sur les autres postes de travail", connaissances: "Savoir-faire pratique acquis par reproduction sur une courte période" },
  { groupe: "B", diplome: "CAP, BEP (niveau V)", complexite: "Opérations successives simples, généralement sans lien de continuité", autonomie: "Plan de travail pré-établi ou requêtes avec consignes clairement définies", impact: "Relativement limité sur les autres postes", connaissances: "Maîtrise des outils de base, recul acquis par l'expérience" },
  { groupe: "C", diplome: "Bac, BTS, DUT (niveau IV/III)", complexite: "Travaux qualifiés combinant savoir-faire pratique et théorique", autonomie: "Initiative dans le cadre de procédures définies et techniques éprouvées", impact: "Significatif sur les autres postes de travail", connaissances: "Théorie et pratique de processus avancés" },
  { groupe: "D", diplome: "Bac+2, Licence (niveau III/II)", complexite: "Organisation, coordination de travaux, voire encadrement", autonomie: "Initiative significative, possibilité de proposer des adaptations", impact: "Effets constatés au niveau d'une équipe ou d'une activité large", connaissances: "Notions techniques et économiques + connaissances professionnelles approfondies" },
  { groupe: "E", diplome: "Bac+3, Master (niveau II minimum)", complexite: "Organisation et planification de multi-étapes, animation d'activités complémentaires", autonomie: "Contribution à la définition des procédures sur un domaine spécifique", impact: "Important sur les résultats de l'entité", connaissances: "Maîtrise technique, capacités d'analyse, de proposition et de prévision" },
  { groupe: "F", diplome: "Bac+4, Bac+5 (niveau I/II)", complexite: "Définition des enjeux, pilotage de projets multi-paramètres", autonomie: "Prérogatives pouvant porter sur plusieurs domaines d'activité", impact: "Déterminant sur l'entité, pouvant toucher d'autres entités", connaissances: "Hautes capacités d'analyse, d'anticipation, d'adaptation et d'organisation" },
  { groupe: "G", diplome: "Bac+5 + expérience étendue et diversifiée", complexite: "Très haut niveau de complexité, contribution à la stratégie globale", autonomie: "Entière responsabilité d'un département ou d'un établissement important", impact: "Déterminant au niveau de l'entreprise", connaissances: "Groupe F complété par une expérience étendue et généralement diversifiée" },
];

const minimaIdcc2148: MinimaConventionnel[] = [
  { groupe: "A", seuil: "Seuil 1",     salaire2025: 22464, salaire2026: 22757 },
  { groupe: "A", seuil: "Seuil 1 bis", salaire2025: 23418, salaire2026: 23723 },
  { groupe: "A", seuil: "Seuil 2",     salaire2025: 24574, salaire2026: 24894 },
  { groupe: "A", seuil: "Seuil 3",     salaire2025: 25834, salaire2026: 26170 },
  { groupe: "B", seuil: "Seuil 1",     salaire2025: 23564, salaire2026: 23871 },
  { groupe: "B", seuil: "Seuil 1 bis", salaire2025: 24340, salaire2026: 24657 },
  { groupe: "B", seuil: "Seuil 2",     salaire2025: 25353, salaire2026: 25683 },
  { groupe: "B", seuil: "Seuil 3",     salaire2025: 26943, salaire2026: 27294 },
  { groupe: "C", seuil: "Seuil 1",     salaire2025: 24861, salaire2026: 25185 },
  { groupe: "C", seuil: "Seuil 1 bis", salaire2025: 25764, salaire2026: 26099 },
  { groupe: "C", seuil: "Seuil 2",     salaire2025: 28104, salaire2026: 28470 },
  { groupe: "C", seuil: "Seuil 3",     salaire2025: 29235, salaire2026: 29616 },
  { groupe: "D", seuil: "Seuil 1",     salaire2025: 28378, salaire2026: 28747 },
  { groupe: "D", seuil: "Seuil 1 bis", salaire2025: 29542, salaire2026: 29927 },
  { groupe: "D", seuil: "Seuil 2",     salaire2025: 32175, salaire2026: 32594 },
  { groupe: "D", seuil: "Seuil 3",     salaire2025: 33985, salaire2026: 34427 },
  { groupe: "E", seuil: "Seuil 1",     salaire2025: 35664, salaire2026: 36235 },
  { groupe: "E", seuil: "Seuil 1 bis", salaire2025: 40466, salaire2026: 41114 },
  { groupe: "E", seuil: "Seuil 2",     salaire2025: 46155, salaire2026: 46894 },
  { groupe: "E", seuil: "Seuil 3",     salaire2025: 49112, salaire2026: 49898 },
  { groupe: "F", seuil: "Seuil 1",     salaire2025: 47992, salaire2026: 48616 },
  { groupe: "F", seuil: "Seuil 2",     salaire2025: 57425, salaire2026: 58172 },
  { groupe: "G", seuil: "Seuil 1",     salaire2025: 68558, salaire2026: 69450 },
  { groupe: "G", seuil: "Seuil 2",     salaire2025: 83168, salaire2026: 84250 },
];

// ─────────────────────────────────────────────────────────────────
// Données — Thématiques
// ─────────────────────────────────────────────────────────────────

const thematiques: ThematiqueData[] = [
  {
    id: "greve",
    icon: Megaphone,
    title: "Droit de grève",
    description: "Le droit de grève est un droit constitutionnel reconnu à tout salarié du secteur privé.",
    questionsSuggestions: [
      "Puis-je être licencié si je participe à une grève ?",
      "Ma retenue sur salaire est-elle légale après une grève ?",
      "L'employeur peut-il me remplacer par un CDD pendant la grève ?",
      "Une prime réservée aux non-grévistes est-elle légale ?",
    ],
    articles: [
      {
        numero: "L2511-1",
        titre: "Exercice du droit de grève",
        contenu: "L'exercice du droit de grève ne peut justifier la rupture du contrat de travail, sauf faute lourde imputable au salarié.",
        exemple: "Un salarié qui participe à une grève légale ne peut pas être licencié pour ce seul motif."
      },
      {
        numero: "L2512-1",
        titre: "Préavis de grève (services publics)",
        contenu: "Dans les entreprises chargées d'un service public, la cessation concertée du travail doit être précédée d'un préavis.",
        exemple: "Le préavis doit être déposé 5 jours francs avant le début de la grève."
      },
      {
        numero: "L2512-2",
        titre: "Contenu du préavis",
        contenu: "Le préavis doit préciser les motifs du recours à la grève, le lieu, la date et l'heure du début de la grève, ainsi que sa durée.",
      },
      {
        numero: "L2511-1 al. 2",
        titre: "Retenue sur salaire proportionnelle",
        contenu: "La retenue de salaire pour fait de grève doit être strictement proportionnelle à la durée de l'arrêt de travail. Toute retenue supérieure est une sanction pécuniaire interdite.",
        exemple: "Pour 2 heures de grève sur une journée de 7h, la retenue ne peut excéder 2/7e du salaire journalier."
      },
      {
        numero: "L1132-2",
        titre: "Non-discrimination pour fait de grève",
        contenu: "Aucun salarié ne peut être sanctionné, licencié ou faire l'objet d'une mesure discriminatoire en raison de l'exercice normal du droit de grève.",
      }
    ],
    jurisprudences: [
      {
        reference: "Cass. soc., 25 février 1988, n° 85-43.293",
        date: "25/02/1988",
        juridiction: "Cour de cassation",
        resume: "Un arrêt de travail collectif et concerté en vue d'appuyer des revendications professionnelles caractérise l'exercice du droit de grève.",
        portee: "Définition jurisprudentielle de la grève : cessation collective et concertée du travail pour des revendications professionnelles."
      },
      {
        reference: "Cass. soc., 7 juin 1995, n° 93-46.448",
        date: "07/06/1995",
        juridiction: "Cour de cassation",
        resume: "L'employeur ne peut procéder au lock-out qu'en cas de situation contraignante rendant impossible la poursuite de l'activité.",
        portee: "Limitation du droit de réponse de l'employeur face à une grève."
      },
      {
        reference: "Cass. soc., 10 février 2009, n° 07-43.939",
        date: "10/02/2009",
        juridiction: "Cour de cassation",
        resume: "Un salarié gréviste peut être licencié uniquement en cas de faute lourde, c'est-à-dire une faute commise avec l'intention de nuire à l'employeur.",
        portee: "La faute lourde est le seul motif valable de licenciement d'un gréviste."
      },
      {
        reference: "Cass. soc., 15 mars 2023, n° 21-18.326",
        date: "15/03/2023",
        juridiction: "Cour de cassation",
        resume: "La participation à un piquet de grève n'est pas en soi constitutive d'une faute lourde.",
        portee: "Distinction claire entre piquet de grève et blocage illicite."
      },
      {
        reference: "Cass. soc., 12 janvier 2016, n° 14-10.632",
        date: "12/01/2016",
        juridiction: "Cour de cassation",
        resume: "Le remplacement de salariés grévistes par des CDD est strictement interdit.",
        portee: "Interdiction absolue du recours aux CDD pour remplacer des grévistes (Art. L1242-6)."
      },
      {
        reference: "Cass. soc., 19 mars 2025, n° 23-20.989",
        date: "19/03/2025",
        juridiction: "Cour de cassation",
        resume: "Le versement d'une prime exceptionnelle réservée aux seuls salariés non-grévistes constitue une mesure discriminatoire prohibée.",
        portee: "Toute différence de traitement avantageant les non-grévistes est illicite."
      }
    ],
    conseils: [
      "Vérifiez toujours que vos revendications sont de nature professionnelle",
      "En cas de doute, consultez un représentant syndical avant d'entamer une grève",
      "Documentez les revendications et les échanges avec l'employeur",
      "Ne participez pas à des actes de violence ou de blocage illégal",
      "Conservez une copie de toute retenue sur salaire pour vérifier sa proportionnalité",
      "Un salarié seul peut faire grève dans le secteur privé si l'appel émane d'un syndicat représentatif"
    ]
  },
  {
    id: "representants",
    icon: Users,
    title: "Protection des représentants du personnel",
    description: "Les représentants du personnel bénéficient d'une protection spéciale contre le licenciement.",
    questionsSuggestions: [
      "Mon employeur peut-il me licencier en tant que délégué syndical ?",
      "Combien d'heures de délégation ai-je droit par mois ?",
      "Suis-je protégé si je suis candidat aux élections CSE mais pas élu ?",
      "Qu'est-ce que la discrimination syndicale ? Comment la prouver ?",
    ],
    articles: [
      {
        numero: "L2411-1",
        titre: "Salariés protégés",
        contenu: "Bénéficient de la protection contre le licenciement les délégués syndicaux, les membres élus du CSE, les représentants de proximité, les défenseurs syndicaux...",
        exemple: "Un délégué syndical ne peut être licencié qu'avec l'autorisation préalable de l'inspecteur du travail."
      },
      {
        numero: "L2411-5",
        titre: "Durée de la protection",
        contenu: "La protection s'applique pendant toute la durée du mandat et se prolonge pendant 6 mois après la fin du mandat.",
      },
      {
        numero: "L2143-3",
        titre: "Heures de délégation",
        contenu: "Le temps nécessaire à l'exercice du mandat est considéré comme temps de travail effectif et payé à l'échéance normale.",
      },
      {
        numero: "L2315-7",
        titre: "Heures de délégation des membres du CSE",
        contenu: "Le nombre d'heures de délégation varie selon l'effectif de l'entreprise.",
      },
      {
        numero: "L2141-5",
        titre: "Discrimination syndicale interdite",
        contenu: "Il est interdit à tout employeur de prendre en considération l'appartenance à un syndicat ou l'exercice d'une activité syndicale pour arrêter ses décisions.",
      },
      {
        numero: "L2314-33 (modifié par Loi n° 2025-989)",
        titre: "Mandats illimités pour les élus du CSE — Nouveauté 2025",
        contenu: "La loi n° 2025-989 du 24 octobre 2025 supprime la limite de trois mandats successifs pour les membres élus du CSE.",
        exemple: "Un élu CSE ayant déjà accompli trois mandats consécutifs peut se présenter à nouveau sans restriction."
      }
    ],
    jurisprudences: [
      {
        reference: "Cass. soc., 28 mars 2017, n° 15-24.526",
        date: "28/03/2017",
        juridiction: "Cour de cassation",
        resume: "Le licenciement d'un salarié protégé prononcé sans autorisation de l'inspecteur du travail est nul.",
        portee: "Nullité absolue du licenciement sans autorisation administrative."
      },
      {
        reference: "Cass. soc., 22 octobre 2025, n° 23-21.472",
        date: "22/10/2025",
        juridiction: "Cour de cassation",
        resume: "La mise à l'écart systématique d'un représentant syndical des réunions stratégiques constitue une discrimination syndicale.",
        portee: "L'entrave indirecte au mandat est assimilée à une discrimination syndicale sanctionnable."
      }
    ],
    conseils: [
      "Conservez toujours une trace écrite de vos activités syndicales",
      "Informez votre employeur par écrit de l'utilisation de vos heures de délégation",
      "En cas de convocation à un entretien préalable, contactez immédiatement votre syndicat",
      "Depuis la loi du 24 octobre 2025, il n'y a plus de limite de mandats successifs au CSE"
    ]
  },
  {
    id: "harcelement",
    icon: AlertTriangle,
    title: "Harcèlement et discrimination",
    description: "La loi protège les salariés contre toutes formes de harcèlement moral ou sexuel et de discrimination.",
    questionsSuggestions: [
      "Comment prouver un harcèlement moral au travail ?",
      "Mon employeur doit-il agir si je signale un harcèlement ?",
      "Puis-je être sanctionné pour avoir témoigné en faveur d'un collègue ?",
      "Qu'est-ce qu'une discrimination liée à la grossesse ?",
    ],
    articles: [
      {
        numero: "L1152-1",
        titre: "Harcèlement moral",
        contenu: "Aucun salarié ne doit subir les agissements répétés de harcèlement moral qui ont pour objet ou pour effet une dégradation de ses conditions de travail.",
      },
      {
        numero: "L1152-2",
        titre: "Protection du dénonciateur",
        contenu: "Aucun salarié ne peut être sanctionné pour avoir témoigné de faits de harcèlement moral.",
      },
      {
        numero: "L1153-1",
        titre: "Harcèlement sexuel",
        contenu: "Aucun salarié ne doit subir des faits de harcèlement sexuel.",
      },
      {
        numero: "L1132-1 (Décret n° 2025-595 du 30 juin 2025)",
        titre: "Protection contre la discrimination liée au projet parental — Nouveauté 2025",
        contenu: "Depuis le 2 juillet 2025, les salariés engagés dans un projet parental via une AMP ou une procédure d'adoption bénéficient de la protection contre les discriminations au travail.",
      }
    ],
    jurisprudences: [
      {
        reference: "Cass. soc., 8 janvier 2025, n° 23-19.996",
        date: "08/01/2025",
        juridiction: "Cour de cassation",
        resume: "L'employeur doit agir dès la première manifestation de souffrance d'un salarié pour prévenir le harcèlement moral.",
        portee: "Renforcement de l'obligation de prévention et de réaction immédiate."
      }
    ],
    conseils: [
      "Documentez précisément les faits (dates, heures, témoins, preuves écrites)",
      "Alertez votre employeur par écrit",
      "Consultez la médecine du travail si votre santé est affectée",
      "Depuis le 2 juillet 2025, les salariés en démarche de PMA ou d'adoption bénéficient d'une protection spécifique"
    ]
  },
  {
    id: "temps-travail",
    icon: Clock,
    title: "Temps de travail et repos",
    description: "La durée légale du travail est de 35 heures par semaine. Des règles strictes encadrent les heures supplémentaires et les temps de repos.",
    questionsSuggestions: [
      "Comment réclamer mes heures supplémentaires non payées ?",
      "Mon employeur peut-il m'envoyer des emails le soir ?",
      "Ai-je droit à des congés payés pendant mon arrêt maladie ?",
      "Mon forfait jours est-il légal si je n'ai pas eu d'entretien annuel ?",
    ],
    articles: [
      {
        numero: "L3121-27",
        titre: "Durée légale du travail",
        contenu: "La durée légale de travail effectif des salariés à temps complet est fixée à trente-cinq heures par semaine.",
      },
      {
        numero: "L3121-20",
        titre: "Durées maximales — CCNT Télécoms (IDCC 2148)",
        contenu: "La durée quotidienne ne peut excéder 10 heures (portée à 12 h en circonstances exceptionnelles). La durée hebdomadaire maximale est de 46 heures sur une semaine ou 44 heures en moyenne sur 10 semaines consécutives. Le contingent annuel d'heures supplémentaires est fixé à 130 heures.",
        exemple: "Les périodes de haute activité (> 39 h/semaine) sont limitées à 12 semaines par an et 3 semaines consécutives maximum."
      },
      {
        numero: "L3141-3 (modifié par Loi n° 2024-364 du 22 avril 2024)",
        titre: "Congés payés pendant un arrêt maladie — Mise en conformité UE",
        contenu: "Suite à la loi DDADUE du 22 avril 2024, les salariés acquièrent des droits à congés payés pendant toute la durée d'un arrêt maladie.",
      }
    ],
    jurisprudences: [
      {
        reference: "Cass. soc., 12 juillet 2023, n° 21-23.294",
        date: "12/07/2023",
        juridiction: "Cour de cassation",
        resume: "Le forfait jours est inopposable au salarié en l'absence d'entretien annuel spécifique portant sur la charge de travail.",
        portee: "Exigence stricte du suivi de la charge de travail pour les salariés au forfait jours."
      }
    ],
    conseils: [
      "Notez quotidiennement vos heures de travail réelles",
      "La CCNT fixe un contingent annuel de 130 heures supplémentaires",
      "Les périodes de haute activité (> 39 h/sem) ne peuvent dépasser 12 semaines/an",
      "Depuis la loi DDADUE (22 avril 2024), vous acquérez des congés payés pendant vos arrêts maladie",
      "Tout changement d'horaire non prévu doit vous être notifié au moins 10 jours à l'avance"
    ]
  },
  {
    id: "conges-absences",
    icon: Calendar,
    title: "Congés et absences",
    description: "La CCNT Télécoms accorde des congés pour événements familiaux plus favorables que la loi, notamment 6 jours pour votre mariage.",
    questionsSuggestions: [
      "Combien de jours ai-je droit pour mon mariage ?",
      "Ai-je droit à un congé en cas de décès de mon beau-père ?",
      "Mon enfant est hospitalisé : puis-je m'absenter ?",
      "Comment fonctionne mon compte épargne temps (CET) ?",
    ],
    articles: [
      {
        numero: "CCNT IDCC 2148 — Congés exceptionnels",
        titre: "Congés pour événements familiaux — plus favorables que la loi",
        contenu: "La convention collective des télécommunications accorde des congés exceptionnels rémunérés pour les principaux événements de la vie privée. Le mariage du salarié ouvre droit à 6 jours (contre 4 jours légaux), le décès d'un enfant à 12 jours.",
        exemple: "Pour un mariage : 6 jours ouvrables rémunérés, à prendre au moment de l'événement."
      },
      {
        numero: "L3151-1 et s.",
        titre: "Compte Épargne Temps (CET)",
        contenu: "Accessible dès 1 an d'ancienneté en CDI, le CET permet d'accumuler des jours de repos ou de convertir certaines primes. Il peut être utilisé pour un congé parental, une formation, une création d'entreprise, ou pour anticiper le départ à la retraite.",
      },
      {
        numero: "L3121-44 (CCNT art. RTT)",
        titre: "Repos compensateurs et RTT",
        contenu: "La durée conventionnelle annuelle est fixée à 1 603 heures maximum. Au-delà de 39 heures hebdomadaires, les heures génèrent des jours de repos compensateurs (RTT), s'ajoutant aux 30 jours de congés payés légaux.",
        exemple: "Un salarié à 39 h/semaine sur toute l'année génère environ 22 jours de RTT."
      },
      {
        numero: "L3142-4 (modifié Loi 2023-567)",
        titre: "Congé de deuil d'un enfant",
        contenu: "En cas de décès d'un enfant, la CCNT prévoit 12 jours d'absence rémunérée, dont 8 jours de congé de deuil spécifique si l'enfant avait moins de 25 ans, conformément à la loi.",
      }
    ],
    jurisprudences: [
      {
        reference: "Cass. soc., 13 mars 2019, n° 17-18.310",
        date: "13/03/2019",
        juridiction: "Cour de cassation",
        resume: "Les congés pour événements familiaux prévus par la convention collective doivent être accordés même si le salarié est déjà en congé payé.",
        portee: "Les congés exceptionnels s'imputent sur les jours de travail effectif, et non sur les congés payés en cours."
      }
    ],
    conseils: [
      "Pour votre mariage, réclamez 6 jours ouvrables rémunérés (et non 4 jours légaux)",
      "Les congés exceptionnels doivent être pris au moment de l'événement",
      "Ouvrez votre CET dès votre 1re année : il peut financer un congé parental ou anticiper votre retraite",
      "Les femmes enceintes et salariés avec garde d'enfant peuvent refuser les horaires de nuit sans conséquence",
      "Le refus de passer à temps partiel (obligations familiales, formation) ne peut jamais être un motif de licenciement"
    ]
  },
  {
    id: "licenciement",
    icon: FileText,
    title: "Licenciement et rupture du contrat",
    description: "Le licenciement doit être justifié par une cause réelle et sérieuse et respecter une procédure stricte. La CCNT télécoms prévoit des indemnités plus favorables que le minimum légal.",
    questionsSuggestions: [
      "Quelle est mon indemnité légale de licenciement ?",
      "Comment contester un licenciement abusif aux prud'hommes ?",
      "Mon employeur n'a pas respecté la procédure de licenciement — que faire ?",
      "Ma rupture conventionnelle est-elle valable si j'étais harcelé ?",
    ],
    articles: [
      {
        numero: "L1232-1",
        titre: "Cause réelle et sérieuse",
        contenu: "Tout licenciement pour motif personnel est justifié par une cause réelle et sérieuse.",
      },
      {
        numero: "L1234-9",
        titre: "Indemnité légale de licenciement (plancher)",
        contenu: "Le salarié titulaire d'un CDI licencié après 8 mois d'ancienneté a droit à une indemnité. Le minimum légal est de 1/4 de mois par année (jusqu'à 10 ans), puis 1/3 au-delà.",
        exemple: "Pour 15 ans d'ancienneté et un salaire de 3 000 € : (1/4 × 3 000 × 10) + (1/3 × 3 000 × 5) = 12 500 € minimum légal."
      },
      {
        numero: "CCNT IDCC 2148 — Indemnité conventionnelle",
        titre: "Indemnité de licenciement CCNT — Plus favorable que la loi",
        contenu: "Dès 1 an d'ancienneté, la CCNT prévoit 3 % du salaire annuel brut par année (taux porté à 4 % entre 10 et 25 ans). Les salariés de 50 ans et plus bénéficient d'une majoration supplémentaire. Le plafond global est fixé à 101 % du salaire annuel brut.",
        exemple: "Pour 12 ans d'ancienneté avec un salaire annuel brut de 36 000 € : (3 % × 36 000 × 9) + (4 % × 36 000 × 3) = 14 040 € selon la CCNT, contre 11 000 € selon le minimum légal."
      },
      {
        numero: "CCNT IDCC 2148 — Retraite",
        titre: "Indemnité de départ en retraite CCNT",
        contenu: "Le départ en retraite ouvre droit à une indemnité calculée sur le salaire annuel brut : 20 % après 10 ans d'ancienneté, 40 % après 20 ans, 60 % après 30 ans. Les mêmes délais de préavis que pour un licenciement s'appliquent.",
        exemple: "Pour 25 ans d'ancienneté et un salaire annuel brut de 45 000 € : 40 % × 45 000 = 18 000 €."
      }
    ],
    jurisprudences: [
      {
        reference: "Cass. soc., 11 mars 2025, n° 23-19.838",
        date: "11/03/2025",
        juridiction: "Cour de cassation",
        resume: "La rupture conventionnelle conclue dans un contexte de harcèlement moral est nulle si le consentement du salarié a été vicié.",
        portee: "Nullité de la rupture conventionnelle en cas de vice du consentement lié au harcèlement."
      }
    ],
    conseils: [
      "Comparez toujours l'indemnité légale et l'indemnité CCNT — la plus favorable s'applique",
      "Faites-vous accompagner lors de l'entretien préalable",
      "Le délai pour contester un licenciement aux prud'hommes est de 12 mois",
      "En cas de rupture conventionnelle, vérifiez l'absence de pression ou de harcèlement"
    ]
  },
  {
    id: "maladie-prevoyance",
    icon: Activity,
    title: "Maladie et prévoyance",
    description: "La CCNT Télécoms garantit le maintien de 100 % de votre salaire net pendant 45 jours d'arrêt maladie (dès 6 mois d'ancienneté), et 75 % jusqu'au 105e jour.",
    questionsSuggestions: [
      "Mon salaire est-il maintenu pendant mon arrêt maladie ?",
      "Quel est le délai de carence dans la CCNT Télécoms ?",
      "Mon burn-out peut-il être reconnu comme accident du travail ?",
      "Quels sont mes droits en cas d'accident du travail ?",
    ],
    articles: [
      {
        numero: "CCNT IDCC 2148 — Maintien de salaire maladie",
        titre: "Maintien de salaire en cas d'arrêt maladie",
        contenu: "À partir de 6 mois d'ancienneté, la CCNT garantit le maintien de 100 % du salaire net pendant les 45 premiers jours d'absence (indemnités journalières SS + complément employeur). Du 46e au 105e jour, le taux est de 75 % du salaire net. Aucun délai de carence conventionnel n'est prévu.",
        exemple: "Pour un arrêt de 3 mois avec 2 ans d'ancienneté : les 45 premiers jours à taux plein, puis 60 jours à 75 %. Le délai de carence de 3 jours de la Sécurité sociale est compensé par l'employeur."
      },
      {
        numero: "L1226-1",
        titre: "Obligation légale de maintien de salaire",
        contenu: "Après 1 an d'ancienneté, l'employeur verse un complément d'indemnisation maladie. La CCNT est plus avantageuse : dès 6 mois d'ancienneté et avec des taux supérieurs.",
      },
      {
        numero: "L411-1 CSS",
        titre: "Accident du travail",
        contenu: "Est considéré comme accident du travail, quelle qu'en soit la cause, l'accident survenu par le fait ou à l'occasion du travail à toute personne salariée. La déclaration doit être faite dans les 24 heures.",
        exemple: "Un malaise survenu au poste de travail est présumé être un accident du travail."
      }
    ],
    jurisprudences: [
      {
        reference: "Cass. soc., 6 mars 2024, n° 22-20.916",
        date: "06/03/2024",
        juridiction: "Cour de cassation",
        resume: "Le burn-out peut être reconnu comme accident du travail s'il survient à un moment précis et dans des circonstances identifiables liées au travail.",
        portee: "Ouverture de la reconnaissance du burn-out comme accident du travail."
      }
    ],
    conseils: [
      "La CCNT supprime le délai de carence : vous êtes indemnisé dès le 1er jour si vous avez 6 mois d'ancienneté",
      "Transmettez votre arrêt de travail dans les 48 heures à votre employeur et à la CPAM",
      "En cas d'accident du travail, signalez-le immédiatement à votre hiérarchie — la déclaration doit intervenir dans les 24 heures",
      "Consultez la médecine du travail en cas de difficultés liées aux conditions de travail",
      "Le burn-out peut désormais être reconnu comme accident du travail si le déclencheur est identifiable"
    ]
  },
  {
    id: "sante-securite",
    icon: Heart,
    title: "Santé et sécurité au travail",
    description: "L'employeur a l'obligation de garantir la sécurité et la santé physique et mentale des salariés.",
    questionsSuggestions: [
      "Puis-je exercer mon droit de retrait sans risquer une sanction ?",
      "Mon burn-out peut-il être reconnu comme accident du travail ?",
      "Comment consulter le DUERP de mon entreprise ?",
      "Que faire si mon employeur ne respecte pas les règles de sécurité ?",
    ],
    articles: [
      {
        numero: "L4121-1",
        titre: "Obligation générale de sécurité",
        contenu: "L'employeur prend les mesures nécessaires pour assurer la sécurité et protéger la santé physique et mentale des travailleurs.",
      },
      {
        numero: "L4131-1",
        titre: "Droit de retrait",
        contenu: "Le travailleur peut se retirer d'une situation de travail dont il a un motif raisonnable de penser qu'elle présente un danger grave et imminent pour sa vie ou sa santé.",
      }
    ],
    jurisprudences: [
      {
        reference: "Cass. soc., 6 mars 2024, n° 22-20.916",
        date: "06/03/2024",
        juridiction: "Cour de cassation",
        resume: "Le burn-out peut être reconnu comme accident du travail s'il survient à un moment précis et dans des circonstances identifiables liées au travail.",
        portee: "Ouverture de la reconnaissance du burn-out comme accident du travail."
      }
    ],
    conseils: [
      "Signalez tout danger à votre supérieur, au CSE et au médecin du travail",
      "En cas de danger grave et imminent, exercez votre droit de retrait — prévenez votre hiérarchie et le CSE par écrit"
    ]
  },
  {
    id: "contrat-travail",
    icon: Building,
    title: "Contrat de travail et rémunération",
    description: "Le contrat de travail définit les droits et obligations du salarié et de l'employeur. La CCNT télécoms structure 7 groupes de classification (A à G) avec des minima annuels garantis.",
    questionsSuggestions: [
      "Mon CDD non signé dans les 48h peut-il être requalifié en CDI ?",
      "Mon employeur peut-il modifier mon salaire sans mon accord ?",
      "Quels frais l'employeur doit-il prendre en charge en télétravail ?",
      "Mon entreprise est-elle concernée par le partage de la valeur obligatoire ?",
    ],
    articles: [
      {
        numero: "L3231-2",
        titre: "SMIC",
        contenu: "Au 1er janvier 2026, le SMIC brut est revalorisé de 1,18 % et s'établit à 11,88 €/heure, soit environ 1 801,80 € brut mensuel pour 35h/semaine.",
      },
      {
        numero: "L3346-1 et s. (Loi n° 2023-1107 du 29 nov. 2023)",
        titre: "Partage de la valeur obligatoire — PME (applicable depuis janvier 2025)",
        contenu: "Les entreprises de 11 à 49 salariés bénéficiaires pendant 3 années consécutives doivent mettre en place un dispositif de partage de la valeur.",
      }
    ],
    jurisprudences: [
      {
        reference: "Cass. soc., 10 septembre 2025, n° 24-14.473",
        date: "10/09/2025",
        juridiction: "Cour de cassation",
        resume: "Le non-respect d'un accord collectif organisant la modulation du temps partiel entraîne la requalification en contrat à temps complet.",
        portee: "Sanction stricte du non-respect des règles conventionnelles de modulation du temps partiel."
      }
    ],
    conseils: [
      "Exigez toujours un contrat de travail écrit",
      "Conservez tous vos bulletins de paie sans limitation de durée",
      "Depuis 2025, les PME de 11 à 49 salariés bénéficiaires doivent vous proposer un dispositif de partage de la valeur",
      "Le télétravail est fondé sur le double volontariat : ni l'employeur ni le salarié ne peut l'imposer",
      "Si votre contrat contient une clause de non-concurrence, elle doit être limitée dans le temps et l'espace et prévoir une contrepartie financière"
    ]
  },
  {
    id: "formation",
    icon: BookOpen,
    title: "Formation professionnelle",
    description: "Chaque salarié dispose de droits à la formation tout au long de sa vie professionnelle.",
    questionsSuggestions: [
      "Comment utiliser mon CPF pour me former ?",
      "Mon employeur peut-il choisir ma formation CPF à ma place ?",
      "Que faire si je n'ai pas eu d'entretien professionnel depuis 2 ans ?",
      "Qu'est-ce que la nouvelle période de reconversion professionnelle ?",
    ],
    articles: [
      {
        numero: "L6323-1",
        titre: "Compte personnel de formation (CPF)",
        contenu: "Toute personne active dispose d'un CPF alimenté de 500 € par an (plafonné à 5 000 €), ou 800 € par an (plafonné à 8 000 €) pour les salariés non qualifiés.",
      },
      {
        numero: "L6324-1 et s. (Loi n° 2025-989 du 24 oct. 2025)",
        titre: "Période de reconversion professionnelle — Nouveauté 2026",
        contenu: "La loi du 24 octobre 2025 crée la « période de reconversion » qui remplace et unifie la PRO-A et les Transitions collectives (Transco).",
      }
    ],
    jurisprudences: [
      {
        reference: "Cass. soc., 5 octobre 2022, n° 21-13.224",
        date: "05/10/2022",
        juridiction: "Cour de cassation",
        resume: "L'absence d'entretien professionnel tous les 2 ans entraîne un abondement correctif de 3 000 € sur le CPF du salarié.",
        portee: "Sanction financière automatique en cas de non-respect de l'obligation d'entretien professionnel."
      }
    ],
    conseils: [
      "Consultez régulièrement votre solde CPF sur moncompteformation.gouv.fr",
      "Exigez vos entretiens professionnels tous les 2 ans — c'est un droit",
      "Pour un projet de reconversion, renseignez-vous sur la nouvelle « période de reconversion » (loi du 24 octobre 2025)"
    ]
  }
];

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

function hasNewContent(theme: ThematiqueData): boolean {
  return theme.articles.some(
    (a) => a.titre.includes("Nouveauté") || a.titre.includes("2025") || a.titre.includes("2026")
  );
}

function isNewArticle(article: ArticleCode): boolean {
  return article.titre.includes("Nouveauté") || article.titre.includes("2025") || article.titre.includes("2026");
}

function legifranceUrl(numero: string): string {
  const clean = numero.split(" ")[0].replace(/[()]/g, "");
  return `https://www.legifrance.gouv.fr/search/code?tab_selection=code&searchField=ALL&query=${encodeURIComponent(clean)}&page=1&init=true`;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

// ─────────────────────────────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────────────────────────────

const VosDroits = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [chatQuestion, setChatQuestion] = useState<string | undefined>(undefined);

  const selectedThematique = searchParams.get("theme") || "greve";

  const handleThemeChange = (id: string) => {
    setSearchParams({ theme: id });
    setSearchTerm("");
    setChatQuestion(undefined);
  };

  const handleSuggestionClick = (question: string) => {
    setChatQuestion(question);
    document.getElementById("assistant-juridique")?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://code.travail.gouv.fr/widget.js";
    script.defer = true;
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const filteredThematiques = thematiques.filter(
    (t) =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.articles.some(
        (a) =>
          a.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.contenu.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const currentThematique = thematiques.find((t) => t.id === selectedThematique);

  const isContrat = currentThematique?.id === "contrat-travail";
  const tabsGridClass = isContrat ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-6" : "grid-cols-1 sm:grid-cols-3";

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 p-3 sm:p-4 lg:p-8">

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-[#13233A] p-6 text-white shadow-xl sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border-[52px] border-white/5" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-red-600/25 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <Badge className="mb-4 border border-white/15 bg-white/10 text-white hover:bg-white/10">
              <Scale className="mr-1 h-3.5 w-3.5" /> Code du travail &amp; CCNT Télécoms (IDCC 2148)
            </Badge>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              Vos droits au travail
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/80 sm:text-lg">
              Articles du Code du travail, jurisprudences et dispositions spécifiques à l'accord UES Iliad — toutes vos thématiques en un seul endroit.
            </p>
            <div className="mt-5 relative max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
              <input
                type="text"
                placeholder="Rechercher un droit, un article, un thème…"
                className="w-full rounded-xl border border-white/20 bg-white/10 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-500 backdrop-blur"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              { icon: Scale,   title: "CCNT 2148",   text: "Minima, classification, préavis, congés." },
              { icon: Gavel,   title: "Jurisprudence", text: "Décisions récentes de la Cour de cassation." },
              { icon: Bot,     title: "Assistant IA", text: "Posez vos questions au chatbot juridique." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <item.icon className="mb-3 h-5 w-5 text-red-200" />
                <p className="font-bold text-sm">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/70">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Navigation thématiques */}
      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-xs font-black uppercase tracking-wider text-slate-400">Thématiques</p>
        <div className="flex flex-wrap gap-2">
          {thematiques.map((theme) => (
            <div key={theme.id} className="relative">
              <button
                onClick={() => handleThemeChange(theme.id)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  selectedThematique === theme.id
                    ? "bg-red-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <theme.icon className="h-3.5 w-3.5 shrink-0" />
                {theme.title}
              </button>
              {hasNewContent(theme) && (
                <span className="absolute -top-1.5 -right-1.5 bg-green-500 text-white text-[9px] font-bold px-1 py-px rounded-full leading-none pointer-events-none">
                  NEW
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contenu principal */}
      <section className="mt-4">
        {searchTerm ? (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-700">
              {filteredThematiques.length} thématique{filteredThematiques.length !== 1 ? "s" : ""} pour «&nbsp;{searchTerm}&nbsp;»
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredThematiques.map((theme) => (
                <Card
                  key={theme.id}
                  className="cursor-pointer border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  onClick={() => handleThemeChange(theme.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                        <theme.icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-base font-extrabold text-slate-900">{theme.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-500">{theme.description}</p>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <Badge variant="secondary" className="text-xs">{theme.articles.length} articles</Badge>
                      <Badge variant="outline" className="text-xs">{theme.jurisprudences.length} jurisprudences</Badge>
                      {hasNewContent(theme) && (
                        <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs">✨ Nouveauté</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : currentThematique ? (
          <div className="space-y-4">
            {/* En-tête thématique */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <currentThematique.icon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">{currentThematique.title}</h2>
                  <p className="text-sm text-slate-500">{currentThematique.description}</p>
                </div>
              </div>
            </div>

            <Tabs defaultValue="articles" className="space-y-4">
                  <TabsList
                    className={`grid w-full ${tabsGridClass} gap-1 h-auto py-1.5 bg-slate-100`}
                  >
                    <TabsTrigger value="articles" className="flex items-center justify-center gap-2 py-2">
                      <BookOpen className="w-4 h-4" />
                      <span className="hidden sm:inline">Articles du Code</span>
                      <span className="sm:hidden">Articles</span>
                    </TabsTrigger>
                    <TabsTrigger value="jurisprudences" className="flex items-center justify-center gap-2 py-2">
                      <Gavel className="w-4 h-4" />
                      <span className="hidden sm:inline">Jurisprudences</span>
                      <span className="sm:hidden">Jugements</span>
                    </TabsTrigger>
                    <TabsTrigger value="conseils" className="flex items-center justify-center gap-2 py-2">
                      <Shield className="w-4 h-4" />
                      <span className="hidden sm:inline">Conseils pratiques</span>
                      <span className="sm:hidden">Conseils</span>
                    </TabsTrigger>
                    {isContrat && (
                      <>
                        <TabsTrigger value="minima" className="flex items-center justify-center gap-2 py-2">
                          <Scale className="w-4 h-4" />
                          <span className="hidden lg:inline">Minima conv.</span>
                          <span className="lg:hidden">Minima</span>
                        </TabsTrigger>
                        <TabsTrigger value="classification" className="flex items-center justify-center gap-2 py-2">
                          <GraduationCap className="w-4 h-4" />
                          <span className="hidden lg:inline">Classification</span>
                          <span className="lg:hidden">Groupes</span>
                        </TabsTrigger>
                        <TabsTrigger value="astreintes" className="flex items-center justify-center gap-2 py-2">
                          <Bell className="w-4 h-4" />
                          <span className="hidden lg:inline">Astreintes &amp; Nuit</span>
                          <span className="lg:hidden">Astreintes</span>
                        </TabsTrigger>
                      </>
                    )}
                  </TabsList>

                  {/* ── Articles ── */}
                  <TabsContent value="articles" className="space-y-4">
                    {currentThematique.id === "licenciement" && <CalculateurLicenciement />}

                    {currentThematique.id === "licenciement" && (
                      <Card className="border-red-200">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-base">
                            <Scale className="w-5 h-5 text-red-600" />
                            Barème CCNT 2148 — Indemnité de licenciement
                          </CardTitle>
                          <CardDescription>
                            Plus favorable que le minimum légal — plafond global : 101 % du salaire annuel brut
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-slate-100 border-b">
                                  <th className="text-left px-4 py-3 font-semibold">Ancienneté</th>
                                  <th className="text-center px-4 py-3 font-semibold">Moins de 50 ans</th>
                                  <th className="text-center px-4 py-3 font-semibold">50 ans et plus</th>
                                </tr>
                              </thead>
                              <tbody>
                                {indemniteLicenciementCCNT.map((row, i) => (
                                  <tr key={i} className={`border-b last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                                    <td className="px-4 py-3 font-medium">{row.anciennete}</td>
                                    <td className="px-4 py-3 text-center text-red-600 font-semibold">{row.moinsDe50ans}</td>
                                    <td className="px-4 py-3 text-center text-green-700 font-semibold">{row.plusDe50ans}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {currentThematique.id === "licenciement" && (
                      <Card className="border-red-200">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-base">
                            <Scale className="w-5 h-5 text-red-600" />
                            Barème CCNT 2148 — Indemnité de départ en retraite
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-slate-100 border-b">
                                  <th className="text-left px-4 py-3 font-semibold">Ancienneté</th>
                                  <th className="text-right px-4 py-3 font-semibold">Indemnité</th>
                                </tr>
                              </thead>
                              <tbody>
                                {indemniteRetraiteCCNT.map((row, i) => (
                                  <tr key={i} className={`border-b last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                                    <td className="px-4 py-3 font-medium">{row.anciennete}</td>
                                    <td className="px-4 py-3 text-right font-semibold text-red-600">{row.indemnite}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {currentThematique.id === "maladie-prevoyance" && (
                      <Card className="border-blue-300">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-base">
                            <Activity className="w-5 h-5 text-red-600" />
                            Maintien de salaire — CCNT IDCC 2148
                          </CardTitle>
                          <CardDescription>
                            Aucun délai de carence conventionnel · Condition : 6 mois d'ancienneté
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-slate-100 border-b">
                                  <th className="text-left px-4 py-3 font-semibold">Période d'arrêt</th>
                                  <th className="text-left px-4 py-3 font-semibold">Ancienneté requise</th>
                                  <th className="text-right px-4 py-3 font-semibold">Indemnisation totale</th>
                                </tr>
                              </thead>
                              <tbody>
                                {maladiePreyoyanceIdcc2148.map((row, i) => (
                                  <tr key={i} className={`border-b last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                                    <td className="px-4 py-3 font-medium">{row.periode}</td>
                                    <td className="px-4 py-3 text-slate-500">{row.anciennete}</td>
                                    <td className={`px-4 py-3 text-right font-semibold ${i === 0 ? "text-green-700" : "text-red-600"}`}>
                                      {row.indemnisation}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div className="px-5 py-3 bg-blue-50 border-t border-blue-200 text-xs text-blue-800">
                            💡 <strong>Cumul :</strong> indemnités journalières de la Sécurité sociale + complément employeur = taux garanti ci-dessus.
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {currentThematique.id === "conges-absences" && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-base">
                            <Calendar className="w-5 h-5 text-red-600" />
                            Congés pour événements familiaux — CCNT IDCC 2148
                          </CardTitle>
                          <CardDescription>
                            Certains congés CCNT dépassent les minima légaux (signalés ✅)
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-slate-100 border-b">
                                  <th className="text-left px-4 py-3 font-semibold">Événement</th>
                                  <th className="text-right px-4 py-3 font-semibold">Durée</th>
                                </tr>
                              </thead>
                              <tbody>
                                {congesSpeciauxIdcc2148.map((row, i) => (
                                  <tr key={i} className={`border-b last:border-0 hover:bg-slate-50/80 ${row.favorable ? "bg-green-50" : i % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                                    <td className="px-4 py-3">
                                      <p className="font-medium">{row.evenement}</p>
                                      {row.note && <p className="text-xs text-slate-500 mt-0.5">{row.note}</p>}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                      <span className={`font-semibold ${row.favorable ? "text-green-700" : "text-red-600"}`}>
                                        {row.duree}
                                      </span>
                                      {row.favorable && (
                                        <span className="ml-2 text-xs bg-green-100 text-green-700 rounded-full px-1.5 py-0.5 font-bold">✅ Mieux</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {currentThematique.id === "contrat-travail" && (
                      <Card className="border-red-200">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-base">
                            <Layers className="w-5 h-5 text-red-600" />
                            Période d'essai — CCNT IDCC 2148
                          </CardTitle>
                          <CardDescription>
                            Les durées CCNT sont plus courtes que les maxima légaux, qui s'appliquent en pratique si plus favorables au salarié.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-slate-100 border-b">
                                  <th className="text-left px-4 py-3 font-semibold">Groupe d'emploi</th>
                                  <th className="text-center px-4 py-3 font-semibold">Durée initiale (CCNT)</th>
                                  <th className="text-center px-4 py-3 font-semibold">Renouvellement</th>
                                </tr>
                              </thead>
                              <tbody>
                                {periodeEssaiIdcc2148.map((row, i) => (
                                  <tr key={i} className={`border-b last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                                    <td className="px-4 py-3 font-medium">Groupes {row.groupe}</td>
                                    <td className="px-4 py-3 text-center font-semibold text-red-600">{row.dureeInitiale}</td>
                                    <td className="px-4 py-3 text-center text-slate-500">{row.renouvellement}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div className="px-5 py-3 bg-amber-50 border-t border-amber-200 text-xs text-amber-800">
                            ⚠️ Pendant la période d'essai, un <strong>délai de prévenance</strong> doit être respecté avant toute rupture (de 24 h à 1 mois selon l'ancienneté dans l'essai).
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {currentThematique.articles.map((article, index) => {
                      const isNew = isNewArticle(article);
                      return (
                        <Card
                          key={index}
                          className={isNew ? "border-green-500/40 shadow-sm shadow-green-100" : ""}
                        >
                          <CardHeader>
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="secondary" className="font-mono">
                                  Art. {article.numero}
                                </Badge>
                                {isNew && (
                                  <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs gap-1">
                                    <Sparkles className="w-3 h-3" />
                                    Nouveauté
                                  </Badge>
                                )}
                              </div>
                              <a
                                href={legifranceUrl(article.numero)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1"
                              >
                                Légifrance <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                            <CardTitle className="text-lg">{article.titre}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <p className="text-slate-900 leading-relaxed">{article.contenu}</p>
                            {article.exemple && (
                              <div className="bg-slate-100 rounded-lg p-4 border-l-4 border-red-500">
                                <p className="text-sm font-medium text-slate-900 mb-1">Exemple concret :</p>
                                <p className="text-sm text-slate-500">{article.exemple}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </TabsContent>

                  {/* ── Jurisprudences ── */}
                  <TabsContent value="jurisprudences" className="space-y-4">
                    <Accordion type="single" collapsible className="space-y-2">
                      {currentThematique.jurisprudences.map((juris, index) => (
                        <AccordionItem
                          key={index}
                          value={`juris-${index}`}
                          className="border rounded-lg px-4"
                        >
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex flex-col items-start text-left">
                              <span className="font-semibold">{juris.reference}</span>
                              <span className="text-sm text-slate-500">
                                {juris.juridiction} - {juris.date}
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="space-y-4 pt-2">
                            <div>
                              <h4 className="font-medium text-sm mb-2">Résumé de la décision :</h4>
                              <p className="text-slate-500">{juris.resume}</p>
                            </div>
                            <div className="bg-red-50/50 rounded-lg p-4">
                              <h4 className="font-medium text-sm text-red-600 mb-2">Portée de la décision :</h4>
                              <p className="text-sm text-slate-900">{juris.portee}</p>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </TabsContent>

                  {/* ── Conseils ── */}
                  <TabsContent value="conseils">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-red-600" />
                          Conseils pratiques
                        </CardTitle>
                        <CardDescription>
                          Recommandations pour faire valoir vos droits efficacement
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {currentThematique.conseils.map((conseil, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <ChevronRight className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                              <span className="text-slate-900">{conseil}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-8 p-4 bg-slate-100 rounded-lg">
                          <p className="text-sm text-slate-500">
                            <strong className="text-slate-900">Besoin d'aide ?</strong> Nos
                            représentants syndicaux sont à votre disposition pour vous accompagner.
                          </p>
                          <Button asChild className="mt-4 bg-red-600 hover:bg-red-700 text-white">
                            <Link to="/contact">Contacter un représentant</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* ── Minima conventionnels ── */}
                  {isContrat && (
                    <TabsContent value="minima" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Scale className="w-5 h-5 text-red-600" />
                            Minima Conventionnels — IDCC 2148
                          </CardTitle>
                          <CardDescription>
                            Salaires minimaux annuels garantis selon votre groupe d'emploi. Mise à jour 2025 → 2026.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="overflow-x-auto rounded-b-lg">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-slate-100 border-b">
                                  <th className="text-left px-4 py-3 font-semibold text-slate-900">Groupe</th>
                                  <th className="text-left px-4 py-3 font-semibold text-slate-900">Seuil</th>
                                  <th className="text-right px-4 py-3 font-semibold text-slate-500">2025</th>
                                  <th className="text-right px-4 py-3 font-semibold text-slate-900">2026 ✦</th>
                                </tr>
                              </thead>
                              <tbody>
                                {minimaIdcc2148.map((row, i) => (
                                  <tr key={i} className={`border-b last:border-0 hover:bg-slate-50/80 ${i % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                                    <td className="px-4 py-3 font-medium">Groupe {row.groupe}</td>
                                    <td className="px-4 py-3 text-slate-500">{row.seuil}</td>
                                    <td className="px-4 py-3 text-right text-slate-500 line-through">{fmt(row.salaire2025)}</td>
                                    <td className="px-4 py-3 text-right font-semibold text-red-600">{fmt(row.salaire2026)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div className="px-5 py-3 bg-blue-50 border-t border-blue-200 text-xs text-blue-800">
                            ✦ Valeurs 2026 issues de l'avenant salarial CCNT (IDCC 2148) — Source : Éditions Tissot, mis à jour le 23 février 2026.
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  )}

                  {/* ── Classification des emplois ── */}
                  {isContrat && (
                    <TabsContent value="classification" className="space-y-4">
                      <div className="rounded-xl border border-red-200 bg-red-50/50 px-5 py-4 mb-2">
                        <p className="text-sm text-slate-900 leading-relaxed">
                          <span className="font-semibold">7 groupes de classification</span> (A à G) définissent votre positionnement dans la CCNT Télécoms (IDCC 2148).
                          Ils déterminent votre <strong>salaire minimum garanti</strong>, la <strong>durée de votre période d'essai</strong> et de votre <strong>préavis</strong>.
                          La classification croît avec la complexité, l'autonomie et l'impact de vos décisions.
                        </p>
                      </div>
                      <Accordion type="multiple" className="space-y-2">
                        {classificationGroupes.map((grp, i) => (
                          <AccordionItem
                            key={i}
                            value={`grp-${grp.groupe}`}
                            className="border rounded-lg px-4"
                          >
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center gap-3">
                                <span className="w-9 h-9 rounded-full bg-red-50 text-red-600 font-bold text-sm flex items-center justify-center flex-shrink-0">
                                  {grp.groupe}
                                </span>
                                <div className="text-left">
                                  <p className="font-semibold text-slate-900">Groupe {grp.groupe}</p>
                                  <p className="text-xs text-slate-500">{grp.diplome}</p>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-3">
                              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                                <div className="p-3 rounded-lg bg-slate-100/60">
                                  <p className="font-medium text-slate-900 mb-1">🔧 Complexité</p>
                                  <p className="text-slate-500">{grp.complexite}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-slate-100/60">
                                  <p className="font-medium text-slate-900 mb-1">🔓 Autonomie</p>
                                  <p className="text-slate-500">{grp.autonomie}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-slate-100/60">
                                  <p className="font-medium text-slate-900 mb-1">📊 Impact des décisions</p>
                                  <p className="text-slate-500">{grp.impact}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-red-50/50 border border-red-200">
                                  <p className="font-medium text-slate-900 mb-1">🎓 Connaissances requises</p>
                                  <p className="text-slate-500">{grp.connaissances}</p>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </TabsContent>
                  )}

                  {/* ── Astreintes & Nuit ── */}
                  {isContrat && (
                    <TabsContent value="astreintes" className="space-y-8">

                      <div className="rounded-xl border border-red-200 bg-red-50/50 px-5 py-4">
                        <p className="text-sm text-slate-900 leading-relaxed">
                          <span className="font-semibold">Comment lire ce tableau :</span> La colonne{" "}
                          <span className="font-semibold text-red-600">Accord UES Iliad</span> affiche ce que
                          l'entreprise applique en pratique (Avenant 2 du 9 novembre 2023, en vigueur depuis
                          le 1er septembre 2023). Lorsque l'accord est{" "}
                          <span className="font-semibold text-green-700">plus favorable ✅</span> que la
                          convention collective nationale des télécommunications (CCNT / IDCC 2148), la ligne
                          est mise en évidence.
                        </p>
                      </div>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            ⚖️ Comparatif CCNT (IDCC 2148) vs Accord UES Iliad
                          </CardTitle>
                          <CardDescription>
                            Heures supplémentaires · Travail de nuit · Dimanche · Jours fériés
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-slate-100 border-b">
                                  <th className="text-left px-4 py-3 font-semibold text-slate-900">Situation</th>
                                  <th className="text-center px-4 py-3 font-semibold text-slate-900">
                                    <span className="inline-block bg-slate-100 text-slate-700 rounded px-2 py-0.5 text-xs font-bold tracking-wide">CCNT seule</span>
                                  </th>
                                  <th className="text-center px-4 py-3 font-semibold text-slate-900">
                                    <span className="inline-block bg-red-50 text-red-600 rounded px-2 py-0.5 text-xs font-bold tracking-wide">Accord UES Iliad</span>
                                  </th>
                                  <th className="text-center px-4 py-3 font-semibold text-slate-900">Écart</th>
                                </tr>
                              </thead>
                              <tbody>
                                {majorationsComparatives.map((row, i) => (
                                  <tr
                                    key={i}
                                    className={`border-b last:border-0 transition-colors ${
                                      row.delta === "better"
                                        ? "bg-green-50 hover:bg-green-100/60"
                                        : i % 2 === 0 ? "bg-white hover:bg-slate-50/80" : "bg-slate-50 hover:bg-slate-50/80"
                                    }`}
                                  >
                                    <td className="px-4 py-3">
                                      <p className="font-medium text-slate-900">{row.label}</p>
                                      {row.note && <p className="text-xs text-slate-500 mt-0.5 leading-snug">{row.note}</p>}
                                    </td>
                                    <td className="px-4 py-3 text-center"><span className="font-mono text-slate-700">{row.ccnt}</span></td>
                                    <td className="px-4 py-3 text-center">
                                      <span className={`font-mono font-semibold ${row.delta === "better" ? "text-green-700" : "text-slate-900"}`}>
                                        {row.accord}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      {row.delta === "better" ? (
                                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full px-2 py-0.5 whitespace-nowrap">✅ Mieux</span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-100 rounded-full px-2 py-0.5">= Identique</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">📟 Barème des astreintes — Accord UES Iliad</CardTitle>
                          <CardDescription>
                            Forfaits de disponibilité (hors intervention) · en vigueur depuis le 1er sept. 2022.{" "}
                            <span className="text-amber-700 font-medium">La CCNT ne fixe pas de montant minimal d'astreinte : l'accord est la seule référence.</span>
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-slate-100 border-b">
                                  <th className="text-left px-4 py-3 font-semibold text-slate-900">Société</th>
                                  <th className="text-left px-4 py-3 font-semibold text-slate-900">Période</th>
                                  <th className="text-center px-4 py-3 font-semibold text-slate-900">Forfait disponibilité</th>
                                  <th className="text-center px-4 py-3 font-semibold text-slate-900">Majoration intervention</th>
                                </tr>
                              </thead>
                              <tbody>
                                {astreintesIliad.map((row, i) => (
                                  <tr key={i} className={`border-b last:border-0 hover:bg-slate-50/80 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                                    <td className="px-4 py-3">
                                      <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${row.societe === "Free Mobile" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>
                                        {row.societe}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 font-medium text-slate-900">{row.periode}</td>
                                    <td className="px-4 py-3 text-center font-mono font-semibold text-red-600">{row.forfait}</td>
                                    <td className="px-4 py-3 text-center text-sm text-slate-900">
                                      {row.majorationIntervention}
                                      {row.note && <p className="text-xs text-slate-500 mt-0.5 font-normal">{row.note}</p>}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div className="px-5 py-3 bg-amber-50 border-t border-amber-200 text-xs text-amber-800">
                            ⚠️ <strong>Temps de déplacement aller-retour</strong> vers le lieu d'intervention : considéré comme travail effectif et remboursé selon les règles de frais de l'entreprise.
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>🛌 Durées maximales &amp; temps de repos en régime d'astreinte</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
                              <p className="text-sm font-semibold text-blue-900 mb-2">Règle générale (CCNT &amp; Accord Iliad)</p>
                              <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Repos quotidien minimum : <strong>11 h</strong> consécutives</li>
                                <li>• Repos hebdomadaire minimum : <strong>35 h</strong> consécutives</li>
                                <li>• Maximum <strong>1 semaine sur 3</strong> en astreinte</li>
                                <li>• Durée max de l'astreinte : <strong>7 jours</strong> consécutifs</li>
                              </ul>
                            </div>
                            <div className="p-4 rounded-lg border bg-amber-50 border-amber-200">
                              <p className="text-sm font-semibold text-amber-900 mb-2">En cas d'intervention — Accord Iliad</p>
                              <ul className="text-sm text-amber-800 space-y-1">
                                <li>• L'intervention compte comme <strong>travail effectif</strong></li>
                                <li>• Après intervention : <strong>11 h de repos</strong> avant reprise</li>
                                <li>• Dérogation exceptionnelle (réseau/internet) : repos réduit à <strong>9 h minimum</strong></li>
                                <li>• Contacter le manager dans tous les cas</li>
                              </ul>
                            </div>
                            <div className="p-4 rounded-lg border bg-purple-50 border-purple-200 md:col-span-2">
                              <p className="text-sm font-semibold text-purple-900 mb-1">🩺 Suivi médical renforcé (Accord Iliad — supérieur à la loi)</p>
                              <p className="text-sm text-purple-800">
                                Les salariés effectuant au minimum <strong>12 semaines d'astreintes par an</strong> bénéficient d'une <strong>visite médicale annuelle obligatoire</strong>.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>💶 Protection en cas de sortie du régime d'astreinte</CardTitle>
                          <CardDescription>Disposition propre à l'Accord Iliad — aucun équivalent dans la CCNT seule</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="p-4 rounded-lg border border-green-300 bg-green-50">
                            <p className="text-sm text-green-900 leading-relaxed">
                              Si l'employeur retire définitivement un salarié du planning d'astreinte (hors sanction disciplinaire), celui-ci perçoit pendant <strong>3 mois</strong> une indemnité compensatrice égale à <strong>75 % de la moyenne mensuelle</strong> des compensations d'astreinte et d'intervention reçues sur les <strong>12 derniers mois</strong>. Cette prime cesse automatiquement en cas de retour en astreinte.
                            </p>
                          </div>
                          <p className="text-xs text-slate-500 mt-3">
                            Source : Avenant 2 du 9 novembre 2023, art. 2.2.5 — UES Iliad (en vigueur depuis le 1er sept. 2023).
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-red-600" />
                            🚪 Durée du préavis — IDCC 2148
                          </CardTitle>
                          <CardDescription>
                            Délai entre l'annonce du départ et le dernier jour travaillé (hors période d'essai)
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-slate-100 border-b">
                                  <th className="text-left px-4 py-3 font-semibold text-slate-900">Groupe d'emploi</th>
                                  <th className="text-left px-4 py-3 font-semibold text-slate-900">Condition</th>
                                  <th className="text-right px-4 py-3 font-semibold text-slate-900">Durée</th>
                                </tr>
                              </thead>
                              <tbody>
                                {preavisIdcc2148.map((row, i) => (
                                  <tr key={i} className={`border-b last:border-0 hover:bg-slate-50/80 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                                    <td className="px-4 py-3 font-medium">Groupes {row.groupe}</td>
                                    <td className="px-4 py-3 text-slate-500">{row.condition}</td>
                                    <td className="px-4 py-3 text-right font-semibold text-red-600">{row.duree}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div className="px-5 py-3 bg-blue-50 border-t border-blue-200 text-xs text-blue-800">
                            💡 <strong>En cas de licenciement :</strong> vous disposez de <strong>2 heures par jour payées</strong> pour chercher un nouvel emploi pendant votre préavis (Accord Iliad art. 1.2.1).
                          </div>
                          <div className="px-5 py-3 bg-slate-50 border-t text-xs text-slate-500">
                            Source : CCNT (IDCC 2148) — 2026. En cas de litige, consultez votre représentant syndical ou un avocat spécialisé en droit du travail.
                          </div>
                        </CardContent>
                      </Card>

                    </TabsContent>
                  )}
                </Tabs>

            {/* Questions suggérées */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <Bot className="w-4 h-4 text-red-600" />
                Questions fréquentes — posez-les à l'assistant :
              </p>
              <div className="flex flex-wrap gap-2">
                {currentThematique.questionsSuggestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(q)}
                    className="text-xs px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-red-50 hover:border-red-300 text-slate-700 transition-colors text-left"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {/* Chatbot */}
      <section id="assistant-juridique" className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Assistant juridique FO COM</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">
              Réponses basées sur le Code du travail et la CCNT Télécoms. Cet assistant fournit des informations générales — consultez un représentant syndical pour votre situation personnelle.
            </p>
          </div>
        </div>
        <ChatbotJuridique
          initialQuestion={chatQuestion}
          ccntContext={buildCcntContext(currentThematique?.id)}
        />
      </section>

      {/* CTA */}
      <section className="mt-4 rounded-3xl bg-gradient-to-br from-red-600 to-red-700 p-6 text-white shadow-lg sm:p-8">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="text-xl font-extrabold">Une question sur vos droits ?</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-red-50">
              Nos représentants syndicaux sont formés pour vous accompagner et défendre vos droits au sein de l'UES Iliad.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="bg-white text-red-700 hover:bg-red-50">
              <Link to="/contact"><Mail className="mr-2 h-4 w-4" /> Nous contacter</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20">
              <Link to="/adhesion">Adhérer à FO COM</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default VosDroits;
