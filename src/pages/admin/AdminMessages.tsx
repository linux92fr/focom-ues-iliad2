import { useState } from "react";
import { MessageSquare, Search, Filter, Eye, Reply, Trash2, Mail, CheckCircle2, Clock, X, Send } from "lucide-react";
import AdminLayout, { AdminAuthGuard } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

type Status = "non-lu" | "lu" | "repondu";
type Message = { id: number; name: string; email: string; subject: string; message: string; date: string; time: string; status: Status; category: string };

const initialMessages: Message[] = [
  { id: 1, name: "Jean Dupont", email: "jean.dupont@iliad.fr", subject: "Question sur mes droits", message: "Bonjour, je voudrais savoir comment fonctionne le droit à la déconnexion dans notre entreprise. Est-ce qu'il existe un accord spécifique chez Iliad ? Merci de votre aide.", date: "2026-05-01", time: "14:30", status: "non-lu", category: "Droits" },
  { id: 2, name: "Marie Martin", email: "marie.martin@iliad.fr", subject: "Adhésion et cotisation", message: "Je souhaite adhérer à la FOCOM. Comment procéder pour la cotisation mensuelle ? Quels sont les avantages pour les membres ?", date: "2026-04-30", time: "11:15", status: "lu", category: "Adhésion" },
  { id: 3, name: "Pierre Bernard", email: "pierre.bernard@iliad.fr", subject: "Télétravail", message: "Pouvez-vous m'expliquer les nouvelles modalités de télétravail suite à l'accord signé en 2025 ? Combien de jours par semaine sont autorisés ?", date: "2026-04-29", time: "16:45", status: "repondu", category: "Organisation" },
  { id: 4, name: "Sophie Laurent", email: "sophie.laurent@iliad.fr", subject: "NAO 2026", message: "Quelles sont les revendications de la FOCOM pour les négociations annuelles obligatoires de 2026 ? J'aimerais en savoir plus.", date: "2026-04-28", time: "09:20", status: "lu", category: "Négociations" },
  { id: 5, name: "Michel Thomas", email: "michel.thomas@iliad.fr", subject: "Formation CPF", message: "Comment utiliser mon compte personnel de formation ? J'ai une formation certifiante qui m'intéresse mais je ne sais pas comment procéder.", date: "2026-04-27", time: "13:10", status: "repondu", category: "Formation" },
];

const categories = ["Toutes", "Droits", "Adhésion", "Organisation", "Négociations", "Formation"];
const statuses = ["Tous", "non-lu", "lu", "repondu"];

