import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PageBreadcrumb } from '@/components/PageBreadcrumb';
import { toast } from 'sonner';
import { ClipboardList, CheckCircle2, Clock, ChevronLeft, Users, BarChart3, Loader2, Lock, Mail, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type ParticipationMode = 'adherents_only' | 'professional_email' | 'mixed';
type Survey = { id: string; title: string; description: string | null; is_anonymous: boolean; allow_multiple_votes: boolean; ends_at: string | null; starts_at: string | null; created_at: string; participation_mode?: ParticipationMode | null; allowed_email_domain?: string | null };
type SurveyOption = { id: string; option_text: string; display_order: number };
type Question = { id: string; question_text: string; question_type: 'single_choice' | 'multiple_choice' | 'text'; display_order: number; survey_options: SurveyOption[] };
type SurveyResponseInsert = { survey_id: string; question_id: string; user_id: string; text_response?: string; option_id?: string };
type ResultsData = { question_id: string; option_id: string | null; count: number };
type VoterProfile = { id: string; status: string | null };
type ExternalForm = { first_name: string; last_name: string; email: string; code: string; codeSent: boolean };

const DEFAULT_DOMAIN = 'iliad-free.fr';
const modeLabel: Record<ParticipationMode, string> = { adherents_only: 'Adhérents actifs', professional_email: 'Email professionnel vérifié', mixed: 'Adhérents ou email professionnel' };
const externalEmpty = (): ExternalForm => ({ first_name: '', last_name: '', email: '', code: '', codeSent: false });

const Sondages = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeSurvey, setActiveSurvey] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [textAnswers, setTextAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState<string | null>(null);
  const [voteMode, setVoteMode] = useState<'member' | 'external'>('member');
  const [externalForm, setExternalForm] = useState<ExternalForm>(externalEmpty());

  const { data: surveys = [], isLoading } = useQuery({
    queryKey: ['surveys-public'],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase.from('surveys').select('*').eq('is_active', true).or(`starts_at.is.null,starts_at.lte.${now}`).order('created_at', { ascending: false });
      if (error) throw error;
      return data as Survey[];
    },
  });

  const { data: voterProfile = null, isLoading: profileLoading } = useQuery({
    queryKey: ['survey-voter-profile', user?.id], enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('id, status').eq('id', user!.id).maybeSingle();
      if (error) throw error;
      return data as VoterProfile | null;
    },
  });

  const hasActiveProfile = !!voterProfile && voterProfile.status === 'actif';

  const { data: votedSurveyIds = new Set<string>() } = useQuery({
    queryKey: ['voted-surveys', user?.id], enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from('survey_responses').select('survey_id').eq('user_id', user!.id);
      return new Set((data ?? []).map((r) => r.survey_id as string));
    },
  });

  const { data: questions = [], isLoading: questionsLoading } = useQuery({
    queryKey: ['survey-questions', activeSurvey?.id], enabled: !!activeSurvey,
    queryFn: async () => {
      const { data, error } = await supabase.from('survey_questions').select('*, survey_options(*)').eq('survey_id', activeSurvey!.id).order('display_order');
      if (error) throw error;
      return (data ?? []) as Question[];
    },
  });

  const { data: results = [] } = useQuery({
    queryKey: ['survey-results', showResults], enabled: !!showResults,
    queryFn: async () => {
      const { data, error } = await supabase.from('survey_responses').select('question_id, option_id, text_response').eq('survey_id', showResults!);
      if (error) throw error;
      const counts: Record<string, number> = {};
      for (const r of data ?? []) {
        const key = `${r.question_id}__${r.option_id ?? '__text'}`;
        counts[key] = (counts[key] ?? 0) + 1;
      }
      return Object.entries(counts).map(([key, count]) => {
        const [question_id, option_id] = key.split('__');
        return { question_id, option_id: option_id === '__text' ? null : option_id, count };
      }) as ResultsData[];
    }, refetchInterval: showResults ? 10000 : false,
  });

  const { data: participantCount = 0 } = useQuery({
    queryKey: ['survey-participants', showResults], enabled: !!showResults,
    queryFn: async () => {
      const { data } = await supabase.from('survey_responses').select('user_id, external_participant_id').eq('survey_id', showResults!);
      const members = new Set((data ?? []).filter((r) => r.user_id).map((r) => r.user_id)).size;
      const externals = new Set((data ?? []).filter((r) => r.external_participant_id).map((r) => r.external_participant_id)).size;
      return members + externals;
    }, refetchInterval: showResults ? 10000 : false,
  });

  const { data: resultQuestions = [] } = useQuery({
    queryKey: ['survey-questions-results', showResults], enabled: !!showResults,
    queryFn: async () => {
      const { data, error } = await supabase.from('survey_questions').select('*, survey_options(*)').eq('survey_id', showResults!).order('display_order');
      if (error) throw error;
      return (data ?? []) as Question[];
    },
  });

  const buildExternalAnswers = () => questions.map((q) => {
    if (q.question_type === 'text') return { question_id: q.id, question_type: q.question_type, text_response: textAnswers[q.id]?.trim() || '' };
    if (q.question_type === 'single_choice') return { question_id: q.id, question_type: q.question_type, option_id: answers[q.id] as string | undefined };
    return { question_id: q.id, question_type: q.question_type, option_ids: (answers[q.id] as string[]) || [] };
  });

  const sendCodeMutation = useMutation({
    mutationFn: async () => {
      if (!activeSurvey) throw new Error('Aucun sondage sélectionné');
      if (!externalForm.email.trim()) throw new Error('Email professionnel requis');
      const { data, error } = await supabase.functions.invoke('send-survey-code', { body: { survey_id: activeSurvey.id, email: externalForm.email.trim() } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => { setExternalForm((f) => ({ ...f, codeSent: true })); toast.success('Code envoyé sur votre email professionnel'); },
    onError: (err: Error) => toast.error(err.message),
  });

  const memberSubmitMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Vous devez être connecté pour participer.');
      if (!activeSurvey) throw new Error('Aucun sondage sélectionné');
      const { data: freshProfile, error: profileError } = await supabase.from('profiles').select('id, status').eq('id', user.id).maybeSingle();
      if (profileError) throw profileError;
      if (!freshProfile || freshProfile.status !== 'actif') throw new Error('Votre profil adhérent doit être actif pour participer à ce sondage.');
      const now = new Date();
      const { data: freshSurvey, error: surveyError } = await supabase.from('surveys').select('id, is_active, allow_multiple_votes, ends_at, starts_at').eq('id', activeSurvey.id).maybeSingle();
      if (surveyError) throw surveyError;
      if (!freshSurvey || !freshSurvey.is_active) throw new Error('Ce sondage n’est plus actif.');
      if (freshSurvey.starts_at && new Date(freshSurvey.starts_at) > now) throw new Error('Ce sondage n’est pas encore ouvert.');
      if (freshSurvey.ends_at && new Date(freshSurvey.ends_at) < now) throw new Error('Ce sondage est clôturé.');
      if (!freshSurvey.allow_multiple_votes) {
        const { count, error: duplicateError } = await supabase.from('survey_responses').select('id', { count: 'exact', head: true }).eq('survey_id', activeSurvey.id).eq('user_id', user.id);
        if (duplicateError) throw duplicateError;
        if ((count ?? 0) > 0) throw new Error('Vous avez déjà participé à ce sondage.');
      }
      const rows: SurveyResponseInsert[] = [];
      for (const q of questions) {
        if (q.question_type === 'text') {
          if (!textAnswers[q.id]?.trim()) throw new Error(`Veuillez répondre à : "${q.question_text}"`);
          rows.push({ survey_id: activeSurvey.id, question_id: q.id, text_response: textAnswers[q.id].trim(), user_id: user.id });
        } else if (q.question_type === 'single_choice') {
          if (!answers[q.id]) throw new Error(`Veuillez répondre à : "${q.question_text}"`);
          rows.push({ survey_id: activeSurvey.id, question_id: q.id, option_id: answers[q.id] as string, user_id: user.id });
        } else {
          const opts = answers[q.id] as string[] | undefined;
          if (!opts?.length) throw new Error(`Veuillez répondre à : "${q.question_text}"`);
          for (const optId of opts) rows.push({ survey_id: activeSurvey.id, question_id: q.id, option_id: optId, user_id: user.id });
        }
      }
      const { error } = await supabase.from('survey_responses').insert(rows);
      if (error) throw error;
      return activeSurvey.id;
    },
    onSuccess: (surveyId) => afterVoteSuccess(surveyId),
    onError: (err: Error) => toast.error(err.message),
  });

  const externalSubmitMutation = useMutation({
    mutationFn: async () => {
      if (!activeSurvey) throw new Error('Aucun sondage sélectionné');
      if (!externalForm.first_name.trim() || !externalForm.last_name.trim()) throw new Error('Nom et prénom sont requis');
      if (!externalForm.email.trim() || !externalForm.code.trim()) throw new Error('Email professionnel et code sont requis');
      const payload = { survey_id: activeSurvey.id, first_name: externalForm.first_name.trim(), last_name: externalForm.last_name.trim(), email: externalForm.email.trim(), code: externalForm.code.trim(), answers: buildExternalAnswers() };
      const { data, error } = await supabase.functions.invoke('submit-external-survey-vote', { body: payload });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return activeSurvey.id;
    },
    onSuccess: (surveyId) => afterVoteSuccess(surveyId),
    onError: (err: Error) => toast.error(err.message),
  });

  const afterVoteSuccess = (surveyId: string) => {
    toast.success('Merci pour votre participation !');
    queryClient.invalidateQueries({ queryKey: ['voted-surveys'] });
    queryClient.invalidateQueries({ queryKey: ['survey-results', surveyId] });
    queryClient.invalidateQueries({ queryKey: ['survey-participants', surveyId] });
    setShowResults(surveyId); setActiveSurvey(null); setExternalForm(externalEmpty());
  };

  const openSurvey = (survey: Survey) => { setActiveSurvey(survey); setAnswers({}); setTextAnswers({}); setExternalForm(externalEmpty()); setVoteMode(survey.participation_mode === 'professional_email' ? 'external' : 'member'); };
  const isClosed = (s: Survey) => !!s.ends_at && new Date(s.ends_at) < new Date();
  const activeMode = (activeSurvey?.participation_mode || 'adherents_only') as ParticipationMode;
  const canUseMemberMode = activeMode === 'adherents_only' || activeMode === 'mixed';
  const canUseExternalMode = activeMode === 'professional_email' || activeMode === 'mixed';
  const domain = activeSurvey?.allowed_email_domain || DEFAULT_DOMAIN;

  const renderQuestions = () => questions.map((q, i) => (
    <Card key={q.id}><CardHeader className="pb-3"><CardTitle className="text-base flex items-start gap-2"><span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>{q.question_text}</CardTitle><CardDescription className="text-xs pl-8">{q.question_type === 'single_choice' ? 'Choix unique' : q.question_type === 'multiple_choice' ? 'Plusieurs choix possibles' : 'Réponse libre'}</CardDescription></CardHeader><CardContent className="pl-8">{q.question_type === 'single_choice' && <RadioGroup value={answers[q.id] as string || ''} onValueChange={(v) => setAnswers({ ...answers, [q.id]: v })}>{q.survey_options.sort((a, b) => a.display_order - b.display_order).map((o) => <div key={o.id} className="flex items-center space-x-2 py-1.5 rounded-lg px-2 hover:bg-muted/50 transition-colors"><RadioGroupItem value={o.id} id={o.id} /><Label htmlFor={o.id} className="cursor-pointer flex-1">{o.option_text}</Label></div>)}</RadioGroup>}{q.question_type === 'multiple_choice' && <div className="space-y-1">{q.survey_options.sort((a, b) => a.display_order - b.display_order).map((o) => <div key={o.id} className="flex items-center space-x-2 py-1.5 rounded-lg px-2 hover:bg-muted/50 transition-colors"><Checkbox id={o.id} checked={Array.isArray(answers[q.id]) ? (answers[q.id] as string[]).includes(o.id) : false} onCheckedChange={(checked) => { const current = (answers[q.id] as string[]) || []; setAnswers({ ...answers, [q.id]: checked ? [...current, o.id] : current.filter((id) => id !== o.id) }); }} /><Label htmlFor={o.id} className="cursor-pointer flex-1">{o.option_text}</Label></div>)}</div>}{q.question_type === 'text' && <Textarea value={textAnswers[q.id] || ''} onChange={(e) => setTextAnswers({ ...textAnswers, [q.id]: e.target.value })} placeholder="Votre réponse..." rows={3} />}</CardContent></Card>
  ));

  return <div className="p-4 lg:p-8"><main className="container mx-auto px-4 py-8 max-w-3xl"><div className="flex items-center gap-3 mb-6"><div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center"><ClipboardList className="w-6 h-6 text-primary" /></div><div><h1 className="text-2xl font-bold">Sondages</h1><p className="text-muted-foreground text-sm">Donnez votre avis sur les sujets qui comptent</p></div></div>

    {activeSurvey && <div className="space-y-4"><PageBreadcrumb steps={[{ label: 'Sondages', href: '/sondages' }, { label: activeSurvey.title }]} /><Button variant="ghost" size="sm" onClick={() => setActiveSurvey(null)} className="gap-1.5"><ChevronLeft className="w-4 h-4" /> Retour</Button><Card className="border-primary/20 bg-primary/5"><CardHeader className="pb-3"><CardTitle>{activeSurvey.title}</CardTitle>{activeSurvey.description && <CardDescription>{activeSurvey.description}</CardDescription>}<div className="flex flex-wrap gap-2 pt-1"><Badge variant="outline" className="text-xs">{modeLabel[activeMode]}</Badge>{activeSurvey.is_anonymous && <Badge variant="outline" className="text-xs">Anonyme</Badge>}{activeSurvey.ends_at && <Badge variant="outline" className="text-xs gap-1"><Clock className="w-3 h-3" />Clôture {format(new Date(activeSurvey.ends_at), 'dd MMM yyyy', { locale: fr })}</Badge>}</div></CardHeader></Card>

      {activeMode === 'mixed' && <div className="grid grid-cols-2 gap-2"><Button variant={voteMode === 'member' ? 'default' : 'outline'} onClick={() => setVoteMode('member')}>Je suis adhérent</Button><Button variant={voteMode === 'external' ? 'default' : 'outline'} onClick={() => setVoteMode('external')}>Email professionnel</Button></div>}

      {voteMode === 'external' && canUseExternalMode && <Card className="border-teal-200"><CardHeader><CardTitle className="text-base flex items-center gap-2"><Mail className="w-4 h-4" /> Vérification par email professionnel</CardTitle><CardDescription>Votre adresse email professionnelle est utilisée uniquement pour vérifier la pertinence du vote et vous envoyer un code de sécurité. Elle n’est pas conservée en clair dans notre base de données.</CardDescription></CardHeader><CardContent className="space-y-3"><div className="grid sm:grid-cols-2 gap-3"><div className="space-y-1.5"><Label>Prénom *</Label><Input value={externalForm.first_name} onChange={(e) => setExternalForm((f) => ({ ...f, first_name: e.target.value }))} /></div><div className="space-y-1.5"><Label>Nom *</Label><Input value={externalForm.last_name} onChange={(e) => setExternalForm((f) => ({ ...f, last_name: e.target.value }))} /></div></div><div className="space-y-1.5"><Label>Email professionnel *@{domain}</Label><div className="flex gap-2"><Input type="email" value={externalForm.email} onChange={(e) => setExternalForm((f) => ({ ...f, email: e.target.value, codeSent: false }))} placeholder={`prenom.nom@${domain}`} /><Button type="button" variant="outline" onClick={() => sendCodeMutation.mutate()} disabled={sendCodeMutation.isPending}>{sendCodeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Recevoir le code'}</Button></div></div>{externalForm.codeSent && <div className="space-y-1.5"><Label>Code reçu par email</Label><Input value={externalForm.code} onChange={(e) => setExternalForm((f) => ({ ...f, code: e.target.value }))} placeholder="123456" maxLength={6} /></div>}</CardContent></Card>}

      {voteMode === 'member' && canUseMemberMode && !user && <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700"><Lock className="w-4 h-4 flex-shrink-0" />Vous devez être connecté avec un profil adhérent actif pour voter en tant qu’adhérent.</div>}
      {voteMode === 'member' && canUseMemberMode && user && !profileLoading && !hasActiveProfile && <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700"><Lock className="w-4 h-4 flex-shrink-0" />Votre profil adhérent doit être actif pour participer.</div>}

      {questionsLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : <>{renderQuestions()}<div className="flex gap-3"><Button onClick={() => voteMode === 'external' ? externalSubmitMutation.mutate() : memberSubmitMutation.mutate()} disabled={memberSubmitMutation.isPending || externalSubmitMutation.isPending || (voteMode === 'member' && (!user || !hasActiveProfile)) || (voteMode === 'external' && !externalForm.codeSent)} className="flex-1">{memberSubmitMutation.isPending || externalSubmitMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Envoi en cours...</> : <><ShieldCheck className="w-4 h-4 mr-2" />Envoyer mes réponses</>}</Button></div></>}
    </div>}

    {!activeSurvey && showResults && <div className="space-y-4">{(() => { const survey = surveys.find((s) => s.id === showResults); return <><div className="flex items-center justify-between gap-3"><div>{survey && <PageBreadcrumb steps={[{ label: 'Sondages', href: '/sondages' }, { label: 'Résultats' }]} />}<h2 className="text-lg font-semibold mt-2">{survey?.title}</h2></div><Button variant="outline" size="sm" onClick={() => setShowResults(null)} className="gap-1.5"><ChevronLeft className="w-4 h-4" /> Retour</Button></div><div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"><CheckCircle2 className="w-4 h-4 flex-shrink-0" /><span>Votre réponse a été enregistrée. Voici les résultats en temps réel.</span></div><div className="flex items-center gap-2 text-sm text-muted-foreground"><Users className="w-4 h-4" /><span>{participantCount} participant{participantCount > 1 ? 's' : ''}</span><BarChart3 className="w-4 h-4 ml-2" /><span>Mise à jour toutes les 10s</span></div>{resultQuestions.map((q, i) => { const qResults = results.filter((r) => r.question_id === q.id); const totalVotes = qResults.reduce((sum, r) => sum + r.count, 0); return <Card key={q.id}><CardHeader className="pb-3"><CardTitle className="text-base flex items-start gap-2"><span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>{q.question_text}</CardTitle></CardHeader><CardContent className="pl-8 space-y-3">{q.question_type === 'text' ? <p className="text-sm text-muted-foreground italic">Les réponses libres sont confidentielles.</p> : q.survey_options.sort((a, b) => a.display_order - b.display_order).map((opt) => { const r = qResults.find((r) => r.option_id === opt.id); const count = r?.count ?? 0; const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0; return <div key={opt.id} className="space-y-1"><div className="flex items-center justify-between text-sm"><span className="font-medium">{opt.option_text}</span><span className="text-muted-foreground text-xs">{count} vote{count > 1 ? 's' : ''} · {pct}%</span></div><div className="h-2 w-full rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} /></div></div>; })}</CardContent></Card>; })}</>; })()}</div>}

    {!activeSurvey && !showResults && <>{isLoading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : surveys.length === 0 ? <Card><CardContent className="py-12 text-center"><ClipboardList className="w-10 h-10 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">Aucun sondage actif pour le moment.</p></CardContent></Card> : <div className="grid gap-4">{surveys.map((s) => { const hasVoted = votedSurveyIds.has(s.id); const closed = isClosed(s); const mode = (s.participation_mode || 'adherents_only') as ParticipationMode; const memberCanVote = !closed && (!hasVoted || s.allow_multiple_votes) && !!user && hasActiveProfile && (mode === 'adherents_only' || mode === 'mixed'); const externalCanVote = !closed && (mode === 'professional_email' || mode === 'mixed'); const canOpen = memberCanVote || externalCanVote; return <Card key={s.id} className="hover:shadow-md transition-shadow"><CardContent className="flex items-center justify-between py-5 gap-4"><div className="space-y-1.5 flex-1 min-w-0"><div className="flex items-center gap-2 flex-wrap"><h3 className="font-semibold text-foreground">{s.title}</h3>{hasVoted && <Badge variant="outline" className="text-green-600 border-green-300 text-xs gap-1"><CheckCircle2 className="w-3 h-3" /> Voté</Badge>}<Badge variant="outline" className="text-xs">{modeLabel[mode]}</Badge>{s.is_anonymous && <Badge variant="outline" className="text-xs">Anonyme</Badge>}{closed && <Badge variant="secondary" className="text-xs">Clôturé</Badge>}</div>{s.description && <p className="text-sm text-muted-foreground truncate">{s.description}</p>}{s.ends_at && !closed && <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />Clôture le {format(new Date(s.ends_at), 'dd MMM yyyy HH:mm', { locale: fr })}</p>}</div><div className="flex flex-col gap-2 flex-shrink-0">{canOpen && <Button size="sm" onClick={() => openSurvey(s)}>Participer</Button>}{(hasVoted || closed) && <Button size="sm" variant="outline" onClick={() => setShowResults(s.id)} className="gap-1.5"><BarChart3 className="w-3.5 h-3.5" /> Résultats</Button>}{!canOpen && !closed && <Button size="sm" variant="outline" disabled className="gap-1.5"><Lock className="w-3.5 h-3.5" /> Accès restreint</Button>}</div></CardContent></Card>; })}</div>}</>}
  </main></div>;
};

export default Sondages;
