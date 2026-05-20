import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Vote,
  Users,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Award,
  Trophy,
  FileText,
  ChevronRight,
  ShieldCheck,
  BarChart3,
  Handshake,
  Info,
  MessageSquare,
} from 'lucide-react';

const FO_COLOR = '#E05C1F';
const CFDT_COLOR = '#003189';
const UNSA_COLOR = '#F5A623';
const CGT_COLOR = '#E30613';
const SUD_COLOR = '#7B1FA2';
const CFECGC_COLOR = '#0077B6';
const CFTC_COLOR = '#2E7D32';

const PARTICIPATION = {
  tauxEtablissement: 46.72,
  colleges: [
    {
      nom: 'Techniciens, employés, non cadres',
      quorum: false,
      tauxCollege: 37.64,
      titulaires: { inscrits: 2774, votants: 1045, taux: 37.67 },
      suppleants: { inscrits: 2774, votants: 1043, taux: 37.60 },
    },
    {
      nom: 'Cadres',
      quorum: true,
      tauxCollege: 58.64,
      titulaires: { inscrits: 2112, votants: 1239, taux: 58.66 },
      suppleants: { inscrits: 2112, votants: 1238, taux: 58.62 },
    },
  ],
};

type SyndicatResult = {
  nom: string;
  couleur: string;
  titulaires: { signatures: number; pct: number; sieges: number } | null;
  suppleants: { signatures: number; pct: number; sieges: number } | null;
};

const RESULTATS_EMPLOYES: SyndicatResult[] = [
  { nom: 'FO', couleur: FO_COLOR, titulaires: { signatures: 358, pct: 35.10, sieges: 0 }, suppleants: { signatures: 352, pct: 34.65, sieges: 0 } },
  { nom: 'CFDT', couleur: CFDT_COLOR, titulaires: { signatures: 230, pct: 22.55, sieges: 0 }, suppleants: { signatures: 229, pct: 22.54, sieges: 0 } },
  { nom: 'SUD', couleur: SUD_COLOR, titulaires: { signatures: 196, pct: 19.22, sieges: 0 }, suppleants: { signatures: 202, pct: 19.88, sieges: 0 } },
  { nom: 'UNSA', couleur: UNSA_COLOR, titulaires: { signatures: 115, pct: 11.27, sieges: 0 }, suppleants: { signatures: 107, pct: 10.53, sieges: 0 } },
  { nom: 'CGT', couleur: CGT_COLOR, titulaires: { signatures: 115, pct: 11.27, sieges: 0 }, suppleants: { signatures: 118, pct: 11.61, sieges: 0 } },
  { nom: 'CFTC', couleur: CFTC_COLOR, titulaires: { signatures: 6, pct: 0.59, sieges: 0 }, suppleants: { signatures: 8, pct: 0.79, sieges: 0 } },
];

const RESULTATS_CADRES: SyndicatResult[] = [
  { nom: 'CFE/CGC', couleur: CFECGC_COLOR, titulaires: { signatures: 267, pct: 21.85, sieges: 3 }, suppleants: { signatures: 274, pct: 22.48, sieges: 3 } },
  { nom: 'UNSA', couleur: UNSA_COLOR, titulaires: { signatures: 258, pct: 21.11, sieges: 3 }, suppleants: { signatures: 251, pct: 20.59, sieges: 3 } },
  { nom: 'FO', couleur: FO_COLOR, titulaires: { signatures: 252, pct: 20.62, sieges: 3 }, suppleants: { signatures: 238, pct: 19.52, sieges: 3 } },
  { nom: 'CFDT', couleur: CFDT_COLOR, titulaires: { signatures: 217, pct: 17.76, sieges: 2 }, suppleants: { signatures: 228, pct: 18.70, sieges: 2 } },
  { nom: 'SUD', couleur: SUD_COLOR, titulaires: { signatures: 190, pct: 15.55, sieges: 2 }, suppleants: { signatures: 189, pct: 15.50, sieges: 2 } },
  { nom: 'CGT', couleur: CGT_COLOR, titulaires: { signatures: 38, pct: 3.11, sieges: 0 }, suppleants: { signatures: 39, pct: 3.29, sieges: 0 } },
  { nom: 'CFTC', couleur: CFTC_COLOR, titulaires: { signatures: 0, pct: 0, sieges: 0 }, suppleants: null },
];

const FO_ELUS_CADRES = [
  'NOUATIN Cornelia',
  'ZERARKA Mounir',
  'ALLARD Eloise',
  'EL KHOURY Elise',
  'DOGHEMANE Haissa',
  'THON Amandine',
];

