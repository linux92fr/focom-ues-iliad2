import { Users, Target, Shield, Heart, Award, History, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import logoFocom from "@/assets/logo-focom.png";

const About = () => {
  const values = [
    {
      icon: Shield,
      title: "Indépendance",
      description: "Force Ouvrière défend une totale indépendance vis-à-vis des partis politiques, des gouvernements et du patronat."
    },
    {
      icon: Users,
      title: "Solidarité",
      description: "Nous croyons en la force du collectif pour défendre les droits de tous les salariés, sans distinction."
    },
    {
      icon: Target,
      title: "Efficacité",
      description: "Notre action syndicale est pragmatique et orientée vers des résultats concrets pour les adhérents."
    },
    {
      icon: Heart,
      title: "Proximité",
      description: "Nous restons à l'écoute des salariés et assurons un accompagnement personnalisé dans toutes les démarches."
    }
  ];

  const milestones = [
    {
      year: "1948",
      title: "Création de Force Ouvrière",
      description: "Naissance de la CGT-FO, syndicat indépendant et réformiste."
    },
    {
      year: "2000s",
      title: "Implantation chez Iliad",
      description: "Développement de la section syndicale au sein du groupe Iliad (Free)."
    },
    {
      year: "2010s",
      title: "Structuration FOCOM",
      description: "Création de la Fédération FO Communication pour représenter les salariés du secteur."
    },
    {
      year: "Aujourd'hui",
      title: "FOCOM UES ILIAD",
      description: "Une équipe engagée au service des salariés de l'UES ILIAD."
    }
  ];

  const achievements = [
    { number: "500+", label: "Adhérents" },
    { number: "15+", label: "Années d'expérience" },
    { number: "100%", label: "Indépendance" },
    { number: "24/7", label: "À votre écoute" }
  ];

  return (
    <div className="min-h-screen bg-background">
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-90" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-10" />
        
        <div className="container mx-auto px-4 relative z-10">
          <Link to="/">
            <Button variant="ghost" className="mb-6 text-primary-foreground hover:bg-primary-foreground/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Button>
          </Link>
          
          <div className="flex flex-col md:flex-row items-center gap-8">
            <img loading="lazy" 
              src={logoFocom} 
              alt="Logo FOCOM" 
              className="w-40 h-40 object-contain"
            />
            <div className="text-center md:text-left">
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
                À propos de FOCOM
              </h1>
              <p className="text-xl text-primary-foreground/90 max-w-2xl">
                Force Ouvrière Communication - Votre syndicat indépendant au sein de l'UES ILIAD
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-6">
              Qui sommes-nous ?
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              FOCOM UES ILIAD est la section syndicale Force Ouvrière au sein de l'Unité Économique et Sociale ILIAD, 
              le groupe qui regroupe notamment Free, Free Mobile et leurs filiales. Notre mission est de défendre 
              les intérêts des salariés, de promouvoir leurs droits et d'améliorer leurs conditions de travail.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Rattachés à la Fédération Force Ouvrière de la Communication (FOCOM), nous bénéficions de l'expertise 
              et du soutien d'un réseau national tout en restant proches des réalités locales de notre entreprise.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 gradient-hero">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {achievements.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="font-serif text-4xl md:text-5xl font-bold text-primary-foreground mb-2">
                  {stat.number}
                </div>
                <div className="text-primary-foreground/80 text-sm uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
              Nos Valeurs
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Les principes qui guident notre action syndicale au quotidien
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-border hover:border-primary/30">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 gradient-hero rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <value.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-foreground mb-3">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* History Timeline */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-primary mb-4">
              <History className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-wider">Notre parcours</span>
            </div>
            <h2 className="font-serif text-3xl font-bold text-foreground">
              Notre Histoire
            </h2>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary/20 transform md:-translate-x-1/2" />
              
              {milestones.map((milestone, index) => (
                <div key={index} className={`relative flex items-start gap-6 mb-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'} pl-16 md:pl-0`}>
                    <Card className="inline-block">
                      <CardContent className="p-6">
                        <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-3">
                          {milestone.year}
                        </span>
                        <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                          {milestone.title}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {milestone.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Timeline dot */}
                  <div className="absolute left-6 md:left-1/2 w-4 h-4 bg-primary rounded-full transform md:-translate-x-1/2 mt-8 ring-4 ring-background" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Force Ouvrière */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <div className="w-32 h-32 gradient-hero rounded-full flex items-center justify-center">
                  <Award className="h-16 w-16 text-primary-foreground" />
                </div>
              </div>
              <div>
                <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
                  Force Ouvrière
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Force Ouvrière (FO) est une confédération syndicale française fondée en 1948. Elle est la 
                  troisième organisation syndicale de salariés en France par sa représentativité. FO se distingue 
                  par son attachement à l'indépendance syndicale et à la négociation collective.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  La Fédération FO de la Communication (FOCOM) regroupe les syndicats FO des secteurs de la 
                  communication, des télécommunications et des médias. Elle défend les intérêts spécifiques 
                  des salariés de ces branches en constante évolution.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl font-bold text-primary-foreground mb-4">
            Rejoignez-nous !
          </h2>
          <p className="text-primary-foreground/90 max-w-2xl mx-auto mb-8">
            Ensemble, nous sommes plus forts. Adhérez à FOCOM et bénéficiez d'un accompagnement 
            personnalisé pour défendre vos droits au quotidien.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-secondary-foreground">
              Devenir adhérent
            </Button>
            <Link to="/#contact">
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                Nous contacter
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;
