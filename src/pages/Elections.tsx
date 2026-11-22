import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown,
  Award,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Info,
  Landmark,
  ShieldCheck,
  TrendingUp,
  Users,
  Vote,
} from 'lucide-react';

import { PageBreadcrumb } from '@/components/PageBreadcrumb';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

import type {
  Candidat,
  Candidate,
  ElectionDocument,
  ElectionEvent,
  ParticipationSnapshot,
} from './elections.data';
import {
  CANDIDATS_T2_SUPPLEANTS,
  CANDIDATS_T2_TITULAIRES,
  FO_SUPPLEANTS_CAD,
  FO_TITULAIRES_CAD,
  getInitials,
} from './elections.data';

const T1_COLLEGES = [
  {
    nom: 'Cadres',
    inscrits: 2112,
    tit_votants: 1239,
    tit_taux: 58.66,
    sup_votants: 1238,
    sup_taux: 58.62,
    tour: '1er tour — résultats définitifs',
    tone: 'red' as const,
  },
  {
    nom: 'Employés / Techniciens / Non-Cadres',
    inscrits: 2774,
    tit_votants: 1045,
    tit_taux: 37.67,
    sup_votants: 1043,
    sup_taux: 37.6,
    tour: '1er tour — 2e tour requis',
    tone: 'teal' as const,
  },
];

const T2_PARTICIPATION_RESULT = 30.75;

const FO_TITULAIRES_EMP_T2_VOIX = [
  { nom: "SIDIBE N'deye Yacine", voix: 313, elu: true },
  { nom: 'RACAULT Fabien', voix: 313, elu: true },
  { nom: 'BA DIALLO Awa', voix: 314, elu: true },
  { nom: 'KENDIRA Fadil', voix: 312, elu: true },
  { nom: 'DESMARS Aurelien', voix: 311, elu: true },
  { nom: 'DADIA Yann', voix: 312, elu: true },
  { nom: 'ZIOUI Sofiane', voix: 311, elu: true },
  { nom: 'DIBOUE IPOUMB Henri', voix: 312, elu: true },
  { nom: 'DE BOISROLIN Jean Patrick', voix: 311, elu: false },
  { nom: 'NDAO Souleymane', voix: 311, elu: false },
  { nom: 'ABDOU Kaissane', voix: 313, elu: false },
  { nom: 'LAVILLE Anthony', voix: 311, elu: false },
  { nom: 'ADNANE Abdelhakim', voix: 312, elu: false },
  { nom: 'TCHAKOUNTE BANEKIA Saint Cyr', voix: 310, elu: false },
  { nom: 'SOSPEDRA Ugo', voix: 310, elu: false },
  { nom: 'RIVES Nicolas', voix: 313, elu: false },
  { nom: 'BURRET Romain', voix: 310, elu: false },
];

const FO_SUPPLEANTS_EMP_T2_VOIX = [
  { nom: 'JAYAKUMAR Sylvie', voix: 129, elu: true },
  { nom: 'DIAWARA Mody', voix: 103, elu: true },
  { nom: 'BEGUEDAR Aicha', voix: 102, elu: true },
  { nom: 'ETTLIN David', voix: 127, elu: true },
  { nom: 'LATIF Mohamed Ali', voix: 110, elu: true },
  { nom: 'DELATTRE Jose', voix: 97, elu: true },
  { nom: 'LOUBACHE Ronald', voix: 96, elu: true },
  { nom: 'TIKZI Mohamed Anas', voix: 111, elu: false },
  { nom: 'EBERHARD Lucas', voix: 115, elu: false },
  { nom: 'LAMAALLEM Ahmed', voix: 98, elu: false },
  { nom: 'SYLLA Ibrahim', voix: 95, elu: false },
  { nom: 'DOUVILLE Benoit', voix: 93, elu: false },
  { nom: 'BENIDIR Chawki', voix: 94, elu: false },
  { nom: 'ERRADI El Hassan', voix: 96, elu: false },
  { nom: 'YOUSSOUF Alwarid', voix: 112, elu: false },
  { nom: 'CISSE Sekou Oumar', voix: 102, elu: false },
  { nom: 'AUBRY Bertrand', voix: 102, elu: false },
];

