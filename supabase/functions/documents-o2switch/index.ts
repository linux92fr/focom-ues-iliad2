import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const ELEVATED_ROLES = ["admin", "representant", "gestionnaire_documents"];

const BRIDGE_URL = Deno.env.get("O2SWITCH_BRIDGE_URL")!;
const BRIDGE_SECRET = Deno.env.get("O2SWITCH_BRIDGE_SECRET")!;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function serviceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

async function getCaller(authHeader: string) {
  const anonClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
  );
  const { data: { user } } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));
  return user;
}

async function canManageOrOwn(userId: string | null, uploadedBy: string | null): Promise<boolean> {
  if (!userId) return false;
  if (uploadedBy === userId) return true;
  const { data } = await serviceClient()
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  return (data ?? []).some((r) => ELEVATED_ROLES.includes(r.role as string));
}

type DocumentRow = {
  id: string;
  file_path: string;
  uploaded_by: string | null;
  is_archived: boolean;
  storage_provider: string;
};

async function loadDocument(documentId: string): Promise<DocumentRow | null> {
  const { data, error } = await serviceClient()
    .from("documents")
    .select("id, file_path, uploaded_by, is_archived, storage_provider")
    .eq("id", documentId)
    .single();
  if (error || !data) return null;
  return data as DocumentRow;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  const action = url.searchParams.get("action");
  const authHeader = req.headers.get("Authorization") ?? "";

  try {
    if (action === "upload") {
      const user = await getCaller(authHeader);
      if (!user) return json({ error: "Non authentifié" }, 401);

      const form = await req.formData();
      const file = form.get("file");
      if (!(file instanceof File)) return json({ error: "Fichier requis" }, 400);

      const bridgeForm = new FormData();
      bridgeForm.set("file", file, file.name);

      const bridgeRes = await fetch(`${BRIDGE_URL}/upload.php`, {
        method: "POST",
        headers: { "X-Bridge-Secret": BRIDGE_SECRET },
        body: bridgeForm,
      });
      if (!bridgeRes.ok) return json({ error: "Échec de l'upload vers o2switch" }, 502);
      return json(await bridgeRes.json());
    }

    if (action === "download") {
      const { documentId } = await req.json();
      if (!documentId) return json({ error: "documentId requis" }, 400);

      const doc = await loadDocument(documentId);
      if (!doc || doc.storage_provider !== "o2switch") return json({ error: "Document introuvable" }, 404);

      const user = await getCaller(authHeader);
      const authorized = !doc.is_archived || await canManageOrOwn(user?.id ?? null, doc.uploaded_by);
      if (!authorized) return json({ error: "Accès refusé" }, 403);

      const bridgeRes = await fetch(
        `${BRIDGE_URL}/download.php?path=${encodeURIComponent(doc.file_path)}`,
        { headers: { "X-Bridge-Secret": BRIDGE_SECRET } },
      );
      if (!bridgeRes.ok || !bridgeRes.body) return json({ error: "Fichier introuvable sur o2switch" }, 502);

      return new Response(bridgeRes.body, {
        headers: {
          ...corsHeaders,
          "Content-Type": bridgeRes.headers.get("Content-Type") ?? "application/octet-stream",
          "Content-Disposition": bridgeRes.headers.get("Content-Disposition") ?? "inline",
        },
      });
    }

    if (action === "delete") {
      const { documentId, path } = await req.json();
      if (!documentId) return json({ error: "documentId requis" }, 400);

      const doc = await loadDocument(documentId);
      if (!doc || doc.storage_provider !== "o2switch") return json({ error: "Document introuvable" }, 404);

      const user = await getCaller(authHeader);
      const authorized = await canManageOrOwn(user?.id ?? null, doc.uploaded_by);
      if (!authorized) return json({ error: "Accès refusé" }, 403);

      const bridgeRes = await fetch(`${BRIDGE_URL}/delete.php`, {
        method: "POST",
        headers: { "X-Bridge-Secret": BRIDGE_SECRET, "Content-Type": "application/json" },
        body: JSON.stringify({ path: path || doc.file_path }),
      });
      if (!bridgeRes.ok) return json({ error: "Échec de la suppression sur o2switch" }, 502);
      return json({ success: true });
    }

    return json({ error: "Action inconnue" }, 400);
  } catch (err) {
    console.error(err);
    return json({ error: err instanceof Error ? err.message : "Erreur inconnue" }, 500);
  }
});
