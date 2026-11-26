import React, { useState, useEffect } from "react";
import { X, Lock, Sparkles, Flame, Trophy, Mail } from "lucide-react";

// ---------------------------------------------------------------------------
// Calendrier de l'Avent FO COM UES Iliad — décembre 2026
// Un quiz par jour (code du travail et syndicalisme) + une surprise.
// Progression mémorisée en localStorage : aucun compte requis.
// Chaque case se déverrouille le jour venu (heure de Paris) ; les jours
// passés restent ouverts pour permettre le rattrapage.
// ---------------------------------------------------------------------------

interface DayQuiz {
  question: string;
  options: string[];
  answer: number;
  explain: string;
}

interface DaySurprise {
  kind: "Fait" | "Citation" | "Anecdote";
  text: string;
}

interface AdventDay {
  quiz: DayQuiz;
  surprise: DaySurprise;
}

const ADVENT_DAYS: AdventDay[] = [
  {
    quiz: {
      question: "Quelle est la durée légale hebdomadaire du travail en France depuis 2000 ?",
      options: ["39 heures", "35 heures", "40 heures"],
      answer: 1,
      explain: "Les 35 heures ont été instaurées par les lois Aubry (2000). La semaine de 40 heures datait, elle, du Front populaire (1936).",
    },
    surprise: {
      kind: "Fait",
      text: "Le mot « travail » vient du latin tardif tripalium, un instrument à trois pieux. Le sens de « peine » a traversé les siècles jusque dans nos contrats.",
    },
  },
  {
    quiz: {
      question: "Combien de jours ouvrables de congés payés acquiert-on par mois travaillé ?",
      options: ["2,5 jours", "1,5 jour", "3,5 jours"],
      answer: 0,
      explain: "Article L3141-3 du Code du travail : 2,5 jours ouvrables par mois de travail, soit 5 semaines par an. Les congés payés datent de 1936 (2 semaines, passées à 3 en 1956 puis 5 en 1982).",
    },
    surprise: {
      kind: "Anecdote",
      text: "En 1936, les premiers congés payés duraient deux semaines. Pour la plupart des salariés, « partir » signifiait aller chez la famille, à quelques kilomètres. Le train et la plage, c'était déjà du luxe.",
    },
  },
  {
    quiz: {
      question: "À partir de combien de salariés un CSE doit-il être mis en place ?",
      options: ["50 salariés", "11 salariés", "25 salariés"],
      answer: 1,
      explain: "Depuis 2019, le CSE (Comité social et économique) est obligatoire dès 11 salariés (article L2311-1). En dessous, une délégation unique du personnel peut exister.",
    },
    surprise: {
      kind: "Anecdote",
      text: "Le CSE a fusionné trois institutions : le comité d'entreprise (1945), les délégués du personnel (1936) et le CHSCT (1982). Trois générations de droits sociaux dans une seule instance.",
    },
  },
  {
    quiz: {
      question: "Qui peut exercer un droit de retrait au travail ?",
      options: ["Uniquement les élus du CSE", "Uniquement les représentants syndicaux", "Tout travailleur"],
      answer: 2,
      explain: "Article L4131-1 : tout travailleur peut se retirer d'une situation de travail présentant un danger grave et imminent. Aucune sanction, aucune retenue de salaire ne peuvent en découler.",
    },
    surprise: {
      kind: "Fait",
      text: "L'employeur est tenu à une obligation de sécurité : un accident du travail peut engager sa responsabilité même sans faute prouvée de sa part.",
    },
  },
  {
    quiz: {
      question: "Par défaut, à quel taux sont majorées les 8 premières heures supplémentaires de la semaine ?",
      options: ["10 %", "25 %", "50 %"],
      answer: 1,
      explain: "Le taux légal est de 25 % pour les 8 premières heures (de la 36e à la 43e), puis 50 % au-delà. Un accord collectif peut prévoir des taux différents, dans certaines limites.",
    },
    surprise: {
      kind: "Fait",
      text: "Les heures supplémentaires sont plafonnées à 220 par an et par salarié (le « contingent »). Au-delà, l'accord du CSE est requis.",
    },
  },
  {
    quiz: {
      question: "En quelle année Force Ouvrière est-elle fondée ?",
      options: ["1895", "1948", "1964"],
      answer: 1,
      explain: "La CGT-Force Ouvrière naît en avril 1948 d'une scission de la CGT, pour garantir l'indépendance du syndicalisme envers tout parti politique.",
    },
    surprise: {
      kind: "Fait",
      text: "FO refuse la « double casquette » : cumuler un mandat syndical et un mandat politique. Un principe d'indépendance hérité de la Charte d'Amiens.",
    },
  },
  {
    quiz: {
      question: "Quelle loi a reconnu la liberté syndicale en France ?",
      options: ["La loi Waldeck-Rousseau (1884)", "La loi Auroux (1982)", "La loi El Khomri (2016)"],
      answer: 0,
      explain: "La loi du 21 mars 1884 légalise les syndicats professionnels, abrogeant l'interdiction des coalitions instaurée par la loi Le Chapelier (1791).",
    },
    surprise: {
      kind: "Anecdote",
      text: "Avant 1884, se syndiquer relevait du délit : il a fallu 93 ans pour abroger la loi Le Chapelier, adoptée sous la Révolution pour interdire les « coalitions » d'ouvriers.",
    },
  },
  {
    quiz: {
      question: "Par défaut, quelle est la durée maximale de la période d'essai d'un cadre en CDI, renouvellement inclus ?",
      options: ["4 mois", "6 mois", "8 mois"],
      answer: 2,
      explain: "Pour les cadres : 4 mois, renouvelables une fois, soit 8 mois maximum. Pour les non-cadres : 2 mois (4 avec renouvellement). Un accord de branche peut prévoir d'autres durées.",
    },
    surprise: {
      kind: "Fait",
      text: "La période d'essai doit figurer dans le contrat ou la lettre d'engagement : à défaut, elle n'existe pas, même en CDI.",
    },
  },
  {
    quiz: {
      question: "Le 1er mai est le seul jour férié…",
      options: ["chômé et payé pour tous par la loi", "qui donne systématiquement lieu à un pont", "réservé aux secteurs industriels"],
      answer: 0,
      explain: "Le 1er mai est le seul jour férié légalement chômé et payé dans toutes les entreprises (sauf travaux ne pouvant être interrompus, avec contreparties).",
    },
    surprise: {
      kind: "Fait",
      text: "Le 1er mai honore les martyrs de Chicago (1886), grévistes réclamant la journée de 8 heures. La date s'impose en France comme jour férié en 1947, chômé et payé en 1948.",
    },
  },
  {
    quiz: {
      question: "Qui représente une organisation syndicale auprès de l'employeur dans l'entreprise ?",
      options: ["Le secrétaire du CSE", "Le délégué syndical", "Le référent harcèlement"],
      answer: 1,
      explain: "Le délégué syndical négocie les accords collectifs, en contrôle l'application et défend les salariés. Il est désigné par un syndicat représentatif (dès 50 salariés pour le DS « classique »).",
    },
    surprise: {
      kind: "Fait",
      text: "Une section syndicale peut exister dès 2 salariés dans l'entreprise : il n'existe aucun seuil pour se syndiquer.",
    },
  },
  {
    quiz: {
      question: "Quand le SMIC est-il revalorisé automatiquement, au minimum une fois par an ?",
      options: ["Au 1er janvier", "Au 1er mai", "À chaque élection présidentielle"],
      answer: 0,
      explain: "Le SMIC est revalorisé chaque 1er janvier, avec une revalorisation possible en cours d'année si l'inflation constatée dépasse 2 %.",
    },
    surprise: {
      kind: "Fait",
      text: "Le SMIC a remplacé le SMIG (Salaire minimum interprofessionnel garanti) en 1970. Il est aujourd'hui indexé sur l'inflation et le salaire médian.",
    },
  },
  {
    quiz: {
      question: "La modulation du temps de travail, c'est…",
      options: ["une répartition inégale des heures sur l'année, à moyenne constante", "travailler uniquement le matin", "des heures payées double le soir"],
      answer: 0,
      explain: "La modulation répartit la durée du travail sur l'année (semaines hautes et basses) autour d'une moyenne. Elle est encadrée par un accord collectif.",
    },
    surprise: {
      kind: "Fait",
      text: "Sur une année complète, le plafond légal est de 1 607 heures travaillées : au-delà, chaque heure est une heure supplémentaire.",
    },
  },
  {
    quiz: {
      question: "Le « droit d'alerte » du CSE lui permet…",
      options: ["d'arrêter lui-même une machine dangereuse", "d'alerter l'employeur, et au besoin l'inspection du travail, sur un danger grave", "de suspendre le règlement intérieur"],
      answer: 1,
      explain: "En cas de danger grave (constaté ou révélé par un accident), le CSE alerte immédiatement l'employeur et, si nécessaire, l'inspection du travail et la médecine du travail, et propose des mesures.",
    },
    surprise: {
      kind: "Anecdote",
      text: "Le droit d'alerte existe depuis la loi Auroux de 1982 : héritier du CHSCT, c'est aujourd'hui l'un des leviers les plus puissants du CSE en matière de sécurité.",
    },
  },
  {
    quiz: {
      question: "Que proclame la Charte d'Amiens (1906) ?",
      options: ["Le droit de grève", "L'indépendance du syndicalisme vis-à-vis des partis politiques", "La journée de 8 heures"],
      answer: 1,
      explain: "Adoptée par le congrès confédéral d'Amiens le 13 octobre 1906, la Charte affirme l'indépendance du mouvement syndical envers les partis politiques. FO s'y réfère toujours.",
    },
    surprise: {
      kind: "Citation",
      text: "« Le syndicat groupant, en vue de l'action, tous les travailleurs conscients de la lutte à mener… » — premiers mots de la Charte d'Amiens, 1906.",
    },
  },
  {
    quiz: {
      question: "La visite d'information et de prévention (VIP) à l'embauche est…",
      options: ["à la charge de l'employeur, pendant le temps de travail", "aux frais du salarié, sur son temps libre", "facultative après deux ans d'ancienneté"],
      answer: 0,
      explain: "La VIP a remplacé l'ancienne visite d'embauche. Elle est organisée par l'employeur, pendant les heures de travail, sans retenue de salaire.",
    },
    surprise: {
      kind: "Fait",
      text: "La médecine du travail est obligatoire en France depuis 1946, quelle que soit la taille de l'entreprise.",
    },
  },
  {
    quiz: {
      question: "Pour un premier enfant, la durée légale du congé maternité est de…",
      options: ["8 semaines", "16 semaines", "26 semaines"],
      answer: 1,
      explain: "6 semaines avant l'accouchement, 10 semaines après, sans condition d'ancienneté. L'interdiction d'emploi couvre les 8 semaines suivant la naissance.",
    },
    surprise: {
      kind: "Fait",
      text: "Le congé maternité est d'ordre public : la salariée ne peut pas renoncer au repos légal, l'employeur ne peut pas l'y contraindre.",
    },
  },
  {
    quiz: {
      question: "Face à un harcèlement moral avéré, l'employeur doit…",
      options: ["prendre des mesures immédiates pour le faire cesser", "saisir le procureur dans les 48 heures", "transférer la victime dans un autre service"],
      answer: 0,
      explain: "L'employeur a une obligation de prévention ; en cas de harcèlement constaté, il doit agir immédiatement pour y mettre fin. Aucune mesure défavorable ne peut frapper la victime ou les témoins.",
    },
    surprise: {
      kind: "Fait",
      text: "Le harcèlement moral est puni de 2 ans d'emprisonnement et 30 000 € d'amende. Avec l'accord de la victime, le syndicat peut engager l'action en justice à sa place.",
    },
  },
  {
    quiz: {
      question: "Dans une entreprise de 11 à 24 salariés, combien de titulaires siègent au CSE ?",
      options: ["1", "3", "5"],
      answer: 0,
      explain: "Un titulaire (et un suppléant). Le nombre d'élus augmente avec les effectifs, par tranches fixées par le Code du travail.",
    },
    surprise: {
      kind: "Anecdote",
      text: "Dans l'UES Iliad, le CSE couvre plusieurs sociétés du groupe (Iliad, Free SAS, Free Mobile…) : c'est le principe de l'unité économique et sociale (UES).",
    },
  },
  {
    quiz: {
      question: "Où le droit de grève est-il garanti en France ?",
      options: ["Dans le Code du travail uniquement", "Dans le préambule de la Constitution de 1946", "Dans le règlement intérieur de l'entreprise"],
      answer: 1,
      explain: "Le préambule de la Constitution du 27 octobre 1946 (rattaché à celle de 1958) proclame le droit de grève « dans le cadre des lois qui le réglementent ».",
    },
    surprise: {
      kind: "Fait",
      text: "La grève est légale depuis la loi Ollivier du 25 mai 1864. Avant, le délit de coalition pouvait envoyer les grévistes en prison.",
    },
  },
  {
    quiz: {
      question: "Qui gère les activités sociales et culturelles (ASC) de l'entreprise ?",
      options: ["Le service RH", "Le CSE", "L'employeur seul"],
      answer: 1,
      explain: "Les ASC (chèques-vacances, arbres de Noël, colonies de vacances, billetteries…) relèvent de l'initiative du CSE, avec un budget dédié.",
    },
    surprise: {
      kind: "Anecdote",
      text: "L'arbre de Noël du CSE est une tradition héritée du comité d'entreprise de 1945 : présent chaque décembre dans des milliers d'entreprises.",
    },
  },
  {
    quiz: {
      question: "Depuis 2021, quelle est la durée du congé paternité et d'accueil de l'enfant ?",
      options: ["11 jours", "25 jours", "32 jours"],
      answer: 1,
      explain: "4 jours obligatoires à la naissance + 25 jours de congé paternité (32 en cas de naissances multiples). Il se prend dans les 6 mois, en une ou deux périodes.",
    },
    surprise: {
      kind: "Fait",
      text: "Instauré en 2002 avec 11 jours, le congé paternité a plus que doublé en 2021. Il est indemnisé par la Sécurité sociale.",
    },
  },
  {
    quiz: {
      question: "Qui a écrit les paroles de L'Internationale ?",
      options: ["Eugène Pottier", "Jean Jaurès", "Victor Hugo"],
      answer: 0,
      explain: "Eugène Pottier, membre de la Commune de Paris, écrit le poème en juin 1871. La musique est composée par Pierre Degeyter en 1888.",
    },
    surprise: {
      kind: "Citation",
      text: "« Debout ! les damnés de la terre… » — écrit en 1871 par Eugène Pottier, caché dans Paris juste après la Semaine sanglante.",
    },
  },
  {
    quiz: {
      question: "Qui signe un accord collectif d'entreprise ?",
      options: ["Le CSE, à la majorité de ses membres", "Les organisations syndicales représentatives", "L'employeur, après consultation du CSE"],
      answer: 1,
      explain: "Les accords d'entreprise sont conclus par une ou plusieurs organisations syndicales représentatives. Leur signature engage le syndicat : c'est un acte militant, pas une formalité.",
    },
    surprise: {
      kind: "Fait",
      text: "Un accord d'entreprise peut être plus favorable que la loi ou la branche, jamais moins favorable : c'est le principe de faveur.",
    },
  },
  {
    quiz: {
      question: "Question finale : le mot « syndicat » vient du grec « syndikos », qui signifie…",
      options: ["défenseur, celui qui plaide la cause d'autrui", "rassembler", "chef d'atelier"],
      answer: 0,
      explain: "Du grec syndikos (« avocat, défenseur ») : le syndicat est, étymologiquement, celui qui défend la cause commune. Joyeux Noël !",
    },
    surprise: {
      kind: "Citation",
      text: "« Tout travailleur participe, par l'intermédiaire de ses délégués, à la détermination collective des conditions de travail. » — Préambule de la Constitution du 27 octobre 1946. Joyeux Noël à tous !",
    },
  },
];

