import { Newspaper, Plus, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import AdminLayout, { AdminAuthGuard } from "@/components/admin/AdminLayout";

const articles = [
  {
    id: 1,
    title: "NAO 2026 : Résultats des négociations",
    date: "28 avr. 2026",
    status: "Publié",
    category: "Social",
  },
  {
    id: 2,
    title: "Élections professionnelles : Mode d'emploi",
    date: "25 avr. 2026",
    status: "Publié",
    category: "Élections",
  },
  {
    id: 3,
    title: "Bilan social 2025 : Les chiffres clés",
    date: "20 avr. 2026",
    status: "Brouillon",
    category: "Bilan",
  },
];

const statusColor: Record<string, string> = {
  Publié: "bg-green-100 text-green-700",
  Brouillon: "bg-amber-100 text-amber-700",
};

export default function AdminActualites() {
  return (
    <AdminAuthGuard>
      <AdminLayout title="Actualités" breadcrumb={["Administration", "Actualités"]}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <Newspaper className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Gestion des actualités</h2>
              <p className="text-sm text-slate-500">{articles.length} article{articles.length > 1 ? "s" : ""}</p>
            </div>
          </div>
          <Button className="bg-red-600 hover:bg-red-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Nouvel article
          </Button>
        </div>

        {/* Filters */}
        <Card className="border-slate-200 shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input placeholder="Rechercher un article..." className="pl-10" />
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                Filtrer
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Articles list */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-900">
              Articles récents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {articles.map((article) => (
                <div
                  key={article.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{article.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-400">{article.date}</span>
                      <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                        {article.category}
                      </Badge>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor[article.status]}`}>
                    {article.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
