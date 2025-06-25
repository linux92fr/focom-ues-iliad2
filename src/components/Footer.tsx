
import React from 'react';
import { Users, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-union-dark border-t border-union-steel/30 py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-union-red/20 rounded-lg">
                <Users className="h-6 w-6 text-union-red" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">SYNDICAT UNIS</h3>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Solidarité & Défense</p>
              </div>
            </div>
            <p className="union-text mb-4 max-w-md">
              Organisation syndicale indépendante dédiée à la défense des droits 
              des travailleurs et à l'amélioration de leurs conditions de travail et de vie.
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-union-red rounded-full animate-pulse"></div>
                <span className="text-gray-400 text-sm">À votre écoute</span>
              </div>
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h4 className="text-lg font-semibold text-union-red mb-4">Liens Rapides</h4>
            <ul className="space-y-2">
              <li><a href="#accueil" className="text-gray-400 hover:text-union-red transition-colors">Accueil</a></li>
              <li><a href="#presentation" className="text-gray-400 hover:text-union-red transition-colors">Qui sommes-nous</a></li>
              <li><a href="#actions" className="text-gray-400 hover:text-union-red transition-colors">Nos Actions</a></li>
              <li><a href="#contact" className="text-gray-400 hover:text-union-red transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold text-union-red mb-4">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400 text-sm">+33 (0)1 XX XX XX XX</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400 text-sm">contact@syndicat-unis.fr</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400 text-sm">Maison des Syndicats</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-union-steel/30 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 Syndicat Unis. Tous droits réservés.
          </p>
          <p className="text-gray-400 text-sm mt-2 md:mt-0">
            Solidarité • Justice • Respect
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
