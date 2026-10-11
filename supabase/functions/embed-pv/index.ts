import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

const ELEVATED_ROLES = ["admin", "representant", "gestionnaire_documents"];
const MAX_INDEX_TEXT = 1_000_000;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function getCaller(authHeader: string) {
  if (!authHeader.startsWith("Bearer ")) return null;
  const anon = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
  const { data: { user } } = await anon.auth.getUser(authHeader.slice(7));
  return user;
}

async function isElevated(userId: string | null) {
  if (!userId) return false;
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  return (data ?? []).some((r) => ELEVATED_ROLES.includes(r.role as string));
}

function extractTextFromPdfBytes(bytes: Uint8Array): string {
  const decoder = new TextDecoder("latin1");
  const content = decoder.decode(bytes);
  const parts: string[] = [];
  const btEt = /BT([\s\S]*?)ET/g;
  let m;
  while ((m = btEt.exec(content)) !== null) {
    const block = m[1];
    const tj = /\(((?:[^\\()]|\\.)*?)\)\s*(?:Tj|')/g;
    let t;
    while ((t = tj.exec(block)) !== null) {
      parts.push(t[1].replace(/\\n/g, " ").replace(/\\\(/g, "(").replace(/\\\)/g, ")"));
    }
    const tjArr = /\[[\s\S]*?\]\s*TJ/g;
    let a;
    while ((a = tjArr.exec(block)) !== null) {
      const str = /\(((?:[^\\()]|\\.)*?)\)/g;
      let s;
      while ((s = str.exec(a[1])) !== null) parts.push(s[1]);
    }
  }
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

function chunkText(text: string): string[] {
  const chunks: string[] = [];
  const CHUNK_SIZE = 1000;
  const OVERLAP = 100;
  for (let i = 0; i < text.length && chunks.length < 200; i += CHUNK_SIZE - OVERLAP) {
    const chunk = text.substring(i, i + CHUNK_SIZE).trim();
    if (chunk.length > 50) chunks.push(chunk);
  }
  return chunks;
}

function normalizeSearchQuery(query: string): string {
  return query.replace(/\s+/g, " ").trim().slice(0, 200);
}

function hasWordAssociation(query: string): boolean {
  return normalizeSearchQuery(query).split(/\s+/).length > 1;
}

function toSearchResult(row: { filename: string | null; original_filename: string | null; content: string | null; chunk_index: number | null }, similarity: number) {
  return { filename: row.filename, original_filename: row.original_filename, content: row.content, chunk_index: row.chunk_index, similarity };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const url = new URL(req.url);

  try {
    if (url.pathname.endsWith("/search")) {
      const searchUser = await getCaller(req.headers.get("Authorization") ?? "");
      if (!searchUser) return json({ error: "Connexion requise pour rechercher dans les PV" }, 401);

      const body = await req.json();
      const normalizedQuery = normalizeSearchQuery(typeof body?.query === "string" ? body.query : "");
      const rawCount = Number(body?.match_count);
      const matchCount = Number.isFinite(rawCount) ? Math.min(20, Math.max(1, Math.floor(rawCount))) : 10;
      if (!normalizedQuery) return json({ error: "Paramètre 'query' manquant" }, 400);

      const resultsByChunk = new Map<string, { filename: string | null; original_filename: string | null; content: string | null; chunk_index: number | null; similarity: number }>();

      if (hasWordAssociation(normalizedQuery)) {
        const { data: phraseData, error: phraseError } = await supabase
          .from("pv_documents")
          .select("filename, original_filename, content, chunk_index, metadata")
          .ilike("content", "%" + normalizedQuery + "%")
          .limit(matchCount);
        if (phraseError) throw phraseError;
        for (const row of phraseData ?? []) {
          const key = (row.filename ?? "") + ":" + (row.chunk_index ?? "");
          resultsByChunk.set(key, toSearchResult(row, 1.2));
        }
      }

      const { data, error } = await supabase
        .from("pv_documents")
        .select("filename, original_filename, content, chunk_index, metadata")
        .textSearch("content", normalizedQuery, { type: "plain", config: "french" })
        .limit(matchCount);
      if (error) throw error;

      for (const row of data ?? []) {
        const key = (row.filename ?? "") + ":" + (row.chunk_index ?? "");
        if (!resultsByChunk.has(key)) resultsByChunk.set(key, toSearchResult(row, 1));
      }

      return json({ results: Array.from(resultsByChunk.values()).slice(0, matchCount) });
    }

    const authUser = await getCaller(req.headers.get("Authorization") ?? "");
    if (!authUser || !(await isElevated(authUser.id))) return json({ error: "Accès réservé aux gestionnaires" }, 403);

    const body = await req.json();
    const { filename, original_filename } = body;
    if (typeof filename !== "string" || !filename || filename.length > 500) return json({ error: "Paramètre 'filename' invalide" }, 400);
    if (!/^[A-Za-z0-9._/-]+$/.test(filename)) return json({ error: "Chemin de fichier invalide" }, 400);

    let text: string = typeof body.text === "string" ? body.text : "";
    if (text.length > MAX_INDEX_TEXT) return json({ error: "Texte trop volumineux" }, 413);

    if ((!text || text.trim().length === 0) && typeof body.storagePath === "string") {
      if (body.storagePath.length > 500 || !/^[A-Za-z0-9._/-]+$/.test(body.storagePath)) return json({ error: "Chemin de stockage invalide" }, 400);
      const { data, error: dlError } = await supabase.storage.from("pv-documents").download(body.storagePath);
      if (dlError || !data) throw new Error("Impossible de télécharger le PDF");
      const bytes = new Uint8Array(await data.arrayBuffer());
      text = extractTextFromPdfBytes(bytes);
      if (text.trim().length < 100) return json({ error: "PDF vide ou scanné — extraction impossible côté serveur" }, 400);
    }

    if (!text.trim()) return json({ error: "Paramètre 'text' manquant ou vide" }, 400);

    await supabase.from("pv_documents").delete().eq("filename", filename);
    const chunks = chunkText(text);
    for (let i = 0; i < chunks.length; i += 50) {
      const docs = chunks.slice(i, i + 50).map((chunk, j) => ({
        filename,
        original_filename: typeof original_filename === "string" ? original_filename.slice(0, 255) : filename.split("/").pop() ?? filename,
        chunk_index: i + j,
        content: chunk,
        metadata: { chunk_count: chunks.length, extracted_at: new Date().toISOString() },
      }));
      const { error } = await supabase.from("pv_documents").insert(docs);
      if (error) throw error;
    }
    return json({ success: true, filename, chunks_indexed: chunks.length });
  } catch (err) {
    console.error(err);
    return json({ error: err instanceof Error ? err.message : "Erreur inconnue" }, 500);
  }
});
