import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Award, CheckCircle, Clock, Info, ShieldCheck, TrendingUp, Users } from 'lucide-react';

import type { Candidat, Candidate, ElectionEvent, ElectionDocument, ParticipationSnapshot } from './elections.data';

import {
  CANDIDATS_T2_TITULAIRES,
  CANDIDATS_T2_SUPPLEANTS,
  FO_TITULAIRES_CAD,
  FO_SUPPLEANTS_CAD,
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
    color: 'red',
  },
  {
    nom: 'Employés / Techniciens / Non-Cadres',
    inscrits: 2774,
    tit_votants: 1045,
    tit_taux: 37.67,
    sup_votants: 1043,
    sup_taux: 37.60,
    tour: '1er tour — 2ème tour requis',
    color: 'amber',
  },
];

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
    const candidateParts = candidate.name.split(' ').map(normalize).filter((part) => part.length > 3);
    return candidateParts.some((part) => officialParts.includes(part));
  });
};

const buildElectedList = (candidates: Candidat[], results: typeof FO_TITULAIRES_EMP_T2_VOIX) =>
  results
    .filter((result) => result.elu)
    .map((result) => ({
      ...(findCandidate(candidates, result.nom) || { name: result.nom }),
      voix: result.voix,
    }));

const CandidateCard = ({ candidat, index, label }: { candidat: Candidat & { voix?: number; role?: string; fonction?: string }; index: number; label: string }) => {
  const [imgError, setImgError] = useState(false);
  const fonction = candidat.role || candidat.fonction;

  return (
    <div className="group flex items-center gap-3 p-3 rounded-lg border border-border hover:border-green-300 bg-card hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 cursor-default">
      <div className="h-12 w-12 shrink-0 rounded-full overflow-hidden flex items-center justify-center shadow-sm bg-gradient-to-br from-green-500 to-green-700">
        {candidat.photo && !imgError ? (
          <img src={candidat.photo} alt={candidat.name} className="h-full w-full object-cover" onError={() => setImgError(true)} />
        ) : (
          <span className="text-white font-bold text-sm">{getInitials(candidat.name)}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-sm truncate text-foreground group-hover:text-green-700 transition-colors">
          {candidat.name}
        </p>
        <div className="flex flex-col mt-0.5">
          {fonction && <span className="text-xs text-muted-foreground truncate font-medium">{fonction}</span>}
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground">
              N°{index + 1}
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700">
              ✓ {label}
            </span>
            {typeof candidat.voix === 'number' && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700">
                {candidat.voix} voix
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

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
            const toTs = (d: string, h: string) => {
              if (!d || !h) return 0;
              const parts = d.split('/');
              if (parts.length !== 3) return 0;
              const [day, month, year] = parts.map(Number);
              const hMatch = h.match(/^(\d+)h(\d*)/);
              const hour = hMatch ? parseInt(hMatch[1]) : 0;
              const min = hMatch && hMatch[2] ? parseInt(hMatch[2]) : 0;
              return new Date(year, month - 1, day, hour, min).getTime();
            };
            return toTs(a.date, a.heure) - toTs(b.date, b.heure);
          })
        );
      } catch (err) {
        console.error('[Elections] Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const t2ParticipationData = participationData.filter((snap) => {
    if (!snap.date) return false;
    const parts = snap.date.split('/');
    if (parts.length !== 3) return false;
    const [day, month, year] = parts.map(Number);
    return new Date(year, month - 1, day) >= new Date(2026, 3, 29);
  });
  const latestT2Snap = t2ParticipationData[t2ParticipationData.length - 1] ?? null;

  const elusTitulairesCad = FO_TITULAIRES_CAD.filter((c) => c.elu === true).map((c) => ({ name: c.nom, voix: c.voix, photo: c.photo }));
  const elusSuppleantsCad = FO_SUPPLEANTS_CAD.filter((c) => c.elu === true).map((c) => ({ name: c.nom, voix: c.voix, photo: c.photo }));
  const elusTitulairesEmp = buildElectedList(CANDIDATS_T2_TITULAIRES, FO_TITULAIRES_EMP_T2_VOIX);
  const elusSuppleantsEmp = buildElectedList(CANDIDATS_T2_SUPPLEANTS, FO_SUPPLEANTS_EMP_T2_VOIX);

  if (error) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-destructive font-semibold">Une erreur est survenue lors du chargement des données.</p>
        <p className="text-muted-foreground text-sm">{error}</p>
        <button className="text-sm underline text-muted-foreground" onClick={() => window.location.reload()}>Réessayer</button>
      </div>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-background p-4 lg:p-8">
      <div className="container mx-auto max-w-5xl space-y-10">
        <section className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl shadow-lg bg-[#13233A]">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border-[48px] border-white/5" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-red-600/20 blur-3xl" />
            <div className="relative px-8 py-10 text-center text-white">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-3">Élections CSE 2026 — UES ILIAD</p>
              <h1 className="text-3xl sm:text-4xl font-black leading-tight">
                FO COM — <span className="text-red-400">1er syndicat</span><br className="hidden sm:block" /> de l'UES Iliad
              </h1>
              <p className="mt-3 text-white/60 text-sm">Résultats définitifs proclamés le 6 mai 2026</p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700"><CheckCircle className="h-3 w-3" />1er tour terminé — 21 avr. 2026</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-green-300 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700"><CheckCircle className="h-3 w-3" />2e tour Employés terminé — 6 mai 2026</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-300 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">🏆 FO 1ère liste — 37,65 %</span>
          </div>
        </section>

        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <>
            <section className="rounded-xl bg-gradient-to-r from-red-600 to-red-800 p-6 sm:p-8 text-center shadow-lg space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30"><Award className="h-8 w-8 text-white" /></div>
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-wide uppercase">FO COM : 1ère force syndicale !</h1>
                <p className="text-red-100 font-medium text-sm sm:text-base max-w-2xl mx-auto">Grâce à vous, FO obtient <strong>37,65 %</strong> des suffrages titulaires et <strong>35,29 %</strong> des suffrages suppléants au 2ème tour. Scrutin clos le <strong>6 mai 2026 à 14h00</strong> — résultats proclamés à 14h05.</p>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><TrendingUp className="h-5 w-5 text-purple-500" />Participation</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-border bg-card p-5 space-y-1 shadow-sm"><div className="flex items-center gap-2 text-muted-foreground font-semibold text-sm mb-2"><Users className="h-4 w-4" />1er tour — 14–21 avr. 2026</div><p className="text-3xl font-black text-foreground">37,64 %</p><p className="text-xs text-muted-foreground">Collège employés au 1er tour</p></div>
                <div className="rounded-xl border-2 border-red-100 bg-red-50/50 p-5 space-y-1 shadow-sm"><div className="flex items-center gap-2 text-red-700 font-semibold text-sm mb-2"><TrendingUp className="h-4 w-4" />2ème tour — 29 avr. – 6 mai 2026</div><p className="text-3xl font-black text-red-700">30,75 %</p><p className="text-xs text-red-800/70"><strong>853 votants</strong> / 2 774 inscrits — Collège Employés</p></div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Détail par collège — 1er tour</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {T1_COLLEGES.map((col) => (
                    <div key={col.nom} className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                      <div className={`px-4 py-2.5 ${col.color === 'red' ? 'bg-red-600' : 'bg-amber-500'}`}><p className="font-bold text-white text-sm">{col.nom}</p><p className="text-xs text-white/80">{col.tour} · {col.inscrits.toLocaleString('fr-FR')} inscrits</p></div>
                      <div className="px-4 py-3 space-y-3">
                        {[{ label: 'Titulaires', votants: col.tit_votants, taux: col.tit_taux }, { label: 'Suppléants', votants: col.sup_votants, taux: col.sup_taux }].map((row) => (
                          <div key={row.label} className="space-y-1"><div className="flex justify-between items-center text-xs gap-3"><span className="text-muted-foreground">{row.label}</span><span className="font-bold text-foreground tabular-nums text-right">{row.votants.toLocaleString('fr-FR')} votants · {row.taux.toFixed(2)} %</span></div><div className="h-2 rounded-full bg-muted overflow-hidden"><div className={`h-full rounded-full transition-all ${col.color === 'red' ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(row.taux, 100)}%` }} /></div></div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Détail par collège — 2ème tour</h3>
                {latestT2Snap ? (
                  <div className="rounded-xl border border-purple-200 bg-purple-50/40 overflow-hidden">
                    <div className="flex items-center justify-between flex-wrap gap-3 px-4 py-3 border-b border-purple-200"><div className="flex items-center gap-2 text-muted-foreground text-xs"><Clock className="h-3.5 w-3.5 shrink-0" />Relevé final : <strong className="text-foreground ml-1">{latestT2Snap.date}</strong>&nbsp;à&nbsp;<strong className="text-foreground">{latestT2Snap.heure}</strong></div><div className="rounded-full bg-purple-600 px-3 py-1 text-white text-xs font-bold">Établissement : {(latestT2Snap.taux_etablissement ?? 0).toFixed(2)} %</div></div>
                    <div className="px-4 py-4 space-y-5">
                      {(latestT2Snap.participation_colleges ?? []).sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)).map((col) => {
                        const tauxTit = col.tit_taux ?? 0;
                        const tauxSup = col.sup_taux ?? 0;
                        return <div key={col.nom} className="space-y-2"><div className="flex items-center justify-between flex-wrap gap-2"><p className="font-semibold text-foreground text-sm">{col.nom}</p><Badge variant="outline" className="text-xs border-purple-300 text-purple-700">Taux global : {(col.taux_college ?? 0).toFixed(2)} %</Badge></div><div className="space-y-2">{[{ label: 'Titulaires', votants: col.tit_votants ?? 0, inscrits: col.tit_inscrits ?? 0, taux: tauxTit, color: 'bg-purple-600' }, { label: 'Suppléants', votants: col.sup_votants ?? 0, inscrits: col.sup_inscrits ?? 0, taux: tauxSup, color: 'bg-purple-400' }].map((row) => <div key={row.label} className="space-y-1"><div className="flex justify-between items-center text-xs gap-3"><span className="text-muted-foreground">{row.label}</span><span className="font-bold text-purple-700 tabular-nums text-right">{row.votants} / {row.inscrits} inscrits · {row.taux.toFixed(2)} %</span></div><div className="h-2 rounded-full bg-purple-100 overflow-hidden"><div className={`h-full rounded-full ${row.color} transition-all duration-700`} style={{ width: `${Math.min(row.taux, 100)}%` }} /></div></div>)}</div></div>;
                      })}
                      <div className="rounded-lg border border-purple-200 bg-white/60 px-3 py-2 flex items-center gap-3 text-xs text-muted-foreground"><Info className="h-3.5 w-3.5 shrink-0 text-purple-400" /><span>Taux au 1er tour Employés : <strong className="text-foreground">37,64 %</strong> — le quorum n'est pas requis au 2ème tour.</span></div>
                    </div>
                  </div>
                ) : <div className="rounded-xl border border-border bg-muted/20 px-5 py-7 text-center space-y-2"><TrendingUp className="h-7 w-7 text-muted-foreground/30 mx-auto" /><p className="text-sm text-muted-foreground">Aucune donnée disponible pour le 2ème tour.</p></div>}
              </div>
            </section>

            <section className="space-y-8">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><Award className="h-5 w-5 text-emerald-600" />Élus CSE — FO COM UES ILIAD</h2>
              {[{ title: 'Collège Cadres', tour: '1er tour', titulaires: elusTitulairesCad, suppleants: elusSuppleantsCad, color: 'red' }, { title: 'Collège Employés / Techniciens', tour: '2ème tour', titulaires: elusTitulairesEmp, suppleants: elusSuppleantsEmp, color: 'emerald' }].map((section) => (
                <div key={section.title} className="space-y-5">
                  <div className="flex items-center justify-between border-b border-border pb-2 gap-3"><div className="flex items-center gap-2"><span className={`h-6 w-1.5 rounded-full ${section.color === 'red' ? 'bg-red-600' : 'bg-emerald-600'} inline-block`} /><h3 className="text-xl font-bold text-foreground">{section.title}</h3></div><Badge variant="outline" className={section.color === 'red' ? 'text-red-600 border-red-200 bg-red-50' : 'text-emerald-600 border-emerald-200 bg-emerald-50'}>{section.tour}</Badge></div>
                  <div className="space-y-3"><h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2"><span className={`h-3 w-3 rounded-full ${section.color === 'red' ? 'bg-red-600' : 'bg-emerald-600'} inline-block`} />Titulaires</h4><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{section.titulaires.map((candidat, i) => <CandidateCard key={candidat.name} candidat={{ ...candidat, role: candidat.role || 'Élu Titulaire' }} index={i} label="Élu" />)}</div></div>
                  <div className="space-y-3"><h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-slate-400 inline-block" />Suppléants</h4><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{section.suppleants.map((candidat, i) => <CandidateCard key={candidat.name} candidat={{ ...candidat, role: candidat.role || 'Élu Suppléant' }} index={i} label="Élu" />)}</div></div>
                </div>
              ))}
              <div className="rounded-lg border border-red-100 bg-red-50/50 p-5 text-center flex flex-col items-center gap-3"><ShieldCheck className="h-8 w-8 text-red-600" /><p className="text-sm text-foreground font-medium">Vos élus FO COM s'engagent à défendre vos droits au quotidien au sein du CSE.</p><p className="text-xs text-muted-foreground">N'hésitez pas à les contacter pour toute question, accompagnement ou démarche auprès de la direction.</p></div>
            </section>
          </>
        )}
      </div>
    </main>
  );
};

export default Elections;
