import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RichTextEditor from "@/components/ui/rich-text-editor";
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
import { newsSchema, validateFormData } from "@/lib/validations";

type News = Tables<"news">;
type Category = Tables<"categories">;

const NewsManager = () => {
  const { user } = useAuth();
  const [news, setNews] = useState<News[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [published, setPublished] = useState(false);

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNews(data || []);
    } catch (error) {
      console.error("Error fetching news:", error);
      toast.error("Erreur lors du chargement des actualités");
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
    fetchNews();
    fetchCategories();
  }, []);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setCategoryId("");
    setPublished(false);
    setEditingNews(null);
    setFormErrors({});
  };

  const openEditDialog = (newsItem: News) => {
    setEditingNews(newsItem);
    setTitle(newsItem.title);
    setContent(newsItem.content);
    setCategoryId(newsItem.category_id || "");
    setPublished(newsItem.published);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!user) return;

    // Validate form data
    const validation = validateFormData(newsSchema, {
      title,
      content,
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
      const newsData = {
        title: validData.title,
        content: validData.content,
        category_id: validData.category_id || null,
        published: validData.published,
        published_at: validData.published ? new Date().toISOString() : null,
        author_id: user.id,
      };

      if (editingNews) {
        const { error } = await supabase
          .from("news")
          .update(newsData)
          .eq("id", editingNews.id);

        if (error) throw error;
        toast.success("Actualité mise à jour");
      } else {
        const { error } = await supabase.from("news").insert(newsData);

        if (error) throw error;
        toast.success("Actualité créée");
      }

      setDialogOpen(false);
      resetForm();
      fetchNews();
    } catch (error: unknown) {
      console.error("Error saving news:", error);
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de l'enregistrement";
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette actualité ?")) return;

    try {
      const { error } = await supabase.from("news").delete().eq("id", id);

      if (error) throw error;
      toast.success("Actualité supprimée");
      fetchNews();
    } catch (error: unknown) {
      console.error("Error deleting news:", error);
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la suppression";
      toast.error(errorMessage);
    }
  };

  const togglePublished = async (newsItem: News) => {
    try {
      const { error } = await supabase
        .from("news")
        .update({
          published: !newsItem.published,
          published_at: !newsItem.published ? new Date().toISOString() : null,
        })
        .eq("id", newsItem.id);

      if (error) throw error;
      toast.success(newsItem.published ? "Actualité dépubliée" : "Actualité publiée");
      fetchNews();
    } catch (error: unknown) {
      console.error("Error toggling publish:", error);
      const errorMessage = error instanceof Error ? error.message : "Erreur";
      toast.error(errorMessage);
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
        <CardTitle>Actualités</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouvelle actualité
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingNews ? "Modifier l'actualité" : "Nouvelle actualité"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Titre de l'actualité"
                  maxLength={200}
                  className={formErrors.title ? "border-destructive" : ""}
                />
                {formErrors.title && (
                  <p className="text-sm text-destructive">{formErrors.title}</p>
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
                <Label>Contenu *</Label>
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Rédigez le contenu de votre actualité..."
                  minHeight="250px"
                  className={formErrors.content ? "border-destructive" : ""}
                />
                {formErrors.content && (
                  <p className="text-sm text-destructive">{formErrors.content}</p>
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
                {editingNews ? "Mettre à jour" : "Créer l'actualité"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {news.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Aucune actualité pour le moment
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
              {news.map((newsItem) => (
                <TableRow key={newsItem.id}>
                  <TableCell className="font-medium">{newsItem.title}</TableCell>
                  <TableCell>
                    {getCategoryName(newsItem.category_id) && (
                      <Badge variant="secondary">
                        {getCategoryName(newsItem.category_id)}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={newsItem.published ? "default" : "outline"}>
                      {newsItem.published ? "Publié" : "Brouillon"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(newsItem.created_at).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => togglePublished(newsItem)}
                        title={newsItem.published ? "Dépublier" : "Publier"}
                      >
                        {newsItem.published ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(newsItem)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(newsItem.id)}
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

export default NewsManager;
