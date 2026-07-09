import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { adminPath } from "@/lib/adminPath";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  ArrowLeft,
  Save,
  Send,
  Loader2,
  Trash2,
  Upload,
  Image as ImageIcon,
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

const ARTICLE_IMAGES_BUCKET = "article-images";

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

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const safeFileName = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-");

export default function EditArticle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAdminAuth();
  const [imageFile, setImageFile] = useState<File | null>(null);

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

  const uploadArticleImage = async () => {
    if (!imageFile) return form.image_url.trim() || null;
    if (!imageFile.type.startsWith("image/")) throw new Error("Le fichier choisi doit être une image");

    const path = `${new Date().getFullYear()}/${Date.now()}-${safeFileName(imageFile.name)}`;
    const { error } = await supabase.storage
      .from(ARTICLE_IMAGES_BUCKET)
      .upload(path, imageFile, { upsert: false, contentType: imageFile.type });
    if (error) throw error;

    const { data } = supabase.storage.from(ARTICLE_IMAGES_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  };

  const validate = () => {
    if (!form.title.trim()) { toast.error("Le titre est requis"); return false; }
    if (!form.slug.trim()) { toast.error("Le slug est requis"); return false; }
    if (!form.content.trim()) { toast.error("Le contenu est requis"); return false; }
    return true;
  };

  const updateMutation = useMutation({
    mutationFn: async ({ publish }: { publish: boolean }) => {
      const finalImageUrl = await uploadArticleImage();
      const finalPublishedAt = publish
        ? form.published_at
          ? new Date(form.published_at).toISOString()
          : existing?.published_at || new Date().toISOString()
        : null;

      const { data, error } = await supabase
        .from("articles")
        .update({
          title: form.title.trim(),
          slug: slugify(form.slug),
          excerpt: form.excerpt.trim() || null,
          content: form.content.trim(),
          category: form.category,
          image_url: finalImageUrl,
          is_published: publish,
          status: publish ? ("publie" as const) : ("brouillon" as const),
          published_at: finalPublishedAt,
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      queryClient.invalidateQueries({ queryKey: ["article-edit", id] });
      toast.success("Article mis à jour !");
      navigate(adminPath("/actualites"));
    },
    onError: (error) => {
      console.error("Erreur mise à jour article", error);
      toast.error(error instanceof Error ? error.message : "Erreur lors de la mise à jour");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("articles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      toast.success("Article supprimé");
      navigate(adminPath("/actualites"));
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const handleDelete = () => {
    if (window.confirm("Supprimer cet article définitivement ?")) deleteMutation.mutate();
  };

  const submit = (publish: boolean) => {
    if (!validate()) return;
    updateMutation.mutate({ publish });
  };

  if (!isAuthenticated) {
    navigate(adminPath("/login"));
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  const previewUrl = imageFile ? URL.createObjectURL(imageFile) : form.image_url;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(adminPath("/actualites"))} className="p-2 rounded-lg hover:bg-slate-100">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <img loading="lazy" src={LOGO_IMAGE} alt="FO Com" className="h-12 w-12 object-contain" />
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-slate-900 leading-tight">FOCOM UES ILIAD</h1>
                <p className="text-[11px] text-slate-500 font-medium tracking-wide uppercase">Modifier l'article</p>
              </div>
            </div>
            <button onClick={handleDelete} disabled={deleteMutation.isPending} className="flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-lg transition-colors border border-red-200">
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
            <p className="text-sm text-slate-500 mt-0.5">Modifiez le contenu puis enregistrez ou publiez vos changements.</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-700 font-medium">Titre *</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Titre de l'article" className="border-slate-200 focus:ring-red-500" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-700 font-medium">Slug (URL)</Label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">/actualites/</span>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} className="font-mono text-sm border-slate-200 focus:ring-red-500 flex-1" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-700 font-medium">Catégorie</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger className="border-slate-200"><SelectValue /></SelectTrigger>
              <SelectContent>{categoryOptions.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-slate-700 font-medium">Image de l'article</Label>
            <label className="block border-2 border-dashed border-slate-200 rounded-xl p-5 text-center hover:border-red-300 transition-colors cursor-pointer">
              <Upload className="w-7 h-7 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-600">{imageFile ? imageFile.name : "Choisir une nouvelle image"}</p>
              <p className="text-xs text-slate-400 mt-1">Laissez vide pour conserver l'image actuelle</p>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
            </label>
            <div className="space-y-1.5">
              <Label className="text-slate-700 font-medium">ou URL de l'image</Label>
              <Input value={form.image_url} onChange={(e) => { setForm({ ...form, image_url: e.target.value }); setImageFile(null); }} placeholder="https://..." className="border-slate-200 focus:ring-red-500" />
            </div>
            {previewUrl && (
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2 text-xs text-slate-500 px-3 py-2 border-b border-slate-200"><ImageIcon className="w-3.5 h-3.5" /> Aperçu image</div>
                <img src={previewUrl} alt="Aperçu" className="w-full max-h-64 object-cover" />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-700 font-medium">Extrait (optionnel)</Label>
            <Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={3} className="border-slate-200 focus:ring-red-500 resize-none" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-700 font-medium">Contenu * (HTML accepté)</Label>
            <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={14} className="border-slate-200 focus:ring-red-500 font-mono text-sm resize-y" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-700 font-medium">Date de publication</Label>
            <Input type="datetime-local" value={form.published_at} onChange={(e) => setForm({ ...form, published_at: e.target.value })} className="border-slate-200 focus:ring-red-500" />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500" />
            <span className="text-sm font-medium text-slate-700">Article publié</span>
          </label>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button type="button" onClick={() => submit(false)} disabled={updateMutation.isPending} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors">
              {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Enregistrer brouillon
            </button>
            <button type="button" onClick={() => submit(true)} disabled={updateMutation.isPending} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-colors">
              {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
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
