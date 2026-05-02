import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Search, ArrowRight, FileText, Loader2 } from "lucide-react";
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

const Publications = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await supabase
          .from("articles")
          .select("*")
          .eq("is_published", true)
          .order("published_at", { ascending: false });

        if (data) setArticles(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredArticles = articles.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">

      {/* Hero */}
      <section className="py-16 gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <FileText className="h-16 w-16 text-primary-foreground mx-auto mb-4" />
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            Publications
          </h1>
          <p className="text-primary-foreground/90 max-w-2xl mx-auto">
            Tracts, communiqués et documents officiels de FOCOM
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-muted/30 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une publication..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Articles List */}
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Aucune publication trouvée</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredArticles.map((article) => (
                <Card
                  key={article.id}
                  className="group overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {article.image_url && (
                        <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={article.image_url}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          {article.category && categoryLabels[article.category] && (
                            <Badge
                              style={{
                                backgroundColor:
                                  categoryColors[article.category] || "#dc2626",
                                color: "white",
                              }}
                            >
                              {categoryLabels[article.category]}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(article.published_at)}
                          </span>
                        </div>
                        <h3 className="font-serif text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        {article.excerpt && (
                          <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                            {article.excerpt}
                          </p>
                        )}
                        <Link to={`/publications/${article.slug}`}>
                          <Button
                            variant="link"
                            className="p-0 h-auto text-primary font-medium group-hover:gap-3 transition-all"
                          >
                            Lire la suite
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

    </div>
  );
};

export default Publications;
