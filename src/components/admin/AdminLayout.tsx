import { useState, useEffect, useCallback, ReactNode, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Newspaper, FileText, Users, Settings,
  LogOut, Menu, X, ChevronRight, Bell, Shield, BarChart3,
  MessageSquare, Home, Eye, Clock, ExternalLink, ClipboardList, Mail, FolderOpen, CalendarDays, Sparkles, Bot, ShieldCheck, UserCog, Megaphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { adminPath, ADMIN_BASE } from "@/lib/adminPath";
import logoFocom from "@/assets/logo-focom.png";


const navItems = [
  { path: adminPath(),                  label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { path: adminPath("/actualites"),   label: "Actualités",      icon: Newspaper },
  { path: adminPath("/campagnes"),    label: "Campagnes & popups", icon: Megaphone, roles: ["admin"] },
  { path: adminPath("/ai"),            label: "Studio IA",        icon: Sparkles },
  { path: adminPath("/assistant-ia"),  label: "Assistant IA",     icon: Bot, roles: ["admin", "redacteur"] },
  { path: adminPath("/documents"),    label: "Documents",       icon: FileText },
  { path: adminPath("/adherents"),    label: "Adhérents",       icon: Users },
  { path: adminPath("/autorisations"), label: "Gestion des autorisations", icon: ShieldCheck, roles: ["admin"] },
  { path: adminPath("/utilisateurs-smart"), label: "Utilisateurs Smart", icon: UserCog, roles: ["admin"] },
  { path: adminPath("/agenda"),       label: "Agenda",          icon: CalendarDays },
  { path: adminPath("/bilan"),        label: "Bilan",           icon: BarChart3 },
  { path: adminPath("/droits"),       label: "Droits",          icon: Shield },
  { path: adminPath("/faq"),          label: "FAQ",             icon: Eye },
  { path: adminPath("/messages"),     label: "Messages",        icon: MessageSquare },
  { path: adminPath("/home-edit"),    label: "Édition Home",    icon: Home },
  { path: adminPath("/sondages"),     label: "Sondages",        icon: ClipboardList },
  { path: adminPath("/newsletter"),   label: "Newsletter",      icon: Mail },
  { path: adminPath("/reclamations"), label: "Réclamations",    icon: FolderOpen },
  { path: adminPath("/parametres"),   label: "Paramètres",      icon: Settings },
];

interface ContactMessage {
  id: string;
  name: string;
  subject: string;
  email: string;
  created_at: string;
  status: string;
}

const formatTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `Il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Il y a ${h}h`;
  return `Il y a ${Math.floor(h / 24)}j`;
};

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  breadcrumb?: string[];
}

