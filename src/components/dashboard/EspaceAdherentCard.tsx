import { Calendar, FileText, Lock, Mail, MessageCircle, Settings, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useSiteContent } from "@/lib/siteContent";

const iconMap = {
  file: FileText,
  users: Users,
  calendar: Calendar,
  message: MessageCircle,
  mail: Mail,
  shield: ShieldCheck,
};

const EspaceAdherentCard = () => {
  const section = useSiteContent("espace_adherent");
  const content = section.content as {
    items: Array<{ icon: keyof typeof iconMap; title: string; desc: string }>;
  };

  return (
    <section className="bg-card rounded-2xl border border-border card-shadow p-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="font-display font-black text-primary text-lg tracking-wide">{section.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{section.subtitle}</p>
        </div>
        <div className="w-11 h-11 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shrink-0">
          <Lock className="h-5 w-5" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        {content.items.map((it) => {
          const Icon = iconMap[it.icon] || FileText;
          return (
            <div
              key={it.title}
              className="bg-secondary/5 hover:bg-secondary/10 transition-colors rounded-xl p-4 min-h-[120px]"
            >
              <div className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center mb-3">
                <Icon className="h-5 w-5" />
              </div>
              <div className="font-bold text-sm text-foreground">{it.title}</div>
              <div className="text-xs text-muted-foreground mt-1 leading-snug">{it.desc}</div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button asChild className="bg-secondary hover:bg-secondary/90 text-secondary-foreground h-12 font-bold gap-2">
          <Link to="/profil">
            <Lock className="h-4 w-4" />
            Espace adherent
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-12 font-bold gap-2 border-secondary text-secondary hover:bg-secondary/10">
          <Link to="/admin">
            <Settings className="h-4 w-4" />
            Administration
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default EspaceAdherentCard;
