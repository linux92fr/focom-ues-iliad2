import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Search, Filter, Plus, Eye, Reply, Trash2, Mail, CheckCircle2, Clock } from "lucide-react";
import AdminLayout, { AdminAuthGuard } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const messages = [
  { id: 1, name: "Jean Dupont", email: "jean.dupont@iliad.fr", subject: "Question sur mes droits", message: "Bonjour, je voudrais savoir comment fonctionne le droit à la déconnexion dans notre entreprise...", date: "2026-05-01", time: "14:30", status: "non-lu", category: "Droits" },
  { id: 2, name: "Marie Martin", email: "marie.martin@iliad.fr", subject: "Adhésion et cotisation", message: "Je souhaite adhérer à la FOCOM. Comment procéder pour la cotisation ?", date: "2026-04-30", time: "11:15", status: "lu", category: "Adhésion" },
  { id: 3, name: "Pierre Bernard", email: "pierre.bernard@iliad.fr", subject: "Télétravail", message: "Pouvez-vous m'expliquer les nouvelles modalités de télétravail ?", date: "2026-04-29", time: "16:45", status: "repondu", category: "Organisation" },
  { id: 4, name: "Sophie Laurent", email: "sophie.laurent@iliad.fr", subject: "NAO 2026", message: "Quelles sont les revendications de la FOCOM pour les négociations annuelles ?", date: "2026-04-28", time: "09:20", status: "lu", category: "Négociations" },
  { id: 5, name: "Michel Thomas", email: "michel.thomas@iliad.fr", subject: "Formation CPF", message: "Comment utiliser mon compte personnel de formation ?", date: "2026-04-27", time: "13:10", status: "repondu", category: "Formation" },
];

const categories = ["Toutes", "Droits", "Adhésion", "Organisation", "Négociations", "Formation"];
const statuses = ["Tous", "non-lu", "lu", "repondu"];

export default function AdminMessages() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Toutes");
  const [selectedStatus, setSelectedStatus] = useState("Tous");

  const filtered = messages.filter((m) => {
    const matchCategory = selectedCategory === "Toutes" || m.category === selectedCategory;
    const matchStatus = selectedStatus === "Tous" || m.status === selectedStatus;
    const matchSearch = searchQuery === "" || m.subject.toLowerCase().includes(searchQuery.toLowerCase()) || m.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchStatus && matchSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "non-lu": return "bg-red-100 text-red-700";
      case "lu": return "bg-blue-100 text-blue-700";
      case "repondu": return "bg-green-100 text-green-700";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "non-lu": return <Clock className="w-3 h-3" />;
      case "lu": return <Eye className="w-3 h-3" />;
      case "repondu": return <CheckCircle2 className="w-3 h-3" />;
      default: return null;
    }
  };

  return (
    <AdminAuthGuard>
      <AdminLayout title="Messages" breadcrumb={["Administration", "Messages"]}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Boîte de réception</h2>
              <p className="text-sm text-slate-500">{messages.length} messages reçus</p>
            </div>
          </div>
          <Button className="bg-red-600 hover:bg-red-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle réponse
          </Button>
        </div>

        <Card className="border-slate-200 shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Rechercher un message..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-500 hidden sm:inline">Filtres :</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedCategory === cat
                      ? "bg-red-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedStatus === status
                      ? "bg-teal-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Message</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Catégorie</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Statut</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Date</th>
                    <th className="text-right p-4 text-sm font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => (
                    <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-red-100 text-red-600">{m.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900 text-sm truncate">{m.subject}</p>
                            <p className="text-xs text-slate-500">{m.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-500">{m.category}</td>
                      <td className="p-4">
                        <Badge className={getStatusColor(m.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(m.status)}
                            <span className="capitalize">{m.status}</span>
                          </div>
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-slate-500">{m.date}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" className="text-slate-500 hover:text-teal-600">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-slate-500 hover:text-blue-600">
                            <Reply className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-slate-500 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Aucun message</p>
              </div>
            )}
          </CardContent>
        </Card>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
