import React, { useState, useRef } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, FileText, ExternalLink, Mic } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logoFocom from "@/assets/logo-focom.png";

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/embed-pv`;

interface SearchResult {
  filename: string;
  original_filename?: string;
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

  const handleSearch = async (q?: string) => {
    const term = (q ?? query).trim();
    if (!term) return;

    setIsSearching(true);
    setSearched(false);

    try {
      const authHeader = await getAuthHeader();
      const resp = await fetch(`${EDGE_FUNCTION_URL}/search`, {
        method: "POST",
        headers: { ...authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({ query: term, match_count: 15 }),
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error ?? "Erreur serveur");
      setResults(data.results ?? []);
      setSubmitted(term);
    } catch {
      const { data: keywordData } = await supabase
        .from("pv_documents")
        .select("filename, original_filename, content, chunk_index")
        .ilike("content", `%${term}%`)
        .limit(15);

      setResults(
        (keywordData ?? []).map((row) => ({
          filename: row.filename ?? "",
          original_filename: row.original_filename ?? row.filename ?? "",
          content: row.content ?? "",
          chunk_index: row.chunk_index ?? 0,
          similarity: 0.5,
        }))
      );
      setSubmitted(term);
    } finally {
      setIsSearching(false);
      setSearched(true);
    }
  };

  const handleLucky = async () => {
    const q = query.trim();
    if (!q) return;
    await handleSearch(q);
  };

  const downloadFile = async (filename: string) => {
    const { data, error } = await supabase.storage
      .from("pv-documents")
      .createSignedUrl(filename, 60);
    if (error || !data) return;
    window.open(data.signedUrl, "_blank");
  };

  const grouped = results.reduce((acc: Record<string, SearchResult[]>, r) => {
    (acc[r.filename] ??= []).push(r);
    return acc;
  }, {});

  const hasResults = results.length > 0;
  const showResults = searched && submitted;

  if (!showResults) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center pb-20">
        {/* Logo */}
        <div className="mb-6 relative">
          <img
            src={logoFocom}
            alt="FO COM UES ILIAD"
            className="w-48 h-48 object-contain drop-shadow-lg"
          />
          <div className="absolute -right-4 -bottom-2 bg-white rounded-full p-1 shadow-md">
            <svg viewBox="0 0 24 24" className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="w-full max-w-[584px] px-4">
          <div className="flex items-center gap-3 border border-slate-300 rounded-full px-5 py-3 shadow-sm hover:shadow-md transition-shadow bg-white focus-within:shadow-md focus-within:border-slate-400">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Rechercher avec FO COM..."
              className="flex-1 outline-none text-slate-800 placeholder-slate-400 bg-transparent text-base"
              autoFocus
            />
            <button
              className="text-blue-500 hover:text-blue-700 transition-colors shrink-0"
              title="Recherche vocale"
              tabIndex={-1}
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>

          {/* Boutons */}
          <div className="flex gap-3 justify-center mt-7">
            <button
              onClick={() => handleSearch()}
              disabled={isSearching || !query.trim()}
              className="px-5 py-2 bg-[#f8f9fa] text-slate-700 text-sm rounded border border-transparent hover:border-slate-300 hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSearching ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Recherche…
                </span>
              ) : (
                "Recherche FO COM"
              )}
            </button>
            <button
              onClick={handleLucky}
              disabled={isSearching || !query.trim()}
              className="px-5 py-2 bg-[#f8f9fa] text-slate-700 text-sm rounded border border-transparent hover:border-slate-300 hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              J'ai de la chance
            </button>
          </div>
        </div>

        {/* Guide pratique */}
        <div className="w-full max-w-[584px] px-4 mt-10">
          <details className="group">
            <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 select-none list-none">
              <svg viewBox="0 0 24 24" className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
              Comment utiliser le moteur de recherche ?
            </summary>
            <div className="mt-3 text-sm text-slate-600 space-y-3 pl-1">
              <div>
                <p className="font-medium text-slate-700 mb-1">Recherche par mots-clés</p>
                <p>Tapez un ou plusieurs mots présents dans les PV. Le moteur cherche tous les documents contenant ces termes.</p>
                <p className="mt-1 text-slate-500 italic">Exemple : <span className="bg-slate-100 px-1 rounded">télétravail accord</span></p>
              </div>
              <div>
                <p className="font-medium text-slate-700 mb-1">Astuces</p>
                <ul className="space-y-1 text-slate-500">
                  <li>• Utilisez des mots précis plutôt que des phrases complètes</li>
                  <li>• Les accents sont pris en compte (<span className="italic">réunion</span> ≠ <span className="italic">reunion</span>)</li>
                  <li>• Plusieurs mots = tous les mots doivent être présents</li>
                  <li>• Cliquez sur un résultat pour télécharger le PDF correspondant</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-slate-700 mb-1">Exemples de recherches</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {["NAO salaires", "CSSCT sécurité", "télétravail", "élections CSE", "accord intéressement"].map((ex) => (
                    <button
                      key={ex}
                      onClick={() => { setQuery(ex); inputRef.current?.focus(); }}
                      className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 transition-colors"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </details>
        </div>

        {/* Bas de page */}
        <p className="absolute bottom-8 text-sm text-slate-500">
          Le moteur de recherche de{" "}
          <span className="text-[#dc2626] font-semibold">FO COM UES ILIAD</span>
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header compact post-recherche */}
      <div className="pt-4 pb-3 border-b border-slate-200 shadow-sm px-6 flex items-center gap-4">
        <a href="/recherche" className="flex items-center shrink-0">
          <img src={logoFocom} alt="FO COM" className="w-10 h-10 object-contain" />
        </a>

        <div className="flex-1 max-w-2xl">
          <div className="flex items-center gap-2 border border-slate-300 rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-shadow bg-white focus-within:shadow-md">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Rechercher avec FO COM..."
              className="flex-1 outline-none text-slate-800 placeholder-slate-400 bg-transparent"
            />
            {isSearching && <Loader2 className="w-4 h-4 animate-spin text-slate-400 shrink-0" />}
          </div>
        </div>
      </div>

      {/* Résultats */}
      <div className="flex-1 px-6 py-6 max-w-3xl ml-16">
        {hasResults ? (
          <>
            <p className="text-sm text-slate-500 mb-6">
              {results.length} résultat{results.length > 1 ? "s" : ""} pour{" "}
              <span className="font-medium text-slate-700">« {submitted} »</span>
            </p>

            <div className="space-y-8">
              {Object.entries(grouped).map(([filename, fileResults]) => (
                <div key={filename}>
                  <button
                    onClick={() => downloadFile(filename)}
                    className="group flex items-center gap-2 mb-2 text-left"
                  >
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-500 group-hover:underline">{filename}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100" />
                  </button>

                  <div className="space-y-4 ml-6">
                    {fileResults.slice(0, 3).map((result, i) => (
                      <div key={i}>
                        <h3
                          className="text-lg text-blue-800 font-medium mb-1 hover:underline cursor-pointer"
                          onClick={() => downloadFile(filename)}
                        >
                          {filename.replace(/\.pdf$/i, "")} — section {result.chunk_index + 1}
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed line-clamp-4">
                          {highlight(result.content, submitted)}
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
    </div>
  );
}
