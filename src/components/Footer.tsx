import { Facebook, Twitter, Linkedin, Youtube, Phone, Mail, MapPin } from "lucide-react";
import logoFocom from "@/assets/logo-focom.png";

const Footer = () => {
  const footerLinks = {
    "Syndicat": ["Qui sommes-nous ?", "Notre équipe", "Nos valeurs", "Adhérer"],
    "Ressources": ["Actualités", "Publications", "Conventions", "FAQ"],
    "Vos Droits": ["Code du travail", "Protection sociale", "Formation", "Retraite"],
    "Contact": ["Nous contacter", "Permanences", "Antennes locales", "Urgences"],
  };

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Youtube, href: "#", label: "YouTube" },
  ];

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src={logoFocom} 
                alt="Logo FOCOM" 
                className="w-14 h-14 object-contain"
              />
              <div>
                <h3 className="font-serif text-xl font-bold">FOCOM</h3>
                <p className="text-xs text-secondary-foreground/70">Actu Espace</p>
              </div>
            </div>
            <p className="text-sm text-secondary-foreground/70 mb-4">
              Votre syndicat engagé pour la défense de vos droits et l'amélioration de vos conditions de travail.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-lg bg-secondary-foreground/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map((link, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact info */}
        <div className="border-t border-secondary-foreground/10 mt-10 pt-8">
          <div className="flex flex-wrap gap-6 justify-center text-sm text-secondary-foreground/70">
            <a href="tel:+33123456789" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Phone className="h-4 w-4" />
              01 23 45 67 89
            </a>
            <a href="mailto:contact@focom-actu.fr" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Mail className="h-4 w-4" />
              contact@focom-actu.fr
            </a>
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Paris, France
            </span>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-secondary-foreground/10 mt-8 pt-8 text-center">
          <p className="text-sm text-secondary-foreground/50">
            © {new Date().getFullYear()} FOCOM Actu Espace. Tous droits réservés.
          </p>
          <div className="flex justify-center gap-4 mt-2 text-xs text-secondary-foreground/40">
            <a href="#" className="hover:text-secondary-foreground transition-colors">Mentions légales</a>
            <a href="#" className="hover:text-secondary-foreground transition-colors">Politique de confidentialité</a>
            <a href="#" className="hover:text-secondary-foreground transition-colors">CGU</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
