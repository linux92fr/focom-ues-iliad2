import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-white border-b border-border">
      {/* Top-left red diagonal triangle */}
      <div
        className="absolute top-0 left-0 w-[55%] h-[180px] bg-primary"
        style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
        aria-hidden
      />
      {/* Bottom-right teal diagonal triangle */}
      <div
        className="absolute bottom-0 right-0 w-[35%] h-[140px] bg-secondary"
        style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
        aria-hidden
      />

      {/* FO badge top-left */}
      <div className="absolute top-6 left-6 z-10 text-primary-foreground">
        <div className="font-display text-4xl font-black leading-none">FO</div>
        <div className="text-[10px] font-bold tracking-wider mt-1 uppercase">
          La Force<br />Syndicale
        </div>
      </div>

      {/* iliad/free top-right */}
      <div className="absolute top-6 right-6 z-10 text-right">
        <div className="font-display text-2xl font-black text-accent">iliad</div>
        <div className="font-display text-xl font-black text-secondary italic">free</div>
      </div>

      <div className="relative container mx-auto px-4 py-20 lg:py-28 z-[5]">
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
              <span className="text-primary text-lg">✊</span>
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

          {/* Pillars */}
          <div className="grid grid-cols-4 gap-4 pt-10 max-w-2xl mx-auto">
            {[
              { label: "DÉFENDRE", icon: "🛡️" },
              { label: "REPRÉSENTER", icon: "👥" },
              { label: "NÉGOCIER", icon: "🤝" },
              { label: "AGIR", icon: "📈" },
            ].map((p, i) => (
              <div key={p.label} className="flex flex-col items-center gap-2 px-2">
                <div className="text-2xl">{p.icon}</div>
                <div className="text-xs font-bold tracking-wider text-accent">{p.label}</div>
                {i < 3 && <div className="hidden md:block absolute" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
