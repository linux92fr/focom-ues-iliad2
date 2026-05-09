import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Download, Search, Filter, FolderOpen, FileCheck, FileSpreadsheet, FileBadge } from "lucide-react";
import { useState } from "react";

const LOGO_IMAGE = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663612648040/LldXxCbhFdcPcHwX.png";

const documents = [
  {
    id: 1,
    title: "Guide GEPP 2026",
    description: "Tout savoir sur la Gestion des Emplois et des Parcours Professionnels",
    category: "Accords",
    type: "PDF",
    size: "2.4 MB",
    date: "15 janvier 2026",
    icon: FileCheck,
  },
  {
    id: 2,
    title: "Accord NAO 2026",
    description: "Accord sur les Négociations Annuelles Obligatoires 2026",
    category: "Accords",
    type: "PDF",
    size: "1.8 MB",
    date: "28 octobre 2025",
    icon: FileBadge,
  },
  {
    id: 3,
    title: "Procès-verbal CSE - Octobre 2025",
    description: "PV de la réunion du CSE du 15 octobre 2025",
    category: "CSE",
    type: "PDF",
    size: "856 KB",
    date: "20 octobre 2025",
    icon: FileText,
  },
  {
    id: 4,
    title: "Bilan Social 2025",
    description: "Rapport annuel sur la situation de l'entreprise",
    category: "Rapports",
    type: "PDF",
    size: "4.2 MB",
    date: "10 septembre 2025",
    icon: FileSpreadsheet,
  },
  {
    id: 5,
    title: "Accord Télétravail 2025",
    description: "Nouvelles modalités d'application du télétravail",
    category: "Accords",
    type: "PDF",
    size: "1.1 MB",
    date: "5 septembre 2025",
    icon: FileCheck,
  },
  {
    id: 6,
    title: "Guide de la Formation 2025-2026",
    description: "Catalogue des formations disponibles et modalités d'inscription",
    category: "Formation",
    type: "PDF",
    size: "3.5 MB",
    date: "1 septembre 2025",
    icon: FileText,
  },
  {
    id: 7,
    title: "Convention Collective",
    description: "Texte intégral de la convention collective applicable",
    category: "Textes",
    type: "PDF",
    size: "5.8 MB",
    date: "1 janvier 2025",
    icon: FileBadge,
  },
  {
    id: 8,
    title: "Accord QVT 2025",
    description: "Accord sur la Qualité de Vie au Travail",
    category: "Accords",
    type: "PDF",
    size: "1.5 MB",
    date: "15 mars 2025",
    icon: FileCheck,
  },
];

const categories = ["Toutes", "Accords", "CSE", "Rapports", "Formation", "Textes"];
const types = ["Tous", "PDF", "Excel", "Word"];

export default function DocumentsUtiles() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("Toutes");
  const [selectedType, setSelectedType] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDocuments = documents.filter((doc) => {
    const matchCategory = selectedCategory === "Toutes" || doc.category === selectedCategory;
    const matchType = selectedType === "Tous" || doc.type === selectedType;
    const matchSearch =
      searchQuery === "" ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchType && matchSearch;
  });

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
                <p className="text-[11px] text-slate-500 font-medium tracking-wide uppercase">Documents Utiles</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1440px] mx-auto p-4 lg:p-8">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl p-8 sm:p-12 mb-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <FolderOpen className="w-10 h-10" />
            <h2 className="text-2xl sm:text-4xl font-extrabold">Documents Utiles</h2>
          </div>
          <p className="text-teal-100 text-base sm:text-lg max-w-2xl">
            Accédez à tous les documents importants : accords, PV de CSE, bilans sociaux et guides pratiques.
          </p>
        </section>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un document..."
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
          <div className="flex flex-wrap gap-2 mt-2">
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedType === type
                    ? "bg-red-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Documents List */}
        <div className="space-y-3">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="w-12 h-12 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                <doc.icon className="w-6 h-6 text-teal-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 text-sm truncate">{doc.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{doc.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] text-slate-400">{doc.date}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-slate-100 rounded-full text-slate-500">{doc.category}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-red-50 rounded-full text-red-600">{doc.type}</span>
                  <span className="text-[10px] text-slate-400">{doc.size}</span>
                </div>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors flex-shrink-0">
                <Download className="w-4 h-4" />
                Télécharger
              </button>
            </div>
          ))}
        </div>

        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Aucun document trouvé</p>
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
