import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ClipboardList, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type Survey = {
  id: string; title: string; description: string | null;
  is_anonymous: boolean; allow_multiple_votes: boolean;
  ends_at: string | null; created_at: string;
};
type Question = {
  id: string; question_text: string; question_type: string; display_order: number;
  survey_options: { id: string; option_text: string; display_order: number }[];
};

type SurveyResponseInsert = {
  survey_id: string;
  question_id: string;
  user_id: string;
  text_response?: string;
  option_id?: string;
};

const Sondages = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSurvey, setActiveSurvey] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [textAnswers, setTextAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [votedSurveys, setVotedSurveys] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchSurveys();
    fetchVoted();
  }, []);

  const fetchSurveys = async () => {
    const { data } = await supabase
      .from('surveys')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (data) setSurveys(data as Survey[]);
    setLoading(false);
  };

  const fetchVoted = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    const { data } = await supabase
      .from('survey_responses')
      .select('survey_id')
      .eq('user_id', user.user.id);
    if (data) setVotedSurveys(new Set(data.map(r => r.survey_id)));
  };

  const openSurvey = async (surveyId: string) => {
    setActiveSurvey(surveyId);
    setAnswers({});
    setTextAnswers({});
    const { data } = await supabase
      .from('survey_questions')
      .select('*, survey_options(*)')
      .eq('survey_id', surveyId)
      .order('display_order');
    if (data) setQuestions(data as Question[]);
  };

  const handleSingleChoice = (questionId: string, optionId: string) => {
    setAnswers({ ...answers, [questionId]: optionId });
  };

  const handleMultipleChoice = (questionId: string, optionId: string, checked: boolean) => {
    const current = (answers[questionId] as string[]) || [];
    setAnswers({
      ...answers,
      [questionId]: checked ? [...current, optionId] : current.filter(id => id !== optionId)
    });
  };

  const handleSubmit = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) { toast.error('Vous devez être connecté'); return; }

    // Validate
    for (const q of questions) {
      if (q.question_type === 'text') {
        if (!textAnswers[q.id]?.trim()) { toast.error(`Veuillez répondre à : "${q.question_text}"`); return; }
      } else {
        const a = answers[q.id];
        if (!a || (Array.isArray(a) && a.length === 0)) { toast.error(`Veuillez répondre à : "${q.question_text}"`); return; }
      }
    }

    setSubmitting(true);
    const responses: SurveyResponseInsert[] = [];

    for (const q of questions) {
      if (q.question_type === 'text') {
        responses.push({ survey_id: activeSurvey, question_id: q.id, text_response: textAnswers[q.id], user_id: user.user.id });
      } else if (q.question_type === 'single_choice') {
        responses.push({ survey_id: activeSurvey, question_id: q.id, option_id: answers[q.id] as string, user_id: user.user.id });
      } else {
        const answerValue = answers[q.id];
        if (Array.isArray(answerValue)) {
          for (const optId of answerValue) {
            responses.push({ survey_id: activeSurvey, question_id: q.id, option_id: optId, user_id: user.user.id });
          }
        }
      }
    }

    const { error } = await supabase.from('survey_responses').insert(responses);
    if (error) { toast.error('Erreur lors de l\'envoi'); }
    else {
      toast.success('Merci pour votre participation !');
      setVotedSurveys(new Set([...votedSurveys, activeSurvey!]));
      setActiveSurvey(null);
    }
    setSubmitting(false);
  };

  return (
    <div className="p-4 lg:p-8">
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <ClipboardList className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Sondages</h1>
            <p className="text-muted-foreground text-sm">Donnez votre avis sur les sujets qui comptent</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        ) : activeSurvey ? (
          <div className="space-y-4">
            <Button variant="ghost" onClick={() => setActiveSurvey(null)}>← Retour aux sondages</Button>
            {questions.map(q => (
              <Card key={q.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{q.question_text}</CardTitle>
                  <CardDescription>
                    {q.question_type === 'single_choice' ? 'Choix unique' : q.question_type === 'multiple_choice' ? 'Choix multiples' : 'Réponse libre'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {q.question_type === 'single_choice' && (
                    <RadioGroup value={answers[q.id] as string || ''} onValueChange={v => handleSingleChoice(q.id, v)}>
                      {q.survey_options.sort((a, b) => a.display_order - b.display_order).map(o => (
                        <div key={o.id} className="flex items-center space-x-2 py-1">
                          <RadioGroupItem value={o.id} id={o.id} />
                          <Label htmlFor={o.id} className="cursor-pointer">{o.option_text}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                  {q.question_type === 'multiple_choice' && (
                    <div className="space-y-2">
                      {q.survey_options.sort((a, b) => a.display_order - b.display_order).map(o => (
                        <div key={o.id} className="flex items-center space-x-2">
                          <Checkbox id={o.id}
                            checked={Array.isArray(answers[q.id]) ? answers[q.id].includes(o.id) : false}
                            onCheckedChange={checked => handleMultipleChoice(q.id, o.id, !!checked)} />
                          <Label htmlFor={o.id} className="cursor-pointer">{o.option_text}</Label>
                        </div>
                      ))}
                    </div>
                  )}
                  {q.question_type === 'text' && (
                    <Textarea value={textAnswers[q.id] || ''}
                      onChange={e => setTextAnswers({ ...textAnswers, [q.id]: e.target.value })}
                      placeholder="Votre réponse..." />
                  )}
                </CardContent>
              </Card>
            ))}
            <Button onClick={handleSubmit} disabled={submitting} className="w-full">
              {submitting ? 'Envoi en cours...' : 'Envoyer mes réponses'}
            </Button>
          </div>
        ) : surveys.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">Aucun sondage actif pour le moment.</CardContent></Card>
        ) : (
          <div className="grid gap-4">
            {surveys.map(s => {
              const hasVoted = votedSurveys.has(s.id);
              const canVote = !hasVoted || s.allow_multiple_votes;
              return (
                <Card key={s.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{s.title}</h3>
                        {hasVoted && <Badge variant="outline" className="text-green-600 border-green-300"><CheckCircle2 className="w-3 h-3 mr-1" /> Voté</Badge>}
                        {s.is_anonymous && <Badge variant="outline">Anonyme</Badge>}
                      </div>
                      {s.description && <p className="text-sm text-muted-foreground">{s.description}</p>}
                      {s.ends_at && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Fin le {format(new Date(s.ends_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                        </p>
                      )}
                    </div>
                    <Button onClick={() => openSurvey(s.id)} disabled={!canVote} variant={canVote ? 'default' : 'secondary'}>
                      {canVote ? 'Participer' : 'Déjà voté'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Sondages;
