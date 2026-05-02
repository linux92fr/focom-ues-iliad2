import { MessageSquare, Shield, Sparkles } from "lucide-react";
import { useSiteContent } from "@/lib/siteContent";

const iconMap = {
  shield: Shield,
  message: MessageSquare,
  sparkles: Sparkles,
};

const CombatsCard = () => {
  const section = useSiteContent("combats");
  const content = section.content as {
    columns: Array<{ icon: keyof typeof iconMap; title: string; sub: string; items: string[] }>;
  };

  return (
    <div className="bg-card rounded-2xl border border-border card-shadow p-6">
      <h2 className="font-display font-black text-primary text-lg tracking-wide mb-1">{section.title}</h2>
      <p className="text-sm text-muted-foreground mb-6">{section.subtitle}</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {content.columns.map((c) => {
          const Icon = iconMap[c.icon] || Shield;
          return (
            <div key={c.title}>
              <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center mb-3">
                <Icon className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-display font-black text-foreground text-base mb-1">{c.title}</h3>
              <p className="text-xs text-muted-foreground mb-3">{c.sub}</p>
              <ul className="space-y-1.5">
                {c.items.map((it) => (
                  <li key={it} className="text-xs flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-secondary mt-1.5 shrink-0" />
                    <span className="text-foreground">{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CombatsCard;
