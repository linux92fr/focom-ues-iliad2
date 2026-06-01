import { useState } from "react";
import { Menu, X, Search, Bell, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/AuthModal";
import UserMenu from "@/components/UserMenu";
import logoFocom from "@/assets/logo-focom.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user, loading } = useAuth();

  const navLinks = [
    { label: "Actualités", href: "/actualites" },
    { label: "Tracts", href: "/tracts" },
    { label: "Agenda", href: "/agenda" },
    { label: "Vos Droits", href: "/vos-droits" },
    { label: "Publications", href: "/publications" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4">
          {/* Top bar */}
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img loading="lazy" 
                src={logoFocom} 
                alt="Logo FOCOM" 
                className="w-12 h-12 object-contain"
              />
              <div className="hidden sm:block">
                <h1 className="font-serif text-xl font-bold text-foreground">FOCOM Actu</h1>
                <p className="text-xs text-muted-foreground">UES ILIAD - La force du syndicalisme</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Bouton de recherche */}
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Search className="h-5 w-5" />
              </Button>
              
              {/* Cloche de notification */}
              <Button variant="ghost" size="icon" className="hidden sm:flex relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
              </Button>
              
              {/* Écrou d'administration */}
              <Button asChild variant="ghost" size="icon" className="hidden md:flex">
                <a href="/admin">
                  <Settings className="h-5 w-5" />
                </a>
              </Button>
              
              {/* Bouton rouge "Nous rejoindre" */}
              <Button asChild variant="default" size="sm" className="hidden md:flex bg-red-600 hover:bg-red-700 text-white font-semibold">
                <a href="/adhesion">Nous rejoindre</a>
              </Button>
              
              {!loading && (
                user ? (
                  <UserMenu />
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="hidden md:flex gap-2"
                    onClick={() => setAuthModalOpen(true)}
                  >
                    <User className="h-4 w-4" />
                    <span>Espace Adhérent</span>
                  </Button>
                )
              )}
              
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav className="lg:hidden py-4 border-t border-border animate-fade-in">
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
                {!user && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 mx-4 gap-2"
                    onClick={() => {
                      setAuthModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                  >
                    <User className="h-4 w-4" />
                    <span>Espace Adhérent</span>
                  </Button>
                )}
              </div>
            </nav>
          )}
        </div>
      </header>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </>
  );
};

export default Header;