const normalize = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-zA-Z]/g, '')
  .toLowerCase();

const findCandidate = (candidates: Candidat[], officialName: string) => {
  const officialParts = normalize(officialName);

  return candidates.find((candidate) => {
    const candidateParts = candidate.name
      .split(' ')
      .map(normalize)
      .filter((part) => part.length > 3);

    return candidateParts.some((part) => officialParts.includes(part));
  });
};

const buildElectedList = (
  candidates: Candidat[],
  results: typeof FO_TITULAIRES_EMP_T2_VOIX,
) => results
  .filter((result) => result.elu)
  .map((result) => ({
    ...(findCandidate(candidates, result.nom) || { name: result.nom }),
    voix: result.voix,
  }));

type Tone = 'red' | 'teal';

const toneStyles = {
  red: {
    accent: 'bg-red-600',
    soft: 'bg-red-50 text-red-700 border-red-100',
    gradient: 'from-red-500 to-red-700',
    bar: 'bg-red-600',
  },
  teal: {
    accent: 'bg-teal-600',
    soft: 'bg-teal-50 text-teal-700 border-teal-100',
    gradient: 'from-teal-500 to-teal-700',
    bar: 'bg-teal-600',
  },
};

interface CandidateCardProps {
  candidat: Candidat & { voix?: number; role?: string; fonction?: string };
  index: number;
  label: string;
  tone: Tone;
}

