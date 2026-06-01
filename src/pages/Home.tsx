import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Award,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Download,
  Eye,
  FileText,
  FolderOpen,
  Handshake,
  Heart,
  HelpCircle,
  Lock,
  Mail,
  MessageSquare,
  Newspaper,
  PenLine,
  Phone,
  Scale,
  Send,
  Shield,
  Sparkles,
  Trophy,
  UserPlus,
  Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const HERO_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663612648040/CNuRjrgGqWcQ7xt7rtMbHT/hero-banner-VHxfVX6tjRfujGise9ibwf.webp";
const SOLIDARITY_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663612648040/CNuRjrgGqWcQ7xt7rtMbHT/solidarity-icon-GxfeM5FU9pzPmnbJUShvCH.webp";

const DEFAULT_HERO_TITLE = "Informer. Défendre. Agir ensemble.";
const DEFAULT_HERO_SUBTITLE = "FO COM UES ILIAD accompagne les salariés du groupe : droits, adhésion, demandes, documents utiles et actualités sociales.";

const HERO_REPRESENTATIVES = [
  {
    name: "N'deye Yacine SIDIBÉ",
    photo: "/candidats/nysidibe.webp",
    job: "Assistante Administrative • Opérations Réseau - FREE RÉSEAU",
    role: "Secrétaire Syndicat - Élue titulaire du CSE - Déléguée Syndicale",
  },
  {
    name: "Mounir ZERARKA",
    photo: "/candidats/mzerarka.webp",
    job: "CDT Free Mobile",
    role: "Élu Titulaire du CSE - Délégué Syndical",
  },
  {
    name: "Anthony LAVILLE",
    photo: "/candidats/alaville.webp",
    job: "TMF - FREE RÉSEAU",
    role: "Délégué Syndical",
  },
  {
    name: "Fabien RACAULT",
    photo: "/candidats/fracault.webp",
    job: "TMF - ROF",
    role: "Élu Titulaire du CSE - Délégué Syndical",
  },
  {
    name: "Didier BROU",
    photo: "/candidats/dbrou.webp",
    job: "CIR FREE RÉSEAU",
    role: "Représentant Syndical",
  },
  {
    name: "Fadil KENDIRA",
    photo: "/candidats/fkendira.webp",
    job: "TMRE FREE RÉSEAU",
    role: "Élu Titulaire du CSE - Délégué Syndical",
  },
];

const HERO_SUPPORT_ADVISORS = {
  title: "Conseillers & soutien terrain",
  names: "Aurélien & Awa",
  photo: "/candidats/aurelien_awa.webp",
  description: "Élus Titulaires du CSE",
};

type LatestArticle = {
  id: string;
  title: string | null;
  slug: string | null;
  excerpt: string | null;
  content: string | null;
  category: string | null;
  published_at: string | null;
  created_at: string | null;
};

const categoryLabels: Record<string, string> = {
  actualite: "Actualité",
  communique: "Communiqué",
  evenement: "Événement",
  victoire: "Victoire syndicale",
};

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
const formatDate = (dateString: string | null) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
};

const ProgressBar = ({ label, value }: { label: string; value: number }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between gap-3 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <span className="font-semibold text-slate-500">{value}%</span>
    </div>
    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
      <div className="h-full rounded-full bg-teal-500" style={{ width: `${value}%` }} />
    </div>
  </div>
);

