import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Save, ArrowLeft, Image as ImageIcon, Link as LinkIcon, Eye, Plus, Trash2, Edit2, GripVertical, Check, X } from "lucide-react";
import AdminLayout, { AdminAuthGuard } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Section = { id: number; title: string; icon: string; order: number; active: boolean };

const initialSections: Section[] = [
  { id: 1, title: "Vos Droits", icon: "Shield", order: 1, active: true },
  { id: 2, title: "Actualités", icon: "FileText", order: 2, active: true },
  { id: 3, title: "Bilan de Mandat", icon: "BarChart3", order: 3, active: true },
  { id: 4, title: "Espace Adhérent", icon: "Users", order: 4, active: true },
  { id: 5, title: "Documents Utiles", icon: "FileText", order: 5, active: true },
  { id: 6, title: "FAQ", icon: "HelpCircle", order: 6, active: true },
  { id: 7, title: "Nous Contacter", icon: "MessageSquare", order: 7, active: true },
];

export default function AdminHomeEdit() {
  const navigate = useNavigate();
  const [heroTitle, setHeroTitle] = useState("Ensemble, connectés, plus forts.");
  const [heroSubtitle, setHeroSubtitle] = useState("Le syndicat des travailleurs et travailleuses des télécommunications. Notre force, c'est l'union.");
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [saved, setSaved] = useState(false);

  /* Inline edit state for sections */
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  /* New section form */
  const [addingSection, setAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");

  const handleSave = () => {
    // In production: persist to Supabase / API
    setSaved(true);
    toast.success("Modifications enregistrées avec succès");
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePreview = () => {
    window.open("/", "_blank");
  };

  const startEdit = (section: Section) => {
    setEditingId(section.id);
    setEditingTitle(section.title);
  };

  const confirmEdit = (id: number) => {
    if (!editingTitle.trim()) { toast.error("Le titre ne peut pas être vide"); return; }
    setSections((prev) => prev.map((s) => s.id === id ? { ...s, title: editingTitle } : s));
    setEditingId(null);
    toast.success("Section renommée");
  };

  const cancelEdit = () => setEditingId(null);

  const deleteSection = (id: number, title: string) => {
    if (window.confirm(`Supprimer la section "${title}" ?`)) {
      setSections((prev) => prev.filter((s) => s.id !== id).map((s, i) => ({ ...s, order: i + 1 })));
      toast.success("Section supprimée");
    }
  };

  const toggleSection = (id: number) => {
    setSections((prev) => prev.map((s) => s.id === id ? { ...s, active: !s.active } : s));
  };

  const addSection = () => {
    if (!newSectionTitle.trim()) { toast.error("Titre requis"); return; }
    setSections((prev) => [...prev, { id: Date.now(), title: newSectionTitle, icon: "FileText", order: prev.length + 1, active: true }]);
    setNewSectionTitle("");
    setAddingSection(false);
    toast.success("Section ajoutée");
  };

  return (
    <AdminAuthGuard>
      <AdminLayout title="Édition Home" breadcrumb={["Administration", "Édition Home"]}>
        {/* ── Page header ──────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Home className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Édition de la page d'accueil</h2>
            <p className="text-sm text-slate-500">Personnalisez le contenu de la page d'accueil</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── Hero section ──────────────────────────────── */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />Section Hero
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="heroTitle">Titre principal</Label>
                <Input id="heroTitle" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} placeholder="Titre principal" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heroSubtitle">Sous-titre</Label>
                <Textarea id="heroSubtitle" value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} placeholder="Sous-titre" rows={3} />
              </div>
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500 mb-2">Aperçu en direct :</p>
                <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-4 text-white">
                  <h3 className="text-lg font-bold mb-2">{heroTitle || "Titre…"}</h3>
                  <p className="text-sm opacity-90">{heroSubtitle || "Sous-titre…"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Navigation sections ───────────────────────── */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center justify-between">
                <span className="flex items-center gap-2"><LinkIcon className="w-4 h-4" />Sections de navigation</span>
                <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => setAddingSection(true)}>
                  <Plus className="w-3 h-3" />Ajouter
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sections.map((section) => (
                  <div key={section.id} className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${section.active ? "bg-slate-50" : "bg-slate-100 opacity-60"}`}>
                    <GripVertical className="w-4 h-4 text-slate-300 flex-shrink-0 cursor-grab" />
                    <div className="w-6 h-6 rounded bg-teal-100 flex items-center justify-center text-xs text-teal-600 flex-shrink-0">{section.order}</div>

                    {editingId === section.id ? (
                      <div className="flex-1 flex items-center gap-1">
                        <Input
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="h-7 text-sm py-0"
                          autoFocus
                          onKeyDown={(e) => { if (e.key === "Enter") confirmEdit(section.id); if (e.key === "Escape") cancelEdit(); }}
                        />
                        <button onClick={() => confirmEdit(section.id)} className="p-1 rounded hover:bg-green-100 text-green-600"><Check className="w-3.5 h-3.5" /></button>
                        <button onClick={cancelEdit} className="p-1 rounded hover:bg-red-100 text-red-500"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ) : (
                      <>
                        <p className="flex-1 text-sm font-medium text-slate-900">{section.title}</p>
                        <div className="flex items-center gap-1">
                          <button onClick={() => toggleSection(section.id)} className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${section.active ? "bg-green-200 text-green-700" : "bg-slate-200 text-slate-400"}`} title={section.active ? "Masquer" : "Afficher"}>
                            <span className="text-[9px] font-bold">{section.active ? "ON" : "OFF"}</span>
                          </button>
                          <Button variant="ghost" size="sm" className="p-1 h-auto" onClick={() => startEdit(section)} title="Renommer"><Edit2 className="w-3 h-3 text-slate-400 hover:text-blue-600" /></Button>
                          <Button variant="ghost" size="sm" className="p-1 h-auto" onClick={() => deleteSection(section.id, section.title)} title="Supprimer"><Trash2 className="w-3 h-3 text-slate-400 hover:text-red-600" /></Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {/* Inline add form */}
                {addingSection && (
                  <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="w-6 h-6 rounded bg-teal-100 flex items-center justify-center text-xs text-teal-600 flex-shrink-0">{sections.length + 1}</div>
                    <Input
                      value={newSectionTitle}
                      onChange={(e) => setNewSectionTitle(e.target.value)}
                      className="h-7 text-sm py-0 flex-1"
                      placeholder="Nom de la section..."
                      autoFocus
                      onKeyDown={(e) => { if (e.key === "Enter") addSection(); if (e.key === "Escape") setAddingSection(false); }}
                    />
                    <button onClick={addSection} className="p-1 rounded hover:bg-green-100 text-green-600"><Check className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setAddingSection(false)} className="p-1 rounded hover:bg-red-100 text-red-500"><X className="w-3.5 h-3.5" /></button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ── Quick Stats ───────────────────────────────── */}
          <Card className="border-slate-200 shadow-sm lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-900">Statistiques affichées sur l'accueil</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[["42", "Accords signés"], ["78", "Réunions CSE"], ["126", "Dossiers traités"], ["100%", "Présents"]].map(([val, label]) => (
                  <div key={label} className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">{val}</p>
                    <p className="text-xs text-slate-500">{label}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-3">Ces statistiques proviennent du module Bilan. Modifiez-les dans la section Bilan de l'administration.</p>
            </CardContent>
          </Card>
        </div>

        {/* ── Actions ──────────────────────────────────────── */}
        <div className="mt-6 flex gap-3">
          <Button onClick={handleSave} className={`gap-2 ${saved ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"} text-white transition-colors`}>
            {saved ? <><Check className="w-4 h-4" />Enregistré !</> : <><Save className="w-4 h-4" />Enregistrer les modifications</>}
          </Button>
          <Button variant="outline" onClick={handlePreview} className="border-slate-200 gap-2">
            <Eye className="w-4 h-4" />Aperçu du site
          </Button>
        </div>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
