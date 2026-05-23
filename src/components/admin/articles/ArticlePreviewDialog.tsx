import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { Article } from "./useArticlesManager";

interface ArticlePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  article: Article | null;
  getCategoryName: (id: string | null) => string | null;
  getCategoryColor: (id: string | null) => string;
}

export function ArticlePreviewDialog({
  open,
  onOpenChange,
  article,
  getCategoryName,
  getCategoryColor,
}: ArticlePreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Aperçu de l'article</span>
            {article?.published && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/publication/${article.slug}`, "_blank")}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Voir sur le site
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 h-[calc(90vh-120px)]">
          {article && (
            <div className="prose prose-sm max-w-none dark:prose-invert p-4">
              {article.cover_image && (
                <div className="mb-6 rounded-lg overflow-hidden">
                  <img
                    loading="lazy"
                    src={article.cover_image}
                    alt={article.title}
                    className="w-full h-64 object-cover"
                    onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
                  />
                </div>
              )}
              <div className="flex items-center gap-2 mb-4">
                {article.category_id && (
                  <Badge
                    style={{
                      backgroundColor: getCategoryColor(article.category_id),
                      color: "white",
                    }}
                  >
                    {getCategoryName(article.category_id)}
                  </Badge>
                )}
                <Badge variant={article.published ? "default" : "outline"}>
                  {article.published ? "Publié" : "Brouillon"}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold mb-2">{article.title}</h1>
              <p className="text-sm text-muted-foreground mb-4">
                Créé le {format(new Date(article.created_at), "d MMMM yyyy", { locale: fr })}
                {article.published_at && (
                  <> · Publié le {format(new Date(article.published_at), "d MMMM yyyy", { locale: fr })}</>
                )}
              </p>
              {article.excerpt && (
                <p className="text-muted-foreground italic text-lg mb-6 border-l-4 border-primary pl-4">
                  {article.excerpt}
                </p>
              )}
              <div className="whitespace-pre-wrap">{article.content}</div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
