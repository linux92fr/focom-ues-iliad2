import { useState, useEffect, useCallback, useRef } from "react";
import AdminLayout, { AdminAuthGuard } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  FolderOpen, Clock, CheckCircle2, AlertCircle, XCircle, MessageSquare,
  Loader2, Search, Paperclip, Download, Send, CalendarDays, Building2, Mail,
  AlertTriangle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Reclamation {
  id: string;
  user_id: string;
  user_email: string | null;
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
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS: Record<string, { label: string; color: string; Icon: React.ElementType }> = {
  nouveau:  { label: "Nouveau",  color: "bg-blue-100 text-blue-700",   Icon: Clock },
  en_cours: { label: "En cours", color: "bg-amber-100 text-amber-700", Icon: AlertCircle },
  resolu:   { label: "Résolu",   color: "bg-green-100 text-green-700", Icon: CheckCircle2 },
  ferme:    { label: "Fermé",    color: "bg-slate-100 text-slate-500", Icon: XCircle },
};

const PRIORITY: Record<string, { label: string; color: string }> = {
  normale:  { label: "Normale",  color: "bg-slate-100 text-slate-600" },
  urgente:  { label: "Urgente",  color: "bg-orange-100 text-orange-700" },
  critique: { label: "Critique", color: "bg-red-100 text-red-700" },
};

const CATEGORY: Record<string, string> = { rh: "RH", juridique: "Juridique", autre: "Autre" };
const ENTITY: Record<string, string> = {
  free: "Free", free_mobile: "Free Mobile", free_reseau: "Free Réseau",
  alice: "Alice", iliad: "Iliad", autre: "Autre",
};

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminReclamations() {
  return (
    <AdminAuthGuard>
      <AdminLayout title="Réclamations" breadcrumb={["Admin", "Réclamations"]}>
        <ReclamationsContent />
      </AdminLayout>
    </AdminAuthGuard>
  );
}

function ReclamationsContent() {
  const [reclamations, setReclamations] = useState<Reclamation[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected,     setSelected]     = useState<Reclamation | null>(null);

  const fetchAll = useCallback(async () => {
    const { data, error } = await supabase
      .from("reclamations")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setReclamations(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    const ch = supabase
      .channel("admin-reclamations")
      .on("postgres_changes", { event: "*", schema: "public", table: "reclamations" }, fetchAll)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [fetchAll]);

  const filtered = reclamations.filter(r => {
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !q || r.title.toLowerCase().includes(q) ||
      (r.user_email ?? "").toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const stats = {
    total:    reclamations.length,
    nouveau:  reclamations.filter(r => r.status === "nouveau").length,
    en_cours: reclamations.filter(r => r.status === "en_cours").length,
    resolu:   reclamations.filter(r => r.status === "resolu").length,
    ferme:    reclamations.filter(r => r.status === "ferme").length,
  };

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { label: "Total",    value: stats.total,    bg: "bg-white"       },
          { label: "Nouveaux", value: stats.nouveau,  bg: "bg-blue-50"     },
          { label: "En cours", value: stats.en_cours, bg: "bg-amber-50"    },
          { label: "Résolus",  value: stats.resolu,   bg: "bg-green-50"    },
          { label: "Fermés",   value: stats.ferme,    bg: "bg-slate-50"    },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl border border-slate-200 p-4 text-center`}>
            <p className="text-2xl font-extrabold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher…" className="pl-9" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="nouveau">Nouveau</SelectItem>
            <SelectItem value="en_cours">En cours</SelectItem>
            <SelectItem value="resolu">Résolu</SelectItem>
            <SelectItem value="ferme">Fermé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-slate-300" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <FolderOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Aucune réclamation trouvée</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-xs text-slate-500 font-semibold uppercase tracking-wide">
                <th className="px-4 py-3 text-left">Réclamation</th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">Salarié</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Catégorie</th>
                <th className="px-4 py-3 text-left">Statut</th>
                <th className="px-4 py-3 text-left hidden lg:table-cell">Priorité</th>
                <th className="px-4 py-3 text-left hidden lg:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(rec => {
                const s = STATUS[rec.status] ?? STATUS.nouveau;
                const p = PRIORITY[rec.priority] ?? PRIORITY.normale;
                return (
                  <tr key={rec.id}
                    onClick={() => setSelected(rec)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900 truncate max-w-[200px]">{rec.title}</p>
                      <p className="text-xs text-slate-400 truncate max-w-[200px]">{rec.description}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <p className="text-xs text-slate-600 truncate max-w-[140px]">
                        {rec.user_email ?? rec.user_id.slice(0, 8) + "…"}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                        {CATEGORY[rec.category]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${s.color}`}>
                        <s.Icon className="w-2.5 h-2.5" /> {s.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.color}`}>
                        {p.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-slate-400">{fmtDate(rec.created_at)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <ReclamationPanel
          rec={selected}
          onClose={() => setSelected(null)}
          onUpdated={(updated) => {
            setReclamations(prev => prev.map(r => r.id === updated.id ? updated : r));
            setSelected(updated);
          }}
        />
      )}
    </>
  );
}

// ─── Detail panel ─────────────────────────────────────────────────────────────

function ReclamationPanel({
  rec, onClose, onUpdated,
}: {
  rec: Reclamation; onClose: () => void;
  onUpdated: (r: Reclamation) => void;
}) {
  const [messages,    setMessages]    = useState<Message[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [newMsg,      setNewMsg]      = useState("");
  const [sending,     setSending]     = useState(false);
  const [newStatus,   setNewStatus]   = useState(rec.status);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadDetail = useCallback(async () => {
    const [{ data: msgs }, { data: atts }] = await Promise.all([
      supabase.from("reclamation_messages").select("*")
        .eq("reclamation_id", rec.id).order("created_at"),
      supabase.from("reclamation_attachments").select("*")
        .eq("reclamation_id", rec.id).order("created_at"),
    ]);
    setMessages(msgs ?? []);
    setAttachments(atts ?? []);
    setLoading(false);
  }, [rec.id]);

  useEffect(() => { loadDetail(); }, [loadDetail]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const updateStatus = async () => {
    if (newStatus === rec.status) return;
    setUpdatingStatus(true);
    const { data, error } = await supabase
      .from("reclamations")
      .update({ status: newStatus })
      .eq("id", rec.id)
      .select()
      .single();
    if (error) { toast.error("Erreur mise à jour"); }
    else { toast.success("Statut mis à jour"); onUpdated(data); }
    setUpdatingStatus(false);
  };

  const sendAdminMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    setSending(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("reclamation_messages").insert({
      reclamation_id: rec.id, author_id: user?.id, is_admin: true, content: newMsg.trim(),
    });
    if (error) { toast.error("Erreur d'envoi"); } else { setNewMsg(""); loadDetail(); }
    setSending(false);
  };

  const downloadAttachment = async (att: Attachment) => {
    const { data } = await supabase.storage.from("reclamations").createSignedUrl(att.file_path, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
    else toast.error("Impossible de télécharger");
  };

  const s = STATUS[rec.status] ?? STATUS.nouveau;
  const p = PRIORITY[rec.priority] ?? PRIORITY.normale;

  return (
    <Sheet open onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent className="w-full sm:max-w-xl flex flex-col p-0 gap-0">
        <SheetHeader className="px-6 py-4 border-b border-slate-100">
          <SheetTitle className="text-left">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${s.color}`}>
                <s.Icon className="w-2.5 h-2.5" /> {s.label}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.color}`}>{p.label}</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {CATEGORY[rec.category]}
              </span>
            </div>
            <span className="text-base font-bold text-slate-900 block">{rec.title}</span>
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 font-normal">
              <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{rec.user_email ?? "—"}</span>
              <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{ENTITY[rec.entity]}</span>
              <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{fmtDate(rec.created_at)}</span>
            </div>
          </SheetTitle>
        </SheetHeader>

        {/* Status update */}
        <div className="px-6 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
          <Label className="text-xs font-semibold text-slate-600 flex-shrink-0">Changer le statut :</Label>
          <Select value={newStatus} onValueChange={setNewStatus}>
            <SelectTrigger className="h-8 text-xs flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nouveau">Nouveau</SelectItem>
              <SelectItem value="en_cours">En cours</SelectItem>
              <SelectItem value="resolu">Résolu</SelectItem>
              <SelectItem value="ferme">Fermé</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" onClick={updateStatus}
            disabled={updatingStatus || newStatus === rec.status}
            className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white flex-shrink-0">
            {updatingStatus ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Appliquer"}
          </Button>
        </div>

        <ScrollArea className="flex-1 px-6 py-4 min-h-0">
          {/* Description */}
          <div className="bg-slate-50 rounded-xl p-4 mb-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Description</p>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{rec.description}</p>
          </div>

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                Pièces jointes ({attachments.length})
              </p>
              <div className="space-y-1.5">
                {attachments.map(att => (
                  <button key={att.id} onClick={() => downloadAttachment(att)}
                    className="w-full flex items-center gap-3 p-2.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left">
                    <Paperclip className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="text-sm text-slate-700 flex-1 truncate">{att.file_name}</span>
                    <span className="text-xs text-slate-400">{fmtSize(att.file_size)}</span>
                    <Download className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {loading ? (
            <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-slate-300" /></div>
          ) : messages.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-sm">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
              Aucun message échangé
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.is_admin ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.is_admin
                      ? "bg-red-600 text-white rounded-tr-sm"
                      : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm"
                  }`}>
                    {!msg.is_admin && (
                      <p className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Salarié</p>
                    )}
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${msg.is_admin ? "text-red-200" : "text-slate-400"}`}>
                      {fmtTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </ScrollArea>

        {/* Admin reply */}
        <form onSubmit={sendAdminMessage} className="px-6 py-4 border-t border-slate-100 flex gap-2">
          <Input
            value={newMsg}
            onChange={e => setNewMsg(e.target.value)}
            placeholder="Répondre au salarié…"
            className="flex-1"
          />
          <Button type="submit" disabled={sending || !newMsg.trim()} size="icon"
            className="bg-red-600 hover:bg-red-700 text-white flex-shrink-0">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
