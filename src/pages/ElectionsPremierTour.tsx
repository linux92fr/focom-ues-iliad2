import PageShell from '@/components/PageShell';


import ScrollToTop from '@/components/ScrollToTop';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Vote, Users, Calendar, ArrowLeft, CheckCircle, AlertTriangle, TrendingUp, Award, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

// ── Données participation ──────────────────────────────────────────────────────
const PARTICIPATION = {
  tauxEtablissement: 46.72,
  colleges: [
    {
      nom: 'TECHNICIENS, EMPLOYÉS, NON CADRES',
      quorum: false,
      tauxCollege: 37.64,
      titulaires: { inscrits: 2774, votants: 1045, taux: 37.67 },
      suppleants: { inscrits: 2774, votants: 1043, taux: 37.60 },
    },
    {
      nom: 'CADRES',
      quorum: true,
      tauxCollege: 58.64,
      titulaires: { inscrits: 2112, votants: 1239, taux: 58.66 },
      suppleants: { inscrits: 2112, votants: 1238, taux: 58.62 },
    },
  ],
};

// ── Données résultats syndicats ────────────────────────────────────────────────
type SyndicatResult = {
  nom: string;
  couleur: string;
  titulaires: { signatures: number; pct: number; sieges: number } | null;
  suppleants: { signatures: number; pct: number; sieges: number } | null;
};

const FO_COLOR     = '#E05C1F';
const CFDT_COLOR   = '#003189';
const UNSA_COLOR   = '#F5A623';
const CGT_COLOR    = '#E30613';
const SUD_COLOR    = '#7B1FA2';
const CFECGC_COLOR = '#0077B6';
const CFTC_COLOR   = '#2E7D32';

// ── Résultats Employés/Techniciens/Non-Cadres ──────────────────────────────────
const RESULTATS_EMPLOYES: SyndicatResult[] = [
  {
    nom: 'FO',
    couleur: FO_COLOR,
    titulaires: { signatures: 358, pct: 35.10, sieges: 0 },
    suppleants: { signatures: 352, pct: 34.65, sieges: 0 },
  },
  {
    nom: 'SUD',
    couleur: SUD_COLOR,
    titulaires: { signatures: 196, pct: 19.22, sieges: 0 },
    suppleants: { signatures: 202, pct: 19.88, sieges: 0 },
  },
  {
    nom: 'CFDT',
    couleur: CFDT_COLOR,
    titulaires: { signatures: 230, pct: 22.55, sieges: 0 },
    suppleants: { signatures: 229, pct: 22.54, sieges: 0 },
  },
  {
    nom: 'UNSA',
    couleur: UNSA_COLOR,
    titulaires: { signatures: 115, pct: 11.27, sieges: 0 },
    suppleants: { signatures: 107, pct: 10.53, sieges: 0 },
  },
  {
    nom: 'CGT',
    couleur: CGT_COLOR,
    titulaires: { signatures: 115, pct: 11.27, sieges: 0 },
    suppleants: { signatures: 118, pct: 11.61, sieges: 0 },
  },
  {
    nom: 'CFTC',
    couleur: CFTC_COLOR,
    titulaires: { signatures: 6, pct: 0.59, sieges: 0 },
    suppleants: { signatures: 8, pct: 0.79, sieges: 0 },
  },
];

// ── Résultats Cadres ───────────────────────────────────────────────────────────
const RESULTATS_CADRES: SyndicatResult[] = [
  {
    nom: 'CFE/CGC',
    couleur: CFECGC_COLOR,
    titulaires: { signatures: 267, pct: 21.85, sieges: 3 },
    suppleants: { signatures: 274, pct: 22.48, sieges: 3 },
  },
  {
    nom: 'UNSA',
    couleur: UNSA_COLOR,
    titulaires: { signatures: 258, pct: 21.11, sieges: 3 },
    suppleants: { signatures: 251, pct: 20.59, sieges: 3 },
  },
  {
    nom: 'FO',
    couleur: FO_COLOR,
    titulaires: { signatures: 252, pct: 20.62, sieges: 3 },
    suppleants: { signatures: 238, pct: 19.52, sieges: 3 },
  },
  {
    nom: 'CFDT',
    couleur: CFDT_COLOR,
    titulaires: { signatures: 217, pct: 17.76, sieges: 2 },
    suppleants: { signatures: 228, pct: 18.70, sieges: 2 },
  },
  {
    nom: 'SUD',
    couleur: SUD_COLOR,
    titulaires: { signatures: 190, pct: 15.55, sieges: 2 },
    suppleants: { signatures: 189, pct: 15.50, sieges: 2 },
  },
  {
    nom: 'CGT',
    couleur: CGT_COLOR,
    titulaires: { signatures: 38, pct: 3.11, sieges: 0 },
    suppleants: { signatures: 39, pct: 3.29, sieges: 0 },
  },
  {
    nom: 'CFTC',
    couleur: CFTC_COLOR,
    titulaires: { signatures: 0, pct: 0, sieges: 0 },
    suppleants: null,
  },
];

