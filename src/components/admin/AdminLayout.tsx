import { useState, useEffect, ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Newspaper,
  FileText,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bell,
  Shield,
  BarChart3,
  MessageSquare,
  Home,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Badge } from "@/components/ui/badge";

const LOGO_IMAGE = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663612648040/LldXxCbhFdcPcHwX.png";

const navItems = [
  { path: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { path: "/admin/actualites", label: "Actualités", icon: Newspaper },
  { path: "/admin/documents", label: "Documents", icon: FileText },
  { path: "/admin/adherents", label: "Adhérents", icon: Users },
  { path: "/admin/bilan", label: "Bilan", icon: BarChart3 },
  { path: "/admin/droits", label: "Droits", icon: Shield },
  { path: "/admin/faq", label: "FAQ", icon: Eye },
  { path: "/admin/messages", label: "Messages", icon: MessageSquare },
  { path: "/admin/home-edit", label: "Édition Home", icon: Home },
  { path: "/admin/parametres", label: "Paramètres", icon: Settings },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  breadcrumb?: string[];
}

export default function AdminLayout({ children, title, breadcrumb }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAdminAuth();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const isActive = (item: (typeof navItems)[0]) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-40 h-screen w-64
          bg-slate-900 text-white flex flex-col
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-5 border-b border-slate-700">
          <img src={LOGO_IMAGE} alt="FOCOM" className="h-9 w-9 object-contain" />
          <div>
            <p className="font-bold text-sm leading-tight">FOCOM UES ILIAD</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Shield className="w-2.5 h-2.5" /> Administration
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-red-600 text-white shadow-lg shadow-red-900/30"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
                <span>{item.label}</span>
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-slate-700">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-800 mb-2">
            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {user?.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.username}</p>
              <p className="text-[10px] text-slate-400 capitalize">{user?.role}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full text-slate-400 hover:text-white hover:bg-slate-800 justify-start gap-2"
          >
            <LogOut className="w-4 h-4" />
            Se déconnecter
          </Button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 h-14 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div>
              <h1 className="text-base font-bold text-slate-900">{title}</h1>
              {breadcrumb && (
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  {breadcrumb.join(" / ")}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-4.5 h-4.5 text-slate-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
            <Link
              to="/"
              className="text-xs text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors hidden sm:block"
            >
              Voir le site →
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

interface AdminAuthGuardProps {
  children: ReactNode;
}

export function AdminAuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, ready } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // N'agit qu'une fois la vérification initiale terminée
    if (ready && !isAuthenticated) {
      navigate("/admin/login", { replace: true });
    }
  }, [ready, isAuthenticated, navigate]);

  // Attend la vérification sans rediriger
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-red-600 rounded-full animate-spin" />
          <p className="text-sm">Vérification en cours…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
