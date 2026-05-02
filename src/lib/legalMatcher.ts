// ─── Types ────────────────────────────────────────────────────────────────────

export interface LegalArticle {
  numero: string;
  titre: string;
  contenu: string;
  exemple?: string;
}

export interface Jurisprudence {
  reference: string;
  resume: string;
  portee: string;
}

export interface LegalAnswer {
  answer: string;
  articles: LegalArticle[];
  jurisprudences: Jurisprudence[];
  conseils: string[];
  theme: string;
  confidence: 'high' | 'medium' | 'low';
}

// ─── Base de connaissances ────────────────────────────────────────────────────

interface LegalEntry {
  keywords: string[];
  theme: string;
  answer: string;
  articles: LegalArticle[];
  jurisprudences: Jurisprudence[];
  conseils: string[];
}

const LEGAL_DATABASE: LegalEntry[] = [
  // ── Grève ──────────────────────────────────────────────────────────────────
  {
    keywords: ['grève', 'greve', 'licencier pendant grève', 'licenciement greve', 'droit de greve'],
    theme: 'Droit de grève',
    answer: `La grève est un **droit constitutionnel** en France (Préambule de la Constitution de 1946). Un salarié ne peut **pas être licencié** pour avoir participé à une grève licite.\n\nUn licenciement prononcé pour ce motif est **nul de plein droit**, ce qui signifie que le salarié doit être réintégré dans l'entreprise et indemnisé pour toute la période d'éviction.\n\nLes seules exceptions concernent les **fautes lourdes** commises pendant la grève (violence, séquestration…), qui peuvent justifier un licenciement.`,
    articles: [
      {
        numero: 'L.2511-1',
        titre: 'Protection des grévistes',
        contenu: 'L\'exercice du droit de grève ne peut justifier la rupture du contrat de travail, sauf faute lourde imputable au salarié.',
        exemple: 'Un salarié qui cesse le travail pour défendre des revendications professionnelles collectives bénéficie de la protection totale de la loi.',
      },
      {
        numero: 'L.2512-1',
        titre: 'Préavis de grève dans les services publics',
        contenu: 'Dans les services publics, un préavis de 5 jours francs est obligatoire avant le déclenchement de la grève.',
      },
    ],
    jurisprudences: [
      {
        reference: 'Cass. Soc. 8 janv. 2003, n°00-46.499',
        resume: 'Le licenciement d\'un salarié gréviste, hors faute lourde, est nul et emporte droit à réintégration.',
        portee: 'Principe fondamental : nullité absolue du licenciement du gréviste sans faute lourde.',
      },
    ],
    conseils: [
      'Conservez toute preuve de votre participation à la grève (tracts, témoignages, feuilles de présence).',
      'Si vous êtes licencié pendant une grève, contestez immédiatement devant le Conseil de Prud\'hommes.',
      'Contactez votre représentant syndical FOCOM dès réception de toute notification.',
      'Le délai de saisine du Conseil de Prud\'hommes est de 12 mois pour une contestation de licenciement nul.',
    ],
  },

  // ── Heures supplémentaires ─────────────────────────────────────────────────
  {
    keywords: ['heures supplémentaires', 'heures sup', 'majoration', 'durée travail', 'durée légale'],
    theme: 'Temps de travail',
    answer: `La durée légale du travail est de **35 heures par semaine**. Au-delà, les heures sont considérées comme supplémentaires et doivent être majorées.\n\n**Taux de majoration :**\n- **+25 %** pour les 8 premières heures supplémentaires (36e à 43e heure)\n- **+50 %** au-delà (à partir de la 44e heure)\n\nUn accord collectif peut prévoir un remplacement de la majoration par un repos compensateur équivalent.\n\nLe contingent annuel d'heures supplémentaires est fixé à **220 heures** par salarié (sauf accord collectif).`,
    articles: [
      {
        numero: 'L.3121-27',
        titre: 'Durée légale du travail effectif',
        contenu: 'La durée légale du travail effectif des salariés à temps complet est fixée à trente-cinq heures par semaine.',
      },
      {
        numero: 'L.3121-36',
        titre: 'Majoration des heures supplémentaires',
        contenu: 'Les heures supplémentaires donnent lieu à une majoration de salaire de 25 % pour les huit premières heures et de 50 % pour les suivantes.',
        exemple: 'Pour un salaire horaire de 15 €, une heure supplémentaire dans les 8 premières est rémunérée 18,75 €.',
      },
    ],
    jurisprudences: [
      {
        reference: 'Cass. Soc. 4 juin 2009, n°07-45.498',
        resume: 'La preuve des heures supplémentaires incombe à l\'employeur qui doit fournir les éléments permettant leur contrôle.',
        portee: 'L\'employeur ne peut pas imposer des heures supplémentaires sans les rémunérer correctement.',
      },
    ],
    conseils: [
      'Notez précisément vos horaires d\'entrée et de sortie chaque jour.',
      'Conservez vos bulletins de paie et relevés de pointage.',
      'En cas de litige, la charge de la preuve est partagée entre employeur et salarié.',
      'Signalez tout refus de paiement à votre représentant FOCOM.',
    ],
  },

  // ── Harcèlement moral ──────────────────────────────────────────────────────
  {
    keywords: ['harcèlement', 'harcelement', 'harcèlement moral', 'harcèlement sexuel', 'moral'],
    theme: 'Harcèlement au travail',
    answer: `Le **harcèlement moral** est défini comme des agissements répétés ayant pour objet ou pour effet une dégradation des conditions de travail susceptible de porter atteinte aux droits du salarié, à sa dignité, d'altérer sa santé physique ou mentale ou de compromettre son avenir professionnel.\n\nTout salarié qui s'estime victime peut :\n- **Saisir l'inspection du travail**\n- **Porter plainte pénalement** (peine de 2 ans d'emprisonnement et 30 000 € d'amende)\n- **Saisir le Conseil de Prud'hommes** pour obtenir des dommages-intérêts\n\nL'employeur a une **obligation de résultat** en matière de prévention du harcèlement.`,
    articles: [
      {
        numero: 'L.1152-1',
        titre: 'Définition du harcèlement moral',
        contenu: 'Aucun salarié ne doit subir les agissements répétés de harcèlement moral qui ont pour objet ou pour effet une dégradation de ses conditions de travail.',
      },
      {
        numero: 'L.1152-2',
        titre: 'Protection des victimes',
        contenu: 'Aucun salarié ne peut être sanctionné, licencié ou faire l\'objet d\'une mesure discriminatoire pour avoir subi ou refusé de subir des agissements de harcèlement moral.',
        exemple: 'Un salarié licencié après avoir dénoncé un harcèlement peut obtenir la nullité de son licenciement.',
      },
    ],
    jurisprudences: [
      {
        reference: 'Cass. Soc. 21 juin 2006, n°05-43.914',
        resume: 'L\'employeur est tenu envers ses salariés d\'une obligation de sécurité de résultat en matière de harcèlement moral.',
        portee: 'Le manquement à cette obligation expose l\'employeur à des dommages-intérêts.',
      },
    ],
    conseils: [
      'Rédigez un journal de bord détaillé de chaque incident (date, heure, témoins, faits précis).',
      'Conservez tous les écrits (emails, SMS, notes) pouvant servir de preuves.',
      'Consultez le médecin du travail qui peut établir un lien entre votre état de santé et vos conditions de travail.',
      'Informez sans délai votre représentant syndical FOCOM pour être accompagné.',
      'Ne restez pas isolé — parlez-en à des collègues de confiance.',
    ],
  },

  // ── Délégué syndical ───────────────────────────────────────────────────────
  {
    keywords: ['délégué syndical', 'delegue syndical', 'représentant syndical', 'mandat syndical', 'élu', 'droits syndicaux'],
    theme: 'Droit syndical',
    answer: `Les **représentants syndicaux** bénéficient de protections spécifiques et de droits particuliers.\n\n**Heures de délégation :** Chaque délégué syndical dispose d'un crédit mensuel d'heures (10 à 24h selon l'effectif) pour exercer ses missions.\n\n**Protection contre le licenciement :** Un délégué syndical ne peut être licencié sans **autorisation préalable de l'inspecteur du travail**. Cette protection s'applique pendant le mandat et 12 mois après sa fin.\n\n**Liberté de circulation :** Le délégué syndical peut se déplacer librement dans l'entreprise pendant ses heures de délégation.`,
    articles: [
      {
        numero: 'L.2143-13',
        titre: 'Crédit d\'heures du délégué syndical',
        contenu: 'Chaque délégué syndical dispose, pour l\'exercice de ses fonctions, d\'un crédit d\'heures allant de 10 à 24 heures par mois selon l\'effectif de l\'entreprise.',
      },
      {
        numero: 'L.2411-3',
        titre: 'Protection du délégué syndical',
        contenu: 'Le licenciement d\'un délégué syndical ne peut intervenir qu\'après autorisation de l\'inspecteur du travail.',
        exemple: 'Même en cas de faute grave, l\'employeur doit obtenir l\'accord de l\'inspection du travail avant tout licenciement.',
      },
    ],
    jurisprudences: [
      {
        reference: 'Cass. Soc. 15 nov. 2011, n°10-15.294',
        resume: 'Le licenciement d\'un salarié protégé sans autorisation administrative est nul, peu importe le motif invoqué.',
        portee: 'La protection est absolue : même une faute grave ne dispense pas de l\'autorisation.',
      },
    ],
    conseils: [
      'Tenez un relevé précis de l\'utilisation de vos heures de délégation.',
      'En cas de refus de vos heures par l\'employeur, adressez une demande écrite.',
      'Tout obstacle à votre mandat (entrave) est un délit pénal punissable d\'un an de prison.',
      'La FOCOM vous accompagne dans l\'exercice de vos droits syndicaux.',
    ],
  },

  // ── Licenciement ──────────────────────────────────────────────────────────
  {
    keywords: ['licenciement', 'licencier', 'contester licenciement', 'rupture contrat', 'cause réelle', 'motif'],
    theme: 'Licenciement',
    answer: `Tout licenciement doit reposer sur une **cause réelle et sérieuse**. L'employeur doit respecter une procédure stricte :\n\n1. **Convocation à un entretien préalable** (lettre recommandée ou remise en main propre)\n2. **Délai de 5 jours ouvrables** entre la convocation et l'entretien\n3. **Entretien préalable** : vous pouvez vous faire assister par un représentant du personnel\n4. **Notification du licenciement** : au plus tôt 2 jours ouvrables après l'entretien\n\nVous disposez de **12 mois** pour saisir le Conseil de Prud'hommes et contester votre licenciement.`,
    articles: [
      {
        numero: 'L.1232-1',
        titre: 'Cause réelle et sérieuse',
        contenu: 'Tout licenciement pour motif personnel doit être justifié par une cause réelle et sérieuse.',
      },
      {
        numero: 'L.1232-2',
        titre: 'Convocation à l\'entretien préalable',
        contenu: 'L\'employeur qui envisage de licencier un salarié le convoque, avant toute décision, à un entretien préalable par lettre recommandée.',
        exemple: 'La lettre doit indiquer l\'objet de la convocation, la date, l\'heure et le lieu de l\'entretien, ainsi que la possibilité d\'être assisté.',
      },
    ],
    jurisprudences: [
      {
        reference: 'Cass. Soc. 29 nov. 1990, n°88-44.308',
        resume: 'Le licenciement sans cause réelle et sérieuse ouvre droit à des indemnités calculées en fonction de l\'ancienneté.',
        portee: 'Barème Macron applicable depuis 2017 pour les licenciements sans cause.',
      },
    ],
    conseils: [
      'Assistez toujours à l\'entretien préalable accompagné d\'un représentant syndical FOCOM.',
      'Demandez à l\'employeur de préciser les motifs dans la lettre de licenciement.',
      'Conservez tous les documents relatifs à votre emploi (contrat, fiches de paie, évaluations).',
      'Saisissez le Conseil de Prud\'hommes dans le délai de 12 mois si vous contestez.',
    ],
  },

  // ── Droit de retrait ──────────────────────────────────────────────────────
  {
    keywords: ['droit de retrait', 'danger grave', 'situation dangereuse', 'retrait', 'sécurité'],
    theme: 'Santé & sécurité au travail',
    answer: `Le **droit de retrait** permet à tout salarié de se retirer d'une situation de travail dont il a un motif raisonnable de penser qu'elle présente un **danger grave et imminent** pour sa vie ou sa santé.\n\n**Conditions :**\n- Le danger doit être grave et imminent\n- Le salarié doit en informer l'employeur ou le responsable hiérarchique\n- Le salarié ne peut subir aucune retenue sur salaire pour l'exercice de ce droit\n- L'employeur ne peut demander au salarié de reprendre le travail dans cette situation dangereuse\n\nL'employeur a l'interdiction de sanctionner un salarié qui exerce légitimement son droit de retrait.`,
    articles: [
      {
        numero: 'L.4131-1',
        titre: 'Droit de retrait',
        contenu: 'Le travailleur alerte immédiatement l\'employeur de toute situation de travail dont il a un motif raisonnable de penser qu\'elle présente un danger grave et imminent pour sa vie ou sa santé.',
        exemple: 'Un électricien confronté à une installation défectueuse peut exercer son droit de retrait sans risquer de sanction.',
      },
      {
        numero: 'L.4131-3',
        titre: 'Interdiction de sanction',
        contenu: 'Aucune sanction, aucune retenue de salaire ne peut être prise à l\'encontre d\'un travailleur ou d\'un groupe de travailleurs qui se sont retirés d\'une situation de travail dangereuse.',
      },
    ],
    jurisprudences: [
      {
        reference: 'Cass. Soc. 28 janv. 2009, n°07-44.556',
        resume: 'L\'exercice du droit de retrait ne peut entraîner aucune sanction dès lors que le salarié avait un motif raisonnable de penser au danger.',
        portee: 'Le salarié est protégé même si le danger s\'avère finalement moindre que redouté.',
      },
    ],
    conseils: [
      'Signalez immédiatement et par écrit (email, SMS) la situation dangereuse à votre supérieur.',
      'Informez le CSE ou vos représentants FOCOM de la situation.',
      'Documentez le danger par photos ou témoignages si possible.',
      'Ne reprenez pas le travail tant que la situation dangereuse n\'a pas été résolue.',
    ],
  },

  // ── Congés payés ──────────────────────────────────────────────────────────
  {
    keywords: ['congés', 'conges', 'congés payés', 'vacances', 'RTT', 'jours de congé'],
    theme: 'Congés et repos',
    answer: `Tout salarié acquiert **2,5 jours ouvrables** de congés payés par mois de travail effectif, soit **30 jours ouvrables (5 semaines)** par an.\n\n**Période de référence :** du 1er juin au 31 mai (sauf accord collectif différent).\n\n**Indemnité de congés payés :** le plus favorable entre :\n- Le **maintien de salaire** (salaire habituel)\n- La **règle du 10e** (1/10e de la rémunération annuelle)\n\nEn cas de licenciement, une **indemnité compensatrice** de congés non pris est obligatoire.`,
    articles: [
      {
        numero: 'L.3141-3',
        titre: 'Acquisition des congés payés',
        contenu: 'Le salarié a droit à un congé de deux jours et demi ouvrables par mois de travail effectif chez le même employeur.',
      },
      {
        numero: 'L.3141-24',
        titre: 'Calcul de l\'indemnité de congés payés',
        contenu: 'L\'indemnité de congés payés est égale au dixième de la rémunération totale perçue par le salarié au cours de la période de référence.',
        exemple: 'Si vos congés coïncident avec une prime habituelle, elle doit être intégrée dans le calcul.',
      },
    ],
    jurisprudences: [
      {
        reference: 'Cass. Soc. 13 juin 2012, n°11-10.929',
        resume: 'Un salarié malade pendant ses congés peut reporter les jours non pris du fait de la maladie.',
        portee: 'La maladie pendant les congés ouvre droit au report des jours de congé.',
      },
    ],
    conseils: [
      'Vérifiez sur votre bulletin de paie le solde de vos congés acquis et pris.',
      'En cas de refus de congés injustifié, adressez une demande écrite à votre employeur.',
      'Les congés non pris en fin d\'année peuvent être placés sur un CET (si accord collectif).',
      'En cas de litige, contactez votre représentant FOCOM.',
    ],
  },

  // ── Télétravail ──────────────────────────────────────────────────────────
  {
    keywords: ['télétravail', 'teletravail', 'travail à distance', 'travail domicile', 'remote'],
    theme: 'Télétravail',
    answer: `Le **télétravail** est encadré par la loi et les accords collectifs. Le salarié ne peut pas se voir imposer le télétravail sans son accord (sauf circonstances exceptionnelles comme une pandémie).\n\n**Droits du télétravailleur :**\n- Mêmes droits que les salariés sur site\n- Droit au remboursement des frais liés au télétravail\n- Droit à la déconnexion\n- Droit au respect de la vie privée (le domicile ne peut être visité sans autorisation)\n\nL'indemnité télétravail varie selon les accords d'entreprise (en général 2,50 € à 5 € par jour).`,
    articles: [
      {
        numero: 'L.1222-9',
        titre: 'Définition et mise en place du télétravail',
        contenu: 'Le télétravail désigne toute forme d\'organisation du travail dans laquelle un travail qui aurait pu être exécuté dans les locaux de l\'employeur est effectué par un salarié hors de ces locaux.',
      },
      {
        numero: 'L.1222-10',
        titre: 'Obligations de l\'employeur',
        contenu: 'L\'employeur est tenu de prendre en charge tous les coûts découlant directement de l\'exercice du télétravail.',
        exemple: 'Prise en charge du matériel informatique, de l\'abonnement internet ou d\'une indemnité forfaitaire.',
      },
    ],
    jurisprudences: [
      {
        reference: 'Cass. Soc. 2 oct. 2001, n°99-42.727',
        resume: 'Le refus du télétravail ne peut constituer un motif de licenciement lorsque le poste le permet.',
        portee: 'L\'employeur doit justifier son refus de manière objective.',
      },
    ],
    conseils: [
      'Formalisez votre accord de télétravail par écrit (avenant au contrat ou charte).',
      'Conservez vos justificatifs de frais liés au télétravail pour remboursement.',
      'Respectez vos horaires habituels pour préserver votre droit à la déconnexion.',
      'En cas de refus injustifié de télétravail, sollicitez l\'avis de votre représentant FOCOM.',
    ],
  },

  // ── CPF / Formation ───────────────────────────────────────────────────────
  {
    keywords: ['cpf', 'compte personnel de formation', 'formation', 'développement compétences', 'dif'],
    theme: 'Formation professionnelle',
    answer: `Le **Compte Personnel de Formation (CPF)** permet à tout actif de financer des formations tout au long de sa vie professionnelle.\n\n**Alimentation du compte :**\n- Salarié à temps plein : **500 €/an** (plafonné à 5 000 €)\n- Salarié peu qualifié : **800 €/an** (plafonné à 8 000 €)\n\n**Utilisation :** Le CPF peut financer des formations certifiantes, des bilans de compétences, la préparation du permis de conduire professionnel, la VAE.\n\n**Accès :** Via l'application et le site **moncompteformation.gouv.fr** avec votre numéro de sécurité sociale.`,
    articles: [
      {
        numero: 'L.6323-1',
        titre: 'Compte Personnel de Formation',
        contenu: 'Toute personne dispose dès son entrée sur le marché du travail et jusqu\'à son départ à la retraite d\'un compte personnel de formation.',
      },
      {
        numero: 'L.6323-11',
        titre: 'Abondement du CPF',
        contenu: 'L\'employeur peut abonder le compte personnel de formation de ses salariés.',
        exemple: 'Dans le cadre d\'un plan de formation, l\'employeur peut compléter le CPF du salarié pour financer une formation coûteuse.',
      },
    ],
    jurisprudences: [],
    conseils: [
      'Consultez régulièrement votre solde CPF sur moncompteformation.gouv.fr.',
      'Vous pouvez utiliser votre CPF sans l\'accord de l\'employeur si la formation a lieu hors temps de travail.',
      'Pendant le temps de travail, vous devez obtenir l\'accord de l\'employeur.',
      'En cas de refus injustifié, contactez votre représentant FOCOM.',
    ],
  },

  // ── Rupture conventionnelle ───────────────────────────────────────────────
  {
    keywords: ['rupture conventionnelle', 'accord rupture', 'négocier départ', 'indemnité rupture'],
    theme: 'Rupture conventionnelle',
    answer: `La **rupture conventionnelle** est un mode de rupture du contrat de travail à l'amiable, d'un commun accord entre l'employeur et le salarié.\n\n**Procédure :**\n1. Au moins **un entretien** entre employeur et salarié\n2. Signature de la **convention de rupture**\n3. Délai de rétractation de **15 jours calendaires**\n4. Homologation par la **DREETS** (ex-DIRECCTE)\n\n**Indemnité minimale :** équivalente à l'indemnité légale de licenciement.\n\nLe salarié a droit aux **allocations chômage** après une rupture conventionnelle.`,
    articles: [
      {
        numero: 'L.1237-11',
        titre: 'Rupture conventionnelle',
        contenu: 'L\'employeur et le salarié peuvent convenir en commun des conditions de la rupture du contrat de travail qui les lie.',
      },
      {
        numero: 'L.1237-13',
        titre: 'Indemnité de rupture conventionnelle',
        contenu: 'La convention de rupture définit le montant de l\'indemnité spécifique de rupture conventionnelle, qui ne peut être inférieur à celui de l\'indemnité légale.',
      },
    ],
    jurisprudences: [
      {
        reference: 'Cass. Soc. 23 mai 2013, n°12-13.865',
        resume: 'Une rupture conventionnelle conclue sous la contrainte peut être annulée.',
        portee: 'La liberté du consentement des deux parties est indispensable à la validité de la convention.',
      },
    ],
    conseils: [
      'Ne signez jamais sous pression — vous disposez de 15 jours pour vous rétracter.',
      'Négociez une indemnité supérieure au minimum légal, c\'est possible.',
      'Faites-vous accompagner par un représentant FOCOM lors des entretiens.',
      'Vérifiez que l\'homologation par la DREETS a bien eu lieu avant votre départ.',
    ],
  },

  // ── Égalité salariale ─────────────────────────────────────────────────────
  {
    keywords: ['égalité salariale', 'egalite salariale', 'discrimination salariale', 'inégalité', 'femme homme salaire'],
    theme: 'Égalité professionnelle',
    answer: `**L'égalité de rémunération** entre les femmes et les hommes est un principe fondamental du droit du travail français.\n\nPour un même travail ou un travail de **valeur égale**, la rémunération doit être identique, quels que soient le sexe, l'origine, l'âge ou tout autre critère discriminatoire.\n\nDepuis 2019, les entreprises de 50 salariés et plus doivent publier leur **Index d'égalité professionnelle** et atteindre un score minimum de 75/100 sous peine de pénalités financières pouvant atteindre **1 % de la masse salariale**.`,
    articles: [
      {
        numero: 'L.3221-2',
        titre: 'Principe d\'égalité de rémunération',
        contenu: 'Tout employeur assure, pour un même travail ou pour un travail de valeur égale, l\'égalité de rémunération entre les femmes et les hommes.',
      },
      {
        numero: 'L.1132-1',
        titre: 'Principe de non-discrimination',
        contenu: 'Aucune personne ne peut faire l\'objet d\'une mesure discriminatoire directe ou indirecte en raison de son origine, sexe, âge, situation de famille, orientation sexuelle, appartenance syndicale…',
      },
    ],
    jurisprudences: [
      {
        reference: 'Cass. Soc. 6 juil. 2010, n°09-40.021',
        resume: 'La charge de la preuve de la différence de rémunération injustifiée est partagée entre le salarié et l\'employeur.',
        portee: 'Le salarié présente des éléments laissant supposer une discrimination, l\'employeur doit prouver que la différence est objectivement justifiée.',
      },
    ],
    conseils: [
      'Demandez à consulter la grille de classification et de rémunération de votre entreprise.',
      'Consultez l\'Index d\'égalité de votre entreprise (publié chaque 1er mars).',
      'Si vous suspectez une discrimination, signalez-la à votre représentant FOCOM.',
      'La Défenseure des droits peut être saisie gratuitement en cas de discrimination.',
    ],
  },

  // ── Mutuelle / Prévoyance ─────────────────────────────────────────────────
  {
    keywords: ['mutuelle', 'prévoyance', 'prevoyance', 'complémentaire santé', 'frais santé'],
    theme: 'Protection sociale complémentaire',
    answer: `Depuis le **1er janvier 2016**, tout employeur doit proposer à ses salariés une **mutuelle d\'entreprise obligatoire** avec une prise en charge minimale de **50 %** de la cotisation par l'employeur.\n\nLe salarié peut demander une **dispense d'adhésion** dans certains cas (déjà couvert par un ayant-droit, CDD de moins de 3 mois, temps partiel…).\n\nLa **prévoyance** couvre les risques lourds : incapacité de travail, invalidité, décès. Elle peut être obligatoire selon la convention collective applicable.`,
    articles: [
      {
        numero: 'L.911-7',
        titre: 'Complémentaire santé obligatoire',
        contenu: 'Les employeurs du secteur privé sont tenus de faire bénéficier leurs salariés d\'une couverture collective en matière de remboursements complémentaires de frais de santé.',
      },
    ],
    jurisprudences: [],
    conseils: [
      'Vérifiez le niveau de prise en charge de votre mutuelle (optique, dentaire, hospitalisation).',
      'En cas de départ, vous pouvez bénéficier de la portabilité de votre mutuelle pendant 12 mois (sous conditions).',
      'Consultez votre représentant FOCOM pour connaître les accords de prévoyance en vigueur.',
    ],
  },
];

