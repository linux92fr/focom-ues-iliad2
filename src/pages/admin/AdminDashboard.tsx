import { useState, useEffect, useCallback } from "react";
import {
  Users, Newspaper, FileText, MessageSquare,
  TrendingUp, TrendingDown, Eye, Calendar,
  RefreshCw, Bell, X, CheckCircle, AlertCircle,
  Info, Filter, ExternalLink, Clock, Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Link } from "react-router-dom";
import AdminLayout, { AdminAuthGuard } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";

/* ─── Static data ─────────────────────────────────────────────── */
const visitDataBase = [
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

const allActivity = [
  { type: "article", text: "Nouvel article publié : NAO 2026", time: "Il y a 2h", status: "success", category: "article" },
  { type: "message", text: "Nouveau message de contact reçu", time: "Il y a 5h", status: "info", category: "message" },
  { type: "document", text: "Document mis à jour : GEPP Guide", time: "Il y a 1j", status: "warning", category: "document" },
  { type: "article", text: "Article mis en avant : Élections 2026", time: "Il y a 2j", status: "success", category: "article" },
  { type: "message", text: "Nouveau formulaire d'adhésion", time: "Il y a 3j", status: "info", category: "message" },
  { type: "document", text: "Nouveau document : Accord GPEC", time: "Il y a 4j", status: "warning", category: "document" },
  { type: "article", text: "Article archivé : Bilan 2024", time: "Il y a 5j", status: "success", category: "article" },
];

/* ─── Types ───────────────────────────────────────────────────── */
interface AdminNotif {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  archived: boolean;
  created_at: string;
}

/* ─── Election countdown ──────────────────────────────────────── */
const ELECTION_DATE = new Date("2026-05-06T08:00:00");

function useCountdown(target: Date) {
  const calc = useCallback(() => {
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, pct: 100 };
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    const pct = Math.min(100, Math.round(((30 - days) / 30) * 100));
    return { days, hours, minutes, seconds, pct };
  }, [target]);

  const [countdown, setCountdown] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setCountdown(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);
  return countdown;
}

/* ─── Helpers ─────────────────────────────────────────────────── */
const statusColor: Record<string, string> = {
  success: "bg-green-100 text-green-700",
  info: "bg-blue-100 text-blue-700",
  warning: "bg-amber-100 text-amber-700",
};

const notifIcon: Record<string, React.ReactNode> = {
  info:    <Info className="w-4 h-4 text-blue-500" />,
  warning: <AlertCircle className="w-4 h-4 text-amber-500" />,
  success: <CheckCircle className="w-4 h-4 text-green-500" />,
};

const formatTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `Il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Il y a ${h}h`;
  return `Il y a ${Math.floor(h / 24)}j`;
};

