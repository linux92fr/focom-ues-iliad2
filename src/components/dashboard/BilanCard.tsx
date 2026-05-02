import { ArrowRight, CheckCircle2, FileText, Handshake, Trophy, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useSiteContent } from "@/lib/siteContent";

const iconMap = {
  handshake: Handshake,
  users: Users,
  file: FileText,
  check: CheckCircle2,
};

const BilanCard = () => {
  const section = useSiteContent("bilan_mandat");
  const content = section.content as {
    stats: Array<{ icon: keyof typeof iconMap; value: string; label: string; color: "primary" | "secondary" }>;
    progress: Array<{ label: string; val: number }>;
    engagementTitle: string;
    engagementText: string;
  };

  return (
    <div className="bg-card rounded-2xl border border-border card-shadow p-6">
      <div className="flex items-start justify-between gap-4 mb-2">
        <h2 className="font-display font-black text-primary text-lg tracking-wide">
          {section.title}
        </h2>
        <Link to="/publications" className="text-sm text-secondary font-semibold flex items-center gap-1 hover:gap-2 transition-all shrink-0">
          Voir le bilan complet <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <p className="text-sm text-muted-foreground mb-5">{section.subtitle}</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {content.stats.map((s) => {
          const Icon = iconMap[s.icon] || FileText;
          const color = s.color === "primary" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary";
          return (
            <div key={s.label} className="text-center">
              <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center mx-auto mb-2`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="font-display font-black text-2xl text-foreground">{s.value}</div>
              <div className="text-[10px] text-muted-foreground leading-tight mt-1">{s.label}</div>
            </div>
          );
        })}
      </div>

      <div>
        <h4 className="text-sm font-bold text-foreground mb-3">Nos avancees principales</h4>
        <div className="space-y-2">
          {content.progress.map((p) => (
            <div key={p.label} className="flex items-center gap-3 text-xs">
              <span className="w-32 text-muted-foreground shrink-0">{p.label}</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-secondary rounded-full" style={{ width: `${p.val}%` }} />
              </div>
              <span className="w-10 text-right font-bold text-foreground">{p.val}%</span>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-secondary rounded-sm" /> Objectifs atteints</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-muted rounded-sm" /> En cours</span>
        </div>
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-xl bg-secondary/5 p-4">
        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
          <Trophy className="h-5 w-5 text-secondary" />
        </div>
        <div>
          <div className="font-bold text-sm">{content.engagementTitle}</div>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {content.engagementText}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BilanCard;