const STORAGE_KEY = "avent_focom_2026";
const ADVENT_DEADLINE = new Date("2026-12-01T00:00:00+01:00").getTime();
const AVENT_FUNCTION_URL = (import.meta.env.VITE_SUPABASE_URL ?? "") + "/functions/v1/avent-reminder";

// ---------------------------------------------------------------------------
// Thèmes visuels : chaque thème définit des variables CSS (--av-*) injectées
// sur la racine de la page, ce qui relook toute l'interface sans duplication.
// ---------------------------------------------------------------------------

interface AventTheme {
  id: string;
  label: string;
  emoji: string;
  vars: Record<string, string>;
}

const AVENT_THEMES: AventTheme[] = [
  {
    id: "cosy",
    label: "Cosy",
    emoji: "\ud83c\udf84",
    vars: {
      "--av-bg1": "#241812",
      "--av-bg2": "#160f09",
      "--av-ink": "#f6ead3",
      "--av-card": "#3a2a1e",
      "--av-card-soft": "rgba(58,42,30,0.7)",
      "--av-card-border": "#57402c",
      "--av-accent": "#e8c07a",
      "--av-accent2": "#d4a24e",
      "--av-accent-border": "rgba(212,162,78,0.4)",
      "--av-muted": "#c9a86a",
      "--av-muted2": "#c9b28a",
      "--av-subtitle": "#d9c19a",
      "--av-faint": "#a98a5c",
      "--av-faint2": "#8a6a3a",
      "--av-halo1": "rgba(212,162,78,0.15)",
      "--av-halo2": "rgba(179,64,47,0.15)",
      "--av-halo3": "rgba(138,90,46,0.15)",
      "--av-thread": "rgba(212,162,78,0.6)",
      "--av-veil": "rgba(36,24,18,0.5)",
      "--av-logo-glow": "rgba(212,162,78,0.35)",
      "--av-paper": "#f6ead3",
      "--av-paper2": "#fbf3e0",
      "--av-paper-border": "#d9c19a",
      "--av-paper-border-soft": "#e6d6b8",
      "--av-paper-muted": "#8a6a3a",
      "--av-dark-ink": "#3a2a1e",
      "--av-gift1": "#b3402f",
      "--av-gift1-deep": "#7f261c",
      "--av-gift1-ink": "#f6ead3",
      "--av-gift2": "#e9d5b0",
      "--av-gift2-deep": "#d3b98a",
      "--av-gift2-ink": "#7f261c",
      "--av-ribbon1": "rgba(232,192,122,0.9)",
      "--av-ribbon2": "rgba(179,64,47,0.8)",
      "--av-lock": "rgba(26,17,11,0.75)",
      "--av-lock-icon": "rgba(212,162,78,0.7)",
      "--av-overlay": "rgba(18,12,7,0.85)",
      "--av-close-hover": "rgba(246,234,211,0.2)",
      "--av-glow": "rgba(212,162,78,0.55)",
      "--av-glow-fade": "rgba(212,162,78,0)",
      "--av-sparkle": "#b3402f",
    },
  },
  {
    id: "neige",
    label: "Neige",
    emoji: "\u2744\ufe0f",
    vars: {
      "--av-bg1": "#14304a",
      "--av-bg2": "#0a1826",
      "--av-ink": "#eef7ff",
      "--av-card": "#1b3a55",
      "--av-card-soft": "rgba(27,58,85,0.7)",
      "--av-card-border": "#40617f",
      "--av-accent": "#a9dcf7",
      "--av-accent2": "#6fb6dd",
      "--av-accent-border": "rgba(111,182,221,0.4)",
      "--av-muted": "#9dc0d8",
      "--av-muted2": "#b8cfe0",
      "--av-subtitle": "#cfe3f0",
      "--av-faint": "#7fa3bd",
      "--av-faint2": "#6b93af",
      "--av-halo1": "rgba(111,182,221,0.15)",
      "--av-halo2": "rgba(79,140,190,0.15)",
      "--av-halo3": "rgba(58,110,160,0.15)",
      "--av-thread": "rgba(151,205,235,0.6)",
      "--av-veil": "rgba(20,48,74,0.42)",
      "--av-logo-glow": "rgba(151,205,235,0.35)",
      "--av-paper": "#eff7fc",
      "--av-paper2": "#f9fcfe",
      "--av-paper-border": "#cfe0ec",
      "--av-paper-border-soft": "#e2edf5",
      "--av-paper-muted": "#7189a0",
      "--av-dark-ink": "#17293a",
      "--av-gift1": "#3f7fae",
      "--av-gift1-deep": "#27506f",
      "--av-gift1-ink": "#eef7ff",
      "--av-gift2": "#dbe9f4",
      "--av-gift2-deep": "#b7d2e6",
      "--av-gift2-ink": "#27506f",
      "--av-ribbon1": "rgba(238,247,255,0.9)",
      "--av-ribbon2": "rgba(63,127,174,0.8)",
      "--av-lock": "rgba(10,24,38,0.75)",
      "--av-lock-icon": "rgba(111,182,221,0.7)",
      "--av-overlay": "rgba(8,18,30,0.85)",
      "--av-close-hover": "rgba(238,247,255,0.2)",
      "--av-glow": "rgba(151,205,235,0.55)",
      "--av-glow-fade": "rgba(151,205,235,0)",
      "--av-sparkle": "#3f7fae",
    },
  },
  {
    id: "sapin",
    label: "Sapin",
    emoji: "\ud83c\udf32",
    vars: {
      "--av-bg1": "#12301f",
      "--av-bg2": "#0a1d12",
      "--av-ink": "#f2f7ec",
      "--av-card": "#1b4029",
      "--av-card-soft": "rgba(27,64,41,0.7)",
      "--av-card-border": "#3e6b4d",
      "--av-accent": "#e8c07a",
      "--av-accent2": "#d4a24e",
      "--av-accent-border": "rgba(212,162,78,0.4)",
      "--av-muted": "#b7cda0",
      "--av-muted2": "#c3d4b0",
      "--av-subtitle": "#d3e0c4",
      "--av-faint": "#94ab84",
      "--av-faint2": "#7c9468",
      "--av-halo1": "rgba(212,162,78,0.15)",
      "--av-halo2": "rgba(179,64,47,0.15)",
      "--av-halo3": "rgba(74,120,60,0.15)",
      "--av-thread": "rgba(212,162,78,0.6)",
      "--av-veil": "rgba(18,48,31,0.5)",
      "--av-logo-glow": "rgba(212,162,78,0.35)",
      "--av-paper": "#f7f4e8",
      "--av-paper2": "#fdfbf2",
      "--av-paper-border": "#ddd6bc",
      "--av-paper-border-soft": "#e8e2cc",
      "--av-paper-muted": "#8a8264",
      "--av-dark-ink": "#2b3a24",
      "--av-gift1": "#b3402f",
      "--av-gift1-deep": "#7f261c",
      "--av-gift1-ink": "#f6ead3",
      "--av-gift2": "#e9d5b0",
      "--av-gift2-deep": "#d3b98a",
      "--av-gift2-ink": "#7f261c",
      "--av-ribbon1": "rgba(232,192,122,0.9)",
      "--av-ribbon2": "rgba(179,64,47,0.8)",
      "--av-lock": "rgba(14,26,16,0.75)",
      "--av-lock-icon": "rgba(212,162,78,0.7)",
      "--av-overlay": "rgba(10,20,13,0.85)",
      "--av-close-hover": "rgba(247,244,232,0.2)",
      "--av-glow": "rgba(212,162,78,0.55)",
      "--av-glow-fade": "rgba(212,162,78,0)",
      "--av-sparkle": "#2e7d4f",
    },
  },
  {
    id: "nuit",
    label: "Nuit",
    emoji: "\ud83c\udf19",
    vars: {
      "--av-bg1": "#1d1244",
      "--av-bg2": "#0d0926",
      "--av-ink": "#f1ebff",
      "--av-card": "#2b2058",
      "--av-card-soft": "rgba(43,32,88,0.7)",
      "--av-card-border": "#4a3d8a",
      "--av-accent": "#cdb4f5",
      "--av-accent2": "#9f7dee",
      "--av-accent-border": "rgba(159,125,238,0.4)",
      "--av-muted": "#a898d4",
      "--av-muted2": "#bcb0e2",
      "--av-subtitle": "#d4c8f0",
      "--av-faint": "#8d7dbd",
      "--av-faint2": "#76659f",
      "--av-halo1": "rgba(159,125,238,0.15)",
      "--av-halo2": "rgba(139,63,191,0.15)",
      "--av-halo3": "rgba(110,70,180,0.15)",
      "--av-thread": "rgba(159,125,238,0.6)",
      "--av-veil": "rgba(13,9,38,0.65)",
      "--av-logo-glow": "rgba(205,180,245,0.35)",
      "--av-paper": "#f5f0fe",
      "--av-paper2": "#fcf9ff",
      "--av-paper-border": "#d8c9f0",
      "--av-paper-border-soft": "#e5dbf5",
      "--av-paper-muted": "#7d6ba0",
      "--av-dark-ink": "#2a1d4d",
      "--av-gift1": "#a34fd1",
      "--av-gift1-deep": "#6b2fa0",
      "--av-gift1-ink": "#f5edff",
      "--av-gift2": "#e6d7f8",
      "--av-gift2-deep": "#c6a9e8",
      "--av-gift2-ink": "#6b2fa0",
      "--av-ribbon1": "rgba(240,229,255,0.9)",
      "--av-ribbon2": "rgba(163,79,209,0.8)",
      "--av-lock": "rgba(16,10,34,0.75)",
      "--av-lock-icon": "rgba(159,125,238,0.7)",
      "--av-overlay": "rgba(13,9,38,0.85)",
      "--av-close-hover": "rgba(245,240,254,0.2)",
      "--av-glow": "rgba(205,180,245,0.55)",
      "--av-glow-fade": "rgba(205,180,245,0)",
      "--av-sparkle": "#8b3fbf",
    },
  },
];

