import { useState } from "react";
import { HelpCircle, Search, Filter, Plus, Edit, Trash2, ChevronDown, ChevronUp, X, Save, Check } from "lucide-react";
import AdminLayout, { AdminAuthGuard } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type FAQ = { id: number; question: string; answer: string; category: string; status: string; order: number };

const initialFaqs: FAQ[] = [
  { id: 1, question: "Comment adhérer à la FOCOM ?", answer: "Pour adhérer, remplissez le formulaire en ligne dans la section Espace Adhérent ou contactez-nous directement par email.", category: "Adhésion", status: "Publié", order: 1 },
  { id: 2, question: "Qu'est-ce que le droit à la déconnexion ?", answer: "Le droit à la déconnexion garantit aux salariés le droit de ne pas être joignables en dehors des heures de travail définies par leur contrat.", category: "Droits", status: "Publié", order: 2 },
  { id: 3, question: "Que sont les NAO ?", answer: "Les NAO (Négociations Annuelles Obligatoires) portent sur les salaires, le temps de travail et la qualité de vie au travail.", category: "Négociations", status: "Publié", order: 3 },
  { id: 4, question: "Comment fonctionne le télétravail ?", answer: "Le télétravail est encadré par l'accord d'entreprise signé en 2025. Les modalités précises sont disponibles dans la section Documents.", category: "Organisation", status: "Brouillon", order: 4 },
  { id: 5, question: "Qui peut voter aux élections professionnelles ?", answer: "Tout salarié ayant 3 mois d'ancienneté dans l'entreprise peut voter aux élections professionnelles.", category: "Élections", status: "Publié", order: 5 },
  { id: 6, question: "Comment accéder à mon CPF ?", answer: "Accédez à votre Compte Personnel de Formation sur le site officiel moncompteformation.gouv.fr avec votre numéro de sécurité sociale.", category: "Formation", status: "Publié", order: 6 },
];

const categories = ["Toutes", "Adhésion", "Droits", "Négociations", "Organisation", "Élections", "Formation"];
const emptyForm = (): Omit<FAQ, "id" | "order"> => ({ question: "", answer: "", category: "Droits", status: "Brouillon" });

