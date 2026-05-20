import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Plus, Clock, CheckCircle2, AlertCircle, XCircle, MessageSquare,
  Paperclip, Send, Loader2, Lock, FolderOpen, Download, AlertTriangle,
  ChevronRight, CalendarDays, Building2, RefreshCw,
} from "lucide-react";

interface Reclamation {
  id: string;
  title: string;
  description: string;
  category: string;
  entity: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  content: string;
  is_admin: boolean;
  author_id: string | null;
  created_at: string;
}

interface Attachment {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
}

const STATUS: Record<string, { label: string; color: string; Icon: React.ElementType; step: number }> = {
  nouveau:   { label: "Nouveau",  color: "bg-blue-100 text-blue-700",   Icon: Clock, step: 1 },
  en_cours:  { label: "En cours", color: "bg-amber-100 text-amber-700", Icon: AlertCircle, step: 2 },
  resolu:    { label: "Résolu",   color: "bg-green-100 text-green-700", Icon: CheckCircle2, step: 3 },
  ferme:     { label: "Fermé",    color: "bg-slate-100 text-slate-500", Icon: XCircle, step: 4 },
};

const PRIORITY: Record<string, { label: string; color: string }> = {
  normale:   { label: "Normale",  color: "bg-slate-100 text-slate-600" },
  urgente:   { label: "Urgente",  color: "bg-orange-100 text-orange-700" },
  critique:  { label: "Critique", color: "bg-red-100 text-red-700" },
};

const CATEGORY: Record<string, string> = { rh: "RH", juridique: "Juridique", autre: "Autre" };
const ENTITY: Record<string, string> = {
  free: "Free", free_mobile: "Free Mobile", free_reseau: "Free Réseau",
  alice: "Alice", iliad: "Iliad", autre: "Autre entité",
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/plain",
];

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

