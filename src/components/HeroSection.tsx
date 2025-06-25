
import React from 'react';
import { Users, Heart, Shield, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  return (
    <section id="accueil" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(220,38,38,0.3)_1px,transparent_0)] bg-[length:20px_20px]"></div>
      </div>
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-union-red/20 text-union-red px-4 py-2 rounded-full mb-8 animate-fade-in">
            <Heart className="h-5 w-5" />
            <span className="text-sm font-semibold tracking-wider">SOLIDARITÉ</span>
          </div>

          {/* Titre principal */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
            <span className="block">SYNDICAT</span>
            <span className="block text-3xl md:text-4xl text-union-red mt-2">
              Unis pour la défense de vos droits
            </span>
          </h1>

          {/* Description */}
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-in-left">
            Ensemble, nous sommes plus forts. Rejoignez un mouvement solidaire 
            dédié à la protection de vos droits et l'amélioration de vos conditions de travail.
          </p>

          {/* Call to action */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
            <Button className="solidarity-button text-lg px-8 py-4">
              <Users className="h-5 w-5 mr-2" />
              Découvrir nos actions
            </Button>
            <Button variant="outline" className="border-union-steel text-white hover:bg-union-steel/20 text-lg px-8 py-4">
              <Shield className="h-5 w-5 mr-2" />
              Adhérer au syndicat
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 animate-fade-in">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-union-red mb-2">2500+</div>
              <div className="text-gray-400 text-sm uppercase tracking-wider">Adhérents</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-union-red mb-2">15</div>
              <div className="text-gray-400 text-sm uppercase tracking-wider">Années d'engagement</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-union-red mb-2">200+</div>
              <div className="text-gray-400 text-sm uppercase tracking-wider">Victoires sociales</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-union-red mb-2">24/7</div>
              <div className="text-gray-400 text-sm uppercase tracking-wider">Accompagnement</div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-union-pulse">
        <Heart className="h-6 w-6 text-union-red" />
      </div>
    </section>
  );
};

export default HeroSection;
