import { useNavigate } from "react-router-dom";
import { ArrowLeft, HelpCircle, Search, ChevronDown, ChevronUp, MessageSquare, Phone, Mail } from "lucide-react";
import { useState } from "react";

const LOGO_IMAGE = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663612648040/LldXxCbhFdcPcHwX.png";

const faqData = [
  {
    category: "Adhésion",
    questions: [
      {
        question: "Comment adhérer à la FOCOM ?",
        answer: "Pour adhérer à la FOCOM, vous pouvez remplir le formulaire d'adhésion disponible sur le site ou contacter directement vos élus. La cotisation est déduite directement de votre salaire.",
      },
      {
        question: "Quel est le montant de la cotisation ?",
        answer: "La cotisation syndicale est calculée en fonction de votre salaire brut. Elle est généralement d'environ 1% de votre rémunération, avec un minimum et un maximum définis.",
      },
      {
        question: "Quels sont les avantages de l'adhésion ?",
        answer: "En adhérant à la FOCOM, vous bénéficiez d'une protection juridique, d'un accompagnement personnalisé, d'un accès à des formations, et vous participez à la défense collective de vos droits.",
      },
    ],
  },
  {
    category: "Droits des salariés",
    questions: [
      {
        question: "Qu'est-ce que le droit à la déconnexion ?",
        answer: "Le droit à la déconnexion permet à chaque salarié de ne pas être joignable en dehors de ses horaires de travail. Cela inclut les emails, appels téléphoniques et messages professionnels.",
      },
      {
        question: "Comment fonctionne le droit de retrait ?",
        answer: "Le droit de retrait permet à un salarié de se retirer d'une situation de travail dont il a un motif raisonnable de penser qu'elle présente un danger grave et imminent pour sa vie ou sa santé.",
      },
      {
        question: "Quels sont mes droits en matière de télétravail ?",
        answer: "Le télétravail est encadré par un accord d'entreprise qui définit les conditions d'éligibilité, le nombre de jours autorisés, les modalités de demande et les obligations de l'employeur.",
      },
    ],
  },
  {
    category: "Négociations",
    questions: [
      {
        question: "Que sont les NAO ?",
        answer: "Les Négociations Annuelles Obligatoires (NAO) portent sur les salaires, la durée du travail, l'égalité professionnelle et la qualité de vie au travail. Elles doivent avoir lieu chaque année.",
      },
      {
        question: "Qu'est-ce que la GEPP ?",
        answer: "La GEPP (Gestion des Emplois et des Parcours Professionnels) est une négociation qui vise à anticiper les évolutions des métiers et des compétences pour accompagner les salariés dans leur parcours professionnel.",
      },
      {
        question: "Comment sont prises les décisions lors des négociations ?",
        answer: "Les décisions sont prises par accord entre les organisations syndicales représentatives et la direction. Un accord est validé s'il recueille au moins 50% des suffrages exprimés aux élections professionnelles.",
      },
    ],
  },
  {
    category: "Élections professionnelles",
    questions: [
      {
        question: "Qui peut voter aux élections professionnelles ?",
        answer: "Tous les salariés de l'entreprise âgés d'au moins 16 ans et ayant 3 mois d'ancienneté peuvent voter. Les électeurs doivent être inscrits sur les listes électorales.",
      },
      {
        question: "Quand ont lieu les élections professionnelles ?",
        answer: "Les élections professionnelles ont lieu tous les 4 ans. Le prochain scrutin est prévu le 6 mai 2026 pour la FOCOM UES ILIAD.",
      },
      {
        question: "Comment se déroule le vote ?",
        answer: "Le vote peut se faire par bulletin papier dans l'isoloir ou par vote électronique selon les modalités définies par le protocole d'accord préélectoral.",
      },
    ],
  },
  {
    category: "Formation",
    questions: [
      {
        question: "Comment accéder à mon Compte Personnel de Formation (CPF) ?",
        answer: "Votre CPF est accessible via l'application mobile ou le site moncompteformation.gouv.fr. Vous pouvez y consulter vos droits et sélectionner des formations éligibles.",
      },
      {
        question: "Qu'est-ce que l'entretien professionnel ?",
        answer: "L'entretien professionnel est un rendez-vous tous les 2 ans avec votre employeur pour faire le point sur vos perspectives d'évolution professionnelle et vos besoins de formation.",
      },
      {
        question: "Puis-je suivre une formation pendant mon temps de travail ?",
        answer: "Oui, les formations inscrites au plan de développement des compétences de l'entreprise se déroulent généralement pendant le temps de travail et sont rémunérées.",
      },
    ],
  },
];

export default function FAQ() {
  const navigate = useNavigate();
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
              <img loading="lazy" src={LOGO_IMAGE} alt="FO Com" className="h-12 w-12 object-contain" />
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-slate-900 leading-tight">FOCOM UES ILIAD</h1>
                <p className="text-[11px] text-slate-500 font-medium tracking-wide uppercase">FAQ</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1440px] mx-auto p-4 lg:p-8">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 sm:p-12 mb-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <HelpCircle className="w-10 h-10" />
            <h2 className="text-2xl sm:text-4xl font-extrabold">Questions Fréquentes</h2>
          </div>
          <p className="text-red-100 text-base sm:text-lg max-w-2xl">
            Trouvez rapidement les réponses à vos questions sur vos droits, les négociations et la vie syndicale.
          </p>
        </section>

        {/* Search */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher une question..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-red-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-6">
          {filteredData.map((section, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">{section.category}</h3>
              <div className="space-y-3">
                {section.questions.map((q, i) => {
                  const key = `${idx}-${i}`;
                  const isOpen = openQuestions[key];
                  return (
                    <div key={i} className="border border-slate-100 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleQuestion(key)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
                      >
                        <span className="text-sm font-semibold text-slate-900 pr-4">{q.question}</span>
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 text-sm text-slate-600 leading-relaxed">{q.answer}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Aucune question trouvée</p>
          </div>
        )}

        {/* Contact CTA */}
        <div className="mt-8 bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl p-8 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-8 h-8" />
            <h4 className="font-bold text-xl">Vous ne trouvez pas votre réponse ?</h4>
          </div>
          <p className="text-teal-100 mb-5 max-w-lg">
            N'hésitez pas à contacter vos élus FOCOM. Nous sommes là pour vous aider et vous accompagner.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate("/contact")}
              className="bg-white text-teal-600 hover:bg-teal-50 rounded-full px-6 py-3 text-sm font-semibold shadow-md inline-flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Nous contacter
            </button>
            <a
              href="tel:0187154311"
              className="bg-white/20 hover:bg-white/30 text-white rounded-full px-6 py-3 text-sm font-semibold backdrop-blur-sm inline-flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              01 87 15 43 11
            </a>
          </div>
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
