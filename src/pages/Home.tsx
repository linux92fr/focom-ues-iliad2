import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Users,
  Shield,
  HelpCircle,
  Lock,
  Phone,
  Mail,
  ChevronRight,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Handshake,
  Award,
  Heart,
  Bell,
  UserPlus,
  MessageSquare,
  Newspaper,
  FolderOpen,
  Scale,
  ClipboardList,
  Sparkles,
  Trophy,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const HERO_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663612648040/CNuRjrgGqWcQ7xt7rtMbHT/hero-banner-VHxfVX6tjRfujGise9ibwf.webp";
const SOLIDARITY_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663612648040/CNuRjrgGqWcQ7xt7rtMbHT/solidarity-icon-GxfeM5FU9pzPmnbJUShvCH.webp";

const DEFAULT_HERO_TITLE = "Ensemble, connectés, plus forts.";
const DEFAULT_HERO_SUBTITLE = "FO COM UES ILIAD accompagne, informe et défend les salariés du groupe au quotidien.";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated.current) {
        hasAnimated.current = true;
        const duration = 1200;
        const startTime = performance.now();
        const animate = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(eased * target));
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <div ref={ref} className="text-3xl font-extrabold text-red-600">{count}{suffix}</div>;
}

function ProgressBar({ label, value, color = "bg-teal-500" }: { label: string; value: number; color?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setWidth(value);
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="space-y-1.5">
      <div className="flex justify-between gap-3 text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-semibold text-slate-500">{value}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [heroTitle, setHeroTitle] = useState(DEFAULT_HERO_TITLE);
  const [heroSubtitle, setHeroSubtitle] = useState(DEFAULT_HERO_SUBTITLE);
  const [nlEmail, setNlEmail] = useState("");
  const [nlStatus, setNlStatus] = useState<"idle" | "loading" | "success" | "error" | "duplicate">("idle");

  useEffect(() => {
    supabase
      .from("site_content")
      .select("value")
      .eq("key", "home_hero")
      .single()
      .then(({ data }) => {
        if (data?.value) {
          try {
            const parsed = JSON.parse(data.value);
            if (parsed.title) setHeroTitle(parsed.title);
            if (parsed.subtitle) setHeroSubtitle(parsed.subtitle);
          } catch {
            // garde les valeurs par défaut
          }
        }
      });
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlEmail) return;
    setNlStatus("loading");

    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: nlEmail })
      .select("unsubscribe_token")
      .single();

    if (error) {
      setNlStatus(error.code === "23505" ? "duplicate" : "error");
      return;
    }

    await supabase.functions.invoke("send-welcome-email", {
      body: { email: nlEmail, unsubscribeToken: data.unsubscribe_token },
    });

    setNlStatus("success");
    setNlEmail("");
  };

  const quickActions = [
    { icon: UserPlus, title: "Adhérer", desc: "Générer le bulletin officiel pré-rempli", href: "/adhesion", accent: "bg-red-50 text-red-600" },
    { icon: Shield, title: "Vos droits", desc: "Comprendre vos droits au travail", href: "/vos-droits", accent: "bg-teal-50 text-teal-600" },
    { icon: MessageSquare, title: "Mes demandes", desc: "Transmettre un bulletin ou suivre un dossier", href: "/mes-reclamations", accent: "bg-red-50 text-red-600" },
    { icon: Calendar, title: "Agenda", desc: "Voir les événements et temps forts", href: "/agenda", accent: "bg-teal-50 text-teal-600" },
    { icon: FolderOpen, title: "Documents utiles", desc: "Modèles, accords et ressources", href: "/documents-utiles", accent: "bg-red-50 text-red-600" },
    { icon: Newspaper, title: "Actualités", desc: "Suivre les dernières publications", href: "/actualites", accent: "bg-teal-50 text-teal-600" },
  ];

  const focusCards = [
    {
      icon: Handshake,
      title: "NAO 2026",
      desc: "Suivez les revendications, propositions de la Direction et positions FO COM.",
      href: "/nao2026",
      label: "Négociations",
    },
    {
      icon: Trophy,
      title: "Après les élections",
      desc: "Merci pour votre mobilisation. Retrouvez les informations et suites du scrutin CSE.",
      href: "/elections",
      label: "CSE 2026",
    },
    {
      icon: Scale,
      title: "Assistant juridique",
      desc: "Obtenez une première orientation sur vos droits avec l’outil interne du site.",
      href: "/vos-droits",
      label: "Vos droits",
    },
  ];

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 p-3 sm:p-4 lg:p-8">
      <section className="relative mb-6 overflow-hidden rounded-3xl bg-slate-950 shadow-xl">
        <img src={HERO_IMAGE} alt="FO COM UES ILIAD" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/90 to-red-950/75" />
        <div className="relative grid gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-12 lg:py-14">
          <div className="flex flex-col justify-center">
            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white/85 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-red-300" /> Notre force, vos droits
            </div>
            <h1 className="max-w-3xl text-3xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              {heroTitle}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-lg">
              {heroSubtitle}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button onClick={() => navigate("/adhesion")} className="bg-red-600 px-6 py-3 text-white hover:bg-red-700">
                <UserPlus className="mr-2 h-4 w-4" /> Adhérer maintenant
              </Button>
              <Button onClick={() => navigate("/vos-droits")} variant="outline" className="border-white/30 bg-white/10 px-6 py-3 text-white backdrop-blur hover:bg-white/20">
                <Shield className="mr-2 h-4 w-4" /> Consulter mes droits
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              { icon: CheckCircle2, title: "Élections terminées", text: "Place au suivi, au bilan et au rapport de force." },
              { icon: Handshake, title: "NAO 2026", text: "Les négociations restent un enjeu prioritaire." },
              { icon: MessageSquare, title: "Accompagnement", text: "Une demande, une question, un bulletin à transmettre : FO COM répond présent." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/10 p-4 text-white shadow-lg backdrop-blur">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                  <item.icon className="h-5 w-5" />
                </div>
                <p className="font-bold">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/75">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-6 rounded-2xl border border-teal-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-slate-900">Élections CSE 2026 : scrutin terminé</p>
              <p className="mt-1 text-sm text-slate-500">
                L’appel au vote est retiré. L’accueil met désormais en avant le suivi du mandat, les droits, l’adhésion et vos demandes.
              </p>
            </div>
          </div>
          <Button asChild variant="outline" className="w-full border-teal-200 text-teal-700 hover:bg-teal-50 sm:w-auto">
            <Link to="/elections">Voir la page élections <ChevronRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <section className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((item) => (
          <Link key={item.title} to={item.href} className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md">
            <div className="flex items-start gap-3">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${item.accent}`}>
                <item.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 group-hover:text-red-600">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.desc}</p>
              </div>
              <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-slate-300 group-hover:text-red-500" />
            </div>
          </Link>
        ))}
      </section>

      <section className="mb-8 grid gap-5 lg:grid-cols-3">
        {focusCards.map((card) => (
          <Link key={card.title} to={card.href} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <div className="h-1.5 bg-gradient-to-r from-red-600 to-teal-500" />
            <div className="p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <card.icon className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">{card.label}</span>
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 group-hover:text-red-600">{card.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{card.desc}</p>
              <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-teal-700">
                Accéder <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </Link>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Actualités & priorités</h2>
                <p className="text-sm text-slate-500">Les sujets à suivre maintenant.</p>
              </div>
              <Link to="/actualites" className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700">
                Voir toutes les actualités <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {[
                { title: "NAO 2026 UES ILIAD : propositions insuffisantes face aux attentes des salariés", category: "Négociations", href: "/nao2026" },
                { title: "Arrêts maladie : la suspicion plutôt que la prévention", category: "Vos droits", href: "/actualites" },
                { title: "GEPP : comprendre l’accord et ses impacts", category: "Emploi", href: "/accords/gepp" },
              ].map((article) => (
                <Link key={article.title} to={article.href} className="flex items-center gap-4 rounded-xl border border-slate-100 p-3 transition-colors hover:bg-slate-50">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-bold text-slate-900">{article.title}</p>
                    <p className="mt-1 text-xs font-medium text-teal-600">{article.category}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Espace salariés & adhérents</h2>
                <p className="mt-1 text-sm text-slate-500">Des outils utiles pour agir rapidement.</p>
              </div>
              <Users className="h-6 w-6 text-teal-600" />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: ClipboardList, title: "Faire une demande", href: "/mes-reclamations" },
                { icon: Calendar, title: "Prendre RDV", href: "/permanences" },
                { icon: HelpCircle, title: "FAQ", href: "/faq" },
                { icon: Mail, title: "Nous contacter", href: "/contact" },
                { icon: Lock, title: "Espace adhérent", href: "/profil" },
                { icon: Award, title: "Adhérer", href: "/adhesion" },
              ].map((item) => (
                <Link key={item.title} to={item.href} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 text-sm font-semibold text-slate-700 transition-colors hover:border-red-100 hover:bg-red-50 hover:text-red-700">
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.title}
                </Link>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-base font-extrabold text-slate-900">Bilan de mandat 2022–2026</h2>
              <Link to="/bilan-mandat" className="text-xs font-bold text-red-600">Voir</Link>
            </div>
            <p className="mb-5 text-xs leading-relaxed text-slate-500">Un mandat d’actions, de présence terrain et de défense collective.</p>
            <div className="mb-6 grid grid-cols-2 gap-3">
              {[
                { value: 42, label: "Accords", suffix: "", icon: CheckCircle2 },
                { value: 78, label: "Réunions", suffix: "", icon: Users },
                { value: 126, label: "Dossiers", suffix: "", icon: FileText },
                { value: 100, label: "Présence", suffix: "%", icon: TrendingUp },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl bg-slate-50 p-3 text-center">
                  <stat.icon className="mx-auto mb-2 h-4 w-4 text-teal-600" />
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  <p className="mt-1 text-[10px] text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <ProgressBar label="Pouvoir d’achat" value={85} />
              <ProgressBar label="Conditions de travail" value={90} />
              <ProgressBar label="Égalité professionnelle" value={75} />
              <ProgressBar label="Gestion des emplois" value={80} />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-4 text-base font-extrabold text-slate-900">Nos combats, vos droits</h2>
            <div className="space-y-4">
              {[
                { icon: Shield, title: "Défendre", items: ["Respect des accords", "Santé & sécurité", "Droit à la déconnexion"] },
                { icon: Handshake, title: "Négocier", items: ["Salaires & primes", "Télétravail", "Formation"] },
                { icon: Heart, title: "Agir ensemble", items: ["Écoute", "Mobilisation", "Informations régulières"] },
              ].map((block) => (
                <div key={block.title}>
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                      <block.icon className="h-4 w-4" />
                    </div>
                    <p className="font-bold text-slate-900">{block.title}</p>
                  </div>
                  <ul className="ml-10 space-y-1 text-xs text-slate-600">
                    {block.items.map((item) => <li key={item}>• {item}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <div className="rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 p-6 text-white shadow-lg">
            <img loading="lazy" src={SOLIDARITY_IMAGE} alt="Solidarité" className="mb-3 h-16 w-16 rounded-xl object-cover" />
            <h2 className="font-bold">Notre engagement</h2>
            <p className="mt-2 text-xs leading-relaxed text-teal-100">Transparence, écoute et action : notre priorité, c’est vous.</p>
          </div>
        </div>
      </div>

      <section className="relative mt-8 overflow-hidden rounded-2xl bg-gradient-to-r from-slate-800 to-slate-950 p-5 shadow-lg sm:p-8">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full border-[40px] border-white" />
          <div className="absolute -left-8 -bottom-8 h-48 w-48 rounded-full border-[24px] border-white" />
        </div>
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-600">
            <Bell className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">Restez informé avec notre newsletter</h2>
            <p className="mt-1 text-sm text-slate-400">Recevez nos actualités, droits et informations syndicales directement par email.</p>
          </div>
          <div className="w-full lg:w-auto">
            {nlStatus === "success" ? (
              <div className="flex items-center gap-2 text-sm font-semibold text-teal-300">
                <CheckCircle2 className="h-5 w-5" /> Inscription confirmée !
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2 sm:flex-row">
                <Input
                  type="email"
                  required
                  placeholder="votre@email.fr"
                  value={nlEmail}
                  onChange={(e) => { setNlEmail(e.target.value); setNlStatus("idle"); }}
                  className="w-full border-white/20 bg-white/10 text-white placeholder:text-slate-400 focus-visible:ring-red-500 sm:w-64"
                />
                <Button type="submit" disabled={nlStatus === "loading"} className="bg-red-600 font-semibold text-white hover:bg-red-700">
                  {nlStatus === "loading" ? "..." : "S’abonner"}
                </Button>
              </form>
            )}
            {nlStatus === "duplicate" && <p className="mt-2 text-xs text-amber-300">Cette adresse est déjà abonnée.</p>}
            {nlStatus === "error" && <p className="mt-2 text-xs text-red-300">Une erreur est survenue, veuillez réessayer.</p>}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50"><HelpCircle className="h-5 w-5 text-teal-600" /></div>
            <div><p className="text-sm font-semibold text-slate-900">Une question ?</p><p className="text-xs text-slate-500">Les élus FO COM sont à votre écoute.</p></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50"><Phone className="h-5 w-5 text-red-600" /></div>
            <div><p className="text-sm font-semibold text-slate-900">01 87 15 43 11</p><p className="text-xs text-slate-500">Appel non surtaxé</p></div>
          </div>
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50"><Mail className="h-5 w-5 text-red-600" /></div>
            <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">contact@focomues-iliad.fr</p><p className="text-xs text-slate-500">Nous vous répondons rapidement</p></div>
          </div>
        </div>
      </section>

      <footer className="mt-8 border-t border-slate-200 py-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-center text-xs text-slate-500 sm:text-left">© 2026 FO COM UES ILIAD – Tous droits réservés</p>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-500">
            <Link to="/mentions-legales" className="hover:text-red-600">Mentions légales</Link>
            <Link to="/rgpd" className="hover:text-red-600">RGPD</Link>
            <Link to="/contact" className="hover:text-red-600">Contact</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
