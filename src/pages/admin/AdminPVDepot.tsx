import React, { useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import PdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?worker";
import { createWorker } from "tesseract.js";
import { supabase } from "@/integrations/supabase/client";
import { AdminAuthGuard } from "@/components/admin/AdminLayout";

pdfjsLib.GlobalWorkerOptions.workerPort = new PdfjsWorker();
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileText,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Loader2,
  CloudUpload,
  Folder,
  ChevronRight,
  ShieldCheck,
  KeyRound,
} from "lucide-react";
import { toast } from "sonner";

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/embed-pv`;

const TYPES = ["CSE", "CSSCT", "NAO", "Accord", "Reglement", "Charte", "Note", "Autre"];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 2018 + 1 }, (_, i) => String(CURRENT_YEAR - i));

interface StoredFile {
  name: string;
  path: string;
  size: number;
  created_at: string;
  indexed: boolean;
  chunk_count?: number;
}

interface FileStatus {
  path: string;
  status: "uploading" | "indexing" | "done" | "error";
  message?: string;
}

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function sanitizeStorageKey(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_");
}

// Densité de lettres du texte extrait : détecte les textes natifs illisibles (glyphes vides, symboles).
function letterDensity(text: string): number {
  if (!text.length) return 0;
  return (text.match(/[A-Za-zÀ-ÿ]/g) ?? []).length / text.length;
}

// Comptage des sections indexées par fichier.
// L'API Supabase plafonne les réponses à 1000 lignes : la requête directe sur
// pv_documents ne renvoie qu'une fraction des 10 000+ sections. On passe par
// une RPC d'agrégation (1 ligne par fichier), avec repli paginé si besoin.
async function fetchIndexedMap(): Promise<Record<string, number>> {
  const map: Record<string, number> = {};
  const { data: rpcData, error: rpcError } = await supabase.rpc("pv_document_chunk_counts");
  if (!rpcError && Array.isArray(rpcData)) {
    for (const row of rpcData as { filename: string; chunks: number }[]) {
      map[row.filename] = row.chunks;
    }
    return map;
  }
  if (rpcError) {
    console.warn("[INDEX] RPC pv_document_chunk_counts indisponible, repli paginé", rpcError);
  }
  let from = 0;
  for (;;) {
    const { data } = await supabase
      .from("pv_documents")
      .select("filename, chunk_index")
      .range(from, from + 999);
    const rows = (data ?? []) as { filename: string }[];
    for (const row of rows) {
      map[row.filename] = (map[row.filename] ?? 0) + 1;
    }
    if (rows.length < 1000) break;
    from += 1000;
  }
  return map;
}

// Fichiers posés à la racine du bucket dont une copie identique existe dans les
// dossiers typés. Vérifié le 26/11/2026 par nom normalisé (suffixes de hachage
// ignorés), empreinte du texte indexé et similarité trigram (> 0,9 uniquement).
const ROOT_DUPLICATES: { path: string; twin: string }[] = [
  { path: "2021_03_11_Accord_temps_de_travail_1d07703add.pdf", twin: "Accord/2021_03_11_Accord_temps_de_travail_1d07703add.pdf" },
  { path: "2022_9_02_accord_dialogue_social_UES_Iliad_80e633537c.pdf", twin: "Accord/2022_9_02_accord_dialogue_social_UES_Iliad.pdf" },
  { path: "20220802_Avenant_accord_temps_de_travail_8085fd3e87.pdf", twin: "Accord/20220802_Avenant_accord_temps_de_travail_8085fd3e87.pdf" },
  { path: "20230408_UES_Iliad_Proces_verbal_de_desaccord_NAO_b415d26cb5.pdf", twin: "Accord/20230408_UES_Iliad_Proces_verbal_de_desaccord_NAO_b415d26cb5.pdf" },
  { path: "20230911_UES_Iliad_Accord_temps_de_travail_avenant_2_681a3683b9.pdf", twin: "Accord/20230911_UES_Iliad_Accord_temps_de_travail_avenant_2_681a3683b9.pdf" },
  { path: "2024_06_26_Accord_NAO_UES_ILIAD_5dffd9c1eb.pdf", twin: "Accord/2024_06_26_Accord_NAO_UES_ILIAD.pdf" },
  { path: "2023_UES_Iliad_Accord_Handicap_c25feb352a.pdf", twin: "Accord/Accord_Handicap_2023_UES_ILIAD.pdf" },
  { path: "2022_UES_Iliad_Accord_NAO_b938269135.pdf", twin: "Accord/2022_Accord_NAO_UES_ILIAD.pdf" },
  { path: "Accord_GPEC_a26d310717.pdf", twin: "Accord/Accord_GPEC.pdf" },
  { path: "Accord_Groupe_Iliad_-_Egalite_professionnelle_et_qualite_de_vie_au_travail.pdf", twin: "Accord/Accord_Groupe_Iliad_-_Egalite_professionnelle_et_qualite_de_vie_au_travail.pdf" },
  { path: "Accord_Regime_des_Inventions_de_Salaries_2017_12_19_5cf94d8a30.pdf", twin: "Accord/Accord_Regime_des_Inventions_de_Salaries_2017_12_19.pdf" },
  { path: "Charte_Teletravail_Formulaire_Adhesion_0353d1e75f.pdf", twin: "Accord/Charte_Teletravail_Formulaire_Adhesion_0353d1e75f.pdf" },
  { path: "Charte_teletravail_0a6b0cd370.pdf", twin: "Accord/CHARTE_SUR_LE_TELETRAVAIL_UESILIAD.pdf" },
  { path: "VF_signee_28_05_2025_Projet_Accord_NAO_UES_ILIAD_2025_31464150d3_3aecdb8036.pdf", twin: "Accord/VF_signee_28_05_2025_Projet_Accord_NAO_UES_ILIAD_20253.pdf" },
  { path: "PV_REUNION_ORDINIARE_CSE_DU_24_FEVRIER_2022.pdf", twin: "CSE/2022/2022_02_24_Proces_Verbal_CSE_Iliad_316073f819.pdf" },
];

function AdminPVDepotContent() {
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [fileStatuses, setFileStatuses] = useState<Record<string, FileStatus>>({});
  const [selectedType, setSelectedType] = useState("CSE");
  const [selectedYear, setSelectedYear] = useState(String(CURRENT_YEAR));
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [cleaningOrphans, setCleaningOrphans] = useState(false);
  const [purgingDuplicates, setPurgingDuplicates] = useState(false);
  const [accessCodeDraft, setAccessCodeDraft] = useState("");
  const [savingAccessCode, setSavingAccessCode] = useState(false);

  React.useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setLoading(true);
    try {
      // Liste récursive depuis la racine
      const allFiles: StoredFile[] = [];
      const indexedMap = await fetchIndexedMap();

      // Lister tous les types (dossiers racine)
      const { data: rootItems } = await supabase.storage
        .from("pv-documents")
        .list("", { sortBy: { column: "name", order: "asc" } });

      for (const item of rootItems ?? []) {
        if (item.name === ".emptyFolderPlaceholder") continue;
        if (!item.metadata) {
          // C'est un dossier (type)
          const { data: yearItems } = await supabase.storage
            .from("pv-documents")
            .list(item.name, { sortBy: { column: "name", order: "asc" } });

          for (const yearItem of yearItems ?? []) {
            if (yearItem.name === ".emptyFolderPlaceholder") continue;
            if (!yearItem.metadata) {
              // C'est un sous-dossier (année)
              const prefix = `${item.name}/${yearItem.name}`;
              const { data: pdfItems } = await supabase.storage
                .from("pv-documents")
                .list(prefix, { sortBy: { column: "created_at", order: "desc" } });

              for (const pdf of pdfItems ?? []) {
                if (pdf.name === ".emptyFolderPlaceholder") continue;
                const fullPath = `${prefix}/${pdf.name}`;
                allFiles.push({
                  name: pdf.name,
                  path: fullPath,
                  size: pdf.metadata?.size ?? 0,
                  created_at: pdf.created_at ?? "",
                  indexed: !!indexedMap[fullPath],
                  chunk_count: indexedMap[fullPath],
                });
              }
            } else {
              // Fichier directement dans le dossier type (ancien format)
              const fullPath = `${item.name}/${yearItem.name}`;
              allFiles.push({
                name: yearItem.name,
                path: fullPath,
                size: yearItem.metadata?.size ?? 0,
                created_at: yearItem.created_at ?? "",
                indexed: !!indexedMap[fullPath],
                chunk_count: indexedMap[fullPath],
              });
            }
          }
        } else {
          // Fichier à la racine (ancien format plat)
          allFiles.push({
            name: item.name,
            path: item.name,
            size: item.metadata?.size ?? 0,
            created_at: item.created_at ?? "",
            indexed: !!indexedMap[item.name],
            chunk_count: indexedMap[item.name],
          });
        }
      }

      setFiles(allFiles);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const setStatus = (path: string, status: FileStatus) => {
    setFileStatuses((prev) => ({ ...prev, [path]: status }));
  };

  const extractNativeText = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer.slice(0)) }).promise;
    const pages: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      pages.push(content.items.map((item: any) => item.str).join(" "));
    }
    return pages.join("\n").trim();
  };

  const ocrPage = async (
    worker: Awaited<ReturnType<typeof createWorker>>,
    page: pdfjsLib.PDFPageProxy
  ): Promise<string> => {
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx as any, viewport }).promise;
    const { data } = await worker.recognize(canvas);
    return data.text;
  };

  const extractText = async (
    arrayBuffer: ArrayBuffer,
    onProgress: (msg: string) => void
  ): Promise<{ text: string; usedOcr: boolean }> => {
    onProgress("Extraction du texte...");
    const native = await extractNativeText(arrayBuffer);
    const density = letterDensity(native);
    console.log(`[PDF] texte natif extrait : ${native.length} caractères, densité de lettres ${(density * 100).toFixed(0)} %`);
    if (native.length >= 100 && density >= 0.5) return { text: native, usedOcr: false };

    if (native.length >= 100) {
      onProgress(`Texte natif illisible (${(density * 100).toFixed(0)} % de lettres) — passage à l'OCR...`);
    } else {
      onProgress("PDF scanné — chargement de l'OCR...");
    }
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer.slice(0)) }).promise;

    let worker: Awaited<ReturnType<typeof createWorker>> | null = null;
    try {
      worker = await createWorker("fra", 1, {
        logger: (m: any) => {
          if (m.status === "recognizing text" && m.progress) {
            onProgress(`OCR en cours... ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      const texts: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        onProgress(`OCR page ${i}/${pdf.numPages}...`);
        const page = await pdf.getPage(i);
        texts.push(await ocrPage(worker, page));
      }

      const text = texts.join("\n").trim();
      const ocrDensity = letterDensity(text);
      console.log(`[OCR] texte extrait : ${text.length} caractères, densité de lettres ${(ocrDensity * 100).toFixed(0)} %`);
      if (text.length < 50) throw new Error(`OCR échoué — seulement ${text.length} caractères reconnus`);
      if (ocrDensity < 0.3) {
        throw new Error("OCR illisible — le document est probablement une image de trop mauvaise qualité pour être indexé");
      }
      return { text, usedOcr: true };
    } finally {
      await worker?.terminate();
    }
  };

  const uploadAndIndex = async (file: File) => {
    const storagePath = selectedType === "CSE"
      ? `${selectedType}/${selectedYear}/${sanitizeStorageKey(file.name)}`
      : `${selectedType}/${sanitizeStorageKey(file.name)}`;
    const displayName = file.name;
    setStatus(storagePath, { path: storagePath, status: "uploading", message: "Envoi vers le stockage..." });

    try {
      const { error: uploadError } = await supabase.storage
        .from("pv-documents")
        .upload(storagePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      setStatus(storagePath, { path: storagePath, status: "indexing", message: "Extraction du texte..." });
      const arrayBuffer = await file.arrayBuffer();
      const { text, usedOcr } = await extractText(arrayBuffer, (msg) =>
        setStatus(storagePath, { path: storagePath, status: "indexing", message: msg })
      );

      console.log(`[SEND] path=${storagePath} text.length=${text?.length} usedOcr=${usedOcr}`);
      setStatus(storagePath, { path: storagePath, status: "indexing", message: "Indexation en cours..." });
      const authHeader = await getAuthHeader();
      const resp = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers: { ...authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({ text, filename: storagePath, original_filename: displayName }),
      });

      const result = await resp.json();
      console.log(`[RESP] status=${resp.status}`, result);
      if (!resp.ok) throw new Error(result.error ?? "Erreur serveur");
      if (!result.chunks_indexed) throw new Error("Aucune section indexée — texte trop court ou non reconnu");

      setStatus(storagePath, {
        path: storagePath,
        status: "done",
        message: `${result.chunks_indexed} sections indexées${usedOcr ? " (via OCR)" : ""}`,
      });

      await loadFiles();
    } catch (err) {
      setStatus(storagePath, {
        path: storagePath,
        status: "error",
        message: err instanceof Error ? err.message : "Erreur inconnue",
      });
    }
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const pdfs = Array.from(e.dataTransfer.files).filter((f) => f.name.endsWith(".pdf"));
      for (const file of pdfs) await uploadAndIndex(file);
    },
    [selectedType, selectedYear]
  );

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const pdfs = Array.from(e.target.files ?? []).filter((f) => f.name.endsWith(".pdf"));
    for (const file of pdfs) await uploadAndIndex(file);
    e.target.value = "";
  };

  const reindex = async (filePath: string) => {
    setStatus(filePath, { path: filePath, status: "indexing", message: "Téléchargement..." });
    try {
      const { data, error } = await supabase.storage.from("pv-documents").download(filePath);
      if (error || !data) throw new Error("Impossible de télécharger le fichier");

      const arrayBuffer = await data.arrayBuffer();
      const { text, usedOcr } = await extractText(arrayBuffer, (msg) =>
        setStatus(filePath, { path: filePath, status: "indexing", message: msg })
      );

      console.log(`[REINDEX] path=${filePath} text.length=${text?.length} usedOcr=${usedOcr}`);
      setStatus(filePath, { path: filePath, status: "indexing", message: "Indexation..." });
      const authHeader = await getAuthHeader();
      const resp = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers: { ...authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({ text, filename: filePath, original_filename: filePath.split("/").pop() }),
      });
      const result = await resp.json();
      console.log(`[REINDEX RESP] status=${resp.status}`, result);
      if (!resp.ok) throw new Error(result.error ?? "Erreur serveur");
      if (!result.chunks_indexed) throw new Error("Aucune section indexée — texte trop court ou non reconnu");
      setStatus(filePath, {
        path: filePath,
        status: "done",
        message: `${result.chunks_indexed} sections indexées${usedOcr ? " (via OCR)" : ""}`,
      });
      await loadFiles();
    } catch (err) {
      setStatus(filePath, {
        path: filePath,
        status: "error",
        message: err instanceof Error ? err.message : "Erreur",
      });
    }
  };

  const cleanOrphanedEntries = async () => {
    if (!confirm("Supprimer de l'index tous les documents dont le fichier n'existe plus dans le stockage ?")) return;
    setCleaningOrphans(true);
    try {
      // 1. Récupère tous les chemins de fichiers actuellement en storage
      const storagePaths = new Set<string>();
      const { data: rootItems } = await supabase.storage.from("pv-documents").list("", { sortBy: { column: "name", order: "asc" } });
      for (const item of rootItems ?? []) {
        if (item.name === ".emptyFolderPlaceholder") continue;
        if (!item.metadata) {
          const { data: yearItems } = await supabase.storage.from("pv-documents").list(item.name);
          for (const yearItem of yearItems ?? []) {
            if (yearItem.name === ".emptyFolderPlaceholder") continue;
            if (!yearItem.metadata) {
              const { data: pdfItems } = await supabase.storage.from("pv-documents").list(`${item.name}/${yearItem.name}`);
              for (const pdf of pdfItems ?? []) {
                if (pdf.name !== ".emptyFolderPlaceholder") storagePaths.add(`${item.name}/${yearItem.name}/${pdf.name}`);
              }
            } else {
              storagePaths.add(`${item.name}/${yearItem.name}`);
            }
          }
        } else {
          storagePaths.add(item.name);
        }
      }

      // 2. Récupère tous les filenames distincts dans pv_documents
      const indexedMap = await fetchIndexedMap();
      const dbFilenames = Object.keys(indexedMap);

      // 3. Identifie les orphelins (dans DB mais pas en storage)
      const orphans = dbFilenames.filter((f) => !storagePaths.has(f));

      if (orphans.length === 0) {
        toast.success("Aucune entrée orpheline trouvée — tout est cohérent.");
        return;
      }

      // 4. Supprime par batch
      let deleted = 0;
      for (const orphan of orphans) {
        await supabase.from("pv_documents").delete().eq("filename", orphan);
        deleted++;
      }

      toast.success(`${deleted} entrée(s) orpheline(s) supprimée(s) de l'index.`);
      await loadFiles();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors du nettoyage");
    } finally {
      setCleaningOrphans(false);
    }
  };

  const purgeRootDuplicates = async () => {
    if (!confirm(`Supprimer les ${ROOT_DUPLICATES.length} doublons de la racine ?\n\nUne copie identique existe déjà dans les dossiers typés (Accord/, CSE/...). Fichiers et index seront supprimés.`)) return;
    setPurgingDuplicates(true);
    let deleted = 0;
    try {
      const paths = ROOT_DUPLICATES.map((d) => d.path);
      const { error: removeError } = await supabase.storage.from("pv-documents").remove(paths);
      if (removeError) throw removeError;
      for (const path of paths) {
        await supabase.from("pv_documents").delete().eq("filename", path);
        deleted++;
      }
      toast.success(`${deleted} doublon(s) racine supprimé(s) — fichiers et index nettoyés.`);
      await loadFiles();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur pendant la purge des doublons");
    } finally {
      setPurgingDuplicates(false);
    }
  };

  // Mise à jour du code d'accès partagé à la recherche (sans compte).
  // Le code est vérifié et haché côté serveur : il ne transite jamais en
  // clair dans la base et n'est jamais relu par l'interface.
  const updateAccessCode = async () => {
    const code = accessCodeDraft.trim();
    if (code.length < 4) {
      toast.error("Le code doit contenir au moins 4 caractères.");
      return;
    }
    setSavingAccessCode(true);
    try {
      const authHeader = await getAuthHeader();
      const resp = await fetch(`${EDGE_FUNCTION_URL}/set-code`, {
        method: "POST",
        headers: { ...authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error ?? "Erreur serveur");
      setAccessCodeDraft("");
      toast.success("Code d'accès mis à jour — actif immédiatement pour les nouvelles recherches.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la mise à jour du code");
    } finally {
      setSavingAccessCode(false);
    }
  };

  const deleteFile = async (filePath: string) => {
    if (!confirm(`Supprimer ce fichier et ses données d'indexation ?`)) return;
    await supabase.storage.from("pv-documents").remove([filePath]);
    await supabase.from("pv_documents").delete().eq("filename", filePath);
    setFileStatuses((prev) => {
      const next = { ...prev };
      delete next[filePath];
      return next;
    });
    await loadFiles();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
    return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
  };

  // Groupement par type/année
  const grouped: Record<string, Record<string, StoredFile[]>> = {};
  for (const f of files) {
    const parts = f.path.split("/");
    const type = parts.length >= 3 ? parts[0] : "Racine";
    const year = parts.length >= 3 ? parts[1] : "";
    if (!grouped[type]) grouped[type] = {};
    if (!grouped[type][year]) grouped[type][year] = [];
    grouped[type][year].push(f);
  }

  const nonIndexed = files.filter((f) => !f.indexed);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dépôt des PV du CSE</h1>
        <p className="text-slate-500 mt-1">
          Déposez vos PDF ici pour les indexer et les rendre consultables via la recherche.
        </p>
      </div>

      {/* Sélecteur dossier */}
      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <Folder className="w-5 h-5 text-slate-400 shrink-0" />
        <span className="text-sm font-medium text-slate-700">Dossier de destination :</span>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="text-sm border border-slate-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        {selectedType === "CSE" && (
          <>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="text-sm border border-slate-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </>
        )}
        <span className="text-xs text-slate-400 ml-1">
          → {selectedType === "CSE" ? `CSE/${selectedYear}/` : `${selectedType}/`}
        </span>
      </div>

      {/* Zone de dépôt */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${
          dragging
            ? "border-blue-500 bg-blue-50"
            : "border-slate-300 hover:border-slate-400 bg-slate-50"
        }`}
      >
        <CloudUpload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <p className="text-base font-medium text-slate-700 mb-1">
          Glissez-déposez vos PDF ici
        </p>
        <p className="text-xs text-slate-500 mb-3">
          Seront déposés dans <span className="font-mono bg-white border border-slate-200 rounded px-1">{selectedType === "CSE" ? `CSE/${selectedYear}/` : `${selectedType}/`}</span>
        </p>
        <label>
          <Button variant="outline" className="cursor-pointer" asChild>
            <span>
              <Upload className="w-4 h-4 mr-2" />
              Parcourir les fichiers
            </span>
          </Button>
          <input
            type="file"
            accept=".pdf"
            multiple
            className="hidden"
            onChange={handleFileInput}
          />
        </label>
        <p className="text-xs text-slate-400 mt-3">PDF uniquement · 50 Mo max par fichier</p>
      </div>

      {/* Statuts en cours */}
      {Object.values(fileStatuses).length > 0 && (
        <div className="space-y-2">
          {Object.values(fileStatuses).map((s) => (
            <Alert
              key={s.path}
              variant={s.status === "error" ? "destructive" : "default"}
            >
              {s.status === "uploading" || s.status === "indexing" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : s.status === "done" ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                <span className="font-medium">{s.path}</span> — {s.message}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Code d'accès partagé à la recherche */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="w-4 h-4" />
            Code d'accès partagé (recherche sans compte)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-500 mb-3">
            Code commun à diffuser aux collègues pour utiliser la recherche sans compte.
            La modification est immédiate ; les navigateurs ayant mémorisé l'ancien code
            devront saisir le nouveau.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              autoComplete="new-password"
              value={accessCodeDraft}
              onChange={(e) => setAccessCodeDraft(e.target.value)}
              placeholder="Nouveau code (4 caractères minimum)"
              className="flex-1 min-w-[12rem] max-w-xs text-sm border border-slate-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <Button
              onClick={updateAccessCode}
              disabled={savingAccessCode || accessCodeDraft.trim().length < 4}
            >
              {savingAccessCode ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Mettre à jour le code
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des fichiers groupés */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="w-4 h-4" />
            Fichiers déposés ({files.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            {nonIndexed.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  for (const f of nonIndexed) await reindex(f.path);
                }}
                className="text-xs"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                {`Tout ré-indexer (${nonIndexed.length})`}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={purgeRootDuplicates}
              disabled={purgingDuplicates || loading}
              className="text-xs text-red-700 border-red-300 hover:bg-red-50"
              title="Supprime les fichiers de la racine du bucket dont une copie identique existe déjà dans les dossiers typés (analyse du 26/11/2026)"
            >
              {purgingDuplicates ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Trash2 className="w-3 h-3 mr-1" />}
              {`Purger les doublons racine (${ROOT_DUPLICATES.length})`}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={cleanOrphanedEntries}
              disabled={cleaningOrphans || loading}
              className="text-xs text-amber-700 border-amber-300 hover:bg-amber-50"
              title="Supprimer les entrées d'index dont le fichier n'existe plus dans le stockage"
            >
              {cleaningOrphans ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <ShieldCheck className="w-3 h-3 mr-1" />}
              Nettoyer les orphelins
            </Button>
            <Button variant="ghost" size="sm" onClick={loadFiles} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-slate-500 py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Chargement...</span>
            </div>
          ) : files.length === 0 ? (
            <p className="text-slate-400 text-sm py-4 text-center">
              Aucun fichier déposé pour l'instant
            </p>
          ) : (
            <div className="space-y-4">
              {Object.entries(grouped).map(([type, years]) => (
                <div key={type}>
                  <div className="flex items-center gap-2 mb-2">
                    <Folder className="w-4 h-4 text-blue-500" />
                    <span className="font-semibold text-slate-700 text-sm">{type}</span>
                  </div>
                  <div className="ml-4 space-y-3">
                    {Object.entries(years).sort(([a], [b]) => b.localeCompare(a)).map(([year, yearFiles]) => (
                      <div key={year}>
                        {year && (
                          <div className="flex items-center gap-1 mb-1">
                            <Folder className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-xs font-medium text-slate-500">{year}</span>
                          </div>
                        )}
                        <ul className="ml-4 divide-y border rounded-lg">
                          {yearFiles.map((file) => {
                            const status = fileStatuses[file.path];
                            const isProcessing = status?.status === "uploading" || status?.status === "indexing";
                            return (
                              <li key={file.path} className="flex items-center justify-between px-3 py-2.5 gap-4">
                                <div className="flex items-center gap-2 min-w-0">
                                  <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-slate-800 truncate">{file.name}</p>
                                    <p className="text-xs text-slate-400">
                                      {formatSize(file.size)} · {new Date(file.created_at).toLocaleDateString("fr-FR")}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  {isProcessing ? (
                                    <Badge variant="secondary" className="gap-1 text-xs">
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                      {status?.status === "uploading" ? "Envoi..." : "Indexation..."}
                                    </Badge>
                                  ) : file.indexed ? (
                                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 gap-1 text-xs">
                                      <CheckCircle2 className="w-3 h-3" />
                                      {file.chunk_count} sections
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-orange-600 border-orange-300 text-xs">
                                      Non indexé
                                    </Badge>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => reindex(file.path)}
                                    disabled={isProcessing}
                                    title="Re-indexer"
                                    className="h-7 w-7"
                                  >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => deleteFile(file.path)}
                                    disabled={isProcessing}
                                    title="Supprimer"
                                    className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminPVDepot() {
  return (
    <AdminAuthGuard>
      <AdminPVDepotContent />
    </AdminAuthGuard>
  );
}
