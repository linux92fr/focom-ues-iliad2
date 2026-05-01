import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Search, Filter, Plus, Edit, Trash2, FileText, Download } from "lucide-react";
import AdminLayout, { AdminAuthGuard } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const droits = [
  { id: 1, title: "Droit à la déconnexion", category: "Temps de travail", status: "Actif", downloads: 156 },
  { id: 2, title: "Égalité salariale", category: "Rémunération", status: "Actif", downloads: 234 },
  { id: 3, title: "Santé & sécurité au travail", category: "Conditions", status: "Actif", downloads: 445 },
  { id: 4, title: "Protection sociale", category: "Avantages", status: "Brouillon", downloads: 0 },
  { id: 5, title: "Formation continue", category: "Développement", status: "Actif", downloads: 189 },
  { id: 6, title: "Télétravail", category: "Organisation", status: "Actif", downloads: 312 },
];

const categories = ["Tous", "Temps de travail", "Rémunération", "Conditions", "Avantages", "Développement", "Organisation"];

export default function AdminDroits() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");

  const filtered = droits.filter((d) => {
    const matchCategory = selectedCategory === "Tous" || d.category === selectedCategory;
    const matchSearch = searchQuery === "" || d.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <AdminAuthGuard>
      <AdminLayout title="Vos Droits" breadcrumb={["Administration", "Droits"]}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Gestion des Droits</h2>
              <p className="text-sm text-slate-500">{droits.length} droits documentés</p>
            </div>
          </div>
          <Button className="bg-red-600 hover:bg-red-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau droit
          </Button>
        </div>

        <Card className="border-slate-200 shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Rechercher un droit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-500 hidden sm:inline">Filtrer :</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedCategory === cat
                      ? "bg-teal-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat}
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
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Droit</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Catégorie</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Statut</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Téléchargements</th>
                    <th className="text-right p-4 text-sm font-semibold text-slate-600">Actions</th>
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
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-500">{d.category}</td>
                      <td className="p-4">
                        <Badge className={d.status === "Actif" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
                          {d.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-slate-500">{d.downloads}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" className="text-slate-500 hover:text-teal-600">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-slate-500 hover:text-blue-600">
                            <Edit className="w-4 h-4" />
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
                <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Aucun droit trouvé</p>
              </div>
            )}
          </CardContent>
        </Card>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