export default function AdminFAQ() {
  const [faqs, setFaqs] = useState<FAQ[]>(initialFaqs);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Toutes");
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [modal, setModal] = useState<{ mode: "add" | "edit"; item?: FAQ } | null>(null);
  const [form, setForm] = useState<Omit<FAQ, "id" | "order">>(emptyForm());

  const filtered = faqs.filter((f) => {
    const matchCategory = selectedCategory === "Toutes" || f.category === selectedCategory;
    const matchSearch = searchQuery === "" || f.question.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const openAdd = () => { setForm(emptyForm()); setModal({ mode: "add" }); };
  const openEdit = (item: FAQ) => {
    setForm({ question: item.question, answer: item.answer, category: item.category, status: item.status });
    setModal({ mode: "edit", item });
  };

  const handleSave = () => {
    if (!form.question.trim()) { toast.error("Question requise"); return; }
    if (modal?.mode === "add") {
      setFaqs((prev) => [...prev, { ...form, id: Date.now(), order: prev.length + 1 }]);
      toast.success("Question ajoutée");
    } else if (modal?.mode === "edit" && modal.item) {
      setFaqs((prev) => prev.map((f) => f.id === modal.item!.id ? { ...f, ...form } : f));
      toast.success("Question mise à jour");
    }
    setModal(null);
  };

  const handleDelete = (id: number, question: string) => {
    if (window.confirm(`Supprimer cette question définitivement ?`)) {
      setFaqs((prev) => prev.filter((f) => f.id !== id));
      toast.success("Question supprimée");
    }
  };

  const togglePublish = (id: number, current: string) => {
    const next = current === "Publié" ? "Brouillon" : "Publié";
    setFaqs((prev) => prev.map((f) => f.id === id ? { ...f, status: next } : f));
    toast.success(`Question ${next === "Publié" ? "publiée" : "dépubliée"}`);
  };

  const setField = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <AdminAuthGuard>
      <AdminLayout title="FAQ" breadcrumb={["Administration", "FAQ"]}>

        {/* ── Modal ────────────────────────────────────────── */}
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setModal(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <h3 className="font-bold text-slate-900">{modal.mode === "add" ? "Nouvelle question" : "Modifier la question"}</h3>
                <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-4 h-4 text-slate-500" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <Label>Question *</Label>
                  <Input value={form.question} onChange={(e) => setField("question", e.target.value)} placeholder="Comment...?" />
                </div>
                <div className="space-y-1.5">
                  <Label>Réponse</Label>
                  <Textarea value={form.answer} onChange={(e) => setField("answer", e.target.value)} placeholder="Réponse détaillée..." rows={5} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Catégorie</Label>
                    <Select value={form.category} onValueChange={(v) => setField("category", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{["Adhésion","Droits","Négociations","Organisation","Élections","Formation"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Statut</Label>
                    <Select value={form.status} onValueChange={(v) => setField("status", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="Publié">Publié</SelectItem><SelectItem value="Brouillon">Brouillon</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100">
                <Button variant="outline" onClick={() => setModal(null)}>Annuler</Button>
                <Button onClick={handleSave} className="bg-red-600 hover:bg-red-700 text-white gap-2">
                  <Save className="w-4 h-4" />{modal.mode === "add" ? "Ajouter" : "Enregistrer"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── Header ───────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center"><HelpCircle className="w-5 h-5 text-red-600" /></div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Gestion FAQ</h2>
              <p className="text-sm text-slate-500">{faqs.length} questions</p>
            </div>
          </div>
          <Button onClick={openAdd} className="bg-red-600 hover:bg-red-700 text-white">
            <Plus className="w-4 h-4 mr-2" />Nouvelle question
          </Button>
        </div>

        {/* ── Filters ──────────────────────────────────────── */}
        <Card className="border-slate-200 shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input placeholder="Rechercher une question..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
              <Button variant="outline" size="sm" onClick={() => { setSearchQuery(""); setSelectedCategory("Toutes"); }} className="gap-2">
                <Filter className="w-4 h-4" />Réinitialiser
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {categories.map((cat) => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedCategory === cat ? "bg-red-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{cat}</button>
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
                    {["Question", "Catégorie", "Statut", "Actions"].map((h, i) => (
                      <th key={h} className={`p-4 text-sm font-semibold text-slate-600 ${i === 3 ? "text-right" : "text-left"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((f) => (
                    <tr key={f.id} className="border-b border-slate-100">
                      <td className="p-4">
                        <button onClick={() => setOpenFAQ(openFAQ === f.id ? null : f.id)} className="flex items-start gap-3 w-full text-left">
                          {openFAQ === f.id ? <ChevronUp className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />}
                          <div>
                            <p className="font-medium text-slate-900 text-sm">{f.question}</p>
                            {openFAQ === f.id && <p className="text-sm text-slate-500 mt-2 leading-relaxed">{f.answer}</p>}
                          </div>
                        </button>
                      </td>
                      <td className="p-4 align-top pt-5 text-sm text-slate-500">{f.category}</td>
                      <td className="p-4 align-top pt-4">
                        <button onClick={() => togglePublish(f.id, f.status)} title="Cliquer pour changer le statut">
                          <Badge className={`cursor-pointer ${f.status === "Publié" ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-amber-100 text-amber-700 hover:bg-amber-200"}`}>
                            {f.status}
                          </Badge>
                        </button>
                      </td>
                      <td className="p-4 align-top pt-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(f)} title="Modifier"><Edit className="w-4 h-4 text-slate-400 hover:text-blue-600" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(f.id, f.question)} title="Supprimer"><Trash2 className="w-4 h-4 text-slate-400 hover:text-red-600" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-12"><HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-500">Aucune question trouvée</p></div>
            )}
          </CardContent>
        </Card>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
