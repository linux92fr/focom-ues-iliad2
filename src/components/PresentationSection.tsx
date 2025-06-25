
import React from 'react';
import { Shield, Target, Users, Award, Zap, Eye } from 'lucide-react';

const PresentationSection = () => {
  const values = [
    {
      icon: Shield,
      title: "Excellence",
      description: "Nous visons l'excellence dans chaque mission, avec un niveau de formation et d'équipement de pointe."
    },
    {
      icon: Target,
      title: "Précision",
      description: "Chaque opération est planifiée et exécutée avec une précision militaire exemplaire."
    },
    {
      icon: Users,
      title: "Esprit d'équipe",
      description: "La cohésion et la confiance mutuelle sont les piliers de notre efficacité opérationnelle."
    },
    {
      icon: Award,
      title: "Honneur",
      description: "Nous servons avec honneur, intégrité et dévouement pour la protection de tous."
    },
    {
      icon: Zap,
      title: "Réactivité",
      description: "Capacité d'intervention rapide et coordonnée dans toutes les situations critiques."
    },
    {
      icon: Eye,
      title: "Vigilance",
      description: "Une surveillance constante et une anticipation des menaces pour une sécurité optimale."
    }
  ];

  return (
    <section id="presentation" className="py-20 relative">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="section-title text-center">Qui sommes-nous ?</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            FOCOMUES est une unité d'élite spécialisée dans les opérations de sécurité complexes, 
            alliant formation militaire avancée et technologies de pointe pour garantir la protection 
            et l'excellence opérationnelle.
          </p>
        </div>

        {/* Mission statement */}
        <div className="military-card p-8 mb-16 animate-slide-in-left">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-military-olive mb-4">Notre Mission</h3>
              <p className="military-text text-lg mb-6">
                Assurer la sécurité et la protection par l'excellence opérationnelle, 
                la formation continue et l'innovation tactique. Nous intervenons dans 
                les situations les plus critiques avec professionnalisme et efficacité.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-military-olive rounded-full"></div>
                  <span className="text-gray-300">Formation d'élite</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-military-gold rounded-full"></div>
                  <span className="text-gray-300">Excellence opérationnelle</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="military-card p-6 text-center">
                <Shield className="h-16 w-16 text-military-olive mx-auto mb-4 animate-military-pulse" />
                <h4 className="text-xl font-semibold text-white mb-2">Engagement Total</h4>
                <p className="text-gray-400">Pour la sécurité et la protection</p>
              </div>
            </div>
          </div>
        </div>

        {/* Values grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((value, index) => {
            const IconComponent = value.icon;
            return (
              <div 
                key={index} 
                className="military-card p-6 hover:bg-military-steel/20 transition-all duration-300 group animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-military-olive/20 rounded-lg group-hover:bg-military-olive/30 transition-colors">
                    <IconComponent className="h-6 w-6 text-military-olive" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">{value.title}</h3>
                    <p className="military-text text-sm">{value.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to action */}
        <div className="text-center mt-16 animate-fade-in">
          <div className="military-card p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">Rejoignez l'Excellence</h3>
            <p className="military-text mb-6">
              Vous avez les qualités requises pour intégrer une unité d'élite ? 
              Découvrez nos programmes de formation et nos opportunités de carrière.
            </p>
            <button className="tactical-button">
              Candidater maintenant
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PresentationSection;
