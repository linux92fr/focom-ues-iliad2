import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, CalendarDays, CheckCircle2, ChevronRight, FileText, HeartHandshake,
  Mail, Menu, MessageCircle, Newspaper, Scale, ShieldCheck, UserRoundPlus, Users, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import logoFocom from "@/assets/logo-focom.png";

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
const formatDate = (value: string | null) => value
  ? new Date(value).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
  : "";

const services = [
  { icon: Scale, title: "Vos droits", text: "Des repères pour comprendre vos droits et agir au travail.", href: "/vos-droits", label: "Consulter vos droits" },
  { icon: MessageCircle, title: "Être accompagné", text: "Une question ou une difficulté ? Transmettez votre demande à FO COM.", href: "/mes-reclamations", label: "Faire une demande" },
  { icon: FileText, title: "Documents utiles", text: "Retrouvez les ressources, accords et documents mis à disposition.", href: "/documents-utiles", label: "Accéder aux documents" },
  { icon: CalendarDays, title: "Agenda & permanences", text: "Consultez les rendez-vous et les temps forts à venir.", href: "/agenda", label: "Voir l’agenda" },
];

export default function Home() {
  const [heroTitle, setHeroTitle] = useState("Vos droits, défendus au quotidien sur le terrain.");
  const [heroSubtitle, setHeroSubtitle] = useState("Élus au CSE, nous accompagnons les salariés de Free, Free Mobile, Free Réseau et du groupe : questions de droit, entretiens, conditions de travail.");
  const [articles, setArticles] = useState<LatestArticle[]>([]);
  const [email, setEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "loading" | "success" | "error" | "duplicate">("idle");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.from("site_content").select("value").eq("key", "home_hero").maybeSingle().then(({ data }) => {
      if (!active || !data?.value) return;
      try {
        const parsed = JSON.parse(data.value);
        if (parsed.title) setHeroTitle(parsed.title);
        if (parsed.subtitle) setHeroSubtitle(parsed.subtitle);
      } catch {
        // Le contenu configuré est facultatif : conserver les textes par défaut.
      }
    });
    supabase.from("articles")
      .select("id,title,slug,excerpt,content,category,published_at,created_at")
      .eq("is_published", true)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(3)
      .then(({ data, error }) => {
        if (active && !error && data) setArticles(data as LatestArticle[]);
      });
    return () => { active = false; };
  }, []);

  const subscribe = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;
    setNewsletterStatus("loading");
    const { data, error } = await supabase.from("newsletter_subscribers")
      .insert({ email: email.trim() })
      .select("unsubscribe_token")
      .single();
    if (error) {
      setNewsletterStatus(error.code === "23505" ? "duplicate" : "error");
      return;
    }
    await supabase.functions.invoke("send-welcome-email", {
      body: { email: email.trim(), unsubscribeToken: data.unsubscribe_token },
    });
    setNewsletterStatus("success");
    setEmail("");
  };

  const navLinks = [
    { label: "Le syndicat", href: "/le-syndicat" },
    { label: "Actualités", href: "/actualites" },
    { label: "Vos droits", href: "/vos-droits" },
    { label: "Agenda", href: "/agenda" },
  ];

  const articlesToDisplay = articles.map((article) => ({
    id: article.id,
    title: article.title || "Actualité FO COM",
    category: article.category ? categoryLabels[article.category] || article.category : "Actualité",
    href: article.slug ? `/actualites/${article.slug}` : "/actualites",
    date: formatDate(article.published_at || article.created_at),
    excerpt: article.excerpt || (article.content ? stripHtml(article.content).slice(0, 150) : ""),
  }));

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-slate-50/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
          <Link to="/" aria-label="FO COM UES Iliad, accueil" className="flex shrink-0 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">
            <img src={logoFocom} alt="Logo FO COM" className="h-11 w-11 object-contain" />
            <span className="leading-tight"><span className="block font-display text-lg font-extrabold tracking-tight text-slate-950">FO COM</span><span className="block text-xs font-semibold text-slate-500">UES ILIAD</span></span>
          </Link>
          <nav className="hidden items-center gap-7 md:flex" aria-label="Navigation principale">
            {navLinks.map((item) => <Link key={item.href} to={item.href} className="text-sm font-semibold text-slate-600 transition-colors hover:text-red-600">{item.label}</Link>)}
            <Button asChild className="rounded-xl bg-red-600 font-semibold text-white shadow-sm hover:bg-red-700"><Link to="/adhesion"><UserRoundPlus className="mr-2 h-4 w-4" /> Adhérer</Link></Button>
          </nav>
          <button type="button" className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 md:hidden" aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={mobileOpen} onClick={() => setMobileOpen((open) => !open)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {mobileOpen && <nav className="flex flex-col gap-1 border-t border-slate-200 bg-white px-5 py-3 md:hidden" aria-label="Navigation mobile">
          {navLinks.map((item) => <Link key={item.href} to={item.href} onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">{item.label}</Link>)}
          <Link to="/adhesion" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-bold text-red-600">Adhérer à FO COM</Link>
        </nav>}
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-14 sm:pt-20 lg:grid-cols-[1.35fr_0.85fr] lg:gap-14 lg:pb-24">
        <div>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-teal-600/10 px-3.5 py-2 text-sm font-bold text-teal-800"><ShieldCheck className="h-4 w-4" /> Première organisation de l’UES Iliad</p>
          <h1 className="max-w-3xl font-display text-4xl font-extrabold leading-[1.04] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">{heroTitle}</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">{heroSubtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild className="h-12 rounded-xl bg-red-600 px-5 font-semibold text-white shadow-sm hover:bg-red-700"><Link to="/permanences"><CalendarDays className="mr-2 h-4 w-4" /> Prendre rendez-vous</Link></Button>
            <Button asChild variant="outline" className="h-12 rounded-xl border-slate-300 bg-white px-5 font-semibold text-slate-800 hover:border-teal-600 hover:bg-teal-50"><Link to="/vos-droits"><Scale className="mr-2 h-4 w-4" /> Consulter mes droits</Link></Button>
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
            <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-teal-600" /> À vos côtés sur le terrain</span>
            <span className="inline-flex items-center gap-2"><Users className="h-4 w-4 text-teal-600" /> Une équipe à votre écoute</span>
          </div>
        </div>
        <aside className="relative overflow-hidden rounded-3xl bg-slate-950 p-7 text-white shadow-xl shadow-slate-900/15 sm:p-9">\n          <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663612648040/CNuRjrgGqWcQ7xt7rtMbHT/hero-banner-VHxfVX6tjRfujGise9ibwf.webp" alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-15" />
          <div aria-hidden="true" className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-teal-500/20 blur-3xl" />
          <div aria-hidden="true" className="absolute -bottom-20 -left-12 h-48 w-48 rounded-full bg-red-600/20 blur-3xl" />
          <div className="relative">
            <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/15 text-teal-300"><HeartHandshake className="h-6 w-6" /></div>
            <p className="text-sm font-bold uppercase tracking-[0.15em] text-teal-300">FO COM UES ILIAD</p>
            <h2 className="mt-3 font-display text-2xl font-extrabold leading-tight sm:text-3xl">Informer. Défendre. Agir ensemble.</h2>
            <p className="mt-4 text-sm leading-6 text-slate-300">Vos élus vous accompagnent dans vos démarches, vos questions professionnelles et la défense de vos droits.</p>
            <div className="mt-7 space-y-3">
              <Link to="/mes-reclamations" className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.06] p-3.5 transition-colors hover:bg-white/10"><span className="flex items-center gap-3 text-sm font-semibold"><MessageCircle className="h-4 w-4 text-teal-300" /> Faire une demande</span><ArrowRight className="h-4 w-4 text-slate-400" /></Link>
              <Link to="/le-syndicat" className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.06] p-3.5 transition-colors hover:bg-white/10"><span className="flex items-center gap-3 text-sm font-semibold"><Users className="h-4 w-4 text-teal-300" /> Rencontrer vos représentants</span><ArrowRight className="h-4 w-4 text-slate-400" /></Link>
            </div>
          </div>
        </aside>
      </section>

      <section id="services" className="border-y border-slate-200/80 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-9 max-w-2xl"><p className="text-sm font-extrabold uppercase tracking-[0.16em] text-red-600">Vos droits et services</p><h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">Comment FO COM peut vous aider ?</h2><p className="mt-3 leading-7 text-slate-600">Accédez directement aux ressources et aux démarches utiles dans votre vie professionnelle.</p></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => <Link key={service.href} to={service.href} className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-teal-300 hover:bg-white hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">
              <span className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-white text-teal-700 shadow-sm ring-1 ring-slate-200 transition-colors group-hover:bg-teal-600 group-hover:text-white"><service.icon className="h-5 w-5" /></span>
              <h3 className="font-display text-lg font-extrabold text-slate-950">{service.title}</h3><p className="mt-2 min-h-[4.5rem] text-sm leading-6 text-slate-600">{service.text}</p><span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-red-600">{service.label}<ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
            </Link>)}
          </div>
        </div>
      </section>

      <section id="actualites" className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-extrabold uppercase tracking-[0.16em] text-teal-700">À la une</p><h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">Les dernières actualités</h2><p className="mt-3 text-slate-600">Les publications récentes de FO COM UES ILIAD.</p></div><Link to="/actualites" className="inline-flex w-fit items-center gap-2 text-sm font-bold text-red-600 hover:text-red-700">Toutes les actualités <ArrowRight className="h-4 w-4" /></Link></div>
        {articlesToDisplay.length > 0 ? <div className="grid gap-5 md:grid-cols-3">
          {articlesToDisplay.map((article, index) => <Link key={article.id} to={article.href} className={`group flex min-h-64 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${index === 0 ? "md:border-t-4 md:border-t-red-600" : "md:border-t-4 md:border-t-teal-600"}`}>
            <span className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700"><Newspaper className="h-5 w-5" /></span><p className="text-xs font-bold uppercase tracking-wide text-teal-700">{article.category}{article.date ? ` · ${article.date}` : ""}</p><h3 className="mt-3 font-display text-xl font-extrabold leading-snug text-slate-950 group-hover:text-red-600">{article.title}</h3>{article.excerpt && <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{article.excerpt}</p>}<span className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-bold text-red-600">Lire l’article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
          </Link>)}
        </div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center"><Newspaper className="mx-auto h-8 w-8 text-slate-400" /><p className="mt-3 font-semibold text-slate-800">Les prochaines actualités seront publiées ici.</p><Link to="/actualites" className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-red-600">Consulter les actualités <ArrowRight className="h-4 w-4" /></Link></div>}
      </section>

      <section id="adherer" className="px-5 pb-16">
        <div className="relative mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 overflow-hidden rounded-3xl bg-red-600 p-7 text-white sm:flex-row sm:items-center sm:p-10 lg:p-12">
          <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full border-[35px] border-white/10" />
          <div className="relative"><p className="text-sm font-bold uppercase tracking-[0.16em] text-red-100">Ensemble, plus forts</p><h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Rejoignez FO COM</h2><p className="mt-3 max-w-xl leading-7 text-red-50">Plus nous sommes nombreux, plus nous pouvons porter la voix des salariés et défendre leurs droits.</p></div>
          <Button asChild className="relative h-12 shrink-0 rounded-xl bg-white px-6 font-bold text-red-700 hover:bg-red-50"><Link to="/adhesion"><UserRoundPlus className="mr-2 h-4 w-4" /> Adhérer en ligne</Link></Button>
        </div>
      </section>

      <section className="bg-slate-950 py-12 text-white sm:py-14">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl"><p className="font-display text-xl font-extrabold">Recevez les informations FO COM</p><p className="mt-2 text-sm leading-6 text-slate-300">Actualités, droits, accords et informations sociales directement par e-mail.</p></div>
          <div className="w-full lg:max-w-lg">
            {newsletterStatus === "success" ? <p className="flex items-center gap-2 text-sm font-semibold text-teal-300"><CheckCircle2 className="h-5 w-5" /> Votre demande d’inscription a été enregistrée.</p> : <form onSubmit={subscribe} className="flex flex-col gap-2 sm:flex-row"><Input type="email" required value={email} onChange={(event) => { setEmail(event.target.value); setNewsletterStatus("idle"); }} placeholder="votre@email.fr" aria-label="Adresse e-mail pour la newsletter" className="h-11 border-white/20 bg-white/10 text-white placeholder:text-slate-400 sm:flex-1" /><Button type="submit" disabled={newsletterStatus === "loading"} className="h-11 rounded-lg bg-red-600 font-bold text-white hover:bg-red-700">{newsletterStatus === "loading" ? "Inscription…" : "Je m’abonne"}</Button></form>}
            {newsletterStatus === "duplicate" && <p role="status" className="mt-2 text-xs text-amber-300">Cette adresse e-mail est déjà inscrite.</p>}
            {newsletterStatus === "error" && <p role="alert" className="mt-2 text-xs text-red-300">L’inscription a échoué. Veuillez réessayer.</p>}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-7 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/" className="font-display font-extrabold text-slate-900">FO COM <span className="font-medium text-slate-500">UES ILIAD</span></Link>
          <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Liens de pied de page"><Link to="/mentions-legales" className="hover:text-red-600">Mentions légales</Link><Link to="/rgpd" className="hover:text-red-600">RGPD</Link><Link to="/contact" className="inline-flex items-center gap-1 hover:text-red-600"><Mail className="h-3.5 w-3.5" /> Contact</Link></nav>
          <span className="text-xs">© 2026 FO COM UES ILIAD</span>
        </div>
      </footer>
    </main>
  );
}
