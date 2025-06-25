
import React from 'react';
import { Users, Heart, Shield, Award, Scale, Handshake } from 'lucide-react';

const PresentationSection = () => {
  const values = [
    {
      icon: Users,
      title: "Solidarité",
      description: "Nous croyons en la force du collectif et en l'entraide entre travailleurs pour défendre nos droits."
    },
    {
      icon: Scale,
      title: "Justice",
      description: "Nous luttons pour l'équité, l'égalité des chances et des conditions de travail justes pour tous."
    },
    {
      icon: Shield,
      title: "Protection",
      description: "Nous défendons chaque adhérent face aux difficultés professionnelles et sociales."
    },
    {
      icon: Heart,
      title: "Respect",
      description: "Nous prônons le respect mutuel, la dignité au travail et la reconnaissance de chacun."
    },
    {
      icon: Handshake,
      title: "Négociation",
      description: "Nous privilégions le dialogue social constructif pour aboutir à des accords bénéfiques."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Nous visons l'excellence dans nos actions et notre accompagnement des adhérents."
    }
  ];

  return (
    <section id="presentation" className="py-20 relative">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="section-title text-center">Qui sommes-nous ?</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Notre syndicat est une organisation démocratique et indépendante, 
            dédiée à la défense des droits des travailleurs et à l'amélioration 
            de leurs conditions de travail et de vie.
          </p>
        </div>

        {/* Mission statement */}
        <div className="union-card p-8 mb-16 animate-slide-in-left">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-union-red mb-4">Notre Mission</h3>
              <p className="union-text text-lg mb-6">
                Défendre les droits et intérêts de nos adhérents, promouvoir la justice sociale, 
                négocier de meilleures conditions de travail et accompagner chaque travailleur 
                dans ses démarches professionnelles et sociales.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-union-red rounded-full"></div>
                  <span className="text-gray-300">Défense collective</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-union-gold rounded-full"></div>
                  <span className="text-gray-300">Justice sociale</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="union-card p-6 text-center">
                <Users className="h-16 w-16 text-union-red mx-auto mb-4 animate-union-pulse" />
                <h4 className="text-xl font-semibold text-white mb-2">Unis nous sommes forts</h4>
                <p className="text-gray-400">Ensemble pour vos droits</p>
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
                className="union-card p-6 hover:bg-union-blue/20 transition-all duration-300 group animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-union-red/20 rounded-lg group-hover:bg-union-red/30 transition-colors">
                    <IconComponent className="h-6 w-6 text-union-red" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">{value.title}</h3>
                    <p className="union-text text-sm">{value.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to action */}
        <div className="text-center mt-16 animate-fade-in">
          <div className="union-card p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">Rejoignez-nous</h3>
            <p className="union-text mb-6">
              Vous partagez nos valeurs ? Vous souhaitez défendre vos droits et ceux de vos collègues ? 
              Découvrez les avantages de l'adhésion et rejoignez notre communauté solidaire.
            </p>
            <button className="solidarity-button">
              Adhérer maintenant
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PresentationSection;
