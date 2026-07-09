import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
};

const ELEVATED_ROLES = ["admin", "representant", "gestionnaire_documents"];

const KDRIVE_API_BASE = "https://api.infomaniak.com";
const KDRIVE_API_TOKEN = Deno.env.get("KDRIVE_API_TOKEN")!;
const KDRIVE_DRIVE_ID = Deno.env.get("KDRIVE_DRIVE_ID")!;
const KDRIVE_DIRECTORY_ID = Deno.env.get("KDRIVE_DIRECTORY_ID")!;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function kdriveHeaders(extra?: Record<string, string>) {
  return { Authorization: `Bearer ${KDRIVE_API_TOKEN}`, ...extra };
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

      const uploadUrl = `${KDRIVE_API_BASE}/3/drive/${KDRIVE_DRIVE_ID}/upload`
        + `?file_name=${encodeURIComponent(file.name)}`
        + `&directory_id=${KDRIVE_DIRECTORY_ID}`
        + `&total_size=${file.size}`
        + `&conflict=rename`;

      const kdriveRes = await fetch(uploadUrl, {
        method: "POST",
        headers: kdriveHeaders({ "Content-Type": "application/octet-stream" }),
        body: file,
      });
      const kdriveBody = await kdriveRes.json();
      if (!kdriveRes.ok || kdriveBody.result !== "success") {
        console.error("kDrive upload error", kdriveBody);
        return json({ error: "Échec de l'upload vers kDrive" }, 502);
      }
      return json({ path: String(kdriveBody.data.id), size: file.size });
    }

    if (action === "download") {
      const { documentId } = await req.json();
      if (!documentId) return json({ error: "documentId requis" }, 400);

      const doc = await loadDocument(documentId);
      if (!doc || doc.storage_provider !== "kdrive") return json({ error: "Document introuvable" }, 404);

      const user = await getCaller(authHeader);
      const authorized = !doc.is_archived || await canManageOrOwn(user?.id ?? null, doc.uploaded_by);
      if (!authorized) return json({ error: "Accès refusé" }, 403);

      const kdriveRes = await fetch(
        `${KDRIVE_API_BASE}/2/drive/${KDRIVE_DRIVE_ID}/files/${doc.file_path}/temporary_url?duration=60`,
        { headers: kdriveHeaders() },
      );
      const kdriveBody = await kdriveRes.json();
      if (!kdriveRes.ok || kdriveBody.result !== "success") {
        console.error("kDrive temporary_url error", kdriveBody);
        return json({ error: "Fichier introuvable sur kDrive" }, 502);
      }
      return json({ url: kdriveBody.data.temporary_url });
    }

    if (action === "delete") {
      const { documentId, path } = await req.json();
      if (!documentId) return json({ error: "documentId requis" }, 400);

      const doc = await loadDocument(documentId);
      if (!doc || doc.storage_provider !== "kdrive") return json({ error: "Document introuvable" }, 404);

      const user = await getCaller(authHeader);
      const authorized = await canManageOrOwn(user?.id ?? null, doc.uploaded_by);
      if (!authorized) return json({ error: "Accès refusé" }, 403);

      const fileId = path || doc.file_path;
      const trashRes = await fetch(`${KDRIVE_API_BASE}/2/drive/${KDRIVE_DRIVE_ID}/files/${fileId}`, {
        method: "DELETE",
        headers: kdriveHeaders(),
      });
      if (!trashRes.ok) {
        console.error("kDrive trash error", await trashRes.text());
        return json({ error: "Échec de la suppression sur kDrive" }, 502);
      }
      // Suppression définitive (best effort : si ça échoue, le fichier reste en corbeille kDrive).
      const purgeRes = await fetch(`${KDRIVE_API_BASE}/2/drive/${KDRIVE_DRIVE_ID}/trash/${fileId}`, {
        method: "DELETE",
        headers: kdriveHeaders(),
      });
      if (!purgeRes.ok) console.error("kDrive purge error", await purgeRes.text());

      return json({ success: true });
    }

    return json({ error: "Action inconnue" }, 400);
  } catch (err) {
    console.error(err);
    return json({ error: err instanceof Error ? err.message : "Erreur inconnue" }, 500);
  }
});
