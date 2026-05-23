import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, ExternalLink } from "lucide-react";
import type { Article, Category } from "./useArticlesManager";

interface ArticleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingArticle: Article | null;
  categories: Category[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: string;
  coverImage: string;
  published: boolean;
  formErrors: Record<string, string>;
  onTitleChange: (v: string) => void;
  onSlugChange: (v: string) => void;
  onExcerptChange: (v: string) => void;
  onContentChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onCoverImageChange: (v: string) => void;
  onPublishedChange: (v: boolean) => void;
  onSubmit: () => void;
  onCancel: () => void;
  getCategoryColor: (id: string | null) => string;
  getCategoryName: (id: string | null) => string | null;
  isPending: boolean;
}

export function ArticleFormDialog({
  open,
  onOpenChange,
  editingArticle,
  categories,
  activeTab,
  onTabChange,
  title,
  slug,
  excerpt,
  content,
  categoryId,
  coverImage,
  published,
  formErrors,
  onTitleChange,
  onSlugChange,
  onExcerptChange,
  onContentChange,
  onCategoryChange,
  onCoverImageChange,
  onPublishedChange,
  onSubmit,
  onCancel,
  getCategoryColor,
  getCategoryName,
  isPending,
}: ArticleFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvel article
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{editingArticle ? "Modifier l'article" : "Nouvel article"}</DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={onTabChange} className="flex-1 overflow-hidden">
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
                  onChange={(e) => onTitleChange(e.target.value)}
                  placeholder="Titre de l'article"
                  maxLength={200}
                  className={formErrors.title ? "border-destructive" : ""}
                />
                {formErrors.title && <p className="text-sm text-destructive">{formErrors.title}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => onSlugChange(e.target.value.toLowerCase())}
                  placeholder="url-de-l-article"
                  maxLength={200}
                  className={formErrors.slug ? "border-destructive" : ""}
                />
                {formErrors.slug && <p className="text-sm text-destructive">{formErrors.slug}</p>}
                <p className="text-xs text-muted-foreground">
                  URL: /publication/{slug || "votre-slug"}
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category">Catégorie</Label>
                <Select value={categoryId} onValueChange={onCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Aucune catégorie</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <span className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: cat.color || "#dc2626" }}
                          />
                          {cat.name}
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
                    onChange={(e) => onCoverImageChange(e.target.value)}
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
                      loading="lazy"
                      src={coverImage}
                      alt="Aperçu"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
                    />
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="excerpt">Extrait</Label>
                <Textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => onExcerptChange(e.target.value)}
                  placeholder="Court résumé de l'article (affiché dans les listes)"
                  rows={2}
                  maxLength={500}
                  className={formErrors.excerpt ? "border-destructive" : ""}
                />
                <p className="text-xs text-muted-foreground">{excerpt.length}/500 caractères</p>
                {formErrors.excerpt && (
                  <p className="text-sm text-destructive">{formErrors.excerpt}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label>Contenu *</Label>
                <RichTextEditor
                  content={content}
                  onChange={onContentChange}
                  placeholder="Rédigez le contenu de votre article..."
                  minHeight="350px"
                  className={formErrors.content ? "border-destructive" : ""}
                />
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
                      : "L'article restera en brouillon"}
                  </p>
                </div>
                <Switch id="published" checked={published} onCheckedChange={onPublishedChange} />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Annuler
                </Button>
                <Button onClick={onSubmit} disabled={isPending}>
                  {isPending
                    ? "Enregistrement..."
                    : editingArticle
                    ? "Mettre à jour"
                    : "Créer l'article"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="mt-4 pr-4">
              <div className="rounded-lg border bg-card p-6">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {coverImage && (
                    <div className="mb-4 rounded-lg overflow-hidden">
                      <img
                        loading="lazy"
                        src={coverImage}
                        alt={title || "Aperçu"}
                        className="w-full h-48 object-cover"
                        onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
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
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
