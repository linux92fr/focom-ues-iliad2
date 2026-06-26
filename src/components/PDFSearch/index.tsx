import React, { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Search, AlertCircle, FileText, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/embed-pv`;

interface SearchResult {
  id: number;
  filename: string;
  content: string;
  similarity: number;
  chunk_index: number;
}

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function highlight(text: string, query: string): React.ReactNode {
  const words = query
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (words.length === 0) return text;
  const regex = new RegExp(`(${words.join("|")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-yellow-200 text-inherit rounded-sm px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export function PVSearchPage() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return;

    setIsSearching(true);
    setSearched(false);

    try {
      const authHeader = await getAuthHeader();
      const resp = await fetch(`${EDGE_FUNCTION_URL}/search`, {
        method: "POST",
        headers: { ...authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, match_threshold: 0.3, match_count: 15 }),
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error ?? "Erreur serveur");

      setResults(data.results ?? []);
      setSubmitted(q);
    } catch {
      // Fallback recherche textuelle
      const { data: keywordData } = await supabase
        .from("pv_documents")
        .select("id, filename, content, chunk_index")
        .ilike("content", `%${q}%`)
        .limit(15);

      setResults(
        (keywordData ?? []).map((row) => ({
          id: row.id as number,
          filename: row.filename ?? "",
          content: row.content ?? "",
          chunk_index: row.chunk_index ?? 0,
          similarity: 0.5,
        }))
      );
      setSubmitted(q);
    } finally {
      setIsSearching(false);
      setSearched(true);
    }
  };

  const downloadFile = async (filename: string) => {
    const { data, error } = await supabase.storage
      .from("pv-documents")
      .createSignedUrl(filename, 60);
    if (error || !data) return;
    window.open(data.signedUrl, "_blank");
  };

  // Grouper les résultats par fichier
  const grouped = results.reduce((acc: Record<string, SearchResult[]>, r) => {
    (acc[r.filename] ??= []).push(r);
    return acc;
  }, {});

  const hasResults = results.length > 0;
  const showResults = searched && submitted;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header compact une fois la recherche effectuée */}
      <div
        className={`transition-all duration-300 ${
          showResults
            ? "pt-6 pb-4 border-b border-slate-200 shadow-sm"
            : "flex-1 flex flex-col items-center justify-center pb-24"
        }`}
      >
        <div className={`${showResults ? "px-6 flex items-center gap-4" : "text-center mb-8"}`}>
          {!showResults && (
            <>
              <div className="flex items-center justify-center gap-2 mb-2">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-4xl font-semibold text-slate-800 mb-1">Recherche PV CSE</h1>
              <p className="text-slate-500 mb-8">
                Retrouvez instantanément n'importe quelle information dans les procès-verbaux
              </p>
            </>
          )}

          {showResults && (
            <a
              href="/recherche-pv"
              className="flex items-center gap-1.5 text-blue-600 font-semibold text-lg shrink-0"
            >
              <FileText className="w-5 h-5" />
              PV CSE
            </a>
          )}

          <div className={`${showResults ? "flex-1 max-w-2xl" : "flex justify-center"}`}>
            <div
              className={`flex items-center gap-2 border border-slate-300 rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-shadow bg-white ${
                showResults ? "w-full" : "w-[584px] max-w-full"
              }`}
            >
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Rechercher dans les PV..."
                className="flex-1 outline-none text-slate-800 placeholder-slate-400 bg-transparent"
                autoFocus
              />
              {isSearching && <Loader2 className="w-4 h-4 animate-spin text-slate-400 shrink-0" />}
            </div>
          </div>

          {!showResults && (
            <div className="flex gap-3 justify-center mt-6">
              <Button
                onClick={handleSearch}
                disabled={isSearching || !query.trim()}
                className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-0 shadow-none"
                variant="outline"
              >
                {isSearching ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" />Recherche...</>
                ) : (
                  "Rechercher"
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Résultats */}
      {showResults && (
        <div className="flex-1 px-6 py-6 max-w-3xl">
          {hasResults ? (
            <>
              <p className="text-sm text-slate-500 mb-6">
                {results.length} résultat{results.length > 1 ? "s" : ""} pour{" "}
                <span className="font-medium text-slate-700">« {submitted} »</span>
              </p>

              <div className="space-y-8">
                {Object.entries(grouped).map(([filename, fileResults]) => (
                  <div key={filename}>
                    {/* En-tête fichier */}
                    <button
                      onClick={() => downloadFile(filename)}
                      className="group flex items-center gap-2 mb-2 text-left"
                    >
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span className="text-xs text-slate-500 group-hover:underline">
                        {filename}
                      </span>
                      <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100" />
                    </button>

                    {/* Extraits */}
                    <div className="space-y-4 ml-6">
                      {fileResults.slice(0, 3).map((result) => (
                        <div key={result.id}>
                          <h3 className="text-lg text-blue-800 font-medium mb-1 hover:underline cursor-pointer" onClick={() => downloadFile(filename)}>
                            {filename.replace(".pdf", "")} — section {result.chunk_index + 1}
                          </h3>
                          <p className="text-sm text-slate-600 leading-relaxed line-clamp-4">
                            {highlight(result.content, submitted)}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            Pertinence : {(result.similarity * 100).toFixed(0)}%
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <Alert className="max-w-lg">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Aucun résultat pour <strong>« {submitted} »</strong>. Essayez d'autres termes ou
                vérifiez que des PV ont bien été indexés.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}
