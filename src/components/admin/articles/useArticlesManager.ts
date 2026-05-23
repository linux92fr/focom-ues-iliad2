import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { articleSchema, validateFormData } from "@/lib/validations";
import type { Tables } from "@/integrations/supabase/types";

export type Article = Tables<"articles">;
export type Category = Tables<"categories">;

export function useArticlesManager() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [previewArticle, setPreviewArticle] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("edit");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [coverImage, setCoverImage] = useState("");
  const [published, setPublished] = useState(false);

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
    onError: (error: Error) => {
      toast.error("Erreur lors de la création: " + error.message);
    },
  });

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
    onError: (error: Error) => {
      toast.error("Erreur lors de la mise à jour: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("articles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      toast.success("Article supprimé avec succès");
    },
    onError: (error: Error) => {
      toast.error("Erreur lors de la suppression: " + error.message);
    },
  });

  const togglePublishedMutation = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const { error } = await supabase
        .from("articles")
        .update({ published, published_at: published ? new Date().toISOString() : null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      toast.success(variables.published ? "Article publié" : "Article dépublié");
    },
    onError: (error: Error) => {
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

  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!editingArticle) setSlug(generateSlug(value));
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

    if (!validation.success) {
      setFormErrors(validation.errors);
      const firstError = Object.values(validation.errors)[0];
      if (firstError) toast.error(firstError);
      return;
    }

    setFormErrors({});
    const { data: validData } = validation;
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

  const getCategoryName = (catId: string | null) => {
    if (!catId) return null;
    return categories.find((c) => c.id === catId)?.name ?? null;
  };

  const getCategoryColor = (catId: string | null) => {
    if (!catId) return "#dc2626";
    return categories.find((c) => c.id === catId)?.color ?? "#dc2626";
  };

  const filteredArticles = articles.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    articles,
    categories,
    filteredArticles,
    articlesLoading,
    dialogOpen,
    setDialogOpen,
    previewOpen,
    setPreviewOpen,
    editingArticle,
    previewArticle,
    searchQuery,
    setSearchQuery,
    formErrors,
    activeTab,
    setActiveTab,
    title,
    slug,
    excerpt,
    content,
    categoryId,
    coverImage,
    published,
    setSlug,
    setExcerpt,
    setContent,
    setCategoryId,
    setCoverImage,
    setPublished,
    resetForm,
    handleTitleChange,
    openEditDialog,
    openPreview,
    handleSubmit,
    handleDelete,
    getCategoryName,
    getCategoryColor,
    createMutation,
    updateMutation,
    togglePublishedMutation,
  };
}
