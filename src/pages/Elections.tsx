import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';


import ScrollToTop from '@/components/ScrollToTop';
import ProfessionDeFoiT2 from '@/components/ProfessionDeFoiT2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Vote, Users, CalendarDays, Info, CheckCircle, FileText, Download,
  ExternalLink, Trophy, Building2, ShieldCheck, ScrollText, Clock,
  Megaphone, Share2, Globe, Phone, Shield, TrendingUp, Star, Printer,
} from 'lucide-react';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useSearchParams } from 'react-router-dom';

// ─── Types & données partagés ─────────────────────────────────────────────────
import type {
  Candidat,
  SyndicatResult,
  Candidate,
  ElectionEvent,
  ElectionDocument,
  ParticipationSnapshot,
} from './elections.types';

import {
  CANDIDATS_T2_TITULAIRES,
  CANDIDATS_T2_SUPPLEANTS,
  RESULTATS_EMPLOYES_T1,
  RESULTATS_CADRES_T1,
  FO_TITULAIRES_EMP,
  FO_SUPPLEANTS_EMP,
  FO_TITULAIRES_CAD,
  FO_SUPPLEANTS_CAD,
  RETROPLANNING,
  FO_ENGAGEMENTS,
  FO_CONTACTS,
  SYNDICAT_COLORS,
  getInitials,
  dateIsPast,
  retroTypeStyle,
  retroTypeLabel,
  eventTypeColor,
  eventTypeLabel,
  documentTypeColor,
  documentTypeLabel,
} from './elections.data';

// ─── Sous-composants locaux ───────────────────────────────────────────────────

