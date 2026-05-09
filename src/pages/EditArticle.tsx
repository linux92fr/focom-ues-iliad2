import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  ArrowLeft,
  Save,
  Send,
  Loader2,
  Trash2,
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

interface ArticleForm {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  image_url: string;
  is_published: boolean;
  published_at: string;
}

export default function EditArticle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAdminAuth();

  const [form, setForm] = useState<ArticleForm>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "actualite",
    image_url: "",
    is_published: false,
    published_at: "",
  });

  const { data: existing, isLoading } = useQuery({
    queryKey: ["article-edit", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id && isAuthenticated,
  });

  useEffect(() => {
    if (existing) {
      setForm({
        title: existing.title || "",
        slug: existing.slug || "",
        excerpt: existing.excerpt || "",
        content: existing.content || "",
        category: existing.category || "actualite",
        image_url: existing.image_url || "",
        is_published: existing.is_published || false,
        published_at: existing.published_at
          ? format(new Date(existing.published_at), "yyyy-MM-dd'T'HH:mm")
          : "",
      });
    }
  }, [existing]);

  const updateMutation = useMutation({
    mutationFn: async ({ publish }: { publish: boolean }) => {
      const { data, error } = await supabase
        .from("articles")
        .update({
          title: form.title,
          slug: form.slug,
          excerpt: form.excerpt || null,
          content: form.content,
          category: form.category,
          image_url: form.image_url || null,
          is_published: publish,
          status: publish ? ("publie" as const) : ("brouillon" as const),
          published_at:
            publish && !form.published_at
              ? new Date().toISOString()
              : form.published_at
              ? new Date(form.published_at).toISOString()
              : null,
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      toast.success("Article mis à jour !");
      navigate("/admin/actualites");
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("articles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      toast.success("Article supprimé");
      navigate("/admin/actualites");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const handleDelete = () => {
    if (window.confirm("Supprimer cet article définitivement ?")) {
      deleteMutation.mutate();
    }
  };

  if (!isAuthenticated) {
    navigate("/admin/login");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/admin/actualites")}
                className="p-2 rounded-lg hover:bg-slate-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <img loading="lazy" src={LOGO_IMAGE} alt="FO Com" className="h-12 w-12 object-contain" />
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-slate-900 leading-tight">FOCOM UES ILIAD</h1>
                <p className="text-[11px] text-slate-500 font-medium tracking-wide uppercase">
                  Modifier l'article
                </p>
              </div>
            </div>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-lg transition-colors border border-red-200"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Supprimer</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[860px] mx-auto p-4 lg:p-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Modifier l'article</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Modifiez le contenu puis enregistrez ou publiez vos changements.
            </p>
          </div>

          {/* Titre */}
          <div className="space-y-1.5">
            <Label className="text-slate-700 font-medium">Titre *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Titre de l'article"
              className="border-slate-200 focus:ring-red-500"
            />
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <Label className="text-slate-700 font-medium">Slug (URL)</Label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">/actualites/</span>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="font-mono text-sm border-slate-200 focus:ring-red-500 flex-1"
              />
            </div>
          </div>

          {/* Catégorie */}
          <div className="space-y-1.5">
            <Label className="text-slate-700 font-medium">Catégorie</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
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
            <Label className="text-slate-700 font-medium">URL de l'image (optionnel)</Label>
            <Input
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              placeholder="https://..."
              className="border-slate-200 focus:ring-red-500"
            />
          </div>

          {/* Extrait */}
          <div className="space-y-1.5">
            <Label className="text-slate-700 font-medium">Extrait (optionnel)</Label>
            <Textarea
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              rows={3}
              className="border-slate-200 focus:ring-red-500 resize-none"
            />
          </div>

          {/* Contenu */}
          <div className="space-y-1.5">
            <Label className="text-slate-700 font-medium">Contenu * (HTML accepté)</Label>
            <Textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={14}
              className="border-slate-200 focus:ring-red-500 font-mono text-sm resize-y"
            />
          </div>

          {/* Date de publication */}
          <div className="space-y-1.5">
            <Label className="text-slate-700 font-medium">Date de publication</Label>
            <Input
              type="datetime-local"
              value={form.published_at}
              onChange={(e) => setForm({ ...form, published_at: e.target.value })}
              className="border-slate-200 focus:ring-red-500"
            />
          </div>

          {/* Checkbox publié */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
            />
            <span className="text-sm font-medium text-slate-700">Article publié</span>
          </label>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => updateMutation.mutate({ publish: false })}
              disabled={updateMutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              {updateMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Enregistrer brouillon
            </button>
            <button
              type="button"
              onClick={() => updateMutation.mutate({ publish: true })}
              disabled={updateMutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-colors"
            >
              {updateMutation.isPending ? (
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
