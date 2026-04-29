import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Home as HomeIcon,
  FileText,
  BarChart3,
  Users,
  Shield,
  HelpCircle,
  MessageSquare,
  Lock,
  Search,
  Phone,
  Mail,
  ChevronRight,
  Menu,
  X,
  Facebook,
  Linkedin,
  Twitter,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Handshake,
} from "lucide-react";

const HERO_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663612648040/CNuRjrgGqWcQ7xt7rtMbHT/hero-banner-VHxfVX6tjRfujGise9ibwf.webp";
const LOGO_IMAGE = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663612648040/LldXxCbhFdcPcHwX.png";
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
          let start = 0;
          const duration = 1500;
          const startTime = performance.now();
          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            start = Math.floor(eased * target);
            setCount(start);
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
      ([entry]) => {
        if (entry.isIntersecting) setWidth(value);
      },
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
        <div
          className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("accueil");

  const navItems = [
    { id: "accueil", label: "Tableau de bord", icon: HomeIcon },
    { id: "actualites", label: "Actualités", icon: FileText },
    { id: "bilan", label: "Bilan de Mandat", icon: BarChart3 },
    { id: "espace", label: "Espace Adhérent", icon: Users },
    { id: "droits", label: "Vos Droits", icon: Shield },
    { id: "documents", label: "Documents Utiles", icon: FileText },
    { id: "faq", label: "FAQ", icon: HelpCircle },
    { id: "contact", label: "Nous Contacter", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <img src={LOGO_IMAGE} alt="FO Com" className="h-12 w-12 object-contain" />
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-slate-900 leading-tight">FOCOM UES ILIAD</h1>
                <p className="text-[11px] text-slate-500 font-medium tracking-wide uppercase">Notre Force, Vos Droits</p>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden xl:flex items-center gap-1">
              {["Accueil", "Actualités", "Bilan de Mandat", "Espace Adhérent", "Vos Droits", "La FOCOM", "Contact"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  {item}
                </a>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button className="p-2.5 hover:bg-slate-100 rounded-lg transition-colors">
                <Search className="w-5 h-5 text-slate-500" />
              </button>
              <Button className="bg-red-600 hover:bg-red-700 text-white rounded-full px-5 py-2.5 text-sm font-semibold shadow-md shadow-red-200 hidden sm:flex">
                <Users className="w-4 h-4 mr-2" />
                Nous rejoindre
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex max-w-[1440px] mx-auto">
        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-16 lg:top-18 left-0 z-40 h-[calc(100vh-4rem)] w-64 lg:w-56
          bg-white border-r border-slate-200 overflow-y-auto
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}>
          <div className="p-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeSection === item.id
                    ? "bg-teal-600 text-white shadow-md shadow-teal-200"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Quote */}
          <div className="mx-4 mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-slate-400 text-2xl leading-none mb-2">"</div>
            <p className="text-xs text-slate-600 italic leading-relaxed">
              Seul on va plus vite, ensemble on va plus loin.
            </p>
            <p className="text-xs font-bold text-red-600 mt-2">FOCOM UES ILIAD</p>
          </div>

          {/* Social */}
          <div className="p-4 mt-4 flex gap-2">
            <a href="#" className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
              <Facebook className="w-4 h-4 text-slate-500" />
            </a>
            <a href="#" className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
              <Linkedin className="w-4 h-4 text-slate-500" />
            </a>
            <a href="#" className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
              <Twitter className="w-4 h-4 text-slate-500" />
            </a>
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-4 lg:p-8">
          {/* Hero Banner */}
          <section className="relative rounded-2xl overflow-hidden mb-8 shadow-lg">
            <img
              src={HERO_IMAGE}
              alt="FO Com - Ensemble, connectés, plus forts"
              className="w-full h-64 sm:h-80 lg:h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-900/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center p-6 sm:p-10 lg:p-14">
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight max-w-lg">
                Ensemble,<br />
                <span className="text-teal-300">connectés,</span><br />
                plus forts.
              </h2>
              <p className="text-white/80 mt-3 text-sm sm:text-base max-w-md">
                Le syndicat des travailleurs et travailleuses des télécommunications. Notre force, c'est l'union.
              </p>
              <div className="flex gap-3 mt-5">
                <Button className="bg-red-600 hover:bg-red-700 text-white rounded-full px-6 py-2.5 text-sm font-semibold shadow-lg">
                  Rejoignez-nous
                </Button>
                <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 rounded-full px-6 py-2.5 text-sm font-semibold backdrop-blur-sm">
                  En savoir plus
                </Button>
              </div>
            </div>
          </section>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - 2/3 */}
            <div className="lg:col-span-2 space-y-6">
              {/* Actualités */}
              <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xl font-bold text-slate-900">ACTUALITÉS</h3>
                  <a href="#" className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1">
                    Voir toutes les actualités <ChevronRight className="w-4 h-4" />
                  </a>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      badge: "À LA UNE",
                      title: "Négociation Annuelle Obligatoire 2026 : Nos revendications avancent",
                      date: "29 octobre 2026",
                      category: "Négociations",
                      image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=200&h=150&fit=crop",
                    },
                    {
                      title: "VOTEZ EN MASSE POUR FO COM JUSQU'AU 6 MAI 2026 ! VOTRE VOIX EST UN ATOUT",
                      date: "29 octobre 2026",
                      category: "Elections",
                      image: "https://images.unsplash.com/photo-1587560699334-cc4ff634909a?w=200&h=150&fit=crop",
                    },
                    {
                      title: "GEPP : POUR TOUT SAVOIR",
                      date: "29 octobre 2026",
                      category: "Mobilisation",
                      image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200&h=150&fit=crop",
                    },
                  ].map((article, idx) => (
                    <article
                      key={idx}
                      className="flex gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-24 h-20 object-cover rounded-lg flex-shrink-0"
                      />
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
                    </article>
                  ))}
                </div>
              </section>

              {/* Espace Adhérent */}
              <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-2">ESPACE ADHÉRENT</h3>
                <p className="text-sm text-slate-500 mb-5">Un espace dédié pour vous informer et vous accompagner</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { icon: FileText, title: "Mes Documents", desc: "Accédez à vos documents et modèles utiles", color: "text-teal-600 bg-teal-50" },
                    { icon: Users, title: "Mes Avantages", desc: "Découvrez vos avantages adhérents", color: "text-red-600 bg-red-50" },
                    { icon: Calendar, title: "Prendre RDV", desc: "Prenez rendez-vous avec un élu FOCOM", color: "text-teal-600 bg-teal-50" },
                    { icon: HelpCircle, title: "Poser une Question", desc: "Une question ? Nous vous répondons", color: "text-red-600 bg-red-50" },
                    { icon: Mail, title: "Vos Contacts", desc: "Trouvez vos interlocuteurs FOCOM", color: "text-teal-600 bg-teal-50" },
                    { icon: Lock, title: "Accès Réservés", desc: "Contenus réservés aux adhérents", color: "text-red-600 bg-red-50" },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all cursor-pointer group text-center"
                    >
                      <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center mx-auto mb-2.5`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <h4 className="font-semibold text-slate-900 text-xs group-hover:text-teal-600 transition-colors">{item.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>

                <Button className="w-full mt-5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg py-3 text-sm font-semibold shadow-md shadow-teal-100">
                  <Lock className="w-4 h-4 mr-2" />
                  Se connecter à mon espace adhérent
                </Button>
              </section>
            </div>

            {/* Right Column - 1/3 */}
            <div className="space-y-6">
              {/* Bilan de Mandat */}
              <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-slate-900">BILAN DE MANDAT 2022–2026</h3>
                  <a href="#" className="text-red-600 text-xs font-medium flex items-center gap-0.5">
                    Voir <ChevronRight className="w-3 h-3" />
                  </a>
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

                {/* Progress Bars */}
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
                    {
                      icon: Shield,
                      title: "Défendre",
                      color: "text-red-600 bg-red-50",
                      items: ["Respect des accords", "Égalité & non-discrimination", "Santé & sécurité", "Droit à la déconnexion"],
                    },
                    {
                      icon: Handshake,
                      title: "Négocier",
                      color: "text-teal-600 bg-teal-50",
                      items: ["Salaires & primes", "Télétravail", "Organisation du temps de travail", "Formation"],
                    },
                    {
                      icon: Users,
                      title: "Agir ensemble",
                      color: "text-red-600 bg-red-50",
                      items: ["Mobilisations", "Actions collectives", "Écoute & proximité", "Informations régulières"],
                    },
                  ].map((section, idx) => (
                    <div key={idx}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-7 h-7 rounded-lg ${section.color} flex items-center justify-center`}>
                          <section.icon className="w-3.5 h-3.5" />
                        </div>
                        <h4 className="font-bold text-sm text-slate-900">{section.title}</h4>
                      </div>
                      <ul className="text-xs text-slate-600 space-y-1 ml-9">
                        {section.items.map((item, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-slate-400" />
                            {item}
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
                <p className="text-teal-100 text-xs mt-2 leading-relaxed">
                  Transparence, écoute et action : notre priorité, c'est vous.
                </p>
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
              <p className="text-xs text-slate-500">© 2026 FOCOM UES ILIAD – Tous droits réservés</p>
              <Button variant="outline" className="rounded-full text-sm border-red-200 text-red-600 hover:bg-red-50 px-5">
                Nous contacter <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
