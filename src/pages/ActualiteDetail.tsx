import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import DOMPurify from "dompurify";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { ArrowLeft, Calendar, Loader2, Share2 } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Article = Tables<"articles">;

const categoryLabels: Record<string, string> = {
  actualite: "Actualité",
  communique: "Communiqué",
  evenement: "Événement",
  victoire: "Victoire syndicale",
};

const categoryColors: Record<string, string> = {
  actualite: "#dc2626",
  communique: "#2563eb",
  evenement: "#7c3aed",
  victoire: "#16a34a",
};

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const ActualiteDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) { setLoading(false); return; }
      try {
        const { data, error } = await supabase
          .from("articles")
          .select("*")
          .eq("slug", slug)
          .eq("is_published", true)
          .single();

        if (error) throw error;
        setArticle(data);
      } catch (error) {
        console.error("Error fetching article:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: article?.title,
        text: stripHtml(article?.content || "").substring(0, 100),
        url: window.location.href,
      });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Lien copié dans le presse-papiers");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Actualité non trouvée</h1>
            <Link to="/actualites">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux actualités
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const categoryLabel = article.category ? categoryLabels[article.category] || article.category : null;
  const categoryColor = article.category ? categoryColors[article.category] || "#dc2626" : "#dc2626";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <section className="py-12 gradient-hero">
        <div className="container mx-auto px-4">
          <PageBreadcrumb
            className="mb-4 [&_a]:text-primary-foreground/70 [&_a:hover]:text-primary-foreground [&_span]:text-primary-foreground/90 [&_li]:text-primary-foreground/50"
            steps={[{ label: "Actualités", href: "/actualites" }, { label: article.title }]}
          />

          <div className="max-w-4xl">
            {categoryLabel && (
              <Badge className="mb-4" style={{ backgroundColor: categoryColor, color: "white" }}>
                {categoryLabel}
              </Badge>
            )}
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              {article.title}
            </h1>
            <div className="flex items-center gap-4 text-primary-foreground/80 text-sm">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(article.published_at || article.created_at)}
              </span>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card>
              {article.image_url && (
                <img src={article.image_url} alt="" className="w-full max-h-[420px] object-cover rounded-t-lg" loading="lazy" />
              )}
              <CardContent className="p-8">
                {article.excerpt && (
                  <p className="text-lg text-muted-foreground mb-8 border-l-4 border-primary pl-4">
                    {article.excerpt}
                  </p>
                )}
                <div
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content || "") }}
                />

                <div className="mt-8 pt-8 border-t flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Partagez cette actualité</span>
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Partager
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ActualiteDetail;