export default function Home() {
  const navigate = useNavigate();
  const [heroTitle, setHeroTitle] = useState(DEFAULT_HERO_TITLE);
  const [heroSubtitle, setHeroSubtitle] = useState(DEFAULT_HERO_SUBTITLE);
  const [latestArticles, setLatestArticles] = useState<LatestArticle[]>([]);
  const [nlEmail, setNlEmail] = useState("");
  const [nlStatus, setNlStatus] = useState<"idle" | "loading" | "success" | "error" | "duplicate">("idle");

  useEffect(() => {
    supabase
      .from("site_content")
      .select("value")
      .eq("key", "home_hero")
      .maybeSingle()
      .then(({ data }) => {
        if (!data?.value) return;
        try {
          const parsed = JSON.parse(data.value);
          if (parsed.title) setHeroTitle(parsed.title);
          if (parsed.subtitle) setHeroSubtitle(parsed.subtitle);
        } catch {
          // valeurs par défaut
        }
      });

    supabase
      .from("articles")
      .select("id,title,slug,excerpt,content,category,published_at,created_at")
      .eq("is_published", true)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(3)
      .then(({ data, error }) => {
        if (!error && data) setLatestArticles(data as LatestArticle[]);
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

  const journeyCards = [
    {
      title: "Je veux adhérer",
      description: "Un parcours simple pour remplir, signer et transmettre votre bulletin officiel.",
      href: "/adhesion",
      color: "from-red-600 to-red-700",
      steps: [
        { icon: PenLine, label: "Remplir le formulaire" },
        { icon: Download, label: "Télécharger le PDF" },
        { icon: Send, label: "Transmettre via Mes demandes" },
      ],
    },
    {
      title: "J’ai une question ou un dossier",
      description: "Consultez vos droits, préparez votre demande et échangez avec FO COM.",
      href: "/mes-reclamations",
      color: "from-teal-600 to-cyan-700",
      steps: [
        { icon: Scale, label: "Comprendre mes droits" },
        { icon: ClipboardList, label: "Créer une demande" },
        { icon: MessageSquare, label: "Suivre les échanges" },
      ],
    },
  ];

  const focusCards = [
    { icon: Handshake, title: "NAO 2026", desc: "Propositions finales Direction, position FO et refus de signature.", href: "/nao2026", label: "Négociations" },
    { icon: Trophy, title: "Résultats CSE 2026", desc: "Retrouvez les résultats définitifs et vos élus FO COM.", href: "/elections", label: "CSE 2026" },
    { icon: Users, title: "Le syndicat", desc: "Représentants, histoire, présence terrain et contacts FO COM.", href: "/le-syndicat", label: "FO COM" },
  ];

  const fallbackArticles = [
    { title: "NAO 2026 UES ILIAD : propositions insuffisantes face aux attentes des salariés", category: "Négociations", href: "/nao2026", date: "" },
    { title: "Élections CSE 2026 : FO COM 1ère force syndicale", category: "CSE", href: "/elections", date: "" },
    { title: "Bilan CSE 2022–2026 : un mandat d’actions concrètes", category: "Bilan", href: "/bilan-mandat", date: "" },
  ];

  const articlesToDisplay = latestArticles.length > 0
    ? latestArticles.map((article) => ({
        title: article.title || "Actualité FO COM",
        category: article.category ? categoryLabels[article.category] || article.category : "Actualité",
        href: article.slug ? `/actualites/${article.slug}` : "/actualites",
        date: formatDate(article.published_at || article.created_at),
        excerpt: article.excerpt || (article.content ? stripHtml(article.content).slice(0, 120) : ""),
      }))
    : fallbackArticles;

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 p-3 sm:p-4 lg:p-8">
      <section className="relative mb-6 overflow-hidden rounded-3xl bg-[#13233A] shadow-xl">
        <img src={HERO_IMAGE} alt="FO COM UES ILIAD" className="absolute inset-0 h-full w-full object-cover opacity-22" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#13233A] via-[#13233A]/95 to-red-950/75" />
        <div className="relative grid gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-12 lg:py-14">
          <div className="flex flex-col justify-center">
            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white/85 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-red-300" /> Notre force, vos droits
            </div>
            <h1 className="max-w-3xl text-3xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">{heroTitle}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-lg">{heroSubtitle}</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button onClick={() => navigate("/adhesion")} className="bg-red-600 px-6 py-3 text-white hover:bg-red-700"><UserPlus className="mr-2 h-4 w-4" /> Adhérer maintenant</Button>
              <Button onClick={() => navigate("/mes-reclamations")} variant="outline" className="border-white/30 bg-white/10 px-6 py-3 text-white backdrop-blur hover:bg-white/20"><MessageSquare className="mr-2 h-4 w-4" /> Faire une demande</Button>
              <Button onClick={() => navigate("/vos-droits")} variant="outline" className="border-teal-300/40 bg-teal-500/10 px-6 py-3 text-white backdrop-blur hover:bg-teal-500/20"><Shield className="mr-2 h-4 w-4" /> Mes droits</Button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-4 text-white shadow-2xl backdrop-blur-md">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-red-500/25 blur-2xl" />
            <div className="absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-teal-400/20 blur-2xl" />
            <div className="relative">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-red-100">FO COM UES ILIAD</p>
                  <h2 className="mt-1 text-xl font-extrabold">Une équipe de terrain à vos côtés</h2>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                  <Users className="h-6 w-6" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {HERO_REPRESENTATIVES.map((person) => (
                  <button
                    key={person.name}
                    type="button"
                    className="group relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-white/10 text-left shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
                    aria-label={`${person.name}, ${person.job}, ${person.role}`}
                  >
                    <img src={person.photo} alt={person.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 group-focus:scale-105" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-2 transition-opacity duration-300 group-hover:opacity-0 group-focus:opacity-0">
                      <p className="line-clamp-2 text-[10px] font-bold leading-tight text-white">{person.name}</p>
                    </div>
                    <div className="absolute inset-0 flex translate-y-3 flex-col justify-end bg-gradient-to-t from-black/95 via-black/70 to-black/10 p-2.5 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus:translate-y-0 group-focus:opacity-100">
                      <p className="text-[11px] font-black leading-tight text-white">{person.name}</p>
                      <p className="mt-1 text-[10px] font-semibold leading-tight text-teal-100">{person.job}</p>
                      <p className="mt-1 line-clamp-3 text-[9px] leading-tight text-white/75">{person.role}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-2.5 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:h-20 sm:w-32">
                    <img
                      src={HERO_SUPPORT_ADVISORS.photo}
                      alt={HERO_SUPPORT_ADVISORS.names}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wider text-teal-100">{HERO_SUPPORT_ADVISORS.title}</p>
                    <p className="mt-1 text-sm font-extrabold leading-tight text-white">{HERO_SUPPORT_ADVISORS.names}</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-white/65">{HERO_SUPPORT_ADVISORS.description}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { icon: CheckCircle2, title: "FO 1ère force", text: "CSE 2026" },
                  { icon: Handshake, title: "NAO 2026", text: "FO mobilisé" },
                  { icon: MessageSquare, title: "Accompagnement", text: "Vos dossiers" },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl border border-white/10 bg-black/15 p-3 text-center backdrop-blur">
                    <item.icon className="mx-auto mb-2 h-4 w-4 text-red-200" />
                    <p className="text-[11px] font-extrabold leading-tight">{item.title}</p>
                    <p className="mt-1 text-[10px] text-white/65">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-6 rounded-2xl border border-teal-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600"><Trophy className="h-5 w-5" /></div>
            <div>
              <p className="text-sm font-extrabold text-slate-900">Élections CSE 2026 : FO COM 1ère force syndicale</p>
              <p className="mt-1 text-sm text-slate-500">Le scrutin est terminé. Retrouvez les résultats définitifs, les élus et les suites du mandat.</p>
            </div>
          </div>
          <Button asChild variant="outline" className="w-full border-teal-200 text-teal-700 hover:bg-teal-50 sm:w-auto"><Link to="/elections">Voir les résultats <ChevronRight className="ml-1 h-4 w-4" /></Link></Button>
        </div>
      </section>

      <section className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((item) => (
          <Link key={item.title} to={item.href} className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md">
            <div className="flex items-start gap-3">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${item.accent}`}><item.icon className="h-5 w-5" /></div>
              <div className="min-w-0"><p className="font-bold text-slate-900 group-hover:text-red-600">{item.title}</p><p className="mt-1 text-xs leading-relaxed text-slate-500">{item.desc}</p></div>
              <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-slate-300 group-hover:text-red-500" />
            </div>
          </Link>
        ))}
      </section>

      <section className="mb-8 grid gap-5 lg:grid-cols-2">
        {journeyCards.map((journey) => (
          <Link key={journey.title} to={journey.href} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <div className={`h-2 bg-gradient-to-r ${journey.color}`} />
            <div className="p-5 sm:p-6">
              <div className="mb-4 flex items-start justify-between gap-3"><div><h2 className="text-xl font-extrabold text-slate-900 group-hover:text-red-600">{journey.title}</h2><p className="mt-1 text-sm leading-relaxed text-slate-500">{journey.description}</p></div><ChevronRight className="h-5 w-5 shrink-0 text-slate-300 group-hover:text-red-500" /></div>
              <div className="grid gap-2 sm:grid-cols-3">
                {journey.steps.map((step, index) => <div key={step.label} className="rounded-2xl bg-slate-50 p-3"><div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm"><step.icon className="h-4 w-4" /></div><p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Étape {index + 1}</p><p className="mt-1 text-xs font-semibold text-slate-700">{step.label}</p></div>)}
              </div>
            </div>
          </Link>
        ))}
      </section>

      <section className="mb-8 grid gap-5 lg:grid-cols-3">
        {focusCards.map((card) => (
          <Link key={card.title} to={card.href} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <div className="h-1.5 bg-gradient-to-r from-red-600 to-teal-500" />
            <div className="p-5"><div className="mb-4 flex items-center justify-between gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700"><card.icon className="h-5 w-5" /></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">{card.label}</span></div><h2 className="text-lg font-extrabold text-slate-900 group-hover:text-red-600">{card.title}</h2><p className="mt-2 text-sm leading-relaxed text-slate-500">{card.desc}</p><div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-teal-700">Accéder <ChevronRight className="h-4 w-4" /></div></div>
          </Link>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-extrabold text-slate-900">Actualités récentes</h2><p className="text-sm text-slate-500">Les dernières publications FO COM.</p></div><Link to="/actualites" className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700">Voir toutes les actualités <ChevronRight className="h-4 w-4" /></Link></div>
            <div className="space-y-3">
              {articlesToDisplay.map((article) => (
                <Link key={article.title} to={article.href} className="flex items-center gap-4 rounded-xl border border-slate-100 p-3 transition-colors hover:bg-slate-50">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600"><FileText className="h-5 w-5" /></div>
                  <div className="min-w-0 flex-1"><p className="line-clamp-2 text-sm font-bold text-slate-900">{article.title}</p>{"excerpt" in article && article.excerpt && <p className="mt-1 line-clamp-1 text-xs text-slate-500">{article.excerpt}</p>}<p className="mt-1 text-xs font-medium text-teal-600">{article.category}{article.date ? ` · ${article.date}` : ""}</p></div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4"><div><h2 className="text-xl font-extrabold text-slate-900">Espace salariés & adhérents</h2><p className="mt-1 text-sm text-slate-500">Des outils utiles pour agir rapidement.</p></div><Users className="h-6 w-6 text-teal-600" /></div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: ClipboardList, title: "Faire une demande", href: "/mes-reclamations" },
                { icon: Calendar, title: "Prendre RDV", href: "/permanences" },
                { icon: HelpCircle, title: "FAQ", href: "/faq" },
                { icon: Mail, title: "Nous contacter", href: "/contact" },
                { icon: Lock, title: "Espace adhérent", href: "/profil" },
                { icon: Award, title: "Adhérer", href: "/adhesion" },
              ].map((item) => <Link key={item.title} to={item.href} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 text-sm font-semibold text-slate-700 transition-colors hover:border-red-100 hover:bg-red-50 hover:text-red-700"><item.icon className="h-4 w-4 shrink-0" />{item.title}</Link>)}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-base font-extrabold text-slate-900">Nos actions concrètes</h2><Link to="/bilan-mandat" className="text-xs font-bold text-red-600">Bilan</Link></div>
            <p className="mb-5 text-xs leading-relaxed text-slate-500">Un mandat d’actions, de présence terrain et de défense collective.</p>
            <div className="mb-6 grid grid-cols-2 gap-3">
              {[
                { value: "745+", label: "Réclamations", icon: FileText },
                { value: "164", label: "Consultations", icon: Users },
                { value: "8", label: "Accords", icon: CheckCircle2 },
                { value: "18", label: "Expertises", icon: Eye },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl bg-slate-50 p-3 text-center"><stat.icon className="mx-auto mb-2 h-4 w-4 text-teal-600" /><div className="text-3xl font-extrabold text-red-600">{stat.value}</div><p className="mt-1 text-[10px] text-slate-500">{stat.label}</p></div>
              ))}
            </div>
            <div className="space-y-3">
              <ProgressBar label="Santé / sécurité / RPS" value={92} />
              <ProgressBar label="Pouvoir d’achat" value={85} />
              <ProgressBar label="Conditions de travail" value={90} />
              <ProgressBar label="Dialogue social" value={80} />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-4 text-base font-extrabold text-slate-900">Nos combats, vos droits</h2>
            <div className="space-y-4">
              {[
                { icon: Shield, title: "Défendre", items: ["Respect des accords", "Santé & sécurité", "RPS"] },
                { icon: Handshake, title: "Négocier", items: ["Salaires & primes", "Astreintes", "Temps de travail"] },
                { icon: Heart, title: "Agir ensemble", items: ["Réclamations", "Expertises", "Mobilisations"] },
              ].map((block) => <div key={block.title}><div className="mb-2 flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600"><block.icon className="h-4 w-4" /></div><p className="font-bold text-slate-900">{block.title}</p></div><ul className="ml-10 space-y-1 text-xs text-slate-600">{block.items.map((item) => <li key={item}>• {item}</li>)}</ul></div>)}
            </div>
          </section>

          <div className="rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 p-6 text-white shadow-lg"><img loading="lazy" src={SOLIDARITY_IMAGE} alt="Solidarité" className="mb-3 h-16 w-16 rounded-xl object-cover" /><h2 className="font-bold">Notre engagement</h2><p className="mt-2 text-xs leading-relaxed text-teal-100">Transparence, écoute et action : notre priorité, c’est vous.</p></div>
        </div>
      </div>

      <section className="relative mt-8 overflow-hidden rounded-2xl bg-gradient-to-r from-slate-800 to-slate-950 p-5 shadow-lg sm:p-8">
        <div className="pointer-events-none absolute inset-0 opacity-10"><div className="absolute -right-16 -top-16 h-64 w-64 rounded-full border-[40px] border-white" /><div className="absolute -left-8 -bottom-8 h-48 w-48 rounded-full border-[24px] border-white" /></div>
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-600"><Bell className="h-6 w-6 text-white" /></div>
          <div className="flex-1"><h2 className="text-lg font-bold text-white">Recevez les infos FO COM directement par email</h2><p className="mt-1 text-sm text-slate-400">NAO, droits, accords, alertes sociales et documents utiles.</p></div>
          <div className="w-full lg:w-auto">
            {nlStatus === "success" ? <div className="flex items-center gap-2 text-sm font-semibold text-teal-300"><CheckCircle2 className="h-5 w-5" /> Inscription confirmée !</div> : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2 sm:flex-row"><Input type="email" required placeholder="votre@email.fr" value={nlEmail} onChange={(e) => { setNlEmail(e.target.value); setNlStatus("idle"); }} className="w-full border-white/20 bg-white/10 text-white placeholder:text-slate-400 focus-visible:ring-red-500 sm:w-64" /><Button type="submit" disabled={nlStatus === "loading"} className="bg-red-600 font-semibold text-white hover:bg-red-700">{nlStatus === "loading" ? "..." : "Je m’abonne"}</Button></form>
            )}
            {nlStatus === "duplicate" && <p className="mt-2 text-xs text-amber-300">Cette adresse est déjà abonnée.</p>}
            {nlStatus === "error" && <p className="mt-2 text-xs text-red-300">Une erreur est survenue, veuillez réessayer.</p>}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50"><HelpCircle className="h-5 w-5 text-teal-600" /></div><div><p className="text-sm font-semibold text-slate-900">Une question ?</p><p className="text-xs text-slate-500">Les élus FO COM sont à votre écoute.</p></div></div>
          <div className="flex items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50"><Phone className="h-5 w-5 text-red-600" /></div><div><p className="text-sm font-semibold text-slate-900">01 87 15 43 11</p><p className="text-xs text-slate-500">Appel non surtaxé</p></div></div>
          <div className="flex items-center gap-3 min-w-0"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50"><Mail className="h-5 w-5 text-red-600" /></div><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">contact@focomues-iliad.fr</p><p className="text-xs text-slate-500">Nous vous répondons rapidement</p></div></div>
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