const THEME_STORAGE_KEY = "avent_theme_2026";

function loadThemeId(): string {
  try {
    const id = localStorage.getItem(THEME_STORAGE_KEY);
    if (id && AVENT_THEMES.some((t) => t.id === id)) return id;
  } catch {
    // stockage indisponible : thème Cosy par défaut
  }
  return "cosy";
}

type PlayedMap = Record<string, boolean>;

function loadProgress(): PlayedMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as PlayedMap;
      }
    }
  } catch {
    // stockage indisponible : la progression restera en mémoire pour la session
  }
  return {};
}

function parisDateParts(): { y: number; m: number; d: number } {
  const formatted = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const parts = formatted.split("-").map(Number);
  return { y: parts[0], m: parts[1], d: parts[2] };
}

function unlockedDayCount(): number {
  const { y, m, d } = parisDateParts();
  if (y > 2026 || (y === 2026 && m === 12 && d > 24)) return 24;
  if (y < 2026 || (y === 2026 && m < 12)) return 0;
  return Math.min(24, d);
}

function scoreOf(played: PlayedMap): number {
  let score = 0;
  for (const key of Object.keys(played)) {
    if (!played[key]) continue;
    score += Number(key) === 24 ? 20 : 10;
  }
  return score;
}

function bestRunOf(played: PlayedMap): number {
  const days = Object.keys(played).map(Number).sort((a, b) => a - b);
  let best = 0;
  let run = 0;
  for (const day of days) {
    if (played[String(day)]) {
      run += 1;
      if (run > best) best = run;
    } else {
      run = 0;
    }
  }
  return best;
}

