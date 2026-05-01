import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart3, TrendingUp, FileText, Download, Plus, Edit, Trash2 } from "lucide-react";
import AdminLayout, { AdminAuthGuard } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useState(() => {
    let start = 0;
    const duration = 1500;
    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.floor(eased * target);
      setCount(start);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  });
  return <div className="text-3xl font-extrabold text-red-600">{count}{suffix}</div>;
}

const stats = [
  { label: "Accords signés", value: 42, suffix: "", icon: FileText, color: "bg-teal-50 text-teal-600" },
  { label: "Réunions CSE", value: 78, suffix: "", icon: BarChart3, color: "bg-red-50 text-red-600" },
  { label: "Dossiers traités", value: 126, suffix: "", icon: FileText, color: "bg-teal-50 text-teal-600" },
  { label: "Taux de participation", value: 100, suffix: "%", icon: TrendingUp, color: "bg-red-50 text-red-600" },
];

const bilans = [
  { id: 1, title: "Bilan 2022-2023", period: "2022-2023", status: "Publié", downloads: 234 },
  { id: 2, title: "Bilan 2023-2024", period: "2023-2024", status: "Publié", downloads: 567 },
  { id: 3, title: "Bilan 2024-2025", period: "2024-2025", status: "Brouillon", downloads: 0 },
  { id: 4, title: "Bilan 2025-2026", period: "2025-2026", status: "En cours", downloads: 0 },
];

export default function AdminBilan() {
  const navigate = useNavigate();

  return (
    <AdminAuthGuard>
      <AdminLayout title="Bilan de Mandat" breadcrumb={["Administration", "Bilan"]}>
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-slate-200 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Progress Bars */}
        <Card className="border-slate-200 shadow-sm mb-6">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-900">Nos avancées principales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-700">Pouvoir d'achat</span>
                <span className="text-slate-500">85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-700">Conditions de travail</span>
                <span className="text-slate-500">90%</span>
              </div>
              <Progress value={90} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-700">Égalité professionnelle</span>
                <span className="text-slate-500">75%</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-700">Gestion des emplois</span>
                <span className="text-slate-500">80%</span>
              </div>
              <Progress value={80} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Bilans */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold text-slate-900">Bilan de mandat</CardTitle>
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau bilan
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Titre</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Période</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Statut</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">Téléchargements</th>
                    <th className="text-right p-4 text-sm font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bilans.map((b) => (
                    <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-slate-400" />
                          <div>
                            <p className="font-medium text-slate-900 text-sm">{b.title}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-500">{b.period}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          b.status === "Publié" ? "bg-green-100 text-green-700" :
                          b.status === "Brouillon" ? "bg-amber-100 text-amber-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-500">{b.downloads}</td>
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
          </CardContent>
        </Card>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
