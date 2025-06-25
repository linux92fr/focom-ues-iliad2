
import React, { useState } from 'react';
import { Menu, X, Users, Heart, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-union-dark/95 backdrop-blur-md border-b border-union-steel/30">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo et titre */}
          <div className="flex items-center space-x-3 animate-slide-in-left">
            <div className="p-2 bg-union-red/20 rounded-lg">
              <Users className="h-8 w-8 text-union-red" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">SYNDICAT UNIS</h1>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Solidarité & Défense</p>
            </div>
          </div>

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#accueil" className="text-gray-300 hover:text-union-red transition-colors duration-300 font-medium">
              Accueil
            </a>
            <a href="#presentation" className="text-gray-300 hover:text-union-red transition-colors duration-300 font-medium">
              Qui sommes-nous
            </a>
            <a href="#actions" className="text-gray-300 hover:text-union-red transition-colors duration-300 font-medium">
              Nos Actions
            </a>
            <a href="#contact" className="text-gray-300 hover:text-union-red transition-colors duration-300 font-medium">
              Contact
            </a>
            <Button className="solidarity-button">
              Adhérer
            </Button>
          </nav>

          {/* Menu mobile button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 text-gray-300 hover:text-union-red transition-colors"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Menu mobile */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 space-y-4 border-t border-union-steel/30 animate-fade-in">
            <a href="#accueil" className="block text-gray-300 hover:text-union-red transition-colors duration-300 font-medium">
              Accueil
            </a>
            <a href="#presentation" className="block text-gray-300 hover:text-union-red transition-colors duration-300 font-medium">
              Qui sommes-nous
            </a>
            <a href="#actions" className="block text-gray-300 hover:text-union-red transition-colors duration-300 font-medium">
              Nos Actions
            </a>
            <a href="#contact" className="block text-gray-300 hover:text-union-red transition-colors duration-300 font-medium">
              Contact
            </a>
            <Button className="solidarity-button w-full">
              Adhérer
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
