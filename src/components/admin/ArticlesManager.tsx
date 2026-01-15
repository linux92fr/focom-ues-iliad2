import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Eye, 
  EyeOff, 
  FileText, 
  Search,
  ExternalLink,
  Image as ImageIcon
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { Tables } from "@/integrations/supabase/types";
import { articleSchema, validateFormData } from "@/lib/validations";

type Article = Tables<"articles">;
type Category = Tables<"categories">;

const ArticlesManager = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [previewArticle, setPreviewArticle] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("edit");

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [coverImage, setCoverImage] = useState("");
  const [published, setPublished] = useState(false);

  // Fetch articles
  const { data: articles = [], isLoading: articlesLoading } = useQuery({
    queryKey: ["admin-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Article[];
    },
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as Category[];
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (articleData: {
      title: string;
      slug: string;
      excerpt: string | null;
      content: string;
      category_id: string | null;
      cover_image: string | null;
      published: boolean;
    }) => {
      if (!user) throw new Error("Non authentifié");

      const { error } = await supabase.from("articles").insert({
        ...articleData,
        published_at: articleData.published ? new Date().toISOString() : null,
        author_id: user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      toast.success("Article créé avec succès");
      resetForm();
      setDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Erreur lors de la création: " + error.message);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: {
      id: string;
      title: string;
      slug: string;
      excerpt: string | null;
      content: string;
      category_id: string | null;
      cover_image: string | null;
      published: boolean;
    }) => {
      const { id, ...articleData } = data;
      const { error } = await supabase
        .from("articles")
        .update({
          ...articleData,
          published_at: articleData.published ? new Date().toISOString() : null,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      toast.success("Article mis à jour avec succès");
      resetForm();
      setDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour: " + error.message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("articles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      toast.success("Article supprimé avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression: " + error.message);
    },
  });

  // Toggle published mutation
  const togglePublishedMutation = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const { error } = await supabase
        .from("articles")
        .update({
          published,
          published_at: published ? new Date().toISOString() : null,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      toast.success(variables.published ? "Article publié" : "Article dépublié");
    },
    onError: (error) => {
      toast.error("Erreur: " + error.message);
    },
  });

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
    setActiveTab("edit");
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
    setActiveTab("edit");
    setDialogOpen(true);
  };

  const openPreview = (article: Article) => {
    setPreviewArticle(article);
    setPreviewOpen(true);
  };

  const handleSubmit = () => {
    if (!user) return;

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

    const articleData = {
      title: validData.title,
      slug: validData.slug,
      excerpt: validData.excerpt || null,
      content: validData.content,
      category_id: validData.category_id || null,
      cover_image: validData.cover_image || null,
      published: validData.published,
    };

    if (editingArticle) {
      updateMutation.mutate({ id: editingArticle.id, ...articleData });
    } else {
      createMutation.mutate(articleData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
      deleteMutation.mutate(id);
    }
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return null;
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || null;
  };

  const getCategoryColor = (categoryId: string | null) => {
    if (!categoryId) return "#dc2626";
    const category = categories.find((c) => c.id === categoryId);
    return category?.color || "#dc2626";
  };

  // Filter articles based on search
  const filteredArticles = articles.filter((article) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Preview component for form
  const FormPreview = () => (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      {coverImage && (
        <div className="mb-4 rounded-lg overflow-hidden">
          <img 
            src={coverImage} 
            alt={title || "Aperçu"} 
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
        </div>
      )}
      <h1 className="text-xl font-bold mb-2">{title || "Titre de l'article"}</h1>
      {categoryId && (
        <Badge 
          style={{ backgroundColor: getCategoryColor(categoryId) }}
          className="mb-4"
        >
          {getCategoryName(categoryId)}
        </Badge>
      )}
      {excerpt && (
        <p className="text-muted-foreground italic mb-4">{excerpt}</p>
      )}
      <div className="whitespace-pre-wrap">
        {content || "Le contenu de l'article apparaîtra ici..."}
      </div>
    </div>
  );

  if (articlesLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Gestion des articles
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Dialog
              open={dialogOpen}
              onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) resetForm();
              }}
            >
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nouvel article
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                  <DialogTitle>
                    {editingArticle ? "Modifier l'article" : "Nouvel article"}
                  </DialogTitle>
                </DialogHeader>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="edit">Édition</TabsTrigger>
                    <TabsTrigger value="preview">Aperçu</TabsTrigger>
                  </TabsList>
                  <ScrollArea className="flex-1 h-[calc(90vh-180px)]">
                    <TabsContent value="edit" className="mt-4 space-y-4 pr-4">
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
                        <p className="text-xs text-muted-foreground">
                          URL: /publication/{slug || "votre-slug"}
                        </p>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="category">Catégorie</Label>
                        <Select value={categoryId} onValueChange={setCategoryId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une catégorie" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Aucune catégorie</SelectItem>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                <span className="flex items-center gap-2">
                                  <span 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: category.color || "#dc2626" }}
                                  />
                                  {category.name}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="coverImage">Image de couverture (URL)</Label>
                        <div className="flex gap-2">
                          <Input
                            id="coverImage"
                            value={coverImage}
                            onChange={(e) => setCoverImage(e.target.value)}
                            placeholder="https://..."
                            className={formErrors.cover_image ? "border-destructive" : ""}
                          />
                          {coverImage && (
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="icon"
                              onClick={() => window.open(coverImage, "_blank")}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        {formErrors.cover_image && (
                          <p className="text-sm text-destructive">{formErrors.cover_image}</p>
                        )}
                        {coverImage && (
                          <div className="relative h-32 rounded-lg overflow-hidden bg-muted">
                            <img 
                              src={coverImage} 
                              alt="Aperçu" 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg";
                              }}
                            />
                          </div>
                        )}
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="excerpt">Extrait</Label>
                        <Textarea
                          id="excerpt"
                          value={excerpt}
                          onChange={(e) => setExcerpt(e.target.value)}
                          placeholder="Court résumé de l'article (affiché dans les listes)"
                          rows={2}
                          maxLength={500}
                          className={formErrors.excerpt ? "border-destructive" : ""}
                        />
                        <p className="text-xs text-muted-foreground">
                          {excerpt.length}/500 caractères
                        </p>
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
                          placeholder="Contenu de l'article..."
                          rows={12}
                          maxLength={100000}
                          className={formErrors.content ? "border-destructive" : ""}
                        />
                        <p className="text-xs text-muted-foreground">
                          {content.length}/100 000 caractères
                        </p>
                        {formErrors.content && (
                          <p className="text-sm text-destructive">{formErrors.content}</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <Label htmlFor="published">Publier l'article</Label>
                          <p className="text-sm text-muted-foreground">
                            {published 
                              ? "L'article sera visible publiquement" 
                              : "L'article restera en brouillon"
                            }
                          </p>
                        </div>
                        <Switch
                          id="published"
                          checked={published}
                          onCheckedChange={setPublished}
                        />
                      </div>

                      <div className="flex gap-2 justify-end pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            resetForm();
                            setDialogOpen(false);
                          }}
                        >
                          Annuler
                        </Button>
                        <Button
                          onClick={handleSubmit}
                          disabled={createMutation.isPending || updateMutation.isPending}
                        >
                          {createMutation.isPending || updateMutation.isPending
                            ? "Enregistrement..."
                            : editingArticle
                            ? "Mettre à jour"
                            : "Créer l'article"}
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="preview" className="mt-4 pr-4">
                      <div className="rounded-lg border bg-card p-6">
                        <FormPreview />
                      </div>
                    </TabsContent>
                  </ScrollArea>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {filteredArticles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>
                {searchQuery
                  ? "Aucun article ne correspond à votre recherche"
                  : "Aucun article pour le moment"}
              </p>
              {!searchQuery && (
                <p className="text-sm">Créez votre premier article</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredArticles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell>
                        {article.cover_image ? (
                          <div className="w-10 h-10 rounded overflow-hidden bg-muted">
                            <img 
                              src={article.cover_image} 
                              alt="" 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px]">
                        <div className="truncate">{article.title}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          /{article.slug}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getCategoryName(article.category_id) && (
                          <Badge 
                            variant="secondary"
                            style={{ 
                              backgroundColor: getCategoryColor(article.category_id) + "20",
                              color: getCategoryColor(article.category_id),
                              borderColor: getCategoryColor(article.category_id)
                            }}
                          >
                            {getCategoryName(article.category_id)}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {article.published ? (
                          <Badge className="bg-green-500/20 text-green-600 hover:bg-green-500/30">
                            <Eye className="h-3 w-3 mr-1" />
                            Publié
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Brouillon
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(article.created_at), "d MMM yyyy", { locale: fr })}
                        </div>
                        {article.published_at && (
                          <div className="text-xs text-muted-foreground">
                            Publié le {format(new Date(article.published_at), "d MMM", { locale: fr })}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openPreview(article)}
                            title="Prévisualiser"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => togglePublishedMutation.mutate({
                              id: article.id,
                              published: !article.published
                            })}
                            title={article.published ? "Dépublier" : "Publier"}
                          >
                            {article.published ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4 text-green-600" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(article)}
                            title="Modifier"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(article.id)}
                            className="text-destructive hover:text-destructive"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Aperçu de l'article</span>
              {previewArticle?.published && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/publication/${previewArticle.slug}`, "_blank")}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Voir sur le site
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 h-[calc(90vh-120px)]">
            {previewArticle && (
              <div className="prose prose-sm max-w-none dark:prose-invert p-4">
                {previewArticle.cover_image && (
                  <div className="mb-6 rounded-lg overflow-hidden">
                    <img 
                      src={previewArticle.cover_image} 
                      alt={previewArticle.title} 
                      className="w-full h-64 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                  </div>
                )}
                <div className="flex items-center gap-2 mb-4">
                  {previewArticle.category_id && (
                    <Badge 
                      style={{ 
                        backgroundColor: getCategoryColor(previewArticle.category_id),
                        color: "white"
                      }}
                    >
                      {getCategoryName(previewArticle.category_id)}
                    </Badge>
                  )}
                  <Badge variant={previewArticle.published ? "default" : "outline"}>
                    {previewArticle.published ? "Publié" : "Brouillon"}
                  </Badge>
                </div>
                <h1 className="text-2xl font-bold mb-2">{previewArticle.title}</h1>
                <p className="text-sm text-muted-foreground mb-4">
                  Créé le {format(new Date(previewArticle.created_at), "d MMMM yyyy", { locale: fr })}
                  {previewArticle.published_at && (
                    <> · Publié le {format(new Date(previewArticle.published_at), "d MMMM yyyy", { locale: fr })}</>
                  )}
                </p>
                {previewArticle.excerpt && (
                  <p className="text-muted-foreground italic text-lg mb-6 border-l-4 border-primary pl-4">
                    {previewArticle.excerpt}
                  </p>
                )}
                <div className="whitespace-pre-wrap">{previewArticle.content}</div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ArticlesManager;
