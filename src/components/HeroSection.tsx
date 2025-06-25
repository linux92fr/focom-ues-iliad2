
import React from 'react';
import { Shield, Target, Users, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  return (
    <section id="accueil" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(56,161,105,0.3)_1px,transparent_0)] bg-[length:20px_20px]"></div>
      </div>
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-military-olive/20 text-military-olive px-4 py-2 rounded-full mb-8 animate-fade-in">
            <Award className="h-5 w-5" />
            <span className="text-sm font-semibold tracking-wider">UNITÉ D'ÉLITE</span>
          </div>

          {/* Titre principal */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
            <span className="block">FOCOMUES</span>
            <span className="block text-3xl md:text-4xl text-military-olive mt-2">
              Force de Commandement des Unités d'Elite de Sécurité
            </span>
          </h1>

          {/* Description */}
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-in-left">
            Excellence, Discipline et Dévotion au service de la sécurité et de la protection.
            Rejoignez une force d'élite dédiée aux missions les plus critiques.
          </p>

          {/* Call to action */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
            <Button className="tactical-button text-lg px-8 py-4">
              <Shield className="h-5 w-5 mr-2" />
              Découvrir nos missions
            </Button>
            <Button variant="outline" className="border-military-steel text-white hover:bg-military-steel/20 text-lg px-8 py-4">
              <Users className="h-5 w-5 mr-2" />
              Rejoindre l'unité
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 animate-fade-in">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-military-olive mb-2">150+</div>
              <div className="text-gray-400 text-sm uppercase tracking-wider">Membres actifs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-military-olive mb-2">24/7</div>
              <div className="text-gray-400 text-sm uppercase tracking-wider">Opérationnel</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-military-olive mb-2">95%</div>
              <div className="text-gray-400 text-sm uppercase tracking-wider">Taux de réussite</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-military-olive mb-2">5</div>
              <div className="text-gray-400 text-sm uppercase tracking-wider">Années d'expérience</div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-military-pulse">
        <Target className="h-6 w-6 text-military-olive" />
      </div>
    </section>
  );
};

export default HeroSection;