// ── Candidats FO Employés ──────────────────────────────────────────────────────
const FO_TITULAIRES_EMPLOYES = [
  { nom: "SIDIBE N'deye Yacine", voix: 357 },
  { nom: 'RACAULT Fabien', voix: 354 },
  { nom: 'BA DIALLO Awa', voix: 357 },
  { nom: 'KENDIRA Fadil', voix: 354 },
  { nom: 'DESMARS Aurelien', voix: 354 },
  { nom: 'DIBOUE IPOUMB Henri', voix: 354 },
  { nom: 'DADIA Yann', voix: 353 },
  { nom: 'ZIOUI Sofiane', voix: 354 },
  { nom: 'NDAO Souleymane', voix: 355 },
  { nom: 'DE BOISROLIN Jean Patrick', voix: 355 },
  { nom: 'EBERHARD Lucas', voix: 355 },
  { nom: 'ERRADI El Hassan', voix: 353 },
  { nom: 'ADNANE Abdelhakim', voix: 353 },
  { nom: 'LAVILLE Anthony', voix: 354 },
  { nom: 'SOSPEDRA Ugo', voix: 354 },
  { nom: 'RIVES Nicolas', voix: 354 },
  { nom: 'BURRET Romain', voix: 354 },
];

const FO_SUPPLEANTS_EMPLOYES = [
  { nom: 'JAYAKUMAR Sylvie', voix: 347 },
  { nom: 'DIAWARA Mody', voix: 347 },
  { nom: 'BEGUEDAR Aicha', voix: 352 },
  { nom: 'ETTLIN David', voix: 347 },
  { nom: 'LAMAALLEM Ahmed', voix: 347 },
  { nom: 'DELATTRE Jose', voix: 347 },
  { nom: 'LOUBACHE Ronald', voix: 347 },
  { nom: 'TIKZI Mohamed Anas', voix: 351 },
  { nom: 'TCHAKOUNTE BANEKIA Saint Cyr', voix: 350 },
  { nom: 'ABDOU Kaissane', voix: 350 },
  { nom: 'SYLLA Ibrahim', voix: 350 },
  { nom: 'DOUVILLE Benoit', voix: 350 },
  { nom: 'BENIDIR Chawki', voix: 350 },
  { nom: 'YOUSSOUF Alwarid', voix: 350 },
  { nom: 'LATIF Mohamed Ali', voix: 351 },
  { nom: 'CISSE Sekou Oumar', voix: 351 },
  { nom: 'AUBRY Bertrand', voix: 350 },
];

// ── Candidats FO Cadres élus ───────────────────────────────────────────────────
const FO_TITULAIRES_CADRES = [
  { nom: 'NOUATIN Cornelia', voix: 251, elu: true },
  { nom: 'ZERARKA Mounir', voix: 251, elu: true },
  { nom: 'ALLARD Eloise', voix: 251, elu: true },
  { nom: 'CHARLES Serge', voix: 251, elu: false },
  { nom: 'DENAKPO Rose', voix: 251, elu: false },
  { nom: 'REGNIER COURTINES Philippe', voix: 251, elu: false },
  { nom: 'PALACIOS Jacques', voix: 251, elu: false },
  { nom: 'KHETTAR Fouad', voix: 252, elu: false },
  { nom: 'ZIDELMAL Chokri', voix: 251, elu: false },
  { nom: 'MOUNIER Jean Michel', voix: 251, elu: false },
  { nom: 'BENBERKANE Abdelfatih', voix: 251, elu: false },
  { nom: 'MOULZIM Kamal', voix: 251, elu: false },
  { nom: 'BROU Didier', voix: 251, elu: false },
];

