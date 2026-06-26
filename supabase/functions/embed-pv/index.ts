import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as pdfjsLib from "npm:pdfjs-dist@4.9.155/legacy/build/pdf.mjs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Disable worker — extraction runs in the main thread (Edge Function context)
pdfjsLib.GlobalWorkerOptions.workerSrc = "";

async function extractTextFromPdf(pdfBase64: string): Promise<string> {
  const binaryString = atob(pdfBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const pdf = await pdfjsLib.getDocument({ data: bytes, useWorkerFetch: false, isEvalSupported: false, useSystemFonts: true }).promise;
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
}

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
    // POST /embed-pv/search — embedding de la requête + recherche vectorielle
    if (url.pathname.endsWith("/search")) {
      const { query, match_threshold = 0.4, match_count = 10 } = await req.json();
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

    // POST /embed-pv — indexation d'un PDF (base64)
    const { pdfBase64, filename } = await req.json();

    if (!pdfBase64 || !filename) {
      return new Response(JSON.stringify({ error: "Paramètres 'pdfBase64' et 'filename' requis" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const text = await extractTextFromPdf(pdfBase64);

    if (text.length < 100) {
      return new Response(
        JSON.stringify({ error: "PDF vide ou illisible — le PDF doit contenir du texte sélectionnable (pas une image scannée)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const chunks = chunkText(text);
    if (chunks.length === 0) {
      return new Response(JSON.stringify({ error: "Impossible d'extraire le texte du PDF" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
