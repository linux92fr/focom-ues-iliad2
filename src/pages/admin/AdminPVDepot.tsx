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
} from "lucide-react";

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/embed-pv`;

interface StoredFile {
  name: string;
  size: number;
  created_at: string;
  indexed: boolean;
  chunk_count?: number;
}

interface FileStatus {
  filename: string;
  status: "uploading" | "indexing" | "done" | "error";
  message?: string;
}

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Supabase Storage n'accepte pas les espaces ni les caractères spéciaux
function sanitizeStorageKey(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // supprime les accents
    .replace(/[^a-zA-Z0-9._-]/g, "_") // remplace tout caractère invalide par _
    .replace(/_+/g, "_"); // évite les __ consécutifs
}

export default function AdminPVDepot() {
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [fileStatuses, setFileStatuses] = useState<Record<string, FileStatus>>({});

  React.useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setLoading(true);
    try {
      // Fichiers dans le bucket
      const { data: storageFiles, error: storageError } = await supabase.storage
        .from("pv-documents")
        .list("", { sortBy: { column: "created_at", order: "desc" } });

      if (storageError) throw storageError;

      // Fichiers déjà indexés
      const { data: indexedData } = await supabase
        .from("pv_documents")
        .select("filename, chunk_index");

      const indexedMap: Record<string, number> = {};
      (indexedData ?? []).forEach((row) => {
        indexedMap[row.filename] = (indexedMap[row.filename] ?? 0) + 1;
      });

      const result: StoredFile[] = (storageFiles ?? [])
        .filter((f) => f.name !== ".emptyFolderPlaceholder")
        .map((f) => ({
          name: f.name,
          size: f.metadata?.size ?? 0,
          created_at: f.created_at ?? "",
          indexed: !!indexedMap[f.name],
          chunk_count: indexedMap[f.name],
        }));

      setFiles(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const setStatus = (filename: string, status: FileStatus) => {
    setFileStatuses((prev) => ({ ...prev, [filename]: status }));
  };

  // Extraction texte natif (PDF avec couche texte)
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

  // Rendu d'une page PDF en canvas et OCR
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

    // PDF scanné → OCR automatique
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
    const displayName = file.name;
    const storageKey = sanitizeStorageKey(file.name);
    setStatus(displayName, { filename: displayName, status: "uploading", message: "Envoi vers le stockage..." });

    try {
      // 1. Upload vers Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("pv-documents")
        .upload(storageKey, file, { upsert: true });
      if (uploadError) throw uploadError;

      // 2. Extraction du texte (natif ou OCR)
      setStatus(displayName, { filename: displayName, status: "indexing", message: "Extraction du texte..." });
      const arrayBuffer = await file.arrayBuffer();
      const { text, usedOcr } = await extractText(arrayBuffer, (msg) =>
        setStatus(displayName, { filename: displayName, status: "indexing", message: msg })
      );

      // 3. Indexation via Edge Function
      console.log(`[SEND] filename=${storageKey} text.length=${text?.length} usedOcr=${usedOcr} text_preview="${text?.slice(0, 80)}"`);
      setStatus(displayName, { filename: displayName, status: "indexing", message: "Indexation en cours..." });
      const authHeader = await getAuthHeader();
      const resp = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers: { ...authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({ text, filename: storageKey }),
      });

      const result = await resp.json();
      console.log(`[RESP] status=${resp.status}`, result);
      if (!resp.ok) throw new Error(result.error ?? "Erreur serveur");

      setStatus(displayName, {
        filename: displayName,
        status: "done",
        message: `${result.chunks_indexed} sections indexées${usedOcr ? " (via OCR)" : ""}`,
      });

      await loadFiles();
    } catch (err) {
      setStatus(displayName, {
        filename: displayName,
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
      for (const file of pdfs) {
        await uploadAndIndex(file);
      }
    },
    []
  );

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const pdfs = Array.from(e.target.files ?? []).filter((f) => f.name.endsWith(".pdf"));
    for (const file of pdfs) {
      await uploadAndIndex(file);
    }
    e.target.value = "";
  };

  const reindex = async (filename: string) => {
    setStatus(filename, { filename, status: "indexing", message: "Téléchargement..." });
    try {
      const { data, error } = await supabase.storage.from("pv-documents").download(filename);
      if (error || !data) throw new Error("Impossible de télécharger le fichier");

      const arrayBuffer = await data.arrayBuffer();
      const { text, usedOcr } = await extractText(arrayBuffer, (msg) =>
        setStatus(filename, { filename, status: "indexing", message: msg })
      );

      setStatus(filename, { filename, status: "indexing", message: "Indexation..." });
      const authHeader = await getAuthHeader();
      const resp = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers: { ...authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({ text, filename }),
      });
      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error ?? "Erreur serveur");
      setStatus(filename, {
        filename,
        status: "done",
        message: `${result.chunks_indexed} sections indexées${usedOcr ? " (via OCR)" : ""}`,
      });
      await loadFiles();
    } catch (err) {
      setStatus(filename, {
        filename,
        status: "error",
        message: err instanceof Error ? err.message : "Erreur",
      });
    }
  };

  const deleteFile = async (filename: string) => {
    if (!confirm(`Supprimer "${filename}" et ses données d'indexation ?`)) return;
    await supabase.storage.from("pv-documents").remove([filename]);
    await supabase.from("pv_documents").delete().eq("filename", filename);
    setFileStatuses((prev) => {
      const next = { ...prev };
      delete next[filename];
      return next;
    });
    await loadFiles();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
    return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dépôt des PV du CSE</h1>
        <p className="text-slate-500 mt-1">
          Déposez vos PDF ici pour les indexer et les rendre consultables via la recherche.
        </p>
      </div>

      {/* Zone de dépôt */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
          dragging
            ? "border-blue-500 bg-blue-50"
            : "border-slate-300 hover:border-slate-400 bg-slate-50"
        }`}
      >
        <CloudUpload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-slate-700 mb-1">
          Glissez-déposez vos PDF ici
        </p>
        <p className="text-sm text-slate-500 mb-4">ou</p>
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
              key={s.filename}
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
                <span className="font-medium">{s.filename}</span> — {s.message}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Liste des fichiers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="w-4 h-4" />
            Fichiers déposés ({files.length})
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={loadFiles} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
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
            <ul className="divide-y">
              {files.map((file) => {
                const status = fileStatuses[file.name];
                const isProcessing =
                  status?.status === "uploading" || status?.status === "indexing";
                return (
                  <li key={file.name} className="flex items-center justify-between py-3 gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="w-5 h-5 text-slate-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800 truncate">{file.name}</p>
                        <p className="text-xs text-slate-500">
                          {formatSize(file.size)} ·{" "}
                          {new Date(file.created_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isProcessing ? (
                        <Badge variant="secondary" className="gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          {status?.status === "uploading" ? "Envoi..." : "Indexation..."}
                        </Badge>
                      ) : file.indexed ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {file.chunk_count} sections
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-orange-600 border-orange-300">
                          Non indexé
                        </Badge>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => reindex(file.name)}
                        disabled={isProcessing}
                        title="Re-indexer"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteFile(file.name)}
                        disabled={isProcessing}
                        title="Supprimer"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
