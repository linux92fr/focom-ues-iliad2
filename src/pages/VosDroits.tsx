import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Clock, Users, Heart, Scale, BookOpen, CheckCircle2, ChevronRight } from "lucide-react";

const LOGO_IMAGE = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663612648040/LldXxCbhFdcPcHwX.png";

const droitsSections = [
  {
    icon: Clock,
    title: "Temps de travail",
    color: "text-teal-600 bg-teal-50",
    description: "Vos droits concernant la durée du travail, les horaires, le repos et les congés.",
    items: [
      { title: "Durée légale du travail", desc: "35 heures par semaine, avec possibilité d'heures supplémentaires majorées." },
      { title: "Droit à la déconnexion", desc: "Vous n'êtes pas obligé de répondre aux emails ou appels en dehors de vos horaires de travail." },
      { title: "Congés payés", desc: "5 semaines de congés payés par an, plus les RTT si applicable." },
      { title: "Repos quotidien et hebdomadaire", desc: "11 heures de repos minimum entre deux journées, 35 heures consécutives par semaine." },
    ],
  },
  {
    icon: Scale,
    title: "Rémunération et primes",
    color: "text-red-600 bg-red-50",
    description: "Tout ce que vous devez savoir sur votre salaire, les primes et les augmentations.",
    items: [
      { title: "Salaire minimum conventionnel", desc: "Votre salaire ne peut pas être inférieur aux minima de la convention collective." },
      { title: "Heures supplémentaires", desc: "Majorées de 25% pour les 8 premières heures, 50% au-delà." },
      { title: "Prime d'intéressement et participation", desc: "Selon les accords d'entreprise en vigueur." },
      { title: "Négociation annuelle des salaires", desc: "La FOCOM négocie chaque année pour défendre votre pouvoir d'achat." },
    ],
  },
  {
    icon: Heart,
    title: "Santé et bien-être au travail",
    color: "text-teal-600 bg-teal-50",
    description: "Votre santé et votre sécurité sont une priorité. Connaissez vos droits.",
    items: [
      { title: "Document unique d'évaluation des risques", desc: "Votre employeur doit identifier et prévenir les risques professionnels." },
      { title: "Droit de retrait", desc: "Vous pouvez vous retirer d'une situation de travail dangereuse pour votre santé." },
      { title: "Médecine du travail", desc: "Suivi médical obligatoire et gratuit pour tous les salariés." },
      { title: "Qualité de vie au travail", desc: "Accords sur le télétravail, le stress et l'équilibre vie pro/vie perso." },
    ],
  },
  {
    icon: Users,
    title: "Égalité et non-discrimination",
    color: "text-red-600 bg-red-50",
    description: "L'égalité professionnelle entre les femmes et les hommes et la lutte contre les discriminations.",
    items: [
      { title: "Égalité salariale", desc: "Les femmes et les hommes doivent être rémunérés de manière égale pour un travail équivalent." },
      { title: "Lutte contre le harcèlement", desc: "Toute forme de harcèlement est interdite et sanctionnée par la loi." },
      { title: "Index d'égalité professionnelle", desc: "Votre entreprise doit publier son index et prendre des mesures correctives." },
      { title: "Congé maternité et paternité", desc: "Des droits spécifiques pour accompagner la parentalité." },
    ],
  },
  {
    icon: BookOpen,
    title: "Formation et évolution de carrière",
    color: "text-teal-600 bg-teal-50",
    description: "Développez vos compétences et évoluez dans votre carrière.",
    items: [
      { title: "Compte Personnel de Formation (CPF)", desc: "Chaque salarié dispose d'un compte formation alimenté en euros." },
      { title: "Entretien professionnel", desc: "Tous les 2 ans, un entretien dédié à vos perspectives d'évolution." },
      { title: "Plan de développement des compétences", desc: "Les actions de formation initiées par l'employeur." },
      { title: "GEPP", desc: "Gestion des Emplois et des Parcours Professionnels : anticiper les évolutions." },
    ],
  },
  {
    icon: Shield,
    title: "Protection sociale",
    color: "text-red-600 bg-red-50",
    description: "Votre couverture sociale : mutuelle, prévoyance, retraite.",
    items: [
      { title: "Mutuelle d'entreprise obligatoire", desc: "Prise en charge complémentaire de vos frais de santé." },
      { title: "Prévoyance", desc: "Protection en cas d'incapacité, invalidité ou décès." },
      { title: "Retraite complémentaire", desc: "Cotisations versées tout au long de votre carrière." },
      { title: "Action sociale", desc: "Aides et services pour améliorer votre quotidien." },
    ],
  },
];

export default function VosDroits() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1440px] mx-auto p-4 lg:p-8">
        {/* Hero Section */}
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
              Si vous avez une question sur vos droits, n'hésitez pas à{" "}
              <button onClick={() => navigate("/contact")} className="underline font-medium hover:text-amber-900">
                contacter vos élus FOCOM
              </button>
              . Nous sommes là pour vous accompagner.
            </p>
          </div>
        </div>

        {/* Sections */}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {section.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-8 text-white shadow-lg text-center">
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

      {/* Footer */}
      <footer className="mt-12 bg-white border-t border-slate-200 py-6">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">© 2026 FOCOM UES ILIAD – Tous droits réservés</p>
            <div className="flex gap-4">
              <button onClick={() => navigate("/mentions-legales")} className="text-xs text-slate-500 hover:text-slate-700">
                Mentions légales
              </button>
              <button onClick={() => navigate("/rgpd")} className="text-xs text-slate-500 hover:text-slate-700">
                Politique de confidentialité
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
