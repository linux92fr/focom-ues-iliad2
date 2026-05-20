import { useEffect, useMemo, useState } from "react";
import { FileText, Search, Filter, FolderOpen, Download, Plus, Eye, Trash2, Edit, X, Save, Upload, Loader2 } from "lucide-react";
import AdminLayout, { AdminAuthGuard } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Category = { id: string; name: string };
type Doc = {
  id: string;
  title: string;
  description: string | null;
  file_name: string;
  file_path: string;
  file_size: number | null;
  file_type: string | null;
  category_id: string | null;
  created_at: string;
  document_categories?: { name: string } | null;
};

type ModalMode = "add" | "edit" | "view";
type FormState = { title: string; description: string; category_id: string; file: File | null };

const BUCKET = "documents";
const NO_CATEGORY = "none";
const emptyForm = (): FormState => ({ title: "", description: "", category_id: NO_CATEGORY, file: null });
const formatSize = (bytes?: number | null) => !bytes ? "—" : bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} Ko` : `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
const formatDate = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
const cleanName = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, "-");

export default function AdminDocuments() {
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Toutes");
  const [modal, setModal] = useState<{ mode: ModalMode; item?: Doc } | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());

  const loadData = async () => {
    setLoading(true);
    const [docs, cats] = await Promise.all([
      supabase.from("documents").select("*, document_categories(name)").order("created_at", { ascending: false }),
      supabase.from("document_categories").select("id, name").order("display_order", { ascending: true }),
    ]);
    if (docs.error) {
      console.error(docs.error);
      toast.error("Impossible de charger les documents");
    } else {
      setDocuments((docs.data as Doc[]) || []);
    }
    if (!cats.error) setCategories((cats.data as Category[]) || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const categoryNames = useMemo(() => ["Toutes", ...categories.map((c) => c.name)], [categories]);
  const filtered = documents.filter((doc) => {
    const category = doc.document_categories?.name || "Sans catégorie";
    const q = searchQuery.toLowerCase();
    return (selectedCategory === "Toutes" || category === selectedCategory)
      && (q === "" || doc.title.toLowerCase().includes(q) || doc.file_name.toLowerCase().includes(q) || (doc.description || "").toLowerCase().includes(q));
  });

  const openAdd = () => { setForm(emptyForm()); setModal({ mode: "add" }); };
  const openEdit = (item: Doc) => {
    setForm({ title: item.title, description: item.description || "", category_id: item.category_id || NO_CATEGORY, file: null });
    setModal({ mode: "edit", item });
  };
  const openView = (item: Doc) => setModal({ mode: "view", item });
  const setField = (key: keyof FormState, value: string | File | null) => setForm((old) => ({ ...old, [key]: value }));

  const uploadFile = async (file: File) => {
    const path = `${Date.now()}-${cleanName(file.name)}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type || undefined });
    if (error) throw error;
    return path;
  };

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error("Titre du document requis");
    if (modal?.mode === "add" && !form.file) return toast.error("Fichier requis");
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let fileData = {};
      if (form.file) {
        const filePath = await uploadFile(form.file);
        fileData = { file_name: form.file.name, file_path: filePath, file_size: form.file.size, file_type: form.file.type || null };
      }
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        category_id: form.category_id === NO_CATEGORY ? null : form.category_id,
        uploaded_by: user?.id || null,
        ...fileData,
      };
      if (modal?.mode === "add") {
        const { error } = await supabase.from("documents").insert(payload as never);
        if (error) throw error;
        toast.success("Document ajouté");
      }
      if (modal?.mode === "edit" && modal.item) {
        const oldPath = modal.item.file_path;
        const { error } = await supabase.from("documents").update(payload as never).eq("id", modal.item.id);
        if (error) throw error;
        if (form.file && oldPath) await supabase.storage.from(BUCKET).remove([oldPath]);
        toast.success("Document mis à jour");
      }
      setModal(null);
      await loadData();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (doc: Doc) => {
    if (!window.confirm(`Supprimer "${doc.title}" définitivement ?`)) return;
    const { error } = await supabase.from("documents").delete().eq("id", doc.id);
    if (error) return toast.error("Impossible de supprimer le document");
    if (doc.file_path) await supabase.storage.from(BUCKET).remove([doc.file_path]);
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    toast.success("Document supprimé");
  };

  const handleDownload = (doc: Doc) => {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(doc.file_path);
    if (!data.publicUrl) return toast.error("Lien indisponible");
    window.open(data.publicUrl, "_blank", "noopener,noreferrer");
  };

  const getIcon = (type?: string | null) => {
    const t = (type || "").toLowerCase();
    if (t.includes("pdf")) return <FileText className="w-5 h-5 text-red-500" />;
    if (t.includes("excel") || t.includes("sheet")) return <FileText className="w-5 h-5 text-green-500" />;
    return <FileText className="w-5 h-5 text-slate-500" />;
  };

  return (
    <AdminAuthGuard>
      <AdminLayout title="Documents" breadcrumb={["Administration", "Documents"]}>
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setModal(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <h3 className="font-bold text-slate-900">{modal.mode === "view" ? "Détails du document" : modal.mode === "edit" ? "Modifier le document" : "Ajouter un document"}</h3>
                <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-4 h-4 text-slate-500" /></button>
              </div>
              <div className="p-6 space-y-4">
                {modal.mode === "view" && modal.item ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">{getIcon(modal.item.file_type)}<div><p className="font-semibold text-slate-900">{modal.item.title}</p><p className="text-xs text-slate-400">{modal.item.file_name}</p></div></div>
                    {modal.item.description && <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{modal.item.description}</p>}
                    <div className="flex justify-between text-sm"><span className="text-slate-500">Catégorie</span><span>{modal.item.document_categories?.name || "Sans catégorie"}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500">Taille</span><span>{formatSize(modal.item.file_size)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500">Date</span><span>{formatDate(modal.item.created_at)}</span></div>
                    <Button onClick={() => handleDownload(modal.item!)} className="w-full mt-2 bg-teal-600 hover:bg-teal-700 text-white gap-2"><Download className="w-4 h-4" />Télécharger</Button>
                  </div>
                ) : (
                  <>
                    <label className="block border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-red-300 cursor-pointer">
                      <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">{form.file ? form.file.name : "Choisir un fichier"}</p>
                      <input type="file" className="hidden" onChange={(e) => setField("file", e.target.files?.[0] || null)} />
                    </label>
                    <div className="space-y-1.5"><Label>Titre *</Label><Input value={form.title} onChange={(e) => setField("title", e.target.value)} /></div>
                    <div className="space-y-1.5"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setField("description", e.target.value)} rows={3} /></div>
                    <div className="space-y-1.5"><Label>Catégorie</Label><Select value={form.category_id} onValueChange={(v) => setField("category_id", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value={NO_CATEGORY}>Sans catégorie</SelectItem>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
                  </>
                )}
              </div>
              {modal.mode !== "view" && <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100"><Button variant="outline" onClick={() => setModal(null)} disabled={saving}>Annuler</Button><Button onClick={handleSave} disabled={saving} className="bg-red-600 hover:bg-red-700 text-white gap-2">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{modal.mode === "add" ? "Ajouter" : "Enregistrer"}</Button></div>}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center"><FolderOpen className="w-5 h-5 text-teal-600" /></div><div><h2 className="text-lg font-bold text-slate-900">Gestion des Documents</h2><p className="text-sm text-slate-500">{documents.length} documents disponibles</p></div></div>
          <Button onClick={openAdd} className="bg-red-600 hover:bg-red-700 text-white"><Plus className="w-4 h-4 mr-2" />Ajouter un document</Button>
        </div>

        <Card className="border-slate-200 shadow-sm mb-6"><CardContent className="p-4"><div className="flex flex-col sm:flex-row gap-3"><div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input placeholder="Rechercher un document..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div><Button variant="outline" size="sm" onClick={() => { setSearchQuery(""); setSelectedCategory("Toutes"); }} className="gap-2"><Filter className="w-4 h-4" />Réinitialiser</Button></div><div className="flex flex-wrap gap-2 mt-3">{categoryNames.map((cat) => <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1.5 rounded-full text-xs font-medium ${selectedCategory === cat ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{cat}</button>)}</div></CardContent></Card>

        <Card className="border-slate-200 shadow-sm"><CardContent className="p-0">{loading ? <div className="flex items-center justify-center py-16 gap-3 text-slate-400"><Loader2 className="w-5 h-5 animate-spin" />Chargement…</div> : <div className="overflow-x-auto"><table className="w-full"><thead className="bg-slate-50 border-b border-slate-200"><tr>{["Document", "Catégorie", "Taille", "Date", "Actions"].map((h, i) => <th key={h} className={`p-4 text-sm font-semibold text-slate-600 ${i === 4 ? "text-right" : "text-left"}`}>{h}</th>)}</tr></thead><tbody>{filtered.map((doc) => <tr key={doc.id} className="border-b border-slate-100 hover:bg-slate-50"><td className="p-4"><div className="flex items-center gap-3">{getIcon(doc.file_type)}<div><p className="font-medium text-slate-900 text-sm">{doc.title}</p><p className="text-xs text-slate-400">{doc.file_name}</p></div></div></td><td className="p-4"><Badge variant="secondary" className="text-[10px]">{doc.document_categories?.name || "Sans catégorie"}</Badge></td><td className="p-4 text-sm text-slate-500">{formatSize(doc.file_size)}</td><td className="p-4 text-sm text-slate-500">{formatDate(doc.created_at)}</td><td className="p-4"><div className="flex items-center justify-end gap-1"><Button variant="ghost" size="sm" onClick={() => openView(doc)}><Eye className="w-4 h-4 text-slate-400 hover:text-teal-600" /></Button><Button variant="ghost" size="sm" onClick={() => handleDownload(doc)}><Download className="w-4 h-4 text-slate-400 hover:text-teal-600" /></Button><Button variant="ghost" size="sm" onClick={() => openEdit(doc)}><Edit className="w-4 h-4 text-slate-400 hover:text-blue-600" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(doc)}><Trash2 className="w-4 h-4 text-slate-400 hover:text-red-600" /></Button></div></td></tr>)}</tbody></table></div>}{!loading && filtered.length === 0 && <div className="text-center py-12"><FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-500">Aucun document trouvé</p></div>}</CardContent></Card>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
