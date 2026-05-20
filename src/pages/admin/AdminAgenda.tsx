import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock, Edit, Eye, Filter, Loader2, MapPin, Plus, Save, Search, Trash2, X } from "lucide-react";
import AdminLayout, { AdminAuthGuard } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Event = Tables<"events">;
type ModalMode = "add" | "edit" | "view";

type FormState = {
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  all_day: boolean;
  event_type: string;
  is_public: boolean;
};

const eventTypes = [
  { value: "reunion", label: "Réunion" },
  { value: "manifestation", label: "Manifestation" },
  { value: "formation", label: "Formation" },
  { value: "assemblee", label: "Assemblée Générale" },
  { value: "autre", label: "Autre" },
];

const eventTypeLabel = Object.fromEntries(eventTypes.map((t) => [t.value, t.label]));

const emptyForm = (): FormState => ({
  title: "",
  description: "",
  location: "",
  start_date: "",
  end_date: "",
  all_day: false,
  event_type: "reunion",
  is_public: true,
});

const toDateTimeLocal = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

const toIsoOrNull = (value: string) => value ? new Date(value).toISOString() : null;
const formatDate = (value: string) => new Date(value).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
const formatTime = (value: string) => new Date(value).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

export default function AdminAgenda() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("Tous");
  const [modal, setModal] = useState<{ mode: ModalMode; item?: Event } | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());

  const loadEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("start_date", { ascending: false });

    if (error) {
      console.error("Erreur chargement agenda", error);
      toast.error("Impossible de charger l'agenda");
    } else {
      setEvents((data as Event[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { loadEvents(); }, []);

  const filtered = useMemo(() => events.filter((event) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || event.title.toLowerCase().includes(q) || (event.description || "").toLowerCase().includes(q) || (event.location || "").toLowerCase().includes(q);
    const matchType = selectedType === "Tous" || event.event_type === selectedType;
    return matchSearch && matchType;
  }), [events, searchQuery, selectedType]);

  const openAdd = () => { setForm(emptyForm()); setModal({ mode: "add" }); };
  const openView = (item: Event) => setModal({ mode: "view", item });
  const openEdit = (item: Event) => {
    setForm({
      title: item.title,
      description: item.description || "",
      location: item.location || "",
      start_date: toDateTimeLocal(item.start_date),
      end_date: toDateTimeLocal(item.end_date),
      all_day: Boolean(item.all_day),
      event_type: item.event_type || "autre",
      is_public: item.is_public !== false,
    });
    setModal({ mode: "edit", item });
  };

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error("Titre requis");
    if (!form.start_date) return toast.error("Date de début requise");
    if (form.end_date && new Date(form.end_date) < new Date(form.start_date)) return toast.error("La date de fin doit être après la date de début");

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        location: form.location.trim() || null,
        start_date: new Date(form.start_date).toISOString(),
        end_date: toIsoOrNull(form.end_date),
        all_day: form.all_day,
        event_type: form.event_type,
        is_public: form.is_public,
        organizer_id: user?.id || null,
      };

      if (modal?.mode === "add") {
        const { error } = await supabase.from("events").insert(payload as never);
        if (error) throw error;
        toast.success("Événement ajouté");
      }

      if (modal?.mode === "edit" && modal.item) {
        const { error } = await supabase.from("events").update(payload as never).eq("id", modal.item.id);
        if (error) throw error;
        toast.success("Événement mis à jour");
      }

      setModal(null);
      await loadEvents();
    } catch (error) {
      console.error("Erreur sauvegarde événement", error);
      toast.error(error instanceof Error ? error.message : "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (event: Event) => {
    if (!window.confirm(`Supprimer "${event.title}" définitivement ?`)) return;
    const { error } = await supabase.from("events").delete().eq("id", event.id);
    if (error) return toast.error("Impossible de supprimer l'événement");
    setEvents((prev) => prev.filter((item) => item.id !== event.id));
    toast.success("Événement supprimé");
  };

  const publicCount = events.filter((event) => event.is_public !== false).length;
  const privateCount = events.length - publicCount;
  const upcomingCount = events.filter((event) => new Date(event.start_date) >= new Date()).length;

  return (
    <AdminAuthGuard>
      <AdminLayout title="Agenda" breadcrumb={["Administration", "Agenda"]}>
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setModal(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <h3 className="font-bold text-slate-900">{modal.mode === "view" ? "Détail événement" : modal.mode === "edit" ? "Modifier l'événement" : "Ajouter un événement"}</h3>
                <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-4 h-4 text-slate-500" /></button>
              </div>

              <div className="p-6 space-y-4">
                {modal.mode === "view" && modal.item ? (
                  <div className="space-y-3">
                    <h4 className="text-lg font-bold text-slate-900">{modal.item.title}</h4>
                    {modal.item.description && <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{modal.item.description}</p>}
                    <div className="flex justify-between gap-4 text-sm"><span className="text-slate-500">Type</span><span className="font-medium">{eventTypeLabel[modal.item.event_type] || modal.item.event_type}</span></div>
                    <div className="flex justify-between gap-4 text-sm"><span className="text-slate-500">Début</span><span className="font-medium">{formatDate(modal.item.start_date)} {modal.item.all_day ? "" : formatTime(modal.item.start_date)}</span></div>
                    {modal.item.end_date && <div className="flex justify-between gap-4 text-sm"><span className="text-slate-500">Fin</span><span className="font-medium">{formatDate(modal.item.end_date)} {modal.item.all_day ? "" : formatTime(modal.item.end_date)}</span></div>}
                    <div className="flex justify-between gap-4 text-sm"><span className="text-slate-500">Lieu</span><span className="font-medium text-right">{modal.item.location || "—"}</span></div>
                    <div className="flex justify-between gap-4 text-sm"><span className="text-slate-500">Visibilité</span><Badge className={modal.item.is_public !== false ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}>{modal.item.is_public !== false ? "Public" : "Privé"}</Badge></div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1.5"><Label>Titre *</Label><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Réunion CSE" /></div>
                    <div className="space-y-1.5"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} /></div>
                    <div className="space-y-1.5"><Label>Type</Label><Select value={form.event_type} onValueChange={(v) => setForm((f) => ({ ...f, event_type: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{eventTypes.map((type) => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}</SelectContent></Select></div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5"><Label>Début *</Label><Input type="datetime-local" value={form.start_date} onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))} /></div>
                      <div className="space-y-1.5"><Label>Fin</Label><Input type="datetime-local" value={form.end_date} onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))} /></div>
                    </div>
                    <div className="space-y-1.5"><Label>Lieu</Label><Input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="Salle, adresse ou lien visio" /></div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm cursor-pointer"><input type="checkbox" checked={form.all_day} onChange={(e) => setForm((f) => ({ ...f, all_day: e.target.checked }))} /> Journée entière</label>
                      <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm cursor-pointer"><input type="checkbox" checked={form.is_public} onChange={(e) => setForm((f) => ({ ...f, is_public: e.target.checked }))} /> Visible côté public</label>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100">
                <Button variant="outline" onClick={() => setModal(null)}>Fermer</Button>
                {modal.mode === "view" && modal.item && <Button onClick={() => openEdit(modal.item!)} className="bg-red-600 hover:bg-red-700 text-white gap-2"><Edit className="w-4 h-4" />Modifier</Button>}
                {modal.mode !== "view" && <Button onClick={handleSave} disabled={saving} className="bg-red-600 hover:bg-red-700 text-white gap-2">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Enregistrer</Button>}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-slate-900">{events.length}</p><p className="text-xs text-slate-500">Total</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-slate-900">{upcomingCount}</p><p className="text-xs text-slate-500">À venir</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-slate-900">{publicCount}</p><p className="text-xs text-slate-500">Publics</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-slate-900">{privateCount}</p><p className="text-xs text-slate-500">Privés</p></CardContent></Card>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center"><CalendarDays className="w-5 h-5 text-teal-600" /></div><div><h2 className="text-lg font-bold text-slate-900">Gestion de l'agenda</h2><p className="text-sm text-slate-500">Événements syndicaux publics ou internes</p></div></div>
          <Button onClick={openAdd} className="bg-red-600 hover:bg-red-700 text-white"><Plus className="w-4 h-4 mr-2" />Ajouter un événement</Button>
        </div>

        <Card className="mb-6"><CardContent className="p-4"><div className="flex flex-col sm:flex-row gap-3"><div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Rechercher un événement..." className="pl-10" /></div><Button variant="outline" size="sm" onClick={() => { setSearchQuery(""); setSelectedType("Tous"); }} className="gap-2"><Filter className="w-4 h-4" />Réinitialiser</Button></div><div className="flex flex-wrap gap-2 mt-3"><button onClick={() => setSelectedType("Tous")} className={`px-3 py-1.5 rounded-full text-xs font-medium ${selectedType === "Tous" ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600"}`}>Tous</button>{eventTypes.map((type) => <button key={type.value} onClick={() => setSelectedType(type.value)} className={`px-3 py-1.5 rounded-full text-xs font-medium ${selectedType === type.value ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600"}`}>{type.label}</button>)}</div></CardContent></Card>

        <Card><CardContent className="p-0">{loading ? <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-red-600" /></div> : <div className="overflow-x-auto"><table className="w-full"><thead className="bg-slate-50 border-b border-slate-200"><tr>{["Événement", "Type", "Date", "Lieu", "Visibilité", "Actions"].map((h, i) => <th key={h} className={`p-4 text-sm font-semibold text-slate-600 ${i === 5 ? "text-right" : "text-left"}`}>{h}</th>)}</tr></thead><tbody>{filtered.map((event) => <tr key={event.id} className="border-b border-slate-100 hover:bg-slate-50"><td className="p-4"><p className="font-medium text-slate-900 text-sm">{event.title}</p><p className="text-xs text-slate-400 line-clamp-1">{event.description || "—"}</p></td><td className="p-4"><Badge variant="secondary">{eventTypeLabel[event.event_type] || event.event_type}</Badge></td><td className="p-4 text-sm text-slate-500"><div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{formatDate(event.start_date)} {event.all_day ? "" : formatTime(event.start_date)}</div></td><td className="p-4 text-sm text-slate-500"><div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{event.location || "—"}</div></td><td className="p-4"><Badge className={event.is_public !== false ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}>{event.is_public !== false ? "Public" : "Privé"}</Badge></td><td className="p-4"><div className="flex justify-end gap-1"><Button variant="ghost" size="sm" onClick={() => openView(event)}><Eye className="w-4 h-4 text-slate-400 hover:text-teal-600" /></Button><Button variant="ghost" size="sm" onClick={() => openEdit(event)}><Edit className="w-4 h-4 text-slate-400 hover:text-blue-600" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(event)}><Trash2 className="w-4 h-4 text-slate-400 hover:text-red-600" /></Button></div></td></tr>)}</tbody></table>{filtered.length === 0 && <div className="text-center py-12"><CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-500">Aucun événement trouvé</p></div>}</div>}</CardContent></Card>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
