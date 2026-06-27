import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Search, Bell, Settings, X, ArrowRight, LogOut, User, Lock, Home, Menu,
  LayoutDashboard, Newspaper, BarChart3, UserCircle, Shield, FolderOpen,
  Mail, Calendar, AlertCircle, UserPlus, Users, Scale,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { adminPath } from "@/lib/adminPath";
import logoFocom from "@/assets/logo-focom.png";

const SEARCH_LINKS = [
  { label: "Le syndicat", href: "/le-syndicat" },
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

const MOBILE_NAV = [
  { to: "/", label: "Accueil", icon: LayoutDashboard, end: true },
  { to: "/le-syndicat", label: "Le syndicat", icon: Users },
  { to: "/actualites", label: "Actualités", icon: Newspaper },
  { to: "/nao2026", label: "NAO 2026", icon: Scale },
  { to: "/bilan-mandat", label: "Bilan", icon: BarChart3 },
  { to: "/vos-droits", label: "Vos droits", icon: Shield },
  { to: "/adhesion", label: "Adhérer", icon: UserPlus },
  { to: "/mes-reclamations", label: "Mes demandes", icon: AlertCircle },
  { to: "/profil", label: "Espace adhérent", icon: UserCircle },
  { to: "/agenda", label: "Agenda", icon: Calendar },
  { to: "/documents-utiles", label: "Documents", icon: FolderOpen },
  { to: "/contact", label: "Contact", icon: Mail },
  { to: adminPath(), label: "Admin", icon: Settings },
];

export default function PageHeader() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const { user, signOut } = useAuth();

  const initials = user
    ? (user.user_metadata?.display_name?.substring(0, 2) || user.email?.substring(0, 2) || "U").toUpperCase()
    : null;

  useEffect(() => {
    const fetchAvatar = async () => {
      if (!user?.email) { setAvatarUrl(null); return; }
      const { data } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("email", user.email)
        .single();
      setAvatarUrl(data?.avatar_url || null);
    };
    fetchAvatar();
  }, [user]);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    const fetchUnread = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setUnreadCount(0); return; }
      const { count, error } = await supabase
        .from("notifications")
        .select("id", { count: "exact" })
        .eq("user_id", session.user.id)
        .eq("is_read", false)
        .eq("archived", false)
        .limit(1);

      if (error) {
        console.warn("Impossible de compter les notifications non lues", error);
        setUnreadCount(0);
        return;
      }

      setUnreadCount(count ?? 0);
    };
    fetchUnread();
    channel = supabase
      .channel("notifications-header")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => fetchUnread())
      .subscribe();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => fetchUnread());
    return () => { subscription.unsubscribe(); if (channel) supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); setSearchOpen(true); }
      if (e.key === "Escape") { setSearchOpen(false); setUserMenuOpen(false); setMobileMenuOpen(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 50);
    else setQuery("");
  }, [searchOpen]);

  const results = query.trim().length > 0
    ? SEARCH_LINKS.filter((l) => l.label.toLowerCase().includes(query.toLowerCase()))
    : [];

  const handleSelect = (href: string) => { setSearchOpen(false); navigate(href); };

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    await signOut();
    navigate("/");
  };

  return (
    <>
      <header className="shrink-0 z-40 w-full max-w-full overflow-x-hidden bg-card border-b border-border shadow-sm">
        <div className="h-14 w-full max-w-full px-2 sm:px-4 flex items-center justify-between gap-1 overflow-hidden">
          <div className="flex min-w-0 items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Ouvrir le menu"
              className="lg:hidden flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-foreground shadow-sm"
            >
              <Menu className="h-5 w-5" />
            </button>

            {!isHomePage && (
              <Link
                to="/"
                className="inline-flex min-w-0 items-center gap-1 sm:gap-2 rounded-full border border-border bg-background px-2 sm:px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
              >
                <Home className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline truncate">Retour vers le site</span>
                <span className="sm:hidden truncate">Accueil</span>
              </Link>
            )}
          </div>

          <div className="flex shrink-0 items-center justify-end gap-1 sm:gap-2">
            <button
              aria-label="Rechercher"
              onClick={() => setSearchOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            <Link
              to="/notifications"
              aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} non lues)` : ""}`}
              className="relative hidden xs:flex w-9 h-9 items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white px-1">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>

            <Link
              to={adminPath("/login")}
              aria-label="Administration"
              className="hidden sm:flex w-9 h-9 items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </Link>

            {user ? (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center hover:opacity-90 transition-opacity ring-2 ring-primary/20 focus:outline-none overflow-hidden"
                  aria-label="Mon compte"
                >
                  {avatarUrl ? <img loading="lazy" src={avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : initials}
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-12 w-56 max-w-[calc(100vw-1rem)] bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900">Mon compte</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <button onClick={() => { setUserMenuOpen(false); navigate("/profil"); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"><User className="w-4 h-4 text-slate-400" /> Mon profil</button>
                      <button onClick={() => { setUserMenuOpen(false); navigate("/profil"); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"><Lock className="w-4 h-4 text-slate-400" /> Changer mon mot de passe</button>
                      <button onClick={() => { setUserMenuOpen(false); navigate("/notifications"); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"><Bell className="w-4 h-4 text-slate-400" /> Notifications</button>
                    </div>
                    <div className="border-t border-slate-100 py-1">
                      <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"><LogOut className="w-4 h-4" /> Se déconnecter</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Button asChild size="sm" className="hidden min-[380px]:inline-flex bg-red-600 hover:bg-red-700 text-white rounded-full px-3 sm:px-4 py-2 text-sm font-semibold shadow-sm">
                <Link to="/adhesion">Nous rejoindre</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button type="button" aria-label="Fermer le menu" className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative flex h-full w-[84vw] max-w-[320px] flex-col overflow-hidden border-r border-border bg-card shadow-2xl">
            <div className="flex items-center gap-3 border-b border-border p-5 pr-14">
              <img loading="lazy" src={logoFocom} alt="FOCOM" className="h-11 w-11 object-contain" />
              <div className="min-w-0">
                <div className="font-display font-black text-primary text-base leading-none">FOCOM</div>
                <div className="font-display font-black text-secondary text-sm leading-none mt-1">UES ILIAD</div>
                <div className="text-[9px] font-bold text-muted-foreground tracking-wider mt-1">NOTRE FORCE, VOS DROITS</div>
              </div>
            </div>
            <button type="button" onClick={() => setMobileMenuOpen(false)} className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground" aria-label="Fermer le menu"><X className="h-5 w-5" /></button>
            <nav className="flex-1 space-y-1 overflow-y-auto p-3">
              {MOBILE_NAV.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    end={item.end}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) => `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-secondary text-secondary-foreground"
                        : item.to === "/adhesion"
                          ? "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                          : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4" onClick={() => setSearchOpen(false)}>
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
              <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <input ref={inputRef} type="text" placeholder="Rechercher une page, un document…" value={query} onChange={(e) => setQuery(e.target.value)} className="flex-1 min-w-0 text-sm text-slate-900 placeholder-slate-400 outline-none bg-transparent" />
              <button onClick={() => setSearchOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            {results.length > 0 && <ul className="max-h-72 overflow-y-auto py-2">{results.map((item) => <li key={item.href}><button onClick={() => handleSelect(item.href)} className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-red-600 transition-colors text-left"><span className="truncate">{item.label}</span><ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0" /></button></li>)}</ul>}
            {query.trim().length > 0 && results.length === 0 && <div className="px-4 py-6 text-center text-sm text-slate-400">Aucun résultat pour «&nbsp;{query}&nbsp;»</div>}
            {query.trim().length === 0 && (
              <div className="px-4 py-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Accès rapides</p>
                <div className="flex flex-wrap gap-2">
                  {["Le syndicat", "NAO 2026", "Adhésion", "Vos droits", "Contact"].map((label) => {
                    const item = SEARCH_LINKS.find((l) => l.label.startsWith(label));
                    return item ? <button key={label} onClick={() => handleSelect(item.href)} className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 rounded-full transition-colors">{label}</button> : null;
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
