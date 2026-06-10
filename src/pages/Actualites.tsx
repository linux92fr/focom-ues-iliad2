import { useState, useEffect, useRef } from "react";
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
import { Calendar, Search, ArrowRight, Loader2, Newspaper } from "lucide-react";
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

const categoryGradients: Record<string, string> = {
  actualite: "from-red-700 to-red-900",
  communique: "from-blue-700 to-blue-900",
  evenement: "from-violet-700 to-violet-900",
  victoire: "from-green-700 to-green-900",
};

const categoryIcons: Record<string, string> = {
  actualite: "📢",
  communique: "📄",
  evenement: "📅",
  victoire: "🏆",
};

const stripHtml = (html: string) =>
  html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function AnimatedCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
    >
      {children}
    </div>
  );
}

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
    <main className="min-h-screen overflow-x-hidden bg-slate-50 p-3 sm:p-4 lg:p-8 space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-[#13233A] p-6 text-white shadow-xl sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border-[52px] border-white/5" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-red-600/25 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <Badge className="mb-4 border border-white/15 bg-white/10 text-white hover:bg-white/10">
              <Newspaper className="mr-1 h-3.5 w-3.5" /> Actualités
            </Badge>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              Les dernières nouvelles FO COM
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/80 sm:text-lg">
              Communiqués, victoires syndicales, négociations et informations pratiques pour les salariés de l'UES ILIAD.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="bg-red-600 text-white hover:bg-red-700">
                <Link to="/adhesion"><ArrowRight className="mr-2 h-4 w-4" /> Adhérer à FO COM</Link>
              </Button>
              <Button asChild variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                <Link to="/contact">Contacter un représentant</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              { label: "Communiqués", text: "Positions officielles et prises de parole de FO COM." },
              { label: "Négociations", text: "Suivi des NAO, accords et consultations CSE." },
              { label: "Victoires", text: "Résultats obtenus pour les salariés de l'UES ILIAD." },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="font-bold">{item.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/70">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filtres */}
      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
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

      {/* Articles */}
      <section>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucune actualité trouvée</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Article featured */}
            {filteredArticles[0] && (
              <AnimatedCard delay={0}>
                <Link to={`/actualites/${filteredArticles[0].slug}`} className="block group">
                  <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500">
                    <div className="relative h-64 sm:h-80 overflow-hidden">
                      {filteredArticles[0].image_url ? (
                        <img
                          src={filteredArticles[0].image_url}
                          alt=""
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${categoryGradients[filteredArticles[0].category || ""] || "from-slate-700 to-slate-900"} flex items-center justify-center`}>
                          <span className="text-7xl opacity-30">{categoryIcons[filteredArticles[0].category || ""] || "📰"}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <div className="flex items-center gap-2 mb-2">
                          {filteredArticles[0].category && categoryLabels[filteredArticles[0].category] && (
                            <Badge style={{ backgroundColor: categoryColors[filteredArticles[0].category] || "#dc2626", color: "white" }}>
                              {filteredArticles[0].category && categoryIcons[filteredArticles[0].category]} {categoryLabels[filteredArticles[0].category]}
                            </Badge>
                          )}
                          <span className="text-xs text-white/70 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(filteredArticles[0].published_at || filteredArticles[0].created_at)}
                          </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-extrabold leading-tight mb-2 group-hover:text-red-300 transition-colors">
                          {filteredArticles[0].title}
                        </h2>
                        <p className="text-white/70 text-sm line-clamp-2 hidden sm:block">
                          {getExcerpt(filteredArticles[0])}
                        </p>
                        <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-red-300 group-hover:gap-2 transition-all">
                          Lire la suite <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </AnimatedCard>
            )}

            {/* Reste des articles */}
            {filteredArticles.length > 1 && (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {filteredArticles.slice(1).map((item, i) => (
                  <AnimatedCard key={item.id} delay={Math.min(i * 80, 400)}>
                    <Link to={`/actualites/${item.slug}`} className="block group h-full">
                      <Card className="h-full overflow-hidden border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="relative h-44 overflow-hidden">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt=""
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <div className={`w-full h-full bg-gradient-to-br ${categoryGradients[item.category || ""] || "from-slate-700 to-slate-900"} flex items-center justify-center`}>
                              <span className="text-5xl opacity-25">{categoryIcons[item.category || ""] || "📰"}</span>
                            </div>
                          )}
                          {item.category && categoryLabels[item.category] && (
                            <div className="absolute top-3 left-3">
                              <Badge style={{ backgroundColor: categoryColors[item.category] || "#dc2626", color: "white" }} className="shadow">
                                {categoryLabels[item.category]}
                              </Badge>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-5">
                          <span className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                            <Calendar className="h-3 w-3" />
                            {formatDate(item.published_at || item.created_at)}
                          </span>
                          <h3 className="font-bold text-base text-foreground mb-2 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
                            {item.title}
                          </h3>
                          <p className="text-muted-foreground text-sm line-clamp-2">
                            {getExcerpt(item)}
                          </p>
                          <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-red-600 group-hover:gap-2 transition-all">
                            Lire la suite <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        </CardContent>
                      </Card>
                    </Link>
                  </AnimatedCard>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
};

export default Actualites;
