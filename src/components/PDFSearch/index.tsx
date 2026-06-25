import React, { useState } from "react";
import { pipeline } from "@xenova/transformers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, Search, AlertCircle, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SearchResult {
  id: number;
  filename: string;
  content: string;
  similarity: number;
  chunk_index: number;
}

interface UploadStatus {
  status: "idle" | "uploading" | "extracting" | "embedding" | "storing" | "success" | "error";
  message: string;
  filename?: string;
}

export function PVSearchPage() {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({ status: "idle", message: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [documents, setDocuments] = useState<{ filename: string; chunks: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [extractor, setExtractor] = useState<any>(null);

  React.useEffect(() => {
    loadModel();
    loadDocuments();
  }, []);

  const loadModel = async () => {
    try {
      const model = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
      setExtractor(model);
    } catch (error) {
      console.error("Failed to load model:", error);
    }
  };

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from("pv_documents")
        .select("filename")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const grouped = (data ?? []).reduce((acc: { filename: string; chunks: number }[], doc) => {
        const existing = acc.find((d) => d.filename === doc.filename);
        if (existing) {
          existing.chunks += 1;
        } else {
          acc.push({ filename: doc.filename ?? "", chunks: 1 });
        }
        return acc;
      }, []);

      setDocuments(grouped);
    } catch (error) {
      console.error("Error loading documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const extractTextFromPdf = async (file: File): Promise<string> => {
    const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
    // Use the bundled worker
    GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    let fullText = "";
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => ("str" in item ? item.str : ""))
        .join(" ");
      fullText += pageText + "\n";
    }

    return fullText.trim();
  };

  const chunkText = (text: string): string[] => {
    const chunks: string[] = [];
    const CHUNK_SIZE = 1000;
    const OVERLAP = 100;

    for (let i = 0; i < text.length && chunks.length < 100; i += CHUNK_SIZE - OVERLAP) {
      const chunk = text.substring(i, i + CHUNK_SIZE).trim();
      if (chunk.length > 50) {
        chunks.push(chunk);
      }
    }

    return chunks;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.name.endsWith(".pdf")) {
      setUploadStatus({ status: "error", message: "Veuillez sélectionner un fichier PDF" });
      return;
    }

    if (!extractor) {
      setUploadStatus({
        status: "error",
        message: "Modèle d'embedding en cours de chargement... Réessayez dans quelques secondes",
      });
      return;
    }

    setUploadStatus({ status: "uploading", message: "Lecture du fichier...", filename: file.name });

    try {
      setUploadStatus({ status: "extracting", message: "Extraction du texte du PDF..." });
      const text = await extractTextFromPdf(file);

      if (text.length < 100) {
        throw new Error("PDF vide ou illisible — vérifiez que le PDF contient du texte sélectionnable (pas une image scannée)");
      }

      setUploadStatus({ status: "embedding", message: "Création des embeddings (peut prendre 30-60s)..." });
      const chunks = chunkText(text);

      if (chunks.length === 0) {
        throw new Error("Impossible d'extraire le texte du PDF");
      }

      const embeddings = await Promise.all(
        chunks.map(async (chunk) => {
          const result = await extractor(chunk, { pooling: "mean", normalize: true });
          return Array.from(result.data) as number[];
        })
      );

      const docs = chunks.map((chunk, i) => ({
        filename: file.name,
        original_filename: file.name,
        chunk_index: i,
        content: chunk,
        embedding: embeddings[i],
        metadata: {
          chunk_count: chunks.length,
          extracted_at: new Date().toISOString(),
        },
      }));

      setUploadStatus({ status: "storing", message: "Sauvegarde dans la base de données..." });
      const BATCH_SIZE = 25;
      for (let i = 0; i < docs.length; i += BATCH_SIZE) {
        const batch = docs.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from("pv_documents").insert(batch as any);
        if (error) throw error;
      }

      setUploadStatus({
        status: "success",
        message: `${chunks.length} sections indexées de "${file.name}"`,
        filename: file.name,
      });

      await loadDocuments();
      event.target.value = "";
    } catch (error) {
      setUploadStatus({
        status: "error",
        message: `Erreur: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
      });
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !extractor) return;

    setIsSearching(true);
    try {
      const queryEmbedding = await extractor(searchQuery, { pooling: "mean", normalize: true });
      const queryVector = Array.from(queryEmbedding.data) as number[];

      const { data, error } = await supabase.rpc("search_pv_documents_vector", {
        query_embedding: queryVector,
        match_threshold: 0.4,
        match_count: 10,
      });

      if (error) {
        // Fallback to keyword search
        console.warn("Vector search failed, falling back to keyword search:", error);
        const { data: keywordData } = await supabase
          .from("pv_documents")
          .select("id, filename, content, chunk_index")
          .ilike("content", `%${searchQuery}%`)
          .limit(10);

        setSearchResults(
          (keywordData ?? []).map((row) => ({
            id: row.id as number,
            filename: row.filename ?? "",
            content: row.content ?? "",
            chunk_index: row.chunk_index ?? 0,
            similarity: 0.5,
          }))
        );
        return;
      }

      setSearchResults(
        (data ?? []).map((row: any) => ({
          id: row.id,
          filename: row.filename,
          content: row.content,
          similarity: row.similarity,
          chunk_index: row.chunk_index,
        }))
      );
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const isProcessing =
    uploadStatus.status === "uploading" ||
    uploadStatus.status === "extracting" ||
    uploadStatus.status === "embedding" ||
    uploadStatus.status === "storing";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Recherche PV du CSE</h1>
          <p className="text-lg text-slate-600">
            Indexation sémantique des procès-verbaux pour retrouver facilement les occurrences
          </p>
        </div>

        {!extractor && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Chargement du modèle d'IA (première fois ~100MB)... Cela peut prendre une minute.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Importer un PV
            </CardTitle>
            <CardDescription>
              Téléchargez un PDF de PV pour l'indexer (le PDF doit contenir du texte sélectionnable)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  disabled={isProcessing || !extractor}
                  className="cursor-pointer"
                />
                {isProcessing && (
                  <div className="flex items-center gap-2 text-blue-600 shrink-0">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Traitement...</span>
                  </div>
                )}
              </div>

              {uploadStatus.message && (
                <Alert variant={uploadStatus.status === "error" ? "destructive" : "default"}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{uploadStatus.message}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {!loading && documents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Documents indexés ({documents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {documents.map((doc) => (
                  <li
                    key={doc.filename}
                    className="flex justify-between items-center p-2 bg-slate-50 rounded"
                  >
                    <span className="font-medium text-slate-700">{doc.filename}</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {doc.chunks} sections
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Rechercher dans les PV
            </CardTitle>
            <CardDescription>
              Entrez des mots-clés ou des concepts pour chercher dans tous les PV indexés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Ex: vote, salaire, délégués, formations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                disabled={!extractor}
              />
              <Button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim() || !extractor}
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Recherche...
                  </>
                ) : (
                  "Chercher"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {searchResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>
                {searchResults.length} résultat{searchResults.length > 1 ? "s" : ""} pour «{" "}
                {searchQuery} »
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {searchResults.map((result) => (
                <div key={result.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-slate-900">{result.filename}</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {(result.similarity * 100).toFixed(0)}% de pertinence
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm line-clamp-3">{result.content}</p>
                  <p className="text-xs text-slate-500 mt-2">Section {result.chunk_index + 1}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {searchQuery && searchResults.length === 0 && !isSearching && extractor && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Aucun résultat pour «{searchQuery}». Essayez avec d'autres termes.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
