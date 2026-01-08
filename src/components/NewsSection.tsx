import NewsCard from "./NewsCard";

const newsData = [
  {
    title: "Victoire sur le temps de travail : accord historique signé",
    excerpt: "Après plusieurs mois de négociations, un accord majeur a été signé concernant l'aménagement du temps de travail. Retrouvez les détails des avancées obtenues.",
    date: "7 janvier 2025",
    category: "Social",
    imageColor: "bg-gradient-to-br from-primary to-primary/70",
    featured: true,
  },
  {
    title: "Formation syndicale : inscriptions ouvertes",
    excerpt: "Les sessions de formation 2025 sont désormais disponibles. Renforcez vos compétences en défense des droits.",
    date: "6 janvier 2025",
    category: "Formation",
    imageColor: "bg-gradient-to-br from-secondary to-secondary/70",
  },
  {
    title: "Télétravail : nouvelles modalités applicables",
    excerpt: "Le nouvel accord sur le télétravail entre en vigueur. Découvrez vos nouveaux droits.",
    date: "5 janvier 2025",
    category: "Conditions de travail",
    imageColor: "bg-gradient-to-br from-accent to-accent/70",
  },
  {
    title: "Assemblée Générale annuelle le 15 février",
    excerpt: "Réservez votre date ! L'AG annuelle se tiendra au siège. Ordre du jour et modalités d'inscription.",
    date: "4 janvier 2025",
    category: "Événement",
    imageColor: "bg-gradient-to-br from-primary/80 to-secondary",
  },
  {
    title: "Protection sociale : les enjeux de 2025",
    excerpt: "Analyse des réformes à venir et impacts sur votre couverture santé et prévoyance.",
    date: "3 janvier 2025",
    category: "Droits",
    imageColor: "bg-gradient-to-br from-secondary/80 to-accent",
  },
];

const NewsSection = () => {
  return (
    <section id="actualites" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
              Dernières Actualités
            </h2>
            <p className="text-muted-foreground">
              Restez informé des dernières nouvelles syndicales
            </p>
          </div>
          <a 
            href="#" 
            className="hidden md:block text-primary font-medium hover:underline"
          >
            Voir toutes les actualités →
          </a>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsData.map((news, index) => (
            <NewsCard
              key={index}
              {...news}
            />
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <a 
            href="#" 
            className="text-primary font-medium hover:underline"
          >
            Voir toutes les actualités →
          </a>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