interface BadgeDef {
  id: string;
  icon: string;
  label: string;
  desc: string;
}

const BADGES: BadgeDef[] = [
  { id: "first", icon: "\ud83c\udf81", label: "Premier pas", desc: "Ouvrir une première case" },
  { id: "week1", icon: "\u2b50", label: "Première semaine", desc: "Jouer les jours 1 à 7" },
  { id: "streak5", icon: "\ud83d\udd25", label: "Sans-faute", desc: "5 bonnes réponses d'affilée" },
  { id: "half", icon: "\ud83e\udd47", label: "Mi-parcours", desc: "12 jours joués" },
  { id: "all", icon: "\ud83c\udf84", label: "Noël complet", desc: "Les 24 jours joués" },
];

function badgeEarned(id: string, played: PlayedMap, playedCount: number, bestRun: number): boolean {
  if (id === "first") return playedCount >= 1;
  if (id === "week1") return [1, 2, 3, 4, 5, 6, 7].every((d) => String(d) in played);
  if (id === "streak5") return bestRun >= 5;
  if (id === "half") return playedCount >= 12;
  if (id === "all") return playedCount >= 24;
  return false;
}

function SparkleBurst() {
  const bits = Array.from({ length: 14 }, (_, i) => i);
  return (
    <div className="pointer-events-none absolute inset-x-0 top-6 h-24 overflow-visible" aria-hidden="true">
      {bits.map((i) => (
        <span
          key={i}
          className="avent-sparkle"
          style={{
            left: (8 + ((i * 67) % 84)) + "%",
            animationDelay: ((i % 7) * 60) + "ms",
          }}
        >
          {"\u2726"}
        </span>
      ))}
    </div>
  );
}

