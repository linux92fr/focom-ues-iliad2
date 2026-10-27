import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Calendar, Mail, MessageSquare, Shield, Wrench, RadioTower, Sparkles } from "lucide-react";
import Sidebar from "./Sidebar";
import PageHeader from "./PageHeader";
import ScrollToTop from "./ScrollToTop";
import { supabase } from "@/integrations/supabase/client";

function ProfileHelpShortcuts() {
  const location = useLocation();
  if (location.pathname !== "/profil") return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 hidden w-72 rounded-2xl border border-red-100 bg-white p-4 shadow-xl lg:block">
      <p className="text-sm font-bold text-slate-900">Besoin d'aide ?</p>
      <p className="mb-3 text-xs text-slate-500">Accès rapides depuis votre espace adhérent.</p>
      <div className="space-y-2">
        <Link to="/mes-reclamations" className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-sm font-medium hover:bg-red-50">
          <MessageSquare className="h-4 w-4 text-red-600" /> Mes demandes
        </Link>
        <Link to="/permanences" className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-sm font-medium hover:bg-red-50">
          <Calendar className="h-4 w-4 text-red-600" /> Prendre RDV
        </Link>
        <Link to="/contact" className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-sm font-medium hover:bg-red-50">
          <Mail className="h-4 w-4 text-red-600" /> Contacter FO COM
        </Link>
      </div>
    </div>
  );
}

function MaintenanceScreen() {
  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#10141c] px-5 py-12 text-center text-white sm:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-[#d71920]/25 blur-3xl motion-safe:animate-pulse" />
        <div className="absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-[#139c9a]/20 blur-3xl motion-safe:animate-pulse [animation-delay:900ms]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:44px_44px]" />
      </div>

      <section className="w-full max-w-2xl motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700">
        <div className="mx-auto mb-8 flex w-fit items-center gap-3 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 shadow-lg shadow-black/10 backdrop-blur">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#139c9a] opacity-70 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#139c9a]" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">Intervention en cours</span>
        </div>

        <div className="relative mx-auto mb-9 flex h-32 w-32 items-center justify-center sm:h-36 sm:w-36">
          <div className="absolute inset-0 rounded-[2rem] border border-white/10 bg-white/[0.04] rotate-6 motion-safe:animate-pulse" />
          <div className="absolute inset-2 rounded-[1.7rem] border border-[#139c9a]/30" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#d71920] to-[#a80f17] shadow-xl shadow-red-950/50 sm:h-24 sm:w-24">
            <Wrench className="h-10 w-10 text-white motion-safe:animate-[bounce_2.4s_ease-in-out_infinite] sm:h-12 sm:w-12" strokeWidth={1.6} />
          </div>
          <RadioTower className="absolute -right-3 -top-2 h-8 w-8 text-[#36c7c0] motion-safe:animate-pulse" />
          <Sparkles className="absolute -bottom-2 -left-3 h-7 w-7 text-red-300 motion-safe:animate-pulse [animation-delay:500ms]" />
        </div>

        <p className="mb-4 text-sm font-bold uppercase tracking-[0.28em] text-[#ff6b70]">FO COM <span className="text-white/45">/</span> UES ILIAD</p>
        <h1 className="mx-auto max-w-xl text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl md:text-6xl">
          On revient très vite<span className="text-[#ff454d]">.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-base leading-7 text-slate-300 sm:text-lg">
          Notre site fait peau neuve. Nous réalisons actuellement une opération de maintenance pour vous retrouver dans les meilleures conditions.
        </p>

        <div className="mx-auto mt-9 max-w-sm rounded-2xl border border-white/10 bg-white/[0.05] p-5 text-left backdrop-blur-sm">
          <div className="mb-3 flex items-center justify-between gap-4">
            <span className="text-sm font-semibold text-white">Amélioration du site</span>
            <span className="text-xs font-medium text-[#36c7c0]">En cours</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[#d71920] via-[#ff454d] to-[#36c7c0] motion-safe:animate-[pulse_2s_ease-in-out_infinite]" />
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-400">Merci pour votre patience et votre confiance.</p>
        </div>

        <a
          href="mailto:contact@focomues-iliad.fr"
          className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white/85 transition duration-200 hover:border-[#36c7c0]/60 hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#36c7c0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#10141c]"
        >
          <Mail className="h-4 w-4 text-[#36c7c0]" />
          Nous contacter
        </a>

        <p className="mt-12 text-xs tracking-wide text-slate-500">FO COM UES ILIAD <span className="mx-2 text-slate-700">•</span> Au service des salariés</p>
      </section>
    </main>
  );
}

export default function PublicLayout() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadMaintenanceMode = async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("value")
        .eq("key", "site_settings")
        .maybeSingle();
      if (!cancelled) {
        if (error) console.error("Impossible de vérifier le mode maintenance", error);
        if (data?.value) {
          try {
            const settings = JSON.parse(data.value) as { maintenanceMode?: boolean };
            setMaintenanceMode(settings.maintenanceMode === true);
          } catch {
            console.error("Paramètres du site invalides : mode maintenance désactivé par sécurité");
          }
        }
        setSettingsLoaded(true);
      }
    };
    void loadMaintenanceMode();
    return () => { cancelled = true; };
  }, []);

  if (!settingsLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-sm text-slate-300">
        <div className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#139c9a] motion-safe:animate-pulse" />
          Chargement du site…
        </div>
      </div>
    );
  }

  if (maintenanceMode) return <MaintenanceScreen />;

  return (
    <div className="flex h-screen max-h-screen overflow-hidden bg-background">
      <ScrollToTop />
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <PageHeader />
        <main id="main-scroll-area" className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
          <Outlet />
        </main>
        <ProfileHelpShortcuts />
      </div>
    </div>
  );
}
