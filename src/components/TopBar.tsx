import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Home, Search, Users, Menu, X, Settings, Bell, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/AuthModal";
import UserMenu from "@/components/UserMenu";
import { supabase } from "@/integrations/supabase/client";

const topLinks = [
  { to: "/", label: "Accueil", icon: Home, end: true },
  { to: "/actualites", label: "Actualités" },
  { to: "/bilan-mandat", label: "Bilan de Mandat" },
  { to: "/profil", label: "Espace Adhérent" },
  { to: "/vos-droits", label: "Vos Droits" },
  { to: "/a-propos", label: "La FOCOM" },
  { to: "/contact", label: "Contact" },
];

const SEARCH_LINKS = [
  { label: "Élections CSE 2026", href: "/elections" },
  { label: "Négociation Annuelle (NAO 2026)", href: "/nao2026" },
  { label: "Bilan de mandat 2022–2026", href: "/bilan-mandat" },
  { label: "Vos droits", href: "/vos-droits" },
  { label: "Documents utiles", href: "/documents-utiles" },
  { label: "Adhésion — Nous rejoindre", href: "/adhesion" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
  { label: "Actualités", href: "/actualites" },
  { label: "Accord GEPP", href: "/accords/gepp" },
  { label: "Simulateur mobilité", href: "/simulateur-mobilite" },
  { label: "Simulateur prime variable", href: "/simulateur-prime-variable" },
  { label: "Sondages", href: "/sondages" },
  { label: "Agenda", href: "/agenda" },
  { label: "Mon profil", href: "/profil" },
  { label: "Notifications", href: "/notifications" },
];

const TopBar = () => {
  const [authOpen, setAuthOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // ── Compteur notifications non lues ─────────────────────────
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const fetchUnread = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setUnreadCount(0); return; }
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", session.user.id)
        .eq("is_read", false)
        .eq("archived", false);
      setUnreadCount(count ?? 0);
    };

    fetchUnread();

    channel = supabase
      .channel("notifications-topbar")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" },
        () => { fetchUnread(); })
      .subscribe();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUnread();
    });

    return () => {
      subscription.unsubscribe();
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  // ── Raccourci Ctrl+K ─────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 50);
    else setQuery("");
  }, [searchOpen]);

  const results = query.trim().length > 0
    ? SEARCH_LINKS.filter((l) => l.label.toLowerCase().includes(query.toLowerCase()))
    : [];

  const handleSelect = (href: string) => {
    setSearchOpen(false);
    navigate(href);
  };

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
                      isActive ? "text-primary" : "text-foreground hover:text-primary"
                    }`
                  }
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {link.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {/* Recherche */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full border border-border"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Cloche notifications */}
            <Link
              to="/notifications"
              aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} non lues)` : ""}`}
              className="relative flex items-center justify-center w-9 h-9 rounded-full border border-border hover:bg-muted transition-colors"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white px-1">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>

            {/* Admin */}
            <Button
              asChild
              variant="outline"
              className="hidden sm:inline-flex rounded-full h-11 px-5 font-bold gap-2 border-secondary text-secondary hover:bg-secondary/10"
            >
              <Link to="/admin">
                <Settings className="h-4 w-4" />
                Admin
              </Link>
            </Button>

            {/* Auth */}
            {!loading && (
              user ? (
                <UserMenu />
              ) : (
                <Button
                  onClick={() => setAuthOpen(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 h-11 font-bold gap-2"
                >
                  <Users className="h-4 w-4" />
                  Nous rejoindre
                </Button>
              )
            )}
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

      {/* Modale recherche */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
          onClick={() => setSearchOpen(false)}
        >
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
              <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Rechercher une page, un document…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 text-sm text-slate-900 placeholder-slate-400 outline-none bg-transparent"
              />
              <div className="flex items-center gap-2">
                <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-200 rounded">
                  Échap
                </kbd>
                <button
                  onClick={() => setSearchOpen(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {results.length > 0 && (
              <ul className="max-h-72 overflow-y-auto py-2">
                {results.map((item) => (
                  <li key={item.href}>
                    <button
                      onClick={() => handleSelect(item.href)}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-red-600 transition-colors text-left"
                    >
                      <span>{item.label}</span>
                      <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {query.trim().length > 0 && results.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-slate-400">
                Aucun résultat pour «&nbsp;{query}&nbsp;»
              </div>
            )}

            {query.trim().length === 0 && (
              <div className="px-4 py-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                  Accès rapides
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Élections", "NAO 2026", "Adhésion", "FAQ", "Contact"].map((label) => {
                    const item = SEARCH_LINKS.find((l) => l.label.startsWith(label));
                    return item ? (
                      <button
                        key={label}
                        onClick={() => handleSelect(item.href)}
                        className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 rounded-full transition-colors"
                      >
                        {label}
                      </button>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
};

export default TopBar;