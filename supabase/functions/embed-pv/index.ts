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
      while ((s = str.exec(a[1])) !== null) {
        parts.push(s[1]);
      }
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);

  try {
    // GET/POST /embed-pv/search — recherche plein-texte PostgreSQL
    if (url.pathname.endsWith("/search")) {
      const { query, match_count = 10 } = await req.json();
      if (!query?.trim()) {
        return new Response(JSON.stringify({ error: "Paramètre 'query' manquant" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data, error } = await supabase
        .from("pv_documents")
        .select("filename, original_filename, content, chunk_index, metadata")
        .textSearch("content", query, { type: "plain", config: "french" })
        .limit(match_count);

      if (error) throw error;

      const results = (data ?? []).map((row) => ({
        filename: row.filename,
        original_filename: row.original_filename,
        content: row.content,
        chunk_index: row.chunk_index,
        similarity: 1,
      }));

      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /embed-pv — indexation (stockage des chunks sans embedding)
    const body = await req.json();
    const { filename, original_filename } = body;

    if (!filename) {
      return new Response(JSON.stringify({ error: "Paramètre 'filename' requis" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let text: string = body.text ?? "";

    if ((!text || text.trim().length === 0) && body.storagePath) {
      const { data, error: dlError } = await supabase.storage
        .from("pv-documents")
        .download(body.storagePath);
      if (dlError || !data) throw new Error(`Impossible de télécharger : ${dlError?.message}`);
      const bytes = new Uint8Array(await data.arrayBuffer());
      text = extractTextFromPdfBytes(bytes);
      if (text.trim().length < 100) {
        return new Response(
          JSON.stringify({
            error:
              "PDF vide ou scanné — impossible d'extraire le texte côté serveur. " +
              "Utilisez la nouvelle interface de dépôt qui gère l'OCR automatiquement.",
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Paramètre 'text' manquant ou vide" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await supabase.from("pv_documents").delete().eq("filename", filename);

    const chunks = chunkText(text);
    const BATCH = 50;
    for (let i = 0; i < chunks.length; i += BATCH) {
      const docs = chunks.slice(i, i + BATCH).map((chunk, j) => ({
        filename,
        original_filename: original_filename ?? filename.split("/").pop() ?? filename,
        chunk_index: i + j,
        content: chunk,
        metadata: { chunk_count: chunks.length, extracted_at: new Date().toISOString() },
      }));
      const { error } = await supabase.from("pv_documents").insert(docs);
      if (error) throw error;
    }

    return new Response(
      JSON.stringify({ success: true, filename, chunks_indexed: chunks.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
