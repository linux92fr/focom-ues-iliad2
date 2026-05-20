import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Download, Search, Filter, FolderOpen, FileCheck, FileSpreadsheet, FileBadge, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const LOGO_IMAGE = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663612648040/LldXxCbhFdcPcHwX.png";
const BUCKET = "documents";

type DocumentRow = {
  id: string;
  title: string;
  description: string | null;
  file_name: string;
  file_path: string;
  file_size: number | null;
  file_type: string | null;
  created_at: string;
  document_categories?: { name: string } | null;
};

type CategoryRow = { id: string; name: string };

const types = ["Tous", "PDF", "Excel", "Word", "Autres"];

const formatSize = (bytes?: number | null) => {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

const getDocType = (fileType?: string | null, fileName = "") => {
  const value = `${fileType || ""} ${fileName}`.toLowerCase();
  if (value.includes("pdf")) return "PDF";
  if (value.includes("excel") || value.includes("spreadsheet") || value.includes("xlsx") || value.includes("xls")) return "Excel";
  if (value.includes("word") || value.includes("docx") || value.includes("doc")) return "Word";
  return "Autres";
};

const getIcon = (type: string) => {
  if (type === "PDF") return FileCheck;
  if (type === "Excel") return FileSpreadsheet;
  if (type === "Word") return FileBadge;
  return FileText;
};

export default function DocumentsUtiles() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Toutes");
  const [selectedType, setSelectedType] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadDocuments = async () => {
      setLoading(true);
      const [docsRes, catsRes] = await Promise.all([
        supabase
          .from("documents")
          .select("*, document_categories(name)")
          .order("created_at", { ascending: false }),
        supabase
          .from("document_categories")
          .select("id, name")
          .order("display_order", { ascending: true }),
      ]);

      if (!docsRes.error) setDocuments((docsRes.data as DocumentRow[]) || []);
      else console.error("Erreur chargement documents", docsRes.error);

      if (!catsRes.error) setCategories((catsRes.data as CategoryRow[]) || []);
      else console.error("Erreur chargement catégories", catsRes.error);

      setLoading(false);
    };

    loadDocuments();
  }, []);

  const categoryFilters = useMemo(() => ["Toutes", ...categories.map((cat) => cat.name)], [categories]);

  const filteredDocuments = documents.filter((doc) => {
    const category = doc.document_categories?.name || "Sans catégorie";
    const type = getDocType(doc.file_type, doc.file_name);
    const q = searchQuery.toLowerCase();
    const matchCategory = selectedCategory === "Toutes" || category === selectedCategory;
    const matchType = selectedType === "Tous" || type === selectedType;
    const matchSearch =
      q === "" ||
      doc.title.toLowerCase().includes(q) ||
      (doc.description || "").toLowerCase().includes(q) ||
      doc.file_name.toLowerCase().includes(q);
    return matchCategory && matchType && matchSearch;
  });

  const downloadDocument = (doc: DocumentRow) => {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(doc.file_path);
    if (data.publicUrl) window.open(data.publicUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-slate-50">
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

      <main className="max-w-[1440px] mx-auto p-4 lg:p-8">
        <section className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl p-8 sm:p-12 mb-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <FolderOpen className="w-10 h-10" />
            <h2 className="text-2xl sm:text-4xl font-extrabold">Documents Utiles</h2>
          </div>
          <p className="text-teal-100 text-base sm:text-lg max-w-2xl">
            Accédez à tous les documents importants : accords, PV de CSE, bilans sociaux et guides pratiques.
          </p>
        </section>

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
            {categoryFilters.map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedCategory === cat ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{cat}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {types.map((type) => (
              <button key={type} onClick={() => setSelectedType(type)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedType === type ? "bg-red-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{type}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 gap-3">
            <Loader2 className="w-5 h-5 animate-spin" /> Chargement des documents…
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDocuments.map((doc) => {
              const type = getDocType(doc.file_type, doc.file_name);
              const Icon = getIcon(type);
              return (
                <div key={doc.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 text-sm truncate">{doc.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{doc.description || doc.file_name}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <span className="text-[10px] text-slate-400">{formatDate(doc.created_at)}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-slate-100 rounded-full text-slate-500">{doc.document_categories?.name || "Sans catégorie"}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-red-50 rounded-full text-red-600">{type}</span>
                      <span className="text-[10px] text-slate-400">{formatSize(doc.file_size)}</span>
                    </div>
                  </div>
                  <button onClick={() => downloadDocument(doc)} className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors flex-shrink-0">
                    <Download className="w-4 h-4" /> Télécharger
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {!loading && filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Aucun document trouvé</p>
          </div>
        )}
      </main>

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
