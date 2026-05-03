import { Link } from "react-router-dom";
import { Search, Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PageHeader() {
  return (
    <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
      <div className="px-4 h-14 flex items-center justify-end gap-2">

        {/* Recherche */}
        <button
          aria-label="Rechercher"
          className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <Link
          to="/notifications"
          aria-label="Notifications"
          className="relative w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <Bell className="w-5 h-5" />
          {/* Badge */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full ring-2 ring-white" />
        </Link>

        {/* Administration */}
        <Link
          to="/admin/login"
          aria-label="Administration"
          className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <Settings className="w-5 h-5" />
        </Link>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-200 mx-1" />

        {/* Nous rejoindre */}
        <Button
          asChild
          size="sm"
          className="bg-red-600 hover:bg-red-700 text-white rounded-full px-4 py-2 text-sm font-semibold shadow-sm"
        >
          <Link to="/adhesion">Nous rejoindre</Link>
        </Button>

      </div>
    </header>
  );
}