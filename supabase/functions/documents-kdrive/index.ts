import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const ELEVATED_ROLES = ["admin", "representant", "gestionnaire_documents"];

const KDRIVE_API_BASE = "https://api.infomaniak.com";
const KDRIVE_TOKEN_URL = "https://login.infomaniak.com/token";
const KDRIVE_CLIENT_ID = Deno.env.get("KDRIVE_CLIENT_ID")!;
const KDRIVE_CLIENT_SECRET = Deno.env.get("KDRIVE_CLIENT_SECRET")!;
const KDRIVE_DRIVE_ID = Deno.env.get("KDRIVE_DRIVE_ID")!;
const KDRIVE_DIRECTORY_PATH = Deno.env.get("KDRIVE_DIRECTORY_PATH") ?? "/FOCOM-Documents";

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

// L'access_token kDrive expire (~1h) et le refresh_token peut être remplacé à chaque
// rafraîchissement (rotation). On met en cache l'access_token courant dans la table
// kdrive_oauth_tokens et on persiste le nouveau refresh_token à chaque appel, pour ne
// jamais dépendre d'un secret statique qui deviendrait invalide.
async function getAccessToken(): Promise<string> {
  const admin = serviceClient();
  const { data: row, error } = await admin
    .from("kdrive_oauth_tokens")
    .select("refresh_token, access_token, access_token_expires_at")
    .eq("id", 1)
    .single();
  if (error || !row) {
    throw new Error("kDrive non configuré : table kdrive_oauth_tokens vide (voir procédure d'autorisation initiale)");
  }

  const stillValid = row.access_token && row.access_token_expires_at
    && new Date(row.access_token_expires_at).getTime() - 60_000 > Date.now();
  if (stillValid) return row.access_token as string;

  const tokenRes = await fetch(KDRIVE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: row.refresh_token,
      client_id: KDRIVE_CLIENT_ID,
      client_secret: KDRIVE_CLIENT_SECRET,
    }),
  });
  const tokenBody = await tokenRes.json();
  if (!tokenRes.ok || !tokenBody.access_token) {
    console.error("kDrive token refresh error", tokenBody);
    throw new Error("Impossible de rafraîchir le token kDrive");
  }

  const expiresAt = new Date(Date.now() + (tokenBody.expires_in ?? 3600) * 1000).toISOString();
  await admin.from("kdrive_oauth_tokens").update({
    access_token: tokenBody.access_token,
    access_token_expires_at: expiresAt,
    refresh_token: tokenBody.refresh_token || row.refresh_token,
    updated_at: new Date().toISOString(),
  }).eq("id", 1);

  return tokenBody.access_token as string;
}

async function kdriveHeaders(extra?: Record<string, string>) {
  const token = await getAccessToken();
  return { Authorization: `Bearer ${token}`, ...extra };
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
        + `&directory_path=${encodeURIComponent(KDRIVE_DIRECTORY_PATH)}`
        + `&conflict=rename`;

      const kdriveRes = await fetch(uploadUrl, {
        method: "POST",
        headers: await kdriveHeaders({ "Content-Type": "application/octet-stream" }),
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
        { headers: await kdriveHeaders() },
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
        headers: await kdriveHeaders(),
      });
      if (!trashRes.ok) {
        console.error("kDrive trash error", await trashRes.text());
        return json({ error: "Échec de la suppression sur kDrive" }, 502);
      }
      // Suppression définitive (best effort : si ça échoue, le fichier reste en corbeille kDrive).
      const purgeRes = await fetch(`${KDRIVE_API_BASE}/2/drive/${KDRIVE_DRIVE_ID}/trash/${fileId}`, {
        method: "DELETE",
        headers: await kdriveHeaders(),
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
