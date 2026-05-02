import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Calendar, User, Loader2, Share2 } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type News = Tables<"news">;
type Category = Tables<"categories">;

const ActualiteDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [news, setNews] = useState<News | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from("news")
          .select("*")
          .eq("id", id)
          .eq("published", true)
          .single();

        if (error) throw error;
        setNews(data);

        if (data?.category_id) {
          const { data: catData } = await supabase
            .from("categories")
            .select("*")
            .eq("id", data.category_id)
            .single();
          setCategory(catData);
        }
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [id]);

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
        title: news?.title,
        text: news?.content.substring(0, 100),
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

  if (!news) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Actualité non trouvée
            </h1>
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

  return (
    <div className="min-h-screen flex flex-col bg-background">

      {/* Hero */}
      <section className="py-12 gradient-hero">
        <div className="container mx-auto px-4">
          <Link to="/actualites">
            <Button
              variant="ghost"
              className="mb-6 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux actualités
            </Button>
          </Link>

          <div className="max-w-4xl">
            {category && (
              <Badge
                className="mb-4"
                style={{
                  backgroundColor: category.color || "#dc2626",
                  color: "white",
                }}
              >
                {category.name}
              </Badge>
            )}
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              {news.title}
            </h1>
            <div className="flex items-center gap-4 text-primary-foreground/80 text-sm">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(news.published_at)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <div className="prose prose-lg max-w-none">
                  {news.content.split("\n").map((paragraph, index) => (
                    <p key={index} className="text-foreground/90 leading-relaxed mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Share */}
                <div className="mt-8 pt-8 border-t flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    Partagez cette actualité
                  </span>
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
