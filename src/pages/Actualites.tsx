import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  Search,
  Filter,
  FileText,
  Users,
  Handshake,
  Megaphone,
} from "lucide-react";

const LOGO_IMAGE = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663612648040/LldXxCbhFdcPcHwX.png";

const articles = [
  {
    id: 1,
    badge: "À LA UNE",
    title: "Négociation Annuelle Obligatoire 2026 : Nos revendications avancent",
    excerpt: "La FOCOM porte des revendications fortes lors des NAO 2026 pour défendre le pouvoir d'achat de tous les salariés.",
    date: "29 octobre 2026",
    category: "Négociations",
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=250&fit=crop",
    icon: Handshake,
  },
  {
    id: 2,
    title: "VOTEZ EN MASSE POUR FO COM JUSQU'AU 6 MAI 2026 ! VOTRE VOIX EST UN ATOUT",
    excerpt: "Les élections professionnelles arrivent à échéance. Chaque voix compte pour renforcer notre représentation.",
    date: "29 octobre 2026",
    category: "Élections",
    image: "https://images.unsplash.com/photo-1587560699334-cc4ff634909a?w=400&h=250&fit=crop",
    icon: Users,
  },
  {
    id: 3,
    title: "GEPP : POUR TOUT SAVOIR SUR LA GESTION DES EMPLOIS ET DES PARCOURS PROFESSIONNELS",
    excerpt: "Découvrez tout ce que vous devez savoir sur la GEPP et ses impacts sur votre carrière.",
    date: "28 octobre 2026",
    category: "Formation",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=250&fit=crop",
    icon: FileText,
  },
  {
    id: 4,
    title: "Télétravail : Nouvelles modalités d'application",
    excerpt: "La direction a proposé de nouvelles modalités pour le télétravail. La FOCOM analyse et vous informe.",
    date: "25 octobre 2026",
    category: "Organisation",
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&h=250&fit=crop",
    icon: Megaphone,
  },
  {
    id: 5,
    title: "Accord sur la qualité de vie au travail : Les avancées",
    excerpt: "Un nouvel accord a été signé pour améliorer la qualité de vie au travail de tous les salariés.",
    date: "22 octobre 2026",
    category: "Accords",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop",
    icon: Handshake,
  },
  {
    id: 6,
    title: "Point sur la mobilisation des salariés",
    excerpt: "Retour sur les actions menées ces dernières semaines pour défendre nos revendications.",
    date: "20 octobre 2026",
    category: "Mobilisation",
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400&h=250&fit=crop",
    icon: Users,
  },
];

const categories = ["Toutes", "Négociations", "Élections", "Formation", "Organisation", "Accords", "Mobilisation"];

export default function Actualites() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("Toutes");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArticles = articles.filter((article) => {
    const matchCategory = selectedCategory === "Toutes" || article.category === selectedCategory;
    const matchSearch =
      searchQuery === "" ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/")}
                className="p-2 rounded-lg hover:bg-slate-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <img src={LOGO_IMAGE} alt="FO Com" className="h-12 w-12 object-contain" />
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-slate-900 leading-tight">FOCOM UES ILIAD</h1>
                <p className="text-[11px] text-slate-500 font-medium tracking-wide uppercase">Actualités</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1440px] mx-auto p-4 lg:p-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
            Toutes les <span className="text-teal-600">Actualités</span>
          </h2>
          <p className="text-slate-500">Restez informé des dernières actions et négociations de la FOCOM</p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher une actualité..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-500 hidden sm:inline">Filtrer :</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-teal-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <article
              key={article.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <div className="relative overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {article.badge && (
                  <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                    {article.badge}
                  </span>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center">
                    <article.icon className="w-3.5 h-3.5 text-teal-600" />
                  </div>
                  <span className="text-xs font-medium text-teal-600">{article.category}</span>
                </div>
                <h3 className="font-semibold text-slate-900 text-sm leading-snug mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">
                  {article.title}
                </h3>
                <p className="text-xs text-slate-500 mb-3 line-clamp-2">{article.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {article.date}
                  </span>
                  <span className="text-xs font-medium text-teal-600 flex items-center gap-1">
                    Lire la suite <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Aucune actualité trouvée</p>
          </div>
        )}
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
