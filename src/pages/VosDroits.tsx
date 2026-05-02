import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Shield, Clock, Users, Heart, Scale,
  BookOpen, CheckCircle2, ChevronRight, MessageCircle,
} from "lucide-react";
import ChatbotJuridique from "@/components/ChatbotJuridique";

const LOGO_IMAGE = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663612648040/LldXxCbhFdcPcHwX.png";

const droitsSections = [
  {
    icon: Clock,
    title: "Temps de travail",
    color: "text-teal-600 bg-teal-50",
    description: "Vos droits concernant la durée du travail, les horaires, le repos et les congés.",
    items: [
      { title: "Durée légale du travail", desc: "35 heures par semaine, avec possibilité d'heures supplémentaires majorées.", question: "Combien d'heures supplémentaires ai-je droit ?" },
      { title: "Droit à la déconnexion", desc: "Vous n'êtes pas obligé de répondre aux emails ou appels en dehors de vos horaires de travail.", question: "C'est quoi le droit à la déconnexion ?" },
      { title: "Congés payés", desc: "5 semaines de congés payés par an, plus les RTT si applicable.", question: "Combien de jours de congés payés ai-je droit ?" },
      { title: "Repos quotidien et hebdomadaire", desc: "11 heures de repos minimum entre deux journées, 35 heures consécutives par semaine.", question: "Quelles sont les règles sur le repos quotidien ?" },
    ],
  },
  {
    icon: Scale,
    title: "Rémunération et primes",
    color: "text-red-600 bg-red-50",
    description: "Tout ce que vous devez savoir sur votre salaire, les primes et les augmentations.",
    items: [
      { title: "Salaire minimum conventionnel", desc: "Votre salaire ne peut pas être inférieur aux minima de la convention collective.", question: "Quels sont mes droits concernant le salaire minimum ?" },
      { title: "Heures supplémentaires", desc: "Majorées de 25% pour les 8 premières heures, 50% au-delà.", question: "Comment sont payées les heures supplémentaires ?" },
      { title: "Prime d'intéressement et participation", desc: "Selon les accords d'entreprise en vigueur.", question: "Comment fonctionne l'intéressement et la participation ?" },
      { title: "Négociation annuelle des salaires", desc: "La FOCOM négocie chaque année pour défendre votre pouvoir d'achat.", question: "Comment se déroulent les négociations annuelles obligatoires ?" },
    ],
  },
  {
    icon: Heart,
    title: "Santé et bien-être au travail",
    color: "text-teal-600 bg-teal-50",
    description: "Votre santé et votre sécurité sont une priorité. Connaissez vos droits.",
    items: [
      { title: "Document unique d'évaluation des risques", desc: "Votre employeur doit identifier et prévenir les risques professionnels.", question: "Qu'est-ce que le document unique d'évaluation des risques ?" },
      { title: "Droit de retrait", desc: "Vous pouvez vous retirer d'une situation de travail dangereuse pour votre santé.", question: "C'est quoi le droit de retrait ?" },
      { title: "Médecine du travail", desc: "Suivi médical obligatoire et gratuit pour tous les salariés.", question: "Quels sont mes droits avec la médecine du travail ?" },
      { title: "Qualité de vie au travail", desc: "Accords sur le télétravail, le stress et l'équilibre vie pro/vie perso.", question: "Quels sont mes droits en matière de qualité de vie au travail ?" },
    ],
  },
  {
    icon: Users,
    title: "Égalité et non-discrimination",
    color: "text-red-600 bg-red-50",
    description: "L'égalité professionnelle entre les femmes et les hommes et la lutte contre les discriminations.",
    items: [
      { title: "Égalité salariale", desc: "Les femmes et les hommes doivent être rémunérés de manière égale pour un travail équivalent.", question: "Quels sont mes droits en matière d'égalité salariale ?" },
      { title: "Lutte contre le harcèlement", desc: "Toute forme de harcèlement est interdite et sanctionnée par la loi.", question: "Que faire en cas de harcèlement moral ?" },
      { title: "Index d'égalité professionnelle", desc: "Votre entreprise doit publier son index et prendre des mesures correctives.", question: "Qu'est-ce que l'index d'égalité professionnelle ?" },
      { title: "Congé maternité et paternité", desc: "Des droits spécifiques pour accompagner la parentalité.", question: "Quels sont mes droits pour le congé maternité ou paternité ?" },
    ],
  },
  {
    icon: BookOpen,
    title: "Formation et évolution de carrière",
    color: "text-teal-600 bg-teal-50",
    description: "Développez vos compétences et évoluez dans votre carrière.",
    items: [
      { title: "Compte Personnel de Formation (CPF)", desc: "Chaque salarié dispose d'un compte formation alimenté en euros.", question: "Comment accéder à mon CPF ?" },
      { title: "Entretien professionnel", desc: "Tous les 2 ans, un entretien dédié à vos perspectives d'évolution.", question: "Qu'est-ce que l'entretien professionnel obligatoire ?" },
      { title: "Plan de développement des compétences", desc: "Les actions de formation initiées par l'employeur.", question: "Qu'est-ce que le plan de développement des compétences ?" },
      { title: "GEPP", desc: "Gestion des Emplois et des Parcours Professionnels : anticiper les évolutions.", question: "C'est quoi la GEPP ?" },
    ],
  },
  {
    icon: Shield,
    title: "Protection sociale",
    color: "text-red-600 bg-red-50",
    description: "Votre couverture sociale : mutuelle, prévoyance, retraite.",
    items: [
      { title: "Mutuelle d'entreprise obligatoire", desc: "Prise en charge complémentaire de vos frais de santé.", question: "Quels sont mes droits sur la mutuelle d'entreprise ?" },
      { title: "Prévoyance", desc: "Protection en cas d'incapacité, invalidité ou décès.", question: "C'est quoi la prévoyance en entreprise ?" },
      { title: "Retraite complémentaire", desc: "Cotisations versées tout au long de votre carrière.", question: "Comment fonctionne la retraite complémentaire ?" },
      { title: "Action sociale", desc: "Aides et services pour améliorer votre quotidien.", question: "Quelles aides sociales puis-je obtenir ?" },
    ],
  },
];

