import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Mail, Users, Send, Trash2, Plus, Eye, X, Loader2,
  CheckCircle2, AlertCircle, Clock, BarChart3,
} from "lucide-react";
import AdminLayout, { AdminAuthGuard } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type Subscriber = {
  id: string; email: string; is_active: boolean;
  subscribed_at: string; unsubscribed_at: string | null;
};

type Newsletter = {
  id: string; title: string; subject: string;
  body_html: string; body_text: string | null;
  created_at: string; updated_at: string;
};

type NewsletterSend = {
  id: string; newsletter_id: string; sent_at: string;
  status: string; total_recipients: number | null;
  successful_sends: number | null; failed_sends: number | null;
  newsletters: { title: string; subject: string } | null;
};

type NlForm = { title: string; subject: string; body_html: string };
type SendMode = "all" | "selected";

const emptyForm = (): NlForm => ({ title: "", subject: "", body_html: "" });

const fmtDate = (iso: string) =>
  format(new Date(iso), "dd MMM yyyy à HH:mm", { locale: fr });

const getErrorMessage = (err: unknown) => {
  if (!err) return "Erreur inconnue";
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  if (typeof err === "object" && "message" in err && typeof (err as { message?: unknown }).message === "string") {
    return (err as { message: string }).message;
  }
  return "Erreur inconnue";
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    completed: { label: "Envoyée", className: "bg-green-100 text-green-700" },
    partial:   { label: "Partielle", className: "bg-amber-100 text-amber-700" },
    sending:   { label: "En cours", className: "bg-blue-100 text-blue-700" },
    failed:    { label: "Échec", className: "bg-red-100 text-red-700" },
  };
  const s = map[status] ?? { label: status, className: "bg-slate-100 text-slate-700" };
  return <Badge className={`text-xs ${s.className}`}>{s.label}</Badge>;
}

