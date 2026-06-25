import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { pipeline } from "@xenova/transformers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, Search, AlertCircle, CheckCircle2, FileText } from "lucide-react";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

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
  progress?: number;
}

export function PVSearchPage() {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({ status: "idle", message: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [documents, setDocuments] = useState<{ filename: string; chunks: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [extractor, setExtractor] = useState<any>(null);

  // Load model on mount
  React.useEffect(() => {
    loadModel();
    loadDocuments();
  }, []);

  const loadModel = async () => {
    try {
      console.log("Loading embedding model...");
      const model = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
      setExtractor(model);
      console.log("Model loaded!");
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

      const grouped = data.reduce((acc, doc) => {
        const existing = acc.find((d) => d.filename === doc.filename);
        if (existing) {
          existing.chunks += 1;
        } else {
          acc.push({ filename: doc.filename, chunks: 1 });
        }
        return acc;
      }, [] as typeof documents);

      setDocuments(grouped);
    } catch (error) {
      console.error("Error loading documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const extractTextFromPdf = async (pdfBase64: string): Promise<string> => {
    try {
      const binaryString = atob(pdfBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const decoder = new TextDecoder("utf-8");
      let text = decoder.decode(bytes);
      text = text.replace(/[^\x20-\x7E\n\r]/g, " ").replace(/\s+/g, " ").trim();
      return text.substring(0, 50000);
    } catch {
      throw new Error("Failed to extract PDF");
    }
  };

  const chunkText = (text: string): string[] => {
    const chunks = [];
    const CHUNK_SIZE = 1000;

    for (let i = 0; i < text.length && chunks.length < 50; i += CHUNK_SIZE) {
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
      setUploadStatus({
        status: "error",
        message: "Veuillez sélectionner un fichier PDF",
      });
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
      // Read file
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binaryString = "";
      const chunkSize = 8192;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        binaryString += String.fromCharCode.apply(
          null,
          Array.from(bytes.subarray(i, i + chunkSize)) as any
        );
      }
      const base64 = btoa(binaryString);

      // Extract text
      setUploadStatus({ status: "extracting", message: "Extraction du texte du PDF..." });
      const text = await extractTextFromPdf(base64);

      if (text.length < 100) {
        throw new Error("PDF est vide ou illisible");
      }

      // Chunk
      setUploadStatus({ status: "embedding", message: "Création des embeddings (peut prendre 30-60s)..." });
      const chunks = chunkText(text);

      if (chunks.length === 0) {
        throw new Error("Impossible d'extraire le texte");
      }

      // Get embeddings (client-side with transformers.js)
      console.log(`Computing embeddings for ${chunks.length} chunks...`);
      const embeddings = await Promise.all(
        chunks.map(async (chunk) => {
          const result = await extractor(chunk, { pooling: "mean", normalize: true });
          return Array.from(result.data);
        })
      );

      console.log(`Got ${embeddings.length} embeddings`);

      // Prepare documents
      const documents = chunks.map((chunk, i) => ({
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

      // Store in Supabase
      setUploadStatus({ status: "storing", message: "Sauvegarde dans la base de données..." });
      const BATCH_SIZE = 25;
      for (let i = 0; i < documents.length; i += BATCH_SIZE) {
        const batch = documents.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from("pv_documents").insert(batch);
        if (error) throw error;
        console.log(`Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}`);
      }

      setUploadStatus({
        status: "success",
        message: `✅ ${chunks.length} sections indexées de "${file.name}"`,
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
      // Get query embedding
      const queryEmbedding = await extractor(searchQuery, {
        pooling: "mean",
        normalize: true,
      });
      const queryVector = Array.from(queryEmbedding.data);

      // Search in Supabase using vector similarity
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
          keywordData?.map((row) => ({
            ...row,
            similarity: 0.5,
          })) || []
        );
        return;
      }

      setSearchResults(
        data?.map((row: any) => ({
          id: row.id,
          filename: row.filename,
          content: row.content,
          similarity: row.similarity,
          chunk_index: row.chunk_index,
        })) || []
      );
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">🔍 Recherche PV du CSE</h1>
          <p className="text-lg text-slate-600">
            Indexation sémantique des procès-verbaux pour retrouver facilement les occurrences
          </p>
        </div>

        {/* Model loading status */}
        {!extractor && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Chargement du modèle d'IA (première fois = ~100MB)... Cela peut prendre une minute.
            </AlertDescription>
          </Alert>
        )}

        {/* Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Importer un PV
            </CardTitle>
            <CardDescription>
              Téléchargez un PDF de PV pour l'indexer et le rendre searchable
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  disabled={
                    uploadStatus.status === "uploading" ||
                    uploadStatus.status === "extracting" ||
                    uploadStatus.status === "embedding" ||
                    uploadStatus.status === "storing" ||
                    !extractor
                  }
                  className="cursor-pointer"
                />
                {(uploadStatus.status === "uploading" ||
                  uploadStatus.status === "extracting" ||
                  uploadStatus.status === "embedding" ||
                  uploadStatus.status === "storing") && (
                  <div className="flex items-center gap-2 text-blue-600">
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

        {/* Indexed Documents */}
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
                  <li key={doc.filename} className="flex justify-between items-center p-2 bg-slate-50 rounded">
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

        {/* Search Card */}
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
              <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim() || !extractor}>
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

        {/* Search Results */}
        {searchResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>
                {searchResults.length} résultats pour "{searchQuery}"
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {searchResults.map((result) => (
                <div key={result.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-slate-900">{result.filename}</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Match: {(result.similarity * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm line-clamp-3">{result.content}</p>
                  <p className="text-xs text-slate-500 mt-2">Section {result.chunk_index}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {searchQuery && searchResults.length === 0 && !isSearching && extractor && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Aucun résultat pour "{searchQuery}". Essayez avec d'autres termes.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}