import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

function chunkText(text: string): string[] {
  const chunks: string[] = [];
  const CHUNK_SIZE = 1000;
  const OVERLAP = 100;
  for (let i = 0; i < text.length && chunks.length < 100; i += CHUNK_SIZE - OVERLAP) {
    const chunk = text.substring(i, i + CHUNK_SIZE).trim();
    if (chunk.length > 50) chunks.push(chunk);
  }
  return chunks;
}

async function getEmbedding(text: string): Promise<number[]> {
  const session = new Supabase.ai.Session("gte-small");
  const result = await session.run(text, { mean_pool: true, normalize: true });
  return Array.from(result as number[]);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);

  try {
    // POST /embed-pv/search — recherche sémantique
    if (url.pathname.endsWith("/search")) {
      const { query, match_threshold = 0.3, match_count = 10 } = await req.json();
      if (!query) {
        return new Response(JSON.stringify({ error: "Paramètre 'query' manquant" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const embedding = await getEmbedding(query);
      const { data, error } = await supabase.rpc("search_pv_documents_vector", {
        query_embedding: embedding,
        match_threshold,
        match_count,
      });
      if (error) throw error;

      return new Response(JSON.stringify({ results: data ?? [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /embed-pv — indexation
    // Accepte { text, filename } — le texte est extrait côté client via pdfjs-dist
    const body = await req.json();
    const { text, filename } = body;

    if (!filename) {
      return new Response(JSON.stringify({ error: "Paramètre 'filename' requis" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!text || text.length < 100) {
      return new Response(
        JSON.stringify({
          error: "Paramètre 'text' manquant ou trop court — le PDF doit contenir du texte sélectionnable",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Supprimer les anciennes sections si re-indexation
    await supabase.from("pv_documents").delete().eq("filename", filename);

    const chunks = chunkText(text);
    const docs = await Promise.all(
      chunks.map(async (chunk, i) => ({
        filename,
        original_filename: filename,
        chunk_index: i,
        content: chunk,
        embedding: await getEmbedding(chunk),
        metadata: { chunk_count: chunks.length, extracted_at: new Date().toISOString() },
      }))
    );

    const BATCH_SIZE = 25;
    for (let i = 0; i < docs.length; i += BATCH_SIZE) {
      const { error } = await supabase.from("pv_documents").insert(docs.slice(i, i + BATCH_SIZE));
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