const FO_SUPPLEANTS_CADRES = [
  { nom: 'EL KHOURY Elise', voix: 237, elu: true },
  { nom: 'DOGHEMANE Haissa', voix: 237, elu: true },
  { nom: 'THON Amandine', voix: 238, elu: true },
  { nom: 'BELGHARBI Soufiane', voix: 238, elu: false },
  { nom: 'NOGLO Yvette', voix: 238, elu: false },
  { nom: 'FANELLI Jim', voix: 238, elu: false },
  { nom: 'TEILLAUD Julien', voix: 238, elu: false },
  { nom: 'ABBAS Rachid', voix: 238, elu: false },
  { nom: 'FARES Christian', voix: 238, elu: false },
  { nom: 'BELHOCINE Lyes', voix: 238, elu: false },
  { nom: 'BOUADMA Nadim', voix: 238, elu: false },
  { nom: 'DENOBILI Stephane', voix: 238, elu: false },
  { nom: 'ABBAOUI Abdellah', voix: 238, elu: false },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
const TauxBar = ({ taux, color = '#E05C1F' }: { taux: number; color?: string }) => (
  <div className="flex items-center gap-3">
    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(taux, 100)}%`, background: color }}
      />
    </div>
    <span className="text-sm font-bold tabular-nums w-14 text-right" style={{ color }}>
      {taux.toFixed(2)} %
    </span>
  </div>
);

const SiegeBadge = ({ n }: { n: number }) => (
  <span className={cn(
    'inline-flex items-center justify-center h-6 min-w-6 px-1.5 rounded-md text-xs font-bold',
    n > 0
      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
      : 'bg-muted text-muted-foreground',
  )}>
    {n > 0 ? `${n} 💺` : '—'}
  </span>
);

const SyndicatRow = ({ s, type }: { s: SyndicatResult; type: 'titulaires' | 'suppleants' }) => {
  const data = type === 'titulaires' ? s.titulaires : s.suppleants;
  if (!data) return null;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.couleur }} />
          <span className={cn('text-sm font-semibold truncate', s.nom === 'FO' && 'text-orange-600 dark:text-orange-400')}>{s.nom}</span>
          <span className="text-xs text-muted-foreground tabular-nums shrink-0">{data.signatures} sig.</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm font-bold tabular-nums w-14 text-right" style={{ color: s.couleur }}>
            {data.pct.toFixed(2)} %
          </span>
          <SiegeBadge n={data.sieges} />
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${data.pct}%`, background: s.couleur }} />
      </div>
    </div>
  );
};

