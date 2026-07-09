import React, { useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import PdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?worker";
import { createWorker } from "tesseract.js";
import { supabase } from "@/integrations/supabase/client";

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
} from "lucide-react";

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/embed-pv`;

const TYPES = ["CSE", "CSSCT", "NAO", "Accord", "Autre"];
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

export default function AdminPVDepot() {
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [fileStatuses, setFileStatuses] = useState<Record<string, FileStatus>>({});
  const [selectedType, setSelectedType] = useState("CSE");
  const [selectedYear, setSelectedYear] = useState(String(CURRENT_YEAR));
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);

  React.useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setLoading(true);
    try {
      // Liste récursive depuis la racine
      const allFiles: StoredFile[] = [];
      const { data: indexedData } = await supabase
        .from("pv_documents")
        .select("filename, chunk_index");

      const indexedMap: Record<string, number> = {};
      (indexedData ?? []).forEach((row) => {
        indexedMap[row.filename] = (indexedMap[row.filename] ?? 0) + 1;
      });

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
    console.log(`[PDF] texte natif extrait : ${native.length} caractères`);
    if (native.length >= 100) return { text: native, usedOcr: false };

    onProgress("PDF scanné — chargement de l'OCR...");
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
      console.log(`[OCR] texte extrait : ${text.length} caractères`);
      if (text.length < 50) throw new Error(`OCR échoué — seulement ${text.length} caractères reconnus`);
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
        body: JSON.stringify({ text, filename: storagePath }),
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
        body: JSON.stringify({ text, filename: filePath }),
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
                Tout ré-indexer ({nonIndexed.length})
              </Button>
            )}
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
