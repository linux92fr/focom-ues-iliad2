import { Link } from 'react-router-dom';
import { Mail, Phone, Globe } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white mt-auto">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-2">FOCOM UES ILIAD</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Syndicat affilié à Force Ouvrière — Défense des salariés du groupe Iliad.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-2">Navigation</h3>
            <ul className="space-y-1 text-xs text-slate-600">
              <li><Link to="/" className="hover:text-red-600 transition-colors">Accueil</Link></li>
              <li><Link to="/elections" className="hover:text-red-600 transition-colors">Élections 2026</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-2">Contact</h3>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <a href="tel:0187154311" className="hover:text-red-600 transition-colors">01 87 15 43 11</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <a href="mailto:contact@focomues-iliad.fr" className="hover:text-red-600 transition-colors truncate">contact@focomues-iliad.fr</a>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <a href="https://focomues-iliad.fr/" target="_blank" rel="noopener noreferrer" className="hover:text-red-600 transition-colors">focomues-iliad.fr</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-500">© 2026 FOCOM UES ILIAD — Tous droits réservés</p>
          <p className="text-xs text-slate-400">Affilié à <strong>Force Ouvrière</strong></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