// ─── Réponse par défaut ────────────────────────────────────────────────────────

const DEFAULT_ANSWER: LegalAnswer = {
  answer: `Je n'ai pas trouvé de réponse précise à votre question dans ma base de données du Code du travail.\n\nVoici quelques pistes :\n- **Reformulez** votre question avec des termes juridiques plus précis\n- **Contactez directement** vos représentants FOCOM qui peuvent vous orienter\n- Consultez le site **legifrance.gouv.fr** pour accéder aux textes officiels\n- Pour une situation personnelle complexe, un **avocat spécialisé** en droit du travail reste le plus compétent\n\nJe peux vous aider sur des sujets comme : le licenciement, les heures supplémentaires, le harcèlement, les congés, le télétravail, la grève, la formation professionnelle…`,
  articles: [],
  jurisprudences: [],
  conseils: [
    'Contactez vos représentants FOCOM pour un accompagnement personnalisé.',
    'Consultez legifrance.gouv.fr pour les textes officiels.',
    'Reformulez votre question avec des mots-clés différents.',
  ],
  theme: 'Informations générales',
  confidence: 'low',
};

// ─── Fonction principale de matching ──────────────────────────────────────────

export function findLegalAnswer(question: string): LegalAnswer {
  const q = question.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  let bestMatch: LegalEntry | null = null;
  let bestScore = 0;

  for (const entry of LEGAL_DATABASE) {
    let score = 0;
    for (const keyword of entry.keywords) {
      const kw = keyword.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (q.includes(kw)) {
        // Les mots-clés plus longs sont plus précis → meilleur score
        score += kw.split(' ').length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  if (!bestMatch || bestScore === 0) {
    return DEFAULT_ANSWER;
  }

  return {
    answer: bestMatch.answer,
    articles: bestMatch.articles,
    jurisprudences: bestMatch.jurisprudences,
    conseils: bestMatch.conseils,
    theme: bestMatch.theme,
    confidence: bestScore >= 2 ? 'high' : 'medium',
  };
}
