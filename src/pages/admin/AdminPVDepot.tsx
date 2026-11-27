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

type OcrConfig = { deg: number; binarize: boolean };

// Mots-outils français les plus courants : un OCR réussi en reconnaît
// forcément une bonne partie, un OCR perdu n'en produit presque jamais.
// Les accents sont retirés avant comparaison (l'OCR les omet souvent).
const FRENCH_STOPWORDS = [
  "le", "la", "les", "de", "des", "du", "et", "en", "est", "un", "une",
  "pour", "dans", "par", "sur", "que", "qui", "au", "aux", "pas", "plus",
  "avec", "ont", "ete", "nous", "vous", "cette", "sont", "leur", "mais",
  "etre", "ainsi", "dont", "chez", "sans", "sous", "entre", "apres", "avant",
];

function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function frenchHits(text: string): number {
  const set = new Set(stripAccents(text.toLowerCase()).split(/[^a-z]+/));
  return FRENCH_STOPWORDS.filter((w) => set.has(w)).length;
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

// Clé canonique de nom de fichier : minuscules, sans accents, sans extension,
// sans suffixe de hachage (ex. "_1d07703add") ni séparateurs. Sert à détecter
// dynamiquement les doublons entre la racine et les dossiers typés.
function canonPath(name: string): string {
  return stripAccents(name.toLowerCase())
    .replace(/\.pdf$/, "")
    .replace(/_[0-9a-f]{6,}$/, "")
    .replace(/[^a-z0-9]/g, "");
}

// Détecte les fichiers posés à la racine du bucket dont une copie identique
// existe dans les dossiers typés, par comparaison de noms canoniques.
function findRootDuplicates(files: StoredFile[]): { path: string; twin: string }[] {
  const folders = files.filter((f) => f.path.includes("/"));
  const byCanon = new Map<string, string>();
  for (const f of folders) {
    const k = canonPath(f.name);
    if (!byCanon.has(k)) byCanon.set(k, f.path);
  }
  return files
    .filter((f) => !f.path.includes("/") && byCanon.has(canonPath(f.name)))
    .map((f) => ({ path: f.path, twin: byCanon.get(canonPath(f.name))! }));
}
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

  // Nettoie l'image rendue pour l'OCR : niveaux de gris puis étirement de
  // contraste (fonds gris de fax), ou binarisation par seuil d'Otsu.
  const enhanceCanvas = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    binarize: boolean
  ) => {
    const img = ctx.getImageData(0, 0, width, height);
    const d = img.data;
    const total = width * height;
    const hist = new Array(256).fill(0);
    for (let i = 0; i < d.length; i += 4) {
      const g = (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114) | 0;
      d[i] = d[i + 1] = d[i + 2] = g;
      hist[g]++;
    }
    if (binarize) {
      let sum = 0;
      for (let v = 0; v < 256; v++) sum += v * hist[v];
      let sumB = 0;
      let wB = 0;
      let best = -1;
      let threshold = 128;
      for (let v = 0; v < 256; v++) {
        wB += hist[v];
        if (wB === 0) continue;
        const wF = total - wB;
        if (wF === 0) break;
        sumB += v * hist[v];
        const mB = sumB / wB;
        const mF = (sum - sumB) / wF;
        const between = wB * wF * (mB - mF) * (mB - mF);
        if (between > best) { best = between; threshold = v; }
      }
      for (let i = 0; i < d.length; i += 4) {
        d[i] = d[i + 1] = d[i + 2] = d[i] <= threshold ? 0 : 255;
      }
    } else {
      let lo = 0;
      let hi = 255;
      let acc = 0;
      for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc >= total * 0.02) { lo = v; break; } }
      acc = 0;
      for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc >= total * 0.98) { hi = v; break; } }
      const range = Math.max(1, hi - lo);
      for (let i = 0; i < d.length; i += 4) {
        const g = Math.max(0, Math.min(255, ((d[i] - lo) * 255) / range));
        d[i] = d[i + 1] = d[i + 2] = g;
      }
    }
    ctx.putImageData(img, 0, 0);
  };

  // Rend la page en visant ~2400 px de large (≈ 290 DPI pour un A4) au lieu
  // d'un agrandissement fixe x2, nettoie l'image, puis la pivote si besoin
  // (les scans insérés de côté ou à l'envers sont ainsi reconnus).
  const ocrPage = async (
    worker: Awaited<ReturnType<typeof createWorker>>,
    page: pdfjsLib.PDFPageProxy,
    cfg: OcrConfig
  ): Promise<string> => {
    const base = page.getViewport({ scale: 1 });
    const scale = Math.min(4, Math.max(2, 2400 / base.width));
    const viewport = page.getViewport({ scale });
    const src = document.createElement("canvas");
    src.width = viewport.width;
    src.height = viewport.height;
    const sctx = src.getContext("2d")!;
    await page.render({ canvasContext: sctx as any, viewport }).promise;
    enhanceCanvas(sctx, src.width, src.height, cfg.binarize);
    let canvas = src;
    if (cfg.deg) {
      const rotated = document.createElement("canvas");
      rotated.width = cfg.deg % 180 === 0 ? src.width : src.height;
      rotated.height = cfg.deg % 180 === 0 ? src.height : src.width;
      const rctx = rotated.getContext("2d")!;
      rctx.translate(rotated.width / 2, rotated.height / 2);
      rctx.rotate((cfg.deg * Math.PI) / 180);
      rctx.drawImage(src, -src.width / 2, -src.height / 2);
      canvas = rotated;
    }
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

      // Calibrage sur la première page : on teste 4 orientations x 2
      // traitements d'image et on garde la combinaison qui produit le texte
      // le plus vraisemblable. Sortie immédiate si la lecture est nette.
      const configs: OcrConfig[] = [
        { deg: 0, binarize: false },
        { deg: 0, binarize: true },
        { deg: 90, binarize: false },
        { deg: 90, binarize: true },
        { deg: 180, binarize: false },
        { deg: 180, binarize: true },
        { deg: 270, binarize: false },
        { deg: 270, binarize: true },
      ];
      const score = (t: string): number => frenchHits(t) * Math.log10(Math.max(10, t.length));
      let best = configs[0];
      let bestScore = -1;
      const page1 = await pdf.getPage(1);
      for (let c = 0; c < configs.length; c++) {
        const cfg = configs[c];
        onProgress(`Calibrage OCR ${c + 1}/${configs.length} (orientation ${cfg.deg}°${cfg.binarize ? ", binaire" : ""})...`);
        const sample = await ocrPage(worker, page1, cfg);
        const s = score(sample);
        if (s > bestScore) { bestScore = s; best = cfg; }
        if (c === 0 && frenchHits(sample) >= 15 && sample.length >= 300) break;
      }
      console.log(`[OCR] calibrage retenu : orientation ${best.deg}°, binarisation=${best.binarize}, score=${bestScore.toFixed(1)}`);

      const texts: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        onProgress(`OCR page ${i}/${pdf.numPages}...`);
        const page = await pdf.getPage(i);
        texts.push(await ocrPage(worker, page, best));
      }

      const text = texts.join("\n").trim();
      const ocrDensity = letterDensity(text);
      const hits = frenchHits(text);
      console.log(`[OCR] texte extrait : ${text.length} caractères, densité de lettres ${(ocrDensity * 100).toFixed(0)} %, mots-outils reconnus ${hits}`);
      if (text.length < 50) throw new Error(`OCR échoué — seulement ${text.length} caractères reconnus`);
      if (ocrDensity < 0.3 || hits < 6) {
        throw new Error("OCR illisible — le document est probablement une image de trop mauvaise qualité pour être indexé. Rescannez-le en 300 DPI ou fournissez un PDF contenant déjà le texte.");
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

      // 4. Supprime par batch, en parallèle
      const results = await Promise.allSettled(
        orphans.map((orphan) => supabase.from("pv_documents").delete().eq("filename", orphan))
      );
      const deleted = results.filter((r) => r.status === "fulfilled").length;

      toast.success(`${deleted} entrée(s) orpheline(s) supprimée(s) de l'index.`);
      await loadFiles();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors du nettoyage");
    } finally {
      setCleaningOrphans(false);
    }
  };

  const purgeRootDuplicates = async () => {
    if (rootDuplicates.length === 0) {
      toast.info("Aucun doublon racine détecté — rien à purger.");
      return;
    }
    if (
      !confirm(
        `Supprimer les ${rootDuplicates.length} doublon(s) de la racine ?\n\n` +
          rootDuplicates.map((d) => `• ${d.path} (doublon de ${d.twin})`).join("\n") +
          `\n\nUne copie identique existe déjà dans les dossiers typés (Accord/, CSE/...). Fichiers et index seront supprimés.`
      )
    )
      return;
    setPurgingDuplicates(true);
    try {
      const paths = rootDuplicates.map((d) => d.path);
      const { error: removeError } = await supabase.storage.from("pv-documents").remove(paths);
      if (removeError) throw removeError;
      // Suppression des entrées d'index en parallèle (au lieu d'une boucle await séquentielle).
      const results = await Promise.allSettled(
        paths.map((path) => supabase.from("pv_documents").delete().eq("filename", path))
      );
      const failed = results.filter((r) => r.status === "rejected").length;
      const count = rootDuplicates.length;
      if (failed > 0) {
        toast.error(`${count - failed} doublon(s) supprimé(s), ${failed} suppression(s) d'index en échec — rechargez puis réessayez.`);
      } else {
        toast.success(`${count} doublon(s) racine supprimé(s) — fichiers et index nettoyés.`);
      }
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

  // Doublons racine recalculés à chaque chargement (plus de liste figée en dur).
  const rootDuplicates = findRootDuplicates(files);

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
              disabled={purgingDuplicates || loading || rootDuplicates.length === 0}
              className="text-xs text-red-700 border-red-300 hover:bg-red-50"
              title="Supprime les fichiers de la racine du bucket dont une copie identique existe déjà dans les dossiers typés (détection automatique par nom normalisé)"
            >
              {purgingDuplicates ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Trash2 className="w-3 h-3 mr-1" />}
              {`Purger les doublons racine (${rootDuplicates.length})`}
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
