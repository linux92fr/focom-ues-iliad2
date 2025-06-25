
import React from 'react';
import { Shield, Search, Users, AlertTriangle, Radio, Map } from 'lucide-react';

const MissionsSection = () => {
  const missions = [
    {
      icon: Shield,
      title: "Sécurité Rapprochée",
      description: "Protection de personnalités et sécurisation d'événements critiques avec expertise tactique.",
      features: ["Protection VIP", "Analyse de menaces", "Coordination sécuritaire"]
    },
    {
      icon: Search,
      title: "Reconnaissance",
      description: "Missions de reconnaissance et de renseignement pour l'évaluation des risques.",
      features: ["Surveillance terrain", "Collecte d'informations", "Analyse tactique"]
    },
    {
      icon: AlertTriangle,
      title: "Intervention d'Urgence",
      description: "Réponse rapide aux situations critiques nécessitant une intervention spécialisée.",
      features: ["Réaction immédiate", "Gestion de crise", "Coordination équipes"]
    },
    {
      icon: Users,
      title: "Formation Tactique",
      description: "Programmes de formation avancée pour unités de sécurité et forces spéciales.",
      features: ["Formation combat", "Tactiques avancées", "Certification"]
    },
    {
      icon: Radio,
      title: "Communication Sécurisée",
      description: "Mise en place et maintenance de réseaux de communication cryptés et sécurisés.",
      features: ["Réseaux cryptés", "Coordination ops", "Support technique"]
    },
    {
      icon: Map,
      title: "Planification Opérationnelle",
      description: "Élaboration de stratégies et planification d'opérations complexes.",
      features: ["Analyse terrain", "Stratégie tactique", "Briefing équipes"]
    }
  ];

  return (
    <section id="missions" className="py-20 bg-military-charcoal/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="section-title text-center">Nos Domaines d'Intervention</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            FOCOMUES intervient dans une large gamme de missions spécialisées, 
            chacune requérant expertise, formation et équipement de pointe pour garantir 
            l'excellence opérationnelle.
          </p>
        </div>

        {/* Missions grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {missions.map((mission, index) => {
            const IconComponent = mission.icon;
            return (
              <div 
                key={index}
                className="military-card p-6 hover:scale-105 transition-all duration-300 group animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-center mb-6">
                  <div className="inline-flex p-4 bg-military-olive/20 rounded-full mb-4 group-hover:bg-military-olive/30 transition-colors">
                    <IconComponent className="h-8 w-8 text-military-olive" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{mission.title}</h3>
                  <p className="military-text">{mission.description}</p>
                </div>
                
                <div className="space-y-2">
                  {mission.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-military-gold rounded-full"></div>
                      <span className="text-gray-400 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Process section */}
        <div className="military-card p-8 animate-slide-in-left">
          <h3 className="text-2xl font-bold text-military-olive mb-6 text-center">Processus Opérationnel</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-military-olive/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-military-olive font-bold">1</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Évaluation</h4>
              <p className="text-gray-400 text-sm">Analyse de la situation et des risques</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-military-olive/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-military-olive font-bold">2</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Planification</h4>
              <p className="text-gray-400 text-sm">Élaboration de la stratégie d'intervention</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-military-olive/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-military-olive font-bold">3</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Exécution</h4>
              <p className="text-gray-400 text-sm">Mise en œuvre coordonnée et précise</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-military-olive/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-military-olive font-bold">4</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Évaluation</h4>
              <p className="text-gray-400 text-sm">Débriefing et amélioration continue</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionsSection;
