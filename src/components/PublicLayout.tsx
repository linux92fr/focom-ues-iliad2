import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Calendar, Mail, MessageSquare, Shield } from "lucide-react";
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
    return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">Chargement du site…</div>;
  }

  if (maintenanceMode) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 text-center">
        <div className="max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600"><Shield className="h-8 w-8" /></div>
          <p className="mb-2 text-sm font-bold uppercase tracking-widest text-red-600">FO COM UES ILIAD</p>
          <h1 className="mb-4 text-2xl font-bold text-slate-900">Site temporairement en maintenance</h1>
          <p className="text-slate-600">Nous effectuons actuellement une intervention pour améliorer le site. Merci de revenir dans quelques instants.</p>
        </div>
      </main>
    );
  }

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
