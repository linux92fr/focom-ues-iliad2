import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
};

const BUCKET = "user-documents";
const MAX_FILE_SIZE = 20 * 1024 * 1024;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function decodeBase64(b64: string): Uint8Array {
  // Retire un éventuel préfixe data: (data:application/pdf;base64,....)
  const comma = b64.indexOf(",");
  const raw = b64.startsWith("data:") && comma !== -1 ? b64.slice(comma + 1) : b64;
  const binary = atob(raw);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Méthode non autorisée" }, 405);

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );
    const { data: { user }, error: authError } = await anonClient.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (authError || !user) return json({ error: "Non authentifié" }, 401);

    const body = await req.json();
    const { fileBase64, fileName, contentType, title, description, isPublic, folderId } = body ?? {};

    if (!fileBase64 || !fileName) return json({ error: "Fichier requis" }, 400);
    if (!title || !String(title).trim()) return json({ error: "Titre requis" }, 400);

    const bytes = decodeBase64(String(fileBase64));
    if (bytes.byteLength === 0) return json({ error: "Fichier vide" }, 400);
    if (bytes.byteLength > MAX_FILE_SIZE) return json({ error: "Le fichier dépasse 20 Mo" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    const safeName = String(fileName).replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${user.id}/${Date.now()}-${safeName}`;
    const finalContentType = typeof contentType === "string" && contentType ? contentType : "application/octet-stream";

    const { error: upErr } = await admin.storage.from(BUCKET).upload(path, bytes, {
      contentType: finalContentType,
      upsert: false,
    });
    if (upErr) {
      console.error("[upload-user-document] storage error:", upErr.message);
      return json({ error: `Échec de l'enregistrement du fichier : ${upErr.message}` }, 502);
    }

    const { data: inserted, error: insErr } = await admin.from("user_documents").insert({
      user_id: user.id,
      title: String(title).trim(),
      description: description ? String(description).trim() : null,
      file_name: String(fileName),
      file_path: path,
      file_size: bytes.byteLength,
      file_type: finalContentType,
      is_public: !!isPublic,
      folder_id: folderId ?? null,
    }).select("id").single();

    if (insErr) {
      // Rollback du fichier si l'insertion échoue.
      await admin.storage.from(BUCKET).remove([path]);
      console.error("[upload-user-document] insert error:", insErr.message);
      return json({ error: `Erreur lors de l'enregistrement : ${insErr.message}` }, 500);
    }

    return json({ success: true, id: inserted?.id, path });
  } catch (err) {
    console.error("[upload-user-document] unexpected:", err);
    return json({ error: err instanceof Error ? err.message : "Erreur inconnue" }, 500);
  }
});
