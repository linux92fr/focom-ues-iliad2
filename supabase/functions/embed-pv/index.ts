import Deno from "https://deno.land/x/deno@v1.40.2/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const HF_TOKEN = Deno.env.get("HF_TOKEN");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

const HF_EMBED_URL = "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2";

interface PdfRequest {
  pdfBase64: string;
  filename: string;
}

// ULTRA SIMPLE extraction
function extractPdfText(pdfBase64: string): string {
  try {
    const binaryString = atob(pdfBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const decoder = new TextDecoder("utf-8");
    let text = decoder.decode(bytes);
    
    // Remove binary garbage
    text = text.replace(/[^\x20-\x7E\n\r]/g, " ").replace(/\s+/g, " ").trim();
    
    // Limit to avoid huge texts
    return text.substring(0, 50000);
  } catch {
    throw new Error("Failed to extract PDF");
  }
}

// ULTRA SIMPLE chunking - no overlap complexity
function chunkText(text: string): string[] {
  const chunks = [];
  const CHUNK_SIZE = 1000;
  
  // Simple linear chunking, no overlap
  for (let i = 0; i < text.length && chunks.length < 50; i += CHUNK_SIZE) {
    const chunk = text.substring(i, i + CHUNK_SIZE).trim();
    if (chunk.length > 50) {
      chunks.push(chunk);
    }
  }
  
  return chunks;
}

// Simple batched embeddings
async function getEmbeddings(texts: string[]): Promise<number[][]> {
  const BATCH_SIZE = 5;
  const results: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const resp = await fetch(HF_EMBED_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: batch }),
    });

    if (!resp.ok) {
      throw new Error(`HF error: ${resp.status}`);
    }

    const embeddings = await resp.json();
    results.push(...embeddings);
    
    // Delay between batches
    if (i + BATCH_SIZE < texts.length) {
      await new Promise(r => setTimeout(r, 100));
    }
  }

  return results;
}

// Main
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    const { pdfBase64, filename }: PdfRequest = await req.json();

    if (!pdfBase64 || !filename) {
      return new Response(JSON.stringify({ error: "Missing pdfBase64 or filename" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    console.log(`Processing: ${filename}`);

    // Extract
    const text = extractPdfText(pdfBase64);
    console.log(`Extracted ${text.length} chars`);

    // Chunk
    const chunks = chunkText(text);
    console.log(`Created ${chunks.length} chunks`);

    if (chunks.length === 0) {
      return new Response(JSON.stringify({ error: "No text extracted" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // Embed
    console.log(`Embedding ${chunks.length} chunks...`);
    const embeddings = await getEmbeddings(chunks);
    console.log(`Got ${embeddings.length} embeddings`);

    // Prepare documents
    const docs = chunks.map((chunk, i) => ({
      filename,
      original_filename: filename,
      chunk_index: i,
      content: chunk,
      embedding: embeddings[i],
      metadata: {
        chunk_count: chunks.length,
        extracted_at: new Date().toISOString(),
      },
    }));

    // Insert in batches
    const BATCH_SIZE = 25;
    for (let i = 0; i < docs.length; i += BATCH_SIZE) {
      const batch = docs.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from("pv_documents").insert(batch);
      if (error) throw error;
      console.log(`Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        filename,
        chunks_processed: chunks.length,
        embeddings_created: embeddings.length,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});