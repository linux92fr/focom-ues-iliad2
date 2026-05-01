import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Vérifie à la fois window.scrollY et document.documentElement.scrollTop
      const scrolled = window.scrollY || document.documentElement.scrollTop;
      setIsVisible(scrolled > 300);
    };

    // Vérifier immédiatement au montage
    toggleVisibility();

    // Écouter les événements de scroll
    window.addEventListener('scroll', toggleVisibility, { passive: true });
    document.addEventListener('scroll', toggleVisibility, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
      document.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    // Essayer plusieurs méthodes pour assurer la compatibilité
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    
    // Fallback pour les navigateurs qui ne supportent pas behavior: 'smooth'
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-[22rem] right-6 z-[9999] w-12 h-12 rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center cursor-pointer border-0 p-0"
      aria-label="Retour en haut"
      type="button"
    >
      <ArrowUp className="h-6 w-6" />
    </button>
  );
};

export default ScrollToTop;
