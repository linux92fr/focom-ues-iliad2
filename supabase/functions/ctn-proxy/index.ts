import "@supabase/functions-js/edge-runtime.d.ts";

const CTN_BASE = "https://code.travail.numerique.gouv.fr";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q") ?? "";
    const size = url.searchParams.get("size") ?? "6";
    const idcc = url.searchParams.get("idcc");

    if (!q) {
      return new Response(JSON.stringify({ hits: { hits: [] } }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const params = new URLSearchParams({ q, size });
    if (idcc) params.set("idcc", idcc);

    const upstream = await fetch(`${CTN_BASE}/api/search?${params}`, {
      headers: { Accept: "application/json" },
    });

    const json = await upstream.json();

    return new Response(JSON.stringify(json), {
      status: upstream.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
