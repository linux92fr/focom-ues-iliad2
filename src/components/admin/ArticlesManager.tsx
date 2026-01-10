import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import { articleSchema, validateFormData } from "@/lib/validations";

type Article = Tables<"articles">;
type Category = Tables<"categories">;

const ArticlesManager = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [coverImage, setCoverImage] = useState("");
  const [published, setPublished] = useState(false);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error("Error fetching articles:", error);
      toast.error("Erreur lors du chargement des articles");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, []);

  const resetForm = () => {
    setTitle("");
    setSlug("");
    setExcerpt("");
    setContent("");
    setCategoryId("");
    setCoverImage("");
    setPublished(false);
    setEditingArticle(null);
    setFormErrors({});
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!editingArticle) {
      setSlug(generateSlug(value));
    }
  };

  const openEditDialog = (article: Article) => {
    setEditingArticle(article);
    setTitle(article.title);
    setSlug(article.slug);
    setExcerpt(article.excerpt || "");
    setContent(article.content);
    setCategoryId(article.category_id || "");
    setCoverImage(article.cover_image || "");
    setPublished(article.published);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!user) return;

    // Validate form data
    const validation = validateFormData(articleSchema, {
      title,
      slug,
      excerpt: excerpt || null,
      content,
      cover_image: coverImage || null,
      category_id: categoryId || null,
      published,
    });

    if (validation.success === false) {
      setFormErrors(validation.errors);
      const firstError = Object.values(validation.errors)[0];
      if (firstError) toast.error(firstError);
      return;
    }

    setFormErrors({});
    const validData = validation.data;

    try {
      const articleData = {
        title: validData.title,
        slug: validData.slug,
        excerpt: validData.excerpt || null,
        content: validData.content,
        category_id: validData.category_id || null,
        cover_image: validData.cover_image || null,
        published: validData.published,
        published_at: validData.published ? new Date().toISOString() : null,
        author_id: user.id,
      };

      if (editingArticle) {
        const { error } = await supabase
          .from("articles")
          .update(articleData)
          .eq("id", editingArticle.id);

        if (error) throw error;
        toast.success("Article mis à jour");
      } else {
        const { error } = await supabase.from("articles").insert(articleData);

        if (error) throw error;
        toast.success("Article créé");
      }

      setDialogOpen(false);
      resetForm();
      fetchArticles();
    } catch (error: any) {
      console.error("Error saving article:", error);
      toast.error(error.message || "Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) return;

    try {
      const { error } = await supabase.from("articles").delete().eq("id", id);

      if (error) throw error;
      toast.success("Article supprimé");
      fetchArticles();
    } catch (error: any) {
      console.error("Error deleting article:", error);
      toast.error(error.message || "Erreur lors de la suppression");
    }
  };

  const togglePublished = async (article: Article) => {
    try {
      const { error } = await supabase
        .from("articles")
        .update({
          published: !article.published,
          published_at: !article.published ? new Date().toISOString() : null,
        })
        .eq("id", article.id);

      if (error) throw error;
      toast.success(article.published ? "Article dépublié" : "Article publié");
      fetchArticles();
    } catch (error: any) {
      console.error("Error toggling publish:", error);
      toast.error(error.message || "Erreur");
    }
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return null;
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || null;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Articles</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouvel article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingArticle ? "Modifier l'article" : "Nouvel article"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Titre de l'article"
                  maxLength={200}
                  className={formErrors.title ? "border-destructive" : ""}
                />
                {formErrors.title && (
                  <p className="text-sm text-destructive">{formErrors.title}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase())}
                  placeholder="url-de-l-article"
                  maxLength={200}
                  className={formErrors.slug ? "border-destructive" : ""}
                />
                {formErrors.slug && (
                  <p className="text-sm text-destructive">{formErrors.slug}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Catégorie</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="excerpt">Extrait</Label>
                <Textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Court résumé de l'article"
                  rows={2}
                  maxLength={500}
                  className={formErrors.excerpt ? "border-destructive" : ""}
                />
                {formErrors.excerpt && (
                  <p className="text-sm text-destructive">{formErrors.excerpt}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">Contenu *</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Contenu de l'article"
                  rows={8}
                  maxLength={100000}
                  className={formErrors.content ? "border-destructive" : ""}
                />
                {formErrors.content && (
                  <p className="text-sm text-destructive">{formErrors.content}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="coverImage">Image de couverture (URL)</Label>
                <Input
                  id="coverImage"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://..."
                  className={formErrors.cover_image ? "border-destructive" : ""}
                />
                {formErrors.cover_image && (
                  <p className="text-sm text-destructive">{formErrors.cover_image}</p>
                )}
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="published">Publier</Label>
                <Switch
                  id="published"
                  checked={published}
                  onCheckedChange={setPublished}
                />
              </div>
              <Button onClick={handleSubmit} className="w-full">
                {editingArticle ? "Mettre à jour" : "Créer l'article"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {articles.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Aucun article pour le moment
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium">{article.title}</TableCell>
                  <TableCell>
                    {getCategoryName(article.category_id) && (
                      <Badge variant="secondary">
                        {getCategoryName(article.category_id)}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={article.published ? "default" : "outline"}>
                      {article.published ? "Publié" : "Brouillon"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(article.created_at).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => togglePublished(article)}
                        title={article.published ? "Dépublier" : "Publier"}
                      >
                        {article.published ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(article)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(article.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ArticlesManager;
