/**
 * PageShell — layout wrapper commun pour les pages publiques du site FOCOM UES ILIAD.
 * Conserve le design de la cible (header blanc, fond slate-50, footer).
 */
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const LOGO_IMAGE =
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663612648040/LldXxCbhFdcPcHwX.png";

interface PageShellProps {
  children: React.ReactNode;
  /** Sous-titre affiché dans le header (optionnel) */
  subtitle?: string;
  /** Si true, affiche un bouton retour vers backTo (défaut: "/") */
  backTo?: string;
}

export default function PageShell({ children, subtitle, backTo = "/" }: PageShellProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 h-16">
            <button
              onClick={() => navigate(backTo)}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <img src={LOGO_IMAGE} alt="FO Com" className="h-12 w-12 object-contain" />
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-slate-900 leading-tight">FOCOM UES ILIAD</h1>
              {subtitle && (
                <p className="text-[11px] text-slate-500 font-medium tracking-wide uppercase">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[1440px] mx-auto p-4 lg:p-8">{children}</main>

      {/* Footer */}
      <footer className="mt-12 bg-white border-t border-slate-200 py-6">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">© 2026 FOCOM UES ILIAD – Tous droits réservés</p>
            <div className="flex gap-4">
              <button
                onClick={() => navigate("/mentions-legales")}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                Mentions légales
              </button>
              <button
                onClick={() => navigate("/rgpd")}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                Politique de confidentialité
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
