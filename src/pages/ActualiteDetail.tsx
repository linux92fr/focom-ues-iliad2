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
          .eq("published", true)
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

  const categoryLabel = article.category_id ? categoryLabels[article.category_id] || article.category_id : null;
  const categoryColor = article.category_id ? categoryColors[article.category_id] || "#dc2626" : "#dc2626";

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 p-3 sm:p-4 lg:p-8 space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-[#13233A] p-6 text-white shadow-xl sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border-[52px] border-white/5" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-red-600/25 blur-3xl" />
        <div className="relative max-w-4xl">
          <PageBreadcrumb
            className="mb-5 [&_a]:text-white/60 [&_a:hover]:text-white [&_span]:text-white/80 [&_li]:text-white/40"
            steps={[{ label: "Actualités", href: "/actualites" }, { label: article.title }]}
          />
          {categoryLabel && (
            <Badge className="mb-4 border border-white/15 bg-white/10 text-white hover:bg-white/10" style={{ borderColor: categoryColor + "66" }}>
              {categoryLabel}
            </Badge>
          )}
          <h1 className="text-2xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
            {article.title}
          </h1>
          <div className="mt-4 flex items-center gap-3 text-white/60 text-sm">
            <Calendar className="h-4 w-4" />
            {formatDate(article.published_at || article.created_at)}
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto w-full">
        <Card className="rounded-2xl shadow-sm border border-border">
          {article.cover_image && (
            <img src={article.cover_image} alt="" className="w-full max-h-[240px] sm:max-h-[420px] object-contain rounded-t-2xl bg-muted" loading="lazy" />
          )}
          <CardContent className="p-6 sm:p-8">
            {article.excerpt && (
              <p className="text-lg text-muted-foreground mb-8 border-l-4 border-red-600 pl-4">
                {article.excerpt}
              </p>
            )}
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content || "") }}
            />

            <div className="mt-8 pt-8 border-t flex items-center justify-between">
              <Link to="/actualites" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" /> Retour aux actualités
              </Link>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Partager
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default ActualiteDetail;
