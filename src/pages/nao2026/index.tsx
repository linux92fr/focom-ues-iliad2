import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  CalendarDays,
  Car,
  CheckCircle2,
  Clock,
  FileText,
  Handshake,
  HeartPulse,
  Home,
  Mail,
  Megaphone,
  Scale,
  ShieldCheck,
  Ticket,
  TrendingDown,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react';

const meetings = [
  '15/04/2026',
  '29/04/2026',
  '05/05/2026',
  '13/05/2026',
];

const directionBudgets = [
  { entite: 'UES ILIAD', budget: '1,6 %', revisions: '1,2 %', social: '0,4 %' },
  { entite: 'FREE RÉSEAU / ROF', budget: '1,7 %', revisions: '1,2 %', social: '0,5 %' },
  { entite: 'FREE MOBILE', budget: '1,2 %', revisions: '1,2 %', social: '—' },
  { entite: 'ILIAD / ASSUNET / FREE SAS', budget: '1,2 %', revisions: '1,2 %', social: '—' },
];

const comparisonSections = [
  {
    title: 'Mesures salariales',
    icon: Banknote,
    rows: [
      ['Enveloppe globale demandée par les OS : 2,2 % à 2,9 %', '1,6 % seulement pour l’UES ILIAD'],
      ['Augmentation collective pour tous les salariés', '1 % uniquement pour les packages ≤ 30 000 €'],
      ['Augmentation automatique après 3 ans sans évolution', 'Refusé'],
      ['Rétroactivité au 1er janvier 2026', 'Refusé'],
      ['Revalorisation significative du salaire d’entrée', '+240 €/an seulement'],
    ],
  },
  {
    title: 'Ancienneté',
    icon: Clock,
    rows: [
      ['Prime d’ancienneté dès 3 ans puis progression régulière', 'Refusé'],
      ['Congés supplémentaires selon ancienneté', 'Refusé'],
    ],
  },
  {
    title: 'Temps de travail',
    icon: CalendarDays,
    rows: [
      ['Temps de trajet rémunéré comme temps de travail effectif', 'Refusé'],
      ['Cadres au forfait : réduction de 3 jours ou passage à 39h', 'Négociation promise dans 12 mois'],
      ['Revalorisation des astreintes', 'Refusé'],
      ['Deuxième fenêtre CET', 'Refusé'],
      ['Congés exceptionnels revalorisés', 'Refusé'],
    ],
  },
  {
    title: 'Télétravail',
    icon: Home,
    rows: [
      ['2 jours de télétravail par semaine pour tous', 'Refusé'],
      ['2 jours consécutifs possibles', 'Refusé'],
      ['Harmonisation UES des règles de télétravail', 'Refusé'],
      ['Réexamen des non-éligibilités', 'Refusé'],
      ['Revalorisation / défiscalisation de la prime domicile', 'Refusé'],
    ],
  },
  {
    title: 'Transport et mobilité',
    icon: Car,
    rows: [
      ['Pass Navigo : meilleure prise en charge', '75 % — avancée mais insuffisante face aux hausses'],
      ['Véhicule de fonction ouvert aux salariés', 'Refusé'],
      ['Prime carburant pour tous', '50 € avec conditions très restrictives'],
    ],
  },
  {
    title: 'Avantages sociaux',
    icon: Ticket,
    rows: [
      ['Tickets restaurant et paniers repas revalorisés', '9 € pour Free Mobile uniquement'],
      ['Budget convivialité 150 € + 50 € Noël', 'Refusé'],
      ['Prime salissure uniformisée', 'Refusé'],
      ['Prime vacances pour tous', 'Refusé'],
    ],
  },
  {
    title: 'Égalité femmes-hommes',
    icon: Scale,
    rows: [
      ['Rattrapage des écarts salariaux femmes-hommes', 'Refusé'],
      ['Congé endométriose supplémentaire', 'Refusé'],
      ['Prise en charge d’un mois du congé naissance collaboratrices', 'Refusé'],
      ['Doublement prime cooptation recrutements féminins', 'Refusé'],
    ],
  },
  {
    title: 'CSE et négociations collectives',
    icon: Handshake,
    rows: [
      ['Dotation CSE à 1 %', 'Refusé'],
      ['Communication CSE trimestrielle par email', 'Refusé'],
      ['Assistante sociale siège + régions', 'Refusé'],
      ['Ouverture PPV, IA, intéressement, participation, dialogue social', 'Refusé sauf temps de travail dans 12 mois'],
      ['Réouverture GEPP, égalité pro, CET', 'Refusé'],
    ],
  },
];

