import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Save, ArrowLeft, Image as ImageIcon, Link as LinkIcon, FileText, Eye, Plus, Trash2, Edit2 } from "lucide-react";
import AdminLayout, { AdminAuthGuard } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminHomeEdit() {
  const navigate = useNavigate();
  const [heroTitle, setHeroTitle] = useState("Ensemble, connectés, plus forts.");
  const [heroSubtitle, setHeroSubtitle] = useState("Le syndicat des travailleurs et travailleuses des télécommunications. Notre force, c'est l'union.");
  const [sections, setSections] = useState([
    { id: 1, title: "Vos Droits", icon: "Shield", order: 1, active: true },
    { id: 2, title: "Actualités", icon: "FileText", order: 2, active: true },
    { id: 3, title: "Bilan de Mandat", icon: "BarChart3", order: 3, active: true },
    { id: 4, title: "Espace Adhérent", icon: "Users", order: 4, active: true },
    { id: 5, title: "Documents Utiles", icon: "FileText", order: 5, active: true },
    { id: 6, title: "FAQ", icon: "HelpCircle", order: 6, active: true },
    { id: 7, title: "Nous Contacter", icon: "MessageSquare", order: 7, active: true },
  ]);

  const handleSave = () => {
    console.log("Configuration sauvegardée");
  };

  return (
    <AdminAuthGuard>
      <AdminLayout title="Édition Home" breadcrumb={["Administration", "Édition Home"]}>
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
          {/* Hero Section */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Section Hero
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="heroTitle">Titre principal</Label>
                <Input
                  id="heroTitle"
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  placeholder="Titre principal"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heroSubtitle">Sous-titre</Label>
                <Textarea
                  id="heroSubtitle"
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  placeholder="Sous-titre"
                  rows={3}
                />
              </div>
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500 mb-2">Aperçu :</p>
                <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-4 text-white">
                  <h3 className="text-lg font-bold mb-2">{heroTitle}</h3>
                  <p className="text-sm opacity-90">{heroSubtitle}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Sections */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Sections de navigation
                </span>
                <Button size="sm" variant="outline" className="text-xs">
                  <Plus className="w-3 h-3 mr-1" />
                  Ajouter
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sections.map((section) => (
                  <div key={section.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                    <div className="w-6 h-6 rounded bg-teal-100 flex items-center justify-center text-xs text-teal-600">
                      {section.order}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{section.title}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-blue-600 p-1">
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-red-600 p-1">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-slate-200 shadow-sm lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-900">Statistiques affichées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">42</p>
                  <p className="text-xs text-slate-500">Accords signés</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">78</p>
                  <p className="text-xs text-slate-500">Réunions CSE</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">126</p>
                  <p className="text-xs text-slate-500">Dossiers traités</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">100%</p>
                  <p className="text-xs text-slate-500">Présents</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <Button onClick={handleSave} className="bg-red-600 hover:bg-red-700 text-white">
            <Save className="w-4 h-4 mr-2" />
            Enregistrer les modifications
          </Button>
          <Button variant="outline" className="border-slate-200">
            <Eye className="w-4 h-4 mr-2" />
            Aperçu
          </Button>
        </div>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
