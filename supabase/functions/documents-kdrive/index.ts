import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
};

const ELEVATED_ROLES = ["admin", "representant", "gestionnaire_documents"];
const MAX_UPLOAD_SIZE = 20 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf", "image/jpeg", "image/png", "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
]);

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
  return { Authorization: "Bearer " + KDRIVE_API_TOKEN, ...extra };
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

async function hasElevatedRole(userId: string | null): Promise<boolean> {
  if (!userId) return false;
  const { data } = await serviceClient().from("user_roles").select("role").eq("user_id", userId);
  return (data ?? []).some((r) => ELEVATED_ROLES.includes(r.role as string));
}

async function canManageOrOwn(userId: string | null, uploadedBy: string | null): Promise<boolean> {
  if (!userId) return false;
  if (uploadedBy === userId) return true;
  return hasElevatedRole(userId);
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
    const user = await getCaller(authHeader);
    if (!user) return json({ error: "Non authentifié" }, 401);

    if (action === "upload") {
      if (!(await hasElevatedRole(user.id))) return json({ error: "Accès refusé" }, 403);

      const form = await req.formData();
      const file = form.get("file");
      if (!(file instanceof File)) return json({ error: "Fichier requis" }, 400);
      if (file.size <= 0 || file.size > MAX_UPLOAD_SIZE) return json({ error: "Fichier vide ou trop volumineux" }, 413);
      const mime = file.type.toLowerCase();
      if (!ALLOWED_MIME_TYPES.has(mime)) return json({ error: "Type de fichier non autorisé" }, 415);

      const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 180);
      const uploadUrl = KDRIVE_API_BASE + "/3/drive/" + KDRIVE_DRIVE_ID + "/upload"
        + "?file_name=" + encodeURIComponent(safeFileName)
        + "&directory_id=" + KDRIVE_DIRECTORY_ID
        + "&total_size=" + file.size
        + "&conflict=rename";

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

      const authorized = !doc.is_archived || await canManageOrOwn(user.id, doc.uploaded_by);
      if (!authorized) return json({ error: "Accès refusé" }, 403);

      const kdriveRes = await fetch(
        KDRIVE_API_BASE + "/2/drive/" + KDRIVE_DRIVE_ID + "/files/" + encodeURIComponent(doc.file_path) + "/temporary_url?duration=60",
        { headers: kdriveHeaders() },
      );
      const kdriveBody = await kdriveRes.json();
      if (!kdriveRes.ok || kdriveBody.result !== "success") return json({ error: "Fichier introuvable sur kDrive" }, 502);
      return json({ url: kdriveBody.data.temporary_url });
    }

    if (action === "weburl") {
      const { documentId } = await req.json();
      if (!documentId) return json({ error: "documentId requis" }, 400);

      const doc = await loadDocument(documentId);
      if (!doc || doc.storage_provider !== "kdrive") return json({ error: "Document introuvable" }, 404);

      const authorized = !doc.is_archived || await canManageOrOwn(user.id, doc.uploaded_by);
      if (!authorized) return json({ error: "Accès refusé" }, 403);

      return json({ url: "https://drive.infomaniak.com/app/drive/" + KDRIVE_DRIVE_ID + "/files/" + encodeURIComponent(doc.file_path) });
    }

    if (action === "delete") {
      const { documentId } = await req.json();
      if (!documentId) return json({ error: "documentId requis" }, 400);

      const doc = await loadDocument(documentId);
      if (!doc || doc.storage_provider !== "kdrive") return json({ error: "Document introuvable" }, 404);

      const elevated = await hasElevatedRole(user.id);
      if (!(doc.uploaded_by === user.id || elevated)) return json({ error: "Accès refusé" }, 403);
      if (doc.is_archived && !elevated) return json({ error: "Accès refusé" }, 403);

      const fileId = doc.file_path;
      const trashRes = await fetch(
        KDRIVE_API_BASE + "/2/drive/" + KDRIVE_DRIVE_ID + "/files/" + encodeURIComponent(fileId),
        { method: "DELETE", headers: kdriveHeaders() },
      );
      if (!trashRes.ok) return json({ error: "Échec de la suppression sur kDrive" }, 502);

      const purgeRes = await fetch(
        KDRIVE_API_BASE + "/2/drive/" + KDRIVE_DRIVE_ID + "/trash/" + encodeURIComponent(fileId),
        { method: "DELETE", headers: kdriveHeaders() },
      );
      if (!purgeRes.ok) console.error("kDrive purge error", await purgeRes.text());

      return json({ success: true });
    }

    return json({ error: "Action inconnue" }, 400);
  } catch (err) {
    console.error(err);
    return json({ error: err instanceof Error ? err.message : "Erreur inconnue" }, 500);
  }
});
