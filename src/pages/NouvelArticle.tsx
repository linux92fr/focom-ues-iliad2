import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Send,
  Loader2,
  FileText,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LOGO_IMAGE =
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663612648040/LldXxCbhFdcPcHwX.png";

const categoryOptions = [
  { value: "actualite", label: "Actualité" },
  { value: "communique", label: "Communiqué" },
  { value: "evenement", label: "Événement" },
  { value: "victoire", label: "Victoire syndicale" },
];

export default function NouvelArticle() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAdminAuth();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("actualite");
  const [imageUrl, setImageUrl] = useState("");

  // Auto-generate slug from title
  useEffect(() => {
    if (title) {
      const generated = title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setSlug(generated);
    }
  }, [title]);

  const createMutation = useMutation({
    mutationFn: async ({ publish }: { publish: boolean }) => {
      const { data, error } = await supabase
        .from("articles")
        .insert({
          title,
          slug,
          excerpt: excerpt || null,
          content,
          category,
          image_url: imageUrl || null,
          author_id: null,
          is_published: publish,
          status: publish ? ("publie" as const) : ("brouillon" as const),
          published_at: publish ? new Date().toISOString() : null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      toast.success(variables.publish ? "Article publié !" : "Brouillon enregistré !");
      navigate("/admin/actualites");
    },
    onError: () => toast.error("Erreur lors de la création de l'article"),
  });

  const validate = () => {
    if (!title.trim()) { toast.error("Le titre est requis"); return false; }
    if (!content.trim()) { toast.error("Le contenu est requis"); return false; }
    return true;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-slate-200 p-8 max-w-md text-center shadow-sm">
          <FileText className="w-12 h-12 text-red-300 mx-auto mb-3" />
          <h2 className="font-bold text-slate-900 mb-1">Accès refusé</h2>
          <p className="text-sm text-slate-500 mb-4">
            Vous devez être connecté à l'espace d'administration.
          </p>
          <button
            onClick={() => navigate("/admin/login")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 h-16">
            <button
              onClick={() => navigate("/admin/actualites")}
              className="p-2 rounded-lg hover:bg-slate-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <img src={LOGO_IMAGE} alt="FO Com" className="h-12 w-12 object-contain" />
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-slate-900 leading-tight">FOCOM UES ILIAD</h1>
              <p className="text-[11px] text-slate-500 font-medium tracking-wide uppercase">
                Nouvel article
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[860px] mx-auto p-4 lg:p-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Créer un article</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Rédigez votre article et publiez-le ou enregistrez-le comme brouillon.
            </p>
          </div>

          {/* Titre */}
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-slate-700 font-medium">Titre *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre de l'article"
              className="border-slate-200 focus:ring-red-500"
            />
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <Label htmlFor="slug" className="text-slate-700 font-medium">Slug (URL)</Label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">/actualites/</span>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="slug-de-l-article"
                className="font-mono text-sm border-slate-200 focus:ring-red-500 flex-1"
              />
            </div>
          </div>

          {/* Catégorie */}
          <div className="space-y-1.5">
            <Label className="text-slate-700 font-medium">Catégorie</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Image URL */}
          <div className="space-y-1.5">
            <Label htmlFor="imageUrl" className="text-slate-700 font-medium">URL de l'image (optionnel)</Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="border-slate-200 focus:ring-red-500"
            />
          </div>

          {/* Extrait */}
          <div className="space-y-1.5">
            <Label htmlFor="excerpt" className="text-slate-700 font-medium">Extrait (optionnel)</Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Court résumé de l'article..."
              rows={3}
              className="border-slate-200 focus:ring-red-500 resize-none"
            />
          </div>

          {/* Contenu */}
          <div className="space-y-1.5">
            <Label htmlFor="content" className="text-slate-700 font-medium">Contenu * (HTML accepté)</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Rédigez votre article ici... (HTML accepté)"
              rows={14}
              className="border-slate-200 focus:ring-red-500 font-mono text-sm resize-y"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => { if (validate()) createMutation.mutate({ publish: false }); }}
              disabled={createMutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              {createMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Enregistrer comme brouillon
            </button>
            <button
              type="button"
              onClick={() => { if (validate()) createMutation.mutate({ publish: true }); }}
              disabled={createMutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-colors"
            >
              {createMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Publier
            </button>
          </div>
        </div>
      </main>

      <footer className="mt-12 bg-white border-t border-slate-200 py-6">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-slate-500 text-center">© 2026 FOCOM UES ILIAD – Tous droits réservés</p>
        </div>
      </footer>
    </div>
  );
}
