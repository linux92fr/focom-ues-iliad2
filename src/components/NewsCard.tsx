import { Calendar, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface NewsCardProps {
  title: string;
  excerpt: string;
  date: string;
  category: string;
  imageColor: string;
  featured?: boolean;
}

const NewsCard = ({ title, excerpt, date, category, imageColor, featured = false }: NewsCardProps) => {
  return (
    <article 
      className={`group bg-card rounded-xl overflow-hidden border border-border card-shadow hover:card-shadow-hover transition-all duration-300 hover:-translate-y-1 ${
        featured ? "lg:col-span-2 lg:row-span-2" : ""
      }`}
    >
      <div className={`${featured ? "aspect-[16/9]" : "aspect-[16/10]"} ${imageColor} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        <div className="absolute bottom-4 left-4">
          <Badge className="bg-card/90 text-foreground backdrop-blur-sm">
            {category}
          </Badge>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
          <Calendar className="h-4 w-4" />
          <span>{date}</span>
        </div>
        
        <h3 className={`font-serif font-semibold text-foreground mb-2 group-hover:text-primary transition-colors ${
          featured ? "text-2xl" : "text-lg"
        }`}>
          {title}
        </h3>
        
        <p className={`text-muted-foreground mb-4 ${featured ? "text-base" : "text-sm"} line-clamp-2`}>
          {excerpt}
        </p>
        
        <a 
          href="#" 
          className="inline-flex items-center gap-2 text-primary text-sm font-medium group-hover:gap-3 transition-all"
        >
          Lire la suite
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </article>
  );
};

export default NewsCard;
