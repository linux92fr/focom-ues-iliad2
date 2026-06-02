import { useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  HelpCircle, Search, ChevronDown, ChevronUp, MessageSquare,
  Mail, UserPlus, Shield, FileText, Trophy, FolderOpen,
  Fingerprint, Mic, Rss, QrCode, Heart, Lock, Users,
} from "lucide-react";

const faqData = [
  {
    category: "Adhésion",
    icon: UserPlus,
    color: "bg-red-50 text-red-600",
    questions: [
      {
        question: "Comment adhérer à FO COM UES ILIAD ?",
        answer: "Depuis la page Adhésion, remplissez le formulaire. Le site génère un bulletin officiel PDF pré-rempli que vous pouvez télécharger, signer puis transmettre à FO COM via Mes demandes ou par email.",
      },
      {
        question: "Le bulletin PDF est-il le document officiel ?",
        answer: "Oui. Le formulaire sert à remplir automatiquement le bulletin officiel. Vous le téléchargez, le signez et l'envoyez. Il constitue votre pièce d'adhésion officielle.",
      },
      {
        question: "Puis-je transmettre mon bulletin via le site ?",
        answer: "Oui. Après téléchargement et signature, utilisez Mes demandes pour l'envoyer directement à FO COM ou contactez un représentant par email.",
      },
      {
        question: "Quand mon compte est-il actif après inscription ?",
        answer: "Après votre première connexion, votre compte est en attente de validation. Un administrateur FO COM examine votre demande et active votre compte (ou vous contacte). Vous recevez une notification dès validation.",
      },
    ],
  },
  {
    category: "Connexion & Sécurité",
    icon: Fingerprint,
    color: "bg-slate-100 text-slate-700",
    questions: [
      {
        question: "Pourquoi n'y a-t-il pas de mot de passe ?",
        answer: "FO COM utilise les passkeys (WebAuthn/FIDO2), le standard de sécurité le plus avancé recommandé par l'ANSSI. Vos données sont protégées par votre empreinte digitale, votre visage ou votre code PIN, sans mot de passe à retenir ou à pirater.",
      },
      {
        question: "Comment me connecter pour la première fois ?",
        answer: "Cliquez sur « Nous rejoindre » puis saisissez votre email. Vous recevrez un lien de connexion sécurisé à usage unique (magic link). Une fois connecté, vous pouvez enregistrer une passkey depuis votre profil pour les prochaines fois.",
      },
      {
        question: "Qu'est-ce qu'une passkey ?",
        answer: "Une passkey est une clé cryptographique liée à votre appareil et déverrouillée par votre biométrie (empreinte, visage) ou votre code PIN. Elle remplace avantageusement le mot de passe : impossible à voler, résistante au phishing, compatible avec tous les navigateurs modernes.",
      },
      {
        question: "Que faire si je change d'appareil ou perds mon téléphone ?",
        answer: "Utilisez le lien de connexion envoyé par email (magic link) pour vous reconnecter sur votre nouvel appareil, puis enregistrez une nouvelle passkey. Vos données et votre compte restent intacts.",
      },
      {
        question: "Mon compte a été refusé, que faire ?",
        answer: "Contactez FO COM via la page Contact en précisant votre email d'inscription. Un administrateur peut revoir votre demande ou vous orienter.",
      },
    ],
  },
  {
    category: "Droits salariés",
    icon: Shield,
    color: "bg-blue-50 text-blue-600",
    questions: [
      {
        question: "À quoi sert la page Vos droits ?",
        answer: "Elle regroupe des repères pratiques sur le temps de travail, les congés, la santé au travail, la rémunération, les contrats et les droits collectifs. En cas de doute, contactez FO COM.",
      },
      {
        question: "L'assistant juridique remplace-t-il un conseil personnalisé ?",
        answer: "Non. Il donne une première orientation sur les questions générales. Une situation juridique dépend des faits, des documents et du contexte précis. FO COM peut analyser votre dossier en détail.",
      },
      {
        question: "Que faire en cas de difficulté au travail ?",
        answer: "Conservez les éléments factuels (emails, courriers, dates), ne supprimez rien et contactez rapidement un représentant FO COM via Mes demandes ou la page Contact.",
      },
      {
        question: "Qui peut accéder à l'assistant juridique ?",
        answer: "L'assistant juridique est réservé aux adhérents avec un compte validé. Si vous n'êtes pas encore membre, utilisez la page Contact pour exposer votre situation.",
      },
    ],
  },
  {
    category: "CSE et élections",
    icon: Trophy,
    color: "bg-amber-50 text-amber-600",
    questions: [
      {
        question: "Les élections CSE 2026 sont-elles terminées ?",
        answer: "Oui. La page Élections archive les résultats définitifs des deux tours (avril–mai 2026), les taux de participation et les élus FO COM par collège.",
      },
      {
        question: "Où trouver les élus FO COM ?",
        answer: "Les élus et représentants FO COM sont présentés sur la page Le syndicat. Vous y trouverez leurs rôles et coordonnées.",
      },
      {
        question: "À quoi sert le CSE ?",
        answer: "Le CSE est consulté sur les sujets économiques, sociaux, organisationnels et les conditions de travail. Les élus portent les réclamations individuelles et collectives, et négocient les accords d'entreprise.",
      },
    ],
  },
  {
    category: "Fil & Podcast",
    icon: Mic,
    color: "bg-purple-50 text-purple-600",
    questions: [
      {
        question: "Qu'est-ce que le fil d'actualités ?",
        answer: "Le fil d'actualités est une page mobile-first accessible via QR code. Il regroupe en temps réel les tracts et articles FO COM dans un flux chronologique. Vous pouvez réagir (❤️) et laisser des commentaires, soumis à modération avant publication.",
      },
      {
        question: "Comment accéder au fil d'actualités ?",
        answer: "Scannez le QR code FO COM distribué lors des distributions de tracts, ou accédez directement à focomues-iliad.fr/fil. Aucun compte n'est nécessaire pour lire et réagir.",
      },
      {
        question: "Mes commentaires sont-ils publiés immédiatement ?",
        answer: "Non. Les commentaires sont soumis à modération par un administrateur FO COM avant d'être visibles publiquement. Cela garantit des échanges respectueux.",
      },
      {
        question: "Qu'est-ce que le podcast FO COM ?",
        answer: "Un podcast mensuel dans lequel vos délégués FO COM décryptent l'actualité sociale, vos droits et les négociations en cours au sein d'UES ILIAD. Disponible directement sur le site ou via votre application podcast préférée.",
      },
      {
        question: "Comment s'abonner au podcast ?",
        answer: "Depuis la page Podcast, cliquez sur « S'abonner (RSS) » et copiez le lien dans Spotify, Apple Podcasts, Podcast Addict ou AntennaPod. Certains épisodes sont réservés aux adhérents connectés.",
      },
    ],
  },
  {
    category: "Mes demandes",
    icon: MessageSquare,
    color: "bg-green-50 text-green-600",
    questions: [
      {
        question: "À quoi sert Mes demandes ?",
        answer: "Cet espace permet de transmettre une question, un document, un bulletin d'adhésion ou un dossier à FO COM, puis de suivre les échanges. Réservé aux membres avec un compte validé.",
      },
      {
        question: "Puis-je joindre des documents ?",
        answer: "Oui. Vous pouvez transmettre les pièces nécessaires à l'analyse de votre dossier (bulletins, courriers, contrats). N'envoyez que les éléments pertinents.",
      },
      {
        question: "Mes échanges sont-ils confidentiels ?",
        answer: "Oui. Les demandes sont visibles uniquement par les représentants FO COM habilités à les traiter. Évitez d'y envoyer des informations sensibles non nécessaires.",
      },
    ],
  },
  {
    category: "Documents utiles",
    icon: FolderOpen,
    color: "bg-orange-50 text-orange-600",
    questions: [
      {
        question: "Où trouver les accords et documents ?",
        answer: "La page Documents utiles centralise les accords, modèles, ressources pratiques et documents syndicaux disponibles. Consultez aussi la page Accords pour les textes officiels négociés.",
      },
      {
        question: "Je ne trouve pas un document, que faire ?",
        answer: "Contactez FO COM via la page Contact ou Mes demandes. Un représentant vous orientera vers le bon document ou vous le transmettra directement.",
      },
      {
        question: "Les documents sont-ils régulièrement mis à jour ?",
        answer: "Oui, progressivement. Les contenus liés aux négociations (NAO, accords), aux élections et aux droits sont priorisés.",
      },
    ],
  },
  {
    category: "Contact FO COM",
    icon: Mail,
    color: "bg-teal-50 text-teal-600",
    questions: [
      {
        question: "Comment contacter FO COM ?",
        answer: "Utilisez la page Contact pour un message général, Mes demandes pour un dossier suivi, ou contactez directement un représentant depuis la page Le syndicat.",
      },
      {
        question: "Y a-t-il un numéro de téléphone ?",
        answer: "Un numéro de contact sera bientôt disponible. En attendant, privilégiez le formulaire de contact ou Mes demandes pour un suivi plus efficace.",
      },
      {
        question: "Puis-je contacter FO COM sans être adhérent ?",
        answer: "Oui. FO COM peut vous orienter et vous informer même sans adhésion. L'adhésion permet ensuite de bénéficier d'un accompagnement complet et de renforcer l'action collective.",
      },
      {
        question: "FO COM peut-il m'accompagner lors d'un entretien avec l'employeur ?",
        answer: "Oui. Un représentant FO COM peut vous assister lors d'un entretien préalable à sanction disciplinaire. Contactez-nous dès réception de la convocation.",
      },
    ],
  },
];

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openQuestions, setOpenQuestions] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState("Toutes");

  const categories = ["Toutes", ...faqData.map((d) => d.category)];

  const toggleQuestion = (key: string) => {
    setOpenQuestions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredData = faqData
    .filter((section) => activeCategory === "Toutes" || section.category === activeCategory)
    .map((section) => ({
      ...section,
      questions: section.questions.filter(
        (q) =>
          searchQuery === "" ||
          q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((section) => section.questions.length > 0);

  const totalQuestions = faqData.reduce((acc, s) => acc + s.questions.length, 0);

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 p-3 sm:p-4 lg:p-8">

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-[#13233A] p-6 text-white shadow-xl sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border-[52px] border-white/5" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-red-600/25 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <Badge className="mb-4 border border-white/15 bg-white/10 text-white hover:bg-white/10">
              <HelpCircle className="mr-1 h-3.5 w-3.5" /> FAQ · {totalQuestions} questions
            </Badge>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              Questions fréquentes
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/80 sm:text-lg">
              Adhésion, connexion sans mot de passe, droits, CSE, podcast, fil d'actualités, documents — tout ce qu'il faut savoir sur FO COM UES ILIAD.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="bg-red-600 text-white hover:bg-red-700">
                <Link to="/contact"><Mail className="mr-2 h-4 w-4" /> Contacter FO COM</Link>
              </Button>
              <Button asChild variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                <Link to="/mes-reclamations"><MessageSquare className="mr-2 h-4 w-4" /> Faire une demande</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {[
              { icon: Fingerprint, title: "Connexion sécurisée", text: "Passkey & magic link, sans mot de passe." },
              { icon: Lock,        title: "Accès membres",       text: "Validation admin avant accès complet." },
              { icon: Mic,         title: "Podcast mensuel",     text: "Épisodes audio + flux RSS compatible." },
              { icon: QrCode,      title: "Fil QR code",         text: "Réactions et commentaires modérés." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur flex items-center gap-3 lg:block">
                <item.icon className="h-5 w-5 text-red-200 shrink-0 lg:mb-3" />
                <div>
                  <p className="font-bold text-sm">{item.title}</p>
                  <p className="text-xs leading-relaxed text-white/70 mt-0.5">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Barre de recherche + filtres */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher une question…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-red-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Résultats vides */}
      {filteredData.length === 0 && (
        <div className="mt-8 py-12 text-center">
          <HelpCircle className="mx-auto mb-3 h-12 w-12 text-slate-200" />
          <p className="font-semibold text-slate-500">Aucune question trouvée</p>
          <p className="text-sm text-slate-400 mt-1">Essayez d'autres mots-clés ou contactez FO COM directement.</p>
        </div>
      )}

      {/* Sections FAQ */}
      <section className="mt-6 space-y-4">
        {filteredData.map((section, idx) => {
          const Icon = section.icon;
          return (
            <div key={section.category} className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              {/* En-tête de section */}
              <div className="flex items-center gap-3 px-5 pt-5 pb-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${section.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <h2 className="text-base font-extrabold text-slate-900">{section.category}</h2>
                <span className="ml-auto text-xs text-slate-400 font-medium">{section.questions.length} question{section.questions.length > 1 ? "s" : ""}</span>
              </div>

              {/* Questions */}
              <div className="px-5 pb-5 space-y-2">
                {section.questions.map((q, i) => {
                  const key = `${idx}-${i}`;
                  const isOpen = openQuestions[key];
                  return (
                    <div
                      key={q.question}
                      className={`overflow-hidden rounded-2xl border transition-colors ${isOpen ? "border-red-100 bg-red-50/30" : "border-slate-100 bg-slate-50/50"}`}
                    >
                      <button
                        onClick={() => toggleQuestion(key)}
                        className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left"
                      >
                        <span className="text-sm font-semibold text-slate-900 leading-snug">{q.question}</span>
                        <span className={`shrink-0 rounded-full p-0.5 transition-colors ${isOpen ? "bg-red-100 text-red-600" : "bg-slate-200 text-slate-400"}`}>
                          {isOpen
                            ? <ChevronUp className="h-3.5 w-3.5" />
                            : <ChevronDown className="h-3.5 w-3.5" />}
                        </span>
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 text-sm leading-relaxed text-slate-600 border-t border-red-100 pt-3">
                          {q.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      {/* CTA bas de page */}
      {filteredData.length > 0 && (
        <section className="mt-8 rounded-3xl bg-[#13233A] p-6 text-white shadow-xl sm:p-8">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-red-300" />
                <h2 className="text-xl font-extrabold">Vous ne trouvez pas votre réponse ?</h2>
              </div>
              <p className="max-w-2xl text-sm leading-relaxed text-white/70">
                Contactez vos représentants FO COM ou transmettez une demande depuis votre espace. Nous sommes là pour vous aider.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
                <Link to="/contact"><Mail className="mr-2 h-4 w-4" /> Nous contacter</Link>
              </Button>
              <Button asChild variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                <Link to="/le-syndicat"><Users className="mr-2 h-4 w-4" /> Nos représentants</Link>
              </Button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
