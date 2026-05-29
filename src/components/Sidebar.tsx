import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Newspaper,
  BarChart3,
  UserCircle,
  User,
  Shield,
  FolderOpen,
  Mail,
  Calendar,
  Settings,
  AlertCircle,
  UserPlus,
  Users,
  Scale,
} from "lucide-react";
import logoFocom from "@/assets/logo-focom.png";

const mainNavItems = [
  { to: "/", label: "Accueil", icon: LayoutDashboard, end: true },
  { to: "/le-syndicat", label: "Le syndicat", icon: Users },
  { to: "/actualites", label: "Actualités", icon: Newspaper },
  { to: "/nao2026", label: "NAO 2026", icon: Scale },
  { to: "/bilan-mandat", label: "Bilan", icon: BarChart3 },
  { to: "/vos-droits", label: "Vos droits", icon: Shield },
];

const actionNavItems = [
  { to: "/adhesion", label: "Adhérer", icon: UserPlus, highlight: true },
  { to: "/espace-adherent", label: "Espace adhérent", icon: UserCircle },
  { to: "/mes-reclamations", label: "Mes demandes", icon: AlertCircle },
  { to: "/profil", label: "Mon profil", icon: User },
];

const secondaryNavItems = [
  { to: "/agenda", label: "Agenda", icon: Calendar },
  { to: "/documents-utiles", label: "Documents", icon: FolderOpen },
  { to: "/contact", label: "Contact", icon: Mail },
  { to: "/admin", label: "Admin", icon: Settings },
];

function NavItem({ item, onNavigate }: { item: { to: string; label: string; icon: React.ElementType; end?: boolean; highlight?: boolean }; onNavigate?: () => void }) {
  const location = useLocation();
  const Icon = item.icon;
  const isActive = item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);

  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
        isActive
          ? "bg-secondary text-secondary-foreground"
          : item.highlight
            ? "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
            : "text-foreground hover:bg-muted"
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className="truncate">{item.label}</span>
    </NavLink>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <div className="border-b border-border p-5">
        <div className="flex items-center gap-3">
          <img loading="lazy" src={logoFocom} alt="FOCOM" className="h-12 w-12 object-contain" />
          <div className="min-w-0">
            <div className="font-display text-lg font-black leading-none text-primary">FOCOM</div>
            <div className="mt-1 font-display text-base font-black leading-none text-secondary">UES ILIAD</div>
            <div className="mt-1 text-[9px] font-bold tracking-wider text-muted-foreground">
              NOTRE FORCE, VOS DROITS
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto p-3">
        <div className="space-y-1">
          <p className="px-4 pb-1 text-[10px] font-black uppercase tracking-wider text-muted-foreground">Principal</p>
          {mainNavItems.map((item) => <NavItem key={item.label} item={item} onNavigate={onNavigate} />)}
        </div>

        <div className="space-y-1">
          <p className="px-4 pb-1 text-[10px] font-black uppercase tracking-wider text-muted-foreground">Agir</p>
          {actionNavItems.map((item) => <NavItem key={item.label} item={item} onNavigate={onNavigate} />)}
        </div>

        <div className="space-y-1">
          <p className="px-4 pb-1 text-[10px] font-black uppercase tracking-wider text-muted-foreground">Plus</p>
          {secondaryNavItems.map((item) => <NavItem key={item.label} item={item} onNavigate={onNavigate} />)}
        </div>
      </nav>

      <div className="border-t border-border bg-muted/30 p-5">
        <p className="text-xs italic leading-relaxed text-muted-foreground">
          Seul on va plus vite,<br />ensemble on va plus loin.
        </p>
        <div className="mt-3 text-xs font-black tracking-wider text-primary">
          FOCOM UES ILIAD
        </div>
      </div>
    </>
  );
}

const Sidebar = () => {
  return (
    <aside className="hidden h-screen shrink-0 flex-col border-r border-border bg-card lg:flex lg:w-64">
      <SidebarContent />
    </aside>
  );
};

export default Sidebar;
