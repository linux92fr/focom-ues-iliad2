import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, Search, AlertCircle, CheckCircle2, FileText } from "lucide-react";

// Initialize Supabase client
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
  status: "idle" | "uploading" | "processing" | "success" | "error";
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

  // Load indexed documents on mount
  React.useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from("pv_documents")
        .select("filename")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Group by filename and count chunks
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.name.endsWith(".pdf")) {
      setUploadStatus({
        status: "error",
        message: "Veuillez sélectionner un fichier PDF",
      });
      return;
    }

    setUploadStatus({ status: "uploading", message: "Lecture du fichier...", filename: file.name });

    try {
      // Read file as base64
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      // Process in chunks to avoid stack overflow
let binaryString = "";
const chunkSize = 8192;
for (let i = 0; i < bytes.length; i += chunkSize) {
  binaryString += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunkSize)) as any);
}
const base64 = btoa(binaryString);

      setUploadStatus({ status: "processing", message: "Traitement du PDF et création des embeddings..." });

      // Call Edge Function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/embed-pv`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pdfBase64: base64,
            filename: file.name,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors du traitement");
      }

      const result = await response.json();

      setUploadStatus({
        status: "success",
        message: `✅ ${result.chunks_processed} sections indexées de "${file.name}"`,
        filename: file.name,
      });

      // Reload documents
      await loadDocuments();

      // Reset file input
      event.target.value = "";
    } catch (error) {
      setUploadStatus({
        status: "error",
        message: `Erreur: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
      });
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Call RPC function to search with pgvector
      const { data, error } = await supabase.rpc("search_pv_documents", {
        query_text: searchQuery,
        match_threshold: 0.4,
        match_count: 10,
      });

      if (error) {
        // Fallback: if RPC doesn't exist yet, do client-side search
        console.warn("RPC error, falling back to client search:", error);
        await clientSideSearch();
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

  // Fallback client-side search (basic keyword matching)
  const clientSideSearch = async () => {
    try {
      const { data, error } = await supabase
        .from("pv_documents")
        .select("id, filename, content, chunk_index")
        .ilike("content", `%${searchQuery}%`)
        .limit(10);

      if (error) throw error;

      setSearchResults(
        data?.map((row) => ({
          ...row,
          similarity: 0.5, // Placeholder
        })) || []
      );
    } catch (error) {
      console.error("Fallback search error:", error);
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
                  disabled={uploadStatus.status === "uploading" || uploadStatus.status === "processing"}
                  className="cursor-pointer"
                />
                {uploadStatus.status === "uploading" || uploadStatus.status === "processing" ? (
                  <div className="flex items-center gap-2 text-blue-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Traitement...</span>
                  </div>
                ) : null}
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
              />
              <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
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

        {searchQuery && searchResults.length === 0 && !isSearching && (
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