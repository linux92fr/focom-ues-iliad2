import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { adminPath } from "@/lib/adminPath";
import { toast } from "sonner";
import {
  Save,
  Send,
  Loader2,
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
import AdminLayout, { AdminAuthGuard } from "@/components/admin/AdminLayout";

const ARTICLE_IMAGES_BUCKET = "article-images";

const categoryOptions = [
  { value: "actualite", label: "Actualité" },
  { value: "communique", label: "Communiqué" },
  { value: "evenement", label: "Événement" },
  { value: "victoire", label: "Victoire syndicale" },
];

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

export default function NouvelArticle() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("actualite");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (title) setSlug(slugify(title));
  }, [title]);

  const uploadArticleImage = async () => {
    if (!imageFile) return imageUrl.trim() || null;

    if (!imageFile.type.startsWith("image/")) {
      throw new Error("Le fichier choisi doit être une image");
    }

    const path = `${new Date().getFullYear()}/${Date.now()}-${safeFileName(imageFile.name)}`;
    const { error } = await supabase.storage
      .from(ARTICLE_IMAGES_BUCKET)
      .upload(path, imageFile, {
        upsert: false,
        contentType: imageFile.type,
      });

    if (error) throw error;

    const { data } = supabase.storage.from(ARTICLE_IMAGES_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  };

  const createMutation = useMutation({
    mutationFn: async ({ publish }: { publish: boolean }) => {
      const finalImageUrl = await uploadArticleImage();

      const { data, error } = await supabase
        .from("articles")
        .insert({
          title: title.trim(),
          slug: slug.trim(),
          excerpt: excerpt.trim() || null,
          content: content.trim(),
          category,
          image_url: finalImageUrl,
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
      navigate(adminPath("/actualites"));
    },
    onError: (error) => {
      console.error("Erreur création article", error);
      toast.error(error instanceof Error ? error.message : "Erreur lors de la création de l'article");
    },
  });

  const validate = () => {
    if (!title.trim()) { toast.error("Le titre est requis"); return false; }
    if (!slug.trim()) { toast.error("Le slug est requis"); return false; }
    if (!content.trim()) { toast.error("Le contenu est requis"); return false; }
    return true;
  };

  const previewUrl = imageFile ? URL.createObjectURL(imageFile) : imageUrl;

  return (
    <AdminAuthGuard>
      <AdminLayout title="Nouvel article" breadcrumb={["Actualités", "Nouvel article"]}>
        <div className="max-w-[860px] mx-auto bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Créer un article</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Rédigez votre article et publiez-le ou enregistrez-le comme brouillon.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-slate-700 font-medium">Titre *</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre de l'article" className="border-slate-200 focus:ring-red-500" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="slug" className="text-slate-700 font-medium">Slug (URL)</Label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">/actualites/</span>
              <Input id="slug" value={slug} onChange={(e) => setSlug(slugify(e.target.value))} placeholder="slug-de-l-article" className="font-mono text-sm border-slate-200 focus:ring-red-500 flex-1" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-700 font-medium">Catégorie</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="border-slate-200"><SelectValue /></SelectTrigger>
              <SelectContent>{categoryOptions.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-slate-700 font-medium">Image de l'article</Label>
            <label className="block border-2 border-dashed border-slate-200 rounded-xl p-5 text-center hover:border-red-300 transition-colors cursor-pointer">
              <Upload className="w-7 h-7 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-600">{imageFile ? imageFile.name : "Choisir une image à uploader"}</p>
              <p className="text-xs text-slate-400 mt-1">JPG, PNG, WebP conseillé</p>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
            </label>
            <div className="space-y-1.5">
              <Label htmlFor="imageUrl" className="text-slate-700 font-medium">ou URL de l'image</Label>
              <Input id="imageUrl" value={imageUrl} onChange={(e) => { setImageUrl(e.target.value); setImageFile(null); }} placeholder="https://..." className="border-slate-200 focus:ring-red-500" />
            </div>
            {previewUrl && (
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2 text-xs text-slate-500 px-3 py-2 border-b border-slate-200">
                  <ImageIcon className="w-3.5 h-3.5" /> Aperçu image
                </div>
                <img src={previewUrl} alt="Aperçu" className="w-full max-h-64 object-cover" />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="excerpt" className="text-slate-700 font-medium">Extrait (optionnel)</Label>
            <Textarea id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Court résumé de l'article..." rows={3} className="border-slate-200 focus:ring-red-500 resize-none" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="content" className="text-slate-700 font-medium">Contenu * (HTML accepté)</Label>
            <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Rédigez votre article ici... (HTML accepté)" rows={14} className="border-slate-200 focus:ring-red-500 font-mono text-sm resize-y" />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button type="button" onClick={() => { if (validate()) createMutation.mutate({ publish: false }); }} disabled={createMutation.isPending} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors">
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Enregistrer comme brouillon
            </button>
            <button type="button" onClick={() => { if (validate()) createMutation.mutate({ publish: true }); }} disabled={createMutation.isPending} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-colors">
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Publier
            </button>
          </div>
        </div>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
