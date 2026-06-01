import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Search, Download, FileText, Loader2, Megaphone } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Tract = Tables<"tracts">;

const themeLabels: Record<string, string> = {
  nao: "NAO",
  elections: "Élections",
  droits: "Droits",
  sante: "Santé & sécurité",
  teletravail: "Télétravail",
  general: "Général",
};

const themeColors: Record<string, string> = {
  nao: "#dc2626",
  elections: "#2563eb",
  droits: "#7c3aed",
  sante: "#16a34a",
  teletravail: "#0891b2",
  general: "#475569",
};

const themeGradients: Record<string, string> = {
  nao: "from-red-700 to-red-900",
  elections: "from-blue-700 to-blue-900",
  droits: "from-violet-700 to-violet-900",
  sante: "from-green-700 to-green-900",
  teletravail: "from-cyan-700 to-cyan-900",
  general: "from-slate-600 to-slate-800",
};

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function TractCard({ tract, delay = 0 }: { tract: Tract; delay?: number }) {
  const { ref, visible } = useInView();
  const theme = tract.theme_id || "general";
  const label = themeLabels[theme] || theme;
  const color = themeColors[theme] || "#475569";
  const gradient = themeGradients[theme] || "from-slate-600 to-slate-800";

  const formatDate = (d: string | null) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  };

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
    >
      <div className="group rounded-2xl border border-border bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full">
        {/* Cover / placeholder */}
        <div className="relative h-44 overflow-hidden flex-shrink-0">
          {tract.image_url ? (
            <img
              src={tract.image_url}
              alt=""
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <FileText className="h-16 w-16 text-white/20" />
            </div>
          )}
          <div className="absolute top-3 left-3">
            <Badge style={{ backgroundColor: color, color: "white" }} className="shadow text-xs">
              {label}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <span className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
            <Calendar className="h-3 w-3" />
            {formatDate(tract.published_at || tract.created_at)}
          </span>
          <h3 className="font-bold text-base text-foreground mb-1 line-clamp-2 leading-snug group-hover:text-red-600 transition-colors">
            {tract.title}
          </h3>
          {tract.subtitle && (
            <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{tract.subtitle}</p>
          )}
          <div className="mt-auto pt-3">
            {tract.file_url ? (
              <a href={tract.file_url} target="_blank" rel="noopener noreferrer" download>
                <Button size="sm" className="w-full bg-red-600 hover:bg-red-700 text-white gap-2">
                  <Download className="h-4 w-4" />
                  Télécharger le tract
                </Button>
              </a>
            ) : (
              <Button size="sm" variant="outline" className="w-full" disabled>
                <FileText className="h-4 w-4 mr-2" />
                PDF non disponible
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Tracts() {
  const [tracts, setTracts] = useState<Tract[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [theme, setTheme] = useState("all");

  useEffect(() => {
    supabase
      .from("tracts")
      .select("*")
      .eq("is_published", true)
      .order("published_at", { ascending: false, nullsFirst: false })
      .then(({ data }) => {
        setTracts(data || []);
        setLoading(false);
      });
  }, []);

  const filtered = tracts.filter((t) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || (t.title || "").toLowerCase().includes(q) || (t.subtitle || "").toLowerCase().includes(q);
    const matchesTheme = theme === "all" || t.theme_id === theme;
    return matchesSearch && matchesTheme;
  });

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 p-3 sm:p-4 lg:p-8 space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-[#13233A] p-6 text-white shadow-xl sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border-[52px] border-white/5" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-red-600/25 blur-3xl" />
        <div className="relative">
          <Badge className="mb-4 border border-white/15 bg-white/10 text-white hover:bg-white/10">
            <Megaphone className="mr-1 h-3.5 w-3.5" /> Tracts
          </Badge>
          <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl">
            Nos tracts syndicaux
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-lg">
            Retrouvez l'ensemble des tracts diffusés par FO COM UES ILIAD : NAO, élections, droits, conditions de travail et informations pratiques.
          </p>
        </div>
      </section>

      {/* Filtres */}
      <section className="rounded-2xl border border-border bg-white p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un tract..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Thème" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les thèmes</SelectItem>
              {Object.entries(themeLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Grille */}
      <section>
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Megaphone className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>Aucun tract trouvé</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((tract, i) => (
              <TractCard key={tract.id} tract={tract} delay={Math.min(i * 60, 360)} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