/* ─── Component ───────────────────────────────────────────────── */
export default function AdminDashboard() {
  const countdown = useCountdown(ELECTION_DATE);

  const [refreshing, setRefreshing] = useState(false);
  const [visitData, setVisitData] = useState(visitDataBase);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // ── Notifications depuis Supabase ──────────────────────────
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifList, setNotifList] = useState<AdminNotif[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const unreadCount = notifList.filter((n) => !n.is_read && !n.archived).length;

  // Récupère les messages de contact non lus comme notifications admin
  const [unreadMessages, setUnreadMessages] = useState(0);

  const fetchNotifs = useCallback(async () => {
    setNotifLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { setNotifLoading(false); return; }

    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("archived", false)
      .order("created_at", { ascending: false })
      .limit(10);

    setNotifList((data as AdminNotif[]) ?? []);
    setNotifLoading(false);
  }, []);

  const fetchUnreadMessages = useCallback(async () => {
    const { count } = await supabase
      .from("contact_messages")
      .select("*", { count: "exact", head: true })
      .eq("status", "non-lu");
    setUnreadMessages(count ?? 0);
  }, []);

  useEffect(() => {
    fetchNotifs();
    fetchUnreadMessages();
  }, [fetchNotifs, fetchUnreadMessages]);

  const markAllRead = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", session.user.id)
      .eq("is_read", false);
    setNotifList((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const dismissNotif = async (id: string) => {
    await supabase.from("notifications").update({ archived: true }).eq("id", id);
    setNotifList((prev) => prev.filter((n) => n.id !== id));
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifs();
    fetchUnreadMessages();
    setTimeout(() => {
      setVisitData(visitDataBase.map((d) => ({
        ...d,
        visites: d.visites + Math.floor(Math.random() * 40 - 20),
      })));
      setLastRefresh(new Date());
      setRefreshing(false);
    }, 1200);
  }, [fetchNotifs, fetchUnreadMessages]);

  const [actFilter, setActFilter] = useState<"all" | "article" | "message" | "document">("all");
  const filteredActivity = actFilter === "all"
    ? allActivity
    : allActivity.filter((a) => a.category === actFilter);

  const statCards = [
    { title: "Adhérents actifs", value: "1 247", change: "+5,2%", positive: true, icon: Users, color: "text-teal-600 bg-teal-50", href: "/admin/adherents" },
    { title: "Articles publiés", value: "38", change: "+3 ce mois", positive: true, icon: Newspaper, color: "text-red-600 bg-red-50", href: "/admin/actualites" },
    { title: "Documents", value: "124", change: "+7 ce mois", positive: true, icon: FileText, color: "text-teal-600 bg-teal-50", href: "/admin/documents" },
    {
      title: "Messages reçus",
      value: String(unreadMessages),
      change: `${unreadMessages} non lu${unreadMessages > 1 ? "s" : ""}`,
      positive: unreadMessages === 0,
      icon: MessageSquare,
      color: "text-red-600 bg-red-50",
      href: "/admin/messages",
    },
  ];

  return (
    <AdminAuthGuard>
      <AdminLayout title="Tableau de bord" breadcrumb={["Administration", "Tableau de bord"]}>

        {/* ── Panneau notifications ──────────────────────────── */}
        {notifOpen && (
          <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setNotifOpen(false)}>
            <div
              className="w-80 h-full bg-white shadow-2xl flex flex-col border-l border-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                <div>
                  <p className="font-bold text-sm text-slate-900">Notifications</p>
                  <p className="text-xs text-slate-400">{unreadCount} non lue{unreadCount > 1 ? "s" : ""}</p>
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-red-600 hover:underline font-medium">
                      Tout lire
                    </button>
                  )}
                  <button onClick={() => setNotifOpen(false)} className="p-1 rounded hover:bg-slate-100">
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {notifLoading ? (
                  <div className="flex items-center justify-center h-24">
                    <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                  </div>
                ) : notifList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                    <CheckCircle className="w-8 h-8 mb-2 text-green-400" />
                    <p className="text-sm">Aucune notification</p>
                  </div>
                ) : (
                  notifList.map((n) => (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors ${!n.is_read ? "bg-blue-50/40" : ""}`}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {notifIcon[n.type] ?? <Info className="w-4 h-4 text-slate-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm text-slate-900 ${!n.is_read ? "font-bold" : "font-semibold"}`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-snug line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />{formatTime(n.created_at)}
                        </p>
                      </div>
                      <button
                        onClick={() => dismissNotif(n.id)}
                        className="p-1 rounded hover:bg-slate-200 flex-shrink-0"
                        title="Archiver"
                      >
                        <X className="w-3 h-3 text-slate-400" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="px-4 py-3 border-t border-slate-200">
                <Link
                  to="/admin/messages"
                  onClick={() => setNotifOpen(false)}
                  className="flex items-center justify-center gap-2 text-xs text-slate-600 hover:text-slate-900 font-medium py-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Voir tous les messages
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── Topbar ────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-xs text-slate-400">
            Dernière mise à jour : {lastRefresh.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline" size="sm"
              className="relative gap-2 h-8 text-xs border-slate-200"
              onClick={() => setNotifOpen(true)}
            >
              <Bell className="w-3.5 h-3.5" />
              Notifications
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
            <Button
              variant="outline" size="sm"
              className="gap-2 h-8 text-xs border-slate-200"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Chargement…" : "Actualiser"}
            </Button>
          </div>
        </div>

        {/* ── Stats ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {statCards.map((stat) => (
            <Link key={stat.title} to={stat.href}>
              <Card className="border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <span className={`text-xs font-medium flex items-center gap-1 ${stat.positive ? "text-green-600" : "text-red-500"}`}>
                      {stat.positive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{stat.title}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* ── Charts ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
          <Card className="xl:col-span-2 border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-slate-900">Visites du site</CardTitle>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Eye className="w-3.5 h-3.5" />7 derniers mois
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
                  <Area type="monotone" dataKey="visites" stroke="#dc2626" strokeWidth={2} fill="url(#visitGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-900">Sections populaires</CardTitle>
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

        {/* ── Activity + Quick Actions ───────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card className="xl:col-span-2 border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-slate-900">Activité récente</CardTitle>
                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                  {(["all", "article", "message", "document"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setActFilter(f)}
                      className={`text-[11px] font-medium px-2.5 py-1 rounded-md transition-all ${
                        actFilter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {f === "all" ? "Tout" : f === "article" ? "Articles" : f === "message" ? "Messages" : "Documents"}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {filteredActivity.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase flex-shrink-0 mt-0.5 ${statusColor[item.status]}`}>
                    {item.type === "article" ? "Article" : item.type === "message" ? "Message" : "Document"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800 font-medium leading-snug">{item.text}</p>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />{item.time}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-900">Actions rapides</CardTitle>
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
                  {countdown.days > 0 ? (
                    <>
                      <p className="text-xs text-red-600 mt-0.5 mb-2">Élections professionnelles — J-{countdown.days}</p>
                      <div className="grid grid-cols-4 gap-1 mb-2">
                        {[
                          { label: "J", val: countdown.days },
                          { label: "h", val: countdown.hours },
                          { label: "m", val: countdown.minutes },
                          { label: "s", val: countdown.seconds },
                        ].map(({ label, val }) => (
                          <div key={label} className="bg-red-100 rounded-md py-1.5 text-center">
                            <p className="text-sm font-bold text-red-700 leading-none tabular-nums">
                              {String(val).padStart(2, "0")}
                            </p>
                            <p className="text-[9px] text-red-500 mt-0.5">{label}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-red-600 mt-0.5 mb-2 font-bold">C'est aujourd'hui !</p>
                  )}
                  <div className="h-1.5 bg-red-200 rounded-full overflow-hidden">
                    <div className="h-full bg-red-600 rounded-full transition-all duration-1000" style={{ width: `${countdown.pct}%` }} />
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