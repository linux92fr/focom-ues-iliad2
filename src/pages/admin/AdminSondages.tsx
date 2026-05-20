import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ClipboardList, Plus, Trash2, Eye, EyeOff, X, Save,
  ChevronDown, ChevronUp, GripVertical, BarChart3, Users, Loader2,
} from "lucide-react";
import AdminLayout, { AdminAuthGuard } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type ParticipationMode = "adherents_only" | "professional_email" | "mixed";

type Survey = {
  id: string; title: string; description: string | null;
  is_active: boolean; is_anonymous: boolean; allow_multiple_votes: boolean;
  starts_at: string | null; ends_at: string | null;
  participation_mode?: ParticipationMode | null;
  allowed_email_domain?: string | null;
  created_at: string; updated_at: string;
};

type SurveyOption = { id?: string; option_text: string; display_order: number };

type QuestionDraft = {
  id?: string;
  question_text: string;
  question_type: "single_choice" | "multiple_choice" | "text";
  display_order: number;
  options: SurveyOption[];
};

type SurveyFormData = {
  title: string;
  description: string;
  is_anonymous: boolean;
  allow_multiple_votes: boolean;
  participation_mode: ParticipationMode;
  allowed_email_domain: string;
  ends_at: string;
  questions: QuestionDraft[];
};

const participationModeLabels: Record<ParticipationMode, string> = {
  adherents_only: "Adhérents actifs uniquement",
  professional_email: "Email professionnel vérifié",
  mixed: "Adhérents ou email professionnel",
};

const emptyQuestion = (order: number): QuestionDraft => ({
  question_text: "",
  question_type: "single_choice",
  display_order: order,
  options: [
    { option_text: "", display_order: 0 },
    { option_text: "", display_order: 1 },
  ],
});

const emptyForm = (): SurveyFormData => ({
  title: "",
  description: "",
  is_anonymous: false,
  allow_multiple_votes: false,
  participation_mode: "adherents_only",
  allowed_email_domain: "iliad-free.fr",
  ends_at: "",
  questions: [emptyQuestion(0)],
});

const fmtDate = (iso: string | null) => iso ? format(new Date(iso), "dd MMM yyyy", { locale: fr }) : "—";
const cleanDomain = (value: string) => value.trim().replace(/^@/, "").toLowerCase();

