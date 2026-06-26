import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, Search, AlertCircle, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/embed-pv`;

interface SearchResult {
  id: number;
  filename: string;
  content: string;
  similarity: number;
  chunk_index: number;
}

interface UploadStatus {
  status: "idle" | "uploading" | "indexing" | "success" | "error";
  message: string;
}

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function PVSearchPage() {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({ status: "idle", message: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [documents, setDocuments] = useState<{ filename: string; chunks: number }[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.name.endsWith(".pdf")) {
      setUploadStatus({ status: "error", message: "Veuillez sélectionner un fichier PDF" });
      return;
    }

    setUploadStatus({ status: "uploading", message: "Envoi du fichier..." });

    try {
      // Convert file to base64
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = "";
      const chunkSize = 8192;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
      }
      const pdfBase64 = btoa(binary);

      setUploadStatus({ status: "indexing", message: "Extraction du texte et indexation en cours..." });

      const authHeader = await getAuthHeader();
      const resp = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers: { ...authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({ pdfBase64, filename: file.name }),
      });

      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error ?? "Erreur serveur");

      setUploadStatus({
        status: "success",
        message: `${result.chunks_indexed} sections indexées de "${file.name}"`,
      });

      await loadDocuments();
      event.target.value = "";
    } catch (error) {
      setUploadStatus({
        status: "error",
        message: `Erreur : ${error instanceof Error ? error.message : "Erreur inconnue"}`,
      });
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const authHeader = await getAuthHeader();
      const resp = await fetch(`${EDGE_FUNCTION_URL}/search`, {
        method: "POST",
        headers: { ...authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, match_threshold: 0.4, match_count: 10 }),
      });

      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error ?? "Erreur serveur");

      setSearchResults(result.results ?? []);
    } catch (error) {
      console.error("Search error:", error);
      // Fallback recherche par mots-clés
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
    } finally {
      setIsSearching(false);
    }
  };

  const isProcessing = uploadStatus.status === "uploading" || uploadStatus.status === "indexing";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Recherche PV du CSE</h1>
          <p className="text-lg text-slate-600">
            Indexation sémantique des procès-verbaux pour retrouver facilement les occurrences
          </p>
        </div>

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
                  disabled={isProcessing}
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

        {searchQuery && searchResults.length === 0 && !isSearching && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Aucun résultat pour « {searchQuery} ». Essayez avec d'autres termes.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
