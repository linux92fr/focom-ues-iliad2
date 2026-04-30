import { FileText, Users, Calendar, MessageCircle, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const items = [
  { icon: FileText, title: "Mes Documents", desc: "Accédez à vos documents et modèles utiles" },
  { icon: Users, title: "Mes Avantages", desc: "Découvrez vos avantages adhérents" },
  { icon: Calendar, title: "Prendre RDV", desc: "Prenez rendez-vous avec un élu FOCOM" },
  { icon: MessageCircle, title: "Poser une Question", desc: "Une question ? Nous vous répondons" },
  { icon: Mail, title: "Vos Contacts", desc: "Trouvez vos interlocuteurs FOCOM" },
  { icon: Lock, title: "Accès Réservés", desc: "Contenus réservés aux adhérents" },
];

const EspaceAdherentCard = () => {
  return (
    <div className="bg-card rounded-2xl border border-border card-shadow p-6">
      <h2 className="font-display font-black text-primary text-lg tracking-wide mb-1">ESPACE ADHÉRENT</h2>
      <p className="text-sm text-muted-foreground mb-5">Un espace dédié pour vous informer et vous accompagner</p>

      <div className="grid grid-cols-3 gap-3 mb-5">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <div
              key={it.title}
              className="bg-secondary/5 hover:bg-secondary/10 transition-colors rounded-xl p-4 text-center cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center mx-auto mb-2">
                <Icon className="h-5 w-5" />
              </div>
              <div className="font-bold text-xs text-foreground">{it.title}</div>
              <div className="text-[10px] text-muted-foreground mt-1 leading-tight">{it.desc}</div>
            </div>
          );
        })}
      </div>

      <Button asChild className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground h-12 font-bold gap-2">
        <Link to="/profil">
          <Lock className="h-4 w-4" />
          Se connecter à mon espace adhérent
        </Link>
      </Button>
    </div>
  );
};

export default EspaceAdherentCard;
