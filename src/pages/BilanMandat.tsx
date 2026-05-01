import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Users, FileText, TrendingUp, Award, Target, Heart, Handshake, Shield } from "lucide-react";

const LOGO_IMAGE = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663612648040/LldXxCbhFdcPcHwX.png";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  return (
    <div className="text-3xl font-extrabold text-red-600">
      {target}{suffix}
    </div>
  );
}

function ProgressBar({ label, value, color = "bg-teal-500" }: { label: string; value: number; color?: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-slate-700 font-medium">{label}</span>
        <span className="text-slate-500 font-semibold">{value}%</span>
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

const achievements = [
  {
    year: "2022",
    items: [
      "Accord sur la rémunération et les primes",
      "Mise en place du droit à la déconnexion",
      "Négociation sur le télétravail",
      "Accord sur l'égalité professionnelle",
    ],
  },
  {
    year: "2023",
    items: [
      "Revalorisation salariale de 4,2%",
      "Accord sur la qualité de vie au travail",
      "Création de la commission santé-sécurité",
      "Négociation GEPP : Gestion des emplois et parcours professionnels",
    ],
  },
  {
    year: "2024",
    items: [
      "Accord NAO : Augmentation générale de 3,5%",
      "Prime exceptionnelle de pouvoir d'achat",
      "Amélioration du régime de mutuelle",
      "Renforcement du droit à la formation",
    ],
  },
  {
    year: "2025",
    items: [
      "NAO 2025 : Accord salarial signé",
      "Développement des actions de formation",
      "Renforcement de la représentation syndicale",
      "Actions pour l'emploi et la sécurisation des parcours",
    ],
  },
];

export default function BilanMandat() {
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
                <p className="text-[11px] text-slate-500 font-medium tracking-wide uppercase">Bilan de Mandat</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1440px] mx-auto p-4 lg:p-8">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 sm:p-12 mb-8 text-white">
          <h2 className="text-2xl sm:text-4xl font-extrabold mb-4">
            Bilan de Mandat 2022–2026
          </h2>
          <p className="text-red-100 text-base sm:text-lg max-w-2xl">
            4 années d'actions au service de tous les salariés. Découvrez nos réalisations et nos avancées pour défendre vos droits.
          </p>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { value: 42, label: "Accords signés", icon: CheckCircle2, color: "bg-teal-50 text-teal-600" },
            { value: 78, label: "Réunions CSE", icon: Users, color: "bg-red-50 text-red-600" },
            { value: 126, label: "Dossiers traités", icon: FileText, color: "bg-teal-50 text-teal-600" },
            { value: 100, label: "Engagement", suffix: "%", icon: TrendingUp, color: "bg-red-50 text-red-600" },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5 text-center shadow-sm">
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mx-auto mb-3`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </section>

        {/* Progress Bars */}
        <section className="bg-white rounded-xl border border-slate-200 p-6 mb-8 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Nos avancées principales</h3>
          <div className="space-y-4">
            <ProgressBar label="Pouvoir d'achat" value={85} />
            <ProgressBar label="Conditions de travail" value={90} />
            <ProgressBar label="Égalité professionnelle" value={75} />
            <ProgressBar label="Gestion des emplois" value={80} />
            <ProgressBar label="Qualité de vie au travail" value={70} color="bg-teal-400" />
          </div>
        </section>

        {/* Timeline */}
        <section className="mb-8">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Notre action année par année</h3>
          <div className="space-y-6">
            {achievements.map((year, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-lg">
                    {year.year}
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">Année {year.year}</h4>
                </div>
                <ul className="space-y-2 ml-16">
                  {year.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Nos combats */}
        <section className="bg-white rounded-xl border border-slate-200 p-6 mb-8 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Nos combats, vos droits</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-10 h-10 rounded-lg ${section.color} flex items-center justify-center`}>
                    <section.icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-base text-slate-900">{section.title}</h4>
                </div>
                <ul className="text-sm text-slate-600 space-y-2">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Engagement */}
        <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl p-8 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-8 h-8" />
            <h4 className="font-bold text-xl">Notre engagement</h4>
          </div>
          <p className="text-teal-100 text-base leading-relaxed max-w-2xl">
            Transparence, écoute et action : notre priorité, c'est vous. Ensemble, nous continuons à construire un monde du travail plus juste et plus respectueux de chacun.
          </p>
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
