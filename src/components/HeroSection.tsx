import { Handshake, Shield, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import forceOuvriereLogo from "@/assets/force-ouvriere-logo.png";

type HeroSectionProps = {
  intro?: boolean;
};

const HeroSection = ({ intro = false }: HeroSectionProps) => {
  return (
    <section
      className={`relative overflow-hidden bg-white border-b border-border ${
        intro ? "w-full min-h-screen flex items-center" : ""
      }`}
    >
      <div
        className="absolute top-0 left-0 w-[55%] h-[180px] bg-primary"
        style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
        aria-hidden
      />
      <div
        className="absolute bottom-0 right-0 w-[35%] h-[140px] bg-secondary"
        style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
        aria-hidden
      />

      <div className="absolute top-5 left-5 z-10 rounded-md bg-white/95 p-2 shadow-sm">
        <img
          src={forceOuvriereLogo}
          alt="Force Ouvriere"
          className="h-14 w-auto md:h-16"
        />
      </div>

      <div className="absolute top-6 right-6 z-10 text-right">
        <div className="font-display text-2xl font-black text-accent">iliad</div>
        <div className="font-display text-xl font-black text-secondary italic">free</div>
      </div>

      <div className={`relative container mx-auto px-4 z-[5] ${intro ? "py-24 lg:py-32" : "py-20 lg:py-28"}`}>
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <h1 className="font-display font-black leading-[0.95]">
            <span className="block text-5xl md:text-7xl text-primary tracking-tight">
              FOCOM
            </span>
            <span className="block text-5xl md:text-7xl text-secondary tracking-tight mt-1">
              UES ILIAD
            </span>
          </h1>

          <div className="flex items-center justify-center gap-3 pt-2">
            <div className="h-px w-16 bg-primary" />
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div className="h-px w-16 bg-secondary" />
          </div>

          <p className="text-xl md:text-2xl text-accent font-semibold">
            <span className="text-primary font-black">4 ans</span> de combat pour vos droits
          </p>

          <div className="pt-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-3 px-8 h-14 text-base font-bold tracking-wider rounded-md hero-shadow">
              <Users className="h-5 w-5" />
              REJOIGNEZ-NOUS
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 max-w-2xl mx-auto">
            {[
              { label: "DEFENDRE", Icon: Shield },
              { label: "REPRESENTER", Icon: Users },
              { label: "NEGOCIER", Icon: Handshake },
              { label: "AGIR", Icon: TrendingUp },
            ].map((p) => (
              <div key={p.label} className="flex flex-col items-center gap-2 px-2">
                <p.Icon className="h-6 w-6 text-secondary" />
                <div className="text-xs font-bold tracking-wider text-accent">{p.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