const refusalReasons = [
  'Budget global de 1,6 % insuffisant face à l’inflation et aux résultats du Groupe.',
  'Augmentation collective de 1 % réservée aux seuls packages ≤ 30 000 €, excluant une grande partie des salariés.',
  'Aucune rétroactivité au 1er janvier 2026 : perte de pouvoir d’achat sur plusieurs mois.',
  'Prime carburant de 50 € assortie de conditions tellement restrictives qu’elle concernera très peu de salariés.',
  'Aucune avancée réelle sur l’ancienneté, le temps de travail, le télétravail, l’égalité femmes-hommes ou les congés.',
  'Absence de véritables négociations : la Direction impose ses propositions sans répondre aux revendications portées par les salariés.',
];

const naoTimeline = [
  { date: '15 avril', title: 'Réunion 1', text: 'Ouverture des échanges et présentation des premières orientations.' },
  { date: '29 avril', title: 'Réunion 2', text: 'Les organisations syndicales portent leurs demandes salariales et sociales.' },
  { date: '5 mai', title: 'Réunion 3', text: 'La Direction maintient une ligne très limitée malgré les revendications.' },
  { date: '13 mai', title: 'Réunion 4', text: 'Propositions finales : FO dénonce une absence de véritables négociations.' },
];

const statusCards = [
  { label: 'Réunions', value: '4', detail: '15/04, 29/04, 05/05, 13/05', icon: CalendarDays },
  { label: 'Budget Direction', value: '1,6 %', detail: 'dont 1,2 % révisions salariales', icon: TrendingDown },
  { label: 'Demandes OS', value: '2,2 à 2,9 %', detail: 'enveloppe revendiquée', icon: TrendingUp },
  { label: 'Position FO', value: 'Refus', detail: 'FO ne signera pas', icon: XCircle },
];

