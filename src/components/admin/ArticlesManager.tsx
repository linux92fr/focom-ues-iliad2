import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileText, Search } from "lucide-react";
import { useArticlesManager } from "./articles/useArticlesManager";
import { ArticleTable } from "./articles/ArticleTable";
import { ArticleFormDialog } from "./articles/ArticleFormDialog";
import { ArticlePreviewDialog } from "./articles/ArticlePreviewDialog";

const ArticlesManager = () => {
  const mgr = useArticlesManager();

  if (mgr.articlesLoading) {
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
                value={mgr.searchQuery}
                onChange={(e) => mgr.setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <ArticleFormDialog
              open={mgr.dialogOpen}
              onOpenChange={(open) => {
                mgr.setDialogOpen(open);
                if (!open) mgr.resetForm();
              }}
              editingArticle={mgr.editingArticle}
              categories={mgr.categories}
              activeTab={mgr.activeTab}
              onTabChange={mgr.setActiveTab}
              title={mgr.title}
              slug={mgr.slug}
              excerpt={mgr.excerpt}
              content={mgr.content}
              categoryId={mgr.categoryId}
              coverImage={mgr.coverImage}
              published={mgr.published}
              formErrors={mgr.formErrors}
              onTitleChange={mgr.handleTitleChange}
              onSlugChange={mgr.setSlug}
              onExcerptChange={mgr.setExcerpt}
              onContentChange={mgr.setContent}
              onCategoryChange={mgr.setCategoryId}
              onCoverImageChange={mgr.setCoverImage}
              onPublishedChange={mgr.setPublished}
              onSubmit={mgr.handleSubmit}
              onCancel={() => { mgr.resetForm(); mgr.setDialogOpen(false); }}
              getCategoryColor={mgr.getCategoryColor}
              getCategoryName={mgr.getCategoryName}
              isPending={mgr.createMutation.isPending || mgr.updateMutation.isPending}
            />
          </div>
        </CardHeader>
        <CardContent>
          <ArticleTable
            articles={mgr.filteredArticles}
            categories={mgr.categories}
            searchQuery={mgr.searchQuery}
            getCategoryName={mgr.getCategoryName}
            getCategoryColor={mgr.getCategoryColor}
            onEdit={mgr.openEditDialog}
            onPreview={mgr.openPreview}
            onDelete={mgr.handleDelete}
            onTogglePublished={(id, published) =>
              mgr.togglePublishedMutation.mutate({ id, published })
            }
          />
        </CardContent>
      </Card>

      <ArticlePreviewDialog
        open={mgr.previewOpen}
        onOpenChange={mgr.setPreviewOpen}
        article={mgr.previewArticle}
        getCategoryName={mgr.getCategoryName}
        getCategoryColor={mgr.getCategoryColor}
      />
    </>
  );
};

export default ArticlesManager;
