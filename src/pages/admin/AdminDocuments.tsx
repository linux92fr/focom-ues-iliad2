import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Search, Filter, FolderOpen, Download, Plus, Eye, Trash2, Edit } from "lucide-react";
import AdminLayout, { AdminAuthGuard } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const documents = [
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

export default function AdminDocuments() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Toutes");

  const filteredDocs = documents.filter((doc) => {
    const matchCategory = selectedCategory === "Toutes" || doc.category === selectedCategory;
    const matchSearch = searchQuery === "" || doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "pdf": return <FileText className="w-5 h-5 text-red-500" />;
      case "excel": return <FileText className="w-5 h-5 text-green-500" />;
      default: return <FileText className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <AdminAuthGuard>
      <AdminLayout title="Documents" breadcrumb={["Administration", "Documents"]}>
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Gestion des Documents</h2>
              <p className="text-sm text-slate-500">{documents.length} documents disponibles</p>
            </div>
          </div>
          <Button className="bg-red-600 hover:bg-red-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un document
          </Button>
        </div>

        {/* Search & Filters */}
        <Card className="border-slate-200 shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Rechercher un document..."
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

        {/* Documents List */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Document</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Catégorie</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Taille</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Date</th>
                    <th className="text-right p-4 text-sm font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocs.map((doc) => (
                    <tr key={doc.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {getIcon(doc.type)}
                          <div>
                            <p className="font-medium text-slate-900 text-sm">{doc.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                          {doc.category}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-slate-500">{doc.size}</td>
                      <td className="p-4 text-sm text-slate-500">{doc.date}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" className="text-slate-500 hover:text-teal-600">
                            <Eye className="w-4 h-4" />
                          </Button>
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
            {filteredDocs.length === 0 && (
              <div className="text-center py-12">
                <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Aucun document trouvé</p>
              </div>
            )}
          </CardContent>
        </Card>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
