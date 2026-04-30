import { Shield, MessageSquare, Sparkles } from "lucide-react";

const cols = [
  {
    icon: Shield,
    title: "Défendre",
    sub: "Nous défendons vos droits individuels et collectifs",
    items: ["Respect des accords", "Égalité & non-discrimination", "Santé & sécurité", "Droit à la déconnexion"],
  },
  {
    icon: MessageSquare,
    title: "Négocier",
    sub: "Nous négocions pour améliorer vos conditions de travail",
    items: ["Salaires & primes", "Télétravail", "Organisation du temps de travail", "Formation"],
  },
  {
    icon: Sparkles,
    title: "Agir ensemble",
    sub: "La solidarité est notre force",
    items: ["Mobilisations", "Actions collectives", "Écoute & proximité", "Informations régulières"],
  },
];

const CombatsCard = () => {
  return (
    <div className="bg-card rounded-2xl border border-border card-shadow p-6">
      <h2 className="font-display font-black text-primary text-lg tracking-wide mb-1">NOS COMBATS, VOS DROITS</h2>
      <p className="text-sm text-muted-foreground mb-6">La FOCOM agit chaque jour pour défendre vos droits</p>

      <div className="grid grid-cols-3 gap-6">
        {cols.map((c) => {
          const Icon = c.icon;
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
