import { Link } from 'react-router-dom';
import { Home as HomeIcon, Vote } from 'lucide-react';

const Header = () => {
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-slate-900">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-red-600 text-white">
            <Vote className="w-4 h-4" />
          </span>
          <span className="hidden sm:block text-sm tracking-tight">
            FOCOM UES ILIAD
            <span className="block text-[10px] font-medium text-slate-500 uppercase tracking-widest">
              Élections 2026
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <HomeIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Accueil</span>
          </Link>
          <a
            href="https://www.e-votez.net/uesiliad"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full px-4 py-1.5 text-sm font-semibold shadow-sm"
          >
            <Vote className="w-4 h-4" />
            Je vote
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