export default function AdminLayout({ children, title, breadcrumb }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const bellRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAdminAuth();

  const fetchUnread = useCallback(async () => {
    const { data, count, error } = await supabase
      .from("contact_messages")
      .select<Pick<ContactMessage, "id" | "name" | "subject" | "email" | "created_at" | "status">>(
        "id, name, subject, email, created_at, status",
        { count: "exact" }
      )
      .eq("status", "non-lu")
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Unable to fetch unread messages:", error);
      setMessages([]);
      setUnreadCount(0);
      return;
    }

    setMessages(data ?? []);
    setUnreadCount(count ?? 0);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void fetchUnread(); }, 0);
    const channel = supabase
      .channel("admin-layout-messages")
      .on("postgres_changes", { event: "*", schema: "public", table: "contact_messages" }, () => fetchUnread())
      .subscribe();
    return () => {
      window.clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [fetchUnread]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => { logout(); navigate(adminPath("/login")); };
  const isActive = (item: (typeof navItems)[0]) => item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);

  return (
    <div className="admin-shell min-h-screen bg-[#f5f7fb] lg:flex">
      <aside
        className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} fixed left-0 top-0 z-40 flex h-screen w-72 flex-col overflow-hidden border-r border-white/10 bg-gradient-to-b from-[#101c2f] via-[#13233A] to-[#0b1525] text-white transition-transform duration-300 ease-in-out lg:sticky`}
      >
        <div className="h-1 shrink-0 bg-gradient-to-r from-red-600 via-red-500 to-teal-500" />
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-lg backdrop-blur">
            <img loading="lazy" src={logoFocom} alt="Logo FO COM UES ILIAD" className="h-8 w-auto max-w-10 object-contain" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-extrabold tracking-tight">FOCOM UES ILIAD</p>
            <p className="mt-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-teal-300">
              <Shield className="h-3 w-3" /> Administration
            </p>
          </div>
        </div>

        <nav className="admin-scrollbar flex-1 space-y-1 overflow-y-auto px-3 py-5" aria-label="Navigation administration">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">Gestion du site</p>
          {navItems.filter((item) => !("roles" in item) || item.roles.includes(user?.role ?? "")).map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                  active
                    ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-950/30'
                    : 'text-slate-300 hover:bg-white/[0.07] hover:text-white'
                }`}
              >
                <item.icon className={`h-4 w-4 shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-teal-300'}`} />
                <span>{item.label}</span>
                {active && <ChevronRight className="ml-auto h-3.5 w-3.5" />}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className="mb-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-700 text-xs font-extrabold shadow-sm">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{user?.username}</p>
              <p className="truncate text-[10px] capitalize text-teal-300">{user?.role}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start gap-2 text-slate-400 hover:bg-white/[0.06] hover:text-white"
          >
            <LogOut className="h-4 w-4" /> Se déconnecter
          </Button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 shadow-sm backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-xl p-2 hover:bg-slate-100 lg:hidden"
              aria-label={sidebarOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-red-600">Console de gestion</p>
              <p className="truncate text-sm font-bold text-slate-900">{breadcrumb?.join(' / ') ?? title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div ref={bellRef} className="relative">
              <button
                onClick={() => setBellOpen((value) => !value)}
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white transition-colors hover:bg-slate-50"
                aria-label="Notifications"
              >
                <Bell className="h-4.5 w-4.5 text-slate-500" />
                {unreadCount > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white">{unreadCount > 9 ? "9+" : unreadCount}</span>}
              </button>
              {bellOpen && (
                <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-extrabold text-slate-900">Messages non lus</p>
                    <span className="text-xs text-slate-400">{unreadCount} message{unreadCount > 1 ? "s" : ""}</span>
                  </div>
                  <div className="max-h-72 divide-y divide-slate-50 overflow-y-auto">
                    {messages.length === 0 ? <div className="px-4 py-8 text-center text-sm text-slate-400">Aucun message non lu</div> : messages.map((msg) => (
                      <Link key={msg.id} to={adminPath("/messages")} onClick={() => setBellOpen(false)} className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-50 text-xs font-bold text-red-600">{msg.name.charAt(0).toUpperCase()}</div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-900">{msg.name}</p>
                          <p className="truncate text-xs text-slate-500">{msg.subject}</p>
                          <p className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-400"><Clock className="h-2.5 w-2.5" />{formatTime(msg.created_at)}</p>
                        </div>
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                      </Link>
                    ))}
                  </div>
                  <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
                    <Link to={adminPath("/messages")} onClick={() => setBellOpen(false)} className="flex items-center justify-center gap-2 text-xs font-bold text-red-600 hover:text-red-700">
                      <ExternalLink className="h-3.5 w-3.5" /> Voir tous les messages
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <Link to="/" className="hidden rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 sm:block">
              Voir le site
            </Link>
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-auto p-3 sm:p-5 lg:p-7">
          <div className="mx-auto w-full max-w-[1600px]">
            <section className="relative overflow-hidden rounded-3xl bg-[#13233A] px-5 py-6 text-white shadow-xl shadow-slate-900/10 sm:px-7 sm:py-7">
              <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border-[52px] border-white/[0.04]" />
              <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-red-600/15 blur-3xl" />
              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-teal-300">
                    <ShieldCheck className="h-3.5 w-3.5" /> Administration sécurisée
                  </p>
                  <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/60">
                    Pilotez les contenus, les adhérents et les services FO COM depuis cet espace centralisé.
                  </p>
                </div>
                <div className="flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-3 py-1.5 text-xs font-semibold text-white/75 backdrop-blur-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                  Système opérationnel
                </div>
              </div>
            </section>
            <div className="mt-5">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}

export function AdminAuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, ready } = useAdminAuth();
  const navigate = useNavigate();
  useEffect(() => { if (ready && !isAuthenticated) navigate(adminPath("/login"), { replace: true }); }, [ready, isAuthenticated, navigate]);
  if (!ready) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="flex flex-col items-center gap-3 text-slate-400"><div className="w-8 h-8 border-2 border-slate-300 border-t-red-600 rounded-full animate-spin" /><p className="text-sm">Vérification en cours…</p></div></div>;
  if (!isAuthenticated) return null;
  return <>{children}</>;
}