type Modal =
  | { mode: "view"; item: Message }
  | { mode: "reply"; item: Message };

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Toutes");
  const [selectedStatus, setSelectedStatus] = useState("Tous");
  const [modal, setModal] = useState<Modal | null>(null);
  const [replyText, setReplyText] = useState("");

  const filtered = messages.filter((m) => {
    const matchCategory = selectedCategory === "Toutes" || m.category === selectedCategory;
    const matchStatus = selectedStatus === "Tous" || m.status === selectedStatus;
    const matchSearch = searchQuery === "" || m.subject.toLowerCase().includes(searchQuery.toLowerCase()) || m.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchStatus && matchSearch;
  });

  const unreadCount = messages.filter((m) => m.status === "non-lu").length;

  const markAs = (id: number, status: Status) => {
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, status } : m));
  };

  const openView = (item: Message) => {
    markAs(item.id, "lu");
    setModal({ mode: "view", item: { ...item, status: "lu" } });
  };

  const openReply = (item: Message) => {
    markAs(item.id, "lu");
    setReplyText("");
    setModal({ mode: "reply", item });
  };

  const handleSendReply = () => {
    if (!replyText.trim()) { toast.error("Le message de réponse est vide"); return; }
    if (modal?.mode === "reply") {
      markAs(modal.item.id, "repondu");
      toast.success(`Réponse envoyée à ${modal.item.name}`);
      setModal(null);
    }
  };

  const handleDelete = (id: number, subject: string) => {
    if (window.confirm(`Supprimer le message "${subject}" définitivement ?`)) {
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (modal) setModal(null);
      toast.success("Message supprimé");
    }
  };

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

  return (
    <AdminAuthGuard>
      <AdminLayout title="Messages" breadcrumb={["Administration", "Messages"]}>

        {/* ── View / Reply Modal ────────────────────────────── */}
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setModal(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9"><AvatarFallback className="bg-red-100 text-red-600">{modal.item.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback></Avatar>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{modal.item.name}</p>
                    <p className="text-xs text-slate-400">{modal.item.email}</p>
                  </div>
                </div>
                <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-4 h-4 text-slate-500" /></button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Sujet</p>
                  <p className="font-semibold text-slate-900">{modal.item.subject}</p>
                </div>
                <div className="flex gap-3 text-xs text-slate-400">
                  <span>{modal.item.date}</span>
                  <span>à {modal.item.time}</span>
                  <Badge className={`text-[10px] ${getStatusColor(modal.item.status)}`}>{statusLabel[modal.item.status]}</Badge>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed">
                  {modal.item.message}
                </div>

                {modal.mode === "reply" && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <Label className="flex items-center gap-2"><Reply className="w-3.5 h-3.5" />Votre réponse</Label>
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Répondre à ${modal.item.name}...`}
                      rows={5}
                      autoFocus
                    />
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-between gap-2 px-6 py-4 border-t border-slate-100">
                <Button variant="ghost" size="sm" onClick={() => handleDelete(modal.item.id, modal.item.subject)} className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-1.5">
                  <Trash2 className="w-3.5 h-3.5" />Supprimer
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setModal(null)}>Fermer</Button>
                  {modal.mode === "view" ? (
                    <Button onClick={() => openReply(modal.item)} className="bg-teal-600 hover:bg-teal-700 text-white gap-2">
                      <Reply className="w-4 h-4" />Répondre
                    </Button>
                  ) : (
                    <Button onClick={handleSendReply} className="bg-red-600 hover:bg-red-700 text-white gap-2">
                      <Send className="w-4 h-4" />Envoyer
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Header ───────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center relative">
              <MessageSquare className="w-5 h-5 text-red-600" />
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{unreadCount}</span>}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Boîte de réception</h2>
              <p className="text-sm text-slate-500">{messages.length} messages · {unreadCount} non lu{unreadCount > 1 ? "s" : ""}</p>
            </div>
          </div>
        </div>

        {/* ── Filters ──────────────────────────────────────── */}
        <Card className="border-slate-200 shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input placeholder="Rechercher un message..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
              <Button variant="outline" size="sm" onClick={() => { setSearchQuery(""); setSelectedCategory("Toutes"); setSelectedStatus("Tous"); }} className="gap-2">
                <Filter className="w-4 h-4" />Réinitialiser
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {categories.map((cat) => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedCategory === cat ? "bg-red-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{cat}</button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {statuses.map((s) => (
                <button key={s} onClick={() => setSelectedStatus(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedStatus === s ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                  {s === "Tous" ? "Tous" : statusLabel[s as Status]}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Table ────────────────────────────────────────── */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {["Message", "Catégorie", "Statut", "Date", "Actions"].map((h, i) => (
                      <th key={h} className={`p-4 text-sm font-semibold text-slate-600 ${i === 4 ? "text-right" : "text-left"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => (
                    <tr key={m.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${m.status === "non-lu" ? "bg-blue-50/30" : ""}`}>
                      <td className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-9 w-9 flex-shrink-0"><AvatarFallback className="bg-red-100 text-red-600">{m.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback></Avatar>
                          <div className="min-w-0">
                            <p className={`text-sm truncate ${m.status === "non-lu" ? "font-bold text-slate-900" : "font-medium text-slate-900"}`}>{m.subject}</p>
                            <p className="text-xs text-slate-500">{m.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-500">{m.category}</td>
                      <td className="p-4">
                        <Badge className={`${getStatusColor(m.status)} gap-1`}>
                          {getStatusIcon(m.status)}
                          <span>{statusLabel[m.status]}</span>
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-slate-500">{m.date}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openView(m)} title="Lire"><Eye className="w-4 h-4 text-slate-400 hover:text-teal-600" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => openReply(m)} title="Répondre"><Reply className="w-4 h-4 text-slate-400 hover:text-blue-600" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(m.id, m.subject)} title="Supprimer"><Trash2 className="w-4 h-4 text-slate-400 hover:text-red-600" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-12"><MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-500">Aucun message</p></div>
            )}
          </CardContent>
        </Card>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
