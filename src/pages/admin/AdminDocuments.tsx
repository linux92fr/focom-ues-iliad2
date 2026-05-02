import { FileText, Plus, Search, Filter, Download, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import AdminLayout, { AdminAuthGuard } from "@/components/admin/AdminLayout";

const documents = [
  {
    id: 1,
    title: "GEPP Guide 2026",
    date: "15 avr. 2026",
    category: "RH",
    size: "2,4 Mo",
    type: "PDF",
  },
  {
    id: 2,
    title: "Accord NAO 2025",
    date: "10 avr. 2026",
    category: "Social",
    size: "1,1 Mo",
    type: "PDF",
  },
  {
    id: 3,
    title: "Procès-verbal CE Mars 2026",
    date: "2 avr. 2026",
    category: "CSE",
    size: "560 Ko",
    type: "PDF",
  },
  {
    id: 4,
    title: "Calendrier élections 2026",
    date: "28 mar. 2026",
    category: "Élections",
    size: "320 Ko",
    type: "PDF",
  },
  {
    id: 5,
    title: "Bilan social 2025",
    date: "20 mar. 2026",
    category: "Bilan",
    size: "3,8 Mo",
    type: "PDF",
  },
];

const categoryColor: Record<string, string> = {
  RH: "bg-blue-100 text-blue-700",
  Social: "bg-green-100 text-green-700",
  CSE: "bg-purple-100 text-purple-700",
  Élections: "bg-red-100 text-red-700",
  Bilan: "bg-amber-100 text-amber-700",
};

export default function AdminDocuments() {
  return (
    <AdminAuthGuard>
      <AdminLayout title="Documents" breadcrumb={["Administration", "Documents"]}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Gestion des documents</h2>
              <p className="text-sm text-slate-500">{documents.length} document{documents.length > 1 ? "s" : ""}</p>
            </div>
          </div>
          <Button className="bg-teal-600 hover:bg-teal-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un document
          </Button>
        </div>

        {/* Filters */}
        <Card className="border-slate-200 shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input placeholder="Rechercher un document..." className="pl-10" />
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                Filtrer
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Documents list */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-900">
              Documents récents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{doc.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-400">{doc.date}</span>
                        <span className="text-xs text-slate-400">{doc.size}</span>
                        <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${categoryColor[doc.category]}`}>
                          {doc.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-slate-400 hover:text-teal-600">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-slate-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
