import { FileText, Scale, Calendar, Users, BookOpen, HelpCircle } from "lucide-react";

const links = [
  {
    icon: FileText,
    title: "Publications",
    description: "Tracts, communiqués et documents officiels",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Scale,
    title: "Vos Droits",
    description: "Informations juridiques et conseils",
    color: "bg-secondary/10 text-secondary",
  },
  {
    icon: Calendar,
    title: "Agenda",
    description: "Événements et dates importantes",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Users,
    title: "Adhérer",
    description: "Rejoignez notre syndicat",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: BookOpen,
    title: "Conventions",
    description: "Accords et conventions collectives",
    color: "bg-secondary/10 text-secondary",
  },
  {
    icon: HelpCircle,
    title: "FAQ",
    description: "Questions fréquentes",
    color: "bg-accent/10 text-accent",
  },
];

const QuickLinks = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
            Accès Rapide
          </h2>
          <p className="text-muted-foreground">
            Trouvez rapidement les informations dont vous avez besoin
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {links.map((link, index) => (
            <a
              key={index}
              href="#"
              className="group bg-card p-6 rounded-xl border border-border hover:border-primary/30 card-shadow hover:card-shadow-hover transition-all duration-300 hover:-translate-y-1 text-center"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-12 h-12 rounded-xl ${link.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                <link.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                {link.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {link.description}
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickLinks;
