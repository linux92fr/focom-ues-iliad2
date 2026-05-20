import { Link, Outlet, useLocation } from "react-router-dom";
import { Calendar, Mail, MessageSquare } from "lucide-react";
import Sidebar from "./Sidebar";
import PageHeader from "./PageHeader";
import ScrollToTop from "./ScrollToTop";

function ProfileHelpShortcuts() {
  const location = useLocation();
  if (location.pathname !== "/profil") return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 hidden w-72 rounded-2xl border border-red-100 bg-white p-4 shadow-xl lg:block">
      <p className="text-sm font-bold text-slate-900">Besoin d'aide ?</p>
      <p className="mb-3 text-xs text-slate-500">Accès rapides depuis votre espace adhérent.</p>
      <div className="space-y-2">
        <Link to="/mes-reclamations" className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-sm font-medium hover:bg-red-50">
          <MessageSquare className="h-4 w-4 text-red-600" /> Mes réclamations
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
  return (
    <div className="flex min-h-screen bg-background">
      <ScrollToTop />
      <div className="sticky top-0 h-screen shrink-0">
        <Sidebar />
      </div>
      <div className="flex-1 min-w-0 flex flex-col">
        <PageHeader />
        <Outlet />
        <ProfileHelpShortcuts />
      </div>
    </div>
  );
}
