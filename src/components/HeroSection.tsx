import { ArrowRight, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import logoFocom from "@/assets/logo-focom.png";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent" />
      
      <div className="container mx-auto px-4 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <TrendingUp className="h-3 w-3" />
                Actualité importante
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Calendar className="h-3 w-3" />
                8 Jan 2025
              </Badge>
            </div>

            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Négociations Annuelles Obligatoires{" "}
              <span className="text-gradient">2025</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl">
              Retrouvez toutes les informations sur les NAO 2025, les avancées obtenues 
              et les prochaines échéances pour les salariés.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="gradient-hero hero-shadow gap-2">
                Lire l'article complet
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline">
                Toutes les actualités
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-4">
              <div>
                <p className="text-3xl font-bold text-primary">2.5%</p>
                <p className="text-sm text-muted-foreground">Augmentation générale</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-secondary">1200€</p>
                <p className="text-sm text-muted-foreground">Prime exceptionnelle</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-accent">+3</p>
                <p className="text-sm text-muted-foreground">Jours de congés</p>
              </div>
            </div>
          </div>

          {/* Featured Image Card */}
          <div className="relative animate-scale-in" style={{ animationDelay: "0.2s" }}>
            <div className="relative bg-card rounded-2xl overflow-hidden card-shadow-hover border border-border">
              <div className="aspect-[4/3] bg-gradient-to-br from-secondary via-secondary/80 to-primary/60 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-primary-foreground p-8">
                    <img 
                      src={logoFocom} 
                      alt="Logo FOCOM" 
                      className="w-32 h-32 mx-auto mb-4 object-contain"
                    />
                    <p className="text-xl font-semibold">Force Ouvrière</p>
                    <p className="text-sm opacity-80">Communication</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-serif text-xl font-semibold mb-2">
                  Votre syndicat à vos côtés
                </h3>
                <p className="text-muted-foreground text-sm">
                  Des actions concrètes pour défendre vos droits et améliorer vos conditions de travail.
                </p>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg hero-shadow animate-slide-in" style={{ animationDelay: "0.4s" }}>
              <p className="text-sm font-medium">+15 000 adhérents</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
