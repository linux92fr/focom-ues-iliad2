import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp, Users, Scale, Award, Clock, Umbrella,
  Calendar, UtensilsCrossed, ArrowRight, Target,
  Banknote, ShieldCheck, Star, Megaphone, Coffee, TreePine,
  Car, Laptop, Medal, Gift, Brain, RefreshCw, FileText,
  HeartPulse, Home, Leaf, BarChart2, Smartphone, RefreshCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import logoFocom from '@/assets/jolly-roger.png';

// ===============================================================================
//  Données des revendications
// ===============================================================================

interface Revendication {
  id: number;
  titre: string;
  sousTitre: string;
  detail: string;
  icon: React.ElementType;
  categorie: 'salaire' | 'temps' | 'social' | 'egalite' | 'negociation';
  accroche?: string;
  chiffre?: string;
}

const CATEGORIES = {
  salaire:      { label: 'Salaires & Primes',        color: 'emerald', bg: 'bg-emerald-500', light: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-300 dark:border-emerald-700', text: 'text-emerald-700 dark:text-emerald-400' },
  temps:        { label: 'Temps de travail',          color: 'blue',    bg: 'bg-blue-500',    light: 'bg-blue-50 dark:bg-blue-950/30',       border: 'border-blue-300 dark:border-blue-700',       text: 'text-blue-700 dark:text-blue-400'       },
  social:       { label: 'Avantages sociaux',         color: 'rose',  bg: 'bg-rose-500',  light: 'bg-rose-50 dark:bg-rose-950/30',   border: 'border-rose-300 dark:border-rose-700',   text: 'text-rose-700 dark:text-rose-400'   },
  egalite:      { label: 'Égalité & Reconnaissance',  color: 'purple',  bg: 'bg-purple-500',  light: 'bg-purple-50 dark:bg-purple-950/30',   border: 'border-purple-300 dark:border-purple-700',   text: 'text-purple-700 dark:text-purple-400'   },
  negociation:  { label: 'Négociation',               color: 'red',     bg: 'bg-red-600',     light: 'bg-red-50 dark:bg-red-950/30',         border: 'border-red-300 dark:border-red-700',         text: 'text-red-700 dark:text-red-400'         },
} as const;

const REVENDICATIONS: Revendication[] = [
  // ── Salaires (6) ──────────────────────────────────────────────────────────
  {
    id: 1,
    titre: 'Augmentation salariale',
    sousTitre: 'Minimum 2,5 % pour tous les salariés',
    detail:
      "Face à l'inflation cumulée depuis 2022 et à la revalorisation du SMIC de janvier 2026, une augmentation de l'ensemble des rémunérations fixes d'au moins 2,5 % est indispensable pour maintenir le pouvoir d'achat réel des collaborateurs, avec rétroactivité au 1er janvier 2026.",
    icon: TrendingUp,
    categorie: 'salaire',
    chiffre: '+2,5 %',
    accroche: "Neutraliser l'inflation, c'est le minimum",
  },
  {
    id: 2,
    titre: 'Indexation sur le SMIC',
    sousTitre: 'Garantir la revalorisation automatique des années suivantes',
    detail:
      "Nous demandons que les augmentations des salaires fixes soient indexées sur l'évolution du SMIC pour les années à venir, afin de ne plus jamais subir de décrochage du pouvoir d'achat. Une garantie de revalorisation est également exigée après 3 années consécutives sans augmentation sur un même emploi.",
    icon: RefreshCw,
    categorie: 'salaire',
    accroche: 'Plus jamais de salaires figés sur plusieurs années',
  },
  {
    id: 3,
    titre: 'Transparence fiches de paie',
    sousTitre: "Deux lignes distinctes et une note d'information sur les critères",
    detail:
      "Nous demandons que les fiches de paie mentionnent clairement deux lignes séparées : une pour l'augmentation conventionnelle et une pour la NAO. Une note d'information expliquant les critères des augmentations individuelles devra être annexée à l'accord NAO ou à la fiche de paie.",
    icon: FileText,
    categorie: 'salaire',
    accroche: "Chaque salarié a le droit de comprendre sa rémunération",
  },
  {
    id: 4,
    titre: 'Prime de partage de la valeur',
    sousTitre: "Répartir les richesses entre salariés et actionnaires",
    detail:
      "Nous revendiquons la mise en place d'une prime de partage prenant en compte l'implication de chaque salarié et s'inscrivant dans une logique de répartition équitable des richesses générées par le Groupe entre ses salariés et ses actionnaires.",
    icon: Banknote,
    categorie: 'salaire',
    accroche: "La valeur créée doit profiter à ceux qui la produisent",
  },
  {
    id: 5,
    titre: 'Subrogation & délai de carence',
    sousTitre: 'Maintien de salaire et suppression du délai de carence maladie',
    detail:
      "En cas d'arrêt maladie, nous exigeons la mise en place de la subrogation, le maintien intégral du salaire et la suppression du délai de carence. Tomber malade ne doit pas entraîner une perte financière pour le salarié.",
    icon: HeartPulse,
    categorie: 'salaire',
    accroche: "La santé ne devrait pas coûter de l'argent",
  },
  {
    id: 6,
    titre: 'Prime de vacances',
    sousTitre: 'Mise en place pour tous les salariés',
    detail:
      "Nous demandons la mise en place d'une prime de vacances pour l'ensemble des salariés afin d'améliorer la qualité de vie estivale. Les vacances ne sont pas un luxe : elles contribuent au bien-être et à la performance de chacun.",
    icon: Umbrella,
    categorie: 'salaire',
    accroche: "Les vacances ne sont pas un luxe",
  },

  // ── Temps de travail (3) ──────────────────────────────────────────────────
  {
    id: 7,
    titre: 'Temps de trajet = temps de travail',
    sousTitre: 'Trajets domicile-lieu de mission en début et fin de journée',
    detail:
      "Le temps de trajet des salariés itinérants dans le cadre de leurs missions doit être reconnu comme du temps de travail effectif et rémunéré comme tel. Ce temps n'est pas du temps personnel : il est consacré à l'entreprise. Cette revendication porte spécifiquement sur les trajets entre le domicile et le premier ou dernier lieu de mission de la journée, conformément aux évolutions jurisprudentielles récentes.",
    icon: Clock,
    categorie: 'temps',
    accroche: "Le temps passé en route, c'est du travail",
  },
  {
    id: 8,
    titre: 'Ouverture de négociation temps de travail',
    sousTitre: 'Conformité européenne et jurisprudences de la Cour de cassation',
    detail:
      "L'ouverture d'une négociation sur un accord temps de travail est nécessaire pour mettre l'entreprise en conformité avec les recommandations européennes, les nombreuses jurisprudences de la Cour de cassation française, ainsi que les préconisations de l'Inspection du Travail.",
    icon: Calendar,
    categorie: 'temps',
    accroche: "L'organisation du travail doit évoluer",
  },
  {
    id: 9,
    titre: 'Négociation IA & Digitalisation',
    sousTitre: "Les gains de productivité doivent profiter aux salariés",
    detail:
      "L'intégration de l'IA dans nos métiers génère des gains de productivité significatifs. Nous demandons l'ouverture d'une négociation sur un accord Digitalisation des métiers et IA, afin de garantir que ces gains bénéficient également aux collaborateurs et que l'accompagnement au changement soit structuré.",
    icon: Brain,
    categorie: 'temps',
    accroche: "L'IA progresse — les conditions de travail aussi",
  },

  // ── Égalité & Reconnaissance (4) ─────────────────────────────────────────
  {
    id: 10,
    titre: 'Égalité Femmes-Hommes',
    sousTitre: 'Rattrapage systématique des écarts de rémunération',
    detail:
      "Nous exigeons un rattrapage systématique et budgétisé de tous les écarts de rémunération injustifiés entre femmes et hommes. L'égalité professionnelle ne peut rester une déclaration d'intention : elle doit se traduire par des mesures concrètes et chiffrées, inscrites dans l'accord NAO.",
    icon: ShieldCheck,
    categorie: 'egalite',
    accroche: "Des actes, pas des chiffres d'index",
  },
  {
    id: 11,
    titre: 'Reclassification en Agents de Maîtrise',
    sousTitre: 'Requalifier les techniciens seuil D en AM',
    detail:
      "Les salariés classés en seuil D (techniciens) exercent des responsabilités qui correspondent à celles d'Agents de Maîtrise. Nous demandons leur reclassification officielle, pour une reconnaissance juste de leurs compétences et de leur engagement au quotidien.",
    icon: Award,
    categorie: 'egalite',
    accroche: "Justice pour une catégorie sous-reconnue",
  },
  {
    id: 12,
    titre: 'Médaille du travail',
    sousTitre: 'Attribution systématique pour les départs en retraite',
    detail:
      "Nous demandons que chaque salarié partant à la retraite se voit attribuer une médaille du travail, en reconnaissance de son parcours et de sa contribution à l'entreprise. Un geste symbolique et humain, qui ne coûte rien mais signifie beaucoup.",
    icon: Medal,
    categorie: 'egalite',
    accroche: "Chaque départ mérite une reconnaissance",
  },
  {
    id: 13,
    titre: 'Accord PPV',
    sousTitre: 'Prime de Partage de la Valeur — accord structurant',
    detail:
      "Mise en place d'un accord PPV structurant et pérenne garantissant une répartition équitable de la valeur ajoutée. Un partage de valeur inscrit dans la durée, au-delà des décisions unilatérales annuelles.",
    icon: BarChart2,
    categorie: 'egalite',
    accroche: "Un partage de valeur pérenne",
  },

  // ── Avantages sociaux (7) ─────────────────────────────────────────────────
  {
    id: 14,
    titre: 'Ticket-restaurant & panier repas',
    sousTitre: 'Revalorisation à 12,50 € pour tous',
    detail:
      "Nous demandons la revalorisation du ticket-restaurant à 12,50 € (valeur faciale alignée sur le plafond d'exonération URSSAF, prise en charge employeur à 60 %), ainsi que le panier repas des salariés itinérants à 12,50 € conformément aux barèmes URSSAF 2026.",
    icon: UtensilsCrossed,
    categorie: 'social',
    chiffre: '12,50 €',
    accroche: "Se nourrir correctement ne doit pas être un luxe",
  },
  {
    id: 15,
    titre: 'Budget convivialité QVCT',
    sousTitre: '150 € par collaborateur + 50 € repas de Noël',
    detail:
      "Dans le cadre de la Qualité de Vie et des Conditions de Travail, nous demandons la garantie et l'uniformisation d'un budget convivialité annuel de 150 € par collaborateur à disposition du manager, ainsi qu'un budget repas de Noël supplémentaire de 50 € par collaborateur.",
    icon: Coffee,
    categorie: 'social',
    chiffre: '200 €',
    accroche: "La cohésion d'équipe, ça se cultive",
  },
  {
    id: 16,
    titre: 'Indemnité télétravail',
    sousTitre: "Revalorisation à 59 € mensuels",
    detail:
      "Les indemnités d'occupation du domicile liées au télétravail (électricité, assurance, eau) doivent être revalorisées à 59 € par mois. Cette somme correspond aux charges réelles supportées par les salariés pour leur environnement de travail à domicile.",
    icon: Laptop,
    categorie: 'social',
    chiffre: '59 €',
    accroche: "Le bureau à la maison a un coût réel",
  },
  {
    id: 17,
    titre: 'Budget œuvres sociales',
    sousTitre: "Augmentation à 1 % de la masse salariale",
    detail:
      "Nous demandons l'augmentation de la dotation du budget des œuvres sociales à 1 % de la masse salariale, pour se rapprocher du taux le mieux disant de la profession.",
    icon: Star,
    categorie: 'social',
    chiffre: '1 %',
    accroche: "Pour tous les salariés et leurs familles",
  },
  {
    id: 18,
    titre: 'Véhicules de fonction',
    sousTitre: 'Mise en place pour les salariés qui le souhaitent',
    detail:
      "Nous revendiquons la mise en place d'une politique de véhicules de fonction ouverte aux salariés qui le souhaitent, en complément des avantages existants. Ce dispositif participe à l'attractivité de l'entreprise et à la fidélisation des talents dans un secteur très concurrentiel.",
    icon: Car,
    categorie: 'social',
    accroche: "Un avantage concret pour attirer et fidéliser",
  },
  {
    id: 19,
    titre: 'Offre collaborateur mobile',
    sousTitre: 'Pour le salarié et toute sa famille',
    detail:
      "Mise en place d'une offre préférentielle pour l'achat d'un mobile et la souscription d'un forfait, accessible à l'ensemble des membres de la famille du salarié. Un avantage différenciant, concret et apprécié.",
    icon: Smartphone,
    categorie: 'social',
    accroche: "Un avantage différenciant",
  },
  {
    id: 20,
    titre: 'Accord intéressement',
    sousTitre: 'Ouverture de négociation',
    detail:
      "Négociation d'un accord d'intéressement pour associer durablement les salariés aux performances économiques du Groupe. Les collaborateurs doivent bénéficier des succès collectifs qu'ils contribuent à construire.",
    icon: TrendingUp,
    categorie: 'social',
    accroche: "Associer les salariés aux résultats du Groupe",
  },

  // ── Négociation (2) ───────────────────────────────────────────────────────
  {
    id: 21,
    titre: 'Accord télétravail',
    sousTitre: 'Négociation dédiée pour un cadre clair',
    detail:
      "Ouverture d'une négociation pour un accord télétravail structurant définissant les droits et les modalités d'organisation hybride. Les salariés ont besoin d'un cadre clair, juste et opposable.",
    icon: Home,
    categorie: 'negociation',
    accroche: "Un cadre clair et juste",
  },
  {
    id: 22,
    titre: 'Accord QVT',
    sousTitre: 'Qualité de Vie au Travail — accord ambitieux',
    detail:
      "Ouverture d'une négociation pour un accord QVT ambitieux couvrant les conditions de travail, la prévention des RPS, la santé au travail et l'équilibre vie professionnelle / vie personnelle. La QVT doit être une priorité, pas un slogan.",
    icon: Leaf,
    categorie: 'negociation',
    accroche: "Une priorité, pas un slogan",
  },
];

// ===============================================================================
//  Composant carte revendication
// ===============================================================================

const CarteRevendication = ({ r, index }: { r: Revendication; index: number }) => {
  const cat  = CATEGORIES[r.categorie];
  const Icon = r.icon;

  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-2xl border-2 overflow-hidden transition-all duration-300',
        'hover:shadow-xl hover:-translate-y-1',
        cat.border,
        cat.light,
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Bandeau numéro + catégorie */}
      <div className={cn('flex items-center justify-between px-5 py-3', cat.bg)}>
        <span className="text-white/80 font-black text-3xl leading-none select-none">
          {String(r.id).padStart(2, '0')}
        </span>
        <Badge className="bg-white/20 text-white border-0 text-[10px] font-semibold backdrop-blur-sm">
          {cat.label}
        </Badge>
      </div>

      {/* Corps */}
      <div className="flex flex-col flex-1 px-5 py-4 gap-3">
        <div className="flex items-start gap-3">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5', cat.bg + '/10')}>
            <Icon className={cn('w-5 h-5', cat.text)} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base text-foreground leading-tight">{r.titre}</h3>
              {r.chiffre && (
                <span className={cn('font-black text-lg tabular-nums', cat.text)}>{r.chiffre}</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{r.sousTitre}</p>
          </div>
        </div>

        {r.accroche && (
          <div className={cn('rounded-lg px-3 py-2 border', cat.light, cat.border)}>
            <p className={cn('text-xs font-semibold italic', cat.text)}>{'« '}{r.accroche}{' »'}</p>
          </div>
        )}

        <p className="text-xs text-muted-foreground leading-relaxed flex-1">{r.detail}</p>
      </div>
    </div>
  );
};

// ===============================================================================
//  Compteurs résumé
// ===============================================================================

const STATS = [
  { label: 'Revendications',    value: '22', icon: Target,     color: 'text-primary'                           },
  { label: 'Salaires & Primes', value: '6',  icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400' },
  { label: 'Négociations',      value: '6',  icon: Clock,      color: 'text-blue-600 dark:text-blue-400'       },
  { label: 'Social & Égalité',  value: '11', icon: Users,      color: 'text-purple-600 dark:text-purple-400'   },
];

// ===============================================================================
//  Page principale
// ===============================================================================

const Nao2026 = () => {
  const categoriesUniques = Object.entries(CATEGORIES) as [keyof typeof CATEGORIES, typeof CATEGORIES[keyof typeof CATEGORIES]][];

  return (
    <div className="p-4 lg:p-8">

      <main className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto space-y-14">

          {/* Hero */}
          <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-12 md:px-14 md:py-16 text-primary-foreground">
            <div className="absolute inset-0 opacity-10 pointer-events-none select-none" aria-hidden>
              <div className="absolute -top-10 -right-10 w-72 h-72 rounded-full bg-white" />
              <div className="absolute -bottom-16 -left-10 w-96 h-96 rounded-full bg-white" />
              <div className="absolute top-1/2 left-1/3 w-40 h-40 rounded-full bg-white" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <img
                    src={logoFocom}
                    alt="Logo FOCOM"
                    className="h-10 w-auto object-contain brightness-0 invert opacity-90"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-white/20 text-white border-0 text-xs font-bold gap-1.5 backdrop-blur-sm">
                      <Megaphone className="w-3 h-3" />NAO 2026
                    </Badge>
                    <Badge className="bg-white/20 text-white border-0 text-xs font-semibold backdrop-blur-sm">
                      UES ILIAD
                    </Badge>
                    <Badge className="bg-yellow-400 text-yellow-900 border-0 text-xs font-bold">
                      FOCOM
                    </Badge>
                  </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight">
                  Négociation Annuelle<br />
                  <span className="text-yellow-300">Obligatoire 2026</span>
                </h1>

                <p className="text-primary-foreground/80 text-lg leading-relaxed max-w-xl">
                  Nos <strong className="text-white">22 revendications</strong> pour cette année de négociation.
                  Des mesures concrètes, chiffrées, pour améliorer la vie de tous les salariés de l&apos;UES ILIAD.
                </p>

                <blockquote className="border-l-2 border-yellow-300/50 pl-4 text-sm text-primary-foreground/70 italic max-w-xl">
                  &laquo; Le capital humain reste la première ressource de l&apos;entreprise et la principale composante de sa réussite. &raquo;
                </blockquote>

                <div className="flex flex-wrap gap-2 pt-2">
                  {categoriesUniques.map(([key, cat]) => (
                    <span key={key} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-sm">
                      <span className={cn('w-2 h-2 rounded-full', cat.bg)} />
                      {cat.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats hero */}
              <div className="grid grid-cols-2 gap-3 md:w-56 shrink-0">
                {STATS.map(s => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} className="rounded-2xl bg-white/10 backdrop-blur-sm px-4 py-3 text-center border border-white/20">
                      <Icon className="w-4 h-4 mx-auto mb-1 text-white/70" />
                      <p className="text-2xl font-black text-white">{s.value}</p>
                      <p className="text-[10px] text-white/70 leading-tight mt-0.5">{s.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Préambule */}
          <div className="rounded-2xl border border-border bg-muted/30 p-6 md:p-8 space-y-3">
            <h2 className="text-lg font-bold text-foreground">Préambule — Contexte 2026</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Depuis l'épisode inflationniste de 2022 à 2024, les salaires réels ont reculé : l'inflation cumulée a été nettement supérieure aux augmentations générales.
              L'année 2026 est de plus marquée par une <strong>chute brutale de l'intéressement</strong> et par l'envolée des prix de l'énergie.
              Dans ce contexte, et face à l'accélération de l'IA dans nos métiers,{' '}
              <strong>la juste répartition de la valeur ajoutée</strong> n'est plus une option — c'est une urgence.
            </p>
          </div>

          {/* Actualité des négociations */}
          <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-6 md:p-8 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
                <Megaphone className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">En direct des négociations</p>
                <h2 className="text-lg font-bold text-foreground">Actualité NAO 2026</h2>
              </div>
              <Badge className="ml-auto bg-yellow-400 text-yellow-900 border-0 text-xs font-bold shrink-0">
                Mise à jour
              </Badge>
            </div>

            {/* Timeline des séances */}
            <div className="space-y-4">

              {/* Séance 1 — passée */}
<div className="relative pl-6 border-l-2 border-primary/30">
  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-primary border-2 border-background" />
  <div className="space-y-2">
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-black text-primary">1ère réunion — 15 avril 2026</span>
      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border-0 text-[10px] font-semibold">
        Ouverture
      </Badge>
    </div>
    <p className="text-sm text-foreground font-semibold">
      La direction propose <span className="text-primary font-black">+1,5 %</span> d'augmentation collective ou individuelle, on attend les précisions.
    </p>
    <p className="text-sm text-muted-foreground leading-relaxed">
      Cette proposition s'appuie sur l'inflation du 1er trimestre 2026 selon les sources INSEE — une base de calcul
      qui minore délibérément l'érosion réelle du pouvoir d'achat subie depuis 2022.
      Quant aux <strong className="text-foreground">critères d'attribution individuelle</strong> : rien, pour l'instant.
    </p>
  </div>
</div>

{/* Séance 2 — passée */}
<div className="relative pl-6 border-l-2 border-primary/30">
  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-primary border-2 border-background" />
  <div className="space-y-2">
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-black text-primary">2ème réunion — 29 avril 2026</span>
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-0 text-[10px] font-semibold">
        Tenue
      </Badge>
    </div>
    <p className="text-sm text-muted-foreground leading-relaxed">
      Réunion tenue avec les nouvelles OS représentatives désignées à l'issue du 1er tour des élections professionnelles.
      Les négociations se poursuivent dans ce nouveau cadre de représentation.
    </p>
  </div>
</div>

{/* Séance 3 — à venir */}
<div className="relative pl-6 border-l-2 border-dashed border-primary/20">
  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-background border-2 border-primary/40" />
  <div className="space-y-2">
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-black text-muted-foreground">3ème réunion — 5 mai 2026</span>
      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-0 text-[10px] font-semibold">
        À venir
      </Badge>
    </div>
    <p className="text-sm text-muted-foreground leading-relaxed">
      Poursuite des négociations — nous y serons, déterminés et avec des contre-propositions argumentées
      sur l'ensemble de nos revendications.
    </p>
  </div>
</div>

{/* Séance 4 — à venir */}
<div className="relative pl-6 border-l-2 border-dashed border-primary/20">
  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-background border-2 border-primary/40" />
  <div className="space-y-2">
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-black text-muted-foreground">4ème réunion — 13 mai 2026</span>
      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-0 text-[10px] font-semibold">
        À venir
      </Badge>
    </div>
    <p className="text-sm text-muted-foreground leading-relaxed">
      Séance de conclusion prévue — nous visons un accord ambitieux à la hauteur des attentes des salariés.
    </p>
  </div>
</div>

            </div>

            {/* Message de la délégation */}
            <div className="rounded-xl bg-primary/10 border border-primary/20 px-5 py-4 space-y-2">
              <p className="text-xs font-bold text-primary uppercase tracking-wide">Le mot de la délégation FOCOM</p>
              <p className="text-sm text-foreground leading-relaxed">
                Suite à la GEPP, nous sommes plus déterminés que jamais. Les élections professionnelles nous donnent
                un poids supplémentaire pour imposer un véritable rapport de force.{' '}
                <strong>Nous lutterons pour une qualité de vie au travail à la hauteur de votre engagement au quotidien.</strong>
              </p>
            </div>
          </div>

          {/* Reconduction NAO 2025 */}
          <div className="rounded-2xl bg-gradient-to-r from-blue-900 to-blue-700 text-white p-6 md:p-8 flex items-center gap-5">
            <div className="text-4xl shrink-0">🔄</div>
            <div>
              <h3 className="text-base font-black mb-1">Reconduction des mesures NAO 2025</h3>
              <p className="text-sm text-white/85 leading-relaxed">
                Nous exigeons la reconduction intégrale de toutes les mesures et avantages acquis lors des précédentes
                négociations annuelles (NAO 2025), sans régression sociale d'aucune sorte.
              </p>
            </div>
          </div>

          {/* Légende catégories */}
          <div className="flex flex-wrap gap-3 justify-center">
            {categoriesUniques.map(([key, cat]) => (
              <div key={key} className={cn('flex items-center gap-2 px-4 py-2 rounded-full border', cat.light, cat.border)}>
                <span className={cn('w-2.5 h-2.5 rounded-full', cat.bg)} />
                <span className={cn('text-xs font-semibold', cat.text)}>{cat.label}</span>
                <span className="text-xs text-muted-foreground">
                  ({REVENDICATIONS.filter(r => r.categorie === key).length})
                </span>
              </div>
            ))}
          </div>

          {/* Grille des revendications */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold text-foreground">Nos 22 revendications</h2>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {REVENDICATIONS.map((r, i) => (
                <CarteRevendication key={r.id} r={r} index={i} />
              ))}
            </div>
          </div>

          {/* Bloc synthèse chiffrée */}
          <div className="rounded-2xl border-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 p-6 md:p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                  Synthèse de l&apos;enveloppe
                </h3>
                <p className="text-sm text-emerald-700 dark:text-emerald-400 leading-relaxed">
                  Restaurer le pouvoir d&apos;achat et corriger les inégalités structurelles.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Augmentation collective', value: '+2,5 %', detail: 'Rétroactivité au 1er janv. 2026' },
                { label: 'Ticket-restaurant',        value: '12,50 €', detail: 'Valeur faciale revalorisée'    },
                { label: 'Budget œuvres sociales',   value: '1 %',     detail: 'De la masse salariale'         },
                { label: 'Prime de vacances',         value: '150 €',   detail: 'Pour tous les salariés'        },
                { label: 'Indemnité télétravail',     value: '59 €',    detail: 'Mensuelle revalorisée'         },
                { label: 'Budget QVCT',               value: '200 €',   detail: 'Convivialité + Noël'           },
              ].map(item => (
                <div key={item.label} className="rounded-xl bg-white dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 px-4 py-3 text-center">
                  <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">{item.value}</p>
                  <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 mt-1">{item.label}</p>
                  <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 mt-0.5">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline des priorités */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold text-foreground">Nos priorités pour 2026</h2>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="space-y-4">
              {[
                {
                  priorite: 'Priorité 1',
                  titre: "Défendre le pouvoir d'achat",
                  desc: "Augmentation de 2,5 % pour tous, indexation sur le SMIC, revalorisation du ticket-restaurant et du panier repas, prime de partage de la valeur : des mesures immédiates et concrètes.",
                  color: 'emerald',
                  items: ["Augmentation 2,5 % rétroactive", 'Indexation SMIC', 'Ticket-restaurant 12,50 €', 'Prime de partage de la valeur', 'Subrogation & 0 délai de carence'],
                },
                {
                  priorite: 'Priorité 2',
                  titre: 'Justice et égalité au travail',
                  desc: "Égalité femmes-hommes, reclassification des techniciens en Agents de Maîtrise, transparence sur les fiches de paie et reconnaissance des départs en retraite.",
                  color: 'purple',
                  items: ['Rattrapage F/H systématique', 'Reclassification seuil D → AM', 'Transparence fiches de paie', 'Médaille du travail retraite'],
                },
                {
                  priorite: 'Priorité 3',
                  titre: "Améliorer les conditions de travail",
                  desc: "Temps de trajet reconnu, ouvertures de négociation sur le temps de travail et l'IA, budget QVCT, indemnité télétravail, véhicules de fonction.",
                  color: 'blue',
                  items: ['Temps de trajet itinérants', 'Négociation temps de travail', 'Négociation IA & Digitalisation', 'Budget QVCT 200 €', 'Indemnité télétravail 59 €'],
                },
              ].map((bloc, i) => {
                const colors = {
                  emerald: { bg: 'bg-emerald-500', light: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-300 dark:border-emerald-700', text: 'text-emerald-700 dark:text-emerald-400', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' },
                  purple:  { bg: 'bg-purple-500',  light: 'bg-purple-50 dark:bg-purple-950/30',   border: 'border-purple-300 dark:border-purple-700',   text: 'text-purple-700 dark:text-purple-400',   badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'   },
                  blue:    { bg: 'bg-blue-500',    light: 'bg-blue-50 dark:bg-blue-950/30',       border: 'border-blue-300 dark:border-blue-700',       text: 'text-blue-700 dark:text-blue-400',       badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'           },
                } as const;
                const c = colors[bloc.color as keyof typeof colors];
                return (
                  <div key={i} className={cn('rounded-2xl border-2 p-5 md:p-6', c.light, c.border)}>
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex items-center gap-3 md:w-48 shrink-0">
                        <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0', c.bg)}>
                          {i + 1}
                        </div>
                        <div>
                          <p className={cn('text-[10px] font-bold uppercase tracking-widest', c.text)}>{bloc.priorite}</p>
                          <p className="font-bold text-sm text-foreground leading-tight">{bloc.titre}</p>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{bloc.desc}</p>
                        <div className="flex flex-wrap gap-2">
                          {bloc.items.map(item => (
                            <span key={item} className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium', c.badge)}>
                              <ArrowRight className="w-3 h-3" />{item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA contact */}
          <div className="rounded-2xl bg-primary/5 border border-primary/20 px-6 py-8 md:px-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold text-foreground mb-1">Vous avez des questions sur la NAO ?</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Nos représentants FOCOM UES ILIAD sont disponibles pour vous informer et recueillir vos besoins avant et pendant la négociation.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Button asChild>
                <Link to="/nao2026/formulaire">
                  <Megaphone className="w-4 h-4 mr-2" />
                  Donner mon avis sur la NAO
                </Link>
              </Button>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-center text-xs text-muted-foreground">
            Document FOCOM UES ILIAD &mdash; NAO 2026. Ces revendications sont celles portées par la délégation FOCOM
            et ne constituent pas un engagement contractuel. Les négociations sont en cours.
          </p>

        </div>
      </main>

    </div>
  );
};

export default Nao2026;
