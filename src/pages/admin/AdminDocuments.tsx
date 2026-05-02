import { useState } from "react";
import { FileText, Search, Filter, FolderOpen, Download, Plus, Eye, Trash2, Edit, X, Save, Upload } from "lucide-react";
import AdminLayout, { AdminAuthGuard } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Doc = { id: number; name: string; category: string; size: string; date: string; type: string };

const initialDocuments: Doc[] = [
  { id: 1, name: "Accord NAO 2026.pdf", category: "Accords", size: "2.4 MB", date: "28 oct. 2025", type: "pdf" },
  { id: 2, name: "Bilan Social 2025.xlsx", category: "Rapports", size: "4.2 MB", date: "10 sept. 2025", type: "excel" },
  { id: 3, name: "Procès-verbal CSE Octobre.pdf", category: "CSE", size: "856 KB", date: "20 oct. 2025", type: "pdf" },
  { id: 4, name: "Guide Formation 2025-2026.pdf", category: "Formation", size: "3.5 MB", date: "1 sept. 2025", type: "pdf" },
  { id: 5, name: "Accord Télétravail 2025.pdf", category: "Accords", size: "1.1 MB", date: "5 sept. 2025", type: "pdf" },
  { id: 6, name: "Convention Collective.pdf", category: "Textes", size: "5.8 MB", date: "1 janv. 2025", type: "pdf" },
  { id: 7, name: "Accord QVT 2025.pdf", category: "Accords", size: "1.5 MB", date: "15 mars 2025", type: "pdf" },
  { id: 8, name: "Rapport d'activité 2024.xlsx", category: "Rapports", size: "2.1 MB", date: "31 déc. 2024", type: "excel" },
];

const categories = ["Toutes", "Accords", "CSE", "Rapports", "Formation", "Textes"];

const emptyForm = (): Omit<Doc, "id"> => ({
  name: "", category: "Accords", size: "—", date: new Date().toLocaleDateString("fr-FR"), type: "pdf",
});

type ModalMode = "add" | "edit" | "view";

