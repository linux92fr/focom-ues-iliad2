import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HelpCircle, Search, Filter, Plus, Edit, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import AdminLayout, { AdminAuthGuard } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const faqs = [
  { id: 1, question: "Comment adhérer à la FOCOM ?", category: "Adhésion", status: "Publié", order: 1 },
  { id: 2, question: "Qu'est-ce que le droit à la déconnexion ?", category: "Droits", status: "Publié", order: 2 },
  { id: 3, question: "Que sont les NAO ?", category: "Négociations", status: "Publié", order: 3 },
  { id: 4, question: "Comment fonctionne le télétravail ?", category: "Organisation", status: "Brouillon", order: 4 },
  { id: 5, question: "Qui peut voter aux élections professionnelles ?", category: "Élections", status: "Publié", order: 5 },
  { id: 6, question: "Comment accéder à mon CPF ?", category: "Formation", status: "Publié", order: 6 },
];

const categories = ["Toutes", "Adhésion", "Droits", "Négociations", "Organisation", "Élections", "Formation"];

export default function AdminFAQ() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Toutes");
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const filtered = faqs.filter((f) => {
    const matchCategory = selectedCategory === "Toutes" || f.category === selectedCategory;
    const matchSearch = searchQuery === "" || f.question.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const toggleFAQ = (id: number) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <AdminAuthGuard>
      <AdminLayout title="FAQ" breadcrumb={["Administration", "FAQ"]}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Gestion FAQ</h2>
              <p className="text-sm text-slate-500">{faqs.length} questions</p>
            </div>
          </div>
          <Button className="bg-red-600 hover:bg-red-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle question
          </Button>
        </div>

        <Card className="border-slate-200 shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Rechercher une question..."
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
                      ? "bg-red-600 text-white"
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
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Question</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Catégorie</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Statut</th>
                    <th className="text-right p-4 text-sm font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((f) => (
                    <tr key={f.id} className="border-b border-slate-100">
                      <td className="p-4">
                        <button
                          onClick={() => toggleFAQ(f.id)}
                          className="flex items-start gap-3 w-full text-left"
                        >
                          {openFAQ === f.id ? (
                            <ChevronUp className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                          )}
                          <div>
                            <p className="font-medium text-slate-900 text-sm">{f.question}</p>
                            {openFAQ === f.id && (
                              <p className="text-sm text-slate-500 mt-2">
                                Réponse détaillée à la question sélectionnée. Cette section peut être éditée pour fournir une réponse complète aux adhérents.
                              </p>
                            )}
                          </div>
                        </button>
                      </td>
                      <td className="p-4 text-sm text-slate-500">{f.category}</td>
                      <td className="p-4">
                        <Badge className={f.status === "Publié" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
                          {f.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
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
                <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Aucune question trouvée</p>
              </div>
            )}
          </CardContent>
        </Card>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