const fmtSize = (bytes: number | null) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / 1048576).toFixed(1)} Mo`;
};

const statusSteps = [
  { key: "nouveau", label: "Reçue" },
  { key: "en_cours", label: "En cours" },
  { key: "resolu", label: "Résolue" },
  { key: "ferme", label: "Clôturée" },
];

function getSupabaseErrorMessage(error: any) {
  if (!error) return "Erreur inconnue";
  if (error.code === "42501") return "Accès refusé par Supabase/RLS. Vérifiez les policies de la table reclamations.";
  if (error.code === "23514") return "Une valeur du formulaire n'est pas acceptée par la base de données.";
  if (error.code === "23503") return "Votre compte utilisateur n'est pas reconnu par la base de données.";
  return error.message || "Erreur inconnue";
}

function StatusTimeline({ status }: { status: string }) {
  const currentStep = STATUS[status]?.step ?? 1;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 mb-4">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Suivi du dossier</p>
      <div className="grid grid-cols-4 gap-2">
        {statusSteps.map((step, index) => {
          const active = index + 1 <= currentStep;
          return (
            <div key={step.key} className="flex flex-col items-center text-center gap-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${active ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                {active ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
              </div>
              <span className={`text-[11px] font-medium ${active ? "text-slate-800" : "text-slate-400"}`}>{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MesReclamations() {
  const { user, loading: authLoading } = useAuth();
  const [reclamations, setReclamations] = useState<Reclamation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedRec, setSelectedRec] = useState<Reclamation | null>(null);

  const fetchReclamations = useCallback(async () => {
    if (!user) return;
    setRefreshing(true);
    const { data, error } = await supabase
      .from("reclamations")
      .select("*")
      .order("updated_at", { ascending: false });
    if (!error) setReclamations(data ?? []);
    else toast.error(`Impossible de charger vos réclamations : ${getSupabaseErrorMessage(error)}`);
    setLoading(false);
    setRefreshing(false);
  }, [user]);

  useEffect(() => { if (!authLoading) fetchReclamations(); }, [authLoading, fetchReclamations]);

  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel("mes-reclamations")
      .on("postgres_changes", { event: "*", schema: "public", table: "reclamations" }, fetchReclamations)
      .on("postgres_changes", { event: "*", schema: "public", table: "reclamation_messages" }, fetchReclamations)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, fetchReclamations]);

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>;
  }

  if (!user) {
    return (
      <div className="p-6 max-w-md mx-auto mt-12 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Connexion requise</h2>
        <p className="text-slate-500 text-sm mb-6">Pour accéder à vos réclamations, vous devez être connecté à votre espace adhérent.</p>
        <Link to="/profil"><Button className="bg-red-600 hover:bg-red-700 text-white">Se connecter <ChevronRight className="w-4 h-4 ml-1" /></Button></Link>
      </div>
    );
  }

  const stats = {
    total: reclamations.length,
    nouveau: reclamations.filter(r => r.status === "nouveau").length,
    en_cours: reclamations.filter(r => r.status === "en_cours").length,
    resolu: reclamations.filter(r => r.status === "resolu").length,
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-red-600" /> Mes demandes
          </h1>
          <p className="text-slate-500 text-sm mt-1">Suivez vos demandes, vos bulletins transmis et vos échanges avec FO COM.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchReclamations} disabled={refreshing} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} /> Actualiser
          </Button>
          <Button onClick={() => setCreateOpen(true)} className="bg-red-600 hover:bg-red-700 text-white gap-2">
            <Plus className="w-4 h-4" /> Nouvelle demande
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total", value: stats.total, color: "bg-slate-50 text-slate-700" },
          { label: "Nouveaux", value: stats.nouveau, color: "bg-blue-50 text-blue-700" },
          { label: "En cours", value: stats.en_cours, color: "bg-amber-50 text-amber-700" },
          { label: "Résolus", value: stats.resolu, color: "bg-green-50 text-green-700" },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-xl p-4 text-center border border-slate-100`}>
            <p className="text-2xl font-extrabold">{s.value}</p>
            <p className="text-xs font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
      ) : reclamations.length === 0 ? (
        <div className="text-center py-16 text-slate-400 rounded-2xl border border-dashed border-slate-200 bg-white">
          <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Aucune demande</p>
          <p className="text-sm mt-1">Cliquez sur "Nouvelle demande" pour transmettre un bulletin ou contacter FO COM.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reclamations.map(rec => {
            const s = STATUS[rec.status] ?? STATUS.nouveau;
            const p = PRIORITY[rec.priority] ?? PRIORITY.normale;
            return (
              <button key={rec.id} onClick={() => setSelectedRec(rec)} className="w-full text-left bg-white rounded-xl border border-slate-200 p-4 hover:border-teal-300 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${s.color}`}><s.Icon className="w-2.5 h-2.5" /> {s.label}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.color}`}>{p.label}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{CATEGORY[rec.category]}</span>
                    </div>
                    <p className="font-semibold text-slate-900 text-sm truncate">{rec.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{rec.description}</p>
                    <p className="text-[11px] text-slate-400 mt-2">Dernière mise à jour : {fmtDate(rec.updated_at)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-slate-400">{fmtDate(rec.created_at)}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{ENTITY[rec.entity]}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <CreateReclamationDialog open={createOpen} onClose={() => setCreateOpen(false)} fallbackUserId={user.id} fallbackUserEmail={user.email ?? ""} onCreated={fetchReclamations} />

      {selectedRec && (
        <ReclamationDetailDialog
          rec={selectedRec}
          userId={user.id}
          onClose={() => setSelectedRec(null)}
          onUpdated={(updated) => {
            setReclamations(prev => prev.map(r => r.id === updated.id ? updated : r));
            setSelectedRec(updated);
          }}
        />
      )}
    </div>
  );
}

function CreateReclamationDialog({ open, onClose, fallbackUserId, fallbackUserEmail, onCreated }: { open: boolean; onClose: () => void; fallbackUserId: string; fallbackUserEmail: string; onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("autre");
  const [entity, setEntity] = useState("autre");
  const [priority, setPriority] = useState("normale");
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => { setTitle(""); setDescription(""); setCategory("autre"); setEntity("autre"); setPriority("normale"); setFiles([]); };

  const addFiles = (selectedFiles: File[]) => {
    const validFiles: File[] = [];
    selectedFiles.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} dépasse 10 Mo`);
        return;
      }
      if (file.type && !ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name} n'est pas un format autorisé`);
        return;
      }
      validFiles.push(file);
    });
    setFiles(prev => [...prev, ...validFiles]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 5 || description.trim().length < 20) {
      toast.error("Merci de renseigner un titre et une description suffisamment détaillés.");
      return;
    }
    setSaving(true);

    const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
    if (userError || !currentUser) {
      toast.error("Votre session a expiré. Merci de vous reconnecter.");
      setSaving(false);
      return;
    }

    const userId = currentUser.id || fallbackUserId;
    const userEmail = currentUser.email || fallbackUserEmail;

    const { data: rec, error } = await supabase
      .from("reclamations")
      .insert({
        user_id: userId,
        user_email: userEmail,
        title: title.trim(),
        description: description.trim(),
        category,
        entity,
        priority,
        status: "nouveau",
      })
      .select("*")
      .single();

    if (error || !rec) {
      console.error("Erreur création réclamation", error);
      toast.error(`Erreur lors de la création : ${getSupabaseErrorMessage(error)}`);
      setSaving(false);
      return;
    }

    for (const file of files) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `${userId}/${rec.id}/${Date.now()}-${safeName}`;
      const { error: upErr } = await supabase.storage.from("reclamations").upload(path, file);
      if (upErr) {
        console.error("Erreur upload pièce jointe", upErr);
        toast.warning(`Réclamation créée, mais pièce jointe non envoyée : ${upErr.message}`);
        continue;
      }
      const { error: attErr } = await supabase.from("reclamation_attachments").insert({
        reclamation_id: rec.id,
        file_name: file.name,
        file_path: path,
        file_size: file.size,
        mime_type: file.type,
      });
      if (attErr) console.error("Erreur enregistrement pièce jointe", attErr);
    }

    toast.success("Demande créée avec succès");
    reset();
    onCreated();
    onClose();
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onClose(); } }}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><FolderOpen className="w-5 h-5 text-red-600" />Nouvelle demande</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="rounded-lg bg-teal-50 border border-teal-100 p-3 text-xs text-teal-900">
            Décrivez votre situation avec des éléments factuels. Les pièces jointes sont privées et visibles uniquement par vous et les représentants habilités.
          </div>
          <div><Label htmlFor="cr-title">Titre *</Label><Input id="cr-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Résumé de votre demande" required className="mt-1" /></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div><Label>Catégorie</Label><Select value={category} onValueChange={setCategory}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="rh">RH</SelectItem><SelectItem value="juridique">Juridique</SelectItem><SelectItem value="autre">Adhésion / bulletin</SelectItem></SelectContent></Select></div>
            <div><Label>Entité</Label><Select value={entity} onValueChange={setEntity}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(ENTITY).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Priorité</Label><Select value={priority} onValueChange={setPriority}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="normale">Normale</SelectItem><SelectItem value="urgente">Urgente</SelectItem><SelectItem value="critique">Critique</SelectItem></SelectContent></Select></div>
          </div>
          <div><Label htmlFor="cr-desc">Description *</Label><Textarea id="cr-desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="Décrivez votre situation en détail…" rows={5} required className="mt-1 resize-none" /></div>
          <div>
            <Label>Pièces jointes</Label>
            <input ref={fileRef} type="file" multiple accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.txt" className="hidden" onChange={e => addFiles(Array.from(e.target.files ?? []))} />
            <button type="button" onClick={() => fileRef.current?.click()} className="mt-1 w-full border-2 border-dashed border-slate-200 rounded-lg py-3 text-sm text-slate-500 hover:border-teal-300 hover:text-teal-700 transition-colors flex items-center justify-center gap-2">
              <Paperclip className="w-4 h-4" /> Ajouter un bulletin PDF ou une pièce jointe, 10 Mo max
            </button>
            {files.length > 0 && <ul className="mt-2 space-y-1">{files.map((f, i) => <li key={`${f.name}-${i}`} className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 rounded px-3 py-1.5"><span className="truncate">{f.name} · {fmtSize(f.size)}</span><button type="button" onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} className="ml-2 text-slate-400 hover:text-red-500 flex-shrink-0">✕</button></li>)}</ul>}
          </div>
          <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={() => { reset(); onClose(); }}>Annuler</Button><Button type="submit" disabled={saving} className="bg-red-600 hover:bg-red-700 text-white">{saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Envoi…</> : "Soumettre"}</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ReclamationDetailDialog({ rec, userId, onClose, onUpdated }: { rec: Reclamation; userId: string; onClose: () => void; onUpdated: (r: Reclamation) => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadDetail = useCallback(async () => {
    const [{ data: msgs }, { data: atts }] = await Promise.all([
      supabase.from("reclamation_messages").select("*").eq("reclamation_id", rec.id).order("created_at"),
      supabase.from("reclamation_attachments").select("*").eq("reclamation_id", rec.id).order("created_at"),
    ]);
    setMessages(msgs ?? []);
    setAttachments(atts ?? []);
    setLoading(false);
  }, [rec.id]);

  useEffect(() => { loadDetail(); }, [loadDetail]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    const ch = supabase
      .channel(`reclamation-detail-${rec.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "reclamation_messages", filter: `reclamation_id=eq.${rec.id}` }, loadDetail)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "reclamations", filter: `id=eq.${rec.id}` }, (payload) => onUpdated(payload.new as Reclamation))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [rec.id, loadDetail, onUpdated]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    setSending(true);
    const { error } = await supabase.from("reclamation_messages").insert({ reclamation_id: rec.id, author_id: userId, is_admin: false, content: newMsg.trim() });
    if (error) toast.error(`Erreur d'envoi : ${getSupabaseErrorMessage(error)}`);
    else { setNewMsg(""); loadDetail(); toast.success("Message ajouté"); }
    setSending(false);
  };

  const downloadAttachment = async (att: Attachment) => {
    const { data } = await supabase.storage.from("reclamations").createSignedUrl(att.file_path, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
    else toast.error("Impossible de télécharger le fichier");
  };

  const s = STATUS[rec.status] ?? STATUS.nouveau;
  const p = PRIORITY[rec.priority] ?? PRIORITY.normale;

  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${s.color}`}><s.Icon className="w-2.5 h-2.5" /> {s.label}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.color}`}>{p.label}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{CATEGORY[rec.category]}</span>
              </div>
              <h2 className="font-bold text-slate-900">{rec.title}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-400">
                <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />Créée le {fmtDate(rec.created_at)}</span>
                <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3" />MAJ {fmtDate(rec.updated_at)}</span>
                <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{ENTITY[rec.entity]}</span>
              </div>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 px-6 py-4 min-h-0">
          <StatusTimeline status={rec.status} />
          <div className="bg-slate-50 rounded-xl p-4 mb-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Description initiale</p>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{rec.description}</p>
          </div>

          {attachments.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Pièces jointes ({attachments.length})</p>
              <div className="space-y-1.5">
                {attachments.map(att => (
                  <button key={att.id} onClick={() => downloadAttachment(att)} className="w-full flex items-center gap-3 p-2.5 bg-white border border-slate-200 rounded-lg hover:border-teal-300 hover:bg-slate-50 transition-colors text-left">
                    <Paperclip className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="text-sm text-slate-700 flex-1 truncate">{att.file_name}</span>
                    <span className="text-xs text-slate-400">{fmtSize(att.file_size)}</span>
                    <Download className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-slate-300" /></div>
          ) : messages.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-sm"><MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />Aucun message — un représentant FOCOM vous répondra ici.</div>
          ) : (
            <div className="space-y-3">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.is_admin ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${msg.is_admin ? "bg-white border border-slate-200 text-slate-800 rounded-tl-sm" : "bg-red-600 text-white rounded-tr-sm"}`}>
                    {msg.is_admin && <p className="text-[10px] font-bold text-red-600 mb-1 uppercase tracking-wide">Représentant FO COM</p>}
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${msg.is_admin ? "text-slate-400" : "text-red-200"}`}>{fmtTime(msg.created_at)}</p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </ScrollArea>

        {rec.status !== "ferme" && rec.status !== "resolu" && (
          <form onSubmit={sendMessage} className="px-6 py-4 border-t border-slate-100 flex gap-2">
            <Input value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder="Ajouter un message…" className="flex-1" />
            <Button type="submit" disabled={sending || !newMsg.trim()} size="icon" className="bg-red-600 hover:bg-red-700 text-white flex-shrink-0">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>
        )}

        {(rec.status === "ferme" || rec.status === "resolu") && (
          <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 text-center">
            <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Ce dossier est {rec.status === "resolu" ? "résolu" : "clôturé"}. Contactez FO COM si une nouvelle action est nécessaire.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