const CandidateCard = ({ candidat, index, label, tone }: CandidateCardProps) => {
  const [imgError, setImgError] = useState(false);
  const fonction = candidat.role || candidat.fonction;
  const styles = toneStyles[tone];

  return (
    <article className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm shadow-slate-900/[0.03] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-900/[0.06]">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ${styles.gradient} shadow-sm`}>
        {candidat.photo && !imgError ? (
          <img
            src={candidat.photo}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-sm font-extrabold text-white">{getInitials(candidat.name)}</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-extrabold text-slate-900 transition-colors group-hover:text-red-700">
          {candidat.name}
        </p>
        {fonction && (
          <p className="mt-0.5 truncate text-xs font-medium text-slate-500" title={fonction}>
            {fonction}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
            N°{index + 1}
          </span>
          <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${styles.soft}`}>
            <CheckCircle2 className="h-3 w-3" /> {label}
          </span>
          {typeof candidat.voix === 'number' && (
            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
              {candidat.voix} voix
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

const StatCard = ({
  value,
  label,
  detail,
  tone,
}: {
  value: string;
  label: string;
  detail: string;
  tone: Tone;
}) => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-4 backdrop-blur-sm">
    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/60">{label}</p>
    <p className={`mt-2 text-3xl font-black tabular-nums ${tone === 'red' ? 'text-red-300' : 'text-teal-300'}`}>
      {value}
    </p>
    <p className="mt-1 text-xs leading-relaxed text-white/70">{detail}</p>
  </div>
);

const ParticipationBar = ({
  label,
  votants,
  inscrits,
  taux,
  tone,
}: {
  label: string;
  votants: number;
  inscrits?: number;
  taux: number;
  tone: Tone;
}) => (
  <div className="space-y-1.5">
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs">
      <span className="font-medium text-slate-500">{label}</span>
      <span className="text-right font-bold tabular-nums text-slate-700">
        {votants.toLocaleString('fr-FR')}
        {inscrits ? ` / ${inscrits.toLocaleString('fr-FR')}` : ''} votants · {taux.toFixed(2)} %
      </span>
    </div>
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      <div
        className={`h-full rounded-full transition-all duration-700 ${toneStyles[tone].bar}`}
        style={{ width: `${Math.min(taux, 100)}%` }}
      />
    </div>
  </div>
);

const SectionTitle = ({
  icon: Icon,
  eyebrow,
  title,
  description,
}: {
  icon: typeof TrendingUp;
  eyebrow: string;
  title: string;
  description: string;
}) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div className="flex gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-teal-700 shadow-sm ring-1 ring-slate-200/80">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-red-600">{eyebrow}</p>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">{description}</p>
      </div>
    </div>
  </div>
);

const Elections = () => {
  const [_candidates, setCandidates] = useState<Candidate[]>([]);
  const [_events, setEvents] = useState<ElectionEvent[]>([]);
  const [_documents, setDocuments] = useState<ElectionDocument[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [participationData, setParticipationData] = useState<ParticipationSnapshot[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [candidatesRes, eventsRes, documentsRes, participationRes] = await Promise.all([
          supabase.from('election_candidates').select('*').order('display_order'),
          supabase.from('election_events').select('*').order('event_date'),
          supabase.from('election_documents').select('*').order('published_at', { ascending: false }),
          supabase.from('participation_snapshots').select('*, participation_colleges(*)').order('created_at'),
        ]);

        if (candidatesRes.error) throw new Error(`Candidats : ${candidatesRes.error.message}`);
        if (eventsRes.error) throw new Error(`Événements : ${eventsRes.error.message}`);
        if (documentsRes.error) throw new Error(`Documents : ${documentsRes.error.message}`);
        if (participationRes.error) throw new Error(`Participation : ${participationRes.error.message}`);

        setCandidates((candidatesRes.data as Candidate[]) || []);
        setEvents((eventsRes.data as ElectionEvent[]) || []);
        setDocuments((documentsRes.data as ElectionDocument[]) || []);
        setParticipationData(
          ((participationRes.data as ParticipationSnapshot[]) || []).sort((a, b) => {
            const toTs = (date: string, time: string) => {
              if (!date || !time) return 0;
              const dateParts = date.split('/');
              if (dateParts.length !== 3) return 0;
              const [day, month, year] = dateParts.map(Number);
              const timeMatch = time.match(/^(\d+)h(\d*)/);
              const hour = timeMatch ? Number.parseInt(timeMatch[1], 10) : 0;
              const minute = timeMatch && timeMatch[2] ? Number.parseInt(timeMatch[2], 10) : 0;
              return new Date(year, month - 1, day, hour, minute).getTime();
            };

            return toTs(a.date, a.heure) - toTs(b.date, b.heure);
          }),
        );
      } catch (fetchError) {
        console.error('[Elections] Fetch error:', fetchError);
        setError(fetchError instanceof Error ? fetchError.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const t2ParticipationData = participationData.filter((snapshot) => {
    if (!snapshot.date) return false;
    const dateParts = snapshot.date.split('/');
    if (dateParts.length !== 3) return false;
    const [day, month, year] = dateParts.map(Number);
    return new Date(year, month - 1, day) >= new Date(2026, 3, 29);
  });
  const latestT2Snap = t2ParticipationData[t2ParticipationData.length - 1] ?? null;
  const elusTitulairesCad = FO_TITULAIRES_CAD
    .filter((candidate) => candidate.elu === true)
    .map((candidate) => ({ name: candidate.nom, voix: candidate.voix }));
  const elusSuppleantsCad = FO_SUPPLEANTS_CAD
    .filter((candidate) => candidate.elu === true)
    .map((candidate) => ({ name: candidate.nom, voix: candidate.voix }));
  const elusTitulairesEmp = buildElectedList(CANDIDATS_T2_TITULAIRES, FO_TITULAIRES_EMP_T2_VOIX);
  const elusSuppleantsEmp = buildElectedList(CANDIDATS_T2_SUPPLEANTS, FO_SUPPLEANTS_EMP_T2_VOIX);

  if (error) {
    return (
      <main className="min-h-screen overflow-x-hidden bg-slate-50 p-3 sm:p-4 lg:p-8">
        <div className="mx-auto w-full max-w-[1500px] space-y-5">
          <PageBreadcrumb steps={[{ label: 'Élections CSE 2026' }]} />
          <section className="rounded-3xl border border-red-100 bg-white p-6 text-center shadow-sm sm:p-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Info className="h-7 w-7" />
            </div>
            <h1 className="mt-5 text-2xl font-extrabold text-slate-900">Les résultats ne peuvent pas être chargés</h1>
            <p className="mt-2 text-sm text-slate-500">Une erreur est survenue lors du chargement des données.</p>
            <p className="mt-1 text-xs text-slate-400">{error}</p>
            <Button className="mt-6 bg-red-600 text-white hover:bg-red-700" onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 p-3 sm:p-4 lg:p-8">
      <div className="mx-auto w-full max-w-[1500px] space-y-6">
        <PageBreadcrumb steps={[{ label: 'Élections CSE 2026' }]} />

        <section className="relative overflow-hidden rounded-[2rem] bg-[#13233A] text-white shadow-xl shadow-slate-900/10 ring-1 ring-slate-900/5">
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full border-[58px] border-white/[0.04]" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-red-600/20 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute right-1/3 top-0 h-full w-56 skew-x-[-18deg] bg-gradient-to-b from-teal-400/[0.06] to-transparent" />

          <div className="relative grid gap-9 px-5 py-9 sm:px-8 sm:py-11 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:px-12 lg:py-14">
            <div>
              <Badge className="mb-5 border border-white/15 bg-white/10 px-3 py-1.5 text-white hover:bg-white/10">
                <Vote className="mr-1.5 h-3.5 w-3.5 text-red-300" /> Élections CSE 2026
              </Badge>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-300">UES Iliad · Résultats définitifs</p>
              <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-[1.04] tracking-tight sm:text-5xl lg:text-6xl">
                FO COM, première force syndicale
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/75 sm:text-lg sm:leading-8">
                Grâce à votre mobilisation, FO obtient <strong className="text-white">37,65 %</strong> des suffrages
                titulaires et <strong className="text-white">35,29 %</strong> des suffrages suppléants au 2e tour.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button asChild className="rounded-xl bg-red-600 px-5 font-bold text-white shadow-lg shadow-red-950/20 hover:bg-red-700">
                  <a href="#participation">
                    Voir la participation <ArrowDown className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="outline" className="rounded-xl border-white/25 bg-white/10 px-5 font-semibold text-white hover:bg-white/20 hover:text-white">
                  <a href="#elus">
                    Découvrir les élus <ChevronRight className="ml-1 h-4 w-4" />
                  </a>
                </Button>
              </div>

              <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-white/55">
                <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Scrutin clos le 6 mai 2026 à 14 h 00 — résultats proclamés à 14 h 05.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <StatCard value="37,65 %" label="Titulaires · 2e tour" detail="Score de la liste FO COM" tone="red" />
              <StatCard value="35,29 %" label="Suppléants · 2e tour" detail="Score de la liste FO COM" tone="teal" />
              <StatCard
                value={`${T2_PARTICIPATION_RESULT.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %`}
                label="Participation consolidée · 2e tour"
                detail="Taux d'établissement au scrutin"
                tone="teal"
              />
            </div>
          </div>
        </section>

        <section className="grid gap-3 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm sm:grid-cols-3 sm:p-5">
          {[
            ['1er tour terminé', '21 avril 2026', 'red'],
            ['2e tour Employés terminé', '6 mai 2026', 'teal'],
            ['FO, 1re liste', '37,65 % des voix', 'red'],
          ].map(([title, detail, tone]) => (
            <div key={title} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone === 'red' ? 'bg-red-50 text-red-600' : 'bg-teal-50 text-teal-700'}`}>
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-slate-800">{title}</p>
                <p className="mt-0.5 text-[11px] text-slate-500">{detail}</p>
              </div>
            </div>
          ))}
        </section>

        {loading ? (
          <section className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-sm" role="status" aria-live="polite">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
            <div>
              <p className="font-bold text-slate-800">Chargement des résultats</p>
              <p className="mt-1 text-sm text-slate-500">Récupération de la participation et des élus…</p>
            </div>
          </section>
        ) : (
          <>
            <section id="participation" className="scroll-mt-6 space-y-5">
              <SectionTitle
                icon={TrendingUp}
                eyebrow="Mobilisation"
                title="La participation, tour par tour"
                description="Les taux et volumes de votants permettent de mesurer la mobilisation dans chaque collège."
              />

              <div className="grid gap-4 lg:grid-cols-3">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 via-teal-800 to-[#075e59] p-5 text-white shadow-lg shadow-teal-900/10 sm:p-6">
                  <div aria-hidden="true" className="absolute -right-12 -top-12 h-40 w-40 rounded-full border-[32px] border-white/5" />
                  <div className="relative">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-teal-200">
                      <Clock3 className="h-4 w-4" /> 2e tour · Employés
                    </div>
                    <p className="mt-4 text-5xl font-black tabular-nums">
                      {T2_PARTICIPATION_RESULT.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-teal-50/80">
                      Taux consolidé à la clôture du scrutin, du 29 avril au 6 mai 2026.
                    </p>
                    <div className="mt-5 rounded-2xl border border-white/10 bg-white/10 px-3 py-2.5 text-xs text-white/75 backdrop-blur-sm">
                      853 votants pour 2 774 inscrits
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] sm:p-6 lg:col-span-2">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-red-600">1er tour · 14–21 avril 2026</p>
                      <h3 className="mt-1 text-lg font-extrabold text-slate-900">Participation par collège</h3>
                    </div>
                    <Users className="h-5 w-5 shrink-0 text-teal-600" />
                  </div>
                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    {T1_COLLEGES.map((college) => (
                      <div key={college.nom} className="rounded-2xl bg-slate-50 p-4">
                        <div className="mb-4 flex items-start gap-2">
                          <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${toneStyles[college.tone].accent}`} />
                          <div>
                            <p className="text-sm font-extrabold leading-tight text-slate-800">{college.nom}</p>
                            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                              {college.tour} · {college.inscrits.toLocaleString('fr-FR')} inscrits
                            </p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <ParticipationBar label="Titulaires" votants={college.tit_votants} taux={college.tit_taux} tone={college.tone} />
                          <ParticipationBar label="Suppléants" votants={college.sup_votants} taux={college.sup_taux} tone={college.tone} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] sm:p-6">
                <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-teal-700">Dernier relevé disponible · 2e tour</p>
                    <h3 className="mt-1 text-lg font-extrabold text-slate-900">Participation par collège</h3>
                  </div>
                  {latestT2Snap && (
                    <Badge variant="outline" className="w-fit gap-1.5 border-teal-200 bg-teal-50 text-teal-700">
                      <Clock3 className="h-3.5 w-3.5" /> {latestT2Snap.date} à {latestT2Snap.heure}
                    </Badge>
                  )}
                </div>

                {latestT2Snap ? (
                  <div className="mt-5 space-y-5">
                    {[...(latestT2Snap.participation_colleges ?? [])]
                      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
                      .map((college) => (
                        <div key={college.nom} className="rounded-2xl bg-slate-50 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-extrabold text-slate-800">{college.nom}</p>
                            <Badge variant="outline" className="border-teal-200 bg-white text-teal-700">
                              Taux global : {(college.taux_college ?? 0).toFixed(2)} %
                            </Badge>
                          </div>
                          <div className="mt-4 space-y-3">
                            <ParticipationBar
                              label="Titulaires"
                              votants={college.tit_votants ?? 0}
                              inscrits={college.tit_inscrits}
                              taux={college.tit_taux ?? 0}
                              tone="red"
                            />
                            <ParticipationBar
                              label="Suppléants"
                              votants={college.sup_votants ?? 0}
                              inscrits={college.sup_inscrits}
                              taux={college.sup_taux ?? 0}
                              tone="teal"
                            />
                          </div>
                        </div>
                      ))}

                    <div className="flex items-start gap-3 rounded-2xl border border-teal-100 bg-teal-50/70 px-4 py-3 text-xs leading-relaxed text-teal-900/75">
                      <Info className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                      <span>
                        Taux au 1er tour Employés : <strong className="text-teal-950">37,64 %</strong> — le quorum
                        n'est pas requis au 2e tour.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-9 text-center">
                    <TrendingUp className="mx-auto h-7 w-7 text-slate-300" />
                    <p className="mt-3 text-sm font-medium text-slate-500">Aucune donnée disponible pour le 2e tour.</p>
                  </div>
                )}
              </div>
            </section>

            <section id="elus" className="scroll-mt-6 space-y-6">
              <SectionTitle
                icon={Award}
                eyebrow="Représentation"
                title="Vos élus au CSE"
                description="Retrouvez les titulaires et suppléants FO COM désignés pour porter votre voix au quotidien."
              />

              {[
                {
                  title: 'Collège Cadres',
                  tour: '1er tour',
                  titulaires: elusTitulairesCad,
                  suppleants: elusSuppleantsCad,
                  tone: 'red' as const,
                },
                {
                  title: 'Collège Employés / Techniciens',
                  tour: '2e tour',
                  titulaires: elusTitulairesEmp,
                  suppleants: elusSuppleantsEmp,
                  tone: 'teal' as const,
                },
              ].map((college) => (
                <article key={college.title} className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/[0.03]">
                  <div className={`h-1.5 bg-gradient-to-r ${college.tone === 'red' ? 'from-red-600 to-teal-500' : 'from-teal-600 to-red-500'}`} />
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${toneStyles[college.tone].soft}`}>
                          <Landmark className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-xl font-extrabold text-slate-900">{college.title}</h3>
                          <p className="mt-0.5 text-xs text-slate-500">Élus FO COM UES ILIAD</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={toneStyles[college.tone].soft}>
                        {college.tour}
                      </Badge>
                    </div>

                    <div className="mt-5 space-y-6">
                      <div>
                        <div className="mb-3 flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${toneStyles[college.tone].accent}`} />
                          <h4 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">Titulaires</h4>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                            {college.titulaires.length}
                          </span>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                          {college.titulaires.map((candidate, index) => (
                            <CandidateCard
                              key={candidate.name}
                              candidat={{ ...candidate, role: candidate.role || 'Élu titulaire' }}
                              index={index}
                              label="Élu"
                              tone={college.tone}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="mb-3 flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                          <h4 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">Suppléants</h4>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                            {college.suppleants.length}
                          </span>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                          {college.suppleants.map((candidate, index) => (
                            <CandidateCard
                              key={candidate.name}
                              candidat={{ ...candidate, role: candidate.role || 'Élu suppléant' }}
                              index={index}
                              label="Élu"
                              tone={college.tone}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}

              <div className="relative overflow-hidden rounded-3xl bg-[#13233A] p-6 text-white shadow-xl sm:p-8">
                <div aria-hidden="true" className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-red-600/20 blur-3xl" />
                <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-teal-300 ring-1 ring-white/10">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-lg font-extrabold">Vos élus FO COM s'engagent à vos côtés.</p>
                      <p className="mt-1 max-w-2xl text-sm leading-relaxed text-white/65">
                        Une question, un accompagnement ou une démarche auprès de la direction ? Contactez vos
                        représentants.
                      </p>
                    </div>
                  </div>
                  <Button asChild className="shrink-0 rounded-xl bg-red-600 font-bold text-white hover:bg-red-700">
                    <Link to="/contact">
                      Nous contacter <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
};

export default Elections;