export default function AdminSondages() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<SurveyFormData>(emptyForm());
  const [resultsId, setResultsId] = useState<string | null>(null);

  const { data: surveys = [], isLoading } = useQuery({
    queryKey: ["admin-surveys"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("surveys")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Survey[];
    },
  });

  const { data: resultsData } = useQuery({
    queryKey: ["admin-survey-results", resultsId],
    enabled: !!resultsId,
    queryFn: async () => {
      const [{ data: questions }, { data: responses }, { data: externalParticipants }] = await Promise.all([
        supabase
          .from("survey_questions")
          .select("*, survey_options(*)")
          .eq("survey_id", resultsId!)
          .order("display_order"),
        supabase
          .from("survey_responses")
          .select("question_id, option_id, user_id, external_participant_id")
          .eq("survey_id", resultsId!),
        supabase
          .from("survey_external_participants")
          .select("id")
          .eq("survey_id", resultsId!),
      ]);
      const memberParticipants = new Set((responses ?? []).filter((r: any) => r.user_id).map((r: any) => r.user_id)).size;
      const externalCount = externalParticipants?.length ?? 0;
      return { questions: questions ?? [], responses: responses ?? [], participantCount: memberParticipants + externalCount };
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("surveys").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-surveys"] });
      queryClient.invalidateQueries({ queryKey: ["surveys-public"] });
      toast.success("Sondage mis à jour");
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("surveys").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-surveys"] });
      queryClient.invalidateQueries({ queryKey: ["surveys-public"] });
      if (resultsId) setResultsId(null);
      toast.success("Sondage supprimé");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!form.title.trim()) throw new Error("Le titre est requis");
      if ((form.participation_mode === "professional_email" || form.participation_mode === "mixed") && !cleanDomain(form.allowed_email_domain)) {
        throw new Error("Le domaine professionnel autorisé est requis");
      }

      for (const q of form.questions) {
        if (!q.question_text.trim()) throw new Error("Toutes les questions doivent avoir un texte");
        if (q.question_type !== "text") {
          const filledOpts = q.options.filter((o) => o.option_text.trim());
          if (filledOpts.length < 2) throw new Error("Chaque question à choix doit avoir au moins 2 options");
        }
      }

      const surveyPayload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        is_anonymous: form.is_anonymous,
        allow_multiple_votes: form.allow_multiple_votes,
        participation_mode: form.participation_mode,
        allowed_email_domain: cleanDomain(form.allowed_email_domain) || "iliad-free.fr",
        ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
      };

      let surveyId = editId;

      if (editId) {
        const { error } = await supabase.from("surveys").update(surveyPayload as never).eq("id", editId);
        if (error) throw error;
        await supabase.from("survey_questions").delete().eq("survey_id", editId);
      } else {
        const { data, error } = await supabase.from("surveys").insert({ ...surveyPayload, is_active: true } as never).select("id").single();
        if (error) throw error;
        surveyId = data.id;
      }

      for (const [qi, q] of form.questions.entries()) {
        const { data: qData, error: qErr } = await supabase
          .from("survey_questions")
          .insert({ survey_id: surveyId, question_text: q.question_text.trim(), question_type: q.question_type, display_order: qi })
          .select("id")
          .single();
        if (qErr) throw qErr;

        if (q.question_type !== "text") {
          const opts = q.options
            .filter((o) => o.option_text.trim())
            .map((o, oi) => ({ question_id: qData.id, option_text: o.option_text.trim(), display_order: oi }));
          if (opts.length) {
            const { error: oErr } = await supabase.from("survey_options").insert(opts);
            if (oErr) throw oErr;
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-surveys"] });
      queryClient.invalidateQueries({ queryKey: ["surveys-public"] });
      toast.success(editId ? "Sondage mis à jour" : "Sondage créé");
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm());
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleDelete = (id: string, title: string) => {
    if (!window.confirm(`Supprimer "${title}" et toutes ses réponses ?`)) return;
    deleteMutation.mutate(id);
  };

  const openEdit = async (survey: Survey) => {
    const { data: questions } = await supabase
      .from("survey_questions")
      .select("*, survey_options(*)")
      .eq("survey_id", survey.id)
      .order("display_order");

    setForm({
      title: survey.title,
      description: survey.description ?? "",
      is_anonymous: survey.is_anonymous,
      allow_multiple_votes: survey.allow_multiple_votes,
      participation_mode: survey.participation_mode || "adherents_only",
      allowed_email_domain: survey.allowed_email_domain || "iliad-free.fr",
      ends_at: survey.ends_at ? survey.ends_at.slice(0, 16) : "",
      questions: (questions ?? []).map((q) => ({
        id: q.id,
        question_text: q.question_text,
        question_type: q.question_type as QuestionDraft["question_type"],
        display_order: q.display_order,
        options: (q.survey_options ?? []).sort((a, b) => a.display_order - b.display_order),
      })),
    });
    setEditId(survey.id);
    setShowForm(true);
  };

  const setQ = (i: number, patch: Partial<QuestionDraft>) =>
    setForm((f) => { const qs = [...f.questions]; qs[i] = { ...qs[i], ...patch }; return { ...f, questions: qs }; });

  const setOpt = (qi: number, oi: number, text: string) =>
    setForm((f) => {
      const qs = [...f.questions];
      const opts = [...qs[qi].options];
      opts[oi] = { ...opts[oi], option_text: text };
      qs[qi] = { ...qs[qi], options: opts };
      return { ...f, questions: qs };
    });

  const addOption = (qi: number) =>
    setForm((f) => {
      const qs = [...f.questions];
      qs[qi] = { ...qs[qi], options: [...qs[qi].options, { option_text: "", display_order: qs[qi].options.length }] };
      return { ...f, questions: qs };
    });

  const removeOption = (qi: number, oi: number) =>
    setForm((f) => {
      const qs = [...f.questions];
      const opts = qs[qi].options.filter((_, i) => i !== oi);
      qs[qi] = { ...qs[qi], options: opts };
      return { ...f, questions: qs };
    });

  const addQuestion = () => setForm((f) => ({ ...f, questions: [...f.questions, emptyQuestion(f.questions.length)] }));
  const removeQuestion = (i: number) => setForm((f) => ({ ...f, questions: f.questions.filter((_, j) => j !== i) }));
  const moveQuestion = (i: number, dir: -1 | 1) =>
    setForm((f) => {
      const qs = [...f.questions];
      const j = i + dir;
      if (j < 0 || j >= qs.length) return f;
      [qs[i], qs[j]] = [qs[j], qs[i]];
      return { ...f, questions: qs };
    });

  return (
    <AdminAuthGuard>
      <AdminLayout title="Sondages" breadcrumb={["Administration", "Sondages"]}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Sondages</h2>
              <p className="text-sm text-slate-500">{surveys.length} sondage{surveys.length > 1 ? 's' : ''}</p>
            </div>
          </div>
          <Button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm()); setResultsId(null); }} className="bg-red-600 hover:bg-red-700 text-white gap-2">
            <Plus className="w-4 h-4" /> Nouveau sondage
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6 border-primary/20">
            <CardHeader className="pb-3 flex-row items-center justify-between">
              <CardTitle className="text-base">{editId ? "Modifier le sondage" : "Nouveau sondage"}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setEditId(null); }}><X className="w-4 h-4" /></Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2 space-y-1.5">
                  <Label>Titre *</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: Satisfaction accord télétravail 2026" />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Contexte ou instructions optionnelles..." rows={2} />
                </div>
                <div className="space-y-1.5">
                  <Label>Date de clôture</Label>
                  <Input type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between"><Label className="cursor-pointer">Réponses anonymes</Label><Switch checked={form.is_anonymous} onCheckedChange={(v) => setForm({ ...form, is_anonymous: v })} /></div>
                  <div className="flex items-center justify-between"><Label className="cursor-pointer">Votes multiples autorisés</Label><Switch checked={form.allow_multiple_votes} onCheckedChange={(v) => setForm({ ...form, allow_multiple_votes: v })} /></div>
                </div>

                <div className="md:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
                  <div className="space-y-1.5">
                    <Label>Mode de participation</Label>
                    <Select value={form.participation_mode} onValueChange={(v) => setForm({ ...form, participation_mode: v as ParticipationMode })}>
                      <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="adherents_only">Adhérents actifs uniquement</SelectItem>
                        <SelectItem value="professional_email">Email professionnel vérifié uniquement</SelectItem>
                        <SelectItem value="mixed">Adhérents actifs ou email professionnel vérifié</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(form.participation_mode === "professional_email" || form.participation_mode === "mixed") && (
                    <div className="space-y-1.5">
                      <Label>Domaine professionnel autorisé</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">@</span>
                        <Input value={form.allowed_email_domain} onChange={(e) => setForm({ ...form, allowed_email_domain: cleanDomain(e.target.value) })} placeholder="iliad-free.fr" className="bg-white" />
                      </div>
                      <p className="text-xs text-slate-500">L’email sert uniquement à envoyer un code de vérification. Il n’est pas conservé en clair dans la base.</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Questions ({form.questions.length})</h3>
                  <Button variant="outline" size="sm" onClick={addQuestion} className="gap-1.5"><Plus className="w-3.5 h-3.5" /> Ajouter</Button>
                </div>

                {form.questions.map((q, qi) => (
                  <div key={qi} className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/50">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-slate-300 flex-shrink-0" />
                      <span className="text-xs font-bold text-slate-400 flex-shrink-0">Q{qi + 1}</span>
                      <Input value={q.question_text} onChange={(e) => setQ(qi, { question_text: e.target.value })} placeholder="Texte de la question..." className="flex-1 bg-white" />
                      <Select value={q.question_type} onValueChange={(v) => setQ(qi, { question_type: v as QuestionDraft["question_type"] })}>
                        <SelectTrigger className="w-44 bg-white"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single_choice">Choix unique</SelectItem>
                          <SelectItem value="multiple_choice">Choix multiples</SelectItem>
                          <SelectItem value="text">Réponse libre</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => moveQuestion(qi, -1)} disabled={qi === 0} className="px-1.5"><ChevronUp className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => moveQuestion(qi, 1)} disabled={qi === form.questions.length - 1} className="px-1.5"><ChevronDown className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => removeQuestion(qi)} className="px-1.5 text-red-400 hover:text-red-600" disabled={form.questions.length === 1}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </div>

                    {q.question_type !== "text" && (
                      <div className="pl-8 space-y-2">
                        {q.options.map((opt, oi) => (
                          <div key={oi} className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full border-2 border-slate-300 flex-shrink-0" />
                            <Input value={opt.option_text} onChange={(e) => setOpt(qi, oi, e.target.value)} placeholder={`Option ${oi + 1}...`} className="bg-white" />
                            <Button variant="ghost" size="sm" onClick={() => removeOption(qi, oi)} className="px-1.5 text-slate-400 hover:text-red-500" disabled={q.options.length <= 2}><X className="w-3.5 h-3.5" /></Button>
                          </div>
                        ))}
                        <Button variant="ghost" size="sm" onClick={() => addOption(qi)} className="gap-1.5 text-xs text-slate-500"><Plus className="w-3 h-3" /> Ajouter une option</Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => { setShowForm(false); setEditId(null); }}>Annuler</Button>
                <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="bg-red-600 hover:bg-red-700 text-white gap-2">
                  {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editId ? "Enregistrer" : "Publier le sondage"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {resultsId && resultsData && (
          <Card className="mb-6 border-blue-200 bg-blue-50/30">
            <CardHeader className="pb-3 flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2"><BarChart3 className="w-4 h-4 text-blue-600" />Résultats — {surveys.find((s) => s.id === resultsId)?.title}</CardTitle>
              <div className="flex items-center gap-3"><span className="text-xs text-slate-500 flex items-center gap-1"><Users className="w-3.5 h-3.5" />{resultsData.participantCount} participant{resultsData.participantCount > 1 ? 's' : ''}</span><Button variant="ghost" size="sm" onClick={() => setResultsId(null)}><X className="w-4 h-4" /></Button></div>
            </CardHeader>
            <CardContent className="space-y-5">
              {resultsData.questions.map((q: any, i: number) => {
                const qResponses = resultsData.responses.filter((r: any) => r.question_id === q.id);
                const total = qResponses.length;
                return <div key={q.id}><p className="text-sm font-semibold mb-2 text-slate-700">Q{i + 1}. {q.question_text}</p>{q.question_type === "text" ? <p className="text-xs text-slate-400 italic">Réponses libres — confidentielles</p> : <div className="space-y-2">{(q.survey_options ?? []).sort((a: any, b: any) => a.display_order - b.display_order).map((opt: any) => { const count = qResponses.filter((r: any) => r.option_id === opt.id).length; const pct = total > 0 ? Math.round((count / total) * 100) : 0; return <div key={opt.id} className="space-y-1"><div className="flex justify-between text-xs"><span>{opt.option_text}</span><span className="text-slate-500">{count} · {pct}%</span></div><div className="h-2 rounded-full bg-slate-200 overflow-hidden"><div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} /></div></div>; })}<p className="text-xs text-slate-400">{total} réponse{total > 1 ? 's' : ''}</p></div>}</div>;
              })}
            </CardContent>
          </Card>
        )}

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-0">
            {isLoading ? <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-red-600" /></div> : surveys.length === 0 ? <div className="text-center py-12"><ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-500">Aucun sondage créé</p></div> : (
              <div className="overflow-x-auto"><table className="w-full"><thead className="bg-slate-50 border-b border-slate-200"><tr>{["Sondage", "Participation", "Statut", "Clôture", "Actions"].map((h, i) => <th key={h} className={`p-4 text-sm font-semibold text-slate-600 ${i === 4 ? "text-right" : "text-left"}`}>{h}</th>)}</tr></thead><tbody>{surveys.map((s) => { const closed = !!s.ends_at && new Date(s.ends_at) < new Date(); const mode = s.participation_mode || "adherents_only"; return <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors"><td className="p-4"><p className="font-medium text-slate-900 text-sm">{s.title}</p>{s.description && <p className="text-xs text-slate-400 truncate max-w-xs">{s.description}</p>}<div className="flex gap-1.5 mt-1">{s.is_anonymous && <Badge className="text-[10px] px-1.5 py-0" variant="outline">Anonyme</Badge>}{s.allow_multiple_votes && <Badge className="text-[10px] px-1.5 py-0" variant="outline">Multi-votes</Badge>}</div></td><td className="p-4"><Badge variant="outline" className="text-xs">{participationModeLabels[mode]}</Badge>{mode !== "adherents_only" && <p className="text-[10px] text-slate-400 mt-1">@{s.allowed_email_domain || "iliad-free.fr"}</p>}</td><td className="p-4">{closed ? <Badge variant="secondary" className="text-xs">Clôturé</Badge> : s.is_active ? <Badge className="bg-green-100 text-green-700 text-xs">Actif</Badge> : <Badge variant="secondary" className="text-xs">Inactif</Badge>}</td><td className="p-4 text-sm text-slate-500">{fmtDate(s.ends_at)}</td><td className="p-4"><div className="flex items-center justify-end gap-1"><Button variant="ghost" size="sm" title="Voir résultats" onClick={() => { setResultsId(s.id); setShowForm(false); }}><BarChart3 className="w-4 h-4 text-blue-500" /></Button><Button variant="ghost" size="sm" title={s.is_active ? "Désactiver" : "Activer"} onClick={() => toggleMutation.mutate({ id: s.id, is_active: !s.is_active })} disabled={closed}>{s.is_active ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-green-500" />}</Button><Button variant="ghost" size="sm" title="Modifier" onClick={() => openEdit(s)}><ClipboardList className="w-4 h-4 text-slate-400 hover:text-blue-600" /></Button><Button variant="ghost" size="sm" title="Supprimer" onClick={() => handleDelete(s.id, s.title)}><Trash2 className="w-4 h-4 text-slate-400 hover:text-red-600" /></Button></div></td></tr>; })}</tbody></table></div>
            )}
          </CardContent>
        </Card>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