export default function AdminNewsletter() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<NlForm>(emptyForm());
  const [showPreview, setShowPreview] = useState(false);
  const [search, setSearch] = useState("");
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sendMode, setSendMode] = useState<SendMode>("selected");
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);

  const { data: subscribers = [], isLoading: subsLoading } = useQuery({
    queryKey: ["admin-subscribers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .order("subscribed_at", { ascending: false });
      if (error) throw error;
      return data as Subscriber[];
    },
  });

  const activeSubscribers = useMemo(() => subscribers.filter((s) => s.is_active), [subscribers]);
  const activeCount = activeSubscribers.length;

  const selectedActiveEmails = useMemo(
    () => selectedEmails.filter((email) => activeSubscribers.some((s) => s.email === email)),
    [selectedEmails, activeSubscribers]
  );

  const sendTargetCount = sendMode === "all" ? activeCount : selectedActiveEmails.length;

  const toggleEmail = (email: string) => {
    setSelectedEmails((prev) => prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]);
  };

  const selectFilteredActive = () => {
    const emails = filteredSubs.filter((s) => s.is_active).map((s) => s.email);
    setSelectedEmails((prev) => Array.from(new Set([...prev, ...emails])));
  };

  const clearSelected = () => setSelectedEmails([]);

  const toggleSubMutation = useMutation({
    mutationFn: async (subscriber: Subscriber) => {
      const nextActive = !subscriber.is_active;
      const { error } = await supabase
        .from("newsletter_subscribers")
        .update({
          is_active: nextActive,
          unsubscribed_at: nextActive ? null : new Date().toISOString(),
        })
        .eq("id", subscriber.id);
      if (error) throw error;
      return { email: subscriber.email, nextActive };
    },
    onSuccess: ({ email, nextActive }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-subscribers"] });
      if (!nextActive) {
        setSelectedEmails((prev) => prev.filter((e) => e !== email));
      }
      toast.success(nextActive ? "Abonné réactivé" : "Abonné désactivé");
    },
    onError: () => toast.error("Erreur lors de la mise à jour de l'abonné"),
  });

  const deleteSubMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("newsletter_subscribers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subscribers"] });
      toast.success("Abonné supprimé");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const filteredSubs = subscribers.filter((s) =>
    s.email.toLowerCase().includes(search.toLowerCase()),
  );

  const { data: newsletters = [], isLoading: nlLoading } = useQuery({
    queryKey: ["admin-newsletters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("newsletters")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Newsletter[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!form.title.trim()) throw new Error("Le titre est requis");
      if (!form.subject.trim()) throw new Error("Le sujet est requis");
      if (!form.body_html.trim()) throw new Error("Le contenu est requis");
      if (editId) {
        const { error } = await supabase
          .from("newsletters")
          .update({ title: form.title, subject: form.subject, body_html: form.body_html })
          .eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("newsletters")
          .insert({ title: form.title, subject: form.subject, body_html: form.body_html });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-newsletters"] });
      toast.success(editId ? "Newsletter mise à jour" : "Newsletter créée");
      setShowForm(false); setEditId(null); setForm(emptyForm()); setShowPreview(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteNlMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("newsletters").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-newsletters"] });
      queryClient.invalidateQueries({ queryKey: ["admin-sends"] });
      toast.success("Newsletter supprimée");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const sendMutation = useMutation({
    mutationFn: async (newsletterId: string) => {
      if (sendMode === "selected" && selectedActiveEmails.length === 0) {
        throw new Error("Sélectionnez au moins un destinataire actif");
      }

      setSendingId(newsletterId);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Non connecté");

      const body = sendMode === "all"
        ? { newsletterId }
        : { newsletterId, recipientEmails: selectedActiveEmails };

      const { data, error } = await supabase.functions.invoke("send-newsletter", {
        body,
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) {
        const context = (error as { context?: Response }).context;
        if (context?.json) {
          try {
            const details = await context.json();
            throw new Error(details?.error || details?.message || error.message);
          } catch {
            throw new Error(error.message);
          }
        }
        throw error;
      }

      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-sends"] });
      toast.success(`Newsletter envoyée à ${data.successfulSends}/${data.totalRecipients} abonnés`);
    },
    onError: (err: unknown) => {
      const message = getErrorMessage(err);
      toast.error(`Envoi impossible : ${message}`);
    },
    onSettled: () => setSendingId(null),
  });

  const openEdit = (nl: Newsletter) => {
    setForm({ title: nl.title, subject: nl.subject, body_html: nl.body_html });
    setEditId(nl.id); setShowForm(true); setShowPreview(false);
  };

  const confirmSend = (nl: Newsletter) => {
    const label = sendMode === "all"
      ? `${activeCount} abonné${activeCount > 1 ? "s" : ""} actif${activeCount > 1 ? "s" : ""}`
      : `${selectedActiveEmails.length} destinataire${selectedActiveEmails.length > 1 ? "s" : ""} sélectionné${selectedActiveEmails.length > 1 ? "s" : ""}`;
    if (!window.confirm(`Envoyer "${nl.subject}" à ${label} ?`)) return;
    sendMutation.mutate(nl.id);
  };

  const { data: sends = [], isLoading: sendsLoading } = useQuery({
    queryKey: ["admin-sends"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("newsletter_sends")
        .select("*, newsletters(title, subject)")
        .order("sent_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as NewsletterSend[];
    },
  });

  return (
    <AdminAuthGuard>
      <AdminLayout title="Newsletter" breadcrumb={["Administration", "Newsletter"]}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Abonnés actifs", value: activeCount, icon: Users, color: "text-green-600" },
            { label: "Sélectionnés", value: selectedActiveEmails.length, icon: CheckCircle2, color: "text-teal-600" },
            { label: "Newsletters créées", value: newsletters.length, icon: Eye, color: "text-purple-600" },
            { label: "Envois réalisés", value: sends.length, icon: Send, color: "text-red-600" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="border-slate-200 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{value}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="abonnes">
          <TabsList className="mb-6">
            <TabsTrigger value="abonnes">Abonnés ({activeCount})</TabsTrigger>
            <TabsTrigger value="composer">Newsletters ({newsletters.length})</TabsTrigger>
            <TabsTrigger value="historique">Historique ({sends.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="abonnes">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <CardTitle className="text-base">Liste des abonnés</CardTitle>
                    <p className="text-xs text-slate-500 mt-1">
                      Sélectionnez certains abonnés pour envoyer une newsletter par petits groupes.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input placeholder="Rechercher un email..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full sm:w-64 h-8 text-sm" />
                    <Button variant="outline" size="sm" onClick={selectFilteredActive}>Sélectionner visibles</Button>
                    <Button variant="ghost" size="sm" onClick={clearSelected}>Vider</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {subsLoading ? (
                  <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-red-600" /></div>
                ) : filteredSubs.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-sm">{search ? "Aucun résultat" : "Aucun abonné"}</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="p-3 text-xs font-semibold text-slate-600 text-left w-12">Sel.</th>
                          {[
                            "Email", "Statut", "Abonné le", "Actions"
                          ].map((h, i) => (<th key={i} className={`p-3 text-xs font-semibold text-slate-600 ${i === 3 ? "text-right" : "text-left"}`}>{h}</th>))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSubs.map((s) => {
                          const checked = selectedEmails.includes(s.email);
                          return (
                            <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                              <td className="p-3">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  disabled={!s.is_active}
                                  onChange={() => toggleEmail(s.email)}
                                  className="h-4 w-4 rounded border-slate-300"
                                  aria-label={`Sélectionner ${s.email}`}
                                />
                              </td>
                              <td className="p-3 text-sm font-medium text-slate-900">{s.email}</td>
                              <td className="p-3">{s.is_active ? <Badge className="bg-green-100 text-green-700 text-xs">Actif</Badge> : <Badge variant="secondary" className="text-xs">Désabonné</Badge>}</td>
                              <td className="p-3 text-xs text-slate-500">{fmtDate(s.subscribed_at)}</td>
                              <td className="p-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toggleSubMutation.mutate(s)}
                                    disabled={toggleSubMutation.isPending}
                                    className="text-xs"
                                  >
                                    {s.is_active ? "Désactiver" : "Réactiver"}
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => { if (window.confirm(`Supprimer ${s.email} ?`)) deleteSubMutation.mutate(s.id); }}><Trash2 className="w-4 h-4 text-slate-400 hover:text-red-600" /></Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="composer">
            <Card className="mb-6 border-teal-100 bg-teal-50/50">
              <CardContent className="p-4 space-y-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-bold text-teal-900">Destinataires de l'envoi</p>
                    <p className="text-xs text-teal-800 mt-1">
                      Mode actuel : {sendMode === "all" ? "tous les abonnés actifs" : "sélection personnalisée"} — {sendTargetCount} destinataire{sendTargetCount > 1 ? "s" : ""}.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant={sendMode === "selected" ? "default" : "outline"} size="sm" onClick={() => setSendMode("selected")} className={sendMode === "selected" ? "bg-teal-600 hover:bg-teal-700 text-white" : ""}>
                      Sélection personnalisée
                    </Button>
                    <Button variant={sendMode === "all" ? "default" : "outline"} size="sm" onClick={() => setSendMode("all")} className={sendMode === "all" ? "bg-red-600 hover:bg-red-700 text-white" : ""}>
                      Tous les actifs
                    </Button>
                  </div>
                </div>
                {sendMode === "selected" && selectedActiveEmails.length === 0 && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                    Aucun destinataire sélectionné. Va dans l'onglet Abonnés pour cocher les destinataires avant l'envoi.
                  </p>
                )}
              </CardContent>
            </Card>

            {showForm && (
              <Card className="mb-6 border-primary/20">
                <CardHeader className="pb-3 flex-row items-center justify-between">
                  <CardTitle className="text-base">{editId ? "Modifier" : "Nouvelle newsletter"}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setEditId(null); setShowPreview(false); }}><X className="w-4 h-4" /></Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Titre interne *</Label>
                      <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: Newsletter mai 2026" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Sujet de l'email *</Label>
                      <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Ex: Actualités FOCOM — Mai 2026" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label>Contenu HTML *</Label>
                      <Button variant="outline" size="sm" onClick={() => setShowPreview((v) => !v)} className="gap-1.5 text-xs h-7">
                        <Eye className="w-3.5 h-3.5" />{showPreview ? "Masquer" : "Aperçu"}
                      </Button>
                    </div>
                    <div className={showPreview ? "grid grid-cols-2 gap-4" : ""}>
                      <Textarea value={form.body_html} onChange={(e) => setForm({ ...form, body_html: e.target.value })} placeholder="<p>Bonjour,</p><p>Voici les dernières nouvelles...</p>" rows={12} className="font-mono text-sm" />
                      {showPreview && (
                        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                          <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 text-xs text-slate-500 font-medium">Aperçu du contenu</div>
                          <div className="p-4 prose prose-sm max-w-none text-slate-700" dangerouslySetInnerHTML={{ __html: form.body_html }} />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">Le contenu sera encadré automatiquement dans le template email FOCOM (en-tête rouge, pied de page avec lien de désabonnement).</p>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => { setShowForm(false); setEditId(null); setShowPreview(false); }}>Annuler</Button>
                    <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="bg-red-600 hover:bg-red-700 text-white gap-2">
                      {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      {editId ? "Enregistrer" : "Créer la newsletter"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            <div className="flex justify-end mb-4">
              <Button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm()); }} className="bg-red-600 hover:bg-red-700 text-white gap-2">
                <Plus className="w-4 h-4" /> Nouvelle newsletter
              </Button>
            </div>
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-0">
                {nlLoading ? (
                  <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-red-600" /></div>
                ) : newsletters.length === 0 ? (
                  <div className="text-center py-10"><Mail className="w-10 h-10 text-slate-300 mx-auto mb-3" /><p className="text-slate-400 text-sm">Aucune newsletter créée</p></div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {newsletters.map((nl) => {
                      const isSending = sendingId === nl.id;
                      return (
                        <div key={nl.id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors">
                          <div className="flex-1 min-w-0 mr-4">
                            <p className="font-medium text-slate-900 text-sm truncate">{nl.title}</p>
                            <p className="text-xs text-slate-500 truncate mt-0.5">{nl.subject}</p>
                            <p className="text-[10px] text-slate-400 mt-1">Modifiée {fmtDate(nl.updated_at)}</p>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <Button variant="outline" size="sm" onClick={() => confirmSend(nl)} disabled={isSending || sendTargetCount === 0} className="gap-1.5 text-xs" title={sendTargetCount === 0 ? "Aucun destinataire" : `Envoyer à ${sendTargetCount} destinataires`}>
                              {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                              {isSending ? "Envoi…" : `Envoyer (${sendTargetCount})`}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openEdit(nl)}><Eye className="w-4 h-4 text-slate-400" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => { if (window.confirm(`Supprimer "${nl.title}" ?`)) deleteNlMutation.mutate(nl.id); }}><Trash2 className="w-4 h-4 text-slate-400 hover:text-red-600" /></Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historique">
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-0">
                {sendsLoading ? (
                  <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-red-600" /></div>
                ) : sends.length === 0 ? (
                  <div className="text-center py-10"><BarChart3 className="w-10 h-10 text-slate-300 mx-auto mb-3" /><p className="text-slate-400 text-sm">Aucun envoi réalisé</p></div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>{["Newsletter", "Envoyée le", "Destinataires", "Réussis", "Échecs", "Statut"].map((h, i) => (<th key={i} className="p-3 text-xs font-semibold text-slate-600 text-left">{h}</th>))}</tr>
                      </thead>
                      <tbody>
                        {sends.map((s) => (
                          <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="p-3"><p className="text-sm font-medium text-slate-900">{s.newsletters?.title ?? "—"}</p><p className="text-xs text-slate-400 truncate max-w-xs">{s.newsletters?.subject}</p></td>
                            <td className="p-3 text-xs text-slate-500 whitespace-nowrap"><div className="flex items-center gap-1"><Clock className="w-3 h-3" />{fmtDate(s.sent_at)}</div></td>
                            <td className="p-3 text-sm text-slate-700">{s.total_recipients ?? "—"}</td>
                            <td className="p-3">{s.successful_sends != null && (<span className="flex items-center gap-1 text-sm text-green-600"><CheckCircle2 className="w-3.5 h-3.5" />{s.successful_sends}</span>)}</td>
                            <td className="p-3">{s.failed_sends != null && s.failed_sends > 0 && (<span className="flex items-center gap-1 text-sm text-red-600"><AlertCircle className="w-3.5 h-3.5" />{s.failed_sends}</span>)}</td>
                            <td className="p-3"><StatusBadge status={s.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