const Nao2026 = () => {
  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 p-3 sm:p-4 lg:p-8">
      <section className="relative overflow-hidden rounded-3xl bg-[#13233A] p-6 text-white shadow-xl sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full border-[52px] border-white/5" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-red-600/25 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge className="border border-red-300/20 bg-red-500/20 text-red-100 hover:bg-red-500/20">
                <Megaphone className="mr-1 h-3.5 w-3.5" /> NAO 2026
              </Badge>
              <Badge className="border border-white/15 bg-white/10 text-white hover:bg-white/10">UES ILIAD</Badge>
              <Badge className="border-0 bg-yellow-400 text-yellow-950 hover:bg-yellow-400">Position FO COM</Badge>
            </div>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl">
              La Direction refuse de négocier : FO ne signera pas cet accord insuffisant
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/80 sm:text-lg">
              Après quatre réunions de pseudo-négociations, la Direction présente une enveloppe globale limitée à 1,6 %. Pour FO COM, ces propositions ne répondent ni à l’inflation, ni aux attentes légitimes des salariés.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="bg-red-600 text-white hover:bg-red-700">
                <Link to="/contact"><Mail className="mr-2 h-4 w-4" /> Contacter FO COM</Link>
              </Button>
              <Button asChild variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                <Link to="/nao2026/formulaire"><Megaphone className="mr-2 h-4 w-4" /> Donner mon avis</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {statusCards.map((card) => (
              <div key={card.label} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <card.icon className="mb-3 h-5 w-5 text-red-200" />
                <p className="text-xs font-bold uppercase tracking-wide text-white/60">{card.label}</p>
                <p className="mt-1 text-2xl font-extrabold text-white">{card.value}</p>
                <p className="mt-1 text-xs text-white/70">{card.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border-2 border-red-200 bg-red-50 p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-extrabold text-red-900">FO refuse de cautionner cette mascarade</p>
              <p className="mt-1 text-sm leading-relaxed text-red-800/80">
                FO dénonce l’absence de véritable dialogue social : les revendications portées par les organisations syndicales sont massivement rejetées, tandis que la Direction maintient une enveloppe insuffisante.
              </p>
            </div>
          </div>
          <div className="rounded-xl bg-white px-4 py-3 text-center shadow-sm lg:w-56">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Conclusion FO</p>
            <p className="text-2xl font-black text-red-600">Non-signature</p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        {directionBudgets.map((item) => (
          <Card key={item.entite} className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{item.entite}</p>
              <p className="mt-2 text-3xl font-extrabold text-red-600">{item.budget}</p>
              <p className="mt-1 text-xs text-slate-500">Révisions salariales : <strong>{item.revisions}</strong></p>
              <p className="text-xs text-slate-500">Mesures sociales : <strong>{item.social}</strong></p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <CalendarDays className="h-5 w-5 text-teal-600" />
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Chronologie des négociations</h2>
            <p className="text-sm text-slate-500">Quatre réunions, aucune avancée majeure.</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          {naoTimeline.map((step, index) => (
            <div key={step.date} className="relative rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-teal-600 text-sm font-black text-white">{index + 1}</div>
              <p className="text-xs font-bold uppercase tracking-wide text-teal-700">{step.date}</p>
              <p className="mt-1 font-bold text-slate-900">{step.title}</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 space-y-5">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Demandes OS vs propositions Direction</h2>
          <p className="mt-1 text-sm text-slate-500">Une synthèse claire des refus et des mesures insuffisantes.</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {comparisonSections.map((section) => (
            <Card key={section.title} className="overflow-hidden border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 bg-slate-50 pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-extrabold text-slate-900">
                  <section.icon className="h-5 w-5 text-teal-600" /> {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {section.rows.map(([demand, proposal], index) => {
                  const refused = proposal.toLowerCase().includes('refusé');
                  return (
                    <div key={`${section.title}-${index}`} className="grid gap-2 border-b border-slate-100 p-4 last:border-b-0 sm:grid-cols-2">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Demandes</p>
                        <p className="mt-1 text-sm font-medium leading-relaxed text-slate-700">{demand}</p>
                      </div>
                      <div className={refused ? 'rounded-xl bg-red-50 p-3' : 'rounded-xl bg-amber-50 p-3'}>
                        <p className={refused ? 'text-[10px] font-bold uppercase tracking-wide text-red-500' : 'text-[10px] font-bold uppercase tracking-wide text-amber-600'}>Direction</p>
                        <p className={refused ? 'mt-1 text-sm font-bold leading-relaxed text-red-700' : 'mt-1 text-sm font-bold leading-relaxed text-amber-700'}>{proposal}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-3xl bg-slate-950 p-5 text-white shadow-xl sm:p-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold">Pourquoi FO ne signera pas</h2>
            <p className="mt-1 text-sm text-white/60">Les raisons principales de notre refus.</p>
          </div>
          <Badge className="w-fit border border-red-300/20 bg-red-500/20 text-red-100 hover:bg-red-500/20">Position officielle FO</Badge>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {refusalReasons.map((reason, index) => (
            <div key={reason} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-600 text-sm font-black text-white">{index + 1}</div>
              <p className="text-sm leading-relaxed text-white/85">{reason}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        <Card className="border-teal-100 bg-teal-50/60 shadow-sm lg:col-span-2">
          <CardContent className="p-5 sm:p-6">
            <div className="mb-3 flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-teal-700" />
              <h2 className="text-xl font-extrabold text-slate-900">FO reste mobilisé pour les salariés</h2>
            </div>
            <p className="text-sm leading-relaxed text-slate-700">
              Force Ouvrière continuera à porter les revendications légitimes des salariés et à dénoncer l’absence de dialogue social. Les salariés méritent mieux que des mesures partielles, conditionnées et largement insuffisantes.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="bg-teal-700 text-white hover:bg-teal-800">
                <Link to="/contact">Nous contacter <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50">
                <Link to="/actualites">Suivre les actualités</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-100 bg-white shadow-sm">
          <CardContent className="p-5 sm:p-6">
            <HeartPulse className="mb-4 h-8 w-8 text-red-600" />
            <h3 className="font-extrabold text-slate-900">Le pouvoir d’achat reste prioritaire</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Dans un contexte de pression sur les prix, les salariés attendent des mesures générales, justes et lisibles, pas des enveloppes limitées ni des primes inaccessibles.
            </p>
          </CardContent>
        </Card>
      </section>

      <p className="mt-8 text-center text-xs text-slate-400">
        Document FO COM UES ILIAD — actualisation NAO 2026 après les réunions des {meetings.join(', ')}. Les éléments présentés synthétisent la position FO et les propositions finales communiquées.
      </p>
    </main>
  );
};

export default Nao2026;
