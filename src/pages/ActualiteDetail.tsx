import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowLeft, Calendar, Edit2, FileText } from "lucide-react";

const LOGO_IMAGE =
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663612648040/LldXxCbhFdcPcHwX.png";

const ARTICLE_ROLES = ["admin", "representant", "redacteur"];

const categoryLabels: Record<string, string> = {
  actualite: "Actualité",
  communique: "Communiqué",
  evenement: "Événement",
  victoire: "Victoire syndicale",
};

export default function ActualiteDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { hasAnyRole } = useSupabaseAuth();
  const canManage = hasAnyRole(ARTICLE_ROLES);

  const { data: article, isLoading, error } = useQuery({
    queryKey: ["article", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/actualites")}
                className="p-2 rounded-lg hover:bg-slate-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <img src={LOGO_IMAGE} alt="FO Com" className="h-12 w-12 object-contain" />
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-slate-900 leading-tight">FOCOM UES ILIAD</h1>
                <p className="text-[11px] text-slate-500 font-medium tracking-wide uppercase">
                  Actualités
                </p>
              </div>
            </div>
            {canManage && article && (
              <Link
                to={`/actualites/${article.id}/editer`}
                className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Modifier
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[860px] mx-auto p-4 lg:p-8">
        {isLoading && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse">
            <div className="h-64 bg-slate-200" />
            <div className="p-8 space-y-4">
              <div className="h-3 bg-slate-200 rounded w-1/4" />
              <div className="h-8 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-200 rounded w-full" />
              <div className="h-3 bg-slate-200 rounded w-5/6" />
            </div>
          </div>
        )}

        {error && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-semibold">Article introuvable</p>
            <p className="text-slate-400 text-sm mt-1">
              Cet article n'existe pas ou n'est pas publié.
            </p>
            <button
              onClick={() => navigate("/actualites")}
              className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Retour aux actualités
            </button>
          </div>
        )}

        {article && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            {article.image_url && (
              <img
                src={article.image_url}
                alt={article.title}
                className="w-full h-64 object-cover"
              />
            )}
            <div className="p-6 lg:p-10">
              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {article.category && (
                  <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">
                    {categoryLabels[article.category] || article.category}
                  </span>
                )}
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {format(
                    new Date(article.published_at || article.created_at),
                    "dd MMMM yyyy",
                    { locale: fr }
                  )}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4 leading-tight">
                {article.title}
              </h1>

              {/* Excerpt */}
              {article.excerpt && (
                <p className="text-slate-500 text-base mb-6 border-l-4 border-teal-500 pl-4 italic">
                  {article.excerpt}
                </p>
              )}

              {/* Content */}
              <div
                className="prose prose-slate prose-sm sm:prose max-w-none"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* Back link */}
              <div className="mt-10 pt-6 border-t border-slate-100">
                <button
                  onClick={() => navigate("/actualites")}
                  className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour aux actualités
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

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
