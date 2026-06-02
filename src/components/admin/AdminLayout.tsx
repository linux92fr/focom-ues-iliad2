import { useState, useEffect, useCallback, ReactNode, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Newspaper, FileText, Users, Settings,
  LogOut, Menu, X, ChevronRight, Bell, Shield, BarChart3,
  MessageSquare, Home, Eye, Clock, ExternalLink, Layers, ClipboardList, Mail, FolderOpen, CalendarDays, Megaphone, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { supabase } from "@/integrations/supabase/client";

const LOGO_IMAGE = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663612648040/LldXxCbhFdcPcHwX.png";

const navItems = [
  { path: "/admin",            label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { path: "/admin/actualites", label: "Actualités",      icon: Newspaper },
  { path: "/admin/tracts",     label: "Tracts",          icon: Megaphone },
  { path: "/admin/documents",  label: "Documents",       icon: FileText },
  { path: "/admin/adherents",  label: "Adhérents",       icon: Users },
  { path: "/admin/agenda",     label: "Agenda",          icon: CalendarDays },
  { path: "/admin/bilan",      label: "Bilan",           icon: BarChart3 },
  { path: "/admin/droits",     label: "Droits",          icon: Shield },
  { path: "/admin/faq",        label: "FAQ",             icon: Eye },
  { path: "/admin/messages",   label: "Messages",        icon: MessageSquare },
  { path: "/admin/home-edit",  label: "Édition Home",    icon: Home },
  { path: "/admin/sondages",   label: "Sondages",        icon: ClipboardList },
  { path: "/admin/newsletter",   label: "Newsletter",   icon: Mail },
  { path: "/admin/reclamations", label: "Réclamations",  icon: FolderOpen },
  { path: "/admin/parametres",   label: "Paramètres",   icon: Settings },
  { path: "/admin/moderation", label: "Modération",      icon: ShieldCheck },
  { path: "/admin/poster",     label: "Compositeur",     icon: Layers }
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
    fetchUnread();
    const channel = supabase
      .channel("admin-layout-messages")
      .on("postgres_changes", { event: "*", schema: "public", table: "contact_messages" }, () => fetchUnread())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchUnread]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => { logout(); navigate("/admin/login"); };
  const isActive = (item: (typeof navItems)[0]) => item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out`}>
        <div className="flex items-center gap-3 p-5 border-b border-slate-700">
          <img loading="lazy" src={LOGO_IMAGE} alt="FOCOM" className="h-9 w-9 object-contain" />
          <div>
            <p className="font-bold text-sm leading-tight">FOCOM UES ILIAD</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-1"><Shield className="w-2.5 h-2.5" /> Administration</p>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active ? "bg-red-600 text-white shadow-lg shadow-red-900/30" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}>
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-slate-700">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-800 mb-2">
            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold flex-shrink-0">{user?.username?.charAt(0).toUpperCase()}</div>
            <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-white truncate">{user?.username}</p><p className="text-[10px] text-slate-400 capitalize">{user?.role}</p></div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full text-slate-400 hover:text-white hover:bg-slate-800 justify-start gap-2"><LogOut className="w-4 h-4" />Se déconnecter</Button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 h-14 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100">{sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
            <div><h1 className="text-base font-bold text-slate-900">{title}</h1>{breadcrumb && <p className="text-[11px] text-slate-500 hidden sm:block">{breadcrumb.join(" / ")}</p>}</div>
          </div>
          <div className="flex items-center gap-2">
            <div ref={bellRef} className="relative">
              <button onClick={() => setBellOpen((v) => !v)} className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
                <Bell className="w-5 h-5 text-slate-500" />
                {unreadCount > 0 && <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">{unreadCount > 9 ? "9+" : unreadCount}</span>}
              </button>
              {bellOpen && (
                <div className="absolute right-0 top-11 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100"><p className="font-semibold text-sm text-slate-900">Messages non lus</p><span className="text-xs text-slate-400">{unreadCount} message{unreadCount > 1 ? "s" : ""}</span></div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                    {messages.length === 0 ? <div className="px-4 py-8 text-center text-sm text-slate-400">Aucun message non lu</div> : messages.map((msg) => (
                      <Link key={msg.id} to="/admin/messages" onClick={() => setBellOpen(false)} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 text-red-600 font-bold text-xs mt-0.5">{msg.name.charAt(0).toUpperCase()}</div>
                        <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-slate-900 truncate">{msg.name}</p><p className="text-xs text-slate-500 truncate">{msg.subject}</p><p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5"><Clock className="w-2.5 h-2.5" />{formatTime(msg.created_at)}</p></div>
                        <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-2" />
                      </Link>
                    ))}
                  </div>
                  <div className="px-4 py-3 border-t border-slate-100 bg-slate-50"><Link to="/admin/messages" onClick={() => setBellOpen(false)} className="flex items-center justify-center gap-2 text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"><ExternalLink className="w-3.5 h-3.5" />Voir tous les messages</Link></div>
                </div>
              )}
            </div>
            <Link to="/" className="text-xs text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors hidden sm:block">Voir le site →</Link>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

export function AdminAuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, ready } = useAdminAuth();
  const navigate = useNavigate();
  useEffect(() => { if (ready && !isAuthenticated) navigate("/admin/login", { replace: true }); }, [ready, isAuthenticated, navigate]);
  if (!ready) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="flex flex-col items-center gap-3 text-slate-400"><div className="w-8 h-8 border-2 border-slate-300 border-t-red-600 rounded-full animate-spin" /><p className="text-sm">Vérification en cours…</p></div></div>;
  if (!isAuthenticated) return null;
  return <>{children}</>;
}