export default function AdminDocuments() {
  const [documents, setDocuments] = useState<Doc[]>(initialDocuments);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Toutes");
  const [modal, setModal] = useState<{ mode: ModalMode; item?: Doc } | null>(null);
  const [form, setForm] = useState<Omit<Doc, "id">>(emptyForm());

  const filtered = documents.filter((doc) => {
    const matchCategory = selectedCategory === "Toutes" || doc.category === selectedCategory;
    const matchSearch = searchQuery === "" || doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const openAdd = () => { setForm(emptyForm()); setModal({ mode: "add" }); };
  const openEdit = (item: Doc) => { setForm({ name: item.name, category: item.category, size: item.size, date: item.date, type: item.type }); setModal({ mode: "edit", item }); };
  const openView = (item: Doc) => setModal({ mode: "view", item });

  const handleSave = () => {
    if (!form.name.trim()) { toast.error("Nom du document requis"); return; }
    if (modal?.mode === "add") {
      setDocuments((prev) => [...prev, { ...form, id: Date.now() }]);
      toast.success("Document ajouté");
    } else if (modal?.mode === "edit" && modal.item) {
      setDocuments((prev) => prev.map((d) => d.id === modal.item!.id ? { ...d, ...form } : d));
      toast.success("Document mis à jour");
    }
    setModal(null);
  };

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Supprimer "${name}" définitivement ?`)) {
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      toast.success("Document supprimé");
    }
  };

  const handleDownload = (name: string) => toast.success(`Téléchargement de "${name}" démarré`);

  const setField = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const getIcon = (type: string) => {
    if (type === "pdf") return <FileText className="w-5 h-5 text-red-500" />;
    if (type === "excel") return <FileText className="w-5 h-5 text-green-500" />;
    return <FileText className="w-5 h-5 text-slate-500" />;
  };

  return (
    <AdminAuthGuard>
      <AdminLayout title="Documents" breadcrumb={["Administration", "Documents"]}>

        {/* ── Modal ────────────────────────────────────────── */}
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setModal(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <h3 className="font-bold text-slate-900">
                  {modal.mode === "view" ? "Détails du document" : modal.mode === "edit" ? "Modifier le document" : "Ajouter un document"}
                </h3>
                <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-4 h-4 text-slate-500" /></button>
              </div>

              <div className="p-6 space-y-4">
                {modal.mode === "view" && modal.item ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                      {getIcon(modal.item.type)}
                      <p className="font-semibold text-slate-900">{modal.item.name}</p>
                    </div>
                    {[["Catégorie", modal.item.category], ["Taille", modal.item.size], ["Date", modal.item.date], ["Type", modal.item.type.toUpperCase()]].map(([k, v]) => (
                      <div key={k} className="flex justify-between text-sm">
                        <span className="text-slate-500">{k}</span>
                        <span className="font-medium text-slate-900">{v}</span>
                      </div>
                    ))}
                    <Button onClick={() => handleDownload(modal.item!.name)} className="w-full mt-2 bg-teal-600 hover:bg-teal-700 text-white gap-2">
                      <Download className="w-4 h-4" />Télécharger
                    </Button>
                  </div>
                ) : (
                  <>
                    {modal.mode === "add" && (
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-red-300 transition-colors cursor-pointer">
                        <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Glisser un fichier ou <span className="text-red-600 font-medium">parcourir</span></p>
                        <p className="text-xs text-slate-400 mt-1">PDF, DOCX, XLSX — max 20 MB</p>
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <Label>Nom du document *</Label>
                      <Input value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="Accord NAO 2026.pdf" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>Catégorie</Label>
                        <Select value={form.category} onValueChange={(v) => setField("category", v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{["Accords","CSE","Rapports","Formation","Textes"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Type</Label>
                        <Select value={form.type} onValueChange={(v) => setField("type", v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="pdf">PDF</SelectItem><SelectItem value="excel">Excel</SelectItem><SelectItem value="word">Word</SelectItem></SelectContent>
                        </Select>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {modal.mode !== "view" && (
                <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100">
                  <Button variant="outline" onClick={() => setModal(null)}>Annuler</Button>
                  <Button onClick={handleSave} className="bg-red-600 hover:bg-red-700 text-white gap-2">
                    <Save className="w-4 h-4" />{modal.mode === "add" ? "Ajouter" : "Enregistrer"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Header ───────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center"><FolderOpen className="w-5 h-5 text-teal-600" /></div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Gestion des Documents</h2>
              <p className="text-sm text-slate-500">{documents.length} documents disponibles</p>
            </div>
          </div>
          <Button onClick={openAdd} className="bg-red-600 hover:bg-red-700 text-white">
            <Plus className="w-4 h-4 mr-2" />Ajouter un document
          </Button>
        </div>

        {/* ── Filters ──────────────────────────────────────── */}
        <Card className="border-slate-200 shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input placeholder="Rechercher un document..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
              <Button variant="outline" size="sm" onClick={() => { setSearchQuery(""); setSelectedCategory("Toutes"); }} className="gap-2">
                <Filter className="w-4 h-4" />Réinitialiser
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {categories.map((cat) => (
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
                    {["Document", "Catégorie", "Taille", "Date", "Actions"].map((h, i) => (
                      <th key={h} className={`p-4 text-sm font-semibold text-slate-600 ${i === 4 ? "text-right" : "text-left"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((doc) => (
                    <tr key={doc.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {getIcon(doc.type)}
                          <p className="font-medium text-slate-900 text-sm">{doc.name}</p>
                        </div>
                      </td>
                      <td className="p-4"><Badge variant="secondary" className="text-[10px] px-2 py-0.5">{doc.category}</Badge></td>
                      <td className="p-4 text-sm text-slate-500">{doc.size}</td>
                      <td className="p-4 text-sm text-slate-500">{doc.date}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openView(doc)} title="Voir"><Eye className="w-4 h-4 text-slate-400 hover:text-teal-600" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDownload(doc.name)} title="Télécharger"><Download className="w-4 h-4 text-slate-400 hover:text-teal-600" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => openEdit(doc)} title="Modifier"><Edit className="w-4 h-4 text-slate-400 hover:text-blue-600" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(doc.id, doc.name)} title="Supprimer"><Trash2 className="w-4 h-4 text-slate-400 hover:text-red-600" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-12"><FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-500">Aucun document trouvé</p></div>
            )}
          </CardContent>
        </Card>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
