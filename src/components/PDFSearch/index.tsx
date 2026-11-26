import React, { useState, useRef, useEffect } from "react";
import { Loader2, FileText, Download, Lock, X, SearchX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AuthModal from "@/components/AuthModal";
import logoFocom from "@/assets/logo-focom.png";

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/embed-pv`;

const EMBLEM_URL = "/embleme-epure_logo2.png";

function BrandLogo({ className }: { className?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <img
      src={failed ? logoFocom : EMBLEM_URL}
      alt="FO COM UES ILIAD"
      className={className}
      onError={() => setFailed(true)}
    />
  );
}

const DOC_TYPES = ["Tous", "CSE", "CSSCT", "NAO", "Accord", "Autre"];

function docTypeOf(filename: string): string {
  const folder = filename.split("/")[0];
  return DOC_TYPES.includes(folder) ? folder : "Autre";
}

const TYPE_STYLES: Record<string, string> = {
  CSE: "bg-blue-100 text-blue-800",
  CSSCT: "bg-amber-100 text-amber-800",
  NAO: "bg-purple-100 text-purple-800",
  Accord: "bg-green-100 text-green-800",
  Autre: "bg-slate-100 text-slate-600",
};

/* Couleur de la puce de filtre active (un jeu par type). */
const TYPE_CHIP_ACTIVE: Record<string, string> = {
  Tous: "bg-[#13233a] text-white",
  CSE: "bg-blue-600 text-white",
  CSSCT: "bg-amber-500 text-white",
  NAO: "bg-purple-600 text-white",
  Accord: "bg-emerald-600 text-white",
  Autre: "bg-slate-500 text-white",
};

/* Couleur de l'accent latéral des cartes de résultats. */
const TYPE_ACCENT: Record<string, string> = {
  CSE: "#2563eb",
  CSSCT: "#f59e0b",
  NAO: "#9333ea",
  Accord: "#059669",
  Autre: "#94a3b8",
};

function TypeChips({
  value,
  onChange,
  onPick,
  counts,
}: {
  value: string;
  onChange: (v: string) => void;
  onPick?: (v: string) => void;
  counts?: Record<string, number>;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-xs text-slate-400 mr-1">Type :</span>
      {DOC_TYPES.map((t) => (
        <button
          key={t}
          onClick={() => {
            onChange(t);
            onPick?.(t);
          }}
          className={
            "px-3 py-1 rounded-full text-xs font-medium transition-all " +
            (value === t
              ? (TYPE_CHIP_ACTIVE[t] ?? "bg-slate-800 text-white") + " shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:border-slate-400 hover:text-slate-900")
          }
        >
          {t}
          {counts && (counts[t] ?? 0) > 0 ? (
            <span className="ml-1 opacity-60">{counts[t]}</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

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

function cleanText(text: string): string {
  return text
    .replace(/(\w+)\s*-\s*\n?\s*(\w)/g, "$1$2") // réunit les mots coupés par césure PDF
    .replace(/\s*-\s{2,}/g, " ")                  // nettoie les tirets isolés
    .replace(/\s{2,}/g, " ")                       // espaces multiples
    .trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getSearchWords(query: string): string[] {
  return query.split(/\s+/).map((word) => word.trim()).filter(Boolean);
}

function getSearchPatterns(query: string): string[] {
  const normalized = query.replace(/\s+/g, " ").trim();
  const words = getSearchWords(normalized);
  return [
    ...(words.length > 1 ? [normalized] : []),
    ...words,
  ]
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);
}

function extractSnippet(text: string, query: string, maxLen = 320): string {
  const clean = cleanText(text);
  const patterns = getSearchPatterns(query);
  if (!patterns.length) return clean.slice(0, maxLen);
  const regex = new RegExp(patterns.map(escapeRegExp).join("|"), "i");
  const match = regex.exec(clean);
  if (!match) return clean.slice(0, maxLen);
  const center = match.index;
  const half = Math.floor(maxLen / 2);
  const start = Math.max(0, center - half);
  const end = Math.min(clean.length, start + maxLen);
  const snippet = clean.slice(start, end);
  return (start > 0 ? "…" : "") + snippet + (end < clean.length ? "…" : "");
}

// Masque les noms propres pour les visiteurs non connectés.
// Couvre : mots tout-MAJUSCULES (≥2 lettres), titres de civilité + nom, séquences Title Case hors début de phrase.
function maskProperNouns(text: string): string {
  const ACCENTED = "ÀÂÄÉÈÊËÎÏÔÙÛÜÇàâäéèêëîïôùûüç";
  const UC = `A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ`;
  const LC = `a-zàâäéèêëîïôùûüç`;
  // 1) Mots entièrement en majuscules (≥2 lettres) — ex: SIDIBÉ, LAITHIER
  const allCaps = new RegExp(`\\b[${UC}][${UC}${ACCENTED}]{1,}\\b`, "g");
  // 2) Titre de civilité suivi d'un nom (M., Mme, Mme., Dr, Me) — ex: Mme LAITHIER, M. Dupont
  const civility = /\b(M\.|Mme\.?|Dr\.?|Me\.?|Pr\.?)\s+[^\s,;.!?]+/g;
  // 3) Séquences Title Case en milieu de phrase (pas après . ! ? ou en début)
  const titleCase = new RegExp(
    `(?<![.!?]\\s)(?<!^)\\b[${UC}][${LC}]{1,}(?:\\s+[${UC}][${LC}]{1,})*\\b`,
    "g"
  );
  return text
    .replace(civility, "***")
    .replace(allCaps, "***")
    .replace(titleCase, "***");
}

function highlight(text: string, query: string): React.ReactNode {
  const patterns = getSearchPatterns(query).map(escapeRegExp);
  if (patterns.length === 0) return text;
  const regex = new RegExp(`(${patterns.join("|")})`, "gi");
  const exactRegex = new RegExp(`^(${patterns.join("|")})$`, "i");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    exactRegex.test(part) ? (
      <mark key={i} className="bg-red-100 text-red-900 rounded-sm px-0.5 font-semibold">
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("Tous");
  const [accessCode, setAccessCode] = useState(() => localStorage.getItem("pv_access_code") ?? "");
  const [codeInput, setCodeInput] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [docCount, setDocCount] = useState<number | null>(null);
  const [searchDuration, setSearchDuration] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsAuthenticated(!!data.session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Nombre de documents indexés, affiché sur l'accueil (best effort).
  useEffect(() => {
    supabase
      .rpc("pv_document_chunk_counts")
      .then((res) => {
        const data = (res as { data?: unknown }).data;
        if (Array.isArray(data)) setDocCount(data.length);
      })
      .catch(() => {});
  }, []);

  // Raccourci clavier « / » pour focaliser la barre de recherche.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (e.key === "/" && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggleExpanded = (filename: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(filename)) next.delete(filename);
      else next.add(filename);
      return next;
    });
  };

  const downloadFile = async (filename: string) => {
    if (isAuthenticated) {
      const { data, error } = await supabase.storage
        .from("pv-documents")
        .createSignedUrl(filename, 60);
      if (error || !data) return;
      window.open(data.signedUrl, "_blank");
      return;
    }
    try {
      const resp = await fetch(`${EDGE_FUNCTION_URL}/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-access-code": accessCode },
        body: JSON.stringify({ filename }),
      });
      const data = await resp.json();
      if (!resp.ok || !data?.url) throw new Error(data?.error ?? "Téléchargement indisponible");
      window.open(data.url, "_blank");
    } catch {
      // lien signé indisponible : réessayer plus tard
    }
  };

  const openAccess = (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;
    localStorage.setItem("pv_access_code", trimmed);
    setAccessCode(trimmed);
    setCodeInput("");
  };

  const closeAccess = () => {
    localStorage.removeItem("pv_access_code");
    setAccessCode("");
  };

  const handleSearch = async (q?: string, type?: string) => {
    const term = (q ?? query).trim();
    if (!term) return;
    const activeType = (type ?? typeFilter) === "Tous" ? null : (type ?? typeFilter);

    if (!isAuthenticated && !accessCode) {
      setAuthModalOpen(true);
      return;
    }

    setSearchDuration(null);
    const searchStart = performance.now();

    setIsSearching(true);
    setSearched(false);

    try {
      const authHeader = await getAuthHeader();
      const resp = await fetch(`${EDGE_FUNCTION_URL}/search`, {
        method: "POST",
        headers: { ...authHeader, "Content-Type": "application/json", ...(!isAuthenticated ? { "x-access-code": accessCode } : {}) },
        body: JSON.stringify({ query: term, match_count: 15, type: activeType }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error ?? "Erreur serveur");
      setResults(data.results ?? []);
      setExpanded(new Set());
    } catch {
      const words = getSearchWords(term);
      const fallbackResults = new Map<string, SearchResult>();

      if (words.length > 1) {
        let phraseQuery = supabase
          .from("pv_documents")
          .select("filename, original_filename, content, chunk_index")
          .ilike("content", `%${term}%`);
        if (activeType) phraseQuery = phraseQuery.like("filename", `${activeType}/%`);
        const { data: phraseData } = await phraseQuery.limit(15);

        for (const row of phraseData ?? []) {
          const key = `${row.filename ?? ""}:${row.chunk_index ?? 0}`;
          fallbackResults.set(key, {
            filename: row.filename ?? "",
            original_filename: row.original_filename ?? row.filename ?? "",
            content: row.content ?? "",
            chunk_index: row.chunk_index ?? 0,
            similarity: 1.2,
          });
        }
      }

      let keywordQuery = supabase
        .from("pv_documents")
        .select("filename, original_filename, content, chunk_index");

      for (const word of words) {
        keywordQuery = keywordQuery.ilike("content", `%${word}%`);
      }
      if (activeType) {
        keywordQuery = keywordQuery.like("filename", `${activeType}/%`);
      }

      const { data: keywordData } = await keywordQuery.limit(15);
      for (const row of keywordData ?? []) {
        const key = `${row.filename ?? ""}:${row.chunk_index ?? 0}`;
        if (!fallbackResults.has(key)) {
          fallbackResults.set(key, {
            filename: row.filename ?? "",
            original_filename: row.original_filename ?? row.filename ?? "",
            content: row.content ?? "",
            chunk_index: row.chunk_index ?? 0,
            similarity: 0.5,
          });
        }
      }

      setResults(Array.from(fallbackResults.values()).slice(0, 15));
    setExpanded(new Set());
    }

    setSubmitted(term);
    setIsSearching(false);
    setSearched(true);
    setSearchDuration(Math.round((performance.now() - searchStart) / 100) / 10);
  };

  const grouped = results.reduce((acc: Record<string, SearchResult[]>, r) => {
    (acc[r.filename] ??= []).push(r);
    return acc;
  }, {});

  const typeCounts: Record<string, number> = { Tous: results.length };
  for (const r of results) {
    const t = docTypeOf(r.filename);
    typeCounts[t] = (typeCounts[t] ?? 0) + 1;
  }

  const hasPvResults = results.length > 0;
  const showResults = !!submitted && (searched || isSearching);

  if (!showResults) {
    return (
      <div className="relative min-h-screen bg-[#f6f8fb] flex flex-col items-center justify-center pb-20 overflow-hidden">
        <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />

        {/* Halos de marque */}
        <div className="pointer-events-none absolute -top-48 -left-40 w-[34rem] h-[34rem] rounded-full bg-[#dc2626]/15 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-52 -right-36 w-[36rem] h-[36rem] rounded-full bg-[#0d9488]/15 blur-3xl" aria-hidden="true" />

        {/* Logo */}
        <div className="relative mb-5">
          <BrandLogo className="w-44 h-44 object-contain drop-shadow-xl" />
        </div>

        {/* Titre */}
        <h1 className="relative text-3xl md:text-4xl text-[#0f172a] text-center px-4 tracking-tight">
          Rechercher dans les <span className="text-[#dc2626]">PV</span> et{" "}
          <span className="text-[#0d9488]">accords</span>
        </h1>
        <p className="relative mt-2 text-sm md:text-base text-slate-500 text-center px-4 max-w-xl">
          {docCount !== null
            ? docCount + " documents indexés · PV et accords de l'UES Iliad"
            : "Moteur de recherche des PV et accords de l'UES Iliad"}
        </p>

        {/* Barre de recherche */}
        <div className="relative w-full max-w-[656px] px-4 mt-7">
          <div className="flex items-center gap-2 border border-slate-200 rounded-full pl-5 pr-1.5 py-1.5 shadow-lg shadow-slate-900/5 transition-all bg-white focus-within:shadow-xl focus-within:shadow-red-600/10 focus-within:border-red-300">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Rechercher dans les PV FO COM..."
              className="flex-1 min-w-0 outline-none text-slate-800 placeholder-slate-400 bg-transparent text-base py-2"
              autoFocus
              aria-label="Rechercher dans les PV FO COM"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                title="Effacer"
                aria-label="Effacer la recherche"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => handleSearch()}
              disabled={isSearching || !query.trim()}
              className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-br from-[#e11d48] to-[#b91c1c] shadow-md shadow-red-600/25 hover:brightness-110 hover:shadow-lg hover:shadow-red-600/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSearching ? "Recherche…" : "Rechercher"}
            </button>
          </div>

          {/* Exemples de recherches */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {["NAO salaires", "CSSCT sécurité", "télétravail", "élections CSE", "accord intéressement"].map((ex) => (
              <button
                key={ex}
                onClick={() => {
                  setQuery(ex);
                  inputRef.current?.focus();
                }}
                className="text-xs px-2.5 py-1 bg-white text-slate-600 rounded-full border border-slate-200 hover:border-red-300 hover:text-red-700 transition-colors shadow-sm"
              >
                {ex}
              </button>
            ))}
          </div>

          {/* Filtre par type de document */}
          <div className="mt-5 flex justify-center">
            <TypeChips value={typeFilter} onChange={setTypeFilter} />
          </div>

          {/* Accès sans compte : code partagé */}
          {!isAuthenticated && (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              {accessCode ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-full px-3 py-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                  Accès ouvert avec un code partagé.
                  <button
                    onClick={closeAccess}
                    className="ml-1 underline text-slate-400 hover:text-red-700 transition-colors"
                  >
                    Fermer l'accès
                  </button>
                </span>
              ) : (
                <>
                  <input
                    type="password"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") openAccess(codeInput);
                    }}
                    placeholder="Code d'accès partagé"
                    className="w-48 px-3.5 py-1.5 text-sm border border-slate-200 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 transition-colors"
                  />
                  <button
                    onClick={() => openAccess(codeInput)}
                    className="px-3.5 py-1.5 text-sm text-white bg-[#13233a] rounded-full hover:bg-[#1a2f4d] transition-colors shadow-sm"
                  >
                    Ouvrir l'accès
                  </button>
                </>
              )}
            </div>
          )}
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
                <p>Tapez un ou plusieurs mots présents dans les PV. Le moteur cherche l'expression complète quand plusieurs mots sont saisis, puis complète avec les documents contenant ces termes.</p>
                <p className="mt-1 text-slate-500 italic">Exemple : <span className="bg-slate-100 px-1 rounded">télétravail accord</span></p>
              </div>
              <div>
                <p className="font-medium text-slate-700 mb-1">Astuces</p>
                <ul className="space-y-1 text-slate-500">
                  <li>• Utilisez des mots précis plutôt que des phrases complètes</li>
                  <li>• Les accents sont ignorés : <span className="italic">reunion</span> retrouve bien <span className="italic">réunion</span></li>
                  <li>• Plusieurs mots = l'association exacte est prioritaire, puis les mots sont recherchés ensemble</li>
                  <li>• Les petites fautes de frappe sont tolérées si aucun résultat exact n'est trouvé</li>
                  <li>• Filtrez par type (CSE, CSSCT, NAO, Accord) pour cibler un genre de document</li>
                  <li>• Sans compte : ouvrez l'accès avec le code partagé fourni par la FO COM</li>
                </ul>
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
    <div className="min-h-screen bg-[#f6f8fb] flex flex-col">
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      {/* Header compact post-recherche */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200 shadow-sm px-4 md:px-6 py-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <a href="/recherche" className="flex items-center shrink-0 order-1">
          <BrandLogo className="w-9 h-9 object-contain" />
        </a>

        <div className="flex-1 min-w-0 order-3 md:order-2 basis-full md:basis-auto max-w-2xl">
          <div className="flex items-center gap-2 border border-slate-200 rounded-full px-4 py-1.5 shadow-sm transition-all bg-white focus-within:border-red-300 focus-within:shadow-md">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Rechercher dans les PV FO COM..."
              className="flex-1 min-w-0 outline-none text-slate-800 placeholder-slate-400 bg-transparent text-sm"
              aria-label="Rechercher dans les PV FO COM"
            />
            <button
              onClick={() => handleSearch()}
              disabled={isSearching || !query.trim()}
              className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-white bg-gradient-to-br from-[#e11d48] to-[#b91c1c] hover:brightness-110 disabled:opacity-40 transition-all"
            >
              {isSearching && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Rechercher
            </button>
          </div>
        </div>

        <div className="shrink-0 order-2 md:order-3">
          <TypeChips
            value={typeFilter}
            onChange={setTypeFilter}
            counts={typeCounts}
            onPick={(t) => {
              if (submitted) handleSearch(submitted, t);
            }}
          />
        </div>
      </div>

      {/* Résultats */}
      <div className="flex-1 px-4 md:px-6 py-6 max-w-3xl w-full mx-auto space-y-8">
        <section>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-red-600" />
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
              PV CSE / CSSCT — UES Iliad
            </h2>
          </div>

          {hasPvResults ? (
            <div className={"space-y-5 transition-opacity " + (isSearching ? "opacity-50 pointer-events-none" : "")}>
              <div className="flex flex-wrap items-center justify-between gap-2 -mt-2">
                <p className="text-xs text-slate-500">
                  <strong className="text-slate-700">{results.length}</strong> passage{results.length > 1 ? "s" : ""} dans{" "}
                  <strong className="text-slate-700">{Object.keys(grouped).length}</strong> document{Object.keys(grouped).length > 1 ? "s" : ""} pour « {submitted} »
                  {typeFilter !== "Tous" ? ` · type ${typeFilter}` : ""}
                  {searchDuration !== null ? " · " + searchDuration.toFixed(1).replace(".", ",") + " s" : ""}
                </p>
                {!isAuthenticated && !accessCode && (
                  <button
                    onClick={() => setAuthModalOpen(true)}
                    className="flex items-center gap-1.5 text-xs text-red-700 hover:text-red-900 hover:underline"
                  >
                    <Lock className="w-3 h-3" />
                    Connectez-vous pour voir les noms et télécharger les PDF
                  </button>
                )}
              </div>
              {Object.entries(grouped).map(([filename, fileResults], fileIndex) => {
                const docLabel = filename.replace(/\.pdf$/i, "").replace(/[_/-]/g, " ");
                const docType = docTypeOf(filename);
                const isOpen = expanded.has(filename);
                const shown = isOpen ? fileResults : fileResults.slice(0, 3);
                const bestSim = fileResults.reduce((a, b) => (b.similarity > a.similarity ? b : a)).similarity;
                return (
                  <article
                    key={filename}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow fade-slide-in"
                    style={{ borderLeft: "4px solid " + (TYPE_ACCENT[docType] ?? TYPE_ACCENT.Autre), animationDelay: fileIndex * 60 + "ms" }}
                  >
                    {/* En-tête document */}
                    <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-slate-50/80 border-b border-slate-200">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={"shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold " + (TYPE_STYLES[docType] ?? TYPE_STYLES.Autre)}
                        >
                          {docType}
                        </span>
                        <span className="text-xs font-medium text-slate-700 truncate" title={filename}>
                          {docLabel}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="hidden sm:inline-block text-[10px] text-slate-400" title="Pertinence de la meilleure correspondance">
                          {Math.round(Math.min(1, bestSim) * 100)} %
                        </span>
                        {isAuthenticated || accessCode ? (
                          <button
                            onClick={() => downloadFile(filename)}
                            className="flex items-center gap-1 text-xs font-medium text-red-700 hover:text-red-900 hover:underline"
                          >
                            <Download className="w-3 h-3" />
                            Télécharger le PDF
                          </button>
                        ) : (
                          <button
                            onClick={() => setAuthModalOpen(true)}
                            className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-700 transition-colors"
                          >
                            <Lock className="w-3 h-3" />
                            Connexion pour télécharger
                          </button>
                        )}
                      </div>
                    </div>
                    {/* Extraits */}
                    <div className="divide-y divide-slate-100">
                      {shown.map((result, i) => {
                        const snippet = extractSnippet(result.content, submitted);
                        const displayText = isAuthenticated || accessCode ? snippet : maskProperNouns(snippet);
                        return (
                          <div key={i} className="px-4 py-3">
                            <p className="text-sm text-slate-700 leading-relaxed">
                              {highlight(displayText, submitted)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                    {fileResults.length > 3 && (
                      <button
                        onClick={() => toggleExpanded(filename)}
                        className="w-full px-4 py-2 text-xs font-medium text-red-700 bg-slate-50/60 hover:bg-slate-100 border-t border-slate-200 transition-colors"
                      >
                        {isOpen ? "Réduire les extraits" : "Voir les " + (fileResults.length - 3) + " autres extraits"}
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          ) : isSearching ? (
            <div className="space-y-5" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-10 bg-slate-100 border-b border-slate-100" />
                  <div className="px-4 py-3 space-y-2">
                    <div className="h-3 bg-slate-100 rounded w-full" />
                    <div className="h-3 bg-slate-100 rounded w-5/6" />
                    <div className="h-3 bg-slate-100 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-6 py-10 flex flex-col items-center text-center max-w-xl">
              <SearchX className="w-10 h-10 text-slate-300" aria-hidden="true" />
              <p className="mt-3 text-sm text-slate-600">
                Aucun résultat pour <strong>« {submitted} »</strong>
                {typeFilter !== "Tous" ? " dans les documents de type " + typeFilter : ""}.
              </p>
              <p className="mt-1 text-xs text-slate-400">Vérifiez l'orthographe, essayez des termes plus généraux ou changez de filtre de type.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {typeFilter !== "Tous" && (
                  <button
                    onClick={() => {
                      setTypeFilter("Tous");
                      handleSearch(submitted, "Tous");
                    }}
                    className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#13233a] rounded-full hover:bg-[#1a2f4d] transition-colors"
                  >
                    Relancer sur tous les types
                  </button>
                )}
                {["télétravail", "salaires", "élections"].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setQuery(s);
                      handleSearch(s, typeFilter);
                    }}
                    className="px-3.5 py-1.5 text-xs bg-white text-slate-600 rounded-full border border-slate-200 hover:border-red-300 hover:text-red-700 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