export default function VosDroits() {
  const navigate = useNavigate();
  const [chatQuestion, setChatQuestion] = useState<string | undefined>(undefined);
  const chatRef = useRef<HTMLDivElement>(null);

  // Envoie une question au chatbot et scroll vers lui
  const askChatbot = (question: string) => {
    setChatQuestion(undefined); // reset pour pouvoir re-déclencher la même question
    requestAnimationFrame(() => {
      setChatQuestion(question);
      chatRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/")} className="p-2 rounded-lg hover:bg-slate-100">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <img src={LOGO_IMAGE} alt="FO Com" className="h-12 w-12 object-contain" />
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-slate-900 leading-tight">FOCOM UES ILIAD</h1>
                <p className="text-[11px] text-slate-500 font-medium tracking-wide uppercase">Vos Droits</p>
              </div>
            </div>
            {/* Raccourci vers le chatbot depuis le header */}
            <button
              onClick={() => chatRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="flex items-center gap-2 text-sm font-medium text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100 transition-colors px-3 py-2 rounded-lg"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Assistant juridique</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <main className="max-w-[1440px] mx-auto p-4 lg:p-8">

        {/* Hero */}
        <section className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-8 sm:p-12 mb-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-10 h-10" />
            <h2 className="text-2xl sm:text-4xl font-extrabold">Vos Droits</h2>
          </div>
          <p className="text-teal-100 text-base sm:text-lg max-w-2xl">
            La FOCOM défend vos droits au quotidien. Découvrez tout ce que la loi et les accords collectifs vous garantissent.
          </p>
        </section>

        {/* Info Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-start gap-3">
          <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Besoin d'aide ?</p>
            <p className="text-xs text-amber-700 mt-1">
              Si vous avez une question sur vos droits, utilisez notre{" "}
              <button
                onClick={() => chatRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className="underline font-medium hover:text-amber-900"
              >
                assistant juridique ci-dessous
              </button>{" "}
              ou{" "}
              <button onClick={() => navigate("/contact")} className="underline font-medium hover:text-amber-900">
                contactez vos élus FOCOM
              </button>.
            </p>
          </div>
        </div>

        {/* ── Fiches droits ────────────────────────────────────────────── */}
        <div className="space-y-6">
          {droitsSections.map((section, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl ${section.color} flex items-center justify-center flex-shrink-0`}>
                  <section.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{section.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{section.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                {section.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg group hover:bg-teal-50 hover:border-teal-100 border border-transparent transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                    {/* ✅ Bouton "Demander à l'assistant" sur chaque item */}
                    <button
                      onClick={() => askChatbot(item.question)}
                      title="Poser la question à l'assistant juridique"
                      className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-teal-100 hover:bg-teal-200 text-teal-700"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── Chatbot juridique ─────────────────────────────────────────── */}
        <div ref={chatRef} className="mt-10 scroll-mt-20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-teal-700" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Assistant juridique</h3>
              <p className="text-sm text-slate-500">
                Posez votre question sur le droit du travail — réponses basées sur le Code du travail français.
              </p>
            </div>
          </div>
          <ChatbotJuridique initialQuestion={chatQuestion} />
        </div>

        {/* CTA */}
        <div className="mt-10 bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-8 text-white shadow-lg text-center">
          <h4 className="font-bold text-xl mb-3">Un doute sur vos droits ?</h4>
          <p className="text-red-100 mb-5 max-w-lg mx-auto">
            La FOCOM est à votre écoute pour vous informer et vous défendre. Contactez-nous sans hésiter.
          </p>
          <button
            onClick={() => navigate("/contact")}
            className="bg-white text-red-600 hover:bg-red-50 rounded-full px-6 py-3 text-sm font-semibold shadow-md inline-flex items-center gap-2"
          >
            Nous contacter <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="mt-12 bg-white border-t border-slate-200 py-6">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">© 2026 FOCOM UES ILIAD – Tous droits réservés</p>
            <div className="flex gap-4">
              <button onClick={() => navigate("/mentions-legales")} className="text-xs text-slate-500 hover:text-slate-700">Mentions légales</button>
              <button onClick={() => navigate("/rgpd")} className="text-xs text-slate-500 hover:text-slate-700">Politique de confidentialité</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
