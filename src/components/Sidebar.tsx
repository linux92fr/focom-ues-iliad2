import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Newspaper,
  BarChart3,
  UserCircle,
  Shield,
  FolderOpen,
  HelpCircle,
  Mail,
  Calendar,
  Settings,
} from "lucide-react";
import logoFocom from "@/assets/logo-focom.png";

const navItems = [
  { to: "/", label: "Tableau de bord", icon: LayoutDashboard, end: true },
  { to: "/actualites", label: "Actualités", icon: Newspaper },
  { to: "/publications", label: "Bilan de Mandat", icon: BarChart3 },
  { to: "/profil", label: "Espace Adhérent", icon: UserCircle },
  { to: "/admin", label: "Administration", icon: Settings },
  { to: "/vos-droits", label: "Vos Droits", icon: Shield },
  { to: "/agenda", label: "Agenda", icon: Calendar },
  { to: "/publications", label: "Documents Utiles", icon: FolderOpen },
  { to: "/vos-droits", label: "FAQ", icon: HelpCircle },
  { to: "/contact", label: "Nous Contacter", icon: Mail },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-card border-r border-border self-start">
      {/* Logo block */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <img src={logoFocom} alt="FOCOM" className="w-12 h-12 object-contain" />
          <div>
            <div className="font-display font-black text-primary text-lg leading-none">FOCOM</div>
            <div className="font-display font-black text-secondary text-base leading-none mt-1">UES ILIAD</div>
            <div className="text-[9px] font-bold text-muted-foreground tracking-wider mt-1">
              NOTRE FORCE, VOS DROITS
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.end
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-secondary text-secondary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Quote block */}
      <div className="p-6 border-t border-border bg-muted/30">
        <div className="text-2xl text-primary font-serif leading-none mb-2">"</div>
        <p className="text-xs text-muted-foreground italic leading-relaxed">
          Seul on va plus vite,<br />ensemble on va plus loin.
        </p>
        <div className="text-primary font-display font-black text-xs mt-3 tracking-wider">
          FOCOM UES ILIAD
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
