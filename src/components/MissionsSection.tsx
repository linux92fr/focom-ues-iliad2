
import React from 'react';
import { Shield, Scale, Users, AlertTriangle, FileText, Megaphone } from 'lucide-react';

const MissionsSection = () => {
  const actions = [
    {
      icon: Shield,
      title: "Défense Individuelle",
      description: "Accompagnement personnalisé des adhérents dans leurs démarches et conflits professionnels.",
      features: ["Conseils juridiques", "Médiation conflits", "Accompagnement procédures"]
    },
    {
      icon: Scale,
      title: "Négociation Collective",
      description: "Négociation d'accords collectifs pour améliorer les conditions de travail et de rémunération.",
      features: ["Accords salariaux", "Conditions travail", "Temps de travail"]
    },
    {
      icon: Users,
      title: "Action Collective",
      description: "Organisation d'actions collectives pour faire valoir les revendications des travailleurs.",
      features: ["Manifestations", "Grèves", "Pétitions"]
    },
    {
      icon: FileText,
      title: "Formation & Information",
      description: "Formation des adhérents sur leurs droits et information sur l'actualité sociale.",
      features: ["Formations droits", "Veille juridique", "Information syndicale"]
    },
    {
      icon: Megaphone,
      title: "Communication",
      description: "Sensibilisation et information du public sur les enjeux sociaux et professionnels.",
      features: ["Campagnes info", "Relations presse", "Réseaux sociaux"]
    },
    {
      icon: AlertTriangle,
      title: "Urgences Sociales",
      description: "Intervention rapide en cas de situations d'urgence sociale ou professionnelle.",
      features: ["Aide d'urgence", "Médiation rapide", "Soutien juridique"]
    }
  ];

  return (
    <section id="actions" className="py-20 bg-union-slate/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="section-title text-center">Nos Domaines d'Action</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Notre syndicat intervient dans tous les domaines qui touchent 
            à la vie professionnelle et sociale de nos adhérents, avec comme objectif 
            la défense de leurs droits et l'amélioration de leurs conditions.
          </p>
        </div>

        {/* Actions grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {actions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <div 
                key={index}
                className="union-card p-6 hover:scale-105 transition-all duration-300 group animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-center mb-6">
                  <div className="inline-flex p-4 bg-union-red/20 rounded-full mb-4 group-hover:bg-union-red/30 transition-colors">
                    <IconComponent className="h-8 w-8 text-union-red" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{action.title}</h3>
                  <p className="union-text">{action.description}</p>
                </div>
                
                <div className="space-y-2">
                  {action.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-union-gold rounded-full"></div>
                      <span className="text-gray-400 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Process section */}
        <div className="union-card p-8 animate-slide-in-left">
          <h3 className="text-2xl font-bold text-union-red mb-6 text-center">Notre Démarche</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-union-red/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-union-red font-bold">1</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Écoute</h4>
              <p className="text-gray-400 text-sm">Comprendre vos besoins et préoccupations</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-union-red/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-union-red font-bold">2</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Analyse</h4>
              <p className="text-gray-400 text-sm">Étudier la situation et vos droits</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-union-red/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-union-red font-bold">3</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Action</h4>
              <p className="text-gray-400 text-sm">Mise en œuvre de la stratégie adaptée</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-union-red/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-union-red font-bold">4</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Suivi</h4>
              <p className="text-gray-400 text-sm">Accompagnement jusqu'à la résolution</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionsSection;