const ResBar = ({ s, type }: { s: SyndicatResult; type: 'titulaires' | 'suppleants' }) => {
  const data = type === 'titulaires' ? s.titulaires : s.suppleants;
  if (!data) return null;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.couleur }} />
          <span className={`text-sm font-semibold truncate${s.nom === 'FO' ? ' text-red-600 dark:text-red-400' : ' text-foreground'}`}>{s.nom}</span>
          <span className="text-xs text-muted-foreground tabular-nums shrink-0">{data.signatures} sig.</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm font-bold tabular-nums w-16 text-right" style={{ color: s.couleur }}>{data.pct.toFixed(2)} %</span>
          {data.sieges > 0 && (
            <span className="inline-flex items-center justify-center h-5 px-1.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
              {data.sieges} 💺
            </span>
          )}
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${data.pct}%`, background: s.couleur }} />
      </div>
    </div>
  );
};

const CandidateCard = ({ candidat, index }: { candidat: Candidat & { role?: string; fonction?: string }; index: number }) => {
  const [imgError, setImgError] = useState(false);
  
  // On récupère la fonction si elle existe
  const fonction = candidat.role || candidat.fonction;

  return (
    <div className="group flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:border-red-300 dark:hover:border-red-800/50 hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 cursor-default">
      
      {/* Photo sans l'effet de zoom interne */}
      <div className="h-12 w-12 shrink-0 rounded-full overflow-hidden bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-sm">
        {candidat.photo && !imgError ? (
          <img loading="lazy" 
            src={candidat.photo} 
            alt={candidat.name} 
            className="h-full w-full object-cover" 
            onError={() => setImgError(true)} 
          />
        ) : (
          <span className="text-white font-bold text-sm">
            {getInitials(candidat.name)}
          </span>
        )}
      </div>
      
      {/* Informations */}
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-foreground text-sm truncate group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors">
          {candidat.name}
        </p>
        
        <div className="flex flex-col mt-0.5">
          {fonction && (
            <span className="text-xs text-muted-foreground truncate font-medium">
              {fonction}
            </span>
          )}
          <div className="mt-1">
            <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground">
              N°{index + 1}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};

type DocumentCardProps = { doc: ElectionDocument };
const DocumentCard = ({ doc }: DocumentCardProps) => {
  const isPdf = doc.file_url.toLowerCase().endsWith('.pdf');
  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="py-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={documentTypeColor(doc.document_type)}>{documentTypeLabel(doc.document_type)}</Badge>
              {doc.list_name && <Badge variant="secondary" className="text-xs">{doc.list_name}</Badge>}
            </div>
            <p className="font-semibold text-foreground leading-tight">{doc.title}</p>
            {doc.description && <p className="text-sm text-muted-foreground line-clamp-2">{doc.description}</p>}
            <p className="text-xs text-muted-foreground">{format(new Date(doc.published_at), 'dd MMM yyyy', { locale: fr })}</p>
          </div>
          <FileText className="h-7 w-7 text-muted-foreground/30 shrink-0 mt-1" />
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="default" className="flex-1">
            <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />Consulter
            </a>
          </Button>
          {isPdf && (
            <Button asChild size="sm" variant="outline">
              <a href={doc.file_url} download><Download className="h-3.5 w-3.5" /></a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// ─── Composant principal ──────────────────────────────────────────────────────

const Elections = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [events, setEvents] = useState<ElectionEvent[]>([]);
  const [documents, setDocuments] = useState<ElectionDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [participationData, setParticipationData] = useState<ParticipationSnapshot[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'vote';

  useEffect(() => {
    const fetchData = async () => {
      const [candidatesRes, eventsRes, documentsRes, participationRes] = await Promise.all([
        supabase.from('election_candidates').select('*').order('display_order'),
        supabase.from('election_events').select('*').order('event_date'),
        supabase.from('election_documents').select('*').order('published_at', { ascending: false }),
        supabase.from('participation_snapshots').select('*, participation_colleges(*)').order('created_at'),
      ]);
      setCandidates((candidatesRes.data as Candidate[]) || []);
      setEvents((eventsRes.data as ElectionEvent[]) || []);
      setDocuments((documentsRes.data as ElectionDocument[]) || []);
      setParticipationData(
        ((participationRes.data as ParticipationSnapshot[]) || []).sort((a, b) => {
          const toTs = (d: string, h: string) => {
            const parts = d.split('/');
            if (parts.length !== 3) return 0;
            const [day, month, year] = parts.map(Number);
            const hMatch = h.match(/^(\d+)h(\d*)/);
            const hour = hMatch ? parseInt(hMatch[1]) : 0;
            const min  = hMatch && hMatch[2] ? parseInt(hMatch[2]) : 0;
            return new Date(year, month - 1, day, hour, min).getTime();
          };
          return toTs(a.date, a.heure) - toTs(b.date, b.heure);
        })
      );
      setLoading(false);      
    };
    fetchData();
  }, []);

  const t2ParticipationData = participationData.filter(snap => {
  const parts = snap.date.split('/');
  if (parts.length !== 3) return false;
  const [day, month, year] = parts.map(Number);
  return new Date(year, month - 1, day) >= new Date(2026, 3, 29);
});
const latestT2Snap = t2ParticipationData[t2ParticipationData.length - 1] ?? null;

  // Documents partitioned by type
  const foDocuments      = documents.filter(d => d.list_name?.toUpperCase().includes('FO') || !d.list_name);
  const professionsDeFoi = documents.filter(d => d.document_type === 'profession_de_foi');
  const tracts           = documents.filter(d => d.document_type === 'tract');
  const autresDocuments  = documents.filter(d => d.document_type === 'autre');

  return (
    <div className="p-4 lg:p-8">

      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-5xl space-y-10">

          {/* ── Hero ── */}
          <div className="text-center space-y-5">
            <div className="mx-auto w-14 h-14 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 flex items-center justify-center">
              <Vote className="h-7 w-7 text-red-600" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                Élections Professionnelles 2026
              </h1>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Délégation du personnel — CSE · UES Iliad
              </p>
              <p className="text-xs text-muted-foreground/70">
                Free SAS · Free Mobile · Free Réseau · ROF · Assunet · Iliad SA
              </p>
            </div>
            {/* Statut résumé */}
            <div className="flex flex-wrap justify-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800/40 px-3 py-1 text-xs font-medium text-green-700 dark:text-green-400">
                <CheckCircle className="h-3 w-3" />1er tour terminé — 21 avr. 2026
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-700/40 px-3 py-1 text-xs font-semibold text-red-700 dark:text-red-400">
                <span className="relative flex h-2 w-2 mr-0.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-700" />
                </span>
                2e tour Employés · 29 avr. – 6 mai 2026
              </span>
            </div>
          </div>

          {/* ── Navigation — 4 tabs ── */}
          <Tabs value={activeTab} onValueChange={val => setSearchParams({ tab: val })}>
            <div className="rounded-xl border border-border bg-muted/30 p-1.5">
              <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-transparent p-0">

                {/* Tab 1 : Vote */}
                <TabsTrigger
                  value="vote"
                  className="relative flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg
                    data-[state=active]:bg-red-700 data-[state=active]:text-white data-[state=active]:shadow-sm
                    data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/60"
                >
                  <Vote className="h-3.5 w-3.5 shrink-0" />
                  <span>2ème tour</span>
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-700" />
                  </span>
                </TabsTrigger>

                {/* Tab 2 : Notre programme */}
                <TabsTrigger
                  value="programme"
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg
                    data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-sm
                    data-[state=inactive]:text-red-600 dark:data-[state=inactive]:text-red-400 data-[state=inactive]:hover:bg-red-50 dark:data-[state=inactive]:hover:bg-red-950/20"
                >
                  <Megaphone className="h-3.5 w-3.5 shrink-0" /><span>Notre programme</span>
                </TabsTrigger>

                {/* Tab 3 : Résultats */}
                <TabsTrigger
                  value="resultats"
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg
                    data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-sm
                    data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/60"
                >
                  <Trophy className="h-3.5 w-3.5 shrink-0" /><span>Résultats & Participation</span>
                </TabsTrigger>

                {/* Tab 4 : Calendrier & Règles */}
                <TabsTrigger
                  value="calendrier"
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg
                    data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
                    data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/60"
                >
                  <CalendarDays className="h-3.5 w-3.5 shrink-0" /><span>Calendrier &amp; Règles</span>
                </TabsTrigger>

              </TabsList>
            </div>

            {/* ════════════════════════════════════════════════════════════
                TAB 1 : VOTE — 2ème tour, stripped to action essentials
            ════════════════════════════════════════════════════════════ */}
            <TabsContent value="vote" className="space-y-8 mt-6">
              {loading ? (
                <div className="flex justify-center py-16">
                  <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {/* Bandeau statut */}
                  <div className="rounded-xl border border-red-200 dark:border-red-800/40 bg-red-50/80 dark:bg-red-950/20 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center shrink-0">
                      <Vote className="h-5 w-5 text-white" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <p className="font-bold text-foreground">2<sup>e</sup> tour — Collège Techniciens / Employés / Non-Cadres</p>
                      <p className="text-sm text-muted-foreground">
                        Quorum non atteint au 1er tour (37,64 %). <strong className="text-foreground">Aucun quorum requis</strong> au 2ème tour.
                      </p>
                      <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                        Vote du <span className="underline decoration-dotted">29 avril</span> au{' '}
                        <span className="underline decoration-dotted">6 mai 2026</span> · Vote électronique
                      </p>
                    </div>
                    <Button className="bg-red-700 hover:bg-red-800 text-white font-bold shrink-0" asChild>
                      <a href="https://www.e-votez.net/uesiliad" target="_blank" rel="noopener noreferrer">
                        Je vote <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                      </a>
                    </Button>
                  </div>

                  {/* Dates clés */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-border bg-card p-5 space-y-2">
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold text-sm">
                        <CheckCircle className="h-4 w-4" />1er tour — Terminé
                      </div>
                      <p className="text-xl font-bold text-foreground">14 – 21 avril 2026</p>
                      <p className="text-sm text-muted-foreground">Résultats Cadres : définitifs ✓<br />Collège Employés : 2ème tour requis</p>
                      <p className="text-xs text-muted-foreground">Taux de participation Employés : 37,64 %</p>
                    </div>
                    <div className="rounded-xl border-2 border-red-400 dark:border-red-600 bg-red-50/40 dark:bg-red-950/10 p-5 space-y-2">
                      <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold text-sm">
                        <Vote className="h-4 w-4" />2ème tour — Employés
                      </div>
                      <p className="text-xl font-bold text-foreground">29 avril – 6 mai 2026</p>
                      <p className="text-sm text-muted-foreground">Ouverture 10h00 → Clôture 14h00<br />Résultats : mercredi 6 mai à 14h05</p>
                      <p className="text-xs text-muted-foreground">Dépôt candidatures : jusqu'au 23 avril (12h)</p>
                    </div>
                  </div>

                  {/* ── Participation live T2 ── */}
  <section className="space-y-3">
    <div className="flex items-center gap-2">
      <TrendingUp className="h-5 w-5 text-purple-500" />
      <h2 className="text-base font-bold text-foreground">Participation en direct — 2e tour</h2>
      <span className="relative flex h-2 w-2 ml-1">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-500 opacity-60" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-600" />
      </span>
    </div>
 
    {latestT2Snap ? (
      <div className="rounded-xl border border-purple-200 dark:border-purple-800/40 bg-purple-50/40 dark:bg-purple-950/10 overflow-hidden">
        {/* Header relevé */}
        <div className="flex items-center justify-between flex-wrap gap-3 px-4 py-3 border-b border-purple-200 dark:border-purple-800/40">
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>Relevé du <strong className="text-foreground">{latestT2Snap.date}</strong> à <strong className="text-foreground">{latestT2Snap.heure}</strong></span>
          </div>
          <div className="rounded-full bg-purple-600 px-3 py-1 text-white text-xs font-bold">
            Établissement : {(latestT2Snap.taux_etablissement ?? 0).toFixed(2)} %
          </div>
        </div>
 
        {/* Données collège Employés */}
        {(() => {
          const col = (latestT2Snap.participation_colleges ?? []).find(
            c => c.nom?.toLowerCase().includes('techni') || c.nom?.toLowerCase().includes('employ')
          );
          if (!col) return (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              Aucune donnée de collège disponible.
            </div>
          );
 
          const tauxTit = col.tit_taux ?? 0;
          const tauxSup = col.sup_taux ?? 0;
          const tauxCol = col.taux_college ?? 0;
 
          return (
            <div className="px-4 py-4 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="font-semibold text-foreground text-sm">{col.nom}</p>
                <Badge variant="outline" className="text-xs border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-400">
                  Taux : {tauxCol.toFixed(2)} %
                </Badge>
              </div>
 
              {/* Barres de progression */}
              <div className="space-y-3">
                {/* Titulaires */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Titulaires</span>
                    <span className="font-bold text-purple-700 dark:text-purple-400 tabular-nums">
                      {tauxTit.toFixed(2)} % · {col.tit_votants ?? 0} / {col.tit_inscrits ?? 0}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-purple-100 dark:bg-purple-900/30 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-purple-600 transition-all duration-700"
                      style={{ width: `${Math.min(tauxTit, 100)}%` }}
                    />
                  </div>
                </div>
                {/* Suppléants */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Suppléants</span>
                    <span className="font-bold text-purple-700 dark:text-purple-400 tabular-nums">
                      {tauxSup.toFixed(2)} % · {col.sup_votants ?? 0} / {col.sup_inscrits ?? 0}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-purple-100 dark:bg-purple-900/30 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-purple-400 transition-all duration-700"
                      style={{ width: `${Math.min(tauxSup, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
 
              {/* Comparaison T1 */}
              <div className="rounded-lg border border-purple-200 dark:border-purple-800/40 bg-white/60 dark:bg-purple-950/20 px-3 py-2 flex items-center gap-3 text-xs text-muted-foreground">
                <Info className="h-3.5 w-3.5 shrink-0 text-purple-400" />
                <span>
                  Pour rappel, le taux au 1er tour était de{' '}
                  <strong className="text-foreground">37,64 %</strong>.
                  {tauxCol > 37.64
                    ? <span className="text-emerald-600 dark:text-emerald-400 font-semibold"> Le 2e tour dépasse déjà ce seuil !</span>
                    : <span> Le quorum n'est pas requis au 2e tour.</span>
                  }
                </span>
              </div>
            </div>
          );
        })()}
 
        {/* Historique des relevés T2 */}
        {t2ParticipationData.length > 1 && (
          <div className="border-t border-purple-200 dark:border-purple-800/40 px-4 py-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Historique des relevés T2
            </p>
            <div className="space-y-1">
              {[...t2ParticipationData].reverse().map((snap, i) => {
                const empCol = (snap.participation_colleges ?? []).find(
                  c => c.nom?.toLowerCase().includes('techni') || c.nom?.toLowerCase().includes('employ')
                );
                return (
                  <div key={snap.id ?? i} className="flex items-center justify-between gap-4 rounded px-2 py-1.5 hover:bg-purple-100/50 dark:hover:bg-purple-900/20 transition-colors">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 shrink-0" />
                      {snap.date} · {snap.heure}
                    </div>
                    <div className="flex items-center gap-3 text-xs tabular-nums">
                      <span className="text-muted-foreground">Tit. <span className="font-bold text-foreground">{(empCol?.tit_taux ?? 0).toFixed(2)} %</span></span>
                      <span className="text-muted-foreground">Sup. <span className="font-bold text-foreground">{(empCol?.sup_taux ?? 0).toFixed(2)} %</span></span>
                      <span className="font-bold text-purple-700 dark:text-purple-400">{(snap.taux_etablissement ?? 0).toFixed(2)} % étab.</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    ) : (
      <div className="rounded-xl border border-border bg-muted/20 px-5 py-7 text-center space-y-2">
        <TrendingUp className="h-7 w-7 text-muted-foreground/30 mx-auto" />
        <p className="text-sm text-muted-foreground">Aucun relevé disponible pour ce 2e tour.</p>
        <p className="text-xs text-muted-foreground/70">Les données apparaîtront ici dès la saisie du premier relevé.</p>
      </div>
    )}
  </section>

                  {/* Candidats 2ème tour */}
                  <section className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <Users className="h-5 w-5 text-muted-foreground" />Candidats — 2<sup>e</sup> tour
                      </h2>
                      <Button size="sm" variant="outline" onClick={() => setSearchParams({ tab: 'programme' })}>
                        <Printer className="h-3.5 w-3.5 mr-1.5" />Profession de foi
                      </Button>
                    </div>

                    {/* Alerte vote de liste */}
                    <div className="rounded-lg border border-red-200 dark:border-red-800/40 bg-red-50/60 dark:bg-red-950/20 px-4 py-3 flex items-start gap-3">
                      <span className="text-xl shrink-0">🗳️</span>
                      <div>
                        <p className="font-bold text-red-700 dark:text-red-400 text-sm">Votez pour la liste FO — pas pour un seul nom !</p>
                        <p className="text-sm text-red-800/80 dark:text-red-300/80 mt-0.5 leading-relaxed">
                          Sièges répartis à la <strong>représentation proportionnelle par liste</strong>.
                          Votre bulletin vaut pour <strong>toute l'équipe FO COM UES ILIAD</strong> — ne panachez pas.
                        </p>
                      </div>
                    </div>

                    {/* Titulaires */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="h-5 w-1 rounded-full bg-red-600 inline-block" />
                        <div>
                          <h3 className="font-semibold text-foreground">Titulaires — Employés / Techniciens / Non-Cadres</h3>
                          <p className="text-xs text-muted-foreground">{CANDIDATS_T2_TITULAIRES.length} candidats</p>
                        </div>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {CANDIDATS_T2_TITULAIRES.map((candidat, i) => <CandidateCard key={candidat.name} candidat={candidat} index={i} />)}
                      </div>
                    </div>

                    {/* Suppléants */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="h-5 w-1 rounded-full bg-slate-400 inline-block" />
                        <div>
                          <h3 className="font-semibold text-foreground">Suppléants — Employés / Techniciens / Non-Cadres</h3>
                          <p className="text-xs text-muted-foreground">{CANDIDATS_T2_SUPPLEANTS.length} candidats</p>
                        </div>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {CANDIDATS_T2_SUPPLEANTS.map((candidat, i) => <CandidateCard key={candidat.name} candidat={candidat} index={i} />)}
                      </div>
                    </div>

                    {/* CTA vote */}
                    <div className="rounded-xl bg-gradient-to-r from-red-700 to-red-800 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                      <div>
                        <p className="font-bold text-white text-base">🗳️ Votez FO COM UES ILIAD — 2ème tour !</p>
                        <p className="text-red-100 text-sm">Du mercredi 29 avril au mercredi 6 mai 2026</p>
                      </div>
                      <Button className="bg-white text-red-700 hover:bg-red-50 font-bold shadow shrink-0" asChild>
                        <a href="https://www.e-votez.net/uesiliad" target="_blank" rel="noopener noreferrer">
                          Je vote maintenant <ExternalLink className="h-4 w-4 ml-1.5" />
                        </a>
                      </Button>
                    </div>
                  </section>
                </>
              )}
            </TabsContent>

            {/* ════════════════════════════════════════════════════════════
                TAB 2 : NOTRE PROGRAMME
                Propagande + Profession de foi + documents Supabase FO
            ════════════════════════════════════════════════════════════ */}
            <TabsContent value="programme" className="space-y-8 mt-6">

              {/* Hero propagande */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#001a6e] via-[#0047CC] to-[#0068FF] text-white shadow-xl min-h-[300px]">
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute -left-10 -top-10 h-56 w-56 rounded-full border-[40px] border-white/5" />
                  <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full border-[40px] border-white/5" />
                </div>
                <div className="relative flex items-end gap-0">
                  <div className="flex-1 p-7 md:p-10 space-y-4 z-10">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest backdrop-blur-sm">
                      <Megaphone className="h-3.5 w-3.5" />Tract électoral — 2ème tour · 29 avril – 6 mai 2026
                    </div>
                    <div>
                      <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-none">
                        VOTEZ<span className="block text-yellow-300 drop-shadow-lg">FO COM</span>
                        <span className="block text-xl md:text-2xl font-bold text-blue-200 mt-1">UES ILIAD</span>
                      </h2>
                      <p className="mt-3 text-blue-100 text-sm md:text-base font-medium leading-relaxed max-w-sm">
                        Pour une représentation forte, solidaire et utile à toutes et à tous
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-3 max-w-sm">
                      <p className="text-xs md:text-sm font-semibold italic leading-relaxed text-white/95">
                        « On ne subit pas. On riposte. Vous n'êtes pas seul(e) — ensemble, nous faisons respecter nos droits. »
                      </p>
                    </div>
                  </div>
                  <div className="hidden sm:block absolute bottom-0 right-0 h-full w-[340px] pointer-events-none select-none">
                    <img loading="lazy" src="/fo-militants.png" alt="Militants FO COM"
                      className="absolute bottom-0 right-0 h-[110%] w-auto object-contain object-bottom drop-shadow-2xl"
                      style={{ filter: 'drop-shadow(0 0 32px rgba(0,71,204,0.4))' }}
                    />
                  </div>
                </div>
              </div>

              {/* PDF programme */}
              <div className="flex flex-col sm:flex-row items-center gap-4 rounded-xl border border-border bg-card px-5 py-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="shrink-0 w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center">
                    <FileText className="h-4.5 w-4.5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">Programme électoral complet — FO COM UES Iliad</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Qui sommes-nous · Bilan · Revendications · Pourquoi voter FO COM · Contacts</p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button asChild size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                    <a href="/FOCOM_UES_ILIAD_2eme_tour.pdf" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5 mr-1.5" />Consulter
                    </a>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <a href="/FOCOM_UES_ILIAD_2eme_tour.pdf" download>
                      <Download className="h-3.5 w-3.5 mr-1.5" />Télécharger
                    </a>
                  </Button>
                </div>
              </div>

              {/* Qui sommes-nous */}
              <Card>
                <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Users className="h-4 w-4 text-primary" />Qui sommes-nous ?</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                  <p>Notre syndicat, <strong className="text-foreground">FO COM UES ILIAD</strong>, est affilié à Force Ouvrière. Il représente les salariés d'Iliad et défend leurs intérêts au quotidien.</p>
                  <p>Notre engagement nous a amené à être <strong className="text-foreground">le syndicat numéro un dans l'UES</strong>.</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {['Libre & indépendant', 'Justice sociale forte', 'Justice sociale équitable'].map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        <CheckCircle className="h-3 w-3" />{tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Bilan */}
              <section className="space-y-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />Notre bilan
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { icon: '⚖️', titre: 'RPS : La justice a donné raison au CSE',             texte: "Malgré l'opposition de la direction, nous avons obtenu gain de cause." },
                    { icon: '📈', titre: "Salaires : L'entreprise a les moyens",                texte: 'Confirmé par expertises indépendantes — nous exigeons que ça se traduise en actes.' },
                    { icon: '🛡️', titre: 'Réorganisations abusives dénoncées',                  texte: "Projets mal préparés aux impacts sous-estimés — nous l'avons dit haut et fort." },
                    { icon: '🏠', titre: 'Télétravail défendu bec et ongles',                   texte: 'Opposition ferme aux décisions brutales et injustifiées de la direction.' },
                    { icon: '💪', titre: 'Astreintes techniciens : rapport de force gagné',     texte: "FO a imposé une revalorisation des compensations et l'instauration de repos intangibles." },
                    { icon: '🌙', titre: 'Techniciens de nuit : repos garantis',                texte: 'Dialogue social offensif pour exiger des plages de repos avant et après les interventions nocturnes.' },
                    { icon: '✊', titre: 'Pétitions et grèves : FO assume ses responsabilités', texte: 'Seul syndicat à organiser des actions concrètes pour défendre les droits des salariés.' },
                    { icon: '🔥', titre: 'Négociations : FO face à la direction',               texte: "Seul syndicat à porter le combat dans chaque négociation et à s'opposer fermement." },
                    { icon: '📈', titre: 'Un syndicat renforcé par ses adhérents',              texte: 'De nouveaux adhérents toujours plus nombreux rejoignent nos rangs.' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card">
                      <span className="text-lg shrink-0">{item.icon}</span>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{item.titre}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{item.texte}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 4 priorités */}
              <section className="space-y-4">
                <h3 className="text-lg font-bold text-foreground">Nos 4 priorités pour 2026</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { emoji: '💰', titre: "Pouvoir d'Achat & Partage de la Valeur", intro: "Face à une inflation qui se stabilise mais des prix qui restent hauts :", items: ["Augmentations Générales (AG) : une base fixe pour tous", "Prime de Partage de la Valeur (PPV) : prime maximale défiscalisée", "Tickets Restaurant : revalorisation à 12,50 € pour suivre le coût réel"] },
                    { emoji: '🤖', titre: 'IA et Évolution des Métiers', intro: "« Zéro salarié laissé de côté » — Nous demandons :", items: ["Droit à la Formation Massive : plan certifiant avant tout déploiement IA", "Garantie d'Emploi : l'IA doit réduire la charge, non supprimer des postes"] },
                    { emoji: '🏠', titre: 'Qualité de Vie et Télétravail (TAD)', intro: 'Le mode hybride doit être mieux encadré :', items: ["Indemnité Télétravail : passage à 5 € par jour", "Droit à la Déconnexion : verrous techniques après 19h", "Semaine de 4 jours : expérimentation sur services volontaires"] },
                    { emoji: '🤝', titre: 'Un CSE au service de TOUS', intro: 'Transparence et activités sociales dignes :', items: ["Transparence totale dans nos communications", "ASC : chèques vacances, activités bien-être & sport", "Chèque culture et remboursement frais de garde enfants"] },
                  ].map(pilier => (
                    <div key={pilier.titre} className="rounded-xl border border-border bg-card overflow-hidden">
                      <div className="bg-red-600 px-4 py-2.5">
                        <p className="font-bold text-white text-sm">{pilier.emoji} {pilier.titre}</p>
                      </div>
                      <div className="px-4 py-3 space-y-2">
                        <p className="text-xs text-muted-foreground italic">{pilier.intro}</p>
                        <ul className="space-y-1.5">
                          {pilier.items.map(item => (
                            <li key={item} className="flex items-start gap-2 text-xs text-foreground">
                              <span className="mt-1 w-1 h-1 rounded-full bg-red-500 shrink-0" />{item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Engagements */}
              <Card>
                <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Shield className="h-4 w-4 text-primary" />Nos engagements</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {FO_ENGAGEMENTS.map((eng, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />{eng}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* ── Profession de foi — section inline ── */}
<section className="space-y-4">
  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
    <Printer className="h-5 w-5 text-muted-foreground" />Profession de foi — 2e tour
  </h3>
  <div className="flex flex-col sm:flex-row items-center gap-4 rounded-xl border border-border bg-card px-5 py-4">
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <div className="shrink-0 w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center">
        <FileText className="h-4 w-4 text-white" />
      </div>
      <div>
        <p className="font-semibold text-foreground text-sm">Profession de foi — FO COM UES Iliad</p>
        <p className="text-xs text-muted-foreground mt-0.5">2ème tour · 29 avril – 6 mai 2026</p>
      </div>
    </div>
    <div className="flex gap-2 shrink-0">
      <Button asChild size="sm" className="bg-red-600 hover:bg-red-700 text-white">
        <a href="/propagande-ues-iliad-2tour.pdf" target="_blank" rel="noopener noreferrer">
          <ExternalLink className="h-3.5 w-3.5 mr-1.5" />Consulter
        </a>
      </Button>
      <Button asChild size="sm" variant="outline">
        <a href="/propagande-ues-iliad-2tour.pdf" download>
          <Download className="h-3.5 w-3.5 mr-1.5" />Télécharger
        </a>
      </Button>
    </div>
  </div>
</section>

              {/* ── Documents Supabase liés à FO ── */}
              {documents.length > 0 && (
                <section className="space-y-6">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />Documents électoraux
                  </h3>
                  {professionsDeFoi.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 inline-block" />Professions de foi
                      </h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {professionsDeFoi.map(doc => <DocumentCard key={doc.id} doc={doc} />)}
                      </div>
                    </div>
                  )}
                  {tracts.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />Tracts
                      </h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {tracts.map(doc => <DocumentCard key={doc.id} doc={doc} />)}
                      </div>
                    </div>
                  )}
                  {autresDocuments.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 inline-block" />Autres documents
                      </h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {autresDocuments.map(doc => <DocumentCard key={doc.id} doc={doc} />)}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* CTA final */}
              <div className="rounded-2xl bg-gradient-to-r from-red-600 to-red-700 p-6 text-center shadow-lg">
                <Vote className="h-7 w-7 mx-auto mb-2 text-white/80" />
                <p className="text-white font-black text-lg uppercase tracking-wide">Protégez vos droits</p>
                <p className="text-red-200 font-medium text-sm mt-1">Du mercredi 29 avril au mercredi 6 mai 2026</p>
                <p className="text-white font-extrabold text-xl mt-2">VOTEZ POUR FO COM UES ILIAD</p>
              </div>

              {/* Contacts */}
              <section className="space-y-4">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />Contactez vos délégués syndicaux
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {FO_CONTACTS.map(contact => (
                    <div key={contact.nom} className="flex flex-col gap-1 rounded-lg border border-border bg-card px-4 py-3 hover:border-red-200 dark:hover:border-red-800/50 transition-colors">
                      <p className="font-semibold text-foreground text-sm">{contact.nom}</p>
                      <a href={`tel:${contact.tel.replace(/\s/g, '')}`} className="text-red-600 dark:text-red-400 text-xs font-medium hover:underline flex items-center gap-1">
                        <Phone className="h-3 w-3" />{contact.tel}
                      </a>
                      <a href={`mailto:${contact.email}`} className="text-muted-foreground text-xs hover:underline truncate">{contact.email}</a>
                    </div>
                  ))}
                </div>
              </section>

              {/* Liens externes */}
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline" size="sm">
                  <a href="https://focomues-iliad.fr/" target="_blank" rel="noopener noreferrer">
                    <Globe className="h-3.5 w-3.5 mr-1.5" />focomues-iliad.fr<ExternalLink className="h-3 w-3 ml-1.5 opacity-60" />
                  </a>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a href="https://www.facebook.com/groups/focomiliad/" target="_blank" rel="noopener noreferrer">
                    <Share2 className="h-3.5 w-3.5 mr-1.5" />Groupe Facebook FO COM Iliad<ExternalLink className="h-3 w-3 ml-1.5 opacity-60" />
                  </a>
                </Button>
              </div>

              <p className="text-xs text-muted-foreground border-t border-border pt-4">
                Document reproduit d'après le tract électoral officiel FO COM UES Iliad — Élections professionnelles CSE 2026.
                Affilié à <strong>Force Ouvrière</strong>. Protection juridique &amp; défense du consommateur avec l'AFOC.
              </p>
            </TabsContent>

            {/* ════════════════════════════════════════════════════════════
                TAB 3 : RÉSULTATS & PARTICIPATION
                Résultats 1er tour + Participation comme section
            ════════════════════════════════════════════════════════════ */}
            <TabsContent value="resultats" className="space-y-8 mt-6">
              <div>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-muted-foreground" />Résultats — 1<sup>er</sup> tour CSE 2026
                </h2>
                <p className="text-sm text-muted-foreground mt-1">Scrutin du 14–21 avril 2026 — Vote électronique — e-votez.net</p>
              </div>

              {/* Résumé FO */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 rounded-xl border-2 border-red-300 dark:border-red-700 bg-red-50/60 dark:bg-red-950/20 px-4 py-4">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-white text-sm shrink-0" style={{ background: SYNDICAT_COLORS.FO }}>FO</div>
                  <div>
                    <p className="font-bold text-foreground text-sm">Collège Employés · <span className="text-red-600 dark:text-red-400">1ère liste 🥇</span></p>
                    <p className="text-xs text-muted-foreground mt-0.5">Tit. : <strong className="text-foreground">35,10 %</strong> · Sup. : <strong className="text-foreground">34,65 %</strong></p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-0.5">2e tour requis</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50/60 dark:bg-emerald-950/20 px-4 py-4">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-white text-sm shrink-0" style={{ background: SYNDICAT_COLORS.FO }}>FO</div>
                  <div>
                    <p className="font-bold text-foreground text-sm">Collège Cadres · <span className="text-emerald-600">3 sièges élus ✓</span></p>
                    <p className="text-xs text-muted-foreground mt-0.5">Tit. : <strong className="text-foreground">20,62 %</strong> · Sup. : <strong className="text-foreground">19,52 %</strong></p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">Résultats définitifs</p>
                  </div>
                </div>
              </div>

              {/* ── Section Participation ── */}
              <section className="space-y-5">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  <h3 className="text-base font-bold text-foreground">Participation — 1<sup>er</sup> tour</h3>
                  <span className="text-xs text-muted-foreground ml-1">Résultats définitifs — 21 avril 2026 à 14h10</span>
                </div>

                {participationData.length === 0 ? (
                  <div className="rounded-xl border border-border bg-muted/20 px-6 py-8 text-center">
                    <TrendingUp className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">Aucun relevé disponible pour le moment.</p>
                  </div>
                ) : (() => {
                  const snap = participationData[participationData.length - 1];
                  if (!snap) return null;
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Clock className="h-4 w-4 shrink-0" />Relevé du {snap.date} à {snap.heure}
                        </div>
                        <div className="rounded-full bg-purple-600 px-4 py-1.5 text-white text-sm font-bold">
                          Établissement : {(snap.taux_etablissement ?? 0).toFixed(2)} %
                        </div>
                      </div>
                      <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
                        {[...(snap.participation_colleges ?? [])].sort((a, b) => a.display_order - b.display_order).map(col => (
                          <div key={col.nom} className="px-4 py-4 space-y-3 bg-card">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <p className="font-semibold text-foreground text-sm">{col.nom}</p>
                              <Badge variant="outline" className="text-xs">
                                Taux : {(col.taux_college ?? 0).toFixed(2)} %
                              </Badge>
                            </div>
                            <div className="overflow-x-auto rounded-lg border border-border">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="bg-muted/50 border-b border-border">
                                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Scrutin</th>
                                    <th className="px-3 py-2 font-medium text-muted-foreground text-center">Inscrits</th>
                                    <th className="px-3 py-2 font-medium text-muted-foreground text-center">Votants</th>
                                    <th className="px-3 py-2 font-medium text-muted-foreground text-center">Taux</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr className="border-t border-border">
                                    <td className="px-3 py-2 text-muted-foreground">CSE Titulaires</td>
                                    <td className="px-3 py-2 text-center">{col.tit_inscrits ?? 0}</td>
                                    <td className="px-3 py-2 text-center font-semibold text-foreground">{col.tit_votants ?? 0}</td>
                                    <td className="px-3 py-2 text-center font-bold text-purple-600 dark:text-purple-400">{(col.tit_taux ?? 0).toFixed(2)} %</td>
                                  </tr>
                                  <tr className="border-t border-border">
                                    <td className="px-3 py-2 text-muted-foreground">CSE Suppléants</td>
                                    <td className="px-3 py-2 text-center">{col.sup_inscrits ?? 0}</td>
                                    <td className="px-3 py-2 text-center font-semibold text-foreground">{col.sup_votants ?? 0}</td>
                                    <td className="px-3 py-2 text-center font-bold text-purple-600 dark:text-purple-400">{(col.sup_taux ?? 0).toFixed(2)} %</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </section>

              {/* Collège Employés */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-foreground">Collège Techniciens / Employés / Non-Cadres</h3>
                  <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400">Quorum non atteint — 2e tour</Badge>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Titulaires — 1 020 votes valables</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      {[...RESULTATS_EMPLOYES_T1].sort((a, b) => (b.titulaires?.pct ?? 0) - (a.titulaires?.pct ?? 0)).map(s => <ResBar key={s.nom} s={s} type="titulaires" />)}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Suppléants — 1 016 votes valables</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      {[...RESULTATS_EMPLOYES_T1].sort((a, b) => (b.suppleants?.pct ?? 0) - (a.suppleants?.pct ?? 0)).map(s => <ResBar key={s.nom} s={s} type="suppleants" />)}
                    </CardContent>
                  </Card>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold flex items-center gap-2"><span className="w-2 h-2 rounded-full shrink-0" style={{ background: SYNDICAT_COLORS.FO }} />FO — Voix Titulaires Employés</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        {FO_TITULAIRES_EMP.map((c, i) => (
                          <div key={c.nom} className="flex items-center justify-between gap-2 rounded px-2.5 py-1.5 bg-muted/30 hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-xs font-bold text-muted-foreground w-4 shrink-0">{i + 1}</span>
                              <span className="text-xs truncate">{c.nom}</span>
                            </div>
                            <span className="text-xs font-bold tabular-nums text-red-600 shrink-0">{c.voix}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold flex items-center gap-2"><span className="w-2 h-2 rounded-full shrink-0" style={{ background: SYNDICAT_COLORS.FO }} />FO — Voix Suppléants Employés</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        {FO_SUPPLEANTS_EMP.map((c, i) => (
                          <div key={c.nom} className="flex items-center justify-between gap-2 rounded px-2.5 py-1.5 bg-muted/30 hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-xs font-bold text-muted-foreground w-4 shrink-0">{i + 1}</span>
                              <span className="text-xs truncate">{c.nom}</span>
                            </div>
                            <span className="text-xs font-bold tabular-nums text-red-600 shrink-0">{c.voix}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Collège Cadres */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-foreground">Collège Cadres</h3>
                  <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400">13 sièges pourvus — définitifs</Badge>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Titulaires — 1 222 votes valables</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      {RESULTATS_CADRES_T1.filter(s => s.titulaires).map(s => <ResBar key={s.nom} s={s} type="titulaires" />)}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Suppléants — 1 219 votes valables</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      {RESULTATS_CADRES_T1.filter(s => s.suppleants).map(s => <ResBar key={s.nom} s={s} type="suppleants" />)}
                    </CardContent>
                  </Card>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold flex items-center gap-2"><Trophy className="h-3.5 w-3.5 text-red-500" />FO — Titulaires Cadres</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        {FO_TITULAIRES_CAD.map((c, i) => (
                          <div key={c.nom} className={`flex items-center justify-between gap-2 rounded px-2.5 py-1.5 transition-colors ${c.elu ? 'bg-emerald-50 dark:bg-emerald-950/20' : 'bg-muted/30 hover:bg-muted/50'}`}>
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-xs font-bold text-muted-foreground w-4 shrink-0">{i + 1}</span>
                              <span className="text-xs truncate">{c.nom}</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-xs font-bold tabular-nums text-red-600">{c.voix}</span>
                              {c.elu && <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">ÉLU</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold flex items-center gap-2"><Trophy className="h-3.5 w-3.5 text-red-500" />FO — Suppléants Cadres</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        {FO_SUPPLEANTS_CAD.map((c, i) => (
                          <div key={c.nom} className={`flex items-center justify-between gap-2 rounded px-2.5 py-1.5 transition-colors ${c.elu ? 'bg-emerald-50 dark:bg-emerald-950/20' : 'bg-muted/30 hover:bg-muted/50'}`}>
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-xs font-bold text-muted-foreground w-4 shrink-0">{i + 1}</span>
                              <span className="text-xs truncate">{c.nom}</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-xs font-bold tabular-nums text-red-600">{c.voix}</span>
                              {c.elu && <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">ÉLU</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Récap sièges */}
                <Card className="bg-muted/20">
                  <CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Récapitulatif sièges — Collège Cadres</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                      {RESULTATS_CADRES_T1.filter(s => s.titulaires && (s.titulaires.sieges > 0 || (s.suppleants && s.suppleants.sieges > 0))).map(s => (
                        <div key={s.nom} className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 ${s.nom === 'FO' ? 'bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-700' : 'bg-card border-border'}`}>
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.couleur }} />
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate">{s.nom}</p>
                            <p className="text-xs text-muted-foreground">{s.titulaires!.sieges}T · {s.suppleants?.sieges ?? 0}S</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* CTA 2e tour */}
              <div className="rounded-xl border border-red-200 dark:border-red-800/40 bg-red-50/60 dark:bg-red-950/20 px-5 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-foreground flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-red-500" />FO en tête — 2e tour Employés en cours !
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">Vote du <strong>29 avril</strong> au <strong>6 mai 2026</strong> — Aucun quorum requis</p>
                </div>
                <Button className="bg-red-700 hover:bg-red-800 text-white font-bold shrink-0" asChild>
                  <a href="https://www.e-votez.net/uesiliad" target="_blank" rel="noopener noreferrer">
                    🗳️ Je vote maintenant <ExternalLink className="h-4 w-4 ml-1.5" />
                  </a>
                </Button>
              </div>
            </TabsContent>

            {/* ════════════════════════════════════════════════════════════
                TAB 4 : CALENDRIER & RÈGLES
                Rétro-planning + PAP + Déclaration + calendrier Supabase
            ════════════════════════════════════════════════════════════ */}
            <TabsContent value="calendrier" className="space-y-10 mt-6">

              {/* ── Rétro-planning officiel ── */}
              <section className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                      <CalendarDays className="h-5 w-5 text-muted-foreground" />Rétro-planning officiel
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">Annexe n°2 du PAP — signé le 11 mars 2026</p>
                  </div>
                  <Button asChild size="sm" variant="outline" className="shrink-0">
                    <a href="/retroplanning.pdf" target="_blank" rel="noopener noreferrer">
                      <Download className="h-3.5 w-3.5 mr-1.5" />Télécharger le PDF
                    </a>
                  </Button>
                </div>

                {/* Légende */}
                <div className="flex flex-wrap gap-2 text-xs">
                  {(['info', 'candidature', 'vote', 'resultat'] as const).map(t => (
                    <span key={t} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-medium border ${retroTypeStyle(t)}`}>
                      {retroTypeLabel(t)}
                    </span>
                  ))}
                </div>

                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                  <div className="space-y-2.5">
                    {RETROPLANNING.map((step, i) => {
                      const past = dateIsPast(step.date);
                      return (
                        <div key={i} className="relative pl-10">
                          <div className={`absolute left-3.5 top-3.5 w-2 h-2 rounded-full border-2 border-background ${past ? 'bg-primary' : 'bg-muted-foreground/40'}`} />
                          <div className={`rounded-lg border p-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 ${past ? 'opacity-60 bg-muted/10 border-border' : 'bg-card border-border'}`}>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge variant="outline" className={`text-xs ${retroTypeStyle(step.type)}`}>{retroTypeLabel(step.type)}</Badge>
                              <span className="text-xs font-semibold text-foreground whitespace-nowrap">{step.date}</span>
                              {past && <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />}
                            </div>
                            <p className="text-sm text-foreground">{step.label}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* ── Calendrier électoral Supabase ── */}
              {events.length > 0 && (
                <section className="space-y-4">
                  <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
                    <CalendarDays className="h-5 w-5 text-muted-foreground" />Calendrier électoral
                  </h2>
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                    <div className="space-y-3">
                      {events.map(event => {
                        const isPast = new Date(event.event_date) < new Date();
                        return (
                          <div key={event.id} className="relative pl-10">
                            <div className={`absolute left-3.5 top-3.5 w-2 h-2 rounded-full border-2 border-background ${isPast ? 'bg-primary' : 'bg-muted-foreground/40'}`} />
                            <div className={`rounded-lg border p-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 ${isPast ? 'opacity-60 bg-muted/20 border-border' : 'bg-card border-border'}`}>
                              <div className="flex items-center gap-2 shrink-0">
                                <Badge variant="outline" className={`text-xs ${eventTypeColor(event.event_type)}`}>{eventTypeLabel(event.event_type)}</Badge>
                                <span className="text-sm font-semibold text-foreground">{format(new Date(event.event_date), 'dd MMM yyyy', { locale: fr })}</span>
                                {isPast && <CheckCircle className="h-3.5 w-3.5 text-green-500" />}
                              </div>
                              <div>
                                <p className="font-medium text-foreground text-sm">{event.title}</p>
                                {event.description && <p className="text-xs text-muted-foreground">{event.description}</p>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>
              )}

              {/* ── PAP & Modalités ── */}
              <section className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <ScrollText className="h-5 w-5 text-muted-foreground" />Protocole d'Accord Préélectoral
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">Signé le 11 mars 2026 — UES Iliad Group</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline">
                    <a href="/pap-cse-ues-iliad.pdf" target="_blank" rel="noopener noreferrer">
                      <FileText className="h-3.5 w-3.5 mr-1.5" />PAP <Download className="h-3.5 w-3.5 ml-1.5" />
                    </a>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <a href="/retroplanning.pdf" target="_blank" rel="noopener noreferrer">
                      <FileText className="h-3.5 w-3.5 mr-1.5" />Rétro-planning <Download className="h-3.5 w-3.5 ml-1.5" />
                    </a>
                  </Button>
                </div>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Building2 className="h-4 w-4 text-primary" />Périmètre — UES Iliad
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Un seul CSE pour l'ensemble des sociétés de l'UES, établissement unique au siège Iliad (16, rue de la Ville-l'Évêque, Paris 8ème).
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {['Free SAS', 'Free Mobile', 'Free Réseau', 'Réseau Optique de France (ROF)', 'Assunet', 'Iliad SA'].map(s => (
                        <div key={s} className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs font-medium text-foreground">{s}</div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Users className="h-4 w-4 text-primary" />Collèges électoraux &amp; sièges
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Effectif total : <strong className="text-foreground">5 006,71 ETP</strong> (31 janvier 2026) — 742,49 femmes · 4 264,23 hommes.
                    </p>
                    <div className="overflow-x-auto rounded-lg border border-border">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/50 border-b border-border">
                            <th className="text-left px-4 py-2.5 font-semibold text-foreground text-sm">Collège</th>
                            <th className="px-4 py-2.5 font-semibold text-foreground text-center text-sm">ETP</th>
                            <th className="px-4 py-2.5 font-semibold text-foreground text-center text-sm">Titulaires</th>
                            <th className="px-4 py-2.5 font-semibold text-foreground text-center text-sm">Suppléants</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-t border-border">
                            <td className="px-4 py-3 font-medium text-foreground text-sm">Employés, Techniciens &amp; non-cadres</td>
                            <td className="px-4 py-3 text-center text-muted-foreground text-sm">308,99</td>
                            <td className="px-4 py-3 text-center font-bold text-primary text-sm">17</td>
                            <td className="px-4 py-3 text-center font-bold text-primary text-sm">17</td>
                          </tr>
                          <tr className="border-t border-border">
                            <td className="px-4 py-3 font-medium text-foreground text-sm">Cadres</td>
                            <td className="px-4 py-3 text-center text-muted-foreground text-sm">433,50</td>
                            <td className="px-4 py-3 text-center font-bold text-primary text-sm">13</td>
                            <td className="px-4 py-3 text-center font-bold text-primary text-sm">13</td>
                          </tr>
                          <tr className="border-t-2 border-border bg-muted/30">
                            <td className="px-4 py-3 font-bold text-foreground text-sm">TOTAL</td>
                            <td className="px-4 py-3 text-center font-bold text-foreground text-sm">742,49</td>
                            <td className="px-4 py-3 text-center font-bold text-foreground text-sm">30</td>
                            <td className="px-4 py-3 text-center font-bold text-foreground text-sm">30</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-muted-foreground">* Répartition proportionnelle à l'effectif (Art. 2 du PAP).</p>
                  </CardContent>
                </Card>

                <div className="grid sm:grid-cols-2 gap-5">
                  <Card>
                    <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="h-4 w-4 text-primary" />Conditions pour voter</CardTitle></CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2"><span className="text-primary mt-0.5 shrink-0">•</span>Être âgé de 16 ans révolus</li>
                        <li className="flex items-start gap-2"><span className="text-primary mt-0.5 shrink-0">•</span>Avoir travaillé <strong className="text-foreground">3 mois au moins</strong> dans le groupe Iliad</li>
                        <li className="flex items-start gap-2"><span className="text-primary mt-0.5 shrink-0">•</span>Ne pas avoir fait l'objet d'une interdiction relative aux droits civiques</li>
                        <li className="flex items-start gap-2"><span className="text-primary mt-0.5 shrink-0">•</span>Date de référence : <strong className="text-foreground">1er jour d'ouverture du vote</strong></li>
                      </ul>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Users className="h-4 w-4 text-primary" />Conditions pour être candidat</CardTitle></CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2"><span className="text-primary mt-0.5 shrink-0">•</span>Être électeur dans le même collège</li>
                        <li className="flex items-start gap-2"><span className="text-primary mt-0.5 shrink-0">•</span>Être âgé de <strong className="text-foreground">18 ans révolus</strong></li>
                        <li className="flex items-start gap-2"><span className="text-primary mt-0.5 shrink-0">•</span>Travailler depuis <strong className="text-foreground">1 an au moins</strong> dans l'entreprise</li>
                        <li className="flex items-start gap-2"><span className="text-primary mt-0.5 shrink-0">•</span>Ne pas avoir de lien proche avec l'employeur</li>
                        <li className="flex items-start gap-2"><span className="text-primary mt-0.5 shrink-0">•</span>Ne pas disposer d'une délégation particulière d'autorité</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Vote className="h-4 w-4 text-primary" />Vote électronique</CardTitle></CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>Vote exclusivement <strong className="text-foreground">par voie électronique</strong>, conformément à l'accord du 31 janvier 2018 et à la loi du 21 juin 2004.</p>
                    <p>Chaque électeur recevra un e-mail d'invitation avec ses codes sur son adresse professionnelle avant l'ouverture du scrutin.</p>
                    <p>Un e-mail de relance sera envoyé pendant la durée du scrutin.</p>
                    <p className="text-xs pt-1 text-muted-foreground/70">Réf. : Délibération CNIL n°2019-053 du 25 avril 2019.</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-base">Organisations syndicales signataires</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-2 text-sm">
                      {['CFDT', 'CFE-CGC Télécoms', 'CFTC Média +', 'CGT', 'FO-COM', 'SUD', 'UNSA Télécoms'].map(name => (
                        <div key={name} className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                          <span className="font-semibold text-foreground">{name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </section>
              
            </TabsContent>

          </Tabs>
        </div>
      </main>

      <ScrollToTop />
    </div>
  );
};

export default Elections;