// ── Page principale ────────────────────────────────────────────────────────────
const ElectionsPremierTour = () => (
  <PageShell subtitle="Élections – 1er tour">

    <main className="pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-5xl space-y-10">

        {/* Retour */}
        <Button variant="ghost" size="sm" asChild>
          <Link to="/elections" className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Retour aux élections
          </Link>
        </Button>

        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-red-600/10 flex items-center justify-center">
            <Vote className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Résultats — 1<sup>er</sup> tour CSE 2026
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Résultats officiels et définitifs du premier tour des élections professionnelles
            <strong className="text-red-600"> FO COM UES ILIAD</strong>
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800/40 px-4 py-1.5 text-sm font-medium gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              14 – 21 avril 2026
            </Badge>
            <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-300 dark:border-slate-700 px-4 py-1.5 text-sm font-medium gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              Taux établissement : {PARTICIPATION.tauxEtablissement} %
            </Badge>
          </div>
        </div>

        {/* ── Section 1 : Participation ── */}
        <section className="space-y-5">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            Participation
          </h2>

          <Card className="border-t-4 border-t-slate-400">
            <CardContent className="py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Taux établissement global</p>
                <p className="text-4xl font-bold text-foreground">{PARTICIPATION.tauxEtablissement} %</p>
              </div>
              <TauxBar taux={PARTICIPATION.tauxEtablissement} color="#64748b" />
            </CardContent>
          </Card>

          {PARTICIPATION.colleges.map(col => (
            <Card
              key={col.nom}
              className={cn('border-l-4', col.quorum ? 'border-l-emerald-500' : 'border-l-amber-500')}
            >
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <CardTitle className="text-base font-bold">{col.nom}</CardTitle>
                  <span className={cn(
                    'inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full',
                    col.quorum
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
                  )}>
                    {col.quorum
                      ? <><CheckCircle className="h-3.5 w-3.5" /> Quorum atteint — résultats valides</>
                      : <><AlertTriangle className="h-3.5 w-3.5" /> Quorum non atteint — 2e tour requis</>}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 text-xs text-muted-foreground font-medium">Scrutin</th>
                        <th className="text-right py-2 px-3 text-xs text-muted-foreground font-medium">Inscrits</th>
                        <th className="text-right py-2 px-3 text-xs text-muted-foreground font-medium">Votants</th>
                        <th className="text-right py-2 pl-3 text-xs text-muted-foreground font-medium">Taux</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2.5 pr-4 font-medium">Titulaires</td>
                        <td className="py-2.5 px-3 text-right tabular-nums">{col.titulaires.inscrits.toLocaleString('fr-FR')}</td>
                        <td className="py-2.5 px-3 text-right tabular-nums font-semibold">{col.titulaires.votants.toLocaleString('fr-FR')}</td>
                        <td className="py-2.5 pl-3 text-right tabular-nums font-bold text-foreground">{col.titulaires.taux} %</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 pr-4 font-medium">Suppléants</td>
                        <td className="py-2.5 px-3 text-right tabular-nums">{col.suppleants.inscrits.toLocaleString('fr-FR')}</td>
                        <td className="py-2.5 px-3 text-right tabular-nums font-semibold">{col.suppleants.votants.toLocaleString('fr-FR')}</td>
                        <td className="py-2.5 pl-3 text-right tabular-nums font-bold text-foreground">{col.suppleants.taux} %</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} className="pt-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Taux collège</td>
                        <td className="pt-3 text-right font-bold text-lg text-foreground tabular-nums">{col.tauxCollege} %</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <TauxBar taux={col.tauxCollege} color={col.quorum ? '#10b981' : '#f59e0b'} />
              </CardContent>
            </Card>
          ))}
        </section>

        {/* ── Section 2 : FO Employés/Techniciens ── */}
        <section className="space-y-5">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Vote className="h-5 w-5 text-muted-foreground" />
            Résultats syndicaux — Collège Techniciens / Employés / Non-Cadres
          </h2>
          <p className="text-sm text-muted-foreground -mt-2">
            Résultats indicatifs du 1er tour. Quorum non atteint — un 2e tour sera organisé.
          </p>

          {/* FO mis en avant */}
          <Card className="border-2 border-orange-400 dark:border-orange-600 bg-orange-50/40 dark:bg-orange-950/10">
            <CardContent className="py-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-lg shrink-0" style={{ background: FO_COLOR }}>
                FO
              </div>
              <div>
                <p className="font-bold text-foreground">FO COM UES ILIAD — Collège Employés · <span className="text-orange-600">1ère liste</span></p>
                <p className="text-sm text-muted-foreground">
                  Titulaires : 358 sig. · <strong className="text-foreground">35,10 %</strong>
                  &nbsp;|&nbsp;
                  Suppléants : 352 sig. · <strong className="text-foreground">34,65 %</strong>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Résultats tous syndicats */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Titulaires</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[...RESULTATS_EMPLOYES].sort((a, b) => (b.titulaires?.pct ?? 0) - (a.titulaires?.pct ?? 0)).map(s => (
                  <SyndicatRow key={s.nom} s={s} type="titulaires" />
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Suppléants</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[...RESULTATS_EMPLOYES].sort((a, b) => (b.suppleants?.pct ?? 0) - (a.suppleants?.pct ?? 0)).map(s => (
                  <SyndicatRow key={s.nom} s={s} type="suppleants" />
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Détail voix FO — Titulaires */}
          <Card className="border-orange-200 dark:border-orange-800/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ background: FO_COLOR }} />
                FO — Détail des voix · Titulaires
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-1.5">
                {FO_TITULAIRES_EMPLOYES.map((c, i) => (
                  <div key={c.nom} className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-muted-foreground w-4 shrink-0">{i + 1}</span>
                      <span className="text-xs font-medium truncate">{c.nom}</span>
                    </div>
                    <span className="text-xs font-bold tabular-nums text-orange-600 shrink-0">{c.voix}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Détail voix FO — Suppléants */}
          <Card className="border-orange-200 dark:border-orange-800/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ background: FO_COLOR }} />
                FO — Détail des voix · Suppléants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-1.5">
                {FO_SUPPLEANTS_EMPLOYES.map((c, i) => (
                  <div key={c.nom} className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-muted-foreground w-4 shrink-0">{i + 1}</span>
                      <span className="text-xs font-medium truncate">{c.nom}</span>
                    </div>
                    <span className="text-xs font-bold tabular-nums text-orange-600 shrink-0">{c.voix}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ── Section 3 : FO Cadres ── */}
        <section className="space-y-5">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Award className="h-5 w-5 text-muted-foreground" />
            Résultats syndicaux — Collège Cadres
          </h2>
          <p className="text-sm text-muted-foreground -mt-2">
            Résultats définitifs du 1er tour. 13 sièges pourvus sur 13.
          </p>

          {/* FO mis en avant */}
          <Card className="border-2 border-orange-400 dark:border-orange-600 bg-orange-50/40 dark:bg-orange-950/10">
            <CardContent className="py-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-lg shrink-0" style={{ background: FO_COLOR }}>
                FO
              </div>
              <div>
                <p className="font-bold text-foreground">FO COM UES ILIAD — Collège Cadres · <span className="text-orange-600">3 sièges obtenus</span></p>
                <p className="text-sm text-muted-foreground">
                  Titulaires : 252 sig. · <strong className="text-foreground">20,62 %</strong> · <strong className="text-foreground">3 sièges</strong>
                  &nbsp;|&nbsp;
                  Suppléants : 238 sig. · <strong className="text-foreground">19,52 %</strong> · <strong className="text-foreground">3 sièges</strong>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Résultats tous syndicats */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Titulaires</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {RESULTATS_CADRES.filter(s => s.titulaires).map(s => (
                  <SyndicatRow key={s.nom} s={s} type="titulaires" />
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Suppléants</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {RESULTATS_CADRES.filter(s => s.suppleants).map(s => (
                  <SyndicatRow key={s.nom} s={s} type="suppleants" />
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Élus FO Cadres */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="border-orange-200 dark:border-orange-800/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-orange-500" />
                  FO — Élus Titulaires Cadres
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  {FO_TITULAIRES_CADRES.map((c, i) => (
                    <div key={c.nom} className={cn(
                      'flex items-center justify-between gap-2 rounded-lg px-3 py-2 transition-colors',
                      c.elu ? 'bg-emerald-50 dark:bg-emerald-950/20' : 'bg-muted/30 hover:bg-muted/50',
                    )}>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-bold text-muted-foreground w-4 shrink-0">{i + 1}</span>
                        <span className="text-xs font-medium truncate">{c.nom}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold tabular-nums text-orange-600">{c.voix}</span>
                        {c.elu && <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">ÉLU</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 dark:border-orange-800/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-orange-500" />
                  FO — Élus Suppléants Cadres
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  {FO_SUPPLEANTS_CADRES.map((c, i) => (
                    <div key={c.nom} className={cn(
                      'flex items-center justify-between gap-2 rounded-lg px-3 py-2 transition-colors',
                      c.elu ? 'bg-emerald-50 dark:bg-emerald-950/20' : 'bg-muted/30 hover:bg-muted/50',
                    )}>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-bold text-muted-foreground w-4 shrink-0">{i + 1}</span>
                        <span className="text-xs font-medium truncate">{c.nom}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold tabular-nums text-orange-600">{c.voix}</span>
                        {c.elu && <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">ÉLU</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Récap sièges Cadres */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Récapitulatif des sièges — Collège Cadres
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {RESULTATS_CADRES.filter(s => s.titulaires && (s.titulaires.sieges > 0 || (s.suppleants && s.suppleants.sieges > 0))).map(s => (
                  <div key={s.nom} className={cn(
                    'flex items-center gap-2 rounded-lg border px-3 py-2.5',
                    s.nom === 'FO' ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-300 dark:border-orange-700' : 'bg-card',
                  )}>
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ background: s.couleur }} />
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{s.nom}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.titulaires!.sieges}T · {s.suppleants?.sieges ?? 0}S sièges
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ── Section 4 : Appel 2e tour ── */}
        <Card className="border-amber-200 dark:border-amber-800/40 bg-amber-50/40 dark:bg-amber-950/10">
          <CardContent className="py-6 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <p className="font-bold text-foreground">2e tour — Collège Techniciens / Employés / Non-Cadres</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Le quorum de 50 % n'a pas été atteint dans ce collège (taux : <strong>37,64 %</strong>).
              Un second tour est obligatoire dans un délai de 15 jours. Lors du 2e tour, <strong>aucun quorum n'est requis</strong>.
            </p>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">
              🗳️ Vote du 29 avril au 6 mai 2026 — FO est en tête avec <strong>35,10 %</strong> !
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardContent className="py-6 text-center space-y-2">
            <p className="text-lg font-bold text-foreground">Rejoignez-nous !</p>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Pour obtenir votre bulletin d'adhésion ou nous contacter.
            </p>
            <p className="text-sm font-medium text-red-600">contact@focomues-iliad.fr</p>
          </CardContent>
        </Card>

      </div>
    </main>

    <ScrollToTop />
  </PageShell>
);

export default ElectionsPremierTour;
