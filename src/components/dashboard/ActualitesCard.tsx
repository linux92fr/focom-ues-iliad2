import { useEffect, useState } from "react";
import { ArrowRight, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type News = Tables<"news">;
type Category = Tables<"categories">;

const fallbackNews = [
  {
    id: "fallback-1",
    title: "Negociation Annuelle Obligatoire 2024 : Nos revendications avancent",
    date: "16 mai 2024",
    cat: "Negociations",
    badge: "A LA UNE",
  },
  {
    id: "fallback-2",
    title: "Accord Teletravail : Un nouvel accord signe pour plus de flexibilite",
    date: "8 mai 2024",
    cat: "Accord",
  },
  {
    id: "fallback-3",
    title: "Mobilisation reussie pour defendre nos droits et nos emplois",
    date: "30 avril 2024",
    cat: "Mobilisation",
  },
];

type ActualitesCardProps = {
  featured?: boolean;
};

const ActualitesCard = ({ featured = false }: ActualitesCardProps) => {
  const [news, setNews] = useState(fallbackNews);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchNews = async () => {
      const [newsResponse, categoriesResponse] = await Promise.all([
        supabase
          .from("news")
          .select("*")
          .eq("published", true)
          .order("published_at", { ascending: false })
          .limit(3),
        supabase.from("categories").select("*"),
      ]);

      if (categoriesResponse.data) setCategories(categoriesResponse.data);
      if (!newsResponse.data || newsResponse.data.length === 0) return;

      setNews(
        newsResponse.data.map((item: News, index) => ({
          id: item.id,
          title: item.title,
          date: formatDate(item.published_at || item.created_at),
          cat: getCategoryName(item.category_id, categoriesResponse.data || []),
          badge: index === 0 ? "A LA UNE" : undefined,
        }))
      );
    };

    fetchNews();
  }, []);

  const getLink = (id: string) => (id.startsWith("fallback") ? "/actualites" : `/actualite/${id}`);

  return (
    <section className={`bg-card rounded-2xl border border-border card-shadow p-6 ${featured ? "lg:p-8" : ""}`}>
      <div className="flex items-center justify-between gap-4 mb-5">
        <h2 className={`font-display font-black text-primary tracking-wide ${featured ? "text-2xl" : "text-lg"}`}>
          ACTUALITES
        </h2>
        <Link to="/actualites" className="text-sm text-secondary font-semibold flex items-center gap-1 hover:gap-2 transition-all">
          Voir toutes les actualites <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className={featured ? "grid gap-4 md:grid-cols-3" : "space-y-4"}>
        {news.map((n) => (
          <Link
            key={n.id}
            to={getLink(n.id)}
            className={`group rounded-lg hover:bg-muted/50 transition-colors ${
              featured ? "block p-3" : "flex gap-4 p-2 -m-2"
            }`}
          >
            <div className={`${featured ? "w-full h-28 mb-3" : "w-24 h-20"} rounded-lg bg-gradient-to-br from-secondary/30 to-primary/30 shrink-0`} />
            <div className="flex-1 min-w-0">
              {n.badge && (
                <span className="inline-block bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded mb-1 tracking-wider">
                  {n.badge}
                </span>
              )}
              <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                {n.title}
              </h3>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {n.date}</span>
                {n.cat && <span className="text-secondary font-semibold">- {n.cat}</span>}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const getCategoryName = (categoryId: string | null, categories: Category[]) => {
  if (!categoryId) return "";
  return categories.find((category) => category.id === categoryId)?.name || "";
};

export default ActualitesCard;
