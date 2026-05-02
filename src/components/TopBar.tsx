import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Home, Search, Users, Menu, X, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/AuthModal";
import UserMenu from "@/components/UserMenu";

const topLinks = [
  { to: "/", label: "Accueil", icon: Home, end: true },
  { to: "/actualites", label: "Actualités" },
  { to: "/bilan-mandat", label: "Bilan de Mandat" },
  { to: "/profil", label: "Espace Adhérent" },
  { to: "/vos-droits", label: "Vos Droits" },
  { to: "/a-propos", label: "La FOCOM" },
  { to: "/contact", label: "Contact" },
];

const TopBar = () => {
  const [authOpen, setAuthOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading } = useAuth();

  return (
    <>
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="flex items-center justify-between px-4 lg:px-8 h-20 gap-4">
          {/* Mobile menu */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Nav (desktop) */}
          <nav className="hidden lg:flex items-center gap-1 flex-1">
            {topLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.label}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                      isActive
                        ? "text-primary"
                        : "text-foreground hover:text-primary"
                    }`
                  }
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {link.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full border border-border">
              <Search className="h-4 w-4" />
            </Button>
            <Button asChild variant="outline" className="hidden sm:inline-flex rounded-full h-11 px-5 font-bold gap-2 border-secondary text-secondary hover:bg-secondary/10">
              <Link to="/admin">
                <Settings className="h-4 w-4" />
                Admin
              </Link>
            </Button>
            {!loading &&
              (user ? (
                <UserMenu />
              ) : (
                <Button
                  onClick={() => setAuthOpen(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 h-11 font-bold gap-2"
                >
                  <Users className="h-4 w-4" />
                  Nous rejoindre
                </Button>
              ))}
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="lg:hidden border-t border-border bg-card p-3 space-y-1 animate-fade-in">
            {topLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                end={link.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-md text-sm font-semibold ${
                    isActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
};

export default TopBar;
