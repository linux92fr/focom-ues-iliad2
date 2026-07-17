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
import { Calendar, Search, ArrowRight, Loader2, Newspaper, Mail, Megaphone, Trophy } from "lucide-react";
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

const stripHtml = (html: string) =>
  html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const Actualites = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from("articles")
          .select("*")
          .eq("is_published", true)
          .order("published_at", { ascending: false, nullsFirst: false });

        if (error) throw error;
        setArticles(data || []);
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredArticles = articles.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      q === "" ||
      (item.title || "").toLowerCase().includes(q) ||
      (item.excerpt || "").toLowerCase().includes(q) ||
      stripHtml(item.content || "").toLowerCase().includes(q);
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
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

  const getExcerpt = (item: Article) => {
    if (item.excerpt) return item.excerpt;
    if (!item.content) return "";
    return stripHtml(item.content).substring(0, 150);
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 p-3 sm:p-4 lg:p-8">
      <section className="relative overflow-hidden rounded-3xl bg-[#13233A] p-6 text-white shadow-xl sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border-[52px] border-white/5" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-red-600/25 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <Badge className="mb-4 border border-white/15 bg-white/10 text-white hover:bg-white/10">
              <Newspaper className="mr-1 h-3.5 w-3.5" /> Actualités
            </Badge>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              Actualités et communiqués FO COM
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/80 sm:text-lg">
              Suivez les dernières nouvelles, communiqués et victoires syndicales de FO COM UES ILIAD.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="bg-red-600 text-white hover:bg-red-700">
                <Link to="/adhesion"><Newspaper className="mr-2 h-4 w-4" /> Adhérer</Link>
              </Button>
              <Button asChild variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                <Link to="/contact"><Mail className="mr-2 h-4 w-4" /> Nous contacter</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              { icon: Newspaper, title: "Actualités", text: "L'essentiel de la vie syndicale FO COM." },
              { icon: Megaphone, title: "Communiqués", text: "Les prises de position officielles FO." },
              { icon: Trophy, title: "Victoires", text: "Les résultats obtenus pour les salariés." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <item.icon className="mb-3 h-5 w-5 text-red-200" />
                <p className="font-bold">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/70">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une actualité..."
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
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="mt-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Aucune actualité trouvée</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredArticles.map((item) => (
                <Card key={item.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                  {item.image_url && (
                    <img src={item.image_url} alt="" className="w-full h-40 object-cover" loading="lazy" />
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      {item.category && categoryLabels[item.category] && (
                        <Badge style={{ backgroundColor: categoryColors[item.category] || "#dc2626", color: "white" }}>
                          {categoryLabels[item.category]}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(item.published_at || item.created_at)}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                      {getExcerpt(item)}...
                    </p>
                    <Link to={`/actualites/${item.slug}`}>
                      <Button variant="link" className="p-0 h-auto text-primary font-medium group-hover:gap-3 transition-all">
                        Lire la suite
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
      </section>
    </main>
  );
};

export default Actualites;
