import { Users, Newspaper, FileText, MessageSquare, TrendingUp, TrendingDown, Eye, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Link } from "react-router-dom";
import AdminLayout, { AdminAuthGuard } from "@/components/admin/AdminLayout";

const visitData = [
  { month: "Nov", visites: 820 },
  { month: "Déc", visites: 950 },
  { month: "Jan", visites: 1100 },
  { month: "Fév", visites: 890 },
  { month: "Mar", visites: 1250 },
  { month: "Avr", visites: 1420 },
  { month: "Mai", visites: 1680 },
];

const sectionData = [
  { section: "Accueil", vues: 1240 },
  { section: "Actualités", vues: 860 },
  { section: "Bilan", vues: 540 },
  { section: "Documents", vues: 420 },
  { section: "Contact", vues: 310 },
];

const recentActivity = [
  { type: "article", text: "Nouvel article publié : NAO 2026", time: "Il y a 2h", status: "success" },
  { type: "member", text: "Nouveau message de contact reçu", time: "Il y a 5h", status: "info" },
  { type: "document", text: "Document mis à jour : GEPP Guide", time: "Il y a 1j", status: "warning" },
  { type: "article", text: "Article mis en avant : Élections 2026", time: "Il y a 2j", status: "success" },
  { type: "member", text: "Nouveau formulaire d'adhésion", time: "Il y a 3j", status: "info" },
];

const statCards = [
  {
    title: "Adhérents actifs",
    value: "1 247",
    change: "+5,2%",
    positive: true,
    icon: Users,
    color: "text-teal-600 bg-teal-50",
  },
  {
    title: "Articles publiés",
    value: "38",
    change: "+3 ce mois",
    positive: true,
    icon: Newspaper,
    color: "text-red-600 bg-red-50",
  },
  {
    title: "Documents",
    value: "124",
    change: "+7 ce mois",
    positive: true,
    icon: FileText,
    color: "text-teal-600 bg-teal-50",
  },
  {
    title: "Messages reçus",
    value: "23",
    change: "-2 vs mois dernier",
    positive: false,
    icon: MessageSquare,
    color: "text-red-600 bg-red-50",
  },
];

const statusColor: Record<string, string> = {
  success: "bg-green-100 text-green-700",
  info: "bg-blue-100 text-blue-700",
  warning: "bg-amber-100 text-amber-700",
};

export default function AdminDashboard() {
  return (
    <AdminAuthGuard>
      <AdminLayout title="Tableau de bord" breadcrumb={["Administration", "Tableau de bord"]}>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {statCards.map((stat) => (
            <Card key={stat.title} className="border-slate-200 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-xs font-medium flex items-center gap-1 ${
                      stat.positive ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {stat.positive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {stat.change}
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{stat.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
          {/* Area chart */}
          <Card className="xl:col-span-2 border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-slate-900">
                  Visites du site
                </CardTitle>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Eye className="w-3.5 h-3.5" />
                  7 derniers mois
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={visitData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="visitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                    formatter={(v: number | string) => [`${v} visites`, ""]}
                  />
                  <Area
                    type="monotone"
                    dataKey="visites"
                    stroke="#dc2626"
                    strokeWidth={2}
                    fill="url(#visitGrad)"
                  />
                  </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Bar chart */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-900">
                Sections populaires
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={sectionData} margin={{ top: 5, right: 5, bottom: 0, left: -25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="section" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                    formatter={(v: number | string) => [`${v} vues`, ""]}
                  />
                  <Bar dataKey="vues" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity + Quick Actions */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Activity feed */}
          <Card className="xl:col-span-2 border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-900">
                Activité récente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivity.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase flex-shrink-0 mt-0.5 ${statusColor[item.status]}`}>
                    {item.type === "article" ? "Article" : item.type === "member" ? "Contact" : "Document"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800 font-medium leading-snug">{item.text}</p>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {item.time}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-900">
                Actions rapides
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: "Nouvel article", href: "/admin/actualites", color: "bg-red-600 hover:bg-red-700" },
                { label: "Ajouter un document", href: "/admin/documents", color: "bg-teal-600 hover:bg-teal-700" },
                { label: "Voir les adhérents", href: "/admin/adherents", color: "bg-slate-700 hover:bg-slate-800" },
                { label: "Paramètres du site", href: "/admin/parametres", color: "bg-slate-600 hover:bg-slate-700" },
              ].map((action) => (
                <Link
                  key={action.label}
                  to={action.href}
                  className={`block w-full text-center text-sm font-semibold text-white py-2.5 rounded-lg transition-colors ${action.color}`}
                >
                  {action.label}
                </Link>
              ))}

              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Prochaines élections
                </p>
                <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                  <p className="text-sm font-bold text-red-700">6 mai 2026</p>
                  <p className="text-xs text-red-600 mt-0.5">Élections professionnelles — J-5</p>
                  <div className="mt-2 h-1.5 bg-red-200 rounded-full overflow-hidden">
                    <div className="h-full bg-red-600 rounded-full" style={{ width: "90%" }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
