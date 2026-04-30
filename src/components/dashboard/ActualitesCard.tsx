import { ArrowRight, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

const news = [
  {
    badge: "À LA UNE",
    title: "Négociation Annuelle Obligatoire 2024 : Nos revendications avancent",
    date: "16 mai 2024",
    cat: "Négociations",
  },
  {
    title: "Accord Télétravail : Un nouvel accord signé pour plus de flexibilité",
    date: "8 mai 2024",
    cat: "Accord",
  },
  {
    title: "Mobilisation réussie pour défendre nos droits et nos emplois",
    date: "30 avril 2024",
    cat: "Mobilisation",
  },
];

const ActualitesCard = () => {
  return (
    <div className="bg-card rounded-2xl border border-border card-shadow p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display font-black text-primary text-lg tracking-wide">ACTUALITÉS</h2>
        <Link to="/actualites" className="text-sm text-secondary font-semibold flex items-center gap-1 hover:gap-2 transition-all">
          Voir toutes les actualités <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="space-y-4">
        {news.map((n, i) => (
          <Link
            key={i}
            to="/actualites"
            className="flex gap-4 group p-2 -m-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="w-24 h-20 rounded-lg bg-gradient-to-br from-secondary/30 to-primary/30 shrink-0" />
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
                <span className="text-secondary font-semibold">• {n.cat}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ActualitesCard;