function Countdown() {
  const [ms, setMs] = useState(() => Math.max(0, ADVENT_DEADLINE - Date.now()));
  useEffect(() => {
    const timer = setInterval(() => {
      setMs(Math.max(0, ADVENT_DEADLINE - Date.now()));
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  const total = Math.floor(ms / 1000);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const cell = (value: number, label: string) => (
    <div className="flex flex-col items-center">
      <span className="w-16 h-16 rounded-xl bg-[var(--av-card)] border border-[var(--av-accent-border)] flex items-center justify-center text-2xl font-bold text-[var(--av-accent)] shadow-lg">
        {value}
      </span>
      <span className="mt-1 text-[10px] uppercase tracking-widest text-[var(--av-muted)]">{label}</span>
    </div>
  );
  return (
    <div className="flex items-start justify-center gap-3">
      {cell(days, "jours")}
      {cell(hours, "heures")}
      {cell(minutes, "minutes")}
      {cell(seconds, "secondes")}
    </div>
  );
}

const BULB_COLORS = ["#e05252", "#e8c07a", "#63c7b2", "#9dc98b"];

function garlandY(x: number): number {
  if (x <= 600) {
    const t = x / 600;
    return (1 - t) * (1 - t) * 12 + 2 * (1 - t) * t * 82 + t * t * 44;
  }
  const t = (x - 600) / 600;
  return (1 - t) * (1 - t) * 44 + 2 * (1 - t) * t * 82 + t * t * 12;
}

function Garland() {
  const bulbs = Array.from({ length: 13 }, (_, i) => 46 + i * 92);
  return (
    <div className="pointer-events-none absolute top-0 left-0 right-0 z-10" aria-hidden="true">
      <svg viewBox="0 0 1200 96" preserveAspectRatio="none" className="w-full h-24 block">
        <path d="M 0 12 Q 300 82 600 44 Q 900 82 1200 12" fill="none" stroke="#7a5a34" strokeWidth="2" opacity="0.9" />
      </svg>
      {bulbs.map((x, i) => {
        const color = BULB_COLORS[i % BULB_COLORS.length];
        return (
          <span
            key={x}
            className="avent-bulb"
            style={{
              left: (x / 12) + "%",
              top: (garlandY(x) - 2) + "px",
              backgroundColor: color,
              boxShadow: "0 0 10px 2px " + color + "88",
              animationDelay: (i % 4) * 450 + "ms",
            }}
          />
        );
      })}
    </div>
  );
}

function Snowfall() {
  const flakes = Array.from({ length: 34 }, (_, i) => i);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {flakes.map((i) => {
        const size = 2 + (i % 4);
        return (
          <span
            key={i}
            className="avent-snow"
            style={{
              left: ((i * 137) % 100) + "%",
              width: size + "px",
              height: size + "px",
              opacity: 0.25 + ((i % 5) * 0.13),
              animationDuration: (7 + (i % 7)) + "s",
              animationDelay: "-" + (i % 11) + "s",
            }}
          />
        );
      })}
    </div>
  );
}

export default function Avent() {
  const [played, setPlayed] = useState<PlayedMap>(() => loadProgress());
  const [openDay, setOpenDay] = useState<number | null>(null);
  const [shakeDay, setShakeDay] = useState<number | null>(null);
  const [reminderEmail, setReminderEmail] = useState("");
  const [reminderConsent, setReminderConsent] = useState(false);
  const [reminderSubmitting, setReminderSubmitting] = useState(false);
  const [reminderDone, setReminderDone] = useState(false);
  const [reminderError, setReminderError] = useState<string | null>(null);
  const [unsubscribeMessage, setUnsubscribeMessage] = useState<string | null>(null);
  const [themeId, setThemeId] = useState<string>(() => loadThemeId());

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("desinscription");
    if (!token) return;
    window.history.replaceState(null, "", window.location.pathname);
    fetch(AVENT_FUNCTION_URL + "/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(() =>
        setUnsubscribeMessage(
          "Vous êtes bien désinscrit : vous ne recevrez plus les rappels du calendrier."
        )
      )
      .catch(() =>
        setUnsubscribeMessage(
          "La désinscription n’a pas pu être confirmée. Réessayez depuis le lien présent dans l’email."
        )
      );
  }, []);

  const subscribeReminder = async () => {
    const email = reminderEmail.trim().toLowerCase();
    if (!reminderConsent) {
      setReminderError("Cochez la case de consentement pour continuer.");
      return;
    }
    setReminderSubmitting(true);
    setReminderError(null);
    try {
      const resp = await fetch(AVENT_FUNCTION_URL + "/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await resp.json();
      if (!resp.ok || !data || !data.success) {
        throw new Error((data && data.error) || "Inscription impossible pour le moment.");
      }
      setReminderDone(true);
      setReminderEmail("");
    } catch (err) {
      setReminderError(
        err instanceof Error ? err.message : "Inscription impossible pour le moment."
      );
    } finally {
      setReminderSubmitting(false);
    }
  };
  const [, forceTick] = useState(0);

  useEffect(() => {
    document.title = "Calendrier de l'Avent — FO COM UES Iliad";
  }, []);

  useEffect(() => {
    const timer = setInterval(() => forceTick((n) => n + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  const unlocked = unlockedDayCount();
  const score = scoreOf(played);
  const bestRun = bestRunOf(played);
  const playedCount = Object.keys(played).length;
  const beforeStart = unlocked === 0;
  const theme = AVENT_THEMES.find((t) => t.id === themeId) ?? AVENT_THEMES[0];
  const selectTheme = (id: string) => {
    setThemeId(id);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, id);
    } catch {
      // préférence conservée en mémoire seulement
    }
  };

  const onResult = (day: number, correct: boolean) => {
    setPlayed((prev) => {
      if (String(day) in prev) return prev;
      const next = { ...prev, [String(day)]: correct };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // progression conservée en mémoire seulement
      }
      return next;
    });
  };

  const resetProgress = () => {
    if (window.confirm("Effacer votre progression du calendrier de l'Avent ?")) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // rien à faire
      }
      setPlayed({});
    }
  };

  const handleCaseClick = (day: number) => {
    if (day > unlocked) {
      setShakeDay(day);
      setTimeout(() => setShakeDay(null), 450);
      return;
    }
    setOpenDay(day);
  };

  const openData = openDay !== null ? ADVENT_DAYS[openDay - 1] : null;

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[var(--av-bg1)] to-[var(--av-bg2)] text-[var(--av-ink)] overflow-hidden isolate" style={theme.vars as unknown as React.CSSProperties}>

        {/* Decor hivernal de fond : scene du jour, voile teinte par le theme */}
        <img src="/avent-fond.svg" alt="" aria-hidden="true" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-[var(--av-veil)]" />
      {/* Halos chauds */}
      <div className="pointer-events-none absolute -top-32 -left-24 w-96 h-96 rounded-full bg-[var(--av-halo1)] blur-3xl avent-float" aria-hidden="true" />
      <div className="pointer-events-none absolute top-1/2 -right-24 w-80 h-80 rounded-full bg-[var(--av-halo2)] blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-[var(--av-halo3)] blur-3xl avent-float" style={{ animationDelay: "2.5s" }} aria-hidden="true" />

      {/* Guirlande lumineuse */}
      <Garland />

      {/* Neige */}
      <Snowfall />

      <a href="/" className="absolute top-4 left-4 z-20 text-xs text-[var(--av-muted)] hover:text-[var(--av-accent)] transition-colors underline underline-offset-4">
        Retour au site
      </a>

      <div className="relative max-w-4xl mx-auto px-4 py-12">
        {/* En-tête */}
        <div className="flex flex-col items-center text-center">
          <img src="/embleme-avent.svg" alt="FO COM UES Iliad" className="w-24 h-24 object-contain" style={{ filter: "drop-shadow(0 4px 16px var(--av-logo-glow))" }} />
          <h1 className="mt-4 text-3xl md:text-4xl font-extrabold text-[var(--av-accent)] tracking-tight">
            Calendrier de l'Avent
          </h1>
          <p className="mt-2 text-sm md:text-base text-[var(--av-subtitle)] max-w-xl">
            {beforeStart
              ? "Un quiz par jour sur le code du travail et le syndicalisme, à partir du 1er décembre. Revenez ouvrir la première case !"
              : "Un quiz par jour sur le code du travail et le syndicalisme, avec sa surprise. Les cases passées restent ouvertes : rattrapez les jours manqués !"}
          </p>
        </div>

        {/* Sélecteur de thème */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {AVENT_THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => selectTheme(t.id)}
              aria-pressed={t.id === theme.id}
              title={"Thème " + t.label}
              className={
                "inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-full px-3 py-1.5 border transition-all " +
                (t.id === theme.id
                  ? "bg-[var(--av-card)] border-[var(--av-accent)] text-[var(--av-accent)]"
                  : "bg-[var(--av-card-soft)] border-[var(--av-card-border)] text-[var(--av-muted2)] hover:text-[var(--av-ink)] hover:border-[var(--av-accent)]")
              }
            >
              <span aria-hidden="true">{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Compte à rebours ou statistiques */}
        {beforeStart ? (
          <div className="mt-8">
            <Countdown />
          </div>
        ) : (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs bg-[var(--av-card)] border border-[var(--av-card-border)] rounded-full px-3 py-1.5 text-[var(--av-accent)]">
              <Trophy className="w-3.5 h-3.5" />
              {score} points
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs bg-[var(--av-card)] border border-[var(--av-card-border)] rounded-full px-3 py-1.5 text-[var(--av-accent)]">
              <Flame className="w-3.5 h-3.5" />
              Meilleure série : {bestRun}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs bg-[var(--av-card)] border border-[var(--av-card-border)] rounded-full px-3 py-1.5 text-[var(--av-accent)]">
              {playedCount} / 24 jours joués
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="mt-4 flex items-center justify-center gap-2">
          {BADGES.map((badge) => {
            const earned = badgeEarned(badge.id, played, playedCount, bestRun);
            return (
              <div
                key={badge.id}
                title={badge.label + " — " + badge.desc}
                className={
                  "w-9 h-9 rounded-full flex items-center justify-center text-base border transition-all " +
                  (earned
                    ? "bg-[var(--av-accent)] border-[var(--av-accent2)] shadow-md scale-100"
                    : "bg-[var(--av-card)] border-[var(--av-card-border)] opacity-50 grayscale")
                }
              >
                {badge.icon}
              </div>
            );
          })}
        </div>

        {/* Rappel quotidien par email (consentement RGPD explicite) */}
        <div className="mt-6 max-w-xl mx-auto bg-[var(--av-card-soft)] border border-[var(--av-card-border)] rounded-2xl p-5">
          <p className="text-sm font-bold text-[var(--av-accent)] flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Rappel quotidien par email
          </p>
          <p className="mt-1 text-xs text-[var(--av-muted2)] leading-relaxed">
            Recevez un email chaque matin du 1er au 24 décembre pour ouvrir la case du jour en avance.
          </p>
          {unsubscribeMessage ? (
            <p className="mt-3 text-xs text-[var(--av-accent)] leading-relaxed" role="status">
              {unsubscribeMessage}
            </p>
          ) : reminderDone ? (
            <p className="mt-3 text-xs text-emerald-300 leading-relaxed" role="status">
              C’est noté ! Le premier rappel arrivera le 1er décembre. À très vite !
            </p>
          ) : (
            <form
              className="mt-3 space-y-2.5"
              onSubmit={(e) => {
                e.preventDefault();
                subscribeReminder();
              }}
            >
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  required
                  value={reminderEmail}
                  onChange={(e) => setReminderEmail(e.target.value)}
                  placeholder="votre@email.fr"
                  aria-label="Votre adresse email"
                  className="flex-1 min-w-0 text-sm rounded-xl bg-[var(--av-paper)] text-[var(--av-dark-ink)] placeholder-[var(--av-faint)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--av-accent)]"
                />
                <button
                  type="submit"
                  disabled={reminderSubmitting || !reminderConsent}
                  className="shrink-0 text-sm font-semibold text-[var(--av-dark-ink)] bg-gradient-to-r from-[var(--av-accent)] to-[var(--av-accent2)] rounded-xl px-4 py-2 hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {reminderSubmitting ? "Enregistrement…" : "Me le rappeler"}
                </button>
              </div>
              <label className="flex items-start gap-2 text-[11px] text-[var(--av-muted2)] leading-relaxed cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminderConsent}
                  onChange={(e) => setReminderConsent(e.target.checked)}
                  className="mt-0.5 accent-[var(--av-accent)]"
                />
                <span>
                  J’accepte de recevoir chaque matin du 1er au 24 décembre un email de rappel du calendrier de l’Avent de la FO COM UES Iliad. Désinscription en un clic à tout moment (lien dans chaque email).{" "}
                  <a href="/rgpd" target="_blank" rel="noreferrer" className="underline text-[var(--av-accent)] hover:text-[var(--av-ink)]">
                    Politique de confidentialité
                  </a>
                  .
                </span>
              </label>
              {reminderError && (
                <p className="text-[11px] text-red-300" role="alert">
                  {reminderError}
                </p>
              )}
            </form>
          )}
        </div>

        {/* Grille des cases */}
        <div className="mt-8 grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2.5">
          {ADVENT_DAYS.map((day, index) => {
            const dayNumber = index + 1;
            const isLocked = dayNumber > unlocked;
            const isToday = !beforeStart && dayNumber === unlocked;
            const isPlayed = String(dayNumber) in played;
            const isCorrect = played[String(dayNumber)] === true;
            const isRed = dayNumber % 2 === 1;
            return (
              <button
                key={dayNumber}
                onClick={() => handleCaseClick(dayNumber)}
                title={isLocked ? "Ouvre le " + dayNumber + " décembre" : "Jour " + dayNumber}
                className={
                  "relative aspect-square select-none " +
                  (isLocked ? "cursor-not-allowed" : "cursor-pointer") +
                  (shakeDay === dayNumber ? " avent-shake" : "")
                }
              >
                <span
                  className="avent-bauble relative flex h-full flex-col items-center"
                  style={{ animationDelay: (dayNumber % 5) * 0.9 + "s" }}
                >
                  {/* Fil de suspension */}
                  <span className="h-[9%] w-[2px] bg-[var(--av-thread)]" />
                  {/* Attache dorée */}
                  <span className="-mt-px h-[6%] w-[20%] rounded-t-[4px] rounded-b-sm bg-[var(--av-accent2)]" />
                  {/* Boule */}
                  <span
                    className={
                      "relative -mt-[2px] flex aspect-square w-[78%] items-center justify-center overflow-hidden rounded-full shadow-md transition-transform duration-150 " +
                      (isRed
                        ? "bg-gradient-to-br from-[var(--av-gift1)] to-[var(--av-gift1-deep)]"
                        : "bg-gradient-to-br from-[var(--av-gift2)] to-[var(--av-gift2-deep)]") +
                      (isLocked ? "" : "hover:scale-105 active:scale-95") +
                      (isToday ? " avent-glow ring-2 ring-[var(--av-accent)]" : "")
                    }
                  >
                    {/* Reflet */}
                    <span className="absolute left-[16%] top-[12%] h-[24%] w-[24%] rounded-full bg-white/25 blur-[2px]" />
                    <span
                      className={
                        "relative text-lg font-extrabold drop-shadow " +
                        (isRed ? "text-[var(--av-gift1-ink)]" : "text-[var(--av-gift2-ink)]")
                      }
                    >
                      {dayNumber}
                    </span>

                    {/* Case jouée */}
                    {isPlayed && (
                      <span
                        className={
                          "absolute top-1 right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center " +
                          (isCorrect ? "bg-emerald-500 text-white" : "bg-[var(--av-card-border)] text-[var(--av-accent)]")
                        }
                      >
                        {"\u2713"}
                      </span>
                    )}

                    {/* Verrou */}
                    {isLocked && (
                      <span className="absolute inset-0 bg-[var(--av-lock)] flex items-center justify-center">
                        <Lock className="w-4 h-4 text-[var(--av-lock-icon)]" />
                      </span>
                    )}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Pied de page */}
        <p className="mt-8 text-center text-[11px] text-[var(--av-faint)]">
          Progression enregistrée dans votre navigateur — aucun compte requis. Le jour 24 vaut double.
        </p>
        <div className="mt-2 text-center">
          <button
            onClick={resetProgress}
            className="text-[11px] text-[var(--av-faint2)] hover:text-[var(--av-gift1)] underline underline-offset-4 transition-colors"
          >
            Réinitialiser ma progression
          </button>
        </div>
      </div>

      {/* Fenêtre du jour */}
      {openDay !== null && openData && (
        <DayModal
          key={openDay}
          day={openDay}
          data={openData}
          playedCorrect={String(openDay) in played ? played[String(openDay)] : undefined}
          onClose={() => setOpenDay(null)}
          onResult={onResult}
        />
      )}
    </div>
  );
}

function DayModal({
  day,
  data,
  playedCorrect,
  onClose,
  onResult,
}: {
  day: number;
  data: AdventDay;
  playedCorrect: boolean | undefined;
  onClose: () => void;
  onResult: (day: number, correct: boolean) => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const alreadyPlayed = playedCorrect !== undefined;
  const answered = picked !== null;
  const correct = answered && picked === data.quiz.answer;
  const points = day === 24 ? 20 : 10;

  const handlePick = (index: number) => {
    if (answered) return;
    setPicked(index);
    if (!alreadyPlayed) onResult(day, index === data.quiz.answer);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Case du jour">
      <button className="absolute inset-0 bg-[var(--av-overlay)] backdrop-blur-sm" onClick={onClose} aria-label="Fermer" />
      <div className="relative avent-pop w-full max-w-lg bg-[var(--av-paper)] text-[var(--av-dark-ink)] rounded-2xl border-2 border-[var(--av-accent2)] shadow-2xl max-h-[88vh] overflow-y-auto">
        {/* Barre du jour */}
        <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-[var(--av-gift1-deep)] to-[var(--av-gift1)] text-[var(--av-gift1-ink)] sticky top-0 z-10">
          <span className="text-sm font-bold tracking-wide uppercase">Jour {day} décembre</span>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-[var(--av-close-hover)] transition-colors" aria-label="Fermer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative px-5 py-5">
          {correct && answered && <SparkleBurst />}

          {alreadyPlayed && (
            <p className="mb-3 text-[11px] text-[var(--av-paper-muted)] bg-[var(--av-paper2)] border border-[var(--av-paper-border)] rounded-lg px-3 py-2">
              Case déjà jouée — rejouer ne modifie pas votre score.
            </p>
          )}

          <h2 className="text-lg font-bold leading-snug">{data.quiz.question}</h2>

          <div className="mt-4 space-y-2">
            {data.quiz.options.map((option, index) => {
              const isRight = index === data.quiz.answer;
              const isPicked = index === picked;
              let cls = "w-full text-left text-sm border rounded-xl px-4 py-2.5 transition-colors ";
              if (!answered) {
                cls += "border-[var(--av-paper-border)] bg-white hover:border-[var(--av-accent2)] hover:bg-[var(--av-paper2)] cursor-pointer";
              } else if (isRight) {
                cls += "border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold";
              } else if (isPicked) {
                cls += "border-red-400 bg-red-50 text-red-900";
              } else {
                cls += "border-[var(--av-paper-border-soft)] bg-white opacity-60";
              }
              return (
                <button key={index} onClick={() => handlePick(index)} disabled={answered} className={cls}>
                  {option}
                </button>
              );
            })}
          </div>

          {answered && (
            <div
              className={
                "mt-4 rounded-xl border px-4 py-3 text-sm leading-relaxed " +
                (correct ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-red-300 bg-red-50 text-red-900")
              }
            >
              <p className="font-bold">
                {correct
                  ? "Bonne réponse ! " + (alreadyPlayed ? "" : "+" + points + " points")
                  : "Mauvaise réponse… La bonne réponse : " + data.quiz.options[data.quiz.answer]}
              </p>
              <p className="mt-1">{data.quiz.explain}</p>
            </div>
          )}

          {answered && (
            <div className="mt-3 rounded-xl bg-[var(--av-paper2)] border border-[var(--av-paper-border)] px-4 py-3">
              <p className="text-[10px] uppercase tracking-widest text-[var(--av-paper-muted)] font-bold flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                {data.surprise.kind} du jour
              </p>
              <p className="mt-1.5 text-sm leading-relaxed">{data.surprise.text}</p>
            </div>
          )}

          {answered && (
            <button
              onClick={onClose}
              className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-[var(--av-gift1)] to-[var(--av-gift1-deep)] text-[var(--av-gift1-ink)] text-sm font-bold hover:brightness-110 transition-all"
            >
              {correct ? "Merci FO COM !" : "Retenter ma chance demain !"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
