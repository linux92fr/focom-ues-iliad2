import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HoverCardGrid } from "@/components/HoverCard";
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
  Target,
  Heart,
  Zap,
  BookOpen,
  Globe,
  Vote,
} from "lucide-react";

const HERO_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663612648040/CNuRjrgGqWcQ7xt7rtMbHT/hero-banner-VHxfVX6tjRfujGise9ibwf.webp";
const SOLIDARITY_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663612648040/CNuRjrgGqWcQ7xt7rtMbHT/solidarity-icon-GxfeM5FU9pzPmnbJUShvCH.webp";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1500;
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
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-3xl font-extrabold text-red-600">
      {count}{suffix}
    </div>
  );
}

function ProgressBar({ label, value, color = "bg-teal-500" }: { label: string; value: number; color?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setWidth(value); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-slate-700 font-medium">{label}</span>
        <span className="text-slate-500 font-semibold">{value}%</span>
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();

  return (
    <main className="p-4 lg:p-8 bg-slate-50 min-h-screen">

      {/* Bannière élections */}
      <Link to="/elections" className="block mb-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-700 via-red-600 to-red-700 p-4 sm:p-5 shadow-lg hover:shadow-xl transition-shadow group">
          <div className="pointer-events-none absolute inset-0 opacity-10">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full border-[30px] border-white" />
            <div className="absolute -left-6 -bottom-6 h-32 w-32 rounded-full border-[20px] border-white" />
          </div>
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Vote className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                  </span>
                  <p className="text-white/80 text-xs font-semibold uppercase tracking-widest">En cours · 2ème tour</p>
                </div>
                <p className="text-white font-extrabold text-base sm:text-lg leading-tight">
                  🗳️ Élections CSE 2026 — Votez FO COM UES ILIAD !
                </p>
                <p className="text-red-100 text-xs mt-0.5">Vote électronique du 29 avril au <strong className="text-white">6 mai 2026</strong> · e-votez.net</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:flex-shrink-0">
              <span className="hidden sm:inline-flex items-center gap-1.5 bg-white text-red-700 font-bold text-sm px-4 py-2 rounded-full shadow group-hover:bg-red-50 transition-colors">
                Voir la page élections <ChevronRight className="w-4 h-4" />
              </span>
              <span className="sm:hidden text-white font-bold text-sm flex items-center gap-1">
                En savoir plus <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Hero Banner */}
      <section className="relative rounded-2xl overflow-hidden mb-8 shadow-lg">
        <img src={HERO_IMAGE} alt="FO Com - Ensemble, connectés, plus forts" className="w-full h-64 sm:h-80 lg:h-96 object-cover" />
        <div className="absolute inset-0 bg-slate-900/75" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 sm:p-10 lg:p-14 text-center">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
            Ensemble,<br /><span className="text-teal-300">connectés,</span><br />plus forts.
          </h2>
          <p className="text-white/90 mt-3 text-sm sm:text-base max-w-lg">
            Le syndicat des travailleurs et travailleuses des télécommunications. Notre force, c'est l'union.
          </p>
          <div className="flex gap-3 mt-5">
            <Button onClick={() => navigate("/adhesion")} className="bg-red-600 hover:bg-red-700 text-white rounded-full px-6 py-2.5 text-sm font-semibold shadow-lg">
              Rejoignez-nous
            </Button>
            <Button onClick={() => navigate("/elections")} variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 rounded-full px-6 py-2.5 text-sm font-semibold backdrop-blur-sm">
              Élections 2026
            </Button>
          </div>
        </div>
      </section>

      {/* Hover Cards Section */}
      <section className="mb-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
            Découvrez la <span className="text-teal-600">FOCOM</span>
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">Survolez nos cartes pour découvrir tout ce que nous offrons à nos adhérents</p>
        </div>
        <HoverCardGrid
          columns={3}
          cards={[
            {
              title: "Vos Droits",
              subtitle: "Protection & accompagnement",
              icon: <Shield className="w-6 h-6" />,
              variant: "default" as const,
              content: <p className="text-sm text-slate-600">La FOCOM défend vos droits au quotidien auprès de la direction.</p>,
              revealContent: (
                <ul className="space-y-2">
                  {["Droit à la déconnexion", "Égalité professionnelle", "Santé & sécurité", "Protection sociale"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />{item}
                    </li>
                  ))}
                </ul>
              ),
            },
            {
              title: "Négociations",
              subtitle: "Salaires & conditions",
              icon: <Handshake className="w-6 h-6" />,
              variant: "gradient" as const,
              gradientFrom: "from-red-600",
              gradientTo: "to-red-700",
              content: <p className="text-sm text-white/80">Nous négocions les meilleurs accords pour tous les salariés.</p>,
              revealContent: (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">NAO 2026</span>
                    <span className="text-white font-semibold">En cours</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Accords signés</span>
                    <span className="text-white font-semibold">42</span>
                  </div>
                  <Button onClick={() => navigate("/bilan-mandat")} className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 text-sm">
                    Voir les détails
                  </Button>
                </div>
              ),
            },
            {
              title: "Formation",
              subtitle: "Développement des compétences",
              icon: <BookOpen className="w-6 h-6" />,
              variant: "bordered" as const,
              content: <p className="text-sm text-slate-600">Accédez à des formations professionnelles et syndicales.</p>,
              revealContent: (
                <div className="space-y-2">
                  {["Formations CPF", "Perfectionnement", "Préparation aux élections", "Formation syndicale"].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-700">{item}</span>
                      <ChevronRight className="w-4 h-4 text-teal-600" />
                    </div>
                  ))}
                </div>
              ),
            },
            {
              title: "Élections Professionnelles",
              subtitle: "Votre voix compte",
              icon: <Target className="w-6 h-6" />,
              variant: "image" as const,
              image: "https://images.unsplash.com/photo-1587560699334-cc4ff634909a?w=400&h=300&fit=crop",
              content: <p className="text-sm text-white/80">Votez en masse jusqu'au 6 mai 2026 !</p>,
              revealContent: (
                <div className="space-y-3">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-xs text-white/70 mb-1">Date limite</p>
                    <p className="text-lg font-bold text-white">6 Mai 2026</p>
                  </div>
                  <Button onClick={() => navigate("/elections")} className="w-full bg-red-600 hover:bg-red-700 text-white text-sm">
                    Voir la page élections →
                  </Button>
                </div>
              ),
            },
            {
              title: "Avantages Adhérents",
              subtitle: "Des services exclusifs",
              icon: <Award className="w-6 h-6" />,
              variant: "default" as const,
              content: <p className="text-sm text-slate-600">Découvrez tous les avantages réservés à nos adhérents.</p>,
              revealContent: (
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: <Heart className="w-4 h-4" />, label: "Protection juridique" },
                    { icon: <Zap className="w-4 h-4" />, label: "Assistance rapide" },
                    { icon: <Globe className="w-4 h-4" />, label: "Réseau national" },
                    { icon: <Users className="w-4 h-4" />, label: "Communauté active" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-teal-50 rounded-lg">
                      <span className="text-teal-600">{item.icon}</span>
                      <span className="text-xs text-slate-700">{item.label}</span>
                    </div>
                  ))}
                </div>
              ),
            },
            {
              title: "Actualités",
              subtitle: "Restez informé",
              icon: <FileText className="w-6 h-6" />,
              variant: "gradient" as const,
              gradientFrom: "from-teal-600",
              gradientTo: "to-cyan-600",
              content: <p className="text-sm text-white/80">Suivez les dernières nouvelles et actions de la FOCOM.</p>,
              revealContent: (
                <div className="space-y-2">
                  {[
                    { label: "NAO 2026 : Nos revendications", href: "/nao2026" },
                    { label: "Élections : Votez jusqu'au 6 mai", href: "/elections" },
                    { label: "GEPP : Tout savoir", href: "/accords/gepp" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      onClick={() => navigate(item.href)}
                      className="flex items-center gap-2 p-2 bg-white/10 rounded-lg cursor-pointer hover:bg-white/20 transition-colors"
                    >
                      <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                      <span className="text-sm text-white">{item.label}</span>
                    </div>
                  ))}
                </div>
              ),
            },
          ]}
        />
      </section>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Actualités */}
          <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-slate-900">ACTUALITÉS</h3>
              <Link to="/actualites" className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1">
                Voir toutes les actualités <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-4">
              {[
                {
                  badge: "À LA UNE",
                  title: "Négociation Annuelle Obligatoire 2026 : Nos revendications avancent",
                  date: "29 octobre 2026",
                  category: "Négociations",
                  href: "/nao2026",
                  image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=200&h=150&fit=crop",
                },
                {
                  title: "VOTEZ EN MASSE POUR FO COM JUSQU'AU 6 MAI 2026 ! VOTRE VOIX EST UN ATOUT",
                  date: "29 octobre 2026",
                  category: "Élections",
                  href: "/elections",
                  image: "https://images.unsplash.com/photo-1587560699334-cc4ff634909a?w=200&h=150&fit=crop",
                },
                {
                  title: "GEPP : POUR TOUT SAVOIR",
                  date: "29 octobre 2026",
                  category: "Mobilisation",
                  href: "/accords/gepp",
                  image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200&h=150&fit=crop",
                },
              ].map((article, idx) => (
                <Link
                  key={idx}
                  to={article.href}
                  className="flex gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <img src={article.image} alt={article.title} className="w-24 h-20 object-cover rounded-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    {article.badge && (
                      <span className="inline-block bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full mb-1.5 uppercase tracking-wide">
                        {article.badge}
                      </span>
                    )}
                    <h4 className="font-semibold text-slate-900 text-sm leading-snug group-hover:text-red-600 transition-colors line-clamp-2">
                      {article.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1.5">
                      {article.date} • <span className="text-teal-600 font-medium">{article.category}</span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Espace Adhérent */}
          <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-2">ESPACE ADHÉRENT</h3>
            <p className="text-sm text-slate-500 mb-5">Un espace dédié pour vous informer et vous accompagner</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { icon: FileText, title: "Mes Documents", desc: "Accédez à vos documents et modèles utiles", color: "text-teal-600 bg-teal-50", href: "/documents-utiles" },
                { icon: Users, title: "Mes Avantages", desc: "Découvrez vos avantages adhérents", color: "text-red-600 bg-red-50", href: "/adhesion" },
                { icon: Calendar, title: "Prendre RDV", desc: "Prenez rendez-vous avec un élu FOCOM", color: "text-teal-600 bg-teal-50", href: "/contact" },
                { icon: HelpCircle, title: "Poser une Question", desc: "Une question ? Nous vous répondons", color: "text-red-600 bg-red-50", href: "/faq" },
                { icon: Mail, title: "Vos Contacts", desc: "Trouvez vos interlocuteurs FOCOM", color: "text-teal-600 bg-teal-50", href: "/contact" },
                { icon: Lock, title: "Accès Réservés", desc: "Contenus réservés aux adhérents", color: "text-red-600 bg-red-50", href: "/admin/login" },
              ].map((item, idx) => (
                <Link key={idx} to={item.href} className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all cursor-pointer group text-center">
                  <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center mx-auto mb-2.5`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-semibold text-slate-900 text-xs group-hover:text-teal-600 transition-colors">{item.title}</h4>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                </Link>
              ))}
            </div>
            <Button onClick={() => navigate("/admin/login")} className="w-full mt-5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg py-3 text-sm font-semibold shadow-md shadow-teal-100">
              <Lock className="w-4 h-4 mr-2" />Se connecter à mon espace adhérent
            </Button>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Bilan de Mandat */}
          <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">BILAN DE MANDAT 2022–2026</h3>
              <Link to="/bilan-mandat" className="text-red-600 text-xs font-medium flex items-center gap-0.5">
                Voir <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <p className="text-xs text-slate-500 mb-5">3 années d'actions au service de tous les salariés</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { value: 42, label: "Accords signés", suffix: "", icon: CheckCircle2, color: "bg-teal-50 text-teal-600" },
                { value: 78, label: "Réunions", suffix: "", icon: Users, color: "bg-red-50 text-red-600" },
                { value: 126, label: "Dossiers", suffix: "", icon: FileText, color: "bg-teal-50 text-teal-600" },
                { value: 100, label: "Présents", suffix: "%", icon: TrendingUp, color: "bg-red-50 text-red-600" },
              ].map((stat, idx) => (
                <div key={idx} className="text-center p-3 rounded-xl bg-slate-50">
                  <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center mx-auto mb-2`}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  <p className="text-[10px] text-slate-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
            <h4 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wide">Nos avancées principales</h4>
            <div className="space-y-3">
              <ProgressBar label="Pouvoir d'achat" value={85} />
              <ProgressBar label="Conditions de travail" value={90} />
              <ProgressBar label="Égalité professionnelle" value={75} />
              <ProgressBar label="Gestion des emplois" value={80} />
              <ProgressBar label="Qualité de vie au travail" value={70} color="bg-teal-400" />
            </div>
          </section>

          {/* Nos Combats */}
          <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4">NOS COMBATS, VOS DROITS</h3>
            <p className="text-xs text-slate-500 mb-4">La FOCOM agit chaque jour pour défendre vos droits</p>
            <div className="space-y-4">
              {[
                { icon: Shield, title: "Défendre", color: "text-red-600 bg-red-50", items: ["Respect des accords", "Égalité & non-discrimination", "Santé & sécurité", "Droit à la déconnexion"] },
                { icon: Handshake, title: "Négocier", color: "text-teal-600 bg-teal-50", items: ["Salaires & primes", "Télétravail", "Organisation du temps de travail", "Formation"] },
                { icon: Users, title: "Agir ensemble", color: "text-red-600 bg-red-50", items: ["Mobilisations", "Actions collectives", "Écoute & proximité", "Informations régulières"] },
              ].map((s, idx) => (
                <div key={idx}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-7 h-7 rounded-lg ${s.color} flex items-center justify-center`}>
                      <s.icon className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">{s.title}</h4>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1 ml-9">
                    {s.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-slate-400" />{item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Notre engagement */}
          <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl p-6 text-white shadow-lg">
            <img src={SOLIDARITY_IMAGE} alt="Solidarité" className="w-16 h-16 rounded-xl mb-3 object-cover" />
            <h4 className="font-bold text-base">Notre engagement</h4>
            <p className="text-teal-100 text-xs mt-2 leading-relaxed">Transparence, écoute et action : notre priorité, c'est vous.</p>
          </div>
        </div>
      </div>

      {/* Footer Contact Bar */}
      <section className="mt-8 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0">
              <HelpCircle className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-900">Une question ? Besoin d'aide ?</p>
              <p className="text-xs text-slate-500">Les élus FOCOM sont à votre écoute.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-900">01 87 15 43 11</p>
              <p className="text-xs text-slate-500">Appel non surtaxé</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-900">contact@focomues-iliad.fr</p>
              <p className="text-xs text-slate-500">Nous vous répondons rapidement</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-8 py-6 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <p className="text-xs text-slate-500">© 2026 FOCOM UES ILIAD – Tous droits réservés</p>
            <span className="hidden sm:inline text-slate-300">|</span>
            <div className="flex items-center gap-4">
              <Link to="/mentions-legales" className="text-xs text-slate-400 hover:text-slate-700 transition-colors underline-offset-2 hover:underline">
                Mentions légales
              </Link>
              <Link to="/rgpd" className="text-xs text-slate-400 hover:text-slate-700 transition-colors underline-offset-2 hover:underline">
                Politique de confidentialité (RGPD)
              </Link>
            </div>
          </div>
          <Link to="/contact">
            <Button variant="outline" className="rounded-full text-sm border-red-200 text-red-600 hover:bg-red-50 px-5">
              Nous contacter <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </footer>
    </main>
  );
}
