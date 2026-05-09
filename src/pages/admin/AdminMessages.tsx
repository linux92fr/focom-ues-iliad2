import { useState, useEffect, useCallback } from "react";
import { MessageSquare, Search, Filter, Eye, Reply, Trash2, CheckCircle2, Clock, X, Send, RefreshCw } from "lucide-react";
import AdminLayout, { AdminAuthGuard } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Status = "non-lu" | "lu" | "repondu";

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  category: string;
  status: Status;
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
}

const statuses: { value: string; label: string }[] = [
  { value: "Tous", label: "Tous" },
  { value: "non-lu", label: "Non lu" },
  { value: "lu", label: "Lu" },
  { value: "repondu", label: "Répondu" },
];

type Modal =
  | { mode: "view"; item: Message }
  | { mode: "reply"; item: Message };

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Tous");
  const [modal, setModal] = useState<Modal | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  // ── Fetch ────────────────────────────────────────────────────
  const fetchMessages = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Impossible de charger les messages");
      console.error(error);
    } else {
      setMessages((data as Message[]) ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  // ── Helpers ──────────────────────────────────────────────────
  const filtered = messages.filter((m) => {
    const matchStatus = selectedStatus === "Tous" || m.status === selectedStatus;
    const q = searchQuery.toLowerCase();
    const matchSearch = q === "" || m.subject.toLowerCase().includes(q) || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const unreadCount = messages.filter((m) => m.status === "non-lu").length;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  // ── Actions ──────────────────────────────────────────────────
  const markAs = async (id: string, status: Status) => {
    const { error } = await supabase
      .from("contact_messages")
      .update({ status })
      .eq("id", id);
    if (!error) {
      setMessages((prev) => prev.map((m) => m.id === id ? { ...m, status } : m));
    }
  };

  const openView = async (item: Message) => {
    if (item.status === "non-lu") await markAs(item.id, "lu");
    setModal({ mode: "view", item: { ...item, status: item.status === "non-lu" ? "lu" : item.status } });
  };

  const openReply = (item: Message) => {
    setReplyText(item.admin_reply ?? "");
    setModal({ mode: "reply", item });
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) { toast.error("Le message de réponse est vide"); return; }
    if (!modal) return;

    setSending(true);
    const { error } = await supabase
      .from("contact_messages")
      .update({
        status: "repondu",
        admin_reply: replyText.trim(),
        replied_at: new Date().toISOString(),
      })
      .eq("id", modal.item.id);

    if (error) {
      toast.error("Erreur lors de l'envoi de la réponse");
    } else {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === modal.item.id
            ? { ...m, status: "repondu", admin_reply: replyText.trim(), replied_at: new Date().toISOString() }
            : m
        )
      );
      toast.success(`Réponse enregistrée pour ${modal.item.name}`);
      setModal(null);
    }
    setSending(false);
  };

  const handleDelete = async (id: string, subject: string) => {
    if (!window.confirm(`Supprimer le message "${subject}" définitivement ?`)) return;
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) {
      toast.error("Impossible de supprimer ce message");
    } else {
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (modal) setModal(null);
      toast.success("Message supprimé");
    }
  };

  // ── Style helpers ────────────────────────────────────────────
  const getStatusColor = (status: Status) => {
    if (status === "non-lu") return "bg-red-100 text-red-700";
    if (status === "lu") return "bg-blue-100 text-blue-700";
    return "bg-green-100 text-green-700";
  };

  const getStatusIcon = (status: Status) => {
    if (status === "non-lu") return <Clock className="w-3 h-3" />;
    if (status === "lu") return <Eye className="w-3 h-3" />;
    return <CheckCircle2 className="w-3 h-3" />;
  };

  const statusLabel: Record<Status, string> = { "non-lu": "Non lu", lu: "Lu", repondu: "Répondu" };

  const initials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  // ── Render ───────────────────────────────────────────────────
  return (
    <AdminAuthGuard>
      <AdminLayout title="Messages" breadcrumb={["Administration", "Messages"]}>

        {/* Modal */}
        {modal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setModal(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-red-100 text-red-600 text-xs">
                      {initials(modal.item.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{modal.item.name}</p>
                    <p className="text-xs text-slate-400">{modal.item.email}</p>
                  </div>
                </div>
                <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-slate-100">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Sujet</p>
                  <p className="font-semibold text-slate-900">{modal.item.subject}</p>
                </div>
                <div className="flex gap-3 text-xs text-slate-400 flex-wrap">
                  <span>{formatDate(modal.item.created_at)}</span>
                  <span>à {formatTime(modal.item.created_at)}</span>
                  <Badge className={`text-[10px] ${getStatusColor(modal.item.status)}`}>
                    {statusLabel[modal.item.status]}
                  </Badge>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {modal.item.message}
                </div>

                {/* Réponse existante */}
                {modal.item.admin_reply && modal.mode === "view" && (
                  <div className="border-t border-slate-100 pt-4">
                    <p className="text-xs font-semibold text-teal-700 mb-2">✓ Réponse envoyée</p>
                    <div className="bg-teal-50 rounded-xl p-4 text-sm text-teal-800 leading-relaxed whitespace-pre-wrap">
                      {modal.item.admin_reply}
                    </div>
                  </div>
                )}

                {modal.mode === "reply" && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <Label className="flex items-center gap-2 text-sm">
                      <Reply className="w-3.5 h-3.5" />Votre réponse
                    </Label>
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Répondre à ${modal.item.name}...`}
                      rows={5}
                      autoFocus
                    />
                    <p className="text-xs text-slate-400">
                      Note : la réponse est enregistrée dans la base de données. Ajoutez votre SMTP pour l'envoyer par email.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-between gap-2 px-6 py-4 border-t border-slate-100 flex-shrink-0">
                <Button
                  variant="ghost" size="sm"
                  onClick={() => handleDelete(modal.item.id, modal.item.subject)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />Supprimer
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setModal(null)}>Fermer</Button>
                  {modal.mode === "view" ? (
                    <Button onClick={() => openReply(modal.item)} className="bg-teal-600 hover:bg-teal-700 text-white gap-2">
                      <Reply className="w-4 h-4" />Répondre
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSendReply}
                      disabled={sending || !replyText.trim()}
                      className="bg-red-600 hover:bg-red-700 text-white gap-2"
                    >
                      {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Enregistrer
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center relative">
              <MessageSquare className="w-5 h-5 text-red-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Boîte de réception</h2>
              <p className="text-sm text-slate-500">
                {messages.length} message{messages.length > 1 ? "s" : ""} · {unreadCount} non lu{unreadCount > 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={fetchMessages} className="gap-2">
            <RefreshCw className="w-4 h-4" />Actualiser
          </Button>
        </div>

        {/* Filters */}
        <Card className="border-slate-200 shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Rechercher par nom, sujet, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline" size="sm"
                onClick={() => { setSearchQuery(""); setSelectedStatus("Tous"); }}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />Réinitialiser
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {statuses.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSelectedStatus(s.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedStatus === s.value
                      ? "bg-teal-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span className="text-sm">Chargement des messages…</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      {["Expéditeur", "Sujet", "Statut", "Date", "Actions"].map((h, i) => (
                        <th key={h} className={`p-4 text-sm font-semibold text-slate-600 ${i === 4 ? "text-right" : "text-left"}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((m) => (
                      <tr
                        key={m.id}
                        className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                          m.status === "non-lu" ? "bg-blue-50/30" : ""
                        }`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarFallback className="bg-red-100 text-red-600 text-xs">
                                {initials(m.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className={`text-sm truncate ${m.status === "non-lu" ? "font-bold" : "font-medium"} text-slate-900`}>
                                {m.name}
                              </p>
                              <p className="text-xs text-slate-400 truncate max-w-[160px]">{m.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 max-w-[200px]">
                          <p className={`text-sm truncate ${m.status === "non-lu" ? "font-semibold text-slate-900" : "text-slate-700"}`}>
                            {m.subject}
                          </p>
                        </td>
                        <td className="p-4">
                          <Badge className={`${getStatusColor(m.status)} gap-1 text-xs`}>
                            {getStatusIcon(m.status)}
                            <span>{statusLabel[m.status]}</span>
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-slate-500 whitespace-nowrap">
                          {formatDate(m.created_at)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openView(m)} title="Lire">
                              <Eye className="w-4 h-4 text-slate-400 hover:text-teal-600" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openReply(m)} title="Répondre">
                              <Reply className="w-4 h-4 text-slate-400 hover:text-blue-600" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(m.id, m.subject)} title="Supprimer">
                              <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {!loading && filtered.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Aucun message trouvé</p>
              </div>
            )}
          </CardContent>
        </Card>
      </AdminLayout>
    </AdminAuthGuard>
  );
}