import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  BookOpen,
  Download,
  FileBadge,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  FolderOpen,
  Handshake,
  Loader2,
  Mail,
  Search,
  Shield,
  Trophy,
  UserPlus,
} from "lucide-react";

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

const defaultCategories = [
  { icon: Handshake, title: "Accords collectifs", text: "Accords UES, temps de travail, prévoyance, mutuelle, GEPP." },
  { icon: Trophy, title: "CSE / élections", text: "Résultats, communications CSE, bilans et documents électoraux." },
  { icon: UserPlus, title: "Adhésion", text: "Bulletins, informations pratiques et documents à transmettre." },
  { icon: Shield, title: "Droits salariés", text: "Repères, modèles et ressources utiles pour vos démarches." },
];

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
    return (
      (selectedCategory === "Toutes" || category === selectedCategory) &&
      (selectedType === "Tous" || type === selectedType) &&
      (q === "" ||
        doc.title.toLowerCase().includes(q) ||
        (doc.description || "").toLowerCase().includes(q) ||
        doc.file_name.toLowerCase().includes(q))
    );
  });

  const downloadDocument = (doc: DocumentRow) => {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(doc.file_path);
    if (data.publicUrl) window.open(data.publicUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 p-3 sm:p-4 lg:p-8">
      <section className="relative overflow-hidden rounded-3xl bg-[#13233A] p-6 text-white shadow-xl sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border-[52px] border-white/5" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-red-600/25 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <Badge className="mb-4 border border-white/15 bg-white/10 text-white hover:bg-white/10">
              <FolderOpen className="mr-1 h-3.5 w-3.5" /> Documents utiles
            </Badge>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              Accords, ressources et documents FO COM
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/80 sm:text-lg">
              Retrouvez les documents importants : accords collectifs, ressources CSE, tracts, bulletins, modèles et guides pratiques.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="bg-red-600 text-white hover:bg-red-700">
                <Link to="/adhesion"><UserPlus className="mr-2 h-4 w-4" /> Adhérer</Link>
              </Button>
              <Button asChild variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                <Link to="/contact"><Mail className="mr-2 h-4 w-4" /> Demander un document</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {defaultCategories.map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <item.icon className="mb-3 h-5 w-5 text-red-200" />
                <p className="font-bold">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/70">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un document..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Filter className="h-4 w-4" /> Filtrer
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {categoryFilters.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedCategory === cat ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {types.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedType === type ? "bg-red-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6">
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" /> Chargement des documents…
          </div>
        ) : filteredDocuments.length > 0 ? (
          <div className="grid gap-3">
            {filteredDocuments.map((doc) => {
              const type = getDocType(doc.file_type, doc.file_name);
              const Icon = getIcon(type);
              return (
                <Card key={doc.id} className="border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-extrabold text-slate-900">{doc.title}</h3>
                      <p className="mt-0.5 text-xs text-slate-500">{doc.description || doc.file_name}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">{formatDate(doc.created_at)}</span>
                        <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700">{doc.document_categories?.name || "Sans catégorie"}</span>
                        <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">{type}</span>
                        <span className="text-[10px] text-slate-400">{formatSize(doc.file_size)}</span>
                      </div>
                    </div>
                    <Button onClick={() => downloadDocument(doc)} className="shrink-0 bg-teal-600 text-white hover:bg-teal-700">
                      <Download className="mr-2 h-4 w-4" /> Télécharger
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center">
            <BookOpen className="mx-auto mb-3 h-12 w-12 text-slate-300" />
            <p className="text-slate-500">Aucun document trouvé</p>
          </div>
        )}
      </section>
    </main>
  );
}
