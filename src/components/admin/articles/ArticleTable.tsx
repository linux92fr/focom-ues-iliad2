import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Eye, EyeOff, Pencil, Trash2, Image as ImageIcon, FileText } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { Article, Category } from "./useArticlesManager";

interface ArticleTableProps {
  articles: Article[];
  categories: Category[];
  searchQuery: string;
  getCategoryName: (id: string | null) => string | null;
  getCategoryColor: (id: string | null) => string;
  onEdit: (article: Article) => void;
  onPreview: (article: Article) => void;
  onDelete: (id: string) => void;
  onTogglePublished: (id: string, published: boolean) => void;
}

export function ArticleTable({
  articles,
  searchQuery,
  getCategoryName,
  getCategoryColor,
  onEdit,
  onPreview,
  onDelete,
  onTogglePublished,
}: ArticleTableProps) {
  if (articles.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>
          {searchQuery
            ? "Aucun article ne correspond à votre recherche"
            : "Aucun article pour le moment"}
        </p>
        {!searchQuery && <p className="text-sm">Créez votre premier article</p>}
      </div>
    );
  }

  return (
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
          {articles.map((article) => (
            <TableRow key={article.id}>
              <TableCell>
                {article.cover_image ? (
                  <div className="w-10 h-10 rounded overflow-hidden bg-muted">
                    <img
                      loading="lazy"
                      src={article.cover_image}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
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
                <div className="text-xs text-muted-foreground truncate">/{article.slug}</div>
              </TableCell>
              <TableCell>
                {getCategoryName(article.category_id) && (
                  <Badge
                    variant="secondary"
                    style={{
                      backgroundColor: getCategoryColor(article.category_id) + "20",
                      color: getCategoryColor(article.category_id),
                      borderColor: getCategoryColor(article.category_id),
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
                  <Button variant="ghost" size="icon" onClick={() => onPreview(article)} title="Prévisualiser">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onTogglePublished(article.id, !article.published)}
                    title={article.published ? "Dépublier" : "Publier"}
                  >
                    {article.published
                      ? <EyeOff className="h-4 w-4" />
                      : <Eye className="h-4 w-4 text-green-600" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onEdit(article)} title="Modifier">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(article.id)}
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
  );
}
