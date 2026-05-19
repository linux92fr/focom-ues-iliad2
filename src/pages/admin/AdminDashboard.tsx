import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  ClipboardList,
  FileText,
  Mail,
  MessageSquare,
  Newspaper,
  RefreshCw,
  Users,
  Vote,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AdminLayout, { AdminAuthGuard } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";

type TableQuery = ReturnType<typeof supabase.from>;

interface DashboardStats {
  activeMembers: number;
  activeAdhesions: number;
  publishedArticles: number;
  draftArticles: number;
  documents: number;
  unreadMessages: number;
  newsletterSubscribers: number;
  openReclamations: number;
  upcomingEvents: number;
  activeSurveys: number;
}

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  created_at: string;
  href: string;
}

interface UpcomingEvent {
  id: string;
  title: string;
  start_date: string;
  event_type: string | null;
  location: string | null;
}

const emptyStats: DashboardStats = {
  activeMembers: 0,
  activeAdhesions: 0,
  publishedArticles: 0,
  draftArticles: 0,
  documents: 0,
  unreadMessages: 0,
  newsletterSubscribers: 0,
  openReclamations: 0,
  upcomingEvents: 0,
  activeSurveys: 0,
};

function formatTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Date inconnue";
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Il y a ${days}j`;
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function formatEventDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Date à confirmer";
  return date.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function countFrom(table: string, apply?: (query: TableQuery) => TableQuery) {
  try {
    const query = (supabase as any).from(table).select("*", { count: "exact", head: true });
    const { count, error } = await (apply ? apply(query) : query);
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

async function fetchStats(): Promise<DashboardStats> {
  const now = new Date().toISOString();
  const [
    activeMembers,
    activeAdhesions,
    publishedArticles,
    draftArticles,
    documents,
    unreadMessages,
    newsletterSubscribers,
    openReclamations,
    upcomingEvents,
    activeSurveys,
  ] = await Promise.all([
    countFrom("profiles", q => q.eq("status", "actif")),
    countFrom("adhesions", q => q.eq("status", "active")),
    countFrom("articles", q => q.eq("is_published", true)),
    countFrom("articles", q => q.neq("status", "publie")),
    countFrom("documents"),
    countFrom("contact_messages", q => q.eq("status", "non-lu")),
    countFrom("newsletter_subscribers", q => q.eq("is_active", true)),
    countFrom("reclamations", q => q.in("status", ["nouveau", "en_cours"])),
    countFrom("events", q => q.gte("start_date", now)),
    countFrom("surveys", q => q.eq("is_active", true)),
  ]);

  return {
    activeMembers,
    activeAdhesions,
    publishedArticles,
    draftArticles,
    documents,
    unreadMessages,
    newsletterSubscribers,
    openReclamations,
    upcomingEvents,
    activeSurveys,
  };
}

async function fetchRecentActivity(): Promise<ActivityItem[]> {
  const [articles, messages, documents, events, surveys] = await Promise.all([
    (supabase as any).from("articles").select("id, title, slug, created_at, published_at, is_published").order("created_at", { ascending: false }).limit(4),
    (supabase as any).from("contact_messages").select("id, name, subject, created_at, status").order("created_at", { ascending: false }).limit(4),
    (supabase as any).from("documents").select("id, title, created_at").order("created_at", { ascending: false }).limit(4),
    (supabase as any).from("events").select("id, title, created_at, start_date").order("created_at", { ascending: false }).limit(3),
    (supabase as any).from("surveys").select("id, title, created_at, is_active").order("created_at", { ascending: false }).limit(3),
  ]);

  const items: ActivityItem[] = [];

  if (!articles.error) {
    items.push(...(articles.data || []).map((item: any) => ({
      id: `article-${item.id}`,
      type: "Article",
      title: item.title,
      description: item.is_published ? "Article publié" : "Article en préparation",
      created_at: item.published_at || item.created_at,
      href: item.is_published ? `/actualites/${item.slug}` : "/admin/actualites",
    })));
  }

  if (!messages.error) {
    items.push(...(messages.data || []).map((item: any) => ({
      id: `message-${item.id}`,
      type: "Message",
      title: item.subject || "Nouveau message",
      description: `${item.name || "Contact"} · ${item.status}`,
      created_at: item.created_at,
      href: "/admin/messages",
    })));
  }

  if (!documents.error) {
    items.push(...(documents.data || []).map((item: any) => ({
      id: `document-${item.id}`,
      type: "Document",
      title: item.title,
      description: "Document ajouté ou mis à jour",
      created_at: item.created_at,
      href: "/admin/documents",
    })));
  }

  if (!events.error) {
    items.push(...(events.data || []).map((item: any) => ({
      id: `event-${item.id}`,
      type: "Agenda",
      title: item.title,
      description: `Événement prévu le ${formatEventDate(item.start_date)}`,
      created_at: item.created_at,
      href: "/agenda",
    })));
  }

  if (!surveys.error) {
    items.push(...(surveys.data || []).map((item: any) => ({
      id: `survey-${item.id}`,
      type: "Sondage",
      title: item.title,
      description: item.is_active ? "Sondage actif" : "Sondage archivé",
      created_at: item.created_at,
      href: "/admin/sondages",
    })));
  }

  return items
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);
}

async function fetchUpcomingEvents(): Promise<UpcomingEvent[]> {
  try {
    const { data, error } = await (supabase as any)
      .from("events")
      .select("id, title, start_date, event_type, location")
      .gte("start_date", new Date().toISOString())
      .order("start_date", { ascending: true })
      .limit(4);
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

const badgeColors: Record<string, string> = {
  Article: "bg-red-100 text-red-700",
  Message: "bg-blue-100 text-blue-700",
  Document: "bg-teal-100 text-teal-700",
  Agenda: "bg-purple-100 text-purple-700",
  Sondage: "bg-indigo-100 text-indigo-700",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const refreshDashboard = useCallback(async () => {
    setRefreshing(true);
    const [nextStats, nextActivity, nextEvents] = await Promise.all([
      fetchStats(),
      fetchRecentActivity(),
      fetchUpcomingEvents(),
    ]);
    setStats(nextStats);
    setActivity(nextActivity);
    setUpcomingEvents(nextEvents);
    setLastRefresh(new Date());
    setRefreshing(false);
  }, []);

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  const statCards = useMemo(() => [
    { title: "Profils actifs", value: stats.activeMembers, detail: `${stats.activeAdhesions} adhésion(s) active(s)`, icon: Users, color: "text-teal-600 bg-teal-50", href: "/admin/adherents" },
    { title: "Articles publiés", value: stats.publishedArticles, detail: `${stats.draftArticles} brouillon(s) / en préparation`, icon: Newspaper, color: "text-red-600 bg-red-50", href: "/admin/actualites" },
    { title: "Documents", value: stats.documents, detail: "Documents disponibles", icon: FileText, color: "text-teal-600 bg-teal-50", href: "/admin/documents" },
    { title: "Messages non lus", value: stats.unreadMessages, detail: stats.unreadMessages === 0 ? "Aucun message à traiter" : "À traiter rapidement", icon: MessageSquare, color: "text-red-600 bg-red-50", href: "/admin/messages" },
    { title: "Réclamations ouvertes", value: stats.openReclamations, detail: "Nouveau / en cours", icon: ClipboardList, color: "text-amber-600 bg-amber-50", href: "/admin/reclamations" },
    { title: "Abonnés newsletter", value: stats.newsletterSubscribers, detail: "Abonnés actifs", icon: Mail, color: "text-blue-600 bg-blue-50", href: "/admin/newsletter" },
    { title: "Événements à venir", value: stats.upcomingEvents, detail: "Agenda syndical", icon: CalendarDays, color: "text-purple-600 bg-purple-50", href: "/agenda" },
    { title: "Sondages actifs", value: stats.activeSurveys, detail: "Consultations en cours", icon: Vote, color: "text-indigo-600 bg-indigo-50", href: "/admin/sondages" },
  ], [stats]);

  return (
    <AdminAuthGuard>
      <AdminLayout title="Tableau de bord" breadcrumb={["Administration", "Tableau de bord"]}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
          <div>
            <p className="text-xs text-slate-400">
              Dernière mise à jour : {lastRefresh.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Données issues de Supabase : articles, documents, messages, adhérents, newsletter, agenda et sondages.
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-2 h-8 text-xs border-slate-200" onClick={refreshDashboard} disabled={refreshing}>
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Chargement…" : "Actualiser"}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {statCards.map((stat) => (
            <Link key={stat.title} to={stat.href}>
              <Card className="border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group h-full">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Live</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 tabular-nums">{stat.value.toLocaleString("fr-FR")}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{stat.title}</p>
                  <p className="text-[11px] text-slate-400 mt-2 line-clamp-1">{stat.detail}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card className="xl:col-span-2 border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-600" />
                Activité récente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {activity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Activity className="w-8 h-8 mb-2" />
                  <p className="text-sm">Aucune activité récente disponible.</p>
                </div>
              ) : (
                activity.map((item) => (
                  <Link key={item.id} to={item.href} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase flex-shrink-0 mt-0.5 ${badgeColors[item.type] || "bg-slate-100 text-slate-700"}`}>
                      {item.type}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-800 font-medium leading-snug line-clamp-1">{item.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{item.description}</p>
                      <p className="text-xs text-slate-400 mt-1">{formatTime(item.created_at)}</p>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-teal-600" />
                  Prochains événements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingEvents.length === 0 ? (
                  <p className="text-sm text-slate-500 py-4">Aucun événement à venir.</p>
                ) : (
                  upcomingEvents.map((event) => (
                    <Link key={event.id} to="/agenda" className="block rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition-colors">
                      <p className="text-sm font-semibold text-slate-900 line-clamp-1">{event.title}</p>
                      <p className="text-xs text-teal-700 font-medium mt-1">{formatEventDate(event.start_date)}</p>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{event.location || event.event_type || "Agenda"}</p>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-900">Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { label: "Nouvel article", href: "/admin/actualites/nouveau", color: "bg-red-600 hover:bg-red-700" },
                  { label: "Ajouter un document", href: "/admin/documents", color: "bg-teal-600 hover:bg-teal-700" },
                  { label: "Réclamations", href: "/admin/reclamations", color: "bg-amber-600 hover:bg-amber-700" },
                  { label: "Newsletter", href: "/admin/newsletter", color: "bg-blue-600 hover:bg-blue-700" },
                  { label: "Paramètres", href: "/admin/parametres", color: "bg-slate-700 hover:bg-slate-800" },
                ].map((action) => (
                  <Link key={action.label} to={action.href} className={`block w-full text-center text-sm font-semibold text-white py-2.5 rounded-lg transition-colors ${action.color}`}>
                    {action.label}
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
