import { useState } from "react";
import { Shield, Search, Filter, Plus, Edit, Trash2, FileText, Download, X, Save } from "lucide-react";
import AdminLayout, { AdminAuthGuard } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Droit = { id: number; title: string; category: string; status: string; downloads: number; description?: string };

const initialDroits: Droit[] = [
  { id: 1, title: "Droit à la déconnexion", category: "Temps de travail", status: "Actif", downloads: 156, description: "Le droit à la déconnexion garantit aux salariés le droit de ne pas être joignables en dehors de leurs heures de travail." },
  { id: 2, title: "Égalité salariale", category: "Rémunération", status: "Actif", downloads: 234, description: "Principe d'égalité de rémunération entre hommes et femmes pour un même travail ou un travail de valeur égale." },
  { id: 3, title: "Santé & sécurité au travail", category: "Conditions", status: "Actif", downloads: 445, description: "Ensemble des règles visant à protéger la santé physique et mentale des travailleurs." },
  { id: 4, title: "Protection sociale", category: "Avantages", status: "Brouillon", downloads: 0, description: "Couverture des risques sociaux : maladie, maternité, invalidité, vieillesse." },
  { id: 5, title: "Formation continue", category: "Développement", status: "Actif", downloads: 189, description: "Droit à la formation tout au long de la vie professionnelle via le CPF." },
  { id: 6, title: "Télétravail", category: "Organisation", status: "Actif", downloads: 312, description: "Modalités d'exercice du travail à distance, encadrées par accord d'entreprise." },
];

const catList = ["Tous", "Temps de travail", "Rémunération", "Conditions", "Avantages", "Développement", "Organisation"];

const emptyForm = (): Omit<Droit, "id" | "downloads"> => ({
  title: "", category: "Conditions", status: "Actif", description: "",
});

export default function AdminDroits() {
  const [droits, setDroits] = useState<Droit[]>(initialDroits);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [modal, setModal] = useState<{ mode: "add" | "edit"; item?: Droit } | null>(null);
  const [form, setForm] = useState<Omit<Droit, "id" | "downloads">>(emptyForm());

  const filtered = droits.filter((d) => {
    const matchCategory = selectedCategory === "Tous" || d.category === selectedCategory;
    const matchSearch = searchQuery === "" || d.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const openAdd = () => { setForm(emptyForm()); setModal({ mode: "add" }); };
  const openEdit = (item: Droit) => {
    setForm({ title: item.title, category: item.category, status: item.status, description: item.description || "" });
    setModal({ mode: "edit", item });
  };

  const handleSave = () => {
    if (!form.title.trim()) { toast.error("Titre requis"); return; }
    if (modal?.mode === "add") {
      setDroits((prev) => [...prev, { ...form, id: Date.now(), downloads: 0 }]);
      toast.success("Droit ajouté");
    } else if (modal?.mode === "edit" && modal.item) {
      setDroits((prev) => prev.map((d) => d.id === modal.item!.id ? { ...d, ...form } : d));
      toast.success("Droit mis à jour");
    }
    setModal(null);
  };

  const handleDelete = (id: number, title: string) => {
    if (window.confirm(`Supprimer "${title}" définitivement ?`)) {
      setDroits((prev) => prev.filter((d) => d.id !== id));
      toast.success("Droit supprimé");
    }
  };

  const handleDownload = (title: string) => toast.success(`Fiche "${title}" téléchargée`);

  const setField = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <AdminAuthGuard>
      <AdminLayout title="Vos Droits" breadcrumb={["Administration", "Droits"]}>

        {/* ── Modal ────────────────────────────────────────── */}
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setModal(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <h3 className="font-bold text-slate-900">{modal.mode === "add" ? "Nouveau droit" : "Modifier le droit"}</h3>
                <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-4 h-4 text-slate-500" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <Label>Titre *</Label>
                  <Input value={form.title} onChange={(e) => setField("title", e.target.value)} placeholder="Droit à..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Catégorie</Label>
                    <Select value={form.category} onValueChange={(v) => setField("category", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{["Temps de travail","Rémunération","Conditions","Avantages","Développement","Organisation"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Statut</Label>
                    <Select value={form.status} onValueChange={(v) => setField("status", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="Actif">Actif</SelectItem><SelectItem value="Brouillon">Brouillon</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={(e) => setField("description", e.target.value)} placeholder="Décrivez ce droit..." rows={4} />
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
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center"><Shield className="w-5 h-5 text-red-600" /></div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Gestion des Droits</h2>
              <p className="text-sm text-slate-500">{droits.length} droits documentés</p>
            </div>
          </div>
          <Button onClick={openAdd} className="bg-red-600 hover:bg-red-700 text-white">
            <Plus className="w-4 h-4 mr-2" />Nouveau droit
          </Button>
        </div>

        {/* ── Filters ──────────────────────────────────────── */}
        <Card className="border-slate-200 shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input placeholder="Rechercher un droit..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
              <Button variant="outline" size="sm" onClick={() => { setSearchQuery(""); setSelectedCategory("Tous"); }} className="gap-2">
                <Filter className="w-4 h-4" />Réinitialiser
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {catList.map((cat) => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedCategory === cat ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{cat}</button>
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
                    {["Droit", "Catégorie", "Statut", "Téléchargements", "Actions"].map((h, i) => (
                      <th key={h} className={`p-4 text-sm font-semibold text-slate-600 ${i === 4 ? "text-right" : "text-left"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d) => (
                    <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-slate-400" />
                          <div>
                            <p className="font-medium text-slate-900 text-sm">{d.title}</p>
                            {d.description && <p className="text-xs text-slate-400 mt-0.5 max-w-xs truncate">{d.description}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-500">{d.category}</td>
                      <td className="p-4">
                        <Badge className={d.status === "Actif" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>{d.status}</Badge>
                      </td>
                      <td className="p-4 text-sm text-slate-500">{d.downloads}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleDownload(d.title)} title="Télécharger"><Download className="w-4 h-4 text-slate-400 hover:text-teal-600" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => openEdit(d)} title="Modifier"><Edit className="w-4 h-4 text-slate-400 hover:text-blue-600" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(d.id, d.title)} title="Supprimer"><Trash2 className="w-4 h-4 text-slate-400 hover:text-red-600" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-12"><Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-500">Aucun droit trouvé</p></div>
            )}
          </CardContent>
        </Card>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