const TauxBar = ({ taux, color = '#0f766e' }: { taux: number; color?: string }) => (
  <div className="flex items-center gap-3">
    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(taux, 100)}%`, background: color }} />
    </div>
    <span className="w-16 text-right text-sm font-bold tabular-nums" style={{ color }}>{taux.toFixed(2)} %</span>
  </div>
);

const SiegeBadge = ({ n }: { n: number }) => (
  <span className={`inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 text-xs font-bold ${n > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'}`}>
    {n > 0 ? `${n} siège${n > 1 ? 's' : ''}` : '—'}
  </span>
);

const SyndicatRow = ({ s, type }: { s: SyndicatResult; type: 'titulaires' | 'suppleants' }) => {
  const data = type === 'titulaires' ? s.titulaires : s.suppleants;
  if (!data) return null;

  return (
    <div className={`space-y-1 rounded-xl p-2 ${s.nom === 'FO' ? 'bg-orange-50 ring-1 ring-orange-100' : ''}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.couleur }} />
          <span className={`truncate text-sm font-semibold ${s.nom === 'FO' ? 'text-orange-700' : 'text-slate-800'}`}>{s.nom}</span>
          <span className="shrink-0 text-xs tabular-nums text-slate-500">{data.signatures} sig.</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="w-16 text-right text-sm font-bold tabular-nums" style={{ color: s.couleur }}>{data.pct.toFixed(2)} %</span>
          <SiegeBadge n={data.sieges} />
        </div>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full" style={{ width: `${data.pct}%`, background: s.couleur }} />
      </div>
    </div>
  );
};

const ResultatsBloc = ({ title, description, data }: { title: string; description: string; data: SyndicatResult[] }) => (
  <section className="space-y-4">
    <div>
      <h2 className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
        <Trophy className="h-5 w-5 text-teal-600" /> {title}
      </h2>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold uppercase tracking-wide text-slate-500">Titulaires</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[...data].filter(s => s.titulaires).sort((a, b) => (b.titulaires?.pct ?? 0) - (a.titulaires?.pct ?? 0)).map(s => <SyndicatRow key={`${s.nom}-tit`} s={s} type="titulaires" />)}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold uppercase tracking-wide text-slate-500">Suppléants</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[...data].filter(s => s.suppleants).sort((a, b) => (b.suppleants?.pct ?? 0) - (a.suppleants?.pct ?? 0)).map(s => <SyndicatRow key={`${s.nom}-sup`} s={s} type="suppleants" />)}
        </CardContent>
      </Card>
    </div>
  </section>
);

const Elections = () => {
  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 p-3 sm:p-4 lg:p-8">
      <section className="relative overflow-hidden rounded-3xl bg-[#13233A] p-6 text-white shadow-xl sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border-[48px] border-white/5" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-red-600/20 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <Badge className="mb-4 bg-teal-500/20 text-teal-100 border border-teal-300/20 hover:bg-teal-500/20">
              Archive CSE 2026 · Scrutin terminé
            </Badge>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl">
              Élections professionnelles 2026
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-lg">
              Retrouvez les résultats, la participation et les suites du scrutin CSE de l’UES ILIAD. La page n’est plus un appel au vote : elle sert désormais d’espace de bilan et de suivi.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="bg-red-600 text-white hover:bg-red-700">
                <Link to="/bilan-mandat"><FileText className="mr-2 h-4 w-4" /> Voir le bilan FO COM</Link>
              </Button>
              <Button asChild variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                <Link to="/actualites"><TrendingUp className="mr-2 h-4 w-4" /> Suivre les actualités</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              { icon: Users, label: 'Participation globale', value: `${PARTICIPATION.tauxEtablissement} %`, text: 'Taux établissement au 1er tour' },
              { icon: Award, label: 'FO cadres', value: '3 + 3 sièges', text: 'Titulaires et suppléants obtenus' },
              { icon: TrendingUp, label: 'FO employés', value: '1ère liste', text: '35,10 % titulaires au 1er tour' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                  <item.icon className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold uppercase tracking-wide text-white/60">{item.label}</p>
                <p className="mt-1 text-2xl font-extrabold">{item.value}</p>
                <p className="mt-1 text-xs text-white/70">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-teal-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-slate-900">Le vote électronique est clôturé</p>
              <p className="mt-1 text-sm text-slate-500">
                Les contenus de campagne sont archivés. Les informations importantes sont désormais les résultats, les suites du scrutin et le suivi du mandat.
              </p>
            </div>
          </div>
          <Button asChild variant="outline" className="w-full border-teal-200 text-teal-700 hover:bg-teal-50 sm:w-auto">
            <Link to="/contact">Contacter FO COM <ChevronRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          { icon: ShieldCheck, title: 'Représenter', text: 'Porter les revendications des salariés dans les instances.' },
          { icon: Handshake, title: 'Négocier', text: 'Défendre le pouvoir d’achat, les conditions de travail et les droits collectifs.' },
          { icon: Info, title: 'Informer', text: 'Rendre compte des suites du scrutin, des réunions et des négociations.' },
        ].map((item) => (
          <Card key={item.title} className="border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <item.icon className="h-5 w-5" />
              </div>
              <h2 className="font-extrabold text-slate-900">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.text}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-8 space-y-5">
        <h2 className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
          <BarChart3 className="h-5 w-5 text-teal-600" /> Participation
        </h2>
        <Card className="border-t-4 border-t-slate-400">
          <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Taux établissement global</p>
              <p className="text-4xl font-extrabold text-slate-900">{PARTICIPATION.tauxEtablissement} %</p>
            </div>
            <div className="w-full sm:max-w-md"><TauxBar taux={PARTICIPATION.tauxEtablissement} color="#64748b" /></div>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          {PARTICIPATION.colleges.map((col) => (
            <Card key={col.nom} className={`border-l-4 ${col.quorum ? 'border-l-emerald-500' : 'border-l-amber-500'}`}>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <CardTitle className="text-base font-extrabold text-slate-900">{col.nom}</CardTitle>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${col.quorum ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {col.quorum ? <><CheckCircle className="h-3.5 w-3.5" /> Quorum atteint</> : <><AlertTriangle className="h-3.5 w-3.5" /> Quorum non atteint au 1er tour</>}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Titulaires</p>
                    <p className="mt-1 text-sm text-slate-600">{col.titulaires.votants.toLocaleString('fr-FR')} votants / {col.titulaires.inscrits.toLocaleString('fr-FR')} inscrits</p>
                    <p className="mt-2 text-2xl font-extrabold text-slate-900">{col.titulaires.taux} %</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Suppléants</p>
                    <p className="mt-1 text-sm text-slate-600">{col.suppleants.votants.toLocaleString('fr-FR')} votants / {col.suppleants.inscrits.toLocaleString('fr-FR')} inscrits</p>
                    <p className="mt-2 text-2xl font-extrabold text-slate-900">{col.suppleants.taux} %</p>
                  </div>
                </div>
                <TauxBar taux={col.tauxCollege} color={col.quorum ? '#10b981' : '#f59e0b'} />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-3xl border-2 border-orange-200 bg-orange-50/70 p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-black text-white" style={{ background: FO_COLOR }}>
              FO
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-orange-700">Résultat FO COM</p>
              <h2 className="mt-1 text-2xl font-extrabold text-slate-900">FO confirme sa place dans le paysage social de l’UES ILIAD</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                FO arrive en tête sur le collège Techniciens / Employés / Non-Cadres au 1er tour et obtient des sièges dans le collège Cadres.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:w-[360px]">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Employés</p>
              <p className="mt-1 text-2xl font-extrabold text-orange-700">35,10 %</p>
              <p className="text-xs text-slate-500">Titulaires · 1ère liste</p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Cadres</p>
              <p className="mt-1 text-2xl font-extrabold text-orange-700">3 sièges</p>
              <p className="text-xs text-slate-500">Titulaires + 3 suppléants</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-8 space-y-8">
        <ResultatsBloc
          title="Résultats — Techniciens / Employés / Non-Cadres"
          description="Résultats du 1er tour. Le quorum n’ayant pas été atteint, le collège a nécessité un 2e tour."
          data={RESULTATS_EMPLOYES}
        />
        <ResultatsBloc
          title="Résultats — Cadres"
          description="Résultats définitifs du 1er tour. 13 sièges pourvus sur 13."
          data={RESULTATS_CADRES}
        />
      </div>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Élus FO cadres</h2>
            <p className="mt-1 text-sm text-slate-500">Titulaires et suppléants élus au 1er tour.</p>
          </div>
          <Award className="h-6 w-6 text-orange-600" />
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {FO_ELUS_CADRES.map((nom) => (
            <div key={nom} className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-700">
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
              <span className="truncate">{nom}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          { title: 'Lire le bilan de mandat', text: 'Comprendre les actions menées et les priorités défendues.', href: '/bilan-mandat', icon: FileText },
          { title: 'Suivre les actualités', text: 'Rester informé des suites du scrutin et des négociations.', href: '/actualites', icon: TrendingUp },
          { title: 'Faire une demande', text: 'Contacter FO COM ou transmettre un document via la messagerie.', href: '/mes-reclamations', icon: MessageSquare },
        ].map((item) => (
          <Link key={item.title} to={item.href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <item.icon className="h-5 w-5" />
            </div>
            <p className="font-extrabold text-slate-900 group-hover:text-red-600">{item.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.text}</p>
            <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-teal-700">
              Accéder <ChevronRight className="h-4 w-4" />
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
};

export default Elections;
