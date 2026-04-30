import { ArrowRight, Handshake, Users, FileText, CheckCircle2, Trophy } from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  { icon: Handshake, value: "42", label: "Accords signés et améliorés", color: "bg-secondary/10 text-secondary" },
  { icon: Users, value: "78", label: "Réunions de négociation", color: "bg-primary/10 text-primary" },
  { icon: FileText, value: "126", label: "Dossiers individuels accompagnés", color: "bg-secondary/10 text-secondary" },
  { icon: CheckCircle2, value: "100%", label: "Présents à vos côtés", color: "bg-primary/10 text-primary" },
];

const progress = [
  { label: "Pouvoir d'achat", val: 85 },
  { label: "Conditions de travail", val: 90 },
  { label: "Égalité professionnelle", val: 75 },
  { label: "Gestion des emplois", val: 80 },
  { label: "Qualité de vie au travail", val: 70 },
];

const BilanCard = () => {
  return (
    <div className="bg-card rounded-2xl border border-border card-shadow p-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-display font-black text-primary text-lg tracking-wide">
          BILAN DE MANDAT 2021 – 2024
        </h2>
        <Link to="/publications" className="text-sm text-secondary font-semibold flex items-center gap-1 hover:gap-2 transition-all">
          Voir le bilan complet <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <p className="text-sm text-muted-foreground mb-5">3 années d'actions au service de tous les salariés</p>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="text-center">
              <div className={`w-12 h-12 rounded-full ${s.color} flex items-center justify-center mx-auto mb-2`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="font-display font-black text-2xl text-foreground">{s.value}</div>
              <div className="text-[10px] text-muted-foreground leading-tight mt-1">{s.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-center">
        <div>
          <h4 className="text-sm font-bold text-foreground mb-3">Nos avancées principales</h4>
          <div className="space-y-2">
            {progress.map((p) => (
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

        <div className="bg-secondary/5 rounded-xl p-5 text-center min-w-[160px]">
          <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-2">
            <Trophy className="h-5 w-5 text-secondary" />
          </div>
          <div className="font-bold text-sm">Notre engagement</div>
          <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
            Transparence, écoute et action : notre priorité, c'est vous.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BilanCard;
